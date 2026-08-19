import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración del SANDBOX de la Ruta QA — 6 horas.
 *
 * Es independiente de la configuración raíz del proyecto (`playwright.config.ts`),
 * que apunta a `./tests`, y de las de los módulos 00 y 01. Un alumno de la ruta no
 * puede romper la suite del proyecto ni la de otro módulo.
 *
 * Uso:
 *   npx playwright test -c learning/student/sandbox/ruta-qa --project=chromium
 */
export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'https://www.saucedemo.com',

    // La aplicación usa `data-test`, no el `data-testid` que Playwright asume por
    // defecto. Sin esta línea, `getByTestId('username')` resuelve 0 elementos.
    testIdAttribute: 'data-test',

    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
