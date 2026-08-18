# Módulo 01 — Repository Mapping

Cada concepto del módulo se ancla en un fichero **real** del repositorio o en un dato **medido** contra la aplicación. Ninguna referencia de esta tabla es inventada.

Las referencias `fichero:línea` corresponden al estado del repositorio en la rama `docs/ruta-aprendizaje-playwright`. Si una línea no coincide, avísale al formador: es un caso real de deriva documental (y material del módulo 07).

**Leyenda:** 🔬 = dato medido contra la aplicación real, documentado en [`module-01-technical-validation.md`](../../docs/module-01-technical-validation.md).

---

## Ejecución, configuración e informes

| # | Concepto | Archivo real | Qué debe observar el alumno | Qué debe aprender |
|---|---|---|---|---|
| R1 | Anatomía de un spec | [`tests/login.spec.ts:1-20`](../../../tests/login.spec.ts) | `import` → `describe` → `beforeEach` → `test`, en ese orden, en los 14 ficheros | Que un spec tiene una forma canónica |
| R2 | Configuración del runner | [`playwright.config.ts`](../../../playwright.config.ts) | 31 líneas y ni un timeout escrito | Qué hereda su test sin escribirlo |
| R3 | `baseURL` y rutas relativas | [`playwright.config.ts:13`](../../../playwright.config.ts) + [`pages/login.page.ts:11`](../../../pages/login.page.ts) | `goto('/')` funciona porque hay `baseURL` | Cómo se cambia de entorno sin tocar tests |
| R4 | Projects y cross-browser | [`playwright.config.ts:17-30`](../../../playwright.config.ts) | 79 tests × 3 navegadores = 237 ejecuciones | Un test se escribe una vez y corre en tres motores |
| R5 | Tags y filtrado | 10 specs con `{ tag: '@demo-fail' }` + [`package.json:7-8`](../../../package.json) | La suite se parte en verde y roja | Selección de tests por criterio |
| R6 | Informe HTML | [`playwright.config.ts:9-11`](../../../playwright.config.ts) + `npm run test:report` | Un informe con 10 fallos reales | Leer un informe y llegar al test culpable |
| R28 | Modo headed | [`package.json:9`](../../../package.json) | El navegador ejecutando el test | Que se puede mirar |
| R29 | Fallos intencionados | 10 tests con `⚠️ FALLO INTENCIONADO` | La suite está roja a propósito | Un rojo no siempre es un bug de la aplicación *(el diagnóstico es M04)* |

## Esperas y aserciones

| # | Concepto | Archivo real | Qué debe observar el alumno | Qué debe aprender |
|---|---|---|---|---|
| R7 | **Auto-waiting** | Toda la suite: **0 esperas explícitas** en 79 tests | Nadie espera y aun así funciona | Que la aserción web-first reintenta hasta su timeout |
| R8 | Métodos sin reintento | [`tests/problem-user-cart.spec.ts:53,54,77,78`](../../../tests/problem-user-cart.spec.ts) | Los 4 únicos `isVisible()`/`textContent()` de la suite | Por qué esos 4 hacen el test dependiente del instante |
| R27 | Timeout por aserción | [`tests/performance-glitch-user-cart.spec.ts:19,28,38,42`](../../../tests/performance-glitch-user-cart.spec.ts) | `{ timeout: 15000 }` ×4 · 🔬 la latencia real medida es **~5,1 s** | Cuándo un timeout local está justificado, y en qué se diferencia de `waitForTimeout` |
| R20 | Aserciones web-first | [`tests/cart-badge.spec.ts`](../../../tests/cart-badge.spec.ts) | 4 tipos en un solo fichero | Cuál elegir en cada caso |
| R21 | `toHaveText` vs `toContainText` | [`tests/login.spec.ts:32`](../../../tests/login.spec.ts) vs [`tests/cart-badge.spec.ts`](../../../tests/cart-badge.spec.ts) | Uno exacto, otro parcial | Cuándo cada uno y el riesgo de `toContainText` |
| R22 | `toHaveURL` con regex y con string | [`tests/login.spec.ts:19`](../../../tests/login.spec.ts) vs [`tests/route-protection.spec.ts:10`](../../../tests/route-protection.spec.ts) | Dos formas en la misma suite | Cuándo hace falta una expresión regular |
| R23 | **Mensajes de aserción** | Prácticamente todas las aserciones | El 2.º argumento de `expect`, en castellano | Escribir mensajes en lenguaje de negocio |
| R24 | Aserciones no web-first | [`tests/inventory.spec.ts:27-36`](../../../tests/inventory.spec.ts) | `toHaveLength`, `toEqual` **sin** `await` | Distinguir aserción sobre UI de aserción sobre datos |

