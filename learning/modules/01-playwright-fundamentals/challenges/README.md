# Módulo 01 — Challenges

Los Labs te dicen los pasos. Los Challenges no.

Un Challenge te da un **escenario de negocio**, unas restricciones y unos criterios de aceptación. Cuántos tests escribes, cómo los repartes, qué locators usas y qué verificas en cada uno es decisión tuya — y esa decisión hay que **justificarla por escrito**.

| Challenge | Nivel | Prerrequisito | Tiempo |
|---|---|---|---|
| [Challenge 1 — Compra completa con validación de importes](challenge-1-compra-completa.md) | **3 CREATE + 4 DESIGN** | Labs 1-5 completos | 75 min |

## Cómo se corrige

| Criterio | Peso |
|---|---|
| Cumple los criterios de aceptación (tests propios en verde en los tres navegadores) | 35% |
| Calidad de la elección de locators y de su justificación | 25% |
| Calidad de las aserciones y de sus mensajes | 20% |
| Justificación escrita de las decisiones, incluido **qué no has automatizado** | 20% |

Un Challenge que funciona pero no está justificado no llega al aprobado. Un Challenge justificado con un fallo menor, sí.

**La diferencia con el módulo 00:** allí el 40% era "los tests pasan". Aquí, cualquiera puede dejar en verde un flujo de compra copiando de `tests/checkout.spec.ts`. Lo que se evalúa es **el criterio con el que decides qué verificar y cómo localizarlo**.
