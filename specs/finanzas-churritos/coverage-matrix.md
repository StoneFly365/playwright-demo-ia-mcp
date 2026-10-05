# Matriz de cobertura · Mis Finanzas (finanzas-churritos)

**Columna «Test».** Es el fichero previsto para la fase GENERATOR, dentro de `tests/finanzas-churritos/`. Ningún test existe todavía: el estado de todos es **Pendiente**.

**Columna «Estado hoy».**
- ✔: el comportamiento observado coincide con el esperado.
- ✘ Dxx: falla por un defecto confirmado.
- ? : no verificado.

## 1. Feature → Escenario → Riesgo → Prioridad → Test

| Feature | Escenario | Riesgo | Prioridad | Test (previsto) | Estado hoy |
|---|---|---|---|---|---|
| Arranque | ARR-01 Bienvenida sin datos | Alto | P0 | `arranque-navegacion.spec.ts` | ✔ |
| Arranque | ARR-02 Fallo de IndexedDB | Medio | P2 | `arranque-navegacion.spec.ts` | ? |
| Navegación | NAV-01 Navegar por secciones | Alto | P0 | `arranque-navegacion.spec.ts` | ✔ |
| Navegación | NAV-02 Selector de mes compartido | Medio | P1 | `arranque-navegacion.spec.ts` | ✔ |
| Navegación | NAV-03 Parámetros de URL | Bajo | P2 | `arranque-navegacion.spec.ts` | ✔ |
| Navegación | NAV-04 Cerrar hojas y diálogos | Bajo | P2 | `arranque-navegacion.spec.ts` | ✔ (parcial) |
| Alta manual | ALTA-01 Gasto válido | Crítico | P0 | `alta-manual.spec.ts` | ✔ |
| Alta manual | ALTA-02 Importe inválido | Alto | P1 | `alta-manual.spec.ts` | ✔ |
| Alta manual | ALTA-03 Límite inferior de importe | Alto | P1 | `alta-manual.spec.ts` `@bug-D01` | ✘ D01 |
| Alta manual | ALTA-04 Formatos es-ES | Alto | P1 | `logica-pura.spec.ts` + `alta-manual.spec.ts` | ✔ (parcial) |
| Alta manual | ALTA-05 Tipo → categorías / meta | Medio | P1 | `alta-manual.spec.ts` | ✔ |
| Alta manual | ALTA-06 Ahorro vinculado a meta | Alto | P1 | `alta-manual.spec.ts` `@bug-D05` | ✘ D05 |
| Alta manual | ALTA-07 Fecha vacía / futura | Medio | P2 | `alta-manual.spec.ts` | ? |
| Alta manual | ALTA-08 Textos largos / HTML | Medio | P2 | `alta-manual.spec.ts` | ? |
| Alta por texto | TXT-01 Frase → revisión → guardar | Crítico | P0 | `alta-texto.spec.ts` | ✔ |
| Alta por texto | TXT-02 Vacío / sin importe | Medio | P1 | `alta-texto.spec.ts` | ✔ |
| Alta por texto | TXT-03 Tipo / fecha / categoría (tabla) | Alto | P1 | `logica-pura.spec.ts` + `alta-texto.spec.ts` | ✔ (parcial) |
| Alta por texto | TXT-04 Enter / Shift+Enter | Bajo | P2 | `alta-texto.spec.ts` | ✔ (parcial) |
| Alta por texto | TXT-05 Corregir antes de guardar | Medio | P2 | `alta-texto.spec.ts` | ? |
| Lote | LOTE-01 Lista de varias líneas | Alto | P1 | `alta-texto.spec.ts` | ✔ |
| Lote | LOTE-02 Desmarcar actualiza resumen | Medio | P1 | `alta-texto.spec.ts` `@bug-D06` | ✘ D06 |
| Lote | LOTE-03 Sin selección / descartar | Bajo | P2 | `alta-texto.spec.ts` | ? |
| Voz | VOZ-01 Sin Web Speech API | Bajo | P3 | `alta-voz-foto.spec.ts` | ? |
| Foto / OCR | OCR-01 Leer ticket | Medio | P2 | `alta-voz-foto.spec.ts` | ? |
| Listado | LIST-01 Tipo + categoría + totales | Alto | P1 | `movimientos.spec.ts` | ✔ |
| Listado | LIST-02 Búsqueda y sin resultados | Medio | P1 | `movimientos.spec.ts` | ✔ |
| Listado | LIST-03 Rangos y cambio de año | Medio | P2 | `movimientos.spec.ts` | ✔ (parcial) |
| Listado | LIST-04 Quitar filtros | Bajo | P2 | `movimientos.spec.ts` | ✔ |
| Listado | LIST-05 Agrupación diaria y signos | Bajo | P2 | `movimientos.spec.ts` `@bug-D12` | ✘ D12 |
| Detalle | DET-01 Ver detalle | Medio | P1 | `movimientos.spec.ts` | ✔ |
| Detalle | DET-02 Editar | Crítico | P0 | `movimientos.spec.ts` | ✔ |
| Detalle | DET-03 Duplicar | Medio | P1 | `movimientos.spec.ts` | ✔ |
| Detalle | DET-04 Borrar con confirmación | Crítico | P0 | `movimientos.spec.ts` | ✔ |
| Deshacer | UNDO-01 Deshacer último guardado | Alto | P1 | `movimientos.spec.ts` `@bug-D11` | ✔ (D11 menor) |
| Inicio | INI-01 KPIs del mes | Crítico | P0 | `inicio.spec.ts` | ✔ |
| Inicio | INI-02 Mes sin ingresos | Medio | P1 | `inicio.spec.ts` | ✔ |
| Inicio | INI-03 Variación / media / previsión | Medio | P2 | `inicio.spec.ts` | ✔ (parcial) |
| Inicio | INI-04 Regla 50/30/20 | Bajo | P2 | `inicio.spec.ts` | ? |
| Inicio | INI-05 Bloques condicionales | Bajo | P2 | `inicio.spec.ts` | ✔ (parcial) |
| Presupuestos | PRE-01 Crear y ver progreso | Alto | P0 | `presupuestos.spec.ts` | ✔ |
| Presupuestos | PRE-02 Validación de límite | Medio | P1 | `presupuestos.spec.ts` | ✔ (parcial) |
| Presupuestos | PRE-03 Umbrales 80 % / 100 % | Alto | P1 | `presupuestos.spec.ts` | ✔ (parcial) |
| Presupuestos | PRE-04 Misma categoría actualiza | Medio | P1 | `presupuestos.spec.ts` | ✔ |
| Presupuestos | PRE-05 Editar / quitar | Medio | P2 | `presupuestos.spec.ts` | ✔ (parcial) |
| Presupuestos | PRE-06 Sugerencias | Bajo | P2 | `presupuestos.spec.ts` | ✔ |
| Presupuestos | PRE-07 Solo gastos del mes y categoría | Medio | P2 | `presupuestos.spec.ts` | ? |
| Presupuestos | PRE-08 Formulario conserva datos | Alto | P1 | `presupuestos.spec.ts` `@bug-D02` | ? (probable ✘ D02) |
| Metas | MET-01 Crear meta | Alto | P0 | `metas.spec.ts` | ✔ |
| Metas | MET-02 Validaciones | Medio | P1 | `metas.spec.ts` | ✔ |
| Metas | MET-03 Formulario conserva datos | Alto | P1 | `metas.spec.ts` `@bug-D02` | ✘ D02 |
| Metas | MET-04 Inicial fuera de rango | Medio | P1 | `metas.spec.ts` `@bug-D04` | ✘ D04 |
| Metas | MET-05 Aportar | Crítico | P0 | `metas.spec.ts` | ✔ |
| Metas | MET-06 Renombrar al editar | Crítico | P1 | `metas.spec.ts` `@bug-D03` | ✘ D03 |
| Metas | MET-07 Meta completada | Medio | P2 | `metas.spec.ts` | ? |
| Metas | MET-08 Borrar meta con aportaciones | Medio | P2 | `metas.spec.ts` | ? |
| Metas | MET-09 Fecha límite / en riesgo | Bajo | P3 | `metas.spec.ts` | ? |
| Metas | MET-10 Nombre ya existente | Medio | P3 | `metas.spec.ts` | ? |
| Recurrentes | REC-01 Detección | Medio | P2 | `plan-recurrentes.spec.ts` | ✔ |
| Análisis | ANA-01 Con y sin datos | Medio | P2 | `analisis.spec.ts` | ✔ |
| Análisis | ANA-02 Umbral gasto hormiga | Bajo | P3 | `analisis.spec.ts` | ? |
| Ajustes | AJU-01 Cambiar moneda | Medio | P2 | `ajustes.spec.ts` `@bug-D07` | ✘ D07 |
| Ajustes | AJU-02 Tema | Bajo | P3 | `ajustes.spec.ts` | ✔ |
| Copias | BAK-01 Exportar JSON / CSV | Alto | P1 | `copias.spec.ts` | ✔ |
| Copias | BAK-02 Round-trip export → import | Crítico | P0 | `copias.spec.ts` | ? (parcial) |
| Copias | BAK-03 Archivos inválidos | Alto | P1 | `copias.spec.ts` `@bug-D10` | ✔ (D10 menor) |
| Copias | BAK-04 Importes fuera de rango | Crítico | P1 | `copias.spec.ts` `@bug-D08` | ✘ D08 |
| Copias | BAK-05 Reimportar el mismo archivo | Medio | P2 | `copias.spec.ts` | ✔ |
| Copias | BAK-06 Archivo vacío | Bajo | P2 | `copias.spec.ts` | ? (regla) |
| Datos ejemplo / borrado | DEMO-01 Cargar ejemplo | Medio | P1 | `datos-ejemplo.spec.ts` | ✔ |
| Datos ejemplo / borrado | DEMO-02 Deshacer ejemplo | Medio | P2 | `datos-ejemplo.spec.ts` `@bug-D09` | ✘ D09 |
| Datos ejemplo / borrado | DEMO-03 Borrar todo | Crítico | P0 | `datos-ejemplo.spec.ts` | ✔ |
| Persistencia | PER-01 Sobrevive a recarga | Crítico | P0 | `persistencia.spec.ts` | ✔ |
| Persistencia | PER-02 Offline | Medio | P3 | `persistencia.spec.ts` (proyecto con service worker) | ? |
| Nube | NUBE-01 Estado sin cuenta | Bajo | P3 | `nube.spec.ts` | ✔ |

