# Defectos de Mis Finanzas

- **App:** https://finanzas-churritos.netlify.app/
- **Fecha de las pruebas:** 2026-10-05 · Chromium de escritorio · app sin datos al empezar cada caso
- **Cómo verificar un arreglo:** cada defecto tiene un test automatizado marcado `test.fail()` y `@bug-Dxx` (`npm run test:finanzas -- --grep @bug-D08`). Cuando el arreglo funcione, ese test pasará a «expected to fail but passed» y habrá que quitarle la marca `test.fail()`.
- **Causa probable:** salvo que se indique lo contrario, sale de leer `js/*.js` y se ha comprobado reproduciendo el síntoma. No es un diagnóstico definitivo.

## Prioridad sugerida

| Orden | ID | Severidad | Resumen |
|---|---|---|---|
| 1 | D08 | **Crítica** | Importar una copia acepta importes negativos, cero, tipos y categorías inexistentes y corrompe todos los totales |
| 2 | D03 | Alta | Renombrar una meta crea otra en lugar de modificarla |
| 3 | D02 | Alta | Los formularios de meta y presupuesto pierden lo escrito |
| 4 | D05 | Alta | El ahorro manual no deja asignarlo a una meta |
| 5 | D01 | Media | Importe «0,001» se guarda como 0 € |
| 6 | D04 | Media | «Ya tengo ahorrado» acepta negativos |
| 7 | D06 | Media | El total de la revisión por lote no se recalcula |
| 8 | D07 | Media | Al cambiar de moneda quedan importes en «€» |
| 9 | D09 | Media | Deshacer los datos de ejemplo deja presupuestos y metas |
| 10 | D13 | Media | «el día 2» no se interpreta como fecha |
| 11–16 | D10, D11, D12, D14, D15, D16 | Baja | Ver más abajo |

## Decisiones de producto necesarias

Hacen falta antes o durante el arreglo, porque cambian el comportamiento esperado:

| Pregunta | Afecta a |
|---|---|
| ¿Cuál es el importe mínimo válido, 0,01 €? ¿Se rechaza o se redondea un tercer decimal? | D01 |
| ¿Un presupuesto al 100 % exacto está «superado»? | D16 |
| ¿Cambiar de moneda solo cambia el símbolo o convierte los importes? | D07 |
| ¿«Deshacer» tras cargar el ejemplo debe revertir también presupuestos y metas? | D09 |
| ¿Qué muestra el «Importe total» de un lote con ingresos y gastos mezclados? | D06 |
| ¿Dos metas pueden llamarse igual? Hoy, crear una con el mismo nombre sobrescribe la existente sin avisar | D03 |
| ¿«Borrar todos los datos» debe reiniciar también las preferencias (moneda, tema…)? Hoy las reinicia y el diálogo no lo dice | — |

---

## D08 · Crítica · La importación acepta datos inválidos y corrompe los totales

**Pasos:**
1. Con la app sin datos, ir a Ajustes › «Importar copia».
2. Elegir un archivo con este contenido:
   `{"movimientos":[{"id":"x1","tipo":"gasto","importe":-999,"fecha":"2026-10-01","categoriaId":"ocio"}]}`

**Esperado:** se rechaza el archivo o ese movimiento, con un aviso comprensible. Los datos existentes no cambian.
**Actual:** aviso «Importados 1 movimientos, 0 presupuestos y 0 metas.». En Inicio, «Gastos» pasa a −880,11 €, «Previsión de cierre» a −5456,68 € y aparece la fila «− -999 €». Se comprobó con una copia con datos previos.

**También se acepta** (mismo archivo cambiando el campo): `"importe": 0`, `"tipo": "regalo"` y `"categoriaId": "no-existe"`. Solo se rechaza `"importe": "abc"` y los movimientos sin `fecha`.

**Impacto:** la importación es la única vía de restaurar una copia de seguridad, y un solo registro estropea todas las cifras.
**Causa probable:** `importarTodo` (`js/db.js`) solo comprueba que `fecha` exista e `importe` sea finito. No exige `importe > 0`, ni `tipo` ∈ {gasto, ingreso, ahorro}, ni una categoría del catálogo.
**Verificación:** 4 tests `@bug-D08` en `copias.spec.ts`.

## D03 · Alta · Renombrar una meta crea una meta nueva

**Pasos:**
1. Plan › Metas › «Nueva meta»: nombre «Viaje QA», objetivo 1000. Crear.
2. En esa meta, pulsar «Editar», cambiar el nombre a «Viaje QA 2» y pulsar «Guardar cambios».

**Esperado:** una sola meta, ahora llamada «Viaje QA 2», con sus aportaciones.
**Actual:** hay dos metas, «Viaje QA» y «Viaje QA 2». Las aportaciones se quedan en la antigua.

