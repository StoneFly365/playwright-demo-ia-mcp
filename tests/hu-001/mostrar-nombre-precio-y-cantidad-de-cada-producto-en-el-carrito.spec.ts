// spec: specs/disenos/HU-001.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../fixtures/scenarios';
import { LoginPage } from '../../pages/login.page';
import { InventoryPage } from '../../pages/inventory.page';

test.describe('HU-001 · Añadir productos al carrito y revisarlo antes de pagar', () => {
  test('TC-04 Mostrar nombre, precio y cantidad de cada producto en el carrito', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.addToCart('sauce-labs-bike-light');

    // 1. Pulsar el icono del carrito
    await inventoryPage.navigateToCart();

    // Se ve Sauce Labs Backpack, $29.99, cantidad 1
    const backpack = page.locator('[data-test="inventory-item"]', { hasText: 'Sauce Labs Backpack' });
    await expect(
      backpack.locator('[data-test="inventory-item-name"]'),
      'El carrito debería mostrar el nombre Sauce Labs Backpack',
    ).toHaveText('Sauce Labs Backpack');
    await expect(
      backpack.locator('[data-test="inventory-item-price"]'),
      'El carrito debería mostrar el precio $29.99 de la Backpack',
    ).toHaveText('$29.99');
    await expect(
      backpack.locator('[data-test="item-quantity"]'),
      'El carrito debería mostrar cantidad 1 para la Backpack',
    ).toHaveText('1');

    // Se ve Sauce Labs Bike Light, $9.99, cantidad 1
    const bikeLight = page.locator('[data-test="inventory-item"]', { hasText: 'Sauce Labs Bike Light' });
    await expect(
      bikeLight.locator('[data-test="inventory-item-name"]'),
      'El carrito debería mostrar el nombre Sauce Labs Bike Light',
    ).toHaveText('Sauce Labs Bike Light');
    await expect(
      bikeLight.locator('[data-test="inventory-item-price"]'),
      'El carrito debería mostrar el precio $9.99 de la Bike Light',
    ).toHaveText('$9.99');
    await expect(
      bikeLight.locator('[data-test="item-quantity"]'),
      'El carrito debería mostrar cantidad 1 para la Bike Light',
    ).toHaveText('1');
  });
});
