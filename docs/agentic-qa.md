# QA agéntico: triaje, agentes y skills

Este documento describe cómo se analizan los resultados de Playwright con reglas e IA, qué agentes y skills hay, qué pueden hacer y qué no, y cómo se valida todo ello.

Principio de partida: **Playwright decide si un test pasa o falla.** El triaje y los agentes explican ese resultado y proponen acciones. No lo cambian, no editan tests por su cuenta y no convierten un fallo en un éxito.

## 1. Flujo

```
npx playwright test --project=<app>      → test-results.json, test-results/**/error-context.md
        │
npm run triage                            capa 1: reglas (sin IA, sin red)
        │                                 → playwright-report/triage.json
        ├── PASSED · SKIPPED · KNOWN_DEFECT · UNEXPECTED_PASS · ENVIRONMENT_FAILURE · FLAKY_FAILURE
        └── INCONCLUSIVE (needs_ai)       capa 2: solo estos casos
                 │
                 ├── npm run report:ai    automático: hechos mínimos y redactados → modelo → validación
                 └── agente failure-triage   bajo demanda: lee artefactos, devuelve JSON → --validate
```

`npm run report:ai` hace las dos capas y, además, el resumen, las correcciones y los tickets a partir de los grupos de fallos (nunca del `test-results.json` crudo). Los defectos conocidos aparecen en el resumen, pero no generan correcciones ni tickets.

## 2. Clasificación

| Categoría | Decide | Significado | Revisión humana |
|---|---|---|---|
| `PASSED` | reglas | pasa y se esperaba que pasara. Es el resultado observado, no un éxito confirmado (confianza máxima `medium`) | no |
| `SKIPPED` | reglas | omitido | no |
| `KNOWN_DEFECT` | reglas | `test.fail()` + `@bug-<id>` y falla en un `expect(` del propio spec | no |
| `UNEXPECTED_PASS` | reglas | `test.fail()` pero pasó | sí |
| `ENVIRONMENT_FAILURE` | reglas / IA | red, host, navegador | sí si estaba enmascarado |
| `FLAKY_FAILURE` | reglas / IA | falló y pasó en un reintento | sí |
| `PRODUCT_REGRESSION` | IA / humano | la app no cumple y el test parece correcto | sí |
| `TEST_DEFECT` | IA / humano | el test parece incorrecto | sí |
| `INCONCLUSIVE` | reglas / IA | evidencia insuficiente | sí |

Las reglas y su orden están en la skill [`failure-classification`](../.claude/skills/failure-classification/SKILL.md) y en `scripts/triage/core.mjs`. La IA solo puede elegir entre `PRODUCT_REGRESSION`, `TEST_DEFECT`, `ENVIRONMENT_FAILURE`, `FLAKY_FAILURE` e `INCONCLUSIVE`.

Por qué no basta el `status` de Playwright: un `test.fail()` cuenta como «expected» falle por lo que falle. Con el host caído, 12 tests `@bug` salieron «correctos» (ENV-01 en `reports/flakiness-report.md`). Ahora ese caso es `ENVIRONMENT_FAILURE` (regla `R-ENV-MASKED`) o `INCONCLUSIVE` (`R-KNOWN-MASKED`).

## 3. Contrato JSON (`schema_version` 1.0.0)

`playwright-report/triage.json`:

```json
{
  "schema_version": "1.0.0",
  "generated_at": "ISO 8601",
  "source_report": { "sha256": "<hash de test-results.json>", "playwright_stats": { } },
  "run": { "errors": ["<errores fuera de los tests, redactados>"], "classification": null },
  "summary": { "total": 96, "PASSED": 78, "KNOWN_DEFECT": 18, "requires_human_review": 0, "…": 0 },
  "warnings": ["<solo con report:ai: respuestas de IA descartadas>"],
  "diagnoses": [ { "…": "un diagnóstico por test y proyecto" } ]
}
```

Diagnóstico:

