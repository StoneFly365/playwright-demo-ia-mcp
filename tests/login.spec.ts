import { test, expect } from '../fixtures/scenarios';
import { LoginPage } from '../pages/login.page';

test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('TC-LOGIN-01 debería redirigir a la página de inventario con login exitoso', { tag: '@demo-fail' }, async ({ page }) => {
    await loginPage.login('standard_user', 'secret_sauce');

    // ⚠️ FALLO INTENCIONADO: Cambiar /home\.html$ por /inventory\.html$ para revertir
    await expect(
      page,
      'El usuario debería ser redirigido a la página de inventario tras un login exitoso',
    ).toHaveURL(/.*\/home\.html$/);
  });

  test('TC-LOGIN-02 debería mostrar error cuando las credenciales no corresponden a ningún usuario', async () => {
    await loginPage.login('wrong_user', 'wrong_password');

    await expect(
      loginPage.errorMessage,
      'El mensaje de error debería ser visible al introducir credenciales incorrectas',
    ).toBeVisible();
    await expect(
      loginPage.errorMessage,
      'El mensaje de error debería indicar que las credenciales no coinciden con ningún usuario registrado',
    ).toContainText('Username and password do not match any user in this service');
  });

  test('TC-LOGIN-03 debería mostrar error cuando el usuario está bloqueado', async () => {
    await loginPage.login('locked_out_user', 'secret_sauce');

    await expect(
      loginPage.errorMessage,
      'El mensaje de error debería ser visible al intentar acceder con un usuario bloqueado',
    ).toBeVisible();
    await expect(
      loginPage.errorMessage,
      'El mensaje de error debería indicar que el usuario está bloqueado y no puede acceder',
    ).toContainText('Sorry, this user has been locked out.');
  });

  test('TC-LOGIN-04 debería mostrar error cuando el campo de usuario está vacío', async () => {
    await loginPage.login('', 'secret_sauce');

    await expect(
      loginPage.errorMessage,
      'El mensaje de error debería ser visible cuando se envía el formulario con el campo de usuario vacío',
    ).toBeVisible();
    await expect(
      loginPage.errorMessage,
      'El mensaje de error debería indicar que el nombre de usuario es obligatorio',
    ).toContainText('Username is required');
  });

  test('TC-LOGIN-05 debería mostrar error cuando el campo de contraseña está vacío', async () => {
    await loginPage.login('standard_user', '');

    await expect(
      loginPage.errorMessage,
      'El mensaje de error debería ser visible cuando se envía el formulario con el campo de contraseña vacío',
    ).toBeVisible();
    await expect(
      loginPage.errorMessage,
      'El mensaje de error debería indicar que la contraseña es obligatoria',
    ).toContainText('Password is required');
  });

  test('TC-LOGIN-06 debería mostrar error cuando ambos campos están vacíos', async () => {
    await loginPage.login('', '');

    await expect(
      loginPage.errorMessage,
      'El mensaje de error debería ser visible cuando se envía el formulario completamente vacío',
    ).toBeVisible();
    await expect(
      loginPage.errorMessage,
      'El mensaje de error debería indicar que el nombre de usuario es obligatorio cuando ambos campos están vacíos',
    ).toContainText('Username is required');
  });

  test('TC-LOGIN-07 debería permitir acceder con el usuario problem_user', async ({ page }) => {
    await loginPage.login('problem_user', 'secret_sauce');

    await expect(
      page,
      'El usuario problem_user debería ser redirigido a la página de inventario tras el login',
    ).toHaveURL(/.*\/inventory\.html$/);
  });

  test('TC-LOGIN-08 debería permitir acceder con el usuario performance_glitch_user', async ({ page }) => {
    await loginPage.login('performance_glitch_user', 'secret_sauce');

    await expect(
      page,
      'El usuario performance_glitch_user debería ser redirigido a la página de inventario, aunque con mayor latencia de respuesta',
    ).toHaveURL(/.*\/inventory\.html$/);
  });
});
