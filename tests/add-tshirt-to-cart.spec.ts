import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';

test.describe('Carrito de compra', () => {
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
  });

  test('debería añadir la Sauce Labs Bolt T-Shirt al carrito tras el login', async () => {
    await inventoryPage.addToCart('sauce-labs-bolt-t-shirt');

    await expect(
      inventoryPage.cartBadge,
      'El badge del carrito debería mostrar 1 tras añadir la Sauce Labs Bolt T-Shirt',
    ).toHaveText('1');
  });

  test('debería añadir múltiples productos al carrito', async () => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.addToCart('sauce-labs-bike-light');

    await expect(
      inventoryPage.cartBadge,
      'El badge del carrito debería mostrar 2 tras añadir la Sauce Labs Backpack y la Sauce Labs Bike Light',
    ).toHaveText('2');
  });

  test('debería mostrar el número correcto en el badge del carrito', async () => {
    await inventoryPage.addToCart('sauce-labs-onesie');
    await inventoryPage.addToCart('sauce-labs-fleece-jacket');
    await inventoryPage.addToCart('sauce-labs-bolt-t-shirt');

    await expect(
      inventoryPage.cartBadge,
      'El badge del carrito debería mostrar 3 tras añadir tres productos distintos',
    ).toHaveText('3');
  });

  test('debería eliminar un producto desde el inventario', async () => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.removeFromCart('sauce-labs-backpack');

    await expect(
      inventoryPage.cartBadge,
      'El badge del carrito no debería ser visible tras eliminar el único producto añadido desde la página de inventario',
    ).not.toBeVisible();
  });

  test('debería eliminar un producto desde el carrito', async () => {
    await inventoryPage.addToCart('sauce-labs-bolt-t-shirt');
    await inventoryPage.navigateToCart();
    await cartPage.removeItem('sauce-labs-bolt-t-shirt');

    await expect(
      cartPage.cartItems,
      'El carrito debería estar vacío tras eliminar el único producto desde la página del carrito',
    ).toHaveCount(0);
  });

  test('debería volver al inventario al pulsar "Continuar comprando"', async ({ page }) => {
    await inventoryPage.navigateToCart();
    await cartPage.continueShopping();

    await expect(
      page,
      'El usuario debería ser redirigido a la página de inventario tras pulsar "Continuar comprando"',
    ).toHaveURL(/.*\/inventory\.html$/);
  });
});
