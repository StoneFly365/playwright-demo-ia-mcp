# 🎬 Guion de demo · Diseñar desde Figma (5 minutos)

Caso de uso Leroy Merlin: **fase 1 · Diseñar** del ciclo de QA con IA, encadenada con las fases que ya existen.

📸 La demo trabaja con la **instantánea** del diseño ([`specs/figma/HU-001.figma.json`](../specs/figma/HU-001.figma.json)), no con el MCP de Figma: la cuenta de Figma de la demo es Starter y apenas tiene llamadas al mes. El fichero de Figma real solo se enseña en el navegador, y eso no gasta llamadas.

## 🧰 Preparación (la víspera)

1. 🔑 Comprobar que [`specs/historias/HU-001.md`](../specs/historias/HU-001.md) sigue con `FILE_KEY`. Así el script usa siempre la instantánea, y los tests de `scripts/design-ai.test.mjs` lo esperan.
2. 🔁 Ensayo completo: `npm run design:ai:demo`. Tarda varios minutos. Revisa el plan de `specs/disenos/`, corrige el JSON si hace falta, regenera el plan con `npm run design:ai -- HU-001 --render` y **confírmalo**: es lo que se enseña en directo.
3. 🧪 Genera los tests: `npm run design:ai -- HU-001 --render --generate`. Ejecútalos con `npx playwright test tests/hu-001 --project=chromium` y comprueba que solo falla el del subtotal.
4. 🔐 Si la demo es en otro día, comprueba que la sesión de Claude no ha caducado (`claude auth login`).
5. 🗂️ Abrir en pestañas: los dos frames de Figma (enlaces en [`specs/figma/README.md`](../specs/figma/README.md)), la app en `/cart.html` con dos productos y el plan revisado **en GitHub, en esta rama** (`specs/disenos/HU-001.plan.md`).

> ⚠️ El plan revisado se enseña siempre desde GitHub: la ejecución del minuto 0:45 escribe en `specs/disenos/` y sobrescribe el fichero local en cuanto termina. Ese fichero local solo se enseña en el 3:15, como lo que propone la IA sin revisar.

## 🎤 En directo

| Min. | Qué se enseña | Qué se dice |
|---|---|---|
| 📖 0:00 | La historia `HU-001.md` y los dos frames de Figma | "Esto es lo que recibe hoy un QA: una historia con 7 criterios y un diseño. El diseño de pruebas se hace a mano." |
| 🚀 0:45 | Lanzar `npm run design:ai:demo` y dejarlo corriendo | "Un agente lee la historia, lee el diseño y recorre la app real con Playwright. Tarda unos minutos; mientras, os enseño el resultado de ayer." |
| 📋 1:15 | El plan revisado en GitHub: resumen y casos | "Cada caso apunta a un criterio y lleva los localizadores reales de la app. La cobertura no la calcula la IA, la calcula el código: 6 de 7." |
| 🔍 2:15 | Tabla de discrepancias: **D1 subtotal**, **D2 ordenación** | "Antes de escribir una línea de test, ya sabemos que el diseño pide un subtotal que la app no tiene." ✨ Es el momento *wow*. |
| ❓ 2:45 | Dudas para negocio: **CA5** | "La historia pide cambiar la cantidad, pero ni el diseño ni la app lo tienen. La IA no se inventa un caso: le pregunta a negocio." |
| 👤 3:15 | Lado a lado: el plan que acaba de escribir la ejecución del 0:45 (fichero local) y el revisado en GitHub. Señala TC-04, TC-06 y TC-07 («ya cubierto» en local, nuevos en GitHub) y la discrepancia de cantidad, que en el revisado ya no está | "La IA ha vuelto a dar por cubiertos tres casos que los tests existentes solo cubren a medias, y ha vuelto a contar la cantidad como discrepancia cuando ya es la duda CA5. Es justo lo que corregimos en la revisión: la IA propone y una persona revisa antes de generar nada." 💬 Si la toma sale distinta, compara lo que haya salido: en los ensayos ha repetido estos mismos fallos. |
| 🧪 3:45 | Los tests generados en `tests/hu-001/` | "Con el plan aprobado, el generator escribe los tests de los casos nuevos de prioridad alta sobre nuestro arquetipo, con los page objects de siempre." 💬 Si preguntan: el plan tiene 5 casos nuevos y hay 4 tests porque TC-11 es de prioridad baja y se queda en el plan. |
| 🔴 4:30 | Ejecutar `tests/hu-001` → falla el del subtotal → `npm run report:ai` → `playwright-report/ai-summary.txt` | "El test del subtotal falla. La IA de informes no conoce el diseño: lo marca como test desactualizado y pide confirmar con negocio si el subtotal es un requisito. Es la misma pregunta que el plan ya hizo en la duda CA4, antes de que fallase nada, y la discrepancia D1 ya decía que el diseño pide un subtotal que la app no tiene. Una persona cruza las dos cosas, decide que es un bug de producto y abre el ticket. Es el mismo circuito de siempre, pero ahora arranca en el diseño." 🎯 |

## 🛟 Plan B

- ⏳ **Si la IA tarda o falla:** no hace falta esperarla; el plan que se enseña es el revisado, en GitHub.
- ♻️ **Si el plan local ha cambiado** (por la ejecución en directo o por un ensayo): `git checkout -- specs/disenos` recupera el plan revisado. `--render` no basta, porque vuelve a escribir el plan desde el JSON y la ejecución también lo ha sobrescrito.
- 🎨 **Si preguntan por qué no se lee Figma en directo:** "La lectura por el MCP oficial de Figma está preparada. Para la demo trabajamos con una descripción del diseño guardada en el repositorio, para no depender de la red ni del cupo de la cuenta."

## 🎥 Si la demo se graba

- ♻️ Cada ejecución de `design:ai` sobrescribe el plan y el JSON locales. Si una toma sale bien, copia `specs/disenos/` fuera del repositorio antes de repetir. No hagas commit de lo que deje una toma.
- ✂️ La espera del minuto 0:45 se recorta en el montaje: `design:ai:demo` tarda varios minutos, mientras que `report:ai` tarda menos de un minuto.
- 🗂️ En la reunión, ten abiertos el plan revisado en GitHub y este guion para las preguntas (Plan B y mensajes para el cliente).

## 🧹 Después

`git checkout -- specs/disenos` para dejar la rama como estaba.

## 💼 Mensajes para el cliente

- 🧩 **De dónde salen la historia y el diseño.** En un proyecto real no se crea nada: negocio escribe la historia en Jira, UX diseña en Figma y la IA cruza lo que ya existe con la app desplegada. En la demo hay que contarlo así: "SauceDemo no tiene diseño en Figma, así que hemos dibujado uno que la copia, con dos diferencias a propósito, como las que aparecen cuando diseño y desarrollo van a ritmos distintos. Y la historia tiene un criterio que nadie ha construido. Veamos si la IA lo encuentra sola." El valor está en comparar tres fuentes que normalmente nadie compara.
- 👤 **Una persona decide.** La IA propone el plan; los tests no se generan hasta que alguien lo revisa.
- 🛠️ **Vuestro stack.** Playwright + TypeScript + Page Objects y el MCP oficial de Figma. No hay herramienta paralela: son agentes y scripts del propio repositorio.
- 🔒 **Datos bajo control.** El agente que diseña solo puede escribir en `specs/`, y el código lo comprueba; el que genera escribe los tests en `tests/<historia>/` para que se revisen. A Figma se accede con el login de cada persona, sin tokens en el repositorio.
- 📊 **Medible.** Cobertura de criterios, discrepancias encontradas y dudas abiertas por historia, calculadas en código.
