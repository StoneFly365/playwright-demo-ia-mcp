// spec: specs/disenos/HU-001.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../fixtures/scenarios';
import { LoginPage } from '../../pages/login.page';
import { InventoryPage } from '../../pages/inventory.page';
import { CartPage } from '../../pages/cart.page';

test.describe('HU-001 · Añadir productos al carrito y revisarlo antes de pagar', () => {
  test('TC-06 Quitar un producto desde el carrito lo elimina y baja el contador', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.addToCart('sauce-labs-bike-light');

    // 1. Abrir el carrito
    await inventoryPage.navigateToCart();

    // 2. Pulsar «Remove» de Sauce Labs Backpack
    await cartPage.removeItem('sauce-labs-backpack');

    // Backpack desaparece de la lista
    await expect(
      page.locator('[data-test="inventory-item-name"]', { hasText: 'Sauce Labs Backpack' }),
      'La Sauce Labs Backpack no debería aparecer en la lista del carrito',
    ).toHaveCount(0);

    // El contador muestra 1
    await expect(
      inventoryPage.cartBadge,
      'El contador del carrito debería mostrar 1',
    ).toHaveText('1');
  });
});
