# 🎬 Guion de demo · Diseñar desde Figma (5 minutos)

Caso de uso Leroy Merlin: **fase 1 · Diseñar** del ciclo de QA con IA, encadenada con las fases que ya existen.

📸 La demo trabaja con la **instantánea** del diseño ([`specs/figma/HU-001.figma.json`](../specs/figma/HU-001.figma.json)), no con el MCP de Figma: la cuenta de Figma de la demo es Starter y apenas tiene llamadas al mes. El fichero de Figma real solo se enseña en el navegador, y eso no gasta llamadas.

🤖 La skill `/demo-figma` de Claude Code conduce la demo con este guion: `/demo-figma ensayo` hace la preparación de un tirón y dice si la demo está lista; `/demo-figma` la lleva paso a paso: ejecuta cada punto, en el chat solo pone el título y espera a `sigue`. Como el chat se ve al compartir pantalla, no enseña las frases ni las notas: ten este guion abierto fuera de la pantalla compartida. Si cambias el guion, la skill lo sigue sin tocarla.

## 🧰 Preparación (la víspera)

1. 🔑 Comprobar que [`specs/historias/HU-001.md`](../specs/historias/HU-001.md) sigue con `FILE_KEY`. Así el script usa siempre la instantánea, y los tests de `scripts/design-ai.test.mjs` lo esperan.
2. 🔁 Ensayo: `npm run design:ai:demo`. No llama a la IA: reproduce la propuesta grabada [`specs/disenos/grabacion/HU-001.design.json`](../specs/disenos/grabacion/HU-001.design.json), salida real de `qa-test-designer`, y escribe el plan en segundos. Sale **siempre el mismo plan**, así que la demo se puede repetir cuantas veces haga falta. Después, `git checkout -- specs/disenos` para volver al plan revisado.
   - 🎲 Para regrabar con la IA de verdad: `npm run design:ai -- HU-001 --snapshot` (varios minutos y cada ejecución sale distinta), copia `specs/disenos/HU-001.design.json` a `specs/disenos/grabacion/` y revisa este guion, porque cita discrepancias y dudas por su id.
3. 🧪 Ejecuta los tests de `tests/hu-001` con `npx playwright test tests/hu-001 --project=chromium` y comprueba que solo falla el del subtotal. Están confirmados en git; no hace falta volver a generarlos.
4. 📝 El informe del punto 8 también está grabado ([`specs/disenos/grabacion/report-ai/`](../specs/disenos/grabacion/report-ai/)): `npm run report:ai:demo` lo copia a `playwright-report/`. La fecha que muestra es la de la grabación.
   - 🎲 Para regrabarlo: ejecuta los tests, `npm run report:ai` (necesita la sesión de Claude: `claude auth login`) y copia los cuatro `playwright-report/ai-*` a esa carpeta. Hazlo siempre que cambien los tests de `tests/hu-001`.
5. 🗂️ Abrir en pestañas: los dos frames de Figma (enlaces en [`specs/figma/README.md`](../specs/figma/README.md)) y la app en `/cart.html` con dos productos. En VS Code, el repositorio en esta rama con `specs/disenos` limpio (`git status` sin cambios ahí).

> ⚠️ Todo se enseña en local. El punto 2 escribe la propuesta de la IA en `specs/disenos/HU-001.plan.md`, encima del plan revisado. El revisado no se pierde: es la versión confirmada en git, y en el punto 6 se compara con la propuesta en el panel **Source Control** de VS Code.

## 🎤 En directo

Unos 5 minutos en total. Cada punto dice qué enseñar y qué decir.

### 1. 📖 Lo que recibe un QA

- **Enseña:** la historia `HU-001.md` y los dos frames de Figma.
- **Di:** "Esto es lo que recibe hoy un QA: una historia con 7 criterios y un diseño. El diseño de pruebas se hace a mano."

### 2. 🚀 La IA diseña las pruebas

- **Enseña:** lanza `npm run design:ai:demo`. Termina en segundos con la propuesta grabada.
- **Di:** "Un agente lee la historia, lee el diseño y recorre la app real con Playwright. En vivo tarda unos minutos, así que para la demo hemos grabado una ejecución real y la reproducimos."

### 3. 📋 El plan que propone

- **Enseña:** `specs/disenos/HU-001.plan.md` recién escrito: el resumen (6 de 7 criterios, 11 casos, 2 nuevos, 4 discrepancias, 1 duda) y los casos.
- **Di:** "Esto es lo que propone la IA. Cada caso apunta a un criterio y lleva los localizadores reales de la app. La cobertura no la calcula la IA, la calcula el código: 6 de 7."

### 4. 🔍 Discrepancias entre diseño y app ✨

Es el momento *wow*.

- **Enseña:** la tabla de discrepancias, las cuatro:
  - **D1** ordenación por defecto
  - **D2** subtotal (impacto alto)
  - **D3** cantidad no editable (se comenta en el punto 5)
  - **D4** menú lateral con «Dynamic Catalog»
- **Di:** "Antes de escribir una línea de test, ya sabemos que el diseño pide un subtotal que la app no tiene, que el diseño ordena por precio y la app por nombre, y que la app tiene una entrada de menú, «Dynamic Catalog», que el diseño ni dibuja."
- 💬 **Si preguntan si está preparado:** "La ordenación y el subtotal los metimos a propósito al dibujar el Figma, para ver si la IA los cazaba. El menú no lo preparamos: el diseño no lo dibuja y la IA ha visto sola, recorriendo la app, que tiene una entrada que el diseño no recoge."

