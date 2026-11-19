// Lanza un agente de .claude/agents/ con `claude -p` y devuelve su respuesta. Usa la suscripción
// de Claude Code (en local); el prompt va por stdin para no chocar con los límites de la línea de comandos.
import { spawn } from "node:child_process";

// Los agentes no reciben los tokens que no necesitan: con Write y test_run pueden escribir y ejecutar
// un test que lea process.env. Sin SONARQUBE_TOKEN, el MCP de Sonar de .mcp.json no arranca en heal:ai
// ni en design:ai, y el agente sigue sin él. CLAUDE_CODE_OAUTH_TOKEN sí llega, porque claude lo necesita para arrancar.
const AGENT_ENV_DENY = /^(GH_TOKEN|GITHUB_TOKEN|GITLAB_TOKEN|JIRA_\w+|AI_API_KEY|GEMINI_API_KEY|OPENROUTER_API_KEY|SONAR_TOKEN|SONARQUBE_TOKEN)$/;
export const agentEnv = (env) => Object.fromEntries(Object.entries(env).filter(([k]) => !AGENT_ENV_DENY.test(k)));

export function runAgent(agent, prompt, { tools, mcp = false, echo = true } = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn("claude", [
            "-p",
            "--agent", agent,
            // mcp: true usa .mcp.json; una ruta usa ese fichero (design-ai pasa .mcp.figma.json).
            ...(mcp ? ["--mcp-config", mcp === true ? ".mcp.json" : mcp, "--strict-mcp-config"] : []),
            "--permission-mode", "acceptEdits",
            "--allowedTools", tools,
        ], { stdio: ["pipe", "pipe", "inherit"], env: agentEnv(process.env) });
        let out = "";
        child.stdout.on("data", (d) => { out += d; if (echo) process.stdout.write(d); });
        child.on("error", reject);
        child.on("close", (code) => (code === 0 ? resolve(out.trim()) : reject(new Error(`${agent} salió con código ${code}`))));
        child.stdin.end(prompt);
    });
}
