<!-- Agente: test-reviewer · Commit revisado: 41c56f7 (2026-10-16) · Entrada: tests/finanzas-pareja/alta-manual.spec.ts (fichero existente, sin diff) -->

## Revisión: tests/finanzas-pareja/alta-manual.spec.ts (commit 41c56f7, rama arquetipo)

No soy el autor del fichero ni propongo cambios en él. Es una revisión del fichero tal cual, sin diff. No he ejecutado los tests ni `guard:assertions`, porque no hay diff. Contrasté el fichero con los escenarios ALTA-01 a ALTA-08, `reports/bug-reports.md` (D01, D05, D14, D15), `open-questions.md` (OQ-07, OQ-08), `docs/automation-architecture.md`, los page objects (`formulario-movimiento.ts`, `alta-movimiento.ts`, `finanzas-app.ts`, `inicio.ts`), la fixture y `test-data`. Según `coverage-verified.md`, ALTA-01, 03, 05 y 06 tienen `test-body` solo en este fichero; ALTA-04 también tiene un test en `logica-pura.spec.ts:17`. No hay duplicidades dentro del mismo id. Los cuatro `test.fail()` cumplen la regla: sin argumentos, con la etiqueta `@bug-Dxx` literal y un defecto por test.

### Hallazgos

Semáforo: 🔴 bloqueante · 🟠 alta · 🟡 media · 🟢 baja

- 🟡 [media] alta-manual.spec.ts:104 — El valor `'nomina'` para Ingreso no tiene respaldo en las fuentes.
  Evidencia: «await expect(formulario.categoria).toHaveValue('nomina');». El escenario ALTA-05 solo dice «La categoría seleccionada siempre pertenece al tipo activo».
  Riesgo: congela la categoría por defecto que la app muestra hoy. Un cambio legítimo del orden de categorías rompería el test. Además, con Ahorro no se comprueba ninguna categoría.
  Recomendación: comprobar la propiedad del escenario, es decir, que la opción seleccionada sea una de las habilitadas para el tipo activo, y hacerlo también con Ahorro. Si se quiere fijar «nomina» como valor por defecto, abrir una pregunta abierta (OQ nueva, ligada a ALTA-05) en lugar de dejarlo implícito.
  Estado: ✅ resuelto, con aprobación humana (2026-10-16). Se quita «nomina» y se comprueba la propiedad del escenario con Gasto, Ingreso y Ahorro: `categoriaSeleccionadaDisponible()` (`option:checked:enabled`) tiene que tener 1 elemento. La mutación lo destapó: la primera versión usaba `toBeEnabled()`, que **pasaba** aunque la opción seleccionada estuviera `disabled` (Playwright no lo detecta en `<option>`). Con el selector CSS, las mutaciones fallan en los tres tipos: Gasto con «nomina» (línea 108), Ingreso con «supermercado» (113) y Ahorro con «supermercado» (118).

- 🟡 [media] alta-manual.spec.ts:64-70 y 72-83 — El límite inferior (ALTA-03) está incompleto y no comprueba lo guardado.
  Evidencia: Datos del escenario: «`0,001`, `0,004`, `0,005`, `0,01`». El test solo usa `0,01` y `0,001`. Resultado esperado: «Nunca se persiste un movimiento de 0 €» y «0,01 se guarda como 0,01 €».
  Riesgo: `0,004` es el mismo defecto D01 (rechazo por debajo de 0,01) y no está cubierto. El test de `0,01` solo mira el aviso y no el importe persistido. El de `0,001` no comprueba que no se haya creado ningún movimiento.
  Recomendación: añadir `0,004` al caso con `@bug-D01`, que tendría que ir en su propio test o bucle, sin mezclarlo con casos sanos. Comprobar el movimiento en el listado (o la ausencia de la bienvenida/«Movimientos 0»). `0,005` no se fija: depende de OQ-07 (redondear o rechazar), que está abierta.
  Estado: 🔶 resuelto en parte (2026-10-16). Con 0,01 se comprueba lo guardado: el KPI de Gastos es 0,01 €. Mutación (guardar 0,02, sin el aviso): falla con «0,02 €». El caso 0,004 se añade al bucle de D01, con aprobación humana. Antes de marcarlo se comprobó que falla igual que 0,001 («Gasto de 0 € guardado.»). Se mantiene AD-06: los dos casos fallan en la línea 87. 0,005 queda fuera por OQ-07, con un comentario. «No se crea ningún movimiento» iría detrás de la aserción del defecto: no se puede verificar hasta que se corrija D01.

