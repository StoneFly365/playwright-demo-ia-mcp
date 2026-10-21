# 🩹 Posibles Correcciones – Playwright E2E

## Resumen de fallos agrupados

| Grupo | Tipo | Pruebas afectadas | Error principal |
|-------|------|------------------|-----------------|
| G001 | 🧪 test_roto | 3 | Error: El badge debería mostrar 4 tras añadir cuatro productos distintos al ca… |
| G002 | 🧪 test_roto | 2 | Error: El usuario debería ser redirigido a la página de login tras cerrar sesi… |
| G003 | 🧪 test_roto | 1 | Error: El carrito debería contener exactamente 2 ítems tras añadir la Backpac… |
| G004 | 🧪 test_roto | 1 | Error: El mensaje de error debería indicar que el nombre es obligatorio para c… |
| G005 | 🧪 test_roto | 1 | Error: El inventario debería mostrar exactamente 6 productos disponibles |
| G006 | 🧪 test_roto | 1 | Error: El usuario debería ser redirigido a la página de inventario tras un log… |
| G007 | 🧪 test_roto | 1 | Error: El badge del carrito no debería ser visible tras eliminar el producto d… |

## Correcciones por grupo

### G001 – test_roto – Error: El badge debería mostrar 4 tras añadir cuatro productos distintos al carrito

🔍 **Diagnóstico:** El título y el mensaje dicen que el badge debe mostrar 4, pero el test afirma `toHaveText('3')`. La página muestra "Cart, 4 items" y el badge con "4", coherente con 4 productos añadidos (confianza: alta).

🔧 **Pasos para corregir:**
1. En `cart-badge.spec.ts:38`, cambiar la expectativa de `'3'` a `'4'`.
2. Revisar `inventory-add-to-cart.spec.ts:60` y `product-detail-add-to-cart.spec.ts:54`, que usan el mismo locator `[data-test="shopping-cart-badge"]`, y comprobar que el valor esperado coincide con el número de productos que añade cada uno.

🧪 **Tests afectados:**
- debería mostrar badge con valor 4 al añadir cuatro productos distintos
- debería añadir los 6 productos al carrito y mostrar badge con valor 6
- debería añadir la Sauce Labs Onesie al carrito desde su página de detalle (id=2)

---

### G002 – test_roto – Error: El usuario debería ser redirigido a la página de login tras cerrar sesión

🔍 **Diagnóstico:** El test espera `https://www.saucedemo.com/inventory.html` tras cerrar sesión, pero la aplicación redirige a `https://www.saucedemo.com/`. `page_context` muestra el formulario de login en esa URL, que es el comportamiento normal de logout (confianza: alta).

🔧 **Pasos para corregir:**
1. En `menu.spec.ts:25`, cambiar la URL esperada a `https://www.saucedemo.com/`.
2. Revisar `route-protection.spec.ts:30`, que aplica la misma expectativa de URL, y corregirla si el caso lo requiere.

🧪 **Tests afectados:**
- debería cerrar sesión al pulsar Logout
- debería redirigir al login si se accede a /checkout-step-one.html sin sesión

---

### G003 – test_roto – Error: El carrito debería contener exactamente 2 ítems tras añadir la Backpack y la Fleece Jacket

🔍 **Diagnóstico:** El mensaje dice que el carrito debe tener exactamente 2 ítems, pero el código afirma `toHaveCount(3)`. `page_context` muestra dos ítems (Sauce Labs Backpack y Sauce Labs Fleece Jacket) y el badge "Cart, 2 items" (confianza: alta).

🔧 **Pasos para corregir:**
1. En `cart-sync.spec.ts:30`, cambiar `toHaveCount(3)` por `toHaveCount(2)`.

🧪 **Tests afectados:**
- debería mostrar los productos añadidos desde el inventario en la página del carrito

---

### G004 – test_roto – Error: El mensaje de error debería indicar que el nombre es obligatorio para continuar con el checkout

🔍 **Diagnóstico:** El test espera "Last Name is required" en un test cuyo título habla de "el nombre obligatorio", pero la página muestra "Error: First Name is required" y el campo First Name está vacío, mientras Last Name y Zip sí están rellenos. La aplicación valida correctamente (confianza: alta).

🔧 **Pasos para corregir:**
1. En `checkout.spec.ts:51`, cambiar el texto esperado a "First Name is required".
2. Revisar que el título del test indique el campo concreto que se deja vacío, para que coincida con la aserción.

🧪 **Tests afectados:**
- debería mostrar error si el nombre es obligatorio

---

### G005 – test_roto – Error: El inventario debería mostrar exactamente 6 productos disponibles

🔍 **Diagnóstico:** El título dice "debería mostrar 6 productos" y el mensaje dice "exactamente 6", pero el código afirma `toHaveCount(5)`. La página muestra 6 elementos de inventario, lo que coincide con el título (confianza: alta).

🔧 **Pasos para corregir:**
1. En `inventory.spec.ts:20`, cambiar `toHaveCount(5)` por `toHaveCount(6)`.

🧪 **Tests afectados:**
- debería mostrar 6 productos en el inventario

---

### G006 – test_roto – Error: El usuario debería ser redirigido a la página de inventario tras un login exitoso

🔍 **Diagnóstico:** El test espera una URL que termina en `/home.html`, pero el login correcto lleva a `https://www.saucedemo.com/inventory.html`, y `page_context` muestra la lista de Products. La aplicación nunca usa `/home.html` (confianza: alta).

🔧 **Pasos para corregir:**
1. En `login.spec.ts:19`, cambiar el patrón de URL a `/inventory\.html$/`.

🧪 **Tests afectados:**
- debería redirigir a la página de inventario con login exitoso

---

### G007 – test_roto – Error: El badge del carrito no debería ser visible tras eliminar el producto desde el detalle

🔍 **Diagnóstico:** El título dice que el badge no debe ser visible tras eliminar el producto, pero el código afirma `toHaveText('1')`. `page_context` muestra "Cart, empty" sin badge, que es el comportamiento correcto de la aplicación. El error "element(s) not found" confirma que el badge no existe (confianza: alta).

🔧 **Pasos para corregir:**
1. En `product-detail.spec.ts:52`, sustituir `toHaveText('1')` por `toHaveCount(0)` o `not.toBeVisible()`, según lo que el título quiera comprobar.
2. Confirmar que el título y la aserción describen lo mismo: badge ausente o no visible.

🧪 **Tests afectados:**
- debería eliminar el producto del carrito desde el detalle

---
