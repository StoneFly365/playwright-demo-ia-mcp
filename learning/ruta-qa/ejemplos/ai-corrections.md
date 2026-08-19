# 🩹 Posibles Correcciones – Playwright E2E

## Resumen de fallos agrupados

| Grupo | Pruebas afectadas | Error principal |
|-------|------------------|-----------------|
| 🛒 G001 | 4 | expect(locator).toHaveText — mismatch en shopping-cart-badge |
| 🔢 G002 | 2 | expect(locator).toHaveCount — mismatch en conteo de elementos |
| 🔀 G003 | 3 | expect(page).toHaveURL — mismatch en redirecciones |
| 📝 G004 | 1 | expect(locator).toContainText — mensaje de error no encontrado |

---

## Correcciones por grupo

### G001 – expect(locator).toHaveText fallido en shopping-cart-badge

🔍 **Hipótesis de causa:** El selector `[data-test="shopping-cart-badge"]` devuelve valor numérico desactualizado o el texto esperado no coincide con el actual (p.ej., espacios, formato o estado de la UI no sincronizado tras agregar productos).

🔧 **Pasos para corregir:**
1. Inspecciona el DOM live en `cart-badge.spec.ts:38` para verificar qué texto contiene realmente la badge (usar `page.screenshot()` antes del assert).
2. Confirma que el estado del carrito se actualiza en la UI tras cada `addToCart()` (añade espera explícita con `page.waitForTimeout(500)` o waitFor específico del cambio).
3. Verifica que no hay desfase cliente-servidor: el test espera el valor antes de que el back devuelva la actualización.

🧪 **Tests afectados:**
- debería mostrar badge con valor 4 al añadir cuatro productos distintos
- debería añadir los 6 productos al carrito y mostrar badge con valor 6
- debería añadir la Sauce Labs Onesie al carrito desde su página de detalle (id=2)
- debería eliminar el producto del carrito desde el detalle

---

### G002 – expect(locator).toHaveCount fallido

🔍 **Hipótesis de causa:** El selecteur que localiza elementos retorna conteo vacío o parcial; posible falta de sincronización con el DOM tras carga de productos o filtros no aplicados.

🔧 **Pasos para corregir:**
1. Revisa `cart-sync.spec.ts:30` e `inventory.spec.ts:20` para ver cuál es el selector exacto (p.ej., `locator('.inventory-item')`).
2. Añade `page.waitForLoadState('networkidle')` antes de contar, o espera explícita al selector con `.first().waitFor()`.
3. Comprueba que los datos de prueba están correctos en el backend (6 productos cargados en inventario).

🧪 **Tests afectados:**
- debería mostrar los productos añadidos desde el inventario en la página del carrito
- debería mostrar 6 productos en el inventario

---

### G003 – expect(page).toHaveURL fallido

🔍 **Hipótesis de causa:** Las redirecciones no ocurren como se espera (session/token inválido, ruta protegida no redirige al login, o Logout no limpia estado). Posible timeout antes de que la navegación termine.

🔧 **Pasos para corregir:**
1. Añade `page.waitForNavigation()` o `page.waitForURL()` inmediatamente después de cada acción que debe redirigir (login, logout, acceso sin sesión).
2. Verifica en backend que la sesión/token se valida correctamente: un login fallido no debería redirigir a inventario.
3. En route-protection, confirma que las cookies/localStorage se limpian al logout antes de intentar acceder a rutas protegidas.

🧪 **Tests afectados:**
- debería redirigir a la página de inventario con login exitoso
- debería cerrar sesión al pulsar Logout
- debería redirigir al login si se accede a /checkout-step-one.html sin sesión

---

### G004 – expect(locator).toContainText fallido en error

🔍 **Hipótesis de causa:** El elemento con `[data-test="error"]` no existe en el DOM, está oculto, o el validador del formulario no muestra el mensaje de error cuando el campo "nombre" está vacío.

🔧 **Pasos para corregir:**
1. Inspecciona checkout.spec.ts:51 y verifica que el formulario realmente intenta enviar sin nombre (no hay validación HTML que bloquee antes).
2. Comprueba que la respuesta del servidor retorna el error y lo renderiza en `[data-test="error"]` o equivalente.
3. Añade `page.waitForSelector('[data-test="error"]')` con timeout explícito para asegurar que el error aparece antes del assert.

🧪 **Tests afectados:**
- debería mostrar error si el nombre es obligatorio
