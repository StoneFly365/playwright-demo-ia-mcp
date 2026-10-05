# Mapa funcional · Mis Finanzas (finanzas-churritos)

- **URL:** https://finanzas-churritos.netlify.app/
- **Fecha del discovery:** 2026-10-05 (mes en curso de la app: «Octubre 2026»)
- **Método:** exploración real con Playwright MCP (Chromium, escritorio) y lectura del código fuente público que sirve el sitio (`/js/*.js`). Cada dato indica su origen:
  - **[UI]**: observado en la interfaz durante la exploración.
  - **[Código]**: deducido del código fuente servido, sin ejercitarlo en la interfaz.
  - **[No verificado]**: no se ha podido comprobar (ver `open-questions.md`).
- **Estado final:** todos los datos creados durante la exploración se borraron con «Borrar todos los datos». La app quedó vacía.

---

## 1. Tecnología

| Aspecto | Observación | Origen |
|---|---|---|
| Framework | Ninguno. JavaScript vanilla con módulos ES (`js/app.js` y 20 módulos). No hay React, Vue, Angular ni Svelte. | [UI] + [Código] |
| Renderizado | SPA de una sola página (`index.html`). Cada cambio de estado **repinta todo** `#app` con `innerHTML`. | [Código] |
| Enrutado | No hay rutas por URL. La vista vive en el estado interno (`estado.vista`). Solo hay parámetros `?accion=` y `?demo=1`. | [UI] + [Código] |
| Persistencia | IndexedDB `finanzas` (versión 2). Almacenes: `movimientos`, `presupuestos`, `metas`, `ajustes`, `interno`. Los borrados son lógicos: dejan una lápida `borradoEn`. | [UI] + [Código] |
| Backend | No tiene backend propio. Durante la exploración no hubo peticiones a APIs; solo estáticos y el script de Netlify. Hay una sincronización opcional con un proyecto **Supabase** que configura el usuario. | [UI] |
| PWA | Tiene `manifest.webmanifest` (atajos `?accion=alta` y `?accion=movimientos`) y un service worker `sw.js` que cachea la app y el CDN. | [UI] + [Código] |
| OCR | Tesseract (WebAssembly), descargado del CDN la primera vez. | [Código] |
| Voz | Web Speech API del navegador. | [Código] |
| Hosting | Netlify. Inserta un iframe «Powered by Netlify». | [UI] |
| Consola | No hubo errores ni avisos en toda la sesión. | [UI] |

---

## 2. Estructura de pantallas

No hay rutas: todo cuelga de `/`. Las rutas inexistentes (por ejemplo `/ruta-que-no-existe`) devuelven **200** y cargan la app en Inicio. [UI]

```
Cabecera (siempre visible)
├── Título de la vista + mes seleccionado («Octubre 2026»)
├── 📴 «Estado de la sincronización» → hoja «Sincronización»
├── 🌙/☀️ «Cambiar de tema» (cicla auto → claro → oscuro)
└── ⚙️ «Ajustes» → vista Ajustes

Contenido (main#contenido)
├── Inicio            (bienvenida si no hay movimientos)
├── Movimientos
├── Plan              (pestañas: Presupuestos · Metas · Recurrentes)
├── Análisis
└── Ajustes

Barra inferior: navigation «Secciones»
├── Inicio · Movimientos · ＋ «Añadir movimiento» · Plan · Análisis

Capas superpuestas
├── Hoja inferior (role=dialog, aria-label = título): alta, edición, detalle, formularios
├── Diálogo de confirmación (role=alertdialog)
└── Avisos flotantes (role=status), duran 5 s y algunos llevan «Deshacer»
```

### Parámetros de URL [UI]

| URL | Efecto |
|---|---|
| `?accion=movimientos` / `plan` / `analisis` / `inicio` | Abre esa vista |
| `?accion=alta` | Abre la hoja «Nuevo movimiento» |
| `?accion=<otro>` | Ignorado, abre Inicio |
| `?demo=1` | Carga los datos de ejemplo si no hay movimientos [Código] |

---

## 3. Inventario por pantalla

### 3.1 Inicio

