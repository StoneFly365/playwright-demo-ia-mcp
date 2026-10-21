import { test, expect } from '../fixtures/scenarios';
import { LoginPage } from '../pages/login.page';

// Punto de arranque de los agentes planner y generator: el MCP ejecuta este test
// y les entrega la página con sesión iniciada en el inventario.
test.describe('Seed', () => {
  test('seed', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');

    await expect(
      page,
      'El seed debería dejar al usuario en el inventario con la sesión iniciada',
    ).toHaveURL(/.*\/inventory\.html$/);
  });
});
