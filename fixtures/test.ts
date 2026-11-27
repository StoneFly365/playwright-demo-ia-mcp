import { test as base, expect } from '@playwright/test';

// Punto de entrada único de los tests: importan test y expect de aquí, no de '@playwright/test'.
// Los fixtures del proyecto (page objects, sesión, datos) se añaden en este extend.
export const test = base.extend({});
export { expect };
