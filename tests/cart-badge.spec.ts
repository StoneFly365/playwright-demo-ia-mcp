import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { MenuPage } from '../pages/menu.page';
import { ProductDetailPage } from '../pages/product-detail.page';

test.describe('Gestión del badge del carrito', () => {
  let inventoryPage: InventoryPage;
  let menuPage: MenuPage;
  let productDetailPage: ProductDetailPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    menuPage = new MenuPage(page);
    productDetailPage = new ProductDetailPage(page);
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
  });

  test('debería no mostrar el badge al cargar el inventario con carrito vacío', async () => {
    await expect(
      inventoryPage.cartBadge,
      'El badge del carrito no debería ser visible al acceder al inventario con el carrito vacío',
    ).not.toBeVisible();
  });

  test('debería mostrar badge con valor 4 al añadir cuatro productos distintos', async () => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.addToCart('sauce-labs-bike-light');
    await inventoryPage.addToCart('sauce-labs-fleece-jacket');
    await inventoryPage.addToCart('test.allthethings()-t-shirt-(red)');

    // ⚠️ FALLO INTENCIONADO: Cambiar '3' por '4' para revertir
    await expect(
      inventoryPage.cartBadge,
      'El badge debería mostrar 4 tras añadir cuatro productos distintos al carrito',
    ).toHaveText('3');
  });

  test('debería mostrar badge con valor 5 al añadir cinco productos distintos', async () => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.addToCart('sauce-labs-bike-light');
    await inventoryPage.addToCart('sauce-labs-bolt-t-shirt');
    await inventoryPage.addToCart('sauce-labs-fleece-jacket');
    await inventoryPage.addToCart('test.allthethings()-t-shirt-(red)');

    await expect(
      inventoryPage.cartBadge,
      'El badge debería mostrar 5 tras añadir cinco productos distintos al carrito',
    ).toHaveText('5');
  });

  test('debería persistir el badge tras recargar la página del inventario', async ({ page }) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.addToCart('sauce-labs-bike-light');

    await expect(
      inventoryPage.cartBadge,
      'El badge debería mostrar 2 antes de recargar la página',
    ).toHaveText('2');

    await page.reload();

    await expect(
      page,
      'La URL debería seguir siendo /inventory.html tras recargar la página',
    ).toHaveURL(/.*\/inventory\.html$/);
    await expect(
      inventoryPage.cartBadge,
      'El badge debería seguir mostrando 2 tras recargar la página del inventario',
    ).toHaveText('2');
  });

  test('debería persistir el badge al navegar a la página de detalle de un producto', async ({ page }) => {
    await inventoryPage.addToCart('sauce-labs-backpack');

    await expect(
      inventoryPage.cartBadge,
      'El badge debería mostrar 1 en el inventario antes de navegar al detalle',
    ).toHaveText('1');

    await inventoryPage.navigateToProduct('Sauce Labs Fleece Jacket');

    await expect(
      page,
      'La URL debería contener /inventory-item.html al navegar al detalle del producto',
    ).toHaveURL(/.*\/inventory-item\.html/);
    await expect(
      productDetailPage.cartBadge,
      'El badge debería seguir mostrando 1 en la página de detalle del producto',
    ).toHaveText('1');
  });

  test('debería restablecer el badge al usar "Reset App State" desde el menú lateral', async ({ page }) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.addToCart('sauce-labs-onesie');

    await expect(
      inventoryPage.cartBadge,
      'El badge debería mostrar 2 antes de ejecutar el reset',
    ).toHaveText('2');

    await menuPage.resetAppState();
    await page.reload();

    await expect(
      inventoryPage.cartBadge,
      'El badge no debería ser visible tras usar "Reset App State" desde el menú lateral',
    ).not.toBeVisible();
    await expect(
      page.locator('[data-test="add-to-cart-sauce-labs-backpack"]'),
      'El botón "Add to cart" de la Sauce Labs Backpack debería ser visible tras el reset',
    ).toBeVisible();
    await expect(
      page.locator('[data-test="add-to-cart-sauce-labs-onesie"]'),
      'El botón "Add to cart" de la Sauce Labs Onesie debería ser visible tras el reset',
    ).toBeVisible();
  });
});
