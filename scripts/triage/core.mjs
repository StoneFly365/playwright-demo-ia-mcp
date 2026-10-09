// Triaje de resultados de Playwright: contrato, capa 1 (reglas) y validación de la capa 2 (IA).
// Funciones puras: no leen ni escriben ficheros y no llaman a la red. Playwright decide si un
// test pasa o falla; aquí solo se explica ese resultado, nunca se cambia.
import { createHash } from "node:crypto";

export const SCHEMA_VERSION = "1.0.0";
export const RULES_VERSION = "rules-1";

export const CATEGORIES = [
    "PASSED", "SKIPPED",
    "PRODUCT_REGRESSION", "TEST_DEFECT", "ENVIRONMENT_FAILURE", "KNOWN_DEFECT",
    "FLAKY_FAILURE", "UNEXPECTED_PASS", "INCONCLUSIVE",
];
// Lo único que puede proponer la IA. PASSED, SKIPPED, KNOWN_DEFECT y UNEXPECTED_PASS son hechos
// que salen de Playwright y de las marcas del test: solo los deciden las reglas.
export const AI_CATEGORIES = ["PRODUCT_REGRESSION", "TEST_DEFECT", "ENVIRONMENT_FAILURE", "FLAKY_FAILURE", "INCONCLUSIVE"];
// Escala ordinal, no una probabilidad calibrada (ver docs/agentic-qa.md).
export const CONFIDENCE = ["high", "medium", "low"];

// Firmas de fallo de entorno. Las cuatro primeras sirven para cualquier app; las dos últimas
// son el arranque de finanzas-pareja (`abrir()`), antes y después del arreglo de ENV-01.
const ENV_PATTERNS = [
    /net::ERR_(CONNECTION_\w+|NAME_NOT_RESOLVED|INTERNET_DISCONNECTED|TIMED_OUT|ADDRESS_UNREACHABLE|NETWORK_CHANGED|SSL_\w+)/,
    /\b(ECONNREFUSED|ECONNRESET|ENOTFOUND|ETIMEDOUT|EAI_AGAIN)\b/,
    /browserType\.launch|Executable doesn't exist|Failed to launch/,
    /\b(502 Bad Gateway|503 Service Unavailable|504 Gateway Time-?out)\b/,
    /La app no terminó de arrancar/,
    /waitForEvent: Timeout \d+ms exceeded while waiting for event "console"/,
];

export class TriageInputError extends Error {}

