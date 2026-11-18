import { Locator, Page } from '@playwright/test';

export class ProductDetailPage {
  readonly productName: Locator;
  readonly productDescription: Locator;
  readonly productPrice: Locator;
  readonly cartBadge: Locator;

  constructor(private readonly page: Page) {
    // Acotado al bloque del detalle: el inventario usa el mismo data-test y, mientras la
    // navegación termina, el locator suelto encontraba los 6 nombres (strict mode).
    this.productName = this.page.locator('.inventory_details_container [data-test="inventory-item-name"]');
    this.productDescription = this.page.locator('[data-test="inventory-item-desc"]');
    this.productPrice = this.page.locator('[data-test="inventory-item-price"]');
    this.cartBadge = this.page.locator('[data-test="shopping-cart-badge"]');
  }

  async navigate(id: number): Promise<void> {
    await this.page.goto(`/inventory-item.html?id=${id}`);
  }

  async addToCart(): Promise<void> {
    await this.page.locator('[data-test^="add-to-cart"]').click();
  }

  async removeFromCart(): Promise<void> {
    await this.page.locator('[data-test^="remove"]').click();
  }

  async backToProducts(): Promise<void> {
    await this.page.locator('[data-test="back-to-products"]').click();
  }
}
