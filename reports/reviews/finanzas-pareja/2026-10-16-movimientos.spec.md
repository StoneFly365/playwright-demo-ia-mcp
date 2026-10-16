<!-- Agente: test-reviewer · Commit revisado: ead6db4 (2026-10-16) · Entrada: tests/finanzas-pareja/movimientos.spec.ts (fichero existente, sin diff) -->

## Revisión: tests/finanzas-pareja/movimientos.spec.ts (commit ead6db4, rama arquetipo)

Revisión de un fichero existente, sin diff. Soy independiente: no he generado este código. No se me ha pasado la salida de `guard:assertions`, pero no hay cambio de oráculos que cribar. He contrastado contra `specs/finanzas-pareja/test-scenarios.md` (LIST-01/02, DET-01..04, UNDO-01), `reports/bug-reports.md` (D11), `coverage-matrix.md`, `reports/coverage-verified.md`, los page objects (`movimientos.ts`, `finanzas-app.ts`, `formulario-movimiento.ts`, `cifra.ts`) y `test-data/`. No he ejecutado nada.

### Hallazgos

Semáforo: 🔴 bloqueante · 🟠 alta · 🟡 media · 🟢 baja

- 🟠 [alta] tests/finanzas-pareja/movimientos.spec.ts:124-127 — «cancelar una edición» (DET-02) es una aserción negativa sin sincronizar con la respuesta de la app.
  Evidencia: «await formulario.cancelar(); await expect(app.movimientos.fila('Netflix')).toContainText('12,99 €'); await expect(app.movimientos.total('Gastos')).toHaveText('12,99 €');»
  Riesgo: el valor 12,99 € ya era cierto antes de pulsar Cancelar. Las aserciones pasan en el primer sondeo, antes de que la app reaccione. Si Cancelar guardara el 99 (regresión del requisito «el original no cambia»), el test podría pasar igualmente si la comprobación se adelanta al repintado.
  Recomendación: sincronizar antes con una señal de que el cancelar se ha procesado (`await expect(detalle.edicion).toBeHidden()` o la hoja de edición cerrada). Idealmente, comprobar también que no hay aviso de «actualizado» (`app.ultimoAviso()`). Después, mantener las comprobaciones de valor.
  Estado: ✅ resuelto (2026-10-16). Antes del cambio, la mutación (pulsar «Guardar» en vez de «Cancelar») **pasaba 2 de cada 5 veces**: hueco confirmado. Ahora espera a que se cierre la hoja de edición (`detalle.edicion` oculta) y a que no haya ningún aviso (`ultimoAviso()` sin elementos) antes de comprobar los valores. Mutación: falla 10 de 10. Sin mutar: pasa 5 de 5.

- 🟡 [media] movimientos.spec.ts:15-39 (LIST-01) — el escenario exige que las tarjetas «cuadren con la lista visible» tras cada filtro. Solo se comprueban en el filtro Gastos.
  Evidencia: tras `filtroTipo('Ingresos')` y `filtroTipo('Ahorro')` solo hay `toHaveCount(1)` y `toBeVisible()`. Tras la categoría «supermercado» no se mira ningún total. El pie «N días con actividad · media…» tampoco se verifica.
  Riesgo: un recálculo de totales roto en Ingresos, Ahorro o categoría pasaría sin detectarse (el test se titula «recalculan la lista y los totales»).
  Recomendación: añadir `total('Movimientos')` e `Ingresos` (2000 €) en el filtro Ingresos, `total('Movimientos')` en Ahorro, y `Gastos` (100 €) con la categoría. Valores derivables de `MES_BASICO`, no de la app.
  Estado: ✅ resuelto (2026-10-16). Totales tras los filtros Ingresos (1 · 2000 € · 0 €), Ahorro (1 · 0 € · 0 €) y la categoría (1 · 100 €). El pie «N días…» no se comprueba: su fórmula no está documentada. Mutaciones: Ingresos→Ahorro recibe «0 €»; Ahorro→Ingresos recibe «2000 €»; supermercado→ocio recibe «50 €».

