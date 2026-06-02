# Índice de Tests — SauceDemo E2E

**Última actualización:** 2026-06-02  
**Total de tests:** 79  
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
| **TOTAL** | | **79** | **9** |

---

## login.spec.ts

**Suite:** `Login`  
**beforeEach:** navega a la página de login.

| # | Nombre del test | Estado esperado |
|---|---|---|
| 1 | debería redirigir a la página de inventario con login exitoso | ⚠️ FAIL |
| 2 | debería mostrar error cuando las credenciales no corresponden a ningún usuario | PASS |
| 3 | debería mostrar error cuando el usuario está bloqueado | PASS |
| 4 | debería mostrar error cuando el campo de usuario está vacío | PASS |
| 5 | debería mostrar error cuando el campo de contraseña está vacío | PASS |
| 6 | debería mostrar error cuando ambos campos están vacíos | PASS |
| 7 | debería permitir acceder con el usuario problem_user | PASS |
| 8 | debería permitir acceder con el usuario performance_glitch_user | PASS |

---

## inventory.spec.ts

**Suite:** `Inventario`  
**beforeEach:** `standard_user` autenticado en `/inventory.html`.

| # | Nombre del test | Estado esperado |
|---|---|---|
| 1 | debería mostrar 6 productos en el inventario | ⚠️ FAIL |
| 2 | debería ordenar los productos por nombre de Z a A | PASS |
| 3 | debería ordenar los productos por precio de menor a mayor | PASS |
| 4 | debería ordenar los productos por precio de mayor a menor | PASS |
| 5 | debería navegar al detalle del producto al hacer clic en el nombre | PASS |

---

## checkout.spec.ts

**Suite:** `Checkout`  
**beforeEach:** `standard_user` autenticado, Backpack en carrito, navegado a checkout step 1.

| # | Nombre del test | Estado esperado |
|---|---|---|
| 1 | debería completar el proceso de compra con datos válidos | PASS |
| 2 | debería mostrar error si el nombre es obligatorio | ⚠️ FAIL |
| 3 | debería mostrar error si el apellido es obligatorio | PASS |
| 4 | debería mostrar error si el código postal es obligatorio | PASS |
| 5 | debería cancelar el checkout desde el paso 1 y volver al carrito | PASS |
| 6 | debería cancelar el checkout desde el paso 2 y volver al inventario | PASS |
| 7 | debería mostrar el resumen de precios correctamente en el paso 2 | PASS |
| 8 | debería volver al inventario tras finalizar el pedido | PASS |

---

## menu.spec.ts

**Suite:** `Menú lateral`  
**beforeEach:** `standard_user` autenticado en `/inventory.html`.

| # | Nombre del test | Estado esperado |
|---|---|---|
| 1 | debería cerrar sesión al pulsar Logout | ⚠️ FAIL |
| 2 | debería resetear el estado del carrito al pulsar Reset App State | PASS |

---

## route-protection.spec.ts

**Suite:** `Protección de rutas`  
**beforeEach:** sin sesión activa.

| # | Nombre del test | Estado esperado |
|---|---|---|
| 1 | debería redirigir al login si se accede a /inventory.html sin sesión | PASS |
| 2 | debería redirigir al login si se accede a /cart.html sin sesión | PASS |
| 3 | debería redirigir al login si se accede a /checkout-step-one.html sin sesión | ⚠️ FAIL |

---

## add-tshirt-to-cart.spec.ts

**Suite:** `Carrito de compra`  
**beforeEach:** `standard_user` autenticado en `/inventory.html`.

| # | Nombre del test | Estado esperado |
|---|---|---|
| 1 | debería añadir la Sauce Labs Bolt T-Shirt al carrito tras el login | PASS |
| 2 | debería añadir múltiples productos al carrito | PASS |
| 3 | debería mostrar el número correcto en el badge del carrito | PASS |
| 4 | debería eliminar un producto desde el inventario | PASS |
| 5 | debería eliminar un producto desde el carrito | PASS |
| 6 | debería volver al inventario al pulsar "Continuar comprando" | PASS |

---

## inventory-add-to-cart.spec.ts

**Suite:** `Añadir productos individuales desde el inventario`  
**beforeEach:** `standard_user` autenticado en `/inventory.html`. Carrito vacío.

| # | Nombre del test | Estado esperado |
|---|---|---|
| 1 | debería añadir la Sauce Labs Backpack al carrito como único producto | PASS |
| 2 | debería añadir la Sauce Labs Bike Light al carrito como único producto | PASS |
| 3 | debería añadir la Sauce Labs Fleece Jacket al carrito como único producto | PASS |
| 4 | debería añadir la Sauce Labs Onesie al carrito como único producto | PASS |
| 5 | debería añadir la Sauce Labs (Red) T-Shirt al carrito como único producto | PASS |
| 6 | debería añadir los 6 productos al carrito y mostrar badge con valor 6 | ⚠️ FAIL |
| 7 | debería cambiar el botón de "Add to cart" a "Remove" tras añadir un producto | PASS |
| 8 | debería restablecer el botón a "Add to cart" tras eliminar el producto desde el inventario | PASS |
| 9 | debería decrementar el badge al eliminar un producto con otros en el carrito | PASS |

---

## product-detail.spec.ts

**Suite:** `Detalle de producto`  
**beforeEach:** `standard_user` autenticado, navegado al detalle `id=0` (Bike Light).

| # | Nombre del test | Estado esperado |
|---|---|---|
| 1 | debería mostrar el nombre, descripción y precio del producto correctamente | PASS |
| 2 | debería añadir el producto al carrito desde el detalle | PASS |
| 3 | debería eliminar el producto del carrito desde el detalle | ⚠️ FAIL |
| 4 | debería volver al inventario al pulsar "Volver a productos" | PASS |

