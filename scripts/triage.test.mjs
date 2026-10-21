import { test } from "node:test";
import assert from "node:assert/strict";
import { fingerprint, groupFailures, redact, isOnlyFlaky } from "./triage.mjs";

// Mensajes reales de los escenarios de fixtures/scenarios.ts (sin ANSI, recortados).
const CLICK_TIMEOUT = `TimeoutError: locator.click: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('[data-test="login-button"]')`;
const NOT_VISIBLE = `Error: El botón de login debería ser visible

expect(locator).toBeVisible() failed

Locator: locator('[data-test="login-button"]')
Expected: visible
Received: <element(s) not found>`;
const BADGE = (msg, expected, received) => `Error: ${msg}

expect(locator).toHaveText(expected) failed

Locator:  locator('[data-test="shopping-cart-badge"]')
Expected: "${expected}"
Received: "${received}"`;
const URL = (expected) => `Error: Redirección

expect(page).toHaveURL(expected) failed

Expected pattern: ${expected}
Received string:  "https://www.saucedemo.com/inventory.html"`;

test("cascade: timeout de acción y toBeVisible sobre el mismo locator son la misma causa", () => {
    assert.equal(fingerprint(CLICK_TIMEOUT).key, fingerprint(NOT_VISIBLE).key);
    assert.equal(fingerprint(CLICK_TIMEOUT).pattern, "elemento_no_encontrado");
});

test("bug: mensajes personalizados distintos sobre el mismo locator se agrupan", () => {
    const a = fingerprint(BADGE("El badge debería mostrar 1", "1", "2"));
    const b = fingerprint(BADGE("El badge del carrito debería mostrar 5 tras añadir cinco", "5", "6"));
    assert.equal(a.key, b.key);
    assert.equal(a.pattern, "valor_inesperado");
});

test("expect sobre page con expectativas distintas son causas distintas", () => {
    assert.notEqual(fingerprint(URL("/.*\\/home\\.html$/")).key, fingerprint(URL("/.*\\/cart\\.html$/")).key);
});

test("env: el error de red es el mismo en chromium y firefox", () => {
    const chromium = fingerprint("Error: page.goto: net::ERR_CONNECTION_REFUSED at https://www.saucedemo.com/");
    const firefox = fingerprint("Error: page.goto: NS_ERROR_CONNECTION_REFUSED");
    assert.equal(chromium.key, firefox.key);
    assert.equal(chromium.pattern, "red");
});

test("timeout de navegación sin locator", () => {
    assert.equal(fingerprint("TimeoutError: page.goto: Timeout 10000ms exceeded.").key, "timeout|page.goto");
});

test("groupFailures separa flaky, cuenta navegadores y ordena por tamaño", () => {
    const f = (title, project, error, flaky = false) =>
        ({ title, file: "a.spec.ts", line: 1, project, flaky, attempts: flaky ? 2 : 1, error, errorContextPath: null });
    const groups = groupFailures([
        f("t1", "chromium", CLICK_TIMEOUT),
        f("t2", "firefox", NOT_VISIBLE),
        f("t3", "chromium", CLICK_TIMEOUT),
        f("t4", "chromium", CLICK_TIMEOUT, true),
    ]);
    assert.equal(groups.length, 2);
    assert.deepEqual(
        groups.map((g) => [g.group_id, g.count, g.tipo]),
        [["G001", 3, null], ["G002", 1, "flaky"]],
    );
    assert.deepEqual(groups[0].browsers.sort(), ["chromium", "firefox"]);
});

test("groupFailures redacta también huella, títulos, ficheros y errores largos", () => {
    const token = "eyJhbGciOi.eyJzdWIiOi.c2lnbmF0dXJl";
    const [g] = groupFailures([{
        title: "login de ana@empresa.com",
        file: "C:\\Users\\ana\\repo\\a.spec.ts",
        line: 1, project: "chromium", flaky: false, attempts: 1, errorContextPath: null,
        // El token cruza el corte de 1500 caracteres: hay que redactar antes de recortar.
        error: `TimeoutError: locator.click: Timeout 10000ms exceeded.\nCall log:\n  - waiting for locator('[data-user="ana@empresa.com"]')\n${"x".repeat(1372)} ${token}`,
    }]);
    const sent = JSON.stringify(g);
    for (const secret of ["ana@empresa.com", "\\\\Users\\\\ana", "eyJhbGciOi", "eyJzdWIiOi"]) {
        assert.ok(!sent.includes(secret), secret);
    }
});

test("isOnlyFlaky", () => {
    const f = (flaky) => ({ flaky });
    assert.equal(isOnlyFlaky([]), false);
    assert.equal(isOnlyFlaky([f(true), f(true)]), true);
    assert.equal(isOnlyFlaky([f(true), f(false)]), false);
    assert.equal(isOnlyFlaky([f(false)]), false);
});

test("redact enmascara datos sensibles", () => {
    const cases = [
        ["contacto: ana.garcia@empresa.com", "contacto: [EMAIL]"],
        ["GET https://api.x.com/v1/user?id=42&session=abc", "GET https://api.x.com/v1/user?[REDACTED]"],
        ["Authorization: Bearer abc.def", "Authorization: [REDACTED]"],
        ["headers: { auth: 'Bearer eyJhbGciOi' }", "headers: { auth: 'Bearer [REDACTED]' }"],
        ["token=eyJhbGci.eyJzdWIi.c2lnbmF0dXJl", "token=[REDACTED]"],
        ["Cookie: session=123; theme=dark", "Cookie: [REDACTED]"],
        ["password: hunter2", "password: [REDACTED]"],
        [`await page.locator('#user').fill("ana@x.com")`, `await page.locator('#user').fill("[REDACTED]")`],
        [`    - textbox "Password" [ref=e5]: secret_sauce`, `    - textbox "Password" [ref=e5]: [REDACTED]`],
        [String.raw`at C:\Users\raul.molina\Documents\repo\tests\a.spec.ts:51:7`, String.raw`at ~\Documents\repo\tests\a.spec.ts:51:7`],
        ["at /home/runner/work/repo/tests/a.spec.ts:51", "at ~/work/repo/tests/a.spec.ts:51"],
    ];
    for (const [input, expected] of cases) assert.equal(redact(input), expected, input);
});

test("redact no toca lo que no es sensible", () => {
    const safe = `import { test } from '@playwright/test';\n- button "Login" [ref=e9]\nExpected: "5"\nExpected pattern: /.*\\/home\\.html$/`;
    assert.equal(redact(safe), safe);
});