**Sin movimientos: bienvenida** [UI]
- H2 «Bienvenido a tus finanzas» y el texto «Todo se guarda en este dispositivo. Sin cuentas, sin nube, sin publicidad.»
- Tres tarjetas: «Foto del ticket», «Dictado», «A mano».
- Botones «Añadir mi primer movimiento» y «Probar con datos de ejemplo».
- Desplegable «¿Cómo protege mis datos?».
- La bienvenida sale aunque existan presupuestos o metas: depende **solo** de que haya movimientos. [UI]

**Con movimientos** [UI]
- Selector de mes: «Mes anterior» ◀, mes actual (vuelve a hoy) y «Mes siguiente» ▶.
- Aviso de proyección: «🔮 A tu ritmo actual (X €/mes…) acabarías el año con Y €». Solo aparece con 2 o más meses de ahorro positivo. [Código]
- Anillo con la tasa de ahorro (% o «—» sin ingresos) y el texto «Has guardado X €», «Déficit de X €» o «Sin ingresos este mes».
- KPIs Ingresos, Gastos (con variación ▲/▼ frente al mes anterior) y «Ahorro registrado».
- Tira de datos: «Gasto diario medio», «Previsión de cierre», «Movimientos», «Patrimonio».
- Tarjetas «Para ahorrar más» (3 consejos), «Presupuestos» (hasta 4, botón «Gestionar»), «¿En qué se ha ido el dinero?» (donut de hasta 8 categorías), «Metas de ahorro» (hasta 3 sin completar), «Regla 50 / 30 / 20» (solo con ingresos) y «Últimos movimientos» (5 del mes).

### 3.2 Hoja «Nuevo movimiento» (alta)

Tiene cuatro pestañas: ⌨️ Escribir · 🎤 Dictar · 📷 Foto · ✍️ A mano. Recuerda la última pestaña usada durante la sesión. [UI]

**Escribir** [UI]
- Textarea `#texto-alta`, placeholder «Gasté 45,90 en el supermercado ayer con tarjeta».
- Chips de ejemplo: «Gasté 45,90 en el supermercado ayer con tarjeta», «Nómina de mayo 1.980 euros», «Café con leche 1,60 hoy», «Guardé 300 en el fondo de emergencia», «Pagué 720 de alquiler el día 2».
- Desplegable «¿Tienes una lista? Pega varios movimientos» con el botón «Probar con esta lista».
- Botón «✨ Interpretar». Enter interpreta y Shift+Enter hace salto de línea.

**Dictar** [Código]: botón de micrófono, estado «Pulsa y di tu movimiento» / «Escuchando…», transcripción, chips («Gasté 30 en el cine ayer», «Cobré 150 de un cliente hoy», «Aporté 200 al fondo indexado») y «Interpretar lo dictado», deshabilitado sin texto. Si el navegador no lo soporta: «Tu navegador no permite dictar por voz…».

**Foto** [Código]: «Hacer una foto» (`input file capture=environment`), «Elegir una imagen», casilla «Forzar blanco y negro», texto leído con su fiabilidad y «Interpretar el ticket».

**A mano: formulario de movimiento** (`form#form-movimiento novalidate`) [UI]

| Campo | Control | Reglas observadas |
|---|---|---|
| Tipo | Segmentado Gasto / Ingreso / Ahorro (`aria-pressed`) | Filtra las categorías: 24 de gasto, 7 de ingreso y 6 de ahorro |
| Importe | `input text inputmode=decimal`, placeholder «0,00», sufijo «€» | Obligatorio y > 0. Admite formato es-ES («1.000» = 1000, «150,5» = 150,50) |
| Fecha | `input date` | Por defecto hoy. Si se vacía, se guarda hoy [Código] |
| Categoría | `select` con optgroups | Solo están habilitadas las del tipo activo |
| Comercio o concepto | `input text`, placeholder «Mercadona, nómina, alquiler…» | Opcional |
| Forma de pago | `select` | Sin especificar, Efectivo, Tarjeta, Bizum, Transferencia, Domiciliado, PayPal, Apple Pay, Google Pay, Cheque |
| Asignar a meta | `select` | Debería verse solo con Ahorro, pero se ve siempre (D15). **En «A mano» solo ofrece «Sin meta»** (ver D05) |
| Nota (opcional) | `textarea` | Opcional |
| Botones | «Cancelar» y «✓ Guardar movimiento» | |

