import { chromium, type FullConfig } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { STANDARD_USER_STATE } from './scenarios';

// Inicia sesión una vez con standard_user y guarda la sesión para los specs que la usan.
// Solo corre sin DEMO_SCENARIO (ver playwright.config.ts).
export default async function globalSetup(config: FullConfig): Promise<void> {
  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL: config.projects[0].use.baseURL });
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login('standard_user', 'secret_sauce');
  await page.waitForURL('**/inventory.html');
  await page.context().storageState({ path: STANDARD_USER_STATE });
  await browser.close();
}
