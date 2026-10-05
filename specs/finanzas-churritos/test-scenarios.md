# Inventario de escenarios · Mis Finanzas (finanzas-churritos)

**Leyenda de cada escenario:**
- **Prioridad:**
  - P0 = smoke / crítico
  - P1 = funcionalidad crítica
  - P2 = funcionalidad secundaria
  - P3 = casos límite / exploratorios
- **Camino:**
  - ✅ Happy: comportamiento normal.
  - ❌ Negative: entradas o acciones inválidas.
  - ⚠️ Edge: límites.
- **Evidencia:**
  - UI: observado durante el discovery.
  - Código: deducido del código fuente.
  - No verificado: ver `open-questions.md`.
- **Riesgo:** Crítico / Alto / Medio / Bajo.
- **Estado actual:** se indica cuando el escenario **falla hoy** por un defecto conocido (Dxx en `application-map.md` §9).

**Precondición común a todos los escenarios:** contexto de navegador nuevo (IndexedDB vacío), reloj fijado en **2026-10-05 12:00 (Europe/Madrid)** y app abierta en `/`. Solo se indican las precondiciones adicionales.

---

## ARR · Arranque

#### ARR-01 · Primer acceso sin datos muestra la bienvenida
P0 · Functional / UI behaviour · ✅ Happy · Riesgo: Alto · Evidencia: UI
- **Precondiciones:** ninguna adicional.
- **Datos:** —
- **Pasos:**
  1. Abrir `/`.
  2. Esperar a que desaparezca «Cargando tus datos…».
- **Resultado esperado:**
  - Se ve el H2 «Bienvenido a tus finanzas».
  - Están las tarjetas «Foto del ticket», «Dictado» y «A mano».
  - Están los botones «Añadir mi primer movimiento» y «Probar con datos de ejemplo».
  - La cabecera muestra «Inicio» y «Octubre 2026».

#### ARR-02 · Fallo al abrir el almacenamiento local
P2 · Negative / UI behaviour · ❌ Negative · Riesgo: Medio · Evidencia: Código
- **Precondiciones:** `addInitScript` que hace fallar `indexedDB.open`.
- **Datos:** —
- **Pasos:**
  1. Abrir `/`.
  2. Pulsar «Reintentar».
- **Resultado esperado:**
  - Aparece «No se han podido abrir tus datos», con el mensaje de error y la pista sobre el modo privado.
  - Al pulsar «Reintentar» se vuelve a intentar la carga y no se rompe la página.

---

## NAV · Navegación

#### NAV-01 · Navegar por todas las secciones
P0 · Navigation · ✅ Happy · Riesgo: Alto · Evidencia: UI
- **Precondiciones:** datos `mes-basico`.
- **Datos:** —
- **Pasos:**
  1. En la navigation «Secciones», pulsar Movimientos, Plan, Análisis e Inicio.
  2. Pulsar ⚙️ «Ajustes» en la cabecera.
- **Resultado esperado:**
  - El título de la cabecera cambia a la sección correspondiente.
  - El botón activo tiene `aria-current="true"`.
  - Cada vista muestra su contenido característico.

#### NAV-02 · Selector de mes compartido
P1 · Navigation / State transition · ✅ Happy · Riesgo: Medio · Evidencia: UI
- **Precondiciones:** datos `tres-meses`.
- **Datos:** —
- **Pasos:**
  1. En Inicio, pulsar «Mes anterior».
  2. Ir a Movimientos y comprobar el mes.
  3. Pulsar el mes actual.
- **Resultado esperado:**
  - El mes («Septiembre 2026») se comparte entre Inicio, Movimientos, Plan y Análisis.
  - Los datos mostrados son los de ese mes.
  - Al pulsar el mes actual se vuelve a «Octubre 2026».

#### NAV-03 · Parámetros de URL
P2 · Navigation · ⚠️ Edge · Riesgo: Bajo · Evidencia: UI
- **Precondiciones:** ninguna adicional.
- **Datos:** `?accion=movimientos`, `?accion=alta`, `?accion=plan`, `?accion=xyz`.
- **Pasos:** abrir cada URL.
- **Resultado esperado:**
  - `?accion=movimientos` abre Movimientos.
  - `?accion=alta` abre el dialog «Nuevo movimiento».
  - `?accion=plan` abre Plan.
  - Un valor desconocido abre Inicio.

#### NAV-04 · Cerrar hojas y diálogos
P2 · UI behaviour · ✅ Happy · Riesgo: Bajo · Evidencia: UI (Escape) + Código
- **Precondiciones:** un movimiento guardado.
- **Datos:** —
- **Pasos:**
  1. Abrir el detalle del movimiento, pulsar Borrar (se abre el alertdialog) y pulsar Escape.
  2. Pulsar Escape otra vez.
  3. Abrir de nuevo la hoja y cerrarla con ✕ «Cerrar».
  4. Abrirla otra vez y cerrarla haciendo clic en el fondo.
- **Resultado esperado:**
  - El primer Escape cierra solo el diálogo y la hoja sigue abierta.
  - El segundo Escape cierra la hoja.
  - ✕ y el clic en el fondo también cierran la hoja.
  - No se borra nada.

---

## ALTA · Alta manual de movimientos

#### ALTA-01 · Alta manual de un gasto válido
P0 · Functional · ✅ Happy · Riesgo: Crítico · Evidencia: UI + Código
- **Precondiciones:** ninguna adicional.
- **Datos:** Gasto 12,50 €, «Supermercado», comercio «Mercadona», Tarjeta.
- **Pasos:**
  1. Pulsar ＋ «Añadir movimiento» y elegir la pestaña «A mano».
  2. Rellenar los datos y pulsar «Guardar movimiento».
- **Resultado esperado:**
  - La hoja se cierra y aparece el aviso «Gasto de 12,50 € guardado.» con el botón «Deshacer».
  - Inicio muestra Gastos 12,50 € y Movimientos 1.
  - El movimiento sale en «Últimos movimientos» y en Movimientos (grupo «Hoy»).
  - «Cancelar» en lugar de guardar no crea nada.

#### ALTA-02 · Validación de importe inválido
P1 · Validation · ❌ Negative · Riesgo: Alto · Evidencia: UI
- **Precondiciones:** ninguna adicional.
- **Datos:** `""`, `"0"`, `"-5"`, `"abc"`.
- **Pasos:** en «A mano», escribir cada valor y pulsar «Guardar movimiento».
- **Resultado esperado:**
  - Aparece el aviso «El importe tiene que ser un número mayor que cero.».
  - La hoja sigue abierta y el foco vuelve a Importe.
  - No se crea ningún movimiento.

