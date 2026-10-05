# Matriz de cobertura · Mis Finanzas (finanzas-churritos)

**Columna «Automatización»:**
- **AUTOMATED**: todos los pasos y resultados esperados del escenario están cubiertos por tests.
- **PARTIAL**: parte del escenario está cubierta.
- **NOT AUTOMATED**: no hay test todavía.

Los tests están en `tests/finanzas-churritos/`.

**Columna «Estado hoy»** (resultado de la ejecución del 2026-10-05):
- ✔: el comportamiento coincide con el esperado.
- ✘ Dxx: hay un defecto conocido. El test correspondiente está marcado con `test.fail()` y la etiqueta `@bug-Dxx`, así que la suite sigue en verde mientras el defecto exista y avisa cuando se arregle.
- ? : no verificado.

## 1. Feature → Escenario → Riesgo → Prioridad → Test

| Feature | Escenario | Riesgo | Prioridad | Test | Automatización | Estado hoy |
|---|---|---|---|---|---|---|
| Arranque | ARR-01 Bienvenida sin datos | Alto | P0 | `arranque-navegacion.spec.ts` | AUTOMATED | ✔ |
| Arranque | ARR-02 Fallo de IndexedDB | Medio | P2 | — | NOT AUTOMATED | ? |
| Navegación | NAV-01 Navegar por secciones | Alto | P0 | `arranque-navegacion.spec.ts` | AUTOMATED | ✔ |
| Navegación | NAV-02 Selector de mes compartido | Medio | P1 | `arranque-navegacion.spec.ts` | AUTOMATED | ✔ |
| Navegación | NAV-03 Parámetros de URL | Bajo | P2 | — | NOT AUTOMATED | ✔ (discovery) |
| Navegación | NAV-04 Cerrar hojas y diálogos | Bajo | P2 | — (Escape y Cancelar se usan en otros tests) | NOT AUTOMATED | ✔ (discovery) |
| Alta manual | ALTA-01 Gasto válido y cancelación | Crítico | P0 | `alta-manual.spec.ts` | AUTOMATED | ✔ |
| Alta manual | ALTA-02 Importe inválido | Alto | P1 | `alta-manual.spec.ts` | AUTOMATED | ✔ · foco ✘ D14 |
| Alta manual | ALTA-03 Límite inferior de importe | Alto | P1 | `alta-manual.spec.ts` | AUTOMATED | 0,01 ✔ · 0,001 ✘ D01 |
| Alta manual | ALTA-04 Formatos es-ES | Alto | P1 | `logica-pura.spec.ts` (7 casos) + `alta-manual.spec.ts` | AUTOMATED | ✔ |
| Alta manual | ALTA-05 Tipo → categorías / meta | Medio | P1 | `alta-manual.spec.ts` | AUTOMATED | categorías ✔ · campo meta ✘ D15 |
| Alta manual | ALTA-06 Ahorro vinculado a meta | Alto | P1 | `alta-manual.spec.ts` | AUTOMATED | ✘ D05 |
| Alta manual | ALTA-07 Fecha vacía / futura | Medio | P2 | — | NOT AUTOMATED | ? |
| Alta manual | ALTA-08 Textos largos / HTML | Medio | P2 | — | NOT AUTOMATED | ? |
| Alta por texto | TXT-01 Frase → revisión → guardar | Crítico | P0 | `alta-texto.spec.ts` | AUTOMATED | ✔ |
| Alta por texto | TXT-02 Vacío / sin importe | Medio | P1 | `alta-texto.spec.ts` | AUTOMATED | ✔ |
| Alta por texto | TXT-03 Tipo / fecha / categoría | Alto | P1 | `logica-pura.spec.ts` (6 frases) + `alta-texto.spec.ts` (2 en la UI) | AUTOMATED | ✔ · «el día 2» ✘ D13 |
| Alta por texto | TXT-04 Enter / Shift+Enter | Bajo | P2 | — (Enter se usa en TXT-01) | NOT AUTOMATED | ✔ (parcial) |
| Alta por texto | TXT-05 Corregir antes de guardar | Medio | P2 | — | NOT AUTOMATED | ? |
| Lote | LOTE-01 Lista de varias líneas | Alto | P1 | `alta-texto.spec.ts` | AUTOMATED | ✔ |
| Lote | LOTE-02 Desmarcar actualiza resumen | Medio | P1 | `alta-texto.spec.ts` | AUTOMATED | contador ✔ · total ✘ D06 |
| Lote | LOTE-03 Sin selección / descartar | Bajo | P2 | — | NOT AUTOMATED | ? |
| Voz | VOZ-01 Sin Web Speech API | Bajo | P3 | — | NOT AUTOMATED | ? |
| Foto / OCR | OCR-01 Leer ticket | Medio | P2 | — | NOT AUTOMATED | ? |
| Listado | LIST-01 Tipo + categoría + totales | Alto | P1 | `movimientos.spec.ts` | AUTOMATED | ✔ |
| Listado | LIST-02 Búsqueda y sin resultados | Medio | P1 | `movimientos.spec.ts` (5 casos) | AUTOMATED | ✔ |
| Listado | LIST-03 Rangos y cambio de año | Medio | P2 | — | NOT AUTOMATED | ✔ (parcial) |
| Listado | LIST-04 Quitar filtros | Bajo | P2 | — (se usa en LIST-02) | NOT AUTOMATED | ✔ |
| Listado | LIST-05 Agrupación diaria y signos | Bajo | P2 | — | NOT AUTOMATED | ✘ D12 |
| Detalle | DET-01 Ver detalle | Medio | P1 | `movimientos.spec.ts` | AUTOMATED | ✔ |
| Detalle | DET-02 Editar y cancelar edición | Crítico | P0 | `movimientos.spec.ts` | AUTOMATED | ✔ |
| Detalle | DET-03 Duplicar | Medio | P1 | `movimientos.spec.ts` | AUTOMATED | ✔ |
| Detalle | DET-04 Borrar con confirmación | Crítico | P0 | `movimientos.spec.ts` | AUTOMATED | ✔ |
| Deshacer | UNDO-01 Deshacer último guardado | Alto | P1 | `movimientos.spec.ts` (alta, lote, botón usado) + `metas.spec.ts` (aportación) | AUTOMATED | ✔ (D11 descartado) |
| Inicio | INI-01 KPIs del mes | Crítico | P0 | `inicio.spec.ts` | AUTOMATED | ✔ |
| Inicio | INI-02 Mes sin ingresos | Medio | P1 | `inicio.spec.ts` | AUTOMATED | ✔ |
| Inicio | INI-03 Variación / media / previsión | Medio | P2 | — | NOT AUTOMATED | ✔ (parcial) |
| Inicio | INI-04 Regla 50/30/20 | Bajo | P2 | — | NOT AUTOMATED | ? |
| Inicio | INI-05 Bloques condicionales | Bajo | P2 | — | NOT AUTOMATED | ✔ (parcial) |
| Presupuestos | PRE-01 Crear y ver progreso | Alto | P0 | `presupuestos.spec.ts` | AUTOMATED | ✔ |
| Presupuestos | PRE-02 Validación de límite | Medio | P1 | `presupuestos.spec.ts` (4 casos) | AUTOMATED | ✔ |
| Presupuestos | PRE-03 Umbrales 80 % / 100 % | Alto | P1 | `presupuestos.spec.ts` (5 + 2 casos) | AUTOMATED | ✔ · 79,99 € y 99,99 € ✘ D16 |
| Presupuestos | PRE-04 Misma categoría actualiza | Medio | P1 | `presupuestos.spec.ts` | AUTOMATED | ✔ |
| Presupuestos | PRE-05 Editar / quitar | Medio | P2 | — | NOT AUTOMATED | ✔ (parcial) |
| Presupuestos | PRE-06 Sugerencias | Bajo | P2 | — | NOT AUTOMATED | ✔ |
| Presupuestos | PRE-07 Solo gastos del mes y categoría | Medio | P2 | — | NOT AUTOMATED | ? |
| Presupuestos | PRE-08 Formulario conserva datos | Alto | P1 | `presupuestos.spec.ts` | AUTOMATED | ✘ D02 (confirmado) |
| Metas | MET-01 Crear meta | Alto | P0 | `metas.spec.ts` | AUTOMATED | ✔ |
| Metas | MET-02 Validaciones | Medio | P1 | `metas.spec.ts` (4 casos) | AUTOMATED | ✔ |
| Metas | MET-03 Formulario conserva datos | Alto | P1 | `metas.spec.ts` | AUTOMATED | ✘ D02 |
| Metas | MET-04 Inicial fuera de rango | Medio | P1 | `metas.spec.ts` | AUTOMATED | inicial ≥ objetivo ✔ · negativo ✘ D04 |
| Metas | MET-05 Aportar (y validación) | Crítico | P0 | `metas.spec.ts` | AUTOMATED | ✔ |
| Metas | MET-06 Renombrar al editar | Crítico | P1 | `metas.spec.ts` | AUTOMATED | ✘ D03 |
| Metas | MET-07 Meta completada | Medio | P2 | — | NOT AUTOMATED | ? |
| Metas | MET-08 Borrar meta con aportaciones | Medio | P2 | — | NOT AUTOMATED | ? |
| Metas | MET-09 Fecha límite / en riesgo | Bajo | P3 | — | NOT AUTOMATED | ? |
| Metas | MET-10 Nombre ya existente | Medio | P3 | — | NOT AUTOMATED | ? |
| Recurrentes | REC-01 Detección | Medio | P2 | — | NOT AUTOMATED | ✔ (discovery) |
| Análisis | ANA-01 Con y sin datos | Medio | P2 | — | NOT AUTOMATED | ✔ (discovery) |
| Análisis | ANA-02 Umbral gasto hormiga | Bajo | P3 | — | NOT AUTOMATED | ? |
| Ajustes | AJU-01 Cambiar moneda | Medio | P2 | — | NOT AUTOMATED | ✘ D07 |
| Ajustes | AJU-02 Tema | Bajo | P3 | — (el tema oscuro se comprueba en PER-01) | NOT AUTOMATED | ✔ |
| Copias | BAK-01 Exportar JSON / CSV / CSV Excel | Alto | P1 | `copias.spec.ts` | AUTOMATED | ✔ |
| Copias | BAK-02 Ida y vuelta export → import | Crítico | P0 | `copias.spec.ts` | AUTOMATED | ✔ |
| Copias | BAK-03 Archivos inválidos | Alto | P1 | `copias.spec.ts` (2 casos + mensaje) | AUTOMATED | ✔ · mensaje en inglés ✘ D10 |
| Copias | BAK-04 Valores fuera de rango | Crítico | P1 | `copias.spec.ts` (5 casos) | AUTOMATED | «abc» ✔ · negativo, cero, tipo y categoría inexistentes ✘ D08 |
| Copias | BAK-05 Reimportar el mismo archivo | Medio | P2 | — | NOT AUTOMATED | ✔ (discovery) |
| Copias | BAK-06 Archivo vacío | Bajo | P2 | — | NOT AUTOMATED | ? (regla) |
| Datos de ejemplo / borrado | DEMO-01 Cargar ejemplo | Medio | P1 | `datos-ejemplo.spec.ts` | AUTOMATED | ✔ |
| Datos de ejemplo / borrado | DEMO-02 Deshacer ejemplo | Medio | P2 | — | NOT AUTOMATED | ✘ D09 |
| Datos de ejemplo / borrado | DEMO-03 Borrar todo | Crítico | P0 | `datos-ejemplo.spec.ts` | AUTOMATED | ✔ |
| Persistencia | PER-01 Sobrevive a una recarga | Crítico | P0 | `persistencia.spec.ts` | AUTOMATED | ✔ |
| Persistencia | PER-02 Sin conexión | Medio | P3 | — | NOT AUTOMATED | ? |
| Nube | NUBE-01 Estado sin cuenta | Bajo | P3 | — | NOT AUTOMATED | ✔ (discovery) |