**Revisión** («Revisa y confirma», tras interpretar) [UI]
- Un movimiento: el mismo formulario precargado, más la barra de confianza («Interpretación clara · 98 %»), avisos y «Texto original interpretado».
- Varios movimientos: lista con casillas, la frase «He encontrado N movimientos…», los totales «Seleccionados» e «Importe total», y los botones «Descartar» y «✓ Guardar N movimientos». Las líneas sin importe aparecen desmarcadas, con 0 €.

### 3.3 Movimientos [UI]
- Selector de mes.
- Buscador (`searchbox`, placeholder «Buscar comercio, nota o importe…»). Busca en comercio, nota, nombre de categoría, importe y texto original.
- Segmentado «Tipo de movimiento»: Todos / Gastos / Ingresos / Ahorro.
- `combobox` «Filtrar por categoría» y `combobox` «Rango de fechas» («Solo este mes» por defecto, «Todo el año», «Todo el historial»).
- Tarjeta de totales: Movimientos, Ingresos, Gastos, Balance.
- Lista agrupada por día («Hoy», «Ayer», «Jueves, 1 de octubre») con el subtotal del día. Cada fila muestra el icono de categoría, el comercio (o la categoría), la categoría, la forma de pago, 🎯 meta, el icono de origen y el importe con signo (−, + o →).
- Pie: «N días con actividad · media de X € de gasto al día».
- Estados vacíos: «Nada por aquí» con el texto «Todavía no has registrado ningún movimiento.» y «Añadir el primero», o «No hay movimientos que encajen con estos filtros…» y «Quitar filtros». «Quitar filtros» pone el rango en **«Todo el historial»**.

### 3.4 Detalle de movimiento (hoja con el título del comercio) [UI]
- Importe con signo, categoría y lista de datos: Fecha, Comercio, Tipo, Forma de pago, Meta, Nota, Origen. Desplegable «Texto original».
- Botones Borrar (abre el alertdialog «¿Borrar el movimiento?» / «Esta acción no se puede deshacer.»), Duplicar y Editar (abre la hoja «Editar movimiento»).

### 3.5 Plan [UI]
Pestañas (`tablist`): Presupuestos · Metas · Recurrentes. Sin presupuestos ni metas aparece además la tarjeta «Cómo funciona».

**Presupuestos**
- Botón «＋ Nuevo presupuesto». Hoja con «Categoría» (24 de gasto) y «Límite mensual», y el texto «Se reinicia cada mes. Cuando llegues al 80 % te lo recordaré en Inicio.»
- Avisos: «⚠️ X: 92 % del límite, quedan 4,10 € (0,15 € al día)» y «🚨 X: 100 % del límite, quedan 0 €».
- Resumen: anillo «% del total», «Presupuestado», «Gastado», «Margen».
- Cada presupuesto: «gastado / límite», barra, «N %», «· superado» y «previsión X €» o «quedan X €», más el botón «Editar».
- Edición: la categoría está deshabilitada («Para cambiar de categoría, crea otro presupuesto y borra este.»), con los botones Borrar (alertdialog «¿Quitar el presupuesto?» / «Los movimientos no se borran.») y «Guardar cambios».
- «Sugerencias» (media de los últimos 3 meses, botón «Crear X €») y «Sin límite» («Poner límite»).

**Metas**
- «＋ Nueva meta». Hoja «Nueva meta de ahorro» con «¿Para qué ahorras?», «Objetivo», «Ya tengo ahorrado», «Fecha límite (opcional)» y un selector de 10 iconos.
- Tarjeta: icono, nombre, «X € de Y €», barra y «Faltan X €» / «A este ritmo, N meses» / «¡Conseguido! 🎉», con los botones «Aportar» y «Editar».
- Resumen: «% del objetivo», «Objetivo total», «Ya apartado», «Falta».
- «Aportar a {meta}»: Importe, Fecha (hoy), Nota y «✓ Aportar». Crea un movimiento de Ahorro vinculado a la meta.
- La edición de la meta tiene el botón «Borrar» (alertdialog «¿Borrar la meta?»).

**Recurrentes**
- Totales Detectados / Al mes / Al año y una lista de cargos con cadencia, número de veces, coste anual, «Próximo: fecha», «Poner presupuesto a X» y «Ver movimientos» (lleva a Movimientos filtrado por comercio).
- Vacío: «Sin cargos repetidos detectados».

