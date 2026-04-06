import { test, expect } from '@playwright/test';

test.describe('Protección de rutas', () => {
  test('debería redirigir al login si se accede a /inventory.html sin sesión', async ({ page }) => {
    await page.goto('/inventory.html');

    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });

  test('debería redirigir al login si se accede a /cart.html sin sesión', async ({ page }) => {
    await page.goto('/cart.html');

    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });

  test('debería redirigir al login si se accede a /checkout-step-one.html sin sesión', async ({ page }) => {
    await page.goto('/checkout-step-one.html');

    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });
});
