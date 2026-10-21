#!/usr/bin/env node
import { readFile, mkdir, writeFile, access } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { extractFailures, groupFailures } from "./triage.mjs";

const REPORT_DIR = "playwright-report";
const INPUT_JSON = "test-results.json";
const MODEL = "claude-haiku-5-5";                    // Claude CLI (suscripción, local)
const GEMINI_MODEL = "gemini-flash-latest";          // Google Gemini (free tier, CI)
const TIPOS = new Set(["test_roto", "bug_producto", "entorno"]);  // los que puede asignar la IA
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

function log(msg)     { console.log(`👉 ${msg}`); }
function success(msg) { console.log(`✅ ${msg}`); }
function errorLog(msg){ console.error(`❌ ${msg}`); }

async function main() {
    log("Iniciando AI Reporting Pipeline...");
    await mkdir(REPORT_DIR, { recursive: true });

    if (!(await exists(INPUT_JSON))) {
        throw new Error(`No existe ${INPUT_JSON}. Ejecuta primero npm run test`);
    }

    const testResults = JSON.parse(await readFile(INPUT_JSON, "utf8"));
    const stats = extractStats(testResults);

    log(`Estadísticas: ${stats.total} total · ${stats.passed} pasaron · ${stats.failed} fallaron · ${stats.skipped} omitidas · ${stats.flaky} flaky`);

    // 1️⃣ Agrupar en código: determinista, sin IA. Los flaky cuentan como fallo a analizar.
    const failures = extractFailures(testResults);

    // Sin fallos no hay nada que analizar: no se gasta cuota de IA.
    if (failures.length === 0) {
        await writeOutput(path.join(REPORT_DIR, "ai-summary.txt"),
            `Sin fallos: ${stats.passed} de ${stats.total} pruebas pasaron. No hay nada que analizar con IA.`);
        success("AI Reporting omitido: no hay fallos 🎉");
        return;
    }

    const groups = groupFailures(failures);
    log(`${failures.length} fallos en ${groups.length} grupos`);
    const errors = [];

    // 2️⃣ La IA clasifica los grupos que el código no ha resuelto (todos menos los flaky).
    const toClassify = groups.filter((g) => !g.tipo);
    if (toClassify.length) {
        try {
            const pClassify = await readFile("prompts/ai-classify.txt", "utf8");
            const raw = stripMarkdownFences(await runClaude(pClassify, JSON.stringify(toClassify), "Clasificación de fallos"));
            let classification;
            try {
                classification = JSON.parse(raw);
            } catch {
                throw new Error("La clasificación no es JSON válido.\nPrimeros 500 chars:\n" + raw.slice(0, 500));
            }
            for (const c of classification) {
                const g = toClassify.find((x) => x.group_id === c.group_id);
                if (g && TIPOS.has(c.tipo)) Object.assign(g, { tipo: c.tipo, confianza: c.confianza, evidencia: c.evidencia, accion: c.accion });
            }
        } catch (e) {
            // Sin clasificación el resto del reporte sigue teniendo valor: no se aborta.
            errors.push(e.message);
        }
        for (const g of toClassify) g.tipo ??= "sin_clasificar";
    }

    const grouped = {
        generated_at: new Date().toLocaleString("es-ES", {
            timeZone: "Europe/Madrid",
            dateStyle: "long",
            timeStyle: "short",
        }),
        source: "playwright-json",
        total_failed_tests: failures.filter((f) => !f.flaky).length,
        total_flaky_tests: failures.filter((f) => f.flaky).length,
        total_groups: groups.length,
        groups,
    };

    // page_context y el error completo ya han servido para clasificar; al resto de prompts les basta un extracto.
    const brief = {
        ...grouped,
        groups: groups.map(({ page_context, sample_error, ...g }) => ({
            ...g,
            error_summary: sample_error.split("\nCall log:")[0].slice(0, 600),
        })),
    };
    const bugs = brief.groups.filter((g) => g.tipo === "bug_producto");

    // 3️⃣ Resumen · Correcciones · Tickets — en paralelo. Tickets solo para bugs de producto.
    const [pSummary, pCorrections, pTickets] = await Promise.all([
        readFile("prompts/ai-summary.txt", "utf8"),
        readFile("prompts/ai-corrections.txt", "utf8"),
        readFile("prompts/ai-tickets.txt", "utf8"),
    ]);

    log("Generando resumen, correcciones y tickets en paralelo...");

    // allSettled y no all: si una llamada falla (p. ej. 429 de cuota en CI),
    // se guarda lo que sí se generó en lugar de perderlo todo.
    const results = await Promise.allSettled([
        runClaude(pSummary,     JSON.stringify({ stats, grouped: brief }), "Resumen ejecutivo"),
        runClaude(pCorrections, JSON.stringify(brief),                     "Posibles correcciones"),
        bugs.length ? runClaude(pTickets, JSON.stringify(bugs), "Tickets Jira") : Promise.resolve("[]"),
    ]);
    const [summaryTxt, correctionsMd, ticketsRaw] = results.map((r) => r.status === "fulfilled" ? r.value : null);
    errors.push(...results.filter((r) => r.status === "rejected").map((r) => r.reason.message));

    let ticketsClean = ticketsRaw && stripMarkdownFences(ticketsRaw);
    if (ticketsClean) {
        try {
            JSON.parse(ticketsClean);
        } catch {
            errors.push("ai-tickets.json no es JSON válido.\nPrimeros 500 chars:\n" + ticketsClean.slice(0, 500));
            ticketsClean = null;
        }
    }

    const outputs = [
        ["ai-summary.txt",           summaryTxt],
        ["ai-corrections.md",        correctionsMd],
        ["ai-tickets.json",          ticketsClean],
        ["ai-failures-grouped.json", JSON.stringify(grouped, null, 2)],
    ];
    await Promise.all(outputs
        .filter(([, content]) => content)
        .map(([name, content]) => writeOutput(path.join(REPORT_DIR, name), content)));

    if (errors.length) throw new Error(errors.join("\n"));

    success("AI Reporting finalizado correctamente 🎉");
}

