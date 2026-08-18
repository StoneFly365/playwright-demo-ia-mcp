import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../../pages/login.page';
import { InventoryPage } from '../../../../pages/inventory.page';

/**
 * LAB 2 — Por qué nadie espera (MODIFY)
 *
 * Este fichero llega en VERDE. Los dos tests de abajo son el punto de partida:
 * no los borres, los usas como base para las tres versiones que pide el Lab.
 *
 * Enunciado: learning/modules/01-playwright-fundamentals/labs/lab-2-auto-waiting.md
 */

test.describe('01 · Lab 2 — Auto-waiting', () => {
  test('base: el badge muestra 1 tras añadir la Backpack', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.addToCart('sauce-labs-backpack');

    await expect(
      inventoryPage.cartBadge,
      'El contador del carrito debería mostrar 1 producto tras añadir la Sauce Labs Backpack',
    ).toHaveText('1');
  });

  test('base: el catálogo carga con performance_glitch_user', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.login('performance_glitch_user', 'secret_sauce');

    await expect(
      page.getByTestId('add-to-cart-sauce-labs-backpack'),
      'El botón de añadir al carrito debería estar disponible en el catálogo, aunque este usuario responda con latencia',
    ).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // TODO Paso 2 — copia el primer test como `con-espera-explicita` y añade un
  //               `await page.waitForTimeout(3000);` antes de la aserción.
  //               Anota la duración de ambos. ¿Qué has ganado?
  //
  // TODO Paso 3 — copia el segundo test como `sin-reintento` y sustituye la
  //               aserción web-first por `await locator.isVisible()` guardado en
  //               una constante, más un `expect(visible).toBe(true)`.
  //               Predice el resultado ANTES de ejecutarlo y anótalo.
  //
  // TODO Paso 4 — escribe en `02-conclusiones.md` las tres líneas que pide el Lab.
  // ---------------------------------------------------------------------------
});