## 2. Feature × tipo de cobertura

Leyenda: ● cubierto por al menos un escenario, ◐ cubierto solo de forma parcial o indirecta, — no aplica o sin cobertura.

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
| Datos ejemplo / borrado | ● | — | ● | — | ● | ● | — | — | ● |
| Persistencia | — | — | — | — | — | ● | — | — | ● |
| Nube | — | — | — | — | — | — | ● | ● | — |

**Huecos conocidos (aceptados en esta fase):**
- Nube: no se prueba el comportamiento de sincronización.
- Voz y OCR: solo se prueba la superficie, sin entradas reales.
- No hay pruebas visuales de las gráficas.
- No hay pruebas de accesibilidad automatizadas (ver OQ-19).

## 3. Escenarios de mayor riesgo

Son los que tienen riesgo Crítico o un defecto confirmado de severidad alta o crítica.

| # | Escenario | Por qué |
|---|---|---|
| 1 | **BAK-04** Importes fuera de rango en import | D08: un solo registro corrompe todos los totales; es la vía de restauración de datos |
| 2 | **BAK-02** Round-trip export → import | Única copia de seguridad del usuario. Hoy solo está verificado por partes |
| 3 | **MET-06** Renombrar meta | D03: duplica entidades y desvincula el progreso |
| 4 | **MET-03 / PRE-08** Formularios que pierden datos | D02: pérdida silenciosa de lo escrito |
| 5 | **ALTA-06** Ahorro manual sin metas | D05: el flujo «ahorro → meta» no funciona por la vía manual |
| 6 | **DEMO-03** Borrar todo | Acción destructiva e irreversible |
| 7 | **PER-01** Persistencia tras recarga | Sin backend, perder IndexedDB es perder todo |
| 8 | **INI-01 / DET-02 / DET-04 / MET-05 / ALTA-01 / TXT-01** | Núcleo de cálculo y registro: cualquier regresión afecta a todas las cifras |
