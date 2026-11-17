import { Locator, Page } from '@playwright/test';

// Lab 5, caso B. Copia del Page Object del carrito tal como estuvo en pages/cart.page.ts
// hasta noviembre de 2026, con su locator roto. El proyecto ya está corregido; esta copia no.
// Es la que corriges en el Paso 4.

export class CartPage {
  readonly cartItems: Locator;

  constructor(private readonly page: Page) {
    this.cartItems = this.page.locator('[data-test="cart-item"]');
  }

  async removeItem(dataTestId: string): Promise<void> {
    await this.page.locator(`[data-test="remove-${dataTestId}"]`).click();
  }

  async continueShopping(): Promise<void> {
    await this.page.locator('[data-test="continue-shopping"]').click();
  }

  async checkout(): Promise<void> {
    await this.page.locator('[data-test="checkout"]').click();
  }
}
