# QA Automation &amp; AI Engineering Learning Lab
## HDI Seguros Chile

Portal de documentación del programa de formación. Todo el material es el que vive en `learning/` dentro del repositorio: **este portal no lo reescribe, solo lo hace navegable**.

---

## Qué es este programa

Un programa de formación en automatización de pruebas construido **sobre un proyecto real**: una suite E2E de 79 tests sobre SauceDemo, 6 Page Objects, tres navegadores, pipeline de GitHub Actions en contenedor Docker y análisis de fallos generado por IA.

El repositorio no es un ejemplo de juguete: se ejecuta a diario y tiene los defectos que tiene cualquier proyecto real. **Esos defectos son el material del curso.**

## Para quién

QAs con experiencia previa en testing —manual, Selenium, Cypress o cualquier otra herramienta— que no necesitan conocer Playwright, TypeScript, CI/CD, Docker ni IA de antemano. No hace falta ser desarrollador.

Detalle y justificación en [Prerrequisitos](/learning/docs/prerequisites.md).

## Cómo está organizado

| Capa | Dónde vive | Qué contiene |
|---|---|---|
| **Programa** | [`learning/docs/`](/learning/docs/learning-path.md) | Mapa de los 10 módulos, guías, rúbrica, arquitectura |
| **Módulos** | [`learning/modules/`](/learning/modules/README.md) | Teoría, anclajes al repositorio, Labs, Challenges, Assessment |
| **Alumno** | [`learning/student/`](/learning/student/README.md) | La sandbox ejecutable: el único sitio donde se escribe código |
| **Formador** | [`learning/trainer/`](/learning/docs/trainer-guide.md) | Planes de sesión minuto a minuto |
| **Diseño y piloto** | [`learning/docs/module-01-*`](/piloto.md) | Discovery, validación técnica, revisión pedagógica, piloto |

## Por dónde empezar

| Si eres… | Recorrido |
|---|---|
| **Alumno** | [Guía del alumno](/learning/docs/student-guide.md) → [Instalación](/learning/docs/setup-guide.md) → [Módulo 00](/learning/modules/00-foundations/README.md) → [Módulo 01](/modulo-01.md) |
| **Formador** | [Guía del formador](/learning/docs/trainer-guide.md) → [Sesiones 03-06](/learning/trainer/session-plans/session-03-module-01.md) → [Overview M01](/modulo-01.md) |
| **Responsable del programa** | [Mapa del programa](/mapa.md) → [Learning path](/learning/docs/learning-path.md) → [Piloto](/piloto.md) |
| **Primera visita** | [Qué es el Learning Lab](/learning/README.md) → [Mapa del programa](/mapa.md) |

## Estado actual del programa

> Este bloque describe el estado real a **18 de agosto de 2026**. No hay resultados de piloto porque el piloto no se ha ejecutado.

| Elemento | Estado |
|---|---|
| Módulo 00 — Fundamentos JS/TS para QA | ✅ Material completo |
| Módulo 01 — Playwright Fundamentals | ✅ Material completo · **operacionalmente preparado**, pendiente de piloto |
| **Piloto del Módulo 01** | ⬜ **NO ejecutado.** No hay participantes ni datos |
| [Registro de ejecución del piloto](/learning/docs/module-01-pilot-run-log.md) | ⬜ **Vacío a propósito.** Es la plantilla, no un informe |
| Riesgo **K1** (entorno / red HDI) | 🟠 **PENDIENTE** — se valida durante la formación en HDI |
| Los cinco gaps 🟡 de la revisión pedagógica | ⬜ Identificados, **ninguno implementado**: se deciden con datos del piloto |
| Duración de 12 h por alumno | Provisional: sale del diseño, no de una impartición real |
| Módulo 02 — Page Object Model &amp; Suite | ⬜ **NO iniciado** |

Todo lo anterior son **hipótesis y protocolos de medición**, no resultados. Qué se medirá y con qué umbrales: [Plan de piloto](/learning/docs/module-01-pilot-plan.md).

## Cómo se recorre esta documentación

- El **menú lateral** sigue el orden natural: programa → alumno → formador → módulos → piloto.
- La **búsqueda** (arriba a la izquierda) cubre todas las páginas publicadas.
- Los enlaces a **ficheros de código** (`pages/login.page.ts`, `tests/*.spec.ts`) abren el fichero en GitHub, no en el portal.
- Las **soluciones** de Labs y Challenges no se publican aquí: ver [Documentación canónica](/documentacion.md#qué-no-se-publica).
