import { Page } from '@playwright/test';

export class MenuPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.locator('#react-burger-menu-btn').click();
  }

  async logout(): Promise<void> {
    await this.open();
    await this.page.locator('#logout_sidebar_link').click();
  }

  async resetAppState(): Promise<void> {
    await this.open();
    await this.page.locator('#reset_sidebar_link').click();
    await this.page.locator('#react-burger-cross-btn').click();
  }
}
