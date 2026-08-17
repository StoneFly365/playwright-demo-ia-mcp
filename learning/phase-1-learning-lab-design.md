# QA Automation & AI Engineering Learning Lab
## HDI Seguros Chile

**Fase 1 — Análisis del repositorio y arquitectura del Learning Lab**
**Fecha:** 17 de agosto de 2026
**Rama:** `docs/ruta-aprendizaje-playwright`
**Alcance de este documento:** análisis y diseño. No se ha modificado ni un solo archivo del proyecto existente.

> ## ⚠️ Fe de erratas — 17 de agosto de 2026
>
> El hallazgo **A1** de la sección 3.2 (`.cart_item` como "fuga del Page Object") se describió incorrectamente. La validación técnica del módulo 01 ([`learning/docs/module-01-technical-validation.md`](docs/module-01-technical-validation.md), hallazgo V1) demostró que `CartPage.cartItems` ([`pages/cart.page.ts:7`](../pages/cart.page.ts)) apunta a `[data-test="cart-item"]`, un atributo que **no existe en la aplicación** — el locator resuelve 0 elementos. Los tests no esquivan el Page Object por comodidad: lo esquivan porque su locator está roto. Las cuatro apariciones de A1 en este documento (secciones 3.2, 4, 10) se marcan a continuación con la corrección en línea; el texto original se conserva para mantener el registro histórico del diseño aprobado. Detalle completo en `module-01-discovery-design.md`, sección 15.1 (hallazgo V1).

---

# 1. Executive Summary

