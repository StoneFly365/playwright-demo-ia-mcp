import { test, expect, standardUserSession } from '../fixtures/scenarios';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { MenuPage } from '../pages/menu.page';

test.use(standardUserSession);

test.describe('Menú lateral', () => {
  let inventoryPage: InventoryPage;
  let menuPage: MenuPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    menuPage = new MenuPage(page);
    await loginPage.loginAsStandardUser();
  });

  test('TC-MENU-01 debería cerrar sesión al pulsar Logout', { tag: '@demo-fail' }, async ({ page }) => {
    await menuPage.logout();

    // ⚠️ FALLO INTENCIONADO: Cambiar '/inventory.html' por '/' para revertir
    await expect(
      page,
      'El usuario debería ser redirigido a la página de login tras cerrar sesión',
    ).toHaveURL('/inventory.html');
    await expect(
      page.getByRole('button', { name: 'Login' }),
      'El botón de login debería ser visible tras cerrar sesión, confirmando que la sesión se ha cerrado correctamente',
    ).toBeVisible();
  });

  test('TC-MENU-02 debería resetear el estado del carrito al pulsar Reset App State', async () => {
    await inventoryPage.addToCart('sauce-labs-backpack');

    await expect(
      inventoryPage.cartBadge,
      'El badge del carrito debería mostrar 1 tras añadir la Sauce Labs Backpack, como precondición del reset',
    ).toHaveText('1');

    await menuPage.resetAppState();

    await expect(
      inventoryPage.cartBadge,
      'El badge del carrito no debería ser visible tras resetear el estado de la aplicación desde el menú lateral',
    ).not.toBeVisible();
  });
});
