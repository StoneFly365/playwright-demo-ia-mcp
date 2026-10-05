import { test as base } from '@playwright/test';
import { FinanzasApp } from '../pages/finanzas-churritos/finanzas-app';
import { AHORA } from '../test-data/finanzas-churritos/fechas';

/**
 * Fixtures de la app finanzas-churritos.
 * - `page`: con el reloj fijado en AHORA antes de cualquier navegación (los temporizadores siguen corriendo).
 * - `app`: page object raíz.
 * Cada test recibe un contexto nuevo, y por tanto un IndexedDB vacío: no hay que limpiar nada.
 */
export const test = base.extend<{ app: FinanzasApp }>({
  page: async ({ page }, use) => {
    await page.clock.setFixedTime(AHORA);
    await use(page);
  },
  app: async ({ page }, use) => {
    await use(new FinanzasApp(page));
  },
});

export { expect } from '@playwright/test';