### 3.6 Análisis [UI]
- Vacío: «Aún no hay nada que analizar».
- Con datos: KPIs anuales (Ingresos, Gastos, Ahorro del año, Patrimonio acumulado) y las tarjetas «Cómo evoluciona tu patrimonio», «Evolución mensual», «Reparto del gasto», «Comparado con tu media», «Ritmo de gasto», «Qué días gastas más», «Dónde gastas más», «Gasto hormiga 🐜», «Cargos periódicos», «Regla 50 / 30 / 20», «Si mantienes el ritmo» y «Recomendaciones para {mes}».

### 3.7 Ajustes [UI]
- **Preferencias:** «Moneda» (EUR, USD, GBP, MXN, ARS, COP, CLP, PEN, BRL), «Tema» (Automático / Claro / Oscuro) y «Umbral de «gasto hormiga»» (slider de 3 a 30, 10 por defecto).
- **Nube y hogar:** botón «Conectar con la nube».
- **Foto y voz:** idioma del OCR (7 opciones), idioma del dictado (8 opciones) y «Probar el OCR con un ticket».
- **Tus datos:** el recuento «N movimientos guardados, N presupuestos y N metas.», los botones «Exportar copia (JSON)», «Importar copia», «CSV estándar» y «CSV para Excel», y el uso de disco.
- **Zona delicada:** «Cargar datos de ejemplo» y «Borrar todos los datos».
- **Privacidad**, **Categorías** (24 / 7 / 6, catálogo desplegable) y la versión «Mis Finanzas · versión 1.0 · aplicación local sin conexión».

### 3.8 Nube (Supabase): solo la superficie
- Hoja «Sincronización»: «📴 Solo en este dispositivo», Cuenta «sin cuenta», Hogar «sin hogar», «Sin subir N», «Última vez nunca», y los botones «Ir a Ajustes» y «Conectar la nube». [UI]
- La pantalla de configuración tiene «URL del proyecto» (placeholder `https://tuproyecto.supabase.co`), «Clave pública (anon key)», «Probar la conexión», «Guardar y continuar» y «Seguir sin cuenta (solo en este dispositivo)». [UI]
- Acceso, registro (contraseña de al menos 6), recuperación, crear o unirse a un hogar con código de invitación, sincronización y salir de la cuenta: **[Código] / [No verificado]**.

---

## 4. Mensajes de validación y avisos observados

| Contexto | Disparador | Mensaje exacto | Origen |
|---|---|---|---|
| Movimiento | Importe vacío, 0, negativo o no numérico | «El importe tiene que ser un número mayor que cero.» | [UI] |
| Interpretar texto | Texto vacío | «Escribe algo primero.» | [UI] |
| Interpretar texto | Sin importe reconocible | «No he reconocido ningún importe. Prueba con «Gasté 45,90 en el supermercado ayer».» | [UI] |
| Lote | Ninguna línea seleccionada | «No has seleccionado ningún movimiento.» | [Código] |
| Presupuesto | Límite vacío o ≤ 0 | «Escribe un límite mayor que cero.» | [UI] |
| Meta | Nombre vacío | «Ponle un nombre a la meta.» | [UI] |
| Meta | Objetivo vacío o ≤ 0 | «El objetivo debe ser mayor que cero.» | [UI] |
| Aportación | Importe vacío o ≤ 0 | «Escribe un importe mayor que cero.» | [UI] |
| Importar | JSON roto | «No se ha podido importar: Expected property name or '}' in JSON at position 2 (line 1 column 3)» | [UI] |
| Importar | Movimiento sin fecha | «No se ha podido importar: Hay movimientos con datos incompletos.» | [UI] |
| Foto | OCR sin texto | «No he podido leer texto en esa foto. Prueba con más luz o enfoca mejor.» | [Código] |
| Voz | Sin soporte | «Tu navegador no permite dictar por voz.» | [Código] |
| Nube | Correo o contraseña vacíos | «Rellena el correo y la contraseña.» | [Código] |
| Nube | Contraseña corta | «La contraseña debe tener al menos 6 caracteres.» | [Código] |

**Avisos de éxito observados** [UI]: «Gasto de X € guardado.» / «… actualizado.», «Guardados N movimientos.», «Movimiento duplicado.», «Movimiento borrado.», «Presupuesto de {cat}: X € al mes.», «Meta «{nombre}» guardada.», «X € añadidos a la meta.», «Se ha deshecho el último guardado.», «Cargados 42 movimientos de ejemplo.», «Se han borrado todos los datos.», «Importados N movimientos, N presupuestos y N metas.» y «CSV listo para abrir en tu hoja de cálculo.».

