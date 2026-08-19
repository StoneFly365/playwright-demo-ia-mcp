# Sandbox — Ruta QA 6 horas

Tu zona de trabajo de la [Ruta QA](../../../ruta-qa/README.md). **Es el único sitio donde escribes.**

---

## Reglas

1. Todo lo que produzcas vive aquí. `tests/`, `pages/`, `scripts/`, `prompts/`, `specs/` y la configuración raíz son lectura.
2. Los diez tests `@demo-fail` del proyecto **no se arreglan**: son el material de los módulos 1 y 6.
3. Nunca se modifica una aserción para llegar a verde.

## Ejecutar

```bash
# Todo lo tuyo, en un navegador
npx playwright test -c learning/student/sandbox/ruta-qa --project=chromium

# Un fichero concreto
npx playwright test -c learning/student/sandbox/ruta-qa --project=chromium 04-orden-az.spec.ts

# Con el navegador visible
npx playwright test -c learning/student/sandbox/ruta-qa --project=chromium --headed

# Tipos
npx tsc --noEmit
```

Estado inicial, antes de tocar nada:

```text
2 skipped
1 passed
```

> Usa `--project=chromium` mientras practicas. No es por tiempo, es por cortesía: varias personas ejecutando a la vez contra un servicio público y gratuito.

## Lo que ya viene hecho

No pierdas tiempo montando infraestructura: está resuelta.

| Fichero | Qué es |
|---|---|
| `playwright.config.ts` | `baseURL`, `testIdAttribute: 'data-test'`, tres navegadores |
| `00-comprobacion.spec.ts` | Comprobación de entorno. Debe estar en verde. **No lo toques** |
| `04-orden-az.spec.ts` | **Semilla del módulo 4.** Imports, `describe`, `beforeEach` con login y un test en `skip` |
| `07-reset-app-state.spec.ts` | **Semilla del reto final.** Igual, con los tres Page Objects listos |
| `07-entrega.md` | Plantilla de entrega del reto, con sus siete secciones |

En las semillas, tu trabajo es quitar el `.skip` y escribir el cuerpo del test.

## Qué vas produciendo

| Módulo | Fichero | Qué es |
|---|---|---|
| 0 | `mi-proyecto.md` | Tu historia de usuario, tu fallo reciente, tu tarea repetitiva |
| 1 | `01-auditoria.md` | Auditoría de la salida del pipeline de IA |
| 2 | `mi-summary.txt`, `02-prompt-base.md` | Prompt roto/mejorado y tu prompt base |
| 3 | `03-casos.md` | Tus 5 casos de prueba revisados |
| 4 | `04-notas.md`, `04-orden-az.spec.ts` | Clases de rojo y tu primer test generado con IA |
| 5 | `05-plan-carrito.md` | Plan explorado con MCP y las preguntas de criterio |
| 6 | `06-diagnostico.md` | Dos fallos diagnosticados a ciegas |
| 7 | `07-reset-app-state.spec.ts`, `07-entrega.md` | El reto final |

## Comprobar que no has tocado el proyecto

```bash
git status --short          # solo debe aparecer learning/student/sandbox/ruta-qa/
```

Si aparece `pages/` o `tests/`, deshaz con `git restore pages/ tests/` antes de continuar.

## Otros sandboxes

| Zona | Para |
|---|---|
| [`../00-foundations/`](../README.md) | Módulo 00 — lógica pura, sin navegador |
| [`../01-playwright/`](../01-playwright/README.md) | Módulo 01 — Playwright Fundamentals |
