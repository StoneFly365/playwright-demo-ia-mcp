# Roadmap · De suite de ejemplo a QA que se diagnostica sola

**Inicio:** 2026-10-21
**Estado:** Fases 0 a 3, cuota de IA en CI y fase 5 hechas · Fase 4 hecha en local y en CI (falta crear tickets de Jira desde CI) · Proveedor de IA configurable y OpenRouter en CI · Fase 6 (Diseñar desde Figma) en local, pendiente de probar con un fichero real · Última actualización: 2026-11-18

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
| 1 | Escenarios de fallo realistas | 1-2 días | ✅ |
| 2 | La IA clasifica, no solo resume | 2-3 días | ✅ |
| 3 | Medir el acierto de la IA | 1 día | ✅ (falta cronometrar un triage a mano) |
| 3b | Cuota de IA en CI (fuera del plan inicial) | 0,5 días | ✅ |
| 4 | Cerrar el circuito | 3-5 días | 🟨 hecha en local y en CI; faltan los tickets de Jira desde CI |
| 5 | Argumentos para cliente enterprise | 1 día | ✅ |
| 6 | Diseñar desde Figma (fase 1 del ciclo de QA) | 2 días | 🟨 construida; falta el fichero de Figma y la primera ejecución real |
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
| `cascade` | Un `addInitScript` renombra `data-test="login-button"` a `login-submit` | 70 fallos por **una sola** causa: `test_roto`, con evidencia de un cambio del frontend |
| `bug` | Un `addInitScript` hace que el badge del carrito cuente un producto de más | 35 fallos de bug de producto: el test está bien y la app no |
| `flaky` | `page.route` retrasa los scripts 15 s solo cuando `testInfo.retry === 0` | 70 tests que fallan en el primer intento y pasan en el reintento: flaky |
| `env` | `route.abort('connectionrefused')` sobre todas las peticiones | 70 fallos de `net::ERR_CONNECTION_REFUSED`: problema de entorno, no de código |

- [x] Crear `fixtures/scenarios.ts` con los cuatro escenarios.
- [x] Cambiar los 15 specs para que importen `test` y `expect` del fixture en lugar de `@playwright/test` (cambio mecánico).
- [x] Añadir scripts npm: `test:scenario:cascade`, `test:scenario:bug`, `test:scenario:flaky`, `test:scenario:env`. El de `flaky` lleva `--retries=1`, porque en local los reintentos están a 0.
- [x] Mantener intactos los `@demo-fail` actuales.
- [x] Revisar las referencias de `learning/` y ejecutar `npm run ruta-qa:check`. El cambio de imports no desplaza líneas, pero dos referencias usaban el import de `@playwright/test` de los specs como ejemplo de import de paquete; ahora apuntan a `pages/login.page.ts:1`.

**Terminada cuando:** `DEMO_SCENARIO=cascade npx playwright test` tumbe unos 70 tests con un único origen.

**Resultado (chromium, sin `@demo-fail`):** sin escenario, 70 pasan; `cascade` 70 fallan; `bug` 35 fallan y 35 pasan; `flaky` 70 flaky; `env` 70 fallan. Con un escenario activo el timeout de las acciones baja a 10 s para que los fallos no tarden 30 s cada uno.

## Fase 2 · La IA clasifica, no solo resume

Cambios en `scripts/report-ai.mjs`. La parte sin IA vive en `scripts/triage.mjs`, con sus tests en `scripts/triage.test.mjs` (`npm run test:unit`, que también se ejecuta en CI):

- [x] **Preprocesado en código:** extraer del JSON solo los fallos (título, fichero:línea, primeras líneas del error, navegador, reintentos). Se envía mucho menos a la IA, pero esto por sí solo no resuelve la privacidad (ver redacción).
- [x] **Agrupación en código:** agrupar por el patrón del fallo (`elemento_no_encontrado`, `valor_inesperado`, `red`, `timeout`) más el locator implicado o el código de red. Eliminar `prompts/ai-group-failures.txt`. Ojo: la primera línea no sirve, porque los mensajes personalizados de los `expect` la hacen distinta en cada test (en `bug`, 35 fallos dan 34 primeras líneas distintas). Hay que usar el matcher y el locator (`toHaveText` sobre `shopping-cart-badge`). Los errores de red también cambian según el navegador: `net::ERR_CONNECTION_REFUSED` en Chromium y `NS_ERROR_CONNECTION_REFUSED` en Firefox.
- [x] **Flaky en código:** si un test falla y después pasa al reintentar, es flaky. No se pregunta a la IA.
- [x] **Más contexto para la IA:** por cada grupo, adjuntar el `error-context.md` (la instantánea de la página que Playwright guarda en `test-results/` cuando un test falla) y el fragmento del test. No hace falta leer el fichero del test: el mensaje de error de Playwright ya trae las líneas alrededor del fallo.
- [x] **Redacción antes de enviar:** solo salen los campos de una lista permitida. En el `error-context.md` y en el fragmento del test se enmascaran las query strings de las URLs, los emails, los tokens, las cabeceras `Authorization`, las cookies y los valores que se escriben con `fill()`. El redactor lleva un test con casos conocidos. Se redacta antes de recortar, para que un token partido por el corte no se escape, y también la huella del grupo y los títulos y ficheros de los tests. Además enmascara las rutas con nombre de usuario (`C:\Users\<usuario>`, `/home/<usuario>`) y los valores de los `textbox` de la instantánea, que incluyen lo que se ha escrito en los formularios.
- [x] **Nueva salida por grupo:** `{ tipo, confianza, evidencia, accion }`. La IA asigna `test_roto`, `bug_producto` o `entorno`; `flaky` lo asigna el código, y `sin_clasificar` aparece si falla la llamada de clasificación.
- [x] Adaptar `prompts/ai-summary.txt`, `ai-corrections.txt` y `ai-tickets.txt` a la nueva estructura.

