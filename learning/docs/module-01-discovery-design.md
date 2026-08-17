# MODULE 01 — PLAYWRIGHT FUNDAMENTALS
## Discovery & Design

**Fase 3A — Solo diseño.** No se ha creado ningún material del módulo, ni Labs, ni Challenges, ni soluciones. No se ha modificado documentación existente ni código.

**Fecha:** 17 de agosto de 2026 · **Rama:** `docs/ruta-aprendizaje-playwright`
**Prerrequisito:** [Módulo 00](../modules/00-foundations/) cerrado y aprobado.

> ## ✅ Diseño actualizado con validación técnica — Fase 3A.2
>
> Este documento incorpora los resultados de [`module-01-technical-validation.md`](module-01-technical-validation.md), ejecutados contra la aplicación real el 17 de agosto de 2026.
>
> **K1 (Entorno) = CONDITIONAL** · **K2 (Locators) = PASS** · Recomendación: **ADAPT DESIGN**, aplicada.
>
> Las secciones marcadas con **🔬 VALIDADO** contienen datos medidos, no supuestos. El registro completo de cambios está en [Technical Validation Integration](#technical-validation-integration), al final.
>
> **Seis afirmaciones del diseño original resultaron falsas y han sido corregidas:** `getByLabel` como estrategia practicable, los títulos de página como headings, el `combobox` como locator sin reservas, `getByTestId` como no verificable, `.first()` como recurso ante ambigüedad, y la naturaleza del defecto de `.cart_item`.

---

# 1. Module Purpose

Que el alumno pase de **leer** el código de la suite a **ejecutarla, interpretarla y escribir tests propios** con locators y aserciones elegidos con criterio.

El módulo 00 dejó al alumno capaz de entender qué hace `pages/login.page.ts`. El 01 le pone delante el navegador: ejecuta los 237 runs reales, lee el informe, entiende por qué 10 tests fallan a propósito, y escribe tests nuevos contra una aplicación de verdad.

**La frase que define el módulo:** *este proyecto localiza elementos de una sola manera; tú vas a aprender las cinco que existen y a decidir cuál usar en cada caso.*

Esa frase no es retórica: sale del análisis del repositorio (sección 3). La suite usa `[data-test="…"]` **81 veces** y `getByRole` **una sola vez**. Es una monocultura de locators, consistente y bien hecha, pero incompleta como material de aprendizaje. El módulo 01 existe justamente en ese hueco.

---

# 2. Relationship with Module 00

## 2.1 Qué se da por adquirido

Del análisis de [`learning-objectives.md`](../modules/00-foundations/learning-objectives.md), [`theory.md`](../modules/00-foundations/theory.md) y los cuatro Labs del módulo 00, el alumno llega al 01 sabiendo:

| Conocimiento | Origen en M00 | Consecuencia para M01 |
|---|---|---|
| Leer una clase con `readonly`, parámetro de propiedad y métodos `async` | O1, teoría §6, Lab 1 | Puede usar los 6 Page Objects sin que se le explique su sintaxis |
| `Promise<T>`, `await`, y qué pasa si se omite | O2, teoría §8, Lab 1 y 4 | **No hay que volver a explicar por qué todo lleva `await`** |
| `map`, `filter`, `sort`, spread y las dos trampas de `sort()` | O4, teoría §4-5, Lab 2 | Puede transformar datos extraídos de la UI |
| Crear un módulo tipado con `type` propio y funciones puras | O5, Lab 3, Challenge 1 | Puede escribir helpers de test sin andamiaje |
| Diagnosticar `await` ausente, `sort` sin comparador y mutación de entrada | O6, Lab 4 | Trae método de diagnóstico, no solo intuición |
| `strict`, narrowing de `T \| null`, tipos de unión literal | O5/O7, teoría §9 | Puede tipar parámetros de sus tests |
| Ejecutar tests con `-c`, leer la salida y distinguir fallo de aserción de error de compilación | O3, Labs 1-4 | La mecánica de ejecución no es nueva; **el navegador sí** |
| Justificar una decisión y separar síntoma de causa | O8, Parte C | El módulo 01 puede exigir justificación desde el primer Lab |
| Trabajar solo en `learning/student/sandbox/`, no tocar aserciones para llegar a verde | Reglas del programa | Las reglas no se reexplican, se recuerdan en una línea |

## 2.2 Qué NO debe repetirse

- Sintaxis de clases, `async`/`await`, tipos, arrays. **Ni un párrafo.**
- La mecánica de `npx playwright test -c …` y de leer un fallo de aserción.
- El concepto de "no cambies el `expect`".

Si el módulo 01 vuelve a explicar `await`, el alumno INTERMEDIATE desconecta y el material pierde credibilidad.

## 2.3 Qué se reutiliza como andamio

- **El sandbox** como zona de trabajo, con la misma regla de oro. Necesitará una configuración propia para el módulo 01 (con navegadores y `baseURL`), que hoy **no existe**.
- **El formato de Lab**: objetivo, contexto, prerrequisitos, archivos implicados, pasos, resultado esperado, validación, learning points.
- **El objetivo O8** (comunicar y justificar) sigue vivo: no se reintroduce, se sube de nivel.
- **La disciplina de aserciones con mensaje descriptivo**, que el módulo 00 admira en el proyecto y el 01 convierte en obligación de estilo propia.

## 2.4 Autonomía esperada al empezar

El alumno debería poder, sin ayuda: leer un spec completo y decir qué hace; ejecutar un fichero concreto; identificar en un fallo qué línea y qué aserción lo produjo; escribir una función tipada con sus tests. **No** debería saber elegir un locator, ni por qué un test no necesita esperas explícitas.

## 2.5 Comparación M00 ↔ M01

| Aspecto | M00 — Foundations | M01 — Playwright Fundamentals |
|---|---|---|
| **Objetivo** | Leer y escribir el lenguaje | Ejecutar, interpretar y escribir tests contra una app real |
| **Conocimientos** | JS/TS: clases, arrays, promesas, tipos | Runner, locators, aserciones web-first, auto-waiting, configuración, informes |
| **Dependencia externa** | **Ninguna**: sin navegador, sin red | **Navegadores instalados + acceso a `saucedemo.com`** |
| **Autonomía** | Contrato dado, pasos guiados | Elige locators y diseña aserciones; el último Lab no da pasos |
| **Complejidad** | Lógica pura, determinista | Aplicación real, asincronía real, latencia real |
| **Tipo de ejercicios** | Katas sobre datos | Tests E2E sobre pantallas reales de SauceDemo |
| **Debugging** | Leer un mensaje de fallo | Leer informe HTML + distinguir fallo de locator, de aserción y de aplicación |
| **Assessment** | 10 conceptuales + 2 prácticos + defensa | Menos peso conceptual, más práctica: escribir tests que se ejecutan |
| **Duración** | 5 h sesión + 3 h personal + 45 min | ~7 h sesión + 4 h personal + 1 h (sección 11) |
| **Nivel dominante** | 1 FOLLOW → 5 TROUBLESHOOT | 2 MODIFY → 3 CREATE, con un pico en 5 TROUBLESHOOT |

**El salto es razonable**: se mantiene el formato, la zona de trabajo y las reglas; lo que cambia es el objeto de estudio (del lenguaje al framework) y el entorno (del determinismo al navegador real).

---

# 3. Repository Analysis

Inventario obtenido contando ocurrencias en `tests/` y `pages/`, no de memoria. Todo lo que sigue está verificado.

## 3.1 Configuración — `playwright.config.ts` (31 líneas)

```
testDir: './tests'          fullyParallel: true       forbidOnly: !!CI
retries: CI ? 2 : 0         workers: CI ? 4 : undefined
reporter: CI ? [github, html, json] : [html, json]
use: { baseURL: 'https://www.saucedemo.com', trace: 'retain-on-failure', video: 'retain-on-failure' }
projects: [chromium, firefox, webkit]
```

**Ausente y relevante para M01:** `timeout` global, `expect.timeout`, `testIdAttribute`, `screenshot`, `webServer`, `outputDir`. Todo funciona con los valores por defecto de Playwright, y eso es material: el alumno debe saber qué valores está heredando sin verlos escritos.

## 3.2 Locators — la monocultura

| Estrategia | Ocurrencias | Dónde |
|---|---|---|
| `page.locator('[data-test="…"]')` (CSS por atributo) | **81** (42 en `tests/`, 39 en `pages/`) | Todo el proyecto |
| `page.locator('[data-test^="…"]')` (prefijo) | 6 | `product-detail.page.ts:21,25`, 4 specs |
| `page.locator('.cart_item')` (clase CSS) | **12** en 5 ficheros | `add-tshirt-to-cart`, `cart-edge-cases`, `cart-sync`, `performance-glitch-user-cart`, `problem-user-cart` |
| `page.locator('#id')` | 3 | `menu.page.ts:7,12,18` |
| `getByRole` | **1** | `checkout.spec.ts:34` — `getByRole('heading', { name: 'Thank you for your order!' })` |
| `getByText`, `getByLabel`, `getByPlaceholder`, `getByTestId`, `getByTitle`, `getByAltText` | **0** | — |
| XPath | **0** | — |
| `.filter({ hasText })` | 1 | `product-detail-add-to-cart.spec.ts:119` |
| `{ hasText: … }` como opción de `locator()` | 1 | `inventory.page.ts:33` |
| `.first()` | 1 | `cart-sync.spec.ts:32` |
| `.nth()`, `.last()` | 0 | — |

> **Corrección respecto al análisis de Fase 1:** allí se contabilizaron 4 specs usando `.cart_item`. El recuento exacto es **12 ocurrencias en 5 ficheros**. No cambia la conclusión, pero el material del módulo debe citar la cifra correcta.

**Lectura pedagógica.** El proyecto hace *una* cosa y la hace bien: `data-test` es la estrategia más resiliente disponible en SauceDemo y se aplica con consistencia. Pero:

1. **No hay contraste.** El alumno no puede aprender a *elegir* si solo ve una opción.
2. **`testIdAttribute` no está configurado**, así que `getByTestId()` no se puede usar — se escribe el selector CSS a mano. Enseñar esa opción de configuración es una mejora concreta y medible. **🔬 VALIDADO:** sin la configuración, `getByTestId('username')` resuelve **0 elementos**; con `testIdAttribute: 'data-test'`, resuelve **1**.
3. **`.cart_item` es la excepción**: 12 usos de una clase de estilo en 5 specs. **🔬 VALIDADO — y la explicación es la contraria a la del diseño original:** el atributo `[data-test="cart-item"]` que declara [`pages/cart.page.ts:7`](../../pages/cart.page.ts) **no existe en la aplicación**. El elemento real es `<div class="cart_item" data-test="inventory-item">`. Los tests no esquivan el Page Object por comodidad: **lo esquivan porque su locator está roto**. Ver hallazgo V1 en la sección 15.
4. **El único `getByRole`** demuestra que SauceDemo *sí* expone roles accesibles. Es la cabeza de puente para enseñar la jerarquía recomendada.

## 3.3 Interacciones

| Acción | Ocurrencias | Dónde |
|---|---|---|
| `.click()` | 21 | Toda la suite |
| `.fill()` | 5 | `login.page.ts:15,16`, `checkout.page.ts:17,18,19` |
| `.selectOption()` | 1 | `inventory.page.ts:21` |
| `.check()`, `.uncheck()`, `.hover()`, `.press()`, `.type()`, `.setInputFiles()`, `.dragTo()`, `.focus()` | **0** | — |
| Diálogos (`page.on('dialog')`, `handleDialog`) | **0** | — |

**Consecuencia de diseño:** teclado, hover, checkboxes, subida de ficheros y diálogos **no tienen anclaje en el repositorio**. SauceDemo tampoco los ofrece. Enseñarlos exigiría inventar ejemplos, lo que rompe el principio *repository-first*. Ver sección 7.

## 3.4 Aserciones

| Aserción | Ocurrencias |
|---|---|
| `toBeVisible()` / `not.toBeVisible()` | 53 |
| `toHaveText()` | 46 |
| `toHaveURL()` | 24 |
| `toHaveCount()` | 13 |
| `toContainText()` | 13 |
| `toHaveLength()` (no web-first) | 3 |
| `toEqual()` (no web-first) | 3 |
| `toHaveValue`, `toBeEnabled`, `toBeDisabled`, `toBeChecked`, `toHaveAttribute`, `toHaveClass`, `expect.soft` | **0** |

**Rasgo excepcional:** prácticamente **todas** las aserciones llevan mensaje descriptivo en español como segundo argumento. Es infrecuente y es el mejor ejemplo del repositorio para enseñar aserciones legibles por negocio.

## 3.5 Esperas — el hallazgo más limpio del análisis

| Patrón | Ocurrencias |
|---|---|
| `waitForTimeout` | **0** |
| `waitForLoadState('networkidle')` | **0** |
| `waitForSelector`, `waitForResponse`, `waitForRequest`, `waitForURL` | **0** |
| `{ timeout: 15000 }` en aserciones | 4, todas en `performance-glitch-user-cart.spec.ts` |
| Métodos **no auto-esperantes**: `.isVisible()`, `.textContent()` | 4, todas en `problem-user-cart.spec.ts:53,54,77,78` |

La suite entera confía en el auto-waiting de las web-first assertions. **Cero anti-patrones de espera.** Es material de primera para enseñar "por qué no hace falta `sleep`", y el contraste está en el propio repositorio: los 4 usos de `isVisible()`/`textContent()` en `problem-user-cart.spec.ts` **sí** son métodos que no reintentan, y ahí es donde el test se vuelve dependiente del instante en que se ejecuta.

## 3.6 Estructura y hooks

| Elemento | Ocurrencias |
|---|---|
| `test()` | 79 |
| `test.describe()` | 14 |
| `test.beforeEach()` | 13 |
| `test.afterEach`, `beforeAll`, `afterAll`, `test.step`, `test.use`, `test.skip`, `test.fixme`, `describe.configure` | **0** |
| Tags (`{ tag: '@demo-fail' }`) | 10 |
| Único fichero sin `beforeEach` | `route-protection.spec.ts` (no necesita sesión) |

## 3.7 Navegación

`page.goto()` 5 veces (3 en `route-protection.spec.ts`, `login.page.ts:11`, `product-detail.page.ts:17` con plantilla), `page.reload()` 2 veces en `cart-badge.spec.ts`. Sin `goBack`/`goForward`.

## 3.8 Ausencias totales relevantes

`browser.*`, `context.*`, `newContext`, `newPage`, `request`, `APIRequestContext`, `page.route`, `storageState`, `test.extend`: **cero ocurrencias**. Ninguno es del módulo 01 (ver sección 7), pero conviene saber que el repositorio no los tiene.

## 3.9 Scripts de ejecución — `package.json`

12 scripts, todos utilizables como material: `test`, `test:all`, `test:chromium|firefox|webkit`, `test:headed`, `test:demo:green` (`--grep-invert @demo-fail`), `test:demo:fail` (`--grep @demo-fail`), `test:report`, `report:ai`, `test:ai`.

**No existe** ningún script con `--ui`, `--debug` ni `codegen`.

## 3.10 Cobertura funcional: dónde hay hueco real

Revisando `tests/inventory.spec.ts`, las ordenaciones cubiertas son `za`, `lohi` y `hilo`. **La ordenación A→Z (`az`) no está probada.** Es el único hueco funcional limpio que he encontrado en toda la suite, y es un punto de partida auténtico para un Lab de tipo CREATE: el alumno no escribe un test de adorno, cubre un hueco real.

Otros candidatos sin cobertura, menos claros: enlaces del pie de página, botón de cierre (`X`) del mensaje de error del login, atributo `alt` de las imágenes de producto, y el contenido de la página de confirmación más allá del titular.

---

# 4. Playwright Skills Matrix

**Nivel actual:** Ausente / Básico / Sólido. **Enseñar M01:** ✅ sí · ⚠️ mención breve · ❌ no.

## Fundamentals

| Skill | Existe en repo | Archivo | Nivel actual | Enseñar M01 | Posterior |
|---|---|---|---|---|---|
| Arquitectura Playwright (proceso, protocolo) | No explícito | — | Ausente | ⚠️ 10 min conceptuales | — |
| Browser | Implícito vía `projects` | `playwright.config.ts:17-30` | Básico | ⚠️ Solo como concepto | — |
| BrowserContext | **No usado** | — | Ausente | ⚠️ Nombrarlo: explica el aislamiento entre tests | M03 (`storageState`) |
| Page (fixture) | Sí, en 13 `beforeEach` y 30+ tests | todos los specs | Sólido | ✅ | — |
| `test` / test runner | Sí, 79 tests | `tests/` | Sólido | ✅ | — |
| Configuración | Sí | `playwright.config.ts` | Sólido | ✅ Lectura completa; modificar solo en sandbox | M03 (proyectos), M06 (CI) |

## Locators 🔬 VALIDADO

Columna **"Funciona en la app"** = resultado medido en [`module-01-technical-validation.md`](module-01-technical-validation.md), sección 4, sobre 20 elementos de las 5 pantallas.

| Skill | Existe en repo | Funciona en la app 🔬 | Archivo | Enseñar M01 | Posterior |
|---|---|---|---|---|---|
| `getByRole` | **Sí, 1 vez** | ✅ **12 de 20** — perfecto en botones y campos de texto; **inútil en títulos** | `checkout.spec.ts:34` | ✅ **Primera opción de la jerarquía** | — |
| `getByLabel` | **No** | ❌ **0 de 20** — la aplicación tiene **cero `<label>`** | — | ⚠️ **Solo como caso de diagnóstico**, nunca como estrategia practicable | — |
| `getByText` | **No** | ✅ 8 de 20 | — | ⚠️ Con reservas: acoplado al idioma y al copy | — |
| `getByPlaceholder` | **No** | ✅ **5 de 5** campos de texto | — | ✅ Requiere ejemplo nuevo en el sandbox | — |
| `getByTestId` | **No** (`testIdAttribute` sin configurar) | ✅ **20 de 20**, con `testIdAttribute: 'data-test'`; **0** sin él | — | ✅ Y enseñar cómo habilitarlo | — |
| CSS por atributo | Sí, 81 | ✅ 20 de 20 | todo el proyecto | ✅ Como estrategia y como contraste | — |
| CSS por clase (frágil) | Sí, 12 en 5 ficheros | ✅ Funciona, pero es selector de estilo | `.cart_item` | ✅ **Contraejemplo**, con la explicación corregida (V1) | M02 (revisar diseño) |
| CSS por id | Sí, 3 | ✅ | `menu.page.ts` | ✅ Excepción justificada | — |
| XPath | **No** | ✅ Funciona en todos los probados | — | ⚠️ Mencionar **para desaconsejarlo**, con el contraste medido | — |
| **Acotado** (`filter` + `getByRole`) | Sí, 1 | ✅ **Resuelve todas las ambigüedades detectadas** | `product-detail-add-to-cart.spec.ts:119` | ✅ **El patrón más valioso del módulo** | — |
| Encadenado (`.locator()` anidado) | Sí, 2 | ✅ | `product-detail-add-to-cart.spec.ts:119` | ✅ | — |
| `.filter({ hasText })` | Sí, 1 | ✅ | mismo fichero | ✅ | — |
| `.first()` / `.nth()` / `.last()` | `.first()` ×1 | ✅ Funciona, **oculta la ambigüedad** | `cart-sync.spec.ts:32` | ⚠️ Enseñar **como síntoma, no como solución** | — |
| Locator estricto (strict mode) | Implícito | ✅ **Violación real reproducida** con error literal | `getByRole('link', …)` sobre un producto → **2 elementos** | ✅ **Caso auténtico, no simulado** | — |
| Nombre accesible sin `<label>` | — | ✅ Los inputs lo obtienen del `placeholder` | login y checkout | ✅ Explica por qué dos estrategias devuelven lo mismo | — |
| `combobox` sin nombre accesible | Sí, 1 | ⚠️ `getByRole('combobox')` funciona **solo porque es el único de la página** | `inventory.page.ts:21` | ✅ Caso de **debilidad de mantenibilidad** | — |

## Interactions

| Skill | Existe en repo | Archivo | Nivel actual | Enseñar M01 | Posterior |
|---|---|---|---|---|---|
| `click` | Sí, 21 | toda la suite | Sólido | ✅ | — |
| `fill` | Sí, 5 | `login.page.ts`, `checkout.page.ts` | Sólido | ✅ | — |
| `selectOption` | Sí, 1 | `inventory.page.ts:21` | Básico | ✅ | — |
| `check` / `uncheck` | **No** | — | Ausente | ❌ Sin anclaje ni en la app | — |
| `hover` | **No** | — | Ausente | ⚠️ Mención | — |
| Teclado (`press`, `type`) | **No** | — | Ausente | ⚠️ Mención | — |
| Subida de ficheros | **No** | — | Ausente | ❌ | M09 (capstone, si el journey lo pide) |
| Diálogos | **No** | — | Ausente | ❌ | — |

## Assertions

| Skill | Existe en repo | Archivo | Nivel actual | Enseñar M01 | Posterior |
|---|---|---|---|---|---|
| `toBeVisible` / `not.toBeVisible` | Sí, 53 | toda la suite | Sólido | ✅ | — |
| `toHaveText` | Sí, 46 | toda la suite | Sólido | ✅ | — |
| `toContainText` | Sí, 13 | login, checkout, cart-sync | Sólido | ✅ Y cuándo elegir cada una | — |
| `toHaveURL` | Sí, 24 | toda la suite | Sólido | ✅ Incluye regex vs string | — |
| `toHaveCount` | Sí, 13 | cart-sync, cart-edge-cases, inventory | Sólido | ✅ | — |
| `toHaveValue` | **No** | — | Ausente | ✅ Formulario de checkout lo permite | — |
| `toBeEnabled` / `toBeDisabled` | **No** | — | Ausente | ⚠️ Sin caso claro en la app | — |
| Soft assertions (`expect.soft`) | **No** | — | Ausente | ⚠️ Mención con criterio de uso | M07 |
| Mensajes descriptivos en `expect` | **Sí, casi el 100%** | toda la suite | **Avanzado** | ✅ **Referencia de calidad del módulo** | — |
| Aserciones no web-first (`toEqual`, `toHaveLength`) | Sí, 6 | `inventory.spec.ts` | Sólido | ✅ Distinguirlas de las web-first | — |

## Waiting

| Skill | Existe en repo | Archivo | Nivel actual | Enseñar M01 | Posterior |
|---|---|---|---|---|---|
| Auto-waiting | Sí, toda la suite | 79 tests, 0 esperas explícitas | **Sólido** | ✅ **Núcleo del módulo** | — |
| Timeout por aserción | Sí, 4 | `performance-glitch-user-cart.spec.ts` | Básico | ✅ | M03 (proyecto con timeout propio) |
| Timeouts globales | **No configurados** | `playwright.config.ts` | Ausente | ✅ Saber qué valores por defecto heredas | M03 |
| Esperas de red | **No** | — | Ausente | ❌ | M05 |
| Antipatrón `waitForTimeout` | **Cero en el repo** | — | — | ✅ Enseñar por ausencia y por contraejemplo creado | — |
| Métodos sin reintento (`isVisible`, `textContent`) | Sí, 4 | `problem-user-cart.spec.ts:53,54,77,78` | Antipatrón real | ✅ **Ancla del Lab de troubleshooting** | M04 |

## Test structure

| Skill | Existe en repo | Archivo | Nivel actual | Enseñar M01 | Posterior |
|---|---|---|---|---|---|
| `test.describe` | Sí, 14 | todos los specs | Sólido | ✅ | — |
| `test.beforeEach` | Sí, 13 | todos menos `route-protection` | Sólido | ✅ | — |
| `afterEach` / `beforeAll` / `afterAll` | **No** | — | Ausente | ⚠️ Cuándo harían falta y por qué aquí no | M03 |
| Aislamiento entre tests | Sí, por diseño de Playwright | 79 tests con `page` propia | Sólido | ✅ Demostrable ejecutando en paralelo | M03 |
| Datos de test | Hardcodeados | todos los specs | Básico | ❌ **Reservado a M03** | M03 |
| `test.step` | **No** | — | Ausente | ❌ | M04 |
| Tags y `--grep` | Sí, 10 `@demo-fail` | 10 specs + `package.json` | Sólido | ✅ Uso; la *estrategia* de tags es M07 | M07 |

## Debugging

| Skill | Existe en repo | Archivo | Nivel actual | Enseñar M01 | Posterior |
|---|---|---|---|---|---|
| Informe HTML | Sí | `playwright.config.ts:9-11`, `npm run test:report` | Sólido | ✅ Leerlo e interpretarlo | — |
| Modo headed | Sí | `package.json:9` (`test:headed`) | Sólido | ✅ | — |
| UI mode (`--ui`) | **No hay script** | — | Ausente | ⚠️ Enseñar el comando; el uso profundo es M04 | M04 |
| Trace | Configurado, sin material | `playwright.config.ts:14` | Básico | ⚠️ Saber que existe y cuándo se genera | **M04** |
| Vídeo | Configurado | `playwright.config.ts:15` | Básico | ⚠️ Mención | M04 |
| Screenshots | **No configurado** | — | Ausente | ⚠️ Mención | M04 |
| `codegen` | **No** | — | Ausente | ✅ Como acelerador para escribir el primer test, con su advertencia | — |
| `page.pause()` / Inspector | **No** | — | Ausente | ❌ | M04 |

## Execution

| Skill | Existe en repo | Archivo | Nivel actual | Enseñar M01 | Posterior |
|---|---|---|---|---|---|
| Projects por navegador | Sí, 3 | `playwright.config.ts:17-30` | Sólido | ✅ | — |
| CLI (fichero, `--grep`, `--project`, `--headed`) | Sí, 12 scripts | `package.json` | Sólido | ✅ | — |
| Workers y paralelismo | Sí | `playwright.config.ts:5,8` | Sólido | ✅ Observable: cambiar `--workers=1` y medir | M06 |
| Retries | Sí (solo CI) | `playwright.config.ts:7` | Sólido | ⚠️ Qué son; la política es M07 | M07 |
| Selección de tests (`--grep`, `--grep-invert`) | Sí | `package.json:7-8` | Sólido | ✅ | — |
| Sharding | **No** | — | Ausente | ❌ | M06 |

---

# 5. Learning Objectives

Ocho objetivos. Continúan la numeración conceptual del módulo 00 pero se identifican como **P1-P8** (Playwright) para evitar confusión con O1-O8.

| # | El alumno será capaz de… | Nivel | Evidencia prevista |
|---|---|---|---|
| **P1** | **Ejecutar** la suite del proyecto filtrando por fichero, por navegador y por tag, e **interpretar** el informe HTML distinguiendo un fallo de locator, uno de aserción y uno de la aplicación | 1 FOLLOW | Lab 1 |
| **P2** | **Explicar** por qué la suite no contiene ni una sola espera explícita, y **predecir** qué ocurre si se sustituye una aserción web-first por un método sin reintento | 2 MODIFY | Lab 2, Lab 5 |
| **P3** | **Seleccionar y justificar el locator más apropiado** para un elemento y un contexto dados, valorando robustez, semántica, accesibilidad y mantenibilidad — **no** usar el mayor número posible de estrategias | 4 DESIGN | Lab 3, Challenge |
| **P4** | **Convertir** locators CSS existentes a locators orientados al usuario manteniendo el test en verde, y **medir** qué gana y qué pierde con el cambio | 2 MODIFY | Lab 3 |
| **P5** | **Escribir** un test nuevo, completo y en verde, para un caso funcional **no cubierto** por la suite actual, usando los Page Objects existentes | 3 CREATE | Lab 4 |
| **P6** | **Seleccionar** la aserción adecuada entre `toHaveText`, `toContainText`, `toHaveCount`, `toHaveURL` y `toBeVisible`, y redactar su mensaje descriptivo en lenguaje de negocio | 3 CREATE | Lab 4, Challenge |
| **P7** | **Diagnosticar** un fallo causado por un locator ambiguo, un locator que no encuentra nada o un método sin reintento, y corregir la causa sin tocar la aserción | 5 TROUBLESHOOT | Lab 5 |
| **P8** | **Diseñar** un test E2E completo de varias pantallas a partir de un escenario descrito en lenguaje de negocio, y **justificar** por escrito sus decisiones de locator, aserción y estructura | 4 DESIGN | Challenge |

**Continuidad de O8 (módulo 00):** la competencia de comunicar y justificar no se reintroduce como objetivo nuevo; está incorporada dentro de P3 y P8, que la exigen a un nivel superior (justificar una *elección entre alternativas*, no solo explicar una decisión tomada).

## 🔬 Reorientación de P3 tras la validación

El objetivo P3 estaba redactado como *"elegir entre las cinco estrategias disponibles"*. La validación demuestra que **la cantidad de estrategias no es el criterio**: en SauceDemo `getByLabel` no funciona en ningún elemento, `getByRole` no sirve para los títulos de página, y el `combobox` funciona por casualidad estructural.

El objetivo pasa a ser **seleccionar y justificar el locator más apropiado para cada elemento y contexto**. Los cinco criterios de decisión que el alumno debe manejar:

| Criterio | Pregunta que responde | Ejemplo medido en SauceDemo |
|---|---|---|
| **Robustez** | ¿Sobrevive a un cambio de maquetación? | `.cart_item` (clase de estilo) frente a `[data-test]` |
| **Semántica** | ¿Localiza como lo haría una persona usuaria? | `getByRole('button', { name: 'Login' })` |
| **Accesibilidad** | ¿Qué revela sobre la calidad del HTML? | Cero `<label>` en toda la aplicación |
| **Mantenibilidad** | ¿Seguirá siendo unívoco mañana? | `getByRole('combobox')` funciona hoy porque solo hay uno |
| **Contexto** | ¿Hay ambigüedad que haya que acotar? | 6 botones "Add to cart" idénticos |

Un alumno que use tres estrategias bien elegidas y las justifique supera P3. Uno que use las cinco sin criterio, no.

---

# 6. Repository-to-Learning Mapping

La parte que decide si este módulo es *repository-first* o un tutorial genérico.

| # | Concepto | Archivo real | Código relevante | Qué observará el alumno | Qué aprenderá | Ejercicio potencial |
|---|---|---|---|---|---|---|
| R1 | Anatomía de un spec | `tests/login.spec.ts:1-20` | `import` → `describe` → `beforeEach` → `test` | Los cuatro bloques siempre en el mismo orden, en los 14 ficheros | Que un spec tiene una forma canónica | Identificar los 4 bloques en 3 specs distintos |
| R2 | Configuración del runner | `playwright.config.ts` completo | 31 líneas | Cada opción y su efecto observable al ejecutar | Qué hereda su test sin escribirlo | Cambiar `workers` en el sandbox y medir la diferencia |
| R3 | `baseURL` y rutas relativas | `playwright.config.ts:13` + `pages/login.page.ts:11` | `goto('/')` | Que `'/'` funciona porque hay una `baseURL` | Cómo se cambia de entorno sin tocar tests | Apuntar el sandbox a otra URL y ver qué rompe |
| R4 | Projects y cross-browser | `playwright.config.ts:17-30` + `package.json:10-12` | 3 projects | 79 tests × 3 = 237 ejecuciones | Que un test se escribe una vez y corre en tres motores | Ejecutar el mismo fichero en los 3 y comparar tiempos |
| R5 | Tags y filtrado | 10 specs con `{ tag: '@demo-fail' }` + `package.json:7-8` | `--grep` / `--grep-invert` | Que la suite se puede partir en verde y roja | Selección de tests por criterio | Ejecutar las dos suites y explicar la diferencia |
| R6 | Informe HTML | `playwright.config.ts:9-11` + `npm run test:report` | reporter `html` | El informe de una ejecución con 10 fallos reales | Leer un informe y llegar al test culpable | Localizar en el informe los 10 `@demo-fail` |
| R7 | **Auto-waiting** | Toda la suite: **0 esperas explícitas** en 79 tests | ausencia de `waitForTimeout` | Que nadie espera y aun así todo funciona | Que `await expect(locator)` reintenta hasta el timeout | Añadir un `waitForTimeout(3000)` y medir el coste sin ganancia |
| R8 | Web-first vs no web-first | `tests/problem-user-cart.spec.ts:53,54,77,78` | `.isVisible()`, `.textContent()` | Los 4 únicos métodos de la suite que **no** reintentan | Por qué esos 4 hacen el test dependiente del instante | Convertirlos a aserciones web-first y comparar |
| R9 | Locator por atributo `data-test` | `pages/login.page.ts:7,15-17` | `[data-test="username"]` | La estrategia dominante del proyecto (81 usos) | Por qué `data-test` es resiliente | — (base para R10-R13) |
| R10 | **Locator por rol** 🔬 | `tests/checkout.spec.ts:34` | `getByRole('heading', { name: 'Thank you for your order!' })` | El **único** de la suite. **Validado: es también el único heading real de todo el flujo** | Que los roles funcionan en botones y campos, **y no en los títulos de página** | Convertir a `getByRole` los 3 locators del login y los 4 del checkout — **no** los títulos |
| R11 | Locator por placeholder | **NO EXISTE en el repo** — 🔬 **verificado que funciona en la app: 5 de 5 campos** | — | Que los inputs no tienen `<label>` y su nombre accesible sale del `placeholder` | Por qué `getByRole('textbox', { name: 'Username' })` y `getByPlaceholder('Username')` devuelven el mismo elemento | Escribir el login con ambas y explicar por qué coinciden |
| R11b | **`getByLabel` como caso de diagnóstico** 🔬 | **NO EXISTE y NO PUEDE EXISTIR** — 0 elementos `<label>` en las 5 pantallas | — | Que la estrategia recomendada por la documentación **no aplica aquí** | Que la elección de locator depende del HTML que te dan, no del ideal | **No es un ejercicio de código**: es una pregunta de criterio (ver Lab 3) |
| R12 | `getByTestId` y `testIdAttribute` 🔬 | La opción no está en `playwright.config.ts` — **verificado el contraste: 0 sin configurar, 1 con `testIdAttribute: 'data-test'`** | — | Que el proyecto escribe 81 selectores a mano pudiendo no hacerlo | Que una línea de configuración simplifica 81 selectores | Configurar `testIdAttribute` **en el sandbox de M01** y reescribir un spec |
| R13 | Locator frágil por clase CSS 🔬 | 12 usos de `.cart_item` en 5 specs | `page.locator('.cart_item')` | Que una clase de estilo se usa como contrato de test | Qué distingue un selector de estilo de un contrato de test | **Explicación corregida (V1):** no es una fuga por comodidad. Es el rodeo ante un Page Object roto |
| **R13b** | **Locator que no encuentra nada** 🔬 **NUEVO** | [`pages/cart.page.ts:7`](../../pages/cart.page.ts) — `[data-test="cart-item"]` resuelve **0 elementos**; el DOM real es `<div class="cart_item" data-test="inventory-item">` | `readonly cartItems: Locator` | Que el locator declarado en el POM **no existe en la aplicación**, y que ningún test lo usa | **Que un locator roto es invisible hasta que alguien lo ejecuta** | Base del Lab 5 (ver sección 8). Diagnóstico, **no corrección del proyecto** |
| R14 | Encadenado y filtrado | `tests/product-detail-add-to-cart.spec.ts:117-121` | `.filter({ hasText }).locator('img')` | Cómo se llega a un elemento dentro de una tarjeta | Componer locators en vez de escribir un CSS enorme | Localizar el precio de un producto concreto |
| R15 | `hasText` como opción | `pages/inventory.page.ts:33` | `locator(sel, { hasText: name })` | Otra forma de lo mismo | Que hay dos sintaxis equivalentes | Comparar ambas |
| R16 | `.first()` como síntoma | `tests/cart-sync.spec.ts:32` | `.first()` | El único `.first()` de la suite, en una aserción débil | Que `.first()` **tapa** un locator poco preciso en vez de arreglarlo | Sustituirlo por un locator que identifique el elemento sin ordinal |
| **R16b** | **Strict mode con caso real** 🔬 **NUEVO** | Página de inventario: cada producto tiene **dos** enlaces con el mismo nombre accesible (imagen y título) | `getByRole('link', { name: 'Sauce Labs Backpack' })` → **2 elementos** | El error literal de Playwright, que además sugiere los locators alternativos | Por qué ocurre, cómo identificar la ambigüedad y cómo **acotar** en vez de usar `.first()` | Base del Lab 5 (ver sección 8) |
| **R16c** | **`combobox` sin nombre accesible** 🔬 **NUEVO** | `pages/inventory.page.ts:21` — el `<select>` no tiene `id`, ni `aria-label`, ni `<label>` | `getByRole('combobox')` → 1 elemento | Que funciona **solo porque es el único de la página** | Que un locator puede funcionar hoy y ser frágil mañana: la mantenibilidad no es visible en verde | Discutir qué pasaría si se añade un segundo desplegable |
| R17 | `click` | 21 usos | `pages/*.page.ts` | La interacción dominante | — | — |
| R18 | `fill` | `pages/login.page.ts:15-16`, `pages/checkout.page.ts:17-19` | 5 usos | Rellenar formularios | Formularios reales de dos pantallas | Test de validación de campos |
| R19 | `selectOption` | `pages/inventory.page.ts:21` | 1 uso | Que un desplegable no se maneja con `click` | Interacción específica por tipo de control | Test de la ordenación **A→Z, no cubierta** |
| R20 | Aserciones web-first | `tests/cart-badge.spec.ts` completo | `toHaveText`, `not.toBeVisible`, `toHaveURL`, `toHaveCount` | Cuatro tipos en un solo fichero | Cuál elegir en cada caso | Elegir la aserción correcta para 5 escenarios |
| R21 | `toHaveText` vs `toContainText` | `login.spec.ts:32` (contain) vs `cart-badge.spec.ts:38` (have) | ambos | Que uno es exacto y otro parcial | Cuándo cada uno, y el riesgo de `toContainText` | Justificar por qué el mensaje de error usa `toContainText` |
| R22 | `toHaveURL` con regex y con string | `login.spec.ts:19` (regex) vs `route-protection.spec.ts:10` (string) | ambos | Dos formas en la misma suite | Cuándo hace falta una expresión regular | Convertir una en otra y ver qué cambia |
| R23 | **Mensajes de aserción** | Prácticamente todas las aserciones | 2.º argumento de `expect` | Que un fallo se lee sin abrir el código | Escribir mensajes en lenguaje de negocio | Redactar los mensajes de sus propios tests |
| R24 | Aserciones no web-first | `tests/inventory.spec.ts:27-36` | `toHaveLength`, `toEqual` sobre arrays ya obtenidos | Que hay `expect` que no reintentan | Distinguir aserción sobre UI de aserción sobre datos | Explicar por qué esas no llevan `await` |
| R25 | `beforeEach` y aislamiento | 13 ficheros | `beforeEach` con login por UI | Que cada test arranca limpio | Aislamiento entre tests | Ejecutar 2 tests en paralelo y comprobar que no interfieren |
| R26 | Test sin `beforeEach` | `tests/route-protection.spec.ts` | El único | Que el hook no es obligatorio | Que el hook responde a una necesidad, no a un ritual | Explicar por qué este fichero no lo necesita |
| R27 | Timeout por aserción | `tests/performance-glitch-user-cart.spec.ts:19,28,38,42` | `{ timeout: 15000 }` ×4 | Latencia real de un usuario lento | Cuándo un timeout local está justificado | Bajarlo a 2000 y observar el fallo |
| R28 | Modo headed | `package.json:9` | `--headed` | El navegador ejecutando el test | Que se puede mirar | Ejecutar un test en headed y describir qué ve |
| R29 | Fallos intencionados | 10 tests `@demo-fail` | comentario `⚠️ FALLO INTENCIONADO` | Que la suite está roja a propósito | Que un rojo no siempre es un bug de la app | Clasificar 3 fallos: ¿test o aplicación? *(el diagnóstico completo es M04)* |
| R30 | Hueco de cobertura real | `tests/inventory.spec.ts:23-71` — cubre `za`, `lohi`, `hilo` | **falta `az`** | Que la suite tiene un hueco identificable | Que escribir un test empieza por detectar qué falta | **Base del Lab 4** |
| R31 | UI mode y codegen | **NO EXISTE — no hay script ni uso** · ⚠️ **PENDIENTE DE VALIDACIÓN TÉCNICA** | — | — | Herramientas de asistencia | Generar un test con `codegen` y criticarlo |

**Balance actualizado tras la validación:** 34 anclajes. **29 existen y están verificados en el repositorio o en la aplicación**; 3 requieren material nuevo en el sandbox (R11, R12 y las conversiones de R10), 1 es una pregunta de criterio sin código (R11b) y 1 sigue **sin validar** (R31, codegen).

Los tres anclajes nuevos —R13b (locator muerto), R16b (strict mode real) y R16c (combobox sin nombre)— **han salido de la validación técnica**, no del diseño previo. Los tres son material auténtico que no habría aparecido sin ejecutar contra la aplicación.

---

# 7. Deferred Topics

Decidido contra el [Learning Path aprobado](learning-path.md), no por intuición.

| Tema | Módulo destino | Por qué no en M01 |
|---|---|---|
| **Diseño de Page Objects** | **M02** | En M01 los POM se **usan como caja negra**. Abrir el patrón antes de que el alumno haya escrito tests con locators crudos le impide entender qué problema resuelve el POM |
| `.cart_item` como problema **arquitectónico** (por qué el POM permitió un locator muerto sin que nadie lo notara) | **M02** | En M01 se diagnostica el hecho —el locator resuelve 0 elementos—; en M02 se razona sobre qué falla en la arquitectura para que eso sea posible. ⚠️ **El diseño de M02 debe revisarse antes de construirse: ver V1 en la sección 15** |
| Cobertura duplicada entre specs | M02 | Diseño de suite |
| **Fixtures propios (`test.extend`)** | **M03** | Requiere haber sufrido el `beforeEach` repetido |
| **`storageState` y autenticación reutilizable** | **M03** | En M01 el login por UI es lo normal y no se cuestiona |
| **Gestión de datos de test** | **M03** | En M01 los datos van hardcodeados, como en el proyecto |
| Parametrización de tests | M03 | — |
| Configuración multi-entorno, proyectos con timeout propio | M03 | En M01 solo se **lee** la configuración; se modifica únicamente en el sandbox |
| **Trace viewer en profundidad** | **M04** | M01 solo dice que el trace existe y cuándo se genera |
| **`page.pause()`, Inspector, `test.step`** | **M04** | Herramientas de diagnóstico avanzado |
| **Diagnóstico de los 10 `@demo-fail`** | **M04** | En M01 el alumno los **ve** y aprende que son deliberados; no los diagnostica |
| Flaky vs determinista, política de reintentos | M04 / M07 | M01 menciona que `retries: 2` existe en CI |
| **API testing, `page.route`, mocking** | **M05** | — |
| **CI/CD, GitHub Actions, Docker, sharding** | **M06** | M01 no abre el workflow |
| **Estrategia de tags, quality gates, métricas** | **M07** | M01 **usa** `@demo-fail`; no diseña el esquema de tags |
| Análisis de riesgo, qué automatizar | M07 | — |
| **IA, MCP, agentes, prompts** | **M08** | — |
| Contexto asegurador y journeys de seguros | **M09** | M01 usa escenarios genéricos (sección 14) |
| Interacciones sin anclaje: `check`, subida de ficheros, diálogos, arrastrar | **Ninguno por ahora** | No existen ni en el repositorio ni en SauceDemo. Enseñarlos exigiría inventar ejemplos. Se mencionan en una tabla de "existe pero aquí no lo verás" y se retoman en M09 si el journey del capstone lo pide |
| XPath | Solo mención | Se nombra para desaconsejarlo, con una frase |
| `BrowserContext` y multi-pestaña | Mención en M01, uso en M03 | Se nombra porque explica el aislamiento entre tests |

---

# 8. Proposed Labs

**Cinco Labs.** Diseño, no contenido.

## Lab 1 — La suite real (FOLLOW)

| | |
|---|---|
| **Objetivo** | Ejecutar la suite del proyecto de todas las formas posibles e interpretar lo que devuelve |
| **Skill** | P1 · ejecución, CLI, projects, tags, informe HTML |
| **Archivos reales** | `playwright.config.ts`, `package.json:5-13`, `npm run test:report`, los 10 specs con `@demo-fail` |
| **Dificultad** | Baja |
| **Progresión** | 1 FOLLOW |
| **Duración** | 45 min |
| **Resultado esperado** | Tabla comparativa rellenada por el alumno: 6 formas de ejecución (todo, un navegador, un fichero, un test por `--grep`, suite verde, suite roja) con nº de tests, tiempo y resultado. Y una respuesta escrita: *¿por qué hay 10 fallos y por qué no es un problema?* |
| **Nota de diseño** | Es el primer contacto con el navegador. Aquí es donde se descubrirá si el entorno de HDI permite ejecutar contra SauceDemo (riesgo K1) |

## Lab 2 — Por qué nadie espera (MODIFY)

| | |
|---|---|
| **Objetivo** | Entender el auto-waiting midiendo qué pasa al romperlo |
| **Skill** | P2 · web-first assertions, auto-waiting, métodos sin reintento |
| **Archivos reales** | Toda la suite como evidencia de las **0 esperas explícitas**; `tests/problem-user-cart.spec.ts:53,54,77,78` como contraejemplo; `tests/performance-glitch-user-cart.spec.ts` (latencia real) |
| **Dificultad** | Media |
| **Progresión** | 2 MODIFY |
| **Duración** | 45 min |
| **Resultado esperado** | En el sandbox: un test con `waitForTimeout` que tarda más sin ganar nada; el mismo test sin él; y una versión con `.isVisible()` que falla contra `performance_glitch_user` mientras la web-first pasa. Conclusión escrita en tres líneas |
| **Nota de diseño** | `performance_glitch_user` es el regalo del repositorio: latencia **real**, no simulada. Es la demostración más convincente posible de por qué la aserción reintenta y `isVisible()` no |

## Lab 3 — Elegir el locator correcto (MODIFY → DESIGN) 🔬 REDISEÑADO

> **Cambio de enfoque tras la validación.** El Lab se llamaba *"Las cinco maneras de encontrar un botón"* y su resultado era usar cinco estrategias. Ahora el resultado es **una decisión justificada por elemento**. La validación demostró que en esta aplicación las cinco estrategias no están disponibles ni son equivalentes, y que perseguir la variedad enseñaría el criterio equivocado.

| | |
|---|---|
| **Objetivo** | **Seleccionar y justificar el locator más apropiado** para cada elemento y contexto |
| **Skill** | P3, P4 · robustez, semántica, accesibilidad, mantenibilidad, contexto |
| **Estrategias practicadas** | `getByRole`, `getByPlaceholder`, `getByTestId` (con configuración), CSS por atributo, encadenado/`filter`, strict mode |
| **Estrategias tratadas solo como criterio** | `getByLabel` (no funciona: 0 `<label>` en la app), XPath (funciona y se desaconseja), `.first()` (funciona y oculta el problema) |
| **Archivos reales** | `pages/login.page.ts:7,15-17`; `pages/checkout.page.ts:17-19`; `tests/checkout.spec.ts:34`; `pages/inventory.page.ts:21` (combobox); `playwright.config.ts` (dónde **no** está `testIdAttribute`) |
| **Dificultad** | Media-Alta. **Es el Lab central del módulo** |
| **Progresión** | 2 MODIFY → 4 DESIGN |
| **Duración** | 60 min |
| **Resultado esperado** | Una **tabla de decisión propia**: para cada uno de ~8 elementos, qué locator elige, con cuál de los cinco criterios lo justifica, y qué alternativa descarta. Respaldada por tests en verde en el sandbox. **No se puntúa por número de estrategias usadas** |

### Bloques del Lab (diseño, sin redactar)

| # | Bloque | Anclaje validado | Qué produce el alumno |
|---|---|---|---|
| 3.1 | El login por rol y por placeholder | 🔬 ambos = 1 elemento en los 3 campos | Dos versiones en verde + explicación de por qué coinciden (el nombre accesible sale del `placeholder`) |
| 3.2 | Habilitar `getByTestId` | 🔬 0 sin configurar → 1 con `testIdAttribute: 'data-test'` | La línea de configuración en el sandbox y un spec reescrito |
| 3.3 | **El caso `getByLabel`** | 🔬 0 `<label>` en las 5 pantallas | **No hay código.** Cuatro respuestas escritas: por qué no funciona, qué evidencia del DOM lo demuestra, qué implica para accesibilidad, y qué le pediría al equipo de desarrollo |
| 3.4 | Los títulos de página | 🔬 "Products" y "Your Cart" son `<span>`, no headings | Comprobar que `getByRole('heading', …)` devuelve 0 y decidir la alternativa |
| 3.5 | El combobox que funciona por casualidad | 🔬 sin `id`, sin `aria-label`, único en la página | Argumentar si lo usaría en una suite que va a durar dos años |
| 3.6 | Ambigüedad y acotado | 🔬 6 botones "Add to cart" idénticos | Localizar el de un producto concreto **sin usar `.first()`** |

**Nota de diseño:** el bloque 3.3 es el más valioso y el que no existía en el diseño original. Que la estrategia recomendada por la documentación oficial **no sea aplicable** a la aplicación que tienes delante es una lección de criterio que ningún tutorial da, y aquí es un hecho medido, no un supuesto.

## Lab 4 — El test que falta (CREATE)

| | |
|---|---|
| **Objetivo** | Escribir tests nuevos para un hueco de cobertura **real** |
| **Skill** | P5, P6 · `selectOption`, aserciones, mensajes descriptivos, uso de POM existentes |
| **Archivos reales** | `tests/inventory.spec.ts:23-71` (cubre `za`, `lohi`, `hilo`; **falta `az`**), `pages/inventory.page.ts:20-30` (`sortBy`, `getProductNames`), `specs/test-index.md` (tabla de cobertura) |
| **Dificultad** | Media-Alta |
| **Progresión** | 3 CREATE |
| **Duración** | 60 min |
| **Resultado esperado** | Dos tests nuevos en verde en el sandbox: la ordenación A→Z que nadie cubre, y un segundo caso que el alumno identifique por su cuenta comparando `specs/test-index.md` con la aplicación. Ambos con aserciones bien elegidas y mensajes en lenguaje de negocio |
| **Nota de diseño** | El valor pedagógico está en que **el hueco es auténtico**. El alumno no escribe un test de adorno: cubre algo que el proyecto no cubre, y lo ha encontrado él |

## Lab 5 — El test que a veces pasa (TROUBLESHOOT)

| | |
|---|---|
| **Objetivo** | Diagnosticar fallos causados por locators, no por lógica |
| **Skill** | P7 · ambigüedad (strict mode), locator que no encuentra nada, método sin reintento, `.first()` como síntoma |
| **Archivos reales** | 🔬 **Dos casos auténticos descubiertos en la validación** (abajo), más `tests/cart-sync.spec.ts:32` (`.first()`) y `tests/problem-user-cart.spec.ts:53-66` (`isVisible()`) |
| **Dificultad** | Alta |
| **Progresión** | 5 TROUBLESHOOT |
| **Duración** | 50 min |
| **Resultado esperado** | Informe de diagnóstico con el formato del Lab 4 de M00 (síntoma / causa raíz / corrección / cómo evitarlo) para cada caso, **escrito antes de tocar nada**, y las correcciones aplicadas en el sandbox sin modificar aserciones |

### Los dos casos reales 🔬

**Caso A — Ambigüedad (strict mode).** Cada producto del catálogo tiene **dos** enlaces con el mismo nombre accesible: el de la imagen y el del título. `getByRole('link', { name: 'Sauce Labs Backpack' })` resuelve a 2 elementos y Playwright lanza:

```
Error: strict mode violation: getByRole('link', { name: 'Sauce Labs Backpack' })
resolved to 2 elements:
  1) <a href="#" id="item_4_img_link" data-test="item-4-img-link">…</a>
  2) <a href="#" id="item_4_title_link" data-test="item-4-title-link">…</a>
```

**Recorrido pedagógico obligatorio, en este orden:** entender *por qué* ocurre → identificar *dónde* está la ambigüedad → **acotar** el locator → justificar la solución.

> **Prohibido enseñar `.first()` como la respuesta.** `.first()` hace desaparecer el error sin resolver la ambigüedad: el test seguirá pulsando "uno de los dos", y el día que cambie el orden del DOM pulsará el otro. Es exactamente el mismo antipatrón que `tests/cart-sync.spec.ts:32`. La conversación de cierre del Lab es: *"el error ha desaparecido — ¿ha desaparecido el problema?"*

**Caso B — Locator que no encuentra nada.** [`pages/cart.page.ts:7`](../../pages/cart.page.ts) declara `cartItems` como `[data-test="cart-item"]`. Ese atributo **no existe**: resuelve a 0 elementos, siempre. El DOM real es `<div class="cart_item" data-test="inventory-item">`.

El alumno recibe un test que usa `CartPage.cartItems` y falla. Lo interesante no es la corrección, sino las tres preguntas:

1. ¿Por qué el fallo dice "expected 1, received 0" y no "locator no encontrado"?
2. **¿Por qué nadie lo detectó en 47 commits?** *(porque ningún test usa ese locator: un locator roto es invisible hasta que alguien lo ejecuta)*
3. ¿Qué tiene esto que ver con que 5 specs usen `.cart_item` directamente?

**Ninguna corrección se aplica sobre `pages/cart.page.ts`.** El defecto se conserva como material didáctico, conforme a las reglas del programa. El alumno trabaja en su copia del sandbox.

**Nota de diseño:** el Lab mejora respecto al original. Tenía tres fallos que había que fabricar; ahora tiene **dos casos auténticos del proyecto y la aplicación real**, con mensajes de error literales. El diagnóstico con trace viewer sigue reservado a M04.

## Lab opcional (solo grupos INTERMEDIATE/ADVANCED)

**Lab 6 — Codegen y su letra pequeña** (30 min, nivel 2 MODIFY): generar un test con `npx playwright codegen`, ejecutarlo, y **criticarlo** — qué locators eligió, cuáles cambiarías y por qué. Refuerza P3 con una herramienta que el alumno usará en su trabajo diario y que el repositorio no documenta.

> ⚠️ **PENDING TECHNICAL VALIDATION.** `codegen` **no se ha ejecutado** en la validación de la Fase 3A.1. No se sabe qué estrategia de locator elige contra SauceDemo, que es justamente el objeto del Lab. **Validar antes de construirlo o descartarlo.**

---

# 9. Proposed Challenge

## Challenge — Compra completa con validación de importes

**Nivel:** 3 CREATE + 4 DESIGN · **Duración estimada:** 75 min · **Objetivos:** P3, P5, P6, P8

### Escenario (redactado en lenguaje de negocio, sin pasos técnicos)

> Un cliente entra en la tienda, añade dos productos de precios distintos, revisa el carrito, completa sus datos de envío y finaliza la compra. Antes de confirmar, quiere ver desglosados el subtotal, los impuestos y el total, y que las cifras cuadren. Si se equivoca al rellenar sus datos, la aplicación debe decírselo con claridad.

### Qué se le pide

Diseñar y escribir la cobertura de ese escenario. El alumno decide cuántos tests, cómo repartirlos y qué verificar en cada uno.

### Restricciones

1. Todo en `learning/student/sandbox/01-playwright/`; no se toca `tests/` ni `pages/`.
2. Puede usar los Page Objects existentes o locators directos, pero debe **justificar la elección**.
3. **Al menos tres estrategias de locator distintas** entre todos sus tests, cada una justificada.
4. Ninguna espera explícita.
5. Todas las aserciones con mensaje descriptivo en lenguaje de negocio.
6. Al menos un caso negativo (datos incompletos) y uno de valor límite.
7. Verde en los tres navegadores.

### Criterios de aceptación

| # | Criterio |
|---|---|
| AC1 | El flujo completo login → catálogo → carrito → checkout → confirmación está cubierto |
| AC2 🔬 | Los tres importes (subtotal, impuestos, total) se verifican **con valores**, no solo con visibilidad — a diferencia de `tests/checkout.spec.ts:102-118`, que solo comprueba que son visibles. **Cuantificado en la validación:** con un producto de `$29.99` la aplicación muestra `Tax: $2.40` y `Total: $32.39`, es decir un impuesto del **8 %** redondeado a 2 decimales |
| AC3 | Hay al menos un test negativo de validación de formulario |
| AC4 | Tres o más estrategias de locator, con tabla de justificación |
| AC5 | Verde en chromium, firefox y webkit |
| AC6 | `decisiones.md`: por qué esos locators, por qué ese reparto en tests, y qué **no** ha automatizado y por qué |

### Por qué este escenario

- Es el flujo E2E más largo de la aplicación y toca las cinco pantallas. 🔬 **Recorrido entero durante la validación, sin incidencias.**
- **AC2 cubre un hueco real de la suite**: `checkout.spec.ts` verifica que los importes se ven, no que sean correctos. El alumno mejora la cobertura del proyecto, no la repite. 🔬 **El cálculo del 8 % está confirmado contra la aplicación**, así que el criterio es verificable y no depende de un supuesto.
- Es genérico (compra online) pero se traduce directamente a un flujo de contratación de seguro, lo que prepara el terreno para M09 sin convertir M01 en un módulo de seguros.
- AC6 mantiene viva la competencia de justificación de M00 (O8) al nivel P8.

**Menos instrucciones que los Labs, deliberadamente:** ni pasos, ni ficheros indicados, ni número de tests prescrito.

---

# 10. Assessment Design

Mismo esqueleto que el módulo 00 —lo que reduce la carga cognitiva de la evaluación— pero **desplazado hacia la práctica**.

| Parte | Contenido | Puntos | Tiempo |
|---|---|---|---|
| **A — Conceptual** | 8 preguntas de respuesta corta | 30 | 15 min |
| **B — Práctica** | 2 ejercicios ejecutables | 70 | 40 min |
| **C — Defensa técnica** | 1 defensa sobre un test propio | apto / no apto | 5-10 min, dentro de una revisión |

**Nota mínima: 70/100** y **apto en la Parte C**. Es el mismo umbral que M00, pero con solo un 30% conceptual frente al 40% del módulo anterior: la progresión del programa es hacia el hacer.

## Áreas y peso

| Área | Peso | Objetivos que cubre |
|---|---|---|
| Estrategia de locators y su justificación | **30%** | P3, P4 |
| Aserciones y auto-waiting | 25% | P2, P6 |
| Escritura de un test completo | 25% | P5, P6 |
| Diagnóstico de fallos de locator/espera | 15% | P7 |
| Ejecución, configuración e informes | 5% | P1 |

El 30% de locators es deliberado y refleja el hallazgo del análisis: es donde el repositorio tiene el hueco más grande y donde el alumno aporta más valor a su equipo el primer día.

## Parte A — Conceptual (30 p, ~4 p por pregunta)

Áreas previstas, sin redactar todavía: jerarquía de locators y cuándo romperla; qué hace exactamente `await expect(locator).toBeVisible()` frente a `await locator.isVisible()`; por qué el proyecto no tiene ninguna espera explícita; `toHaveText` vs `toContainText`; qué significa el error de strict mode; qué se hereda de `playwright.config.ts` sin escribirlo; cuándo `.first()` es una señal de alarma; qué diferencia hay entre un test rojo por fallo de la aplicación y uno rojo por locator obsoleto.

**Formato exigido en al menos tres preguntas:** dar código real del repositorio y pedir una decisión, no una definición — el aprendizaje que dejó la reformulación de P8 en el módulo 00.

## Parte B — Práctica (70 p)

**E1 — Escribir (40 p).** Un caso funcional descrito en lenguaje de negocio, sin indicar pantallas ni selectores. El alumno escribe el test completo en el sandbox y debe quedar verde en al menos un navegador. Reparto previsto: elección y justificación de locators 12 · aserciones adecuadas 10 · mensajes descriptivos 6 · estructura y aislamiento 6 · test en verde 6.

**E2 — Diagnosticar (30 p).** Dos tests que fallan por causas distintas de localización o sincronización (no de lógica). Diagnóstico escrito con el formato de M00 y corrección **sin tocar aserciones**. Reparto previsto: diagnóstico 1 → 10 · diagnóstico 2 → 10 · correcciones en el sitio correcto → 8 · ambos en verde → 2.

> **Penalización heredada de M00:** modificar una aserción para llegar a verde resta 12 puntos aunque el test pase. Se mantiene sin excepciones.

## Parte C — Defensa técnica

Continuidad directa de la Parte C de M00, con la pregunta central subida de nivel: en lugar de *"¿qué hiciste y por qué?"*, aquí es **"¿por qué ese locator y no otro, y qué pasaría si la aplicación cambia?"**.

## Relación con los objetivos

| Objetivo | Dónde se evalúa |
|---|---|
| P1 | Parte A (configuración e informes), validación de E1 |
| P2 | Parte A, E2 |
| P3 | Parte A, E1 (justificación), Parte C |
| P4 | Parte A, E1 |
| P5 | **E1** |
| P6 | E1 |
| P7 | **E2** |
| P8 | Challenge + Parte C |

**Sin huecos**: los 8 objetivos tienen instrumento. P8 se evalúa por el Challenge, no por el assessment, igual que en M00 se hizo con la parte de diseño.

---

# 11. Duration

Estimado con el método que corrigió la duración de M00: tiempo de ejercicio puro + apertura + teoría + puestas en común + revisión + margen para bloqueos.

## Caso de referencia (perfil FOUNDATION dominante)

**SESSION TIME — 7 h en 3 sesiones**

| Sesión | Contenido | Horas |
|---|---|---|
| **1** | Apertura + teoría (runner, config, ejecución) + Lab 1 + Lab 2 + puestas en común | 3 h |
| **2** | Teoría de locators + **Lab 3** + puesta en común + arranque del Lab 4 | 2 h 30 |
| **3** | Lab 5 + revisión del Challenge + Parte C | 1 h 30 |

**SELF-STUDY TIME — 4 h**

| Tarea | Horas |
|---|---|
| Lectura previa de la teoría | 0 h 45 |
| Terminar el Lab 4 | 0 h 45 |
| Challenge | 1 h 15 |
| Repaso y registro de avance | 0 h 30 |
| Margen | 0 h 45 |

**ASSESSMENT TIME — 1 h** (15 min parte A + 40 min parte B; la C va dentro de la sesión 3)

**TOTAL ESTIMATED WORKLOAD — 12 h**

## Por nivel de entrada

| Nivel | Session | Self-study | Assessment | **Total** | Ajuste |
|---|---|---|---|---|---|
| **BEGINNER** | 9 h (4 sesiones) | 5 h 30 | 1 h | **15 h 30** | Teoría troceada; Lab 3 en dos partes; Lab 5 acompañado; el Lab opcional no se hace |
| **FOUNDATION** | 7 h (3 sesiones) | 4 h | 1 h | **12 h** | Caso de referencia |
| **INTERMEDIATE** | 5 h 30 (2 sesiones) | 3 h | 1 h | **9 h 30** | Teoría comprimida; entra el Lab 6 opcional (codegen) |
| **ADVANCED** | 3 h (1 sesión) | 2 h | 1 h | **6 h** | Solo Labs 3 y 5 + Challenge; el resto por su cuenta; rol de mentor |

## Comparación con la estimación aprobada

El [Learning Path](learning-path.md) asigna a M01 **6 h + 3 h = 9 h**. Esta estimación se mantiene en **12 h** para el caso de referencia, pero **la justificación cambia tras la validación**:

| # | Motivo original | Estado tras la validación 🔬 |
|---|---|---|
| 1 | **La instalación de navegadores es tiempo de sesión.** `npx playwright install` descarga ~500 MB | ✅ **Se mantiene.** No se ha medido (los navegadores ya estaban en caché), y sigue siendo el coste fijo más alto del arranque |
| 2 | **El Lab 3 es más caro de lo previsto** | ✅ **Se mantiene, con otro motivo.** Ya no es "escribir cinco alternativas": es construir una tabla de decisión con seis bloques, uno de ellos sin código (el caso `getByLabel`). El coste es de diseño del enunciado, no de volumen de código |
| 3 | **La suite tarda** | ❌ **INVALIDADO.** Medido: **79 tests en Chromium en 21,8 s**; los tres navegadores, ~60-75 s. No es un cuello de botella. El riesgo K8 baja a LOW |

**Las 12 h no se reducen todavía**, aunque el motivo 3 haya caído. Dos razones:

- El tiempo que libera la ejecución rápida lo absorbe el Lab 3 rediseñado, que ahora incluye trabajo escrito de justificación.
- **La duración solo se puede validar con alumnos reales.** Es exactamente lo que pasó en M00: la estimación de diseño (6 h) subió a 8,75 h al construir el material, y sigue sin haberse contrastado con un grupo.

**La duración definitiva se fija tras el piloto**, no en este documento. Es el mismo compromiso que quedó abierto en la revisión de M00.

---

# 12. Pedagogical Progression

## Qué puede hacer al terminar M01 que no podía al terminar M00

| Al terminar M00 | Al terminar M01 |
|---|---|
| Lee un spec y entiende qué hace | **Escribe** un spec nuevo que pasa |
| Sabe que existen locators | **Selecciona el más apropiado** para cada elemento y lo justifica con criterios de robustez, semántica, accesibilidad y mantenibilidad |
| Entiende `await` | Entiende **por qué la aserción reintenta** y qué métodos no lo hacen |
| Ejecuta ejercicios de lógica sin navegador | Ejecuta la suite real, en tres navegadores, filtrando |
| Diagnostica fallos de lógica (`sort`, `await`, mutación) | Diagnostica fallos de **localización y sincronización** |
| Justifica una decisión que ya tomó | Justifica una **elección entre alternativas** |
| Ve un fallo en la terminal | Lee un **informe HTML** con 10 fallos y llega al test culpable |

## Distribución de niveles

| Nivel | Peso en M01 | Dónde |
|---|---|---|
| 1 FOLLOW | 15% | Lab 1 |
| 2 MODIFY | 30% | Labs 2 y 3 |
| 3 CREATE | 30% | Lab 4, Challenge, E1 |
| 4 DESIGN | 15% | Lab 3 (tabla de decisión), Challenge, Parte C |
| 5 TROUBLESHOOT | 10% | Lab 5, E2 |

**Comparado con M00** (dominante FOLLOW, con un pico TROUBLESHOOT al final), M01 desplaza el centro de gravedad a MODIFY/CREATE. El nivel 5 baja de peso porque el troubleshooting profundo es el módulo 04; aquí solo se mantiene vivo.

**Regla que se respeta:** el módulo empieza en FOLLOW aunque su nivel dominante sea superior. El Lab 1 no pide escribir nada.

---

# 13. Traceability Matrix

🔬 Actualizada tras la validación. La columna **Repositorio** marca con 🔬 los anclajes verificados contra la aplicación real.

| Objetivo | Concepto | Repositorio / evidencia | Lab | Challenge | Assessment |
|---|---|---|---|---|---|
| **P1** Ejecutar e interpretar | CLI, projects, tags, informe HTML | R2, R4, R5, R6, R28 · 🔬 suite medida: 79 tests, 21,8 s, 69/10 | **Lab 1** | (uso implícito) | Parte A + validación de E1 |
| **P2** Auto-waiting | Web-first vs sin reintento | R7, R8, R27 | **Lab 2**, Lab 5 | AC (sin esperas explícitas) | Parte A, **E2** |
| **P3** **Seleccionar y justificar** el locator | 5 criterios de decisión, no 5 estrategias | R9, R10🔬, R11🔬, **R11b🔬**, R12🔬, R13🔬, R14, R16, **R16b🔬**, **R16c🔬** | **Lab 3** (6 bloques) | **AC4** | Parte A, E1, **Parte C** |
| **P4** Convertir locators | CSS → orientado al usuario | R10🔬, R11🔬, R12🔬 | **Lab 3** (bloques 3.1, 3.2) | AC4 | Parte A, E1 |
| **P5** Escribir un test nuevo | Cobertura de un hueco real | R19, R30 · 🔬 el `<select>` y sus 4 opciones confirmados | **Lab 4** | AC1, AC3 | **E1** |
| **P6** Elegir aserción y mensaje | 5 aserciones + mensajes de negocio | R20, R21, R22, R23, R24 | Lab 4 | **AC2** 🔬 (importes cuantificados) | E1 |
| **P7** Diagnosticar | Ambigüedad, locator muerto, sin reintento | R8, R16, **R13b🔬**, **R16b🔬** | **Lab 5** (2 casos reales) | — | **E2** |
| **P8** Diseñar un E2E | Escenario de negocio → tests | R14, R18, R19, R20 · 🔬 flujo completo recorrido | (preparado por Labs 3-4) | **Challenge completo** | Parte C |

## Auditoría de huecos

| Comprobación | Resultado |
|---|---|
| ¿Algún objetivo se enseña pero no se practica? | **No.** Los 8 tienen Lab o Challenge |
| ¿Algún objetivo se practica pero no se evalúa? | **No.** Los 8 aparecen en assessment, Challenge o Parte C |
| ¿Algo se evalúa sin haberse enseñado? | **No.** 🔬 La dependencia crítica que señalaba el diseño original **queda resuelta**: R11 (`getByPlaceholder`) y R12 (`testIdAttribute`) están verificados y son construibles en el sandbox. `getByLabel` sale de la lista de estrategias evaluables y pasa a R11b como pregunta de criterio |
| **¿Alguna actividad depende de una afirmación que la validación demostró falsa?** 🔬 | **No, tras esta actualización.** Seis afirmaciones se han corregido: ver la tabla de control de cambios al final |
| ¿Hay anclajes del repositorio sin usar? | Sí, y es correcto: R15, R17, R25, R26, R29 sirven de apoyo en la teoría sin generar ejercicio propio |
| ¿Se cuela contenido de módulos posteriores? | No. Verificado contra la sección 7 |

---

# 14. HDI Context

El módulo 01 **no** se convierte en un módulo de seguros. La instrucción del programa es clara y el análisis la respalda: el alumno tiene que dominar la herramienta antes de aplicarla a un dominio.

**Qué se hace en su lugar:**

1. **Los escenarios se redactan en lenguaje de negocio, no técnico.** El Challenge dice "un cliente añade dos productos y quiere ver el desglose de importes", no "escribe un test que verifique `subtotalLabel`". Es el hábito que M09 exigirá con journeys de seguros.
2. **Los tipos de escenario elegidos son los que se repiten en cualquier aplicación de seguros:** autenticación, navegación entre pantallas, formulario multi-paso con validaciones, mensajes de error, verificación de importes calculados y flujo E2E completo. Un checkout de e-commerce y una contratación de póliza tienen la misma forma.
3. **Se nombra el paralelismo una vez, sin forzarlo.** Una nota en la teoría del tipo: *"este formulario de checkout de dos pasos con validación por campo es estructuralmente idéntico a un formulario de alta de póliza; lo que aprendas aquí se traslada directamente"*. Una frase, no una sección.
4. **Verificación de importes = cálculo de prima.** El AC2 del Challenge (comprobar que subtotal + impuestos = total) es el ejercicio genérico más cercano a validar el cálculo de una prima, que será el corazón del capstone.
5. **Nada de procesos internos de HDI.** No se inventan ramos, productos, coberturas ni flujos. Cuando HDI aporte los suyos, se sustituyen los escenarios sin tocar la estructura del módulo.

---

# 15. Risks

## 15.1 Hallazgos de la validación técnica 🔬

Cinco hallazgos nuevos, todos medidos. Detalle completo en [`module-01-technical-validation.md`](module-01-technical-validation.md), sección 8.

| # | Hallazgo | Impacto | Estado en este diseño |
|---|---|---|---|
| **V1** | **`CartPage.cartItems` está roto.** [`pages/cart.page.ts:7`](../../pages/cart.page.ts) declara `[data-test="cart-item"]` y ese atributo **no existe**: resuelve a **0 elementos**. El DOM real es `<div class="cart_item" data-test="inventory-item">`. Ningún test lo usa; los 12 usos de `.cart_item` en 5 specs son el rodeo | **HIGH** | ✅ **Incorporado.** Nuevo anclaje R13b; caso B del Lab 5; explicación de R13 corregida. ⚠️ **Pendiente: revisar el diseño de M02** (ver 15.3) |
| **V2** | `getByLabel` **no funciona en ninguna pantalla**: 0 elementos `<label>` en toda la aplicación | **MEDIUM** | ✅ **Incorporado.** Sale de las estrategias practicables; entra como R11b y bloque 3.3 del Lab 3, sin código |
| **V3** | `getByRole('heading', …)` **solo funciona en la confirmación**. "Products" y "Your Cart" son `<span data-test="title">` | **LOW** | ✅ **Incorporado.** R10 corregido; bloque 3.4 del Lab 3 |
| **V4** | El `combobox` **no tiene nombre accesible**: funciona solo por ser el único de la página | **LOW** | ✅ **Incorporado.** Nuevo anclaje R16c; bloque 3.5 del Lab 3 |
| **V5** | Nombres accesibles inesperados: el botón Cancel se llama **"Go back Cancel"** | **LOW** | ✅ **Incorporado** como ejercicio corto dentro del Lab 3 |

### V1 — Por qué cambia la narrativa, no solo el dato

El diseño original describía `.cart_item` como una **fuga del Page Object**: tests que se saltan el POM por comodidad. **Es al revés.** El Page Object declara un locator que no encuentra nada, y los tests lo esquivan porque no les queda otra.

La diferencia importa pedagógicamente: la lección ya no es *"usa siempre el POM"*, sino **"un locator que no encuentra nada es invisible hasta que alguien lo ejecuta"**. Es una lección mejor, y es verdad.

**El defecto no se corrige.** Se conserva como material, conforme a las reglas del programa.

## 15.2 Riesgos del diseño, revaluados

| # | Riesgo | Impacto anterior | **Impacto ahora** | Motivo |
|---|---|---|---|---|
| **K1** | **El entorno de HDI no permite ejecutar contra `saucedemo.com` ni descargar navegadores.** M00 estaba blindado (sin red, sin navegador); M01 **no puede estarlo** | HIGH | **HIGH — sin cambios** | 🔬 Validado **en el equipo de desarrollo**: DNS, HTTPS 200, login, flujo completo, 3 navegadores, 79 tests en 21,8 s. **No validado en HDI**, que es donde estaba el riesgo. La aplicación está en **GitHub Pages**: la política de red que permita `github.io` cubre a la vez SauceDemo y el GitHub del módulo 06 |
| **K2** | **Los locators propuestos no funcionan como se supone** | HIGH | **✅ RESUELTO** | 🔬 20 elementos × 7 estrategias sondeados contra el DOM real. Los locators recomendados están confirmados uno a uno |
| **K3** | **Demasiado contenido** | HIGH | **HIGH — sin cambios** | La validación no reduce el temario. La regla sigue en pie: sin anclaje **y** sin objetivo P1-P8, el concepto se cae |
| **K4** | **El repositorio no da ejemplos de todas las estrategias** | MEDIUM | **LOW** ↓ | 🔬 `getByRole`, `getByPlaceholder` y `getByTestId` funcionan y son construibles en el sandbox. Solo `getByLabel` queda sin anclaje, y ya no se necesita: pasa a ser pregunta de criterio |
| **K8** | **La suite tarda y frustra** | MEDIUM | **✅ LOW** ↓ | 🔬 79 tests en Chromium en **21,8 s**. La restricción de usar solo `--project=chromium` deja de ser necesaria por tiempo; sigue siendo recomendable con 10 alumnos simultáneos, por cortesía con un servicio público gratuito |
| **K13** | **El sandbox de M01 necesita configuración nueva** | LOW | **LOW — confirmado y concretado** | 🔬 Necesita exactamente: `baseURL`, los 3 projects de navegador y **`testIdAttribute: 'data-test'`** |

## 15.3 Riesgos sin cambios tras la validación

| # | Riesgo | Impacto | Recomendación |
|---|---|---|---|
| **K5** | **Introducir POM demasiado pronto.** El alumno usa los 6 Page Objects desde el Lab 1 y va a preguntar qué son | **MEDIUM** | Respuesta preparada en la teoría, en tres líneas: "son clases que envuelven locators; en M01 los usas, en M02 los diseñas". Y el Lab 4 obliga a escribir locators directos **además** de usar POM, para que sienta la diferencia antes de que se la expliquen |
| **K6** | **Labs demasiado guiados.** El defecto que se corrigió en M00 | **MEDIUM** | Progresión explícita en el número de pasos: Lab 1 con pasos numerados, Lab 3 con objetivos por bloque, Lab 4 sin pasos para el segundo test, Challenge sin pasos. Y prohibido que un Lab se resuelva copiando del anterior |
| **K7** | **Assessment demasiado sencillo.** Riesgo real: es fácil escribir 8 preguntas de definición | **MEDIUM** | Aprendizaje de M00 aplicado desde el diseño: **mínimo tres preguntas de la parte A deben dar código y pedir una decisión**, no una definición. Y la parte B pesa 70 |
| **K9** | **Los 10 fallos intencionados confunden.** El alumno ve rojo y cree que ha roto algo | **MEDIUM** | Se explica en los primeros 15 minutos del Lab 1, con `test:demo:green` y `test:demo:fail` como demostración. 🔬 Confirmado: la suite da exactamente **69 verdes y 10 rojos** en Chromium. Y se le dice explícitamente que **los diagnosticará en M04** |
| **K10** | **SauceDemo cambia durante el curso** y algún Lab deja de funcionar | **MEDIUM** | Verificación semanal antes de cada sesión, ya prevista en la guía del formador. **Ahora es más importante:** tres anclajes del módulo (R13b, R16b, R16c) dependen de detalles concretos del DOM |
| **K11** | **Repetir M00.** Volver a explicar `await` o clases | **LOW** | La sección 2.2 lo prohíbe explícitamente. Comprobación en la revisión: si la teoría de M01 menciona `async`, `readonly` o `map`, sobra |
| **K12** | **Depender de conocimientos no enseñados** | **LOW** | La matriz de trazabilidad (sección 13) ya audita esto. Repetir la auditoría al terminar de construir |
| **K14** 🆕 | **Codegen sin validar.** El Lab 6 asume un comportamiento de `codegen` que no se ha comprobado | **LOW** | Marcado como *PENDING TECHNICAL VALIDATION*. Validar antes de construirlo, o descartar el Lab |

## 15.4 Impacto sobre el diseño de M02 (fuera del alcance de esta fase)

**El diseño de M02 incluye un ejercicio que la validación invalida.** Preveía sustituir los 12 usos de `.cart_item` por `CartPage.cartItems`; hacerlo **rompería los cinco specs afectados**, porque ese locator resuelve a 0 elementos.

Queda **registrado como pendiente**, no resuelto: corresponde a la fase de diseño de M02, no a esta. La sustitución correcta sería por `[data-test="inventory-item"]`, y el ejercicio interesante ya no es la sustitución sino **por qué el defecto sobrevivió 47 commits sin que nadie lo notara**.

---

# 16. Recommendations

1. ~~**Verificar el entorno y los locators antes de escribir una línea de material**~~ ✅ **HECHO** (Fase 3A.1). K2 resuelto; K1 validado en el equipo de desarrollo pero **pendiente en HDI**.

2. **Construir el Lab 3 primero, no el Lab 1.** Sigue siendo la recomendación, y ahora con más motivo: es el Lab que más ha cambiado tras la validación y el único con un bloque sin código (3.3).

3. **Presupuestar el material didáctico nuevo, ya acotado.** Solo tres piezas se construyen desde cero en el sandbox: los ejemplos de `getByPlaceholder` (R11), la configuración de `testIdAttribute` (R12) y las conversiones de `getByRole` (R10). Es menos de lo que preveía el diseño original.

4. **Mantener el esqueleto de M00.** Mismo formato de Lab, mismas tres reglas, misma estructura de assessment con partes A/B/C, misma zona de trabajo. La carga cognitiva debe ir al contenido nuevo, no a aprender un formato nuevo.

5. **Aplicar desde el diseño las dos lecciones de la revisión de M00:** preguntas de assessment que exigen decidir sobre código real (no definir), y duración estimada con margen para bloqueos incluido.

6. **Decidir ya el nombre de la carpeta del sandbox** (`01-playwright/`) y su configuración, que la validación concretó: `baseURL`, 3 projects y `testIdAttribute: 'data-test'`.

7. **No añadir un sexto Lab obligatorio.** Cinco más uno opcional es lo que cabe en 7 horas de sesión. La tentación de cubrir `hover`, teclado y diálogos hay que resistirla: no hay anclaje real.

8. 🆕 **Validar `codegen` antes de comprometer el Lab 6**, o descartarlo. Es el único elemento del diseño que sigue apoyado en un supuesto.

9. 🆕 **Revisar el diseño de M02 antes de construirlo** (ver 15.4). El ejercicio de `.cart_item` que preveía rompería cinco specs.

10. 🆕 **No propagar todavía los hallazgos V1-V5 al material del módulo 00.** El módulo 00 no menciona locators de la aplicación, así que no le afectan; el análisis de Fase 1 sí contiene la descripción incorrecta de A1, y corregirlo es una edición que conviene hacer de forma consciente y no como efecto colateral.

---

# 17. Proposed Module Structure

Estructura prevista, **no creada**. Idéntica a la de M00 salvo los dos añadidos marcados.

```
learning/modules/01-playwright-fundamentals/
├── README.md                    Objetivo, contenido, puesta en marcha, duración, trazabilidad
├── learning-objectives.md       Los 8 objetivos P1-P8 con su instrumento
├── theory.md                    El 20% teórico (~300 líneas máx.)
├── repository-mapping.md        Los 31 anclajes de la sección 6
├── locator-reference.md         ⭐ NUEVO — tabla de decisión de locators, específica del proyecto
├── labs/
│   ├── README.md
│   ├── lab-1-suite-real.md
│   ├── lab-2-auto-waiting.md
│   ├── lab-3-locators.md
│   ├── lab-4-test-que-falta.md
│   ├── lab-5-troubleshoot.md
│   └── lab-6-codegen.md         (opcional, INTERMEDIATE/ADVANCED)
├── challenges/
│   ├── README.md
│   └── challenge-1-compra-completa.md
└── assessment/
    └── README.md                Partes A, B y C

learning/student/sandbox/01-playwright/
├── playwright.config.ts         ⭐ NUEVO — 🔬 contenido concretado por la validación:
│                                   baseURL + 3 projects + testIdAttribute: 'data-test'
└── (ficheros de ejercicio por Lab)

learning/solutions/01-playwright-fundamentals/
├── README.md
├── lab-1.md … lab-5.md
├── challenge-1.md
└── assessment-key.md            🔒

learning/trainer/session-plans/
└── session-03-module-01.md      (3 sesiones; numeración a partir de las 2 de M00)
```

**Dos diferencias respecto a M00, ambas justificadas:**

- **`locator-reference.md`**: una tabla de decisión —para cada tipo de elemento de SauceDemo, qué estrategia usar y por qué— que el alumno se lleva a su trabajo. Es el entregable con más valor práctico inmediato del módulo, y no encaja ni en la teoría ni en un Lab.
- **Configuración de sandbox propia**: el sandbox actual no tiene `baseURL` ni projects de navegador porque M00 no los necesitaba. M01 sí. Va en su propia carpeta para que los ejercicios de M00 sigan ejecutándose sin navegador.

---

## RECOMMENDED NEXT STEP

**No se ha construido nada del módulo 01.** Este documento sigue siendo solo el diseño, ahora contrastado con la aplicación real.

### Resuelto en la Fase 3A.1

| Punto | Estado |
|---|---|
| ~~Verificación de locators (K2)~~ | ✅ **RESUELTO** — 20 elementos × 7 estrategias medidos |
| ~~El alcance de la estrategia de locators~~ | ✅ **RESUELTO por los datos** — la pregunta "¿cinco estrategias o tres?" estaba mal planteada. No se enseña un número de estrategias: se enseña a **elegir con cinco criterios**. `getByLabel` queda fuera porque la aplicación no lo permite |

### Sigue bloqueante

**Verificación del entorno en HDI (K1).** Es lo único que puede cambiar el diseño de los cinco Labs. Tres comandos en un equipo corporativo:

```bash
npm ci
npx playwright install
npx playwright test --project=chromium tests/login.spec.ts
```

Si funciona, K1 pasa a PASS y M01 se construye tal y como está diseñado aquí. Si falla, hay que activar el plan B —página HTML local servida con `webServer` en el sandbox—, que **conserva el diseño pedagógico pero encarece la construcción** y hace perder los anclajes reales de accesibilidad.

### Decisiones pendientes

1. **La duración.** Se mantienen 12 h. La validación tumbó uno de los tres motivos (la suite tarda 21,8 s, no minutos), pero el tiempo liberado lo absorbe el Lab 3 rediseñado. **La cifra definitiva sale del piloto con alumnos**, igual que quedó pactado en M00.
2. **El Lab 6 (codegen).** Sigue sin validar. Validarlo o descartarlo.
3. **Los ocho objetivos P1-P8 y el reparto del assessment** (30% locators). P3 se ha reformulado: ya no es "elegir entre cinco estrategias" sino "seleccionar y justificar el más apropiado". Conviene revisar esa redacción antes de construir.

### Orden de construcción propuesto

Con K1 resuelto, empezar por el **Lab 3**: es el eje del módulo, el que más cambió tras la validación y el único con un bloque sin código. Después Lab 5 (los dos casos reales ya están identificados), luego 1, 2 y 4, y por último Challenge y assessment.

### Enlazado del documento

Este documento y el de validación **siguen sin estar enlazados desde ningún índice**, porque las instrucciones de las fases 3A y 3A.2 prohibían modificar documentación existente. Enlazarlos desde `learning/modules/README.md` y `learning/docs/learning-path.md` son dos líneas, cuando lo apruebes.

---

## Technical Validation Integration

| Campo | Valor |
|---|---|
| **Fecha de validación** | 17 de agosto de 2026 |
| **Documento fuente** | [`module-01-technical-validation.md`](module-01-technical-validation.md) |
| **Entorno de validación** | Equipo de desarrollo (Windows 11, sin proxy, Playwright 1.58.2). **No es un equipo de HDI** |
| **K1 — Entorno** | **CONDITIONAL** |
| **K2 — Locators** | **PASS** |
| **Recomendación recibida** | ADAPT DESIGN |
| **Estado de aplicación** | ✅ Aplicada en esta Fase 3A.2 |

### Cambios incorporados

| # | Afirmación del diseño original | Corrección aplicada | Secciones afectadas |
|---|---|---|---|
| 1 | `getByLabel` es una estrategia practicable | ❌ **Falsa.** 0 `<label>` en la aplicación. Pasa a caso de criterio sin código | 4, 5, 6 (R11b), 8 (Lab 3, bloque 3.3), 13 |
| 2 | "Products" y "Your Cart" son headings | ❌ **Falsa.** Son `<span data-test="title">`. El único heading real es el de confirmación | 4, 6 (R10), 8 (Lab 3, bloque 3.4) |
| 3 | `getByRole('combobox')` es un locator sin reservas | ⚠️ **Matizada.** Funciona solo por ser el único de la página; sin nombre accesible | 4, 6 (R16c), 8 (Lab 3, bloque 3.5) |
| 4 | `getByTestId` no está verificado | ✅ **Confirmado y cuantificado.** 0 sin configurar → 1 con `testIdAttribute: 'data-test'` | 3, 4, 6 (R12), 8, 17 |
| 5 | `.first()` sirve ante ambigüedad | ❌ **Rechazada.** Oculta el problema. Se enseña el acotado; `.first()` pasa a síntoma | 4, 6 (R16), 8 (Lab 5, caso A) |
| 6 | `.cart_item` es una fuga del POM por comodidad | ❌ **Falsa e invertida.** `CartPage.cartItems` resuelve **0 elementos**: el POM está roto y los tests lo esquivan | 3, 4, 6 (R13, R13b), 7, 8 (Lab 5, caso B), 15.1, 15.4 |
| 7 | El objetivo P3 es usar cinco estrategias | 🔄 **Reorientado.** Seleccionar y justificar el más apropiado, con cinco criterios de decisión | 5, 8 (Lab 3), 12, 13 |
| 8 | La suite tarda y es un cuello de botella (K8) | ❌ **Falsa.** 79 tests en Chromium en **21,8 s** | 11, 15.2 |
| 9 | Los importes del Challenge son un supuesto | ✅ **Cuantificados.** `$29.99 → Tax $2.40 → Total $32.39` (8 %) | 9 (AC2) |
| 10 | Anclajes: 31, con 4 sin material | 🔄 **34 anclajes**, 3 nuevos salidos de la validación (R13b, R16b, R16c) | 6 |

### Elementos pendientes

| # | Pendiente | Responsable | Bloquea |
|---|---|---|---|
| 1 | **Validar K1 en un equipo corporativo de HDI** | HDI | La construcción de M01 |
| 2 | **Validar `codegen`** contra SauceDemo | Fase de construcción | Solo el Lab 6 (opcional) |
| 3 | **Revisar el diseño de M02**: el ejercicio de `.cart_item` rompería 5 specs | Fase de diseño de M02 | La construcción de M02 |
| 4 | **Corregir la descripción del hallazgo A1** en el análisis de Fase 1 | Edición pendiente de aprobación | Nada; es coherencia documental |
| 5 | **Enlazar este documento y el de validación** desde los índices | Edición de dos líneas | Nada |
| 6 | **Fijar la duración definitiva** tras el piloto con alumnos | Post-construcción | Nada |

### Lo que NO se ha hecho

- No se ha construido material del módulo 01: ni Labs, ni teoría, ni Challenges, ni assessment, ni soluciones.
- No se ha modificado `pages/cart.page.ts`: **el defecto V1 se conserva como material didáctico**.
- No se ha modificado `playwright.config.ts` ni ningún test, Page Object o script del proyecto.
- No se ha modificado el material del módulo 00 ni el análisis de Fase 1.
- No se ha creado ningún fichero nuevo en esta fase.

---

*Fase 3A.2. Actualización del diseño con los resultados de la validación técnica. El único fichero modificado es este. Ningún fichero del proyecto ni del material existente ha sido tocado.*
