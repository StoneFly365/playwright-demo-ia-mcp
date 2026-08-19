# 🎯 Ruta QA — 6 horas

**IA aplicada al trabajo diario de un QA.** Ocho pasos, todo práctico.

---

## Para quién es

Para un QA que está trabajando en un proyecto real **ahora mismo** y quiere terminar el día usando IA en ese proyecto. No es un temario académico ni hay que leerse la documentación entera del Learning Lab.

No se da por supuesto que domines LLMs, agentes, MCP, programación ni Playwright. Se da por supuesto que sabes qué es un caso de prueba, un defecto y una regresión.

## La regla de esta ruta

> **Esta ruta es todo lo que tienes que hacer.** El resto del portal es material de consulta.

Si terminas los ocho módulos, sabes usar IA en tu trabajo de QA. Lo demás —[Módulo 01 de Playwright](../modules/01-playwright-fundamentals/README.md) completo (12 h), [Fundamentos JS/TS](../modules/00-foundations/README.md) (8,75 h), documentación de programa— está ahí para cuando quieras profundizar en algo concreto, no antes.

---

## 🛠️ Antes de empezar: pre-work técnico

**20-40 min, otro día, y fuera de las 6 horas.** Instalar Node, dependencias y navegadores no es formación: es logística.

→ **[Pre-work técnico](pre-work.md)**

Cuando termines, una sola orden te dice si puedes empezar:

```bash
npm run ruta-qa:check
```

---

## El recorrido

| # | Módulo | Tiempo | Qué te llevas |
|---|---|---|---|
| 0 | [Introducción](00-introduccion.md) | 10 min | Cómo se recorre, y tu material de proyecto sobre la mesa |
| 1 | [IA aplicada a QA](01-ia-para-qa.md) | 35 min | Dónde sí y dónde no, y cómo validar lo que te devuelve |
| 2 | [Prompting para QA](02-prompting.md) | 30 min | Prompts con contrato de salida, no conversaciones |
| 3 | [Generación de casos de prueba](03-generacion-tests.md) | 45 min | De historia de usuario a casos, con riesgos y bordes |
| 4 | [Playwright + IA](04-playwright-ia.md) | 90 min | Crear y mantener tests reales con IA |
| 5 | [MCP para QA](05-mcp-para-qa.md) | 45 min | Que la IA mire tu aplicación de verdad, no que la imagine |
| 6 | [Debugging con IA](06-debugging-ia.md) | 45 min | Causa raíz de un fallo, no el síntoma |
| 7 | [🏆 Reto final](07-reto-final.md) | 60 min | Todo el flujo, de la historia al fallo diagnosticado |
| | **Total** | **6 h 00** | |

Y dos anexos que **no se leen seguidos**, se consultan:

- 💡 **[Biblioteca de prompts](prompts-para-tu-proyecto.md)** — copia el que necesites, cuando lo necesites.
- 📦 **[Ejemplos](ejemplos/README.md)** — el plan B, por si una herramienta no arranca.

## Cómo está construido cada módulo

| Sección | Qué es |
|---|---|
| ⏱️ **Duración** y 🎯 **Objetivo** | Lo que cuesta y para qué sirve |
| 🧠 **Aprende** | Lo imprescindible. Corto a propósito |
| 🛠️ **Practica** | Ejercicio guiado sobre este repositorio |
| 🎯 **Llévatelo a tu proyecto** | La misma técnica, sobre tu trabajo real. **Es la parte que importa** |
| ✅ **Al terminar** | Lo que deberías saber hacer |

El [reto final](07-reto-final.md) es la excepción: 🏆 ahí no hay teoría nueva, se aplica lo aprendido.

## Nada te puede bloquear

| Garantía | Qué significa |
|---|---|
| 🟢 **La IA real es lo recomendado** | Los ejercicios están pensados para que uses tu asistente de verdad |
| 🟡 **Pero nunca es obligatoria** | Si algo no arranca, [`ejemplos/`](ejemplos/README.md) tiene salidas reales ya generadas |
| 🧰 **La infraestructura viene hecha** | Los specs de los módulos 4 y 7 llegan con imports, `describe` y login escritos |

Regla práctica: **si llevas más de 5 minutos peleándote con una herramienta, usa el ejemplo y sigue.**

## Sobre qué se practica

Sobre este repositorio: una suite E2E real de 79 tests sobre [SauceDemo](https://www.saucedemo.com), con 6 Page Objects, tres navegadores, pipeline de CI y **diez tests que fallan a propósito**. Esos diez fallos no son un error: son el material de los módulos 1 y 6.

**Regla de oro:** todo lo que escribas vive en [`learning/student/sandbox/ruta-qa/`](../student/sandbox/ruta-qa/README.md). El código del proyecto (`tests/`, `pages/`, `scripts/`, `prompts/`, `specs/`) es lectura y no se modifica.

## Si te faltan bases

| Si al leer código te pierdes en… | Ve a |
|---|---|
| `async`/`await`, clases, `map`/`filter` | [Módulo 00 — Fundamentos JS/TS](../modules/00-foundations/README.md) |
| Locators, auto-waiting, aserciones web-first | [Módulo 01 — Playwright Fundamentals](../modules/01-playwright-fundamentals/README.md) |

Ninguno de los dos es requisito para empezar. El módulo 4 trae la versión comprimida de lo que necesitas de Playwright.