| Campo | Tipo | Contenido |
|---|---|---|
| `schema_version` | string | `"1.0.0"` |
| `test_id` | string | `<proyecto>::<id de Playwright>` |
| `scenario_id` | string \| null | el `// ID` del cuerpo del test |
| `title`, `file`, `line`, `project` | | identificación del test |
| `classification` | enum | sección 2 |
| `confidence` | `high` \| `medium` \| `low` | escala ordinal (abajo) |
| `source` | `rules` \| `ai` | qué capa decidió |
| `rule_id` | string | regla de la capa 1 que se aplicó |
| `evidence` | `[{ source, quote }]` | hechos citados literalmente |
| `hypotheses` | string[] | suposiciones, separadas de los hechos |
| `reasoning_summary` | string | 1-3 frases |
| `recommended_action` | string | acción verificable |
| `requires_human_review` | boolean | siempre `true` si decide la IA |
| `needs_ai` | boolean | caso abierto para la capa 2 |
| `model` | string \| null | `null` en reglas |
| `prompt_version` | string | `rules-1`, o `ai-triage@<sha256 del prompt, 12 car.>` |
| `input_hash` | string | sha256 del JSON canónico de `facts` |
| `facts` | object | hechos usados (estados, intentos, error redactado y truncado, etiquetas, anotaciones). Es lo único que ve la IA. Con `--repeat-each`, `status` es `null`, `execution_statuses` lleva el estado de cada repetición y cada intento lleva `execution`; con una sola ejecución la forma (y el `input_hash`) no cambia |

**Confianza.** Escala ordinal, **no una probabilidad calibrada**: no hay histórico con el que calibrarla.
- `high`: la evidencia apunta a una sola causa (en reglas: la condición de la regla se cumple sin ambigüedad).
  Excepción: `PASSED` nunca es `high`. Un pase es un hecho, pero ningún resultado verde descarta un falso positivo: un test que pasa por casualidad pasa siempre, también con repeticiones (FLAKY-02).
- `medium`: apunta a una causa con una alternativa razonable sin descartar.
- `low`: indicio débil.

**Validación de la capa 2** (`applyAiDiagnoses`): la respuesta se descarta y el caso queda en `INCONCLUSIVE` con el motivo si no es JSON, si usa una categoría no permitida, una confianza fuera de la escala, si no trae evidencias, si alguna cita no aparece literalmente en los `facts` de ese test o si ninguna cita sale del error del test (un diagnóstico de causa no puede apoyarse solo en el título o el fichero). Solo se aplica a diagnósticos con `needs_ai`: si la IA menciona un test que ya resolvieron las reglas, se ignora con un aviso. Con respuestas duplicadas para un test vale la primera. `summary.from_ai` cuenta las predicciones de la IA, que nunca son conclusiones verificadas.

**Salida del agente `failure-triage`:** mismo contrato. Se valida con `node scripts/triage.mjs --validate <fichero>`: comprueba la forma y que cada cita esté en el fichero que nombra o en los `facts` del triaje.

## 4. Agentes

| Agente | Herramientas | Escribe | Para qué |
|---|---|---|---|
| `playwright-test-planner` | lectura + navegador + `planner_save_plan` | planes en `specs/<app>/` | escenarios a partir de lo documentado; señala lagunas |
| `playwright-test-generator` | lectura + navegador + `generator_write_test` | `tests/_propuestas/<app>/` por instrucción (la herramienta no limita la ruta) | tests propuestos con las convenciones del proyecto |
| `playwright-test-healer` | lectura + depuración de tests (`test_run`, `test_debug` lanzan tests reales) | **nada** | diagnóstico y diff propuesto |
| `failure-triage` | `Read`, `Grep`, `Glob` | **nada** | diagnósticos JSON de los casos INCONCLUSIVE |
| `test-reviewer` | `Read`, `Grep`, `Glob` | **nada** | revisión de propuestas del generator y del healer |

Los tres primeros los genera `npx playwright init-agents`. Si se regeneran, se pierden las reglas del proyecto añadidas: hay que volver a aplicarlas (están en git).

## 5. Skills

Están en `.claude/skills/<nombre>/SKILL.md`, el mecanismo de skills de proyecto de Claude Code. Se activan de tres formas: Claude las carga cuando la tarea encaja con su `description`; se invocan a mano con `/<nombre>`; o un agente las precarga con el campo `skills:` de su cabecera. Si un agente no las tiene cargadas, sus instrucciones le dicen qué fichero leer.

| Skill | Consumen | Respaldo ejecutable |
|---|---|---|
| `failure-classification` | failure-triage, healer | `npm run triage`, `npm run test:triage` |
| `evidence-based-diagnosis` | failure-triage, healer | `node scripts/triage.mjs --validate` |
| `test-quality-review` | test-reviewer | `npm run guard:assertions` |
| `coverage-mapping` | test-reviewer, planner, generator | `npm run coverage:map` |

## 6. Límites de autonomía

