# Plan de Pruebas: Añadir Productos al Carrito — SauceDemo

**Aplicación bajo test:** https://www.saucedemo.com
**Framework:** Playwright + TypeScript (Page Object Model)
**Fecha de elaboración:** 2026-04-13

---

## Hallazgos del análisis

### Catálogo de productos (data-test IDs confirmados)

| Producto | data-test ID | ID de detalle |
|---|---|---|
| Sauce Labs Backpack | `sauce-labs-backpack` | `id=4` |
| Sauce Labs Bike Light | `sauce-labs-bike-light` | `id=0` |
| Sauce Labs Bolt T-Shirt | `sauce-labs-bolt-t-shirt` | `id=6` |
| Sauce Labs Fleece Jacket | `sauce-labs-fleece-jacket` | `id=5` |
| Sauce Labs Onesie | `sauce-labs-onesie` | `id=2` |
| Sauce Labs (Red) T-Shirt | `sauce-labs-t-shirt` | `id=3` |

### Page Objects disponibles

- `LoginPage` — `navigate()`, `login(user, pass)`
- `InventoryPage` — `addToCart(id)`, `removeFromCart(id)`, `sortBy(option)`, `navigateToCart()`, `navigateToProduct(name)`, `getProductNames()`, `getProductPrices()`; locators: `cartBadge`, `inventoryItems`
- `ProductDetailPage` — `navigate(id)`, `addToCart()`, `removeFromCart()`, `backToProducts()`; locators: `productName`, `productDescription`, `productPrice`, `cartBadge`
- `CartPage` — `removeItem(id)`, `continueShopping()`, `checkout()`; locators: `cartItems`
- `MenuPage` — `open()`, `logout()`, `resetAppState()`

### Tests ya existentes (NO repetir)

De `add-tshirt-to-cart.spec.ts`:
1. Añadir `sauce-labs-bolt-t-shirt` solo → badge = 1
2. Añadir `sauce-labs-backpack` + `sauce-labs-bike-light` → badge = 2
3. Añadir `sauce-labs-onesie` + `sauce-labs-fleece-jacket` + `sauce-labs-bolt-t-shirt` → badge = 3
4. Añadir y eliminar `sauce-labs-backpack` desde inventario → badge desaparece
5. Añadir `sauce-labs-bolt-t-shirt`, ir al carrito y eliminar → carrito vacío
6. Navegar al carrito vacío y pulsar "Continuar comprando" → URL `/inventory.html`

De `product-detail.spec.ts`:
7. `productDetailPage.navigate(0)` (Bike Light) → añadir → badge = 1
8. `productDetailPage.navigate(0)` → añadir → eliminar desde detalle → badge desaparece
9. `productDetailPage.navigate(0)` → pulsar "Volver a productos" → URL `/inventory.html`

---

## Suite 1 — Añadir productos individuales desde el inventario

**beforeEach:** `standard_user` autenticado en `/inventory.html`. Carrito vacío.

### TC-INV-01: debería añadir la Sauce Labs Backpack al carrito como único producto

**Pasos:**
1. `inventoryPage.addToCart('sauce-labs-backpack')`.
2. Verificar que `inventoryPage.cartBadge` tiene texto `'1'`.

**Criterio de aceptación:** Badge muestra `1`.

---

### TC-INV-02: debería añadir la Sauce Labs Bike Light al carrito como único producto

**Pasos:**
1. `inventoryPage.addToCart('sauce-labs-bike-light')`.
2. Verificar que `inventoryPage.cartBadge` tiene texto `'1'`.

**Criterio de aceptación:** Badge muestra `1`.

---

### TC-INV-03: debería añadir la Sauce Labs Fleece Jacket al carrito como único producto

**Pasos:**
1. `inventoryPage.addToCart('sauce-labs-fleece-jacket')`.
2. Verificar que `inventoryPage.cartBadge` tiene texto `'1'`.

**Criterio de aceptación:** Badge muestra `1`.

---

### TC-INV-04: debería añadir la Sauce Labs Onesie al carrito como único producto

