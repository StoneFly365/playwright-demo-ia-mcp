# Informe de ejecución · finanzas-churritos

- **Fecha:** 2026-10-05
- **Suite:** project `finanzas-churritos` (Chromium escritorio), 93 tests en 11 ficheros
- **Commit base:** `9e932ff`, más las correcciones de esta revisión (sin commitear)
- **Entorno:** Windows 11, Node 22, Playwright 1.58.2, contra producción (`https://finanzas-churritos.netlify.app`)

## 1. Resultado por test (ejecución final E9)

| Estado | Nº | Significado |
|---|---|---|
| **PASS** | **75** | Comportamiento correcto verificado |
| **FAIL** | **18** | Defecto de la aplicación (causa A), con evidencia. Marcados `test.fail()` / `@bug-Dxx` |
| **FLAKY** | **0** | FLAKY-01 y FLAKY-02 corregidos (ver `flakiness-report.md`) |
| **BLOCKED** | **0** | Hubo bloqueos por el entorno en E4 y E7 (ENV-01). La confirmación final E9 se hizo con el host disponible |
| **SKIPPED** | 0 | — |

**Desglose de los 18 FAIL por defecto:**

| Defecto | Tests |
|---|---|
| D01 | 1 |
| D02 | 2 |
| D03 | 1 |
| D04 | 1 |
| D05 | 1 |
| D06 | 1 |
| D08 | 4 |
| D10 | 1 |
| D11 | 1 |
| D13 | 1 |
| D14 | 1 |
| D15 | 1 |
| D16 | 2 |

Cada uno falla en la aserción de su defecto, con el valor recibido documentado en `qa-code-review.md` §4.

## 2. Historial de ejecuciones

| # | Hora | Configuración | Esperado | Inesperado | Notas |
|---|---|---|---|---|---|
| E1 | 14:50 | completa, workers por defecto | 93 | 0 | Fase 1: ningún fallo inexplicado. 17 FAIL esperados, todos en su aserción de defecto |
| E2 | 14:52 | 8 tests modificados | 8 | 0 | Tras R4–R6: los fallos D01, D04 y D08 ya muestran la respuesta real de la app |
| E3 | 14:52 | estrés 5 × 16 workers | 463 | 2 | **FLAKY-01** detectado |
| E4 | 14:57 | estrés 5 × 16 workers | 323 | 142 | **ENV-01**: *timeouts* de 30 s en la preparación de todos los tests (ventana de caída del host) |
| E5 | 15:04 | completa, `--workers=1` | 93 | 0 | Ejecución en serie: sin dependencias de orden. Incluye R1 (D11 restaurado) |
| E6 | 15:08 | estrés 5 × 16 workers | **465** | **0** | **Última ejecución completa válida** |
| E7 | 15:11 | completa, workers por defecto | 12 | 81 | **ENV-01**: el host no acepta conexiones. Los 12 «esperados» son tests `@bug` que fallaron por el *timeout*, no por su defecto (enmascaramiento, AD-06) |
| E8 | 15:16 | 1 test | — | 1 | Verifica el nuevo mensaje de diagnóstico de `abrir()` durante la caída |
| E9 | 15:22 | completa, workers por defecto | **93** | **0** | **Confirmación final con el código definitivo**, después de que el host volviera (unos 4 min de caída). 75 PASS y 18 FAIL esperados, cada uno en la línea de su defecto |

## 3. Clasificación de los fallos observados (fase 1 y fase 2)

| Fallo | Categoría | Root cause | Fix | Confianza |
|---|---|---|---|---|
| 18 tests `@bug-Dxx` | **A**: bug de aplicación | Defectos D01–D06, D08, D10, D11, D13–D16 | Ninguno en el test: se mantienen como «fallo esperado» con evidencia | Alta |
| «deshacer una aportación…» 2/5 | **D**: timing (ocultaba A, D11) | Caducidad del aviso (5 s) frente al timeout de `expect` (5 s) | Comprobación movida al test D11 con un límite de 1 s, más una aserción exacta | Alta |
| «el botón «Deshacer» desaparece…» (pasaba) | **I**: test conceptualmente incorrecto | La misma carrera hacía pasar el test con el defecto presente | Pasa a `@bug-D11` | Alta |
| 142 *timeouts* (E4) y 81 *timeouts* (E7) | **H**: entorno | El host de la app no acepta conexiones TCP; la red local y otros hosts responden | No se toca la lógica de los tests. Se añade un límite de arranque de 15 s con un mensaje claro | Alta (entorno) · media (caída frente a limitación de IP) |

Ningún test se ha «arreglado» quitando una aserción válida. La única aserción retirada (la de «Deshacer» en el test de aportación) se ha trasladado al test D11, que la verifica correctamente.

## 4. Verificaciones estáticas

| Comprobación | Resultado |
|---|---|
| `tsc --noEmit` (`npm run typecheck`) | Sin errores |
| Lint | No existe en el proyecto (AD-05) |
| `waitForTimeout` / `setTimeout` / `sleep` | 0 |
| `test.only` / `test.skip` | 0 |
| Aislamiento (`--workers=1` frente a 16) | Mismos resultados |

## 5. Confirmación final

Con el código definitivo (E9): 93/93 tests con el resultado esperado, es decir, 75 PASS y 18 FAIL por defectos de la app, sin fallos inexplicados. Junto con E5 (en serie, 93/93) y E6 (estrés, 465/465), P0 y P1 son estables.
