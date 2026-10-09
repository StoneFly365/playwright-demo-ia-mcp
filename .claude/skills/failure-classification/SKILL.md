---
name: failure-classification
description: Clasifica los resultados de una ejecución de Playwright con reglas deterministas antes de recurrir a la IA. Úsala para interpretar test-results.json o playwright-report/triage.json, distinguir defectos conocidos (test.fail + @bug-Dxx) de fallos nuevos, detectar tests que pasan inesperadamente y fallos de entorno.
---

# Clasificación de fallos de Playwright

La clasificación la hace el código, no el modelo: `scripts/triage/core.mjs` (reglas `rules-1`). Esta skill explica las reglas para aplicarlas, revisarlas o ampliarlas. **Playwright decide si un test pasa o falla; la clasificación solo lo explica.**

## Cómo se ejecuta

```bash
npm run triage                       # lee test-results.json → playwright-report/triage.json (sin IA ni red)
npm run test:triage                  # pruebas unitarias + evaluación con scripts/triage/eval/cases.json
```

Nunca generes la clasificación a mano si puedes ejecutar `npm run triage`. Si no puedes ejecutar comandos, pide que se ejecute y lee `playwright-report/triage.json`.

Cuidado: `npx playwright test --list` **sin** `--reporter` sobrescribe `test-results.json` y el informe HTML (el reporter `json` de la config escribe aunque no se ejecute nada).

## Categorías

| Categoría | Quién la decide | Significado |
|---|---|---|
| `PASSED` | reglas | pasó y se esperaba que pasara (resultado observado; confianza máxima `medium`, ver abajo) |
| `SKIPPED` | reglas | `test.skip` / `test.fixme` |
| `KNOWN_DEFECT` | reglas | `test.fail()` + id de defecto, y falla en una aserción del propio spec |
| `UNEXPECTED_PASS` | reglas | `test.fail()` pero pasó: puede que el defecto esté corregido |
| `ENVIRONMENT_FAILURE` | reglas o IA | firma de red, host o navegador |
| `FLAKY_FAILURE` | reglas o IA | falló y pasó en un reintento |
| `PRODUCT_REGRESSION` | solo IA/humano | la app no cumple y el test parece correcto |
| `TEST_DEFECT` | solo IA/humano | el test parece incorrecto |
| `INCONCLUSIVE` | reglas o IA | evidencia insuficiente |

## Reglas, en orden

| Regla | Condición | Resultado |
|---|---|---|
| `R-NO-RESULTS` | sin intentos | INCONCLUSIVE |
| `R-SKIPPED` | `status` o `expectedStatus` = `skipped` | SKIPPED |
| `R-FLAKY` | `status` = `flaky` | FLAKY_FAILURE |
| `R-INTERRUPTED` | último intento `interrupted` | INCONCLUSIVE |
| `R-PASSED` | `status` = `expected` y `expectedStatus` = `passed` | PASSED, confianza `medium` |
| `R-UNEXPECTED-PASS` | `expectedStatus` = `failed` y el último intento pasó | UNEXPECTED_PASS |
| `R-ENV` / `R-ENV-MASKED` | el error coincide con una firma de entorno | ENVIRONMENT_FAILURE (`MASKED` si `test.fail()` lo contaba como esperado) |
| `R-FAIL-NO-ID` | `test.fail()` sin `@bug-<id>` ni anotación `issue` con `Dxx:` | INCONCLUSIVE |
| `R-KNOWN-MASKED` | `test.fail()` con id, pero no falla en un `expect(` del propio spec (timeout, error en un page object, excepción) | INCONCLUSIVE |
| `R-KNOWN` | `test.fail()` con id y falla en un `expect(` del propio spec | KNOWN_DEFECT |
| `R-UNEXPECTED` | cualquier otro fallo | INCONCLUSIVE con `needs_ai: true` |

**Repeticiones** (`--repeat-each`): el reporter mete cada repetición en el mismo `spec`. Se agrupan en un diagnóstico por test y proyecto, se clasifica cada repetición y se combinan:

| Regla | Condición | Resultado |
|---|---|---|
| (la de cada repetición) | todas las repeticiones dan la misma categoría | esa categoría |
| `R-ENV-REPEAT` | unas pasan y las que fallan tienen todas firma de entorno | ENVIRONMENT_FAILURE |
| `R-FLAKY-REPEAT` | unas pasan y otras fallan | FLAKY_FAILURE (así se detectó FLAKY-01) |
| `R-MIXED` | todas fallan, por causas distintas | INCONCLUSIVE |

**Por qué PASSED nunca es `high`:** un pase es un hecho, pero no confirma que el test sea correcto. Un test que pasa por casualidad (FLAKY-02) pasa siempre, también con repeticiones: ningún dato del resultado lo distingue. Las reglas no lo marcan como sospechoso, porque sería inventar; lo busca `test-quality-review`.

Por qué no basta `status`: Playwright marca como `expected` un `test.fail()` que falla **por cualquier motivo**. Con el host caído, los tests `@bug` se veían «correctos» (ENV-01, AD-06 en `reports/`). Por eso `KNOWN_DEFECT` exige que el fallo sea una aserción del spec.

Firmas de entorno: `ENV_PATTERNS` en `core.mjs`. Para añadir una: un caso en `eval/cases.json` (con su `label_status`) y una prueba en `core.test.mjs` antes de cambiar el patrón.

## Casos ambiguos

- Un `Test timeout of 30000ms exceeded while running "beforeEach"` puede ser entorno o test: las reglas lo dejan en INCONCLUSIVE. No lo conviertas en ENVIRONMENT_FAILURE sin otra evidencia (otros tests con la misma ventana temporal, comprobación del host).
- Un PASS falso (el test pasa por casualidad, como FLAKY-02) **no se ve** en el resultado. Ninguna regla lo detecta: PASSED se queda en confianza `medium` y la detección es trabajo de `test-quality-review`.
- Un `strict mode violation` puede ser un localizador malo **o** una app que duplica elementos (D03 duplica metas). No lo resuelvas por regla.

## Ejemplo

Entrada (extracto del reporter JSON):

```json
{ "expectedStatus": "failed", "status": "expected", "annotations": [{ "type": "issue", "description": "D05: ..." }, { "type": "fail" }],
  "results": [{ "status": "failed", "errors": [{ "message": "Error: expect(locator).toHaveCount(expected) failed" }],
               "errorLocation": { "file": ".../tests/finanzas-pareja/alta-manual.spec.ts", "line": 138 } }] }
```

Salida (resumida):

```json
{ "classification": "KNOWN_DEFECT", "confidence": "high", "rule_id": "R-KNOWN", "scenario_id": "ALTA-06",
  "evidence": [{ "source": "tag", "quote": "@bug-D05" }, { "source": "error_location", "quote": "finanzas-pareja/alta-manual.spec.ts:138" }],
  "requires_human_review": false }
```

## Validación

`npm run test:triage`: 31 pruebas unitarias y la evaluación por categoría. La evaluación sale con error si falla un caso **verificado**. El contrato completo está en `docs/agentic-qa.md`.
