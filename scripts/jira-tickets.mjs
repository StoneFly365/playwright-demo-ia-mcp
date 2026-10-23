#!/usr/bin/env node
// Cierra el circuito de los bug_producto: convierte ai-tickets.json en incidencias de Jira con la
// traza y el vídeo de los tests afectados. Sin credenciales funciona en modo simulado: construye
// las mismas peticiones REST y las guarda en playwright-report/ai-jira.json sin enviar nada.
//
// Uso: npm run jira:tickets [-- --dir <carpeta con los ai-*.json>]
// Modo real: JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN y JIRA_PROJECT_KEY (y JIRA_ISSUE_TYPE, por defecto Bug).
// La prioridad sale de la severidad; JIRA_PRIORITY_MAP la fija a mano: "bloqueante=Highest,alta=High,media=Medium,baja=Low".
import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync, openAsBlob } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { redact } from "./triage.mjs";

const OUT = "playwright-report/ai-jira.json";
const ENV = ["JIRA_BASE_URL", "JIRA_EMAIL", "JIRA_API_TOKEN", "JIRA_PROJECT_KEY"];
// ponytail: tope fijo de adjuntos por ticket (3 tests x traza y vídeo); súbelo si un bug necesita más evidencia.
const MAX_TESTS_WITH_FILES = 3;
// Severidades de prompts/ai-tickets.txt, de más a menos grave.
export const SEVERITIES = ["bloqueante", "alta", "media", "baja"];

// Prioridad de Jira para una severidad. Con JIRA_PRIORITY_MAP, por nombre; si no, por posición:
// Jira devuelve las prioridades de más a menos urgente, y la más grave toma la primera.
export function priorityFor(severity, allowed, map) {
    if (!allowed?.length) return null;
    if (map) {
        const name = Object.fromEntries(map.split(",").map((pair) => pair.split("=").map((x) => x.trim())))[severity];
        return allowed.find((p) => p.name === name) ?? null;
    }
    const i = SEVERITIES.indexOf(severity);
    // ponytail: con menos de cuatro prioridades, las severidades menores comparten la última.
    return i < 0 ? null : allowed[Math.min(i, allowed.length - 1)];
}

const text = (t) => ({ type: "text", text: redact(String(t)) });
const para = (t) => ({ type: "paragraph", content: [text(t)] });
const heading = (t) => ({ type: "heading", attrs: { level: 3 }, content: [text(t)] });
const bullets = (items) => ({ type: "bulletList", content: items.map((i) => ({ type: "listItem", content: [para(i)] })) });
// Las etiquetas de Jira no admiten espacios.
const label = (s) => String(s).trim().toLowerCase().replace(/\s+/g, "-");

// Traza y vídeo del último intento de cada test que falló, por "fichero:línea:navegador".
export function attachmentsByTest(report) {
    const map = new Map();
    const walk = (suite) => {
        for (const spec of suite.specs ?? []) {
            for (const t of spec.tests ?? []) {
                const files = (t.results?.at(-1)?.attachments ?? []).filter((a) => a.path && (a.name === "trace" || a.name === "video"));
                if (files.length) map.set(`${spec.file}:${spec.line}:${t.projectName}`, files.map((a) => a.path));
            }
        }
        for (const child of suite.suites ?? []) walk(child);
    };
    for (const s of report?.suites ?? []) walk(s);
    return map;
}

export function buildIssue(ticket, { projectKey, issueType = "Bug", runStartTime }) {
    const groupId = /^(G\d+)/.exec(ticket.titulo ?? "")?.[1] ?? null;
    const description = {
        type: "doc", version: 1,
        content: [
            para(ticket.descripcion ?? ""),
            ticket.pasos_para_reproducir?.length ? [heading("Tests afectados"), bullets(ticket.pasos_para_reproducir)] : [],
            ticket.solucion_sugerida?.length ? [heading("Solución sugerida"), bullets(ticket.solucion_sugerida)] : [],
            para(`Creado por el triage de IA (grupo ${groupId ?? "?"}${runStartTime ? `, ejecución ${runStartTime}` : ""}). Adjuntos: traza y vídeo de los tests afectados.`),
        ].flat(),
    };
    return {
        groupId,
        body: {
            fields: {
                project: { key: projectKey },
                issuetype: { name: issueType },
                summary: redact(ticket.titulo ?? "Fallo de producto detectado por el triage de IA").slice(0, 250),
                description,
                // Severidad y componente como etiquetas: los campos de prioridad y componente cambian en cada proyecto Jira.
                labels: [...(ticket.etiquetas ?? []), ticket.severidad && `severidad-${ticket.severidad}`, ticket.componente && `componente-${ticket.componente}`,
                    runStartTime && `qa-run-${runStartTime.replace(/\D/g, "").slice(0, 14)}`].filter(Boolean).map(label),
            },
        },
    };
}

export function planTickets({ tickets, grouped, report, projectKey, issueType }) {
    // Solo se adjunta la evidencia de la misma ejecución que el análisis; si no, sería la traza de otro fallo.
    const sameRun = !grouped?.run_start_time || grouped.run_start_time === report?.stats?.startTime;
    const files = sameRun ? attachmentsByTest(report) : new Map();
    return tickets.map((ticket) => {
        const issue = buildIssue(ticket, { projectKey, issueType, runStartTime: grouped?.run_start_time });
        const group = grouped?.groups?.find((g) => g.group_id === issue.groupId);
        const attachments = (group?.affected_tests ?? []).slice(0, MAX_TESTS_WITH_FILES)
            .flatMap((t) => files.get(`${t.file}:${t.line}:${t.browser}`) ?? []);
        return { ...issue, severity: ticket.severidad ?? null, attachments };
    });
}

