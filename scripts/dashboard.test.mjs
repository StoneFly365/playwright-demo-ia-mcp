import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, utimesSync, cpSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readArtifact, loadRun, loadEval, buildData, buildHtml, saveSnapshot, loadHistory, normalizeTests } from "./dashboard.mjs";
import { TIPOS, groupMetrics, filterGroups, browsersOf, evalMetrics } from "./dashboard-view.mjs";
import { mergeReports } from "./merge-results.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const START = "2026-10-21T10:00:00.000Z";

const tmp = () => mkdtempSync(path.join(tmpdir(), "qa-dashboard-"));
const write = (dir, file, content) => {
    const p = path.join(dir, file);
    mkdirSync(path.dirname(p), { recursive: true });
    writeFileSync(p, typeof content === "string" ? content : JSON.stringify(content));
    return p;
};
// Fecha del fichero en el pasado, para simular un artefacto de una ejecución anterior.
const age = (p, seconds) => { const t = Date.now() / 1000 - seconds; utimesSync(p, t, t); };

const results = (stats = {}) => ({
    config: {},
    suites: [{ title: "a.spec.ts", specs: [{ title: "t", file: "a.spec.ts", line: 1, tests: [{ projectName: "chromium", status: "unexpected", results: [] }, { projectName: "firefox", status: "expected", results: [] }] }] }],
    errors: [],
    stats: { startTime: START, duration: 12000, expected: 10, unexpected: 5, skipped: 1, flaky: 2, ...stats },
});

const group = (id, tipo, extra = {}) => ({
    group_id: id, fingerprint: `valor_inesperado|locator('${id}')`, pattern: "valor_inesperado", tipo, count: 1,
    browsers: ["chromium"], affected_tests: [{ title: `test de ${id}`, file: "a.spec.ts", line: 1, browser: "chromium" }],
    omitted_tests: 0, sample_error: `Error en ${id}`, page_context: null, ...extra,
});

// Las cinco categorías actuales; los 5 fallidos y 2 flaky cuadran con results().
const grouped = (extra = {}) => ({
    generated_at: "21 de octubre de 2026 a las 12:00", source: "playwright-json",
    total_failed_tests: 5, total_flaky_tests: 2, total_groups: 5,
    run_start_time: START, provider: "claude-cli:claude-haiku-5-5", ai_requests: 4,
    groups: [
        group("G001", "test_roto", { count: 2, confianza: "alta", evidencia: "El selector cambió", accion: "Corregir el locator", browsers: ["chromium", "firefox"] }),
        group("G002", "bug_producto", { confianza: "media", evidencia: "El badge muestra 2", accion: "Abrir bug" }),
        group("G003", "entorno", { confianza: "alta", sample_error: "net::ERR_CONNECTION_REFUSED", browsers: ["webkit"] }),
        group("G004", "flaky", { count: 2 }),
        group("G005", "sin_clasificar", { count: 1 }),
    ],
    ...extra,
});

function fullDir() {
    const dir = tmp();
    age(write(dir, "test-results.json", results()), 60);
    write(dir, "playwright-report/ai-failures-grouped.json", grouped());
    write(dir, "playwright-report/ai-summary.txt", "Resumen de la IA");
    write(dir, "playwright-report/ai-corrections.md", "## G001\nCambiar el locator");
    write(dir, "playwright-report/ai-tickets.json", [{ titulo: "G002: badge", severidad: "alta", componente: "carrito", descripcion: "d", pasos_para_reproducir: ["t"], solucion_sugerida: ["s"], etiquetas: ["e2e"] }]);
    return dir;
}

test("readArtifact distingue fichero inexistente, vacío, JSON malformado y válido", () => {
    const dir = tmp();
    assert.equal(readArtifact(path.join(dir, "no.json"), { json: true }).status, "ausente");
    assert.equal(readArtifact(write(dir, "vacio.json", "  \n"), { json: true }).status, "vacio");
    assert.equal(readArtifact(write(dir, "roto.json", "{ no es json"), { json: true }).status, "json_invalido");
    assert.deepEqual(readArtifact(write(dir, "ok.json", { a: 1 }), { json: true }).value, { a: 1 });
});

