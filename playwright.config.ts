import { defineConfig, devices } from '@playwright/test';

// URL de la aplicación bajo prueba: BASE_URL en .env (local) o en la variable del repositorio (CI).
// Node 22 carga .env sin dependencias: process.loadEnvFile.
try {
  process.loadEnvFile();
} catch {
  // Sin .env: vale con las variables del entorno.
}
if (!process.env.BASE_URL) throw new Error('Falta BASE_URL: copia .env.example a .env y rellénala.');

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