**Pasos:**
1. `inventoryPage.addToCart('sauce-labs-onesie')`.
2. Verificar que `inventoryPage.cartBadge` tiene texto `'1'`.

**Criterio de aceptación:** Badge muestra `1`.

---

### TC-INV-05: debería añadir la Sauce Labs (Red) T-Shirt al carrito como único producto

**Pasos:**
1. `inventoryPage.addToCart('sauce-labs-t-shirt')`.
2. Verificar que `inventoryPage.cartBadge` tiene texto `'1'`.

**Criterio de aceptación:** Badge muestra `1`.

---

### TC-INV-06: debería añadir los 6 productos al carrito y mostrar badge con valor 6

**Pasos:**
1. `addToCart('sauce-labs-backpack')`
2. `addToCart('sauce-labs-bike-light')`
3. `addToCart('sauce-labs-bolt-t-shirt')`
4. `addToCart('sauce-labs-fleece-jacket')`
5. `addToCart('sauce-labs-onesie')`
6. `addToCart('sauce-labs-t-shirt')`
7. Verificar que `cartBadge` muestra `'6'`.

**Criterio de aceptación:** Badge muestra `6` tras añadir todo el catálogo.

---

### TC-INV-07: debería cambiar el botón de "Add to cart" a "Remove" tras añadir un producto

**Pasos:**
1. Verificar que `[data-test="add-to-cart-sauce-labs-backpack"]` es visible.
2. `addToCart('sauce-labs-backpack')`.
3. Verificar que `[data-test="remove-sauce-labs-backpack"]` es visible.
4. Verificar que `[data-test="add-to-cart-sauce-labs-backpack"]` ya no es visible.

**Criterio de aceptación:** El botón "Add to cart" desaparece y es reemplazado por "Remove".

---

### TC-INV-08: debería restablecer el botón a "Add to cart" tras eliminar el producto desde el inventario

**Pasos:**
1. `addToCart('sauce-labs-bike-light')`.
2. Verificar que `[data-test="remove-sauce-labs-bike-light"]` es visible.
3. `removeFromCart('sauce-labs-bike-light')`.
4. Verificar que `[data-test="add-to-cart-sauce-labs-bike-light"]` es visible de nuevo.
5. Verificar que `cartBadge` no es visible.

**Criterio de aceptación:** El botón vuelve a "Add to cart" y el badge desaparece.

---

### TC-INV-09: debería decrementar el badge al eliminar un producto con otros en el carrito

**Pasos:**
1. `addToCart('sauce-labs-fleece-jacket')`.
2. `addToCart('sauce-labs-onesie')`.
3. Verificar que `cartBadge` muestra `'2'`.
4. `removeFromCart('sauce-labs-fleece-jacket')`.
5. Verificar que `cartBadge` muestra `'1'`.

**Criterio de aceptación:** Badge se decrementa a `1` al eliminar uno de dos productos.

---

## Suite 2 — Añadir productos desde la página de detalle

**beforeEach:** `standard_user` autenticado. Carrito vacío.

### TC-DET-01: debería añadir la Sauce Labs Backpack al carrito desde su página de detalle (id=4)

**Pasos:**
1. `productDetailPage.navigate(4)`.
2. Verificar que URL contiene `/inventory-item.html?id=4`.
3. `productDetailPage.addToCart()`.
4. Verificar que `productDetailPage.cartBadge` muestra `'1'`.

**Criterio de aceptación:** Badge muestra `1`.

---

### TC-DET-02: debería añadir la Sauce Labs Bolt T-Shirt al carrito desde su página de detalle (id=6)

**Pasos:**
1. `productDetailPage.navigate(6)`.
2. `productDetailPage.addToCart()`.
3. Verificar que `cartBadge` muestra `'1'`.

**Criterio de aceptación:** Badge muestra `1`.

---

### TC-DET-03: debería añadir la Sauce Labs Fleece Jacket al carrito desde su página de detalle (id=5)

