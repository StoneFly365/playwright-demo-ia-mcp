import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../../pages/login.page';
import { InventoryPage } from '../../../../pages/inventory.page';

/**
 * Módulo 4 — Playwright + IA · Práctica 2
 *
 * La infraestructura ya está resuelta: imports, describe y login.
 * Tu trabajo es el cuerpo del test, con ayuda de la IA, y su revisión crítica.
 *
 * PASOS
 *   1. Quita el `.skip` de la línea del test.
 *   2. Genera el cuerpo con IA (prompt en el módulo 4).
 *   3. Revísalo con la lista de siete puntos ANTES de ejecutarlo.
 *   4. Ejecuta:
 *      npx playwright test -c learning/student/sandbox/ruta-qa --project=chromium 04-orden-az.spec.ts
 *
 * Métodos disponibles en InventoryPage:
 *   sortBy(option)        'az' | 'za' | 'lohi' | 'hilo'
 *   getProductNames()     Promise<string[]>
 *   getProductPrices()    Promise<string[]>
 */
test.describe('Inventario — ordenación', () => {
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
  });

  test.skip('debería ordenar los productos por nombre de la A a la Z', async () => {
    // TODO: tu test aquí.
    //
    // Recuerda:
    //   - Comprueba cuántos productos has recuperado ANTES de comprobar el orden.
    //   - No compares contra una lista de nombres escrita a mano.
    //   - Toda aserción con mensaje descriptivo, en lenguaje de negocio.
    expect(inventoryPage).toBeDefined();
  });
});