#### ALTA-03 · Límite inferior de importe
P1 · Boundary · ⚠️ Edge · Riesgo: Alto · Evidencia: UI · **Estado actual: FALLA (D01)**
- **Precondiciones:** ninguna adicional.
- **Datos:** `0,001`, `0,004`, `0,005`, `0,01`.
- **Pasos:** guardar cada valor.
- **Resultado esperado:**
  - Los valores por debajo de 0,01 se rechazan con el aviso de importe.
  - 0,005 se redondea a 0,01, o se rechaza: regla por confirmar (OQ-07).
  - 0,01 se guarda como 0,01 €.
  - Nunca se persiste un movimiento de 0 €.

#### ALTA-04 · Formatos de importe es-ES
P1 · Boundary / Data integrity · ⚠️ Edge · Riesgo: Alto · Evidencia: Código + UI (1.000, 150,5)
- **Precondiciones:** ninguna adicional.
- **Datos (entrada → número):**
  - `1.234,56` → 1234,56
  - `12.50` → 12,5
  - `1.500` → 1500
  - `12.505` → 12505
  - `20€` → 20
  - `20 euros` → 20
  - `45 con 90` → 45,9
- **Pasos:** comprobar con `aNumero` en el navegador (tabla de datos) y guardar por la interfaz un subconjunto representativo.
- **Resultado esperado:** el importe guardado coincide con la tabla, y el formulario y la lista lo muestran con coma decimal.

#### ALTA-05 · El tipo condiciona categorías y meta
P1 · UI behaviour / State transition · ✅ Happy · Riesgo: Medio · Evidencia: UI
- **Precondiciones:** ninguna adicional.
- **Datos:** —
- **Pasos:** en «A mano», alternar entre Gasto, Ingreso y Ahorro.
- **Resultado esperado:**
  - Gasto habilita 24 categorías, Ingreso 7 y Ahorro 6. La categoría seleccionada siempre pertenece al tipo activo.
  - «Asignar a meta» solo es visible con Ahorro.
  - Lo ya escrito (importe, comercio) se conserva al cambiar de tipo.

#### ALTA-06 · Alta manual de ahorro vinculada a una meta
P1 · Functional / Data integrity · ✅ Happy · Riesgo: Alto · Evidencia: UI · **Estado actual: FALLA (D05)**
- **Precondiciones:** la meta «Viaje» existe.
- **Datos:** Ahorro 100 €, meta «Viaje».
- **Pasos:**
  1. En «A mano», elegir el tipo Ahorro.
  2. Abrir «Asignar a meta», elegir «Viaje» y guardar.
- **Resultado esperado:**
  - El desplegable lista «Sin meta» y todas las metas.
  - El movimiento se guarda con `metaId`.
  - La meta suma 100 € a su aportado.

#### ALTA-07 · Fecha vacía y fecha futura
P2 · Boundary · ⚠️ Edge · Riesgo: Medio · Evidencia: Código
- **Precondiciones:** ninguna adicional.
- **Datos:** fecha vacía; fecha 2026-10-25 (futura).
- **Pasos:** guardar un gasto válido con cada fecha.
- **Resultado esperado:**
  - Con la fecha vacía, se guarda con la fecha de hoy (2026-10-05).
  - Con la fecha futura, se aplica la regla que se confirme (OQ-08). Si se acepta, la «Previsión de cierre» no debe dispararse por movimientos aún no ocurridos.

#### ALTA-08 · Textos largos y caracteres especiales
P2 · Negative / Security · ❌ Negative · Riesgo: Medio · Evidencia: Código
- **Precondiciones:** ninguna adicional.
- **Datos:**
  - comercio `<img src=x onerror=alert(1)>`
  - nota de 500 caracteres
  - comercio con emojis y tildes «Cafetería Ñandú ☕»
- **Pasos:** guardar los movimientos y abrir su detalle.
- **Resultado esperado:**
  - El texto se muestra literal (escapado). No se ejecuta script ni aparece ningún diálogo.
  - El diseño no se rompe.
  - La búsqueda encuentra «ñandú» sin distinguir mayúsculas.

---

## TXT · Alta por texto

#### TXT-01 · Interpretar una frase y guardar
P0 · Functional · ✅ Happy · Riesgo: Crítico · Evidencia: UI
- **Precondiciones:** ninguna adicional.
- **Datos:** «Gasté 45,90 en el supermercado ayer con tarjeta».
- **Pasos:**
  1. Abrir «Escribir», escribir la frase y pulsar Enter.
  2. En «Revisa y confirma», pulsar «Guardar movimiento».
- **Resultado esperado:**
  - La revisión muestra «Interpretación clara · 98 %», el tipo Gasto, el importe «45,9», la fecha 2026-10-04, la categoría Supermercado y la forma de pago Tarjeta.
  - Al guardar, el movimiento tiene origen «texto» y se ve el texto original en el detalle.

#### TXT-02 · Texto vacío o sin importe
P1 · Validation · ❌ Negative · Riesgo: Medio · Evidencia: UI
- **Precondiciones:** ninguna adicional.
- **Datos:** `""`; «hola mundo».
- **Pasos:** pulsar «Interpretar» con cada texto.
- **Resultado esperado:**
  - Con el texto vacío: aviso «Escribe algo primero.».
  - Sin importe: aviso de error «No he reconocido ningún importe. Prueba con «Gasté 45,90 en el supermercado ayer».».
  - En ambos casos no se abre la revisión.

#### TXT-03 · Detección de tipo, fecha y categoría (tabla)
P1 · Data integrity · ⚠️ Edge · Riesgo: Alto · Evidencia: Código + UI (frase de TXT-01)
- **Precondiciones:** ninguna adicional.
- **Datos (frase → resultado):**
  - «Nómina de mayo 1.980 euros» → Ingreso, 1980, Nómina
  - «Guardé 300 en el fondo de emergencia» → Ahorro, 300
  - «Pagué 720 de alquiler el día 2» → Gasto, 720, Vivienda
  - «Café con leche 1,60 hoy» → Gasto, 1,6, hoy
  - «Cobré 150 de un cliente hoy» → Ingreso, 150
- **Pasos:** interpretar cada frase y comprobar el borrador. Se puede hacer con `parsearMovimiento` en el navegador y validar 2 frases por la interfaz.
- **Resultado esperado:** el tipo, el importe, la fecha y la categoría coinciden con la tabla.

