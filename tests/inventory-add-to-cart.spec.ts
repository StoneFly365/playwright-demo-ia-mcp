import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';

test.describe('Añadir productos individuales desde el inventario', () => {
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
  });

  test('debería añadir la Sauce Labs Backpack al carrito como único producto', async () => {
    await inventoryPage.addToCart('sauce-labs-backpack');

    await expect(
      inventoryPage.cartBadge,
      'El badge del carrito debería mostrar 1 tras añadir únicamente la Sauce Labs Backpack',
    ).toHaveText('1');
  });

  test('debería añadir la Sauce Labs Bike Light al carrito como único producto', async () => {
    await inventoryPage.addToCart('sauce-labs-bike-light');

    await expect(
      inventoryPage.cartBadge,
      'El badge del carrito debería mostrar 1 tras añadir únicamente la Sauce Labs Bike Light',
    ).toHaveText('1');
  });

  test('debería añadir la Sauce Labs Fleece Jacket al carrito como único producto', async () => {
    await inventoryPage.addToCart('sauce-labs-fleece-jacket');

    await expect(
      inventoryPage.cartBadge,
      'El badge del carrito debería mostrar 1 tras añadir únicamente la Sauce Labs Fleece Jacket',
    ).toHaveText('1');
  });

  test('debería añadir la Sauce Labs Onesie al carrito como único producto', async () => {
    await inventoryPage.addToCart('sauce-labs-onesie');

    await expect(
      inventoryPage.cartBadge,
      'El badge del carrito debería mostrar 1 tras añadir únicamente la Sauce Labs Onesie',
    ).toHaveText('1');
  });

  test('debería añadir la Sauce Labs (Red) T-Shirt al carrito como único producto', async () => {
    await inventoryPage.addToCart('test.allthethings()-t-shirt-(red)');

    await expect(
      inventoryPage.cartBadge,
      'El badge del carrito debería mostrar 1 tras añadir únicamente la Sauce Labs (Red) T-Shirt',
    ).toHaveText('1');
  });

  test('debería añadir los 6 productos al carrito y mostrar badge con valor 6', async () => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.addToCart('sauce-labs-bike-light');
    await inventoryPage.addToCart('sauce-labs-bolt-t-shirt');
    await inventoryPage.addToCart('sauce-labs-fleece-jacket');
    await inventoryPage.addToCart('sauce-labs-onesie');
    await inventoryPage.addToCart('test.allthethings()-t-shirt-(red)');

    await expect(
      inventoryPage.cartBadge,
      'El badge del carrito debería mostrar 6 tras añadir todos los productos del catálogo',
    ).toHaveText('6');
  });

  test('debería cambiar el botón de "Add to cart" a "Remove" tras añadir un producto', async ({ page }) => {
    await expect(
      page.locator('[data-test="add-to-cart-sauce-labs-backpack"]'),
      'El botón "Add to cart" debería ser visible antes de añadir el producto',
    ).toBeVisible();

    await inventoryPage.addToCart('sauce-labs-backpack');

    await expect(
      page.locator('[data-test="remove-sauce-labs-backpack"]'),
      'El botón "Remove" debería ser visible tras añadir el producto al carrito',
    ).toBeVisible();
    await expect(
      page.locator('[data-test="add-to-cart-sauce-labs-backpack"]'),
      'El botón "Add to cart" debería desaparecer tras añadir el producto al carrito',
    ).not.toBeVisible();
  });

  test('debería restablecer el botón a "Add to cart" tras eliminar el producto desde el inventario', async ({ page }) => {
    await inventoryPage.addToCart('sauce-labs-bike-light');

    await expect(
      page.locator('[data-test="remove-sauce-labs-bike-light"]'),
      'El botón "Remove" debería ser visible tras añadir la Sauce Labs Bike Light',
    ).toBeVisible();

    await inventoryPage.removeFromCart('sauce-labs-bike-light');

    await expect(
      page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]'),
      'El botón "Add to cart" debería volver a ser visible tras eliminar el producto desde el inventario',
    ).toBeVisible();
    await expect(
      inventoryPage.cartBadge,
      'El badge del carrito no debería ser visible tras eliminar el único producto',
    ).not.toBeVisible();
  });

  test('debería decrementar el badge al eliminar un producto con otros en el carrito', async () => {
    await inventoryPage.addToCart('sauce-labs-fleece-jacket');
    await inventoryPage.addToCart('sauce-labs-onesie');

    await expect(
      inventoryPage.cartBadge,
      'El badge debería mostrar 2 tras añadir la Fleece Jacket y la Onesie',
    ).toHaveText('2');

    await inventoryPage.removeFromCart('sauce-labs-fleece-jacket');

    await expect(
      inventoryPage.cartBadge,
      'El badge debería decrementarse a 1 al eliminar uno de los dos productos desde el inventario',
    ).toHaveText('1');
  });
});
