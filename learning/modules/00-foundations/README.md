# Módulo 00 — Fundamentos de JavaScript y TypeScript para QA

> **Estado:** ✅ Completo y listo para impartir
> **Duración:** 5 h dirigidas (2 sesiones) + 3 h de trabajo personal + 45 min de assessment ≈ **8,75 h** — desglose en [Duración](#duración)
> **Nivel pedagógico dominante:** 1 · FOLLOW → 5 · TROUBLESHOOT
> **Dependencias:** ninguna. Es el punto de entrada del programa.
> **Se puede saltar si:** el pre-assessment te sitúa en nivel ADVANCED (subíndice JS/TS ≥ 80).

---

## Objetivo del módulo

Que cualquier participante pueda **leer, modificar y crear** el código de `pages/` y `tests/` sin que le parezca un idioma extranjero.

Este módulo no enseña Playwright. Enseña las diez cosas de JavaScript y TypeScript que el proyecto usa de verdad, y ni una más. El criterio de qué entra y qué no lo ha marcado el propio repositorio: si no aparece en `pages/`, `tests/` o `scripts/`, no se enseña aquí.

## Por qué existe

Del análisis de la Fase 1: **la nivelación de TypeScript es el gap CRITICAL número uno** del programa. El perfil declarado de los participantes incluye QAs de perfil manual y QAs con experiencia en otras herramientas, pero no desarrolladores. Sin este módulo, `pages/login.page.ts` es un muro en la primera sesión y el déficit se arrastra hasta el capstone.

## Contenido

| Documento | Qué es | Cuándo se usa |
|---|---|---|
| [learning-objectives.md](learning-objectives.md) | Los 8 objetivos evaluables del módulo y su trazabilidad | Antes de empezar |
| [theory.md](theory.md) | El 20% teórico, anclado en ficheros reales (35-40 min de lectura) | En sesión o como preparación |
| [repository-mapping.md](repository-mapping.md) | 20 conceptos → fichero y línea reales del proyecto | Consulta permanente |
| [labs/](labs/) | 4 ejercicios guiados, de leer a diagnosticar | El grueso del módulo |
| [challenges/](challenges/) | 1 challenge sin pasos | Al terminar los Labs |
| [assessment/](assessment/) | Evaluación de 45 min, aprobado en 70 | Al cierre |
| [../../solutions/00-foundations/](../../solutions/00-foundations/) | Soluciones verificadas | Publicación diferida |

## Los cuatro Labs

| Lab | Nivel | Qué haces | Estado inicial | Tiempo |
|---|---|---|---|---|
| [Lab 1 — FOLLOW](labs/lab-1-follow.md) | 1 | Lees `pages/login.page.ts` e `inventory.page.ts` y respondes una hoja de observación | Verde (8 tests) | 30 min |
| [Lab 2 — MODIFY](labs/lab-2-modify.md) | 2 | Parametrizas una ordenación sin duplicar código | Verde (2 tests) | 30 min |
| [Lab 3 — CREATE](labs/lab-3-create.md) | 3 | Implementas 3 funciones tipadas contra un contrato de tests | **Rojo (4 fallos)** | 45 min |
| [Lab 4 — TROUBLESHOOT](labs/lab-4-troubleshoot.md) | 5 | Diagnosticas 3 fallos de causas distintas y los corriges | **Rojo (3 fallos)** | 40 min |
| [Challenge 1](challenges/challenge-1-cart-summary.md) | 3+4 | Diseñas e implementas un módulo entero, con tus propios tests | Vacío | 60 min |

## Puesta en marcha

```bash
# 1. Dependencias (solo la primera vez)
npm install

# 2. Tu rama de trabajo
git checkout -b learning/00-foundations-<tu-nombre>

# 3. Comprobar el punto de partida
npx playwright test -c learning/student/sandbox
```

Salida esperada, exactamente:

```
7 failed
13 passed
```

**No hace falta `npx playwright install`, ni conexión a internet, ni acceso a SauceDemo.** Los ejercicios de este módulo son lógica pura y no abren navegador.

## Dónde se trabaja

| Zona | Permiso |
|---|---|
| `learning/student/sandbox/00-foundations/` | ✅ Es tu zona de trabajo |
| `pages/`, `tests/`, `scripts/`, `prompts/`, `specs/` | ❌ Solo lectura. Ningún Lab de este módulo los modifica |
| `playwright.config.ts`, `package.json`, `.github/` | ❌ No se tocan |

El sandbox tiene su propia configuración de Playwright ([`learning/student/sandbox/playwright.config.ts`](../../student/sandbox/playwright.config.ts)) e ignora por completo la suite del proyecto. Ejecutar los ejercicios no puede romper el pipeline de CI.

## Ruta recomendada

```
theory.md  →  Lab 1  →  Lab 2  →  Lab 3  →  Lab 4  →  Challenge 1  →  Assessment
  40 min      30 min    30 min    45 min    40 min      60 min          45 min
```

## Duración

Los tiempos de los Labs son **tiempo de ejercicio puro**: 145 minutos entre los cuatro, 205 con el Challenge. Un módulo no son solo sus ejercicios, así que la estimación completa incluye apertura, teoría, puestas en común, feedback y margen para dudas.

### SESSION TIME — 5 h en 2 sesiones

| Sesión | Bloque | Min |
|---|---|---|
| **1** (3 h) | Apertura: el proyecto real, las tres reglas del programa | 15 |
| | Teoría A (§0-3) + Teoría B (§4-5, las dos trampas de `sort`) | 24 |
| | Lab 1 + puesta en común (incluye la defensa de 3 min) | 45 |
| | Descanso | 10 |
| | Lab 2 + puesta en común | 42 |
| | Teoría C (§6-9) | 15 |
| | Arranque guiado del Lab 3 | 20 |
| | Cierre y reparto de trabajo personal | 9 |
| **2** (2 h) | Dudas del trabajo personal | 15 |
| | Revisión del Lab 3 en común | 15 |
| | Lab 4 en sesión | 40 |
| | Revisión del Lab 4 + **Parte C: defensa técnica** (O8) | 25 |
| | Margen para dudas y bloqueos | 20 |
| | Cierre | 5 |

**El margen de 20 minutos de la sesión 2 no es relleno.** Es la previsión —verificada en la [guía del formador](../../docs/trainer-guide.md), sección 8— de que en un grupo de 10 personas al menos tres se atascarán en el spread, el `await` o el redondeo en coma flotante.

### SELF-STUDY TIME — 3 h

| Tarea | Min |
|---|---|
| Lectura previa de [`theory.md`](theory.md) | 40 |
| Terminar el Lab 3 | 25 |
| Challenge 1 (incluida la justificación escrita) | 60 |
| Repaso de los Learning Points de los 4 Labs | 15 |
| Registro de avance y dudas | 10 |
| Margen | 30 |

### ASSESSMENT — 45 min

Parte A (15 min) + Parte B (30 min). La Parte C no suma tiempo: ocurre dentro de la revisión de la sesión 2.

### Total

| Concepto | Tiempo |
|---|---|
| Session time | 5 h 00 |
| Self-study time | 3 h 00 |
| Assessment | 0 h 45 |
| **Total por alumno** | **8 h 45** |

### Ajuste según el nivel del grupo

| Perfil dominante | Ajuste | Session time |
|---|---|---|
| **BEGINNER** | Módulo ampliado: la teoría C y el Lab 3 pasan a una tercera sesión | 7 h |
| **FOUNDATION** | Sin cambios. Es el caso de referencia | 5 h |
| **INTERMEDIATE** | Teoría comprimida a 25 min; el Challenge entra en sesión | 4 h |
| **ADVANCED** | Se salta el módulo; solo hace el assessment como control | 0 h 45 |

> Estimado para formación empresarial con grupos de 8-12 personas trabajando en parejas, en horario laboral. Los 6 h iniciales de la Fase 1 eran una estimación previa a la construcción del material y se quedaban cortos: no contemplaban puestas en común, defensa técnica ni margen para bloqueos.

En una planificación de 6 semanas (opción B de la Fase 1), este módulo ocupa la semana 1 completa.

## Cómo sé que lo he superado

1. Los 23 tests del sandbox en verde tras el Lab 4 (29 o más tras el Challenge).
2. `npx tsc --noEmit` sin errores.
3. `git status --short` solo muestra ficheros dentro de `learning/student/sandbox/`.
4. ≥ 70 en las partes A y B del [assessment](assessment/).
5. **Apto** en la Parte C: sabes explicar una decisión tuya y separar el síntoma de la causa (objetivo O8).

## Trazabilidad

| Pregunta | Respuesta |
|---|---|
| ¿Qué competencia enseña? | C (Programming) y D (JavaScript/TypeScript) de la matriz de la Fase 1 |
| ¿Dónde aparece en el repositorio? | 20 anclajes con `fichero:línea` en [repository-mapping.md](repository-mapping.md) |
| ¿Qué ejercicio la practica? | 4 Labs + 1 Challenge |
| ¿Cómo se valida? | `npx playwright test -c learning/student/sandbox` + `npx tsc --noEmit` |
| ¿Cómo se evalúa? | [Assessment](assessment/) de 100 puntos, aprobado en 70 |

El desglose competencia → anclaje → ejercicio → validación → evaluación está en la tabla final de [repository-mapping.md](repository-mapping.md).

## Siguiente módulo

**01 — Playwright Fundamentals** (aún no desarrollado). Requiere haber superado este.

Ahí empieza el navegador: locators, aserciones web-first, `playwright.config.ts` y la ejecución real de los 79 tests del proyecto.