---

## 5. Estados

| Estado | Dónde | Origen |
|---|---|---|
| Carga | «Cargando tus datos…» con spinner, al arrancar | [UI] |
| Error de datos | «No se han podido abrir tus datos» + botón «Reintentar» (IndexedDB bloqueado o modo privado) | [Código] |
| Ocupado | Caja con spinner y barra de progreso (OCR, carga de ejemplo) | [Código] |
| Vacíos | Bienvenida (Inicio), «Nada por aquí» (Movimientos), «Sin presupuestos», «Sin metas todavía», «Sin cargos repetidos detectados», «Aún no hay nada que analizar» | [UI] |
| Presupuesto | ok (< 80 %), aviso (≥ 80 %), excedido (≥ 100 %) | [UI] + [Código] |
| Meta | En curso, completada (≥ 100 %), en riesgo (con fecha límite y ritmo insuficiente) | [Código] |

---

## 6. Modelo de datos (IndexedDB) [UI + Código]

- **Movimiento:** `id` (UUID), `tipo` (gasto | ingreso | ahorro), `importe` (número redondeado a 2 decimales), `fecha` (YYYY-MM-DD), `mes`, `categoriaId`, `comercio`, `metodoPago`, `metaId`, `nota`, `origen` (manual | texto | voz | foto | ejemplo), `textoOriginal`, `creado`, `actualizadoCliente`, `pendiente`, `borradoEn`, `dispositivo`, `creadoPor`.
- **Presupuesto:** `id`, `categoriaId` (único en la práctica: crear otro de la misma categoría actualiza el existente), `limite`.
- **Meta:** `id`, `nombre` (único sin distinguir mayúsculas al crear), `objetivo`, `inicial`, `fechaLimite`, `icono`, `color`.
- **Ajustes:** pares clave/valor: `moneda`, `tema`, `umbralHormiga`, `idiomaOCR`, `idiomaVoz`, `onboardingCompletado`, `saltarCuenta`.
- **Exportación JSON:** `{ aplicacion: "Mis Finanzas", formato: 2, exportado, movimientos, presupuestos, metas, ajustes }`.

---

## 7. Dependencias funcionales entre flujos

```
Movimientos ──► Inicio (KPIs, donut, consejos, últimos)
     │      ──► Presupuestos (solo gastos del mes de la misma categoría)
     │      ──► Metas (ahorro con metaId + «inicial»)
     │      ──► Recurrentes (mismo comercio e importe estable en varios meses)
     │      ──► Análisis (todo)
Metas ──► formulario de movimiento de Ahorro («Asignar a meta») y Aportar
Ajustes.moneda ──► formato de importes (parcial, ver D07)
Ajustes.umbralHormiga ──► Análisis › Gasto hormiga
Exportar ──► Importar (round-trip)
Borrar todo ──► vacía movimientos, presupuestos, metas y también AJUSTES
Datos de ejemplo ──► 42 movimientos de 3 meses, 4 presupuestos, 2 metas; «Deshacer» solo revierte los movimientos
```

**Funcionalidades críticas:** registrar movimientos sin perder datos, que los totales sean correctos (es una app de dinero), la persistencia local (no hay servidor, así que perder IndexedDB es perder todo) y la copia de seguridad export/import (es la única protección del usuario).

---

## 8. Journeys principales

### J1 · Primer uso y primer movimiento
- **Precondiciones:** IndexedDB vacío.
- **Pasos:** bienvenida → «Añadir mi primer movimiento» → rellenar → guardar → Inicio con datos.
- **Resultado esperado:** Inicio sale de la bienvenida y los KPIs reflejan el movimiento.
- **Datos:** un gasto (importe, categoría).
- **Posibles errores:** importe inválido o almacenamiento bloqueado.
- **Casos límite:** importe de 0,001; fecha futura; un movimiento de ahorro solo.
- **Riesgo de regresión:** alto, porque es el punto de entrada de todo usuario.

