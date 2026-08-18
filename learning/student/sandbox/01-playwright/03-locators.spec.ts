import { test, expect } from '@playwright/test';

/**
 * LAB 3 — Elegir el locator correcto (MODIFY → DESIGN)
 *
 * Este fichero llega en VERDE con el bloque 3.1 ya resuelto: es el ejemplo de
 * referencia. Los bloques 3.2, 3.4, 3.5 y 3.6 los escribes tú.
 *
 * El entregable principal del Lab NO es este fichero: es tu tabla de decisión en
 * `03-decisiones.md`. Los tests son la prueba de que tus locators funcionan.
 *
 * Enunciado: learning/modules/01-playwright-fundamentals/labs/lab-3-locators.md
 */

test.describe('01 · Lab 3 — Bloque 3.1: el login, dos veces', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('login localizando por ROL', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Username' }).fill('standard_user');
    await page.getByRole('textbox', { name: 'Password' }).fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(
      page,
      'El usuario debería llegar al catálogo tras identificarse con credenciales válidas',
    ).toHaveURL(/.*\/inventory\.html$/);
  });

  test('login localizando por PLACEHOLDER', async ({ page }) => {
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(
      page,
      'El usuario debería llegar al catálogo tras identificarse con credenciales válidas',
    ).toHaveURL(/.*\/inventory\.html$/);
  });

  // Los dos tests anteriores localizan LOS MISMOS elementos. La pregunta 3.1 del
  // Lab es por qué, y la respuesta está en el HTML de la página de login.
});

// -----------------------------------------------------------------------------
// TODO Bloque 3.2 — `getByTestId`. La configuración de este sandbox ya trae
//        `testIdAttribute: 'data-test'`. Reescribe el login usando getByTestId y
//        comprueba en `playwright.config.ts` de este directorio qué línea lo hace
//        posible. Antes, predice qué devolvería sin esa línea.
//
// TODO Bloque 3.4 — Títulos de página. Escribe un test que verifique que el
//        catálogo muestra el título "Products". Empieza probando
//        `getByRole('heading', { name: 'Products' })` y cuenta cuántos elementos
//        resuelve con `.count()`. Después elige la alternativa y justifícala.
//
// TODO Bloque 3.5 — El desplegable de ordenación. Localízalo por rol y déjalo en
//        verde. La pregunta no es si funciona: es si lo mantendrías dos años.
//
// TODO Bloque 3.6 — Ambigüedad. Añade al carrito la "Sauce Labs Fleece Jacket"
//        SIN usar `.first()`, `.nth()` ni `.last()`, y sin escribir el
//        `data-test` completo del botón. Acota por la tarjeta del producto.
// -----------------------------------------------------------------------------