**Pasos:**
1. `productDetailPage.navigate(5)`.
2. `productDetailPage.addToCart()`.
3. Verificar que `cartBadge` muestra `'1'`.

**Criterio de aceptación:** Badge muestra `1`.

---

### TC-DET-04: debería añadir la Sauce Labs Onesie al carrito desde su página de detalle (id=2)

**Pasos:**
1. `productDetailPage.navigate(2)`.
2. `productDetailPage.addToCart()`.
3. Verificar que `cartBadge` muestra `'1'`.

**Criterio de aceptación:** Badge muestra `1`.

---

### TC-DET-05: debería añadir la Sauce Labs (Red) T-Shirt al carrito desde su página de detalle (id=3)

**Pasos:**
1. `productDetailPage.navigate(3)`.
2. `productDetailPage.addToCart()`.
3. Verificar que `cartBadge` muestra `'1'`.

**Criterio de aceptación:** Badge muestra `1`.

---

### TC-DET-06: debería cambiar el botón a "Remove" en detalle tras añadir el producto

**Pasos:**
1. `productDetailPage.navigate(4)`.
2. Verificar que `[data-test^="add-to-cart"]` es visible y `[data-test^="remove"]` no lo es.
3. `productDetailPage.addToCart()`.
4. Verificar que `[data-test^="remove"]` es visible.
5. Verificar que `[data-test^="add-to-cart"]` no es visible.

**Criterio de aceptación:** El botón "Add to cart" es sustituido por "Remove".

---

### TC-DET-07: debería eliminar la Sauce Labs Fleece Jacket desde su detalle y hacer desaparecer el badge

**Pasos:**
1. `productDetailPage.navigate(5)`.
2. `productDetailPage.addToCart()`.
3. Verificar que `cartBadge` muestra `'1'`.
4. `productDetailPage.removeFromCart()`.
5. Verificar que `cartBadge` no es visible.

**Criterio de aceptación:** Badge desaparece tras eliminar desde el detalle.

---

### TC-DET-08: debería navegar al detalle desde la imagen del producto en el inventario

**Pasos:**
1. En `/inventory.html`, localizar el ítem que contiene "Sauce Labs Fleece Jacket".
2. Hacer clic en el elemento `img` dentro de ese ítem.
3. Verificar que la URL contiene `/inventory-item.html`.
4. Verificar que `productDetailPage.productName` contiene "Sauce Labs Fleece Jacket".

**Criterio de aceptación:** La imagen es clickable y redirige al detalle correcto.

---

### TC-DET-09: debería persistir el badge al volver al inventario después de añadir desde el detalle

**Pasos:**
1. `productDetailPage.navigate(2)` (Onesie).
2. `productDetailPage.addToCart()`.
3. Verificar que `cartBadge` muestra `'1'`.
4. `productDetailPage.backToProducts()`.
5. Verificar URL es `/inventory.html`.
6. Verificar que `inventoryPage.cartBadge` muestra `'1'`.
7. Verificar que `[data-test="remove-sauce-labs-onesie"]` es visible.

**Criterio de aceptación:** Badge y botón "Remove" persisten al volver al inventario.

---

## Suite 3 — Sincronización del estado entre inventario y carrito

**beforeEach:** `standard_user` autenticado en `/inventory.html`. Carrito vacío.

### TC-SYNC-01: debería mostrar los productos añadidos desde el inventario en la página del carrito

**Pasos:**
1. `addToCart('sauce-labs-backpack')`.
2. `addToCart('sauce-labs-fleece-jacket')`.
3. `navigateToCart()`.
4. Verificar que `cartPage.cartItems` tiene conteo `2`.
5. Verificar que los nombres "Sauce Labs Backpack" y "Sauce Labs Fleece Jacket" son visibles.

**Criterio de aceptación:** El carrito contiene exactamente 2 ítems con los nombres correctos.

---

### TC-SYNC-02: debería mantener el contenido del carrito al navegar entre inventario y carrito repetidamente