#### TXT-04 · Atajos de teclado del texto
P2 · UI behaviour · ✅ Happy · Riesgo: Bajo · Evidencia: UI (Enter) + Código
- **Precondiciones:** ninguna adicional.
- **Datos:** dos líneas.
- **Pasos:**
  1. Escribir una línea y pulsar Shift+Enter.
  2. Escribir la segunda línea y pulsar Enter.
- **Resultado esperado:**
  - Shift+Enter inserta un salto de línea y no interpreta.
  - Enter interpreta y abre la revisión de 2 movimientos.

#### TXT-05 · Corregir la interpretación antes de guardar
P2 · State transition · ✅ Happy · Riesgo: Medio · Evidencia: Código
- **Precondiciones:** la revisión de TXT-01 está abierta.
- **Datos:** importe 50; categoría «Restaurantes y bares».
- **Pasos:**
  1. Cambiar el importe y la categoría.
  2. Esperar a que aparezca o caduque un aviso.
  3. Guardar.
- **Resultado esperado:** los cambios sobreviven al repintado y el movimiento se guarda con 50 € y la categoría Restaurantes.

---

## LOTE · Alta de varios movimientos

#### LOTE-01 · Interpretar una lista de varias líneas
P1 · Functional · ✅ Happy · Riesgo: Alto · Evidencia: UI
- **Precondiciones:** ninguna adicional.
- **Datos:** «Mercadona 45,90 ayer / Gasolina Repsol 60 / Nómina 1.980 / Netflix 12,99 / linea sin importe» (una línea por movimiento).
- **Pasos:**
  1. Pegar la lista y pulsar «Interpretar».
  2. Pulsar «Guardar 4 movimientos».
- **Resultado esperado:**
  - La revisión dice «He encontrado 5 movimientos».
  - La línea sin importe aparece desmarcada (0 €) y la nómina como ingreso.
  - Aparece el aviso «Guardados 4 movimientos.» con «Deshacer».

#### LOTE-02 · Desmarcar líneas actualiza el resumen
P1 · UI behaviour / Data integrity · ⚠️ Edge · Riesgo: Medio · Evidencia: UI · **Estado actual: FALLA (D06)**
- **Precondiciones:** la revisión de LOTE-01 está abierta.
- **Datos:** desmarcar «Nómina».
- **Pasos:** desmarcar la línea.
- **Resultado esperado:**
  - «Seleccionados» pasa a 3 y el botón a «Guardar 3 movimientos».
  - El «Importe total» se recalcula solo con las líneas marcadas y no mezcla ingresos con gastos (regla de presentación: OQ-09).

#### LOTE-03 · Lote sin selección o descartado
P2 · Negative · ❌ Negative · Riesgo: Bajo · Evidencia: Código
- **Precondiciones:** la revisión de LOTE-01 está abierta.
- **Datos:** —
- **Pasos:**
  1. Desmarcar todas las líneas y pulsar Guardar.
  2. Pulsar «Descartar».
- **Resultado esperado:**
  - Al guardar sin selección: aviso «No has seleccionado ningún movimiento.».
  - «Descartar» cierra la hoja sin guardar nada.

---

## VOZ · Dictado

#### VOZ-01 · Navegador sin reconocimiento de voz
P3 · Negative / UI behaviour · ❌ Negative · Riesgo: Bajo · Evidencia: Código
- **Precondiciones:** `addInitScript` que elimina `SpeechRecognition` y `webkitSpeechRecognition`.
- **Datos:** chip «Gasté 30 en el cine ayer».
- **Pasos:**
  1. Abrir la pestaña «Dictar».
  2. Pulsar el chip.
- **Resultado esperado:**
  - Aparece el aviso «Tu navegador no permite dictar por voz…» y el micrófono está deshabilitado.
  - El chip sigue funcionando: abre la revisión con un Gasto de 30 € (Ocio).

---

## OCR · Foto del ticket

#### OCR-01 · Leer un ticket desde una imagen
P2 · Functional · ✅ Happy · Riesgo: Medio · Evidencia: No verificado
- **Precondiciones:** acceso al CDN del motor de OCR e imagen fixture de un ticket nítido.
- **Datos:** `ticket-mercadona.jpg` (fixture que habrá que crear).
- **Pasos:**
  1. En «Foto», usar «Elegir una imagen» con `setInputFiles`.
  2. Esperar a «Ticket leído…».
  3. Pulsar «Interpretar el ticket».
- **Resultado esperado:**
  - Se ve la vista previa y el texto leído con su fiabilidad.
  - La revisión trae el importe total, la fecha y el comercio del ticket.
  - Con una imagen sin texto: aviso «No he podido leer texto en esa foto…».

---

## LIST · Listado y filtros

#### LIST-01 · Filtros por tipo y categoría con totales
P1 · Functional / Data integrity · ✅ Happy · Riesgo: Alto · Evidencia: UI
- **Precondiciones:** datos `mes-basico`.
- **Datos:** —
- **Pasos:**
  1. En Movimientos, alternar Todos / Gastos / Ingresos / Ahorro.
  2. Elegir la categoría «Supermercado».
- **Resultado esperado:**
  - La lista muestra solo los movimientos que encajan.
  - Las tarjetas Movimientos, Ingresos, Gastos y Balance cuadran con la lista visible.
  - El pie «N días con actividad · media…» es coherente.

#### LIST-02 · Búsqueda de texto y estado sin resultados
P1 · Functional · ✅ / ❌ · Riesgo: Medio · Evidencia: UI
- **Precondiciones:** datos `mes-basico`.
- **Datos:** «netflix», «combustible» (nombre de categoría), «45.9», «45,90», «zzz».
- **Pasos:** escribir cada término en el buscador.
- **Resultado esperado:**
  - La búsqueda no distingue mayúsculas y encuentra por comercio, categoría, importe y texto original.
  - «zzz» muestra «Nada por aquí» y el botón «Quitar filtros».

#### LIST-03 · Rangos de fecha y cambio de año
P2 · Functional / Boundary · ⚠️ Edge · Riesgo: Medio · Evidencia: UI (mes) + Código (año)
- **Precondiciones:** movimientos el 2025-12-31, el 2026-01-01 y el 2026-10-05.
- **Datos:** —
- **Pasos:** probar «Solo este mes», «Todo el año» y «Todo el historial» moviendo el mes a enero de 2026.
- **Resultado esperado:**
  - «Todo el año» en enero de 2026 incluye el 1 de enero y excluye el 31 de diciembre de 2025.
  - «Todo el historial» lo incluye todo.

