#!/usr/bin/env node
/**
 * Comprobación de entorno de la Ruta QA — 6 horas.
 *
 * Se ejecuta ANTES de empezar la ruta (pre-work técnico):
 *   npm run ruta-qa:check
 *
 * Sale con código 1 si falta algo imprescindible; 0 si la ruta se puede hacer.
 * Los avisos (⚠) no bloquean: la ruta trae plan B en learning/ruta-qa/ejemplos/.
 */
import { spawn } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const results = [];

function add(ok, name, detail, fix, required = true) {
  results.push({ ok, name, detail, fix, required });
}

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

// Los CLI que se comprueban (npm, npx, claude) son shims: en Windows hay que
// pasar por el shell. Se manda la orden como una sola cadena en vez de como
// array de argumentos: así no salta el aviso DEP0190. Todos los argumentos de
// este fichero son literales fijos, no entra nada del exterior.
function run(cmd, args, { input = null, timeout = 30000 } = {}) {
  return new Promise((resolve) => {
    const child = spawn([cmd, ...args].join(" "), { shell: true });
    let out = "";
    const timer = setTimeout(() => { child.kill(); resolve({ code: -1, out }); }, timeout);
    child.stdout.on("data", (d) => { out += d; });
    child.stderr.on("data", (d) => { out += d; });
    child.on("error", () => { clearTimeout(timer); resolve({ code: -1, out }); });
    child.on("close", (code) => { clearTimeout(timer); resolve({ code, out }); });
    if (input !== null) { child.stdin.write(input); child.stdin.end(); }
  });
}

// 1 · Node 20+
{
  const major = Number(process.versions.node.split(".")[0]);
  add(major >= 20, "Node.js", `v${process.versions.node}`,
      "Instala Node.js 20 o superior: https://nodejs.org");
}

// 2 · npm y dependencias instaladas
{
  const { code, out } = await run("npm", ["--version"], { timeout: 60000 });
  const hasModules = await exists("node_modules/@playwright/test");
  add(code === 0 && hasModules, "npm y dependencias",
      code === 0 ? `npm ${out.trim()}${hasModules ? "" : " · falta node_modules"}` : "npm no responde",
      "npm ci");
}

// 3 · Playwright
{
  let version = null;
  try { version = require("@playwright/test/package.json").version; } catch { /* no instalado */ }
  add(Boolean(version), "Playwright", version ? `v${version}` : "no encontrado", "npm ci");
}

// 4 · Chromium: se lanza de verdad, no se supone
{
  let ok = false, detail = "no se pudo lanzar";
  try {
    const { chromium } = require("@playwright/test");
    const browser = await chromium.launch();
    detail = `lanza correctamente (${browser.version()})`;
    await browser.close();
    ok = true;
  } catch (e) {
    detail = String(e.message).split("\n")[0].slice(0, 80);
  }
  add(ok, "Chromium", detail, "npx playwright install chromium");
}

// 5 · Sandbox de la ruta
{
  const config = await exists("learning/student/sandbox/ruta-qa/playwright.config.ts");
  const spec = await exists("learning/student/sandbox/ruta-qa/00-comprobacion.spec.ts");
  add(config && spec, "Sandbox de la Ruta QA",
      config && spec ? "configuración y test de comprobación presentes" : "faltan ficheros",
      "git checkout learning/student/sandbox/ruta-qa/");
}

// 6 · Acceso a la aplicación bajo prueba (riesgo típico: proxy corporativo)
{
  let ok = false, detail = "sin acceso";
  try {
    const res = await fetch("https://www.saucedemo.com", {
      signal: AbortSignal.timeout(15000),
    });
    ok = res.ok;
    detail = `HTTP ${res.status}`;
  } catch (e) {
    detail = String(e.message).slice(0, 60);
  }
  add(ok, "Acceso a saucedemo.com", detail,
      "Revisa proxy, VPN o certificados corporativos. Avisa al formador: es el riesgo K1");
}

// 7 · Claude Code (recomendado: módulos 4 y 5)
{
  const { code, out } = await run("claude", ["--version"], { timeout: 30000 });
  add(code === 0, "Claude Code CLI", code === 0 ? out.trim().slice(0, 40) : "no encontrado",
      "npm install -g @anthropic-ai/claude-code  ·  luego ejecuta: claude", false);
}

// 8 · Servidor MCP de Playwright (recomendado: módulo 5)
{
  const init = JSON.stringify({
    jsonrpc: "2.0", id: 1, method: "initialize",
    params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "ruta-qa-check", version: "1" } },
  });
  const { out } = await run("npx", ["playwright", "run-test-mcp-server"], { input: init + "\n", timeout: 45000 });
  const ok = out.includes("serverInfo");
  add(ok, "MCP Playwright", ok ? "responde correctamente" : "sin respuesta",
      "Comprueba que .mcp.json existe en la raíz y vuelve a ejecutar npm ci", false);
}

// Informe
const line = "─".repeat(52);
console.log(`\nRuta QA — comprobación de entorno\n${line}`);
for (const r of results) {
  const mark = r.ok ? "✓" : (r.required ? "✗" : "⚠");
  console.log(`${mark} ${r.name.padEnd(26)} ${r.detail}`);
}
console.log(line);

const failed = results.filter((r) => !r.ok && r.required);
const warned = results.filter((r) => !r.ok && !r.required);

for (const r of [...failed, ...warned]) {
  console.log(`\n${r.required ? "✗" : "⚠"} ${r.name}\n\nAcción recomendada:\n  ${r.fix}`);
}

if (failed.length === 0 && warned.length === 0) {
  console.log("\n🚀 Entorno listo para comenzar la Ruta QA\n");
} else if (failed.length === 0) {
  console.log("\n🚀 Puedes empezar la Ruta QA.");
  console.log("   Los avisos de arriba solo afectan al módulo 5 (MCP).");
  console.log("   El resto de módulos tienen plan B en learning/ruta-qa/ejemplos/\n");
} else {
  console.log("\n⛔ Falta algo imprescindible. Resuelve lo marcado con ✗ y vuelve a ejecutar:");
  console.log("   npm run ruta-qa:check\n");
}

process.exit(failed.length === 0 ? 0 : 1);
