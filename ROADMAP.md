# Roadmap · De suite de ejemplo a QA que se diagnostica sola

**Inicio:** 2026-10-21
**Estado:** Fase 0 hecha · Fase 1 pendiente

## Objetivo

Que el cliente vea un fallo real convertirse en diagnóstico, clasificación y corrección (o ticket) sin intervención humana, y con una cifra que demuestre que la IA acierta.

**Principio de diseño:** lo determinista lo hace el código (filtrar, agrupar, detectar flaky); la IA solo hace lo que requiere criterio (clasificar el tipo de fallo y decidir la acción). Más barato, reproducible y defendible ante el cliente.

## Punto de partida (diagnóstico)

- La IA actual no aporta más que el propio mensaje de error: 10 tests fallados generan 9 grupos, casi uno por test.
- Los fallos intencionados (`@demo-fail`) son asserts con el número o el texto cambiado; nunca hay un fallo real de producto, flaky o de entorno.
- En CI se envía el `test-results.json` completo a la capa gratuita de Gemini (riesgo de privacidad, coste de contexto en suites grandes).
- En los push a `main` el reporte IA no se ejecuta, porque la suite en verde no tiene fallos.
- El circuito no se cierra: el paso del diagnóstico al healer es manual y los tickets no llegan a Jira.
- No hay ninguna métrica de acierto de la IA.

## Resumen de fases

| Fase | Contenido | Esfuerzo | Estado |
|---|---|---|---|
| 0 | Limpieza | 0,5 días | ✅ |
| 1 | Escenarios de fallo realistas | 1-2 días | ⬜ |
| 2 | La IA clasifica, no solo resume | 2-3 días | ⬜ |
| 3 | Medir el acierto de la IA | 1 día | ⬜ |
| 4 | Cerrar el circuito | 3-5 días | ⬜ |
| 5 | Argumentos para cliente enterprise | 1 día | ⬜ |
| — | Opcionales según cliente | — | ⬜ |

Las fases 0 a 3 son el mínimo para enseñar algo distinto (unos 5-6 días). La fase 4 es la que más impresiona. Una rama y una PR por fase (`feat/escenarios-fallo`, `feat/ia-clasifica`...), para poder enseñar cada una por separado.

Leyenda: ⬜ pendiente · 🟨 en curso · ✅ hecho

---

## Fase 0 · Limpieza

- [x] Cuadrar los totales entre `README.md`, `specs/test-index.md` y el código (80 tests, 10 `@demo-fail`).
- [x] Dejar de versionar `.playwright-mcp/` (`git rm -r --cached .playwright-mcp`).
- [x] Actualizar `MODEL` en `scripts/report-ai.mjs` a un modelo actual.

**Terminada cuando:** la documentación y el código digan lo mismo.

## Fase 1 · Escenarios de fallo realistas

Un único fixture, `fixtures/scenarios.ts`, con un `test.extend` que lee `DEMO_SCENARIO` y prepara la página con `page.route` o `addInitScript`. Sin la variable no hace nada y la suite actual se comporta igual.

| Escenario | Cómo se provoca | Qué debe concluir la IA |
|---|---|---|
| `cascade` | Un `addInitScript` renombra `data-test="login-button"` | Unos 70 fallos por **una sola** causa: `test_roto`, con evidencia de un cambio del frontend |
| `bug` | Un script altera el total del checkout | Bug de producto: el test está bien y la app no |
| `flaky` | `page.route` retrasa un recurso por encima del timeout solo cuando `testInfo.retry === 0` | Falla en el primer intento y pasa en el reintento: flaky |
| `env` | `route.abort()` sobre los assets estáticos | Problema de entorno, no de código |

- [ ] Crear `fixtures/scenarios.ts` con los cuatro escenarios.
- [ ] Cambiar los 15 specs para que importen `test` y `expect` del fixture en lugar de `@playwright/test` (cambio mecánico).
- [ ] Añadir scripts npm: `test:scenario:cascade`, `test:scenario:bug`, `test:scenario:flaky`, `test:scenario:env`. El de `flaky` lleva `--retries=1`, porque en local los reintentos están a 0.
- [ ] Mantener intactos los `@demo-fail` actuales.
- [ ] Revisar las referencias a fichero y línea en `learning/` y ejecutar `npm run ruta-qa:check` (el cambio de imports desplaza líneas).

**Terminada cuando:** `DEMO_SCENARIO=cascade npx playwright test` tumbe unos 70 tests con un único origen.

## Fase 2 · La IA clasifica, no solo resume

Cambios en `scripts/report-ai.mjs`:

- [ ] **Preprocesado en código:** extraer del JSON solo los fallos (título, fichero:línea, primeras líneas del error, navegador, reintentos). Se envía mucho menos a la IA, pero esto por sí solo no resuelve la privacidad (ver redacción).
- [ ] **Agrupación en código:** agrupar por la primera línea del error normalizada (sin números ni ids) más la ubicación. Eliminar `prompts/ai-group-failures.txt`.
- [ ] **Flaky en código:** si un test falla y después pasa al reintentar, es flaky. No se pregunta a la IA.
- [ ] **Más contexto para la IA:** por cada grupo, adjuntar el `error-context.md` (la instantánea de la página que Playwright guarda en `test-results/` cuando un test falla) y unas 10 líneas del test alrededor de la línea que falla.
- [ ] **Redacción antes de enviar:** solo salen los campos de una lista permitida. En el `error-context.md` y en el fragmento del test se enmascaran las query strings de las URLs, los emails, los tokens, las cabeceras `Authorization`, las cookies y los valores que se escriben con `fill()`. El redactor lleva un test con casos conocidos.
- [ ] **Nueva salida por grupo:** `{ tipo: bug_producto | test_roto | flaky | entorno, confianza, evidencia, accion }`.
- [ ] Adaptar `prompts/ai-summary.txt`, `ai-corrections.txt` y `ai-tickets.txt` a la nueva estructura.