**Pasos:**
1. `addToCart('sauce-labs-onesie')`.
2. `navigateToCart()`.
3. Verificar que `cartItems` tiene conteo `1`.
4. `cartPage.continueShopping()`.
5. Verificar URL es `/inventory.html` y `cartBadge` muestra `'1'`.
6. `navigateToCart()`.
7. Verificar que `cartItems` sigue teniendo conteo `1`.

**Criterio de aceptación:** El ítem persiste en el carrito tras volver al inventario y regresar.

---

### TC-SYNC-03: debería mostrar correctamente en el carrito el producto añadido desde el detalle

**Pasos:**
1. `productDetailPage.navigate(5)` (Fleece Jacket).
2. `productDetailPage.addToCart()`.
3. Clic en `[data-test="shopping-cart-link"]` para ir al carrito.
4. Verificar que `cartItems` tiene conteo `1`.
5. Verificar que el nombre "Sauce Labs Fleece Jacket" es visible en el carrito.
6. Verificar que el precio contiene `$`.

**Criterio de aceptación:** El producto añadido desde el detalle aparece en el carrito con nombre y precio correctos.

---

### TC-SYNC-04: debería reflejar en el inventario los botones "Remove" de los productos en carrito al volver desde el carrito

**Pasos:**
1. `addToCart('sauce-labs-bolt-t-shirt')`.
2. `addToCart('sauce-labs-onesie')`.
3. `navigateToCart()`.
4. `cartPage.continueShopping()`.
5. Verificar que `[data-test="remove-sauce-labs-bolt-t-shirt"]` es visible.
6. Verificar que `[data-test="remove-sauce-labs-onesie"]` es visible.
7. Verificar que `cartBadge` muestra `'2'`.

**Criterio de aceptación:** Los botones "Remove" permanecen visibles al volver al inventario.

---

### TC-SYNC-05: debería eliminar múltiples productos desde el carrito y dejar el carrito vacío

**Pasos:**
1. `addToCart('sauce-labs-backpack')`.
2. `addToCart('sauce-labs-bike-light')`.
3. `addToCart('sauce-labs-onesie')`.
4. `navigateToCart()`.
5. `cartPage.removeItem('sauce-labs-backpack')` → verificar conteo `2`.
6. `cartPage.removeItem('sauce-labs-bike-light')` → verificar conteo `1`.
7. `cartPage.removeItem('sauce-labs-onesie')` → verificar conteo `0`.
8. `cartPage.continueShopping()` → verificar que `cartBadge` no es visible.

**Criterio de aceptación:** El carrito queda en cero y el badge desaparece.

---

## Suite 4 — Gestión del badge del carrito

**beforeEach:** `standard_user` autenticado. Carrito vacío.

### TC-BADGE-01: debería no mostrar el badge al cargar el inventario con carrito vacío

**Pasos:**
1. Verificar que `inventoryPage.cartBadge` no es visible tras el login con carrito vacío.

**Criterio de aceptación:** Badge no visible en estado inicial.

---

### TC-BADGE-02: debería mostrar badge con valor 4 al añadir cuatro productos distintos

**Pasos:**
1. `addToCart('sauce-labs-backpack')`.
2. `addToCart('sauce-labs-bike-light')`.
3. `addToCart('sauce-labs-fleece-jacket')`.
4. `addToCart('sauce-labs-t-shirt')`.
5. Verificar que `cartBadge` muestra `'4'`.

**Criterio de aceptación:** Badge muestra `4`.

---

### TC-BADGE-03: debería mostrar badge con valor 5 al añadir cinco productos distintos

**Pasos:**
1. `addToCart('sauce-labs-backpack')`.
2. `addToCart('sauce-labs-bike-light')`.
3. `addToCart('sauce-labs-bolt-t-shirt')`.
4. `addToCart('sauce-labs-fleece-jacket')`.
5. `addToCart('sauce-labs-t-shirt')`.
6. Verificar que `cartBadge` muestra `'5'`.

**Criterio de aceptación:** Badge muestra `5`.

---

### TC-BADGE-04: debería persistir el badge tras recargar la página del inventario