---

## product-detail-add-to-cart.spec.ts

**Suite:** `Añadir productos desde la página de detalle`  
**beforeEach:** `standard_user` autenticado. Carrito vacío.

| # | Nombre del test | Estado esperado |
|---|---|---|
| 1 | debería añadir la Sauce Labs Backpack al carrito desde su página de detalle (id=4) | PASS |
| 2 | debería añadir la Sauce Labs Bolt T-Shirt al carrito desde su página de detalle (id=6) | PASS |
| 3 | debería añadir la Sauce Labs Fleece Jacket al carrito desde su página de detalle (id=5) | PASS |
| 4 | debería añadir la Sauce Labs Onesie al carrito desde su página de detalle (id=2) | ⚠️ FAIL |
| 5 | debería añadir la Sauce Labs (Red) T-Shirt al carrito desde su página de detalle (id=3) | PASS |
| 6 | debería cambiar el botón a "Remove" en detalle tras añadir el producto | PASS |
| 7 | debería eliminar la Sauce Labs Fleece Jacket desde su detalle y hacer desaparecer el badge | PASS |
| 8 | debería navegar al detalle desde la imagen del producto en el inventario | PASS |
| 9 | debería persistir el badge al volver al inventario después de añadir desde el detalle | PASS |

---

## cart-badge.spec.ts

**Suite:** `Gestión del badge del carrito`  
**beforeEach:** `standard_user` autenticado en `/inventory.html`. Carrito vacío.

| # | Nombre del test | Estado esperado |
|---|---|---|
| 1 | debería no mostrar el badge al cargar el inventario con carrito vacío | PASS |
| 2 | debería mostrar badge con valor 4 al añadir cuatro productos distintos | ⚠️ FAIL |
| 3 | debería mostrar badge con valor 5 al añadir cinco productos distintos | PASS |
| 4 | debería persistir el badge tras recargar la página del inventario | PASS |
| 5 | debería persistir el badge al navegar a la página de detalle de un producto | PASS |
| 6 | debería restablecer el badge al usar "Reset App State" desde el menú lateral | PASS |

---

## cart-sync.spec.ts

**Suite:** `Sincronización del estado entre inventario y carrito`  
**beforeEach:** `standard_user` autenticado en `/inventory.html`. Carrito vacío.

| # | Nombre del test | Estado esperado |
|---|---|---|
| 1 | debería mostrar los productos añadidos desde el inventario en la página del carrito | ⚠️ FAIL |
| 2 | debería mantener el contenido del carrito al navegar entre inventario y carrito repetidamente | PASS |
| 3 | debería mostrar correctamente en el carrito el producto añadido desde el detalle | PASS |
| 4 | debería reflejar en el inventario los botones "Remove" de los productos en carrito al volver desde el carrito | PASS |
| 5 | debería eliminar múltiples productos desde el carrito y dejar el carrito vacío | PASS |

---

## cart-edge-cases.spec.ts

**Suite:** `Casos límite y escenarios de borde del carrito`  
**beforeEach:** `standard_user` autenticado en `/inventory.html`. Carrito vacío.

| # | Nombre del test | Estado esperado |
|---|---|---|
| 1 | debería volver a añadir un producto después de haberlo eliminado desde el inventario | PASS |
| 2 | debería volver a añadir desde el inventario un producto eliminado desde el carrito | PASS |
| 3 | debería impedir añadir el mismo producto dos veces (interfaz no lo permite) | PASS |
| 4 | debería acceder directamente por URL a un producto (id=1) y añadirlo al carrito | PASS |
| 5 | debería añadir productos al carrito con el inventario ordenado por precio ascendente | PASS |
| 6 | debería añadir productos al carrito con el inventario ordenado por nombre de Z a A | PASS |
| 7 | debería verificar el comportamiento del carrito tras logout y nuevo login | PASS |

---

## problem-user-cart.spec.ts

**Suite:** `Comportamiento con problem_user`  
**beforeEach:** Login con `problem_user` / `secret_sauce`.

> **Nota QA:** `problem_user` tiene bugs de UI deliberados. Solo 3 de los 6 productos responden al botón "Add to cart" (Backpack, Bike Light y Onesie). Los tests documentan el comportamiento real y sirven como tests de regresión.

| # | Nombre del test | Estado esperado |
|---|---|---|
| 1 | debería verificar el comportamiento del badge al añadir Sauce Labs Backpack con problem_user | PASS |
| 2 | debería verificar cuántos de los 6 productos responden al "Add to cart" con problem_user | PASS |
| 3 | debería verificar consistencia entre estado del botón y badge con problem_user | PASS |
| 4 | debería verificar que el carrito no contiene productos fantasma con problem_user | PASS |
| 5 | debería verificar el botón "Add to cart" en la página de detalle con problem_user | PASS |

---

## performance-glitch-user-cart.spec.ts

**Suite:** `Comportamiento con performance_glitch_user`  
**beforeEach:** Login con `performance_glitch_user` / `secret_sauce`. Timeout extendido a 15 s.

> **Nota QA:** Este usuario introduce latencia artificial. Todas las aserciones usan `{ timeout: 15000 }`.

| # | Nombre del test | Estado esperado |
|---|---|---|
| 1 | debería añadir un producto al carrito con performance_glitch_user a pesar de la latencia | PASS |
| 2 | debería completar el flujo añadir-navegar-verificar carrito con performance_glitch_user | PASS |

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
