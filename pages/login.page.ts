import { Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    this.errorMessage = this.page.locator('[data-test="error"]');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/');
  }

  async login(username: string, password: string): Promise<void> {
    await this.page.locator('[data-test="username"]').fill(username);
    await this.page.locator('[data-test="password"]').fill(password);
    await this.page.locator('[data-test="login-button"]').click();
  }

  // Con la sesión de storageState va directo al inventario; sin ella, entra por el formulario.
  async loginAsStandardUser(): Promise<void> {
    const cookies = await this.page.context().cookies();
    if (cookies.some((c) => c.name === 'session-username')) {
      await this.page.goto('/inventory.html');
      return;
    }
    await this.navigate();
    await this.login('standard_user', 'secret_sauce');
  }
}