### J2 · Registro rápido por texto (uno o lote)
- **Precondiciones:** ninguna.
- **Pasos:** Escribir → texto → Interpretar → revisar o corregir → guardar → (Deshacer).
- **Resultado esperado:** se guardan los movimientos interpretados con su tipo, fecha y categoría.
- **Datos:** frases en español con importes en formato es-ES y fechas relativas.
- **Posibles errores:** texto sin importe, líneas sin importe, interpretación errónea.
- **Casos límite:** «1.500» frente a «1,500»; «ayer», «el día 2»; varias líneas con alguna sin importe.
- **Riesgo de regresión:** alto, porque el parser es heurístico y frágil.

### J3 · Consultar y corregir movimientos
- **Precondiciones:** que haya movimientos en varios meses.
- **Pasos:** Movimientos → filtrar o buscar → detalle → Editar / Duplicar / Borrar.
- **Resultado esperado:** la lista y los totales se recalculan; editar no duplica; borrar pide confirmación.
- **Posibles errores:** cancelar a medias, filtros sin resultados.
- **Casos límite:** cambio de mes o de año, búsqueda por importe con coma.
- **Riesgo de regresión:** medio-alto.

### J4 · Controlar el gasto con presupuestos
- **Precondiciones:** gastos en una categoría.
- **Pasos:** Plan › Presupuestos → crear límite → registrar gastos → aviso al 80 % → superado al 100 %.
- **Resultado esperado:** el porcentaje, el estado y los avisos en Plan e Inicio son correctos.
- **Posibles errores:** límite ≤ 0, categoría ya presupuestada.
- **Casos límite:** 79,99 %, 80 % y 100 % exactos; cambio de mes; gastos de otro tipo.
- **Riesgo de regresión:** alto, por los cálculos.

### J5 · Ahorrar para una meta
- **Precondiciones:** ninguna.
- **Pasos:** Plan › Metas → crear → Aportar → ver el progreso → editar → completar.
- **Resultado esperado:** el aportado (inicial más aportaciones) y el porcentaje son correctos; editar modifica la misma meta.
- **Posibles errores:** nombre u objetivo vacíos, aportación ≤ 0.
- **Casos límite:** inicial negativo o mayor que el objetivo, renombrar, nombre repetido, borrar la meta con aportaciones.
- **Riesgo de regresión:** **muy alto**, con tres defectos confirmados (D02, D03, D04).

### J6 · Analizar el mes
- **Precondiciones:** datos de ejemplo.
- **Pasos:** Inicio → Análisis → Plan › Recurrentes.
- **Resultado esperado:** las tarjetas se ven y las cifras cuadran con los movimientos.
- **Casos límite:** mes sin ingresos, movimientos con fecha futura, un solo mes de historial.
- **Riesgo de regresión:** medio. Las cifras son difíciles de validar sin un oráculo.

### J7 · Proteger los datos (copia de seguridad)
- **Precondiciones:** que haya datos.
- **Pasos:** Exportar JSON → Borrar todos los datos → Importar copia.
- **Resultado esperado:** los datos quedan idénticos a los de antes.
- **Posibles errores:** archivo corrupto, incompleto o con valores fuera de rango.
- **Casos límite:** reimportar el mismo archivo, archivo vacío `{}`, importes negativos.
- **Riesgo de regresión:** **muy alto**, porque es la única copia de los datos (D08).

### J8 · Personalizar
- **Pasos:** Ajustes → moneda, tema, umbral → navegar y recargar.
- **Resultado esperado:** la preferencia se aplica en todas las vistas y persiste.
- **Casos límite:** moneda distinta de EUR (D07).
- **Riesgo de regresión:** bajo-medio.

### J9 · Compartir en hogar (Supabase)
- **[No verificado].** Requiere un proyecto de Supabase y cuentas reales. Ver `open-questions.md`.

### J10 · Alta por voz o por foto
- **[No verificado].** Requiere micrófono o un motor de OCR descargado del CDN. Solo se ha visto la superficie de la interfaz.

---

## 9. Defectos detectados durante el discovery

Observados en la UI salvo que se indique otra cosa. Cada escenario de `test-scenarios.md` enlaza al defecto que cubre.