**Terminada cuando:** con `cascade` salga 1 grupo clasificado como `test_roto` cuya evidencia señale el cambio de selector, y con `bug` salga `bug_producto`.

**Resultado (chromium, Claude Haiku 5.5 en local):**

| Ejecución | Grupos | Clasificación |
|---|---|---|
| `cascade` | 1 (70 tests) | `test_roto`, confianza alta: "page_context muestra el botón Login con el mismo texto y rol; el selector no coincide" |
| `bug` | 2 (34 + 1) | los dos `bug_producto`, confianza alta: "el badge muestra 2 y el botón del carrito dice Cart, 1 items". 2 tickets |
| `env` | 1 (70) | `entorno`, confianza alta: `ERR_CONNECTION_REFUSED` y la página no llega a cargar |
| `flaky` | 1 (70) | `flaky`, decidido por el código sin llamar a la IA |
| Suite normal (`@demo-fail`) | 7 (10 tests) | los 7 `test_roto`, confianza alta |

La pista clave para distinguir un bug de un test roto es el texto accesible de la propia página: el botón del carrito dice cuántos productos hay ("Cart, 1 items") y el badge muestra otra cifra.

## Fase 3 · Medir el acierto de la IA

- [x] `specs/ai-golden.json`: clasificación esperada de cada escenario.
- [x] `scripts/eval-ai.mjs` (`npm run eval:ai`): ejecuta cada escenario, lanza el reporte, compara con lo esperado y saca el porcentaje de aciertos, por grupos y por tests.
- [x] Publicar la cifra en el README y en el resumen de CI. No en cada ejecución, porque gastaría cuota de IA en cada push: es un job aparte que se lanza a mano con `suite=eval`.
- [x] Medir el tiempo de triage con IA frente a hacerlo a mano en un escenario (dato para el cliente). Lado IA medido: entre 19 y 57 s por escenario. Lado manual **estimado, no cronometrado** (tabla abajo).

**Terminada cuando:** exista una cifra del tipo "la IA clasifica bien X de Y fallos" que se pueda enseñar.

**Resultado (Claude Haiku 5.5, en local):** 11 de 11 grupos, que cubren 185 de 185 tests fallados. Ojo al presentarlo: son 5 escenarios diseñados por nosotros y una sola ejecución. Conviene contarlo como "11 de 11 en escenarios controlados" y no como "100 % de acierto".

**Tiempo de triage, a mano frente a IA (estimación, 16 de noviembre de 2026).** El tiempo a mano es una estimación por pasos, no una medición. Supone un QA que conoce la suite y SauceDemo y que parte del informe HTML de Playwright con trazas, capturas y vídeo. Cuenta hasta tener cada fallo clasificado y, en `bug`, el ticket escrito. No cuenta arreglar el test ni buscar la causa raíz de un flaky. El tiempo con IA es el del reporte medido más lo que tarda una persona en leer y validar lo que dice la IA: 3 minutos, o 5 cuando hay varios grupos o tickets que revisar.

| Escenario | Qué tiene que hacer la persona | A mano | Con IA (reporte + revisión) | Ahorro |
|---|---|---|---|---|
| `demo-fail` | 10 tests con 7 causas distintas: abrir la traza de cada uno y decidir | 35-55 min | 57 s + 5 min ≈ 6 min | ×7 |
| `cascade` | Ver que los 70 fallos comparten causa, abrir la traza, encontrar el botón con otro `data-test` | 20-30 min | 23 s + 3 min ≈ 3,5 min | ×7 |
| `bug` | Descartar que el test esté mal, reproducir el badge en la app y escribir 2 tickets | 30-50 min | 34 s + 5 min ≈ 5,5 min | ×7 |
| `env` | Ver `ERR_CONNECTION_REFUSED` en todos y confirmar que el entorno está caído | 10-15 min | 21 s + 3 min ≈ 3,5 min | ×3,5 |
| `flaky` | Ver que fallan en el primer intento y pasan al reintentar | 10-15 min | 19 s + 3 min ≈ 3,5 min | ×3,5 |
| **Total** | | **105-165 min (unas 2 h 15 min)** | **unos 22 min** | **×6** |

