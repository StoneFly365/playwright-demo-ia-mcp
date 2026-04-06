import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';

test.describe('Shopping Cart', () => {
  test('should add the Sauce Labs Bolt T-Shirt to the cart after login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');

    await expect(page).toHaveURL('/inventory.html');

    await inventoryPage.addToCart('sauce-labs-bolt-t-shirt');

    await expect(inventoryPage.cartBadge).toHaveText('1');
  });
});
