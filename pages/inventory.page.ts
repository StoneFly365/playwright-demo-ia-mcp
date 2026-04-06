import { Locator, Page } from '@playwright/test';

export class InventoryPage {
  readonly cartBadge: Locator;

  constructor(private readonly page: Page) {
    this.cartBadge = this.page.locator('[data-test="shopping-cart-badge"]');
  }

  async addToCart(dataTestId: string): Promise<void> {
    await this.page.locator(`[data-test="add-to-cart-${dataTestId}"]`).click();
  }
}
