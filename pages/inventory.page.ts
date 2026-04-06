import { Locator, Page } from '@playwright/test';

export class InventoryPage {
  readonly cartBadge: Locator;
  readonly inventoryItems: Locator;

  constructor(private readonly page: Page) {
    this.cartBadge = this.page.locator('[data-test="shopping-cart-badge"]');
    this.inventoryItems = this.page.locator('[data-test="inventory-item"]');
  }

  async addToCart(dataTestId: string): Promise<void> {
    await this.page.locator(`[data-test="add-to-cart-${dataTestId}"]`).click();
  }

  async removeFromCart(dataTestId: string): Promise<void> {
    await this.page.locator(`[data-test="remove-${dataTestId}"]`).click();
  }

  async sortBy(option: string): Promise<void> {
    await this.page.locator('[data-test="product-sort-container"]').selectOption(option);
  }

  async getProductNames(): Promise<string[]> {
    return this.page.locator('[data-test="inventory-item-name"]').allTextContents();
  }

  async getProductPrices(): Promise<string[]> {
    return this.page.locator('[data-test="inventory-item-price"]').allTextContents();
  }

  async navigateToProduct(name: string): Promise<void> {
    await this.page.locator('[data-test="inventory-item-name"]', { hasText: name }).click();
  }

  async navigateToCart(): Promise<void> {
    await this.page.locator('[data-test="shopping-cart-link"]').click();
  }
}
