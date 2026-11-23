import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { checkAgainst, extractAssertions, findRelaxations, REF, SCOPE } from "./guard-asserts.mjs";

// Mismo estilo que tests/cart-badge.spec.ts: expect en varias líneas con mensaje propio.
const BASE = `
  test('badge con 4 productos', async () => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    // ⚠️ FALLO INTENCIONADO: Cambiar '3' por '4' para revertir
    await expect(
      inventoryPage.cartBadge,
      'El badge debería mostrar 4 tras añadir cuatro productos',
    ).toHaveText('3');
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });
`;
const edit = (from, to) => BASE.replace(from, to);
const relax = (after) => findRelaxations("tests/a.spec.ts", BASE, after);

test("extrae matcher y argumentos, no el sujeto ni los comentarios", () => {
    assert.deepEqual(extractAssertions(BASE), [
        "toHaveText('3')",
        "toHaveURL('https://www.saucedemo.com/inventory.html')",
        "toBeVisible()",
    ]);
    assert.deepEqual(extractAssertions("await expect(x).not.toBeVisible(); expect.soft(y, 'a (b)').toHaveCount(2)"),
        ["not.toBeVisible()", "toHaveCount(2)"]);
});

test("cambiar el locator no es relajar: es lo que hace el healer con un test_roto", () => {
    assert.deepEqual(relax(edit("login-button", "login-submit")), []);
    assert.deepEqual(relax(edit("inventoryPage.cartBadge", "inventoryPage.badge")), []);
    assert.deepEqual(relax(BASE + "\n    await expect(page).toHaveTitle('Swag Labs');"), [], "añadir aserciones está bien");
});

test("cambiar el valor esperado, borrar un expect o añadir .not pide revisión humana", () => {
    assert.match(relax(edit("toHaveText('3')", "toHaveText('4')"))[0], /toHaveText\('3'\)/);
    assert.equal(relax(edit("await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');", "")).length, 1);
    assert.match(relax(edit(").toBeVisible()", ").not.toBeVisible()"))[0], /toBeVisible\(\)/);
});

test("skip, fixme, fail, timeouts y test.slow piden revisión humana", () => {
    assert.match(relax(edit("test('badge", "test.skip('badge"))[0], /skip/);
    assert.match(relax(edit("test('badge", "test.fixme('badge"))[0], /skip/);
    assert.ok(relax(edit(").toHaveText('3')", ").toHaveText('3', { timeout: 30_000 })")).some((r) => /timeout/.test(r)));
    assert.match(relax(edit("async () => {", "async () => {\n    test.slow();"))[0], /timeout/);
});

test("borrar un fichero o tocar la configuración pide revisión humana; un fichero nuevo, no", () => {
    assert.equal(findRelaxations("tests/a.spec.ts", BASE, null).length, 1);
    assert.equal(findRelaxations("playwright.config.ts", "retries: 0", "retries: 3").length, 1);
    assert.deepEqual(findRelaxations("tests/b.spec.ts", null, BASE), []);
});

test("solo vigila tests, page objects, fixtures y la configuración", () => {
    assert.ok(["tests/a.spec.ts", "pages/login.page.ts", "fixtures/scenarios.ts", "playwright.config.ts"].every((f) => SCOPE.test(f)));
    assert.ok(!["README.md", "scripts/report-ai.mjs", "learning/tests/a.spec.ts"].some((f) => SCOPE.test(f)));
});

test("una ref base que empieza por \"-\" no se toma como opción de git", () => {
    // El mensaje de git varía según la versión y el entorno: lo que importa es que falle y no escriba nada.
    assert.throws(() => checkAgainst("--output=guard-pwned.txt"));
    assert.ok(!existsSync("guard-pwned.txt"), "git no debe tomar la ref como --output");
});

test("acepta las refs que usan el guard y el healer y rechaza lo que no es una ref", () => {
    assert.ok(["origin/main", "main", "HEAD~1", "HEAD^", "main@{1}", "a638cb544f3eb5b91b1a472b2384008a67e91895", "feat/x-y_z.1"].every((r) => REF.test(r)));
    assert.ok(!["", "-x", "--output=x", "main x", "main\n--output=x", "/etc/passwd", "a;b"].some((r) => REF.test(r)));
    assert.throws(() => checkAgainst("main --output=x"), /Ref base no válida/);
});