**Impacto:** duplica metas y desvincula el progreso.
**Causa probable:** `guardarMetaDesdeFormulario` (`js/app.js`) decide si es una edición buscando una meta con el mismo nombre (`estado.metas.find(m => m.nombre.toLowerCase() === nombre.toLowerCase())`), no por el id de la meta que se está editando. Al cambiar el nombre no la encuentra y crea otra. Por el mismo motivo, crear una meta con un nombre existente sobrescribe la otra sin avisar.
**Verificación:** `metas.spec.ts` › «renombrar una meta la modifica sin crear otra».

## D02 · Alta · Los formularios de meta y presupuesto pierden lo escrito

**Pasos:**
1. Plan › Metas › «Nueva meta». Escribir el nombre «Viaje QA» y pulsar «Crear meta» sin objetivo.
2. Aparece el aviso «El objetivo debe ser mayor que cero.».

**Esperado:** la hoja conserva «Viaje QA».
**Actual:** el campo de nombre queda vacío. Con los presupuestos pasa igual: se elige «Ocio», se pulsa «Crear presupuesto» sin límite y la categoría vuelve a «Supermercado».
**También ocurre sin hacer nada:** el formulario se vacía cuando caduca un aviso anterior (5 s) o cuando la app termina de arrancar y vuelve a pintar la pantalla.

**Impacto:** pérdida silenciosa de datos escritos. Afecta con seguridad a metas y presupuestos; se infiere que también a «Aportar», sin reproducirlo.
**Causa probable:** `pintar()` (`js/app.js`) vuelve a generar toda la pantalla en cada aviso. Las hojas de meta, presupuesto y aportación se abren con `abrirHoja(titulo, contenido)`, que guarda el HTML inicial como una cadena fija, así que se repintan vacías. La hoja de alta de movimientos no tiene el problema porque usa `render()` y sincroniza lo escrito en `estado`.
**Verificación:** `metas.spec.ts` y `presupuestos.spec.ts`, tests `@bug-D02`.

## D05 · Alta · El ahorro manual no deja elegir meta

**Pasos:**
1. Crear la meta «Viaje».
2. ＋ Añadir movimiento › «A mano» › tipo «Ahorro» › abrir «Asignar a meta».

**Esperado:** el desplegable ofrece «Sin meta» y «Viaje».
**Actual:** solo «Sin meta».

**Impacto:** el ahorro solo se puede vincular a una meta con «Aportar».
**Causa probable:** `panelManual()` (`js/vistas/alta.js`) llama a `formularioMovimiento` con `metas: []`.
**Verificación:** `alta-manual.spec.ts` › «un ahorro registrado a mano se puede asignar a una meta».

## D01 · Media · Un importe de 0,001 se guarda como 0 €

**Pasos:** ＋ Añadir movimiento › «A mano», importe `0,001` › «Guardar movimiento».
**Esperado:** aviso «El importe tiene que ser un número mayor que cero.» (o redondeo al céntimo, según la decisión de producto).
**Actual:** aviso «Gasto de 0 € guardado.» y un movimiento de 0 €.
**Causa probable:** `guardarDesdeFormulario` valida `importe > 0` y después redondea a 2 decimales. Debería validar el valor ya redondeado.
**Verificación:** `alta-manual.spec.ts` › «un importe por debajo del céntimo se rechaza».

## D04 · Media · «Ya tengo ahorrado» acepta negativos

**Pasos:** Plan › Metas › «Nueva meta»: nombre «Viaje», objetivo 1000, «Ya tengo ahorrado» `-50`.
**Esperado:** se rechaza con un aviso.
**Actual:** se crea, con «-50 € de 1000 €» y un progreso del −5 %.
**Causa probable:** `guardarMetaDesdeFormulario` valida el objetivo, pero no `inicial >= 0`.
**Verificación:** `metas.spec.ts` › «no se acepta un «ya tengo ahorrado» negativo».

## D06 · Media · El «Importe total» del lote no se recalcula

**Pasos:**
1. En «Escribir», pegar las líneas «Mercadona 45,90 ayer», «Gasolina Repsol 60», «Nómina 1.980» y «Netflix 12,99», y pulsar «Interpretar».
2. Desmarcar la línea «Nómina».

**Esperado:** «Importe total» = 118,89 € (45,90 + 60 + 12,99).
**Actual:** sigue en 2098,89 €. «Seleccionados» y el botón sí cambian a 3.
**Causa probable:** en `revision()` (`js/vistas/alta.js`) el total suma `b.lista` sin filtrar por `incluir` y sin distinguir ingresos de gastos.
**Verificación:** `alta-texto.spec.ts` › «al desmarcar una línea el importe total se recalcula».

## D07 · Media · Al cambiar de moneda quedan importes en «€»

**Pasos:** con un gasto guardado, Ajustes › Moneda › «Dólar estadounidense ($)»; ir a Movimientos y abrir el formulario de alta.
**Esperado:** todos los importes en US$.
**Actual:** las tarjetas de totales salen en «US$», pero las filas de la lista, los subtotales por día y el sufijo del formulario siguen en «€».
**Causa probable:** `filaMovimiento` y `listaMovimientos` (`js/componentes.js`) llaman a `moneda(importe)` sin la divisa (por defecto EUR), y el sufijo del formulario es un «€» fijo.
**Nota:** no existe test automatizado todavía (escenario AJU-01, P2).

