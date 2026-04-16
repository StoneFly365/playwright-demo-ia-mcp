import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { ProductDetailPage } from '../pages/product-detail.page';

test.describe('Añadir productos desde la página de detalle', () => {
  let inventoryPage: InventoryPage;
  let productDetailPage: ProductDetailPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    productDetailPage = new ProductDetailPage(page);
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
  });

  test('debería añadir la Sauce Labs Backpack al carrito desde su página de detalle (id=4)', async ({ page }) => {
    await productDetailPage.navigate(4);

    await expect(
      page,
      'La URL debería contener el id=4 del producto Sauce Labs Backpack',
    ).toHaveURL(/.*\/inventory-item\.html\?id=4$/);

    await productDetailPage.addToCart();

    await expect(
      productDetailPage.cartBadge,
      'El badge debería mostrar 1 tras añadir la Sauce Labs Backpack desde su detalle',
    ).toHaveText('1');
  });

  test('debería añadir la Sauce Labs Bolt T-Shirt al carrito desde su página de detalle (id=6)', async () => {
    await productDetailPage.navigate(6);
    await productDetailPage.addToCart();

    await expect(
      productDetailPage.cartBadge,
      'El badge debería mostrar 1 tras añadir la Sauce Labs Bolt T-Shirt desde su detalle',
    ).toHaveText('1');
  });

  test('debería añadir la Sauce Labs Fleece Jacket al carrito desde su página de detalle (id=5)', async () => {
    await productDetailPage.navigate(5);
    await productDetailPage.addToCart();

    await expect(
      productDetailPage.cartBadge,
      'El badge debería mostrar 1 tras añadir la Sauce Labs Fleece Jacket desde su detalle',
    ).toHaveText('1');
  });

  test('debería añadir la Sauce Labs Onesie al carrito desde su página de detalle (id=2)', async () => {
    await productDetailPage.navigate(2);
    await productDetailPage.addToCart();

    await expect(
      productDetailPage.cartBadge,
      'El badge debería mostrar 1 tras añadir la Sauce Labs Onesie desde su detalle',
    ).toHaveText('1');
  });

  test('debería añadir la Sauce Labs (Red) T-Shirt al carrito desde su página de detalle (id=3)', async () => {
    await productDetailPage.navigate(3);
    await productDetailPage.addToCart();

    await expect(
      productDetailPage.cartBadge,
      'El badge debería mostrar 1 tras añadir la Sauce Labs (Red) T-Shirt desde su detalle',
    ).toHaveText('1');
  });

  test('debería cambiar el botón a "Remove" en detalle tras añadir el producto', async ({ page }) => {
    await productDetailPage.navigate(4);

    await expect(
      page.locator('[data-test^="add-to-cart"]'),
      'El botón "Add to cart" debería ser visible antes de añadir el producto en el detalle',
    ).toBeVisible();
    await expect(
      page.locator('[data-test^="remove"]'),
      'El botón "Remove" no debería ser visible antes de añadir el producto en el detalle',
    ).not.toBeVisible();

    await productDetailPage.addToCart();

    await expect(
      page.locator('[data-test^="remove"]'),
      'El botón "Remove" debería ser visible tras añadir el producto desde el detalle',
    ).toBeVisible();
    await expect(
      page.locator('[data-test^="add-to-cart"]'),
      'El botón "Add to cart" debería desaparecer tras añadir el producto desde el detalle',
    ).not.toBeVisible();
  });

  test('debería eliminar la Sauce Labs Fleece Jacket desde su detalle y hacer desaparecer el badge', async () => {
    await productDetailPage.navigate(5);
    await productDetailPage.addToCart();

    await expect(
      productDetailPage.cartBadge,
      'El badge debería mostrar 1 tras añadir la Sauce Labs Fleece Jacket desde su detalle',
    ).toHaveText('1');

    await productDetailPage.removeFromCart();

    await expect(
      productDetailPage.cartBadge,
      'El badge no debería ser visible tras eliminar el producto desde la página de detalle',
    ).not.toBeVisible();
  });

  test('debería navegar al detalle desde la imagen del producto en el inventario', async ({ page }) => {
    await page
      .locator('[data-test="inventory-item"]')
      .filter({ hasText: 'Sauce Labs Fleece Jacket' })
      .locator('img')
      .click();

    await expect(
      page,
      'La URL debería contener /inventory-item.html al navegar via la imagen del producto',
    ).toHaveURL(/.*\/inventory-item\.html/);
    await expect(
      productDetailPage.productName,
      'El nombre del producto en el detalle debería ser "Sauce Labs Fleece Jacket"',
    ).toContainText('Sauce Labs Fleece Jacket');
  });

  test('debería persistir el badge al volver al inventario después de añadir desde el detalle', async ({ page }) => {
    await productDetailPage.navigate(2);
    await productDetailPage.addToCart();

    await expect(
      productDetailPage.cartBadge,
      'El badge debería mostrar 1 tras añadir la Sauce Labs Onesie desde su detalle',
    ).toHaveText('1');

    await productDetailPage.backToProducts();

    await expect(
      page,
      'La URL debería ser /inventory.html tras pulsar "Back to products"',
    ).toHaveURL(/.*\/inventory\.html$/);
    await expect(
      inventoryPage.cartBadge,
      'El badge debería seguir mostrando 1 al volver al inventario desde el detalle',
    ).toHaveText('1');
    await expect(
      page.locator('[data-test="remove-sauce-labs-onesie"]'),
      'El botón "Remove" debería ser visible en el inventario para el producto previamente añadido desde el detalle',
    ).toBeVisible();
  });
});