El repositorio `playwright-demo-ia-mcp` es una suite E2E real sobre [SauceDemo](https://www.saucedemo.com), escrita en Playwright + TypeScript con Page Object Model, ejecutada en tres navegadores desde GitHub Actions dentro del contenedor oficial de Playwright, y complementada con un pipeline de análisis de fallos por IA (Claude CLI en local, Google Gemini en CI).

**Cifras verificadas contra el código, no contra el README:**

| Métrica | Valor real | Fuente |
|---|---|---|
| Ficheros de test | 14 | `tests/*.spec.ts` |
| Tests por navegador | 79 | recuento de `test(` en `tests/` |
| Ejecuciones totales por run completo | 237 (79 × 3 proyectos) | `playwright.config.ts` |
| Page Objects | 6 | `pages/*.page.ts` |
| Tests con fallo intencionado (`@demo-fail`) | **10** | recuento de tags en `tests/` |
| Líneas de código en `tests/` + `pages/` | 1.586 | recuento |
| Prompts de IA | 4 | `prompts/*.txt` |
| Subagentes definidos | 3 | `.claude/agents/*.md` |
| Servidores MCP configurados | 1 (`playwright-test`) | `.mcp.json` |
| Versión de Playwright bloqueada | 1.58.2 | `package-lock.json` |

> **Primera discrepancia detectada:** `specs/test-index.md` declara 9 fallos intencionados; en el código hay **10** tests etiquetados `@demo-fail` (uno por cada uno de estos ficheros: `login`, `inventory`, `checkout`, `menu`, `route-protection`, `inventory-add-to-cart`, `product-detail`, `product-detail-add-to-cart`, `cart-badge`, `cart-sync`). La documentación ha derivado del código.

**Conclusión del análisis:** el repositorio es una **base formativa excelente pero deliberadamente incompleta**. Cubre con solvencia el 100% del arco "test E2E de UI → POM → cross-browser → CI en Docker → reporte IA", que es exactamente el recorrido que un QA de HDI necesita interiorizar. En cambio **no contiene** fixtures, autenticación por `storageState`, gestión de datos de prueba, testing de API, mocking de red, linting, ni typecheck en CI. Esas ausencias no son un defecto para un Learning Lab: son **el temario de los módulos 02 a 05**, y el propio repositorio proporciona el "antes" sobre el que el alumno construirá el "después".

Además, el repositorio contiene una cantidad inusualmente alta de **material didáctico accidental**: 10 fallos intencionados documentados con el comentario exacto de cómo revertirlos, dos usuarios de SauceDemo con bugs reales (`problem_user`) y latencia real (`performance_glitch_user`), y varios anti-patrones auténticos (locators CSS frágiles, aserciones condicionales, rutas absolutas de una máquina concreta en `package.json`). Todo eso vale más como ejercicio que como código a corregir.

**Recomendación de formato:** 6 semanas, 8 módulos, 20% teoría / 80% práctica, con capstone sobre journeys genéricos de seguros. Detalle en las secciones 13 y 14.

---

# 2. Repository Analysis

## 2.1 Inventario completo de ficheros (excluyendo `node_modules`, `.git` y artefactos)

```
playwright-demo-ia-mcp/
├── .gitignore
├── .mcp.json                          # 1 servidor MCP: playwright-test
├── package.json                       # 12 scripts npm, 4 devDependencies
├── package-lock.json                  # lockfileVersion 3
├── playwright.config.ts               # 31 líneas
├── tsconfig.json                       # 11 líneas
├── README.md                          # 382 líneas — documentación principal
├── test-results.json                  # artefacto generado (ignorado por git)
├── .claude/
│   ├── settings.local.json            # permisos locales (ignorado por git)
│   └── agents/
│       ├── playwright-test-planner.md
│       ├── playwright-test-generator.md
│       └── playwright-test-healer.md
├── .github/workflows/
│   └── playwright.yml                 # 86 líneas — matriz de 3 navegadores
├── pages/                             # 6 Page Objects
│   ├── login.page.ts                  # 19 líneas
│   ├── inventory.page.ts              # 39 líneas
│   ├── product-detail.page.ts         # 31 líneas
│   ├── cart.page.ts                   # 21 líneas
│   ├── checkout.page.ts               # 37 líneas
│   └── menu.page.ts                   # 20 líneas
├── prompts/                           # 4 prompts del pipeline IA
│   ├── ai-group-failures.txt
│   ├── ai-summary.txt
│   ├── ai-corrections.txt
│   └── ai-tickets.txt
├── scripts/
│   └── report-ai.mjs                  # 225 líneas — orquestador IA
├── specs/                             # documentación QA
│   ├── add-to-cart-test-plan.md       # plan de diseño (673 líneas)
│   └── test-index.md                  # inventario de tests (274 líneas)
└── tests/                             # 14 specs, 79 tests
    ├── login.spec.ts                  (8 tests, 1 @demo-fail)
    ├── inventory.spec.ts              (5 tests, 1 @demo-fail)
    ├── inventory-add-to-cart.spec.ts  (9 tests, 1 @demo-fail)
    ├── product-detail.spec.ts         (4 tests, 1 @demo-fail)
    ├── product-detail-add-to-cart.spec.ts (9 tests, 1 @demo-fail)
    ├── add-tshirt-to-cart.spec.ts     (6 tests, 0)
    ├── cart-badge.spec.ts             (6 tests, 1 @demo-fail)
    ├── cart-sync.spec.ts              (5 tests, 1 @demo-fail)
    ├── cart-edge-cases.spec.ts        (7 tests, 0)
    ├── checkout.spec.ts               (8 tests, 1 @demo-fail)
    ├── menu.spec.ts                   (2 tests, 1 @demo-fail)
    ├── route-protection.spec.ts       (3 tests, 1 @demo-fail)
    ├── problem-user-cart.spec.ts      (5 tests, 0)
    └── performance-glitch-user-cart.spec.ts (2 tests, 0)
```

**NO EXISTE en el repositorio** (verificado, no asumido):

- `fixtures/` — no hay fixtures personalizados de Playwright (`test.extend`)
- `helpers/` ni `utils/` — no hay utilidades compartidas
- ficheros de datos de prueba (`.json`, `.csv`, `data/`) — los datos están embebidos en los tests
- `Dockerfile` ni `docker-compose.yml` — Docker se usa **solo** como imagen preconstruida (`mcr.microsoft.com/playwright:v1.58.2-jammy`)
- `.devcontainer/`
- tests de API (`request` fixture, `APIRequestContext`)
- mocking de red (`page.route`, `page.routeFromHAR`)
- `storageState` / proyecto de setup de autenticación
- `globalSetup` / `globalTeardown`
- configuración de ESLint, Prettier, husky o cualquier linter
- paso de typecheck (`tsc --noEmit`) en CI
- tests de accesibilidad, visual regression o rendimiento medido
- integración real con Jira (existe **salida** en formato Jira, no llamada a la API de Jira)
- `CLAUDE.md`, `CONTRIBUTING.md`, `.nvmrc`, `engines` en `package.json`
- carpeta `learning/` previa (esta rama crea la primera)

## 2.2 Responsabilidad de cada componente y sus relaciones

### `playwright.config.ts` — el contrato de ejecución

```ts
testDir: './tests'
fullyParallel: true
forbidOnly: !!process.env.CI
retries: process.env.CI ? 2 : 0
workers: process.env.CI ? 4 : undefined
reporter: CI ? [github, html, json] : [html, json]   // json → test-results.json
use: { baseURL: 'https://www.saucedemo.com', trace: 'retain-on-failure', video: 'retain-on-failure' }
projects: [chromium, firefox, webkit]
```

Es la pieza que conecta casi todo lo demás:

- `testDir` → apunta a `tests/`
- `baseURL` → permite que los Page Objects usen rutas relativas (`page.goto('/')`)
- reporter `json` → produce `test-results.json`, que es **la entrada exacta** de `scripts/report-ai.mjs`
- `projects` → define los tres valores de la matriz del workflow de GitHub Actions
- `retries: 2` en CI → habilita la detección de flaky, que el script IA lee del campo `stats.flaky`

**Ausencias relevantes en la config:** no hay `timeout` global, ni `expect.timeout`, ni `testIdAttribute`, ni `screenshot`, ni `webServer`, ni `outputDir` explícito. Todo funciona con los valores por defecto de Playwright. Esto es material de módulo, no un bug.

### `pages/` — Page Object Model

Seis clases, todas con la misma forma: constructor que recibe `page` (privado, `readonly`), locators expuestos como campos `readonly Locator`, acciones expuestas como métodos `async`. Ninguna clase hace aserciones — decisión correcta y explícitamente enseñable.

| Page Object | Locators expuestos | Acciones | Estrategia de locator |
|---|---|---|---|
| `LoginPage` | `errorMessage` | `navigate()`, `login(user, pass)` | `[data-test="..."]` |
| `InventoryPage` | `cartBadge`, `inventoryItems` | `addToCart(id)`, `removeFromCart(id)`, `sortBy(opt)`, `getProductNames()`, `getProductPrices()`, `navigateToProduct(name)`, `navigateToCart()` | `[data-test="..."]` + interpolación de plantilla |
| `ProductDetailPage` | `productName`, `productDescription`, `productPrice`, `cartBadge` | `navigate(id)`, `addToCart()`, `removeFromCart()`, `backToProducts()` | `[data-test^="..."]` (prefijo) |
| `CartPage` | `cartItems` | `removeItem(id)`, `continueShopping()`, `checkout()` | `[data-test="..."]` |
| `CheckoutPage` | `errorMessage`, `subtotalLabel`, `taxLabel`, `totalLabel` | `fillInfo()`, `continue()`, `cancel()`, `finish()`, `backHome()` | `[data-test="..."]` |
| `MenuPage` | — | `open()`, `logout()`, `resetAppState()` | `#id` (CSS por id) |

`MenuPage` es la única que usa selectores por `id` (`#react-burger-menu-btn`, `#logout_sidebar_link`, `#react-burger-cross-btn`) porque SauceDemo no expone `data-test` en el menú lateral. Es una excepción justificada y un ejemplo real de "cuando el ideal no está disponible".

### `tests/` — la suite

Patrón uniforme en los 14 ficheros: `test.describe` → variables `let` a nivel de describe → `test.beforeEach` que instancia los Page Objects y hace login por UI → tests que orquestan acciones y afirman con `expect`.

Todas las aserciones llevan **mensaje descriptivo en español como segundo argumento de `expect`**. Esto es infrecuente y muy valioso: convierte cualquier fallo en un texto legible por negocio, y alimenta directamente los prompts de IA (el modelo recibe esos mensajes en el JSON).

Relación tests → resto del sistema:

```
tests/*.spec.ts
   ├─ importan → pages/*.page.ts            (6 POMs)
   ├─ leen baseURL de → playwright.config.ts
   ├─ etiquetan con @demo-fail → filtrado por package.json scripts y por el workflow
   └─ producen → test-results.json → scripts/report-ai.mjs → playwright-report/ai-*.{txt,md,json}
```

### `scripts/report-ai.mjs` — pipeline de análisis IA

Node puro (ESM), sin dependencias externas. Flujo:

1. Verifica que exista `test-results.json`; si no, aborta con mensaje accionable.
2. `extractStats()` — lee `stats` del reporter JSON de Playwright; si no existe, recorre el árbol `suites/tests/results` y deriva `passed/failed/skipped/flaky` (un test con varios resultados y alguno `passed` cuenta como flaky).
3. **Llamada 1 (secuencial):** prompt `ai-group-failures.txt` + `test-results.json` completo → JSON de fallos agrupados por causa raíz probable (fingerprint = primera línea del error + ubicación + stack).
4. Sobrescribe `generated_at` con la hora real de Madrid — el modelo la inventaba.
5. **Llamadas 2, 3 y 4 (en paralelo, `Promise.all`):** resumen ejecutivo, correcciones y tickets, todas alimentadas con el JSON agrupado (no con el JSON crudo). Esto es *prompt chaining* real: la salida de un paso es la entrada de los siguientes.
6. Valida que la agrupación y los tickets sean JSON parseable; si no, falla con los primeros 500 caracteres de la respuesta.
7. Escribe cuatro ficheros en `playwright-report/`.

**Selección de proveedor** (`runClaude`): si existe `GEMINI_API_KEY` → Gemini (`gemini-flash-latest`, endpoint compatible con OpenAI, `temperature: 0`, reintentos con backoff exponencial + jitter en 429/500/502/503/504, máximo 4 intentos). Si no → CLI de Claude local (`claude-haiku-4-5-20251001`, `-p`, `--dangerously-skip-permissions`, stdin/stdout por pipe).

### `prompts/` — ingeniería de prompt versionada

Cuatro prompts de sistema, en español, todos con la misma disciplina: formato de salida exacto y obligatorio, prohibición explícita de inventar datos, y control del ruido (el prompt de resumen incluso restringe qué emojis se permiten y en qué líneas). `ai-summary.txt` está escrito para que la salida sea enviable por correo a una audiencia no técnica; `ai-tickets.txt` define un esquema de ticket de 7 campos con severidad derivada del número de tests afectados y de si el fallo toca login/checkout.

### `.github/workflows/playwright.yml` — CI/CD

- Disparadores: `push` y `pull_request` sobre `main`, más `workflow_dispatch` con input `suite` (`green` | `fail` | `all`).
- `runs-on: ubuntu-latest` + `container: mcr.microsoft.com/playwright:v1.58.2-jammy` — no hay `setup-node` ni `playwright install`: la imagen ya lo trae todo.
- `env`: `TZ: Europe/Madrid` y `HOME: /root` (con comentario explicando que Firefox no arranca si `$HOME` pertenece a otro UID).
- Matriz de 3 navegadores con `fail-fast: false` y **`max-parallel: 1`**, con comentario justificando la serialización: la cuota gratuita de Gemini es por minuto y paralelizar provocaba 429.
- El paso de IA lleva `if: always()` y `continue-on-error: true`.
- El resumen IA se vuelca en `$GITHUB_STEP_SUMMARY` — visible sin descargar artefactos.
- Artefactos: `playwright-report-<navegador>` siempre (30 días); `test-results-<navegador>` solo en fallo (7 días).

**Detalle con consecuencias:** en `push`/`pull_request` el valor por defecto de la suite es `green`, es decir `--grep-invert @demo-fail`. En un run automático los tests pasan y el reporte IA describe una ejecución sin fallos. Para ver el reporte IA analizando fallos reales hay que lanzar el workflow manualmente con `suite: fail` o `suite: all`.

### `.mcp.json` y `.claude/agents/` — capa de agentes

`.mcp.json` registra un único servidor MCP: `npx playwright run-test-mcp-server`, que expone al agente el control del navegador (`browser_*`), la ejecución y depuración de tests (`test_run`, `test_debug`, `test_list`) y los flujos de planner/generator (`planner_save_plan`, `generator_write_test`).

Tres subagentes especializados, todos `model: sonnet`:

| Agente | Rol | Herramientas clave | Salida |
|---|---|---|---|
| `playwright-test-planner` | Explora la app y escribe el plan de pruebas | `planner_setup_page`, `browser_*`, `planner_save_plan` | markdown de plan (→ `specs/`) |
| `playwright-test-generator` | Ejecuta cada paso en el navegador real y genera el spec | `generator_setup_page`, `browser_*`, `generator_read_log`, `generator_write_test` | fichero `.spec.ts` |
| `playwright-test-healer` | Diagnostica y repara tests que fallan | `test_run`, `test_debug`, `browser_snapshot`, `browser_generate_locator`, `Edit` | test corregido o `test.fixme()` |

`specs/add-to-cart-test-plan.md` es la evidencia física de que el flujo planner → generator se ha usado: es un plan de 43 casos con pasos y criterios de aceptación que se corresponden uno a uno con tests implementados.

## 2.3 Mapa de relaciones

```
                       playwright.config.ts
                    (baseURL, projects, reporters)
                              │
        ┌─────────────────────┼──────────────────────┐
        │                     │                      │
    pages/*.page.ts  ←──  tests/*.spec.ts  ──→  test-results.json
     (6 POMs)            (14 specs, 79 tests)         │
        ▲                     │                       ▼
        │                     │              scripts/report-ai.mjs
   specs/*.md  ────────────────┘             (Claude local / Gemini CI)
   (plan + índice)             │                      │
        ▲                      │              prompts/*.txt (4)
        │                      │                      │
 .claude/agents/*.md           │                      ▼
 (planner/generator/healer)    │           playwright-report/ai-*.{txt,md,json}
        ▲                      │                      │
        │                      ▼                      ▼
    .mcp.json  ────→  .github/workflows/playwright.yml (matriz ×3, container Docker)
                                                       │
                                             GITHUB_STEP_SUMMARY + artefactos
```

---

# 3. Technical Architecture

## 3.1 Mapa técnico por área

Solo se marca como existente lo que tiene evidencia en el repositorio. "Nivel actual" usa la escala: **Ausente / Básico / Sólido / Avanzado**.

| Área | Implementación encontrada | Archivos | Nivel actual | Valor formativo |
|---|---|---|---|---|
| **Playwright (test runner)** | `defineConfig`, projects, reporters, retries, workers, trace, video | `playwright.config.ts` | Sólido | ⭐⭐⭐⭐⭐ Es el eje del curso |
| **TypeScript** | Clases, `readonly`, parámetros de propiedad, tipos de retorno explícitos, `strict: true` | `pages/*.ts`, `tsconfig.json` | Básico-Sólido | ⭐⭐⭐⭐⭐ Nivelación obligatoria |
| **JavaScript (ESM/Node)** | Script Node ESM, `async/await`, `Promise.all`, `spawn`, `fetch`, closures | `scripts/report-ai.mjs` | Sólido | ⭐⭐⭐⭐ Módulo de IA |
| **Locators** | `data-test` (mayoría), `[data-test^=]` (prefijo), `#id` (menú), `.cart_item` (clase CSS, en tests), `hasText`, `filter()`, `getByRole` (1 uso) | `pages/*`, `tests/*` | Sólido con excepciones | ⭐⭐⭐⭐⭐ El mejor material del repo: hay buenos y malos ejemplos reales |
| **Assertions** | `toHaveURL`, `toHaveText`, `toBeVisible`, `not.toBeVisible`, `toHaveCount`, `toContainText`, `toHaveLength`, `toEqual`, todas con mensaje descriptivo | todos los specs | Avanzado | ⭐⭐⭐⭐⭐ Los mensajes de aserción son ejemplares |
| **Auto-waiting / web-first assertions** | Uso correcto de `await expect(locator)` | todos los specs | Sólido | ⭐⭐⭐⭐ |
| **Navigation** | `page.goto('/')`, rutas relativas vía `baseURL`, `page.reload()`, navegación por clic | `pages/*`, `cart-badge.spec.ts` | Sólido | ⭐⭐⭐ |
| **Authentication** | Login **por UI en cada `beforeEach`** de 12 de 14 specs | todos salvo `route-protection` | Básico | ⭐⭐⭐⭐⭐ Gap perfecto para enseñar `storageState` |
| **Test isolation** | Aislamiento nativo de Playwright (contexto por test) + `menuPage.resetAppState()` cuando hace falta | `menu.spec.ts`, `cart-badge.spec.ts` | Sólido | ⭐⭐⭐⭐ |
| **Hooks** | `test.beforeEach` en 13 de 14 specs | todos | Sólido | ⭐⭐⭐ |
| **Fixtures** | **NO EXISTE** — ningún `test.extend`, ningún fixture propio | — | Ausente | ⭐⭐⭐⭐⭐ Núcleo del módulo de arquitectura |
| **Page Object Model** | 6 clases, sin aserciones dentro, locators `readonly` | `pages/` | Sólido | ⭐⭐⭐⭐⭐ |
| **Test data** | Credenciales y nombres de producto **hardcodeados** en cada test; ids numéricos mágicos (`navigate(4)`) | todos los specs | Básico | ⭐⭐⭐⭐⭐ Gap didáctico de primer orden |
| **Parametrization** | **NO EXISTE** — no hay bucles `for...of` sobre datasets ni `test.each`-equivalente | — | Ausente | ⭐⭐⭐⭐ `inventory-add-to-cart.spec.ts` tiene 5 tests idénticos salvo el producto: refactor ideal |
| **Negative testing** | 5 tests de login con credenciales inválidas/vacías, 3 de validación de checkout | `login.spec.ts`, `checkout.spec.ts` | Sólido | ⭐⭐⭐⭐ |
| **Edge cases** | Suite dedicada: ciclos add/remove, duplicados, acceso directo por URL, orden aplicado, logout+relogin | `cart-edge-cases.spec.ts` | Sólido | ⭐⭐⭐⭐ |
| **E2E completo** | Compra completa login → catálogo → carrito → checkout 2 pasos → confirmación | `checkout.spec.ts` | Sólido | ⭐⭐⭐⭐⭐ |
| **Cross-browser** | 3 projects (Chromium/Firefox/WebKit) × 79 tests = 237 ejecuciones | `playwright.config.ts`, workflow | Sólido | ⭐⭐⭐⭐ |
| **Parallel execution / workers** | `fullyParallel: true`; `workers: 4` en CI, por defecto en local | `playwright.config.ts` | Sólido | ⭐⭐⭐ |
| **Retries** | 2 en CI, 0 en local | `playwright.config.ts` | Sólido | ⭐⭐⭐⭐ Conecta con flaky |
| **Timeouts** | **Solo ad-hoc**: `{ timeout: 15000 }` repetido en `performance-glitch-user-cart.spec.ts`; sin `timeout` ni `expect.timeout` globales | `performance-glitch-user-cart.spec.ts` | Básico | ⭐⭐⭐⭐ |
| **Debugging** | No hay scripts `--debug`/`--ui`; el healer usa `test_debug` vía MCP | `.claude/agents/playwright-test-healer.md` | Básico | ⭐⭐⭐⭐⭐ Gap importante: falta UI mode / Inspector |
| **Trace** | `trace: 'retain-on-failure'` (⚠️ el README dice `on-first-retry`) | `playwright.config.ts` | Sólido | ⭐⭐⭐⭐⭐ |
| **Video** | `video: 'retain-on-failure'` | `playwright.config.ts` | Sólido | ⭐⭐⭐ |
| **Screenshots** | **No configurado** — solo el valor por defecto de Playwright | — | Básico | ⭐⭐ |
| **HTML reporting** | Reporter `html` + `npm run test:report` | `playwright.config.ts`, `package.json` | Sólido | ⭐⭐⭐⭐ |
| **JSON reporting** | Reporter `json` → `test-results.json`, consumido por la IA | `playwright.config.ts` | Sólido | ⭐⭐⭐⭐⭐ Es el puente QA↔IA |
| **GitHub reporter** | Activo solo en CI (anotaciones en el diff del PR) | `playwright.config.ts` | Sólido | ⭐⭐⭐ |
| **Flaky tests** | Detección: `stats.flaky` y heurística de reintentos en `extractStats()` | `scripts/report-ai.mjs` | Básico | ⭐⭐⭐⭐ No hay tests flaky reales que estudiar |
| **Tags / filtrado** | Tag `@demo-fail` + `--grep` / `--grep-invert` en scripts y en el workflow | `package.json`, workflow, specs | Sólido | ⭐⭐⭐⭐ |
| **Git** | 47 commits, mensajes convencionales (`feat:`, `fix:`, `docs:`), rama `main` | historial | Sólido | ⭐⭐⭐ |
| **GitHub** | Workflow, artefactos, step summary, secrets (`GEMINI_API_KEY`) | workflow, README | Sólido | ⭐⭐⭐⭐ |
| **GitHub Actions / CI-CD** | Matriz 3 navegadores, `workflow_dispatch` con input, `continue-on-error`, `if: always()`, `max-parallel: 1` | `playwright.yml` | Sólido | ⭐⭐⭐⭐⭐ |
| **Docker** | Uso de la imagen oficial `mcr.microsoft.com/playwright:v1.58.2-jammy` vía `container:` y vía `docker run` documentado. **NO hay `Dockerfile` ni `docker-compose.yml`** | workflow, README | Básico-Sólido | ⭐⭐⭐⭐ |
| **AI (LLM)** | Pipeline de 4 llamadas, 2 proveedores, prompt chaining, validación JSON, reintentos | `scripts/report-ai.mjs`, `prompts/` | Sólido | ⭐⭐⭐⭐⭐ Diferenciador del curso |
| **MCP** | 1 servidor (`playwright-test`) declarado y habilitado | `.mcp.json`, `.claude/settings.local.json` | Básico-Sólido | ⭐⭐⭐⭐ |
| **Agents** | 3 subagentes con herramientas acotadas y workflow definido | `.claude/agents/` | Sólido | ⭐⭐⭐⭐⭐ |
| **Prompt engineering** | 4 prompts con contrato de salida estricto y guardarraíles anti-alucinación | `prompts/` | Sólido | ⭐⭐⭐⭐⭐ |
| **Failure analysis** | Agrupación por causa raíz + hipótesis + pasos de corrección | `prompts/ai-group-failures.txt`, `ai-corrections.txt` | Sólido | ⭐⭐⭐⭐⭐ |
| **Jira integration** | **Solo salida**: `ai-tickets.json` con esquema propio en español. **NO hay** llamada a la API de Jira, ni credenciales, ni importador | `prompts/ai-tickets.txt` | Básico (parcial) | ⭐⭐⭐⭐ Gap con recorrido de capstone |
| **API testing** | **NO EXISTE** | — | Ausente | ⭐⭐⭐⭐ |
| **Network mocking** | **NO EXISTE** (`page.route` no aparece) | — | Ausente | ⭐⭐⭐⭐ |
| **Accesibilidad** | **NO EXISTE** | — | Ausente | ⭐⭐ |
| **Visual regression** | **NO EXISTE** (`toHaveScreenshot` no aparece) | — | Ausente | ⭐⭐ |
| **Linting / formato** | **NO EXISTE** | — | Ausente | ⭐⭐⭐ |
| **Typecheck en CI** | **NO EXISTE** — `tsconfig.json` existe pero `tsc` no se ejecuta en el workflow | — | Ausente | ⭐⭐⭐⭐ |

## 3.2 Calidad técnica: hallazgos para uso didáctico

Conforme al punto 17 del encargo, se documentan **sin corregir**. Cada uno lleva la etiqueta de qué se puede enseñar con él.

### Anti-patrones y deuda en el código de test

| # | Hallazgo | Ubicación | Uso didáctico |
|---|---|---|---|
| A1 | ~~Tests acceden a selectores crudos en vez de usar el Page Object: `page.locator('.cart_item')` aparece en 4 specs mientras `CartPage.cartItems` (que usa `[data-test="cart-item"]`) queda sin usar~~ ⚠️ **Corregido — ver fe de erratas.** `CartPage.cartItems` apunta a `[data-test="cart-item"]`, atributo que **no existe** en la aplicación (0 elementos). No es una fuga por comodidad: el locator del POM está roto y 12 usos de `.cart_item` en **5** specs son el rodeo | `cart-sync.spec.ts`, `cart-edge-cases.spec.ts`, `add-tshirt-to-cart.spec.ts`, `performance-glitch-user-cart.spec.ts`, `problem-user-cart.spec.ts` | ~~**Fuga del POM + locator frágil**~~ **Locator de POM roto e invisible.** El defecto pasó inadvertido 47 commits porque ningún test lo ejecutaba. Ejercicio de diagnóstico, no de refactor directo — ver `module-01-discovery-design.md`, Lab 5, caso B |
| A2 | Aserción condicional `if/else` sobre estado observado en runtime | `problem-user-cart.spec.ts:56-66` | **Test que no puede fallar**. Enseña por qué un test debe tener un resultado esperado, no dos ramas ambas válidas |
| A3 | Valor esperado derivado del valor real (`expectedCount` se lee del badge y luego se afirma contra el carrito) | `problem-user-cart.spec.ts:77-87` | **Aserción tautológica parcial**. Debate: ¿es un test de consistencia legítimo o un test sin oráculo? |
| A4 | 5 tests idénticos salvo el nombre del producto | `inventory-add-to-cart.spec.ts:15-58` | **Parametrización**: convertir 5 tests copiados en un `for...of` sobre un dataset |
| A5 | Login por UI repetido en 12 specs → ~237 logins por run completo | todos los `beforeEach` | **`storageState` + proyecto de setup**. Ejercicio con impacto medible en tiempo de ejecución |
| A6 | Ids numéricos mágicos de producto (`navigate(4)`, `navigate(5)`, `navigate(2)`) sin módulo de datos | `product-detail*.spec.ts`, `cart-sync.spec.ts` | **Test data management**: extraer a un módulo tipado con `as const` |
| A7 | `{ timeout: 15000 }` repetido 5 veces en un mismo fichero | `performance-glitch-user-cart.spec.ts` | **Configuración por proyecto** vs. números mágicos repetidos |
| A8 | Imports y variables sin usar: `CartPage` se importa e instancia pero nunca se usa | `problem-user-cart.spec.ts:9,15`, `performance-glitch-user-cart.spec.ts:8,13` | **Por qué falta un linter** — un ESLint básico lo habría detectado |
| A9 | Aserción débil: el mensaje dice "debería corresponder a uno de los productos añadidos" pero solo comprueba `toBeVisible()` sobre `.first()` | `cart-sync.spec.ts:31-34` | **Mensaje de aserción que promete más de lo que verifica** |
| A10 | Cobertura solapada entre `add-tshirt-to-cart.spec.ts` e `inventory-add-to-cart.spec.ts` (ambos: añadir producto → badge 1) | ambos ficheros | **Diseño de suite**: duplicación de cobertura y coste de mantenimiento |
| A11 | Estado compartido a nivel de `describe` mediante `let pageObject` reasignado en `beforeEach` | los 13 specs con hooks | Funciona por el aislamiento de Playwright, pero es la puerta de entrada a **fixtures** como alternativa más limpia |
| A12 | Uso casi nulo de locators orientados al usuario: un único `getByRole` en toda la suite; `testIdAttribute` no configurado, por lo que `getByTestId()` no se puede usar | `checkout.spec.ts:34` | **Jerarquía de locators recomendada por Playwright** y qué se gana configurando `testIdAttribute: 'data-test'` |

### Configuración y tooling

| # | Hallazgo | Ubicación | Uso didáctico |
|---|---|---|---|
| B1 | Ruta absoluta de una máquina concreta en un script de npm: `CLAUDE_CODE_GIT_BASH_PATH="C:\Users\raul.molina\..."` | `package.json:14` | **Portabilidad**: el script `report:ai` no funciona en otro equipo tal cual. Ejercicio: variable de entorno / `.env` / detección |
| B2 | Tres fuentes de verdad de la versión de Playwright: `^1.49.0` (package.json), `1.58.2` (lock), `v1.58.2-jammy` (tag de imagen) | `package.json`, `package-lock.json`, workflow | **Gestión de versiones y reproducibilidad** |
| B3 | `tsconfig.json` sin `include`/`exclude` y sin ejecutarse nunca (`tsc --noEmit` no está en CI ni en scripts) | `tsconfig.json`, workflow | **El typecheck que nadie ejecuta**. Ejercicio: añadir script y paso de CI |
| B4 | Sin ESLint, Prettier, ni hooks de pre-commit | — | **Calidad automatizada** (relacionado con A8) |
| B5 | Sin `.nvmrc` ni campo `engines` pese a que el README exige Node 20+ | `package.json` | **Contrato de entorno** |
| B6 | Sin `timeout` ni `expect.timeout` globales | `playwright.config.ts` | **Estrategia de timeouts** consciente vs. implícita |

### CI/CD

| # | Hallazgo | Ubicación | Uso didáctico |
|---|---|---|---|
| C1 | La suite por defecto en `push`/`pull_request` es `green`; el reporte IA en un run automático analiza una ejecución sin fallos | `playwright.yml:43` | **Diseño de pipeline**: qué se ejecuta por defecto y por qué. Y cómo demostrar el valor de la IA (dispatch `fail`) |
| C2 | `continue-on-error: true` en el paso de IA | `playwright.yml:54` | **Fallo tolerado deliberado**: correcto aquí (la cuota gratuita es inestable), pero enseña a distinguir tolerancia justificada de fallo silenciado |
| C3 | `max-parallel: 1` sacrifica paralelismo de CI por cuota de LLM | `playwright.yml:29` | **Trade-off coste/velocidad** explícito y documentado en el propio YAML |
| C4 | No hay sharding (`--shard`) pese a 237 ejecuciones | workflow | **Escalado de suites grandes** |
| C5 | Sin `concurrency:` — dos pushes seguidos lanzan runs duplicados que compiten por la cuota de Gemini | workflow | **Control de concurrencia en Actions** |
| C6 | El informe HTML solo es accesible descargando el artefacto (el propio README lo señala como mejora futura) | README:293 | **Publicación de reportes** (GitHub Pages) |

### Pipeline de IA

| # | Hallazgo | Ubicación | Uso didáctico |
|---|---|---|---|
| D1 | `--dangerously-skip-permissions` en la invocación local del CLI de Claude | `report-ai.mjs:154` | **Seguridad en automatización con agentes**: qué permisos concedes y por qué |
| D2 | El JSON completo de resultados (títulos de test, mensajes de error) se envía al LLM sin filtrado | `report-ai.mjs:32` | **Superficie de inyección de prompt** y **fuga de datos**: crítico antes de aplicarlo a una app de seguros con datos reales |
| D3 | La validación de salida es `JSON.parse`, sin validación de esquema | `report-ai.mjs:36-43, 72-78` | **Salida estructurada de LLM**: parseable ≠ correcta. Ejercicio: validar campos obligatorios |
| D4 | El modelo inventaba `generated_at` y el código lo sobrescribe | `report-ai.mjs:45-51` | **Alucinación real, mitigación real**: no pidas al modelo datos que ya tienes |
| D5 | Sin límite de tamaño de entrada: con una suite grande, `test-results.json` puede desbordar la ventana de contexto o la cuota | `report-ai.mjs` | **Escalado y coste** del análisis por IA |
| D6 | Dos proveedores/modelos distintos (Claude Haiku local, Gemini Flash en CI) sobre los mismos prompts | `report-ai.mjs:8-9` | **Portabilidad de prompts** entre modelos y por qué `temperature: 0` |

### Documentación

| # | Hallazgo | Ubicación | Uso didáctico |
|---|---|---|---|
| E1 | `specs/test-index.md` declara 9 fallos intencionados; hay 10 | `test-index.md:30` | **Deriva documental**: la documentación como fuente de verdad falla |
| E2 | `specs/add-to-cart-test-plan.md` usa `sauce-labs-t-shirt` como `data-test`; el código real usa `test.allthethings()-t-shirt-(red)` | `add-to-cart-test-plan.md:22` y todos los specs | **Plan vs. implementación**: el plan se escribió antes de verificar contra la app |
| E3 | El README indica `trace: on-first-retry`; la config real es `retain-on-failure` | `README.md:322` vs `playwright.config.ts:14` | **Documentación desincronizada del código** |
| E4 | El plan totaliza 43 casos; la suite tiene 79 tests | `add-to-cart-test-plan.md:636` | **Evolución de la suite más allá del plan inicial** |

> Estos 30 hallazgos son, en conjunto, el activo didáctico más valioso del repositorio. Ninguno debe corregirse en Fase 1.

---

# 4. Current Skills Matrix

Matriz de competencias del QA Automation Engineer moderno, contrastada contra el repositorio. Columna "Acción": **Enseñar** (hay material suficiente), **Ampliar** (existe pero incompleto), **Añadir** (no existe, hay que crear material).

## A. QA Fundamentals

| Skill | ¿En el repo? | ¿Dónde? | Nivel | Acción |
|---|---|---|---|---|
| Diseño de casos de prueba | Sí | `specs/add-to-cart-test-plan.md` (43 casos con pasos y criterios) | Sólido | Enseñar |
| Criterios de aceptación | Sí | mismo fichero, sección por caso | Sólido | Enseñar |
| Testing positivo / negativo | Sí | `login.spec.ts`, `checkout.spec.ts` | Sólido | Enseñar |
| Casos límite | Sí | `cart-edge-cases.spec.ts` | Sólido | Enseñar |
| Testing de regresión | Sí (documentado) | `problem-user-cart.spec.ts` (bugs conocidos como regresión) | Sólido | Enseñar |
| Trazabilidad requisito↔test | Parcial | `specs/test-index.md` mapea fichero→tests, pero no a requisitos de negocio | Básico | Ampliar |
| Priorización basada en riesgo | No | — | Ausente | Añadir |
| Niveles de test (unit/integración/E2E) | No | Todo es E2E de UI | Ausente | Añadir |

## B. Web Testing

| Skill | ¿En el repo? | ¿Dónde? | Nivel | Acción |
|---|---|---|---|---|
| DOM y selectores CSS | Sí | todos los POMs | Sólido | Enseñar |
| Atributos `data-test` | Sí | los 6 POMs | Sólido | Enseñar |
| Navegación y URLs | Sí | `route-protection.spec.ts`, `toHaveURL` en 15+ tests | Sólido | Enseñar |
| Formularios y validaciones | Sí | `login.spec.ts`, `checkout.spec.ts` | Sólido | Enseñar |
| Estado de sesión / almacenamiento | Parcial | `cart-edge-cases.spec.ts` (logout+relogin) sin inspeccionar storage | Básico | Ampliar |
| HTTP / requests / respuestas | No | — | Ausente | Añadir |
| Accesibilidad | No | 1 `getByRole` aislado | Ausente | Añadir (opcional) |

## C. Programming

| Skill | ¿En el repo? | ¿Dónde? | Nivel | Acción |
|---|---|---|---|---|
| Variables, tipos, control de flujo | Sí | todo el código | Sólido | Enseñar |
| Funciones y ámbito | Sí | `report-ai.mjs` | Sólido | Enseñar |
| Clases y POO | Sí | los 6 POMs | Sólido | Enseñar |
| Arrays y transformaciones (`map`, `sort`, spread) | Sí | `inventory.spec.ts:42,49` | Sólido | Enseñar |
| Módulos (import/export) | Sí | todos los specs | Sólido | Enseñar |
| Gestión de errores (`try/catch`) | Sí | `report-ai.mjs:36,72,189` | Sólido | Enseñar |
| Depuración paso a paso | No | sin configuración de debug | Ausente | Añadir |

## D. JavaScript / TypeScript

| Skill | ¿En el repo? | ¿Dónde? | Nivel | Acción |
|---|---|---|---|---|
| `async`/`await` y promesas | Sí | todo el código | Sólido | Enseñar |
| `Promise.all` (paralelismo) | Sí | `report-ai.mjs:54,65,80` | Sólido | Enseñar |
| Tipos básicos y anotaciones | Sí | firmas `Promise<void>`, `Promise<string[]>` | Sólido | Enseñar |
| `readonly` y modificadores de acceso | Sí | los 6 POMs | Sólido | Enseñar |
| Parámetros de propiedad (`private readonly page: Page`) | Sí | los 6 POMs | Sólido | Enseñar |
| `strict` mode y null-safety | Parcial | `strict: true` activo; `??` usado en `report-ai.mjs:80,193` | Básico | Ampliar |
| Interfaces / types / unions | No | ningún `interface` ni `type` propio | Ausente | Añadir |
| Genéricos | No | — | Ausente | Añadir (nivel avanzado) |
| Utility types | No | — | Ausente | Añadir (opcional) |

## E. Playwright

| Skill | ¿En el repo? | ¿Dónde? | Nivel | Acción |
|---|---|---|---|---|
| `test` / `describe` / hooks | Sí | los 14 specs | Sólido | Enseñar |
| Locators y encadenado (`filter`, `hasText`, `first`) | Sí | `product-detail-add-to-cart.spec.ts:117-121`, `inventory.page.ts:33` | Sólido | Enseñar |
| Web-first assertions | Sí | todos los specs | Avanzado | Enseñar |
| Mensajes de aserción personalizados | Sí | prácticamente todas las aserciones | Avanzado | Enseñar (referencia) |
| `baseURL` y rutas relativas | Sí | `playwright.config.ts:13` | Sólido | Enseñar |
| Projects (cross-browser) | Sí | `playwright.config.ts:17-30` | Sólido | Enseñar |
| Tags y `--grep` | Sí | `@demo-fail`, scripts npm, workflow | Sólido | Enseñar |
| Trace viewer | Configurado, sin material | `playwright.config.ts:14` | Básico | Ampliar |
| UI mode / `--debug` / Inspector | No | ningún script | Ausente | Añadir |
| Fixtures propios (`test.extend`) | No | — | Ausente | Añadir |
| `storageState` / proyecto setup | No | — | Ausente | Añadir |
| `test.step` | No | — | Ausente | Añadir |
| `test.describe.configure` (serial/parallel) | No | — | Ausente | Añadir |
| `page.route` / mocking | No | — | Ausente | Añadir |
| `APIRequestContext` | No | — | Ausente | Añadir |
| `toHaveScreenshot` | No | — | Ausente | Añadir (opcional) |
| `testIdAttribute` + `getByTestId` | No | se usan selectores CSS de atributo en su lugar | Ausente | Añadir |
| Codegen (`playwright codegen`) | No | ningún script | Ausente | Añadir |

## F. Test Architecture

| Skill | ¿En el repo? | ¿Dónde? | Nivel | Acción |
|---|---|---|---|---|
| Page Object Model | Sí | `pages/` (6 clases) | Sólido | Enseñar |
| Separación acción/aserción | Sí | ningún POM contiene `expect` | Sólido | Enseñar |
| Encapsulación de locators | Sí, con un locator roto | POMs sí en general; `CartPage.cartItems` no funciona (A1, corregido) | Sólido con una excepción real | Enseñar + Ampliar |
| Component Objects | No | — | Ausente | Añadir |
| Fixtures como capa de composición | No | — | Ausente | Añadir |
| Gestión de datos de prueba | No | hardcodeado (A6) | Ausente | Añadir |
| Configuración por entorno | No | `baseURL` fijo, sin `.env` | Ausente | Añadir |
| Convenciones de nombrado | Sí | `*.page.ts`, `*.spec.ts`, títulos "debería..." | Sólido | Enseñar |

## G. Test Design

| Skill | ¿En el repo? | ¿Dónde? | Nivel | Acción |
|---|---|---|---|---|
| Partición de equivalencia | Implícito | `login.spec.ts` (válido/inválido/vacío/bloqueado) | Básico | Ampliar |
| Análisis de valores límite | Implícito | `cart-badge.spec.ts` (0, 1, 2, 4, 5, 6 productos) | Básico | Ampliar |
| Tablas de decisión | No | — | Ausente | Añadir |
| Transición de estados | Implícito | ciclos add→remove→add en `cart-edge-cases.spec.ts` | Básico | Ampliar |
| Test data-driven | No | — | Ausente | Añadir |
| Oráculos de test | Parcial y con fallo | A2, A3 son contraejemplos reales | Básico | Enseñar (por contraste) |

## H. Debugging

| Skill | ¿En el repo? | ¿Dónde? | Nivel | Acción |
|---|---|---|---|---|
| Lectura de mensajes de fallo | Sí, excelente | mensajes descriptivos en todas las aserciones | Avanzado | Enseñar |
| Trace viewer | Config sí, práctica no | `playwright.config.ts:14` | Básico | Ampliar |
| Video de fallos | Config sí, práctica no | `playwright.config.ts:15` | Básico | Ampliar |
| UI mode | No | — | Ausente | Añadir |
| `page.pause()` / Inspector | No | — | Ausente | Añadir |
| Console y network del navegador | Solo vía agente | herramientas del healer | Básico | Ampliar |
| Diagnóstico de causa raíz | Sí, vía IA | `prompts/ai-group-failures.txt` | Sólido | Enseñar |
| 10 fallos reales que diagnosticar | Sí | los 10 `@demo-fail` | Sólido | Enseñar |

## I. Quality Engineering

| Skill | ¿En el repo? | ¿Dónde? | Nivel | Acción |
|---|---|---|---|---|
| Estabilidad / flakiness | Parcial | detección en `report-ai.mjs`; `retries: 2` en CI | Básico | Ampliar |
| Mantenibilidad | Sí, con deuda visible | POM sólido + hallazgos A1-A12 | Sólido | Enseñar |
| Velocidad de ejecución | Sí | `fullyParallel`, `workers: 4` | Sólido | Enseñar |
| Métricas de calidad | Parcial | `stats` en `report-ai.mjs`; sin histórico | Básico | Ampliar |
| Cobertura funcional | Sí | tabla final de `specs/test-index.md` | Sólido | Enseñar |
| Code review de tests | No | sin plantillas de PR ni CODEOWNERS | Ausente | Añadir |
| Linting / calidad estática | No | — | Ausente | Añadir |

## J. Git / GitHub

| Skill | ¿En el repo? | ¿Dónde? | Nivel | Acción |
|---|---|---|---|---|
| Commits convencionales | Sí | 47 commits (`feat:`, `fix:`, `docs:`) | Sólido | Enseñar |
| Ramas | Sí | `main` + esta rama de trabajo | Básico | Ampliar |
| `.gitignore` bien construido | Sí | `.gitignore` (artefactos, settings locales) | Sólido | Enseñar |
| Pull requests y revisión | Parcial | el workflow se dispara en PR, pero no hay PRs de ejemplo ni plantilla | Básico | Ampliar |
| Secrets de repositorio | Sí (documentado) | `GEMINI_API_KEY`, README:288 | Sólido | Enseñar |
| Resolución de conflictos | No | — | Ausente | Añadir |

## K. CI/CD

| Skill | ¿En el repo? | ¿Dónde? | Nivel | Acción |
|---|---|---|---|---|
| Sintaxis de GitHub Actions | Sí | `playwright.yml` | Sólido | Enseñar |
| Triggers (`push`, `pull_request`, `workflow_dispatch` con inputs) | Sí | `playwright.yml:3-14` | Sólido | Enseñar |
| Estrategia de matriz | Sí | `playwright.yml:27-31` | Sólido | Enseñar |
| Condicionales (`if: always()`, `failure()`) | Sí | pasos de IA, summary y artefactos | Sólido | Enseñar |
| Artefactos y retención | Sí | `playwright.yml:71-85` | Sólido | Enseñar |
| Step summary | Sí | `playwright.yml:59-69` | Sólido | Enseñar |
| Secrets en CI | Sí | `playwright.yml:56` | Sólido | Enseñar |
| Salida entre pasos (`$GITHUB_OUTPUT`) | Sí | `playwright.yml:40-47` | Sólido | Enseñar |
| Sharding | No | — | Ausente | Añadir |
| Control de concurrencia | No | (C5) | Ausente | Añadir |
| Publicación de reportes (Pages) | No | señalado como mejora futura en README | Ausente | Añadir (opcional) |
| Quality gates / branch protection | No | — | Ausente | Añadir |

## L. Docker

| Skill | ¿En el repo? | ¿Dónde? | Nivel | Acción |
|---|---|---|---|---|
| Concepto imagen/contenedor | Sí (documentado) | README:120-157 | Sólido | Enseñar |
| Imagen oficial de Playwright | Sí | workflow `container:` + `docker run` en README | Sólido | Enseñar |
| Volúmenes (`-v`) | Sí (documentado) | README:140,145 | Sólido | Enseñar |
| Contenedor en GitHub Actions | Sí | `playwright.yml:24-25` | Sólido | Enseñar |
| Variables de entorno / UID (`HOME=/root`) | Sí, con caso real | `playwright.yml:18` | Sólido | Enseñar (caso real de depuración) |
| Escribir un `Dockerfile` | No | — | Ausente | Añadir |
| `docker-compose` | No | — | Ausente | Añadir (opcional) |
| Correspondencia versión imagen ↔ dependencia | Documentado (B2) | README:124 | Sólido | Enseñar |

## M. AI for QA

| Skill | ¿En el repo? | ¿Dónde? | Nivel | Acción |
|---|---|---|---|---|
| Prompt engineering con formato estricto | Sí | los 4 `prompts/*.txt` | Sólido | Enseñar |
| Prompt chaining | Sí | `report-ai.mjs:32 → 65` | Sólido | Enseñar |
| Salida estructurada (JSON) y su validación | Sí | `report-ai.mjs:36-43,72-78` | Sólido | Enseñar |
| Guardarraíles anti-alucinación | Sí | "No inventes datos" en los 4 prompts + D4 | Sólido | Enseñar |
| Análisis de fallos asistido por IA | Sí | `ai-group-failures.txt`, `ai-corrections.txt` | Sólido | Enseñar |
| Comunicación a negocio generada por IA | Sí | `ai-summary.txt` | Sólido | Enseñar |
| Generación de tickets | Sí (salida) | `ai-tickets.txt` | Sólido | Enseñar |
| MCP (Model Context Protocol) | Sí | `.mcp.json` | Básico-Sólido | Enseñar + Ampliar |
| Subagentes especializados | Sí | `.claude/agents/` (3) | Sólido | Enseñar |
| Generación de tests con IA | Sí (agente) | `playwright-test-generator.md` | Sólido | Enseñar |
| Auto-reparación de tests | Sí (agente) | `playwright-test-healer.md` | Sólido | Enseñar |
| Selección de proveedor/modelo y coste | Sí | `report-ai.mjs:92-96`, `max-parallel: 1` | Sólido | Enseñar |
| Riesgos: inyección de prompt, fuga de datos | No tratado (D1, D2) | — | Ausente | Añadir (crítico para seguros) |
| Revisión humana de salidas de IA | No formalizado | — | Ausente | Añadir |

## N. Test Strategy

| Skill | ¿En el repo? | ¿Dónde? | Nivel | Acción |
|---|---|---|---|---|
| Documento de estrategia de test | No | — | Ausente | Añadir |
| Pirámide / trofeo de testing | No | 100% E2E de UI | Ausente | Añadir |
| Criterios de entrada/salida | No | — | Ausente | Añadir |
| Qué automatizar y qué no | No | — | Ausente | Añadir |
| Selección de suite por contexto (smoke/regresión) | Parcial | `@demo-fail` demuestra el mecanismo, no la estrategia | Básico | Ampliar |
| Estrategia de entornos | No | un solo `baseURL` | Ausente | Añadir |

## O. Business / Risk-based Testing

| Skill | ¿En el repo? | ¿Dónde? | Nivel | Acción |
|---|---|---|---|---|
| Comunicación con negocio | Sí, notable | mensajes de aserción + `ai-summary.txt` para audiencia no técnica | Sólido | Enseñar |
| Análisis de riesgo (impacto × probabilidad) | Parcial | `risk_level` y `severidad` los asigna la IA, no una persona con criterio | Básico | Ampliar |
| Priorización por criticidad de negocio | Parcial | el prompt de tickets prioriza login/checkout | Básico | Ampliar |
| Dominio asegurador | No | dominio e-commerce | Ausente | Añadir (capstone) |
| Coste del fallo / decisión de release | No | — | Ausente | Añadir |

---

# 5. Gap Analysis

Clasificación: **CRITICAL** (sin esto el Learning Lab no cumple su objetivo) · **HIGH** (necesario para un QA autónomo) · **MEDIUM** (eleva el nivel) · **LOW** (opcional / ampliación).

| Skill | Estado actual | Evidencia | Gap | Acción recomendada | Prioridad |
|---|---|---|---|---|---|
| Nivelación TypeScript | Básico | POMs usan clases y `readonly`, pero no hay `interface`, `type` ni genéricos | El alumno sin base de TS no entiende `pages/*.ts` | Módulo 00 de nivelación JS/TS con ejercicios sobre el propio código del repo | **CRITICAL** |
| Material formativo | Inexistente | No hay carpeta `learning/`, ni guías, ni ejercicios | No hay curso, solo un repositorio | Crear arquitectura `learning/` (sección 15) | **CRITICAL** |
| Fixtures de Playwright | Ausente | Ningún `test.extend` | El alumno no aprende la capa de composición moderna | Módulo 02 con refactor guiado de `beforeEach` → fixture | **CRITICAL** |
| Autenticación reutilizable | Ausente | Login por UI en 12 specs (A5) | 237 logins por run; patrón que no escala | Módulo 02: `storageState` + proyecto `setup`, con medición antes/después | **CRITICAL** |
| Gestión de datos de prueba | Ausente | Credenciales e ids hardcodeados (A6) | Suite no parametrizable ni multi-entorno | Módulo 02: módulo de datos tipado + parametrización de A4 | **CRITICAL** |
| Debugging práctico | Básico | Trace y video configurados, sin scripts ni material | El alumno no sabrá diagnosticar solo | Módulo 03 sobre los 10 `@demo-fail`: UI mode, trace viewer, `page.pause()`, codegen | **CRITICAL** |
| Estrategia de test | Ausente | No existe documento de estrategia | El QA automatiza sin criterio de qué automatizar | Módulo 06 + capstone: estrategia y análisis de riesgo escritos por el alumno | **HIGH** |
| Jerarquía de locators | Sólido con fugas | A1, A12: `.cart_item` en tests, un solo `getByRole`, sin `testIdAttribute` | Se enseña `data-test` pero no el criterio completo | Módulo 01: taller de locators sobre ejemplos buenos y malos del propio repo | **HIGH** |
| Testing de API | Ausente | Ningún `APIRequestContext` | Sin API testing la pirámide se queda en la punta | Módulo 04: `request` fixture; SauceDemo no tiene API pública → usar API pública neutral o mock | **HIGH** |
| Mocking de red | Ausente | Ningún `page.route` | No se pueden simular errores de backend ni escenarios raros | Módulo 04: `page.route` para forzar 500/timeout | **HIGH** |
| Riesgos de IA (inyección, datos) | Ausente | D1, D2 sin tratar | Aplicar esto en HDI con datos reales sin formación es un riesgo | Módulo 07: sesión de seguridad y gobernanza de IA | **HIGH** |
| Linting y typecheck | Ausente | B3, B4, A8 | Errores triviales llegan a `main` | Módulo 05: añadir `tsc --noEmit` + ESLint y su paso de CI | **HIGH** |
| Portabilidad del script IA | Roto fuera de una máquina | B1: ruta absoluta en `package.json:14` | Los alumnos no podrán ejecutar `report:ai` en local | Módulo 07 ejercicio 1: hacerlo portable | **HIGH** |
| `test.step` y legibilidad de traza | Ausente | Ningún `test.step` | Trazas menos legibles en flujos largos | Módulo 03 | **MEDIUM** |
| Component Objects | Ausente | Solo POM de página completa | Falta el patrón para elementos compartidos (menú, badge) | Módulo 02 (avanzado) | **MEDIUM** |
| Configuración multi-entorno | Ausente | `baseURL` fijo | No se puede apuntar a dev/QA/preprod | Módulo 05: `.env` + `baseURL` por variable | **MEDIUM** |
| Sharding y escalado de CI | Ausente | C4 | 237 ejecuciones sin repartir | Módulo 05 | **MEDIUM** |
| Concurrencia en Actions | Ausente | C5 | Runs duplicados que compiten por la cuota | Módulo 05 | **MEDIUM** |
| Flakiness real | Solo detección | No hay tests flaky auténticos | No se puede practicar sobre casos reales | Crear 1-2 tests flaky controlados en `learning/` (Fase 2, nunca en `tests/`) | **MEDIUM** |
| Métricas históricas de calidad | Ausente | `stats` por run, sin histórico | No se puede hablar de tendencia | Módulo 06 (conceptual) | **MEDIUM** |
| Integración real con Jira | Solo salida JSON | `ai-tickets.json` con esquema propio | El ticket no llega a Jira solo | Capstone opcional: importador o API | **MEDIUM** |
| Escribir un `Dockerfile` | Ausente | Solo se consume imagen oficial | El alumno usa Docker pero no lo construye | Módulo 05: `Dockerfile` mínimo sobre la imagen base | **MEDIUM** |
| Deriva documental | Presente | E1, E2, E3, E4 | La documentación miente sobre el código | Módulo 06: ejercicio de auditoría doc↔código sobre estos 4 casos | **MEDIUM** |
| Accesibilidad | Ausente | 1 `getByRole` | Fuera del alcance mínimo | Sesión opcional | **LOW** |
| Visual regression | Ausente | Ningún `toHaveScreenshot` | Fuera del alcance mínimo | Sesión opcional | **LOW** |
| GitHub Pages para reportes | Ausente | Mejora futura en README | Comodidad, no competencia | Opcional | **LOW** |
| Cobertura de código | Ausente | — | Poco aplicable a E2E sobre app de terceros | Descartar | **LOW** |

**Resumen:** 6 gaps CRITICAL, 7 HIGH, 9 MEDIUM, 4 LOW. Los seis CRITICAL se concentran en dos bloques: **nivelación de TypeScript** y **arquitectura de test (fixtures, auth, datos)**. Es exactamente donde debe ir el mayor peso de horas.

---

# 6. Target Audience

## 6.1 Perfil declarado

QAs de HDI Seguros Chile con experiencia previa en testing. Se asume:

- Conocen conceptos de QA: caso de prueba, defecto, severidad, regresión, ciclo de vida del bug.
- Pueden venir de testing manual, con o sin automatización previa.
- Algunos habrán usado Selenium, Cypress u otra herramienta.
- **No** se asume conocimiento de Playwright.
- **No** se asume dominio de TypeScript.
- **No** son desarrolladores.
- **No** se asume experiencia con CI/CD, Docker ni IA.

## 6.2 Arquetipos previstos y su impacto en el diseño

Del análisis del repositorio se deduce qué encontrará difícil cada perfil:

| Arquetipo | Descripción | Punto de fricción con este repositorio | Ajuste del Learning Lab |
|---|---|---|---|
| **Manual senior** | Gran criterio de test, poca programación | `pages/*.ts`: clases, constructores, `Promise<void>` | Módulo 00 obligatorio; en módulos 01-02 recibe el POM ya hecho y solo lo usa |
| **Selenium legacy** | Automatiza con esperas explícitas y `driver.findElement` | Le costará *confiar* en el auto-waiting: tenderá a añadir `waitForTimeout` | Sesión específica: por qué `await expect(locator)` sustituye a `sleep`; ejemplo real de `performance_glitch_user` |
| **Cypress** | Cómodo con JS y aserciones encadenadas | Modelo de ejecución distinto (`await` real vs. cola de comandos), multi-navegador real | Comparativa dirigida en módulo 01 |
| **QA técnico** | Ya programa, quizá algo de CI | Se aburre en 00-01 | Ruta acelerada: salta 00, hace de mentor en parejas, ejercicios de extensión marcados **[+]** |
| **QA junior** | Poca experiencia general | Todo | Módulo 00 ampliado + emparejamiento con manual senior |

## 6.3 Implicaciones de diseño

1. **El pre-assessment no es opcional.** Con esta dispersión, arrancar en el mismo punto para todos garantiza perder a la mitad del grupo.
2. **Ninguna sesión debe empezar con la página en blanco.** Siempre se parte de código que ya funciona (el repositorio) y se modifica.
3. **El español es el idioma del código existente** (títulos de test, mensajes de aserción, prompts, README). Todo el material debe mantenerlo. Los términos técnicos y los nombres de API se conservan en inglés.
4. **El contexto de negocio debe migrar a seguros** en el capstone; e-commerce es el vehículo de aprendizaje, no el destino.
5. **Restricción de entorno corporativo:** hay que verificar antes de empezar que desde los equipos de HDI se puede acceder a `saucedemo.com`, a `npmjs.com`, a GitHub y (si se usa el reporte IA en local) al proveedor de IA. Esto es un bloqueante logístico, no técnico. Ver sección 17.

---

# 7. Prerequisites

Cada requisito se justifica con el fichero concreto que lo exige.

## MUST HAVE

| Prerequisito | Justificación (evidencia en el repositorio) |
|---|---|
| Fundamentos de QA: caso de prueba, resultado esperado, defecto, severidad | `specs/add-to-cart-test-plan.md` está escrito en ese lenguaje; sin él, todo el módulo 06 es incomprensible |
| Fundamentos web: HTML, DOM, atributos, URL | Los 6 POMs son selectores de atributo; `route-protection.spec.ts` razona sobre rutas |
| Lectura de código (no escritura) en cualquier lenguaje | El módulo 01 arranca leyendo `login.spec.ts` y `login.page.ts` |
| Línea de comandos básica: `cd`, ejecutar comandos, leer salida | Los 12 scripts de `package.json` se lanzan desde terminal |
| Node.js 20+ instalado (o `nvm`) | README:60; `@types/node: ^20.19.39` |
| Cuenta de GitHub | El workflow, los artefactos y los PRs son parte del temario |
| Acceso de red a `saucedemo.com`, npm y GitHub | `baseURL` apunta a un sitio público externo; `npm ci` descarga paquetes |

## SHOULD HAVE

| Prerequisito | Justificación |
|---|---|
| Sintaxis básica de JavaScript: variables, funciones, arrays, objetos | `inventory.spec.ts:42` usa `map` + `parseFloat` + `replace`; `report-ai.mjs` es JS puro. Quien no lo tenga **hace el módulo 00 ampliado**, no se le excluye |
| Git básico: `clone`, `add`, `commit`, `push`, ramas | 47 commits con convención; los ejercicios se entregan por rama |
| Nociones de HTTP: petición, respuesta, código de estado | Necesario para el módulo 04 (API/mocking) y para entender los 429 de Gemini en el workflow |
| Selectores CSS | `[data-test="..."]`, `[data-test^="..."]`, `#id`, `.cart_item`: los cuatro estilos aparecen en el repositorio |
| Editor con soporte TypeScript (VS Code) | `strict: true` en `tsconfig.json`: el editor es la primera línea de detección de errores, sobre todo sin linter (B4) |

## NICE TO HAVE

| Prerequisito | Justificación |
|---|---|
| Experiencia previa con otra herramienta de automatización | Acelera módulos 01-02, pero puede traer malos hábitos (esperas explícitas) que hay que desaprender |
| Nociones de POO (clases, instancias) | Los 6 POMs son clases; se puede enseñar desde cero en el módulo 00 |
| Docker instalado en local | README:136 lo pide solo para replicar el CI localmente; **el módulo 05 se puede seguir entero contra GitHub Actions sin Docker local** |
| Experiencia usando asistentes de IA | Módulo 07 gana ritmo, pero está diseñado desde cero |
| Cuenta de Jira | Solo relevante para la extensión opcional del capstone |
| API key de Gemini (gratuita, sin tarjeta) | README:291. Solo si el alumno quiere reproducir el reporte IA en su propio fork |

## Requisitos explícitamente NO exigidos

Para evitar barreras artificiales, se descartan como prerequisito: TypeScript avanzado, experiencia con Playwright, saber escribir YAML de CI, saber escribir un `Dockerfile`, conocimientos de LLM o de prompt engineering, y perfil de desarrollador. **Todo eso es resultado del curso, no su entrada.**

---

# 8. Pre-Assessment Design

Diseño conceptual. No se generan aquí las preguntas (eso es Fase 2).

## 8.1 Objetivo

Responder a una única pregunta operativa: **¿este participante necesita el módulo 00 de nivelación JS/TS, y en qué intensidad?** Secundariamente, formar parejas equilibradas y calibrar el ritmo de los módulos 04-07.

**No** es un examen de acceso. Nadie queda excluido por su resultado. Esto debe comunicarse explícitamente antes de la prueba, o la prueba mide ansiedad en vez de conocimiento.

## 8.2 Áreas evaluadas y peso

| # | Área | Peso | Qué se evalúa | Anclaje en el repositorio |
|---|---|---|---|---|
| 1 | Fundamentos de QA y diseño de test | 20% | Distinguir caso positivo/negativo/límite; identificar el resultado esperado; priorizar por riesgo | Casos de `login.spec.ts` y `cart-edge-cases.spec.ts` |
| 2 | Web y selectores | 20% | Leer HTML, elegir el selector correcto entre varios, entender una URL | Los 4 estilos de selector presentes en el repositorio |
| 3 | **JavaScript / TypeScript** | **30%** | Leer una función `async`, entender `await`, arrays y `map`, leer una clase con constructor | `inventory.page.ts` completo e `inventory.spec.ts:39-54` |
| 4 | Automatización y herramientas | 15% | Concepto de test automatizado, aserción, ejecución paralela, flaky; experiencia previa declarada | `playwright.config.ts` |
| 5 | Git, CI/CD, Docker, IA | 15% | Nociones básicas y autoevaluación honesta de exposición previa | `playwright.yml`, `report-ai.mjs` |

El 30% de JS/TS es deliberado: es la variable que decide el itinerario del alumno y el gap CRITICAL número uno.

## 8.3 Formato

- **Duración:** 40 minutos (35 de prueba + 5 de instrucciones). Suficiente para discriminar sin generar fatiga.
- **Número de ítems:** 25-30. Aproximadamente 60% opción múltiple, 30% lectura de código con respuesta corta ("¿qué imprime?", "¿qué hace este método?"), 10% pregunta abierta de criterio QA (sin respuesta única, corregida por rúbrica).
- **Dificultad:** progresiva dentro de cada área. Los ítems se etiquetan internamente como F (fundamento), M (medio), A (avanzado) con distribución aproximada 40/40/20.
- **Modalidad:** individual, sin corrección en vivo, resultado privado. Solo el formador ve la distribución del grupo.
- **Momento:** entre 5 y 10 días antes del inicio, para dar margen a ajustar el módulo 00.
- **Material permitido:** ninguno. No es un examen de memoria: mide lo que la persona reconoce, no lo que puede buscar.

## 8.4 Scoring

Puntuación 0-100, ponderada por los pesos de 8.2. Además del total se calcula el **subíndice JS/TS (0-100)**, que es lo que realmente decide el itinerario:

| Nivel de entrada | Total | Subíndice JS/TS | Significado | Itinerario |
|---|---|---|---|---|
| **BEGINNER** | < 40 | < 40 | Sólido en QA manual, sin base de programación. Puede leer un test pero no distingue una clase de una función | Módulo 00 **ampliado** (doble de horas), emparejado con un perfil técnico, ejercicios de módulos 02+ con andamiaje extra |
| **FOUNDATION** | 40-59 | 40-59 | Reconoce sintaxis JS, se pierde con `async/await` y con clases | Módulo 00 **completo**. Es el itinerario por defecto y el más probable |
| **INTERMEDIATE** | 60-79 | 60-79 | Lee y modifica código con soltura; ha automatizado antes con otra herramienta | Módulo 00 **reducido** (solo la parte de TS y `async`), entra en módulo 01 con ejercicios de extensión |
| **ADVANCED** | ≥ 80 | ≥ 80 | Programa con autonomía; entiende POO, promesas y tipos | **Salta el módulo 00**. Ejercicios **[+]** en todos los módulos, rol de mentor en parejas, y en el capstone lidera el diseño de arquitectura |

Regla de desempate: si el total y el subíndice caen en niveles distintos, **manda el subíndice JS/TS**. Un QA con criterio excelente y cero programación necesita el módulo 00 igual, y probablemente más.

## 8.5 Salidas del pre-assessment

1. **Informe individual privado** (2-3 líneas: nivel, itinerario, qué reforzar antes de empezar).
2. **Mapa de calor del grupo** por área — decide qué módulos se alargan o se comprimen.
3. **Propuesta de parejas** — cada BEGINNER/FOUNDATION con un INTERMEDIATE/ADVANCED, para el trabajo en parejas de los módulos 02-05.
4. **Decisión sobre el módulo 00**: ampliado / completo / reducido según la mediana del grupo.

Se recomienda repetir una versión equivalente al final del programa (post-assessment) para medir progreso real. Es el dato que HDI necesitará para valorar el retorno de la formación.

---

# 9. Proposed Learning Path

## 9.1 Modificaciones sobre la hipótesis inicial

Se mantiene la columna vertebral propuesta en el encargo, con **tres cambios justificados por el análisis del repositorio**:

1. **Se separa "Test Architecture" en dos módulos (02 y 03).** El repositorio tiene POM sólido (`pages/`) pero cero fixtures, cero `storageState` y cero gestión de datos. Son cuatro gaps CRITICAL en un solo módulo: no cabe. El 02 consolida lo que existe; el 03 construye lo que falta.

2. **"Advanced E2E & Debugging" se convierte en un módulo de debugging puro (04).** El repositorio ofrece 10 fallos intencionados con la corrección documentada, dos usuarios con comportamiento anómalo real, y trace + video ya configurados. Es el módulo con mejor material disponible del curso y merece foco propio, no compartir espacio con "E2E avanzado".

3. **"Quality Engineering" se reposiciona como estrategia (06) y se coloca después de CI/CD.** El alumno no puede razonar sobre flakiness, coste de ejecución o quality gates hasta que ha visto un pipeline real fallar. Antes de CI, el módulo sería teoría; después, es análisis.

Se añade además el módulo **05 — Testing más allá de la UI**, que cubre los gaps HIGH de API y mocking. Sin él, el programa entero vive en la punta de la pirámide, que es justo lo que un QA de seguros no debe aprender como único enfoque.

## 9.2 Arquitectura propuesta

```
00 — Assessment & Foundations (JS/TS para QA)
01 — Playwright Fundamentals
02 — Page Object Model & Estructura de Suite
03 — Test Architecture: Fixtures, Auth y Datos
04 — Debugging & Failure Analysis
05 — Testing más allá de la UI (API & Mocking)
06 — CI/CD & Docker
07 — Quality Engineering & Test Strategy
08 — AI-Augmented QA
09 — HDI Capstone
```

Diez módulos numerados 00-09. La numeración del encargo (00-07) se mantiene reconocible; el desdoblamiento aporta granularidad de planificación sin cambiar el arco narrativo.

## 9.3 Grafo de dependencias

```
00 ──► 01 ──► 02 ──► 03 ──┬──► 04 ──┐
                          │         │
                          └──► 05 ──┤
                                    ├──► 06 ──► 07 ──► 09
                                    │
                          08 ◄──────┘   (08 requiere 04 y 06)
                          08 ────────────────────────► 09
```

- **00 → 01 → 02 → 03** es la cadena obligatoria y estrictamente secuencial.
- **04 y 05** dependen de 03 pero son **independientes entre sí**: pueden intercambiarse o solaparse según el ritmo del grupo.
- **06** requiere 04 (para entender qué se depura cuando el pipeline falla).
- **07** requiere 06 (estrategia informada por la realidad del pipeline).
- **08** requiere 04 (análisis de fallos) y 06 (el pipeline donde vive el reporte IA).
- **09** requiere todo.

---

# 10. Module Overview

## Módulo 00 — Assessment & Foundations (JS/TS para QA)

- **Objetivo:** que cualquier participante pueda leer y modificar con confianza el código de `pages/` y `tests/`.
- **Competencias:** C (Programming), D (JavaScript/TypeScript).
- **Conocimientos previos:** los MUST HAVE de la sección 7.
- **Conceptos:** variables y tipos primitivos; funciones y funciones flecha; arrays y `map`/`filter`/`sort`; objetos y desestructuración; módulos `import`/`export`; clases, constructor, `this`, campos `readonly`; anotaciones de tipo y qué significa `strict: true`; promesas, `async`/`await` y por qué **todo** en Playwright lleva `await`.
- **Funcionalidades del repositorio usadas:** `pages/login.page.ts` (la clase más simple, 19 líneas) como texto base; `pages/inventory.page.ts` para métodos con retorno tipado; `inventory.spec.ts:39-54` para `map`/`parseFloat`/`sort`/spread; `tsconfig.json` para hablar de `strict`.
- **Dificultad:** Baja-Media (alta para el perfil BEGINNER).
- **Dependencias:** ninguna.
- **Resultado esperado:** el alumno explica en voz alta, línea a línea, qué hace `inventory.page.ts`, y escribe un método nuevo en un POM sin ayuda.
- **Se salta si:** nivel ADVANCED en el pre-assessment.

## Módulo 01 — Playwright Fundamentals

- **Objetivo:** ejecutar, leer y escribir tests de Playwright con locators y aserciones correctos.
- **Competencias:** B (Web Testing), E (Playwright).
- **Conocimientos previos:** módulo 00.
- **Conceptos:** instalación y estructura de proyecto; `test`, `describe`, `beforeEach`; anatomía de un spec; locators y su jerarquía de preferencia (rol → texto → test-id → CSS/XPath); auto-waiting y web-first assertions; por qué no se usa `waitForTimeout`; aserciones y sus mensajes personalizados; `baseURL` y rutas relativas; ejecución filtrada (`--grep`, `--project`, un fichero, un test); reporter HTML.
- **Funcionalidades del repositorio usadas:** `tests/login.spec.ts` + `pages/login.page.ts` como par de lectura inicial; `playwright.config.ts` completo; los 12 scripts de `package.json`; los 4 estilos de locator presentes (`[data-test=]`, `[data-test^=]`, `#id`, `.cart_item`) para el taller de comparación; el único `getByRole` (`checkout.spec.ts:34`) para introducir locators de usuario; `npm run test:report`.
- **Dificultad:** Media.
- **Dependencias:** 00.
- **Resultado esperado:** el alumno ejecuta la suite en los tres navegadores, lee el informe HTML y escribe dos tests nuevos que pasan, usando los POMs existentes.

## Módulo 02 — Page Object Model & Estructura de Suite

- **Objetivo:** entender, extender y criticar la arquitectura POM del repositorio.
- **Competencias:** F (Test Architecture), G (Test Design).
- **Conocimientos previos:** 01.
- **Conceptos:** qué es y qué no es un Page Object; por qué los POMs no contienen aserciones; encapsulación de locators y fugas del patrón; `readonly` y parámetros de propiedad; cuándo un método pertenece al POM y cuándo al test; nombrado y organización de ficheros; detección de cobertura duplicada.
- **Funcionalidades del repositorio usadas:** los 6 POMs; el hallazgo **A1** — ⚠️ corregido: `CartPage.cartItems` resuelve 0 elementos porque `[data-test="cart-item"]` no existe en la app, y `.cart_item` (5 specs) es el rodeo — como ejercicio de por qué un locator de POM roto puede pasar inadvertido durante 47 commits; el hallazgo **A10** (solape entre `add-tshirt-to-cart` e `inventory-add-to-cart`) como ejercicio de diseño de suite; `menu.page.ts` como ejemplo de excepción justificada (selectores por `id` porque no hay `data-test`).
- **Dificultad:** Media.
- **Dependencias:** 01.
- **Resultado esperado:** el alumno crea un Page Object nuevo desde cero para una página no cubierta y diagnostica y corrige el locator roto de `CartPage.cartItems` en una copia de trabajo de la suite — ⚠️ ver nota sobre A1 arriba: no es refactor por comodidad, es reparación de un defecto real.

## Módulo 03 — Test Architecture: Fixtures, Auth y Datos

- **Objetivo:** llevar la suite del nivel "POM correcto" al nivel "arquitectura profesional".
- **Competencias:** F (Test Architecture), D (TypeScript avanzado), I (Quality Engineering).
- **Conocimientos previos:** 02.
- **Conceptos:** fixtures de Playwright (`test.extend`) y por qué sustituyen al `beforeEach` repetido; fixtures que devuelven Page Objects; `storageState` y proyecto de `setup` para autenticar una vez; separación de datos y código; tipado de datos de prueba (`as const`, `type`/`interface`); parametrización con `for...of`; configuración por entorno; Component Objects para elementos transversales.
- **Funcionalidades del repositorio usadas:** el `beforeEach` idéntico de 12 specs (**A5**) como punto de partida del refactor a fixture; `inventory-add-to-cart.spec.ts:15-58` (**A4**, 5 tests clonados) para parametrizar; los ids mágicos `navigate(4)`/`navigate(5)`/`navigate(2)` (**A6**) y la tabla de ids de `specs/add-to-cart-test-plan.md:663-672` para construir el módulo de datos tipado; `performance-glitch-user-cart.spec.ts` (**A7**) para justificar un proyecto de Playwright con timeout propio.
- **Dificultad:** Alta. **Es el módulo con más gaps CRITICAL concentrados.**
- **Dependencias:** 02.
- **Resultado esperado:** el alumno tiene una versión de la suite (en `learning/`, no en `tests/`) con fixture de autenticación por `storageState`, datos externalizados y al menos una suite parametrizada, **con medición del tiempo de ejecución antes y después**.

## Módulo 04 — Debugging & Failure Analysis

- **Objetivo:** diagnosticar cualquier fallo con método, sin adivinar.
- **Competencias:** H (Debugging), I (Quality Engineering).
- **Conocimientos previos:** 03 (recomendado 02 como mínimo).
- **Conceptos:** anatomía de un mensaje de fallo de Playwright; trace viewer (línea de tiempo, snapshots, red, consola); vídeo de fallo; UI mode y `--debug`; `page.pause()` y el Inspector; `test.step` para trazas legibles; `codegen`; método de causa raíz: reproducir → aislar → hipótesis → verificar; flaky vs. fallo determinista; reintentos y qué esconden.
- **Funcionalidades del repositorio usadas:** **los 10 tests `@demo-fail`** — el material estrella. Cada uno lleva el comentario exacto de cómo revertirlo, de modo que el formador puede ocultarlo y usar el test como caso ciego. Son fallos de cinco tipos distintos: URL esperada errónea (`login`, `menu`, `route-protection`), conteo de elementos (`inventory`, `cart-sync`), valor de badge (`cart-badge`, `inventory-add-to-cart`, `product-detail-add-to-cart`), texto de validación (`checkout`), y estado de visibilidad (`product-detail`). Además: `problem_user` (bug de UI real: solo 3 de 6 productos responden) y `performance_glitch_user` (latencia real) en `problem-user-cart.spec.ts` y `performance-glitch-user-cart.spec.ts`; `trace`/`video` ya configurados en `playwright.config.ts:14-15`; los mensajes descriptivos de aserción de toda la suite como ejemplo de "un buen mensaje ahorra media hora de depuración"; **A2** y **A3** como estudio de "tests que no pueden fallar".
- **Dificultad:** Media-Alta.
- **Dependencias:** 03.
- **Resultado esperado:** el alumno diagnostica 5 de los 10 `@demo-fail` sin ver el comentario, usando solo trace y mensaje de error, y documenta causa raíz + corrección propuesta.

## Módulo 05 — Testing más allá de la UI (API & Mocking)

- **Objetivo:** salir de la punta de la pirámide.
- **Competencias:** B (Web Testing), E (Playwright), N (Test Strategy).
- **Conocimientos previos:** 03.
- **Conceptos:** HTTP y códigos de estado; `request` fixture y `APIRequestContext`; aserciones sobre respuestas; `page.route` para interceptar, modificar y bloquear; simular error 500, respuesta lenta y respuesta vacía; cuándo un test debe ser de API en vez de E2E; coste y velocidad comparados.
- **Funcionalidades del repositorio usadas:** **NO EXISTE material previo** — es el módulo con más creación en Fase 2. Puntos de anclaje disponibles: `performance-glitch-user-cart.spec.ts` (latencia real que se puede reproducir con `page.route` + delay, comparando ambos enfoques) y `route-protection.spec.ts` (protección de rutas como candidato natural a verificación por API). SauceDemo no expone una API pública documentada, así que la parte de API testing requerirá una API pública neutral o un mock local — **decisión a tomar en Fase 2**.
- **Dificultad:** Media.
- **Dependencias:** 03.
- **Resultado esperado:** el alumno escribe un test de API y un test E2E con backend mockeado, y argumenta por escrito cuál de los tests existentes convertiría en test de API y por qué.

## Módulo 06 — CI/CD & Docker

- **Objetivo:** entender y modificar el pipeline real que ya ejecuta esta suite.
- **Competencias:** J (Git/GitHub), K (CI/CD), L (Docker).
- **Conocimientos previos:** 04.
- **Conceptos:** flujo de trabajo Git para tests (rama, PR, revisión); anatomía de un workflow de GitHub Actions; triggers y `workflow_dispatch` con inputs; matrices; contenedores en Actions; artefactos y retención; step summary; secrets; `if: always()` vs. `continue-on-error`; imagen vs. contenedor; por qué se fija el tag de la imagen; sharding y concurrencia; quality gates.
- **Funcionalidades del repositorio usadas:** `.github/workflows/playwright.yml` **completo**, línea a línea — es un workflow real, con decisiones reales y comentarios que explican el porqué: `HOME: /root` por el UID de Firefox (línea 18), `max-parallel: 1` por la cuota de Gemini (línea 29), `continue-on-error` en el paso de IA (línea 54). El README:120-193 con el diagrama del pipeline. Los hallazgos **B2** (tres versiones de Playwright), **C1** (suite `green` por defecto), **C4** (sin sharding), **C5** (sin concurrencia), **B3** (typecheck ausente) como ejercicios de mejora del pipeline.
- **Dificultad:** Media-Alta (alta si el alumno no ha visto YAML).
- **Dependencias:** 04.
- **Resultado esperado:** el alumno abre un PR contra su fork que añade un paso al workflow (typecheck o sharding), lo ve ejecutarse en verde, y explica qué hace `container:` y por qué elimina la necesidad de `playwright install`.

## Módulo 07 — Quality Engineering & Test Strategy

- **Objetivo:** pasar de "escribir tests" a "decidir qué se prueba, cómo y con qué criterio".
- **Competencias:** I (Quality Engineering), N (Test Strategy), O (Business/Risk).
- **Conocimientos previos:** 06.
- **Conceptos:** pirámide/trofeo de testing; qué automatizar y qué no; testing basado en riesgo (impacto × probabilidad); criterios de entrada y salida; smoke vs. regresión vs. suite completa y su selección por tags; flakiness: causas, coste y política; métricas útiles e inútiles; mantenibilidad como coste recurrente; comunicación de resultados a negocio.
- **Funcionalidades del repositorio usadas:** `specs/test-index.md` y su tabla de cobertura funcional; el mecanismo de tags `@demo-fail` como base para diseñar un esquema `@smoke`/`@regression`/`@critical`; el trade-off `max-parallel: 1` (línea 29 del workflow) como caso de decisión coste/velocidad documentada; los 237 runs por ejecución completa como problema de escalado real; **E1-E4** (deriva documental) como ejercicio de auditoría doc↔código; `prompts/ai-summary.txt` como ejemplo de comunicación a audiencia no técnica.
- **Dificultad:** Media (conceptualmente alta, técnicamente baja).
- **Dependencias:** 06.
- **Resultado esperado:** el alumno redacta una estrategia de test de 2 páginas para un producto asegurador genérico y propone un esquema de tags con criterio de ejecución por tipo de pipeline.

## Módulo 08 — AI-Augmented QA

- **Objetivo:** usar la IA como multiplicador del QA, con criterio y con guardarraíles. Nunca como sustituto.
- **Competencias:** M (AI for QA), H (Debugging), O (Business).
- **Conocimientos previos:** 04 y 06.
- **Conceptos:** qué es un LLM y qué no puede garantizar; prompt engineering con contrato de salida; salida estructurada y su validación; prompt chaining; alucinación y su mitigación; MCP y por qué existe; subagentes con herramientas acotadas; generación de tests asistida y su revisión obligatoria; auto-reparación de tests y su peligro (un test "reparado" puede dejar de detectar el bug); análisis de fallos por IA; coste, cuota y elección de modelo; **inyección de prompt y confidencialidad de datos** (crítico en el sector asegurador).
- **Funcionalidades del repositorio usadas:** `scripts/report-ai.mjs` completo (225 líneas, se lee entero); los 4 `prompts/*.txt`; `.mcp.json`; los 3 subagentes de `.claude/agents/`; los pasos "Generate AI report" y "Show AI summary" del workflow; los 4 ficheros de salida en `playwright-report/`; `specs/add-to-cart-test-plan.md` como evidencia física del flujo planner→generator. Hallazgos usados como ejercicio: **D4** (el modelo inventaba la fecha y el código lo corrige — alucinación real con mitigación real), **D3** (validación por `JSON.parse` sin esquema), **D1** y **D2** (permisos y superficie de inyección), **B1** (la ruta absoluta que rompe `report:ai` fuera de una máquina).
- **Dificultad:** Media-Alta.
- **Dependencias:** 04, 06.
- **Resultado esperado:** el alumno modifica un prompt y observa el cambio en la salida; ejecuta el pipeline IA sobre una ejecución con fallos; genera un test con el agente y **lo revisa críticamente**; y enumera tres riesgos de aplicar este pipeline a una aplicación de HDI con datos reales.

## Módulo 09 — HDI Capstone

- **Objetivo:** integrar todo en un entregable propio con contexto asegurador.
- **Competencias:** todas (A-O).
- **Conocimientos previos:** módulos 00-08.
- **Conceptos:** los del programa, aplicados de forma autónoma.
- **Funcionalidades del repositorio usadas:** el repositorio completo como referencia arquitectónica; la app objetivo se define en la sección 14.
- **Dificultad:** Alta.
- **Dependencias:** todas.
- **Resultado esperado:** ver sección 14.

---

# 11. Repository-to-Learning Mapping

Mapeo módulo ↔ concepto ↔ **archivo real**. Donde no hay material se indica **NO EXISTE — crear posteriormente**. Ningún nombre de fichero de esta tabla está inventado.

| Módulo | Concepto | Archivo real | Qué aprende el alumno |
|---|---|---|---|
| 00 | Clase con constructor y campos `readonly` | `pages/login.page.ts` (19 líneas) | Leer la unidad de código más simple del repositorio de principio a fin |
| 00 | Parámetro de propiedad (`private readonly page: Page`) | `pages/login.page.ts:6` | Qué hace TypeScript por él en el constructor |
| 00 | Método `async` con tipo de retorno | `pages/login.page.ts:14` | Por qué `Promise<void>` y por qué `await` |
| 00 | Métodos que devuelven datos | `pages/inventory.page.ts:24-30` | `Promise<string[]>` y `allTextContents()` |
| 00 | Arrays: `map`, `sort`, spread, `parseFloat` | `tests/inventory.spec.ts:42-53` | Transformar datos extraídos de la UI |
| 00 | `strict` mode | `tsconfig.json:5` | Qué errores atrapa el compilador antes de ejecutar |
| 00 | Módulos ESM, `Promise.all`, `spawn`, `fetch` | `scripts/report-ai.mjs` | JavaScript real fuera del framework de test |
| 01 | Estructura de un spec | `tests/login.spec.ts` | `describe` + `beforeEach` + `test` |
| 01 | Configuración del runner | `playwright.config.ts` (31 líneas) | Cada opción y su efecto observable |
| 01 | `baseURL` y rutas relativas | `playwright.config.ts:13` + `pages/login.page.ts:11` | Por qué `goto('/')` funciona |
| 01 | Locator por atributo de test | `pages/login.page.ts:7,15-17` | La estrategia preferida y por qué |
| 01 | Locator por prefijo | `pages/product-detail.page.ts:21,25` | `[data-test^=]` cuando el id es dinámico |
| 01 | Locator por `id` (excepción justificada) | `pages/menu.page.ts:7,12,18` | Qué hacer cuando no hay `data-test` |
| 01 | Locator por clase CSS (contraejemplo) | `tests/cart-sync.spec.ts:42`, `tests/cart-edge-cases.spec.ts:56` | Por qué `.cart_item` es frágil frente a `[data-test="cart-item"]` |
| 01 | Locator por rol (único en la suite) | `tests/checkout.spec.ts:34` | `getByRole` y locators orientados al usuario |
| 01 | Encadenado y filtrado de locators | `tests/product-detail-add-to-cart.spec.ts:117-121` | `.filter({ hasText })` + `.locator('img')` |
| 01 | `hasText` en el POM | `pages/inventory.page.ts:33` | Localizar por contenido |
| 01 | Catálogo de aserciones | `tests/cart-badge.spec.ts` completo | `toHaveText`, `not.toBeVisible`, `toHaveURL`, `toHaveCount` |
| 01 | Mensajes de aserción personalizados | cualquier `expect` de la suite | Un fallo que se entiende sin abrir el código |
| 01 | Ejecución filtrada | `package.json:5-13` (12 scripts) | `--project`, `--grep`, `--headed`, `show-report` |
| 02 | POM: 6 implementaciones comparables | `pages/` (los 6 ficheros) | Qué tienen en común y en qué se diferencian |
| 02 | POM sin aserciones | los 6 POMs (ningún `expect`) | Separación acción / verificación |
| 02 | Locator de POM roto (**A1**, ⚠️ corregido) | `CartPage.cartItems` (`pages/cart.page.ts:7`) resuelve 0 elementos — `[data-test="cart-item"]` no existe en la app — frente a `.cart_item` en `tests/cart-sync.spec.ts`, `tests/cart-edge-cases.spec.ts`, `tests/add-tshirt-to-cart.spec.ts`, `tests/performance-glitch-user-cart.spec.ts`, `tests/problem-user-cart.spec.ts` | Diagnosticar por qué un locator roto es invisible hasta que alguien lo usa, y corregirlo |
| 02 | Cobertura duplicada (**A10**) | `tests/add-tshirt-to-cart.spec.ts` vs `tests/inventory-add-to-cart.spec.ts` | Coste de mantener dos veces lo mismo |
| 02 | Nombrado y organización | árbol `pages/` + `tests/` | Convención `*.page.ts` / `*.spec.ts` |
| 03 | `beforeEach` repetido → fixture (**A5**) | los `beforeEach` de 12 specs, p. ej. `tests/checkout.spec.ts:12-22` | Refactor a `test.extend` |
| 03 | Autenticación por UI a eliminar | `pages/login.page.ts:14-18` invocado 237 veces por run | `storageState` + proyecto `setup` |
| 03 | Tests clonados → parametrización (**A4**) | `tests/inventory-add-to-cart.spec.ts:15-58` | Un `for...of` sustituye a 5 tests |
| 03 | Datos mágicos (**A6**) | `tests/product-detail-add-to-cart.spec.ts:19,35,45,55,66`; tabla de ids en `specs/add-to-cart-test-plan.md:663-672` | Módulo de datos tipado |
| 03 | Timeouts repetidos (**A7**) | `tests/performance-glitch-user-cart.spec.ts` (5 apariciones de `{ timeout: 15000 }`) | Proyecto de Playwright con timeout propio |
| 03 | Configuración multi-entorno | `playwright.config.ts:13` (`baseURL` fijo) | **NO EXISTE — crear posteriormente** |
| 03 | Fixture propio | — | **NO EXISTE — crear posteriormente** |
| 03 | Component Object | — | **NO EXISTE — crear posteriormente** |
| 04 | Fallo: URL esperada incorrecta | `tests/login.spec.ts:12-20`, `tests/menu.spec.ts:18-30`, `tests/route-protection.spec.ts:30-42` | Diagnosticar una aserción de navegación |
| 04 | Fallo: conteo de elementos | `tests/inventory.spec.ts:15-21`, `tests/cart-sync.spec.ts:21-35` | `toHaveCount` y sus mensajes |
| 04 | Fallo: valor de badge | `tests/cart-badge.spec.ts:28-39`, `tests/inventory-add-to-cart.spec.ts:60-73`, `tests/product-detail-add-to-cart.spec.ts:54-63` | Estado de la aplicación vs. expectativa |
| 04 | Fallo: texto de validación | `tests/checkout.spec.ts:39-52` | `toContainText` sobre mensajes de formulario |
| 04 | Fallo: visibilidad esperada | `tests/product-detail.spec.ts:44-53` | `toHaveText` donde correspondía `not.toBeVisible()` |
| 04 | Bug de aplicación real | `tests/problem-user-cart.spec.ts` (usuario `problem_user`, solo 3 de 6 productos responden) | Distinguir bug de la app de bug del test |
| 04 | Latencia real | `tests/performance-glitch-user-cart.spec.ts` (usuario `performance_glitch_user`) | Timeouts, esperas y por qué no `sleep` |
| 04 | Test que no puede fallar (**A2**) | `tests/problem-user-cart.spec.ts:56-66` | Aserción condicional como anti-patrón |
| 04 | Aserción sin oráculo (**A3**) | `tests/problem-user-cart.spec.ts:77-87` | Esperado derivado del real |
| 04 | Aserción que promete de más (**A9**) | `tests/cart-sync.spec.ts:31-34` | Mensaje ≠ verificación |
| 04 | Trace y vídeo | `playwright.config.ts:14-15` | Configurados; falta el material de uso |
| 04 | UI mode, `--debug`, `page.pause()`, `test.step`, `codegen` | — | **NO EXISTE — crear posteriormente** (ningún script ni uso en el repositorio) |
| 05 | API testing | — | **NO EXISTE — crear posteriormente** |
| 05 | `page.route` / mocking | — | **NO EXISTE — crear posteriormente** |
| 05 | Anclaje para simular latencia | `tests/performance-glitch-user-cart.spec.ts` | Comparar latencia real vs. simulada |
| 05 | Candidato a test de API | `tests/route-protection.spec.ts` | Qué se verificaría mejor sin navegador |
| 06 | Workflow completo | `.github/workflows/playwright.yml` (86 líneas) | Leer un pipeline real de principio a fin |
| 06 | Trigger con input | `.github/workflows/playwright.yml:8-14` | `workflow_dispatch` + `choice` |
| 06 | Matriz de navegadores | `.github/workflows/playwright.yml:27-31` | 3 jobs desde una definición |
| 06 | Contenedor en Actions | `.github/workflows/playwright.yml:24-25` | Por qué no hace falta `playwright install` |
| 06 | Variable de entorno con causa real | `.github/workflows/playwright.yml:18` (`HOME: /root`) | Un bug de entorno real y su solución |
| 06 | Trade-off documentado | `.github/workflows/playwright.yml:29` (`max-parallel: 1`) | Velocidad sacrificada por cuota de LLM |
| 06 | Paso a paso condicional | `.github/workflows/playwright.yml:53-54,60,72,80` | `if: always()`, `failure()`, `continue-on-error` |
| 06 | Salida entre pasos | `.github/workflows/playwright.yml:40-47` | `$GITHUB_OUTPUT` y `case` de shell |
| 06 | Step summary | `.github/workflows/playwright.yml:59-69` | Resultado visible sin descargar nada |
| 06 | Artefactos | `.github/workflows/playwright.yml:71-85` | Retención diferenciada 30 / 7 días |
| 06 | Secrets | `.github/workflows/playwright.yml:56` + README:288-291 | Gestión de credenciales en CI |
| 06 | Docker: consumo de imagen oficial | README:120-157 | Imagen, tag, volumen, reproducibilidad |
| 06 | Deriva de versiones (**B2**) | `package.json:18` (`^1.49.0`) vs `package-lock.json` (1.58.2) vs workflow:25 (`v1.58.2-jammy`) | Tres fuentes de verdad |
| 06 | Typecheck ausente (**B3**) | `tsconfig.json` existe; ningún paso lo ejecuta | Añadir la comprobación que falta |
| 06 | `Dockerfile`, sharding, concurrencia, Pages | — | **NO EXISTE — crear posteriormente** |
| 07 | Inventario y cobertura funcional | `specs/test-index.md` (tabla final) | Documentar cobertura de forma legible |
| 07 | Plan de pruebas formal | `specs/add-to-cart-test-plan.md` (43 casos) | Pasos, criterios de aceptación, criterios de fallo |
| 07 | Selección de suite por tags | `package.json:7-8` + workflow:40-47 | Base para `@smoke`/`@regression`/`@critical` |
| 07 | Deriva documental (**E1-E4**) | `specs/test-index.md:30` (9 vs 10 reales); `specs/add-to-cart-test-plan.md:22` (`sauce-labs-t-shirt` vs `test.allthethings()-t-shirt-(red)`); README:322 (`on-first-retry`) vs `playwright.config.ts:14` (`retain-on-failure`) | Auditoría documentación ↔ código |
| 07 | Comunicación a negocio | `prompts/ai-summary.txt` | Formato de informe no técnico |
| 07 | Estrategia de test, pirámide, quality gates | — | **NO EXISTE — crear posteriormente** |
| 08 | Orquestador de IA | `scripts/report-ai.mjs` (225 líneas) | Leerlo entero: es el corazón del módulo |
| 08 | Prompt con contrato de salida | `prompts/ai-group-failures.txt` | JSON estricto y prohibición de inventar |
| 08 | Prompt para audiencia no técnica | `prompts/ai-summary.txt` | Control de formato hasta el nivel de emoji |
| 08 | Prompt de diagnóstico | `prompts/ai-corrections.txt` | Hipótesis de causa + pasos de corrección |
| 08 | Prompt de generación de tickets | `prompts/ai-tickets.txt` | Esquema de 7 campos con severidad derivada |
| 08 | Prompt chaining | `scripts/report-ai.mjs:32` → `:65-69` | La salida del paso 1 alimenta 2, 3 y 4 |
| 08 | Paralelismo de llamadas | `scripts/report-ai.mjs:65` | `Promise.all` sobre tres llamadas |
| 08 | Alucinación real y su mitigación (**D4**) | `scripts/report-ai.mjs:45-51` | No pidas al modelo un dato que ya tienes |
| 08 | Validación de salida (**D3**) | `scripts/report-ai.mjs:36-43,72-78` + `stripMarkdownFences:181` | Parseable no es correcto |
| 08 | Resiliencia frente a cuota | `scripts/report-ai.mjs:98-135` | Backoff exponencial con jitter en 429/5xx |
| 08 | Selección de proveedor y coste | `scripts/report-ai.mjs:92-96` | Claude local vs. Gemini en CI |
| 08 | Permisos de agente (**D1**) | `scripts/report-ai.mjs:154` (`--dangerously-skip-permissions`) | Qué concedes cuando automatizas un agente |
| 08 | Superficie de inyección (**D2**) | `scripts/report-ai.mjs:32` (JSON completo al modelo) | Riesgo con datos reales de HDI |
| 08 | Portabilidad rota (**B1**) | `package.json:14` (ruta absoluta de una máquina) | Ejercicio de corrección con impacto inmediato |
| 08 | MCP | `.mcp.json` | Qué es un servidor MCP y qué expone |
| 08 | Subagente planificador | `.claude/agents/playwright-test-planner.md` | Explorar la app y escribir el plan |
| 08 | Subagente generador | `.claude/agents/playwright-test-generator.md` | Generar el spec ejecutando pasos reales |
| 08 | Subagente reparador | `.claude/agents/playwright-test-healer.md` | Auto-reparación y su riesgo |
| 08 | Evidencia del flujo agente | `specs/add-to-cart-test-plan.md` | Un plan de 43 casos producido con este flujo |
| 08 | Integración con IA en el pipeline | `.github/workflows/playwright.yml:52-69` | El reporte IA como paso de CI |
| 08 | Salidas del pipeline IA | `playwright-report/ai-summary.txt`, `ai-corrections.md`, `ai-tickets.json`, `ai-failures-grouped.json` (generados) + ejemplos en README:234-272 | Los cuatro artefactos y su audiencia |
| 08 | Integración real con Jira | — | **NO EXISTE — crear posteriormente** (solo hay salida en formato Jira, no API) |
| 09 | Aplicación objetivo del capstone | — | **NO EXISTE — decidir en Fase 2** (ver sección 14) |
| 09 | Journeys de seguros | — | **NO EXISTE — crear posteriormente** |

---

# 12. Pedagogical Progression

## 12.1 Los siete niveles aplicados

| Nivel | Verbo | Qué hace el alumno | Qué entrega |
|---|---|---|---|
| **1 — FOLLOW** | Seguir | Ejecuta y lee ejemplos existentes | Captura del resultado + explicación en voz alta |
| **2 — MODIFY** | Modificar | Cambia código que ya funciona | Diff pequeño que sigue pasando |
| **3 — CREATE** | Crear | Escribe algo nuevo desde cero | Test o Page Object nuevo |
| **4 — DESIGN** | Diseñar | Elige entre alternativas y justifica | Documento breve de decisión |
| **5 — TROUBLESHOOT** | Diagnosticar | Encuentra la causa raíz de un fallo | Informe de diagnóstico |
| **6 — OPTIMIZE** | Optimizar | Mejora algo que ya funciona, con métrica | Antes/después medido |
| **7 — ARCHITECT** | Arquitecturar | Diseña la solución completa | Suite y estrategia propias |

## 12.2 Asignación por módulo

| Módulo | Niveles | Nivel dominante | Ejemplo concreto de actividad |
|---|---|---|---|
| **00 — Foundations** | 1, 2 | **FOLLOW** | Leer `pages/login.page.ts` línea a línea; cambiar el tipo de retorno de un método y ver qué dice el compilador |
| **01 — Playwright Fundamentals** | 1, 2, 3 | **MODIFY** | Ejecutar la suite completa; cambiar un locator y observar el fallo; escribir dos tests nuevos con los POMs existentes |
| **02 — POM & Suite** | 2, 3, 4 | **CREATE** | Crear un Page Object nuevo; eliminar la fuga `.cart_item` (**A1**); decidir qué hacer con la cobertura duplicada (**A10**) |
| **03 — Test Architecture** | 3, 4, 6 | **DESIGN** | Diseñar el fixture de autenticación; externalizar los datos; parametrizar los 5 tests clonados; **medir tiempo antes/después** |
| **04 — Debugging** | 5 | **TROUBLESHOOT** | Diagnosticar los 10 `@demo-fail` con el comentario oculto; distinguir el bug real de `problem_user` de un fallo de test |
| **05 — Más allá de la UI** | 3, 4 | **CREATE** | Escribir un test de API y uno con `page.route`; argumentar qué test E2E existente convertiría y por qué |
| **06 — CI/CD & Docker** | 1, 2, 4, 6 | **OPTIMIZE** | Leer el workflow entero (1); añadir el typecheck (2); decidir estrategia de sharding (4); reducir el tiempo del pipeline (6) |
| **07 — Quality Engineering** | 4, 6 | **DESIGN** | Diseñar el esquema de tags; auditar la deriva documental (**E1-E4**); escribir una estrategia de test |
| **08 — AI-Augmented QA** | 2, 4, 5, 6 | **OPTIMIZE** | Modificar un prompt y comparar salidas (2); arreglar **B1** (2); decidir qué revisar siempre en una salida de IA (4); usar el reporte IA para diagnosticar (5); mejorar la validación de **D3** (6) |
| **09 — Capstone** | 7 | **ARCHITECT** | Diseñar y construir la suite completa con estrategia, arquitectura, CI y análisis IA |

## 12.3 Principios de la progresión

1. **Nunca se salta un nivel hacia arriba dentro de un módulo.** Todo módulo empieza en FOLLOW o MODIFY aunque su nivel dominante sea superior.
2. **TROUBLESHOOT (04) va antes que OPTIMIZE (06, 08).** No se puede mejorar lo que no se sabe diagnosticar.
3. **ARCHITECT solo aparece en el capstone.** Es el único punto donde el alumno parte de una página en blanco, y llega ahí con ocho módulos de andamiaje.
4. **Cada nivel tiene su forma de evidencia.** FOLLOW y MODIFY se evidencian con un diff; DESIGN y ARCHITECT con un documento; TROUBLESHOOT con un informe; OPTIMIZE con un número antes y un número después.
5. **Los ejercicios [+]** (para nivel ADVANCED) suben siempre un nivel respecto al ejercicio base del módulo, no añaden más volumen del mismo nivel.

---

# 13. Duration Options

Supuestos comunes a las tres opciones: grupo de 8-12 personas, sesiones en directo (presencial o remoto), un formador, trabajo en parejas en los módulos 02-06, y entorno verificado antes del inicio.

## OPTION A — 4 semanas (intensivo)

| Concepto | Valor |
|---|---|
| Horas por semana | 8 (2 sesiones de 4 h) |
| Total de horas lectivas | 32 |
| Número de sesiones | 8 |
| Teoría / práctica | 25% / 75% (~8 h / ~24 h) |
| Homework | 3-4 h por semana (12-16 h) |
| Assessment | Pre (40 min, previo) + una revisión intermedia en la semana 2 |
| Capstone | 6 h dentro de las sesiones + 6-8 h fuera |
| **Cobertura** | 00 (reducido), 01, 02, 03, 04, 06, 08, 09. **Se sacrifican 05 (API/mocking) y 07 (estrategia)** |

**Reparto:** S1: 00+01 · S2: 02+03 · S3: 04+06 · S4: 08+09.

**Recomendable si:** el grupo entra mayoritariamente en INTERMEDIATE/ADVANCED y existe presión de calendario. **Riesgo alto** con perfil BEGINNER/FOUNDATION: el módulo 03 (el de mayor densidad) recibe media sesión y es donde se concentran cuatro gaps CRITICAL.

## OPTION B — 6 semanas (equilibrado) ✅ **RECOMENDADA**

| Concepto | Valor |
|---|---|
| Horas por semana | 6 (2 sesiones de 3 h) |
| Total de horas lectivas | 36 |
| Número de sesiones | 12 |
| Teoría / práctica | 20% / 80% (~7 h / ~29 h) |
| Homework | 2-3 h por semana (12-18 h) |
| Assessment | Pre (40 min, previo) + checkpoint al final de las semanas 2 y 4 + post-assessment final |
| Capstone | 6 h en sesión (semana 6) + 8-10 h fuera |
| **Cobertura** | **Los 10 módulos** |

**Reparto:**

| Semana | Sesión 1 (3 h) | Sesión 2 (3 h) | Homework |
|---|---|---|---|
| 1 | 00 — Foundations JS/TS | 01 — Playwright Fundamentals (parte 1) | Ejercicios de lectura de código |
| 2 | 01 — Fundamentals (parte 2) | 02 — POM & Suite · *checkpoint 1* | Crear un Page Object nuevo |
| 3 | 03 — Arquitectura: fixtures y auth | 03 — Datos y parametrización | Refactor completo con medición |
| 4 | 04 — Debugging (los 10 `@demo-fail`) | 05 — API & Mocking · *checkpoint 2* | Diagnóstico escrito de 3 fallos |
| 5 | 06 — CI/CD & Docker | 07 — Quality Engineering & Strategy | PR con mejora del workflow |
| 6 | 08 — AI-Augmented QA | 09 — Capstone (arranque + defensa) | Capstone |

**Por qué esta:** la semana 3 completa se dedica al módulo 03, que concentra cuatro de los seis gaps CRITICAL. Las sesiones de 3 h mantienen la atención mejor que las de 4 h. Seis semanas caben en un trimestre sin colisionar con cierres de mes ni periodos de vacaciones, y 6 h semanales son absorbibles por un equipo que además tiene su trabajo diario.

## OPTION C — 8 semanas (profundo)

| Concepto | Valor |
|---|---|
| Horas por semana | 5 (1 sesión de 3 h + 1 de 2 h) |
| Total de horas lectivas | 40 |
| Número de sesiones | 16 |
| Teoría / práctica | 20% / 80% (~8 h / ~32 h) |
| Homework | 2 h por semana (16 h) |
| Assessment | Pre + checkpoints en semanas 2, 4 y 6 + post-assessment |
| Capstone | 8 h en sesión (semanas 7-8) + 10-12 h fuera |
| **Cobertura** | Los 10 módulos **+ extras**: accesibilidad, visual regression, `Dockerfile` propio, integración real con Jira |

**Recomendable si:** el grupo es mayoritariamente BEGINNER, o si HDI quiere que el capstone se construya sobre una aplicación interna real (lo que exige tiempo de acceso, entorno y datos).

**Riesgo:** ocho semanas con 5 h/semana pierden inercia. Requiere disciplina de calendario y protección real del tiempo de los participantes.

## Recomendación para HDI: OPTION B (6 semanas)

Cuatro razones, todas derivadas del análisis:

1. **El módulo 03 necesita una semana entera.** Cuatro gaps CRITICAL (fixtures, `storageState`, datos, parametrización) viven ahí. La opción A le da media sesión.
2. **El perfil declarado no es de desarrolladores.** Con el módulo 00 completo por delante, comprimir a 4 semanas convierte la nivelación en un trámite y arrastra el déficit hasta el capstone.
3. **Cubre los 10 módulos sin extras.** La opción A sacrifica API/mocking y estrategia — precisamente lo que distingue a un QA que automatiza de un QA que diseña calidad. La opción C añade material opcional a costa de estirar el calendario.
4. **36 horas lectivas + ~15 de homework ≈ 51 horas** es una inversión justificable y medible para un equipo corporativo, con un entregable tangible (el capstone) como evidencia de retorno.

---

# 14. Capstone Proposal

## 14.1 Principio de diseño

El capstone hace evolucionar el proyecto desde e-commerce hacia un escenario asegurador. **No se inventa ningún proceso específico de HDI Seguros Chile**: se usan journeys genéricos del sector, universalmente reconocibles, que HDI podrá sustituir por sus propios flujos cuando quiera y sin rediseñar el ejercicio.

## 14.2 Aplicación objetivo — decisión pendiente para Fase 2

Tres alternativas, con su análisis:

| Opción | Descripción | A favor | En contra |
|---|---|---|---|
| **C1 — Sitio público de demo aseguradora** | Usar una web pública de demo con formularios de cotización | Realista, cero mantenimiento | Depende de un tercero; puede cambiar o caerse a mitad de curso |
| **C2 — App de práctica local** | Una SPA mínima con los journeys de seguros, servida con `webServer` en `playwright.config.ts` | Control total, offline, se puede romper a propósito para generar fallos didácticos | Hay que construirla en Fase 2 (coste de desarrollo, no trivial) |
| **C3 — Aplicación interna de HDI** | Un entorno de QA real de HDI | Máximo valor y transferencia inmediata | Requiere accesos, datos, VPN y aprobaciones. **Decisión de HDI, no del diseño formativo** |

**Recomendación:** **C2** como base garantizada, con **C3** como capa opcional si HDI facilita entorno a tiempo. C2 tiene además una ventaja pedagógica decisiva: al controlar la aplicación, se pueden introducir bugs deliberados y regresiones entre semanas, que es exactamente el escenario que el módulo 04 entrena. **Esta decisión debe tomarse en la primera semana de la Fase 2**, porque condiciona el material de los módulos 05 y 09.

## 14.3 Journeys genéricos de seguros propuestos

| # | Journey | Por qué es buen material de test |
|---|---|---|
| J1 | **Cotización de seguro** — formulario multi-paso (datos personales → bien asegurado → coberturas → prima) | Validaciones por paso, cálculo derivado, navegación adelante/atrás, persistencia entre pasos |
| J2 | **Contratación de póliza** — de cotización a póliza emitida | Flujo E2E largo, punto de no retorno, confirmación con número de póliza |
| J3 | **Consulta de póliza** — portal de cliente, listado y detalle | Autenticación, listados, filtros, control de acceso |
| J4 | **Declaración de siniestro** — apertura de aviso con datos y adjuntos | Formulario complejo, subida de fichero, estados del siniestro |
| J5 | **Gestión de datos del asegurado** — modificar contacto, domicilio, beneficiarios | CRUD, validaciones, efectos secundarios |

Cada journey se corresponde con una entidad de negocio distinta y obliga a decisiones de arquitectura distintas: J1 pide Component Objects (los pasos comparten cabecera y navegación), J3 pide `storageState`, J4 pide gestión de datos de prueba y ficheros, J2 pide análisis de riesgo (¿qué pasa si un test deja una póliza emitida en el entorno?).

## 14.4 Entregables del capstone

El alumno (o la pareja) entrega un repositorio propio con:

| # | Entregable | Módulo que lo respalda | Nivel |
|---|---|---|---|
| 1 | **Estrategia de test** (2-3 páginas): alcance, qué se automatiza y qué no, entornos, criterios de entrada/salida | 07 | DESIGN |
| 2 | **Análisis de riesgo**: matriz impacto × probabilidad sobre los journeys elegidos, con priorización justificada | 07 | DESIGN |
| 3 | **Escenarios de test**: al menos 15 casos documentados con pasos y criterios, en el formato de `specs/add-to-cart-test-plan.md` | 07, 01 | CREATE |
| 4 | **Suite Playwright**: mínimo 2 journeys automatizados, con positivos, negativos y casos límite | 01, 02 | CREATE |
| 5 | **Arquitectura**: Page Objects, al menos un fixture propio, autenticación por `storageState`, datos externalizados y tipados | 02, 03 | ARCHITECT |
| 6 | **Tests negativos y de borde**: validaciones, campos vacíos, valores límite (edad, importe, fechas) | 01, 07 | CREATE |
| 7 | **Cross-browser**: proyectos configurados y suite verde en los tres navegadores | 01, 06 | MODIFY |
| 8 | **Reporting**: HTML + JSON, con esquema de tags (`@smoke`, `@regression`, `@critical`) y su criterio de uso | 01, 07 | DESIGN |
| 9 | **Informe de debugging**: diagnóstico documentado de al menos 3 fallos (inyectados por el formador), con trace | 04 | TROUBLESHOOT |
| 10 | **Pipeline CI**: workflow propio de GitHub Actions con matriz, artefactos y step summary | 06 | CREATE |
| 11 | **Análisis IA**: pipeline de reporte IA adaptado, con al menos un prompt propio y su justificación | 08 | OPTIMIZE |
| 12 | **Defensa** (15 min): decisiones de arquitectura, qué haría distinto y qué no automatizaría | todos | ARCHITECT |

**Extensiones opcionales** (para nivel ADVANCED): tests de API sobre el backend del journey (05); mocking de un servicio externo, p. ej. simular caída del servicio de cálculo de prima (05); `Dockerfile` propio (06); envío real de los tickets generados por IA a Jira (08).

## 14.5 Rúbrica de evaluación

| Dimensión | Peso | Qué se valora |
|---|---|---|
| Criterio QA (qué se prueba y por qué) | 25% | Riesgo bien razonado, cobertura con sentido, decisiones de no-automatizar justificadas |
| Arquitectura y mantenibilidad | 25% | POM limpio, fixtures, datos externalizados, ausencia de los anti-patrones A1-A12 |
| Corrección técnica | 20% | Suite verde, locators sólidos, aserciones con oráculo real y mensaje útil |
| CI/CD y automatización | 15% | Pipeline funcional, artefactos, tags con criterio |
| Uso de IA con criterio | 10% | Prompts propios, salidas revisadas, riesgos identificados |
| Comunicación | 5% | Informe legible por negocio, defensa clara |

La dimensión con más peso combinado (50%) es **criterio + arquitectura**, no volumen de tests. Es coherente con el objetivo del programa: formar QAs que diseñan calidad, no que producen specs.

---

# 15. Learning Lab Repository Architecture

## 15.1 Principio rector

**El código de automatización existente y el material formativo no se mezclan.** `tests/`, `pages/`, `scripts/`, `prompts/`, `specs/`, `.github/` y la configuración raíz permanecen intactos y siguen siendo la "aplicación de referencia" que el alumno estudia. Todo lo formativo vive bajo `learning/`.

Corolario operativo: **ningún ejercicio modifica `tests/`**. Los alumnos trabajan sobre copias en `learning/student/` o sobre su propio fork. Esto protege los 10 `@demo-fail` (que deben seguir fallando: son el material del módulo 04) y mantiene el pipeline de CI verde para la demo.

## 15.2 Estructura propuesta

> **No se crea nada de esto en Fase 1.** Es la propuesta a implementar en Fase 2, módulo a módulo.

```
learning/
├── README.md                       # Punto de entrada: qué es, cómo se usa, itinerarios
├── phase-1-learning-lab-design.md  # ESTE documento (único fichero creado en Fase 1)
│
├── docs/                           # Material común, no específico de módulo
│   ├── prerequisites.md            # Sección 7 en formato accionable
│   ├── setup-guide.md              # Instalación paso a paso, con troubleshooting Windows/Mac/Linux
│   ├── glossary.md                 # Términos QA + Playwright, ES/EN
│   ├── repository-tour.md          # Recorrido guiado del repositorio real
│   ├── cheatsheets/
│   │   ├── playwright-locators.md
│   │   ├── playwright-assertions.md
│   │   ├── typescript-for-qa.md
│   │   └── cli-commands.md
│   └── known-issues.md             # Los 30 hallazgos de la sección 3.2, como catálogo consultable
│
├── assessment/
│   ├── pre-assessment.md           # Diseño (sección 8) + banco de preguntas
│   ├── rubric.md                   # Scoring y niveles de entrada
│   ├── post-assessment.md          # Versión equivalente para medir progreso
│   └── checkpoints/                # Revisiones intermedias de semanas 2 y 4
│
├── modules/                        # Un directorio por módulo, misma estructura interna
│   ├── 00-foundations/
│   │   ├── README.md               # Objetivo, competencias, prerrequisitos, resultado esperado
│   │   ├── theory.md               # El 20% teórico, para leer antes o durante la sesión
│   │   ├── walkthrough.md          # Recorrido guiado por el código real del repositorio
│   │   ├── exercises/              # Enunciados numerados, cada uno con su nivel (1-7)
│   │   └── resources.md            # Enlaces oficiales, no material duplicado
│   ├── 01-playwright-fundamentals/
│   ├── 02-page-object-model/
│   ├── 03-test-architecture/
│   ├── 04-debugging/
│   ├── 05-beyond-the-ui/
│   ├── 06-ci-cd-docker/
│   ├── 07-quality-engineering/
│   ├── 08-ai-augmented-qa/
│   └── 09-capstone/
│
├── student/                        # Zona de trabajo del alumno — NUNCA se toca tests/ ni pages/
│   ├── README.md                   # Reglas: dónde trabajar, cómo entregar
│   ├── sandbox/                    # Copia de trabajo sobre la que se refactoriza
│   └── submissions/                # Entregas (o, mejor, ramas/forks por alumno)
│
├── trainer/                        # Material exclusivo del formador
│   ├── facilitation-guide.md       # Guion de sesión, tiempos, puntos de parada
│   ├── session-plans/              # Un plan por sesión (12 en la opción B)
│   ├── common-pitfalls.md          # Dónde se atasca cada arquetipo de alumno
│   ├── demo-scripts.md             # Demostraciones en vivo, en orden y con comandos
│   ├── failure-injection.md        # Cómo inyectar fallos para el módulo 04 y el capstone
│   └── grading/                    # Rúbricas y criterios de corrección
│
└── solutions/                      # Soluciones de referencia — acceso controlado
    ├── README.md                   # Política: se publican tras cada sesión, no antes
    ├── 00-foundations/
    ├── ...
    └── 09-capstone/                # Solución de referencia del capstone (post-defensa)
```

## 15.3 Qué contiene cada carpeta

| Carpeta | Audiencia | Contenido | Cuándo se crea |
|---|---|---|---|
| `learning/docs/` | Todos | Referencia transversal: prerrequisitos, setup, glosario, cheatsheets, catálogo de hallazgos | Inicio de Fase 2 (antes del módulo 00) |
| `learning/assessment/` | Formador (diseño), alumno (ejecución) | Pre-assessment, rúbrica, checkpoints, post-assessment | **Primer entregable de Fase 2** — se necesita 5-10 días antes del curso |
| `learning/modules/NN-*/` | Alumno | Teoría (20%), recorrido guiado por el código real, ejercicios con nivel asignado | Módulo a módulo, en orden |
| `learning/student/` | Alumno | Zona de trabajo aislada; garantiza que `tests/` no se toca | Con el módulo 01 |
| `learning/trainer/` | Formador | Guion, tiempos, dónde se atascan, cómo inyectar fallos, rúbricas | En paralelo a cada módulo |
| `learning/solutions/` | Formador → alumno diferido | Soluciones de referencia, publicadas tras cada sesión | En paralelo a cada módulo |

## 15.4 Convenciones

1. **Un fichero markdown por unidad de contenido.** Nada de documentos de 2.000 líneas: si un `theory.md` supera las ~300 líneas, el módulo está mal dividido.
2. **Todo ejercicio referencia un archivo real** del repositorio (`tests/login.spec.ts:12`), nunca un ejemplo inventado. Es la regla que hace de este Learning Lab algo distinto de un tutorial genérico.
3. **Todo ejercicio declara su nivel** (1-7 de la sección 12) en su encabezado.
4. **Los ejercicios `[+]`** son las extensiones para nivel ADVANCED.
5. **`learning/` no se ejecuta en CI** por defecto: el workflow apunta a `testDir: './tests'`. Si en Fase 2 se quiere validar el código de `learning/`, se añade un proyecto o un workflow separado — **nunca modificando el existente**.
6. **Idioma:** material en castellano; términos técnicos, API, comandos y nombres de fichero en inglés. Coherente con el repositorio actual.
7. **`learning/solutions/` se publica de forma diferida**, no se oculta. Ocultarlo en un repositorio Git es una ilusión; lo honesto es acordar cuándo se consulta.

---

# 16. AI-Augmented QA Training Opportunities

## 16.1 Qué hay realmente implementado

Respuesta punto por punto a las preguntas del encargo:

**¿Qué modelos o APIs utiliza?**
Dos proveedores seleccionados en tiempo de ejecución (`scripts/report-ai.mjs:92-96`):
- **Local:** CLI de Claude, modelo `claude-haiku-4-5-20251001`, invocado por `spawn` con `-p <prompt>`, `--model` y `--dangerously-skip-permissions`; entrada por stdin, salida por stdout.
- **CI:** Google Gemini, modelo `gemini-flash-latest`, vía endpoint compatible con OpenAI (`https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`), `temperature: 0`, autenticación `Bearer` con `GEMINI_API_KEY`.

La presencia de `GEMINI_API_KEY` es lo único que decide el proveedor. En CI el secret existe → Gemini (free tier, coste cero).

**¿Qué scripts existen?**
Uno: `scripts/report-ai.mjs`, 225 líneas, Node ESM sin dependencias externas. Expuesto como `npm run report:ai` y `npm run test:ai`.

**¿Qué prompts existen?**
Cuatro, versionados en `prompts/`:

| Prompt | Entrada | Salida | Audiencia |
|---|---|---|---|
| `ai-group-failures.txt` | `test-results.json` completo | JSON de grupos con `risk_level`, `fingerprint`, `affected_tests` | Máquina (alimenta a los otros tres) |
| `ai-summary.txt` | `{ stats, grouped }` | Texto plano con estructura fija | **Negocio / dirección** — explícitamente "enviable por correo a dirección no técnica" |
| `ai-corrections.txt` | JSON agrupado | Markdown con hipótesis de causa y pasos | **QA / desarrollo** |
| `ai-tickets.txt` | JSON agrupado | Array JSON con esquema de 7 campos en español | **Gestión** (formato Jira) |

**¿Existen agentes?**
Sí, tres, en `.claude/agents/`: `playwright-test-planner` (explora la app y produce el plan), `playwright-test-generator` (ejecuta cada paso en navegador real y escribe el spec), `playwright-test-healer` (ejecuta, depura y repara). Los tres con `model: sonnet` y con la lista de herramientas acotada explícitamente en su frontmatter.

**¿Existe MCP?**
Sí. `.mcp.json` declara un servidor: `npx playwright run-test-mcp-server`, habilitado en `.claude/settings.local.json`. Expone al agente control de navegador (`browser_*`), ejecución y depuración de tests (`test_run`, `test_debug`, `test_list`) y los flujos de planner/generator.

**¿Qué problema intenta resolver?**
El de siempre: 237 ejecuciones producen un informe HTML que nadie fuera de QA abre, y un JSON que nadie lee. El pipeline convierte ese ruido en cuatro artefactos con audiencia definida: un resumen para dirección, un diagnóstico para QA, tickets para gestión y una agrupación por causa raíz para no tratar 10 fallos como 10 problemas cuando son 3.

**¿Qué datos utiliza?**
Exclusivamente `test-results.json` (reporter JSON de Playwright): títulos de test, estado, mensajes de error, ubicación (fichero/línea), duración y estadísticas globales. **No** se envían capturas, ni el DOM, ni el trace, ni el código fuente.

**¿Qué outputs genera?**
Cuatro ficheros en `playwright-report/`: `ai-summary.txt`, `ai-corrections.md`, `ai-tickets.json`, `ai-failures-grouped.json`. En CI, además, `ai-summary.txt` se vuelca en el step summary del workflow.

**¿Qué grado de automatización existe?**
Alto en la ejecución, nulo en la validación. El pipeline se dispara solo en cada job de CI (`if: always()`), produce los cuatro artefactos y los publica sin intervención humana. Pero **ninguna salida se valida más allá de `JSON.parse`**, y ningún humano firma el resultado antes de que sea visible. Ese hueco es material didáctico de primer orden (D3).

## 16.2 Conceptos enseñables directamente sobre esta implementación

| Concepto de AI-Augmented QA | Se enseña con | Nivel |
|---|---|---|
| Prompt con contrato de salida estricto | `ai-group-failures.txt` (estructura JSON exacta, "Devuelve SOLO ese JSON, NO uses ```") | FOLLOW → MODIFY |
| Prompt adaptado a la audiencia | `ai-summary.txt` (texto plano, sin markdown, mapa de emojis cerrado) vs `ai-corrections.txt` (markdown técnico) | DESIGN |
| Guardarraíles anti-alucinación | "No inventes datos" / "NO inventes tests ni campos" en los 4 prompts | FOLLOW |
| Alucinación real y su mitigación en código | `report-ai.mjs:45-51` — el modelo inventaba `generated_at`, el código lo sobrescribe con la hora real de Madrid | TROUBLESHOOT |
| Prompt chaining | `report-ai.mjs:32` (agrupar) → `:65-69` (resumen, correcciones, tickets sobre el resultado agrupado) | DESIGN |
| Paralelización de llamadas | `report-ai.mjs:65` (`Promise.all` sobre 3 llamadas) | MODIFY |
| Salida estructurada y su fragilidad | `stripMarkdownFences()` (`:181-186`) — el modelo devuelve fences aunque se le prohíba | TROUBLESHOOT |
| Validación insuficiente | `report-ai.mjs:36-43, 72-78` — solo `JSON.parse`, sin esquema (**D3**) | OPTIMIZE |
| Resiliencia frente a cuota y errores transitorios | `report-ai.mjs:98-135` — backoff exponencial con jitter en 429/500/502/503/504 | MODIFY |
| Coste y selección de modelo | Haiku local vs Gemini Flash free tier; `max-parallel: 1` en el workflow para no reventar la cuota | DESIGN |
| Portabilidad de prompts entre modelos | Los mismos 4 prompts sirven a Claude y a Gemini; `temperature: 0` en ambos | DESIGN |
| Determinismo y su límite | `temperature: 0` reduce variación pero no la elimina | FOLLOW |
| Agrupación por causa raíz | `ai-group-failures.txt` (fingerprint: primera línea del error + ubicación + stack) | TROUBLESHOOT |
| Traducción técnico → negocio | `ai-summary.txt` → ejemplo real en README:236-257 | DESIGN |
| Generación de tickets con severidad derivada | `ai-tickets.txt` (severidad según `count` y si toca login/checkout) | DESIGN |
| MCP: qué es y qué expone | `.mcp.json` + las herramientas listadas en los tres agentes | FOLLOW |
| Subagentes con herramientas acotadas | Los tres `.claude/agents/*.md`: el planner **no** puede editar ficheros; el healer **sí** | DESIGN |
| Generación de tests asistida | `playwright-test-generator.md` + `specs/add-to-cart-test-plan.md` como evidencia del flujo | CREATE |
| Auto-reparación y su peligro | `playwright-test-healer.md`, especialmente su instrucción de marcar `test.fixme()` si no logra arreglarlo | TROUBLESHOOT + debate |
| IA en el pipeline de CI | `playwright.yml:52-69` | MODIFY |
| Tolerancia deliberada a fallo de IA | `continue-on-error: true` (`playwright.yml:54`) — la IA no debe tumbar el build | DESIGN |
| Permisos de agente | `--dangerously-skip-permissions` (`report-ai.mjs:154`) (**D1**) | DESIGN |
| Inyección de prompt y fuga de datos | El JSON completo llega al modelo (**D2**) — crítico antes de aplicarlo a una app de HDI | DESIGN |
| Escalado y límites de contexto | Sin límite de tamaño de entrada (**D5**) | OPTIMIZE |

## 16.3 Encuadre pedagógico: QA + IA, nunca IA en lugar de QA

Este principio se materializa en tres reglas de aula, no en una declaración de intenciones:

1. **La IA propone, el QA dispone.** Toda salida generada por IA en los ejercicios pasa por revisión humana explícita y documentada. En el módulo 08, el alumno debe encontrar **al menos un error o una imprecisión** en una salida de IA — y el material se diseñará para que haya alguno que encontrar.

2. **El peligro del healer es el contenido de la clase, no una nota al pie.** Un agente que "repara" un test hasta que pasa puede estar eliminando exactamente la detección que hacía valioso ese test. Los 10 `@demo-fail` son el laboratorio perfecto: lanzar el healer contra ellos y analizar qué "arregla" y qué destruye es, probablemente, el ejercicio más formativo del programa entero.

3. **Lo que la IA no puede hacer se nombra explícitamente.** No sabe qué es crítico para el negocio de HDI. No conoce el riesgo regulatorio de una póliza mal emitida. No decide qué no automatizar. No asume la responsabilidad de un release. El QA aporta el criterio; la IA aporta velocidad de análisis y capacidad de síntesis.

**Fórmula operativa del módulo 08:** el pipeline actual convierte 10 fallos dispersos en 3 grupos, un resumen legible por dirección y 3 tickets, en menos de un minuto y a coste cero. Eso es tiempo de QA liberado para lo que la IA no puede hacer: decidir si eso bloquea el release.

---

# 17. Risks and Recommendations

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|---|
| R1 | **Restricciones de red corporativa en HDI**: proxy o firewall bloquean `saucedemo.com`, npm, GitHub o el proveedor de IA | Alta | **Bloqueante** | **Verificar en la primera semana de Fase 2**, antes de escribir material. Plan B: registro npm interno, app local (opción C2 de la sección 14), reporte IA solo desde CI |
| R2 | **Dependencia de un sitio de terceros**: SauceDemo puede cambiar, caerse o limitar tráfico. 12 alumnos × 237 ejecuciones es tráfico no trivial contra un sitio público gratuito | Media | Alto | Escalonar ejecuciones; usar `--project=chromium` durante las prácticas y los tres navegadores solo en las demos; tener la app local (C2) como respaldo |
| R3 | **Dispersión de nivel en el grupo**: BEGINNER y ADVANCED en la misma sala | Alta | Alto | Pre-assessment + itinerarios diferenciados + parejas mixtas + ejercicios `[+]` (secciones 8 y 12) |
| R4 | **El módulo 03 desborda a los perfiles no técnicos**: cuatro gaps CRITICAL juntos | Media-Alta | Alto | Semana completa dedicada (opción B); refactor guiado paso a paso, no en blanco; el ADVANCED de cada pareja actúa de mentor |
| R5 | **`npm run report:ai` no funciona en los equipos de los alumnos** por la ruta absoluta de `package.json:14` (**B1**) | **Certeza** | Medio | Convertirlo en el primer ejercicio del módulo 08. Si no da tiempo, usar solo el reporte IA de CI |
| R6 | **Cuota gratuita de Gemini agotada** con 12 forks ejecutando CI | Media | Medio | Cada alumno con su propia key gratuita; `max-parallel: 1` ya está en el workflow; el paso lleva `continue-on-error` |
| R7 | **La suite deja de fallar como se espera**: si SauceDemo cambia, algún `@demo-fail` podría empezar a pasar o algún test verde a fallar | Baja-Media | Alto (el módulo 04 depende de ello) | Ejecutar la suite completa al inicio de cada semana y verificar que los 10 fallos siguen siendo los 10 esperados. Si cambia, el propio incidente es material del módulo 04 |
| R8 | **Un alumno "arregla" los tests de `tests/`** y rompe la demo o el material del módulo 04 | Media | Medio | Regla explícita: nadie toca `tests/`. Trabajo en `learning/student/` o en fork propio. Documentado en `learning/student/README.md` |
| R9 | **La IA se percibe como amenaza al puesto** | Media | Alto (afecta a la adopción) | Encuadre explícito desde la sesión 1: QA + IA. El ejercicio del healer destruyendo un test valioso es la mejor demostración de por qué el criterio humano no es opcional |
| R10 | **Datos sensibles de HDI enviados a un LLM externo** si el pipeline se aplica a aplicaciones internas (**D2**) | Media | **Muy alto** | Sesión dedicada en el módulo 08; involucrar a Seguridad de HDI antes de cualquier aplicación interna; documentar qué datos salen (títulos de test y mensajes de error — que pueden contener datos reales) |
| R11 | **Tiempo real de los participantes no protegido**: se apuntan pero siguen con su carga habitual | Alta | Alto | Compromiso explícito de HDI antes de empezar: 6 h lectivas + 2-3 h de homework a la semana, bloqueadas en calendario |
| R12 | **Falta de aplicación objetivo para el capstone** decidida a tiempo | Media | Alto | Decidir C1/C2/C3 en la **primera semana de Fase 2**; si es C2, hay que presupuestar su construcción |
| R13 | **Deriva del material respecto al repositorio**: el repositorio evoluciona y el material formativo se queda obsoleto — exactamente lo que ya pasó con `specs/` y el README (**E1-E4**) | Media | Medio | Todas las referencias del material apuntan a `fichero:línea`; revisión del material al cerrar cada módulo; convertir la propia deriva en ejercicio del módulo 07 |
| R14 | **El pipeline de CI en runs automáticos no muestra el valor de la IA** porque la suite por defecto es `green` (**C1**) | Certeza | Bajo | Para las demos, lanzar siempre con `workflow_dispatch` + `suite: fail` o `all`. Documentarlo en `learning/trainer/demo-scripts.md` |
| R15 | **Un solo formador para 10 módulos** que cubren desde JS básico hasta MCP | Media | Medio | Guion detallado por sesión en `learning/trainer/`; material autoportante; considerar un segundo formador para los módulos 06 y 08 |

## Recomendaciones transversales

1. **Verificar el entorno antes de escribir material.** R1 es el único riesgo capaz de invalidar el diseño entero. Una sesión de 2 horas con un equipo real de HDI, ejecutando `npm ci && npx playwright test --project=chromium`, resuelve la incógnita.
2. **No corregir los hallazgos de la sección 3.2.** Son 30 activos didácticos. Si alguien "limpia" el repositorio antes del curso, se destruye buena parte del material de los módulos 02, 04, 06, 07 y 08.
3. **Congelar el repositorio durante el curso.** Una rama `learning-lab-frozen` desde el commit de inicio garantiza que las referencias `fichero:línea` del material sigan siendo válidas seis semanas después.
4. **Involucrar a Seguridad de HDI antes del módulo 08**, no después. R10 es el riesgo de mayor impacto del programa.
5. **Medir.** Pre-assessment y post-assessment con instrumento equivalente. Es el único dato objetivo de retorno que HDI podrá poner sobre la mesa.

---

# 18. Next Steps

## Estado al cierre de la Fase 1

| Entregable de Fase 1 | Estado |
|---|---|
| Inventario completo del repositorio | ✅ Completado (sección 2) |
| Mapa técnico por área | ✅ Completado (sección 3.1) |
| Catálogo de hallazgos de calidad | ✅ 30 hallazgos documentados, ninguno corregido (sección 3.2) |
| Matriz de competencias A-O | ✅ Completado (sección 4) |
| Gap analysis priorizado | ✅ 6 CRITICAL, 7 HIGH, 9 MEDIUM, 4 LOW (sección 5) |
| Perfil de audiencia | ✅ Completado (sección 6) |
| Prerequisitos justificados | ✅ Completado (sección 7) |
| Diseño de pre-assessment | ✅ Conceptual, sin preguntas (sección 8) |
| Learning path | ✅ 10 módulos con dependencias (secciones 9-10) |
| Mapeo repositorio ↔ aprendizaje | ✅ Completado, con "NO EXISTE" señalado (sección 11) |
| Progresión pedagógica | ✅ Niveles 1-7 asignados (sección 12) |
| Opciones de duración | ✅ 3 opciones + recomendación (sección 13) |
| Propuesta de capstone | ✅ Conceptual (sección 14) |
| Arquitectura del Learning Lab | ✅ Propuesta, no creada (sección 15) |
| Análisis de IA | ✅ Completado (sección 16) |
| Riesgos | ✅ 15 riesgos con mitigación (sección 17) |
| **Modificaciones al código existente** | ✅ **Ninguna** |

## Decisiones que HDI debe tomar antes de la Fase 2

| # | Decisión | Opciones | Bloquea a |
|---|---|---|---|
| D-1 | Duración del programa | A (4 sem) / **B (6 sem, recomendada)** / C (8 sem) | Toda la planificación |
| D-2 | Aplicación objetivo del capstone | C1 (demo pública) / **C2 (app local, recomendada)** / C3 (app interna HDI) | Módulos 05 y 09 |
| D-3 | Tamaño y composición del grupo | 8-12 recomendado | Pre-assessment, parejas |
| D-4 | Modalidad | Presencial / remoto / híbrido | Guion del formador |
| D-5 | Fechas y protección de calendario | — | Todo (riesgo R11) |
| D-6 | Viabilidad de red corporativa | Verificación técnica | **Todo** (riesgo R1) |
| D-7 | Aprobación de Seguridad para el uso de IA | — | Módulo 08 y capstone (riesgo R10) |

---

# RECOMMENDED NEXT STEP

## Qué hacer exactamente en la FASE 2

La Fase 2 desarrolla el Learning Lab **módulo a módulo**. No debe empezar por el módulo 00.

### Paso 0 — Verificación de viabilidad (antes de escribir una línea de material)

**Duración estimada: 1 sesión de 2 horas con un equipo real de HDI.**

1. Ejecutar `npm ci` desde un equipo corporativo de HDI → confirma acceso a npm.
2. Ejecutar `npx playwright install` → confirma descarga de navegadores (~500 MB).
3. Ejecutar `npx playwright test --project=chromium` → confirma acceso a `saucedemo.com` y que la suite se comporta como se espera.
4. Verificar acceso a `github.com` y capacidad de hacer fork.
5. Verificar acceso al proveedor de IA (o decidir que el reporte IA solo se ejecuta en CI).

**Si el paso 0 falla, el diseño de los módulos 01-09 cambia sustancialmente.** Por eso va primero. Su resultado alimenta también la decisión D-2 (aplicación del capstone).

### Paso 1 — Primer entregable de contenido: el pre-assessment

**Por qué primero:** debe pasarse 5-10 días antes del inicio, y su resultado determina si el módulo 00 es ampliado, completo o reducido. Es la única pieza cuyo calendario es rígido.

Entregables:
- `learning/assessment/pre-assessment.md` — 25-30 preguntas siguiendo los pesos de la sección 8.2 (30% JS/TS), todas ancladas en código real del repositorio.
- `learning/assessment/rubric.md` — scoring, subíndice JS/TS, los cuatro niveles de entrada.
- `learning/README.md` y `learning/docs/prerequisites.md` — para que los participantes sepan a qué se apuntan.
- `learning/docs/setup-guide.md` — instalación paso a paso con troubleshooting específico de Windows (el repositorio ya tiene un caso: `cross-env` y la ruta de Git Bash en `package.json:14`).

### Paso 2 — Módulos 00 → 09, en orden estricto

Para cada módulo, y **en este orden dentro del módulo**:

1. `README.md` — objetivo, competencias, prerrequisitos, resultado esperado (ya redactado en la sección 10 de este documento; se expande).
2. `theory.md` — el 20% teórico. Máximo ~300 líneas.
3. `walkthrough.md` — recorrido guiado por el código real, siguiendo la tabla de la sección 11. **Cada afirmación con su `fichero:línea`.**
4. `exercises/` — enunciados numerados, cada uno con su nivel (1-7) declarado y sus variantes `[+]`.
5. `solutions/NN-*/` — solución de referencia de cada ejercicio.
6. `trainer/session-plans/` — guion de sesión con tiempos, puntos de parada y demos.

**Criterio de "módulo terminado":** un formador que no haya participado en el diseño puede impartirlo solo con el material.

**Orden de prioridad si el tiempo aprieta:** 00 → 01 → 02 → **03** → 04 → 06 → 08 → 07 → 05 → 09. Los módulos 03, 04 y 08 son los que más valor diferencial aportan; el 05 es el más caro de producir (no hay material previo) y el que se sacrifica primero.

### Paso 3 — Validación con un piloto

Antes del despliegue completo, impartir los módulos 00-02 a un grupo reducido (2-3 personas de perfiles distintos). Ajustar tiempos y dificultad con datos reales, no con estimaciones.

### Reglas que la Fase 2 hereda de la Fase 1

1. **No se modifica `tests/`, `pages/`, `scripts/`, `prompts/`, `specs/`, `.github/` ni la configuración raíz.** Todo lo nuevo vive en `learning/`.
2. **Los 30 hallazgos de la sección 3.2 no se corrigen.** Son el material didáctico.
3. **Los 10 `@demo-fail` siguen fallando.** Son el módulo 04 entero.
4. **Toda referencia al código lleva `fichero:línea`.** Es lo que impide la deriva documental que ya sufren `specs/` y el README.
5. **Nada de contenido inventado sobre HDI.** Journeys genéricos de seguros hasta que HDI aporte los suyos.

### Propuesta inmediata

Si se aprueba este diseño, la siguiente acción concreta es:

> **Ejecutar el Paso 0 (verificación de viabilidad) y, en paralelo, desarrollar el pre-assessment completo (Paso 1) junto con `learning/README.md`, `learning/docs/prerequisites.md` y `learning/docs/setup-guide.md`.**

Con eso, HDI puede lanzar el pre-assessment y tener el mapa de niveles del grupo antes de que exista una sola línea del módulo 00 — que es exactamente el orden correcto, porque el resultado del pre-assessment determina cómo se escribe ese módulo.

---

*Documento de Fase 1. Análisis y diseño exclusivamente. Ningún fichero del proyecto ha sido modificado.*
