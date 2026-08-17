# MODULE 01 — VALIDACIÓN TÉCNICA PREVIA
## K1 (Entorno) · K2 (Locators)

**Fase 3A.1 — Solo validación.** No se ha construido material del módulo 01, ni Labs, ni teoría, ni Challenges. No se ha modificado código ni documentación existente.

**Fecha de ejecución:** 17 de agosto de 2026
**Todo lo que sigue está ejecutado contra la aplicación real.** Cada cifra procede de una ejecución concreta; nada está inferido. Los ficheros temporales usados para las sondas se han eliminado tras la ejecución.

---

# 1. Environment

## Máquina de validación

| Elemento | Valor |
|---|---|
| Sistema | Windows 11 Pro 10.0.26200 |
| Node / npm | Los del proyecto (`@types/node ^20.19.39`) |
| Playwright CLI | **1.58.2** — coincide con `package-lock.json` |
| Registro npm | `https://registry.npmjs.org/` (público) |
| `http_proxy` / `https_proxy` | **vacíos** |
| Proxy npm | `null` / `null` |

## ⚠️ Limitación de alcance — leer antes que nada

Esta validación se ha ejecutado desde **el equipo de desarrollo actual**, que es una máquina sin proxy y con acceso directo a internet.

**No es una validación del entorno de HDI Seguros Chile.** Lo que aquí se demuestra es que la aplicación, los locators y los tiempos funcionan; lo que **no** se demuestra es que una máquina corporativa de HDI, detrás de su proxy y sus políticas, pueda hacer lo mismo.

Todo el apartado K2 (locators, accesibilidad, `testIdAttribute`) es **independiente de la red** y vale para cualquier entorno. El apartado K1 hay que repetirlo en un equipo de HDI. Ver sección 10.

---

# 2. SauceDemo Availability

| Comprobación | Resultado | Detalle |
|---|---|---|
| Resolución DNS | ✅ | `www.saucedemo.com` → CNAME → `saucelabs.github.io` → `185.199.108-111.153` |
| HTTPS | ✅ | `HTTP 200`, 1.349 bytes, `Server: GitHub.com` |
| Certificados | ✅ | Sin errores TLS; sin necesidad de `ignoreHTTPSErrors` |
| Proxy | ✅ No aplica | Sin proxy en la máquina de validación |
| **Hosting** | **GitHub Pages** | Dato relevante: bloquear GitHub Pages en HDI bloquea también SauceDemo |
| Login funcional | ✅ | Con las credenciales que **ya usa el proyecto**; ninguna credencial nueva y ninguna expuesta en este informe |
| Flujo E2E completo | ✅ | login → catálogo → carrito → checkout paso 1 → paso 2 → confirmación, recorrido entero sin incidencias |

> **Nota operativa:** al estar SauceDemo alojado en GitHub Pages, la política de red que permita `github.io` cubre a la vez la aplicación bajo test y el acceso a GitHub del módulo 06. Es una sola decisión de red, no dos.

---

# 3. Browser Availability

Caché de navegadores en `%LOCALAPPDATA%\ms-playwright`:

| Navegador | Versiones presentes | Estado para M01 |
|---|---|---|
| Chromium | `1140`, `1208`, `1228`, `1234` | ✅ |
| Chromium headless shell | `1208`, `1228`, `1234` | ✅ |
| Firefox | `1509`, `1532` | ✅ |
| WebKit | `2248`, `2311` | ✅ |
| ffmpeg (grabación de vídeo) | `1010`, `1011` | ✅ |
| winldd | `1007` | ✅ |

Los tres motores están instalados y operativos. **En un equipo nuevo hará falta `npx playwright install` (~500 MB de descarga)**, que es precisamente lo que el diseño de M01 presupuestó como tiempo de sesión.

---

# 4. Locator Validation

Metodología: para cada elemento se han evaluado las estrategias aplicables con `locator.count()` contra el DOM real. La cifra es el **número de elementos que resuelve**. `0` = no funciona · `1` = identifica unívocamente · `>1` = **viola strict mode**.

