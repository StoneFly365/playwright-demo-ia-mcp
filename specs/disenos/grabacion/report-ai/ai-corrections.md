# 🩹 Posibles Correcciones – Playwright E2E

## Resumen de fallos agrupados

| Grupo | Tipo | Pruebas afectadas | Error principal |
|-------|------|------------------|-----------------|
| G001 | 🧪 test_roto | 1 | Error: El carrito debería mostrar «Subtotal: $39.98» |

## Correcciones por grupo

### G001 – test_roto – Error: El carrito debería mostrar «Subtotal: $39.98»

🔍 **Diagnóstico:** El locator `[data-test="cart-subtotal"]` no existe. La página muestra un carrito coherente (2 productos, $29.99 y $9.99, suma 39.98) con botones Continue Shopping y Checkout, pero ningún elemento ni texto de subtotal. El test exige un elemento que la página no muestra. (confianza: media)

🔧 **Pasos para corregir:**
1. Confirmar con negocio si el subtotal forma parte de la HU antes de tocar nada.
2. Si no forma parte: corregir el test. Quitar la aserción del subtotal o ajustarla al alcance real de la HU.
3. Si sí forma parte: no modificar el test. Abrir bug a producto por subtotal ausente en el carrito y dejar el test fallando como evidencia.

🧪 **Tests afectados:** TC-05 Mostrar el subtotal de los productos en el carrito

---
