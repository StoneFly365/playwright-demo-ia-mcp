import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../../pages/login.page';

/**
 * Módulo 0 — comprobación de entorno.
 *
 * Este test existe para que tu primer contacto con Playwright sea verde, no rojo.
 * Comprueba tres cosas a la vez:
 *   1. El sandbox está bien configurado (baseURL y testIdAttribute).
 *   2. Hay acceso de red a la aplicación bajo prueba.
 *   3. Los Page Objects del proyecto se importan correctamente desde aquí.
 *
 * Ejecútalo con:
 *   npx playwright test -c learning/student/sandbox/ruta-qa --project=chromium
 *
 * Resultado esperado: 1 passed
 */
test('el entorno de la Ruta QA está listo', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();

  await expect(
    page.getByTestId('login-button'),
    'El botón de login debería ser visible: confirma acceso a la aplicación y que testIdAttribute está bien configurado',
  ).toBeVisible();
});
