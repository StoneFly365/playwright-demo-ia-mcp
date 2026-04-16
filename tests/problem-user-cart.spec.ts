import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';
import { ProductDetailPage } from '../pages/product-detail.page';

test.describe('Comportamiento con problem_user', () => {
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;
  let productDetailPage: ProductDetailPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    productDetailPage = new ProductDetailPage(page);
    await loginPage.navigate();
    await loginPage.login('problem_user', 'secret_sauce');
  });

  test('debería verificar el comportamiento del badge al añadir Sauce Labs Backpack con problem_user', async ({ page }) => {
    await expect(
      page,
      'El problem_user debería ser redirigido al inventario tras el login',
    ).toHaveURL(/.*\/inventory\.html$/);

    await inventoryPage.addToCart('sauce-labs-backpack');

    await expect(
      inventoryPage.cartBadge,
      'El badge debería mostrar 1 tras añadir la Sauce Labs Backpack con problem_user — un fallo aquí confirma el bug conocido de este usuario',
    ).toHaveText('1');
  });

  test('debería verificar cuántos de los 6 productos responden al "Add to cart" con problem_user', async () => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.addToCart('sauce-labs-bike-light');
    await inventoryPage.addToCart('sauce-labs-bolt-t-shirt');
    await inventoryPage.addToCart('sauce-labs-fleece-jacket');
    await inventoryPage.addToCart('sauce-labs-onesie');
    await inventoryPage.addToCart('test.allthethings()-t-shirt-(red)');

    // Bug conocido de problem_user: solo 3 de los 6 productos responden al botón "Add to cart"
    await expect(
      inventoryPage.cartBadge,
      'El badge debería mostrar 3 con problem_user — bug conocido: solo la Backpack, Bike Light y Onesie se añaden correctamente; los otros 3 productos ignoran el clic',
    ).toHaveText('3');
  });

  test('debería verificar consistencia entre estado del botón y badge con problem_user', async ({ page }) => {
    await inventoryPage.addToCart('test.allthethings()-t-shirt-(red)');

    const removeButtonVisible = await page.locator('[data-test="remove-test.allthethings()-t-shirt-(red)"]').isVisible();
    const badgeVisible = await inventoryPage.cartBadge.isVisible();

    if (removeButtonVisible) {
      await expect(
        inventoryPage.cartBadge,
        'Si el botón "Remove" está visible, el badge debería mostrar 1 para mantener la consistencia de estado',
      ).toHaveText('1');
    } else {
      await expect(
        inventoryPage.cartBadge,
        'Si el botón "Remove" no está visible, el badge tampoco debería ser visible — inconsistencia de estado detectada con problem_user',
      ).not.toBeVisible();
    }
  });

  test('debería verificar que el carrito no contiene productos fantasma con problem_user', async ({ page }) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.addToCart('sauce-labs-bike-light');
    await inventoryPage.addToCart('sauce-labs-bolt-t-shirt');
    await inventoryPage.addToCart('sauce-labs-fleece-jacket');
    await inventoryPage.addToCart('sauce-labs-onesie');
    await inventoryPage.addToCart('test.allthethings()-t-shirt-(red)');

    const badgeText = await inventoryPage.cartBadge.isVisible()
      ? await inventoryPage.cartBadge.textContent()
      : '0';
    const expectedCount = parseInt(badgeText ?? '0', 10);

    await inventoryPage.navigateToCart();

    await expect(
      page.locator('.cart_item'),
      `El número de ítems en el carrito (${expectedCount}) debería coincidir con el valor del badge — una discrepancia indica productos fantasma con problem_user`,
    ).toHaveCount(expectedCount);
  });

  test('debería verificar el botón "Add to cart" en la página de detalle con problem_user', async ({ page }) => {
    await productDetailPage.navigate(4);

    await expect(
      page.locator('[data-test^="add-to-cart"]'),
      'El botón "Add to cart" debería ser visible en el detalle con problem_user',
    ).toBeVisible();

    await productDetailPage.addToCart();

    await expect(
      productDetailPage.cartBadge,
      'El badge debería mostrar 1 tras añadir desde el detalle con problem_user — un fallo confirma que el bug también afecta a la página de detalle',
    ).toHaveText('1');
  });
});
