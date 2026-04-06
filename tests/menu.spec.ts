import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { MenuPage } from '../pages/menu.page';

test.describe('Menú lateral', () => {
  let inventoryPage: InventoryPage;
  let menuPage: MenuPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    menuPage = new MenuPage(page);
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
  });

  test('debería cerrar sesión al pulsar Logout', async ({ page }) => {
    await menuPage.logout();

    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });

  test('debería resetear el estado del carrito al pulsar Reset App State', async () => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await menuPage.resetAppState();

    await expect(inventoryPage.cartBadge).not.toBeVisible();
  });
});
