#!/usr/bin/env node
import { readFile, mkdir, writeFile, access } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";

const REPORT_DIR = "playwright-report";
const INPUT_JSON = "test-results.json";
const MODEL = "claude-haiku-4-5-20251001";

function log(msg)     { console.log(`👉 ${msg}`); }
function success(msg) { console.log(`✅ ${msg}`); }
function errorLog(msg){ console.error(`❌ ${msg}`); }

async function main() {
    log("Iniciando AI Reporting Pipeline...");
    await mkdir(REPORT_DIR, { recursive: true });

    if (!(await exists(INPUT_JSON))) {
        throw new Error(`No existe ${INPUT_JSON}. Ejecuta primero npm run test`);
    }

    const testResultsRaw = await readFile(INPUT_JSON, "utf8");
    const testResults = JSON.parse(testResultsRaw);
    const stats = extractStats(testResults);

    log(`Estadísticas: ${stats.total} total · ${stats.passed} pasaron · ${stats.failed} fallaron · ${stats.skipped} omitidas · ${stats.flaky} flaky`);

    // 1️⃣ Agrupar fallos
    const pGroup = await readFile("prompts/ai-group-failures.txt", "utf8");
    const groupedRaw = await runClaude(pGroup, testResultsRaw, "Agrupación de fallos");
    const groupedClean = stripMarkdownFences(groupedRaw);

    let grouped;
    try {
        grouped = JSON.parse(groupedClean);
    } catch {
        throw new Error(
            "La respuesta de Claude para agrupación de fallos no es JSON válido.\n" +
            "Primeros 500 chars:\n" + groupedClean.slice(0, 500)
        );
    }

    // 2️⃣ Resumen · Correcciones · Tickets — en paralelo
    const [pSummary, pCorrections, pTickets] = await Promise.all([
        readFile("prompts/ai-summary.txt", "utf8"),
        readFile("prompts/ai-corrections.txt", "utf8"),
        readFile("prompts/ai-tickets.txt", "utf8"),
    ]);

    log("Generando resumen, correcciones y tickets en paralelo...");

    const summaryInput = JSON.stringify({ stats, grouped });
    const groupedText  = JSON.stringify(grouped);

    const [summaryTxt, correctionsMd, ticketsRaw] = await Promise.all([
        runClaude(pSummary,     summaryInput, "Resumen ejecutivo"),
        runClaude(pCorrections, groupedText,  "Posibles correcciones"),
        runClaude(pTickets,     groupedText,  "Tickets Jira"),
    ]);

    const ticketsClean = stripMarkdownFences(ticketsRaw);
    try {
        JSON.parse(ticketsClean);
    } catch {
        throw new Error(
            "ai-tickets.json no es JSON válido.\nPrimeros 500 chars:\n" + ticketsClean.slice(0, 500)
        );
    }

    await Promise.all([
        writeOutput(path.join(REPORT_DIR, "ai-summary.txt"),             summaryTxt),
        writeOutput(path.join(REPORT_DIR, "ai-corrections.md"),          correctionsMd),
        writeOutput(path.join(REPORT_DIR, "ai-tickets.json"),            ticketsClean),
        writeOutput(path.join(REPORT_DIR, "ai-failures-grouped.json"),   groupedText),
    ]);

    success("AI Reporting finalizado correctamente 🎉");
}

function runClaude(promptText, stdinText, label) {
    log(`Ejecutando IA: ${label}...`);
    const start = Date.now();

    return new Promise((resolve, reject) => {
        const child = spawn("claude", [
            "-p", promptText,
            "--model", MODEL,
            "--dangerously-skip-permissions"
        ], {
            stdio: ["pipe", "pipe", "pipe"],
            env: process.env
        });

        let out = "";

        child.stdout.on("data", (d) => { out += d.toString("utf8"); });
        child.stderr.on("data", (d) => { process.stderr.write(d); });

        child.on("close", (code) => {
            const duration = ((Date.now() - start) / 1000).toFixed(2);
            if (code !== 0) {
                reject(new Error(`Claude salió con código ${code} en: ${label}`));
            } else {
                success(`${label} completado en ${duration}s`);
                resolve(out.trim());
            }
        });

        child.stdin.write(stdinText);
        child.stdin.end();
    });
}

function stripMarkdownFences(s) {
    const t = (s ?? "").trim();
    if (/^```json/i.test(t)) return t.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    if (/^```/.test(t))      return t.replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    return t;
}

async function exists(p) {
    try { await access(p); return true; } catch { return false; }
}

async function writeOutput(filePath, content) {
    await writeFile(filePath, content + "\n", "utf8");
    success(`Generado: ${filePath}`);
}

function extractStats(testResults) {
    if (testResults.stats) {
        const s = testResults.stats;
        const passed  = s.expected   ?? 0;
        const failed  = s.unexpected ?? 0;
        const skipped = s.skipped    ?? 0;
        const flaky   = s.flaky      ?? 0;
        return { total: passed + failed + skipped + flaky, passed, failed, skipped, flaky, duration_ms: s.duration ?? 0 };
    }

    let passed = 0, failed = 0, skipped = 0, flaky = 0;
    function walk(node) {
        for (const test of node.tests ?? []) {
            const statuses = (test.results ?? []).map(r => r.status);
            if (statuses.length > 1 && statuses.includes("passed")) flaky++;
            else if (statuses.includes("passed"))                    passed++;
            else if (statuses.some(s => s === "failed" || s === "timedOut")) failed++;
            else if (statuses.includes("skipped"))                   skipped++;
        }
        for (const suite of node.suites ?? []) walk(suite);
    }
    for (const suite of testResults.suites ?? []) walk(suite);
    return { total: passed + failed + skipped + flaky, passed, failed, skipped, flaky, duration_ms: 0 };
}

main().catch((e) => {
    errorLog(e.message);
    process.exit(1);
});
