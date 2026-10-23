# Roadmap · De suite de ejemplo a QA que se diagnostica sola

**Inicio:** 2026-10-21
**Estado:** Fases 0 a 3 y cuota de IA en CI hechas · Fase 4 en curso · Última actualización: 2026-10-22

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
| 3b | Cuota de IA en CI (fuera del plan inicial) | 0,5 días | 🟨 falta OpenRouter |
| 4 | Cerrar el circuito | 3-5 días | 🟨 en local; falta la prueba de punta a punta |
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
- [ ] Medir el tiempo de triage con IA frente a hacerlo a mano en un escenario (dato para el cliente). Medido el lado IA: entre 19 y 57 s por escenario. Falta cronometrar a una persona haciendo el mismo triage.

**Terminada cuando:** exista una cifra del tipo "la IA clasifica bien X de Y fallos" que se pueda enseñar.

**Resultado (Claude Haiku 5.5, en local):** 11 de 11 grupos, que cubren 185 de 185 tests fallados. Ojo al presentarlo: son 5 escenarios diseñados por nosotros y una sola ejecución. Conviene contarlo como "11 de 11 en escenarios controlados" y no como "100 % de acierto".

## Fase 3b · Cuota de IA en CI

No estaba en el plan. La primera evaluación con Gemini en CI salió entera `sin_clasificar`: la capa gratuita permite 20 peticiones al día y ese día ya se habían gastado. Al revisar el consumo se vio además que las CI en verde también gastaban cuota cuando aparecía un test flaky.

- [x] Un solo reporte IA por ejecución de CI: los tres navegadores suben su `test-results.json` y `scripts/merge-results.mjs` los une. Un `suite=fail` pasa de 12 llamadas a 4 como mucho. PR #6.
- [x] Los navegadores en paralelo (fuera `max-parallel: 1`): la CI pasa de unos 4 min 40 s a 2 min 30 s.
- [x] En push y PR no se llama a la IA si solo hay tests flaky (`AI_SKIP_FLAKY_ONLY`).
- [x] La evaluación solo llama a la clasificación (`AI_CLASSIFY_ONLY`) y no cuenta como fallo lo que la IA no llegó a clasificar.
- [x] Permisos del workflow: `contents: read` y checkout sin credenciales persistidas.
- [ ] Proveedor configurable (URL, modelo y clave) y **OpenRouter** con un modelo gratuito en CI (50 peticiones al día sin créditos). Pendiente de que exista el secreto `OPENROUTER_API_KEY`. Elegir el modelo con `npm run eval:ai`.
- [ ] Probar en CI el camino con fallos reales (`suite=fail`) con el job único de reporte. Solo se ha probado en verde.

**Descartado:** Claude por API en CI. Funcionaría con el mismo modelo que en local y costaría menos de 1 $ al mes, pero la clave del repositorio es del plan personal y no se quiere ningún coste adicional.

## Dashboard QA Intelligence (fuera del plan inicial)

Página local de solo lectura para enseñar en la demo el paso de los tests a los grupos, la clasificación, la evidencia, la acción y el acierto de la IA, sin gastar cuota. Detalle en la sección del README.

- [x] `npm run dashboard` (`scripts/dashboard.mjs`) genera `playwright-report/qa-dashboard.html` a partir de los artefactos que ya existen. No llama a la IA, no ejecuta tests y la página bloquea cualquier conexión de red (CSP).
- [x] `report:ai` guarda en `ai-failures-grouped.json` `run_start_time`, `provider` y `ai_requests`, sin enviarlos en los prompts. `eval:ai` escribe también `ai-eval.json`. Son campos y ficheros nuevos; los que ya había no cambian.
- [x] Historial local en `qa-history/` con `--save` (una copia por ejecución, nunca se sobrescribe) y modo demo con `learning/ruta-qa/ejemplos/`, que no se mezcla con el historial.
- [x] En CI, los jobs de reporte y de evaluación generan el dashboard dentro de sus artefactos. Sin permisos nuevos ni GitHub Pages.
- [x] Rediseño visual para la demo: tema oscuro con colores fijos por función y por categoría, cabecera con el estado de la ejecución, tarjetas con icono, gráficos (resultados, categorías, origen de la clasificación, historial y acierto) y detalle de grupo en dos columnas. Solo cambia `scripts/dashboard.html`; la lógica y los datos son los mismos.
- [x] README: ciclo completo para alimentar el historial en bash y PowerShell (`npm test; npm run report:ai; npm run dashboard -- --save`).
- [ ] Caché de clasificaciones: descartada por ahora (ver README). Si se retoma, en una rama propia.
- [ ] Acciones ejecutadas: el dashboard solo puede mostrarlas cuando la fase 4 deje constancia de ellas en un artefacto.

## Fase 4 · Cerrar el circuito

| Tipo | Acción automática |
|---|---|
| `test_roto` | Lanzar el healer solo sobre ese grupo y abrir una PR. Nunca se fusiona sola. |
| `bug_producto` | Crear un ticket en Jira con traza y vídeo adjuntos. **El healer no toca estos tests.** |
| `flaky` / `entorno` | Aviso en el resumen de la ejecución, sin acción automática. |

