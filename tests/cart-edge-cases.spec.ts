import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';
import { ProductDetailPage } from '../pages/product-detail.page';
import { MenuPage } from '../pages/menu.page';

test.describe('Casos límite y escenarios de borde del carrito', () => {
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;
  let productDetailPage: ProductDetailPage;
  let menuPage: MenuPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    productDetailPage = new ProductDetailPage(page);
    menuPage = new MenuPage(page);
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
  });

  test('debería volver a añadir un producto después de haberlo eliminado desde el inventario', async ({ page }) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await expect(
      inventoryPage.cartBadge,
      'El badge debería mostrar 1 tras añadir la Sauce Labs Backpack por primera vez',
    ).toHaveText('1');

    await inventoryPage.removeFromCart('sauce-labs-backpack');
    await expect(
      inventoryPage.cartBadge,
      'El badge no debería ser visible tras eliminar la Sauce Labs Backpack desde el inventario',
    ).not.toBeVisible();

    await expect(
      page.locator('[data-test="add-to-cart-sauce-labs-backpack"]'),
      'El botón "Add to cart" debería ser visible de nuevo tras eliminar el producto',
    ).toBeVisible();

    await inventoryPage.addToCart('sauce-labs-backpack');
    await expect(
      inventoryPage.cartBadge,
      'El badge debería volver a mostrar 1 al añadir la Sauce Labs Backpack por segunda vez',
    ).toHaveText('1');
  });

  test('debería volver a añadir desde el inventario un producto eliminado desde el carrito', async ({ page }) => {
    await inventoryPage.addToCart('sauce-labs-onesie');
    await inventoryPage.navigateToCart();
    await cartPage.removeItem('sauce-labs-onesie');

    await expect(
      page.locator('.cart_item'),
      'El carrito debería estar vacío tras eliminar la Sauce Labs Onesie desde el carrito',
    ).toHaveCount(0);

    await cartPage.continueShopping();

    await expect(
      page.locator('[data-test="add-to-cart-sauce-labs-onesie"]'),
      'El botón "Add to cart" de la Sauce Labs Onesie debería ser visible al volver al inventario',
    ).toBeVisible();

    await inventoryPage.addToCart('sauce-labs-onesie');
    await expect(
      inventoryPage.cartBadge,
      'El badge debería mostrar 1 al añadir de nuevo la Sauce Labs Onesie desde el inventario',
    ).toHaveText('1');
  });

  test('debería impedir añadir el mismo producto dos veces (interfaz no lo permite)', async ({ page }) => {
    await inventoryPage.addToCart('sauce-labs-backpack');

    await expect(
      inventoryPage.cartBadge,
      'El badge debería mostrar 1 tras añadir la Sauce Labs Backpack',
    ).toHaveText('1');
    await expect(
      page.locator('[data-test="add-to-cart-sauce-labs-backpack"]'),
      'El botón "Add to cart" no debería ser visible tras añadir el producto (no permite duplicados)',
    ).not.toBeVisible();
    await expect(
      page.locator('[data-test="remove-sauce-labs-backpack"]'),
      'El botón "Remove" debería ser visible tras añadir el producto',
    ).toBeVisible();

    await inventoryPage.navigateToCart();

    await expect(
      page.locator('.cart_item'),
      'El carrito debería contener exactamente 1 ítem, sin duplicados',
    ).toHaveCount(1);
  });

  test('debería acceder directamente por URL a un producto (id=1) y añadirlo al carrito', async ({ page }) => {
    await productDetailPage.navigate(1);

    await expect(
      productDetailPage.productName,
      'El nombre del producto con id=1 debería ser visible al acceder directamente por URL',
    ).toBeVisible();
    await expect(
      productDetailPage.productDescription,
      'La descripción del producto con id=1 debería ser visible al acceder directamente por URL',
    ).toBeVisible();
    await expect(
      productDetailPage.productPrice,
      'El precio del producto con id=1 debería ser visible al acceder directamente por URL',
    ).toBeVisible();
    await expect(
      page.locator('[data-test^="add-to-cart"]'),
      'El botón "Add to cart" debería ser visible al acceder directamente al detalle por URL',
    ).toBeVisible();

    await productDetailPage.addToCart();

    await expect(
      productDetailPage.cartBadge,
      'El badge debería mostrar 1 tras añadir el producto accedido directamente por URL',
    ).toHaveText('1');
  });

  test('debería añadir productos al carrito con el inventario ordenado por precio ascendente', async () => {
    await inventoryPage.sortBy('lohi');
    await inventoryPage.addToCart('sauce-labs-onesie');

    await expect(
      inventoryPage.cartBadge,
      'El badge debería mostrar 1 tras añadir la Sauce Labs Onesie con el inventario ordenado por precio ascendente',
    ).toHaveText('1');

    await inventoryPage.addToCart('sauce-labs-fleece-jacket');

    await expect(
      inventoryPage.cartBadge,
      'El badge debería mostrar 2 tras añadir la Sauce Labs Fleece Jacket con el inventario ordenado por precio ascendente',
    ).toHaveText('2');
  });

  test('debería añadir productos al carrito con el inventario ordenado por nombre de Z a A', async () => {
    await inventoryPage.sortBy('za');
    await inventoryPage.addToCart('test.allthethings()-t-shirt-(red)');

    await expect(
      inventoryPage.cartBadge,
      'El badge debería mostrar 1 tras añadir la Sauce Labs (Red) T-Shirt con el inventario ordenado de Z a A',
    ).toHaveText('1');

    await inventoryPage.addToCart('sauce-labs-backpack');

    await expect(
      inventoryPage.cartBadge,
      'El badge debería mostrar 2 tras añadir la Sauce Labs Backpack con el inventario ordenado de Z a A',
    ).toHaveText('2');
  });

  test('debería verificar el comportamiento del carrito tras logout y nuevo login', async ({ page }) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.addToCart('sauce-labs-bike-light');

    await expect(
      inventoryPage.cartBadge,
      'El badge debería mostrar 2 antes del logout',
    ).toHaveText('2');

    await menuPage.logout();

    await expect(
      page,
      'La URL debería volver a la página de login tras el logout',
    ).toHaveURL(/.*\/$|.*\/index\.html$/);

    const loginPage = new LoginPage(page);
    await loginPage.login('standard_user', 'secret_sauce');

    await expect(
      page,
      'La URL debería ser /inventory.html tras el nuevo login',
    ).toHaveURL(/.*\/inventory\.html$/);
  });
});
