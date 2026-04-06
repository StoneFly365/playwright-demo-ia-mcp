import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('debería redirigir a la página de inventario con login exitoso', async ({ page }) => {
    await loginPage.login('standard_user', 'secret_sauce');

    await expect(page).toHaveURL('/inventory.html');
  });

  test('debería mostrar error cuando las credenciales no corresponden a ningún usuario', async () => {
    await loginPage.login('wrong_user', 'wrong_password');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(
      'Username and password do not match any user in this service',
    );
  });

  test('debería mostrar error cuando el usuario está bloqueado', async () => {
    await loginPage.login('locked_out_user', 'secret_sauce');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Sorry, this user has been locked out.');
  });

  test('debería mostrar error cuando el campo de usuario está vacío', async () => {
    await loginPage.login('', 'secret_sauce');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Username is required');
  });

  test('debería mostrar error cuando el campo de contraseña está vacío', async () => {
    await loginPage.login('standard_user', '');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Password is required');
  });

  test('debería mostrar error cuando ambos campos están vacíos', async () => {
    await loginPage.login('', '');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Username is required');
  });

  test('debería permitir acceder con el usuario problem_user', async ({ page }) => {
    await loginPage.login('problem_user', 'secret_sauce');

    await expect(page).toHaveURL('/inventory.html');
  });

  test('debería permitir acceder con el usuario performance_glitch_user', async ({ page }) => {
    await loginPage.login('performance_glitch_user', 'secret_sauce');

    await expect(page).toHaveURL('/inventory.html');
  });
});
