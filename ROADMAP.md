# Roadmap · De suite de ejemplo a QA que se diagnostica sola

**Inicio:** 2026-10-21
**Estado:** Fases 0, 1, 2 y 3 hechas · Fase 4 pendiente

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
| 3 | Medir el acierto de la IA | 1 día | ✅ |
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
