#!/usr/bin/env node
// Dashboard local de QA Intelligence. Lee los artefactos que ya existen (test-results.json y los
// ai-* de playwright-report/) y genera una página HTML estática con los datos dentro.
// Solo lee ficheros: no ejecuta tests, no llama a ningún modelo y no necesita claves.
// Uso: npm run dashboard [-- --save] [-- --demo] [-- --dir <carpeta>] [-- --out <fichero.html>]
import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TIPOS } from "./dashboard-view.mjs";
import { redact } from "./triage.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const SCHEMA = 1;
export const HISTORY_DIR = "qa-history";
const DEMO_DIR = "learning/ruta-qa/ejemplos";
const AI_TIPOS = new Set(["test_roto", "bug_producto", "entorno"]);
const CONFIANZAS = new Set(["alta", "media", "baja"]);

const str = (v) => (typeof v === "string" && v.trim() ? v : null);
const int = (v) => (Number.isInteger(v) && v >= 0 ? v : null);
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const list = (v) => (Array.isArray(v) ? v : []);
const strings = (v) => list(v).map(str).filter(Boolean);

// Un artefacto ausente o roto no tumba el dashboard: se anota su estado y se sigue con el resto.
export function readArtifact(file, { json = false } = {}) {
    const name = path.basename(file);
    if (!existsSync(file)) return { name, status: "ausente" };
    let text, mtime;
    try {
        text = readFileSync(file, "utf8");
        mtime = statSync(file).mtimeMs;
    } catch (e) {
        return { name, status: "ilegible", detail: e.message };
    }
    if (!text.trim()) return { name, status: "vacio", mtime };
    if (!json) return { name, status: "ok", value: text, mtime };
    try {
        return { name, status: "ok", value: JSON.parse(text), mtime };
    } catch (e) {
        return { name, status: "json_invalido", detail: e.message, mtime };
    }
}

// Contadores del reporter JSON de Playwright (o de merge-results.mjs). Son tests × navegador.
export function normalizeTests(report) {
    const s = report?.stats;
    if (!isObj(s)) return null;
    const n = (k) => (Number.isFinite(s[k]) ? s[k] : 0);
    const passed = n("expected"), failed = n("unexpected"), skipped = n("skipped"), flaky = n("flaky");
    const total = passed + failed + skipped + flaky;
    const browsers = new Set();
    const walk = (suite) => {
        for (const spec of list(suite?.specs)) for (const t of list(spec?.tests)) if (str(t?.projectName)) browsers.add(t.projectName);
        list(suite?.suites).forEach(walk);
    };
    list(report.suites).forEach(walk);
    return { startTime: str(s.startTime), durationMs: n("duration"), total, passed, failed, skipped, flaky, executed: total - skipped, browsers: [...browsers].sort() };
}

export function normalizeGroup(g, i) {
    const id = str(g?.group_id) ?? `#${i + 1}`;
    const tipo = TIPOS.includes(g?.tipo) ? g.tipo : "sin_clasificar";
    // En el triage solo el código asigna flaky; los otros tres tipos los asigna la IA.
    const origen = tipo === "flaky" ? "codigo" : AI_TIPOS.has(tipo) ? "ia" : "ninguno";
    const confianza = CONFIANZAS.has(g?.confianza) ? g.confianza : null;
    const tests = list(g?.affected_tests).filter(isObj).map((t) => ({
        title: str(t.title) ?? "(sin título)", file: str(t.file), line: int(t.line), browser: str(t.browser),
    }));
    const browsers = strings(g?.browsers);
    return {
        id,
        fingerprint: str(g?.fingerprint),
        pattern: str(g?.pattern),
        tipo,
        origen,
        confianza,
        evidencia: str(g?.evidencia),
        accion: str(g?.accion),
        count: int(g?.count) ?? tests.length,
        tests,
        omittedTests: int(g?.omitted_tests) ?? 0,
        browsers: browsers.length ? browsers : [...new Set(tests.map((t) => t.browser).filter(Boolean))],
        error: str(g?.sample_error),
        pageContext: str(g?.page_context),
        // Los artefactos no guardan un estado de revisión: se marca lo que una persona debería mirar antes de actuar.
        pendienteRevision: tipo === "sin_clasificar" || (origen === "ia" && confianza !== "alta"),
    };
}

export function normalizeAnalysis(raw, warnings) {
    const groups = list(raw.groups).filter(isObj);
    const unknown = groups.filter((g) => !TIPOS.includes(g.tipo)).length;
    if (unknown) warnings.push(`${unknown} grupos de ai-failures-grouped.json no traen un tipo de la taxonomía (informe antiguo o clasificación fallida): se muestran como sin_clasificar.`);
    return {
        generatedAt: str(raw.generated_at),
        runStartTime: str(raw.run_start_time),
        provider: str(raw.provider),
        aiRequests: int(raw.ai_requests),
        failedTests: int(raw.total_failed_tests),
        flakyTests: int(raw.total_flaky_tests),
        groups: groups.map(normalizeGroup),
    };
}