**Pasos:**
1. `addToCart('sauce-labs-backpack')`.
2. `addToCart('sauce-labs-bike-light')`.
3. Verificar que `cartBadge` muestra `'2'`.
4. `page.reload()`.
5. Verificar que URL sigue siendo `/inventory.html`.
6. Verificar que `cartBadge` muestra `'2'`.

**Criterio de aceptación:** Badge persiste con valor `2` tras recarga de página.

---

### TC-BADGE-05: debería persistir el badge al navegar a la página de detalle de un producto

**Pasos:**
1. `addToCart('sauce-labs-backpack')`.
2. Verificar que `cartBadge` muestra `'1'`.
3. `navigateToProduct('Sauce Labs Fleece Jacket')`.
4. Verificar que URL contiene `/inventory-item.html`.
5. Verificar que `productDetailPage.cartBadge` muestra `'1'`.

**Criterio de aceptación:** Badge mantiene valor `1` al navegar al detalle.

---

### TC-BADGE-06: debería restablecer el badge al usar "Reset App State" desde el menú lateral

**Pasos:**
1. `addToCart('sauce-labs-backpack')`.
2. `addToCart('sauce-labs-onesie')`.
3. Verificar que `cartBadge` muestra `'2'`.
4. `menuPage.resetAppState()`.
5. Verificar que `cartBadge` no es visible.
6. Verificar que `[data-test="add-to-cart-sauce-labs-backpack"]` es visible.
7. Verificar que `[data-test="add-to-cart-sauce-labs-onesie"]` es visible.

**Criterio de aceptación:** Badge desaparece y todos los botones vuelven a "Add to cart" tras el reset.

---

## Suite 5 — Comportamiento con problem_user

**beforeEach:** Login con `problem_user` / `secret_sauce`. Carrito vacío.

> **Nota QA:** `problem_user` tiene bugs de UI deliberados en SauceDemo. Estos tests documentan el comportamiento real y sirven como tests de regresión.

### TC-PROB-01: debería verificar el comportamiento del badge al añadir Sauce Labs Backpack con problem_user

**Pasos:**
1. Login con `problem_user` / `secret_sauce`.
2. Verificar que URL es `/inventory.html`.
3. `addToCart('sauce-labs-backpack')`.
4. Observar si `cartBadge` muestra `'1'`.

**Criterio de aceptación esperado:** Badge muestra `1`.
**Criterio de fallo (bug conocido):** Badge no se actualiza o el botón no responde.

---

### TC-PROB-02: debería verificar cuántos de los 6 productos responden al "Add to cart" con problem_user

**Pasos:**
1. Login con `problem_user` / `secret_sauce`.
2. Intentar `addToCart` para cada uno de los 6 productos en secuencia.
3. Verificar el valor final del badge.

**Criterio de aceptación esperado:** Badge muestra `6`.
**Criterio de fallo (bug conocido):** Badge final menor a `6` confirma que algunos productos no se añaden.

---

### TC-PROB-03: debería verificar consistencia entre estado del botón y badge con problem_user

**Pasos:**
1. Login con `problem_user` / `secret_sauce`.
2. `addToCart('sauce-labs-t-shirt')`.
3. Verificar si `[data-test="remove-sauce-labs-t-shirt"]` está visible.
4. Verificar que el estado del botón coincide con el del badge.

**Criterio de aceptación:** Estado visual del botón y valor del badge son coherentes entre sí.
**Criterio de fallo:** Botón muestra "Remove" pero badge no se actualiza (inconsistencia de estado).

---

### TC-PROB-04: debería verificar que el carrito no contiene productos fantasma con problem_user

**Pasos:**
1. Login con `problem_user` / `secret_sauce`.
2. Intentar añadir los 6 productos.
3. Registrar el valor del badge.
4. `navigateToCart()`.
5. Verificar que el conteo de `cartItems` coincide con el valor del badge registrado.

**Criterio de aceptación:** Número de ítems en carrito = valor del badge (coherencia entre vistas).
**Criterio de fallo:** Ítems en carrito difieren del badge — indica productos fantasma o bug en contabilización.

