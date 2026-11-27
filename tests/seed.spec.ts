import { test, expect } from '../fixtures/test';

// Punto de arranque de los agentes planner y generator: el MCP ejecuta este test
// y les entrega la página abierta. Cuando la app pida login, el seed debe dejar la sesión iniciada.
test.describe('Seed', () => {
  test('seed', async ({ page }) => {
    await page.goto('/');

    await expect(page, 'El seed debería abrir la aplicación en BASE_URL').toHaveURL(/.+/);
  });
});
