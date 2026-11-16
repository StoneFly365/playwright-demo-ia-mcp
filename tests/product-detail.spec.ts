import { test, expect, standardUserSession } from '../fixtures/scenarios';
import { LoginPage } from '../pages/login.page';
import { ProductDetailPage } from '../pages/product-detail.page';

test.use(standardUserSession);

test.describe('Detalle de producto', () => {
  let productDetailPage: ProductDetailPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    productDetailPage = new ProductDetailPage(page);
    await loginPage.loginAsStandardUser();
    await productDetailPage.navigate(0);
  });

  test('TC-PDP-01 debería mostrar el nombre, descripción y precio del producto correctamente', async () => {
    await expect(
      productDetailPage.productName,
      'El nombre del producto debería ser visible en la página de detalle',
    ).toBeVisible();
    await expect(
      productDetailPage.productDescription,
      'La descripción del producto debería ser visible en la página de detalle',
    ).toBeVisible();
    await expect(
      productDetailPage.productPrice,
      'El precio del producto debería ser visible en la página de detalle',
    ).toBeVisible();
    await expect(
      productDetailPage.productPrice,
      'El precio del producto debería incluir el símbolo de dólar',
    ).toContainText('$');
  });

  test('TC-PDP-02 debería añadir el producto al carrito desde el detalle', async () => {
    await productDetailPage.addToCart();

    await expect(
      productDetailPage.cartBadge,
      'El badge del carrito debería mostrar 1 tras añadir el producto desde la página de detalle',
    ).toHaveText('1');
  });

  test('TC-PDP-03 debería eliminar el producto del carrito desde el detalle', { tag: '@demo-fail' }, async () => {
    await productDetailPage.addToCart();
    await productDetailPage.removeFromCart();

    // ⚠️ FALLO INTENCIONADO: Cambiar toHaveText('1') por not.toBeVisible() para revertir
    await expect(
      productDetailPage.cartBadge,
      'El badge del carrito no debería ser visible tras eliminar el producto desde la página de detalle',
    ).toHaveText('1');
  });

  test('TC-PDP-04 debería volver al inventario al pulsar "Volver a productos"', async ({ page }) => {
    await productDetailPage.backToProducts();

    await expect(
      page,
      'El usuario debería ser redirigido a la página de inventario al pulsar "Volver a productos"',
    ).toHaveURL(/.*\/inventory\.html$/);
  });
});
