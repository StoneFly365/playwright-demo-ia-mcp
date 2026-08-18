# Referencia de locators — SauceDemo

⭐ **El entregable más útil del módulo.** Es la tabla que consultas durante el Lab 3 y el Challenge, y la que te llevas a tu trabajo como plantilla del mismo ejercicio sobre tu propia aplicación.

**Todo lo que hay aquí está medido**, no supuesto: 20 elementos probados con 7 estrategias cada uno contra la aplicación real. Fuente: [`module-01-technical-validation.md`](../../docs/module-01-technical-validation.md), sección 4, más las ejecuciones de la construcción del módulo.

**Cómo se lee la cifra:** es el número de elementos que resuelve el locator. `0` = no funciona · `1` = identifica unívocamente · `>1` = viola strict mode.

> ⚠️ Todos los ejemplos con `getByTestId` requieren `testIdAttribute: 'data-test'`. El sandbox del módulo 01 ya lo trae; `playwright.config.ts` de la raíz **no**.

---

## Login

| Elemento | Locator recomendado | Alternativas que funcionan | Qué descartar y por qué |
|---|---|---|---|
| Campo Usuario | `getByRole('textbox', { name: 'Username' })` | `getByPlaceholder('Username')` · `getByTestId('username')` · `#user-name` | `getByLabel` → **0**: no hay `<label>` |
| Campo Contraseña | `getByRole('textbox', { name: 'Password' })` | `getByPlaceholder('Password')` · `getByTestId('password')` | `getByLabel` → **0** |
| Botón Login | `getByRole('button', { name: 'Login' })` | `getByTestId('login-button')` · `getByText('Login')` | XPath: funciona y no aporta nada |
| Mensaje de error | `getByTestId('error')` | `.error-message-container` | Por texto: se rompe al traducir |
| Botón `X` de cerrar el error | `getByTestId('error-button')` | — | Sin rol ni nombre accesible útil |

**Por qué el rol y el placeholder devuelven lo mismo:** los inputs no tienen etiqueta, así que el navegador usa el `placeholder` como nombre accesible.

## Catálogo (inventory)

| Elemento | Locator recomendado | Cifra medida | Nota |
|---|---|---|---|
| Título "Products" | `getByTestId('title')` | 1 | 🔬 `getByRole('heading', { name: 'Products' })` → **0**. Es un `<span>`, no un heading |
| Desplegable de ordenación | `getByRole('combobox')` | 1 | ⚠️ Funciona **porque es el único de la página**: sin `id`, sin `aria-label`, sin `<label>`. Alternativa estable: `getByTestId('product-sort-container')` |
| Todas las tarjetas de producto | `getByTestId('inventory-item')` | 6 | Es lo correcto: se espera una colección |
| Una tarjeta concreta | `getByTestId('inventory-item').filter({ hasText: 'Sauce Labs Backpack' })` | 1 | **El patrón clave del módulo** |
| Nombre de un producto | `getByTestId('inventory-item-name').filter({ hasText: '…' })` | 1 | 🔬 `getByRole('link', { name: 'Sauce Labs Backpack' })` → **2** (imagen y título): strict mode |
| Precio de un producto | `getByTestId('inventory-item').filter({ hasText: '…' }).getByTestId('inventory-item-price')` | 1 | Sin acotar → 6 |
| Botón "Add to cart" de un producto | `getByTestId('inventory-item').filter({ hasText: '…' }).getByRole('button', { name: 'Add to cart' })` | 1 | 🔬 Sin acotar → **6**. También vale `getByTestId('add-to-cart-sauce-labs-backpack')` |
| Enlace al carrito | `getByTestId('shopping-cart-link')` | 1 | 🔬 `getByRole('link', { name: 'shopping cart' })` → **0** |
| Contador del carrito | `getByTestId('shopping-cart-badge')` | 1 | No existe cuando el carrito está vacío: úsalo con `not.toBeVisible()` |

## Carrito

| Elemento | Locator recomendado | Cifra medida | Nota |
|---|---|---|---|
| Título "Your Cart" | `getByTestId('title')` | 1 | 🔬 No es un heading |
| Líneas de producto | `getByTestId('inventory-item')` | 1 por producto | 🔬 **`[data-test="cart-item"]` → 0 elementos: no existe.** Es el locator roto de [`pages/cart.page.ts:7`](../../../pages/cart.page.ts) |
| Cantidad | `getByTestId('item-quantity')` | 1 | Por texto `'1'` → 2: ambiguo |
| Botón Checkout | `getByRole('button', { name: 'Checkout' })` | 1 | También `getByTestId('checkout')` |
| Botón Continue Shopping | `getByRole('button', { name: 'Continue Shopping' })` | 1 | — |

