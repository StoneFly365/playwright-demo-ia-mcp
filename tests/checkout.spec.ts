import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';

test.describe('Checkout', () => {
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.navigateToCart();
    await cartPage.checkout();
  });

  test('debería completar el proceso de compra con datos válidos', async ({ page }) => {
    await checkoutPage.fillInfo('Juan', 'García', '28001');
    await checkoutPage.continue();
    await checkoutPage.finish();

    await expect(
      page,
      'El usuario debería ser redirigido a la página de confirmación tras completar el proceso de compra',
    ).toHaveURL(/.*\/checkout-complete\.html$/);
    await expect(
      page.getByRole('heading', { name: 'Thank you for your order!' }),
      'El mensaje de confirmación de pedido debería ser visible tras finalizar la compra',
    ).toBeVisible();
  });

  test('debería mostrar error si el nombre es obligatorio', async () => {
    await checkoutPage.fillInfo('', 'García', '28001');
    await checkoutPage.continue();

    await expect(
      checkoutPage.errorMessage,
      'El mensaje de error debería ser visible al intentar continuar sin introducir el nombre',
    ).toBeVisible();
    // ⚠️ FALLO INTENCIONADO: Cambiar 'Last Name is required' por 'First Name is required' para revertir
    await expect(
      checkoutPage.errorMessage,
      'El mensaje de error debería indicar que el nombre es obligatorio para continuar con el checkout',
    ).toContainText('Last Name is required');
  });

  test('debería mostrar error si el apellido es obligatorio', async () => {
    await checkoutPage.fillInfo('Juan', '', '28001');
    await checkoutPage.continue();

    await expect(
      checkoutPage.errorMessage,
      'El mensaje de error debería ser visible al intentar continuar sin introducir el apellido',
    ).toBeVisible();
    await expect(
      checkoutPage.errorMessage,
      'El mensaje de error debería indicar que el apellido es obligatorio para continuar con el checkout',
    ).toContainText('Last Name is required');
  });

  test('debería mostrar error si el código postal es obligatorio', async () => {
    await checkoutPage.fillInfo('Juan', 'García', '');
    await checkoutPage.continue();

    await expect(
      checkoutPage.errorMessage,
      'El mensaje de error debería ser visible al intentar continuar sin introducir el código postal',
    ).toBeVisible();
    await expect(
      checkoutPage.errorMessage,
      'El mensaje de error debería indicar que el código postal es obligatorio para continuar con el checkout',
    ).toContainText('Postal Code is required');
  });

  test('debería cancelar el checkout desde el paso 1 y volver al carrito', async ({ page }) => {
    await checkoutPage.cancel();

    await expect(
      page,
      'El usuario debería ser redirigido a la página del carrito al cancelar desde el paso 1 del checkout',
    ).toHaveURL(/.*\/cart\.html$/);
  });

  test('debería cancelar el checkout desde el paso 2 y volver al inventario', async ({ page }) => {
    await checkoutPage.fillInfo('Juan', 'García', '28001');
    await checkoutPage.continue();
    await checkoutPage.cancel();

    await expect(
      page,
      'El usuario debería ser redirigido a la página de inventario al cancelar desde el paso 2 del checkout',
    ).toHaveURL(/.*\/inventory\.html$/);
  });

  test('debería mostrar el resumen de precios correctamente en el paso 2', async () => {
    await checkoutPage.fillInfo('Juan', 'García', '28001');
    await checkoutPage.continue();

    await expect(
      checkoutPage.subtotalLabel,
      'El subtotal del pedido debería ser visible en el resumen de precios del paso 2',
    ).toBeVisible();
    await expect(
      checkoutPage.taxLabel,
      'El importe de los impuestos debería ser visible en el resumen de precios del paso 2',
    ).toBeVisible();
    await expect(
      checkoutPage.totalLabel,
      'El total del pedido debería ser visible en el resumen de precios del paso 2',
    ).toBeVisible();
  });

  test('debería volver al inventario tras finalizar el pedido', async ({ page }) => {
    await checkoutPage.fillInfo('Juan', 'García', '28001');
    await checkoutPage.continue();
    await checkoutPage.finish();
    await checkoutPage.backHome();

    await expect(
      page,
      'El usuario debería ser redirigido a la página de inventario tras pulsar "Back Home" en la confirmación del pedido',
    ).toHaveURL(/.*\/inventory\.html$/);
  });
});