Las columnas vacías (`—`) indican estrategia no aplicable semánticamente; no se ha forzado ninguna.

## LOGIN

| Element | Role | Label | Text | Placeholder | TestId | CSS | XPath | Recommended |
|---|---|---|---|---|---|---|---|---|
| Usuario | ✅ 1 `textbox` "Username" | ❌ 0 | — | ✅ 1 "Username" | ✅ 1 `username`* | ✅ 1 `#user-name` | ✅ 1 | **`getByRole('textbox', { name: 'Username' })`** |
| Password | ✅ 1 `textbox` "Password" | ❌ 0 | — | ✅ 1 "Password" | ✅ 1 `password`* | ✅ 1 `#password` | ✅ 1 | **`getByRole('textbox', { name: 'Password' })`** |
| Botón Login | ✅ 1 `button` "Login" | — | ✅ 1 exacto | — | ✅ 1 `login-button`* | ✅ 1 `#login-button` | ✅ 1 | **`getByRole('button', { name: 'Login' })`** |

\* `getByTestId` solo funciona con `testIdAttribute: 'data-test'` configurado. Ver sección 6.

## INVENTORY

| Element | Role | Label | Text | Placeholder | TestId | CSS | XPath | Recommended |
|---|---|---|---|---|---|---|---|---|
| Título de página ("Products") | ❌ **0** — no es un heading | — | ✅ 1 exacto | — | ✅ 1 `title` | ✅ 1 `.title` | ✅ | **`getByTestId('title')`** — el rol no existe |
| Selector de ordenación | ✅ 1 `combobox` (sin nombre) | ❌ 0 | — | — | ✅ 1 `product-sort-container` | ✅ 1 `select` | ✅ | **`getByRole('combobox')`** — único en la página |
| Lista de productos | — | — | — | ✅ 6 `inventory-item` | ✅ 6 `.inventory_item` | ✅ | **`getByTestId('inventory-item')`** |
| Nombre de un producto | ⚠️ **2** `link` "Sauce Labs Backpack" | — | ✅ 1 | ⚠️ 6 `inventory-item-name` | — | ✅ | **`getByRole('link', …).first()` NO** — usar acotado por tarjeta |
| Precio | — | — | ✅ 1 `$29.99` | ⚠️ 6 `inventory-item-price` | ⚠️ 6 `.inventory_item_price` | ✅ | **Acotar por tarjeta** |
| Botón "Add to cart" | ⚠️ **6** `button` "Add to cart" | — | ⚠️ 6 | ✅ 1 `add-to-cart-sauce-labs-backpack` | ✅ | ✅ | **`getByTestId('add-to-cart-…')`** o acotado |
| Botón add-to-cart **acotado por tarjeta** | ✅ **1** | — | — | — | — | — | **`getByTestId('inventory-item').filter({ hasText: 'Sauce Labs Backpack' }).getByRole('button')`** ← el patrón que enseña M01 |
| Enlace al carrito | ❌ 0 (`link` "shopping cart") | — | — | ✅ 1 `shopping-cart-link` | ✅ | ✅ | **`getByTestId('shopping-cart-link')`** |

## CART

| Element | Role | Label | Text | Placeholder | TestId | CSS | XPath | Recommended |
|---|---|---|---|---|---|---|---|---|
| Título ("Your Cart") | ❌ **0** — no es heading | — | ✅ 1 exacto | — | ✅ 1 `title` | ✅ 1 `.title` | ✅ | **`getByTestId('title')`** |
| Productos del carrito | — | — | — | ❌ **0** con `cart-item` · ✅ **1** con `inventory-item` | ✅ 1 `.cart_item` | ✅ | **`getByTestId('inventory-item')`** ⚠️ ver hallazgo H1 |
| Cantidad | — | — | ⚠️ 2 (`"1"` exacto) | ✅ 1 `item-quantity` | ✅ 1 `.cart_quantity` | ✅ | **`getByTestId('item-quantity')`** |
| Botón Checkout | ✅ 1 `button` "Checkout" | — | ✅ 1 exacto | ✅ 1 `checkout` | ✅ | ✅ | **`getByRole('button', { name: 'Checkout' })`** |

