// Fase 1: lo que decide design-ai.mjs sin llamar a la IA, a Figma ni al navegador.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
    parseFigmaUrl, parseStory, chooseSource, buildPrompt, validateDesign, coverage, renderPlan,
    selectForGeneration, buildGeneratorPrompt, paths,
} from "./design-ai.mjs";

const story = parseStory(readFileSync("specs/historias/HU-001.md", "utf8"), "HU-001");

const caso = (id, criterios, extra = {}) => ({
    id, titulo: `caso ${id}`, tipo: "positivo", prioridad: "alta", criterios, pantallas: ["1:2"],
    precondicion: "sesión iniciada", pasos: ["paso"], esperado: ["resultado"], localizadores: ['[data-test="x"]'], existe_en: null, ...extra,
});
const criterio = (id, respaldo = "diseno_y_app") => ({ id, texto: id, dado: "d", cuando: "c", entonces: "e", respaldo });
const valido = () => ({
    historia: "HU-001", titulo: "t", fuente_diseno: "instantanea",
    criterios: ["CA1", "CA2", "CA3", "CA6", "CA7"].map((c) => criterio(c)).concat([criterio("CA4", "solo_diseno"), criterio("CA5", "ninguno")]),
    casos: [
        caso("TC-01", ["CA1"]), caso("TC-02", ["CA2"], { prioridad: "media" }), caso("TC-03", ["CA3"], { existe_en: "tests/cart-sync.spec.ts:12" }),
        caso("TC-04", ["CA4"]), caso("TC-05", ["CA6"], { tipo: "limite" }), caso("TC-06", ["CA7"]),
    ],
    discrepancias: [{ id: "D1", tipo: "elemento_no_implementado", pantalla: "1:3", capa: "cart-subtotal", diseno: "Subtotal: $39.98", app: "sin subtotal", criterios: ["CA4"], impacto: "alto", recomendacion: "preguntar | a negocio" }],
    dudas: [{ criterio: "CA5", pregunta: "¿Se puede cambiar la cantidad?", motivo: "ni diseño ni app" }],
});

test("lee las URLs de Figma y convierte el node-id al formato del MCP", () => {
    assert.deepEqual(parseFigmaUrl("https://www.figma.com/design/AbC123/SauceDemo?node-id=1-2&t=x"), { url: "https://www.figma.com/design/AbC123/SauceDemo?node-id=1-2&t=x", fileKey: "AbC123", nodeId: "1:2" });
    assert.equal(parseFigmaUrl("https://www.figma.com/file/K9/x").nodeId, null);
    assert.equal(parseFigmaUrl("https://example.com/design/x"), null);
});

test("la historia de la demo tiene 7 criterios y dos frames aún sin fichero real", () => {
    assert.equal(story.titulo, "HU-001 · Añadir productos al carrito y revisarlo antes de pagar");
    assert.deepEqual(story.criterios.map((c) => c.id), ["CA1", "CA2", "CA3", "CA4", "CA5", "CA6", "CA7"]);
    assert.deepEqual(story.figma.map((f) => f.nodeId), ["1:2", "1:3"]);
    assert.equal(story.placeholder, true);
});

test("sin URL real de Figma se trabaja con la instantánea, y con URL real por el MCP", () => {
    assert.equal(chooseSource(story).source, "instantanea");
    const real = { ...story, placeholder: false };
    assert.equal(chooseSource(real).source, "figma-mcp");
    assert.equal(chooseSource(real, { snapshot: true }).source, "instantanea");
    assert.equal(chooseSource({ ...real, figma: [] }).source, "instantanea");
});

test("el prompt solo deja usar Figma cuando toca y fija los ids de los criterios", () => {
    const files = paths("HU-001");
    const snap = buildPrompt(story, { source: "instantanea", files });
    assert.match(snap, /NO uses el MCP de Figma/);
    assert.ok(snap.includes("specs/figma/HU-001.figma.json") && snap.includes("CA1, CA2, CA3, CA4, CA5, CA6, CA7"));
    const mcp = buildPrompt({ ...story, placeholder: false }, { source: "figma-mcp", files });
    assert.ok(mcp.includes("node 1:3") && mcp.includes('"origen": "figma-mcp"') && !mcp.includes("NO uses"));
});