Cómo contarlo al cliente: "el triage de estos cinco escenarios pasa de unas dos horas a unos veinte minutos, y la persona sigue decidiendo". El ahorro es mayor cuanto más cuesta investigar cada fallo (`bug`, `demo-fail`) y menor cuando el fallo se ve a la primera (`env`, `flaky`). Antes de dar la cifra como dato propio, conviene cronometrar al menos un escenario con una persona del cliente.

## Fase 3b · Cuota de IA en CI

No estaba en el plan. La primera evaluación con Gemini en CI salió entera `sin_clasificar`: la capa gratuita permite 20 peticiones al día y ese día ya se habían gastado. Al revisar el consumo se vio además que las CI en verde también gastaban cuota cuando aparecía un test flaky.

- [x] Un solo reporte IA por ejecución de CI: los tres navegadores suben su `test-results.json` y `scripts/merge-results.mjs` los une. Un `suite=fail` pasa de 12 llamadas a 4 como mucho. PR #6.
- [x] Los navegadores en paralelo (fuera `max-parallel: 1`): la CI pasa de unos 4 min 40 s a 2 min 30 s.
- [x] En push y PR no se llama a la IA si solo hay tests flaky (`AI_SKIP_FLAKY_ONLY`).
- [x] La evaluación solo llama a la clasificación (`AI_CLASSIFY_ONLY`) y no cuenta como fallo lo que la IA no llegó a clasificar.
- [x] Permisos del workflow: `contents: read` y checkout sin credenciales persistidas.
- [x] Proveedor configurable: `AI_API_KEY`, `AI_BASE_URL` y `AI_MODEL` para cualquier API compatible con la de OpenAI. `GEMINI_API_KEY` sigue funcionando como atajo. `eval:ai` toma el proveedor de lo que registra `report:ai`, sin repetir la lógica.
- [x] **OpenRouter** con un modelo gratuito en CI (50 peticiones al día sin créditos). El workflow lo usa si existe el secreto `OPENROUTER_API_KEY`, con el modelo de la variable `AI_MODEL` elegido con `npm run eval:ai`; los dos están creados en el repositorio. Modelo elegido: `nvidia/nemotron-3-ultra-550b-a55b:free`, 11 de 11 grupos (185 de 185 tests) en local el 26 de octubre, igual que Claude Haiku. De los gratuitos probados, `nemotron-3-super-120b` devolvió 404 y `gemma-4-31b-it`, 429.
- [x] Probar en CI el camino con fallos reales (`suite=fail`) con el job único de reporte. Probado el 26 de octubre con OpenRouter: 30 fallos de `@demo-fail` en 7 grupos, todos `test_roto`, con 3 peticiones (clasificación, resumen y correcciones). Las dos `suite=eval` en CI dieron 11 de 11, como en local.

**Descartado:** Claude por API en CI. Funcionaría con el mismo modelo que en local y costaría menos de 1 $ al mes, pero la clave del repositorio es del plan personal y no se quiere ningún coste adicional.

## Dashboard QA Intelligence (fuera del plan inicial)

Página local de solo lectura para enseñar en la demo el paso de los tests a los grupos, la clasificación, la evidencia, la acción y el acierto de la IA, sin gastar cuota. Detalle en la sección del README.

