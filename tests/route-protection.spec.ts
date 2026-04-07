import { test, expect } from '@playwright/test';

test.describe('Protección de rutas', () => {
  test('debería redirigir al login si se accede a /inventory.html sin sesión', async ({ page }) => {
    await page.goto('/inventory.html');

    await expect(
      page,
      'El usuario sin sesión debería ser redirigido a la página de login al intentar acceder directamente a /inventory.html',
    ).toHaveURL('/');
    await expect(
      page.locator('[data-test="login-button"]'),
      'El botón de login debería ser visible, confirmando que el acceso a /inventory.html está protegido sin sesión activa',
    ).toBeVisible();
  });

  test('debería redirigir al login si se accede a /cart.html sin sesión', async ({ page }) => {
    await page.goto('/cart.html');

    await expect(
      page,
      'El usuario sin sesión debería ser redirigido a la página de login al intentar acceder directamente a /cart.html',
    ).toHaveURL('/');
    await expect(
      page.locator('[data-test="login-button"]'),
      'El botón de login debería ser visible, confirmando que el acceso a /cart.html está protegido sin sesión activa',
    ).toBeVisible();
  });

  test('debería redirigir al login si se accede a /checkout-step-one.html sin sesión', async ({ page }) => {
    await page.goto('/checkout-step-one.html');

    await expect(
      page,
      'El usuario sin sesión debería ser redirigido a la página de login al intentar acceder directamente a /checkout-step-one.html',
    ).toHaveURL('/');
    await expect(
      page.locator('[data-test="login-button"]'),
      'El botón de login debería ser visible, confirmando que el acceso a /checkout-step-one.html está protegido sin sesión activa',
    ).toBeVisible();
  });
});
