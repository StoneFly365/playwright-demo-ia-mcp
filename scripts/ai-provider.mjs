// Llamada a un modelo para analizar resultados de pruebas: entrada no confiable, salida solo texto.
// En CI usa Google Gemini (GEMINI_API_KEY); en local, el CLI de Claude con la suscripción.
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

export const CLAUDE_MODEL = "claude-haiku-4-5-20251001";
export const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

export const currentModel = () => (process.env.GEMINI_API_KEY ? GEMINI_MODEL : CLAUDE_MODEL);

// Los datos van en el mensaje de usuario, delimitados y marcados como datos. El prompt de sistema
// (el de prompts/) repite que nada de lo que hay dentro es una instrucción.
export const wrapUntrusted = (data) =>
    "<datos_no_confiables>\n" + data.replaceAll("</datos_no_confiables>", "</datos_no_confiables_>") + "\n</datos_no_confiables>";

export function runAi(promptText, data, label) {
    const user = wrapUntrusted(data);
    return process.env.GEMINI_API_KEY ? runGemini(promptText, user, label) : runClaudeCli(promptText, user, label);
}

// Códigos transitorios de Gemini (sobrecarga/límite): merece reintentar.
const GEMINI_RETRYABLE = new Set([429, 500, 502, 503, 504]);
const GEMINI_MAX_RETRIES = 4;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runGemini(promptText, userText, label) {
    console.log(`👉 Ejecutando IA (Gemini): ${label}...`);
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
                    { role: "user", content: userText },
                ],
            }),
        });

        if (res.ok) break;

        if (GEMINI_RETRYABLE.has(res.status) && attempt < GEMINI_MAX_RETRIES) {
            const backoff = 2 ** attempt * 1000 + Math.floor(Math.random() * 500); // 2s,4s,8s + jitter
            console.log(`👉 Gemini ${res.status} en ${label}, reintento ${attempt}/${GEMINI_MAX_RETRIES - 1} en ${backoff}ms...`);
            await sleep(backoff);
            continue;
        }

        throw new Error(`Gemini ${res.status} en ${label}: ${(await res.text()).slice(0, 500)}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error(`Respuesta vacía de Gemini en ${label}`);

    console.log(`✅ ${label} completado en ${((Date.now() - start) / 1000).toFixed(2)}s`);
    return content;
}

/**
 * Argumentos del CLI de Claude: sin herramientas, sin MCP (el .mcp.json del proyecto expone
 * test_run) y sin saltarse permisos. Lo que llegue en los datos no puede ejecutar nada ni escribir.
 */
export function claudeArgs(promptText) {
    return [
        "-p",
        "--model", CLAUDE_MODEL,
        "--system-prompt", promptText,
        "--tools", "",
        "--strict-mcp-config",
        "--permission-prompts", "none",
        "--output-format", "text",
    ];
}

// El CLI claude pinta un spinner (ANSI + braille) en stderr asumiendo un TTY;
// por pipe no se limpia solo y queda como ruido literal. Lo filtramos.
const stripAnsiAndSpinner = (s) => s.replace(/\x1b\[[0-9;]*[A-Za-z]/g, "").replace(/[⠀-⣿]/g, "");

function runClaudeCli(promptText, userText, label) {
    console.log(`👉 Ejecutando IA: ${label}...`);
    const start = Date.now();
    // Directorio vacío: el CLI no carga CLAUDE.md, ajustes ni MCP del repositorio.
    const cwd = mkdtempSync(path.join(tmpdir(), "report-ai-"));

    return new Promise((resolve, reject) => {
        const child = spawn("claude", claudeArgs(promptText), { cwd, stdio: ["pipe", "pipe", "pipe"], env: process.env });

        let out = "";
        let err = "";

        child.stdout.on("data", (d) => { out += d.toString("utf8"); });
        // Se acumula y se limpia entero al cerrar: el spinner del CLI llega
        // troceado entre llamadas "data", y filtrar chunk a chunk deja
        // secuencias ANSI a medias si se cortan justo en el borde.
        child.stderr.on("data", (d) => { err += d.toString("utf8"); });

        child.on("error", (e) => { rmSync(cwd, { recursive: true, force: true }); reject(e); });
        child.on("close", (code) => {
            rmSync(cwd, { recursive: true, force: true });
            if (code !== 0) {
                const detail = out.trim() ? `\nSalida de Claude:\n${out.trim().slice(0, 1000)}` : "";
                const errDetail = err.trim() ? `\nError de Claude:\n${stripAnsiAndSpinner(err).trim().slice(0, 1000)}` : "";
                reject(new Error(`Claude salió con código ${code} en: ${label}${detail}${errDetail}`));
            } else {
                console.log(`✅ ${label} completado en ${((Date.now() - start) / 1000).toFixed(2)}s`);
                resolve(out.trim());
            }
        });

        child.stdin.write(userText);
        child.stdin.end();
    });
}