test("informe válido con las cinco categorías: vínculo, origen y métricas", () => {
    const run = loadRun(fullDir());
    assert.equal(run.id, START);
    assert.deepEqual(run.warnings, []);
    assert.equal(run.artifacts.find((a) => a.name === "ai-failures-grouped.json").link, "ok");
    assert.equal(run.analysis.provider, "claude-cli:claude-haiku-5-5");
    assert.equal(run.analysis.aiRequests, 4);
    assert.deepEqual(run.tests, { startTime: START, durationMs: 12000, total: 18, passed: 10, failed: 5, skipped: 1, flaky: 2, executed: 17, browsers: ["chromium", "firefox"] });

    const g = run.analysis.groups;
    assert.deepEqual(g.map((x) => x.tipo), TIPOS);
    assert.deepEqual(g.map((x) => x.origen), ["ia", "ia", "ia", "codigo", "ninguno"]);

    const m = groupMetrics(g);
    assert.deepEqual(m.byTipo, { test_roto: 1, bug_producto: 1, entorno: 1, flaky: 1, sin_clasificar: 1 });
    assert.equal(m.groups, 5);
    assert.equal(m.testsInGroups, 7);   // tests, no grupos: 2 + 1 + 1 + 2 + 1
    assert.equal(m.codigo, 1);
    assert.equal(m.ia, 3);
    assert.equal(m.sinClasificar, 1);
    // bug_producto (confianza media) y sin_clasificar; test_roto y entorno tienen confianza alta y flaky es del código.
    assert.equal(m.pendientes, 2);
});

test("evidencias, acciones recomendadas, correcciones y tickets llegan sin regenerarse", () => {
    const run = loadRun(fullDir());
    const g1 = run.analysis.groups[0];
    assert.equal(g1.evidencia, "El selector cambió");
    assert.equal(g1.accion, "Corregir el locator");
    assert.equal(run.summary, "Resumen de la IA");
    assert.match(run.corrections, /Cambiar el locator/);
    assert.deepEqual(run.tickets[0].solucion, ["s"]);
    assert.equal(run.tickets[0].titulo, "G002: badge");
});

test("un análisis de otra ejecución no se mezcla con los tests actuales", () => {
    const dir = fullDir();
    write(dir, "playwright-report/ai-failures-grouped.json", grouped({ run_start_time: "2026-10-20T09:00:00.000Z" }));
    const run = loadRun(dir);
    assert.equal(run.analysis, null);
    assert.ok(run.warnings.some((w) => w.includes("ai-failures-grouped.json es de otra ejecución")));
});

test("informe antiguo sin run_start_time: se vincula por contadores y por fecha", () => {
    const dir = fullDir();
    const { run_start_time, provider, ai_requests, ...old } = grouped();
    write(dir, "playwright-report/ai-failures-grouped.json", old);
    let run = loadRun(dir);
    assert.equal(run.artifacts.find((a) => a.name === "ai-failures-grouped.json").link, "por_fecha");
    assert.equal(run.analysis.provider, null);
    assert.equal(run.analysis.aiRequests, null);   // no se inventa: el informe no lo trae

    write(dir, "playwright-report/ai-failures-grouped.json", { ...old, total_failed_tests: 99 });
    run = loadRun(dir);
    assert.equal(run.analysis, null);
});

test("resumen, correcciones y tickets anteriores a test-results.json no se muestran", () => {
    const dir = fullDir();
    for (const f of ["ai-summary.txt", "ai-corrections.md", "ai-tickets.json"]) age(path.join(dir, "playwright-report", f), 3600);
    const run = loadRun(dir);
    assert.equal(run.summary, null);
    assert.equal(run.corrections, null);
    assert.equal(run.tickets, null);
    assert.equal(run.warnings.length, 3);
});

test("artefactos inexistentes, vacíos o malformados no tumban el resto", () => {
    const dir = tmp();
    assert.doesNotThrow(() => loadRun(dir));
    const nothing = loadRun(dir);
    assert.equal(nothing.tests, null);
    assert.equal(nothing.analysis, null);
    assert.ok(nothing.artifacts.every((a) => a.status === "ausente"));

    age(write(dir, "test-results.json", results()), 60);
    write(dir, "playwright-report/ai-failures-grouped.json", "{ roto");
    write(dir, "playwright-report/ai-tickets.json", { no: "es un array" });
    write(dir, "playwright-report/ai-summary.txt", "");
    const run = loadRun(dir);
    assert.equal(run.tests.total, 18);
    assert.equal(run.analysis, null);
    assert.equal(run.tickets, null);
    const status = Object.fromEntries(run.artifacts.map((a) => [a.name, a.status]));
    assert.deepEqual(status, { "test-results.json": "ok", "ai-failures-grouped.json": "json_invalido", "ai-summary.txt": "vacio", "ai-corrections.md": "ausente", "ai-tickets.json": "formato_desconocido" });
});

