# Módulo 01 — Playwright Fundamentals
## Discovery, Locators & Reliable Tests

> **Estado:** ✅ Material construido — pendiente de piloto con alumnos
> **Duración:** 8 h dirigidas (4 sesiones) + 3 h de trabajo personal + 1 h de assessment ≈ **12 h** — desglose en [Duración](#duración)
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
| [Challenge 1](challenges/challenge-1-compra-completa.md) | 3 CREATE + 4 DESIGN | Diseñas la cobertura de un escenario de negocio completo | Vacío | 90 min |

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
theory.md  →  Lab 1  →  Lab 2  →  Lab 3  →  Lab 4  →  Lab 5  →  Challenge  →  Parte C  →  Assessment
  45 min      45 min    45 min    60 min    60 min    50 min     90 min       5-10 min      60 min
                                     ⭐
```

**El orden no es una sugerencia: es una cadena de dependencias.** El Challenge exige los cinco Labs completos, y la Parte C se defiende sobre el `decisiones.md` del Challenge. Por eso el Challenge se escribe entre la sesión 5 y la sesión 6, y no antes.

## Duración

Los tiempos de los Labs son **tiempo de ejercicio puro**: 260 minutos entre los cinco obligatorios, 350 con el Challenge. La estimación completa incluye apertura, teoría, puestas en común y margen para bloqueos.

### SESSION TIME — 8 h en 4 sesiones

Los bloques son **los mismos** que los del [plan de sesión del formador](../../trainer/session-plans/session-03-module-01.md); si las dos tablas dejan de coincidir, manda el plan de sesión.

| Sesión | Bloque | Min |
|---|---|---|
| **3** (3 h) | Apertura: qué cambia respecto al módulo 00 | 15 |
| | Puesta en marcha: instalación de navegadores y comprobación de entorno | 15 |
| | Teoría A (§1-4): ejecución, informes, auto-waiting, aserciones | 25 |
| | Lab 1 | 45 |
| | Puesta en común del Lab 1 | 10 |
| | Descanso | 10 |
| | Lab 2 | 45 |
| | Puesta en común del Lab 2 | 10 |
| | Cierre y reparto de trabajo personal | 5 |
| **4** (2 h 30) | Dudas del trabajo personal | 10 |
| | Teoría B (§5-12): estrategia de locators | 30 |
| | **Lab 3** | 60 |
| | Puesta en común del Lab 3 | 15 |
| | Descanso | 10 |
| | Lab 4 — arranque *(el segundo test se termina fuera de sesión)* | 20 |
| | Cierre | 5 |
| **5** (1 h 30) | Revisión del Lab 4 | 15 |
| | Lab 5 | 50 |
| | Puesta en común del Lab 5 | 20 |
| | **Lanzamiento del Challenge** *(aquí, y no antes: exige los cinco Labs completos)* | 5 |
| **6** (1 h) | Revisión cruzada del Challenge + **Parte C: defensas individuales en paralelo** | 45 |
| | Puesta en común y cierre del módulo | 10 |
| | Convocatoria del assessment | 5 |

**La instalación de navegadores ocupa media hora de la sesión 3 y no es negociable.** Son ~500 MB por equipo; con 10 personas en la misma red, es el cuello de botella real del arranque. La suite, en cambio, **no** lo es: 79 tests en Chromium tardan ~22 s.

**Por qué existe la sesión 6.** La Parte C se defiende sobre el `decisiones.md` del Challenge, y el Challenge exige los Labs 1-5. Con el Lab 5 en la sesión 5, no hay ningún minuto anterior en el que ese documento pueda existir. La sesión 6 es ese minuto.

### SELF-STUDY TIME — 3 h

| Tarea | Min | Cuándo |
|---|---|---|
| Lectura previa de [`theory.md`](theory.md) | 45 | Antes de la sesión 3 |
| Terminar el Lab 4 (segundo test) | 45 | Entre las sesiones 4 y 5 |
| **Challenge 1 con su `decisiones.md`** | 90 | **Entre las sesiones 5 y 6** |

El repaso de [`locator-reference.md`](locator-reference.md) ya no es una tarea aparte: se hace **usándolo** en la revisión cruzada de la sesión 6, sobre el `decisiones.md` de otra persona.

### ASSESSMENT — 1 h

Parte A (15 min) + Parte B (40 min), convocado **después de la sesión 6**. La Parte C no está aquí: ocurre en el bloque 1 de la sesión 6 y son 5-10 min por alumno.

### Total

| Concepto | Tiempo |
|---|---|
| Session time | 8 h 00 |
| Self-study time | 3 h 00 |
| Assessment | 1 h 00 |
| **Total por alumno** | **12 h 00** |

> **La hora que gana la sesión 6 sale del trabajo personal**, no de ampliar el módulo: desaparecen el *Repaso* (30 min, absorbido por la revisión cruzada) y el *Margen* (45 min), y el Challenge sube de 75 a 90 min. El total por alumno sigue siendo 12 h. **El margen desaparece: es el primer riesgo que el piloto tiene que medir.**

### Ajuste según el nivel del grupo

| Perfil dominante | Ajuste | Session time |
|---|---|---|
| **BEGINNER** | Teoría troceada; Lab 3 en dos partes; Lab 5 acompañado; sin Lab 6 | 10 h |
| **FOUNDATION** | Sin cambios. Es el caso de referencia | 8 h |
| **INTERMEDIATE** | Teoría comprimida; Lab 1 como trabajo personal | 6 h 30 |
| **ADVANCED** | Solo Labs 3 y 5 + Challenge; el resto por su cuenta; rol de mentor | 4 h |

> **Las 12 h son provisionales.** Salen del diseño y de la construcción del material, no de un piloto. La cifra definitiva se fija tras impartirlo con un grupo real, igual que ocurrió con el módulo 00 (estimado en 6 h, construido en 8,75 h).

## Cómo sé que lo he superado

1. Los Labs 1-5 completos: 2 fallos iniciales del sandbox en verde y tus tests nuevos también.
2. `npx tsc --noEmit` sin errores.
3. `git status --short` solo muestra ficheros dentro de `learning/student/sandbox/`.
4. Tu `03-decisiones.md` justifica cada locator con **uno de los cinco criterios**, no con "porque funciona".
5. **El [Challenge](challenges/challenge-1-compra-completa.md) está entregado** con sus AC1-AC6 y su `decisiones.md`. No es opcional: es la única evidencia del objetivo P8 (diseñar un E2E y justificarlo).
6. ≥ 70 en las partes A y B del [assessment](assessment/).
7. **Apto** en la Parte C, que se defiende **sobre el `decisiones.md` del Challenge**: por qué ese locator y no otro, por qué ese reparto de tests, y qué pasaría si la aplicación cambia.

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
