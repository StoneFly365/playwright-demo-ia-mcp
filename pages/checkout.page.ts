import { Locator, Page } from '@playwright/test';

export class CheckoutPage {
  readonly errorMessage: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;

  constructor(private readonly page: Page) {
    this.errorMessage = this.page.locator('[data-test="error"]');
    this.subtotalLabel = this.page.locator('[data-test="subtotal-label"]');
    this.taxLabel = this.page.locator('[data-test="tax-label"]');
    this.totalLabel = this.page.locator('[data-test="total-label"]');
  }

  async fillInfo(firstName: string, lastName: string, zip: string): Promise<void> {
    await this.page.locator('[data-test="firstName"]').fill(firstName);
    await this.page.locator('[data-test="lastName"]').fill(lastName);
    await this.page.locator('[data-test="postalCode"]').fill(zip);
  }

  async continue(): Promise<void> {
    await this.page.locator('[data-test="continue"]').click();
  }

  async cancel(): Promise<void> {
    await this.page.locator('[data-test="cancel"]').click();
  }

  async finish(): Promise<void> {
    await this.page.locator('[data-test="finish"]').click();
  }

  async backHome(): Promise<void> {
    await this.page.locator('[data-test="back-to-products"]').click();
  }
}