// En CI usa Google Gemini (free tier, GEMINI_API_KEY); en local, el CLI de
// Claude con la suscripción. La presencia de GEMINI_API_KEY decide el proveedor.
function runClaude(promptText, stdinText, label) {
    return process.env.GEMINI_API_KEY
        ? runGemini(promptText, stdinText, label)
        : runClaudeCli(promptText, stdinText, label);
}

// Códigos transitorios de Gemini (sobrecarga/límite): merece reintentar.
const GEMINI_RETRYABLE = new Set([429, 500, 502, 503, 504]);
const GEMINI_MAX_RETRIES = 4;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runGemini(promptText, stdinText, label) {
    log(`Ejecutando IA (Gemini): ${label}...`);
    const start = Date.now();

    let res;
    for (let attempt = 1; ; attempt++) {
        res = await fetch(GEMINI_ENDPOINT, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: GEMINI_MODEL,
                temperature: 0,
                messages: [
                    { role: "system", content: promptText },
                    { role: "user", content: stdinText },
                ],
            }),
        });

        if (res.ok) break;

        if (GEMINI_RETRYABLE.has(res.status) && attempt < GEMINI_MAX_RETRIES) {
            const backoff = 2 ** attempt * 1000 + Math.floor(Math.random() * 500); // 2s,4s,8s + jitter
            log(`Gemini ${res.status} en ${label}, reintento ${attempt}/${GEMINI_MAX_RETRIES - 1} en ${backoff}ms...`);
            await sleep(backoff);
            continue;
        }

        throw new Error(`Gemini ${res.status} en ${label}: ${(await res.text()).slice(0, 500)}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error(`Respuesta vacía de Gemini en ${label}`);

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    success(`${label} completado en ${duration}s`);
    return content;
}

function runClaudeCli(promptText, stdinText, label) {
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
                const detail = out.trim() ? `\nSalida de Claude:\n${out.trim().slice(0, 1000)}` : "";
                reject(new Error(`Claude salió con código ${code} en: ${label}${detail}`));
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
