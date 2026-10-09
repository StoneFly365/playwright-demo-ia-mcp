#!/usr/bin/env node
// Señala en un diff los cambios que tocan oráculos: aserciones, valores esperados, marcas de
// defecto conocido y datos de prueba. Un cambio así necesita aprobación humana explícita.
//   node scripts/guard-assertions.mjs [propuesta.diff]     (sin fichero: git diff HEAD)
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const ORACLE = /\bexpect(\.soft|\.poll)?\(|\.(not\.)?to[A-Z]\w*\(|\btest\.(fail|fixme|skip)\(|@bug-|annotation|\btimeout\s*:/;
const WATCHED = /^(tests|test-data|fixtures|pages|helpers)\//;

export function oracleChanges(diff) {
    const hits = [];
    let file = null;
    for (const line of diff.split(/\r?\n/)) {
        const header = line.match(/^\+\+\+ b\/(.+)$/) ?? line.match(/^--- a\/(.+)$/);
        if (header) { file = header[1]; continue; }
        if (!file || !WATCHED.test(file) || !/^[+-]/.test(line) || /^(\+\+\+|---)/.test(line)) continue;
        // En test-data todo valor es un oráculo (tablas de importes, frases, fechas).
        if (file.startsWith("test-data/") || ORACLE.test(line)) hits.push(`${file}: ${line.slice(0, 160)}`);
    }
    return hits;
}

if (process.argv[1]?.endsWith("guard-assertions.mjs")) {
    const src = process.argv[2];
    const diff = src ? readFileSync(src, "utf8") : execSync("git diff HEAD", { encoding: "utf8", maxBuffer: 64 << 20 });
    const hits = oracleChanges(diff);
    if (hits.length) {
        console.log(`✗ ${hits.length} líneas cambian oráculos. Necesitan aprobación humana explícita:\n  ${hits.join("\n  ")}`);
        process.exitCode = 1;
    } else {
        console.log("✓ El diff no toca aserciones, valores esperados, marcas de defecto ni datos de prueba.");
    }
}
