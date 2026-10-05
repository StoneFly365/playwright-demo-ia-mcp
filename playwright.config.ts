import { defineConfig, devices } from '@playwright/test';

/** Carpetas de tests/ que tienen proyecto propio más abajo. */
const APPS = ['**/finanzas-churritos/**'];

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: process.env.CI
    ? [['github'], ['html'], ['json', { outputFile: 'test-results.json' }]]
    : [['html'], ['json', { outputFile: 'test-results.json' }]],
  use: {
    baseURL: process.env.BASE_URL,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    // Proyectos genéricos (seed de los agentes y apps sin proyecto propio).
    // Cada app con proyecto propio se excluye aquí para no ejecutarla sin su baseURL.
    {
      name: 'chromium',
      testIgnore: APPS,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testIgnore: APPS,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testIgnore: APPS,
      use: { ...devices['Desktop Safari'] },
    },

    // Un proyecto por aplicación bajo prueba: tests/<app>/ + su baseURL y contexto.
    {
      name: 'finanzas-churritos',
      testDir: './tests/finanzas-churritos',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://finanzas-churritos.netlify.app',
        locale: 'es-ES',
        timezoneId: 'Europe/Madrid',
        // Evita que una caché antigua del service worker sirva otra versión de la app.
        serviceWorkers: 'block',
      },
    },
  ],
});
