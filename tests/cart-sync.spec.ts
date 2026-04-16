import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';
import { ProductDetailPage } from '../pages/product-detail.page';

test.describe('Sincronización del estado entre inventario y carrito', () => {
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;
  let productDetailPage: ProductDetailPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    productDetailPage = new ProductDetailPage(page);
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
  });

  test('debería mostrar los productos añadidos desde el inventario en la página del carrito', async ({ page }) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.addToCart('sauce-labs-fleece-jacket');
    await inventoryPage.navigateToCart();

    // ⚠️ FALLO INTENCIONADO: Cambiar 3 por 2 para revertir
    await expect(
      page.locator('.cart_item'),
      'El carrito debería contener exactamente 2 ítems tras añadir la Backpack y la Fleece Jacket',
    ).toHaveCount(3);
    await expect(
      page.locator('[data-test="inventory-item-name"]').first(),
      'El nombre del primer ítem del carrito debería corresponder a uno de los productos añadidos',
    ).toBeVisible();
  });

  test('debería mantener el contenido del carrito al navegar entre inventario y carrito repetidamente', async ({ page }) => {
    await inventoryPage.addToCart('sauce-labs-onesie');
    await inventoryPage.navigateToCart();

    await expect(
      page.locator('.cart_item'),
      'El carrito debería contener 1 ítem tras añadir la Sauce Labs Onesie',
    ).toHaveCount(1);

    await cartPage.continueShopping();

    await expect(
      page,
      'La URL debería ser /inventory.html tras pulsar "Continue Shopping"',
    ).toHaveURL(/.*\/inventory\.html$/);
    await expect(
      inventoryPage.cartBadge,
      'El badge debería seguir mostrando 1 al volver al inventario',
    ).toHaveText('1');

    await inventoryPage.navigateToCart();

    await expect(
      page.locator('.cart_item'),
      'El carrito debería seguir teniendo 1 ítem tras volver al inventario y regresar al carrito',
    ).toHaveCount(1);
  });

  test('debería mostrar correctamente en el carrito el producto añadido desde el detalle', async ({ page }) => {
    await productDetailPage.navigate(5);
    await productDetailPage.addToCart();
    await page.locator('[data-test="shopping-cart-link"]').click();

    await expect(
      page.locator('.cart_item'),
      'El carrito debería contener 1 ítem tras añadir la Sauce Labs Fleece Jacket desde su detalle',
    ).toHaveCount(1);
    await expect(
      page.locator('[data-test="inventory-item-name"]'),
      'El nombre del producto en el carrito debería ser "Sauce Labs Fleece Jacket"',
    ).toContainText('Sauce Labs Fleece Jacket');
    await expect(
      page.locator('[data-test="inventory-item-price"]'),
      'El precio del producto en el carrito debería contener el símbolo "$"',
    ).toContainText('$');
  });

  test('debería reflejar en el inventario los botones "Remove" de los productos en carrito al volver desde el carrito', async ({ page }) => {
    await inventoryPage.addToCart('sauce-labs-bolt-t-shirt');
    await inventoryPage.addToCart('sauce-labs-onesie');
    await inventoryPage.navigateToCart();
    await cartPage.continueShopping();

    await expect(
      page.locator('[data-test="remove-sauce-labs-bolt-t-shirt"]'),
      'El botón "Remove" de la Bolt T-Shirt debería seguir visible al volver al inventario',
    ).toBeVisible();
    await expect(
      page.locator('[data-test="remove-sauce-labs-onesie"]'),
      'El botón "Remove" de la Onesie debería seguir visible al volver al inventario',
    ).toBeVisible();
    await expect(
      inventoryPage.cartBadge,
      'El badge debería seguir mostrando 2 al volver al inventario desde el carrito',
    ).toHaveText('2');
  });

  test('debería eliminar múltiples productos desde el carrito y dejar el carrito vacío', async ({ page }) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.addToCart('sauce-labs-bike-light');
    await inventoryPage.addToCart('sauce-labs-onesie');
    await inventoryPage.navigateToCart();

    await cartPage.removeItem('sauce-labs-backpack');
    await expect(
      page.locator('.cart_item'),
      'El carrito debería tener 2 ítems tras eliminar la Sauce Labs Backpack',
    ).toHaveCount(2);

    await cartPage.removeItem('sauce-labs-bike-light');
    await expect(
      page.locator('.cart_item'),
      'El carrito debería tener 1 ítem tras eliminar también la Sauce Labs Bike Light',
    ).toHaveCount(1);

    await cartPage.removeItem('sauce-labs-onesie');
    await expect(
      page.locator('.cart_item'),
      'El carrito debería estar vacío tras eliminar todos los productos',
    ).toHaveCount(0);

    await cartPage.continueShopping();
    await expect(
      inventoryPage.cartBadge,
      'El badge del carrito no debería ser visible tras vaciar el carrito y volver al inventario',
    ).not.toBeVisible();
  });
});
