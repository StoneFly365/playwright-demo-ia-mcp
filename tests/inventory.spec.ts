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
    // ⚠️ FALLO INTENCIONADO: Cambiar 5 por 6 para revertir
    await expect(
      inventoryPage.inventoryItems,
      'El inventario debería mostrar exactamente 6 productos disponibles',
    ).toHaveCount(5);
  });

  test('debería ordenar los productos por nombre de Z a A', async () => {
    await inventoryPage.sortBy('za');
    const names = await inventoryPage.getProductNames();

    expect(
      names,
      'Deberían recuperarse los 6 nombres de producto antes de validar el orden — si hay menos, getProductNames() ha fallado silenciosamente',
    ).toHaveLength(6);

    const sorted = [...names].sort((a, b) => b.localeCompare(a));
    expect(
      names,
      'Los productos deberían estar ordenados alfabéticamente de Z a A tras seleccionar ese criterio de ordenación',
    ).toEqual(sorted);
  });

  test('debería ordenar los productos por precio de menor a mayor', async () => {
    await inventoryPage.sortBy('lohi');
    const prices = await inventoryPage.getProductPrices();
    const values = prices.map(p => parseFloat(p.replace('$', '')));

    expect(
      values,
      'Deberían recuperarse los 6 precios de producto antes de validar el orden — si hay menos, getProductPrices() ha fallado silenciosamente',
    ).toHaveLength(6);

    const sorted = [...values].sort((a, b) => a - b);
    expect(
      values,
      'Los productos deberían estar ordenados por precio de menor a mayor tras seleccionar ese criterio de ordenación',
    ).toEqual(sorted);
  });

  test('debería ordenar los productos por precio de mayor a menor', async () => {
    await inventoryPage.sortBy('hilo');
    const prices = await inventoryPage.getProductPrices();
    const values = prices.map(p => parseFloat(p.replace('$', '')));

    expect(
      values,
      'Deberían recuperarse los 6 precios de producto antes de validar el orden — si hay menos, getProductPrices() ha fallado silenciosamente',
    ).toHaveLength(6);

    const sorted = [...values].sort((a, b) => b - a);
    expect(
      values,
      'Los productos deberían estar ordenados por precio de mayor a menor tras seleccionar ese criterio de ordenación',
    ).toEqual(sorted);
  });

  test('debería navegar al detalle del producto al hacer clic en el nombre', async ({ page }) => {
    await inventoryPage.navigateToProduct('Sauce Labs Backpack');

    await expect(
      page,
      'El usuario debería ser redirigido a la página de detalle del producto al hacer clic en el nombre de la Sauce Labs Backpack',
    ).toHaveURL(/inventory-item\.html/);
  });
});
