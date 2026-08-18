# Solución — Challenge 1 · Compra completa con validación de importes

**Verificado:** los 3 tests de referencia en verde en Chromium contra la aplicación real. Los importes están medidos, no calculados sobre el papel.

> **Es una** solución de referencia, **no la** solución. El Challenge se corrige sobre la justificación: un reparto distinto con buenos argumentos vale igual o más.

---

## Implementación de referencia

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../../pages/login.page';
import { InventoryPage } from '../../../../pages/inventory.page';
import { CartPage } from '../../../../pages/cart.page';
import { CheckoutPage } from '../../../../pages/checkout.page';

/** Convierte el texto de un importe de la UI ('$29.99', 'Total: $32.39') en número. */
function aNumero(texto: string): number {
  return parseFloat(texto.replace(/[^0-9.]/g, ''));
}

test.describe('Challenge 1 — Compra completa', () => {
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
  });

  test('debería completar la compra de dos productos con los importes correctamente desglosados', async ({ page }) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.addToCart('sauce-labs-bike-light');
    await inventoryPage.navigateToCart();

    // El subtotal esperado se calcula con los precios que muestra el CARRITO,
    // y se comprueba contra el resumen del PASO 2: dos pantallas distintas.
    const precios = (await page.getByTestId('inventory-item-price').allTextContents()).map(aNumero);
    const subtotal = precios.reduce((suma, precio) => suma + precio, 0);
    const impuesto = Math.round(subtotal * 8) / 100;   // 8 %, a 2 decimales
    const total = subtotal + impuesto;

    await cartPage.checkout();
    await checkoutPage.fillInfo('Ana', 'Pérez', '28001');
    await checkoutPage.continue();

    await expect(
      checkoutPage.subtotalLabel,
      'El subtotal del pedido debería ser la suma de los precios de los productos del carrito',
    ).toHaveText(`Item total: $${subtotal.toFixed(2)}`);
    await expect(
      checkoutPage.taxLabel,
      'Los impuestos deberían ser el 8 % del subtotal, redondeado a dos decimales',
    ).toHaveText(`Tax: $${impuesto.toFixed(2)}`);
    await expect(
      checkoutPage.totalLabel,
      'El total del pedido debería ser el subtotal más los impuestos',
    ).toHaveText(`Total: $${total.toFixed(2)}`);

    await checkoutPage.finish();

    await expect(
      page.getByRole('heading', { name: 'Thank you for your order!' }),
      'El cliente debería ver la confirmación de su pedido tras finalizar la compra',
    ).toBeVisible();
  });

  test('debería calcular correctamente los importes del producto más barato del catálogo', async ({ page }) => {
    // Caso límite: el importe más pequeño posible, donde el redondeo del
    // impuesto es más sensible ($7.99 × 8 % = 0,6392 → $0.64).
    await page
      .getByTestId('inventory-item')
      .filter({ hasText: 'Sauce Labs Onesie' })
      .getByRole('button', { name: 'Add to cart' })
      .click();

    await inventoryPage.navigateToCart();
    await cartPage.checkout();
    await checkoutPage.fillInfo('Ana', 'Pérez', '28001');
    await checkoutPage.continue();

    await expect(
      checkoutPage.totalLabel,
      'El total de un pedido de 7,99 dólares debería ser 8,63 tras aplicar el 8 % de impuestos',
    ).toHaveText('Total: $8.63');
  });

  test('no debería permitir continuar el checkout sin los apellidos del cliente', async () => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.navigateToCart();
    await cartPage.checkout();
    await checkoutPage.fillInfo('Ana', '', '28001');
    await checkoutPage.continue();

    await expect(
      checkoutPage.errorMessage,
      'La aplicación debería avisar al cliente de que los apellidos son obligatorios para continuar con el pedido',
    ).toContainText('Last Name is required');
  });
});
```

## Importes verificados

| Carrito | Subtotal | Impuestos | Total |
|---|---|---|---|
| Backpack | `Item total: $29.99` | `Tax: $2.40` | `Total: $32.39` |
| Backpack + Bike Light | `Item total: $39.98` | `Tax: $3.20` | `Total: $43.18` |
| Onesie *(caso límite)* | `Item total: $7.99` | `Tax: $0.64` | `Total: $8.63` |

El 8 % se confirma en los tres: `39.98 × 0,08 = 3,1984 → 3,20`; `7,99 × 0,08 = 0,6392 → 0,64`.

## Decisiones de la referencia, y por qué

| Decisión | Razón | Alternativa igualmente válida |
|---|---|---|
| **3 tests**, no uno | Cada uno cubre un riesgo distinto: flujo feliz con importes, caso límite de redondeo, validación negativa. Un fallo en el negativo no oculta el estado del flujo feliz | 4-5 tests, separando la confirmación |
| Importes **calculados**, no fijos | Sobreviven a un cambio de precios; el test verifica **la regla de negocio** (8 %), no un valor | Valores fijos: más estricto y más frágil. Defendible si el negocio congela precios |
| El subtotal se calcula con precios leídos del **carrito** y se verifica en el **paso 2** | Son dos pantallas distintas: no es leer la respuesta del mismo sitio donde se pregunta | Leer los precios del catálogo antes de añadir |
| `Math.round(subtotal * 8) / 100` | Equivale a redondear a 2 decimales evitando el error de coma flotante | `parseFloat((subtotal * 0.08).toFixed(2))` |
| Aserciones sobre el **texto completo** del importe | Detecta cambios de formato, no solo de valor | Comparar solo la parte numérica con `aNumero` |
| Estrategias de locator: rol, testId y acotado | Cubre AC4 con tres criterios distintos y justificables | Cualquier combinación de tres |

## `decisiones.md` — qué debe contener una entrega sólida

**Riesgos que debe nombrar** *(al menos dos)*:

- El cálculo del impuesto está **codificado en el test**: si el negocio cambia el tipo, el test falla sin que haya bug. Es deliberado — se quiere que falle — pero hay que saberlo.
- Los tests dependen del catálogo: si desaparece la Onesie, el caso límite se cae.
- `standard_user` es el único usuario sin bugs conocidos; con `problem_user` estos tests no valdrían.

**Qué NO automatizar, con justificación** *(la pregunta que más discrimina)*:

| No automatizado | Por qué |
|---|---|
| El aspecto visual del desglose de importes | Coste alto, valor bajo, y se rompe con cualquier cambio de estilo. Inspección manual o pruebas visuales dedicadas |
| Todas las combinaciones de campos vacíos del formulario | Tres campos dan 7 combinaciones y todas ejercitan la misma regla. Uno o dos casos representativos bastan |
| Cada uno de los 6 productos por separado | El cálculo del impuesto no depende del producto; multiplicar por 6 no añade cobertura |
| El envío del correo de confirmación | Fuera del alcance de la interfaz web; es prueba de integración |

Una entrega que solo diga "no me ha dado tiempo a automatizar X" **no cumple AC6**: la pregunta es qué has decidido no automatizar **y por qué no merece la pena**.

## Rúbrica de corrección

| Criterio | Peso | Sólido | Insuficiente |
|---|---|---|---|
| AC1-AC5 | 35% | Flujo completo, importes por valor, negativo, límite, 3 navegadores | Solo el flujo feliz, o importes con `toBeVisible` |
| Locators y justificación (AC4) | 25% | Cada uno con criterio y alternativa descartada | "Usé data-test porque es lo que usa el proyecto" |
| Aserciones y mensajes | 20% | La aserción adecuada; mensajes de negocio | Todo `toBeVisible`; mensajes que describen el DOM |
| Justificación escrita (AC6) | 20% | Reparto, riesgos, **qué no ha automatizado** y **declaración de reutilización** de `tests/checkout.spec.ts` | Falta el "qué no", falta la declaración, o son excusas de tiempo |

**Descalificatorios:** cualquier espera explícita; haber tocado `tests/` o `pages/`; leer el valor esperado de la misma pantalla que se verifica.

## Errores habituales

| Error | Cómo responder |
|---|---|
| Calcula el total leyéndolo del propio resumen del paso 2 | Es el error del Lab 2: el test no verifica nada. Que lea los precios del carrito |
| Copia el `beforeEach` de `tests/checkout.spec.ts` con el producto ya añadido | Reutilizar el recorrido es **legítimo y esperable**; copiarlo tal cual deja el flujo empezado a mitad (AC1 sin cumplir) y, si no aparece en la declaración de reutilización de `decisiones.md`, AC6 tampoco. Lo que nunca puede venir copiado es la verificación de importes: no existe en el repositorio |
| Un solo test gigante con 15 aserciones | Que se pregunte qué sabe cuando falla la aserción 3 |
| Redondea con `toFixed` sobre el número sin más y le sale `$3.19` | Bienvenido a la coma flotante — módulo 00, Lab 3 |
| Usa `.first()` para el producto del caso límite | Penalizado igual que en el Lab 5 |

## Cómo validar

```bash
npx playwright test -c learning/student/sandbox/01-playwright challenge-1-compra.spec.ts
# 9 passed (3 tests × 3 navegadores)

grep -n "waitForTimeout\|waitForSelector\|waitForLoadState" learning/student/sandbox/01-playwright/challenge-1-compra.spec.ts
# sin resultados

npx tsc --noEmit
git diff --stat tests/ pages/    # vacío
```