## Locators

| # | Concepto | Archivo real / dato medido | Qué debe observar el alumno | Qué debe aprender |
|---|---|---|---|---|
| R9 | CSS por atributo `data-test` | [`pages/login.page.ts:7,15-17`](../../../pages/login.page.ts) | La estrategia dominante: **66 usos** | Por qué un atributo de test es un contrato |
| R10 | **Locator por rol** 🔬 | [`tests/checkout.spec.ts:34`](../../../tests/checkout.spec.ts) | El **único** `getByRole` de la suite · 🔬 y el único heading real del flujo | Los roles funcionan en botones y campos, **no en los títulos de página** |
| R11 | Locator por placeholder 🔬 | **No existe en el repositorio** · 🔬 funciona en **5 de 5** campos | Los inputs no tienen `<label>`: su nombre accesible sale del `placeholder` | Por qué `getByRole('textbox', { name: 'Username' })` y `getByPlaceholder('Username')` devuelven lo mismo |
| R11b | **`getByLabel` como caso de criterio** 🔬 | **No existe y no puede existir**: 🔬 **0 elementos `<label>`** en las 5 pantallas | La estrategia que recomienda la documentación **no aplica aquí** | Que la elección depende del HTML que te dan — y que esto es un hallazgo de accesibilidad que se reporta |
| R12 | `getByTestId` y `testIdAttribute` 🔬 | La opción **no está** en [`playwright.config.ts`](../../../playwright.config.ts) · 🔬 **0** sin configurar, **1** con `testIdAttribute: 'data-test'` | El proyecto escribe 66 selectores a mano pudiendo no hacerlo | Que una línea de configuración simplifica 66 selectores |
| R13 | Locator frágil por clase CSS 🔬 | **12 usos de `.cart_item` en 5 ficheros** | Una clase de estilo usada como contrato de test | Qué distingue un selector de estilo de un contrato de test |
| R13b | **Locator que no encuentra nada** 🔬 | [`pages/cart.page.ts:7`](../../../pages/cart.page.ts) — 🔬 `[data-test="cart-item"]` resuelve **0**; el DOM real es `<div class="cart_item" data-test="inventory-item">` | El Page Object declara un locator que no existe, y **ningún test lo usa** | **Un locator roto es invisible hasta que alguien lo ejecuta** |
| R14 | Encadenado y filtrado | [`tests/product-detail-add-to-cart.spec.ts:117-121`](../../../tests/product-detail-add-to-cart.spec.ts) | `.filter({ hasText }).locator('img')` | Componer locators en vez de escribir un CSS enorme |
| R15 | `hasText` como opción | [`pages/inventory.page.ts:33`](../../../pages/inventory.page.ts) | Otra sintaxis para lo mismo | Que hay dos formas equivalentes |
| R16 | `.first()` como síntoma | [`tests/cart-sync.spec.ts:32`](../../../tests/cart-sync.spec.ts) | El único `.first()` de la suite, en una aserción que comprueba muy poco | Que `.first()` **tapa** un locator impreciso en vez de arreglarlo |
| R16b | **Strict mode con caso real** 🔬 | Catálogo: 🔬 `getByRole('link', { name: 'Sauce Labs Backpack' })` → **2 elementos** (enlace de imagen y de título) | El error literal de Playwright, que sugiere los dos candidatos | Por qué ocurre y cómo **acotar** en vez de usar `.first()` |
| R16c | **`combobox` sin nombre accesible** 🔬 | [`pages/inventory.page.ts:21`](../../../pages/inventory.page.ts) — 🔬 el `<select>` no tiene `id`, ni `aria-label`, ni `<label>`; `getByRole('combobox')` → **1** | Funciona **solo porque es el único de la página** | Que un locator puede funcionar hoy y ser frágil mañana |
| R16d | **Nombre accesible inesperado** 🔬 | Checkout paso 1: 🔬 `getByRole('button', { name: 'Cancel', exact: true })` → **0**; el nombre real es **"Go back Cancel"** | El nombre accesible concatena el `alt` de un icono con el texto | Que el nombre accesible **se comprueba, no se supone** |
| R16e | **Los títulos no son headings** 🔬 | Catálogo y carrito: 🔬 `getByRole('heading', { name: 'Products' })` → **0**; `getByTestId('title')` → **1** | "Products" y "Your Cart" son `<span class="title" data-test="title">` | Que la semántica del HTML manda sobre la intuición |
| R17 | `click` | 21 usos en `pages/*.page.ts` | La interacción dominante | — |
| R18 | `fill` | [`pages/login.page.ts:15-16`](../../../pages/login.page.ts), [`pages/checkout.page.ts:17-19`](../../../pages/checkout.page.ts) | 5 usos, dos formularios | Rellenar formularios reales |
| R19 | `selectOption` | [`pages/inventory.page.ts:21`](../../../pages/inventory.page.ts) | Un desplegable no se maneja con `click` · 🔬 4 opciones: `az`, `za`, `lohi`, `hilo` | Interacción específica por tipo de control |

