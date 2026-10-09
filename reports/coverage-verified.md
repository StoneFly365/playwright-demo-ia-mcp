# Cobertura verificada · finanzas-pareja

Generado por `npm run coverage:map`. No editar a mano.

Nivel de correspondencia: **test-body** (el id está en un comentario dentro de un test que Playwright lista) · **file-only** (la matriz cita un fichero que existe, sin test con el id) · **none**.
Que un test lleve el id no prueba que cubra todos los pasos del escenario: eso lo revisa una persona.

Escenarios: 74 · test-body: 41 · file-only: 0 · none: 33 · con incidencias: 0

| Escenario | Matriz | Nivel | Tests | Incidencias |
|---|---|---|---|---|
| ARR-01 Primer acceso sin datos muestra la bienvenida | AUTOMATED | test-body | arranque-navegacion.spec.ts:6 Arranque y navegación › un usuario nuevo ve la bienvenida con las formas de empezar | — |
| ARR-02 Fallo al abrir el almacenamiento local | NOT AUTOMATED | none | — | — |
| NAV-01 Navegar por todas las secciones | AUTOMATED | test-body | arranque-navegacion.spec.ts:20 Arranque y navegación › el usuario puede recorrer todas las secciones | — |
| NAV-02 Selector de mes compartido | AUTOMATED | test-body | arranque-navegacion.spec.ts:46 Arranque y navegación › el mes elegido se mantiene al cambiar de sección | — |
| NAV-03 Parámetros de URL | NOT AUTOMATED | none | — | — |
| NAV-04 Cerrar hojas y diálogos | NOT AUTOMATED | none | — | — |
| ALTA-01 Alta manual de un gasto válido | AUTOMATED | test-body | alta-manual.spec.ts:29 Alta manual de movimientos › cancelar el alta no guarda nada<br>alta-manual.spec.ts:9 Alta manual de movimientos › el usuario registra un gasto y lo ve reflejado en el mes | — |
| ALTA-02 Validación de importe inválido | AUTOMATED | test-body | alta-manual.spec.ts:39 Alta manual de movimientos › no se puede guardar un importe inválido: ""<br>alta-manual.spec.ts:39 Alta manual de movimientos › no se puede guardar un importe inválido: "-5"<br>alta-manual.spec.ts:39 Alta manual de movimientos › no se puede guardar un importe inválido: "0"<br>alta-manual.spec.ts:39 Alta manual de movimientos › no se puede guardar un importe inválido: "abc"<br>alta-manual.spec.ts:52 Alta manual de movimientos › tras un importe inválido el foco vuelve al importe | — |
| ALTA-03 Límite inferior de importe | AUTOMATED | test-body | alta-manual.spec.ts:64 Alta manual de movimientos › el importe mínimo de un céntimo se guarda<br>alta-manual.spec.ts:72 Alta manual de movimientos › un importe por debajo del céntimo se rechaza | — |
| ALTA-04 Formatos de importe es-ES | AUTOMATED | test-body | alta-manual.spec.ts:85 Alta manual de movimientos › acepta importes con separador de miles y coma decimal<br>logica-pura.spec.ts:16 Interpretación de importes y frases › el importe "1.234,56" se entiende como 1234.56<br>logica-pura.spec.ts:16 Interpretación de importes y frases › el importe "1.500" se entiende como 1500<br>logica-pura.spec.ts:16 Interpretación de importes y frases › el importe "12.50" se entiende como 12.5<br>logica-pura.spec.ts:16 Interpretación de importes y frases › el importe "12.505" se entiende como 12505<br>logica-pura.spec.ts:16 Interpretación de importes y frases › el importe "20 euros" se entiende como 20<br>logica-pura.spec.ts:16 Interpretación de importes y frases › el importe "20€" se entiende como 20<br>logica-pura.spec.ts:16 Interpretación de importes y frases › el importe "45 con 90" se entiende como 45.9 | — |
| ALTA-05 El tipo condiciona categorías y meta | AUTOMATED | test-body | alta-manual.spec.ts:115 Alta manual de movimientos › «Asignar a meta» solo aparece para los ahorros<br>alta-manual.spec.ts:95 Alta manual de movimientos › el tipo elegido decide las categorías disponibles | — |
| ALTA-06 Alta manual de ahorro vinculada a una meta | AUTOMATED | test-body | alta-manual.spec.ts:127 un ahorro registrado a mano se puede asignar a una meta | — |
| ALTA-07 Fecha vacía y fecha futura | NOT AUTOMATED | none | — | — |
| ALTA-08 Textos largos y caracteres especiales | NOT AUTOMATED | none | — | — |
| TXT-01 Interpretar una frase y guardar | AUTOMATED | test-body | alta-texto.spec.ts:11 Alta escribiendo en lenguaje natural › el usuario apunta un gasto escribiendo una frase | — |
| TXT-02 Texto vacío o sin importe | AUTOMATED | test-body | alta-texto.spec.ts:35 Alta escribiendo en lenguaje natural › sin texto no hay nada que interpretar<br>alta-texto.spec.ts:43 Alta escribiendo en lenguaje natural › un texto sin importe se rechaza con una pista | — |
| TXT-03 Detección de tipo, fecha y categoría (tabla) | AUTOMATED | test-body | alta-texto.spec.ts:51 Alta escribiendo en lenguaje natural › una nómina de ejemplo se reconoce como ingreso<br>alta-texto.spec.ts:61 Alta escribiendo en lenguaje natural › un traspaso al fondo de emergencia se reconoce como ahorro<br>logica-pura.spec.ts:23 Interpretación de importes y frases › la frase "Café con leche 1,60 hoy" se interpreta como gasto de 1.6<br>logica-pura.spec.ts:23 Interpretación de importes y frases › la frase "Cobré 150 de un cliente hoy" se interpreta como ingreso de 150<br>logica-pura.spec.ts:23 Interpretación de importes y frases › la frase "Gasté 45,90 en el supermercado ayer con tarjeta" se interpreta como gasto de 45.9<br>logica-pura.spec.ts:23 Interpretación de importes y frases › la frase "Guardé 300 en el fondo de emergencia" se interpreta como ahorro de 300<br>logica-pura.spec.ts:23 Interpretación de importes y frases › la frase "Nómina de mayo 1.980 euros" se interpreta como ingreso de 1980<br>logica-pura.spec.ts:23 Interpretación de importes y frases › la frase "Pagué 720 de alquiler el día 2" se interpreta como gasto de 720<br>logica-pura.spec.ts:32 Interpretación de importes y frases › «el día 2» fija la fecha en el día 2 del mes | — |
| TXT-04 Atajos de teclado del texto | NOT AUTOMATED | none | — | — |
| TXT-05 Corregir la interpretación antes de guardar | NOT AUTOMATED | none | — | — |
| LOTE-01 Interpretar una lista de varias líneas | AUTOMATED | test-body | alta-texto.spec.ts:71 Alta escribiendo en lenguaje natural › el usuario apunta varios movimientos de una vez pegando una lista | — |
| LOTE-02 Desmarcar líneas actualiza el resumen | AUTOMATED | test-body | alta-texto.spec.ts:89 Alta escribiendo en lenguaje natural › al desmarcar una línea cambia el número de movimientos a guardar<br>alta-texto.spec.ts:98 Alta escribiendo en lenguaje natural › al desmarcar una línea el importe total se recalcula | — |
| LOTE-03 Lote sin selección o descartado | NOT AUTOMATED | none | — | — |
| VOZ-01 Navegador sin reconocimiento de voz | NOT AUTOMATED | none | — | — |
| OCR-01 Leer un ticket desde una imagen | NOT AUTOMATED | none | — | — |
| LIST-01 Filtros por tipo y categoría con totales | AUTOMATED | test-body | movimientos.spec.ts:15 Consultar movimientos › los filtros por tipo y categoría recalculan la lista y los totales | — |
| LIST-02 Búsqueda de texto y estado sin resultados | AUTOMATED | test-body | movimientos.spec.ts:46 Consultar movimientos › buscar «500» encuentra Alquiler<br>movimientos.spec.ts:46 Consultar movimientos › buscar «MERCADONA» encuentra Mercadona<br>movimientos.spec.ts:46 Consultar movimientos › buscar «ocio y cultura» encuentra Cine<br>movimientos.spec.ts:55 Consultar movimientos › la búsqueda también encuentra el texto con el que se apuntó<br>movimientos.spec.ts:70 Consultar movimientos › una búsqueda sin resultados ofrece quitar los filtros | — |
| LIST-03 Rangos de fecha y cambio de año | NOT AUTOMATED | none | — | — |
| LIST-04 Quitar filtros | NOT AUTOMATED | none | — | — |
| LIST-05 Agrupación diaria y signos | NOT AUTOMATED | none | — | — |
| DET-01 Ver el detalle de un movimiento | AUTOMATED | test-body | movimientos.spec.ts:82 Gestionar un movimiento › el detalle muestra todos los datos del movimiento | — |
| DET-02 Editar un movimiento | AUTOMATED | test-body | movimientos.spec.ts:117 Gestionar un movimiento › cancelar una edición deja el movimiento como estaba<br>movimientos.spec.ts:98 Gestionar un movimiento › el usuario corrige el importe de un movimiento sin duplicarlo | — |
| DET-03 Duplicar un movimiento | AUTOMATED | test-body | movimientos.spec.ts:130 Gestionar un movimiento › duplicar crea una copia idéntica | — |
| DET-04 Borrar con confirmación | AUTOMATED | test-body | movimientos.spec.ts:142 Gestionar un movimiento › borrar pide confirmación y elimina el movimiento de forma permanente | — |
| UNDO-01 Deshacer el último guardado | AUTOMATED | test-body | metas.spec.ts:117 Metas de ahorro › deshacer una aportación devuelve la meta a su estado anterior<br>movimientos.spec.ts:174 Deshacer el último guardado › deshacer un alta manual la elimina<br>movimientos.spec.ts:186 Deshacer el último guardado › deshacer un lote elimina todos sus movimientos<br>movimientos.spec.ts:198 Deshacer el último guardado › el botón «Deshacer» desaparece una vez usado | — |
| INI-01 KPIs del mes cuadran con los movimientos | AUTOMATED | test-body | inicio.spec.ts:5 Panel del mes › los indicadores del mes cuadran con los movimientos | — |
| INI-02 Mes sin ingresos | AUTOMATED | test-body | inicio.spec.ts:18 Panel del mes › sin ingresos en el mes no se calcula la tasa de ahorro | — |
| INI-03 Variación, media diaria y previsión de cierre | NOT AUTOMATED | none | — | — |
| INI-04 Regla 50/30/20 | NOT AUTOMATED | none | — | — |
| INI-05 Bloques condicionales del panel | NOT AUTOMATED | none | — | — |
| PRE-01 Crear presupuesto y ver el progreso | AUTOMATED | test-body | presupuestos.spec.ts:5 Presupuestos › el usuario pone un límite mensual y ve cuánto lleva gastado | — |
| PRE-02 Validación del límite | AUTOMATED | test-body | presupuestos.spec.ts:23 Presupuestos › no se puede crear un presupuesto con límite ""<br>presupuestos.spec.ts:23 Presupuestos › no se puede crear un presupuesto con límite "-10"<br>presupuestos.spec.ts:23 Presupuestos › no se puede crear un presupuesto con límite "0"<br>presupuestos.spec.ts:23 Presupuestos › no se puede crear un presupuesto con límite "abc" | — |
| PRE-03 Umbrales de estado (80 % y 100 %) | AUTOMATED | test-body | presupuestos.spec.ts:43 Presupuestos › con 100 € gastados de 100 € el presupuesto está superado<br>presupuestos.spec.ts:43 Presupuestos › con 120 € gastados de 100 € el presupuesto está superado<br>presupuestos.spec.ts:43 Presupuestos › con 79.94 € gastados de 100 € el presupuesto está en orden<br>presupuestos.spec.ts:43 Presupuestos › con 80 € gastados de 100 € el presupuesto avisa<br>presupuestos.spec.ts:43 Presupuestos › con 99.94 € gastados de 100 € el presupuesto avisa<br>presupuestos.spec.ts:63 Presupuestos › con 79.99 € de 100 € el presupuesto sigue sin aviso<br>presupuestos.spec.ts:63 Presupuestos › con 99.99 € de 100 € el presupuesto sigue sin superar | — |
| PRE-04 Presupuesto repetido para la misma categoría | AUTOMATED | test-body | presupuestos.spec.ts:80 Presupuestos › crear un presupuesto para una categoría que ya tiene uno lo actualiza | — |
| PRE-05 Editar y quitar un presupuesto | NOT AUTOMATED | none | — | — |
| PRE-06 Sugerencias de presupuesto | NOT AUTOMATED | none | — | — |
| PRE-07 El presupuesto solo cuenta gastos del mes y de su categoría | NOT AUTOMATED | none | — | — |
| PRE-08 El formulario conserva lo escrito tras un aviso | AUTOMATED | test-body | presupuestos.spec.ts:92 Presupuestos › el formulario conserva lo elegido tras un aviso de validación | — |
| MET-01 Crear una meta válida | AUTOMATED | test-body | metas.spec.ts:7 Metas de ahorro › el usuario crea una meta y ve su progreso | — |
| MET-02 Validaciones de la meta | AUTOMATED | test-body | metas.spec.ts:32 Metas de ahorro › no se puede crear una meta con objetivo 0<br>metas.spec.ts:32 Metas de ahorro › no se puede crear una meta con objetivo negativo<br>metas.spec.ts:32 Metas de ahorro › no se puede crear una meta sin nombre<br>metas.spec.ts:32 Metas de ahorro › no se puede crear una meta sin objetivo | — |
| MET-03 El formulario de meta conserva los datos tras un aviso | AUTOMATED | test-body | metas.spec.ts:45 Metas de ahorro › el formulario conserva lo escrito tras un aviso de validación | — |
| MET-04 «Ya tengo ahorrado» fuera de rango | AUTOMATED | test-body | metas.spec.ts:60 Metas de ahorro › no se acepta un «ya tengo ahorrado» negativo<br>metas.spec.ts:79 Metas de ahorro › una meta que ya parte del objetivo aparece conseguida | — |
| MET-05 Aportar a una meta | AUTOMATED | test-body | metas.spec.ts:106 Metas de ahorro › una aportación vacía se rechaza<br>metas.spec.ts:89 Metas de ahorro › el usuario aporta dinero a una meta y queda registrado como ahorro | — |
| MET-06 Renombrar una meta al editarla | AUTOMATED | test-body | metas.spec.ts:130 Metas de ahorro › renombrar una meta la modifica sin crear otra | — |
| MET-07 Meta completada | NOT AUTOMATED | none | — | — |
| MET-08 Borrar una meta con aportaciones | NOT AUTOMATED | none | — | — |
| MET-09 Fecha límite y aviso de riesgo | NOT AUTOMATED | none | — | — |
| MET-10 Crear una meta con un nombre ya existente | NOT AUTOMATED | none | — | — |
| REC-01 Detección de cargos recurrentes | NOT AUTOMATED | none | — | — |
| ANA-01 Análisis con datos y sin datos | NOT AUTOMATED | none | — | — |
| ANA-02 El umbral de gasto hormiga recalcula la tarjeta | NOT AUTOMATED | none | — | — |
| AJU-01 Cambiar la moneda | NOT AUTOMATED | none | — | — |
| AJU-02 Tema claro, oscuro y automático | NOT AUTOMATED | none | — | — |
| BAK-01 Exportar JSON y CSV | AUTOMATED | test-body | copias.spec.ts:7 Copias de seguridad › el usuario exporta sus datos en JSON y en CSV | — |
| BAK-02 Ida y vuelta: exportar, borrar todo e importar | AUTOMATED | test-body | copias.spec.ts:39 Copias de seguridad › una copia exportada restaura los datos tras borrarlo todo | — |
| BAK-03 Importar archivos inválidos | AUTOMATED | test-body | copias.spec.ts:67 Copias de seguridad › importar un archivo con JSON mal formado no cambia los datos<br>copias.spec.ts:67 Copias de seguridad › importar un archivo con movimiento sin fecha no cambia los datos<br>copias.spec.ts:79 Copias de seguridad › el error de importación se explica en español | — |
| BAK-04 Importar importes fuera de rango | AUTOMATED | test-body | copias.spec.ts:96 Copias de seguridad › importar un movimiento con categoría inexistente se rechaza<br>copias.spec.ts:96 Copias de seguridad › importar un movimiento con importe cero se rechaza<br>copias.spec.ts:96 Copias de seguridad › importar un movimiento con importe negativo se rechaza<br>copias.spec.ts:96 Copias de seguridad › importar un movimiento con importe no numérico se rechaza<br>copias.spec.ts:96 Copias de seguridad › importar un movimiento con tipo inexistente se rechaza | — |
| BAK-05 Reimportar el mismo archivo | NOT AUTOMATED | none | — | — |
| BAK-06 Archivo de importación vacío | NOT AUTOMATED | none | — | — |
| DEMO-01 Cargar los datos de ejemplo | AUTOMATED | test-body | datos-ejemplo.spec.ts:5 Datos de ejemplo y borrado total › el usuario carga los datos de ejemplo para probar la app | — |
| DEMO-02 Deshacer la carga de ejemplo | NOT AUTOMATED | none | — | — |
| DEMO-03 Borrar todos los datos | AUTOMATED | test-body | datos-ejemplo.spec.ts:19 Datos de ejemplo y borrado total › borrar todos los datos pide confirmación y deja la app vacía | — |
| PER-01 Los datos y las preferencias sobreviven a una recarga | AUTOMATED | test-body | persistencia.spec.ts:3 los datos y las preferencias siguen ahí al volver a abrir la app | — |
| PER-02 Funcionamiento sin conexión tras la primera visita | NOT AUTOMATED | none | — | — |
| NUBE-01 Estado de sincronización sin cuenta | NOT AUTOMATED | none | — | — |
