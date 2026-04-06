import { Locator, Page } from '@playwright/test';

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
