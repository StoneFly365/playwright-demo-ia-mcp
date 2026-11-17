import AxeBuilder from '@axe-core/playwright';
import { test, expect, standardUserSession, type Page } from '../fixtures/scenarios';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';

// Comprueba las reglas WCAG 2.1 de nivel A y AA con axe. Cada violación sale con su regla,
// su impacto y los elementos afectados, para que el informe diga qué arreglar y dónde.
async function expectNoA11yViolations(page: Page): Promise<void> {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(
    violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
    'La página no debería tener violaciones de accesibilidad WCAG 2.1 AA',
  ).toEqual([]);
}

test.describe('Accesibilidad sin sesión', { tag: '@a11y' }, () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('TC-A11Y-01 debería cumplir WCAG 2.1 AA en la página de login', async ({ page }) => {
    await expect(page, 'Debería estar en la página de login').toHaveURL(/.*\/$/);

    await expectNoA11yViolations(page);
  });

  test('TC-A11Y-02 debería cumplir WCAG 2.1 AA con el mensaje de error del login', async ({ page }) => {
    await loginPage.login('locked_out_user', 'secret_sauce');
    await expect(loginPage.errorMessage, 'El mensaje de error debería estar visible antes de analizar').toBeVisible();

    await expectNoA11yViolations(page);
  });
});

test.describe('Accesibilidad con sesión', { tag: '@a11y' }, () => {
  test.use(standardUserSession);

  let inventoryPage: InventoryPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
    await new LoginPage(page).loginAsStandardUser();
  });

  test('TC-A11Y-03 debería cumplir WCAG 2.1 AA en el inventario', async ({ page }) => {
    await expect(inventoryPage.inventoryItems, 'El inventario debería mostrar los 6 productos').toHaveCount(6);

    await expectNoA11yViolations(page);
  });

  test('TC-A11Y-04 debería cumplir WCAG 2.1 AA en el detalle de producto', async ({ page }) => {
    await inventoryPage.navigateToProduct('Sauce Labs Backpack');
    await expect(page, 'Debería estar en el detalle del producto').toHaveURL(/.*\/inventory-item\.html\?id=\d+$/);

    await expectNoA11yViolations(page);
  });

  test('TC-A11Y-05 debería cumplir WCAG 2.1 AA en el carrito con un producto', async ({ page }) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.navigateToCart();
    await expect(page, 'Debería estar en el carrito').toHaveURL(/.*\/cart\.html$/);

    await expectNoA11yViolations(page);
  });

  test('TC-A11Y-06 debería cumplir WCAG 2.1 AA en el paso 1 del checkout', async ({ page }) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.navigateToCart();
    await cartPage.checkout();
    await expect(page, 'Debería estar en el paso 1 del checkout').toHaveURL(/.*\/checkout-step-one\.html$/);

    await expectNoA11yViolations(page);
  });

  test('TC-A11Y-07 debería cumplir WCAG 2.1 AA en el resumen del checkout', async ({ page }) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.navigateToCart();
    await cartPage.checkout();
    await checkoutPage.fillInfo('Juan', 'García', '28001');
    await checkoutPage.continue();
    await expect(checkoutPage.totalLabel, 'El resumen debería mostrar el total').toBeVisible();

    await expectNoA11yViolations(page);
  });

  test('TC-A11Y-08 debería cumplir WCAG 2.1 AA en la confirmación del pedido', async ({ page }) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.navigateToCart();
    await cartPage.checkout();
    await checkoutPage.fillInfo('Juan', 'García', '28001');
    await checkoutPage.continue();
    await checkoutPage.finish();
    await expect(page, 'Debería estar en la confirmación del pedido').toHaveURL(/.*\/checkout-complete\.html$/);

    await expectNoA11yViolations(page);
  });
});