---

### TC-PROB-05: debería verificar el botón "Add to cart" en la página de detalle con problem_user

**Pasos:**
1. Login con `problem_user` / `secret_sauce`.
2. `productDetailPage.navigate(4)` (Sauce Labs Backpack).
3. Verificar que `[data-test^="add-to-cart"]` es visible.
4. `productDetailPage.addToCart()`.
5. Verificar si `cartBadge` muestra `'1'` y si el botón cambió a `[data-test^="remove"]`.

**Criterio de aceptación esperado:** Badge muestra `1` y botón cambia a "Remove".
**Criterio de fallo (bug conocido):** Badge no cambia y/o botón no responde.

---

## Suite 6 — Comportamiento con performance_glitch_user

**beforeEach:** Login con `performance_glitch_user` / `secret_sauce`. Carrito vacío.

> **Nota QA:** Este usuario introduce latencia artificial. Usar `{ timeout: 15000 }` en las aserciones.

### TC-PERF-01: debería añadir un producto al carrito con performance_glitch_user a pesar de la latencia

**Pasos:**
1. Login con `performance_glitch_user` / `secret_sauce` (esperar redirección a `/inventory.html`).
2. Verificar URL es `/inventory.html`.
3. `addToCart('sauce-labs-backpack')`.
4. Verificar que `cartBadge` muestra `'1'` (con timeout extendido de 15 segundos).

**Criterio de aceptación:** Badge muestra `1` eventualmente, aunque con mayor latencia.
**Criterio de fallo:** Badge no aparece o el test falla por timeout antes de actualizarse.

---

### TC-PERF-02: debería completar el flujo añadir-navegar-verificar carrito con performance_glitch_user

**Pasos:**
1. Login con `performance_glitch_user` / `secret_sauce`.
2. `addToCart('sauce-labs-bolt-t-shirt')`.
3. `navigateToCart()`.
4. Verificar que `cartItems` tiene conteo `1`.
5. Verificar que el nombre del ítem contiene "Sauce Labs Bolt T-Shirt".

**Criterio de aceptación:** El producto aparece en el carrito a pesar de la latencia.
**Criterio de fallo:** Carrito vacío, conteo incorrecto, o nombre del producto incorrecto.

---

## Suite 7 — Casos límite y escenarios de borde

**beforeEach:** `standard_user` autenticado en `/inventory.html`. Carrito vacío.

### TC-EDGE-01: debería volver a añadir un producto después de haberlo eliminado desde el inventario

**Pasos:**
1. `addToCart('sauce-labs-backpack')` → verificar badge `'1'`.
2. `removeFromCart('sauce-labs-backpack')` → verificar badge no visible.
3. Verificar que `[data-test="add-to-cart-sauce-labs-backpack"]` es visible de nuevo.
4. `addToCart('sauce-labs-backpack')` → verificar badge `'1'` de nuevo.

**Criterio de aceptación:** Ciclo add → remove → add funciona sin errores.

---

### TC-EDGE-02: debería volver a añadir desde el inventario un producto eliminado desde el carrito

**Pasos:**
1. `addToCart('sauce-labs-onesie')`.
2. `navigateToCart()`.
3. `cartPage.removeItem('sauce-labs-onesie')` → verificar conteo `0`.
4. `cartPage.continueShopping()`.
5. Verificar que `[data-test="add-to-cart-sauce-labs-onesie"]` es visible.
6. `addToCart('sauce-labs-onesie')` → verificar badge `'1'`.

**Criterio de aceptación:** El producto puede volver a añadirse desde el inventario tras eliminarlo desde el carrito.

---

### TC-EDGE-03: debería impedir añadir el mismo producto dos veces (interfaz no lo permite)

**Pasos:**
1. `addToCart('sauce-labs-backpack')`.
2. Verificar badge `'1'`.
3. Verificar que `[data-test="add-to-cart-sauce-labs-backpack"]` NO es visible.
4. Verificar que `[data-test="remove-sauce-labs-backpack"]` es visible.
5. `navigateToCart()` → verificar que `cartItems` tiene conteo `1`.

