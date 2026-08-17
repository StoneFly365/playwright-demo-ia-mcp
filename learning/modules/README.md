# Módulos

Índice de los 10 módulos del programa. El mapa completo —objetivos, contenidos, duración, dependencias y anclajes en el repositorio— está en [`../docs/learning-path.md`](../docs/learning-path.md).

| # | Módulo | Nivel | Duración | Depende de | Estado |
|---|---|---|---|---|---|
| 00 | [Fundamentos JS/TS para QA](00-foundations/) | 1 FOLLOW → 5 TROUBLESHOOT | 5 h + 3 h | — | ✅ **Completo** |
| 01 | Playwright Fundamentals — [diseño](../docs/module-01-discovery-design.md) · [validación técnica](../docs/module-01-technical-validation.md) | 2 MODIFY | 7 h + 4 h + 1 h | 00 | 🔬 **Diseño validado** — pendiente construir |
| 02 | Page Object Model & Suite | 3 CREATE | 3 h + 2 h | 01 | ⬜ Pendiente |
| 03 | Arquitectura: fixtures, auth y datos | 4 DESIGN | 6 h + 3 h | 02 | ⬜ Pendiente |
| 04 | Debugging & Failure Analysis | 5 TROUBLESHOOT | 3 h + 2 h | 03 | ⬜ Pendiente |
| 05 | Más allá de la UI (API & Mocking) | 3 CREATE | 3 h + 2 h | 03 | ⬜ Pendiente |
| 06 | CI/CD & Docker | 6 OPTIMIZE | 3 h + 2 h | 04 | ⬜ Pendiente |
| 07 | Quality Engineering & Test Strategy | 4 DESIGN | 3 h + 2 h | 06 | ⬜ Pendiente |
| 08 | AI-Augmented QA | 6 OPTIMIZE | 3 h + 2 h | 04, 06 | ⬜ Pendiente |
| 09 | HDI Capstone | 7 ARCHITECT | 6 h + 10 h | todos | ⬜ Pendiente |

## Estructura común de un módulo

```
NN-nombre/
├── README.md                 Entrada: objetivo, contenido, puesta en marcha, trazabilidad
├── learning-objectives.md    Objetivos evaluables y su instrumento de evaluación
├── theory.md                 El 20% teórico, anclado en ficheros reales
├── repository-mapping.md     Concepto → fichero:línea → qué observar → qué aprender
├── labs/                     Ejercicios guiados, con nivel declarado
├── challenges/               Ejercicios sin pasos
└── assessment/               Evaluación del módulo
```

Las soluciones correspondientes viven en [`../solutions/NN-nombre/`](../solutions/) y el código ejecutable del alumno en [`../student/sandbox/NN-nombre/`](../student/sandbox/).

## Por qué los módulos se desarrollan de uno en uno

Cada módulo se construye, se valida y se revisa antes de empezar el siguiente. Un temario completo escrito de golpe envejece antes de impartirse y no incorpora lo aprendido en las primeras sesiones.

Prioridad de desarrollo si el calendario aprieta (Fase 1, paso 2):

```
00 → 01 → 02 → 03 → 04 → 06 → 08 → 07 → 05 → 09
```

Los módulos 03, 04 y 08 aportan el mayor valor diferencial; el 05 es el más caro de producir (no hay material previo en el repositorio) y es el primero que se sacrifica.
