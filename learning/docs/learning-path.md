# Learning Path — Mapa de navegación

Roadmap completo de los 10 módulos, según el diseño aprobado en la [Fase 1](../phase-1-learning-lab-design.md), secciones 9 a 12.

Este documento es un **mapa**, no el contenido. Cada módulo se desarrolla por completo en su propio directorio bajo [`../modules/`](../modules/).

---

## Visión general

| # | Módulo | Nivel dominante | Duración | Depende de | Estado |
|---|---|---|---|---|---|
| 00 | [Fundamentos JS/TS para QA](../modules/00-foundations/) | 1 FOLLOW | 5 h + 3 h | — | ✅ Completo |
| 01 | [Playwright Fundamentals](../modules/01-playwright-fundamentals/) | 2 MODIFY → 4 DESIGN | 8 h + 3 h + 1 h | 00 | ✅ Completo — pendiente de piloto |
| 02 | Page Object Model & Suite | 3 CREATE | 3 h + 2 h | 01 | ⬜ Pendiente |
| 03 | Arquitectura: fixtures, auth y datos | 4 DESIGN | 6 h + 3 h | 02 | ⬜ Pendiente |
| 04 | Debugging & Failure Analysis | 5 TROUBLESHOOT | 3 h + 2 h | 03 | ⬜ Pendiente |
| 05 | Más allá de la UI (API & Mocking) | 3 CREATE | 3 h + 2 h | 03 | ⬜ Pendiente |
| 06 | CI/CD & Docker | 6 OPTIMIZE | 3 h + 2 h | 04 | ⬜ Pendiente |
| 07 | Quality Engineering & Test Strategy | 4 DESIGN | 3 h + 2 h | 06 | ⬜ Pendiente |
| 08 | AI-Augmented QA | 6 OPTIMIZE | 3 h + 2 h | 04, 06 | ⬜ Pendiente |
| 09 | Capstone final | 7 ARCHITECT | 6 h + 10 h | todos | ⬜ Pendiente |

**Total:** 38 h lectivas + ~30 h de trabajo personal, repartidas en 6 semanas (opción B recomendada en la Fase 1, sección 13).

> Las duraciones de los módulos 02-09 son las estimaciones de la Fase 1, **previas a la construcción del material**. La del módulo 00 está medida sobre el material real (subió de 3 h a 5 h dirigidas). La del módulo 01 tiene diseño y validación técnica completos —ver los dos documentos enlazados arriba— pero **el material aún no se ha construido**; su cifra de 12 h sale de ese diseño, no de un piloto. Es razonable esperar un ajuste al construir cada módulo, sobre todo el 03.

## Grafo de dependencias

```
00 ──► 01 ──► 02 ──► 03 ──┬──► 04 ──┬──► 06 ──► 07 ──┐
                          │         │                │
                          └──► 05 ──┘                ├──► 09
                                    │                │
                                    └──► 08 ─────────┘
```

- **00 → 01 → 02 → 03** es la cadena obligatoria y estrictamente secuencial.
- **04 y 05** dependen de 03 pero son independientes entre sí: se pueden intercambiar.
- **08** requiere 04 (análisis de fallos) y 06 (el pipeline donde vive el reporte IA).

---

## 00 — Fundamentos de JavaScript y TypeScript para QA ✅