test("informes parciales: campos opcionales ausentes y tipos fuera de la taxonomía", () => {
    const dir = tmp();
    write(dir, "ai-failures-grouped.json", { groups: [{ group_id: "G001" }, { tipo: "otra_cosa", count: 3 }, "basura"] });
    const run = loadRun(dir);
    const [a, b] = run.analysis.groups;
    assert.equal(run.analysis.groups.length, 2);
    assert.deepEqual([a.tipo, a.origen, a.confianza, a.evidencia, a.count, a.browsers], ["sin_clasificar", "ninguno", null, null, 0, []]);
    assert.equal(b.id, "#2");
    assert.equal(b.tipo, "sin_clasificar");
    assert.ok(run.warnings.some((w) => w.includes("no traen un tipo")));
    // Sin test-results.json el análisis se muestra, pero avisando de que no se puede vincular.
    assert.ok(run.warnings.some((w) => w.includes("falta test-results.json")));
    assert.equal(normalizeTests({ suites: [] }), null);
});

test("filtros y búsqueda: categoría, origen, navegador, test y error, combinables", () => {
    const g = loadRun(fullDir()).analysis.groups;
    const ids = (f) => filterGroups(g, f).map((x) => x.id);
    assert.equal(ids({}).length, 5);
    assert.deepEqual(ids({ tipo: "bug_producto" }), ["G002"]);
    assert.deepEqual(ids({ origen: "codigo" }), ["G004"]);
    assert.deepEqual(ids({ browser: "firefox" }), ["G001"]);
    assert.deepEqual(ids({ browser: "webkit" }), ["G003"]);
    assert.deepEqual(ids({ test: "TEST DE G005" }), ["G005"]);
    assert.deepEqual(ids({ error: "err_connection" }), ["G003"]);
    assert.deepEqual(ids({ tipo: "test_roto", browser: "webkit" }), []);
    assert.deepEqual(browsersOf(g), ["chromium", "firefox", "webkit"]);
});

test("evaluación existente: ai-eval.json, ai-eval.md antiguo o ninguna", () => {
    const dir = tmp();
    assert.equal(loadEval(dir).eval, null);

    write(dir, "ai-eval.md", "# Acierto de la IA\n11 de 11");
    assert.match(loadEval(dir).eval.markdown, /11 de 11/);

    write(dir, "ai-eval.json", {
        generated_at: "2026-10-21T12:00:00.000Z", provider: "gemini:gemini-flash-latest", browser: "chromium",
        totals: { ok_groups: 3, all_groups: 4, ok_tests: 70, all_tests: 105, not_evaluated: 1 },
        scenarios: [
            { name: "cascade", expected: "test_roto", decided_by: "ia", groups: [{ group_id: "G001", tipo: "test_roto", count: 70 }], seconds: 23, report_ok: true },
            { name: "bug", expected: "bug_producto", decided_by: "ia", groups: [{ group_id: "G001", tipo: "test_roto", count: 35 }], seconds: 30, report_ok: true },
            { name: "flaky", expected: "flaky", decided_by: "codigo", groups: [{ group_id: "G001", tipo: "flaky", count: 70 }], seconds: 19, report_ok: true },
        ],
    });
    const ev = loadEval(dir).eval;
    assert.deepEqual(ev.scenarios.map((s) => [s.name, s.hits, s.decidedBy]), [["cascade", 1, "ia"], ["bug", 0, "ia"], ["flaky", 1, "codigo"]]);
    const m = evalMetrics(ev);
    assert.equal(m.pctGroups, 75);
    assert.equal(m.pctTests, 67);
    assert.equal(m.notEvaluated, 1);
});

test("historial: guarda una copia por ejecución y nunca la sobrescribe", () => {
    const history = tmp();
    const run = loadRun(fullDir());
    assert.equal(saveSnapshot(history, "runs", run), "guardado");
    assert.equal(saveSnapshot(history, "runs", { ...run, tests: null }), "ya_existe");
    assert.equal(saveSnapshot(history, "runs", { ...run, id: null }), "sin_id");
    write(history, "runs/roto.json", "{");
    const loaded = loadHistory(history);
    assert.equal(loaded.runs.length, 1);
    assert.equal(loaded.runs[0].tests.total, 18);   // la primera copia, intacta
    assert.equal(loaded.runs[0].source, "historial");
    assert.equal(loaded.warnings.length, 1);
});

