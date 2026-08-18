import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../../pages/login.page';
import { InventoryPage } from '../../../../pages/inventory.page';
import { CartPage } from '../../../../pages/cart.page';

/**
 * LAB 5 — El test que a veces pasa (TROUBLESHOOT)
 *
 * Este fichero llega en ROJO: 2 fallos, de causas DISTINTAS.
 * Ninguno de los dos es un fallo de la aplicación.
 *
 * REGLA: las aserciones describen el comportamiento correcto y NO se tocan.
 *        Diagnostica primero, corrige después, y nunca al revés.
 *
 * Enunciado: learning/modules/01-playwright-fundamentals/labs/lab-5-troubleshoot.md
 */

test.describe('01 · Lab 5 — Diagnóstico', () => {
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
  });

  test('caso A — debería abrir el detalle de la Sauce Labs Backpack desde el catálogo', async ({ page }) => {
    await page.getByRole('link', { name: 'Sauce Labs Backpack' }).click();

    await expect(
      page,
      'El usuario debería llegar a la ficha del producto al pulsar sobre la Sauce Labs Backpack en el catálogo',
    ).toHaveURL(/inventory-item\.html/);
  });

  test('caso B — debería mostrar en el carrito el único producto añadido', async () => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.navigateToCart();

    await expect(
      cartPage.cartItems,
      'El carrito debería contener exactamente 1 línea de producto tras añadir la Sauce Labs Backpack',
    ).toHaveCount(1);
  });
});