#### LIST-04 · Quitar filtros
P2 · State transition · ✅ Happy · Riesgo: Bajo · Evidencia: UI
- **Precondiciones:** filtros activos (tipo, categoría y texto).
- **Datos:** —
- **Pasos:** pulsar «Quitar filtros».
- **Resultado esperado:** el tipo vuelve a «Todos», la categoría a «Todas», el texto queda vacío y el rango pasa a «Todo el historial» (comportamiento observado; confirmar en OQ-10).

#### LIST-05 · Agrupación diaria y signos
P2 · UI behaviour / Data integrity · ⚠️ Edge · Riesgo: Bajo · Evidencia: UI · **Estado actual: FALLA (D12)**
- **Precondiciones:** gastos e ingresos en varios días, un día con solo un gasto de 0,01 €, y movimientos de ayer y de un día anterior.
- **Datos:** —
- **Pasos:** revisar las cabeceras de los grupos.
- **Resultado esperado:**
  - Las cabeceras son «Hoy», «Ayer» y «Jueves, 1 de octubre».
  - El subtotal del día es ingresos − gastos (el ahorro no cuenta).
  - Un día con solo gastos muestra «−».
  - Cada fila lleva el signo de su tipo: −, + o →.

---

## DET · Detalle, edición, duplicado y borrado

#### DET-01 · Ver el detalle de un movimiento
P1 · Functional · ✅ Happy · Riesgo: Medio · Evidencia: UI
- **Precondiciones:** un movimiento con todos los campos (comercio, forma de pago, nota).
- **Datos:** —
- **Pasos:** pulsar la fila.
- **Resultado esperado:**
  - El dialog lleva como título el comercio.
  - Se ven el importe con signo, la categoría, Fecha, Comercio, Tipo, Forma de pago, Nota y Origen.
  - Están los botones Borrar, Duplicar y Editar.

#### DET-02 · Editar un movimiento
P0 · Functional / Data integrity · ✅ Happy · Riesgo: Crítico · Evidencia: UI
- **Precondiciones:** un gasto de 12,99 € (Netflix).
- **Datos:** nuevo importe 15,49.
- **Pasos:**
  1. Abrir el detalle y pulsar Editar.
  2. Cambiar el importe y pulsar Guardar.
  3. Repetir, pero pulsando Cancelar en vez de Guardar.
- **Resultado esperado:**
  - El formulario «Editar movimiento» aparece precargado.
  - Al guardar: aviso «Gasto de 15,49 € actualizado.», sigue habiendo **un solo** movimiento y su id y su origen se conservan.
  - Al cancelar, el original no cambia.

#### DET-03 · Duplicar un movimiento
P1 · Functional · ✅ Happy · Riesgo: Medio · Evidencia: UI
- **Precondiciones:** un gasto (Netflix 12,99).
- **Datos:** —
- **Pasos:** en el detalle, pulsar Duplicar.
- **Resultado esperado:**
  - Aparece el aviso «Movimiento duplicado.».
  - Hay dos movimientos idénticos con id distinto y los totales se duplican.

#### DET-04 · Borrar con confirmación
P0 · Functional / State transition · ✅ / ❌ · Riesgo: Crítico · Evidencia: UI
- **Precondiciones:** dos movimientos.
- **Datos:** —
- **Pasos:**
  1. En el detalle, pulsar Borrar y luego Cancelar.
  2. Pulsar Borrar otra vez y confirmar con Borrar.
- **Resultado esperado:**
  - El alertdialog dice «¿Borrar el movimiento?» / «Esta acción no se puede deshacer.».
  - Cancelar no cambia nada.
  - Confirmar muestra el aviso «Movimiento borrado.», el movimiento desaparece de todas las vistas y los totales se recalculan.
  - El movimiento sigue sin aparecer tras recargar.

---

## UNDO · Deshacer

#### UNDO-01 · Deshacer el último guardado
P1 · Functional / State transition · ✅ Happy · Riesgo: Alto · Evidencia: UI (aportación) + Código
- **Precondiciones:** ninguna adicional.
- **Datos:** un alta manual, un lote de 3 y una aportación a una meta.
- **Pasos:** tras cada guardado, pulsar «Deshacer» en el aviso.
- **Resultado esperado:**
  - Aparece el aviso «Se ha deshecho el último guardado.».
  - Se elimina exactamente lo guardado (1, 3 y 1 movimientos) y los totales vuelven al estado anterior.
  - El botón «Deshacer» ya usado deja de mostrarse. Hoy no lo cumple (D11, confirmado en la revisión QA).

---

## INI · Inicio (panel del mes)

#### INI-01 · KPIs del mes cuadran con los movimientos
P0 · Data integrity · ✅ Happy · Riesgo: Crítico · Evidencia: UI
- **Precondiciones:** datos `mes-basico`: ingreso 2000; gastos 500, 100 y 50; ahorro 300.
- **Datos:** —
- **Pasos:** abrir Inicio.
- **Resultado esperado:**
  - Ingresos 2000 €, Gastos 650 €, Ahorro registrado 300 €.
  - Tasa de ahorro 68 %: (2000 − 650) / 2000.
  - «Has guardado 1350 €», Movimientos 5.
  - Patrimonio = ingresos − gastos de todo el historial.

#### INI-02 · Mes sin ingresos
P1 · Boundary · ⚠️ Edge · Riesgo: Medio · Evidencia: UI
- **Precondiciones:** solo gastos en el mes.
- **Datos:** —
- **Pasos:** abrir Inicio.
- **Resultado esperado:**
  - El anillo muestra «—» y aparece «Sin ingresos este mes».
  - Aparece el consejo «No hay ingresos registrados este mes».
  - No se ve la tarjeta «Regla 50 / 30 / 20».

#### INI-03 · Variación, media diaria y previsión de cierre
P2 · Data integrity · ⚠️ Edge · Riesgo: Medio · Evidencia: UI (con datos de ejemplo)
- **Precondiciones:** datos `tres-meses` y reloj fijo el día 5.
- **Datos:** —
- **Pasos:**
  1. Leer «Gasto diario medio», «Previsión de cierre» y ▲/▼ en el mes actual.
  2. Ir al mes anterior y leer los mismos datos.
