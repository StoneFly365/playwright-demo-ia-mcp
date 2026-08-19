import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../../pages/login.page';
import { InventoryPage } from '../../../../pages/inventory.page';
import { MenuPage } from '../../../../pages/menu.page';

/**
 * Módulo 7 — Reto final
 *
 * Todo lo aburrido está hecho: imports, describe, login y los Page Objects listos.
 * Tú escribes el cuerpo de UN test y lo analizas.
 *
 * PASOS
 *   1. Quita el `.skip`.
 *   2. Escribe el escenario que elegiste en el paso 3 del reto.
 *   3. Ejecuta:
 *      npx playwright test -c learning/student/sandbox/ruta-qa --project=chromium 07-reset-app-state.spec.ts
 *   4. Pase o falle, analiza el resultado. Las tres salidas posibles están en el enunciado.
 *
 * Métodos disponibles:
 *   InventoryPage: addToCart(id), removeFromCart(id), navigateToCart(), cartBadge, inventoryItems
 *   MenuPage:      resetAppState(), logout()
 *
 * Ids de producto para addToCart(): 'sauce-labs-backpack', 'sauce-labs-bike-light',
 * 'sauce-labs-bolt-t-shirt', 'sauce-labs-fleece-jacket', 'sauce-labs-onesie'
 */
test.describe('Reset App State', () => {
  let inventoryPage: InventoryPage;
  let menuPage: MenuPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    menuPage = new MenuPage(page);
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
  });

  test.skip('el reset deja la aplicación como recién iniciada', async () => {
    // TODO: tu test aquí.
    //
    // El escenario de más valor es el hueco real de cobertura:
    // hacer el reset desde una pantalla que NO sea el inventario.
    //
    // Recuerda: nunca ajustes una aserción para llegar a verde.
    expect(menuPage).toBeDefined();
    expect(inventoryPage).toBeDefined();
  });
});