## CHECKOUT — Paso 1

| Element | Role | Label | Text | Placeholder | TestId | CSS | XPath | Recommended |
|---|---|---|---|---|---|---|---|---|
| First Name | ✅ 1 `textbox` "First Name" | ❌ 0 | — | ✅ 1 | ✅ 1 `firstName` | ✅ 1 `#first-name` | ✅ | **`getByRole('textbox', { name: 'First Name' })`** |
| Last Name | ✅ 1 `textbox` "Last Name" | ❌ 0 | — | ✅ 1 | ✅ 1 `lastName` | ✅ | ✅ | **`getByRole('textbox', { name: 'Last Name' })`** |
| Postal Code | ✅ 1 `textbox` "Zip/Postal Code" | ❌ 0 | — | ✅ 1 | ✅ 1 `postalCode` | ✅ | ✅ | **`getByRole('textbox', { name: 'Zip/Postal Code' })`** |
| Continue | ✅ 1 `button` "Continue" | — | — | — | ✅ 1 `continue` | ✅ | ✅ | **`getByRole('button', { name: 'Continue' })`** |
| Cancel | ⚠️ 1 `button` **"Go back Cancel"** | — | — | — | ✅ 1 `cancel` | ✅ | ✅ | **`getByTestId('cancel')`** — el nombre accesible engaña |

## CHECKOUT — Paso 2

| Element | Role | Label | Text | Placeholder | TestId | CSS | XPath | Recommended |
|---|---|---|---|---|---|---|---|---|
| Subtotal | — | — | ✅ 1 "Item total:" | ✅ 1 `subtotal-label` | ✅ | ✅ | **`getByTestId('subtotal-label')`** |
| Impuestos | — | — | ✅ | ✅ 1 `tax-label` | ✅ | ✅ | **`getByTestId('tax-label')`** |
| Total | — | — | ✅ | ✅ 1 `total-label` | ✅ | ✅ | **`getByTestId('total-label')`** |
| Finish | ✅ 1 `button` "Finish" | — | — | — | ✅ 1 `finish` | ✅ | ✅ | **`getByRole('button', { name: 'Finish' })`** |

**Valores reales capturados:** `Item total: $29.99` · `Tax: $2.40` · `Total: $32.39` — confirma un impuesto del **8 %** sobre el subtotal, con redondeo a 2 decimales. Es exactamente el supuesto del Challenge 1 del módulo 00, ahora verificado contra la aplicación.

## CONFIRMATION

| Element | Role | Label | Text | Placeholder | TestId | CSS | XPath | Recommended |
|---|---|---|---|---|---|---|---|---|
| Mensaje de confirmación | ✅ **1** `heading` nivel 2 "Thank you for your order!" | — | ✅ 1 | ✅ 1 `complete-header` | ✅ | ✅ | **`getByRole('heading', { name: 'Thank you for your order!' })`** |
| Texto secundario | — | — | ✅ | ✅ 1 `complete-text` | ✅ | ✅ | `getByTestId('complete-text')` |

> Es el **único** heading real de todo el flujo, y es justo el que ya usa [`tests/checkout.spec.ts:34`](../../tests/checkout.spec.ts). El repositorio acertó por casualidad o por criterio, pero acertó.

## Resumen por estrategia