- **Resultado esperado:**
  - En el mes actual: media = gastos / días transcurridos y previsión = media × días del mes.
  - En un mes pasado: previsión = gasto real.
  - La variación coincide con el mes anterior.
  - Comportamiento a confirmar con movimientos futuros: OQ-08.

#### INI-04 · Regla 50/30/20
P2 · Data integrity · ✅ Happy · Riesgo: Bajo · Evidencia: Código
- **Precondiciones:** ingresos 1000; gastos Vivienda 400 (esencial) y Ocio 200 (no esencial).
- **Datos:** —
- **Pasos:** revisar la tarjeta «Regla 50 / 30 / 20».
- **Resultado esperado:** Necesidades 40 %, Deseos 20 % y Ahorro 40 % (frente a los ideales 50/30/20).

#### INI-05 · Bloques condicionales del panel
P2 · UI behaviour · ⚠️ Edge · Riesgo: Bajo · Evidencia: UI + Código
- **Precondiciones:** 6 presupuestos, 4 metas (1 completada) y 7 movimientos en el mes.
- **Datos:** —
- **Pasos:** revisar Inicio.
- **Resultado esperado:**
  - Como mucho 4 presupuestos y 3 metas, sin la completada.
  - 5 «Últimos movimientos» y 3 consejos.
  - La proyección anual solo aparece con 2 o más meses de ahorro.

---

## PRE · Presupuestos

#### PRE-01 · Crear presupuesto y ver el progreso
P0 · Functional · ✅ Happy · Riesgo: Alto · Evidencia: UI
- **Precondiciones:** gasto de Supermercado 45,90 € en el mes.
- **Datos:** Supermercado, límite 100.
- **Pasos:**
  1. En Plan › Presupuestos, pulsar «Nuevo presupuesto».
  2. Rellenar los datos y pulsar «Crear presupuesto».
- **Resultado esperado:**
  - Aparece el aviso «Presupuesto de Supermercado: 100 € al mes.».
  - La tarjeta muestra «45,90 € / 100 €» y 46 %.
  - El resumen muestra Presupuestado, Gastado y Margen 54,10 €.
  - El presupuesto aparece en Inicio.

#### PRE-02 · Validación del límite
P1 · Validation · ❌ Negative · Riesgo: Medio · Evidencia: UI (vacío) + Código
- **Precondiciones:** ninguna adicional.
- **Datos:** `""`, `0`, `-10`, `abc`.
- **Pasos:** pulsar «Crear presupuesto» con cada valor.
- **Resultado esperado:** aviso «Escribe un límite mayor que cero.» y no se crea nada.

#### PRE-03 · Umbrales de estado (80 % y 100 %)
P1 · Boundary / State transition · ⚠️ Edge · Riesgo: Alto · Evidencia: UI (92 %, 100 %)
- **Precondiciones:** presupuesto de Supermercado de 100 €.
- **Datos:** gastos acumulados 79,99 / 80 / 99,99 / 100 / 120.
- **Pasos:** registrar los gastos de forma progresiva.
- **Resultado esperado:**
  - Por debajo del 80 %: estado ok, sin aviso.
  - Del 80 % al 99,99 %: aviso ⚠️ «X: N % del límite, quedan Y € (Z € al día)».
  - Al 100 % o más: 🚨 y «· superado».
  - Inicio muestra el consejo «N presupuesto superado».
  - Que el 100 % exacto cuente como superado está por confirmar (OQ-11).
  - Hoy 79,99 € ya avisa y 99,99 € ya figura como superado, porque el porcentaje se redondea antes de comparar (D16). Los tests automatizados usan además 79,94 € y 99,94 € para cubrir la regla sin el efecto del redondeo.

#### PRE-04 · Presupuesto repetido para la misma categoría
P1 · Data integrity · ⚠️ Edge · Riesgo: Medio · Evidencia: UI
- **Precondiciones:** ya existe un presupuesto de Supermercado de 50 €.
- **Datos:** Supermercado, 45,90.
- **Pasos:** crear un «Nuevo presupuesto» con la misma categoría.
- **Resultado esperado:** sigue habiendo un solo presupuesto de Supermercado, con el límite actualizado a 45,90 €.

#### PRE-05 · Editar y quitar un presupuesto
P2 · Functional · ✅ Happy · Riesgo: Medio · Evidencia: UI + Código
- **Precondiciones:** un presupuesto y sus gastos.
- **Datos:** nuevo límite 200.
- **Pasos:**
  1. Pulsar Editar, comprobar la categoría, cambiar el límite y pulsar «Guardar cambios».
  2. Pulsar Editar, Borrar y luego «Quitar».
- **Resultado esperado:**
  - En la edición, la categoría está deshabilitada y se ve «Para cambiar de categoría…».
  - El límite se actualiza.
  - Al quitarlo: alertdialog «¿Quitar el presupuesto?», aviso «Presupuesto eliminado.» y los movimientos siguen intactos.

#### PRE-06 · Sugerencias de presupuesto
P2 · Functional · ✅ Happy · Riesgo: Bajo · Evidencia: UI
- **Precondiciones:** datos `tres-meses` sin presupuestos.
- **Datos:** —
- **Pasos:** pulsar «Crear X €» en una sugerencia.
- **Resultado esperado:**
  - La sugerencia muestra la «media» de 3 meses.
  - El formulario se abre con la categoría y el límite precargados.
  - Al crear, la sugerencia desaparece de la lista.

#### PRE-07 · El presupuesto solo cuenta gastos del mes y de su categoría
P2 · Data integrity · ⚠️ Edge · Riesgo: Medio · Evidencia: Código
- **Precondiciones:**
  - Presupuesto de Supermercado de 100 €.
  - Gasto de Supermercado de 30 € este mes.
  - Gasto de Supermercado de 50 € el mes anterior.
  - Ingreso «Devoluciones» de 20 €.
  - Ahorro de 40 €.
- **Datos:** —
- **Pasos:** revisar el presupuesto en el mes actual y en el anterior.
- **Resultado esperado:** muestra 30 € este mes y 50 € el mes anterior. Ni los ingresos ni el ahorro cuentan.

#### PRE-08 · El formulario conserva lo escrito tras un aviso
P1 · UI behaviour / Regression · ❌ Negative · Riesgo: Alto · Evidencia: Código (mismo mecanismo que D02) · **Estado actual: probable FALLO (D02)**
- **Precondiciones:** ninguna adicional.
- **Datos:** categoría Ocio; límite vacío y después 60.
- **Pasos:**
  1. Elegir Ocio y pulsar Crear (salta el aviso).
  2. Esperar 5 s.
  3. Escribir 60 y pulsar Crear.