**Terminada cuando:** con `cascade` salga 1 grupo clasificado como `test_roto` cuya evidencia señale el cambio de selector, y con `bug` salga `bug_producto`.

## Fase 3 · Medir el acierto de la IA

- [ ] `specs/ai-golden.json`: clasificación esperada de cada escenario.
- [ ] `scripts/eval-ai.mjs`: ejecuta cada escenario, lanza el reporte, compara con lo esperado y saca el porcentaje de aciertos.
- [ ] Publicar la cifra en el README y en el resumen de cada ejecución de CI.
- [ ] Medir el tiempo de triage con IA frente a hacerlo a mano en un escenario (dato para el cliente).

**Terminada cuando:** exista una cifra del tipo "la IA clasifica bien X de Y fallos" que se pueda enseñar.

## Fase 4 · Cerrar el circuito

| Tipo | Acción automática |
|---|---|
| `test_roto` | Lanzar el healer solo sobre ese grupo y abrir una PR. Nunca se fusiona sola. |
| `bug_producto` | Crear un ticket en Jira con traza y vídeo adjuntos. **El healer no toca estos tests.** |
| `flaky` / `entorno` | Aviso en el resumen de la ejecución, sin acción automática. |

- [ ] Ejecutar el healer sin intervención en CI (`claude -p` con el agente `playwright-test-healer`) filtrando por los grupos `test_roto`.
- [ ] Abrir la PR con `gh pr create`, con el diagnóstico en la descripción.
- [ ] Crear tickets en Jira por API REST para los grupos `bug_producto`.
- [ ] Decidir el destino de los tickets: un proyecto Jira de demo propio o el conector Atlassian autorizado.
- [ ] **Protección independiente de la clasificación:** un check sobre el diff de cualquier PR automática que la marque como `needs-human` y bloquee su merge si relaja una aserción: borra un `expect`, cambia un valor esperado, añade `.not`, `test.skip` o `test.fixme`, o sube un timeout. Si la IA clasificara un bug real como `test_roto`, el healer podría "arreglar" el test y ocultar el bug; este check lo impide aunque la clasificación falle. Es un argumento de venta.

**Terminada cuando:** al ejecutar `cascade` aparezca una PR con la corrección, y al ejecutar `bug` aparezca un ticket.

## Fase 5 · Argumentos para cliente enterprise

- [ ] Sección en el README: **qué datos salen y hacia dónde**, con el preprocesado y la redacción de la fase 2 como prueba.
- [ ] Proveedor de IA elegible por variable de entorno. El cambio a Anthropic API, Bedrock o Vertex se construye solo cuando un cliente lo pida; mientras, basta con demostrar que se puede cambiar.

## Opcionales según cliente

- [ ] `storageState` para no repetir el login en cada test.
- [ ] Spec de accesibilidad con axe.
- [ ] Regresión visual con `toHaveScreenshot`.
- [ ] Usar la rama `arquetipo` para apuntar a una segunda app más parecida al sector del cliente.

---

## Guion de la demo final (10 minutos)

1. Suite en verde en Chromium, Firefox y WebKit.
2. Se activa `cascade`: caen unos 70 tests. La IA los agrupa en uno, explica que cambió el selector del login y abre una PR con la corrección.
3. Se activa `bug`: la IA explica que es un bug de la app, no del test, y crea un ticket en Jira. El healer no lo toca.
4. Se enseña la cifra de aciertos y qué datos salen hacia la IA.

## Riesgos y restricciones

- Los `@demo-fail` fallan a propósito: no se corrigen.
- `learning/` cita ficheros y líneas reales de `tests/` y `pages/`. Cualquier cambio que desplace líneas obliga a revisar esas referencias.
- La capa gratuita de Gemini tiene límite de peticiones por minuto: los escenarios en CI deben ir en serie.
- El healer automático puede proponer correcciones incorrectas: la PR siempre la revisa una persona.

## Registro de decisiones

| Fecha | Decisión | Motivo |
|---|---|---|
| 2026-10-21 | La agrupación y la detección de flaky pasan de la IA al código | Es determinista: más barato, reproducible y sin alucinaciones |
| 2026-10-21 | El healer solo actúa sobre `test_roto` | Evitar que oculte bugs reales bajando expectativas |
| 2026-10-21 | `MODEL` pasa a `claude-haiku-5-5` (sin sufijo de fecha) | Haiku actual; el ID sin fecha no caduca con cada snapshot |
| 2026-10-21 | Las PR automáticas que relajan asserts se bloquean con un check del diff, sea cual sea la clasificación | La clasificación de la IA puede fallar; la protección contra ocultar bugs no debe depender de ella (revisión de CodeRabbit en la PR #1) |
| 2026-10-21 | Lo que se envía a la IA pasa por una lista de campos permitidos y un redactor | Filtrar el JSON reduce el volumen, pero no elimina datos sensibles del contexto (revisión de CodeRabbit en la PR #1) |