- 🟡 [media] movimientos.spec.ts:82-96 (DET-01) — falta el resultado esperado de los botones del detalle.
  Evidencia: el escenario dice «Están los botones Borrar, Duplicar y Editar»; el test no comprueba ninguno (solo texto y datos). El título del dialog sí queda cubierto de forma implícita por `getByRole('dialog', { name: comercio, exact: true })`.
  Riesgo: la desaparición de una acción del detalle no se detectaría. `coverage-verified` marca DET-01 como AUTOMATED/`test-body`, lo que sobrestima la cobertura real.
  Recomendación: añadir tres `toBeVisible()` de `getByRole('button', …)` sobre `detalle.hoja`, o un método de solo localizador en el page object (sin aserciones).
  Estado: ✅ resuelto (2026-10-16). Nuevo `DetalleMovimiento.boton(accion)`, que también usan `editar`, `duplicar` y `borrar`, y comprobación de los tres botones. Mutación (cerrar la hoja antes): falla en `boton('Borrar')`, lo que confirma que los busca dentro del detalle.

- 🟡 [media] movimientos.spec.ts:41-53 (LIST-02) — los datos del escenario no se cubren: «45.9», «45,90», «netflix» y «combustible».
  Evidencia: el test parametrizado usa «MERCADONA», «ocio y cultura» y «500». El escenario pide «45.9» y «45,90» (ambos formatos de importe).
  Riesgo: la búsqueda por importe decimal con punto o coma, que es donde suelen estar los fallos de formato, no tiene red. El caso «500» es un entero que no lo ejercita.
  Recomendación: añadir un caso `45,90` y otro `45.9` (por ejemplo, contra un movimiento sembrado de 45,90 €) en la tabla. Revisar que la fila esperada sea única.
  Estado: ✅ resuelto y **defecto nuevo D17** (2026-10-16). «45.9» encuentra el movimiento; «45,90», que es como lo muestra la lista, no. Causa en el código de la app: `movimientosFiltradosVista` compara con `${m.importe}`, el número sin formato. Se registra D17 en `bug-reports.md` y el caso se marca con `test.fail()` y `@bug-D17`. Se cumple AD-06: falla primero en `toHaveCount(1)`. Mutación del caso «45.9» (importe 45.8): falla en `toHaveCount(1)`. Ambos casos van en un `describe` sin el `beforeEach` de `MES_BASICO`.

- 🟡 [media] movimientos.spec.ts:142-166 (DET-04) — «los totales se recalculan» solo se comprueba para el contador de Movimientos.
  Evidencia: `await expect(app.movimientos.total('Movimientos')).toHaveText('1');` y ninguna comprobación de `Gastos` (45,90 €). El escenario también dice «desaparece de todas las vistas», y solo se mira Movimientos.
  Riesgo: un borrado que deje el total de Gastos desfasado pasaría. El caso «Cancelar no cambia nada» se apoya solo en que la hoja siga visible.
  Recomendación: añadir `total('Gastos')` tras el borrado (`45,90 €`) y, tras Cancelar, `fila('Netflix')` visible o el contador intacto.
  Estado: ✅ resuelto, con un límite (2026-10-16). Tras borrar: `total('Gastos')` es 45,90 €; mutación (Mercadona a 45,80): falla con «45,80 €». Tras «Cancelar»: la mutación (confirmar «Borrar») **pasaba** con la comprobación anterior de la hoja visible. Se añaden «sin aviso» y `total('Movimientos')` igual a 2. Con eso falla 9 de 10 veces en una aserción; la décima, «no ha pasado nada» no tiene señal positiva y el test falla después, en `detalle.borrar()`. El límite queda comentado en el test.

- 🟡 [media] movimientos.spec.ts:174-196 (UNDO-01) — el oráculo de «se elimina exactamente lo guardado» es indirecto y el dato del lote no coincide con el escenario.
  Evidencia: ambos tests acaban en `await expect(app.inicio.bienvenida).toBeVisible();`. El escenario habla de «un lote de 3», mientras que el test usa `LISTA_VARIOS` (4 válidas + 1 línea sin importe) y espera «Guardados 4 movimientos.».
  Riesgo: la bienvenida solo prueba que no queda ninguno (sirve porque el estado inicial es vacío). No prueba que «exactamente» N se borran, y el desfase 3 vs 4 entre spec y test no está documentado.
  Recomendación: documentar o corregir en `test-scenarios.md` el tamaño del lote (decisión humana, no del test). Opcional: comprobar el recuento en Movimientos tras deshacer. Señalo el desfase sin juzgarlo como bloqueante porque el 4 sale del dato de entrada, no de la salida de la app.
  Estado: ✅ resuelto en la documentación (2026-10-16). `test-scenarios.md` dice ahora «un lote (4 movimientos en los tests: `LISTA_VARIOS`)» y «1, 4 y 1». No se añade el recuento opcional: con el estado inicial vacío, la bienvenida ya prueba que no queda ninguno.