- **Resultado esperado:**
  - La categoría Ocio sigue seleccionada tras el aviso y su caducidad.
  - Se crea el presupuesto de Ocio, no el de la primera categoría.

---

## MET · Metas de ahorro

#### MET-01 · Crear una meta válida
P0 · Functional · ✅ Happy · Riesgo: Alto · Evidencia: UI
- **Precondiciones:** ninguna adicional.
- **Datos:** «Viaje», objetivo «1.000», ya ahorrado 200, icono ✈️.
- **Pasos:**
  1. En Plan › Metas, pulsar «Nueva meta».
  2. Rellenar los datos y pulsar «Crear meta».
- **Resultado esperado:**
  - Aparece el aviso «Meta «Viaje» guardada.».
  - La tarjeta muestra ✈️ «200 € de 1000 €» y «Faltan 800 €».
  - El resumen muestra 20 % del objetivo.
  - La meta aparece en Inicio.

#### MET-02 · Validaciones de la meta
P1 · Validation · ❌ Negative · Riesgo: Medio · Evidencia: UI
- **Precondiciones:** ninguna adicional.
- **Datos:** nombre vacío; objetivo vacío, 0 o −5.
- **Pasos:** pulsar «Crear meta» con cada combinación.
- **Resultado esperado:**
  - Sin nombre: aviso «Ponle un nombre a la meta.».
  - Con objetivo inválido: aviso «El objetivo debe ser mayor que cero.».
  - No se crea nada.

#### MET-03 · El formulario de meta conserva los datos tras un aviso
P1 · UI behaviour / Regression · ❌ Negative · Riesgo: Alto · Evidencia: UI · **Estado actual: FALLA (D02)**
- **Precondiciones:** ninguna adicional.
- **Datos:** nombre «Viaje QA», sin objetivo.
- **Pasos:**
  1. Escribir el nombre y pulsar «Crear meta» (salta el aviso de objetivo).
  2. Leer los campos.
  3. Esperar 5 s y volver a leerlos.
- **Resultado esperado:** el nombre «Viaje QA» sigue escrito tras el aviso y tras su caducidad.

#### MET-04 · «Ya tengo ahorrado» fuera de rango
P1 · Boundary · ❌ Negative · Riesgo: Medio · Evidencia: UI · **Estado actual: FALLA (D04)**
- **Precondiciones:** ninguna adicional.
- **Datos:** inicial −50; inicial 1500 con objetivo 1000.
- **Pasos:** crear la meta con cada valor.
- **Resultado esperado:**
  - El inicial negativo se rechaza con un aviso, y nunca se ve un progreso negativo.
  - Con el inicial mayor que el objetivo, la meta queda completada al 100 % («¡Conseguido! 🎉»).

#### MET-05 · Aportar a una meta
P0 · Functional / Data integrity · ✅ / ❌ · Riesgo: Crítico · Evidencia: UI
- **Precondiciones:** la meta «Viaje» (0 de 1000) existe.
- **Datos:** importe vacío; después 150,5.
- **Pasos:**
  1. Pulsar Aportar con el importe vacío.
  2. Escribir 150,5 y pulsar Aportar.
- **Resultado esperado:**
  - Con el importe vacío: aviso «Escribe un importe mayor que cero.».
  - Con 150,5: aviso «150,50 € añadidos a la meta.», la tarjeta muestra «150,50 € de 1000 €» y el ritmo «A este ritmo, N meses».
  - Se crea un movimiento de Ahorro vinculado (🎯 meta) con la fecha de hoy.

#### MET-06 · Renombrar una meta al editarla
P1 · Data integrity · ⚠️ Edge · Riesgo: Crítico · Evidencia: UI · **Estado actual: FALLA (D03)**
- **Precondiciones:** la meta «Viaje QA» existe y tiene una aportación.
- **Datos:** nuevo nombre «Viaje QA 2».
- **Pasos:** pulsar Editar, cambiar el nombre y pulsar «Guardar cambios».
- **Resultado esperado:**
  - Sigue existiendo **una sola** meta, ahora con el nombre «Viaje QA 2».
  - Conserva su id, sus aportaciones y su progreso.

#### MET-07 · Meta completada
P2 · Boundary / State transition · ⚠️ Edge · Riesgo: Medio · Evidencia: Código
- **Precondiciones:** la meta tiene 900 de 1000.
- **Datos:** aportaciones de 99,99 y después de 0,01.
- **Pasos:** aportar los dos importes.
- **Resultado esperado:**
  - Con 999,99 la meta sigue en curso.
  - Con 1000 aparece «¡Conseguido! 🎉», la barra al 100 % y la meta desaparece de Inicio.

#### MET-08 · Borrar una meta con aportaciones
P2 · Data integrity · ✅ Happy · Riesgo: Medio · Evidencia: Código
- **Precondiciones:** la meta tiene 2 aportaciones.
- **Datos:** —
- **Pasos:** pulsar Editar, Borrar y confirmar con Borrar.
- **Resultado esperado:**
  - El alertdialog «¿Borrar la meta?» explica que las aportaciones se conservan.
  - Aparece el aviso «Meta eliminada.».
  - Los 2 movimientos de ahorro siguen existiendo, sin 🎯 meta.

#### MET-09 · Fecha límite y aviso de riesgo
P3 · Edge · ⚠️ Edge · Riesgo: Bajo · Evidencia: Código
- **Precondiciones:** meta de 1000 con fecha límite a 2 meses y una aportación de 50 al mes.
- **Datos:** —
- **Pasos:** revisar la tarjeta de la meta.
- **Resultado esperado:** aparece «para AAAA-MM-DD» y el aviso «⚠️ A este ritmo no llegarás a la fecha límite.».

#### MET-10 · Crear una meta con un nombre ya existente
P3 · Edge · ⚠️ Edge · Riesgo: Medio · Evidencia: Código
- **Precondiciones:** la meta «Viaje» (objetivo 1000) existe.
- **Datos:** nueva meta «viaje», objetivo 500.
- **Pasos:** crearla.
- **Resultado esperado:** lo que se acuerde en OQ-12. Hoy el código **sobrescribe** la existente sin avisar. Mínimo: avisar o rechazar el duplicado.

---

## REC · Recurrentes

