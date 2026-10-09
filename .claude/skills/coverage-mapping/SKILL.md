---
name: coverage-mapping
description: Relaciona los escenarios documentados en specs/<app>/ con los tests reales de Playwright y genera una matriz de cobertura reproducible. Úsala para saber qué escenarios están cubiertos, cuáles no, y si la coverage-matrix.md escrita a mano dice la verdad.
---

# Mapa de cobertura escenario → test

## Cómo se genera

```bash
npm run coverage:map         # finanzas-pareja → reports/coverage-verified.md
node scripts/coverage-map.mjs <app> [--out fichero.md]
```

No ejecuta tests ni abre la app: usa `playwright test --list --reporter=json` (sin escribir `test-results.json`) y lee los ficheros fuente. El mismo código da el mismo resultado: la salida no lleva fecha y va ordenada.

## Fuentes

| Fuente | Qué aporta |
|---|---|
| `specs/<app>/test-scenarios.md` | inventario de escenarios (`#### ID · Título`) |
| `specs/<app>/coverage-matrix.md` | lo que se **declaró** (fichero de test, AUTOMATED / NOT AUTOMATED) |
| `playwright test --list` | los tests que existen de verdad |
| comentario `// ID` en el **cuerpo** de un test | la correspondencia escenario → test |

## Niveles de correspondencia

| Nivel | Qué se ha verificado |
|---|---|
| `test-body` | el id aparece en un comentario dentro del cuerpo de un test que Playwright lista |
| `file-only` | la matriz cita un fichero que existe, pero ningún test de ese fichero lleva el id |
| `none` | nada |

`test-body` **no** demuestra que el test cubra todos los pasos y resultados esperados del escenario: eso lo decide una persona revisando el test frente al escenario. Un comentario fuera de un test (en un `describe`, entre tests o en un test que Playwright no lista) no cuenta.

## Incidencias que detecta

- Escenario que no está en la matriz.
- La matriz cita un fichero de test que no existe.
- La matriz dice AUTOMATED pero ningún test lleva el id (o al revés).
- Ids en tests que no existen en `test-scenarios.md` (hoy: `PRE-03b`).

## Uso por los agentes

- **planner**: antes de proponer escenarios, comprueba los huecos (`none`) y evita duplicar ids que ya tienen `test-body`.
- **generator**: cada test nuevo lleva el `// ID` en su cuerpo para que el mapa lo encuentre.
- **test-reviewer**: usa el mapa para detectar duplicidades.

Limitación: el fin del cuerpo de un test se detecta por el primer `});` con la sangría de la declaración (código formateado). Si la trazabilidad pasa a anotaciones (`annotation: { type: 'scenario' }`, AD-10), el mapa se puede leer directamente del JSON de Playwright.
