import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Login único con storageState. Con DEMO_SCENARIO no corre: los tests entran por el formulario
  // y el escenario cascade sigue tumbándolos todos.
  globalSetup: process.env.DEMO_SCENARIO ? undefined : './fixtures/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: process.env.CI
    ? [['github'], ['html'], ['json', { outputFile: 'test-results.json' }]]
    : [['html'], ['json', { outputFile: 'test-results.json' }]],
  use: {
    baseURL: 'https://www.saucedemo.com',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
