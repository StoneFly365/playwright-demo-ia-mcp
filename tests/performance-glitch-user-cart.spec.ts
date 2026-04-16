import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';

test.describe('Comportamiento con performance_glitch_user', () => {
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    await loginPage.navigate();
    await loginPage.login('performance_glitch_user', 'secret_sauce');
    await expect(
      page,
      'El performance_glitch_user debería ser redirigido al inventario, aunque con mayor latencia',
    ).toHaveURL(/.*\/inventory\.html$/, { timeout: 15000 });
  });

  test('debería añadir un producto al carrito con performance_glitch_user a pesar de la latencia', async () => {
    await inventoryPage.addToCart('sauce-labs-backpack');

    await expect(
      inventoryPage.cartBadge,
      'El badge debería mostrar 1 tras añadir la Sauce Labs Backpack con performance_glitch_user, aunque puede tardar más de lo habitual',
    ).toHaveText('1', { timeout: 15000 });
  });

  test('debería completar el flujo añadir-navegar-verificar carrito con performance_glitch_user', async ({ page }) => {
    await inventoryPage.addToCart('sauce-labs-bolt-t-shirt');
    await inventoryPage.navigateToCart();

    await expect(
      page.locator('.cart_item'),
      'El carrito debería contener 1 ítem tras añadir la Sauce Labs Bolt T-Shirt con performance_glitch_user',
    ).toHaveCount(1, { timeout: 15000 });
    await expect(
      page.locator('[data-test="inventory-item-name"]'),
      'El nombre del producto en el carrito debería ser "Sauce Labs Bolt T-Shirt" con performance_glitch_user',
    ).toContainText('Sauce Labs Bolt T-Shirt', { timeout: 15000 });
  });
});
