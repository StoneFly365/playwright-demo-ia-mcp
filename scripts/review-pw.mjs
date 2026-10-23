#!/usr/bin/env node
// Revisión adversarial de un cambio en los tests: el agente playwright-adversarial-reviewer intenta
// demostrar que el diff oculta un bug, apunta a otro elemento o vuelve el test frágil. Complementa al
// check de asserts (no mira el sujeto de los expect) y al lint de Playwright (no entiende la intención).
//
// Uso: npm run review:pw -- <ref-base>   (revisa el árbol de trabajo frente a <ref-base>)
// También lo lanza heal:ai antes de abrir cada PR. Usa Claude CLI (suscripción, en local).
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { checkAgainst, SCOPE } from "./guard-asserts.mjs";
import { runAgent } from "./agent.mjs";

export const VERDICTS = ["APROBADO", "DUDAS", "RECHAZADO"];
const PATHS = ["tests", "pages", "fixtures", "playwright.config.ts"];

// Solo vale una línea completa "VEREDICTO: X". Si hay varias que se contradicen, no hay veredicto.
export function parseVerdict(text) {
    const found = new Set([...(text ?? "").matchAll(/^\s*VEREDICTO:\s*(APROBADO|DUDAS|RECHAZADO)\s*$/gm)].map((m) => m[1]));
    return found.size === 1 ? [...found][0] : null;
}

export function buildReviewPrompt({ diff, guardReasons, lint, context }) {
    return [
        "Revisa en modo adversarial este cambio en los tests de Playwright.",
        context ? `\n## Contexto del cambio\n${context}` : null,
        "\n## Check determinista de asserts",
        guardReasons.length ? guardReasons.map((r) => `- ${r}`).join("\n") : "Sin aserciones borradas o cambiadas, sin skip ni fixme y sin timeouts nuevos (no mira el sujeto de los expect).",
        "\n## Lint de Playwright sobre los ficheros cambiados",
        lint || "Sin avisos.",
        "\n## Diff", "```diff", diff, "```",
    ].filter((l) => l != null).join("\n");
}

const git = (...args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

// Lint solo de los ficheros cambiados. ESLint sale con código 1 si hay errores: su salida sirve igual.
function lintFiles(files) {
    const ts = files.filter((f) => f.endsWith(".ts") && existsSync(f) && f !== "playwright.config.ts");
    if (!ts.length) return "";
    try {
        return execFileSync(process.execPath, ["node_modules/eslint/bin/eslint.js", ...ts], { encoding: "utf8" }).trim();
    } catch (e) {
        return (e.stdout ?? e.message).trim();
    }
}

// Revisa el árbol de trabajo frente a `base`. Los ficheros nuevos solo entran si ya están en el índice (git add).
export async function reviewChanges(base, { context, echo = true } = {}) {
    const diff = git("diff", "--no-renames", base, "--", ...PATHS);
    if (!diff.trim()) return null;
    const files = git("diff", "--name-only", "--no-renames", base, "--", ...PATHS).split("\n").filter((f) => SCOPE.test(f));
    const guardReasons = checkAgainst(base);
    const lint = lintFiles(files);
    const text = await runAgent("playwright-adversarial-reviewer", buildReviewPrompt({ diff, guardReasons, lint, context }), { tools: "Read,Grep,Glob", echo });
    return { verdict: parseVerdict(text), text, guardReasons, lint };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const base = process.argv[2];
    if (!base) {
        console.error("Uso: npm run review:pw -- <ref-base>");
        process.exit(2);
    }
    reviewChanges(base).then((r) => {
        if (!r) return console.log("✅ No hay cambios en tests/, pages/, fixtures/ ni playwright.config.ts frente a " + base + ".");
        console.log(`\n${r.verdict ? `👉 Veredicto: ${r.verdict}` : "⚠️  El revisor no devolvió veredicto."}`);
    }).catch((e) => { console.error(`❌ ${e.message}`); process.exit(1); });
}