| Estrategia | Elementos donde funciona | Veredicto para M01 |
|---|---|---|
| `getByRole` | 12 de 20 probados | ✅ **Enseñar como primera opción.** Excelente en formularios y botones; inútil en títulos |
| `getByLabel` | **0 de 20** | ❌ **No se puede enseñar con esta aplicación** — ver H2 |
| `getByText` | 8 de 20 | ⚠️ Enseñar con reservas: acoplado al idioma y al copy |
| `getByPlaceholder` | 5 de 5 campos de texto | ✅ Enseñar; es lo que da nombre accesible a los inputs |
| `getByTestId` | 20 de 20 | ✅ **Enseñar, pero requiere configuración** (sección 6) |
| CSS por atributo/id | 20 de 20 | ✅ Es lo que hace el proyecto; enseñar como base y contraste |
| CSS por clase | Funciona, frágil | ⚠️ Contraejemplo (`.cart_item`, `.inventory_item_price`) |
| XPath | Funciona en todos los probados | ⚠️ Enseñar solo para desaconsejarlo |
| **Acotado** (`filter` + `getByRole`) | Resuelve todas las ambigüedades | ✅ **El patrón más valioso del módulo** |

---

# 5. Accessibility Findings

Volcado real por página:

| Página | `<h1-h4>` | `<label>` | Inputs | Selects | Botones con nombre | Enlaces |
|---|---|---|---|---|---|---|
| Login | 2 (`H4`, informativos sobre credenciales) | **0** | 2, con `placeholder`, sin `aria-label` | 0 | 1 ("Login") | 0 |
| Inventory | **0** | **0** | 0 | 1, **sin `id` ni `aria-label`** | 8 | 20 |
| Cart | **0** | **0** | 0 | 0 | 5 | 9 |
| Checkout paso 1 | **0** | **0** | 3, con `placeholder`, sin `aria-label` | 0 | 4 | 8 |
| Confirmation | 1 (`H2` "Thank you for your order!") | **0** | 0 | 0 | 2 | — |

## Hallazgos

**H2 — La aplicación no tiene ni un solo `<label>`.** Cero en las cinco pantallas. `getByLabel()` **nunca** funcionará contra SauceDemo. No es un fallo de la sonda: es cómo está construida la aplicación.

**H3 — Los inputs obtienen su nombre accesible del `placeholder`.** Por eso `getByRole('textbox', { name: 'Username' })` funciona: no hay etiqueta, hay marcador de posición. Es un matiz de accesibilidad que merece explicarse, porque es la razón por la que dos estrategias distintas devuelven lo mismo.

**H4 — Solo hay un heading real en todo el flujo.** Los títulos de página ("Products", "Your Cart") son `<span class="title" data-test="title">`. `getByRole('heading', { name: 'Products' })` devuelve **0**. Cualquier material que dé por supuesto lo contrario sería falso.

**H5 — El desplegable de ordenación no tiene nombre accesible.** Sin `id`, sin `aria-label`, sin `<label>`. `getByRole('combobox')` funciona **solo porque es el único de la página**. Es un ejemplo honesto de locator que funciona hoy y es frágil mañana.

**H6 — El botón Cancel se llama "Go back Cancel".** Su nombre accesible concatena el `alt` de un icono con el texto. Es la clase de sorpresa que justifica verificar los nombres accesibles en vez de suponerlos.

**H7 — Strict mode reproducido con el error literal.** El nombre de cada producto es a la vez enlace de imagen y enlace de título:

```
Error: strict mode violation: getByRole('link', { name: 'Sauce Labs Backpack' })
resolved to 2 elements:
  1) <a href="#" id="item_4_img_link" data-test="item-4-img-link">…</a>
  2) <a href="#" id="item_4_title_link" data-test="item-4-title-link">…</a>
```

Material didáctico perfecto y auténtico: el error explica el problema y hasta sugiere los locators alternativos.

---

# 6. TestId Configuration

**Verificado por ejecución, no supuesto.**

| Comprobación | Resultado |
|---|---|
| `getByTestId('username')` con la configuración por defecto | **0 elementos** |
| Elementos con `[data-testid]` en la página | **0** |
| Elementos con `[data-test]` en la página de login | **7** |
| `getByTestId('username')` con `testIdAttribute: 'data-test'` | **1 elemento** ✅ |