## 2. Resumen de automatización

| Prioridad | Escenarios | AUTOMATED | PARTIAL | NOT AUTOMATED |
|---|---|---|---|---|
| P0 | 13 | 13 | 0 | 0 |
| P1 | 28 | 28 | 0 | 0 |
| P2 | 26 | 0 | 0 | 26 |
| P3 | 7 | 0 | 0 | 7 |
| **Total** | **74** | **41** | **0** | **33** |

P2 y P3 quedan pendientes a propósito: el plan dice no avanzar con ellos hasta que P0 y P1 sean estables. Ya lo son: 279 de 279 ejecuciones con el resultado esperado en 3 rondas seguidas.

## 3. Feature × tipo de cobertura (planificada)

Leyenda:
- ●: cubierto por al menos un escenario.
- ◐: cubierto solo de forma parcial o indirecta.
- —: no aplica o sin cobertura.

| Feature | Functional | Validation | Negative | Boundary | State transition | Data integrity | Navigation | UI behaviour | Regression |
|---|---|---|---|---|---|---|---|---|---|
| Arranque | ● | — | ● | — | — | — | — | ● | ◐ |
| Navegación | — | — | — | ◐ | ● | — | ● | ● | ◐ |
| Alta manual | ● | ● | ● | ● | ● | ● | — | ● | ● |
| Alta por texto | ● | ● | ● | ● | ● | ● | — | ● | ● |
| Lote | ● | — | ● | — | — | ● | — | ● | ● |
| Voz | ◐ | — | ● | — | — | — | — | ● | — |
| Foto / OCR | ● | — | ◐ | — | — | — | — | — | — |
| Listado | ● | — | ● | ● | ● | ● | — | ● | ● |
| Detalle | ● | — | ● | — | ● | ● | — | — | ● |
| Deshacer | ● | — | — | — | ● | ◐ | — | — | ● |
| Inicio | — | — | — | ● | — | ● | — | ● | ● |
| Presupuestos | ● | ● | ● | ● | ● | ● | — | ● | ● |
| Metas | ● | ● | ● | ● | ● | ● | — | ● | ● |
| Recurrentes | ● | — | — | — | — | ● | ◐ | — | — |
| Análisis | ● | — | — | — | — | ● | — | ● | — |
| Ajustes | ● | — | — | — | ◐ | — | — | ● | ● |
| Copias | ● | — | ● | ● | — | ● | — | — | ● |
| Datos de ejemplo / borrado | ● | — | ● | — | ● | ● | — | — | ● |
| Persistencia | — | — | — | — | — | ● | — | — | ● |
| Nube | — | — | — | — | — | — | ● | ● | — |