## D09 · Media · Deshacer los datos de ejemplo deja basura

**Pasos:** en la bienvenida, «Probar con datos de ejemplo» › «Cargar ejemplo» › en el aviso, «Deshacer».
**Esperado:** vuelve el estado vacío anterior.
**Actual:** se borran los 42 movimientos, pero quedan 4 presupuestos y 2 metas (Ajustes: «0 movimientos guardados, 4 presupuestos y 2 metas.»), y Inicio vuelve a la bienvenida.
**Causa probable:** `ultimoGuardado` solo guarda los ids de los movimientos.
**Nota:** sin test automatizado todavía (DEMO-02, P2).

## D13 · Media · «el día 2» no se interpreta como fecha

**Pasos:** en «Escribir», interpretar `Pagué 720 de alquiler el día 2` (es uno de los ejemplos de la propia app).
**Esperado:** fecha del día 2 del mes en curso.
**Actual:** fecha de hoy. Además el comercio sale como «Alquiler Dia».
**Causa probable:** `parsearFecha` (`js/formato.js`) reconoce «hoy», «ayer», «hace N días», nombres de día, «12 de mayo» y fechas numéricas, pero no «el día N».
**Verificación:** `logica-pura.spec.ts` › ««el día 2» fija la fecha en el día 2 del mes».

## D16 · Baja · El presupuesto avisa antes de tiempo

**Pasos:** presupuesto de Supermercado de 100 €. Registrar un gasto de 79,99 €, y en otro caso de 99,99 €.
**Esperado:** 79,99 € sin aviso; 99,99 € aún no «superado».
**Actual:** 79,99 € ya avisa (80 %) y 99,99 € ya figura como «· superado» (100 %).
**Causa probable:** `estadoPresupuestos` (`js/analisis.js`) redondea el porcentaje a una décima y compara el valor redondeado con los umbrales.
**Verificación:** 2 tests `@bug-D16` en `presupuestos.spec.ts`.

## D10 · Baja · El error de importación sale en inglés y técnico

**Pasos:** importar un archivo con el contenido `{ no es json`.
**Esperado:** un mensaje en español, como «El archivo no es una copia válida».
**Actual:** «No se ha podido importar: Expected property name or '}' in JSON at position 2 (line 1 column 3)».
**Causa probable:** `importarArchivo` muestra `e.message` tal cual.
**Verificación:** `copias.spec.ts` › «el error de importación se explica en español».

## D11 · Baja · «Deshacer» sigue visible tras usarlo

**Pasos:** guardar un movimiento a mano y pulsar «Deshacer» en el aviso.
**Esperado:** el aviso desaparece, o el botón deja de mostrarse.
**Actual:** aparece «Se ha deshecho el último guardado.», pero el aviso original conserva «Deshacer» hasta que caduca a los 5 s. No hace nada si se pulsa otra vez.
**Causa probable:** la acción `deshacer-guardado` no retira el aviso que la disparó.
**Verificación:** `movimientos.spec.ts` › «el botón «Deshacer» desaparece una vez usado».

## D12 · Baja · Signo «+» en un día con un gasto de 0 €

**Pasos:** con un único movimiento de gasto de 0 €, mirar la cabecera del día en Movimientos.
**Esperado:** «0 €», o «−» si hay gastos.
**Actual:** «Hoy + 0 €».
**Causa probable:** `listaMovimientos` usa `total >= 0 ? '+' : '−'`, así que un total 0 sale como positivo.
**Nota:** sin test automatizado todavía (LIST-05, P2). Depende de D01.

## D14 · Baja · El foco no vuelve al importe tras un error

**Pasos:** ＋ Añadir movimiento › «A mano» › dejar el importe vacío › «Guardar movimiento».
**Esperado:** el cursor queda en «Importe».
**Actual:** el campo no tiene el foco (`document.activeElement` no es el campo).
**Causa probable:** `guardarDesdeFormulario` llama a `avisar()`, que repinta toda la pantalla, y después enfoca el campo antiguo ya retirado del DOM (`f.querySelector(...).focus()`). Debería enfocar el campo nuevo, buscándolo después del repintado.
**Impacto:** accesibilidad y uso con teclado.
**Verificación:** `alta-manual.spec.ts` › «tras un importe inválido el foco vuelve al importe».

## D15 · Baja · «Asignar a meta» se ve siempre

**Pasos:** ＋ Añadir movimiento › «A mano» con el tipo «Gasto» (el de por defecto).
**Esperado:** el campo «Asignar a meta» solo se ve con el tipo «Ahorro».
**Actual:** se ve también con Gasto e Ingreso (al guardar se descarta).
**Causa probable:** el CSS `.campo { display: grid }` (`estilos.css`) tiene más especificidad que el atributo `hidden`, que es lo que pone la app. Con `.campo[hidden] { display: none }` se resuelve.
**Verificación:** `alta-manual.spec.ts` › ««Asignar a meta» solo aparece para los ahorros».