| ID | Severidad | Defecto | Evidencia | Escenario |
|---|---|---|---|---|
| D01 | Media | Un importe de «0,001» pasa la validación (> 0) y se guarda como **0 €**. | Movimiento `importe: 0` en IndexedDB y fila «− 0 €» | ALTA-03 |
| D02 | Alta | Los formularios de las hojas de **meta** y de **presupuesto** pierden todo lo escrito cada vez que la app repinta: al mostrarse o caducar un aviso, y también en el repintado que hace el motor de sincronización al terminar de arrancar. La hoja se repinta con su HTML original. Por el mismo mecanismo se infiere que afecta también a la aportación. | Nombre «Viaje QA» vacío tras el aviso «El objetivo debe ser mayor que cero.». Categoría Ocio que vuelve a Supermercado (confirmado en la automatización) | MET-03, PRE-08 |
| D03 | Alta | **Editar una meta cambiando su nombre crea una meta nueva** y deja la original. | Dos metas en IndexedDB: «Viaje QA» y «Viaje QA 2» | MET-06 |
| D04 | Media | «Ya tengo ahorrado» admite negativos: −50 € da un progreso de «−5 %». | Tarjeta «-50 € de 1000 €» | MET-04 |
| D05 | Alta | En el alta **A mano** de un Ahorro, «Asignar a meta» solo ofrece «Sin meta» aunque haya metas. | Opciones: `["Sin meta"]` con 2 metas creadas | ALTA-06 |
| D06 | Media | En la revisión de un lote, el «Importe total» no cambia al desmarcar líneas y además suma ingresos y gastos juntos. | Total 2098,89 € antes y después de desmarcar la nómina | LOTE-02 |
| D07 | Media | Al cambiar la moneda a USD, los KPIs salen en «US$», pero las filas, las cabeceras de día y el sufijo del formulario siguen en «€». | Totales en «US$» y filas en «€» | AJU-01 |
| D08 | **Crítica** | Importar un JSON con un importe negativo (−999) lo acepta y **corrompe todos los agregados**: «Gastos −880,11 €», «Previsión de cierre −5456,68 €», porcentajes negativos en el donut y la fila «− -999 €». | Captura de Inicio tras importar | BAK-04 |
| D09 | Media | «Deshacer» tras cargar los datos de ejemplo borra los 42 movimientos pero deja 4 presupuestos y 2 metas huérfanos, y Inicio vuelve a la bienvenida. | «0 movimientos guardados, 4 presupuestos y 2 metas.» | DEMO-02 |
| D10 | Baja | El error de importación muestra el mensaje técnico del parser, en inglés. | «Expected property name or '}' in JSON…» | BAK-03 |
| D11 | Baja | El botón «Deshacer» sigue visible en el aviso original después de usarlo, y ya no hace nada, hasta que el aviso caduca a los 5 s. **Confirmado en la revisión QA.** La automatización lo había descartado por error: la aserción esperaba los mismos 5 s que tarda en caducar el aviso. | Sonda inmediata: el botón presente 6/6 veces, en el alta y en la aportación | UNDO-01 |
| D12 | Baja | Un día con un único gasto de 0 € muestra el subtotal «+ 0 €» (signo de ingreso). | Cabecera «Hoy + 0 €» | LIST-05 |

### Defectos encontrados durante la automatización (2026-10-05)

| ID | Severidad | Defecto | Evidencia | Escenario |
|---|---|---|---|---|
| D13 | Media | «el día N» no se interpreta como fecha: «Pagué 720 de alquiler el día 2», **uno de los ejemplos de la propia app**, se guarda con la fecha de hoy. El comercio sale como «Alquiler Dia». | `parsearMovimiento` devuelve `fecha: 2026-10-05` | TXT-03 |
| D14 | Baja | Tras un importe inválido, la app intenta llevar el foco a «Importe», pero lo hace sobre el campo antiguo, ya sustituido por el repintado del aviso. El foco se pierde (accesibilidad y teclado). | `toBeFocused` falla de forma consistente | ALTA-02 |
| D15 | Baja | «Asignar a meta» se ve también con Gasto e Ingreso: el CSS `.campo { display: grid }` anula el atributo `hidden`. Al guardar se descarta, pero confunde. *El discovery lo daba por oculto; era un error de observación.* | `toBeHidden` falla con el tipo Gasto | ALTA-05 |
| D16 | Baja | El porcentaje del presupuesto se redondea a una décima **antes** de compararlo con los umbrales: 79,99 € de 100 € ya avisa (80 %) y 99,99 € ya figura como «superado» (100 %). | Avisos y «· superado» con 79,99 € y 99,99 € | PRE-03 |