function jiraApi(env) {
    const base = env.JIRA_BASE_URL.replace(/\/+$/, "");
    const auth = `Basic ${Buffer.from(`${env.JIRA_EMAIL}:${env.JIRA_API_TOKEN}`).toString("base64")}`;
    const call = async (p, init = {}) => {
        const res = await fetch(`${base}${p}`, { ...init, headers: { Authorization: auth, Accept: "application/json", ...init.headers } });
        if (!res.ok) throw new Error(`Jira respondió ${res.status} en ${p}: ${(await res.text()).slice(0, 300)}`);
        return res.json();
    };
    return { base, call };
}

// Lo que depende del proyecto: el informador, si es obligatorio al crear por API (se pone la cuenta
// del token), y las prioridades que admite, si el campo está en la pantalla de creación.
async function projectFields({ call }, projectKey, issueType) {
    const key = encodeURIComponent(projectKey);
    const types = await call(`/rest/api/3/issue/createmeta/${key}/issuetypes`);
    const type = (types.issueTypes ?? types.values ?? []).find((t) => t.name === issueType);
    if (!type) throw new Error(`El proyecto ${projectKey} no tiene el tipo de incidencia "${issueType}". Cambia JIRA_ISSUE_TYPE.`);
    const meta = await call(`/rest/api/3/issue/createmeta/${key}/issuetypes/${type.id}`);
    const fields = meta.fields ?? meta.values ?? [];
    const reporter = fields.some((f) => f.fieldId === "reporter" && f.required);
    return {
        fixed: reporter ? { reporter: { id: (await call("/rest/api/3/myself")).accountId } } : {},
        priorities: fields.find((f) => f.fieldId === "priority")?.allowedValues ?? [],
    };
}

async function createIssue(jira, plan, extraFields) {
    const body = { fields: { ...plan.body.fields, ...extraFields } };
    const { key } = await jira.call("/rest/api/3/issue", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const present = plan.attachments.filter((p) => existsSync(p));
    let attached = 0;
    if (present.length) {
        const form = new FormData();
        for (const p of present) form.append("file", await openAsBlob(p), `${path.basename(path.dirname(p))}-${path.basename(p)}`);
        try {
            attached = (await jira.call(`/rest/api/3/issue/${key}/attachments`, { method: "POST", headers: { "X-Atlassian-Token": "no-check" }, body: form })).length;
        } catch (e) {
            console.warn(`⚠️  ${key} creado, pero los adjuntos fallaron: ${e.message}`);
        }
    }
    return { key, url: `${jira.base}/browse/${key}`, attached };
}

async function main() {
    // Credenciales locales en .env (en CI llegan como secretos).
    try { process.loadEnvFile(); } catch {}
    const args = process.argv.slice(2);
    const i = args.indexOf("--dir");
    // Con --dir todo está en la misma carpeta (como el artefacto ai-report); sin él, test-results.json está en la raíz.
    const dir = i >= 0 ? args[i + 1] : "playwright-report";
    const testsFile = i >= 0 ? path.join(dir, "test-results.json") : "test-results.json";
    const read = (file) => (existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : null);
    const tickets = read(path.join(dir, "ai-tickets.json"));
    if (!Array.isArray(tickets) || !tickets.length) {
        console.log(`✅ Sin tickets en ${dir}/ai-tickets.json: solo se generan para los grupos bug_producto.`);
        return;
    }
    const missing = ENV.filter((k) => !process.env[k]);
    const real = missing.length === 0;
    const plans = planTickets({
        tickets, grouped: read(path.join(dir, "ai-failures-grouped.json")), report: read(testsFile),
        projectKey: process.env.JIRA_PROJECT_KEY ?? "DEMO", issueType: process.env.JIRA_ISSUE_TYPE ?? "Bug",
    });

    const jira = real ? jiraApi(process.env) : null;
    const project = real ? await projectFields(jira, process.env.JIRA_PROJECT_KEY, process.env.JIRA_ISSUE_TYPE ?? "Bug") : null;
    const results = [];
    for (const plan of plans) {
        const attachments = plan.attachments.map((p) => ({ file: path.relative(".", p).replaceAll("\\", "/"), exists: existsSync(p), bytes: existsSync(p) ? statSync(p).size : null }));
        if (!real) {
            results.push({ group: plan.groupId, request: { method: "POST", path: "/rest/api/3/issue", body: plan.body }, priority_from: plan.severity, attachments });
            continue;
        }
        try {
            const priority = priorityFor(plan.severity, project.priorities, process.env.JIRA_PRIORITY_MAP);
            const fields = { ...project.fixed, ...(priority ? { priority: { id: priority.id } } : {}) };
            results.push({ group: plan.groupId, ...(await createIssue(jira, plan, fields)), priority: priority?.name ?? null, attachments });
            console.log(`✅ ${plan.groupId}: ${results.at(-1).url} · prioridad ${priority?.name ?? "por defecto"} · ${results.at(-1).attached} adjuntos`);
        } catch (e) {
            results.push({ group: plan.groupId, error: e.message, attachments });
            console.error(`❌ ${e.message}`);
        }
    }
    mkdirSync(path.dirname(OUT), { recursive: true });
    writeFileSync(OUT, JSON.stringify({ generated_at: new Date().toISOString(), mode: real ? "real" : "simulado", missing_env: missing, tickets: results }, null, 2) + "\n");
    console.log(real
        ? `✅ ${results.filter((r) => r.key).length} de ${results.length} tickets creados en Jira. Detalle en ${OUT}.`
        : `✅ Modo simulado (faltan ${missing.join(", ")}): ${results.length} tickets preparados en ${OUT}, sin enviar nada.`);
    if (real && results.some((r) => r.error)) process.exit(1);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main().catch((e) => { console.error(`❌ ${e.message}`); process.exit(1); });
}
