# Índice de Tests — SauceDemo E2E

**Última actualización:** 2026-11-17  
**Total de tests:** 88 (87 + `seed.spec.ts`, arranque de los agentes con sesión iniciada)  
**Framework:** Playwright + TypeScript · Page Object Model  
**App bajo test:** https://www.saucedemo.com

> Los tests marcados con ⚠️ contienen **fallos intencionados** y se esperan en estado FAIL.

---

## Resumen por fichero

| Fichero | Suite | Tests | Fallos intencionados |
|---|---|---|---|
| [login.spec.ts](#loginspects) | Login | 8 | 1 |
| [inventory.spec.ts](#inventoryspects) | Inventario | 5 | 1 |
| [checkout.spec.ts](#checkoutspects) | Checkout | 8 | 1 |
| [menu.spec.ts](#menuspects) | Menú lateral | 2 | 1 |
| [route-protection.spec.ts](#route-protectionspects) | Protección de rutas | 3 | 1 |
| [add-tshirt-to-cart.spec.ts](#add-tshirt-to-cartspects) | Carrito de compra | 6 | 0 |
| [inventory-add-to-cart.spec.ts](#inventory-add-to-cartspects) | Añadir desde inventario | 9 | 1 |
| [product-detail.spec.ts](#product-detailspects) | Detalle de producto | 4 | 1 |
| [product-detail-add-to-cart.spec.ts](#product-detail-add-to-cartspects) | Añadir desde detalle | 9 | 1 |
| [cart-badge.spec.ts](#cart-badgespects) | Gestión del badge | 6 | 1 |
| [cart-sync.spec.ts](#cart-syncspects) | Sincronización carrito | 5 | 1 |
| [cart-edge-cases.spec.ts](#cart-edge-casesspects) | Casos límite del carrito | 7 | 0 |
| [problem-user-cart.spec.ts](#problem-user-cartspects) | Comportamiento problem_user | 5 | 0 |
| [performance-glitch-user-cart.spec.ts](#performance-glitch-user-cartspects) | Comportamiento performance_glitch_user | 2 | 0 |
| [accessibility.spec.ts](#accessibilityspects) | Accesibilidad (axe, WCAG 2.1 AA) | 8 | 0 |
| [seed.spec.ts](../tests/seed.spec.ts) | Seed (arranque de los agentes) | 1 | 0 |
| **TOTAL** | | **88** | **10** |

---

## login.spec.ts

**Suite:** `Login`  
**beforeEach:** navega a la página de login.

| ID | Nombre del test | Estado esperado |
|---|---|---|
| TC-LOGIN-01 | debería redirigir a la página de inventario con login exitoso | ⚠️ FAIL |
| TC-LOGIN-02 | debería mostrar error cuando las credenciales no corresponden a ningún usuario | PASS |
| TC-LOGIN-03 | debería mostrar error cuando el usuario está bloqueado | PASS |
| TC-LOGIN-04 | debería mostrar error cuando el campo de usuario está vacío | PASS |
| TC-LOGIN-05 | debería mostrar error cuando el campo de contraseña está vacío | PASS |
| TC-LOGIN-06 | debería mostrar error cuando ambos campos están vacíos | PASS |
| TC-LOGIN-07 | debería permitir acceder con el usuario problem_user | PASS |
| TC-LOGIN-08 | debería permitir acceder con el usuario performance_glitch_user | PASS |

---

## inventory.spec.ts

**Suite:** `Inventario`  
**beforeEach:** `standard_user` autenticado en `/inventory.html`.

| ID | Nombre del test | Estado esperado |
|---|---|---|
| TC-CAT-01 | debería mostrar 6 productos en el inventario | ⚠️ FAIL |
| TC-CAT-02 | debería ordenar los productos por nombre de Z a A | PASS |
| TC-CAT-03 | debería ordenar los productos por precio de menor a mayor | PASS |
| TC-CAT-04 | debería ordenar los productos por precio de mayor a menor | PASS |
| TC-CAT-05 | debería navegar al detalle del producto al hacer clic en el nombre | PASS |

---

## checkout.spec.ts

**Suite:** `Checkout`  
**beforeEach:** `standard_user` autenticado, Backpack en carrito, navegado a checkout step 1.

| ID | Nombre del test | Estado esperado |
|---|---|---|
| TC-CHK-01 | debería completar el proceso de compra con datos válidos | PASS |
| TC-CHK-02 | debería mostrar error si el nombre es obligatorio | ⚠️ FAIL |
| TC-CHK-03 | debería mostrar error si el apellido es obligatorio | PASS |
| TC-CHK-04 | debería mostrar error si el código postal es obligatorio | PASS |
| TC-CHK-05 | debería cancelar el checkout desde el paso 1 y volver al carrito | PASS |
| TC-CHK-06 | debería cancelar el checkout desde el paso 2 y volver al inventario | PASS |
| TC-CHK-07 | debería mostrar el resumen de precios correctamente en el paso 2 | PASS |
| TC-CHK-08 | debería volver al inventario tras finalizar el pedido | PASS |

---

## menu.spec.ts

**Suite:** `Menú lateral`  
**beforeEach:** `standard_user` autenticado en `/inventory.html`.

| ID | Nombre del test | Estado esperado |
|---|---|---|
| TC-MENU-01 | debería cerrar sesión al pulsar Logout | ⚠️ FAIL |
| TC-MENU-02 | debería resetear el estado del carrito al pulsar Reset App State | PASS |

---

## route-protection.spec.ts

**Suite:** `Protección de rutas`  
**beforeEach:** sin sesión activa.

| ID | Nombre del test | Estado esperado |
|---|---|---|
| TC-ROUTE-01 | debería redirigir al login si se accede a /inventory.html sin sesión | PASS |
| TC-ROUTE-02 | debería redirigir al login si se accede a /cart.html sin sesión | PASS |
| TC-ROUTE-03 | debería redirigir al login si se accede a /checkout-step-one.html sin sesión | ⚠️ FAIL |

---

## add-tshirt-to-cart.spec.ts

**Suite:** `Carrito de compra`  
**beforeEach:** `standard_user` autenticado en `/inventory.html`.

| ID | Nombre del test | Estado esperado |
|---|---|---|
| TC-CART-01 | debería añadir la Sauce Labs Bolt T-Shirt al carrito tras el login | PASS |
| TC-CART-02 | debería añadir múltiples productos al carrito | PASS |
| TC-CART-03 | debería mostrar el número correcto en el badge del carrito | PASS |
| TC-CART-04 | debería eliminar un producto desde el inventario | PASS |
| TC-CART-05 | debería eliminar un producto desde el carrito | PASS |
| TC-CART-06 | debería volver al inventario al pulsar "Continuar comprando" | PASS |

---

## inventory-add-to-cart.spec.ts

**Suite:** `Añadir productos individuales desde el inventario`  
**beforeEach:** `standard_user` autenticado en `/inventory.html`. Carrito vacío.

| ID | Nombre del test | Estado esperado |
|---|---|---|
| TC-INV-01 | debería añadir la Sauce Labs Backpack al carrito como único producto | PASS |
| TC-INV-02 | debería añadir la Sauce Labs Bike Light al carrito como único producto | PASS |
| TC-INV-03 | debería añadir la Sauce Labs Fleece Jacket al carrito como único producto | PASS |
| TC-INV-04 | debería añadir la Sauce Labs Onesie al carrito como único producto | PASS |
| TC-INV-05 | debería añadir la Sauce Labs (Red) T-Shirt al carrito como único producto | PASS |
| TC-INV-06 | debería añadir los 6 productos al carrito y mostrar badge con valor 6 | ⚠️ FAIL |
| TC-INV-07 | debería cambiar el botón de "Add to cart" a "Remove" tras añadir un producto | PASS |
| TC-INV-08 | debería restablecer el botón a "Add to cart" tras eliminar el producto desde el inventario | PASS |
| TC-INV-09 | debería decrementar el badge al eliminar un producto con otros en el carrito | PASS |

---

## product-detail.spec.ts

**Suite:** `Detalle de producto`  
**beforeEach:** `standard_user` autenticado, navegado al detalle `id=0` (Bike Light).

| ID | Nombre del test | Estado esperado |
|---|---|---|
| TC-PDP-01 | debería mostrar el nombre, descripción y precio del producto correctamente | PASS |
| TC-PDP-02 | debería añadir el producto al carrito desde el detalle | PASS |
| TC-PDP-03 | debería eliminar el producto del carrito desde el detalle | ⚠️ FAIL |
| TC-PDP-04 | debería volver al inventario al pulsar "Volver a productos" | PASS |

---

## product-detail-add-to-cart.spec.ts

**Suite:** `Añadir productos desde la página de detalle`  
**beforeEach:** `standard_user` autenticado. Carrito vacío.

| ID | Nombre del test | Estado esperado |
|---|---|---|
| TC-DET-01 | debería añadir la Sauce Labs Backpack al carrito desde su página de detalle (id=4) | PASS |
| TC-DET-02 | debería añadir la Sauce Labs Bolt T-Shirt al carrito desde su página de detalle (id=6) | PASS |
| TC-DET-03 | debería añadir la Sauce Labs Fleece Jacket al carrito desde su página de detalle (id=5) | PASS |
| TC-DET-04 | debería añadir la Sauce Labs Onesie al carrito desde su página de detalle (id=2) | ⚠️ FAIL |
| TC-DET-05 | debería añadir la Sauce Labs (Red) T-Shirt al carrito desde su página de detalle (id=3) | PASS |
| TC-DET-06 | debería cambiar el botón a "Remove" en detalle tras añadir el producto | PASS |
| TC-DET-07 | debería eliminar la Sauce Labs Fleece Jacket desde su detalle y hacer desaparecer el badge | PASS |
| TC-DET-08 | debería navegar al detalle desde la imagen del producto en el inventario | PASS |
| TC-DET-09 | debería persistir el badge al volver al inventario después de añadir desde el detalle | PASS |

---

## cart-badge.spec.ts

**Suite:** `Gestión del badge del carrito`  
**beforeEach:** `standard_user` autenticado en `/inventory.html`. Carrito vacío.

| ID | Nombre del test | Estado esperado |
|---|---|---|
| TC-BADGE-01 | debería no mostrar el badge al cargar el inventario con carrito vacío | PASS |
| TC-BADGE-02 | debería mostrar badge con valor 4 al añadir cuatro productos distintos | ⚠️ FAIL |
| TC-BADGE-03 | debería mostrar badge con valor 5 al añadir cinco productos distintos | PASS |
| TC-BADGE-04 | debería persistir el badge tras recargar la página del inventario | PASS |
| TC-BADGE-05 | debería persistir el badge al navegar a la página de detalle de un producto | PASS |
| TC-BADGE-06 | debería restablecer el badge al usar "Reset App State" desde el menú lateral | PASS |

---

## cart-sync.spec.ts

**Suite:** `Sincronización del estado entre inventario y carrito`  
**beforeEach:** `standard_user` autenticado en `/inventory.html`. Carrito vacío.

| ID | Nombre del test | Estado esperado |
|---|---|---|
| TC-SYNC-01 | debería mostrar los productos añadidos desde el inventario en la página del carrito | ⚠️ FAIL |
| TC-SYNC-02 | debería mantener el contenido del carrito al navegar entre inventario y carrito repetidamente | PASS |
| TC-SYNC-03 | debería mostrar correctamente en el carrito el producto añadido desde el detalle | PASS |
| TC-SYNC-04 | debería reflejar en el inventario los botones "Remove" de los productos en carrito al volver desde el carrito | PASS |
| TC-SYNC-05 | debería eliminar múltiples productos desde el carrito y dejar el carrito vacío | PASS |

---

## cart-edge-cases.spec.ts

**Suite:** `Casos límite y escenarios de borde del carrito`  
**beforeEach:** `standard_user` autenticado en `/inventory.html`. Carrito vacío.

| ID | Nombre del test | Estado esperado |
|---|---|---|
| TC-EDGE-01 | debería volver a añadir un producto después de haberlo eliminado desde el inventario | PASS |
| TC-EDGE-02 | debería volver a añadir desde el inventario un producto eliminado desde el carrito | PASS |
| TC-EDGE-03 | debería impedir añadir el mismo producto dos veces (interfaz no lo permite) | PASS |
| TC-EDGE-04 | debería acceder directamente por URL a un producto (id=1) y añadirlo al carrito | PASS |
| TC-EDGE-05 | debería añadir productos al carrito con el inventario ordenado por precio ascendente | PASS |
| TC-EDGE-06 | debería añadir productos al carrito con el inventario ordenado por nombre de Z a A | PASS |
| TC-EDGE-07 | debería verificar el comportamiento del carrito tras logout y nuevo login | PASS |

---

## problem-user-cart.spec.ts

**Suite:** `Comportamiento con problem_user`  
**beforeEach:** Login con `problem_user` / `secret_sauce`.

> **Nota QA:** `problem_user` tiene bugs de UI deliberados. Solo 3 de los 6 productos responden al botón "Add to cart" (Backpack, Bike Light y Onesie). Los tests documentan el comportamiento real y sirven como tests de regresión.

| ID | Nombre del test | Estado esperado |
|---|---|---|
| TC-PROB-01 | debería verificar el comportamiento del badge al añadir Sauce Labs Backpack con problem_user | PASS |
| TC-PROB-02 | debería verificar cuántos de los 6 productos responden al "Add to cart" con problem_user | PASS |
| TC-PROB-03 | debería verificar consistencia entre estado del botón y badge con problem_user | PASS |
| TC-PROB-04 | debería verificar que el carrito no contiene productos fantasma con problem_user | PASS |
| TC-PROB-05 | debería verificar el botón "Add to cart" en la página de detalle con problem_user | PASS |

---

## performance-glitch-user-cart.spec.ts

**Suite:** `Comportamiento con performance_glitch_user`  
**beforeEach:** Login con `performance_glitch_user` / `secret_sauce`. Timeout extendido a 15 s.

> **Nota QA:** Este usuario introduce latencia artificial. Todas las aserciones usan `{ timeout: 15000 }`.

| ID | Nombre del test | Estado esperado |
|---|---|---|
| TC-PERF-01 | debería añadir un producto al carrito con performance_glitch_user a pesar de la latencia | PASS |
| TC-PERF-02 | debería completar el flujo añadir-navegar-verificar carrito con performance_glitch_user | PASS |

---

## accessibility.spec.ts

**Suites:** `Accesibilidad sin sesión` y `Accesibilidad con sesión`, etiquetadas `@a11y`  
**Qué comprueba:** que axe no encuentre violaciones de las reglas WCAG 2.1 de nivel A y AA en cada pantalla. Los escenarios de fallo (`DEMO_SCENARIO`) no ejecutan esta spec.

| ID | Nombre del test | Estado esperado |
|---|---|---|
| TC-A11Y-01 | debería cumplir WCAG 2.1 AA en la página de login | PASS |
| TC-A11Y-02 | debería cumplir WCAG 2.1 AA con el mensaje de error del login | PASS |
| TC-A11Y-03 | debería cumplir WCAG 2.1 AA en el inventario | PASS |
| TC-A11Y-04 | debería cumplir WCAG 2.1 AA en el detalle de producto | PASS |
| TC-A11Y-05 | debería cumplir WCAG 2.1 AA en el carrito con un producto | PASS |
| TC-A11Y-06 | debería cumplir WCAG 2.1 AA en el paso 1 del checkout | PASS |
| TC-A11Y-07 | debería cumplir WCAG 2.1 AA en el resumen del checkout | PASS |
| TC-A11Y-08 | debería cumplir WCAG 2.1 AA en la confirmación del pedido | PASS |

---

## Cobertura funcional

| Área | Cobertura |
|---|---|
| Login (credenciales, validaciones, usuarios especiales) | ✅ |
| Inventario (listado, ordenación, navegación a detalle) | ✅ |
| Añadir al carrito desde inventario (producto a producto, todos, botones) | ✅ |
| Añadir al carrito desde detalle de producto | ✅ |
| Eliminar del carrito (desde inventario, desde detalle, desde carrito) | ✅ |
| Badge del carrito (estado, persistencia, reset) | ✅ |
| Sincronización inventario ↔ carrito | ✅ |
| Casos límite del carrito (ciclos add/remove, duplicados, orden) | ✅ |
| Checkout (flujo completo, validaciones, cancelación, resumen) | ✅ |
| Menú lateral (logout, reset app state) | ✅ |
| Protección de rutas sin sesión | ✅ |
| Usuarios especiales: problem_user | ✅ |
| Usuarios especiales: performance_glitch_user | ✅ |
| Usuarios especiales: locked_out_user | ✅ (validación en login) |
| Accesibilidad WCAG 2.1 AA (login, inventario, detalle, carrito, checkout) | ✅ (menú lateral sin analizar) |
