#!/usr/bin/env node
// Fase 1 · Diseñar: de una historia de usuario y su diseño de Figma a un plan de pruebas revisable.
// La IA (agente qa-test-designer) lee la historia, el diseño por el MCP de Figma y la app por el MCP de
// Playwright, y devuelve un JSON. El código valida ese JSON, calcula la cobertura de los criterios y
// escribe el plan en Markdown, en el formato que ya entiende el agente generator.
//
// Uso: npm run design:ai -- HU-001 [--snapshot] [--render] [--generate] [--dry-run]
//   --snapshot  no llama al MCP de Figma: usa specs/figma/HU-001.figma.json (modo demo sin conexión)
//   --render    no llama a la IA: valida y vuelve a escribir el plan desde specs/disenos/HU-001.design.json
//   --generate  al terminar, lanza el agente generator con los casos de prioridad alta que no existen aún
//   --dry-run   enseña el prompt que recibiría el agente y no llama a la IA
//   --replay    no llama a la IA: copia la propuesta grabada (specs/disenos/grabacion/HU-001.design.json)
//               y escribe el plan desde ella. Siempre el mismo resultado: es lo que usa la demo
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { runAgent } from "./agent.mjs";

const STORIES = "specs/historias";
const SNAPSHOTS = "specs/figma";
const DESIGNS = "specs/disenos";
// Lo único que puede escribir el agente diseñador. Lo comprueba el código al terminar.
const WRITABLE = /^specs\/(disenos|figma)\//;
const PLACEHOLDER = "FILE_KEY";

const TIPOS_CASO = ["positivo", "negativo", "limite"];
const PRIORIDADES = ["alta", "media", "baja"];
const TIPOS_DISCREPANCIA = ["texto", "elemento_no_implementado", "elemento_no_disenado", "comportamiento"];
const IMPACTOS = ["alto", "medio", "bajo"];
const RESPALDOS = ["diseno_y_app", "solo_diseno", "solo_app", "ninguno"];

const log = (msg) => console.log(`👉 ${msg}`);

export const paths = (id) => ({
    story: `${STORIES}/${id}.md`,
    snapshot: `${SNAPSHOTS}/${id}.figma.json`,
    design: `${DESIGNS}/${id}.design.json`,
    plan: `${DESIGNS}/${id}.plan.md`,
    recording: `${DESIGNS}/grabacion/${id}.design.json`,
    tests: `tests/${id.toLowerCase()}`,
});

// https://www.figma.com/design/<file_key>/<nombre>?node-id=1-2 → { fileKey, nodeId: "1:2" }. También /file/ y /proto/.
export function parseFigmaUrl(url) {
    const m = /figma\.com\/(?:design|file|proto)\/([A-Za-z0-9_]+)/.exec(url ?? "");
    if (!m) return null;
    const node = /[?&]node-id=([0-9]+[-:][0-9]+)/.exec(url);
    return { url, fileKey: m[1], nodeId: node ? node[1].replace("-", ":") : null };
}

export function parseStory(md, id) {
    const titulo = /^#\s+(.+)$/m.exec(md)?.[1]?.trim() ?? id;
    const figma = [...md.matchAll(/\*\*Figma:\*\*\s*(\S+)/g)].map((m) => parseFigmaUrl(m[1])).filter(Boolean);
    const criterios = [...md.matchAll(/^\s*-\s*\*\*(CA\d+)\.\*\*\s*(.+)$/gm)].map((m) => ({ id: m[1], texto: m[2].trim() }));
    return { id, titulo, figma, criterios, placeholder: figma.some((f) => f.fileKey === PLACEHOLDER) };
}

// Sin una URL real de Figma solo se puede trabajar con la instantánea.
export function chooseSource(story, { snapshot = false } = {}) {
    if (snapshot) return { source: "instantanea", reason: "pedido con --snapshot" };
    if (!story.figma.length) return { source: "instantanea", reason: "la historia no tiene ninguna línea **Figma:**" };
    if (story.placeholder) return { source: "instantanea", reason: `la historia aún tiene ${PLACEHOLDER} en la URL de Figma` };
    return { source: "figma-mcp", reason: null };
}