test("historial: las copias se guardan redactadas y una copia editada a mano no rompe la carga", () => {
    const history = tmp();
    const run = loadRun(fullDir());
    run.analysis.groups[0].error = "Authorization: Bearer abc.def.ghi";
    saveSnapshot(history, "runs", run);
    assert.ok(!readFileSync(path.join(history, "runs", `${START.replace(/[^\w-]/g, "-")}.json`), "utf8").includes("abc.def.ghi"));

    write(history, "runs/editada.json", {
        schema: 1, id: "2026-01-01T00:00:00.000Z",
        tests: { total: "muchos" }, analysis: { groups: [null, { tipo: 5, tests: "no", browsers: [1] }] }, tickets: [{ pasos: "x" }], artifacts: "no",
    });
    write(history, "evals/editada.json", { schema: 1, id: "2026-01-01T00:00:00.000Z", scenarios: [{ groups: [null] }] });
    const { runs, evals } = loadHistory(history);
    const bad = runs.find((r) => r.id === "2026-01-01T00:00:00.000Z");
    assert.equal(bad.tests, null);
    assert.deepEqual(bad.analysis.groups.map((g) => [g.tipo, g.tests, g.browsers]), [["sin_clasificar", [], []]]);
    assert.deepEqual(bad.tickets[0].pasos, []);
    assert.deepEqual(bad.artifacts, []);
    assert.doesNotThrow(() => groupMetrics(bad.analysis.groups));
    assert.deepEqual(evals[0].scenarios[0].groups, []);
    assert.equal(evalMetrics(evals[0]).pctGroups, null);
});

test("la demo no lee el historial y queda marcada como demo", () => {
    const history = tmp();
    const other = loadRun(fullDir());
    saveSnapshot(history, "runs", { ...other, id: "2026-01-01T00:00:00.000Z" });

    const real = buildData({ dir: fullDir(), historyDir: history });
    assert.equal(real.mode, "real");
    assert.equal(real.runs.length, 2);

    const demo = buildData({ dir: fullDir(), demo: true, historyDir: history });
    assert.equal(demo.mode, "demo");
    assert.deepEqual(demo.runs.map((r) => r.source), ["demo"]);
});

test("el HTML escapa los datos y no puede conectarse a la red", () => {
    const dir = fullDir();
    write(dir, "playwright-report/ai-failures-grouped.json", grouped({
        groups: [group("G001", "test_roto", { sample_error: "</script><img src=x onerror=alert(1)>", evidencia: "token: abc123 y $& $1" })],
    }));
    const html = buildHtml(buildData({ dir, historyDir: tmp() }));
    assert.ok(!html.includes("<img src=x"));
    assert.ok(!html.includes("abc123"), "el redactor de triage.mjs se vuelve a aplicar");
    assert.match(html, /default-src 'none'/);
    assert.ok(!html.includes("innerHTML"));
    // El script de la página (con dashboard-view.mjs incrustado) debe compilar.
    assert.doesNotThrow(() => new vm.Script(html.split("<script>")[1].split("</script>")[0]));
    const json = html.match(/<script type="application\/json" id="qa-data">(.*?)<\/script>/s)[1];
    const data = JSON.parse(json);
    assert.equal(data.runs[0].analysis.groups[0].error, "</script><img src=x onerror=alert(1)>");
    assert.match(data.runs[0].analysis.groups[0].evidencia, /\$& \$1/);
});

