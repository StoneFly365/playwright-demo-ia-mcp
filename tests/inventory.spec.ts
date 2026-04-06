import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';

test.describe('Inventario', () => {
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
  });

  test('debería mostrar 6 productos en el inventario', async () => {
    await expect(inventoryPage.inventoryItems).toHaveCount(6);
  });

  test('debería ordenar los productos por nombre de Z a A', async () => {
    await inventoryPage.sortBy('za');
    const names = await inventoryPage.getProductNames();
    const sorted = [...names].sort((a, b) => b.localeCompare(a));

    expect(names).toEqual(sorted);
  });

  test('debería ordenar los productos por precio de menor a mayor', async () => {
    await inventoryPage.sortBy('lohi');
    const prices = await inventoryPage.getProductPrices();
    const values = prices.map(p => parseFloat(p.replace('$', '')));
    const sorted = [...values].sort((a, b) => a - b);

    expect(values).toEqual(sorted);
  });

  test('debería ordenar los productos por precio de mayor a menor', async () => {
    await inventoryPage.sortBy('hilo');
    const prices = await inventoryPage.getProductPrices();
    const values = prices.map(p => parseFloat(p.replace('$', '')));
    const sorted = [...values].sort((a, b) => b - a);

    expect(values).toEqual(sorted);
  });

  test('debería navegar al detalle del producto al hacer clic en el nombre', async ({ page }) => {
    await inventoryPage.navigateToProduct('Sauce Labs Backpack');

    await expect(page).toHaveURL(/inventory-item\.html/);
  });
});