- 🟡 [media] alta-manual.spec.ts:9-27 — ALTA-01 no comprueba parte del «Resultado esperado» ni todos los datos introducidos.
  Evidencia: El escenario dice «sale en «Últimos movimientos» y en Movimientos (grupo «Hoy»)». El test rellena `categoria: 'supermercado'` y `formaPago: 'Tarjeta'`, y solo comprueba `toContainText('− 12,50 €')` en la fila.
  Riesgo: la categoría, la forma de pago y el grupo «Hoy» pueden romperse sin que el test falle. La fixture fija el reloj (`page.clock.setFixedTime`), así que «Hoy» es determinista y se podría comprobar.
  Recomendación: comprobar el grupo «Hoy» de la fila (si el page object de Movimientos lo expone) y la categoría o la forma de pago visibles en el detalle. Si no es objetivo del test, quitar `categoria` y `formaPago` del `rellenar` para no aparentar una cobertura que no existe.
  Matiz: el signo «−» de la fila no aparece en el escenario. Se apoya en el formato de la app, no en una fuente. Es menor, pero conviene saberlo.
  Estado: 🔶 resuelto en parte (2026-10-16). Se comprueban en el detalle la categoría «Supermercado» y la forma de pago «Tarjeta». Mutaciones: con la categoría ocio falla en la línea 28; sin forma de pago, en la 29. El grupo «Hoy» no se comprueba porque el page object no lo expone.

- 🟡 [media] alta-manual.spec.ts:127-144 — ALTA-06 tiene frágil el paso `selectOption({ label: '🎯 Viaje' })` y no comprueba «Sin meta».
  Evidencia: «await formulario.meta.selectOption({ label: '🎯 Viaje' });». El escenario dice «El desplegable lista «Sin meta» y todas las metas».
  Riesgo: el emoji viene del texto de la app. Cuando se corrija D05, un cambio de ese prefijo haría fallar el test por una causa ajena al requisito. Mientras tanto, `test.fail()` convertiría cualquier fallo de ese paso en un «pasa» engañoso. Hoy el primer punto de fallo sí es la aserción del defecto (`toHaveCount(1)`), lo cual es correcto según AD-06. Tampoco se comprueba que exista «Sin meta» ni `metaId`, y mientras D05 siga abierto el aporte de 100 € nunca se ejecuta (el `test.fail()` lo oculta).
  Recomendación: seleccionar la opción por el valor (`meta-viaje`) o localizar la opción por rol y usar su valor. Añadir una aserción sobre «Sin meta». Revisar el test en cuanto D05 se cierre: es entonces cuando se comprobarán los pasos finales.
  Estado: ✅ resuelto (2026-10-16). Se comprueba «Sin meta», y la meta se selecciona por el `value` de la opción encontrada por rol, sin depender del emoji. Se mantiene AD-06: falla primero en `toHaveCount(1)` de «Viaje», en la línea 150. «Sin meta» va antes y pasa hoy. La mutación solo invierte el nombre: confirma que el localizador encuentra la opción (línea 148).

- 🟡 [media] alta-manual.spec.ts:52-62 — En el test de D14, `test.fail()` cubre también la aserción del aviso, no solo la del foco.
  Evidencia: «await expect(app.aviso('El importe tiene que ser un número mayor que cero.')).toBeVisible(); await expect(app.alta.formulario.importe).toBeFocused();»
  Riesgo: si el aviso dejara de aparecer (regresión distinta de D14), el test seguiría «pasando» por `test.fail()`. El aviso es necesario como sincronización antes del foco (D02), así que no se puede quitar.
  Recomendación: dejarlo como está, pero asegurarse de que ALTA-02 (el bucle de 4 valores, sin `test.fail`) detecta esa regresión. Hoy lo hace, así que el riesgo está acotado. Se anota para que quede constancia. Podría bajarse a 🟢 si se acepta.
  Estado: ➖ aceptado sin cambios. ALTA-02 cubre la regresión del aviso.

