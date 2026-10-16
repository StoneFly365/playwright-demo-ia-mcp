<!-- Agente: test-reviewer · Commit revisado: 664481f (2026-10-16) · Entrada: tests/finanzas-pareja/alta-texto.spec.ts (fichero existente, sin diff) · Texto del agente condensado al guardarlo, sin cambiar hallazgos ni severidades -->

## Revisión: tests/finanzas-pareja/alta-texto.spec.ts (commit 664481f, rama arquetipo)

Es una revisión del fichero tal cual, sin diff. No soy su autor, así que no hay conflicto de independencia. No he ejecutado `guard:assertions` (no hay diff que pasarle) ni los tests: todo lo que digo sobre la app sale de las fuentes escritas. Fuentes: `test-scenarios.md` (TXT-01 a TXT-05 y LOTE-01 a LOTE-03), `bug-reports.md` (D06 y D13), `open-questions.md` (OQ-09), los page objects, la fixture, `test-data/` y `coverage-verified.md`.

### Hallazgos

Semáforo: 🔴 bloqueante · 🟠 alta · 🟡 media · 🟢 baja

- 🟡 [media] alta-texto.spec.ts:98-108 (LOTE-02, D06) — `test.fail()` aprobaría el test aunque falle otra cosa distinta del defecto.
  Evidencia: «test.fail(); await app.alta.interpretar(LISTA_VARIOS); await app.alta.linea(/Nómina/).uncheck(); await expect(app.alta.resumenLote('Importe total')).toHaveText('118,89 €');»
  Riesgo: si `uncheck()` no encuentra la casilla o el resumen no se localiza, el test sigue en verde y D06 queda «verificado» sin que nadie haya mirado el total.
  Recomendación: antes del total, una aserción que hoy pase y demuestre que el desmarcado se aplicó (`toHaveAccessibleName('Guardar 3 movimientos')` sobre `guardarLote`), para que el primer fallo sea solo el total (AD-06).
  Estado: ✅ resuelto (2026-10-16). Ancla añadida. Con el reporter JSON, D06 falla en la línea del total (116 en el commit 5bb511e; la cifra 113 que se citó antes era de una versión anterior), con el ancla pasando justo antes.

- 🟡 [media] alta-texto.spec.ts:107 — El valor `'118,89 €'` depende de OQ-09, que sigue abierta. Solo lo respalda D06.
  Riesgo: si OQ-09 se resuelve con signo o con desglose, el test fallaría aunque D06 estuviera corregido.
  Recomendación: no tocar el valor; comentar en el test que sale de D06 y depende de OQ-09.
  Estado: ✅ resuelto (2026-10-16). Comentario añadido. OQ-09 ya citaba LOTE-02.

- 🟡 [media] alta-texto.spec.ts:78 (LOTE-01) — El localizador `/Linea Importe/` depende del nombre que deriva el parser (D13), y no se comprueba el «(0 €)» del escenario.
  Recomendación: localizar sin depender de la limpieza del texto y comprobar el «0 €» solo si una fuente fija su formato; si no, abrir una pregunta abierta.
  Estado: ✅ resuelto (2026-10-16). El localizador pasa a `/linea/i` (el nombre accesible empieza por el emoji: «📦 Linea Importe … − 0 €»). Se comprueba `toHaveAccessibleName(/\s0\s€$/)`, porque el escenario sí fija el «(0 €)». La presentación queda en OQ-27. Mutación (la línea de Netflix en vez de la vacía): falla con «… − 12,99 €», línea 83.

- 🟡 [media] alta-texto.spec.ts:61-69 (TXT-03, ahorro) — La categoría `fondo-emergencia` no está en el escenario: sale de lo que hace la app hoy (`FRASES`).
  Recomendación: no fijarla sin respaldo; abrir una pregunta abierta.
  Estado: 🔶 pendiente de requisito (OQ-28). Se mantiene la aserción, sin relajar nada, con un comentario que remite a OQ-28. OQ-28 cubre también las categorías de `FRASES` sin respaldo en el escenario.

- 🟡 [media] alta-texto.spec.ts:84-86 (LOTE-01) — Se comprueban la cuenta y los Ingresos, pero no los Gastos guardados.
  Recomendación: `total('Gastos')` = 118,89 €, derivado de los datos.
  Estado: ✅ resuelto (2026-10-16). Mutación (Netflix 13,99): falla con «119,89 €», línea 92.

- 🟢 [baja] alta-texto.spec.ts:43-49 (TXT-02) — El título promete una pista que no se comprueba.
  Estado: ✅ resuelto (2026-10-16). Se comprueba la frase completa del escenario. Mutación (frase de la pista cambiada): falla en la línea 47. Esta mutación cambia el valor esperado: solo confirma que se exige la frase entera.

- 🟢 [baja] alta-texto.spec.ts:32 (TXT-01) — El localizador `getByRole('group')` del texto original es genérico.
  Estado: ✅ resuelto (2026-10-16). Nuevo `DetalleMovimiento.textoOriginal()`, acotado al grupo que contiene «Texto original». Mutación (otra frase): falla en la línea 32.

- 🟢 [baja] TXT-03 (UI) — Duplicidad parcial con `logica-pura.spec.ts`, aceptable: el escenario pide validar 2 frases por la interfaz.
  Estado: ➖ sin cambios.

- 🟢 [baja] Cobertura: TXT-04, TXT-05 y LOTE-03 constan como NOT AUTOMATED. TXT-05 es el de más valor.
  Estado: ➖ informativo, para el planner.

### Comprobado sin objeciones
- Los valores de TXT-01, LOTE-01 y LOTE-02 coinciden con el escenario.
- La etiqueta `'@bug-D06'` es literal, y `test.fail()` no es condicional.
- Sin esperas prohibidas. Los negativos van tras sincronizar con el aviso. El reloj es fijo y los `<option>` se leen con `toHaveValue`.

### Oráculos tocados
Ninguno en la revisión (fichero tal cual).

### Resultado
SIN_OBJECIONES — pendiente de aprobación humana

---

Decisión humana: pendiente
