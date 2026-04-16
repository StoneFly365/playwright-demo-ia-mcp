import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test.describe('Test group', () => {
  test('seed', async ({ page }) => {
    // generate code here.
    let loginPage: LoginPage;
    
    loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login("standard_user", "secret_sauce");

    await expect(
    page,
    'El usuario debería ser redirigido a la página de inventario tras un login exitoso',
    ).toHaveURL(/.*\/inventory\.html$/);
  });
});
