# Módulo 01 — Playwright Fundamentals
## Discovery, Locators & Reliable Tests

> **Estado:** ✅ Material construido — pendiente de piloto con alumnos
> **Duración:** 7 h dirigidas (3 sesiones) + 4 h de trabajo personal + 1 h de assessment ≈ **12 h** — desglose en [Duración](#duración)
> **Nivel pedagógico dominante:** 2 · MODIFY → 4 · DESIGN, con un pico en 5 · TROUBLESHOOT
> **Dependencias:** [módulo 00](../00-foundations/) superado.
> **Requisito de entorno:** ⚠️ **navegadores instalados y acceso a `saucedemo.com`**. A diferencia del módulo 00, este módulo **no funciona sin red**. Ver [Puesta en marcha](#puesta-en-marcha).

---

## Objetivo del módulo

Que el alumno pase de **leer** el código de la suite a **ejecutarla, interpretarla y escribir tests propios**, con locators y aserciones elegidos con criterio.

El módulo 00 dejó al alumno capaz de entender qué hace `pages/login.page.ts`. El 01 le pone delante el navegador: ejecuta la suite real, lee el informe, entiende por qué 10 tests fallan a propósito, y escribe tests nuevos contra una aplicación de verdad.

**La frase que define el módulo:**

> Este proyecto localiza elementos de una sola manera. Tú vas a aprender a elegir la más apropiada para cada caso — y a justificar por qué.

No es retórica: sale del recuento del repositorio. La suite usa `[data-test="…"]` **66 veces** y `getByRole` **una sola**. Es una monocultura consistente y bien hecha, pero incompleta como material de aprendizaje. El módulo 01 existe en ese hueco.

## Lo que este módulo NO es

- **No es un tour por la API de Playwright.** La competencia principal no es memorizar métodos: es **criterio de automatización**.
- **No repite el módulo 00.** No se vuelve a explicar `async`/`await`, clases, tipos ni arrays. Si algo de eso se te ha olvidado, vuelve a [`theory.md` del módulo 00](../00-foundations/theory.md).
- **No enseña a diseñar Page Objects.** Aquí los usas como caja negra; en el módulo 02 los abres y los criticas.
- **No diagnostica los 10 fallos intencionados.** Los ves, entiendes que son deliberados y sigues. El diagnóstico es el módulo 04.

## Contenido

| Documento | Qué es | Cuándo se usa |
|---|---|---|
| [learning-objectives.md](learning-objectives.md) | Los 8 objetivos evaluables P1-P8 y su trazabilidad | Antes de empezar |
| [theory.md](theory.md) | El 20% teórico, anclado en ficheros reales (45 min de lectura) | En sesión o como preparación |
| [repository-mapping.md](repository-mapping.md) | 38 anclajes concepto → fichero y línea reales | Consulta permanente |
| [locator-reference.md](locator-reference.md) | ⭐ Tabla de decisión de locators, medida contra la aplicación | Durante el Lab 3, el Challenge y después, en tu trabajo |
| [labs/](labs/) | 5 ejercicios obligatorios + 1 opcional | El grueso del módulo |
| [challenges/](challenges/) | 1 challenge sin pasos | Al terminar los Labs |
| [assessment/](assessment/) | Evaluación de 1 h, aprobado en 70 | Al cierre |
| [../../solutions/01-playwright-fundamentals/](../../solutions/01-playwright-fundamentals/) | Soluciones verificadas | Publicación diferida |

## Los Labs

| Lab | Nivel | Qué haces | Estado inicial | Tiempo |
|---|---|---|---|---|
| [Lab 1 — La suite real](labs/lab-1-suite-real.md) | **1 FOLLOW** | Ejecutas la suite de seis formas distintas e interpretas lo que devuelve | Suite del proyecto: 69 ✅ / 10 ❌ | 45 min |
| [Lab 2 — Por qué nadie espera](labs/lab-2-auto-waiting.md) | **2 MODIFY** | Rompes el auto-waiting a propósito y mides lo que cuesta | Verde (2 tests) | 45 min |
| [Lab 3 — Elegir el locator correcto](labs/lab-3-locators.md) ⭐ | **2 MODIFY → 4 DESIGN** | Construyes tu tabla de decisión de locators, respaldada por tests | Verde (2 tests) | 60 min |
| [Lab 4 — El test que falta](labs/lab-4-test-que-falta.md) | **3 CREATE** | Escribes dos tests para huecos de cobertura reales | Vacío | 60 min |
| [Lab 5 — El test que a veces pasa](labs/lab-5-troubleshoot.md) | **5 TROUBLESHOOT** | Diagnosticas dos fallos auténticos de localización | **Rojo (2 fallos)** | 50 min |
| [Lab 6 — Codegen](labs/lab-6-codegen.md) *(opcional)* | 2 MODIFY | Generas un test con `codegen` y lo criticas | — | 30 min |
| [Challenge 1](challenges/challenge-1-compra-completa.md) | 3 CREATE + 4 DESIGN | Diseñas la cobertura de un escenario de negocio completo | Vacío | 75 min |

**El Lab 3 es el centro del módulo.** Si el tiempo aprieta, lo que se recorta es el Lab 6 y parte del Lab 1, nunca el 3.

## Puesta en marcha

```bash
# 1. Dependencias (solo la primera vez)
npm ci

# 2. Navegadores — ~500 MB de descarga, solo la primera vez
npx playwright install

# 3. Tu rama de trabajo
git checkout -b learning/01-playwright-<tu-nombre>

# 4. Comprobar que el entorno permite ejecutar contra la aplicación real
npx playwright test --project=chromium tests/login.spec.ts
```

Si el paso 4 falla por red, proxy o certificados, **para y avisa al formador antes de seguir**: es el riesgo K1 del módulo y tiene un plan alternativo. No es un problema tuyo.

Y el estado inicial de tu zona de trabajo:

```bash
npx playwright test -c learning/student/sandbox/01-playwright --project=chromium
```

Salida esperada, exactamente:

```
2 failed
4 passed
```

Los **2 fallos son el Lab 5** y son correctos. Los 4 verdes son el punto de partida de los Labs 2 y 3.

## Dónde se trabaja

| Zona | Permiso |
|---|---|
| `learning/student/sandbox/01-playwright/` | ✅ Es tu zona de trabajo |
| `learning/student/sandbox/00-foundations/` | ✅ Tuya, del módulo anterior |
| `tests/`, `pages/`, `scripts/`, `prompts/`, `specs/` | ❌ **Solo lectura.** Ningún Lab de este módulo los modifica |
| `playwright.config.ts` (raíz), `package.json`, `.github/` | ❌ No se tocan |

**Esto incluye [`pages/cart.page.ts`](../../../pages/cart.page.ts), aunque descubras que tiene un locator roto.** Ese defecto es el material del Lab 5 y del módulo 02: corregirlo deja sin ejercicio a los dos.

El sandbox del módulo 01 tiene [su propia configuración](../../student/sandbox/01-playwright/playwright.config.ts) —con `baseURL`, los tres navegadores y `testIdAttribute`— separada de la del módulo 00, que sigue siendo lógica pura sin navegador.

## Ruta recomendada

```
theory.md  →  Lab 1  →  Lab 2  →  Lab 3  →  Lab 4  →  Lab 5  →  Challenge  →  Assessment
  45 min      45 min    45 min    60 min    60 min    50 min     75 min        60 min
                                     ⭐
```

## Duración

Los tiempos de los Labs son **tiempo de ejercicio puro**: 260 minutos entre los cinco obligatorios, 335 con el Challenge. La estimación completa incluye apertura, teoría, puestas en común y margen para bloqueos.

### SESSION TIME — 7 h en 3 sesiones

| Sesión | Bloque | Min |
|---|---|---|
| **1** (3 h) | Apertura: qué cambia respecto al módulo 00. Instalación de navegadores y comprobación de entorno | 30 |
| | Teoría A (§1-4): ejecución, informes, auto-waiting, aserciones | 25 |
| | Lab 1 + puesta en común | 55 |
| | Descanso | 10 |
| | Lab 2 + puesta en común | 55 |
| | Cierre y reparto de trabajo personal | 5 |
| **2** (2 h 30) | Teoría B (§5-12): estrategia de locators | 30 |
| | **Lab 3** + puesta en común | 75 |
| | Arranque del Lab 4 | 35 |
| | Cierre | 10 |
| **3** (1 h 30) | Lab 5 + puesta en común | 60 |
| | Revisión del Challenge + **Parte C: defensa técnica** | 25 |
| | Cierre del módulo | 5 |

**La instalación de navegadores ocupa media hora de la sesión 1 y no es negociable.** Son ~500 MB por equipo; con 10 personas en la misma red, es el cuello de botella real del arranque. La suite, en cambio, **no** lo es: 79 tests en Chromium tardan ~22 s.

### SELF-STUDY TIME — 4 h

| Tarea | Min |
|---|---|
| Lectura previa de [`theory.md`](theory.md) | 45 |
| Terminar el Lab 4 (segundo test) | 45 |
| Challenge 1 con su `decisiones.md` | 75 |
| Repaso de los Learning Points y de [`locator-reference.md`](locator-reference.md) | 30 |
| Margen | 45 |

### ASSESSMENT — 1 h

Parte A (15 min) + Parte B (40 min). La Parte C ocurre dentro de la revisión de la sesión 3.

### Total

| Concepto | Tiempo |
|---|---|
| Session time | 7 h 00 |
| Self-study time | 4 h 00 |
| Assessment | 1 h 00 |
| **Total por alumno** | **12 h 00** |

### Ajuste según el nivel del grupo

| Perfil dominante | Ajuste | Session time |
|---|---|---|
| **BEGINNER** | Teoría troceada; Lab 3 en dos partes; Lab 5 acompañado; sin Lab 6 | 9 h |
| **FOUNDATION** | Sin cambios. Es el caso de referencia | 7 h |
| **INTERMEDIATE** | Teoría comprimida; entra el Lab 6 (codegen) | 5 h 30 |
| **ADVANCED** | Solo Labs 3 y 5 + Challenge; el resto por su cuenta; rol de mentor | 3 h |

> **Las 12 h son provisionales.** Salen del diseño y de la construcción del material, no de un piloto. La cifra definitiva se fija tras impartirlo con un grupo real, igual que ocurrió con el módulo 00 (estimado en 6 h, construido en 8,75 h).

## Cómo sé que lo he superado

1. Los Labs 1-5 completos: 2 fallos iniciales del sandbox en verde y tus tests nuevos también.
2. `npx tsc --noEmit` sin errores.
3. `git status --short` solo muestra ficheros dentro de `learning/student/sandbox/`.
4. Tu `03-decisiones.md` justifica cada locator con **uno de los cinco criterios**, no con "porque funciona".
5. ≥ 70 en las partes A y B del [assessment](assessment/).
6. **Apto** en la Parte C: sabes defender por qué ese locator y no otro, y qué pasaría si la aplicación cambia.

## Trazabilidad

| Pregunta | Respuesta |
|---|---|
| ¿Qué competencia enseña? | B (Web Testing) y E (Playwright) de la matriz de la Fase 1 |
| ¿Dónde aparece en el repositorio? | 38 anclajes con `fichero:línea` en [repository-mapping.md](repository-mapping.md) |
| ¿Qué ejercicio la practica? | 5 Labs (+1 opcional) y 1 Challenge |
| ¿Cómo se valida? | `npx playwright test -c learning/student/sandbox/01-playwright --project=chromium` + `npx tsc --noEmit` |
| ¿Cómo se evalúa? | [Assessment](assessment/) de 100 puntos, aprobado en 70, más la Parte C |

La matriz completa objetivo → teoría → Lab → assessment está al final de [learning-objectives.md](learning-objectives.md).

## Nota para el formador

Este módulo depende de una condición que **no está verificada en el entorno de HDI**: el acceso a `saucedemo.com` y la descarga de navegadores desde un equipo corporativo. Ver el [plan de sesión](../../trainer/session-plans/session-03-module-01.md), sección *Antes de la sesión*, con los tres comandos que hay que ejecutar **antes** de convocar al grupo.

## Siguiente módulo

**02 — Page Object Model & Estructura de Suite** (aún no desarrollado). Ahí se abren los seis Page Objects que aquí has usado como caja negra, y se razona sobre por qué el defecto que encuentras en el Lab 5 pudo sobrevivir tanto tiempo sin que nadie lo notara.