- 🟢 [baja] alta-manual.spec.ts:90-92 — El formato `1234,56 €` (sin separador de miles) no está en el escenario.
  Evidencia: «'Gasto de 1234,56 € guardado.'» y «toContainText('1234,56 €')». ALTA-04 solo da «1.234,56 → 1234,56» y exige que «el formulario y la lista lo muestran con coma decimal».
  Riesgo: la ausencia de agrupación en 4 cifras es coherente con es-ES y con «1000 €» de metas, pero no está documentada. Tampoco se comprueba que el formulario muestre el importe con coma decimal.
  Recomendación: aceptable. Si se quiere dejar constancia, añadir una nota o pregunta abierta sobre el formato de 4 cifras. Comprobar el valor del campo tras guardar solo si el escenario lo exige en el formulario.
  Estado: ➖ aceptado (coherente con es-ES y con «1000 €» en metas).

- 🟢 [baja] alta-manual.spec.ts:29-36 y 47-48 — La bienvenida ya es visible antes de cancelar, así que el «no cambia» depende solo de `hoja` oculta.
  Evidencia: «await expect(app.alta.hoja).toBeHidden(); await expect(app.inicio.bienvenida).toBeVisible();»
  Riesgo: bajo, porque `toBeHidden` sincroniza con el cierre y la bienvenida solo existe sin datos. La aserción sí detecta que se haya guardado algo.
  Recomendación: ninguna obligatoria. Opcionalmente, comentar que la bienvenida es la señal de «sin movimientos».
  Estado: ➖ sin cambios.

- 🟢 [baja] alta-manual.spec.ts:133 — El dato de la meta (`{ id: 'meta-viaje', nombre: 'Viaje', objetivo: 1000, inicial: 0 }`) va en línea, no en un builder de `test-data/`.
  Evidencia: «metas: [{ id: 'meta-viaje', nombre: 'Viaje', objetivo: 1000, inicial: 0 }]».
  Riesgo: duplicación si otros specs de metas repiten el literal. No hay builder de metas exportado hoy en `datos.ts`.
  Recomendación: valorar un builder de meta si se repite en más ficheros.
  Estado: ➖ sin cambios: no hay más usos que justifiquen un builder.

### Seguimiento pendiente
- ALTA-01: que el page object de Movimientos exponga el grupo por día («Hoy») para comprobarlo.
- ALTA-03: comprobar que no se crea ningún movimiento de 0 € cuando se cierre D01.

### Cobertura y huecos (sin hallazgo de calidad)
- ALTA-07 (fecha vacía y futura; depende de OQ-08) y ALTA-08 (XSS, textos largos) figuran como NOT AUTOMATED en `coverage-verified.md`. No es un defecto de este fichero.
- ALTA-04 comprueba por la interfaz un solo formato. El escenario permite «un subconjunto representativo» y el resto vive en `logica-pura.spec.ts`. Es correcto.
- Esperas, localizadores y convenciones: no he encontrado `waitForTimeout`, `networkidle`, XPath, CSS ni `nth()` en el test. Los avisos se sincronizan con `aviso()` o `ultimoAviso()`. Los tests con `test.fail()` sincronizan antes de las aserciones negativas. Los títulos están en lenguaje de negocio y cada cuerpo lleva su `// ID`.
- Importes y NBSP: `toHaveText('12,50 €')` y los `toContainText` con «€» son textos literales, que Playwright normaliza. No hay regex con espacio literal. Riesgo de subcadena: `'12,50 €'` y `'1234,56 €'` se buscan dentro de una fila filtrada por comercio, así que no hay ambigüedad real.
- Mutación: no encuentro ninguna aserción incapaz de detectar un cambio. No se pide evidencia de mutación porque es código existente.

### Oráculos tocados
Ninguno. No hay diff; la revisión es del fichero tal cual. Los valores esperados salen de los escenarios, salvo `'nomina'` y el signo «−» (indicados arriba).

### Resultado
SIN_OBJECIONES — pendiente de aprobación humana (no hay hallazgos bloqueantes ni altos; hay cinco medios y tres bajos, a decidir por la persona que revisa)

---

Decisión humana: pendiente
