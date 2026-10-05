# Arquetipo Playwright + IA

Esqueleto mínimo para arrancar un proyecto de pruebas con [Playwright](https://playwright.dev/) y TypeScript. Incluye el reporte IA de fallos, los agentes de Playwright (planner, generator, healer) vía MCP y el pipeline de GitHub Actions. Sin tests ni páginas de ningún proyecto concreto.

## Estructura

```
├── .claude/agents/        # Agentes Playwright: planner, generator, healer
├── .github/workflows/     # CI: tests en los 3 navegadores + reporte IA
├── pages/                 # Page Objects
├── specs/                 # Planes de test (los guarda el planner)
├── tests/
│   └── seed.spec.ts       # Punto de partida para los agentes
├── prompts/               # Prompts del reporte IA
├── scripts/report-ai.mjs  # Análisis IA de resultados
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

En CI, crea la variable de repositorio `BASE_URL` (Settings → Secrets and variables → Actions → Variables) y el secreto `GEMINI_API_KEY` para el reporte IA.

## Scripts

| Script | Qué hace |
|---|---|
| `npm test` | Todos los tests en Chromium, Firefox y WebKit |
| `npm run test:headed` | Con navegador visible |
| `npm run test:chromium` / `test:firefox` / `test:webkit` | Un solo navegador |
| `npm run test:report` | Abre el informe HTML |
| `npm run report:ai` | Analiza `test-results.json` con IA |
| `npm run test:ai` | Tests + reporte IA |