// ¿El análisis es de la misma ejecución que test-results.json? Desde esta versión report-ai.mjs guarda
// run_start_time; en informes anteriores se comparan los contadores y la fecha de los ficheros.
export function linkGrouped(tests, testsMtime, raw, mtime) {
    if (!tests) return "sin_verificar";
    if (str(raw.run_start_time) && tests.startTime) return raw.run_start_time === tests.startTime ? "ok" : "otra_ejecucion";
    const countsDiffer = (int(raw.total_failed_tests) ?? tests.failed) !== tests.failed
        || (int(raw.total_flaky_tests) ?? tests.flaky) !== tests.flaky;
    return countsDiffer ? "otra_ejecucion" : linkByDate(tests, testsMtime, mtime);
}

// ai-summary.txt, ai-corrections.md y ai-tickets.json no llevan identificador: solo queda la fecha del fichero.
export function linkByDate(tests, testsMtime, mtime) {
    if (!tests || !testsMtime || !mtime) return "sin_verificar";
    return mtime < testsMtime ? "otra_ejecucion" : "por_fecha";
}

function normalizeTicket(t) {
    return {
        titulo: str(t.titulo) ?? "(sin título)",
        severidad: str(t.severidad),
        componente: str(t.componente),
        descripcion: str(t.descripcion),
        pasos: strings(t.pasos_para_reproducir),
        solucion: strings(t.solucion_sugerida),
        etiquetas: strings(t.etiquetas),
    };
}

const reportDirOf = (dir) => (existsSync(path.join(dir, "playwright-report")) ? path.join(dir, "playwright-report") : dir);

export function loadRun(dir = ".", { source = "local" } = {}) {
    const reportDir = reportDirOf(dir);
    const artifacts = [];
    const warnings = [];
    const read = (file, opts) => { const a = readArtifact(file, opts); artifacts.push(a); return a; };

    const results = read(path.join(dir, "test-results.json"), { json: true });
    const tests = results.status === "ok" ? normalizeTests(results.value) : null;
    if (results.status === "ok" && !tests) results.status = "formato_desconocido";
    const testsMtime = tests ? results.mtime : null;

    let analysis = null;
    const grouped = read(path.join(reportDir, "ai-failures-grouped.json"), { json: true });
    if (grouped.status === "ok" && !(isObj(grouped.value) && Array.isArray(grouped.value.groups))) grouped.status = "formato_desconocido";
    if (grouped.status === "ok") {
        grouped.link = linkGrouped(tests, testsMtime, grouped.value, grouped.mtime);
        if (grouped.link !== "otra_ejecucion") analysis = normalizeAnalysis(grouped.value, warnings);
    }

    const linked = (name, json) => {
        const a = read(path.join(reportDir, name), { json });
        if (a.status !== "ok") return null;
        a.link = linkByDate(tests, testsMtime, a.mtime);
        return a.link === "otra_ejecucion" ? null : a.value;
    };
    const summary = linked("ai-summary.txt");
    const corrections = linked("ai-corrections.md");
    const rawTickets = linked("ai-tickets.json", true);
    const ticketsArtifact = artifacts.at(-1);
    if (rawTickets && !Array.isArray(rawTickets)) ticketsArtifact.status = "formato_desconocido";
    const tickets = Array.isArray(rawTickets) ? rawTickets.filter(isObj).map(normalizeTicket) : null;

    for (const a of artifacts) {
        if (a.link === "otra_ejecucion") warnings.push(`${a.name} es de otra ejecución distinta de test-results.json: no se muestra para no mezclar resultados.`);
        if (a.link === "sin_verificar" && tests === null) warnings.push(`${a.name} no se puede vincular a una ejecución porque falta test-results.json.`);
        if (["json_invalido", "ilegible", "formato_desconocido"].includes(a.status)) warnings.push(`${a.name} no se ha podido usar (${a.status}): se ignora y el resto del dashboard sigue.`);
    }

    return {
        schema: SCHEMA,
        id: tests?.startTime ?? analysis?.runStartTime ?? null,
        source,
        tests,
        analysis,
        summary,
        corrections,
        tickets,
        artifacts: artifacts.map(({ name, status, link }) => ({ name, status, link: link ?? null })),
        warnings,
    };
}

