#!/usr/bin/env node
// Protección independiente de la clasificación: detecta si un cambio relaja las pruebas.
// Si la IA clasificara un bug real como test_roto, el healer podría "arreglar" el test bajando
// la expectativa y ocultar el bug. Este check lo marca para revisión humana sin fiarse de la IA.
//
// Uso: node scripts/guard-asserts.mjs <ref-base>   (compara <ref-base> con el árbol de trabajo)
// Sale con código 1 si encuentra algo; en GitHub Actions lo escribe también en el resumen.
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync, appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Lo que puede esconder un fallo: los tests, los page objects, los fixtures y la configuración.
export const SCOPE = /^(tests|pages|fixtures)\/|^playwright\.config\.ts$/;

// Quita los comentarios de línea (no los "//" de una URL dentro de un string) y de bloque.
const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "$1");

// Índice del paréntesis que cierra el que está en `open`, saltándose los strings.
function closeParen(src, open) {
    let depth = 0;
    for (let i = open; i < src.length; i++) {
        const c = src[i];
        if (c === "'" || c === '"' || c === "`") {
            for (i++; i < src.length && src[i] !== c; i++) if (src[i] === "\\") i++;
        } else if (c === "(") depth++;
        else if (c === ")" && --depth === 0) return i;
    }
    return -1;
}

const norm = (s) => s.replace(/\s+/g, " ").trim();

// Cada aserción como "matcher(argumentos)", con el .not delante si lo lleva. El sujeto
// (el locator) no forma parte de la firma: cambiar el selector es justo lo que debe poder hacer el healer.
export function extractAssertions(source) {
    const src = stripComments(source);
    const found = [];
    for (const m of src.matchAll(/\bexpect(?:\.soft|\.poll)?\s*\(/g)) {
        const end = closeParen(src, m.index + m[0].length - 1);
        if (end < 0) continue;
        const chain = /^\s*((?:\.\s*(?:not|resolves|rejects)\s*)*)\.\s*(to\w+)\s*\(/.exec(src.slice(end + 1));
        if (!chain) continue;
        const argsOpen = end + 1 + chain[0].length - 1;
        const argsEnd = closeParen(src, argsOpen);
        const mods = chain[1].replace(/[\s.]+/g, " ").trim().split(" ").filter(Boolean).map((x) => `${x}.`).join("");
        found.push(`${mods}${chain[2]}(${norm(src.slice(argsOpen + 1, argsEnd))})`);
    }
    return found;
}

const count = (src, re) => (stripComments(src).match(re) ?? []).length;
const timeouts = (src) => [...stripComments(src).matchAll(/(?:timeout\s*:\s*|setTimeout\s*\(\s*)([\d_]+)/gi)].map((m) => Number(m[1].replaceAll("_", "")));

// Motivos por los que el cambio de un fichero necesita revisión humana. before = null si el fichero es nuevo.
export function findRelaxations(file, before, after) {
    if (after == null) return [`${file}: se borra el fichero`];
    // Un fichero nuevo se compara con uno vacío: no pierde aserciones, pero un skip o un timeout sí cuentan.
    before ??= "";
    if (file === "playwright.config.ts" && before !== after) return [`${file}: cambia la configuración (reintentos, timeouts o filtros pueden ocultar fallos)`];
    const reasons = [];
    const left = extractAssertions(after);
    for (const a of extractAssertions(before)) {
        const i = left.indexOf(a);
        if (i >= 0) left.splice(i, 1);
        else reasons.push(`${file}: desaparece o cambia la aserción \`${a}\``);
    }
    const skips = /\btest(?:\.describe)?\.(?:skip|fixme|fail)\s*\(/g;
    if (count(after, skips) > count(before, skips)) reasons.push(`${file}: añade test.skip, test.fixme o test.fail`);
    const slow = /\btest\.slow\s*\(/g;
    const oldTimeouts = timeouts(before);
    // ponytail: cualquier timeout nuevo cuenta, aunque sea más corto; mejor un falso positivo que dejar pasar uno.
    if (count(after, slow) > count(before, slow) || timeouts(after).some((t) => !oldTimeouts.includes(t))) {
        reasons.push(`${file}: añade o sube un timeout`);
    }
    return reasons;
}

const git = (...args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

export function checkAgainst(baseRef) {
    const changed = git("diff", "--name-only", "--no-renames", baseRef, "--").split("\n").filter((f) => SCOPE.test(f));
    return changed.flatMap((file) => {
        let before = null;
        try { before = git("show", `${baseRef}:${file}`); } catch { /* fichero nuevo */ }
        const after = existsSync(file) ? readFileSync(file, "utf8") : null;
        return findRelaxations(file, before, after);
    });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const base = process.argv[2];
    if (!base) {
        console.error("Uso: node scripts/guard-asserts.mjs <ref-base>");
        process.exit(2);
    }
    const reasons = checkAgainst(base);
    const report = reasons.length
        ? `### needs-human: el cambio puede relajar las pruebas\n\n${reasons.map((r) => `- ${r}`).join("\n")}\n\nNo se puede fusionar hasta que una persona confirme que la expectativa antigua era la incorrecta y ponga la etiqueta \`asserts-aprobados\`.\n`
        : "### Sin asserts relajados\n\nNo se borra ni cambia ninguna aserción, no hay skip ni fixme y no sube ningún timeout.\n";
    console.log(report);
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report);
    process.exit(reasons.length ? 1 : 0);
}
