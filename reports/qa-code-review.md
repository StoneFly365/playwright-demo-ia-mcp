# Revisión de calidad de la suite · finanzas-pareja

- **Fecha:** 2026-10-05
- **Alcance:** `tests/`, `pages/`, `fixtures/`, `test-data/` y `helpers/` de finanzas-pareja, más `playwright.config.ts`.
- **Commit revisado:** `9e932ff` más los cambios de esta revisión.

**Severidad:**
- 🔴 Alta: puede dar un PASS falso u ocultar un fallo real.
- 🟠 Media: fragilidad o falta de diagnóstico.
- 🟡 Baja: mantenibilidad o estilo.

**Categoría** (causa raíz según la clasificación A–I del encargo):
- A: bug de aplicación.
- B: bug del test.
- C: locator incorrecto.
- D: timing / sincronización.
- E: datos de prueba.
- F: estado compartido.
- G: configuración.
- H: entorno.
- I: test conceptualmente incorrecto.

## 1. Hallazgos corregidos en esta revisión

| # | Sev. | Cat. | Dónde | Hallazgo | Corrección |
|---|---|---|---|---|---|
| R1 | 🔴 | I + D | `movimientos.spec.ts` › «el botón «Deshacer» desaparece una vez usado» | **PASS falso.** El test daba por bueno que «Deshacer» desaparece, pero el botón sigue visible (D11). `toHaveCount(0)` reintenta durante 5 s, justo el tiempo que tarda el aviso en caducar solo, así que la caducidad hacía pasar el test. En la fase anterior esto llevó a **descartar D11 por error**. | Se reprodujo con una sonda inmediata (6/6 con el botón aún visible). Ahora es un test de defecto conocido (`test.fail()`, `@bug-D11`) con un límite explícito de 1 s, menor que la vida del aviso. D11 vuelve a constar como defecto. |
| R2 | 🔴 | D | `metas.spec.ts` › «deshacer una aportación…» | **FLAKY 3/5** bajo estrés, por la misma causa que R1: la comprobación de «Deshacer» competía con la caducidad del aviso. | Se quita esa comprobación de este test (D11 ya lo cubre R1) y se sustituye por una aserción exacta. |
| R3 | 🔴 | B | `metas.spec.ts` › «deshacer una aportación…» | **Aserción débil:** `toContainText('0 € de 1000 €')` también se cumple con «15**0 € de 1000 €**». El test pasaría aunque deshacer no funcionase. | Se añade `resumen('Ya apartado')` con `toHaveText('0 €')`, que es exacto. |
| R4 | 🟠 | B | `alta-manual.spec.ts` (D01) y `copias.spec.ts` (D08, 4 casos) | Los tests de defecto conocido fallaban con «Expected: visible»: solo probaban que no salía el aviso de error, no que la app hubiera **aceptado** el dato. Un fallo por cualquier otro motivo habría dado el mismo resultado. | Ahora comprueban `app.ultimoAviso()`. Al fallar muestran la respuesta real de la app: «Gasto de 0 € guardado.» o «Importados 1 movimientos…». |
| R5 | 🟠 | C | `metas.spec.ts` (MET-04) | `getByRole('status').first()` también encuentra el `<output>` del slider de Ajustes (role=status). Se rompería al reutilizarlo en esa vista. | Nuevo `FinanzasApp.ultimoAviso()`, acotado a la capa de avisos `#avisos`. |
| R6 | 🟡 | B | `alta-texto.spec.ts` (TXT-01) | Solo comprobaba que existía la etiqueta «Texto original», no su contenido. | Abre el desplegable y comprueba el texto guardado. |

## 2. Revisión por área

