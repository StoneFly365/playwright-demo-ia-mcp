# 🛠️ Pre-work técnico

⏱️ **20-40 min · Se hace ANTES del día de formación · NO cuenta dentro de las 6 horas**

---

La Ruta QA empieza cuando el entorno ya funciona. Este documento es lo único que hay que hacer antes.

> **Hazlo otro día, no el mismo.** La mayor parte del tiempo son descargas: los navegadores de Playwright pesan unos 500 MB, y en una red corporativa con proxy pueden tardar bastante.

---

## Lo que necesitas

| Requisito | Para qué | Imprescindible |
|---|---|---|
| [Node.js 20+](https://nodejs.org) | Todo | ✅ |
| Git | Clonar el repositorio | ✅ |
| Acceso de red a `saucedemo.com`, npm y GitHub | La aplicación bajo prueba | ✅ |
| [Claude Code](https://claude.ai/code) | Módulos 4 y 5 | 🟡 Recomendado |
| Un editor con soporte TypeScript (VS Code) | Comodidad | 🟡 Recomendado |

Sin Claude Code puedes hacer los módulos 0, 1, 2, 3, 6 y 7 con cualquier chat de IA, y el 5 se convierte en demostración del formador.

---

## Instalación

```bash
# 1. Dependencias del proyecto
npm ci

# 2. Navegadores (~500 MB · es el paso largo)
npx playwright install chromium

# 3. Claude Code (recomendado)
npm install -g @anthropic-ai/claude-code
claude          # ejecútalo una vez para autenticarte y sigue el login
```

> Solo hace falta **Chromium**. La ruta entera se recorre con `--project=chromium`. Si quieres los tres navegadores: `npx playwright install`.

---

## Comprobación

```bash
npm run ruta-qa:check
```

Salida esperada:

```text
Ruta QA — comprobación de entorno
────────────────────────────────────────────────────
✓ Node.js                    v20.x.x
✓ npm y dependencias         npm 10.x.x
✓ Playwright                 v1.58.2
✓ Chromium                   lanza correctamente
✓ Sandbox de la Ruta QA      configuración y test de comprobación presentes
✓ Acceso a saucedemo.com     HTTP 200
✓ Claude Code CLI            2.x.x
✓ MCP Playwright             responde correctamente
────────────────────────────────────────────────────

🚀 Entorno listo para comenzar la Ruta QA
```

Cada línea que falle te dice qué comando ejecutar. Los que salen con `⚠` (Claude Code, MCP) **no bloquean**: la ruta trae plan B en [`ejemplos/`](ejemplos/README.md).

---

## Comprobación manual, si prefieres verlo tú

```bash
# 1. La suite del proyecto responde
npx playwright test --project=chromium tests/login.spec.ts
```

Debe terminar con:

```text
1 failed
7 passed
```

**Ese fallo es correcto.** Es uno de los diez fallos intencionados del proyecto ([`tests/login.spec.ts:12`](../../tests/login.spec.ts)) y es material de los módulos 1 y 6. No lo arregles.

```bash
# 2. Tu zona de trabajo
npx playwright test -c learning/student/sandbox/ruta-qa --project=chromium
```

Debe terminar con:

```text
2 skipped
1 passed
```

Los dos saltados son los specs semilla de los módulos 4 y 7.

---

## La primera vez que abras Claude Code

Este repositorio trae un servidor MCP declarado en [`.mcp.json`](../../.mcp.json). La primera vez que abras Claude Code en el proyecto, **te pedirá aprobar ese servidor**. Es normal: acepta.

No tienes que instalar, configurar ni modificar nada de MCP. Ni el `.mcp.json`, ni los subagentes de `.claude/agents/`. Ya está todo en el repositorio.

---

## Problemas típicos

| Síntoma | Causa probable | Solución |
|---|---|---|
| `npx playwright install` se queda colgado | Proxy corporativo | Configura `HTTPS_PROXY`, o pide los navegadores preinstalados al formador |
| ✗ Acceso a saucedemo.com | Proxy, VPN o certificados | **Avisa al formador.** Es el riesgo K1 del programa y no es culpa tuya |
| `claude: command not found` tras instalarlo | El global de npm no está en el `PATH` | Reinicia la terminal |
| ⚠ MCP Playwright sin respuesta | `npm ci` incompleto | Repite `npm ci` |
| `Error: No tests found` en el sandbox | Falta el test de comprobación | `git checkout learning/student/sandbox/ruta-qa/` |

Más detalle de instalación en la [guía de setup del programa](../docs/setup-guide.md).

---

## Cuando `ruta-qa:check` esté en verde

→ **[Empieza la Ruta QA](README.md)**