#### REC-01 · Detección de cargos recurrentes
P2 · Functional / Data integrity · ✅ Happy · Riesgo: Medio · Evidencia: UI
- **Precondiciones:** datos `tres-meses`.
- **Datos:** —
- **Pasos:**
  1. Abrir Plan › Recurrentes.
  2. Pulsar «Ver movimientos» de Netflix.
- **Resultado esperado:**
  - Aparecen Alquiler, Basic Fit, Netflix, Spotify y Repsol con su «/mes», su coste anual, «mensual · 3 veces» y «Próximo: …».
  - «Ver movimientos» lleva a Movimientos con la búsqueda «Netflix» y el rango «Todo el historial».
  - Que el ahorro cuente como recurrente está por confirmar (OQ-13).
  - Sin repeticiones: «Sin cargos repetidos detectados».

---

## ANA · Análisis

#### ANA-01 · Análisis con datos y sin datos
P2 · Data integrity / UI behaviour · ✅ Happy · Riesgo: Medio · Evidencia: UI
- **Precondiciones:** primero sin datos; después con `tres-meses`.
- **Datos:** —
- **Pasos:** abrir Análisis en cada estado.
- **Resultado esperado:**
  - Sin datos: «Aún no hay nada que analizar».
  - Con datos: las 12 tarjetas listadas en el mapa.
  - Los KPIs anuales cuadran: Ingresos 2026 = 6090 €, Gastos 2026 = 3667,18 €, Ahorro del año 2422,82 € (39,8 %).

#### ANA-02 · El umbral de gasto hormiga recalcula la tarjeta
P3 · Functional · ⚠️ Edge · Riesgo: Bajo · Evidencia: Código
- **Precondiciones:** gastos de 4, 6, 9 y 12 € en el mes.
- **Datos:** umbral 10, después 5.
- **Pasos:**
  1. Revisar «Gasto hormiga» con el umbral a 10.
  2. Cambiar el umbral en Ajustes a 5 y volver a revisar.
- **Resultado esperado:**
  - Con 10: 3 gastos que suman 19 €.
  - Con 5: 1 gasto de 4 €.
  - El slider muestra el valor en moneda («5 €»).

---

## AJU · Ajustes

#### AJU-01 · Cambiar la moneda
P2 · Functional / UI behaviour · ⚠️ Edge · Riesgo: Medio · Evidencia: UI · **Estado actual: FALLA (D07)**
- **Precondiciones:** datos `mes-basico`.
- **Datos:** USD.
- **Pasos:**
  1. En Ajustes › Moneda, elegir «Dólar estadounidense ($)».
  2. Revisar Inicio, Movimientos y el formulario de alta.
- **Resultado esperado:**
  - **Todos** los importes se formatean en US$: KPIs, filas, cabeceras de día, sufijo del formulario y detalle.
  - No hay conversión de valores (OQ-14).

#### AJU-02 · Tema claro, oscuro y automático
P3 · UI behaviour · ✅ Happy · Riesgo: Bajo · Evidencia: UI
- **Precondiciones:** `colorScheme: 'light'` en el contexto.
- **Datos:** —
- **Pasos:**
  1. Pulsar 3 veces «Cambiar de tema».
  2. Elegir «Oscuro» en Ajustes y recargar.
- **Resultado esperado:**
  - Con las pulsaciones, `html[data-tema]` cicla según auto → claro → oscuro y el icono alterna 🌙 / ☀️.
  - Tras recargar se mantiene el tema oscuro.

---

## BAK · Copias de seguridad

#### BAK-01 · Exportar JSON y CSV
P1 · Functional · ✅ Happy · Riesgo: Alto · Evidencia: UI
- **Precondiciones:** datos `mes-basico`.
- **Datos:** —
- **Pasos:** pulsar «Exportar copia (JSON)», «CSV estándar» y «CSV para Excel».
- **Resultado esperado:**
  - Se descargan `finanzas-2026-10-05.json`, `finanzas-2026-10-05.csv` y `finanzas-excel-2026-10-05.csv`.
  - El JSON tiene `aplicacion: "Mis Finanzas"`, `formato: 2` y todos los movimientos, presupuestos y metas.
  - El CSV de Excel usa «;», coma decimal y BOM. El estándar usa «,» y punto decimal.
  - Las filas van ordenadas por fecha.

#### BAK-02 · Ida y vuelta: exportar, borrar todo e importar
P0 · Data integrity · ✅ Happy · Riesgo: Crítico · Evidencia: Parcial (exportar e importar se verificaron por separado)
- **Precondiciones:** datos `mes-basico` con un presupuesto y una meta con aportación.
- **Datos:** —
- **Pasos:**
  1. Exportar el JSON.
  2. Borrar todos los datos.
  3. Importar el fichero exportado.
- **Resultado esperado:**
  - Aparece el aviso «Importados N movimientos, 1 presupuestos y 1 metas.».
  - Los KPIs, la lista, el presupuesto y la meta (con su progreso) quedan idénticos a los de antes de borrar.

#### BAK-03 · Importar archivos inválidos
P1 · Negative · ❌ Negative · Riesgo: Alto · Evidencia: UI
- **Precondiciones:** datos `mes-basico`.
- **Datos:** `{ no es json`; `{"movimientos":[{"importe":10}]}` (sin fecha).
- **Pasos:** importar cada archivo.
- **Resultado esperado:**
  - Aparece un aviso de error comprensible en español (D10 para el JSON roto) o «Hay movimientos con datos incompletos.».
  - Los datos existentes no cambian.

#### BAK-04 · Importar importes fuera de rango
P1 · Negative / Data integrity · ❌ Negative · Riesgo: **Crítico** · Evidencia: UI · **Estado actual: FALLA (D08)**
- **Precondiciones:** datos `mes-basico`.
- **Datos:** movimientos con importe −999, 0, `"abc"`, y con tipo o categoría inexistentes.
- **Pasos:** importar cada archivo y revisar Inicio y Movimientos.
- **Resultado esperado:**
  - Los registros inválidos se rechazan, ya sea el archivo completo o línea a línea con un aviso.
  - Los KPIs nunca muestran gastos negativos ni previsiones negativas.

#### BAK-05 · Reimportar el mismo archivo
P2 · Data integrity · ⚠️ Edge · Riesgo: Medio · Evidencia: UI
- **Precondiciones:** un archivo ya importado.
- **Datos:** el mismo archivo.
- **Pasos:** importarlo otra vez.
- **Resultado esperado:** no se duplican movimientos (los ids coinciden) y el recuento de «Tus datos» no cambia.

