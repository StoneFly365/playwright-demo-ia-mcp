#!/usr/bin/env node
import { readFile, mkdir, writeFile, access } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { extractFailures, groupFailures, isOnlyFlaky } from "./triage.mjs";

const REPORT_DIR = "playwright-report";
const INPUT_JSON = "test-results.json";
const MODEL = "claude-haiku-5-5";                    // Claude CLI (suscripción, local)
const TIPOS = new Set(["test_roto", "bug_producto", "entorno"]);  // los que puede asignar la IA

// Proveedor por API compatible con la de OpenAI (OpenRouter, Gemini, un gateway de empresa...).
// AI_API_KEY + AI_BASE_URL + AI_MODEL mandan; si no, GEMINI_API_KEY es el atajo de siempre;
// sin ninguna clave, el CLI de Claude en local (null).
const API = process.env.AI_API_KEY
    ? { name: hostOf(process.env.AI_BASE_URL), url: process.env.AI_BASE_URL, model: process.env.AI_MODEL, key: process.env.AI_API_KEY }
    : process.env.GEMINI_API_KEY
        ? { name: "gemini", url: "https://generativelanguage.googleapis.com/v1beta/openai", model: "gemini-flash-latest", key: process.env.GEMINI_API_KEY }
        : null;
const PROVIDER = API ? `${API.name}:${API.model}` : `claude-cli:${MODEL}`;

function hostOf(url) {
    try { return new URL(url).hostname; } catch { return "api"; }
}

function log(msg)     { console.log(`👉 ${msg}`); }
function success(msg) { console.log(`✅ ${msg}`); }
function errorLog(msg){ console.error(`❌ ${msg}`); }

async function main() {
    log("Iniciando AI Reporting Pipeline...");
    if (API && !(API.url && API.model)) throw new Error("Con AI_API_KEY hacen falta también AI_BASE_URL y AI_MODEL");
    await mkdir(REPORT_DIR, { recursive: true });

    if (!(await exists(INPUT_JSON))) {
        throw new Error(`No existe ${INPUT_JSON}. Ejecuta primero npm run test`);
    }

    const testResults = JSON.parse(await readFile(INPUT_JSON, "utf8"));
    const stats = extractStats(testResults);

    log(`Estadísticas: ${stats.total} total · ${stats.passed} pasaron · ${stats.failed} fallaron · ${stats.skipped} omitidas · ${stats.flaky} flaky`);

    // 1️⃣ Agrupar en código: determinista, sin IA. Los flaky cuentan como fallo a analizar.
    const failures = extractFailures(testResults);
    const onlyFlaky = isOnlyFlaky(failures);

    // Sin fallos no hay nada que analizar. Con solo flaky, en push/PR tampoco se llama a la
    // IA: un test que falla y pasa al reintentar no merece gastar cuota en cada ejecución
    // (AI_SKIP_FLAKY_ONLY lo pone la CI; en local o con suite=fail/eval sí se analiza).
    if (failures.length === 0 || (onlyFlaky && process.env.AI_SKIP_FLAKY_ONLY)) {
        const message = failures.length === 0
            ? `Sin fallos: ${stats.passed} de ${stats.total} pruebas pasaron. No hay nada que analizar con IA.`
            : `Todas las pruebas acabaron pasando, pero ${stats.flaky} de ${stats.total} fueron inestables (fallaron y pasaron al reintentar). En push y PR no se llama a la IA solo por tests flaky; lanza el workflow a mano o ejecuta report:ai en local para analizarlos.`;
        await writeOutput(path.join(REPORT_DIR, "ai-summary.txt"), message);
        success(failures.length === 0 ? "AI Reporting omitido: no hay fallos 🎉" : "AI Reporting omitido: solo hay tests flaky 🎉");
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
    // Solo para el dashboard (scripts/dashboard.mjs): de qué ejecución sale el análisis, con qué
    // proveedor y cuántas peticiones a la IA costó. Se añade al escribir, no viaja en los prompts.
    const withRunInfo = () => JSON.stringify({
        ...grouped,
        run_start_time: testResults.stats?.startTime ?? null,
        provider: PROVIDER,
        ai_requests: aiRequests,
    }, null, 2);

    // eval-ai.mjs solo mide la clasificación: el resto de llamadas gastaría cuota sin aportar nada.
    if (process.env.AI_CLASSIFY_ONLY) {
        await writeOutput(path.join(REPORT_DIR, "ai-failures-grouped.json"), withRunInfo());
        if (errors.length) throw new Error(errors.join("\n"));
        success("Clasificación terminada (AI_CLASSIFY_ONLY)");
        return;
    }

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
        ["ai-failures-grouped.json", withRunInfo()],
    ];
    await Promise.all(outputs
        .filter(([, content]) => content)
        .map(([name, content]) => writeOutput(path.join(REPORT_DIR, name), content)));

    if (errors.length) throw new Error(errors.join("\n"));

    success("AI Reporting finalizado correctamente 🎉");
}

// Peticiones enviadas al proveedor, reintentos incluidos (cada reintento gasta cuota).
let aiRequests = 0;

// En CI, el proveedor por API (ver API arriba); en local, el CLI de Claude con la suscripción.
function runClaude(promptText, stdinText, label) {
    return API
        ? runApi(promptText, stdinText, label)
        : runClaudeCli(promptText, stdinText, label);
}

// Códigos transitorios (sobrecarga/límite): merece reintentar.
const RETRYABLE = new Set([429, 500, 502, 503, 504]);
const MAX_RETRIES = 4;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runApi(promptText, stdinText, label) {
    log(`Ejecutando IA (${PROVIDER}): ${label}...`);
    const start = Date.now();

    let res;
    for (let attempt = 1; ; attempt++) {
        aiRequests++;
        res = await fetch(`${API.url.replace(/\/$/, "")}/chat/completions`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${API.key}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: API.model,
                temperature: 0,
                messages: [
                    { role: "system", content: promptText },
                    { role: "user", content: stdinText },
                ],
            }),
        });

        if (res.ok) break;

        if (RETRYABLE.has(res.status) && attempt < MAX_RETRIES) {
            const backoff = 2 ** attempt * 1000 + Math.floor(Math.random() * 500); // 2s,4s,8s + jitter
            log(`${API.name} ${res.status} en ${label}, reintento ${attempt}/${MAX_RETRIES - 1} en ${backoff}ms...`);
            await sleep(backoff);
            continue;
        }

        throw new Error(`${API.name} ${res.status} en ${label}: ${(await res.text()).slice(0, 500)}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error(`Respuesta vacía de ${API.name} en ${label}`);

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    success(`${label} completado en ${duration}s`);
    return content;
}

function runClaudeCli(promptText, stdinText, label) {
    log(`Ejecutando IA: ${label}...`);
    const start = Date.now();
    aiRequests++;

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

// El reporter JSON de Playwright (y merge-results.mjs) siempre trae stats.
function extractStats(testResults) {
    const s = testResults.stats ?? {};
    const passed  = s.expected   ?? 0;
    const failed  = s.unexpected ?? 0;
    const skipped = s.skipped    ?? 0;
    const flaky   = s.flaky      ?? 0;
    return { total: passed + failed + skipped + flaky, passed, failed, skipped, flaky, duration_ms: s.duration ?? 0 };
}

main().catch((e) => {
    errorLog(e.message);
    process.exit(1);
});
