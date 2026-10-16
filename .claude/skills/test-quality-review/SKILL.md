---
name: test-quality-review
description: Lista de comprobación para revisar la calidad de tests de Playwright (localizadores, aserciones, esperas, flakiness, duplicidades, mantenibilidad, falsos positivos y oráculos de negocio). Solo revisa y propone; no modifica tests. Úsala al revisar tests nuevos, propuestas del generator o del healer, o un diff en tests/.
---

# Revisión de calidad de tests Playwright

Esta skill **revisa**. No edita tests ni aplica cambios: cada hallazgo es una recomendación para una persona.

Convenciones de referencia: `docs/automation-architecture.md` (localizadores §2, page objects §3, aserciones §6, anti-flakiness §8).

## Comprobaciones

### 1. Oráculos de negocio (lo más grave)
- ¿El valor esperado sale del «Resultado esperado» del escenario (`specs/<app>/test-scenarios.md`) o de `test-data/`? Un valor copiado de lo que la app muestra hoy no es un oráculo: congela el comportamiento, sea correcto o no.
- ¿El diff cambia una aserción, un valor esperado, `test-data/` o una marca `test.fail` / `@bug-` / `fixme` / `skip`? Ejecuta o pide `npm run guard:assertions -- <diff>`. Cualquier línea señalada necesita justificación con evidencia de que **el requisito** cambió, no de que la app cambió.
- Un test `@bug-Dxx` debe probar el comportamiento **correcto** y fallar en la aserción del defecto, que conviene que sea el primer punto de fallo (AD-06).

### 2. Falsos positivos
- Aserciones negativas («no aparece», «no cambia») sin sincronizar antes con la respuesta de la app (`app.ultimoAviso()`): pasan durante los milisegundos en que la app aún no ha reaccionado.
- Comprobar que algo desaparece cuando también desaparece solo (avisos de 5 s = timeout de `expect`; FLAKY-02).
- Solo `toBeVisible()` donde el escenario exige un valor (`toHaveText('650 €')`).
- `expect` sin `await`, o una aserción dentro de un `if` que puede no ejecutarse.

### 3. Localizadores
- Orden: `getByRole` con nombre → `getByLabel` acotado a la hoja → `getByPlaceholder`/`getByText` → estructural solo dentro de un page object.
- Señalar: XPath, clases CSS en el test, `nth()` sin justificar, textos parciales ambiguos, `ElementHandle`.

### 4. Sincronización y esperas
- Prohibidos `waitForTimeout`, `networkidle` y `sleep`.
- Esperas web-first (`await expect(...)`), señales deterministas (fin de arranque en `abrir()`).
- Timeouts subidos sin evidencia de por qué.

### 5. Riesgo de flakiness
- Dependencia de la fecha real (la fixture fija el reloj: ¿se usa?), del orden de los tests o de datos de otros tests.
- Carreras con avisos que repintan el DOM (D02) o caducan.

### 6. Duplicidades y mantenibilidad
- ¿Ya hay un test con el mismo `// ID` y los mismos pasos? (`npm run coverage:map`).
- Lógica repetida que ya existe en un page object, una fixture o un builder de `test-data`.
- Aserciones dentro de page objects (no deben tenerlas).
- Título en lenguaje de negocio y `// ID` del escenario dentro del cuerpo del test.

## Severidad

| Severidad | Cuándo |
|---|---|
| 🔴 `bloqueante` | cambia un oráculo sin justificar, oculta un defecto, o el test puede pasar sin comprobar el requisito |
| 🟠 `alta` | riesgo claro de falso positivo o de flakiness |
| 🟡 `media` | localizador frágil, duplicidad, desviación de las convenciones |
| 🟢 `baja` | legibilidad, nombres, comentarios |

## Formato de cada hallazgo

```
- <emoji> [severidad] fichero:línea — problema
  Evidencia: cita literal del código o del escenario
  Riesgo: qué puede pasar
  Recomendación: cambio concreto (sin aplicarlo)
```

Resultado de la revisión: `CAMBIOS_REQUERIDOS` si hay algún bloqueante o alto; `SIN_OBJECIONES` en otro caso. Nunca «aprobado»: la aprobación es humana.