**Huecos conocidos (aceptados en esta fase):**
- Nube: no se prueba el comportamiento de sincronización.
- Voz y OCR: solo se prueba la superficie, sin entradas reales.
- No hay pruebas visuales de las gráficas.
- No hay pruebas de accesibilidad automatizadas (ver OQ-19).

## 4. Escenarios de mayor riesgo

| # | Escenario | Por qué | Automatización |
|---|---|---|---|
| 1 | **BAK-04** Valores fuera de rango en la importación | D08: un solo registro corrompe todos los totales, y es la vía para restaurar datos | AUTOMATED (✘ D08) |
| 2 | **BAK-02** Ida y vuelta export → import | Es la única copia de seguridad del usuario | AUTOMATED ✔ |
| 3 | **MET-06** Renombrar una meta | D03: duplica entidades y desvincula el progreso | AUTOMATED (✘ D03) |
| 4 | **MET-03 / PRE-08** Formularios que pierden datos | D02: pérdida silenciosa de lo escrito, confirmada en metas y presupuestos | AUTOMATED (✘ D02) |
| 5 | **ALTA-06** Ahorro manual sin metas | D05: el flujo «ahorro → meta» no funciona por la vía manual | AUTOMATED (✘ D05) |
| 6 | **DEMO-03** Borrar todo | Acción destructiva e irreversible | AUTOMATED ✔ |
| 7 | **PER-01** Persistencia tras una recarga | Sin backend, perder IndexedDB es perderlo todo | AUTOMATED ✔ |
| 8 | **INI-01 / DET-02 / DET-04 / MET-05 / ALTA-01 / TXT-01** | Núcleo de cálculo y registro | AUTOMATED ✔ |