- El generator escribe en `tests/_propuestas/<app>/`, que no ejecuta el CI, pero por instrucción: `generator_write_test` no impide escribir en `tests/<app>/`. El healer y los revisores no tienen herramientas de escritura, así que ellos sí lo tienen garantizado por la herramienta.
- Ningún agente cambia aserciones, valores esperados, `test-data/`, `test.fail()`, `@bug-*`, `fixme` o `skip`. `npm run guard:assertions -- <diff>` lista las líneas que lo hacen; cualquier línea señalada necesita aprobación humana explícita.
- Flujo para incorporar un cambio:
  1. El generator o el healer proponen.
  2. `test-reviewer` revisa; quien lo invoca guarda el informe en `reports/reviews/<app>/AAAA-MM-DD-<fichero>.md`.
  3. Se ejecuta `guard:assertions`.
  4. Una persona aprueba, aplica el cambio y lo ejecuta, y anota su decisión al final del informe.
- `test-reviewer` no emite veredicto sobre cambios que haya generado él mismo y nunca «aprueba»: su resultado máximo es `SIN_OBJECIONES — pendiente de aprobación humana`.

## 7. Seguridad de la integración con IA

| Control | Dónde |
|---|---|
| El CLI de Claude se lanza sin `--dangerously-skip-permissions`, con `--tools ""` (sin herramientas), `--strict-mcp-config` (sin el MCP del proyecto, que expone `test_run`), `--permission-prompts none` y desde un directorio temporal vacío (sin `CLAUDE.md` ni ajustes del repo) | `scripts/ai-provider.mjs` → `claudeArgs` |
| Los datos van en el mensaje de usuario entre `<datos_no_confiables>`; el delimitador de cierre se neutraliza dentro de los datos; los prompts dicen que son datos | `wrapUntrusted`, `prompts/*.txt` |
| A la IA solo llegan los `facts` de los fallos sin resolver: sin stdout/stderr, sin adjuntos, sin `error-context.md`, error truncado a 1.500 caracteres | `facts`, `report-ai.mjs` |
| Redacción de rutas absolutas, tokens (`Bearer`, `sk-…`, `AIza…`, `ghp_…`, JWT), `password=`/`token=`/`api_key=` y correos | `redact` |
| La salida de la IA se valida antes de usarla y nunca se ejecuta | `applyAiDiagnoses` |
| La IA no puede producir PASSED, KNOWN_DEFECT ni UNEXPECTED_PASS | `AI_CATEGORIES` |

El proveedor sigue siendo externo: Gemini si existe `GEMINI_API_KEY` (CI) o la suscripción de Claude en local. Ejecutar `npm run report:ai` es la autorización para enviar esos datos mínimos. `npm run triage` no envía nada.

## 8. CI

`.github/workflows/playwright.yml`:
- `tooling`: `typecheck` y `test:triage` en cada push o PR. Sin navegador, red ni IA. Se ejecuta en la VM (no en contenedor) y redefine `HOME`, porque el `HOME: /root` global solo vale dentro del contenedor de Playwright.
- `test` (chromium, firefox, webkit): projects genéricos. Hoy solo ejecutan `tests/seed.spec.ts` y, en cada push, el paso de informe IA envía a Gemini el resumen de ese único test, si existe el secreto.
- `finanzas-pareja`: la suite real. Solo corre con `workflow_dispatch` o con `vars.FINANZAS_E2E_ENABLED == 'true'`, porque apunta a la app publicada y no hay entorno de pruebas (AD-12, OQ-01). Si no se cumple la condición, el job aparece como omitido, no como verde.
  - Un fallo inesperado de Playwright hace fallar el job.
  - El triaje y el informe IA son `continue-on-error`: informan, no deciden.
  - Un test `flaky` (pasa en un reintento) no hace fallar el job: no hay `failOnFlakyTests` (AD-02). El triaje lo marca como FLAKY_FAILURE.
  - Publica siempre el informe HTML, `triage.json`, `test-results.json` y `test-results/`. También en verde, porque los `error-context.md` de los defectos conocidos son evidencia.

## 9. Pruebas de validación

```bash
npm run test:triage     # 31 pruebas unitarias (node:test) + evaluación por categoría
npm run coverage:map    # reports/coverage-verified.md
npm run guard:assertions -- propuesta.diff
```

Las pruebas unitarias no ejecutan la app, el navegador ni la IA. Cubren: test correcto, fallo inesperado, defecto conocido, defecto conocido enmascarado, pase inesperado, fallo de infraestructura (también enmascarado), flaky, omitido, casos ambiguos, errores de ejecución, entrada malformada, inyección de instrucciones, respuesta de IA fuera de esquema, salida sin evidencias o con citas inventadas, que el informe de Playwright no se modifica, hash estable, redacción y los argumentos del CLI de Claude.

