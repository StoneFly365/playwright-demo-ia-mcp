# Preguntas abiertas · Mis Finanzas (finanzas-pareja)

Son aspectos que **no se han podido determinar** durante el discovery: no son observables sin infraestructura o cuentas, o son reglas de negocio sin documentar. Cada pregunta indica qué escenarios bloquea y qué supuesto se toma mientras no haya respuesta.

## A. Bloqueantes para la fase GENERATOR

| ID | Pregunta | Afecta a | Supuesto mientras tanto |
|---|---|---|---|
| OQ-01 | ¿Hay un entorno de pruebas estable o se prueba siempre contra producción (`finanzas-churritos.netlify.app`)? ¿Se puede desplegar una copia local o en preview? | Toda la suite | Se prueba contra producción. La app es 100 % local y los tests no dejan datos fuera del navegador del test |
| OQ-02 | ¿Qué navegadores y dispositivos son objetivo? La app es móvil primero (`orientation: portrait-primary`), pero el discovery se hizo en escritorio | Configuración de projects | Chromium escritorio y Pixel 7 para P0. Firefox y WebKit en nightly |
| OQ-03 | ¿Los defectos D01 a D12 son defectos o comportamiento aceptado? | Escenarios ✘ en la matriz | Se tratan como defectos: test con el comportamiento esperado y `test.fail()` |
| OQ-04 | ¿Se acepta sembrar datos llamando a los módulos de la app (`import('/js/db.js')`)? Acopla los tests a la estructura interna | Velocidad de la suite | Sí para preparar el estado. La interfaz se usa solo en el flujo bajo prueba |
| OQ-05 | ¿Zona horaria y locale de referencia? | Fechas, «Hoy/Ayer», formato es-ES | `Europe/Madrid`, `es-ES` y reloj fijo |

## B. Funcionalidad no verificable en esta fase

| ID | Qué no se pudo verificar | Por qué | Escenarios |
|---|---|---|---|
| OQ-06 | **Nube / Supabase:** probar conexión, guardar configuración, registro, acceso, recuperar contraseña, crear o unirse a un hogar con código, sincronizar, resolver conflictos (gana la edición más reciente), salir | Requiere un proyecto de Supabase propio con el esquema de la app, más cuentas de prueba. Sin eso no hay nada que observar | Solo NUBE-01 (superficie). ¿Se proporcionará un proyecto de Supabase de pruebas? |
| OQ-06b | **Dictado por voz real** | Requiere micrófono y la Web Speech API. Chrome envía el audio a servidores externos. Playwright no puede inyectar voz | VOZ-01 (solo «no soportado») |
| OQ-06c | **OCR de tickets** | El motor de Tesseract se descarga del CDN y no hay imagen de ticket de referencia. No se ejercitó | OCR-01. ¿Hay tickets reales anonimizados para usar como fixtures? |
| OQ-06d | **Modo offline / service worker / instalación PWA** | No se ejercitó: requiere un proyecto con el service worker habilitado | PER-02 |
| OQ-06e | **Pantalla de error de carga** («No se han podido abrir tus datos») | No se reprodujo. Se puede simular haciendo fallar IndexedDB | ARR-02 |

## C. Reglas de negocio sin documentar

| ID | Pregunta | Comportamiento observado | Escenarios |
|---|---|---|---|
| OQ-07 | ¿Cuál es el importe mínimo válido? ¿Cómo se redondea un tercer decimal? | 0,001 se acepta y se guarda como 0 € (D01) | ALTA-03 |
| OQ-08 | ¿Se permiten movimientos con fecha futura? ¿Cuentan en «Gasto diario medio» y «Previsión de cierre»? | Se aceptan. Los datos de ejemplo crean movimientos hasta el día 25 aunque hoy sea día 5, lo que infla la previsión (8347,18 € con 1346,32 € gastados) | ALTA-07, INI-03 |
| OQ-09 | ¿Qué debe mostrar el «Importe total» de una revisión por lote con ingresos y gastos mezclados? | Suma todo sin signo y no se actualiza al desmarcar (D06) | LOTE-02 |
| OQ-10 | ¿«Quitar filtros» debe poner el rango en «Todo el historial» o volver a «Solo este mes» (el valor por defecto)? | Lo pone en «Todo el historial» | LIST-04 |
| OQ-11 | ¿Un presupuesto al 100 % exacto está «superado» o «agotado»? | Se muestra como «100 % · superado» y 🚨 | PRE-03 |
| OQ-12 | ¿Pueden existir dos metas con el mismo nombre? ¿Distingue mayúsculas? | Crear una meta con un nombre existente, sin distinguir mayúsculas, sobrescribe la anterior sin avisar | MET-10 |
| OQ-13 | ¿Los traspasos de ahorro periódicos deben contar como «cargos recurrentes» y sumar en «Al mes» / «Al año»? | Sí: «Fondo de emergencia 300 €/mes» se suma a los recibos (1127,88 €/mes) | REC-01 |
| OQ-14 | ¿Cambiar de moneda solo cambia el símbolo, o debería convertir los importes? | Solo cambia el formato, y de forma parcial (D07) | AJU-01 |
| OQ-15 | ¿Importar `{}` o un JSON de otra aplicación debe dar error? | Se informa como éxito: «Importados 0 movimientos…» | BAK-06 |
| OQ-16 | ¿«Borrar todos los datos» debe reiniciar también las preferencias (moneda, tema, umbral)? | Sí las reinicia, aunque el diálogo solo menciona movimientos, presupuestos y metas | DEMO-03 |
| OQ-17 | ¿Las medias de 3 meses deben contar como 0 los meses sin datos? | El consejo «Vivienda ha subido un 50 %» compara 720 € con una «media de 480 €» cuando hubo 720 € en cada mes registrado. Parece que cuenta como 0 un mes sin datos | INI-05, ANA-01 |
| OQ-18 | ¿Es correcto que el contador «Sin subir» de la hoja Sincronización muestre registros pendientes (58) sin tener nube configurada? | Muestra 58, y cuenta también los borrados | NUBE-01 |
| OQ-19 | ¿Hay requisitos de accesibilidad (WCAG 2.1 AA)? | Hay roles correctos en diálogos, pestañas y navegación. Los botones de icono tienen `aria-label`. No se auditó | Fuera de alcance. ¿Añadir `@axe-core/playwright`? |
| OQ-20 | ¿Comportamiento esperado ante rutas inexistentes? | Devuelven 200 y cargan Inicio (fallback de SPA en Netlify) | — (informativo) |

## D. Supuestos tomados en el discovery

1. El código fuente servido en `/js/*.js` es el que se ejecuta en producción y sirve de oráculo para lo marcado como [Código].
2. Todo se observó con fecha real 2026-10-05. Las cifras de los datos de ejemplo (ANA-01, REC-01) dependen de esa fecha y se reproducirán con el reloj fijo.
3. El defecto D02 se confirmó en el formulario de **metas**. Que afecte a presupuestos y aportaciones se **infiere** del código (mismo mecanismo de repintado) y no se ha reproducido.
4. No se probó con más de 42 movimientos: el rendimiento con volumen alto es desconocido.