#### BAK-06 · Archivo de importación vacío
P2 · Negative · ⚠️ Edge · Riesgo: Bajo · Evidencia: UI
- **Precondiciones:** ninguna adicional.
- **Datos:** `{}`.
- **Pasos:** importarlo.
- **Resultado esperado:** según OQ-15. Hoy el resultado es «Importados 0 movimientos, 0 presupuestos y 0 metas.» como éxito. Lo esperable es avisar de que el archivo no contiene datos de Mis Finanzas.

---

## DEMO · Datos de ejemplo y borrado total

#### DEMO-01 · Cargar los datos de ejemplo
P1 · Functional · ✅ Happy · Riesgo: Medio · Evidencia: UI
- **Precondiciones:** ninguna adicional.
- **Datos:** —
- **Pasos:**
  1. En la bienvenida, pulsar «Probar con datos de ejemplo».
  2. Confirmar con «Cargar ejemplo».
- **Resultado esperado:**
  - El alertdialog anuncia «3 meses… 4 presupuestos y 2 metas».
  - Aparece el aviso «Cargados 42 movimientos de ejemplo.».
  - Ajustes muestra «42 movimientos guardados, 4 presupuestos y 2 metas.».

#### DEMO-02 · Deshacer la carga de ejemplo
P2 · State transition · ⚠️ Edge · Riesgo: Medio · Evidencia: UI · **Estado actual: FALLA (D09)**
- **Precondiciones:** DEMO-01 recién ejecutado.
- **Datos:** —
- **Pasos:** pulsar «Deshacer» en el aviso.
- **Resultado esperado:** se revierte todo lo cargado: 0 movimientos, 0 presupuestos y 0 metas.

#### DEMO-03 · Borrar todos los datos
P0 · Functional / Data integrity · ✅ / ❌ · Riesgo: Crítico · Evidencia: UI
- **Precondiciones:** datos `tres-meses`.
- **Datos:** —
- **Pasos:**
  1. En Ajustes, pulsar «Borrar todos los datos» y luego Cancelar.
  2. Repetir y confirmar con «Borrar todo».
  3. Recargar.
- **Resultado esperado:**
  - Cancelar no borra nada.
  - Al confirmar: aviso «Se han borrado todos los datos.», recuento «0 movimientos guardados, 0 presupuestos y 0 metas.» e Inicio en la bienvenida.
  - Tras recargar sigue vacío.
  - Que también se reinicien las preferencias está por confirmar (OQ-16).

---

## PER · Persistencia

#### PER-01 · Los datos y las preferencias sobreviven a una recarga
P0 · Data integrity · ✅ Happy · Riesgo: Crítico · Evidencia: UI
- **Precondiciones:** un movimiento, un presupuesto, una meta, moneda USD y tema oscuro.
- **Datos:** —
- **Pasos:** recargar la página y abrir una pestaña nueva en el mismo contexto.
- **Resultado esperado:** todo se mantiene: recuentos, importes, moneda y tema.

#### PER-02 · Funcionamiento sin conexión tras la primera visita
P3 · Regression · ⚠️ Edge · Riesgo: Medio · Evidencia: No verificado
- **Precondiciones:** proyecto con el service worker permitido y una primera carga completa.
- **Datos:** —
- **Pasos:**
  1. Activar `context.setOffline(true)`.
  2. Recargar.
  3. Crear un movimiento.
- **Resultado esperado:** la app carga desde la caché y permite registrar y consultar datos sin red.

---

## NUBE · Sincronización (solo la superficie)

#### NUBE-01 · Estado de sincronización sin cuenta
P3 · Navigation / UI behaviour · ✅ Happy · Riesgo: Bajo · Evidencia: UI
- **Precondiciones:** ninguna adicional.
- **Datos:** —
- **Pasos:**
  1. Pulsar 📴 «Estado de la sincronización».
  2. Pulsar «Conectar la nube».
  3. Pulsar «Seguir sin cuenta (solo en este dispositivo)».
- **Resultado esperado:**
  - La hoja «Sincronización» muestra «📴 Solo en este dispositivo», Cuenta «sin cuenta» y Hogar «sin hogar».
  - «Conectar la nube» muestra el formulario con «URL del proyecto» y «Clave pública (anon key)».
  - «Seguir sin cuenta» vuelve a Inicio con el aviso «Seguirás solo en este dispositivo…».

---

## Resumen

| Prioridad | Nº | IDs |
|---|---|---|
| **P0** | 13 | ARR-01, NAV-01, ALTA-01, TXT-01, DET-02, DET-04, INI-01, PRE-01, MET-01, MET-05, BAK-02, DEMO-03, PER-01 |
| **P1** | 28 | NAV-02, ALTA-02…06, TXT-02, TXT-03, LOTE-01, LOTE-02, LIST-01, LIST-02, DET-01, DET-03, UNDO-01, INI-02, PRE-02, PRE-03, PRE-04, PRE-08, MET-02, MET-03, MET-04, MET-06, BAK-01, BAK-03, BAK-04, DEMO-01 |
| **P2** | 26 | ARR-02, NAV-03, NAV-04, ALTA-07, ALTA-08, TXT-04, TXT-05, LOTE-03, OCR-01, LIST-03, LIST-04, LIST-05, INI-03, INI-04, INI-05, PRE-05, PRE-06, PRE-07, MET-07, MET-08, REC-01, ANA-01, AJU-01, BAK-05, BAK-06, DEMO-02 |
| **P3** | 7 | VOZ-01, MET-09, MET-10, ANA-02, AJU-02, PER-02, NUBE-01 |
| **Total** | **74** | |

**Por camino:**
- ✅ Happy puro: 33.
- ❌ Negative: 13.
- ⚠️ Edge: 24.
- Mixtos ✅/❌: 4 (LIST-02, DET-04, MET-05, DEMO-03).

**Escenarios que hoy fallan, total o parcialmente, por defectos confirmados:** ALTA-02 (D14), ALTA-03 (D01), ALTA-05 (D15), ALTA-06 (D05), TXT-03 (D13), LOTE-02 (D06), LIST-05 (D12), PRE-03 (D16), PRE-08 (D02), MET-03 (D02), MET-04 (D04), MET-06 (D03), AJU-01 (D07), BAK-03 (D10), BAK-04 (D08), UNDO-01 (D11) y DEMO-02 (D09). Actualizado tras la revisión QA del 2026-10-05.
