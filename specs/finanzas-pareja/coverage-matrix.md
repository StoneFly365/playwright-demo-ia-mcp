# Matriz de cobertura · Mis Finanzas (finanzas-pareja)

**Columna «Automatización»:**
- **AUTOMATED**: todos los pasos y resultados esperados del escenario están cubiertos por tests.
- **PARTIAL**: parte del escenario está cubierta.
- **NOT AUTOMATED**: no hay test todavía.

Los tests están en `tests/finanzas-pareja/`.

**Columna «Estado final»** (revisión QA del 2026-10-05; última ejecución completa válida: estrés 3, 465/465 con el resultado esperado):
- **PASS**: el comportamiento de la app es el esperado y los tests lo verifican.
- **FAIL (Dxx)**: la app tiene un defecto confirmado (causa A). El test falla en la aserción del defecto, con la evidencia recogida en `reports/qa-code-review.md` §4. Está marcado con `test.fail()` y `@bug-Dxx`. Entre paréntesis, la parte del escenario que sí pasa.
- **FLAKY**: resultado intermitente. Hoy no hay ninguno: FLAKY-01 está corregido (ver `reports/flakiness-report.md`).
- **BLOCKED**: no se puede ejecutar. Ningún escenario lo está por causa propia, pero hubo ejecuciones bloqueadas por el entorno (ENV-01, host caído unos 4 min). La confirmación final (E9) se ejecutó con el host disponible. Ver `reports/test-execution.md`.
- **NOT AUTOMATED**: sin test (P2/P3, pendientes a propósito).

## 1. Feature → Escenario → Riesgo → Prioridad → Test