test("un resultado bien formado pasa la validación", () => {
    assert.deepEqual(validateDesign(valido(), story), []);
});

test("la validación rechaza criterios inventados u olvidados y casos sin trazar", () => {
    const d = valido();
    d.criterios = d.criterios.filter((c) => c.id !== "CA7").concat([criterio("CA9")]);
    d.casos.push(caso("TC-07", []), caso("TC-08", ["CA42"]), { ...caso("TC-01", ["CA1"]) });
    const errs = validateDesign(d, story).join("\n");
    for (const s of ["CA9 no está en la historia", "falta el criterio CA7", "TC-07: no apunta a ningún criterio", "TC-08: apunta a CA42", "TC-01 repetido"]) {
        assert.ok(errs.includes(s), `falta "${s}" en:\n${errs}`);
    }
    assert.deepEqual(validateDesign({ historia: "HU-002" }, story).slice(0, 1), ['historia es "HU-002" y debería ser "HU-001"']);
});

test("una discrepancia tiene que decir qué dice Figma y qué hace la app", () => {
    const d = valido();
    d.discrepancias[0].app = "";
    assert.match(validateDesign(d, story).join("\n"), /D1: tiene que decir/);
});

test("la cobertura la calcula el código y separa lo que queda como duda", () => {
    const cov = coverage(valido());
    assert.deepEqual(cov, { criterios: 7, cubiertos: 6, sin_cubrir: ["CA5"], sin_cubrir_ni_duda: [], casos: 6, casos_nuevos: 5, discrepancias: 1, discrepancias_alto: 1, dudas: 1 });
    const sinDuda = { ...valido(), dudas: [] };
    assert.deepEqual(coverage(sinDuda).sin_cubrir_ni_duda, ["CA5"]);
});

test("el plan usa el formato del planner, traza cada criterio y escapa las tablas", () => {
    const md = renderPlan(valido(), story);
    assert.ok(md.includes("**Seed:** `tests/seed.spec.ts`"));
    assert.ok(md.includes("#### TC-01 caso TC-01") && md.includes("**Steps:**") && md.includes("**Expected Results:**"));
    assert.ok(md.includes("| 6 de 7 | 6 (5) | 1 (1) | 1 |"), "resumen");
    assert.ok(md.includes("| **CA5** | d | c | e | ninguno | — |"), "criterio sin caso");
    assert.ok(md.includes("preguntar \\| a negocio"), "el | de una celda se escapa");
    assert.ok(md.includes("ya cubierto en `tests/cart-sync.spec.ts:12`"));
    assert.ok(md.includes("### Añadir productos al carrito y revisarlo antes de pagar"));
});

test("solo se generan los casos nuevos de prioridad alta, salvo que se pidan todos", () => {
    assert.deepEqual(selectForGeneration(valido()).map((t) => t.id), ["TC-01", "TC-04", "TC-05", "TC-06"]);
    assert.deepEqual(selectForGeneration(valido(), { all: true }).map((t) => t.id), ["TC-01", "TC-02", "TC-04", "TC-05", "TC-06"]);
});

test("el generator importa del fixture de escenarios y escribe en la carpeta de la historia", () => {
    const p = buildGeneratorPrompt(story, [caso("TC-01", ["CA1"])], paths("HU-001"));
    assert.ok(p.includes("'../../fixtures/scenarios'") && p.includes("tests/hu-001/") && p.includes("TC-01 caso TC-01"));
});

test("la instantánea de la demo trae las dos discrepancias a propósito", () => {
    const snap = JSON.parse(readFileSync("specs/figma/HU-001.figma.json", "utf8"));
    assert.equal(snap.origen, "simulada");
    const capas = snap.frames.flatMap((f) => f.capas);
    assert.equal(capas.find((c) => c.nombre === "cart-subtotal")?.texto, "Subtotal: $39.98");
    assert.equal(capas.find((c) => c.nombre === "product-sort-container")?.texto, "Price (low to high)");
});
