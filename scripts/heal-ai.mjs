#!/usr/bin/env node
// Cierra el circuito de los test_roto: lanza el agente playwright-test-healer solo sobre esos
// grupos, comprueba que no relaja ninguna aserción y abre una PR en borrador. Nunca se fusiona sola.
//
// Uso: npm run heal:ai [-- --group G001] [-- --dry-run]
//   --group    solo ese grupo (se puede repetir); sin él, todos los test_roto del último report:ai
//   --dry-run  enseña lo que se mandaría al healer y no toca git, GitHub ni la IA
// Para un escenario, lanza el healer con la misma variable que los tests: DEMO_SCENARIO=cascade npm run heal:ai
import { execFileSync, spawn } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkAgainst } from "./guard-asserts.mjs";

const GROUPED = "playwright-report/ai-failures-grouped.json";
const OUT = "playwright-report/ai-heal.json";
const EDITABLE = /^(tests|pages|fixtures)\//;
const LABEL = "needs-human";

const log = (msg) => console.log(`👉 ${msg}`);

export function selectGroups(grouped, ids = []) {
    return (grouped?.groups ?? []).filter((g) => g.tipo === "test_roto" && (!ids.length || ids.includes(g.group_id)));
}

export function buildPrompt(groups, scenario) {
    const block = (g) => [
        `## ${g.group_id} · ${g.count} tests · confianza ${g.confianza ?? "?"}`,
        `Evidencia: ${g.evidencia ?? "no disponible"}`,
        `Acción propuesta por el triage: ${g.accion ?? "no disponible"}`,
        "Tests afectados:",
        ...g.affected_tests.map((t) => `- tests/${t.file}:${t.line} · ${t.title} · ${t.browser}`),
        g.omitted_tests ? `- y ${g.omitted_tests} más con el mismo fallo` : null,
        "Error:", "```", g.sample_error ?? "", "```",
    ].filter((l) => l != null).join("\n");
    return [
        "Corrige SOLO los tests de estos grupos de fallos. El triage de IA los ha clasificado como test_roto: la aplicación funciona y el test está desactualizado.",
        scenario ? `Los fallos se reproducen con la variable de entorno DEMO_SCENARIO=${scenario}, que ya está puesta en este proceso.` : null,
        "",
        "Reglas:",
        "- Ejecuta y depura solo los tests listados, no la suite completa.",
        "- Cambia lo mínimo, preferentemente el locator o el page object.",
        "- No relajes ninguna aserción: no borres expect, no añadas .not, no uses test.skip, test.fixme ni test.fail y no subas timeouts.",
        "- Cambia un valor esperado solo si la evidencia demuestra que el antiguo es el incorrecto, y dilo en el resumen. Ese cambio lo revisará una persona.",
        "- Si concluyes que el fallo es de la aplicación y no del test, no cambies nada y explícalo.",
        "- No toques ficheros fuera de tests/, pages/ y fixtures/.",
        "- Al terminar, resume en español qué has cambiado en cada grupo y por qué.",
        "",
        ...groups.map(block),
    ].filter((l) => l != null).join("\n");
}

export function buildPrBody({ groups, summary, reasons, runStartTime }) {
    return [
        "## Corrección propuesta por el healer",
        "",
        `Grupos \`test_roto\` del triage de IA${runStartTime ? ` (ejecución \`${runStartTime}\`)` : ""}:`,
        ...groups.map((g) => `- **${g.group_id}** · ${g.count} tests · confianza ${g.confianza ?? "?"}: ${g.evidencia ?? ""}`),
        "",
        reasons.length
            ? `## ⚠️ ${LABEL}: el cambio puede relajar las pruebas\n\n${reasons.map((r) => `- ${r}`).join("\n")}\n\nNo se fusiona sin que una persona confirme que la expectativa antigua era la incorrecta.`
            : "## Sin asserts relajados\n\nNo se borra ni cambia ninguna aserción, no hay skip ni fixme y no sube ningún timeout.",
        "",
        "## Resumen del healer",
        "",
        summary || "_El healer no devolvió resumen._",
        "",
        "---",
        "PR en borrador abierta por `npm run heal:ai`. Revísala antes de fusionarla: el healer puede equivocarse.",
    ].join("\n");
}

// Los tests que lanza el healer pueden vaciar playwright-report/ (lo hace el reporter HTML).
function save(result) {
    mkdirSync(path.dirname(OUT), { recursive: true });
    writeFileSync(OUT, JSON.stringify({ generated_at: new Date().toISOString(), ...result }, null, 2) + "\n");
}

const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { encoding: "utf8", ...opts }).trim();
const git = (...args) => run("git", args);

