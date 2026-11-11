// spec: specs/disenos/HU-001.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../fixtures/scenarios';
import { LoginPage } from '../../pages/login.page';
import { InventoryPage } from '../../pages/inventory.page';

test.describe('HU-001 · Añadir productos al carrito y revisarlo antes de pagar', () => {
  test('TC-05 Mostrar el subtotal de los productos en el carrito', { tag: '@demo-fail' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.addToCart('sauce-labs-bike-light');

    // 1. Abrir /cart.html
    await inventoryPage.navigateToCart();
    await expect(page, 'La URL debería ser /cart.html').toHaveURL(/.*\/cart\.html$/);

    // Se muestra «Subtotal: $39.98» antes del botón Checkout
    // Nota: discrepancia D1 del plan; la app actual no muestra subtotal, este test fallará hasta que se implemente.
    await expect(
      page.locator('[data-test="cart-subtotal"]'),
      'El carrito debería mostrar «Subtotal: $39.98»',
    ).toHaveText('Subtotal: $39.98');
  });
});
