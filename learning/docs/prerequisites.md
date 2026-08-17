# Prerrequisitos

Cada requisito está justificado con el fichero del repositorio que lo exige. No hay requisitos arbitrarios.

Análisis completo en la [Fase 1, sección 7](../phase-1-learning-lab-design.md).

---

## MUST HAVE — sin esto no se puede seguir el programa

| Prerrequisito | Por qué (evidencia en el repositorio) |
|---|---|
| **Fundamentos de QA**: caso de prueba, resultado esperado, defecto, severidad, regresión | [`specs/add-to-cart-test-plan.md`](../../specs/add-to-cart-test-plan.md) está escrito en ese lenguaje; sin él, el módulo 07 es incomprensible |
| **Fundamentos web**: HTML, DOM, atributos, URL | Los 6 Page Objects son selectores de atributo; [`tests/route-protection.spec.ts`](../../tests/route-protection.spec.ts) razona sobre rutas |
| **Lectura de código** en cualquier lenguaje (leer, no escribir) | El módulo 01 arranca leyendo `login.spec.ts` y `login.page.ts` |
| **Línea de comandos básica**: `cd`, ejecutar un comando, leer su salida | Los 12 scripts de [`package.json`](../../package.json) se lanzan desde terminal |
| **Node.js 20 o superior** (o `nvm`) | README:60; `@types/node: ^20.19.39` en `package.json` |
| **Cuenta de GitHub** | El workflow, los artefactos y los PRs son parte del temario del módulo 06 |
| **Acceso de red** a `saucedemo.com`, npm y GitHub | `baseURL` apunta a un sitio público externo; `npm ci` descarga paquetes |

> ⚠️ **El acceso de red debe verificarse antes de empezar.** Si el proxy corporativo de HDI bloquea alguno de los tres, el diseño de los módulos 01 en adelante cambia. Es el riesgo R1 de la Fase 1.

## SHOULD HAVE — recomendable; si falta, se cubre en el programa

| Prerrequisito | Por qué | Si no lo tienes |
|---|---|---|
| **Sintaxis básica de JavaScript**: variables, funciones, arrays, objetos | [`tests/inventory.spec.ts:42`](../../tests/inventory.spec.ts) usa `map` + `parseFloat` + `replace`; `scripts/report-ai.mjs` es JS puro | El **módulo 00** existe exactamente para esto. No es motivo de exclusión |
| **Git básico**: `clone`, `add`, `commit`, `push`, ramas | 47 commits con convención; los ejercicios se entregan por rama | Se cubre en la primera sesión y se formaliza en el módulo 06 |
| **Nociones de HTTP**: petición, respuesta, código de estado | Necesario para el módulo 05 (API y mocking) y para entender los 429 de Gemini en el workflow | Se introduce en el módulo 05 |
| **Selectores CSS** | Los cuatro estilos aparecen en el repositorio: `[data-test="…"]`, `[data-test^="…"]`, `#id`, `.cart_item` | Se cubre en el módulo 01 |
| **Editor con soporte TypeScript** (VS Code) | `"strict": true` en [`tsconfig.json`](../../tsconfig.json): el editor es la primera línea de detección de errores, sobre todo porque el proyecto no tiene linter | Instalar VS Code, 10 minutos |

## NICE TO HAVE — suma, pero no condiciona

| Prerrequisito | Por qué | Matiz |
|---|---|---|
| **Experiencia con otra herramienta** (Selenium, Cypress) | Acelera los módulos 01-02 | Puede traer hábitos que desaprender: la desconfianza en el auto-waiting es el más frecuente |
| **Nociones de POO** (clases, instancias) | Los 6 Page Objects son clases | Se enseña desde cero en el módulo 00 |
| **Docker Desktop** en local | README:136 lo pide solo para replicar el CI localmente | **El módulo 06 se puede seguir entero contra GitHub Actions sin Docker local** |
| **Experiencia con asistentes de IA** | El módulo 08 gana ritmo | Diseñado desde cero |
| **Cuenta de Jira** | Solo para la extensión opcional del capstone | — |
| **API key de Gemini** (gratuita, sin tarjeta) | README:291 | Solo si quieres reproducir el reporte IA en tu propio fork |

## Explícitamente NO exigidos

Para evitar barreras artificiales, **no** se pide como entrada:

- TypeScript avanzado
- Experiencia previa con Playwright
- Saber escribir YAML de CI
- Saber escribir un `Dockerfile`
- Conocimientos de LLM o prompt engineering
- Perfil de desarrollador

**Todo eso es resultado del programa, no su entrada.**

## Verificación rápida

Ejecuta esto antes del primer día:

```bash
node --version     # v20.x o superior
git --version      # cualquier versión reciente
npm --version

git clone <url-del-repositorio>
cd playwright-demo-ia-mcp
npm install
npx playwright test -c learning/student/sandbox
```

Si el último comando devuelve `7 failed` y `13 passed`, estás listo para el módulo 00.

Si algo falla, consulta [setup-guide.md](setup-guide.md) antes de la sesión.
