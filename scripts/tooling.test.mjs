// Pruebas de coverage-map y guard-assertions sin ejecutar Playwright: node --test "scripts/**/*.test.mjs"
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCoverage } from "./coverage-map.mjs";
import { oracleChanges } from "./guard-assertions.mjs";

test("coverage-map: nivel por escenario, ficheros inexistentes e ids huérfanos", () => {
    const { rows, unknownIds } = buildCoverage({
        scenariosMd: "#### AB-01 · Uno\n#### AB-02 · Dos\n#### AB-03 · Tres\n#### AB-04 · Cuatro",
        matrixMd: [
            "| F | AB-01 Uno | Alto | P0 | `a.spec.ts` | AUTOMATED | PASS |",
            "| F | AB-02 Dos | Alto | P0 | `a.spec.ts` | AUTOMATED | PASS |",
            "| F | AB-03 Tres | Alto | P0 | `borrado.spec.ts` | AUTOMATED | PASS |",
        ].join("\n"),
        listed: [{ file: "app/a.spec.ts", line: 1, title: "t1" }],
        readSpec: () => "test('t1', async () => {\n  // AB-01\n});\n// AB-02 fuera de cualquier test listado\ntest.skip('no listado', () => {\n  // ZZ-01\n});",
        specExists: (f) => f === "a.spec.ts",
    });
    const by = Object.fromEntries(rows.map((r) => [r.id, r]));
    assert.equal(by["AB-01"].level, "test-body");
    assert.equal(by["AB-02"].level, "file-only");  // el comentario no está dentro del cuerpo de un test listado
    assert.match(by["AB-02"].issues.join(), /AUTOMATED pero ningún test/);
    assert.match(by["AB-03"].issues.join(), /ficheros inexistentes: borrado\.spec\.ts/);
    assert.match(by["AB-04"].issues.join(), /no está en la matriz/);
    assert.deepEqual(unknownIds, []);  // ZZ-01 está en un test que Playwright no lista
});

test("guard-assertions: marca aserciones, test.fail y test-data; deja pasar el resto", () => {
    const diff = [
        "--- a/tests/app/x.spec.ts", "+++ b/tests/app/x.spec.ts",
        "-    await expect(total).toHaveText('650 €');",
        "+    await expect(total).toHaveText('600 €');",
        "-    test.fail();",
        "+    await app.page.getByRole('button', { name: 'Guardar' }).click();",
        "--- a/test-data/app/datos.ts", "+++ b/test-data/app/datos.ts",
        "+  importe: 12,",
        "--- a/README.md", "+++ b/README.md",
        "+expect( en la documentación no cuenta",
    ].join("\n");
    const hits = oracleChanges(diff);
    assert.equal(hits.length, 4);
    assert.ok(!hits.some((h) => h.includes("getByRole")));
    assert.ok(!hits.some((h) => h.startsWith("README")));
});

test("coverage-map sobre el repositorio real: sin ids huérfanos y PRE-03 incluye los tests de D16", async () => {
    // Regresión de la discrepancia PRE-03b: los tests @bug-D16 son los datos 79,99/99,99 de PRE-03.
    // Sin Playwright: los tests "listados" salen de las declaraciones del código fuente.
    const { readFileSync, readdirSync } = await import("node:fs");
    const { scenarioIdsByTestLine } = await import("./triage/core.mjs");
    const dir = new URL("../tests/finanzas-pareja/", import.meta.url);
    const sources = Object.fromEntries(readdirSync(dir).filter((f) => f.endsWith(".spec.ts"))
        .map((f) => [`finanzas-pareja/${f}`, readFileSync(new URL(f, dir), "utf8")]));
    const listed = Object.entries(sources).flatMap(([file, src]) =>
        [...scenarioIdsByTestLine(src).keys()].map((line) => ({ file, line, title: src.split(/\r?\n/)[line - 1].trim() })));
    const spec = (name) => readFileSync(new URL(`../specs/finanzas-pareja/${name}`, import.meta.url), "utf8");
    const { rows, unknownIds } = buildCoverage({
        scenariosMd: spec("test-scenarios.md"), matrixMd: spec("coverage-matrix.md"),
        listed, readSpec: (f) => sources[f], specExists: (f) => `finanzas-pareja/${f}` in sources,
    });
    assert.deepEqual(unknownIds, []);
    const pre03 = rows.find((r) => r.id === "PRE-03");
    assert.ok(pre03.tests.some((t) => t.includes("@bug-D16") || /con \$\{gastado\} € de 100 €/.test(t)), pre03.tests.join("\n"));
    assert.deepEqual(rows.filter((r) => r.issues.length).map((r) => r.id), []);
});