- [x] `npm run dashboard` (`scripts/dashboard.mjs`) genera `playwright-report/qa-dashboard.html` a partir de los artefactos que ya existen. No llama a la IA, no ejecuta tests y la página bloquea cualquier conexión de red (CSP).
- [x] `report:ai` guarda en `ai-failures-grouped.json` `run_start_time`, `provider` y `ai_requests`, sin enviarlos en los prompts. `eval:ai` escribe también `ai-eval.json`. Son campos y ficheros nuevos; los que ya había no cambian.
- [x] Historial local en `qa-history/` con `--save` (una copia por ejecución, nunca se sobrescribe) y modo demo con `learning/ruta-qa/ejemplos/`, que no se mezcla con el historial.
- [x] En CI, los jobs de reporte y de evaluación generan el dashboard dentro de sus artefactos. Sin permisos nuevos ni GitHub Pages.
- [x] Rediseño visual para la demo: tema oscuro con colores fijos por función y por categoría, cabecera con el estado de la ejecución, tarjetas con icono, gráficos (resultados, categorías, origen de la clasificación, historial y acierto) y detalle de grupo en dos columnas. Solo cambia `scripts/dashboard.html`; la lógica y los datos son los mismos.
- [x] README: ciclo completo para alimentar el historial en bash y PowerShell (`npm test; npm run report:ai; npm run dashboard -- --save`).
- Caché de clasificaciones: descartada, no es un pendiente. Motivo en el [registro de decisiones](#registro-de-decisiones) (21 de octubre) y en el README. Si se retoma, en una rama propia.
- [x] Acciones ejecutadas: el dashboard lee `ai-heal.json` (`heal:ai`) y `ai-jira.json` (`jira:tickets`) y enseña, en cada grupo y en la sección de recomendaciones, la PR del healer y el ticket de Jira. Los dos ficheros guardan ahora `run_start_time` para no mezclar ejecuciones.

## Fase 4 · Cerrar el circuito

| Tipo | Acción automática |
|---|---|
| `test_roto` | Lanzar el healer solo sobre ese grupo y abrir una PR. Nunca se fusiona sola. |
| `bug_producto` | Crear un ticket en Jira con traza y vídeo adjuntos. **El healer no toca estos tests.** |
| `flaky` / `entorno` | Aviso en el resumen de la ejecución, sin acción automática. |

- [x] Ejecutar el healer sin intervención (`npm run heal:ai`: `claude -p` con el agente `playwright-test-healer`) solo sobre los grupos `test_roto`. En local, con la suscripción.
- [x] El mismo healer en CI: job **Healer** del workflow, solo a mano (`heal: true`), con el secreto `CLAUDE_CODE_OAUTH_TOKEN`. El lanzamiento manual admite también `scenario` para reproducir `cascade` y el resto en CI. Las PR que abre `GITHUB_TOKEN` no disparan los tests ni el guard: una persona cierra y reabre la PR (solo si se lanzó desde `main`; desde otra rama la PR va contra ella y no pasa por tests ni guard). Sin fallos, el job no corre. Probado el 17 de noviembre con `scenario=cascade`: 1 grupo `test_roto` (210 tests, confianza alta) y PR #31 en borrador con `needs-human`; el healer propone el mismo cambio que en local (PR #12), `getByRole('button', { name: 'Login' })` en el page object, `menu.spec.ts` y `route-protection.spec.ts`. La prueba destapó que el job Reporte IA no descargaba las instantáneas de la página (`test-results-*`): sin ellas, la IA clasificaba `cascade` como `entorno`. Corregido.
- [x] Abrir la PR en borrador con `gh pr create`, con el diagnóstico y el resumen del healer en la descripción.
- [x] Si `origin` es un GitLab, `heal:ai` abre una MR en borrador por la API con `GITLAB_TOKEN` (scope `api`) en vez de la PR (PR #33).
- [x] Tickets de Jira por API REST para los grupos `bug_producto` (`npm run jira:tickets`), con traza y vídeo adjuntos. Sin credenciales es modo simulado y deja las peticiones en `ai-jira.json`; en CI va en cada reporte.
- [x] Modo real de Jira probado contra el sandbox (proyecto `THP`, tipo `Tarea`, credenciales en `.env`): el escenario `bug` crea THP-1 y THP-2 con sus 6 y 2 adjuntos.
- [x] Destino de los tickets: el sandbox de Jira, proyecto `THP`. Sin credenciales, modo simulado. El conector Atlassian no sirve en CI.
- [ ] Tickets de Jira desde CI (con traza y vídeo: el job Reporte IA descarga los `test-results-*`). Los secretos `JIRA_*` ya están en GitHub desde el 27 de octubre, así que el modo real está activo en CI, pero falta: pasar `JIRA_ISSUE_TYPE` en el workflow (THP usa `Tarea` y el valor por defecto es `Bug`), probarlo con `scenario=bug` y revisar qué llevan la traza y el vídeo.
- [x] Prueba de punta a punta en local (chromium, 23 de octubre): `cascade` acaba en PR y `bug` en ticket de Jira. Resultado abajo.
- [x] Job *Guard de asserts* probado en GitHub (PR #13, cerrada): falla con `needs-human` cuando se cambia `toHaveText('3')` por `'4'` y pasa cuando solo cambia un selector del page object.
- [x] Prioridad de Jira según la severidad (`bloqueante` → la más urgente del proyecto; en THP, `alta` → Crítica y `media` → Importante), para que el color se vea en el tablero.
- [x] Los agentes no reciben tokens (revisión de CodeRabbit en la PR #35): `scripts/agent.mjs` quita del entorno `GH_TOKEN`, `GITHUB_TOKEN`, `GITLAB_TOKEN`, `JIRA_*` y las claves de IA, y el checkout del job Healer va con `persist-credentials: false`; `heal:ai` pasa el token solo al push. Queda el `CLAUDE_CODE_OAUTH_TOKEN`, que `claude` necesita.
- [x] Revisión adversarial de Playwright (`npm run review:pw`, agente `playwright-adversarial-reviewer`): un segundo agente intenta tumbar el arreglo antes de abrir la PR, y su veredicto va en la descripción. Si no lo aprueba, la PR lleva `needs-human`.
- [x] Lint de Playwright sin IA en CI (`eslint-plugin-playwright`), con trinquete: falla si aparece un aviso más de los 17 actuales.
- [x] **Protección independiente de la clasificación** (`scripts/guard-asserts.mjs`, job *Guard de asserts* en las PR de ramas `heal/*`. Es check obligatorio de `main`, también para administradores; una persona lo desbloquea con la etiqueta `asserts-aprobados`, que se retira sola si llegan commits nuevos): un check sobre el diff de cualquier PR automática que la marque como `needs-human` y bloquee su merge si relaja una aserción: borra un `expect`, cambia un valor esperado, añade `.not`, `test.skip` o `test.fixme`, o sube un timeout. Si la IA clasificara un bug real como `test_roto`, el healer podría "arreglar" el test y ocultar el bug; este check lo impide aunque la clasificación falle. Es un argumento de venta.

**Terminada cuando:** al ejecutar `cascade` aparezca una PR con la corrección, y al ejecutar `bug` aparezca un ticket.

**Resultado (chromium, Claude Haiku 5.5 para el triage y el healer con Sonnet, en local):**

| Escenario | Triage | Acción |
|---|---|---|
| `cascade` | 1 grupo `test_roto` (70 tests), confianza alta | Primera prueba (PR #11, cerrada): el healer cambió solo el page object y pasaban 68 de 70, porque `route-protection.spec.ts` usa el selector directamente. Con el prompt mejorado, PR #12 en borrador y sin `needs-human`: cambia las 5 apariciones a `getByRole('button', { name: 'Login' })` (page object, `menu.spec.ts` y `route-protection.spec.ts`) y pasan 70 de 70 con el escenario y 70 de 70 sin él |
| `bug` | 2 grupos `bug_producto` (34 + 1), confianza alta | Tickets THP-1 y THP-2 en el sandbox de Jira, con 6 y 2 adjuntos (traza y vídeo) de la misma ejecución. El healer no los toca: "No hay grupos test_roto" |

El prompt del healer lleva ahora la huella del grupo y pide corregir todas las apariciones del locator y ejecutar todos los ficheros afectados. Las PR #11 y #12 son de prueba: no se fusionan, porque el escenario `cascade` es simulado. El job *Guard de asserts* se probó después en GitHub con una PR `heal/*` contra `main` (PR #13): falla con la aserción cambiada y pasa con el cambio de selector.

## Fase 5 · Argumentos para cliente enterprise

- [x] Sección en el README: **qué datos salen y hacia dónde** (destino por destino, con la lista de campos permitidos y el redactor de la fase 2 como prueba, y lo que hay que decidir con cada cliente).
- [x] Proveedor de IA elegible por variable de entorno (`AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`). Vale para cualquier API compatible con la de OpenAI, gateways de empresa incluidos. Un cliente nativo de Anthropic API, Bedrock o Vertex se construye solo cuando un cliente lo pida.

## Fase 6 · Diseñar desde Figma

Caso de uso de Leroy Merlin (ADEO): la diapositiva ordena el QA con IA en cinco fases (diseñar, automatizar, mantener, analizar y aprender). La 2, la 3 y la 4 ya estaban; esta fase añade la 1. La demo guiada (propuesta grabada, tests de `HU-001` y guion) vive solo en la rama `feat/disenar-desde-figma`.

- [x] Servidor MCP oficial de Figma (`https://mcp.figma.com/mcp`) en `.mcp.figma.json`, junto al de Playwright y aparte de `.mcp.json`.
- [x] Agente `qa-test-designer`: historia + Figma + app real → criterios en Given/When/Then, casos trazados, discrepancias entre diseño y app y dudas para negocio, en un JSON de forma fija.
- [x] `npm run design:ai` (`scripts/design-ai.mjs`): valida el JSON, calcula la cobertura de criterios en código y escribe el plan en el formato del planner. Comprueba que el agente solo escribe en `specs/disenos/` y `specs/figma/`.
- [x] `--generate`: el generator escribe los tests de los casos nuevos de prioridad alta en `tests/<hu>/`, importando el fixture de escenarios (resuelve el riesgo del import de `@playwright/test`).
- [x] Modo sin conexión con una instantánea del frame (`--snapshot`), como el modo simulado de Jira.
- [x] Historia de la demo `HU-001` y guía del fichero de Figma con dos discrepancias a propósito (subtotal en el carrito y ordenación por defecto) y un criterio sin respaldo (CA5).
- [x] Tests unitarios (`scripts/design-ai.test.mjs`) dentro de `npm run test:unit`.
- [ ] Crear el fichero de Figma con la guía y poner su `FILE_KEY` en la historia.
- [ ] Primera ejecución real (Figma por MCP y app) y guardar la instantánea que escribe.
- [ ] Medir si la IA encuentra D1, D2 y la duda de CA5 (añadirlo a `specs/ai-golden.json` si se repite).
- [x] Regenerar `docs/diagramas/qa-ia-negocio.html` con archify (incluye la fase Diseñar).

**Terminada cuando:** `npm run design:ai -- HU-001` con el fichero real de Figma saque D1 y D2 como discrepancias y CA5 como duda, y `--generate` deje tests que pasan, salvo el del subtotal, que falla como `bug_producto`.

## Opcionales según cliente

- [x] `storageState` para no repetir el login en cada test. Solo sin `DEMO_SCENARIO`, para que `cascade` siga tumbando 70 tests (comprobado). En chromium la suite verde pasa de 20,9 s a 19,8 s: el login de SauceDemo es rápido y casi no se nota.
- [x] Spec de accesibilidad con axe: `tests/accessibility.spec.ts`, 8 tests `@a11y` con WCAG 2.1 A y AA (login, error de login, inventario, detalle, carrito, los dos pasos del checkout y la confirmación). SauceDemo pasa todos en los tres navegadores. `npm run test:a11y` los lanza solos.
- Regresión visual con `toHaveScreenshot`: descartada, no es un pendiente. Motivo en el [registro de decisiones](#registro-de-decisiones) (17 de noviembre). Si un cliente la pide, en una rama propia.
- [ ] Usar la rama `arquetipo` para apuntar a una segunda app más parecida al sector del cliente.

---

## Guion de la demo final (10 minutos)

0. Fase 1 · Diseñar: `npm run design:ai -- HU-001` lee la historia y el Figma, y saca casos, discrepancias y dudas.
1. Suite en verde en Chromium, Firefox y WebKit.
2. Se activa `cascade`: caen unos 70 tests. La IA los agrupa en uno, explica que cambió el selector del login y abre una PR con la corrección.
3. Se activa `bug`: la IA explica que es un bug de la app, no del test, y crea un ticket en Jira. El healer no lo toca.
4. Se enseña la cifra de aciertos y qué datos salen hacia la IA.

## Riesgos y restricciones

- Los `@demo-fail` fallan a propósito: no se corrigen.
- Jira real: volver a lanzar `jira:tickets` sobre el mismo informe crea tickets duplicados, y la traza y el vídeo adjuntos no pasan por el redactor (pueden llevar datos de la sesión). En un proyecto de cliente, revisar qué contienen antes de activar las variables `JIRA_*`.
- `learning/` cita ficheros y líneas reales de `tests/` y `pages/`. Cualquier cambio que desplace líneas obliga a revisar esas referencias.
- En CI se usa OpenRouter con un modelo gratuito: 50 peticiones al día sin créditos, y el modelo puede dejar de estar disponible (el 26 de octubre, dos de los tres gratuitos probados devolvían 404 o 429). Si eso pasa, se cambia la variable `AI_MODEL` tras pasar `eval:ai`, o se borra el secreto `OPENROUTER_API_KEY` para volver a Gemini. La capa gratuita de Gemini permite 20 peticiones al día y 5 por minuto. Desde la PR de la cuota, una ejecución de CI con fallos gasta 4 como mucho y una en verde ninguna, aunque tenga flaky. Los escenarios en CI deben ir en serie, y un día con varias ejecuciones de `suite=fail` o `suite=eval` agota la cuota: el 21 de octubre la primera evaluación en CI salió entera `sin_clasificar` por eso. Para usarlo con un cliente hace falta una clave de pago o un proveedor con más cuota.
- El healer automático puede proponer correcciones incorrectas: la PR siempre la revisa una persona.
- Los tests nuevos que escriba el agente generator importan de `@playwright/test`, salvo los de `design:ai --generate`, que ya piden el fixture. Para que les afecten los escenarios, hay que cambiar ese import por `../fixtures/scenarios`.

## Registro de decisiones

| Fecha | Decisión | Motivo |
|---|---|---|
| 2026-10-21 | La agrupación y la detección de flaky pasan de la IA al código | Es determinista: más barato, reproducible y sin alucinaciones |
| 2026-10-21 | El healer solo actúa sobre `test_roto` | Evitar que oculte bugs reales bajando expectativas |
| 2026-10-21 | `MODEL` pasa a `claude-haiku-5-5` (sin sufijo de fecha) | Haiku actual; el ID sin fecha no caduca con cada snapshot |
| 2026-10-21 | Las PR automáticas que relajan asserts se bloquean con un check del diff, sea cual sea la clasificación | La clasificación de la IA puede fallar; la protección contra ocultar bugs no debe depender de ella (revisión de CodeRabbit en la PR #1) |
| 2026-10-21 | Lo que se envía a la IA pasa por una lista de campos permitidos y un redactor | Filtrar el JSON reduce el volumen, pero no elimina datos sensibles del contexto (revisión de CodeRabbit en la PR #1) |
| 2026-10-21 | El escenario `bug` rompe el badge del carrito en vez del total del checkout | Ningún test comprueba el valor del total, solo que se vea; el badge lo comprueban 35 tests |
| 2026-10-21 | El escenario `env` rechaza todas las conexiones en vez de cortar solo los assets | Cortar los assets deja la página en blanco y el fallo se parece a `cascade`; un `ERR_CONNECTION_REFUSED` es una señal de entorno inequívoca |
| 2026-10-21 | Los tickets solo se generan para los grupos `bug_producto` | Un test roto o un problema de entorno no es una incidencia para el equipo de producto |
| 2026-10-21 | Si falla la clasificación, el reporte sigue y los grupos quedan como `sin_clasificar` | El resumen y las correcciones siguen siendo útiles sin clasificación; antes un error de cuota tiraba todo el reporte |
| 2026-10-21 | Los flaky también disparan el reporte IA, aunque no haya ningún fallo definitivo | Antes solo se analizaba cuando había fallos; una suite flaky en verde es un riesgo que hay que explicar |
| 2026-10-21 | La evaluación de la IA es un job de CI manual (`suite=eval`), no parte de cada push | Ejecutar los 5 escenarios y 5 reportes IA en cada push gasta cuota y tiempo sin aportar nada nuevo |
| 2026-10-21 | El acierto se mide por grupos y también por tests | Un grupo grande mal clasificado pesa más que uno pequeño |
| 2026-10-21 | La evaluación solo llama a la clasificación (`AI_CLASSIFY_ONLY`) y no cuenta los grupos `sin_clasificar` | Con la cuota gratuita de Gemini (20 peticiones al día) la evaluación completa no cabía, y un 0 % por cuota agotada se leía como "la IA no acierta" |
| 2026-10-21 | Un solo reporte IA por ejecución de CI, con los resultados de los tres navegadores unidos (`scripts/merge-results.mjs`), y los navegadores en paralelo | Con un reporte por navegador, un `suite=fail` gastaba 12 de las 20 peticiones diarias de Gemini y los jobs tenían que ir en serie |
| 2026-10-21 | En push y PR no se llama a la IA si lo único que hay son tests flaky (`AI_SKIP_FLAKY_ONLY`) | El 21 de octubre, tres CI en verde gastaron 6 peticiones por un test flaky de webkit o firefox |
| 2026-10-21 | El workflow corre con `permissions: contents: read` y checkout sin credenciales persistidas | Ningún job escribe en el repositorio (revisión de CodeRabbit en la PR #4) |
| 2026-10-21 | `learning/ruta-qa/ejemplos/` se regenera con el reporte nuevo y los módulos 1, 2 y 6 de la Ruta QA se adaptan | Tras la fase 2 el alumno que ejecuta la IA obtenía otra salida; con los `@demo-fail` `ai-tickets.json` sale vacío, así que el ejemplo de tickets sale del escenario `bug` |
| 2026-10-21 | El curso deja de estar orientado a seguros: es para cualquier QA que empiece con Playwright | Cambio de público del Learning Lab (PR #5) |
| 2026-10-21 | El dashboard es una página estática generada por un script Node, sin servidor ni dependencias | Basta con leer ficheros locales; los datos van dentro de la página y se abre sin conexión |
| 2026-10-21 | El dashboard asocia el análisis a la ejecución por `run_start_time` y oculta lo que es de otra | `report:ai` no borra los ficheros de la ejecución anterior cuando no hay nada que analizar, y se mezclaban resultados |
| 2026-10-21 | Sin caché de clasificaciones por ahora | La huella del grupo no basta como clave: la evidencia que decide cambia aunque la huella sea la misma |
| 2026-10-21 | OpenRouter gratuito en CI en lugar de Claude por API | Sin coste adicional; a cambio, en CI se usa un modelo distinto del de local y hay que medir su acierto aparte |
| 2026-10-22 | El dashboard pasa a un tema oscuro único, sin modo claro | Es una página para enseñar en demos; un solo tema mantiene los colores de cada categoría iguales en todas las vistas |
| 2026-10-22 | Iconos (trazos de Lucide) y gráficos hechos con SVG y CSS dentro de la página, sin librerías | La CSP bloquea cualquier recurso externo y los tests prohíben `innerHTML`; los gráficos necesarios caben en pocas líneas |
| 2026-10-22 | El ciclo local se documenta con `;` y `PLAYWRIGHT_HTML_OPEN=never`, no con `test:ai` | `test:ai` encadena con `&&` y no llega a `report:ai` si hay fallos; el visor HTML de Playwright bloqueaba la cadena |
| 2026-10-22 | El healer automático empieza en local (`npm run heal:ai`) y abre PR en borrador | No necesita secretos nuevos ni coste: usa la suscripción y `gh` del equipo. En CI haría falta un token de Claude en el repositorio |
| 2026-10-22 | Jira en modo simulado hasta tener un proyecto de demo | Se construyen y se guardan las mismas peticiones REST; el modo real se activa solo con las variables `JIRA_*` |
| 2026-10-23 | La prioridad de Jira sale de la severidad, no se colorea la portada | La prioridad es nativa: se filtra, se ordena y su icono sale en color en la tarjeta. La portada de un proyecto de negocio es una imagen adjunta, sin API conocida para fijarla |
| 2026-10-23 | Revisión de Playwright en tres capas: lint sin IA, check de asserts sin IA y revisor adversarial con IA | El lint y el check son baratos y deterministas, pero no entienden la intención. El revisor cubre el sujeto de los `expect`, que el check no mira. CodeRabbit queda como opinión externa (y tiene límite de uso) |
| 2026-10-23 | El guard es check obligatorio de `main`, en un workflow propio, con la etiqueta `asserts-aprobados` como vía de aprobación | Sin el check obligatorio, la cruz roja no impedía fusionar. Sin la etiqueta, una corrección legítima de un valor esperado no se podría fusionar nunca. El workflow propio se relanza al cambiar etiquetas sin repetir los tests |
| 2026-10-23 | Antes de crear, `jira:tickets` lee los campos obligatorios del proyecto y pone el informador si hace falta | En el sandbox (`THP`) el informador es obligatorio por API y el primer modo real habría devuelto 400 |
| 2026-10-22 | El check de asserts compara matcher y argumentos, no el sujeto, y solo se aplica a las ramas `heal/*` | Cambiar un selector es lo que debe hacer el healer; cambiar un valor esperado, no sin una persona. Las PR humanas pueden cambiar expectativas legítimamente |
| 2026-11-16 | El agente diseñador propone un caso por flujo de usuario, no uno por criterio, y no fusiona negativos, límites ni criterios con discrepancias o dudas abiertas | Un caso por criterio inflaba el plan, y al pedirle que agrupase mezclaba funcionalidades distintas en el mismo test. Cada esperado lleva su `[CAx]`, así que la trazabilidad no se pierde |
| 2026-11-16 | El MCP de Figma va en `.mcp.figma.json`, aparte de `.mcp.json` | Solo lo usa `design:ai`. Así el healer, el revisor y las sesiones normales de `claude` no cargan un servidor que pide autenticarse |
| 2026-11-10 | Figma se lee por el MCP oficial remoto, no por la API REST | Es lo que pide el cliente, no hace falta guardar un token en el repositorio y devuelve el contexto de diseño ya preparado para un modelo. A cambio, solo funciona en local con el login de Figma de cada persona |
| 2026-11-10 | La IA devuelve un JSON de forma fija; la validación, la cobertura y el Markdown los hace el código | El mismo principio que el triage: lo que se puede comprobar con reglas no se le pregunta a la IA, y un JSON inválido no llega a convertirse en plan |
| 2026-11-10 | Un criterio sin respaldo ni en el diseño ni en la app se convierte en duda, no en caso | Un caso inventado daría un test que comprueba algo que nadie ha definido |
| 2026-11-10 | `--generate` solo genera los casos nuevos de prioridad alta, y después de que una persona revise el plan | La IA propone y una persona decide; generar todo llenaría la suite de casos que ya existen |
| 2026-11-17 | Los escenarios de fallo y `eval:ai` excluyen los tests `@a11y` | Los escenarios y sus cifras (70 tests) se calibraron sobre la suite funcional; una página que no carga no dice nada de su accesibilidad |
| 2026-11-17 | Se corrige `CartPage.cartItems` (`[data-test="cart-item"]`, que no existe, pasa a `[data-test="inventory-item"]`) y el Lab 5 conserva el defecto en una copia del Page Object dentro del sandbox | Un locator roto en `pages/` no debe quedarse en el proyecto por ser material del curso; con la copia, el caso B del Lab 5 sigue igual y el ejercicio del módulo 02 de sustituir `.cart_item` por `cartItems` vuelve a ser posible |
| 2026-11-17 | Sin regresión visual (`toHaveScreenshot`) | Las capturas de referencia cambian con el navegador y el sistema operativo, y SauceDemo es una web de terceros: cualquier cambio suyo daría falsos fallos. Compensa en una app propia con diseño que vigilar, no en esta demo, que se centra en clasificar fallos funcionales. Las capturas del reporte de Playwright no lo sustituyen: solo se guardan cuando un test falla por otro motivo |
| 2026-11-18 | Los tokens se quitan del entorno de los agentes y el checkout del healer no persiste credenciales, en vez de solo prohibir leer `.git/` | El healer tiene `Write` y `test_run`: puede escribir y ejecutar un test que lea `.git/config` o `process.env`, así que una regla de `Read` no basta. Lo que el agente no tiene no lo puede filtrar |
| 2026-11-18 | Playwright pasa a 1.64.1 exacta (antes `^1.49.0` con 1.58.2 en el lockfile), con la imagen de CI `v1.64.1-jammy`, y no a 1.65.1 | Un `npm install` sin lockfile ya no puede subir de versión sin que nadie lo decida. La 1.65.1 tiene regresiones abiertas en Firefox, WebKit y Chromium 159 (PR #34) |
| 2026-10-26 | Un único proveedor por API compatible con la de OpenAI (`AI_*`) y Gemini como atajo, en vez de un cliente por proveedor | Gemini y OpenRouter ya hablan el mismo formato; un cliente genérico cubre ambos y los gateways de empresa sin código nuevo |