- 🟢 [baja] movimientos.spec.ts:55-62 — `beforeEach` abre `MES_BASICO` y el test vuelve a abrir la app con sus propios datos; y `await app.irA('Movimientos')` se repite en los tests de «Gestionar un movimiento».
  Evidencia: «await app.abrir({ movimientos: [gasto(45.9, … origen: 'texto' …)] });»
  Riesgo: coste de arranque doble (el arranque espera a una señal de consola) y confusión sobre qué datos manda. Se sostiene porque `sembrar` reemplaza (la cuenta es 1).
  Recomendación: mover ese test a un `describe` sin el `beforeEach` de `MES_BASICO`.
  Estado: ✅ resuelto (2026-10-16). El test se mueve al nuevo `describe` «Buscar con datos propios», sin `beforeEach`.

- 🟢 [baja] movimientos.spec.ts:25 vs :38/:88 — inconsistencia de signo: Balance se espera con guion («-650 €»), las filas y el detalle con signo menos U+2212 («− 100 €»).
  Evidencia: «toHaveText('-650 €')» frente a «toContainText('− 100 €')».
  Riesgo: no es falso positivo (el test pasa hoy), pero si la app unifica el signo del Balance, el fallo será confuso.
  Recomendación: dejar un comentario o una constante en `test-data` indicando que es deliberado.
  Estado: ✅ resuelto (2026-10-16). Comentario junto a la aserción del Balance.

- 🟢 [baja] movimientos.spec.ts:77 — el test de «sin resultados» (LIST-02) comprueba también que el buscador queda vacío, comportamiento de LIST-04, que consta como NOT AUTOMATED.
  Riesgo: cobertura de LIST-04 no reconocida por `coverage:map`.
  Recomendación: cuando se aborde LIST-04, extraer ese caso con su `// LIST-04`.
  Estado: ➖ sin acción ahora. Se extraerá cuando se aborde LIST-04.

- 🟢 [baja] movimientos.spec.ts:198-214 (D11) — la estructura es correcta, y lo digo expresamente. `test.fail()` y `@bug-D11` están marcados, el comportamiento correcto se afirma (botón desaparece) y la aserción del defecto es el único punto de fallo posible (AD-06), con `timeout: 1_000` justificado en un comentario (aviso de 5 s = timeout de `expect`). Observación: `test.fail()` también «pasaría» si fallase cualquier paso anterior (por ejemplo, el aviso «Se ha deshecho…»). Mitigación existente: el mismo flujo está cubierto por el test de la línea 174, que falla primero si se rompe.
  Recomendación: ninguna obligatoria.
  Estado: ➖ sin acción, como recomienda el propio hallazgo.

### Aspectos revisados sin hallazgo
- Oráculos: los valores salen de `MES_BASICO` (2000/650/300/1350, comentario aritmético en `datos.ts`) y de los «Resultado esperado» (avisos literales, «¿Borrar el movimiento?», 25,98 € = 2 × 12,99). No hay valores copiados de la app. `HOY` es fecha fija de la fixture.
- Localizadores: todos por rol/label salvo `.totales-filtro` y la estructura de `cifra`, que están confinados al page object y justificados. Sin XPath, `nth` ni CSS en el test. Importes: `toHaveText` exacto en totales; `toContainText('15,49 €')` y `'12,99 €'` con texto literal (se normaliza el NBSP) y sin riesgo de subcadena ambigua en las filas de un solo movimiento.
- Sincronización: sin `waitForTimeout`, `networkidle` ni `sleep`. `abrir()` espera a la señal de fin de arranque. Las búsquedas usan `toHaveCount` con reintento.
- Duplicidades: cada `// ID` sub-etiquetado (p. ej. `LIST-02 (texto original)`) cubre un caso distinto. No hay duplicidades; la excepción menor es el flujo de alta de la línea 174 y de la 198, necesaria por la naturaleza `test.fail()`.
- Evidencia de mutación: no hay aserción concreta que me parezca incapaz de detectar nada salvo la ya señalada (cancelar, :124-127).

### Oráculos tocados
ninguno (revisión del fichero tal cual; sin salida de `guard:assertions` y sin diff).

### Resultado
CAMBIOS_REQUERIDOS — pendiente de aprobación humana (1 hallazgo alto: aserción negativa sin sincronizar en «cancelar una edición»; el resto, medios y bajos).

---

Decisión humana: aprobado — Raúl Molina, 2026-10-16 (cambios resueltos y re-revisados en 2026-10-16-movimientos.spec-v2.md).