| Feature | Escenario | Riesgo | Prioridad | Test | Automatización | Estado final |
|---|---|---|---|---|---|---|
| Arranque | ARR-01 Bienvenida sin datos | Alto | P0 | `arranque-navegacion.spec.ts` | AUTOMATED | PASS |
| Arranque | ARR-02 Fallo de IndexedDB | Medio | P2 | — | NOT AUTOMATED | NOT AUTOMATED |
| Navegación | NAV-01 Navegar por secciones | Alto | P0 | `arranque-navegacion.spec.ts` | AUTOMATED | PASS |
| Navegación | NAV-02 Selector de mes compartido | Medio | P1 | `arranque-navegacion.spec.ts` | AUTOMATED | PASS |
| Navegación | NAV-03 Parámetros de URL | Bajo | P2 | — | NOT AUTOMATED | NOT AUTOMATED |
| Navegación | NAV-04 Cerrar hojas y diálogos | Bajo | P2 | — (Escape y Cancelar se usan en otros tests) | NOT AUTOMATED | NOT AUTOMATED |
| Alta manual | ALTA-01 Gasto válido y cancelación | Crítico | P0 | `alta-manual.spec.ts` | AUTOMATED | PASS |
| Alta manual | ALTA-02 Importe inválido | Alto | P1 | `alta-manual.spec.ts` | AUTOMATED | FAIL (D14 foco · validación PASS) |
| Alta manual | ALTA-03 Límite inferior de importe | Alto | P1 | `alta-manual.spec.ts` | AUTOMATED | FAIL (D01 · 0,01 PASS) |
| Alta manual | ALTA-04 Formatos es-ES | Alto | P1 | `logica-pura.spec.ts` (7 casos) + `alta-manual.spec.ts` | AUTOMATED | PASS |
| Alta manual | ALTA-05 Tipo → categorías / meta | Medio | P1 | `alta-manual.spec.ts` | AUTOMATED | FAIL (D15 · categorías PASS) |
| Alta manual | ALTA-06 Ahorro vinculado a meta | Alto | P1 | `alta-manual.spec.ts` | AUTOMATED | FAIL (D05) |
| Alta manual | ALTA-07 Fecha vacía / futura | Medio | P2 | — | NOT AUTOMATED | NOT AUTOMATED |
| Alta manual | ALTA-08 Textos largos / HTML | Medio | P2 | — | NOT AUTOMATED | NOT AUTOMATED |
| Alta por texto | TXT-01 Frase → revisión → guardar | Crítico | P0 | `alta-texto.spec.ts` | AUTOMATED | PASS |
| Alta por texto | TXT-02 Vacío / sin importe | Medio | P1 | `alta-texto.spec.ts` | AUTOMATED | PASS |
| Alta por texto | TXT-03 Tipo / fecha / categoría | Alto | P1 | `logica-pura.spec.ts` (6 frases) + `alta-texto.spec.ts` (2 en la UI) | AUTOMATED | FAIL (D13 · 6 frases PASS) |
| Alta por texto | TXT-04 Enter / Shift+Enter | Bajo | P2 | — (Enter se usa en TXT-01) | NOT AUTOMATED | NOT AUTOMATED |
| Alta por texto | TXT-05 Corregir antes de guardar | Medio | P2 | — | NOT AUTOMATED | NOT AUTOMATED |
| Lote | LOTE-01 Lista de varias líneas | Alto | P1 | `alta-texto.spec.ts` | AUTOMATED | PASS |
| Lote | LOTE-02 Desmarcar actualiza resumen | Medio | P1 | `alta-texto.spec.ts` | AUTOMATED | FAIL (D06 · contador PASS) |
| Lote | LOTE-03 Sin selección / descartar | Bajo | P2 | — | NOT AUTOMATED | NOT AUTOMATED |
| Voz | VOZ-01 Sin Web Speech API | Bajo | P3 | — | NOT AUTOMATED | NOT AUTOMATED |
| Foto / OCR | OCR-01 Leer ticket | Medio | P2 | — | NOT AUTOMATED | NOT AUTOMATED |
| Listado | LIST-01 Tipo + categoría + totales | Alto | P1 | `movimientos.spec.ts` | AUTOMATED | PASS |
| Listado | LIST-02 Búsqueda y sin resultados | Medio | P1 | `movimientos.spec.ts` (5 casos) | AUTOMATED | PASS |
| Listado | LIST-03 Rangos y cambio de año | Medio | P2 | — | NOT AUTOMATED | NOT AUTOMATED |
| Listado | LIST-04 Quitar filtros | Bajo | P2 | — (se usa en LIST-02) | NOT AUTOMATED | NOT AUTOMATED |
| Listado | LIST-05 Agrupación diaria y signos | Bajo | P2 | — | NOT AUTOMATED | NOT AUTOMATED |
| Detalle | DET-01 Ver detalle | Medio | P1 | `movimientos.spec.ts` | AUTOMATED | PASS |
| Detalle | DET-02 Editar y cancelar edición | Crítico | P0 | `movimientos.spec.ts` | AUTOMATED | PASS |
| Detalle | DET-03 Duplicar | Medio | P1 | `movimientos.spec.ts` | AUTOMATED | PASS |
| Detalle | DET-04 Borrar con confirmación | Crítico | P0 | `movimientos.spec.ts` | AUTOMATED | PASS |
| Deshacer | UNDO-01 Deshacer último guardado | Alto | P1 | `movimientos.spec.ts` (alta, lote, botón usado) + `metas.spec.ts` (aportación) | AUTOMATED | FAIL (D11 · deshacer PASS) |
| Inicio | INI-01 KPIs del mes | Crítico | P0 | `inicio.spec.ts` | AUTOMATED | PASS |
| Inicio | INI-02 Mes sin ingresos | Medio | P1 | `inicio.spec.ts` | AUTOMATED | PASS |
| Inicio | INI-03 Variación / media / previsión | Medio | P2 | — | NOT AUTOMATED | NOT AUTOMATED |
| Inicio | INI-04 Regla 50/30/20 | Bajo | P2 | — | NOT AUTOMATED | NOT AUTOMATED |
| Inicio | INI-05 Bloques condicionales | Bajo | P2 | — | NOT AUTOMATED | NOT AUTOMATED |
| Presupuestos | PRE-01 Crear y ver progreso | Alto | P0 | `presupuestos.spec.ts` | AUTOMATED | PASS |
| Presupuestos | PRE-02 Validación de límite | Medio | P1 | `presupuestos.spec.ts` (4 casos) | AUTOMATED | PASS |
| Presupuestos | PRE-03 Umbrales 80 % / 100 % | Alto | P1 | `presupuestos.spec.ts` (5 + 2 casos) | AUTOMATED | FAIL (D16 · 5 umbrales PASS) |
| Presupuestos | PRE-04 Misma categoría actualiza | Medio | P1 | `presupuestos.spec.ts` | AUTOMATED | PASS |
| Presupuestos | PRE-05 Editar / quitar | Medio | P2 | — | NOT AUTOMATED | NOT AUTOMATED |
| Presupuestos | PRE-06 Sugerencias | Bajo | P2 | — | NOT AUTOMATED | NOT AUTOMATED |
| Presupuestos | PRE-07 Solo gastos del mes y categoría | Medio | P2 | — | NOT AUTOMATED | NOT AUTOMATED |
| Presupuestos | PRE-08 Formulario conserva datos | Alto | P1 | `presupuestos.spec.ts` | AUTOMATED | FAIL (D02) |
| Metas | MET-01 Crear meta | Alto | P0 | `metas.spec.ts` | AUTOMATED | PASS |
| Metas | MET-02 Validaciones | Medio | P1 | `metas.spec.ts` (4 casos) | AUTOMATED | PASS |
| Metas | MET-03 Formulario conserva datos | Alto | P1 | `metas.spec.ts` | AUTOMATED | FAIL (D02) |
| Metas | MET-04 Inicial fuera de rango | Medio | P1 | `metas.spec.ts` | AUTOMATED | FAIL (D04 · inicial ≥ objetivo PASS) |
| Metas | MET-05 Aportar (y validación) | Crítico | P0 | `metas.spec.ts` | AUTOMATED | PASS |
| Metas | MET-06 Renombrar al editar | Crítico | P1 | `metas.spec.ts` | AUTOMATED | FAIL (D03) |
| Metas | MET-07 Meta completada | Medio | P2 | — | NOT AUTOMATED | NOT AUTOMATED |
| Metas | MET-08 Borrar meta con aportaciones | Medio | P2 | — | NOT AUTOMATED | NOT AUTOMATED |
| Metas | MET-09 Fecha límite / en riesgo | Bajo | P3 | — | NOT AUTOMATED | NOT AUTOMATED |
| Metas | MET-10 Nombre ya existente | Medio | P3 | — | NOT AUTOMATED | NOT AUTOMATED |
| Recurrentes | REC-01 Detección | Medio | P2 | — | NOT AUTOMATED | NOT AUTOMATED |
| Análisis | ANA-01 Con y sin datos | Medio | P2 | — | NOT AUTOMATED | NOT AUTOMATED |
| Análisis | ANA-02 Umbral gasto hormiga | Bajo | P3 | — | NOT AUTOMATED | NOT AUTOMATED |
| Ajustes | AJU-01 Cambiar moneda | Medio | P2 | — | NOT AUTOMATED | NOT AUTOMATED |
| Ajustes | AJU-02 Tema | Bajo | P3 | — (el tema oscuro se comprueba en PER-01) | NOT AUTOMATED | NOT AUTOMATED |
| Copias | BAK-01 Exportar JSON / CSV / CSV Excel | Alto | P1 | `copias.spec.ts` | AUTOMATED | PASS |
| Copias | BAK-02 Ida y vuelta export → import | Crítico | P0 | `copias.spec.ts` | AUTOMATED | PASS |
| Copias | BAK-03 Archivos inválidos | Alto | P1 | `copias.spec.ts` (2 casos + mensaje) | AUTOMATED | FAIL (D10 · rechazo PASS) |
| Copias | BAK-04 Valores fuera de rango | Crítico | P1 | `copias.spec.ts` (5 casos) | AUTOMATED | FAIL (D08 ×4 · «abc» PASS) |
| Copias | BAK-05 Reimportar el mismo archivo | Medio | P2 | — | NOT AUTOMATED | NOT AUTOMATED |
| Copias | BAK-06 Archivo vacío | Bajo | P2 | — | NOT AUTOMATED | NOT AUTOMATED |
| Datos de ejemplo / borrado | DEMO-01 Cargar ejemplo | Medio | P1 | `datos-ejemplo.spec.ts` | AUTOMATED | PASS |
| Datos de ejemplo / borrado | DEMO-02 Deshacer ejemplo | Medio | P2 | — | NOT AUTOMATED | NOT AUTOMATED |
| Datos de ejemplo / borrado | DEMO-03 Borrar todo | Crítico | P0 | `datos-ejemplo.spec.ts` | AUTOMATED | PASS |
| Persistencia | PER-01 Sobrevive a una recarga | Crítico | P0 | `persistencia.spec.ts` | AUTOMATED | PASS |
| Persistencia | PER-02 Sin conexión | Medio | P3 | — | NOT AUTOMATED | NOT AUTOMATED |
| Nube | NUBE-01 Estado sin cuenta | Bajo | P3 | — | NOT AUTOMATED | NOT AUTOMATED |

## 2. Resumen

| Prioridad | Escenarios | AUTOMATED | PASS | FAIL (defecto de app) | FLAKY | BLOCKED | NOT AUTOMATED |
|---|---|---|---|---|---|---|---|
| P0 | 13 | 13 | 13 | 0 | 0 | 0 | 0 |
| P1 | 28 | 28 | 14 | 14 | 0 | 0 | 0 |
| P2 | 26 | 0 | — | — | — | — | 26 |
| P3 | 7 | 0 | — | — | — | — | 7 |
| **Total** | **74** | **41** | **27** | **14** | **0** | **0** | **33** |

Los 14 FAIL de P1 son defectos de la aplicación con evidencia (D01–D06, D08, D10, D11, D13–D16). No hay ningún fallo de la suite sin explicar. Los P0 pasan todos.

P2 y P3 siguen pendientes a propósito. Como P0 y P1 ya son estables (465/465 en estrés y 93/93 en serie), se pueden abordar en la siguiente ola.

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
