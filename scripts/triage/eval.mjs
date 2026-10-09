#!/usr/bin/env node
// Evalúa la capa 1 (reglas) contra scripts/triage/eval/cases.json. Sin IA ni red.
// Cada grupo de etiquetas (verified, provisional, synthetic) se mide por separado: no se mezclan
// resultados reales con casos construidos. Por caso: acierto, aplazado (las reglas dicen INCONCLUSIVE
// y lo dejan a la capa 2 o a una persona) o error (afirman una categoría distinta de la real).
// Sale con 1 si falla un caso verificado o si algún PASSED se presenta con confianza "high".
import { readFileSync } from "node:fs";
import { triageReport } from "./core.mjs";

const { cases } = JSON.parse(readFileSync(new URL("./eval/cases.json", import.meta.url), "utf8"));
const rows = cases.map((c) => {
    const [d] = triageReport({ suites: [{ title: c.spec.file, specs: [c.spec] }] }).diagnoses;
    const outcome = d.classification === c.label ? "acierto" : d.classification === "INCONCLUSIVE" ? "aplazado" : "error";
    return { ...c, predicted: d.classification, confidence: d.confidence, needsAi: d.needs_ai, outcome };
});

const pad = (v, n) => String(v).padStart(n);
for (const group of ["verified", "provisional", "synthetic"]) {
    const g = rows.filter((r) => r.label_status === group);
    if (!g.length) continue;
    const count = (o) => g.filter((r) => r.outcome === o).length;
    console.log(`\n## ${group}: ${g.length} casos · aciertos ${count("acierto")} · errores ${count("error")} · aplazados ${count("aplazado")}`
        + ` (delegados a IA ${g.filter((r) => r.needsAi).length} · INCONCLUSIVE ${g.filter((r) => r.predicted === "INCONCLUSIVE").length})`);
    // Por categoría: VP = real y predicha; FN = real, predicha otra (aplazados aparte); FP = predicha sin serlo.
    console.log(`${"categoría".padEnd(20)} ${pad("real", 4)} ${pad("VP", 4)} ${pad("FN", 4)} ${pad("aplaz.", 6)} ${pad("FP", 4)}`);
    const cats = [...new Set(g.flatMap((r) => [r.label, r.predicted]))].sort();
    for (const c of cats) {
        const real = g.filter((r) => r.label === c);
        const vp = real.filter((r) => r.predicted === c).length;
        const aplazados = real.filter((r) => r.predicted === "INCONCLUSIVE" && c !== "INCONCLUSIVE").length;
        const fn = real.length - vp - aplazados;
        // Un INCONCLUSIVE con otra etiqueta real ya cuenta como aplazado de esa categoría, no como FP.
        const fp = c === "INCONCLUSIVE" ? "—" : g.filter((r) => r.predicted === c && r.label !== c).length;
        console.log(`${c.padEnd(20)} ${pad(real.length, 4)} ${pad(vp, 4)} ${pad(fn, 4)} ${pad(aplazados, 6)} ${pad(fp, 4)}`);
    }
}

const misses = rows.filter((r) => r.outcome !== "acierto");
if (misses.length) {
    console.log("\nNo aciertos:");
    for (const r of misses) console.log(`  [${r.outcome}] ${r.id} (${r.label_status}): real ${r.label}, reglas ${r.predicted}${r.note ? `\n      ${r.note}` : ""}`);
}
const passedHigh = rows.filter((r) => r.predicted === "PASSED" && r.confidence === "high");
if (passedHigh.length) console.log(`\n✗ PASSED con confianza high (un pase no confirma el test): ${passedHigh.map((r) => r.id).join(", ")}`);
const verifiedErrors = rows.filter((r) => r.label_status === "verified" && r.outcome !== "acierto");
process.exitCode = verifiedErrors.length || passedHigh.length ? 1 : 0;