export function buildPrompt(story, { source, files }) {
    const frames = story.figma.map((f) => `- ${f.url} (file_key ${f.fileKey}, node ${f.nodeId ?? "todo el fichero"})`);
    return [
        `Diseña las pruebas de la historia ${story.id} siguiendo tus instrucciones.`,
        "",
        `Historia: ${files.story}. Léela entera.`,
        source === "figma-mcp"
            ? ["Diseño: léelo con el MCP de Figma. Frames de la historia:", ...frames,
                `Actualiza también la instantánea ${files.snapshot} con lo que devuelva Figma, con "origen": "figma-mcp".`].join("\n")
            : `Diseño: NO uses el MCP de Figma. Lee el diseño de la instantánea ${files.snapshot}.`,
        "App: recórrela con el MCP de Playwright, empezando por planner_setup_page.",
        "",
        `Escribe el resultado en ${files.design} con la forma exacta de tus instrucciones y "fuente_diseno": "${source}".`,
        `Los criterios de la historia son: ${story.criterios.map((c) => c.id).join(", ") || "ninguno"}. Usa esos ids, todos y solo esos.`,
        "No escribas ningún otro fichero.",
    ].join("\n");
}

const isStr = (v) => typeof v === "string" && v.trim() !== "";
const strArr = (v) => Array.isArray(v) && v.length > 0 && v.every(isStr);

// Devuelve la lista de problemas. Vacía = el JSON se puede usar.
export function validateDesign(d, story) {
    const errs = [];
    if (!d || typeof d !== "object") return ["el resultado no es un objeto JSON"];
    if (d.historia !== story.id) errs.push(`historia es "${d.historia}" y debería ser "${story.id}"`);
    for (const k of ["criterios", "casos", "discrepancias", "dudas"]) if (!Array.isArray(d[k])) errs.push(`falta la lista ${k}`);
    if (errs.length) return errs;

    const esperados = new Set(story.criterios.map((c) => c.id));
    const ids = new Set();
    for (const c of d.criterios) {
        if (!esperados.has(c.id)) errs.push(`criterio ${c.id} no está en la historia`);
        if (ids.has(c.id)) errs.push(`criterio ${c.id} repetido`);
        ids.add(c.id);
        for (const k of ["dado", "cuando", "entonces"]) if (!isStr(c[k])) errs.push(`criterio ${c.id}: falta ${k}`);
        if (!RESPALDOS.includes(c.respaldo)) errs.push(`criterio ${c.id}: respaldo "${c.respaldo}" no válido`);
    }
    for (const id of esperados) if (!ids.has(id)) errs.push(`falta el criterio ${id} de la historia`);

    const casos = new Set();
    for (const t of d.casos) {
        const n = t.id ?? "(sin id)";
        if (!/^TC-\d+$/.test(t.id ?? "")) errs.push(`caso ${n}: el id debe ser TC-<número>`);
        if (casos.has(t.id)) errs.push(`caso ${n} repetido`);
        casos.add(t.id);
        if (!isStr(t.titulo)) errs.push(`caso ${n}: falta el título`);
        if (!TIPOS_CASO.includes(t.tipo)) errs.push(`caso ${n}: tipo "${t.tipo}" no válido`);
        if (!PRIORIDADES.includes(t.prioridad)) errs.push(`caso ${n}: prioridad "${t.prioridad}" no válida`);
        if (!strArr(t.criterios)) errs.push(`caso ${n}: no apunta a ningún criterio`);
        else for (const c of t.criterios) if (!ids.has(c)) errs.push(`caso ${n}: apunta a ${c}, que no existe`);
        if (!strArr(t.pasos)) errs.push(`caso ${n}: sin pasos`);
        if (!strArr(t.esperado)) errs.push(`caso ${n}: sin resultado esperado`);
    }
    for (const x of d.discrepancias) {
        if (!TIPOS_DISCREPANCIA.includes(x.tipo)) errs.push(`discrepancia ${x.id}: tipo "${x.tipo}" no válido`);
        if (!IMPACTOS.includes(x.impacto)) errs.push(`discrepancia ${x.id}: impacto "${x.impacto}" no válido`);
        if (!isStr(x.diseno) || !isStr(x.app)) errs.push(`discrepancia ${x.id}: tiene que decir qué dice el diseño y qué hace la app`);
    }
    for (const q of d.dudas) if (!isStr(q.pregunta)) errs.push(`duda sobre ${q.criterio}: sin pregunta`);
    return errs;
}