## Estructura y cobertura

| # | Concepto | Archivo real | Qué debe observar el alumno | Qué debe aprender |
|---|---|---|---|---|
| R25 | `beforeEach` y aislamiento | 13 ficheros | Cada test arranca con sesión limpia | Aislamiento entre tests |
| R26 | Test sin `beforeEach` | [`tests/route-protection.spec.ts`](../../../tests/route-protection.spec.ts) | El único de los 14 | Que el hook responde a una necesidad, no a un ritual |
| R30 | **Hueco de cobertura real** | [`tests/inventory.spec.ts:23-71`](../../../tests/inventory.spec.ts) — cubre `za`, `lohi`, `hilo`; **falta `az`** | La suite tiene un hueco identificable | Que escribir un test empieza por detectar qué falta — **base del Lab 4** |
| R30b | **Segundo hueco** 🔬 | El botón `X` que cierra el mensaje de error del login: 🔬 existe (`[data-test="error-button"]`) y **ningún test lo ejercita** | Comparar [`specs/test-index.md`](../../../specs/test-index.md) con la aplicación | Que los huecos se encuentran comparando cobertura declarada con comportamiento real |
| R31 | Codegen | **No existe en el repositorio** — ⚠️ **sin validar técnicamente** | — | Herramienta de asistencia y sus límites — [Lab 6 opcional](labs/lab-6-codegen.md) |

---

## Balance

**38 anclajes.** 33 existen y están verificados en el repositorio o medidos contra la aplicación; 3 requieren material nuevo en el sandbox (R11, R12 y las conversiones de R10); 1 es una pregunta de criterio sin código (R11b); 1 sigue **sin validar** (R31, codegen).

Los cinco anclajes marcados como nuevos —R13b, R16b, R16c, R16d, R16e— **salieron de ejecutar contra la aplicación**, no del diseño previo. Ninguno habría aparecido leyendo el código.

## Trazabilidad completa del módulo

| Competencia (matriz Fase 1) | Dónde aparece en el repositorio | Ejercicio que la practica | Cómo se valida | Cómo se evalúa |
|---|---|---|---|---|
| E — Ejecución y configuración | R2, R3, R4, R5, R6, R28 | Lab 1 | Tabla de 6 ejecuciones completa | Parte A (P·A1) |
| E — Auto-waiting y aserciones | R7, R8, R20-R24, R27 | Labs 2 y 4 | Tests en verde sin esperas explícitas | P·A2, P·A3, E1, E2 |
| B — Localización de elementos | R9-R16e | **Lab 3** | `03-decisiones.md` + tests en verde | P·A4, P·A5, E1, Parte C |
| B — Diagnóstico de localización | R8, R13b, R16, R16b | **Lab 5** | Informe de diagnóstico + 2 tests en verde | **E2** |
| G — Detección de huecos de cobertura | R30, R30b | **Lab 4** | 2 tests nuevos en verde | **E1** |
| G — Diseño de cobertura E2E | R14, R18, R19, R20 | Challenge | Criterios AC1-AC6 | Challenge + Parte C |