export function normalizeEval(raw) {
    if (!isObj(raw) || !Array.isArray(raw.scenarios)) return null;
    const t = isObj(raw.totals) ? raw.totals : {};
    return {
        schema: SCHEMA,
        id: str(raw.generated_at),
        generatedAt: str(raw.generated_at),
        provider: str(raw.provider),
        browser: str(raw.browser),
        totals: {
            okGroups: int(t.ok_groups) ?? 0, allGroups: int(t.all_groups) ?? 0,
            okTests: int(t.ok_tests) ?? 0, allTests: int(t.all_tests) ?? 0,
            notEvaluated: int(t.not_evaluated) ?? 0,
        },
        scenarios: raw.scenarios.filter(isObj).map((s) => {
            const expected = TIPOS.includes(s.expected) ? s.expected : null;
            const groups = list(s.groups).filter(isObj).map((g) => ({
                id: str(g.group_id), tipo: TIPOS.includes(g.tipo) ? g.tipo : "sin_clasificar", count: int(g.count) ?? 0,
            }));
            return {
                name: str(s.name) ?? "?",
                expected,
                decidedBy: s.decided_by === "codigo" ? "codigo" : "ia",
                groups,
                hits: groups.filter((g) => g.tipo === expected).length,
                seconds: Number.isFinite(s.seconds) ? s.seconds : null,
                reportOk: s.report_ok !== false,
            };
        }),
    };
}

// ai-eval.json lo escribe eval-ai.mjs desde esta versión; de evaluaciones anteriores solo queda el .md.
export function loadEval(dir = ".") {
    const reportDir = reportDirOf(dir);
    const json = readArtifact(path.join(reportDir, "ai-eval.json"), { json: true });
    const ev = json.status === "ok" ? normalizeEval(json.value) : null;
    if (json.status === "ok" && !ev) json.status = "formato_desconocido";
    const artifacts = [{ name: json.name, status: json.status, link: null }];
    if (ev) return { eval: ev, artifacts };
    const md = readArtifact(path.join(reportDir, "ai-eval.md"));
    artifacts.push({ name: md.name, status: md.status, link: null });
    return { eval: md.status === "ok" ? { schema: SCHEMA, id: null, markdown: md.value } : null, artifacts };
}

// El historial es una carpeta local de ficheros JSON, uno por ejecución o evaluación. Nunca se sobrescribe.
export const snapshotPath = (historyDir, kind, id) => path.join(historyDir, kind, `${id.replace(/[^\w-]/g, "-")}.json`);

export function saveSnapshot(historyDir, kind, item) {
    if (!item?.id) return "sin_id";
    const file = snapshotPath(historyDir, kind, item.id);
    if (existsSync(file)) return "ya_existe";
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(redactDeep(item), null, 2) + "\n", "utf8");
    return "guardado";
}

// Una copia del historial puede estar editada a mano o venir de otra versión: se vuelve a pasar por
// los mismos normalizadores que los artefactos, para que un campo raro no deje la página en blanco.
function reviveRun(v) {
    const t = isObj(v.tests) ? v.tests : null;
    const counts = ["durationMs", "total", "passed", "failed", "skipped", "flaky", "executed"];
    const a = isObj(v.analysis) ? v.analysis : null;
    return {
        ...v,
        tests: t && counts.every((k) => Number.isFinite(t[k])) ? { ...t, startTime: str(t.startTime), browsers: strings(t.browsers) } : null,
        analysis: a && {
            generatedAt: str(a.generatedAt), runStartTime: str(a.runStartTime), provider: str(a.provider),
            aiRequests: int(a.aiRequests), failedTests: int(a.failedTests), flakyTests: int(a.flakyTests),
            groups: list(a.groups).filter(isObj).map((g, i) => normalizeGroup({
                group_id: g.id, fingerprint: g.fingerprint, pattern: g.pattern, tipo: g.tipo, confianza: g.confianza,
                evidencia: g.evidencia, accion: g.accion, count: g.count, affected_tests: g.tests, omitted_tests: g.omittedTests,
                browsers: g.browsers, sample_error: g.error, page_context: g.pageContext,
            }, i)),
        },
        summary: str(v.summary),
        corrections: str(v.corrections),
        tickets: Array.isArray(v.tickets) ? v.tickets.filter(isObj).map((t) => normalizeTicket({
            ...t, pasos_para_reproducir: t.pasos, solucion_sugerida: t.solucion,
        })) : null,
        artifacts: list(v.artifacts).filter(isObj).map((x) => ({ name: String(x.name), status: String(x.status), link: str(x.link) })),
        warnings: strings(v.warnings),
        source: "historial",
    };
}

function reviveEval(v) {
    const t = isObj(v.totals) ? v.totals : {};
    const ev = normalizeEval({
        generated_at: v.id, provider: v.provider, browser: v.browser,
        totals: { ok_groups: t.okGroups, all_groups: t.allGroups, ok_tests: t.okTests, all_tests: t.allTests, not_evaluated: t.notEvaluated },
        scenarios: list(v.scenarios).filter(isObj).map((s) => ({
            name: s.name, expected: s.expected, decided_by: s.decidedBy, seconds: s.seconds, report_ok: s.reportOk,
            groups: list(s.groups).filter(isObj).map((g) => ({ group_id: g.id, tipo: g.tipo, count: g.count })),
        })),
    });
    return { ...ev, source: "historial" };
}

