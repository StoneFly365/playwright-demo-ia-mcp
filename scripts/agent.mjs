// Lanza un agente de .claude/agents/ con `claude -p` y devuelve su respuesta. Usa la suscripción
// de Claude Code (en local); el prompt va por stdin para no chocar con los límites de la línea de comandos.
import { spawn } from "node:child_process";

export function runAgent(agent, prompt, { tools, mcp = false, echo = true } = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn("claude", [
            "-p",
            "--agent", agent,
            ...(mcp ? ["--mcp-config", ".mcp.json", "--strict-mcp-config"] : []),
            "--permission-mode", "acceptEdits",
            "--allowedTools", tools,
        ], { stdio: ["pipe", "pipe", "inherit"], env: process.env });
        let out = "";
        child.stdout.on("data", (d) => { out += d; if (echo) process.stdout.write(d); });
        child.on("error", reject);
        child.on("close", (code) => (code === 0 ? resolve(out.trim()) : reject(new Error(`${agent} salió con código ${code}`))));
        child.stdin.end(prompt);
    });
}