test("la visualización no llama a modelos ni necesita claves", () => {
    // Ni el adaptador, ni la lógica de vista, ni la página contienen llamadas de red o a procesos.
    for (const f of ["dashboard.mjs", "dashboard-view.mjs", "dashboard.html"]) {
        const src = readFileSync(path.join(HERE, f), "utf8");
        for (const bad of ["fetch(", "XMLHttpRequest", "WebSocket", "sendBeacon", "child_process", "spawn", "anthropic.com", "googleapis", "API_KEY"]) {
            assert.ok(!src.includes(bad), `${f} contiene ${bad}`);
        }
    }
    const imports = [...readFileSync(path.join(HERE, "dashboard.mjs"), "utf8").matchAll(/^import .* from "(.+)";$/gm)].map((m) => m[1]);
    assert.deepEqual(imports, ["node:fs", "node:path", "node:url", "./dashboard-view.mjs", "./triage.mjs"]);
    // Y la CLI funciona con un entorno sin ninguna clave de IA.
    const dir = fullDir();
    const out = path.join(dir, "dash.html");
    const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/API_KEY|ANTHROPIC|GEMINI|OPENROUTER/i.test(k)));
    const r = spawnSync(process.execPath, [path.join(HERE, "dashboard.mjs"), "--dir", dir, "--out", out], { cwd: dir, env, encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr);
    assert.ok(existsSync(out));
});

test("compatibilidad: resultados unidos con merge-results.mjs", () => {
    const merged = mergeReports([results({ expected: 3, unexpected: 1 }), results({ expected: 2, unexpected: 0, flaky: 1, startTime: "2026-10-21T09:59:00.000Z" })]);
    const t = normalizeTests(merged);
    assert.equal(t.passed, 5);
    assert.equal(t.failed, 1);
    assert.equal(t.startTime, "2026-10-21T09:59:00.000Z");
});

// report-ai.mjs con un `claude` falso: comprueba los campos nuevos sin llamar a ningún proveedor.
const FAKE_SPAWN = `
import cp from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
import { EventEmitter } from "node:events";
import { appendFileSync } from "node:fs";
cp.spawn = (cmd, args) => {
    const child = new EventEmitter();
    child.stdout = new EventEmitter();
    child.stderr = new EventEmitter();
    let input = "";
    child.stdin = { write: (s) => { input += s; }, end: () => setImmediate(() => {
        appendFileSync("prompts-input.log", input + "\\n---\\n");
        const prompt = args[1];
        const out = prompt.includes("clasificar cada grupo")
            ? JSON.stringify(JSON.parse(input).map((g) => ({ group_id: g.group_id, tipo: "test_roto", confianza: "alta", evidencia: "e", accion: "a" })))
            : prompt.includes("ticket") ? "[]" : "texto";
        child.stdout.emit("data", Buffer.from(out));
        child.emit("close", 0);
    }) };
    return child;
};
syncBuiltinESMExports();
`;

test("compatibilidad: report-ai.mjs añade run_start_time, provider y ai_requests sin enviarlos a la IA", () => {
    const dir = tmp();
    cpSync(path.join(HERE, "..", "prompts"), path.join(dir, "prompts"), { recursive: true });
    write(dir, "fake-spawn.mjs", FAKE_SPAWN);
    const error = `Error: badge\n\nexpect(locator).toHaveText(expected) failed\n\nLocator:  locator('[data-test="shopping-cart-badge"]')\nExpected: "1"\nReceived: "2"`;
    write(dir, "test-results.json", {
        config: {}, errors: [], stats: { startTime: START, duration: 1, expected: 0, unexpected: 1, skipped: 0, flaky: 0 },
        suites: [{ specs: [{ title: "t", file: "a.spec.ts", line: 1, tests: [{ projectName: "chromium", status: "unexpected", results: [{ errors: [{ message: error }], attachments: [] }] }] }] }],
    });
    const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/API_KEY|AI_/i.test(k)));
    const r = spawnSync(process.execPath, ["--import", "./fake-spawn.mjs", path.join(HERE, "report-ai.mjs")], { cwd: dir, env, encoding: "utf8" });
    assert.equal(r.status, 0, r.stdout + r.stderr);

    const out = JSON.parse(readFileSync(path.join(dir, "playwright-report/ai-failures-grouped.json"), "utf8"));
    assert.equal(out.run_start_time, START);
    assert.equal(out.provider, "claude-cli:claude-haiku-5-5");
    assert.equal(out.ai_requests, 3);   // clasificación, resumen y correcciones; sin bug_producto no hay tickets
    assert.equal(out.groups[0].tipo, "test_roto");
    const sent = readFileSync(path.join(dir, "prompts-input.log"), "utf8");
    assert.ok(!/run_start_time|ai_requests|provider|startTime/.test(sent), "los metadatos no viajan en los prompts");

    // Y el dashboard lo vincula a la ejecución.
    assert.equal(loadRun(dir).artifacts.find((a) => a.name === "ai-failures-grouped.json").link, "ok");
});
