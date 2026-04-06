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
    await expect(productDetailPage.productName).toBeVisible();
    await expect(productDetailPage.productDescription).toBeVisible();
    await expect(productDetailPage.productPrice).toBeVisible();
    await expect(productDetailPage.productPrice).toContainText('$');
  });

  test('debería añadir el producto al carrito desde el detalle', async () => {
    await productDetailPage.addToCart();

    await expect(productDetailPage.cartBadge).toHaveText('1');
  });

  test('debería eliminar el producto del carrito desde el detalle', async () => {
    await productDetailPage.addToCart();
    await productDetailPage.removeFromCart();

    await expect(productDetailPage.cartBadge).not.toBeVisible();
  });

  test('debería volver al inventario al pulsar "Volver a productos"', async ({ page }) => {
    await productDetailPage.backToProducts();

    await expect(page).toHaveURL('/inventory.html');
  });
});