| | |
|---|---|
| **Objetivo** | Que cualquier participante pueda leer, modificar y crear el código de `pages/` y `tests/` |
| **Competencias** | C (Programming), D (JavaScript/TypeScript) |
| **Contenidos** | `const`/`let`; funciones y funciones flecha; objetos y desestructuración; arrays (`map`, `filter`, `sort`); las dos trampas de `sort()`; clases, `this`, `readonly` (y qué **no** protege), parámetro de propiedad; módulos `import`/`export`; promesas y `async`/`await`; tipos, `strict: true`, narrowing de `T \| null`, tipos de unión literal |
| **Duración** | **5 h dirigidas (2 sesiones) + 3 h personales + 45 min de assessment ≈ 8,75 h.** Desglose en el [README del módulo](../modules/00-foundations/#duración) |
| **Nivel** | 1 FOLLOW → 5 TROUBLESHOOT |
| **Dependencias** | Ninguna |
| **Repository mapping** | `pages/login.page.ts` (clase completa), `pages/inventory.page.ts` (métodos que devuelven datos), `pages/menu.page.ts` (`this` y reutilización), `tests/login.spec.ts` (desestructuración, `let`, `new`), `tests/inventory.spec.ts:32,42,49` (`map`, spread, comparadores), `tsconfig.json:5,9`, `scripts/report-ai.mjs:54-69` (`async`/`Promise.all` sin navegador) |
| **Entregables** | Labs 1-4 en verde (23 tests), Challenge 1 (6+ tests propios), hoja de observación, informe de diagnóstico, assessment ≥ 70 y **apto** en la defensa técnica (O8) |

→ **[Ir al módulo](../modules/00-foundations/)**

---

## 01 — Playwright Fundamentals ✅

> **Estado real:** material **construido y verificado** contra la aplicación real: teoría, 5 Labs (+1 opcional), Challenge, assessment y soluciones. Pendiente de piloto con alumnos. Documentos de origen: [`module-01-discovery-design.md`](module-01-discovery-design.md) (diseño) y [`module-01-technical-validation.md`](module-01-technical-validation.md) (20 elementos × 7 estrategias de locator, medidos).
>
> ⚠️ **K1: `PENDIENTE — validación durante formación con el cliente`.** El entorno corporativo no está verificado; por decisión de programa se comprueba en la propia sesión 3, no antes. Ver el [plan de sesión](../trainer/session-plans/session-03-module-01.md).

| | |
|---|---|
| **Objetivo** | Ejecutar la suite real, elegir y justificar el locator más apropiado para cada elemento, y escribir tests nuevos que cubran un hueco real de cobertura |
| **Competencias** | B (Web Testing), E (Playwright) |
| **Contenidos** | Estructura de un spec; `test`, `describe`, `beforeEach`; **selección de locator por robustez, semántica, accesibilidad y mantenibilidad** (no "las cinco estrategias"); auto-waiting y web-first assertions; por qué nunca `waitForTimeout`; mensajes de aserción; `baseURL`, `testIdAttribute` y rutas relativas; ejecución filtrada (`--grep`, `--project`); informe HTML |
| **Duración** | 8 h sesión (4 sesiones) + 3 h personal + 1 h assessment = **12 h** (caso de referencia FOUNDATION); ver la tabla por nivel de entrada en el documento de diseño, sección 11 |
| **Nivel** | 2 MODIFY → 4 DESIGN |
| **Dependencias** | 00 |
| **Repository mapping** | `tests/login.spec.ts` + `pages/login.page.ts` (par de lectura); `playwright.config.ts` completo; los 12 scripts de `package.json`; 🔬 **20 elementos verificados con 7 estrategias de locator** (login, inventario, carrito, checkout, confirmación); `tests/checkout.spec.ts:34` (el único `getByRole`, y el único heading real del flujo); `tests/product-detail-add-to-cart.spec.ts:117-121` (`filter` + `hasText`); 🔬 `CartPage.cartItems` (`pages/cart.page.ts:7`) — locator roto, 0 elementos, base del Lab 5 |
| **Entregables** | Suite ejecutada en los tres navegadores (🔬 medido: 79 tests, 21,8 s, 69 verdes/10 rojos en Chromium); tabla de decisión de locators propia, no un recuento de estrategias usadas; 2 tests nuevos cubriendo la ordenación A→Z (hueco real, sin test); Challenge con importes verificados por valor (🔬 8 % de impuesto confirmado) |

→ **[Ir al módulo](../modules/01-playwright-fundamentals/)**

---

## 02 — Page Object Model & Estructura de Suite ⬜

| | |
|---|---|
| **Objetivo** | Entender, extender y **criticar** la arquitectura POM del repositorio |
| **Competencias** | F (Test Architecture), G (Test Design) |
| **Contenidos** | Qué es y qué no es un Page Object; por qué los POM no contienen aserciones; encapsulación y fugas del patrón; cuándo un método pertenece al POM; nombrado y organización; detección de cobertura duplicada |
| **Duración** | 3 h + 2 h |
| **Nivel** | 3 CREATE |
| **Dependencias** | 01 |
| **Repository mapping** | Los 6 POM de `pages/`; hallazgo **A1 — ⚠️ premisa corregida** (ver la nota de abajo): `CartPage.cartItems` ([`pages/cart.page.ts:7`](../../pages/cart.page.ts)) apunta a `[data-test="cart-item"]`, atributo que **no existe** en la aplicación, y **ningún test lo usa** (0 usos desde `tests/`); los **12 usos de `.cart_item` en 5 specs** son el rodeo. Hallazgo **A10** (solape entre `add-tshirt-to-cart.spec.ts` e `inventory-add-to-cart.spec.ts`); `pages/menu.page.ts` como excepción justificada (selectores por `id` porque SauceDemo no expone `data-test` en el menú) |
| **Entregables** | Un Page Object nuevo creado desde cero; el locator roto de `CartPage.cartItems` diagnosticado y reparado **en una copia de trabajo** (nunca en el repositorio); propuesta escrita sobre la cobertura duplicada |

> ### ⚠️ Nota de partida para el discovery de M02 — inventario medido (18/08/2026)
>
> La descripción histórica de A1 como *"fuga del Page Object"* está **invertida** y no debe usarse como premisa de diseño. Datos medidos sobre la rama actual:
>
> | Dato | Valor | Comando |
> |---|---|---|
> | `CartPage.cartItems` usado desde `tests/` | **0 usos** | `grep -ro "\.cartItems" tests/ \| wc -l` |
> | `.cart_item` en specs | **12 usos en 5 ficheros** (`cart-sync` 7, `cart-edge-cases` 2, `add-tshirt-to-cart` 1, `performance-glitch-user-cart` 1, `problem-user-cart` 1) | `grep -rc "cart_item" tests/*.spec.ts` |
> | DOM real de la línea de carrito | `<div class="cart_item" data-test="inventory-item">` | [`module-01-technical-validation.md`](module-01-technical-validation.md), hallazgo H1 |
> | `MenuPage.open()` llamado desde `tests/` | **0 llamadas directas**, pero **uso interno válido** en `logout()` y `resetAppState()` ([`pages/menu.page.ts:11,16`](../../pages/menu.page.ts)) — **no es un defecto** | `grep -ro "\.open()" tests/` |
>
> **Consecuencia para M02:** el ejercicio previsto de *"sustituir `.cart_item` por `CartPage.cartItems`"* **rompería los 5 specs**, porque el locator del POM resuelve 0 elementos. El ejercicio válido es el contrario: diagnosticar por qué un locator de POM roto sobrevive sin que nadie lo note. Detalle en [`module-01-discovery-design.md`](module-01-discovery-design.md) §15.4 y en el [Lab 5 de M01](../modules/01-playwright-fundamentals/labs/lab-5-troubleshoot.md), caso B.

---

## 03 — Test Architecture: Fixtures, Auth y Datos ⬜

| | |
|---|---|
| **Objetivo** | Llevar la suite de "POM correcto" a "arquitectura profesional" |
| **Competencias** | F (Test Architecture), D (TypeScript avanzado), I (Quality Engineering) |
| **Contenidos** | Fixtures (`test.extend`) y por qué sustituyen al `beforeEach` repetido; fixtures que devuelven Page Objects; `storageState` y proyecto de `setup`; separación de datos y código; tipado de datos de prueba; parametrización con `for...of`; configuración por entorno; Component Objects |
| **Duración** | 6 h + 3 h — **la semana más densa del programa** |
| **Nivel** | 4 DESIGN |
| **Dependencias** | 02 |
| **Repository mapping** | El `beforeEach` idéntico de 12 specs (**A5**: ~237 logins por ejecución completa); `tests/inventory-add-to-cart.spec.ts:15-58` (**A4**: 5 tests clonados); ids mágicos de `tests/product-detail-add-to-cart.spec.ts` + tabla de ids en `specs/add-to-cart-test-plan.md:663-672` (**A6**); `tests/performance-glitch-user-cart.spec.ts` (**A7**: `{ timeout: 15000 }` repetido 5 veces) |
| **Entregables** | Suite refactorizada con fixture de autenticación por `storageState`, datos externalizados y tipados, y una suite parametrizada. **Con medición del tiempo de ejecución antes y después** |

> Concentra 4 de los 6 gaps CRITICAL identificados en la Fase 1. No comprimir.

---

## 04 — Debugging & Failure Analysis ⬜

| | |
|---|---|
| **Objetivo** | Diagnosticar cualquier fallo con método, sin adivinar |
| **Competencias** | H (Debugging), I (Quality Engineering) |
| **Contenidos** | Anatomía de un fallo de Playwright; trace viewer; vídeo; UI mode y `--debug`; `page.pause()` e Inspector; `test.step`; `codegen`; método reproducir → aislar → hipótesis → verificar; flaky vs. determinista |
| **Duración** | 3 h + 2 h |
| **Nivel** | 5 TROUBLESHOOT |
| **Dependencias** | 03 |
| **Repository mapping** | **Los 10 tests `@demo-fail`**, de cinco tipos distintos: URL esperada errónea (`login`, `menu`, `route-protection`), conteo de elementos (`inventory`, `cart-sync`), valor de badge (`cart-badge`, `inventory-add-to-cart`, `product-detail-add-to-cart`), texto de validación (`checkout`), visibilidad (`product-detail`). Más `problem_user` (bug de UI real) y `performance_glitch_user` (latencia real). `trace` y `video` ya configurados en `playwright.config.ts:14-15`. Hallazgos **A2** y **A3** como estudio de "tests que no pueden fallar" |
| **Entregables** | 5 de los 10 `@demo-fail` diagnosticados sin ver el comentario que revela la corrección, con informe de causa raíz |

> Es el módulo con mejor material disponible del programa: cada fallo intencionado lleva documentada su corrección, que el formador puede ocultar para usarlo como caso ciego.

---

## 05 — Testing más allá de la UI (API & Mocking) ⬜

| | |
|---|---|
| **Objetivo** | Salir de la punta de la pirámide |
| **Competencias** | B (Web Testing), E (Playwright), N (Test Strategy) |
| **Contenidos** | HTTP y códigos de estado; `request` fixture y `APIRequestContext`; aserciones sobre respuestas; `page.route` para interceptar, modificar y bloquear; simular 500, lentitud y respuesta vacía; cuándo un test debe ser de API en vez de E2E |
| **Duración** | 3 h + 2 h |
| **Nivel** | 3 CREATE |
| **Dependencias** | 03 |
| **Repository mapping** | ⚠️ **NO EXISTE material previo** — es el módulo con más contenido por crear. Anclajes disponibles: `tests/performance-glitch-user-cart.spec.ts` (latencia real, reproducible con `page.route` + delay) y `tests/route-protection.spec.ts` (candidato natural a verificación por API). SauceDemo no expone API pública documentada: **decisión pendiente** sobre qué API usar |
| **Entregables** | Un test de API y un test E2E con backend mockeado; argumentación escrita de qué test existente convertiría a API y por qué |

---

## 06 — CI/CD & Docker ⬜

| | |
|---|---|
| **Objetivo** | Entender y modificar el pipeline real que ya ejecuta esta suite |
| **Competencias** | J (Git/GitHub), K (CI/CD), L (Docker) |
| **Contenidos** | Flujo Git para tests (rama, PR, revisión); anatomía de un workflow; triggers y `workflow_dispatch` con inputs; matrices; contenedores en Actions; artefactos; step summary; secrets; `if: always()` vs `continue-on-error`; imagen vs contenedor; sharding y concurrencia; quality gates |
| **Duración** | 3 h + 2 h |
| **Nivel** | 6 OPTIMIZE |
| **Dependencias** | 04 |
| **Repository mapping** | `.github/workflows/playwright.yml` **completo**, con sus decisiones reales comentadas: `HOME: /root` por el UID de Firefox (línea 18), `max-parallel: 1` por la cuota de Gemini (línea 29), `continue-on-error` en el paso de IA (línea 54). README:120-193. Hallazgos **B2** (tres versiones de Playwright), **C1** (suite `green` por defecto), **C4** (sin sharding), **C5** (sin concurrencia), **B3** (typecheck ausente) |
| **Entregables** | PR contra su fork que añade un paso al workflow (typecheck o sharding), ejecutándose en verde |

---

## 07 — Quality Engineering & Test Strategy ⬜

| | |
|---|---|
| **Objetivo** | Pasar de "escribir tests" a "decidir qué se prueba, cómo y con qué criterio" |
| **Competencias** | I (Quality Engineering), N (Test Strategy), O (Business/Risk) |
| **Contenidos** | Pirámide de testing; qué automatizar y qué no; testing basado en riesgo; criterios de entrada y salida; smoke vs regresión y selección por tags; flakiness (causas, coste, política); métricas útiles e inútiles; comunicación a negocio |
| **Duración** | 3 h + 2 h |
| **Nivel** | 4 DESIGN |
| **Dependencias** | 06 |
| **Repository mapping** | `specs/test-index.md` y su tabla de cobertura; el tag `@demo-fail` como base de un esquema `@smoke`/`@regression`/`@critical`; `max-parallel: 1` como decisión coste/velocidad documentada; los 237 runs como problema de escalado; hallazgos **E1-E4** (deriva documental) como auditoría doc↔código; `prompts/ai-summary.txt` como comunicación no técnica |
| **Entregables** | Estrategia de test de 2 páginas para un producto asegurador genérico; esquema de tags con criterio de ejecución |

---

## 08 — AI-Augmented QA ⬜

| | |
|---|---|
| **Objetivo** | Usar la IA como multiplicador del QA, con criterio y guardarraíles. Nunca como sustituto |
| **Competencias** | M (AI for QA), H (Debugging), O (Business) |
| **Contenidos** | Qué es un LLM y qué no puede garantizar; prompt con contrato de salida; salida estructurada y su validación; prompt chaining; alucinación y mitigación; MCP; subagentes con herramientas acotadas; generación de tests asistida y su revisión; auto-reparación y su peligro; coste y elección de modelo; **inyección de prompt y confidencialidad de datos** |
| **Duración** | 3 h + 2 h |
| **Nivel** | 6 OPTIMIZE |
| **Dependencias** | 04, 06 |
| **Repository mapping** | `scripts/report-ai.mjs` completo (225 líneas); los 4 `prompts/*.txt`; `.mcp.json`; los 3 subagentes de `.claude/agents/`; los pasos de IA del workflow (52-69); `specs/add-to-cart-test-plan.md` como evidencia del flujo planner→generator. Hallazgos **D4** (el modelo inventaba `generated_at` y el código lo corrige), **D3** (validación solo con `JSON.parse`), **D1**/**D2** (permisos y superficie de inyección), **B1** (la ruta absoluta que rompe `report:ai` fuera de una máquina) |
| **Entregables** | Un prompt modificado con su efecto documentado; pipeline IA ejecutado sobre una ejecución con fallos; un test generado por agente **y revisado críticamente**; tres riesgos identificados de aplicar esto a una app del cliente con datos reales |

> ### 🎯 Parte de este módulo ya existe: la Ruta QA — 6 h
>
> La [**Ruta QA**](../ruta-qa/README.md) materializa buena parte de este temario en formato corto y práctico: límites y alucinación con evidencia del propio `report-ai.mjs`, prompting con contrato de salida sobre los cuatro `prompts/*.txt`, generación de tests y su revisión crítica, MCP y subagentes con herramientas acotadas, y debugging asistido sobre los diez `@demo-fail`.
>
> **El módulo 08 sigue sin construir como módulo completo.** Lo que la ruta no cubre y este módulo sí deberá: coste y elección de modelo, prompt chaining, validación estructurada más allá de `JSON.parse` (hallazgo D3), auto-reparación y su peligro, y el análisis a fondo de los pasos de IA del workflow (`.github/workflows/playwright.yml:52-69`).

---

## 09 — Capstone final ⬜

| | |
|---|---|
| **Objetivo** | Integrar todo en un entregable propio con contexto asegurador |
| **Competencias** | Todas (A-O) |
| **Contenidos** | Los del programa, aplicados de forma autónoma sobre journeys genéricos de seguros: cotización, contratación de póliza, consulta, declaración de siniestro, gestión de datos del asegurado |
| **Duración** | 6 h de sesión + 10-12 h personales |
| **Nivel** | 7 ARCHITECT |
| **Dependencias** | Todos |
| **Repository mapping** | El repositorio completo como referencia arquitectónica. ⚠️ **Aplicación objetivo pendiente de decidir** (ver Fase 1, sección 14.2) |
| **Entregables** | 12 entregables: estrategia de test, análisis de riesgo, escenarios, suite Playwright, arquitectura con fixtures y `storageState`, tests negativos y de borde, cross-browser, reporting con tags, informe de debugging, pipeline CI propio, análisis IA adaptado y defensa de 15 minutos |

---

## Itinerarios según el pre-assessment

| Nivel de entrada | Módulo 00 | Resto |
|---|---|---|
| **BEGINNER** (< 40) | Ampliado: doble de horas, emparejado con perfil técnico | Ejercicios base con andamiaje extra |
| **FOUNDATION** (40-59) | Completo | Ejercicios base. Itinerario por defecto |
| **INTERMEDIATE** (60-79) | Reducido: solo TS y `async` | Ejercicios base + algunos `[+]` |
| **ADVANCED** (≥ 80) | **Se salta** | Ejercicios `[+]`, rol de mentor en parejas, lidera la arquitectura del capstone |

Detalle en [`../assessment/README.md`](../assessment/README.md).
