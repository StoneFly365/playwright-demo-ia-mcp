<!-- Agente: test-reviewer · Commit revisado: 5bb511e (2026-10-16) · Entrada: cambios a alta-texto.spec.ts, DetalleMovimiento.textoOriginal(), OQ-27 y OQ-28 que resuelven 2026-10-16-alta-texto.spec.md · Revisor independiente del autor · Texto del agente condensado al guardarlo, sin cambiar hallazgos ni severidades -->

## Revisión: commit 5bb511e (rama arquetipo)

No soy el autor. No he podido ejecutar los tests ni `guard:assertions`, ni he visto el diff: reviso el fichero resultante contra `test-scenarios.md` (TXT-01 a TXT-03, LOTE-01 y LOTE-02), `bug-reports.md` (D06 y D13), `open-questions.md`, `test-data/` y los page objects.

### Hallazgos

Semáforo: 🔴 bloqueante · 🟠 alta · 🟡 media · 🟢 baja

- 🟡 [media] alta-texto.spec.ts:113-116 (D06, ancla) — La línea que cita el «Estado» (113) no coincide con el fichero: el total está en la 116.
  Recomendación: repetir el JSON del reporter, citar la línea real y hacer una mutación del ancla (sin `uncheck()`).
  Estado: ✅ resuelto (2026-10-16). La cifra 113 era de una versión anterior a las líneas de `/linea/i`. Tras esta ronda, D06 falla en la línea 118, el total, y el ancla está en la 117. Mutación del ancla (sin desmarcar la nómina): el primer fallo pasa a la línea 117, con «Guardar 4 movimientos». Corregida también la cita del informe anterior.

- 🟡 [media] alta-texto.spec.ts:82-83 (LOTE-01) — `not.toBeChecked()` de la línea sin importe no tiene mutación propia.
  Estado: ✅ resuelto (2026-10-16). Mutación (marcar la línea): falla con «checked» en `not.toBeChecked()`, línea 84 en el fichero limpio. También queda comprobado que `/linea/i` no casa con ninguna otra línea de `LISTA_VARIOS` y que `/\s0\s€$/` no casa con «150 €» ni con «10 €».

- 🟡 [media] open-questions.md (OQ-27) — Describe el test de forma inexacta («empieza por linea») y remite a D13, que trata otro tema.
  Estado: ✅ resuelto (2026-10-16). OQ-27 dice ahora que el test localiza la casilla por `/linea/i`, la exige desmarcada y exige que el nombre termine en «0 €». D13 se cita solo como caso análogo.

- 🟡 [media] alta-texto.spec.ts:31-32 (TXT-01) — `toContainText` lee el DOM aunque el `<details>` esté cerrado, así que no comprueba que «se vea».
  Recomendación: comprobar que el desplegable está abierto.
  Estado: ✅ resuelto (2026-10-16). Se añade `toHaveJSProperty('open', true)` (línea 33). Mutación (sin pulsar el desplegable): falla con «false».

- 🟢 [baja] alta-texto.spec.ts:92 (LOTE-01, Gastos) — El valor sale de los datos (45,90 + 60 + 12,99).
  Estado: ➖ conforme, sin cambios.

- 🟢 [baja] alta-texto.spec.ts:47 (TXT-02) — La frase completa coincide con el escenario.
  Estado: ➖ conforme, sin cambios.

- 🟢 [baja] OQ-28 — La trazabilidad solo existe en este test; `FRASES` y `logica-pura.spec.ts` fijan las mismas categorías sin comentario.
  Estado: ✅ resuelto (2026-10-16). Comentario sobre `FRASES` en `interpretacion.ts` que remite a OQ-28. Los valores no cambian.

### Oráculos tocados

Solo aserciones añadidas o endurecidas, respaldadas por el escenario o por los datos. No se toca ninguna marca `test.fail` o `@bug-` ni se relaja ningún valor. El reviewer señala que, leída al pie de la letra, la regla pide un cambio documentado del requisito para cualquier oráculo nuevo; deja la interpretación a quien apruebe.

### Resultado
SIN_OBJECIONES — pendiente de aprobación humana

---

Decisión humana: aprobado — Raúl Molina Hernández, 2026-10-19
