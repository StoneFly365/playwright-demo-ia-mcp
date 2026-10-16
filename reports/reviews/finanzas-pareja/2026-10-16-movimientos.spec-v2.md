<!-- Agente: test-reviewer · Commit revisado: 06e493d (2026-10-16) · Entrada: cambios a movimientos.spec.ts, page object, D17 y specs que resuelven 2026-10-16-movimientos.spec.md · Revisor independiente del autor · El agente devolvió la severidad sin emojis; se añaden al guardar, sin cambiar el texto -->

## Revisión: commit 06e493d (rama arquetipo)

Ficheros revisados: `tests/finanzas-pareja/movimientos.spec.ts`, `pages/finanzas-pareja/movimientos.ts`, `reports/bug-reports.md` (D17), `specs/finanzas-pareja/test-scenarios.md`, `coverage-matrix.md` y `application-map.md`.

No soy el autor del cambio. No he ejecutado nada y no tengo `git` en esta sesión. He leído el árbol en HEAD, no el diff, y me fío de la salida de `guard:assertions` que se me ha pasado. Las mutaciones y los «95 passed» no los puedo reproducir. Contrasto contra `test-scenarios.md`, `automation-architecture.md` §6/§8 y §9, `bug-reports.md`, `scripts/triage/core.mjs`, `datos.ts` y la revisión guardada.

### Hallazgos

Semáforo: 🔴 bloqueante · 🟠 alta · 🟡 media · 🟢 baja

- 🟠 [alta] `movimientos.spec.ts:77-97` y `bug-reports.md:148-155` — la marca `test.fail()` / `@bug-D17` la ha puesto el agente. No hay confirmación humana ni un artefacto que demuestre el defecto.
  Evidencia: «test.fail(defecto !== null);». La sección D17 dice «Encontrado al revisar el spec» y da como causa `movimientosFiltradosVista`.
  Riesgo: el generator tiene prohibido marcar defectos («las marcas test.fail() + @bug-Dxx las pone una persona cuando el defecto está confirmado»). `agentic-qa.md:117` exige aprobación explícita. El código de la app no está en el repo, así que la causa es una lectura no verificable aquí. La sección dice además que «45,9» y «45.90» tampoco encuentran, y ningún test ni informe lo respalda.
  Recomendación: que la persona confirme D17 antes de dejar la marca. Adjuntar una prueba reproducible: el «Nada por aquí» con «45,90», y el JSON de Playwright que muestra el error en `toHaveCount(1)` como primer fallo, según `mutation-check`. Quitar de «Actual» lo que no se haya probado, o cubrirlo.
  Estado: ✅ confirmado por una persona (2026-10-16). Lo que no estaba probado se ha quitado de «Actual» y queda en «Causa probable» como deducido del código, sin reproducir. Evidencia reproducible: con el reporter JSON, el test de «45,90» falla primero en `toHaveCount(1)` (línea 100). Al confirmar o rechazar D17, anotarlo en «Decisión humana».

- 🟡 [media] `movimientos.spec.ts:77-97` — la parametrización mezcla en un bucle el caso de control («45.9») y el caso con defecto («45,90»), y condiciona la marca.
  Evidencia: «tag: defecto ? ['@critical', `@bug-${defecto}`] : '@critical'» y «test.fail(defecto !== null);».
  Riesgo: es compatible con el triaje (`core.mjs:142`), pero se aparta de la convención (`test.fail()` incondicional, como en D11 y D16). `@bug-D17` no aparece literal en el código, así que una búsqueda en el repo no lo encuentra, y al arreglarlo no es obvio qué editar.
  Recomendación: separar los casos. Un test normal para «45.9», y otro para «45,90» con la etiqueta literal `'@bug-D17'`, la anotación y `test.fail()` sin condición. Si molesta la duplicación, extraer los pasos a una función local.
  Estado: ✅ resuelto. Son dos tests con una función local `buscarImporte()`. El de D17 lleva la etiqueta literal y `test.fail()` sin condición, como `presupuestos.spec.ts`.

