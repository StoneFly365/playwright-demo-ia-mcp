// spec: specs/disenos/HU-001.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../fixtures/scenarios';
import { LoginPage } from '../../pages/login.page';
import { InventoryPage } from '../../pages/inventory.page';
import { CartPage } from '../../pages/cart.page';

test.describe('HU-001 · Añadir productos al carrito y revisarlo antes de pagar', () => {
  test('TC-07 Quitar el último producto deja el carrito vacío sin contador', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.addToCart('sauce-labs-backpack');

    // 1. Abrir el carrito
    await inventoryPage.navigateToCart();

    // 2. Pulsar «Remove» del único producto
    await cartPage.removeItem('sauce-labs-backpack');

    // La lista queda vacía
    await expect(
      page.locator('[data-test="inventory-item"]'),
      'La lista del carrito debería quedar vacía',
    ).toHaveCount(0);

    // No se muestra el contador del carrito
    await expect(
      inventoryPage.cartBadge,
      'El contador del carrito no debería mostrarse',
    ).toHaveCount(0);
  });
});