function runHealer(prompt) {
    log("Ejecutando el healer (claude -p con playwright-test-healer). Puede tardar varios minutos...");
    return new Promise((resolve, reject) => {
        const child = spawn("claude", [
            "-p",
            "--agent", "playwright-test-healer",
            "--mcp-config", ".mcp.json", "--strict-mcp-config",
            "--permission-mode", "acceptEdits",
            "--allowedTools", "Read,Glob,Grep,LS,Edit,MultiEdit,Write,mcp__playwright-test",
        ], { stdio: ["pipe", "pipe", "inherit"], env: process.env });
        let out = "";
        child.stdout.on("data", (d) => { out += d; process.stdout.write(d); });
        child.on("error", reject);
        child.on("close", (code) => (code === 0 ? resolve(out.trim()) : reject(new Error(`El healer salió con código ${code}`))));
        child.stdin.end(prompt);
    });
}

async function main() {
    const args = process.argv.slice(2);
    const ids = args.flatMap((a, i) => (args[i - 1] === "--group" ? [a] : []));
    if (!existsSync(GROUPED)) throw new Error(`No existe ${GROUPED}. Ejecuta antes los tests y npm run report:ai.`);
    const grouped = JSON.parse(readFileSync(GROUPED, "utf8"));
    const groups = selectGroups(grouped, ids);
    if (!groups.length) {
        console.log(`✅ No hay grupos test_roto${ids.length ? ` con ${ids.join(", ")}` : ""}: nada que corregir.`);
        return;
    }
    const prompt = buildPrompt(groups, process.env.DEMO_SCENARIO);
    if (args.includes("--dry-run")) {
        console.log(prompt);
        return;
    }

    // El healer edita ficheros versionados: se empieza siempre desde un árbol limpio y una rama nueva.
    if (git("status", "--porcelain", "--untracked-files=no")) throw new Error("Hay cambios sin confirmar. Confírmalos o guárdalos antes de lanzar el healer.");
    const from = git("rev-parse", "--abbrev-ref", "HEAD");
    if (from === "HEAD") throw new Error("Estás en un commit suelto: cámbiate a una rama.");
    run("gh", ["auth", "status"]);
    const base = git("rev-parse", "HEAD");
    const branch = `heal/${groups.map((g) => g.group_id).join("-")}-${new Date().toISOString().replace(/\D/g, "").slice(0, 14)}`;
    git("switch", "-c", branch);
    log(`Rama ${branch} creada desde ${from}`);

    let summary;
    try {
        summary = await runHealer(prompt);
    } catch (e) {
        console.error(`❌ ${e.message}. Los cambios que haya hecho siguen en la rama ${branch}.`);
        process.exit(1);
    }

    // -z: rutas sin comillas ni escapes aunque lleven espacios o tildes.
    const changed = git("status", "--porcelain", "-z").split("\0").filter(Boolean).map((l) => l.slice(3));
    const outside = changed.filter((f) => !EDITABLE.test(f));
    if (outside.length) {
        console.error(`❌ El healer ha tocado ficheros fuera de tests/, pages/ y fixtures/: ${outside.join(", ")}. Revisa la rama ${branch} a mano; no se abre PR.`);
        process.exit(1);
    }
    if (!changed.length) {
        git("switch", from);
        git("branch", "-D", branch);
        console.log("✅ El healer no ha propuesto cambios: no hay PR. Su explicación está arriba.");
        save({ groups: groups.map((g) => g.group_id), pr: null, needs_human: false, reasons: [], summary });
        return;
    }

    const reasons = checkAgainst(base);
    git("add", "--", ...changed);
    git("commit", "-m", `fix(heal): ${groups.map((g) => g.group_id).join(", ")} propuesto por el healer`, "-m", "Corrección automática de los grupos test_roto del triage de IA. Pendiente de revisión.");
    git("push", "-u", "origin", branch);
    if (reasons.length) run("gh", ["label", "create", LABEL, "--force", "--color", "D93F0B", "--description", "La PR automática puede relajar las pruebas: necesita revisión humana"]);
    const url = run("gh", ["pr", "create", "--draft", "--base", from, "--head", branch,
        "--title", `heal: ${groups.map((g) => g.group_id).join(", ")} (test_roto)`,
        "--body-file", "-", ...(reasons.length ? ["--label", LABEL] : [])],
        { input: buildPrBody({ groups, summary, reasons, runStartTime: grouped.run_start_time }) });
    git("switch", from);

    save({ groups: groups.map((g) => g.group_id), pr: url, branch, needs_human: reasons.length > 0, reasons, summary });
    console.log(`✅ PR en borrador: ${url}${reasons.length ? `\n⚠️  Marcada ${LABEL}:\n${reasons.map((r) => `   - ${r}`).join("\n")}` : ""}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main().catch((e) => { console.error(`❌ ${e.message}`); process.exit(1); });
}
