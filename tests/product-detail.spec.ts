import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { ProductDetailPage } from '../pages/product-detail.page';

test.describe('Detalle de producto', () => {
  let productDetailPage: ProductDetailPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    productDetailPage = new ProductDetailPage(page);
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    await productDetailPage.navigate(0);
  });

  test('debería mostrar el nombre, descripción y precio del producto correctamente', async () => {
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

  test('debería añadir el producto al carrito desde el detalle', async () => {
    await productDetailPage.addToCart();

    await expect(
      productDetailPage.cartBadge,
      'El badge del carrito debería mostrar 1 tras añadir el producto desde la página de detalle',
    ).toHaveText('1');
  });

  test('debería eliminar el producto del carrito desde el detalle', async () => {
    await productDetailPage.addToCart();
    await productDetailPage.removeFromCart();

    // ⚠️ FALLO INTENCIONADO: Cambiar toHaveText('1') por not.toBeVisible() para revertir
    await expect(
      productDetailPage.cartBadge,
      'El badge del carrito no debería ser visible tras eliminar el producto desde la página de detalle',
    ).toHaveText('1');
  });

  test('debería volver al inventario al pulsar "Volver a productos"', async ({ page }) => {
    await productDetailPage.backToProducts();

    await expect(
      page,
      'El usuario debería ser redirigido a la página de inventario al pulsar "Volver a productos"',
    ).toHaveURL(/.*\/inventory\.html$/);
  });
});
