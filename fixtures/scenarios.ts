import { test as base, expect, Route } from '@playwright/test';

// Escenarios de fallo realistas para la demo del reporte IA (ROADMAP.md, fase 1).
// DEMO_SCENARIO elige uno; sin la variable la página no se toca y la suite se comporta igual.
const scenario = process.env.DEMO_SCENARIO;

export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    // Con un escenario activo cada fallo tarda 10 s y no los 30 del test. Con 5 s no le basta a performance_glitch_user.
    if (scenario) page.setDefaultTimeout(10_000);

    switch (scenario) {
      case undefined:
        break;
      case 'cascade':
        // Un cambio del frontend: el botón de login cambia de data-test y todos los tests que inician sesión caen.
        await page.addInitScript(() => {
          new MutationObserver(() => {
            document.querySelector('[data-test="login-button"]')?.setAttribute('data-test', 'login-submit');
          }).observe(document, { childList: true, subtree: true });
        });
        break;
      case 'bug':
        // Bug de producto: el badge del carrito cuenta un producto de más. Los tests están bien.
        await page.addInitScript(() => {
          new MutationObserver(() => {
            const badge = document.querySelector('[data-test="shopping-cart-badge"]');
            if (!badge) return;
            const wrong = String(JSON.parse(localStorage.getItem('cart-contents') ?? '[]').length + 1);
            if (badge.textContent !== wrong) badge.textContent = wrong;
          }).observe(document, { childList: true, subtree: true, characterData: true });
        });
        break;
      case 'flaky':
        // Los scripts tardan más que el timeout solo en el primer intento: falla y pasa al reintentar.
        if (testInfo.retry === 0) {
          await page.route('**/*.js', async (route: Route) => {
            await new Promise((resolve) => setTimeout(resolve, 15_000));
            await route.continue().catch(() => {}); // el test puede haber terminado ya
          });
        }
        break;
      case 'env':
        // Entorno caído: el servidor rechaza todas las conexiones.
        await page.route('**/*', (route) => route.abort('connectionrefused'));
        break;
      default:
        throw new Error(`DEMO_SCENARIO desconocido: "${scenario}". Valores: cascade, bug, flaky, env.`);
    }

    await use(page);
  },
});

export { expect };