const stripAnsi = (s) => String(s ?? "").replace(/\x1b\[[0-9;]*[A-Za-z]/g, "");
const firstLine = (s) => stripAnsi(s).split("\n").find((l) => l.trim()) ?? "";
const isEnv = (msg) => ENV_PATTERNS.some((re) => re.test(msg));
const isAssertion = (msg) => /\bexpect(\.soft)?\(/.test(firstLine(msg));
const norm = (p) => String(p ?? "").replaceAll("\\", "/");

/** Quita rutas absolutas, credenciales y correos de un texto que puede salir del repo. */
export function redact(text, roots = []) {
    let s = stripAnsi(text);
    for (const r of roots.filter(Boolean).map(norm).sort((a, b) => b.length - a.length)) {
        s = norm(s).replaceAll(r.endsWith("/") ? r : r + "/", "");
    }
    return s
        .replace(/\b(Bearer|Basic)\s+[\w.~+/=-]+/gi, "$1 [redactado]")
        .replace(/\b(sk-[\w-]{16,}|AIza[\w-]{30,}|gh[pousr]_\w{30,}|xox[abp]-[\w-]+|eyJ[\w-]{10,}\.[\w-]{10,}\.[\w-]+)/g, "[redactado]")
        .replace(/\b(password|passwd|pwd|secret|token|api[_-]?key|authorization)(["']?\s*[=:]\s*)\S+/gi, "$1$2[redactado]")
        .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, "[email]")
        .replace(/[A-Za-z]:\/(?:Users|home)\/[^/\s]+/g, "[ruta]")
        .replace(/\/(?:Users|home)\/[^/\s]+/g, "[ruta]");
}

/** JSON con claves ordenadas: el mismo contenido da siempre el mismo hash. */
export function canonicalJson(v) {
    if (Array.isArray(v)) return `[${v.map(canonicalJson).join(",")}]`;
    if (v && typeof v === "object") {
        return `{${Object.keys(v).sort().filter((k) => v[k] !== undefined)
            .map((k) => `${JSON.stringify(k)}:${canonicalJson(v[k])}`).join(",")}}`;
    }
    return JSON.stringify(v ?? null);
}
export const sha256 = (s) => createHash("sha256").update(s).digest("hex");

/**
 * Ids de escenario (`// ALTA-01`) por línea de declaración de test.
 * Un comentario pertenece al test declarado más cerca por encima de él, así que solo cuentan
 * los comentarios dentro del cuerpo del test, no los de un `describe` ni los de la cabecera.
 */
export function scenarioIdsByTestLine(source) {
    // ponytail: el cuerpo termina en el primer `});` con la sangría de la declaración (código formateado);
    // con código sin formatear habría que usar un parser de TypeScript.
    const byLine = new Map();
    let owner = null;
    let indent = "";
    String(source).split(/\r?\n/).forEach((text, i) => {
        const decl = text.match(/^(\s*)test(\.(only|skip|fixme|fail|slow))?\(\s*[`'"]/);
        if (decl) {
            owner = i + 1;
            indent = decl[1];
            byLine.set(owner, []);
            return;
        }
        if (owner && text.startsWith(`${indent}});`)) { owner = null; return; }
        const id = text.match(/^\s*\/\/\s*([A-Z]{2,5}-\d{2}[a-z]?)\b/)?.[1];
        if (id && owner && !byLine.get(owner).includes(id)) byLine.get(owner).push(id);
    });
    return byLine;
}

/**
 * Recorre el informe JSON de Playwright y devuelve un registro por test y proyecto.
 * Con `--repeat-each=N` el reporter mete las N repeticiones en el mismo `spec.tests`, con el
 * mismo proyecto: se agrupan en un solo registro con una entrada por ejecución en `executions`.
 */
export function collectTests(report) {
    if (!report || typeof report !== "object" || !Array.isArray(report.suites)) {
        throw new TriageInputError("El informe no tiene el formato del reporter JSON de Playwright (falta `suites`).");
    }
    const out = [];
    const walk = (suite, titles) => {
        if (!suite || typeof suite !== "object") throw new TriageInputError("Suite con formato inválido.");
        const path = suite.title && !suite.title.endsWith(".ts") ? [...titles, suite.title] : titles;
        for (const spec of suite.specs ?? []) {
            const byProject = new Map();
            for (const t of spec.tests ?? []) {
                if (!Array.isArray(t?.results)) throw new TriageInputError(`Test sin \`results\`: ${spec.title}`);
                const project = t.projectName ?? t.projectId ?? "?";
                if (!byProject.has(project)) byProject.set(project, []);
                byProject.get(project).push(t);
            }
            for (const [project, runs] of byProject) {
                out.push({
                    test_id: `${project}::${spec.id}`,
                    title: [...path, spec.title].join(" › "),
                    file: norm(spec.file),
                    line: spec.line ?? null,
                    project,
                    tags: (spec.tags ?? []).map((g) => (g.startsWith("@") ? g : `@${g}`)),
                    annotations: (runs[0].annotations ?? []).map((a) => ({ type: a.type, description: a.description ?? null })),
                    expectedStatus: runs[0].expectedStatus,
                    executions: runs.map((t) => ({
                        status: t.status,
                        attempts: t.results.map((r) => ({
                            status: r.status,
                            retry: r.retry ?? 0,
                            error: stripAnsi(r.errors?.[0]?.message ?? r.error?.message ?? "").slice(0, 4000) || null,
                            error_location: r.errorLocation ? `${norm(r.errorLocation.file)}:${r.errorLocation.line}` : null,
                            error_context: r.attachments?.find((a) => a.name === "error-context")?.path ?? null,
                        })),
                    })),
                });
            }
        }
        for (const child of suite.suites ?? []) walk(child, path);
    };
    report.suites.forEach((s) => walk(s, []));
    return out;
}

export function defectIds(rec) {
    const ids = rec.tags.map((g) => g.match(/^@bug-(.+)$/)?.[1]).filter(Boolean);
    for (const a of rec.annotations) {
        const id = a.type === "issue" && a.description?.match(/^\s*([A-Z][\w-]*\d)\s*:/)?.[1];
        if (id && !ids.includes(id)) ids.push(id);
    }
    return ids;
}

/**
 * Hechos que se usan para clasificar: es lo que se hashea y lo único que puede ver la IA.
 * Con una sola ejecución tienen la misma forma (y el mismo hash) que en la versión anterior;
 * con varias, `status` es null, `execution_statuses` lleva el estado de cada una y cada intento
 * indica a qué ejecución pertenece.
 */
export function facts(rec, { roots = [], scenarioId = null } = {}) {
    const repeated = rec.executions.length > 1;
    const attempt = (a, execution) => ({
        status: a.status,
        retry: a.retry,
        execution: repeated ? execution : undefined,
        error: a.error && redact(a.error, roots).slice(0, 1500),
        error_location: a.error_location && redact(a.error_location, roots),
        has_error_context: !!a.error_context,
    });
    return {
        test_id: rec.test_id,
        scenario_id: scenarioId,
        title: redact(rec.title, roots),
        file: rec.file,
        line: rec.line,
        project: rec.project,
        tags: rec.tags,
        annotations: rec.annotations.map((a) => ({ type: a.type, description: a.description && redact(a.description, roots) })),
        expected_status: rec.expectedStatus,
        status: repeated ? null : rec.executions[0].status,
        execution_statuses: repeated ? rec.executions.map((e) => e.status) : undefined,
        attempts: rec.executions.flatMap((e, i) => e.attempts.map((a) => attempt(a, i))),
    };
}

function diagnosis(f, classification, confidence, rule, { evidence = [], reasoning, action, review, needsAi = false }) {
    return {
        schema_version: SCHEMA_VERSION,
        test_id: f.test_id,
        scenario_id: f.scenario_id,
        title: f.title,
        file: f.file,
        line: f.line,
        project: f.project,
        classification,
        confidence,
        source: "rules",
        rule_id: rule,
        evidence,
        hypotheses: [],
        reasoning_summary: reasoning,
        recommended_action: action,
        requires_human_review: review,
        needs_ai: needsAi,
        model: null,
        prompt_version: RULES_VERSION,
        input_hash: sha256(canonicalJson(f)),
        facts: f,
    };
}

/** Capa 1: reglas explícitas sobre estados, marcas y firmas de error. No usa IA. */
export function classify(f) {
    if (!f.execution_statuses) return classifyExecution(f);

    // Varias ejecuciones del mismo test (--repeat-each): se clasifica cada una y se combinan.
    const runs = f.execution_statuses.map((status, i) =>
        classifyExecution({ ...f, status, execution_statuses: undefined, attempts: f.attempts.filter((a) => a.execution === i) }));
    const cats = new Set(runs.map((r) => r.classification));
    const statusEv = { source: "execution_statuses", quote: f.execution_statuses.join(", ") };
    const n = runs.length;
    const failing = runs.filter((r) => !["PASSED", "UNEXPECTED_PASS", "SKIPPED"].includes(r.classification));
    const base = failing[0] ?? runs[0];
    const d = (cat, conf, rule, o) => diagnosis(f, cat, conf, rule, { evidence: [statusEv, ...base.evidence.filter((e) => e.source !== "status")], ...o });

    if (cats.size === 1) {
        return d(base.classification, base.confidence, base.rule_id, {
            reasoning: base.classification === "PASSED"
                ? `Pasó en las ${n} repeticiones: no hay señal de intermitencia. No descarta un falso positivo que pase siempre.`
                : `${base.reasoning_summary} Igual en las ${n} ejecuciones.`,
            action: base.recommended_action, review: base.requires_human_review, needsAi: base.needs_ai,
        });
    }
    const passedSome = runs.some((r) => ["PASSED", "UNEXPECTED_PASS"].includes(r.classification));
    if (passedSome && failing.length && failing.every((r) => r.classification === "ENVIRONMENT_FAILURE")) {
        return d("ENVIRONMENT_FAILURE", "high", "R-ENV-REPEAT", {
            reasoning: `Pasa en unas ejecuciones y en las demás falla con firma de entorno (${failing.length}/${n}).`,
            action: "Comprobar el estado del host en esa ventana de tiempo y repetir. No tocar el test.", review: true,
        });
    }
    if (passedSome && failing.length) {
        return d("FLAKY_FAILURE", "high", "R-FLAKY-REPEAT", {
            reasoning: `Resultado distinto entre repeticiones de la misma ejecución: falla en ${failing.length} de ${n}.`,
            action: "Reproducir la carrera (sondas, traza) antes de confiar en el resultado; ver flakiness-report.", review: true,
        });
    }
    return d("INCONCLUSIVE", "medium", "R-MIXED", {
        reasoning: `Las ${n} ejecuciones fallan, pero no por la misma causa: ${[...cats].join(", ")}.`,
        action: "Revisar cada ejecución por separado.", review: true,
    });
}

function classifyExecution(f) {
    const last = f.attempts.at(-1);
    const err = last?.error ?? "";
    const ids = defectIds({ tags: f.tags, annotations: f.annotations });
    const ev = [
        { source: "expected_status", quote: String(f.expected_status) },
        { source: "status", quote: String(f.status) },
        { source: "attempts", quote: f.attempts.map((a) => a.status).join(", ") || "(ninguno)" },
    ];
    if (err) ev.push({ source: "error", quote: firstLine(err).slice(0, 300) });
    if (last?.error_location) ev.push({ source: "error_location", quote: last.error_location });
    if (last?.has_error_context) ev.push({ source: "error_context", quote: "error-context.md adjunto" });
    for (const id of ids) ev.push({ source: "tag", quote: f.tags.find((t) => t === `@bug-${id}`) ?? id });
    const d = (cat, conf, rule, o) => diagnosis(f, cat, conf, rule, { evidence: ev, ...o });

    if (!last) {
        return d("INCONCLUSIVE", "low", "R-NO-RESULTS", { reasoning: "Playwright no registró ningún intento.", action: "Revisar si el test llegó a ejecutarse.", review: true });
    }
    if (f.status === "skipped" || f.expected_status === "skipped") {
        return d("SKIPPED", "high", "R-SKIPPED", { reasoning: "El test está omitido (skip/fixme).", action: "Ninguna.", review: false });
    }
    if (f.status === "flaky") {
        return d("FLAKY_FAILURE", "high", "R-FLAKY", { reasoning: "Falló y pasó en un reintento de la misma ejecución.", action: "Investigar la intermitencia antes de confiar en el verde.", review: true });
    }
    if (last.status === "interrupted") {
        return d("INCONCLUSIVE", "medium", "R-INTERRUPTED", { reasoning: "La ejecución se interrumpió antes de terminar el test.", action: "Repetir la ejecución.", review: true });
    }
    if (f.status === "expected" && f.expected_status === "passed") {
        // El paso es un hecho, pero un resultado verde no puede descartar un falso positivo: un test
        // que pasa por casualidad pasa siempre (FLAKY-02). Por eso la confianza no llega a "high".
        return d("PASSED", "medium", "R-PASSED", {
            reasoning: "Pasó, como se esperaba. Es el resultado observado: no demuestra que el test sea estable ni que compruebe bien el requisito.",
            action: "Ninguna en el triaje. Los falsos positivos se buscan con la revisión de calidad (test-quality-review).",
            review: false,
        });
    }
    if (f.expected_status === "failed" && last.status === "passed") {
        return d("UNEXPECTED_PASS", "high", "R-UNEXPECTED-PASS", {
            reasoning: `Marcado con test.fail()${ids.length ? ` por ${ids.join(", ")}` : ""}, pero pasó.`,
            action: "Comprobar si el defecto está corregido y, si lo está, retirar test.fail() y la etiqueta @bug con aprobación humana.",
            review: true,
        });
    }
    if (isEnv(err)) {
        const masked = f.status === "expected";
        return d("ENVIRONMENT_FAILURE", "high", masked ? "R-ENV-MASKED" : "R-ENV", {
            reasoning: masked
                ? "El error es de entorno; test.fail() lo contaba como esperado y ocultaba la caída (AD-06)."
                : "El error coincide con una firma de fallo de red, host o navegador.",
            action: "Comprobar el estado del host y de la red, y repetir. No tocar el test.",
            review: masked,
        });
    }
    if (f.expected_status === "failed") {
        if (!ids.length) {
            return d("INCONCLUSIVE", "medium", "R-FAIL-NO-ID", { reasoning: "Falla como espera test.fail(), pero no indica qué defecto conocido lo justifica.", action: "Añadir la etiqueta @bug-<id> y la anotación issue, o retirar test.fail().", review: true });
        }
        const inSpec = last.error_location?.replace(/:\d+$/, "").endsWith(f.file);
        if (last.status !== "failed" || !isAssertion(err) || !inSpec) {
            return d("INCONCLUSIVE", "medium", "R-KNOWN-MASKED", {
                reasoning: `Marcado por ${ids.join(", ")}, pero no falla en una aserción del propio spec: el defecto podría estar enmascarando otro fallo (AD-06).`,
                action: "Revisar el error-context y confirmar que el fallo es el del defecto.",
                review: true,
            });
        }
        return d("KNOWN_DEFECT", "high", "R-KNOWN", { reasoning: `Falla en una aserción del spec, como documenta ${ids.join(", ")}.`, action: `Seguir ${ids.join(", ")} en el registro de defectos.`, review: false });
    }
    return d("INCONCLUSIVE", "low", "R-UNEXPECTED", {
        reasoning: "Fallo inesperado sin firma de entorno: las reglas no distinguen entre regresión del producto y defecto del test.",
        action: "Análisis de la capa 2 (IA o failure-triage) y revisión humana.",
        review: true,
        needsAi: true,
    });
}

/** Clasifica un informe completo. `readSource(file)` es opcional y sirve para leer los ids de escenario. */
export function triageReport(report, { readSource, roots = [], sourceHash = null } = {}) {
    const records = collectTests(report);
    const scenarios = new Map();
    for (const file of new Set(records.map((r) => r.file))) {
        try { scenarios.set(file, readSource ? scenarioIdsByTestLine(readSource(file)) : new Map()); }
        catch { scenarios.set(file, new Map()); }
    }
    const diagnoses = records.map((r) =>
        classify(facts(r, { roots, scenarioId: scenarios.get(r.file)?.get(r.line)?.[0] ?? null })));
    const runErrors = (report.errors ?? []).map((e) => redact(e.message ?? e, roots).slice(0, 1500));
    return {
        schema_version: SCHEMA_VERSION,
        generated_at: new Date().toISOString(),
        source_report: { sha256: sourceHash, playwright_stats: report.stats ?? null },
        run: {
            errors: runErrors,
            classification: !runErrors.length ? null : runErrors.some(isEnv) ? "ENVIRONMENT_FAILURE" : "INCONCLUSIVE",
        },
        summary: summarize(diagnoses),
        diagnoses,
    };
}

export function summarize(diagnoses) {
    const counts = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
    for (const d of diagnoses) counts[d.classification]++;
    return {
        total: diagnoses.length,
        ...counts,
        requires_human_review: diagnoses.filter((d) => d.requires_human_review).length,
        // Predicciones de la IA: no son conclusiones verificadas (siempre requieren revisión).
        from_ai: diagnoses.filter((d) => d.source === "ai").length,
    };
}

/** Agrupa los resultados no correctos por causa probable (misma clase, misma primera línea, mismo sitio). */
export function groupDiagnoses(diagnoses) {
    const groups = new Map();
    for (const d of diagnoses.filter((x) => !["PASSED", "SKIPPED"].includes(x.classification))) {
        const last = d.facts.attempts.findLast((a) => a.error) ?? d.facts.attempts.at(-1) ?? {};
        const msg = firstLine(last.error ?? "").slice(0, 200);
        const key = `${d.classification}|${msg}|${last.error_location ?? ""}`;
        if (!groups.has(key)) {
            groups.set(key, { classification: d.classification, fingerprint: key, error_message: msg, defect_ids: [], count: 0, affected_tests: [] });
        }
        const g = groups.get(key);
        g.count++;
        g.affected_tests.push({ title: d.title, file: d.file, line: d.line, scenario_id: d.scenario_id });
        for (const id of defectIds({ tags: d.facts.tags, annotations: d.facts.annotations })) if (!g.defect_ids.includes(id)) g.defect_ids.push(id);
    }
    return [...groups.values()].map((g, i) => ({ group_id: `G${String(i + 1).padStart(3, "0")}`, ...g }));
}

/** Haystack con todos los textos de los hechos: las citas de la IA tienen que salir de aquí. */
function haystack(v) {
    if (v && typeof v === "object") return Object.values(v).map(haystack).join("\n");
    return v == null ? "" : String(v);
}

/**
 * Capa 2: valida la respuesta de la IA para los casos que las reglas dejaron abiertos.
 * Solo se aplica a diagnósticos con `needs_ai`; el resto se devuelve sin cambios aunque la IA
 * los mencione. Todo lo que no cumpla el contrato se queda en INCONCLUSIVE con el motivo. Nunca lanza.
 */
export function applyAiDiagnoses(diagnoses, rawResponse, opts) {
    const open = diagnoses.filter((d) => d.needs_ai);
    const result = applyToOpen(open, rawResponse, opts);
    const byId = new Map(result.diagnoses.map((d) => [d.test_id, d]));
    return { diagnoses: diagnoses.map((d) => byId.get(d.test_id) ?? d), warnings: result.warnings };
}

function applyToOpen(ruleDiagnoses, rawResponse, { model, promptVersion }) {
    const byId = new Map(ruleDiagnoses.map((d) => [d.test_id, d]));
    const fallback = (d, why) => ({ ...d, needs_ai: false, requires_human_review: true, model, prompt_version: promptVersion,
        reasoning_summary: `${d.reasoning_summary} La IA no aportó un diagnóstico válido: ${why}` });

    let items;
    try {
        const parsed = JSON.parse(String(rawResponse ?? "").trim().replace(/^```(?:json)?\s*|\s*```$/g, ""));
        items = Array.isArray(parsed) ? parsed : parsed?.diagnoses;
        if (!Array.isArray(items)) throw new Error("no es un array de diagnósticos");
    } catch (e) {
        return { diagnoses: ruleDiagnoses.map((d) => fallback(d, `respuesta no válida (${e.message}).`)), warnings: [`Respuesta de IA descartada: ${e.message}`] };
    }

    const warnings = [];
    const answered = new Map();
    for (const it of items) {
        const d = byId.get(it?.test_id);
        if (!d) { warnings.push(`test_id no abierto a la IA o desconocido: ${String(it?.test_id).slice(0, 80)}`); continue; }
        if (answered.has(d.test_id)) { warnings.push(`respuesta duplicada para ${d.test_id}: se usa la primera`); continue; }
        const problem = aiItemProblem(it, haystack(d.facts), d.facts.attempts.map((a) => a.error ?? "").join("\n"));
        answered.set(d.test_id, problem ? fallback(d, problem) : {
            ...d,
            classification: it.classification,
            confidence: it.confidence,
            source: "ai",
            evidence: it.evidence.map((e) => ({ source: e.source, quote: e.quote })),
            hypotheses: it.hypotheses ?? [],
            reasoning_summary: it.reasoning_summary,
            recommended_action: it.recommended_action,
            requires_human_review: true,
            needs_ai: false,
            model,
            prompt_version: promptVersion,
        });
    }
    return { diagnoses: ruleDiagnoses.map((d) => answered.get(d.test_id) ?? fallback(d, "sin respuesta para este test.")), warnings };
}

function aiItemProblem(it, hay, errors) {
    if (!AI_CATEGORIES.includes(it.classification)) return `clasificación no permitida (${String(it.classification).slice(0, 40)}).`;
    if (!CONFIDENCE.includes(it.confidence)) return "confianza fuera de la escala.";
    if (typeof it.reasoning_summary !== "string" || !it.reasoning_summary.trim()) return "falta reasoning_summary.";
    if (typeof it.recommended_action !== "string" || !it.recommended_action.trim()) return "falta recommended_action.";
    if (it.hypotheses !== undefined && !(Array.isArray(it.hypotheses) && it.hypotheses.every((h) => typeof h === "string"))) return "hypotheses no es una lista de textos.";
    if (it.classification === "INCONCLUSIVE") return null;
    if (!Array.isArray(it.evidence) || !it.evidence.length) return "sin evidencias.";
    for (const e of it.evidence) {
        if (typeof e?.quote !== "string" || e.quote.trim().length < 4) return "evidencia sin cita.";
        if (!hay.includes(e.quote)) return `la cita «${e.quote.slice(0, 60)}» no aparece en el resultado de Playwright.`;
    }
    // Un diagnóstico de causa tiene que apoyarse en el error observado, no solo en el título o el fichero.
    if (!it.evidence.some((e) => errors.includes(e.quote))) return "ninguna cita sale del error del test.";
    return null;
}

/** Comprobación de forma de un diagnóstico (para salidas del agente failure-triage). */
export function contractProblems(d) {
    const p = [];
    if (d?.schema_version !== SCHEMA_VERSION) p.push(`schema_version debe ser ${SCHEMA_VERSION}`);
    for (const k of ["test_id", "reasoning_summary", "recommended_action"]) if (typeof d?.[k] !== "string" || !d[k].trim()) p.push(`falta ${k}`);
    if (!CATEGORIES.includes(d?.classification)) p.push("classification desconocida");
    if (!CONFIDENCE.includes(d?.confidence)) p.push("confidence fuera de la escala");
    if (typeof d?.requires_human_review !== "boolean") p.push("requires_human_review no es booleano");
    if (!Array.isArray(d?.evidence) || (!d.evidence.length && d?.classification !== "INCONCLUSIVE")) p.push("sin evidencias");
    else if (d.evidence.some((e) => typeof e?.source !== "string" || typeof e?.quote !== "string")) p.push("evidencia sin source/quote");
    if (!("scenario_id" in (d ?? {}))) p.push("falta scenario_id (null si no hay)");
    for (const k of ["model", "prompt_version", "input_hash"]) if (!(k in (d ?? {}))) p.push(`falta ${k}`);
    return p;
}