- 🟡 [media] `bug-reports.md:152` y `test-scenarios.md` (LIST-02, «Datos») — hay una regla sin documentar: no consta qué formatos de importe debe aceptar el buscador.
  Riesgo: el defecto en sí está bien justificado (placeholder «…o importe…», la lista muestra «45,90 €», `application-map.md:265` ya lista «búsqueda por importe con coma»). Pero si el arreglo compara con el importe formateado, «45.9» dejará de encontrar y el caso de control fallaría sin ser una regresión.
  Recomendación: abrir una pregunta abierta, OQ-22, sobre los formatos que acepta el buscador.
  Estado: ✅ resuelto. Se añade OQ-22 en `open-questions.md`, y D17 la cita.

- 🟡 [media] `coverage-matrix.md:101` y `:104` — la tabla resumen no cuadra con las filas: P1 dice 14 PASS y 14 FAIL, pero hay 15 FAIL.
  Recomendación: P1 con 13 PASS y 15 FAIL; total con 26 PASS y 15 FAIL.
  Estado: ✅ resuelto.

- 🟡 [media] `coverage-matrix.md:45-46` — la matriz declara AUTOMATED sin cumplir su definición. Falta el pie de LIST-01, y «netflix» y «combustible» de LIST-02.
  Recomendación: abrir una pregunta abierta sobre el pie de LIST-01, o marcarlo como PARTIAL, y aclarar «netflix» y «combustible».
  Estado: ✅ resuelto en parte. Se abre OQ-23 sobre el pie de LIST-01. Para «netflix» y «combustible» no hacen falta casos nuevos: la búsqueda sin distinguir mayúsculas ya la cubre «MERCADONA», y la búsqueda por nombre de categoría, «ocio y cultura»; además, `mes-basico` no tiene ningún movimiento de combustible. La fila de la matriz no se marca como PARTIAL; si se prefiere, que lo decida una persona.

- 🟡 [media] `movimientos.spec.ts:195-199` (DET-04, Cancelar) — las aserciones negativas no tienen señal positiva. El test completo no da falso positivo: si «Cancelar» borrara, falla después, en `borrar()`. El límite documentado es aceptable.
  Recomendación: reformular el comentario sin cifras medidas, porque envejecen mal.
  Estado: ✅ resuelto. Comentario reformulado. No se añade `recargar()`: la escritura en IndexedDB podría no haber terminado antes de recargar.

- 🟡 [media] `test-scenarios.md` (UNDO-01) — el agente cambió un «Resultado esperado» del escenario (lote de 3 a lote de 4) para que cuadre con el test. Es un cambio de oráculo en la fuente de verdad. `guard:assertions` no lo ve porque no revisa los `.md`.
  Recomendación: que la persona lo apruebe de forma explícita.
  Estado: ✅ aprobado por una persona (2026-10-16).

- 🟢 [baja] Referencias de D17 desalineadas: LIST-02 sin «Estado actual: FALLA (D17)», la línea 908 con fecha antigua, la evidencia de D17 en el mapa es una ubicación y está antes de D16, y la matriz remite a `qa-code-review.md` §4.
  Estado: ✅ resuelto. Se alinean las cuatro.

- 🟢 [baja] `movimientos.spec.ts:7` — la constante `MERCADONA` (45,90 €) se confunde con el «Mercadona» de `MES_BASICO` (100 €).
  Estado: ✅ resuelto. Se renombra a `MERCADONA_45_90`.

### Veredicto por «Estado» de la revisión guardada

- DET-02: resuelto. DET-01: resuelto, sin hallazgo. DET-04: resuelto, con un límite aceptable.
- LIST-01: resuelto en tipos y categoría; el pie, sin cubrir y sin pregunta abierta (ahora OQ-23).
- LIST-02: parcial; la marca de D17 está pendiente de confirmación humana.
- UNDO-01: resuelto solo en la documentación; esa edición necesita aprobación humana.
- Los hallazgos bajos son correctos tal como constan.

### Oráculos tocados

Todas las líneas son aserciones añadidas, más la marca de D17. Las líneas de «sin resultados» son código desplazado. Cambios que necesitan aprobación humana: la marca `test.fail()` / `@bug-D17` y la edición del escenario UNDO-01.

### Resultado
CAMBIOS_REQUERIDOS — pendiente de aprobación humana

---

Decisión humana: aprobado — Raúl Molina, 2026-10-16. Confirma D17 como defecto (se mantienen `test.fail()` y `@bug-D17`) y aprueba el cambio de UNDO-01 a «lote de 4».
