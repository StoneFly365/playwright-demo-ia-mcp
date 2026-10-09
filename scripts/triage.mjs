#!/usr/bin/env node
// Triaje determinista (capa 1), sin IA ni red. Lee el JSON de Playwright, nunca lo modifica.
//   node scripts/triage.mjs [test-results.json] [--out playwright-report/triage.json]
//   node scripts/triage.mjs --validate diagnosticos.json [--report playwright-report/triage.json]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { triageReport, contractProblems, sha256, TriageInputError } from "./triage/core.mjs";

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };

export function loadAndTriage(input) {
    const raw = readFileSync(input, "utf8");
    let report;
    try { report = JSON.parse(raw); } catch (e) { throw new TriageInputError(`${input} no es JSON válido: ${e.message}`); }
    const repoRoot = report.config?.configFile ? path.dirname(report.config.configFile) : process.cwd();
    const testDir = report.config?.rootDir ?? path.join(repoRoot, "tests");
    return triageReport(report, {
        readSource: (file) => readFileSync(path.join(testDir, file), "utf8"),
        roots: [repoRoot, testDir],
        sourceHash: sha256(raw),
    });
}

function validate(file) {
    const data = JSON.parse(readFileSync(file, "utf8"));
    const list = Array.isArray(data) ? data : data.diagnoses ?? [data];
    const reportFile = opt("--report", "playwright-report/triage.json");
    const known = existsSync(reportFile) ? new Map(JSON.parse(readFileSync(reportFile, "utf8")).diagnoses.map((d) => [d.test_id, d])) : null;
    let bad = 0;
    for (const d of list) {
        const p = contractProblems(d);
        // Cada cita tiene que estar en el fichero que nombra o en los hechos del triaje de ese test.
        for (const e of d.evidence ?? []) {
            const inFile = existsSync(e.source) && readFileSync(e.source, "utf8").includes(e.quote);
            const inFacts = known?.get(d.test_id) && JSON.stringify(known.get(d.test_id).facts).includes(JSON.stringify(e.quote).slice(1, -1));
            if (!inFile && !inFacts) p.push(`cita no verificable en ${e.source}: «${String(e.quote).slice(0, 60)}»`);
        }
        if (known && !known.has(d.test_id)) p.push("test_id que no está en el triaje");
        if (p.length) { bad++; console.log(`✗ ${d.test_id ?? "(sin test_id)"}\n  - ${p.join("\n  - ")}`); }
    }
    console.log(`${list.length - bad}/${list.length} diagnósticos cumplen el contrato${known ? "" : " (sin triage.json: citas solo contra ficheros)"}.`);
    return bad ? 1 : 0;
}

function main() {
    if (args.includes("--validate")) return validate(opt("--validate"));
    const input = args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--")) ?? "test-results.json";
    const out = opt("--out", "playwright-report/triage.json");
    const triage = loadAndTriage(input);
    mkdirSync(path.dirname(out), { recursive: true });
    writeFileSync(out, JSON.stringify(triage, null, 2) + "\n", "utf8");

    const s = triage.summary;
    const lines = [
        `Triaje (reglas, sin IA) de ${s.total} tests → ${out}`,
        ...Object.entries(s).filter(([k, v]) => !["total", "requires_human_review", "from_ai"].includes(k) && v).map(([k, v]) => `  ${k.padEnd(20)} ${v}`),
        `  requieren revisión humana: ${s.requires_human_review}`,
        ...(triage.run.errors.length ? [`  errores de ejecución: ${triage.run.errors.length} (${triage.run.classification})`] : []),
    ];
    console.log(lines.join("\n"));
    return 0;
}

// Solo como CLI: report-ai.mjs importa loadAndTriage.
if (process.argv[1]?.endsWith("triage.mjs")) {
    try { process.exitCode = main(); }
    catch (e) { console.error(`❌ ${e.message}`); process.exitCode = e instanceof TriageInputError ? 2 : 1; }
}
