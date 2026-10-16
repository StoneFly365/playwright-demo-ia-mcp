---
name: mutation-check
description: Comprueba que una aserción nueva o endurecida de Playwright detecta de verdad el fallo que dice cubrir, rompiendo a propósito el escenario del test (datos o pasos) y confirmando que falla donde debe. Úsala después de añadir o cambiar aserciones en tests/, antes de dar un hallazgo por resuelto o de proponer un cambio para revisión.
---

# Verificación por mutación

Que un test pase no demuestra que su aserción sirva. Una mutación rompe a propósito lo que la aserción vigila; si el test sigue en verde, la aserción no detecta nada.

En este proyecto la app bajo prueba no es nuestra (se prueba contra producción), así que no se muta su código: se muta **el escenario del test**.

## Qué mutar (por orden de preferencia)

1. **Datos de partida o de entrada**: lo sembrado en `app.abrir({...})` o lo que se escribe en un formulario (p. ej. inicial `1500` → `500`). Cambia el comportamiento real sin tocar el oráculo. Es la mutación de referencia.
2. **Un paso del test**: quitar la acción que produce el efecto (p. ej. no pulsar «Deshacer»).
3. **Invertir el valor esperado** (`'Ahorro'` → `'Gasto'`): solo prueba que un localizador **nuevo** lee el elemento correcto (el error debe mostrar el valor real). No dice nada de la app; decláralo así.

No sirve: mutar el page object o las fixtures (rompe otros tests y no prueba la aserción), ni una mutación que haga fallar el test por timeout de un paso en vez de por la aserción.

## Procedimiento

1. **Aísla la aserción.** Si otra aserción anterior va a fallar primero con la mutación, coméntala también (`// MUTACION`). Si no, el fallo no demuestra nada sobre la aserción nueva.
2. **Copia de seguridad** del spec fuera del repo (scratchpad o `$TEMP`) antes de editar.
3. **Aplica la mutación** marcando cada línea tocada con `// MUTACION`.
4. **Ejecuta solo ese test**, sin pisar los artefactos de la demo ni enmascarar con reintentos:
   `npx playwright test <spec> -g "<título>" --reporter=list --retries=0`
5. **Comprueba el fallo**: debe fallar **en la línea de la aserción vigilada** y el `Received` debe ser el valor que produce la mutación. Otro punto de fallo = mutación mal aislada; vuelve al paso 1.
6. **Restaura** desde la copia y verifica: `grep -c MUTACION <spec>` da 0 y `git diff` muestra solo el cambio previsto.
7. **Vuelve a ejecutar** el test (o el fichero completo) y confirma que está en verde.

## Tests con `test.fail()` (`@bug-Dxx`)

No se mutan: ya fallan. Lo que se verifica es AD-06, que el **primer** fallo sigue siendo la aserción del defecto y no una nueva añadida antes. El reporter `list` no muestra el error de un fallo esperado; usa el JSON por salida estándar:

```
npx playwright test <spec> -g "<título>" --reporter=json --retries=0 2>/dev/null \
  | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const r=JSON.parse(s).suites[0].suites[0].specs[0].tests[0].results[0];console.log(r.status,r.errors.map(e=>e.location?.line).join(','))})"
```

(`suites[0].suites[0]` supone un test dentro de un `test.describe`; sin él, `suites[0].specs[0]`.)

Una aserción añadida **después** de la del defecto no se ejecuta hasta que se corrija: no se puede verificar hoy. Déjala para entonces y deja rastro (`// TODO(Dxx)` + nota en `coverage-matrix.md`).

## Registro

Anota el resultado junto al hallazgo (línea `Estado:` del informe en `reports/reviews/<app>/`) o en la propuesta:

```
Mutación: <qué se cambió> → falla en <línea> (<Received>). Restaurado y en verde.
```

Si la mutación **no** hace fallar el test, la aserción no cubre lo que dice: no des el hallazgo por resuelto.

Si la aserción nueva falla **sin mutar**, puede ser un defecto de la app. No ajustes el test para que pase ni pongas `test.fail()` / `@bug-Dxx` por tu cuenta: reúne la evidencia (error, línea, causa en el código si la hay) y pide a una persona que confirme el defecto antes de marcarlo.
