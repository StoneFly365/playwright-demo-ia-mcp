<!-- Agente: test-reviewer · Commit revisado: 75f5755 (2026-10-16) · Entrada: cambios a alta-manual.spec.ts, formulario-movimiento.ts, D01 en bug-reports.md y la línea de toBeEnabled() en test-quality-review, que resuelven 2026-10-16-alta-manual.spec.md · Revisor independiente del autor -->

## Revisión: commit 75f5755 (rama arquetipo)

Ficheros revisados: `tests/finanzas-pareja/alta-manual.spec.ts`, `pages/finanzas-pareja/formulario-movimiento.ts`, la línea de Verificación de D01 en `reports/bug-reports.md` y la línea 30 de `.claude/skills/test-quality-review/SKILL.md`.

No soy el autor del cambio. No he ejecutado tests ni mutaciones, y no tengo el diff: he revisado el estado actual de los ficheros contra ALTA-03, ALTA-05 y ALTA-06 y la revisión guardada. El código de la app no está en el repo, así que no puedo comprobar cómo deshabilita las categorías. Tomo como declaradas las 96 pasadas, las mutaciones y la comprobación de `toBeEnabled()`.

### Hallazgos

Semáforo: 🔴 bloqueante · 🟠 alta · 🟡 media · 🟢 baja

- 🟡 [media] alta-manual.spec.ts:107, 113, 117 — La aserción de ALTA-05 solo tiene mutación comprobada en Ingreso.
  Riesgo: las líneas de Gasto y Ahorro son aserciones nuevas sin evidencia de mutación propia.
  Recomendación: mutación para Ahorro y, si es viable, para Gasto.
  Estado: ✅ resuelto (2026-10-16). Gasto con «nomina» forzada falla en la línea 108; Ahorro con «supermercado», en la 118. Fichero restaurado: 0 `MUTACION`.

- 🟡 [media] alta-manual.spec.ts:107-117 y formulario-movimiento.ts:53-55 — La regla «pertenece al tipo activo» se expresa con «habilitada», y el vínculo no está documentado. Si la app pasara a ocultar o quitar opciones en vez de deshabilitarlas, el selector seguiría dando 1.
  Recomendación: aceptable. Para blindarlo, documentar en el page object la convención «otro tipo = disabled».
  Estado: ✅ resuelto (2026-10-16). El comentario del page object lo dice, con la evidencia de los recuentos 24/7/6 de `categoriasDisponibles()`, que también protegen la convención: si la app dejara de deshabilitar, esos recuentos fallarían.

- 🟡 [media] Informe anterior (Estado de ALTA-03 y de ALTA-01) — Dos «Estado» marcan ✅ aunque queda parte del hallazgo sin cubrir: «no se crea ningún movimiento de 0 €» y el grupo «Hoy».
  Recomendación: marcarlos como parciales y abrir un seguimiento.
  Estado: ✅ resuelto (2026-10-16). Los dos pasan a 🔶 «resuelto en parte», y el informe anterior tiene una sección «Seguimiento pendiente» con ambos puntos.

- 🟢 [baja] bug-reports.md:97-103 — D01 cita 0,004 solo en la Verificación.
  Estado: ✅ resuelto (2026-10-16). «Actual» dice ahora «Lo mismo con `0,004`».

- 🟢 [baja] alta-manual.spec.ts:151 — El `!` sobre `getAttribute('value')` queda fuera de la aserción del defecto. Tras corregir D05, un fallo en ese paso se leería como «fallo esperado».
  Recomendación: anotar en el informe del defecto que, al cerrar D05, hay que quitar `test.fail()` y volver a ejecutar.
  Estado: ✅ resuelto (2026-10-16). Anotado en la Verificación de D05.

### Comprobaciones pedidas (resumen)

- Estados: ALTA-05 (nomina) y ALTA-06 resueltos de verdad. ALTA-03 y ALTA-01, resueltos en parte (ver hallazgo 3).
- AD-06: correcto en D01 (línea 87) y en D05 (línea 150, con «Sin meta» antes, que hoy pasa). La selección por rol y por `value` no añade ningún paso que falle antes del defecto.
- Bucle de D01: cumple la regla (`test.fail()` sin argumentos, `'@bug-D01'` literal, ningún caso sano mezclado).
- Línea nueva de la skill: precisa y bien situada.
- Falsos positivos: ninguno. `toContainText('Supermercado')` sobre la hoja es laxo, pero aceptable con la mutación de la categoría ocio.

### Oráculos tocados

Aserciones añadidas, el test de D01 movido a un bucle con la misma aserción y la misma marca, y «nomina» eliminada por decisión humana. No se ha relajado nada ni se ha quitado ninguna marca.

### Resultado
SIN_OBJECIONES — pendiente de aprobación humana

---

Decisión humana: pendiente