**Criterio de aceptación:** La interfaz no permite duplicados; el carrito contiene exactamente 1 ítem.

---

### TC-EDGE-04: debería acceder directamente por URL a un producto (id=1) y añadirlo al carrito

**Pasos:**
1. `productDetailPage.navigate(1)`.
2. Verificar que la página carga (nombre, descripción, precio visibles).
3. Verificar que `[data-test^="add-to-cart"]` es visible.
4. `productDetailPage.addToCart()`.
5. Verificar que `cartBadge` muestra `'1'`.

**Criterio de aceptación:** Acceso directo por URL a detalle de producto permite añadir al carrito correctamente.

---

### TC-EDGE-05: debería añadir productos al carrito con el inventario ordenado por precio ascendente

**Pasos:**
1. `inventoryPage.sortBy('lohi')`.
2. `addToCart('sauce-labs-onesie')` → verificar badge `'1'`.
3. `addToCart('sauce-labs-fleece-jacket')` → verificar badge `'2'`.

**Criterio de aceptación:** Los botones funcionan correctamente con el inventario ordenado por precio ascendente.

---

### TC-EDGE-06: debería añadir productos al carrito con el inventario ordenado por nombre de Z a A

**Pasos:**
1. `inventoryPage.sortBy('za')`.
2. `addToCart('sauce-labs-t-shirt')` → verificar badge `'1'`.
3. `addToCart('sauce-labs-backpack')` → verificar badge `'2'`.

**Criterio de aceptación:** Los botones funcionan correctamente con el inventario ordenado de Z a A.

---

### TC-EDGE-07: debería verificar el comportamiento del carrito tras logout y nuevo login

**Pasos:**
1. `addToCart('sauce-labs-backpack')`.
2. `addToCart('sauce-labs-bike-light')` → verificar badge `'2'`.
3. `menuPage.logout()` → verificar URL redirige a `/`.
4. Login con `standard_user` / `secret_sauce`.
5. Verificar URL es `/inventory.html`.
6. Observar el estado del badge (documentar si el carrito persiste o no tras el logout).

**Criterio de aceptación:** La aplicación no produce errores. El estado del badge es coherente con el comportamiento de sesión de la app.

---

## Resumen

| Suite | Tests | Tipo |
|---|---|---|
| Suite 1 — Añadir desde inventario | 9 | Funcional / Estado |
| Suite 2 — Añadir desde detalle de producto | 9 | Funcional / Navegación |
| Suite 3 — Sincronización inventario-carrito | 5 | Funcional / Integración |
| Suite 4 — Gestión del badge | 6 | Funcional / UI |
| Suite 5 — Comportamiento con problem_user | 5 | Regresión / Bugs conocidos |
| Suite 6 — Comportamiento con performance_glitch_user | 2 | Rendimiento / Resiliencia |
| Suite 7 — Casos límite y escenarios de borde | 7 | Edge cases |
| **TOTAL** | **43** | |

---

## Notas de implementación

**Pattern de beforeEach estándar:**
```typescript
test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  inventoryPage = new InventoryPage(page);
  await loginPage.navigate();
  await loginPage.login('standard_user', 'secret_sauce');
});
```

**Reset de estado sin logout:**
```typescript
await menuPage.resetAppState(); // pages/menu.page.ts
```

**Timeout extendido para performance_glitch_user:**
```typescript
await expect(inventoryPage.cartBadge).toHaveText('1', { timeout: 15000 });
```

**IDs de productos para `ProductDetailPage.navigate(id)`:**

| id | Producto |
|---|---|
| 0 | Sauce Labs Bike Light |
| 1 | (explorar en ejecución) |
| 2 | Sauce Labs Onesie |
| 3 | Sauce Labs (Red) T-Shirt |
| 4 | Sauce Labs Backpack |
| 5 | Sauce Labs Fleece Jacket |
| 6 | Sauce Labs Bolt T-Shirt |
