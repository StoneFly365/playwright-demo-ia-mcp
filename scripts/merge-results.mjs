#!/usr/bin/env node
// Une los test-results.json de cada navegador (generados por --project=X en jobs en paralelo)
// en uno solo, para llamar a report:ai una vez por ejecución en lugar de una por navegador.
// Uso: node scripts/merge-results.mjs <salida.json> <entrada1.json> [entrada2.json ...]
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Los ficheros comparten el mismo árbol de suites/specs (es el mismo código), solo que
// cada uno trae los tests de un navegador. Se agrupan por título+fichero+línea y se
// concatenan los tests de cada spec; no hace falta que coincida el orden de ejecución.
function mergeByKey(lists, keyOf, mergeOne) {
    const byKey = new Map();
    const order = [];
    for (const list of lists) {
        for (const item of list ?? []) {
            const key = keyOf(item);
            if (!byKey.has(key)) { byKey.set(key, []); order.push(key); }
            byKey.get(key).push(item);
        }
    }
    return order.map((key) => mergeOne(byKey.get(key)));
}

const specKey = (s) => `${s.title}|${s.file}|${s.line}`;
const mergeSpec = (specs) => ({ ...specs[0], tests: specs.flatMap((s) => s.tests ?? []) });
const mergeSuite = (suites) => ({
    ...suites[0],
    suites: mergeByKey(suites.map((s) => s.suites), specKey, mergeSuite),
    specs: mergeByKey(suites.map((s) => s.specs), specKey, mergeSpec),
});

// Los navegadores corren en paralelo: los contadores se suman y la duración es la del más lento.
function mergeStats(stats) {
    const sum = (k) => stats.reduce((n, s) => n + (s?.[k] ?? 0), 0);
    return {
        startTime: stats.map((s) => s?.startTime).filter(Boolean).sort()[0],
        duration: Math.max(0, ...stats.map((s) => s?.duration ?? 0)),
        expected: sum("expected"),
        skipped: sum("skipped"),
        unexpected: sum("unexpected"),
        flaky: sum("flaky"),
    };
}

export function mergeReports(reports) {
    return {
        config: reports[0].config,
        suites: mergeByKey(reports.map((r) => r.suites), specKey, mergeSuite),
        errors: reports.flatMap((r) => r.errors ?? []),
        stats: mergeStats(reports.map((r) => r.stats)),
    };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const [, , outPath, ...inPaths] = process.argv;
    if (!outPath || inPaths.length < 1) {
        console.error("Uso: merge-results.mjs <salida.json> <entrada1.json> [entrada2.json ...]");
        process.exit(1);
    }
    const reports = inPaths.map((p) => JSON.parse(readFileSync(p, "utf8")));
    writeFileSync(outPath, JSON.stringify(mergeReports(reports)), "utf8");
    console.log(`Unidos ${inPaths.length} ficheros en ${outPath}`);
}