| Área | Estado | Observaciones |
|---|---|---|
| **Locators** | ✅ Bien | El 90 % usa `getByRole` o `getByLabel`, siempre acotados a su hoja o vista. Hay 9 usos de `.locator()`, todos en page objects y justificados (ver `docs/automation-architecture.md` §2). No hay XPath. Acoplamientos a vigilar: las clases de 4 bloques de cifras, `#avisos`, `option:enabled` y `section` (deuda AD-04). |
| **Assertions** | ✅ Bien, tras corregir R1, R3, R4 y R6 | Se comprueban valores de negocio exactos (`toHaveText('650 €')`, `toHaveValue`, contenido real de JSON y CSV). Se revisaron todas las comprobaciones de importes con `toContainText`: no queda ninguna ambigua. |
| **Waits** | ✅ Bien | 0 `waitForTimeout`, `setTimeout` o `sleep`. Hay un único timeout explícito (1 s en R1), justificado y comentado. La sincronización es web-first, más una señal determinista de fin de arranque. |
| **Retries** | ⚠️ Revisar | En local, `retries: 0` (correcto: los fallos se ven). En CI, `retries: 2` sin `failOnFlakyTests`: un test intermitente se queda en verde sin que nadie lo vea (AD-02). |
| **Aislamiento** | ✅ Bien | Contexto nuevo por test y siembra explícita. `--workers=1` frente a 16 workers da los mismos resultados (ver `test-execution.md`). No hay dependencias entre tests. |
| **Test data** | ✅ Bien | Builders legibles, `MES_BASICO` calculable a mano y tablas con oráculo. Los ids de categoría (`'supermercado'`) aparecen en tests y semillas: son claves estables de la app, pero suponen un acoplamiento (AD-07). |
| **Page Objects** | ✅ Bien | 9 ficheros de 13 a 104 líneas. El mayor, `finanzas-app.ts`, es el armazón. Sin aserciones dentro y con un componente reutilizado (`FormularioMovimiento`) en 3 hojas. |
| **Fixtures** | ✅ Bien | Mínimas: reloj fijo y page object raíz. |
| **Helpers** | ✅ Bien | 2 helpers, ambos necesarios: siembra y llamada a la lógica pura. `new Function` para el `import()` dinámico romperá si la app añade CSP (AD-08). |
| **Duplicación** | ✅ Baja | Las 4 variantes de importe inválido, de límite y de importación están parametrizadas. Se repite algo de preparación (`abrir` + `irAPlan`) entre tests de metas y presupuestos, que es aceptable por legibilidad. |
| **Naming** | ✅ Bien | Los títulos están en lenguaje de negocio y el id del escenario va en un comentario. Mejoras: anotación `scenario` en vez de comentario (AD-10) y coma decimal en los títulos de PRE-03 («79.94» → «79,94»). |
| **Estructura** | ✅ Bien | Patrón por app replicable (`tests|pages|fixtures|test-data|helpers/<app>`). |
| **TypeScript** | ✅ Bien | `tsc --noEmit` sin errores, sin `any` explícitos y con tipos de dominio en `datos.ts`. No hay lint (AD-05). |
| **Configuración** | ⚠️ Revisar | Un project por app, `serviceWorkers: 'block'`, locale y zona horaria fijados. **El workflow de CI no ejecuta este project** (AD-01). |
| **Mantenibilidad** | ⚠️ Revisar | La señal de arranque depende del texto de un mensaje interno de Playwright (AD-03). Si ese texto cambia en una actualización, todos los tests se agotarían en `abrir()` sin un mensaje claro. |
| **Cobertura** | ✅ Bien | P0 13/13 y P1 28/28, documentadas en `specs/finanzas-pareja/coverage-matrix.md`. |
| **Flakiness** | ⚠️ Ver `flakiness-report.md` | El flaky de test (R2) está corregido. Queda un riesgo de **entorno**: con 16 workers contra producción hubo una ventana de *timeouts* masivos. |

## 3. Búsquedas específicas pedidas

| Búsqueda | Resultado |
|---|---|
| `waitForTimeout()` | 0 apariciones (grep sobre tests, pages, fixtures, helpers y test-data) |
| Selectores CSS/XPath frágiles innecesarios | Ninguno innecesario. Los 9 existentes están justificados y encapsulados |
| Tests dependientes | Ninguno. Ver la prueba con 1 worker frente a 16 |
| Assertions débiles | 3 encontradas y corregidas (R3, R4, R6) |
| Duplicación | Baja, ya parametrizada |
| Page Objects demasiado grandes | Ninguno (máximo 104 líneas) |
| Helpers innecesarios | Ninguno |
| Datos hardcoded problemáticos | Ids de categoría acoplados (AD-07). La fecha fija es intencionada |
| Tests que pasan sin validar nada | **1 encontrado: R1** (PASS falso por la caducidad del aviso). Corregido |

## 4. Tests de defecto conocido: verificación de que fallan por el motivo correcto

Un `test.fail()` también «pasa» si el test falla por cualquier otro motivo, por ejemplo un locator roto. Por eso se comprobó la línea y el valor recibido de cada uno de los 18:

| Defecto | Test | Falla en | Valor recibido (evidencia) |
|---|---|---|---|
| D01 | importe por debajo del céntimo | aviso de respuesta | «✅ Gasto de 0 € guardado.» |
| D02 | metas: formulario conserva lo escrito | `toHaveValue('Viaje QA')` | `""` |
| D02 | presupuestos: formulario conserva lo elegido | `toHaveValue('ocio')` | `"supermercado"` |
| D03 | renombrar una meta | `toHaveCount(1)` | `2` |
| D04 | «ya tengo ahorrado» negativo | aviso de respuesta | «✅ Meta «Viaje» guardada.» |
| D05 | ahorro a mano asignado a meta | opción «Viaje» | `0` opciones |
| D06 | importe total del lote | `toHaveText('118,89 €')` | `"2098,89 €"` |
| D08 ×4 | importar negativo, cero, tipo inexistente, categoría inexistente | aviso de respuesta | «✅ Importados 1 movimientos, 0 presupuestos y 0 metas.» |
| D10 | error de importación en español | `not.toContainText` | «…Expected property name or '}' in JSON…» |
| D11 | «Deshacer» desaparece una vez usado | `toHaveCount(0)` en 1 s | `1` |
| D13 | «el día 2» | `toBe('2026-10-02')` | `"2026-10-05"` |
| D14 | foco vuelve al importe | `toBeFocused()` | `inactive` |
| D15 | «Asignar a meta» solo en ahorros | `toBeHidden()` | `visible` |
| D16 | 79,99 € sin aviso | `toHaveCount(0)` | `1` |
| D16 | 99,99 € sin superar | `not.toContainText('superado')` | «…· superado» |