- [x] Ejecutar el healer sin intervención (`npm run heal:ai`: `claude -p` con el agente `playwright-test-healer`) solo sobre los grupos `test_roto`. En local, con la suscripción.
- [ ] El mismo healer en CI. Necesita un token de Claude en los secretos (`CLAUDE_CODE_OAUTH_TOKEN` o una API key) y permisos de escritura en el workflow.
- [x] Abrir la PR en borrador con `gh pr create`, con el diagnóstico y el resumen del healer en la descripción.
- [x] Tickets de Jira por API REST para los grupos `bug_producto` (`npm run jira:tickets`), con traza y vídeo adjuntos. Sin credenciales es modo simulado y deja las peticiones en `ai-jira.json`; en CI va en cada reporte.
- [x] Modo real de Jira probado contra el sandbox (proyecto `THP`, tipo `Tarea`, credenciales en `.env`): el escenario `bug` crea THP-1 y THP-2 con sus 6 y 2 adjuntos.
- [x] Destino de los tickets: el sandbox de Jira, proyecto `THP`. Sin credenciales, modo simulado. El conector Atlassian no sirve en CI.
- [ ] Secretos `JIRA_*` en GitHub para crear tickets desde CI (sin adjuntos, porque la evidencia se queda en los jobs de cada navegador).
- [x] Prueba de punta a punta en local (chromium, 23 de octubre): `cascade` acaba en PR y `bug` en ticket simulado. Resultado abajo.
- [x] Prioridad de Jira según la severidad (`bloqueante` → la más urgente del proyecto; en THP, `alta` → Crítica y `media` → Importante), para que el color se vea en el tablero.
- [x] Revisión adversarial de Playwright (`npm run review:pw`, agente `playwright-adversarial-reviewer`): un segundo agente intenta tumbar el arreglo antes de abrir la PR, y su veredicto va en la descripción. Si no lo aprueba, la PR lleva `needs-human`.
- [x] Lint de Playwright sin IA en CI (`eslint-plugin-playwright`), con trinquete: falla si aparece un aviso más de los 17 actuales.
- [x] **Protección independiente de la clasificación** (`scripts/guard-asserts.mjs`, job *Guard de asserts* en las PR de ramas `heal/*`. **Detecta**, pero todavía no bloquea: para bloquear el merge hay que marcarlo como check obligatorio en GitHub): un check sobre el diff de cualquier PR automática que la marque como `needs-human` y bloquee su merge si relaja una aserción: borra un `expect`, cambia un valor esperado, añade `.not`, `test.skip` o `test.fixme`, o sube un timeout. Si la IA clasificara un bug real como `test_roto`, el healer podría "arreglar" el test y ocultar el bug; este check lo impide aunque la clasificación falle. Es un argumento de venta.

**Terminada cuando:** al ejecutar `cascade` aparezca una PR con la corrección, y al ejecutar `bug` aparezca un ticket.

**Resultado (chromium, Claude Haiku 5.5 para el triage y el healer con Sonnet, en local):**

| Escenario | Triage | Acción |
|---|---|---|
| `cascade` | 1 grupo `test_roto` (70 tests), confianza alta | Primera prueba (PR #11, cerrada): el healer cambió solo el page object y pasaban 68 de 70, porque `route-protection.spec.ts` usa el selector directamente. Con el prompt mejorado, PR #12 en borrador y sin `needs-human`: cambia las 5 apariciones a `getByRole('button', { name: 'Login' })` (page object, `menu.spec.ts` y `route-protection.spec.ts`) y pasan 70 de 70 con el escenario y 70 de 70 sin él |
| `bug` | 2 grupos `bug_producto` (34 + 1), confianza alta | Tickets THP-1 y THP-2 en el sandbox de Jira, con 6 y 2 adjuntos (traza y vídeo) de la misma ejecución. El healer no los toca: "No hay grupos test_roto" |

El prompt del healer lleva ahora la huella del grupo y pide corregir todas las apariciones del locator y ejecutar todos los ficheros afectados. Las PR #11 y #12 son de prueba: no se fusionan, porque el escenario `cascade` es simulado. Falta ver el job *Guard de asserts* en una PR `heal/*` contra `main`: estas van contra la rama de la fase y la CI solo corre en las PR a `main`.

## Fase 5 · Argumentos para cliente enterprise

- [x] Sección en el README: **qué datos salen y hacia dónde** (destino por destino, con la lista de campos permitidos y el redactor de la fase 2 como prueba, y lo que hay que decidir con cada cliente).
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
- Jira real: volver a lanzar `jira:tickets` sobre el mismo informe crea tickets duplicados, y la traza y el vídeo adjuntos no pasan por el redactor (pueden llevar datos de la sesión). En un proyecto de cliente, revisar qué contienen antes de activar las variables `JIRA_*`.
- `learning/` cita ficheros y líneas reales de `tests/` y `pages/`. Cualquier cambio que desplace líneas obliga a revisar esas referencias.
- La capa gratuita de Gemini permite 20 peticiones al día y 5 por minuto. Desde la PR de la cuota, una ejecución de CI con fallos gasta 4 como mucho y una en verde ninguna, aunque tenga flaky. Los escenarios en CI deben ir en serie, y un día con varias ejecuciones de `suite=fail` o `suite=eval` agota la cuota: el 21 de octubre la primera evaluación en CI salió entera `sin_clasificar` por eso. Para usarlo con un cliente hace falta una clave de pago o un proveedor con más cuota.
- El healer automático puede proponer correcciones incorrectas: la PR siempre la revisa una persona.
- Los tests nuevos que escriba el agente generator importan de `@playwright/test`. Para que les afecten los escenarios, hay que cambiar ese import por `../fixtures/scenarios`.

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
| 2026-10-23 | Antes de crear, `jira:tickets` lee los campos obligatorios del proyecto y pone el informador si hace falta | En el sandbox (`THP`) el informador es obligatorio por API y el primer modo real habría devuelto 400 |
| 2026-10-22 | El check de asserts compara matcher y argumentos, no el sujeto, y solo se aplica a las ramas `heal/*` | Cambiar un selector es lo que debe hacer el healer; cambiar un valor esperado, no sin una persona. Las PR humanas pueden cambiar expectativas legítimamente |