// Cobertura de los criterios, calculada en código: no se le pregunta a la IA.
export function coverage(d) {
    const cubiertos = new Set(d.casos.flatMap((t) => t.criterios));
    const conDuda = new Set(d.dudas.map((q) => q.criterio));
    const sinCubrir = d.criterios.map((c) => c.id).filter((id) => !cubiertos.has(id));
    return {
        criterios: d.criterios.length,
        cubiertos: d.criterios.length - sinCubrir.length,
        sin_cubrir: sinCubrir,
        sin_cubrir_ni_duda: sinCubrir.filter((id) => !conDuda.has(id)),
        casos: d.casos.length,
        casos_nuevos: d.casos.filter((t) => !t.existe_en).length,
        discrepancias: d.discrepancias.length,
        discrepancias_alto: d.discrepancias.filter((x) => x.impacto === "alto").length,
        dudas: d.dudas.length,
    };
}

const cell = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");

// Plan en el formato del planner (### grupo / #### caso / Steps / Expected) para que el generator lo use tal cual.
export function renderPlan(d, story) {
    const cov = coverage(d);
    const byCa = (id) => d.casos.filter((t) => t.criterios.includes(id)).map((t) => t.id);
    const lines = [
        `# Plan de pruebas · ${story.titulo}`,
        "",
        `> Generado por \`npm run design:ai -- ${story.id}\` (agente \`qa-test-designer\`, diseño desde **${d.fuente_diseno === "figma-mcp" ? "el MCP de Figma" : "la instantánea"}**). Es una **propuesta**: la revisa una persona antes de automatizarla.`,
        "",
        `**Historia:** [\`${story.id}\`](../historias/${story.id}.md) · **Seed:** \`tests/seed.spec.ts\``,
        "",
        "## Resumen",
        "",
        "| Criterios cubiertos | Casos (nuevos) | Discrepancias (impacto alto) | Dudas para negocio |",
        "|---|---|---|---|",
        `| ${cov.cubiertos} de ${cov.criterios} | ${cov.casos} (${cov.casos_nuevos}) | ${cov.discrepancias} (${cov.discrepancias_alto}) | ${cov.dudas} |`,
        "",
    ];
    if (cov.sin_cubrir_ni_duda.length) lines.push(`> ⚠️ Sin caso ni duda: ${cov.sin_cubrir_ni_duda.join(", ")}. Revísalos a mano.`, "");

    lines.push("## Discrepancias entre el diseño y la app", "");
    if (d.discrepancias.length) {
        lines.push("| Id | Impacto | Pantalla · capa | Figma | App | Criterios | Recomendación |", "|---|---|---|---|---|---|---|");
        for (const x of d.discrepancias) {
            lines.push(`| ${cell(x.id)} | ${cell(x.impacto)} | ${cell(x.pantalla)} · \`${cell(x.capa)}\` | ${cell(x.diseno)} | ${cell(x.app)} | ${cell((x.criterios ?? []).join(", "))} | ${cell(x.recomendacion)} |`);
        }
    } else lines.push("Ninguna: el diseño y la app coinciden en lo que cubre la historia.");
    lines.push("", "## Dudas para negocio", "");
    lines.push(...(d.dudas.length ? d.dudas.map((q) => `- **${q.criterio}.** ${q.pregunta}${q.motivo ? ` _(${q.motivo})_` : ""}`) : ["Ninguna."]));

    lines.push("", "## Criterios de aceptación y trazabilidad", "", "| Criterio | Dado | Cuando | Entonces | Respaldo | Casos |", "|---|---|---|---|---|---|");
    for (const c of d.criterios) {
        lines.push(`| **${c.id}** | ${cell(c.dado)} | ${cell(c.cuando)} | ${cell(c.entonces)} | ${cell(c.respaldo)} | ${byCa(c.id).join(", ") || "—"} |`);
    }

    lines.push("", `### ${story.titulo.replace(/^HU-\d+\s*·\s*/, "")}`, "", "**Seed:** `tests/seed.spec.ts`", "");
    for (const t of d.casos) {
        lines.push(
            `#### ${t.id} ${t.titulo}`,
            "",
            `_${t.tipo} · prioridad ${t.prioridad} · ${t.criterios.join(", ")}${t.existe_en ? ` · ya cubierto en \`${t.existe_en}\`` : ""}_`,
            "",
            ...(t.precondicion ? [`**Precondición:** ${t.precondicion}`, ""] : []),
            "**Steps:**",
            ...t.pasos.map((p, i) => `${i + 1}. ${p}`),
            "",
            "**Expected Results:**",
            ...t.esperado.map((e) => `- ${e}`),
            ...(t.localizadores?.length ? ["", `**Localizadores:** ${t.localizadores.map((l) => `\`${l}\``).join(" · ")}`] : []),
            "",
        );
    }
    return lines.join("\n");
}

export function selectForGeneration(d, { all = false } = {}) {
    return d.casos.filter((t) => !t.existe_en && (all || t.prioridad === "alta"));
}

export function buildGeneratorPrompt(story, casos, files) {
    return [
        `Genera un test de Playwright por cada uno de estos casos del plan ${files.plan}:`,
        ...casos.map((t) => `- ${t.id} ${t.titulo}`),
        "",
        "Reglas:",
        `- Guarda cada test en ${files.tests}/ con un nombre de fichero que empiece por el id del caso en minúsculas y siga con el título (tc-05-mostrar-el-subtotal.spec.ts).`,
        "- Importa test y expect de '../../fixtures/scenarios' (no de '@playwright/test'), para que les afecten los escenarios de la demo.",
        "- Usa los page objects de ../../pages cuando cubran el paso. No modifiques pages/ ni fixtures/.",
        "- Cada expect lleva un mensaje en español que diga qué debería pasar, como en el resto de tests/.",
        `- Pon en el título del describe el id de la historia (${story.id}) y en el del test el id del caso.`,
        "- No generes tests para los casos que no estén en la lista.",
    ].join("\n");
}

const run = (cmd, args) => execFileSync(cmd, args, { encoding: "utf8" });

function changedOutside() {
    try {
        return run("git", ["status", "--porcelain", "-z"]).split("\0").filter(Boolean)
            .map((e) => e.slice(3)).filter((f) => f && !WRITABLE.test(f) && !f.startsWith("playwright-report/") && !f.startsWith("test-results"));
    } catch {
        return [];
    }
}

function printSummary(d, cov, files) {
    console.log(`\n✅ Plan en ${files.plan}`);
    console.log(`   Criterios cubiertos: ${cov.cubiertos} de ${cov.criterios}${cov.sin_cubrir.length ? ` (sin caso: ${cov.sin_cubrir.join(", ")})` : ""}`);
    console.log(`   Casos: ${cov.casos}, de ellos ${cov.casos_nuevos} nuevos`);
    console.log(`   Discrepancias diseño ↔ app: ${cov.discrepancias} (${cov.discrepancias_alto} de impacto alto)`);
    for (const x of d.discrepancias) console.log(`     · ${x.id} [${x.impacto}] Figma: ${x.diseno} · App: ${x.app}`);
    console.log(`   Dudas para negocio: ${cov.dudas}`);
    for (const q of d.dudas) console.log(`     · ${q.criterio}: ${q.pregunta}`);
}

async function main() {
    const args = process.argv.slice(2);
    const id = args.find((a) => !a.startsWith("--"));
    if (!id) throw new Error("Falta el id de la historia: npm run design:ai -- HU-001");
    const files = paths(id);
    if (!existsSync(files.story)) throw new Error(`No existe ${files.story}.`);
    const story = parseStory(readFileSync(files.story, "utf8"), id);
    if (!story.criterios.length) throw new Error(`${files.story} no tiene criterios con el formato "- **CA1.** texto".`);

    if (args.includes("--replay")) {
        if (!existsSync(files.recording)) throw new Error(`No existe la propuesta grabada ${files.recording}.`);
        log(`Reproduciendo la propuesta grabada ${files.recording}: no se llama a la IA.`);
        copyFileSync(files.recording, files.design);
    } else if (!args.includes("--render")) {
        const { source, reason } = chooseSource(story, { snapshot: args.includes("--snapshot") });
        if (source === "instantanea") {
            if (!existsSync(files.snapshot)) throw new Error(`Modo instantánea (${reason}) y no existe ${files.snapshot}.`);
            log(`Diseño desde la instantánea ${files.snapshot}: ${reason}.`);
        } else log(`Diseño desde el MCP de Figma: ${story.figma.length} frame(s).`);
        const prompt = buildPrompt(story, { source, files });
        if (args.includes("--dry-run")) {
            console.log(prompt);
            return;
        }
        mkdirSync(DESIGNS, { recursive: true });
        log("Ejecutando el agente qa-test-designer (claude -p). Puede tardar unos minutos...");
        const tools = ["Read,Glob,Grep,LS,Write,mcp__playwright-test", ...(source === "figma-mcp" ? ["mcp__figma"] : [])].join(",");
        await runAgent("qa-test-designer", prompt, { tools, mcp: true });
        const outside = changedOutside();
        if (outside.length) throw new Error(`El agente ha tocado ficheros fuera de specs/disenos/ y specs/figma/: ${outside.join(", ")}. Revísalos a mano.`);
    }

    if (!existsSync(files.design)) throw new Error(`No existe ${files.design}: el agente no ha escrito el resultado.`);
    const design = JSON.parse(readFileSync(files.design, "utf8"));
    const errs = validateDesign(design, story);
    if (errs.length) throw new Error(`El resultado no es válido; no se escribe el plan:\n${errs.map((e) => `   - ${e}`).join("\n")}`);
    writeFileSync(files.plan, renderPlan(design, story) + "\n");
    const cov = coverage(design);
    printSummary(design, cov, files);

    if (args.includes("--generate")) {
        const casos = selectForGeneration(design, { all: args.includes("--all") });
        if (!casos.length) {
            console.log("\n✅ No hay casos nuevos de prioridad alta que generar.");
            return;
        }
        mkdirSync(files.tests, { recursive: true });
        log(`Generando ${casos.length} test(s) con el agente playwright-test-generator en ${files.tests}/...`);
        await runAgent("playwright-test-generator", buildGeneratorPrompt(story, casos, files), { tools: "Read,Glob,Grep,LS,mcp__playwright-test", mcp: true });
        console.log(`\n👉 Siguiente: npx playwright test ${files.tests} --project=chromium && npm run lint, y revisa los tests antes de confirmarlos.`);
    } else {
        console.log(`\n👉 Siguiente: revisa el plan y, si lo apruebas, npm run design:ai -- ${id} --render --generate`);
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main().catch((e) => { console.error(`❌ ${e.message}`); process.exit(1); });
}