**Evaluación** (`scripts/triage/eval/cases.json`, `scripts/triage/eval.mjs`). Cada caso lleva `label` (categoría real) y `label_status`, y cada grupo se mide por separado:
- `verified` (23): resultados reales de la ejecución local del 2026-10-08. Son los 18 tests `@bug` con su defecto confirmado en `reports/qa-code-review.md` §4 y 5 tests correctos.
- `provisional` (6): reconstruidos a partir de ENV-01, FLAKY-01 y FLAKY-02 de `reports/flakiness-report.md`. El JSON original se perdió, así que la etiqueta sale del informe, no del resultado.
- `synthetic` (9): construidos para probar el sistema.

«Aplazado» significa que la regla deja el caso en INCONCLUSIVE, para la IA o para una persona. VP, FN y FP se cuentan por categoría dentro de cada grupo. Un aplazado no cuenta como FN ni como FP.

Resultado actual (2026-10-09, fase de validación):

| Grupo | Casos | Aciertos | Errores | Aplazados | Delegados a IA | INCONCLUSIVE |
|---|---|---|---|---|---|---|
| verified | 23 | 23 | 0 | 0 | 0 | 0 |
| provisional | 6 | 4 | 1 | 1 | 1 | 1 |
| synthetic | 9 | 6 | 0 | 3 | 3 | 5 |

| Grupo | Categoría | Real | VP | FN | Aplazados | FP |
|---|---|---|---|---|---|---|
| verified | KNOWN_DEFECT | 18 | 18 | 0 | 0 | 0 |
| verified | PASSED | 5 | 5 | 0 | 0 | 0 |
| provisional | ENVIRONMENT_FAILURE | 4 | 3 | 0 | 1 | 0 |
| provisional | FLAKY_FAILURE | 1 | 1 | 0 | 0 | 0 |
| provisional | TEST_DEFECT | 1 | 0 | 1 | 0 | 0 |
| provisional | PASSED | 0 | 0 | 0 | 0 | 1 |
| synthetic | ENVIRONMENT_FAILURE, FLAKY_FAILURE, SKIPPED, UNEXPECTED_PASS | 1 c/u | 1 c/u | 0 | 0 | 0 |
| synthetic | INCONCLUSIVE | 2 | 2 | 0 | 0 | — |
| synthetic | PRODUCT_REGRESSION | 2 | 0 | 0 | 2 | 0 |
| synthetic | TEST_DEFECT | 1 | 0 | 0 | 1 | 0 |

Errores y aplazados documentados:
- **`prov-flaky02-falso-pass` (error).** Cuenta como FN de TEST_DEFECT y FP de PASSED.
  - El resultado (un pase, sin error) es idéntico al de un test correcto. Como el test pasaba siempre, tampoco cambia con repeticiones, así que ninguna regla puede distinguirlo sin inventar.
  - Corrección aplicada: no presentarlo como éxito confirmado. `PASSED` tiene confianza `medium` y lo explica en `reasoning_summary`.
  - Su detección corresponde a `test-quality-review`, que incluye este patrón.
- **`prov-env01-stress2` (aplazado).** Un timeout de 30 s en `beforeEach` no lleva firma de entorno. Sin otra evidencia, no se distingue de un test lento.

Comparación con la iteración anterior (2026-10-09, primera versión del triaje): 37 casos (23/6/8) con 1 error y 4 aplazados. Cambios desde entonces:
- **FLAKY-01:** antes se reconstruía como reintento. Ahora se reconstruye como ocurrió: 5 repeticiones con 2 fallos (`--repeat-each=5`). El caso de reintento pasa a sintético (`syn-flaky-reintento`).
- **Repeticiones:** antes, las de un mismo test colisionaban en `test_id` y se clasificaban por separado, así que FLAKY-01 no podía detectarse como se detectó en realidad.

La capa 2 (IA) **no está evaluada**: no se ha ejecutado contra ningún modelo. Que genere JSON válido no la valida.

## 9b. Estado de validación (2026-10-09)

**Implementado**
- Triaje determinista:
  - agregación de `--repeat-each`;
  - contrato 1.0.0;
  - validación de la capa 2;
  - agrupación determinista.
- `report:ai` con IA solo para los casos abiertos y el CLI de Claude endurecido.
- Agentes `failure-triage` y `test-reviewer`, healer sin escritura y 4 skills.
- `coverage:map` y `guard:assertions`.
- En CI: job `tooling` y job `finanzas-pareja` con autorización.

**Validado mediante pruebas locales (offline)**
- 31 pruebas unitarias y la evaluación de la capa 1 (23/23 verificados).
- Determinismo: dos ejecuciones dan la misma salida, salvo `generated_at`.
- Inmutabilidad, comparada por sha256: `test-results.json`, informe HTML, `test-results/` y `reports/`.
- `report:ai` de extremo a extremo con `fetch` simulado:
  - solo los casos abiertos van a la IA;
  - una respuesta que obedece una inyección se descarta.