export function loadHistory(historyDir) {
    const warnings = [];
    const load = (kind, revive) => {
        const dir = path.join(historyDir, kind);
        if (!existsSync(dir)) return [];
        return readdirSync(dir).filter((f) => f.endsWith(".json")).sort().reverse().flatMap((f) => {
            const a = readArtifact(path.join(dir, f), { json: true });
            if (a.status === "ok" && isObj(a.value) && a.value.schema === SCHEMA && str(a.value.id)) return [revive(a.value)];
            warnings.push(`${kind}/${f} del historial no se ha podido leer (${a.status === "ok" ? "formato_desconocido" : a.status}).`);
            return [];
        });
    };
    return { runs: load("runs", reviveRun), evals: load("evals", reviveEval), warnings };
}

// Defensa en profundidad: los artefactos nuevos ya vienen redactados por triage.mjs, los antiguos quizá no.
function redactDeep(v) {
    if (typeof v === "string") return redact(v);
    if (Array.isArray(v)) return v.map(redactDeep);
    if (isObj(v)) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, redactDeep(x)]));
    return v;
}

// JSON dentro de <script type="application/json">: sin "<" no hay forma de cerrar la etiqueta desde un dato.
export function embedJson(value) {
    return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function buildHtml(data) {
    const template = readFileSync(path.join(HERE, "dashboard.html"), "utf8");
    const view = readFileSync(path.join(HERE, "dashboard-view.mjs"), "utf8").replace(/^export /gm, "");
    // Reemplazo con función: un "$&" dentro de los datos no se interpreta como patrón.
    return template
        .replace("/*__QA_VIEW__*/", () => view)
        .replace("__QA_DATA__", () => embedJson(redactDeep(data)));
}

const byIdDesc = (a, b) => String(b.id).localeCompare(String(a.id));

export function buildData({ dir = ".", demo = false, historyDir = HISTORY_DIR } = {}) {
    const current = loadRun(dir, { source: demo ? "demo" : "local" });
    const { eval: currentEval, artifacts } = loadEval(dir);
    current.artifacts.push(...artifacts);
    // La demo no lee ni escribe el historial: sus datos no se mezclan con los reales.
    const history = demo ? { runs: [], evals: [], warnings: [] } : loadHistory(historyDir);
    return {
        schema: SCHEMA,
        generatedAt: new Date().toISOString(),
        mode: demo ? "demo" : "real",
        sourceDir: path.relative(process.cwd(), path.resolve(dir)).replaceAll("\\", "/") || ".",
        runs: [current, ...history.runs.filter((r) => r.id !== current.id).sort(byIdDesc)],
        evals: [currentEval, ...history.evals.filter((e) => e.id !== currentEval?.id).sort(byIdDesc)].filter(Boolean),
        warnings: history.warnings,
        current,
        currentEval,
    };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const args = process.argv.slice(2);
    const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
    const demo = args.includes("--demo");
    const dir = demo ? DEMO_DIR : opt("--dir") ?? ".";
    const out = opt("--out") ?? `playwright-report/qa-dashboard${demo ? "-demo" : ""}.html`;

    const { current, currentEval, ...data } = buildData({ dir, demo });
    if (args.includes("--save")) {
        if (demo) {
            console.log("👉 --save se ignora en modo demo: los datos de ejemplo no entran en el historial.");
        } else {
            const save = (kind, item, what) => {
                const status = saveSnapshot(HISTORY_DIR, kind, item);
                console.log(status === "guardado" ? `👉 ${what} guardada en ${snapshotPath(HISTORY_DIR, kind, item.id)}`
                    : status === "ya_existe" ? `⚠️  Ya hay una copia de esta ${what.toLowerCase()} en ${snapshotPath(HISTORY_DIR, kind, item.id)}: no se sobrescribe. Bórrala si quieres rehacerla (por ejemplo, tras volver a generar los informes).`
                    : `⚠️  ${what} sin identificador (falta test-results.json o solo hay ai-eval.md): no se guarda en el historial.`);
            };
            save("runs", current, "Ejecución");
            if (currentEval) save("evals", currentEval, "Evaluación");
        }
    }
    for (const w of [...current.warnings, ...data.warnings]) console.log(`⚠️  ${w}`);
    mkdirSync(path.dirname(out), { recursive: true });
    writeFileSync(out, buildHtml(data), "utf8");
    console.log(`✅ Dashboard generado: ${out}\n   Ábrelo en el navegador: no necesita servidor, conexión ni claves de IA.`);
}