### 5. ❓ Dudas para negocio

- **Enseña:** la duda **CA5**.
- **Di:** "La historia pide cambiar la cantidad, pero ni el diseño ni la app lo tienen. La IA no se inventa un caso: le pregunta a negocio."
- 💬 La IA también lo ha apuntado como discrepancia D3; en el punto 6 se ve que sobra.

### 6. 👤 Una persona revisa

- **Enseña:** VS Code › **Source Control** › `specs/disenos/HU-001.plan.md`. A la izquierda, el plan revisado (confirmado en git); a la derecha, la propuesta de la IA. Señala:
  - Tres casos que la propuesta da por «ya cubiertos» (TC-05, TC-08 y TC-09) y el revisado añade como nuevos (TC-04, TC-06 y TC-07): mostrar nombre, precio y cantidad; quitar un producto desde el carrito, y quitar el último producto.
  - El revisado quita la discrepancia de cantidad.
  - El revisado añade la duda **CA4** sobre el subtotal.
- **Di:** "La IA ha dado por cubiertos tres casos que los tests existentes solo cubren a medias, ha contado la cantidad como discrepancia cuando ya es la duda CA5 y no ha preguntado a negocio por el subtotal. Eso es lo que corregimos al revisar: añadimos la duda CA4, si el subtotal sigue siendo un requisito. La IA propone y una persona revisa antes de generar nada."
- 💬 La duda CA4 vuelve a salir en el punto 8.

### 7. 🧪 Los tests generados

- **Enseña:** los tests de `tests/hu-001/`.
- **Di:** "Con el plan revisado, el generator escribe los tests de los casos nuevos de prioridad alta sobre nuestro arquetipo, con los page objects de siempre."
- 💬 **Si preguntan:** el plan revisado tiene 5 casos nuevos y hay 4 tests porque TC-11 es de prioridad baja y se queda en el plan.

### 8. 🔴 Falla el subtotal 🎯

- **Enseña:**
  1. Ejecuta `npx playwright test tests/hu-001 --project=chromium`: falla el test del subtotal.
  2. Ctrl+C para cerrar el informe HTML, que deja la terminal ocupada.
  3. `npm run report:ai:demo` y abre `playwright-report/ai-summary.txt`. No llama a la IA: copia el análisis grabado de una ejecución real de este mismo fallo, así que el texto sale siempre igual.
- **Di:** "El test del subtotal falla. La IA de informes no conoce el diseño: lo marca como test desactualizado y pide confirmar con negocio si el subtotal es un requisito. Es la misma pregunta que añadimos al revisar el plan, la duda CA4, antes de que fallase nada, y la discrepancia D2 ya decía que el diseño pide un subtotal que la app no tiene. Una persona cruza las dos cosas, decide que es un bug de producto y abre el ticket. Es el mismo circuito de siempre, pero ahora arranca en el diseño."

## 🛟 Plan B

- 🎙️ **Si preguntan si la IA es de verdad:** "La propuesta y el informe son ejecuciones reales de la IA, grabadas. La reproducimos para que la demo salga igual cada vez; en vivo tarda minutos y cada ejecución cambia algo, por eso una persona revisa siempre el plan."
- ♻️ **Si el diff del punto 6 sale vacío o raro:** `specs/disenos` no estaba limpio antes del punto 2. `git checkout -- specs/disenos` y `npm run design:ai:demo` otra vez.
- 🎨 **Si preguntan por qué no se lee Figma en directo:** "La lectura por el MCP oficial de Figma está preparada. Para la demo trabajamos con una descripción del diseño guardada en el repositorio, para no depender de la red ni del cupo de la cuenta."

## 🎥 Si la demo se graba

- ♻️ `design:ai:demo` sobrescribe el plan y el JSON locales, pero siempre con lo mismo: repite tomas sin miedo. No hagas commit de lo que deje una toma; `git checkout -- specs/disenos` lo deja como estaba.
- 🗂️ En la reunión, ten abierto este guion para las preguntas (Plan B y mensajes para el cliente).

## 🧹 Después

`git checkout -- specs/disenos` para dejar la rama como estaba.

## 💼 Mensajes para el cliente

- 🧩 **De dónde salen la historia y el diseño.** En un proyecto real no se crea nada: negocio escribe la historia en Jira, UX diseña en Figma y la IA cruza lo que ya existe con la app desplegada. En la demo hay que contarlo así: "SauceDemo no tiene diseño en Figma, así que hemos dibujado uno que la copia, con dos diferencias a propósito, como las que aparecen cuando diseño y desarrollo van a ritmos distintos. Y la historia tiene un criterio que nadie ha construido. Veamos si la IA lo encuentra sola." El valor está en comparar tres fuentes que normalmente nadie compara.
- 👤 **Una persona decide.** La IA propone el plan; los tests no se generan hasta que alguien lo revisa.
- 🛠️ **Vuestro stack.** Playwright + TypeScript + Page Objects y el MCP oficial de Figma. No hay herramienta paralela: son agentes y scripts del propio repositorio.
- 🔒 **Datos bajo control.** El agente que diseña solo puede escribir en `specs/`, y el código lo comprueba; el que genera escribe los tests en `tests/<historia>/` para que se revisen. A Figma se accede con el login de cada persona, sin tokens en el repositorio.
- 📊 **Medible.** Cobertura de criterios, discrepancias encontradas y dudas abiertas por historia, calculadas en código.
