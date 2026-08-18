import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración del SANDBOX del módulo 01.
 *
 * Es independiente de la configuración raíz del proyecto (`playwright.config.ts`),
 * que apunta a `./tests`, y también de la del módulo 00
 * (`learning/student/sandbox/playwright.config.ts`), que es lógica pura sin navegador.
 *
 * A diferencia del módulo 00, estos ejercicios SÍ abren navegador y SÍ necesitan
 * acceso a https://www.saucedemo.com.
 *
 * Uso:
 *   npx playwright test -c learning/student/sandbox/01-playwright --project=chromium
 */
export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'https://www.saucedemo.com',

    // El proyecto usa `data-test`, no el `data-testid` que Playwright asume por
    // defecto. Sin esta línea, `getByTestId('username')` resuelve 0 elementos.
    // Es el bloque 3.2 del Lab 3: una línea que sustituye a 66 selectores CSS.
    testIdAttribute: 'data-test',

    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
