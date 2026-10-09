# Arquetipo Playwright + IA

Esqueleto mínimo para arrancar un proyecto de pruebas con [Playwright](https://playwright.dev/) y TypeScript. Incluye el triaje de fallos (reglas + IA validada), el reporte IA, los agentes de Playwright (planner, generator, healer) vía MCP, los agentes de triaje y revisión, y el pipeline de GitHub Actions. Ver [docs/agentic-qa.md](docs/agentic-qa.md). Sin tests ni páginas de ningún proyecto concreto.

## Estructura

```
├── .claude/agents/        # Agentes: planner, generator, healer, failure-triage, test-reviewer
├── .claude/skills/        # Skills: failure-classification, evidence-based-diagnosis, test-quality-review, coverage-mapping
├── .github/workflows/     # CI: tooling, navegadores genéricos y finanzas-pareja (bajo autorización)
├── docs/                  # Arquitectura de la automatización
├── fixtures/<app>.ts      # Test extendido de cada app (reloj, page object raíz)
├── helpers/<app>/         # Utilidades técnicas (siembra de datos…)
├── pages/<app>/           # Page Objects
├── specs/<app>/           # Discovery y plan de pruebas (fase planner)
├── test-data/<app>/       # Datos de prueba explícitos
├── tests/
│   ├── seed.spec.ts       # Punto de partida para los agentes
│   ├── <app>/             # Specs de cada app (un project por app en la config)
│   └── _propuestas/<app>/ # Tests propuestos por el generator, pendientes de revisión
├── prompts/               # Prompts del reporte IA
├── scripts/               # triage, report-ai, coverage-map, guard-assertions
├── .mcp.json              # Servidor MCP de Playwright
└── playwright.config.ts
```

## Primeros pasos

```bash
npm ci
npx playwright install
```

Define la URL de la aplicación bajo prueba en `BASE_URL`:

```bash
# PowerShell
$env:BASE_URL = "https://mi-app.example.com"; npm test

# Bash
BASE_URL=https://mi-app.example.com npm test
```

En CI, crea la variable de repositorio `BASE_URL` (Settings → Secrets and variables → Actions → Variables) y el secreto `GEMINI_API_KEY` para el reporte IA. La suite de `finanzas-pareja` apunta a la app publicada: en CI solo corre a mano o con la variable `FINANZAS_E2E_ENABLED=true`.

## Scripts

| Script | Qué hace |
|---|---|
| `npm test` | Todos los tests en Chromium, Firefox y WebKit |
| `npm run test:headed` | Con navegador visible |
| `npm run test:chromium` / `test:firefox` / `test:webkit` | Un solo navegador |
| `npm run test:report` | Abre el informe HTML |
| `npm run test:finanzas` | Suite de `finanzas-pareja` (contra la app publicada) |
| `npm run triage` | Clasifica `test-results.json` con reglas, sin IA → `playwright-report/triage.json` |
| `npm run report:ai` | Triaje + IA solo para lo no resuelto + resumen, correcciones y tickets |
| `npm run test:ai` | Tests + reporte IA |
| `npm run test:triage` | Pruebas del triaje y evaluación por categoría (sin red) |
| `npm run coverage:map` | Matriz escenario → test verificada → `reports/coverage-verified.md` |
| `npm run guard:assertions -- <diff>` | Señala cambios en aserciones, valores esperados y marcas de defecto |

`npx playwright test --list` sin `--reporter` sobrescribe `test-results.json` y el informe HTML.
