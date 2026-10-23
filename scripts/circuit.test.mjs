// Fase 4: lo que deciden heal-ai.mjs y jira-tickets.mjs sin llamar a la IA, a git ni a Jira.
import { test } from "node:test";
import assert from "node:assert/strict";
import { selectGroups, buildPrompt, buildPrBody, changedFiles } from "./heal-ai.mjs";
import { buildIssue, planTickets, priorityFor } from "./jira-tickets.mjs";

const group = (id, tipo, extra = {}) => ({
    group_id: id, tipo, count: 3, confianza: "alta", evidencia: `evidencia ${id}`, accion: `acción ${id}`,
    affected_tests: [{ title: "t", file: "a.spec.ts", line: 4, browser: "chromium" }], omitted_tests: 0, sample_error: "Error: x", ...extra,
});
const grouped = {
    run_start_time: "2026-10-22T13:47:28.837Z",
    groups: [group("G001", "test_roto"), group("G002", "bug_producto"), group("G003", "test_roto"), group("G004", "flaky")],
};

test("el healer solo recibe grupos test_roto, nunca bug_producto ni flaky", () => {
    assert.deepEqual(selectGroups(grouped).map((g) => g.group_id), ["G001", "G003"]);
    assert.deepEqual(selectGroups(grouped, ["G003"]).map((g) => g.group_id), ["G003"]);
    assert.deepEqual(selectGroups(grouped, ["G002"]), [], "aunque se pida a mano un bug_producto, no se cura");
    assert.deepEqual(selectGroups(null), []);
});

test("el prompt del healer lleva el diagnóstico, los tests y las reglas que no relajan asserts", () => {
    const p = buildPrompt([grouped.groups[0]], "cascade");
    const p2 = buildPrompt([{ ...grouped.groups[0], fingerprint: 'elemento_no_encontrado|locator(\'[data-test="login-button"]\')' }]);
    assert.ok(p2.includes('[data-test="login-button"]') && p2.includes("todas sus apariciones"), "la huella y la búsqueda del locator en todo el proyecto");
    for (const s of ["G001", "evidencia G001", "acción G001", "tests/a.spec.ts:4", "DEMO_SCENARIO=cascade", "No relajes ninguna aserción", "test.skip"]) {
        assert.ok(p.includes(s), `falta "${s}"`);
    }
    assert.ok(!buildPrompt([grouped.groups[0]]).includes("DEMO_SCENARIO"));
});

test("lee las rutas de git status sin perder la primera letra", () => {
    // Caso real: el healer cambió solo un page object, que no tiene staged, así que empieza por espacio.
    assert.deepEqual(changedFiles(" M pages/login.page.ts\0"), ["pages/login.page.ts"]);
    assert.deepEqual(changedFiles(" M pages/a b.ts\0?? tests/nuevo.spec.ts\0M  tests/c.spec.ts\0"), ["pages/a b.ts", "tests/nuevo.spec.ts", "tests/c.spec.ts"]);
    assert.deepEqual(changedFiles(""), []);
});

test("la PR avisa de needs-human solo si el check encuentra algo", () => {
    const groups = [grouped.groups[0]];
    assert.match(buildPrBody({ groups, summary: "cambio", reasons: ["tests/a.spec.ts: desaparece o cambia la aserción `toHaveText('3')`"] }), /needs-human[\s\S]*toHaveText/);
    assert.match(buildPrBody({ groups, summary: "", reasons: [] }), /Sin asserts relajados/);
});

const ticket = {
    titulo: "G002: el badge muestra 2 con un producto", severidad: "bloqueante", componente: "carrito",
    descripcion: "Falla en user@example.com", pasos_para_reproducir: ["t"], solucion_sugerida: ["Corregir el contador"], etiquetas: ["playwright", "ai-triage"],
};

test("el ticket de Jira usa el formato de la API v3, con etiquetas sin espacios y texto redactado", () => {
    const { groupId, body } = buildIssue(ticket, { projectKey: "QA", runStartTime: grouped.run_start_time });
    assert.equal(groupId, "G002");
    assert.deepEqual(body.fields.project, { key: "QA" });
    assert.equal(body.fields.issuetype.name, "Bug");
    assert.deepEqual(body.fields.labels, ["playwright", "ai-triage", "severidad-bloqueante", "componente-carrito", "qa-run-20261022134728"]);
    assert.equal(body.fields.description.type, "doc");
    assert.ok(!JSON.stringify(body).includes("user@example.com"), "el email se redacta");
});

test("adjunta traza y vídeo solo de la misma ejecución que el análisis", () => {
    const report = (startTime) => ({
        stats: { startTime },
        suites: [{ specs: [{ file: "a.spec.ts", line: 4, tests: [{ projectName: "chromium", results: [{ attachments: [
            { name: "trace", path: "test-results/x/trace.zip" }, { name: "video", path: "test-results/x/video.webm" }, { name: "error-context", path: "test-results/x/error-context.md" },
        ] }] }] }] }],
    });
    const plan = (r) => planTickets({ tickets: [ticket], grouped, report: r, projectKey: "QA" })[0].attachments;
    assert.deepEqual(plan(report(grouped.run_start_time)), ["test-results/x/trace.zip", "test-results/x/video.webm"]);
    assert.deepEqual(plan(report("2026-10-01T00:00:00.000Z")), [], "de otra ejecución no se adjunta nada");
});

test("la prioridad de Jira sale de la severidad, por posición o con un mapa explícito", () => {
    // Las prioridades del sandbox THP, en el orden en que las devuelve Jira.
    const thp = ["Supone un impedimento", "Crítica", "Importante", "Poco importante"].map((name, i) => ({ id: String(i + 1), name }));
    assert.deepEqual(["bloqueante", "alta", "media", "baja"].map((s) => priorityFor(s, thp)?.name), ["Supone un impedimento", "Crítica", "Importante", "Poco importante"]);
    assert.equal(priorityFor("baja", thp.slice(0, 2)).name, "Crítica", "con menos prioridades, las menores comparten la última");
    assert.equal(priorityFor("alta", thp, "alta=Importante, media=Poco importante").name, "Importante");
    assert.equal(priorityFor("rara", thp), null);
    assert.equal(priorityFor("alta", []), null, "si el proyecto no tiene el campo, no se envía");
});
