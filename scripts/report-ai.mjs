#!/usr/bin/env node
// Informe IA de una ejecución de Playwright.
//  1. Triaje determinista (scripts/triage.mjs): clasifica cada test sin IA.
//  2. Solo los fallos que las reglas no resuelven van a la IA, con los hechos mínimos y redactados.
//     Su respuesta se valida contra el contrato antes de usarla (scripts/triage/core.mjs).
//  3. Resumen, correcciones y tickets a partir de los grupos, nunca del test-results.json crudo.
// Playwright decide qué pasa y qué falla; este informe no cambia ningún resultado.
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { loadAndTriage } from "./triage.mjs";
import { applyAiDiagnoses, groupDiagnoses, summarize } from "./triage/core.mjs";
import { runAi, currentModel } from "./ai-provider.mjs";

const REPORT_DIR = "playwright-report";
const INPUT_JSON = "test-results.json";
const NOT_ACTIONABLE = ["KNOWN_DEFECT"];  // ya registrados: van al resumen, no a correcciones ni tickets

function log(msg)     { console.log(`👉 ${msg}`); }
function success(msg) { console.log(`✅ ${msg}`); }
function errorLog(msg){ console.error(`❌ ${msg}`); }

const promptVersion = (name, text) => `${name}@${createHash("sha256").update(text).digest("hex").slice(0, 12)}`;

async function main() {
    log("Iniciando AI Reporting Pipeline...");
    await mkdir(REPORT_DIR, { recursive: true });

    // 1️⃣ Triaje determinista
    const triage = loadAndTriage(INPUT_JSON);
    const s = triage.summary;
    log(`Triaje: ${s.total} total · ${s.PASSED} correctos · ${s.KNOWN_DEFECT} defectos conocidos · ${s.INCONCLUSIVE} sin resolver · ${s.ENVIRONMENT_FAILURE} de entorno · ${s.UNEXPECTED_PASS} pasan inesperadamente · ${s.FLAKY_FAILURE} flaky`);

    // 2️⃣ IA solo para lo que las reglas no resuelven
    const open = triage.diagnoses.filter((d) => d.needs_ai);
    const warnings = [];
    if (open.length) {
        const pTriage = await readFile("prompts/ai-triage.txt", "utf8");
        const cases = JSON.stringify({ cases: open.map((d) => d.facts) });
        let resolved;
        try {
            const raw = await runAi(pTriage, cases, `Triaje de ${open.length} fallos sin resolver`);
            resolved = applyAiDiagnoses(open, raw, { model: currentModel(), promptVersion: promptVersion("ai-triage", pTriage) });
        } catch (e) {
            // Sin IA, los casos se quedan como INCONCLUSIVE de las reglas: el informe sigue.
            resolved = applyAiDiagnoses(open, "", { model: null, promptVersion: null });
            resolved.warnings.push(`IA no disponible: ${e.message.split("\n")[0]}`);
        }
        warnings.push(...resolved.warnings);
        const byId = new Map(resolved.diagnoses.map((d) => [d.test_id, d]));
        triage.diagnoses = triage.diagnoses.map((d) => byId.get(d.test_id) ?? d);
        triage.summary = summarize(triage.diagnoses);
    }
    triage.warnings = warnings;
    for (const w of warnings) log(`Aviso: ${w}`);

    const groups = groupDiagnoses(triage.diagnoses);
    const grouped = {
        generated_at: new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid", dateStyle: "long", timeStyle: "short" }),
        source: "triage",
        stats: triage.summary,
        run_errors: triage.run.errors.length,
        total_groups: groups.length,
        groups,
    };
    await writeOutput(path.join(REPORT_DIR, "triage.json"), JSON.stringify(triage, null, 2));
    await writeOutput(path.join(REPORT_DIR, "failures-grouped.json"), JSON.stringify(grouped, null, 2));

    // 3️⃣ Resumen · Correcciones · Tickets — en paralelo
    const actionable = { ...grouped, groups: groups.filter((g) => !NOT_ACTIONABLE.includes(g.classification)) };
    const [pSummary, pCorrections, pTickets] = await Promise.all([
        readFile("prompts/ai-summary.txt", "utf8"),
        readFile("prompts/ai-corrections.txt", "utf8"),
        readFile("prompts/ai-tickets.txt", "utf8"),
    ]);

    log("Generando resumen, correcciones y tickets en paralelo...");
    const none = Promise.resolve(null);
    const [summaryTxt, correctionsMd, ticketsRaw] = await Promise.all([
        runAi(pSummary, JSON.stringify(grouped), "Resumen ejecutivo"),
        actionable.groups.length ? runAi(pCorrections, JSON.stringify(actionable), "Posibles correcciones") : none,
        actionable.groups.length ? runAi(pTickets, JSON.stringify(actionable), "Tickets Jira") : none,
    ]);

    let ticketsClean = "[]";
    if (ticketsRaw !== null) {
        ticketsClean = stripMarkdownFences(ticketsRaw);
        if (!Array.isArray(safeJson(ticketsClean))) {
            throw new Error("ai-tickets.json no es un array JSON válido.\nPrimeros 500 chars:\n" + ticketsClean.slice(0, 500));
        }
    }

    await Promise.all([
        writeOutput(path.join(REPORT_DIR, "ai-summary.txt"), summaryTxt),
        writeOutput(path.join(REPORT_DIR, "ai-corrections.md"),
            correctionsMd ?? "# Posibles Correcciones – Playwright E2E\n\nNo hay fallos accionables: todo lo que falla es un defecto conocido."),
        writeOutput(path.join(REPORT_DIR, "ai-tickets.json"), ticketsClean),
    ]);

    success("AI Reporting finalizado correctamente 🎉");
}

const safeJson = (s) => { try { return JSON.parse(s); } catch { return undefined; } };

function stripMarkdownFences(s) {
    const t = (s ?? "").trim();
    if (/^```json/i.test(t)) return t.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    if (/^```/.test(t))      return t.replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    return t;
}

async function writeOutput(filePath, content) {
    await writeFile(filePath, content + "\n", "utf8");
    success(`Generado: ${filePath}`);
}

main().catch((e) => {
    errorLog(e.message);
    process.exit(1);
});