## Checkout — paso 1 (datos)

| Elemento | Locator recomendado | Nota |
|---|---|---|
| First Name | `getByRole('textbox', { name: 'First Name' })` | 🔬 `getByLabel` → 0 |
| Last Name | `getByRole('textbox', { name: 'Last Name' })` | — |
| Zip / Postal Code | `getByRole('textbox', { name: 'Zip/Postal Code' })` | Ojo a la barra en el nombre |
| Continue | `getByRole('button', { name: 'Continue' })` | — |
| Cancel | `getByTestId('cancel')` | 🔬 **El nombre accesible es "Go back Cancel"**: `{ name: 'Cancel', exact: true }` → **0** |
| Mensaje de error | `getByTestId('error')` | Con `toContainText`, no `toHaveText` |

## Checkout — paso 2 (resumen)

| Elemento | Locator recomendado | Valor real medido (1 producto de $29.99) |
|---|---|---|
| Subtotal | `getByTestId('subtotal-label')` | `Item total: $29.99` |
| Impuestos | `getByTestId('tax-label')` | `Tax: $2.40` |
| Total | `getByTestId('total-label')` | `Total: $32.39` |
| Finish | `getByRole('button', { name: 'Finish' })` | — |

🔬 **El impuesto es el 8 % del subtotal, redondeado a 2 decimales.** Comprobado también con dos productos: `$39.98` → `Tax: $3.20` → `Total: $43.18`.

## Confirmación

| Elemento | Locator recomendado | Nota |
|---|---|---|
| "Thank you for your order!" | `getByRole('heading', { name: 'Thank you for your order!' })` | 🔬 **El único heading real de todo el flujo**, y el único `getByRole` que usa el proyecto ([`tests/checkout.spec.ts:34`](../../../tests/checkout.spec.ts)) |
| Texto secundario | `getByTestId('complete-text')` | — |
| Back Home | `getByTestId('back-to-products')` | — |

---

## Resumen por estrategia

| Estrategia | Elementos donde funciona | Veredicto |
|---|---|---|
| `getByTestId` | **20 de 20** (con configuración) | ✅ La más fiable en esta aplicación |
| CSS por atributo | 20 de 20 | ✅ Equivalente, más verboso |
| `getByRole` | 12 de 20 | ✅ **Primera opción** en botones y campos; inútil en títulos |
| `getByPlaceholder` | 5 de 5 campos de texto | ✅ Válido; explica el nombre accesible |
| `getByText` | 8 de 20 | ⚠️ Acoplado al idioma y al copy |
| CSS por clase | Funciona | ⚠️ Selector de estilo: frágil por definición |
| XPath | Funciona en todos los probados | ⚠️ Última opción |
| **`getByLabel`** | **0 de 20** | ❌ **Imposible aquí**: la aplicación no tiene `<label>` |
| **Acotado (`filter` + rol/testId)** | Resuelve **todas** las ambigüedades | ✅ **El patrón más valioso** |

## El árbol de decisión, en cinco preguntas

```
1. ¿El elemento tiene un rol y un nombre accesible estables?
   → sí: getByRole(rol, { name })            ← primera opción
   → no: sigue

2. ¿Es un campo de texto sin etiqueta?
   → sí: getByPlaceholder(...)  (y anota el defecto de accesibilidad)
   → no: sigue

3. ¿Tiene un atributo data-test?
   → sí: getByTestId(...)
   → no: sigue

4. ¿Hay un id estable, no generado?
   → sí: '#id'    (excepción justificada, como pages/menu.page.ts)
   → no: sigue

5. Solo entonces: CSS por clase o XPath — y déjalo escrito como deuda.

En cualquier punto, si el locator resuelve más de un elemento:
   → ACOTA por su contenedor con .filter({ hasText: ... })
   → NUNCA .first() salvo que el orden sea de verdad el criterio.
```

## Cómo comprobar un locator sin adivinar

```typescript
// Cuántos elementos resuelve — la pregunta que evita el 90% de los problemas
console.log(await page.getByRole('link', { name: 'Sauce Labs Backpack' }).count());   // 2

// Qué nombre accesible tiene realmente un elemento
console.log(await page.getByTestId('cancel').textContent());
```

Y en el navegador, con las herramientas de desarrollo abiertas: la pestaña de accesibilidad muestra el rol y el nombre accesible reales de cualquier elemento. **Comprobar tarda diez segundos; suponer cuesta una tarde.**
