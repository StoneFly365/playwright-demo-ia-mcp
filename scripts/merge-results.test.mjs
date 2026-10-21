import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeReports } from "./merge-results.mjs";

// Misma forma que produce Playwright con --project=X: un árbol de suites/specs,
// cada spec con los tests de un único navegador.
const fileReport = (project, status) => ({
    config: { version: "1.58.2" },
    errors: [],
    stats: {
        startTime: `2026-10-21T10:00:0${project.length % 10}.000Z`,
        duration: project.length * 1000,
        expected: status === "passed" ? 1 : 0,
        skipped: 0,
        unexpected: status === "failed" ? 1 : 0,
        flaky: 0,
    },
    suites: [{
        title: "a.spec.ts", file: "a.spec.ts", line: 0, column: 0, specs: [],
        suites: [{
            title: "Grupo", file: "a.spec.ts", line: 3, column: 7,
            specs: [{
                title: "test 1", file: "a.spec.ts", line: 4, column: 7, ok: status === "passed", tags: [],
                tests: [{ projectName: project, results: [{ status, errors: [] }] }],
            }],
            suites: [],
        }],
    }],
});

test("mergeReports concatena los tests de cada navegador en el mismo spec", () => {
    const merged = mergeReports([
        fileReport("chromium", "passed"),
        fileReport("firefox", "failed"),
        fileReport("webkit", "passed"),
    ]);
    const tests = merged.suites[0].suites[0].specs[0].tests;
    assert.equal(tests.length, 3);
    assert.deepEqual(tests.map((t) => t.projectName).sort(), ["chromium", "firefox", "webkit"]);
    assert.equal(tests.find((t) => t.projectName === "firefox").results[0].status, "failed");
});

test("mergeReports suma los contadores y toma la duración del navegador más lento", () => {
    const merged = mergeReports([
        fileReport("chromium", "passed"),
        fileReport("firefox", "failed"),
        fileReport("webkit", "passed"),
    ]);
    assert.equal(merged.stats.expected, 2);
    assert.equal(merged.stats.unexpected, 1);
    assert.equal(merged.stats.duration, 8000); // "chromium" tiene 8 letras: el más lento del fixture
    assert.equal(merged.stats.startTime, "2026-10-21T10:00:06.000Z");
});

test("mergeReports conserva specs que solo existen en algunos ficheros", () => {
    const withExtra = fileReport("chromium", "passed");
    withExtra.suites[0].suites[0].specs.push({
        title: "test solo en chromium", file: "a.spec.ts", line: 10, column: 7, ok: true, tags: [],
        tests: [{ projectName: "chromium", results: [{ status: "passed", errors: [] }] }],
    });
    const merged = mergeReports([withExtra, fileReport("firefox", "passed")]);
    const specs = merged.suites[0].suites[0].specs;
    assert.equal(specs.length, 2);
    assert.equal(specs.find((s) => s.title === "test solo en chromium").tests.length, 1);
});

test("mergeReports une los errores de arranque de cada fichero", () => {
    const a = fileReport("chromium", "passed");
    a.errors = [{ message: "fallo al lanzar chromium" }];
    const merged = mergeReports([a, fileReport("firefox", "passed")]);
    assert.equal(merged.errors.length, 1);
});