**Conclusión:** el valor por defecto de Playwright es `data-testid`; SauceDemo usa `data-test`. Para habilitar `getByTestId()` hace falta exactamente una línea:

```typescript
use: {
  testIdAttribute: 'data-test',
}
```

Con esa línea, los **81 selectores** `page.locator('[data-test="…"]')` del proyecto podrían escribirse como `page.getByTestId('…')`. **No se ha modificado `playwright.config.ts`**, conforme a la instrucción de esta fase; la línea iría en la configuración propia del sandbox de M01.

Valor didáctico confirmado: es una mejora real, medible y de una línea, que el alumno puede aplicar y defender. El anclaje **R12** del diseño pasa de "NO EXISTE" a "existe y está verificado".

---

# 7. Performance / Execution Time

Todas las cifras son de ejecuciones reales en esta máquina, contra la aplicación en vivo.

| Medición | Tiempo |
|---|---|
| `page.goto('/')` (primera carga, arranque de navegador incluido) | **2.958 ms** |
| Login completo + aserción de URL | **3.145 ms** |
| Test aislado de humo (extremo a extremo del proceso) | 5,1 s |
| Sonda de locators de login + inventario (2 tests) | 2,0 s |
| Flujo E2E completo (carrito + checkout + confirmación) | 2,0 s |
| **Suite completa `--project=chromium` (79 tests)** | **21,8 s de ejecución · 24,7 s de reloj** |
| Resultado de esa suite | **69 pasaron · 10 fallaron** — los 10 son los `@demo-fail` |

**Extrapolación para los tres navegadores:** ~60-75 s en local. Es **mucho mejor** de lo que asumió el diseño de M01, que preveía la ejecución de la suite como un cuello de botella del Lab 1.

**Consecuencia para la duración:** el riesgo K8 ("la suite tarda y frustra") baja de MEDIUM a **LOW** en una máquina como esta. La restricción de usar solo `--project=chromium` durante las prácticas deja de ser necesaria; sigue siendo recomendable con 10 alumnos ejecutando simultáneamente contra un sitio público, pero por cortesía con el servicio, no por tiempo.

**Lo que sigue siendo caro** es `npx playwright install` (~500 MB), que no se ha medido aquí porque los navegadores ya estaban en caché. Sigue habiendo que presupuestarlo.

---

# 8. Risks

## Riesgos nuevos, descubiertos en esta validación

| # | Hallazgo | Impacto | Recomendación |
|---|---|---|---|
| **H1** | **`CartPage.cartItems` está roto.** [`pages/cart.page.ts:7`](../../pages/cart.page.ts) declara `page.locator('[data-test="cart-item"]')`, y ese atributo **no existe**: la sonda devuelve **0 elementos**. El HTML real del ítem es `<div class="cart_item" data-test="inventory-item">` | **HIGH** — invalida un ejercicio ya diseñado | Ver desarrollo abajo |
| **H2** | `getByLabel` no funciona en ninguna pantalla (0 `<label>` en toda la aplicación) | **MEDIUM** | Quitar `getByLabel` del Lab 3 como estrategia practicable. Enseñarla como concepto y usar **la propia ausencia** como ejercicio: *"¿por qué no funciona aquí, y qué le pedirías al equipo de desarrollo?"* Es mejor material que un ejemplo artificial |
| **H4** | `getByRole('heading', …)` solo funciona en la confirmación | **LOW** | Ajustar los ejemplos del Lab 3: los títulos de página van por `getByTestId('title')` |
| **H5** | El `combobox` no tiene nombre accesible | **LOW** | Convertirlo en punto de discusión: locator que funciona hoy y es frágil mañana |
| **H6** | Nombres accesibles inesperados ("Go back Cancel") | **LOW** | Un ejercicio de 5 minutos: predecir el nombre accesible y comprobarlo |

### Desarrollo de H1 — el hallazgo más importante de esta validación

La cadena de hechos, toda verificada:

1. `CartPage.cartItems` apunta a `[data-test="cart-item"]`.
2. Ese atributo **no existe** en la página del carrito. Resuelve a **0 elementos**, siempre.
3. El elemento real es `<div class="cart_item" data-test="inventory-item">`.
4. **Ningún test usa `CartPage.cartItems`.** Los 12 usos de `.cart_item` repartidos en 5 specs son el rodeo que alguien tomó cuando el locator del Page Object no funcionó.

**Esto corrige el hallazgo A1 del análisis de Fase 1.** Allí se describió como una "fuga del Page Object": tests que se saltan el POM por comodidad. Es al revés: **el POM está roto y los tests lo esquivan**. La causa era invisible porque un locator que no encuentra nada solo falla si alguien lo usa, y nadie lo usa.

**Impacto en el material ya diseñado:**

- El ejercicio previsto para el **módulo 02** —"sustituye `.cart_item` por `CartPage.cartItems`"— **rompería los cinco specs**. Hay que rehacerlo antes de construir M02.
- El anclaje **R13** del diseño de M01 ("locator frágil por clase CSS") sigue siendo válido, pero su explicación cambia por completo.

**Y el material mejora.** Un locator muerto que nadie detectó durante 47 commits es mejor ejercicio que una fuga por pereza: enseña que **un locator que no encuentra nada es invisible hasta que alguien lo usa**, y conecta directamente con el concepto de código de test no ejercitado. Encaja en M01 (locators) y se profundiza en M02 (arquitectura).

**Ninguna corrección aplicada:** conforme a las reglas del programa, el defecto se documenta y se conserva como material.

## Riesgos del diseño, revaluados

| # | Riesgo original | Impacto anterior | **Impacto ahora** | Motivo |
|---|---|---|---|---|
| K1 | Entorno inaccesible | HIGH | **HIGH (sin cambios)** | Validado aquí, **no en HDI**. La incógnita sigue abierta donde importa |
| K2 | Locators no verificados | HIGH | **RESUELTO** | 20 elementos × 7 estrategias, sondeados contra el DOM real |
| K3 | Demasiado contenido | HIGH | HIGH | Sin cambios |
| K4 | Faltan ejemplos de estrategias | MEDIUM | **MEDIUM ↓** | `getByRole`, `getByPlaceholder` y `getByTestId` funcionan de verdad; solo `getByLabel` queda sin anclaje |
| K8 | La suite tarda | MEDIUM | **LOW** | 79 tests en 21,8 s medidos |
| K13 | El sandbox necesita configuración nueva | LOW | LOW | Confirmado: `baseURL` + projects + `testIdAttribute` |

---

# 9. Impact on M01 Labs

| Lab | Estado | Motivo |
|---|---|---|
| **Lab 1 — La suite real** | 🟢 **GREEN** | Suite ejecutada: 79 tests, 21,8 s, 69/10 exactamente como documenta el material. Los scripts de `package.json` funcionan |
| **Lab 2 — Auto-waiting** | 🟢 **GREEN** | El flujo completo funciona; `performance_glitch_user` sigue en la aplicación y la latencia real está disponible como demostración |
| **Lab 3 — Locators** | 🟡 **YELLOW** | El núcleo está confirmado (`getByRole`, `getByPlaceholder`, `getByTestId`, acotado, strict mode con error literal). **Pero hay que rehacer tres cosas**: quitar `getByLabel` como estrategia practicable (H2), corregir los ejemplos de títulos de página (H4) y añadir el caso del `combobox` sin nombre (H5). Es trabajo de reescritura del enunciado, no de rediseño |
| **Lab 4 — El test que falta** | 🟢 **GREEN** | El hueco de la ordenación A→Z sigue vigente; el `<select>` tiene sus 4 opciones y `getByRole('combobox')` lo localiza |
| **Lab 5 — Troubleshooting** | 🟢 **GREEN** | Mejor de lo previsto: hay un caso **auténtico** de strict mode con dos enlaces por producto, con mensaje de error real, y ahora además el locator muerto de H1 |
| **Lab 6 — Codegen (opcional)** | 🟡 **YELLOW** | No validado. `codegen` no se ha ejecutado en esta sesión |
| **Challenge — Compra completa** | 🟢 **GREEN** | Flujo E2E recorrido entero. **AC2 confirmado y cuantificado**: `$29.99 + $2.40 = $32.39`, impuesto del 8 % — el alumno puede verificar importes con valores reales, no solo visibilidad |

