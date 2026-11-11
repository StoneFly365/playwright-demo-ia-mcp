# Guion de demo · Diseñar desde Figma (5 minutos)

Caso de uso Leroy Merlin: **fase 1 · Diseñar** del ciclo de QA con IA, encadenada con las fases que ya existen.

## Preparación (la víspera)

1. Crear el fichero de Figma con [`specs/figma/README.md`](../specs/figma/README.md) y poner su `FILE_KEY` y sus `node-id` en [`specs/historias/HU-001.md`](../specs/historias/HU-001.md).
2. `claude` → `/mcp` → **figma** → login. Comprobar que aparece como conectado.
3. Ensayo completo: `npm run design:ai -- HU-001`. Deja escrita la instantánea real en `specs/figma/HU-001.figma.json` y un plan en `specs/disenos/`. **Confirma los dos**: son el plan B.
4. Abrir en pestañas: el Figma, la app en `/cart.html` con dos productos y el plan generado.

## En directo

| Min. | Qué se enseña | Qué se dice |
|---|---|---|
| 0:00 | La historia `HU-001.md` y los dos frames de Figma | "Esto es lo que recibe hoy un QA: una historia con 7 criterios y un diseño. El diseño de pruebas se hace a mano." |
| 0:45 | `npm run design:ai -- HU-001` | "Un agente lee la historia, lee el Figma por el MCP oficial de Figma y recorre la app real con Playwright." |
| 2:00 | `specs/disenos/HU-001.plan.md`: resumen y casos | "Cada caso apunta a un criterio y lleva los localizadores reales de la app. La cobertura no la calcula la IA, la calcula el código: 6 de 7." |
| 2:45 | Tabla de discrepancias: **D1 subtotal**, **D2 ordenación** | "Antes de escribir una línea de test, ya sabemos que el diseño pide un subtotal que la app no tiene." Es el momento *wow*. |
| 3:15 | Dudas para negocio: **CA5** | "La historia pide cambiar la cantidad, pero ni el diseño ni la app lo tienen. La IA no se inventa un caso: le pregunta a negocio." |
| 3:45 | `npm run design:ai -- HU-001 --render --generate` (o los tests ya generados) | "Una persona aprueba el plan y el generator escribe los tests sobre nuestro arquetipo, con los page objects de siempre." |
| 4:30 | Ejecutar `tests/hu-001` → falla el del subtotal → `npm run report:ai` | "El test del subtotal falla, y la IA lo clasifica como bug de producto. De aquí sale el ticket de Jira. Es el mismo circuito de siempre, pero ahora arranca en el diseño." |

## Plan B

- **Si Figma no responde:** `npm run design:ai:demo` trabaja con la instantánea guardada la víspera. Se dice: "es la misma lectura de Figma, guardada para no depender de la red".
- **Si la IA tarda o falla:** `npm run design:ai -- HU-001 --render` reescribe el plan del ensayo sin llamar a la IA.

## Mensajes para el cliente

- **De dónde salen la historia y el diseño.** En un proyecto real no se crea nada: negocio escribe la historia en Jira, UX diseña en Figma y la IA cruza lo que ya existe con la app desplegada. En la demo hay que contarlo así: "SauceDemo no tiene diseño en Figma, así que hemos dibujado uno que la copia, con dos diferencias a propósito, como las que aparecen cuando diseño y desarrollo van a ritmos distintos. Y la historia tiene un criterio que nadie ha construido. Veamos si la IA lo encuentra sola." El valor está en comparar tres fuentes que normalmente nadie compara.
- **Una persona decide.** La IA propone el plan; los tests no se generan hasta que alguien lo revisa.
- **Vuestro stack.** Playwright + TypeScript + Page Objects y el MCP oficial de Figma. No hay herramienta paralela: son agentes y scripts del propio repositorio.
- **Datos bajo control.** El agente solo puede escribir en `specs/`, y el código lo comprueba. A Figma se accede con el login de cada persona, sin tokens en el repositorio.
- **Medible.** Cobertura de criterios, discrepancias encontradas y dudas abiertas por historia, calculadas en código.
