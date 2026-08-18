import { defineConfig } from '@playwright/test';

/**
 * Configuración del SANDBOX del Learning Lab (módulo 00).
 *
 * Es independiente de la configuración raíz del proyecto (`playwright.config.ts`),
 * que sigue apuntando a `./tests` y no ve nada de lo que hay aquí. Ejecutar el
 * sandbox no afecta a la suite del proyecto, y ejecutar la suite del proyecto no
 * ejecuta los ejercicios.
 *
 * Los ejercicios del módulo 00 son lógica pura: no usan la fixture `page`, así que
 * no se abre ningún navegador y no hace falta conexión a internet.
 *
 * Los del módulo 01 sí abren navegador, así que viven en `01-playwright/` con su
 * propia configuración (`baseURL`, projects y `testIdAttribute`) y quedan excluidos
 * aquí con `testIgnore`. Se ejecutan con:
 *   npx playwright test -c learning/student/sandbox/01-playwright --project=chromium
 *
 * Uso:
 *   npx playwright test -c learning/student/sandbox
 */
export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  testIgnore: '01-playwright/**',
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
});
