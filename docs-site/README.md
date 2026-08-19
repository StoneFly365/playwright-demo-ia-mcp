# QA Automation &amp; AI Engineering Learning Lab

---

# 🎯 Empieza por aquí: Ruta QA — 6 horas

**Tienes unas seis horas. Si sigues esta ruta, al terminar sabes usar IA de forma práctica en tu trabajo de QA.**

Ocho módulos, todos con ejercicio guiado y una actividad para aplicar lo aprendido a tu proyecto real el mismo día.

| # | Módulo | Tiempo |
|---|---|---|
| 0 | [Introducción](/learning/ruta-qa/00-introduccion.md) | 10 min |
| 1 | [IA aplicada a QA](/learning/ruta-qa/01-ia-para-qa.md) | 35 min |
| 2 | [Prompting para QA](/learning/ruta-qa/02-prompting.md) | 30 min |
| 3 | [Generación de casos de prueba](/learning/ruta-qa/03-generacion-tests.md) | 45 min |
| 4 | [Playwright + IA](/learning/ruta-qa/04-playwright-ia.md) | 90 min |
| 5 | [MCP para QA](/learning/ruta-qa/05-mcp-para-qa.md) | 45 min |
| 6 | [Debugging con IA](/learning/ruta-qa/06-debugging-ia.md) | 45 min |
| 7 | [🏆 Reto final](/learning/ruta-qa/07-reto-final.md) | 60 min |
| | **Total** | **6 h 00** |

→ **[Entrar en la Ruta QA](/learning/ruta-qa/README.md)**

> **No hace falta leerse el resto del portal.** Todo lo demás es material de consulta: está aquí para cuando quieras profundizar en algo concreto, no antes de empezar.

### 🛠️ Antes del día de formación

Montar el entorno **no cuenta dentro de las 6 horas**: son 20-40 min de descargas que se hacen otro día.

→ [Pre-work técnico](/learning/ruta-qa/pre-work.md) · y una orden que te dice si estás listo:

```bash
npm run ruta-qa:check
```

---

## Sobre qué se practica

Sobre un proyecto real, no sobre ejemplos de juguete: una suite E2E de 79 tests sobre [SauceDemo](https://www.saucedemo.com), 6 Page Objects, tres navegadores, pipeline de GitHub Actions en contenedor Docker y análisis de fallos generado por IA que se ejecuta en cada pipeline.

El repositorio se ejecuta a diario y tiene los defectos que tiene cualquier proyecto real —incluidos **diez tests que fallan a propósito**. **Esos defectos son el material del curso.**

## Para quién

QAs con experiencia previa en testing —manual, Selenium, Cypress o cualquier otra herramienta— que no necesitan conocer Playwright, TypeScript, MCP ni IA de antemano. No hace falta ser desarrollador.

Detalle y justificación en [Prerrequisitos](/learning/docs/prerequisites.md).

---

## 📚 Profundiza

La Ruta QA es un recorrido curado. Debajo hay un programa completo del que sale su contenido, disponible para quien quiera ir más lejos en un tema concreto.

| Si quieres… | Ve a | Duración |
|---|---|---|
| Playwright en serio: locators medidos, auto-waiting, arquitectura de suite | [Módulo 01 — Playwright Fundamentals](/learning/modules/01-playwright-fundamentals/README.md) | 12 h |
| Leer y escribir el código de `pages/` con soltura | [Módulo 00 — Fundamentos JS/TS](/learning/modules/00-foundations/README.md) | 8,75 h |
| El programa completo de 10 módulos | [Learning path](/learning/docs/learning-path.md) | 38 h |
| Cómo está organizado todo esto | [Qué es el Learning Lab](/learning/README.md) · [Documentación canónica](/documentacion.md) | — |

## Cómo está organizado

| Capa | Dónde vive | Qué contiene |
|---|---|---|
| **Ruta QA** | [`learning/ruta-qa/`](/learning/ruta-qa/README.md) | El recorrido corto de 6 h. **El camino recomendado** |
| **Módulos** | [`learning/modules/`](/learning/modules/README.md) | Teoría, anclajes al repositorio, Labs, Challenges, Assessment |
| **Programa** | [`learning/docs/`](/learning/docs/learning-path.md) | Mapa de los 10 módulos, guías, rúbrica, arquitectura |
| **Alumno** | [`learning/student/`](/learning/student/README.md) | La sandbox ejecutable: el único sitio donde se escribe código |
| **Formador** | [`learning/trainer/`](/learning/docs/trainer-guide.md) | Planes de sesión minuto a minuto |
| **Diseño y piloto** | [`learning/docs/module-01-*`](/piloto.md) | Discovery, validación técnica, revisión pedagógica, piloto |

## Otros recorridos

| Si eres… | Empieza por |
|---|---|
| **Alumno de la formación completa** | [Guía del alumno](/learning/docs/student-guide.md) → [Instalación](/learning/docs/setup-guide.md) → [Módulo 00](/learning/modules/00-foundations/README.md) |
| **Formador** | [Guía del formador](/learning/docs/trainer-guide.md) → [Sesiones 03-06](/learning/trainer/session-plans/session-03-module-01.md) |
| **Responsable del programa** | [Mapa del programa](/mapa.md) → [Learning path](/learning/docs/learning-path.md) → [Piloto](/piloto.md) |

## Estado actual del programa

> Este bloque describe el estado real a **18 de agosto de 2026**. No hay resultados de piloto porque el piloto no se ha ejecutado.

| Elemento | Estado |
|---|---|
| **Ruta QA — 6 horas** | ✅ Material completo · entorno provisionado y auditado · **pendiente de piloto**. Las duraciones son estimaciones de diseño |
| Módulo 00 — Fundamentos JS/TS para QA | ✅ Material completo |
| Módulo 01 — Playwright Fundamentals | ✅ Material completo · **operacionalmente preparado**, pendiente de piloto |
| **Piloto del Módulo 01** | ⬜ **NO ejecutado.** No hay participantes ni datos |
| [Registro de ejecución del piloto](/learning/docs/module-01-pilot-run-log.md) | ⬜ **Vacío a propósito.** Es la plantilla, no un informe |
| Riesgo **K1** (entorno / red corporativa del cliente) | 🟠 **PENDIENTE** — se valida durante la formación en la organización del cliente |
| Los cinco gaps 🟡 de la revisión pedagógica | ⬜ Identificados, **ninguno implementado**: se deciden con datos del piloto |
| Módulo 02 — Page Object Model &amp; Suite | ⬜ **NO iniciado** |

Todo lo anterior son **hipótesis y protocolos de medición**, no resultados. Qué se medirá y con qué umbrales: [Plan de piloto](/learning/docs/module-01-pilot-plan.md).

## Cómo se recorre esta documentación

- El **menú lateral** empieza por la Ruta QA. Todo lo que hay debajo es consulta.
- La **búsqueda** (arriba a la izquierda) cubre todas las páginas publicadas.
- Los enlaces a **ficheros de código** (`pages/login.page.ts`, `prompts/ai-summary.txt`) abren el fichero en GitHub, no en el portal.
- Las **soluciones** de Labs y Challenges no se publican aquí: ver [Documentación canónica](/documentacion.md#qué-no-se-publica).