**Ningún Lab en rojo.** Uno amarillo por ajustes de contenido y otro por no haberse validado.

---

# 10. Final Recommendation

## Veredicto

| Criterio | Resultado | Fundamento |
|---|---|---|
| **K1 — Entorno** | **CONDITIONAL** | ✅ Todo funciona en la máquina de desarrollo: DNS, HTTPS, login, flujo completo, 3 navegadores, 79 tests en 21,8 s. ❌ **Sin verificar en un equipo corporativo de HDI**, que es donde estaba el riesgo |
| **K2 — Locators** | **PASS** | 20 elementos sondeados con las 7 estrategias contra el DOM real. Los locators recomendados para cada elemento están confirmados. `testIdAttribute` verificado con y sin configurar. Las tres divergencias respecto al diseño (H2, H4, H5) son ajustes de enunciado, no rediseños |

## Recomendación

# ⚠️ ADAPT DESIGN

No es *PROCEED* porque hay tres ajustes obligatorios antes de escribir el Lab 3 y una corrección que afecta a material ya diseñado. No es *USE LOCAL FALLBACK* porque la aplicación funciona perfectamente y sería tirar por la borda el mejor material disponible.

### Qué adaptar, en orden

1. **Corregir el ejercicio de `.cart_item` que estaba previsto para M02** (H1). Tal y como estaba diseñado, rompería cinco specs. La versión correcta es más valiosa: descubrir que `CartPage.cartItems` no encuentra nada.
2. **Sacar `getByLabel` de la lista de estrategias practicables del Lab 3** (H2) y convertirla en pregunta de criterio.
3. **Corregir los ejemplos de títulos de página** (H4) y añadir el `combobox` sin nombre (H5) como caso de discusión.
4. **Rebajar el riesgo K8** en la estimación de duración: la suite tarda 22 s, no minutos.
5. **Mantener todo lo demás.** Los cinco Labs, el Challenge y el assessment siguen siendo válidos.

### Lo que sigue bloqueado y no depende de mí

**Ejecutar los apartados 2 y 3 de este informe desde un equipo corporativo de HDI.** Concretamente:

```bash
npm ci
npx playwright install
npx playwright test --project=chromium tests/login.spec.ts
```

Si eso funciona, K1 pasa a **PASS** y la recomendación pasa a **PROCEED** con los cuatro ajustes de arriba. Si falla, hay que activar el plan B (página HTML local servida por `webServer` en el sandbox), que encarece la construcción pero conserva el diseño pedagógico.

**No hay término medio útil aquí:** todo el material de M01 asume una aplicación real en un navegador real. Es la diferencia deliberada con M00, que funcionaba sin red.

---

## Lo que NO se ha hecho en esta fase

- No se ha construido nada del módulo 01.
- No se ha modificado `playwright.config.ts` (sección 6).
- No se ha corregido `pages/cart.page.ts` pese al hallazgo H1: el defecto se conserva como material didáctico, conforme a las reglas del programa.
- No se ha modificado ninguna documentación existente. Los hallazgos H1-H7 **no** se han propagado todavía a [`module-01-discovery-design.md`](module-01-discovery-design.md) ni al material del módulo 00: esa propagación es una edición que corresponde aprobar antes de hacerla.
- Los ficheros temporales de sonda se han eliminado. `git status` no muestra ningún cambio fuera de `learning/`.

---

*Fase 3A.1. Validación técnica exclusivamente. Todas las cifras proceden de ejecuciones reales contra `https://www.saucedemo.com` el 17 de agosto de 2026, desde el equipo de desarrollo actual.*