- `--validate`, `coverage:map` (0 incidencias), `guard:assertions` sobre todo el diff y `typecheck`.
- Mutaciones: al revertir cada corrección, falla su prueba de regresión.

**Validado con integración real**
- Nada. No se ha llamado a Claude ni a Gemini, no se ha ejecutado el workflow en GitHub y no se ha lanzado ningún E2E en esta fase.

**Pendiente de validación** (requiere autorización)
1. `report:ai` con el CLI de Claude real.
   - Comprobar que acepta `--tools ""`, `--strict-mcp-config`, `--permission-prompts none` y `--system-prompt`, y que el modelo responde sin herramientas.
   - Procedimiento: un `test-results.json` sintético, sin datos reales, en una copia del repo.
2. `report:ai` con Gemini real: mismo procedimiento, con `GEMINI_API_KEY`.
3. Evaluación de la capa 2 con los casos aplazados etiquetados.
4. Workflow en GitHub:
   - el job `tooling` en un push;
   - el job `finanzas-pareja` por `workflow_dispatch`: que falle ante un fallo inesperado y que suba los artefactos;
   - que aparezca como omitido sin la variable.
5. Una ejecución real de `finanzas-pareja` para regenerar la evidencia local perdida el 2026-10-09. Va contra producción.

**Riesgos conocidos**
- Los falsos positivos deterministas, como FLAKY-02, no se detectan con resultados.
- La validación de citas comprueba que la cita existe y sale del error, no que respalde la conclusión.
- `ENV_PATTERNS` es una lista cerrada: un fallo de entorno con otra firma queda como INCONCLUSIVE.
- Con `FINANZAS_E2E_ENABLED=true`, cada PR a `main` ejecuta la suite contra producción, incluidas las PR desde forks (que no reciben secretos).
- `guard:assertions` es conservador: también señala un comentario que contenga `@bug-` o `expect(`.

## 10. Interpretar el resultado

- **Solo `PASSED` y `KNOWN_DEFECT`**: la ejecución es sana. Los defectos conocidos siguen abiertos.
- **`UNEXPECTED_PASS`**: puede que se haya arreglado un defecto. Hay que confirmarlo y retirar `test.fail()` y la etiqueta con aprobación humana.
- **`ENVIRONMENT_FAILURE`**: los tests afectados no dicen nada de la app. Hay que comprobar el host y repetir.
- **`INCONCLUSIVE`**: falta evidencia. Se puede usar el agente `failure-triage` o revisarlo a mano.
- **`PRODUCT_REGRESSION` / `TEST_DEFECT` de la IA**: son hipótesis con evidencias y siempre requieren revisión humana.

## 11. Integración futura con un framework de QA agéntico

El framework de QA agéntico está en otro repositorio y su arquitectura aún no se ha estudiado. Aquí no hay integración ni dependencia con él. Interfaz posible, basada solo en ficheros versionados:

| Este repositorio produce | Formato |
|---|---|
| `test-results.json` | reporter JSON de Playwright (sin modificar) |
| `playwright-report/triage.json` | contrato de la sección 3 (`schema_version`) |
| `playwright-report/failures-grouped.json` | grupos de fallos por clasificación |
| `reports/coverage-verified.md` | escenario → test |
| `test-results/**` | `error-context.md`, trazas y vídeos de los fallos |

Reparto de responsabilidades:
- **Este repositorio** ejecuta las pruebas, genera las evidencias y clasifica con reglas.
- **El framework externo** podría correlacionar ejecuciones, orquestar agentes y gestionar decisiones a partir de esos artefactos, por ejemplo descargándolos de CI.

Cualquier cambio incompatible del contrato sube `schema_version`.

## 12. Pendiente

- Evaluar la capa 2 con un modelo real y casos etiquetados, por categoría.
- Probar de extremo a extremo la invocación endurecida del CLI de Claude (`claudeArgs`) y el camino de Gemini. Solo se han probado los argumentos y la validación.
- Histórico de ejecuciones para detectar intermitencias entre runs y calibrar la confianza.
- Health check previo a la suite (ENV-01) y `failOnFlakyTests` en CI (AD-02).
- Trazabilidad por anotación (`annotation: { type: 'scenario' }`, AD-10) en lugar de comentarios.
- Un entorno de pruebas propio para la app, para poder activar el job `finanzas-pareja` en cada PR.
- JSON Schema publicado del contrato, si el framework externo lo necesita.
