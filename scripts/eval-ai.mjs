#!/usr/bin/env node
// Mide cuánto acierta la IA: ejecuta cada escenario de fixtures/scenarios.ts en chromium,
// lanza report:ai y compara el tipo de cada grupo con specs/ai-golden.json.
// Uso: npm run eval:ai [-- cascade bug ...]   (sin argumentos, todos los escenarios)
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const REPORT_DIR = "playwright-report";
const golden = JSON.parse(readFileSync("specs/ai-golden.json", "utf8")).scenarios;
const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(golden);

function playwrightArgs(name) {
    // Reintentos fijos: en CI la config pone 2 y triplicaría el tiempo de los escenarios que fallan siempre.
    const retries = name === "flaky" ? "--retries=1" : "--retries=0";
    if (name === "demo-fail") return ["--grep", "@demo-fail", retries];
    return ["--grep-invert", "@demo-fail", retries];
}

function run(cmd, env = {}) {
    // shell: true para que npx funcione en Windows; todos los argumentos son literales de este fichero.
    return spawnSync(cmd, { shell: true, stdio: "inherit", env: { ...process.env, ...env } });
}

const rows = [];
for (const name of names) {
    if (!golden[name]) throw new Error(`Escenario sin respuesta esperada en specs/ai-golden.json: ${name}`);
    console.log(`\n=== ${name}`);
    const scenario = name === "demo-fail" ? {} : { DEMO_SCENARIO: name };
    // Los reporters de playwright.config.ts ya escriben test-results.json; el informe HTML no se abre.
    run(`npx playwright test --project=chromium ${playwrightArgs(name).join(" ")}`, { ...scenario, PLAYWRIGHT_HTML_OPEN: "never" });

    const start = Date.now();
    const report = run("node scripts/report-ai.mjs");
    const seconds = (Date.now() - start) / 1000;

    let groups = [];
    try {
        groups = JSON.parse(readFileSync(`${REPORT_DIR}/ai-failures-grouped.json`, "utf8")).groups;
    } catch {
        // Sin grupos el escenario cuenta como fallo de la evaluación, no aborta el resto.
    }
    rows.push({ name, expected: golden[name].expected, groups, seconds, reportOk: report.status === 0 });
}

// Aciertos por grupo y por test: un grupo grande mal clasificado pesa más que uno pequeño.
const ai = rows.filter((r) => r.expected !== "flaky");
const sum = (list, fn) => list.reduce((n, x) => n + fn(x), 0);
const okGroups = sum(ai, (r) => r.groups.filter((g) => g.tipo === r.expected).length);
const allGroups = sum(ai, (r) => Math.max(r.groups.length, 1));
const okTests = sum(ai, (r) => sum(r.groups.filter((g) => g.tipo === r.expected), (g) => g.count));
const allTests = sum(ai, (r) => sum(r.groups, (g) => g.count));
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

const lines = [
    `# Acierto de la IA clasificando fallos`,
    ``,
    `**La IA clasifica bien ${okGroups} de ${allGroups} grupos (${pct(okGroups, allGroups)} %), que cubren ${okTests} de ${allTests} tests fallados (${pct(okTests, allTests)} %).**`,
    ``,
    `Proveedor: ${process.env.GEMINI_API_KEY ? "Gemini (gemini-flash-latest)" : "Claude CLI (claude-haiku-5-5)"} · navegador: chromium · ${new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid", dateStyle: "long", timeStyle: "short" })}`,
    ``,
    `| Escenario | Esperado | Grupos | Clasificación obtenida | Acierto | Tiempo del reporte |`,
    `|---|---|---|---|---|---|`,
    ...rows.map((r) => {
        const got = r.groups.map((g) => `${g.group_id} ${g.tipo} (${g.count})`).join(", ") || "sin grupos";
        const hits = r.groups.filter((g) => g.tipo === r.expected).length;
        const mark = r.groups.length && hits === r.groups.length ? "✅" : "❌";
        const who = r.expected === "flaky" ? " (código)" : "";
        return `| \`${r.name}\` | ${r.expected}${who} | ${r.groups.length} | ${got} | ${mark} ${hits}/${r.groups.length} | ${r.seconds.toFixed(0)} s${r.reportOk ? "" : " ⚠️"} |`;
    }),
    ``,
    `El escenario \`flaky\` no cuenta en la cifra: lo clasifica el código, no la IA. ⚠️ indica que report:ai terminó con error (por ejemplo, cuota agotada).`,
];
mkdirSync(REPORT_DIR, { recursive: true });
writeFileSync(`${REPORT_DIR}/ai-eval.md`, lines.join("\n") + "\n", "utf8");
console.log("\n" + lines.join("\n"));
