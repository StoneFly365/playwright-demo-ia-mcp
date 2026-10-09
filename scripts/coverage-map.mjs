#!/usr/bin/env node
// Matriz escenario → test reproducible, sin ejecutar tests ni abrir la app.
//   node scripts/coverage-map.mjs [app] [--out ruta.md]
// Fuentes: specs/<app>/test-scenarios.md (escenarios), specs/<app>/coverage-matrix.md (lo declarado),
// `playwright test --list` (tests que existen de verdad) y los comentarios `// ID` dentro de cada test.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import { collectTests, scenarioIdsByTestLine } from "./triage/core.mjs";

/**
 * Niveles de correspondencia, de más a menos fuerte:
 *  - test-body: el id está en un comentario dentro del cuerpo de un test que Playwright lista.
 *  - file-only: la matriz nombra un fichero que existe, pero ningún test de ese fichero lleva el id.
 *  - none: ninguna de las dos.
 */
export function buildCoverage({ scenariosMd, matrixMd, listed, readSpec, specExists }) {
    const scenarios = [...scenariosMd.matchAll(/^#{2,4}\s+([A-Z]{2,5}-\d{2}[a-z]?)\s+·\s+(.+)$/gm)]
        .map((m) => ({ id: m[1], title: m[2].trim() }));
    const matrix = new Map();
    for (const row of matrixMd.split(/\r?\n/).filter((l) => l.startsWith("|"))) {
        const cells = row.split("|").map((c) => c.trim());
        const id = cells[2]?.match(/^([A-Z]{2,5}-\d{2}[a-z]?)\b/)?.[1];
        if (id) matrix.set(id, { files: [...cells[5].matchAll(/`([^`]+\.spec\.ts)`/g)].map((m) => m[1]), declared: cells[6], status: cells[7] });
    }

    // id → tests (Playwright --list) cuyo cuerpo lo menciona
    const byId = new Map();
    const files = new Set(listed.map((t) => t.file));
    for (const file of files) {
        const ids = scenarioIdsByTestLine(readSpec(file));
        for (const t of listed.filter((x) => x.file === file)) {
            for (const id of ids.get(t.line) ?? []) {
                if (!byId.has(id)) byId.set(id, []);
                byId.get(id).push(`${path.basename(file)}:${t.line} ${t.title}`);
            }
        }
    }

    const known = new Set(scenarios.map((s) => s.id));
    const rows = scenarios.map((s) => {
        const m = matrix.get(s.id);
        const tests = [...new Set(byId.get(s.id) ?? [])].sort();
        const missingFiles = (m?.files ?? []).filter((f) => !specExists(f));
        const level = tests.length ? "test-body" : m?.files.some((f) => specExists(f)) ? "file-only" : "none";
        const issues = [];
        if (!m) issues.push("no está en la matriz");
        if (missingFiles.length) issues.push(`la matriz cita ficheros inexistentes: ${missingFiles.join(", ")}`);
        if (m?.declared === "AUTOMATED" && level !== "test-body") issues.push("la matriz dice AUTOMATED pero ningún test lleva el id");
        if (m?.declared === "NOT AUTOMATED" && level === "test-body") issues.push("la matriz dice NOT AUTOMATED pero hay tests con el id");
        return { id: s.id, title: s.title, declared: m?.declared ?? "—", level, tests, issues };
    });
    const unknownIds = [...byId.keys()].filter((id) => !known.has(id)).sort()
        .map((id) => ({ id, tests: [...new Set(byId.get(id))].sort() }));
    return { rows, unknownIds };
}

export function toMarkdown(app, { rows, unknownIds }) {
    const count = (lvl) => rows.filter((r) => r.level === lvl).length;
    const out = [
        `# Cobertura verificada · ${app}`,
        "",
        "Generado por `npm run coverage:map`. No editar a mano.",
        "",
        "Nivel de correspondencia: **test-body** (el id está en un comentario dentro de un test que Playwright lista) · **file-only** (la matriz cita un fichero que existe, sin test con el id) · **none**.",
        "Que un test lleve el id no prueba que cubra todos los pasos del escenario: eso lo revisa una persona.",
        "",
        `Escenarios: ${rows.length} · test-body: ${count("test-body")} · file-only: ${count("file-only")} · none: ${count("none")} · con incidencias: ${rows.filter((r) => r.issues.length).length}`,
        "",
        "| Escenario | Matriz | Nivel | Tests | Incidencias |",
        "|---|---|---|---|---|",
        ...rows.map((r) => `| ${r.id} ${r.title} | ${r.declared} | ${r.level} | ${r.tests.join("<br>") || "—"} | ${r.issues.join("; ") || "—"} |`),
    ];
    if (unknownIds.length) {
        out.push("", "## Ids en tests que no existen en test-scenarios.md", "",
            ...unknownIds.map((u) => `- ${u.id}: ${u.tests.join(", ")}`));
    }
    return out.join("\n") + "\n";
}

if (process.argv[1]?.endsWith("coverage-map.mjs")) {
    const args = process.argv.slice(2);
    const app = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--out") ?? "finanzas-pareja";
    const outFile = args.includes("--out") ? args[args.indexOf("--out") + 1] : null;
    const testDir = path.resolve("tests");
    // --list no ejecuta tests ni abre el navegador.
    const listJson = execSync(`npx playwright test --list --reporter=json --project=${app}`, { encoding: "utf8", maxBuffer: 64 << 20 });
    const listed = collectTests(JSON.parse(listJson));
    const result = buildCoverage({
        scenariosMd: readFileSync(`specs/${app}/test-scenarios.md`, "utf8"),
        matrixMd: readFileSync(`specs/${app}/coverage-matrix.md`, "utf8"),
        listed,
        readSpec: (file) => readFileSync(path.join(testDir, file), "utf8"),
        specExists: (f) => existsSync(path.join(testDir, app, f)) || existsSync(path.join(testDir, f)),
    });
    const md = toMarkdown(app, result);
    if (outFile) writeFileSync(outFile, md, "utf8");
    else process.stdout.write(md);
    const problems = result.rows.filter((r) => r.issues.length).length + result.unknownIds.length;
    console.error(`${result.rows.length} escenarios · ${problems} incidencias${outFile ? ` → ${outFile}` : ""}`);
}
