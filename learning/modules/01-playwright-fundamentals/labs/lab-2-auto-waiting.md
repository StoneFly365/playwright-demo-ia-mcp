# Lab 2 — MODIFY · Por qué nadie espera

**Nivel:** 2 · MODIFY · **Tiempo:** 45 min · **Objetivos:** P2 *(y P6, por las aserciones que escribes)*

---

## Objetivo

Entender el auto-waiting **rompiéndolo a propósito** y midiendo lo que cuesta: comparar una espera fija con la espera automática, y una consulta sin reintento con una aserción web-first.

## Contexto

En 79 tests de este proyecto hay **cero** `waitForTimeout`, `waitForSelector` y `waitForLoadState`. Casi cualquier tutorial de internet te dirá que metas un `sleep` cuando algo "va rápido"; esta suite demuestra que no hace falta.

Pero "no hace falta" no se aprende leyéndolo. Se aprende midiendo.

Este Lab usa dos regalos del repositorio:

- **`performance_glitch_user`**, un usuario real de la aplicación cuya página tarda **~5 segundos** en cargar. Latencia auténtica, no simulada.
- **Los 4 únicos métodos sin reintento de la suite**, en [`tests/problem-user-cart.spec.ts:53,54,77,78`](../../../../tests/problem-user-cart.spec.ts).

## Prerrequisitos

- Lab 1 completado.
- [Teoría](../theory.md), secciones 3 y 4.

## Archivos implicados

| Fichero | Papel |
|---|---|
| [`learning/student/sandbox/01-playwright/02-auto-waiting.spec.ts`](../../../student/sandbox/01-playwright/02-auto-waiting.spec.ts) | **El que modificas.** Llega en verde con 2 tests |
| `learning/student/sandbox/01-playwright/02-conclusiones.md` | **El que creas tú** |
| [`tests/problem-user-cart.spec.ts:50-88`](../../../../tests/problem-user-cart.spec.ts) | Lectura obligatoria del Paso 4 |
| [`tests/performance-glitch-user-cart.spec.ts`](../../../../tests/performance-glitch-user-cart.spec.ts) | Lectura del Paso 5 |

---

## Pasos

### Paso 1 — Punto de partida

```bash
npx playwright test -c learning/student/sandbox/01-playwright --project=chromium 02-auto-waiting.spec.ts
```

`2 passed`. Anota el tiempo de cada test: aparece entre paréntesis en la salida.

### Paso 2 — El coste de una espera fija

Copia el primer test (`base: el badge muestra 1…`) con el nombre `con espera explícita` y añade **una sola línea** antes de la aserción:

```typescript
await page.waitForTimeout(3000);
```

Ejecuta y anota los dos tiempos.

**Responde:** ¿qué has ganado en fiabilidad y qué has pagado en tiempo? Si tu suite tiene 79 tests y cada uno lleva un `waitForTimeout(3000)`, ¿cuánto tarda?

> Referencia medida durante la construcción de este módulo: **277 ms** sin espera, **3.334 ms** con ella. Mismo resultado.

### Paso 3 — Consultar el instante frente a esperar el resultado

Aquí se ve la diferencia entre `isVisible()` y `expect(...).toBeVisible()`. Para verla hay que hacer algo que normalmente **no** se hace: consultar la página **mientras la navegación está en curso**.

Copia el segundo test como `sin reintento` y déjalo así:

```typescript
test('sin reintento: consulta durante la navegación', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('username').fill('performance_glitch_user');
  await page.getByTestId('password').fill('secret_sauce');

  // Lupa del ejercicio: NO esperamos a que el clic termine su navegación.
  const clicando = page.getByTestId('login-button').click();

  const visible = await page.getByTestId('title').isVisible();
  console.log('isVisible durante la navegación =', visible);

  await clicando;
});
```

**Antes de ejecutar, escribe tu predicción.** Después ejecútalo y compárala.

A continuación escribe **dos** versiones web-first del mismo momento, sustituyendo la consulta por una aserción:

```typescript
await expect(page.getByTestId('title'), '…').toBeVisible();                      // versión A
await expect(page.getByTestId('title'), '…').toBeVisible({ timeout: 15000 });    // versión B
```

Predice el resultado de cada una y ejecútalas. **Una de las dos falla, y el motivo es la mejor lección del Lab:** la aserción reintenta, sí, pero **durante un tiempo limitado**, y la latencia de este usuario (~5,1 s) roza el límite por defecto.

**Responde:**

1. Las tres preguntan lo mismo sobre el mismo elemento y en el mismo instante. ¿Por qué dan tres resultados distintos?
2. ¿Cuál es el timeout por defecto de una aserción, y de dónde sale ese valor si nadie lo ha escrito en la configuración?
3. Ahora vuelve a mirar los `{ timeout: 15000 }` de [`tests/performance-glitch-user-cart.spec.ts`](../../../../tests/performance-glitch-user-cart.spec.ts). ¿Siguen pareciéndote exagerados?

> **Ojo:** dejar una promesa sin `await` es una mala práctica y aquí es solo la lupa que hace visible el fenómeno. En un test de verdad, `await` en el clic y Playwright espera la navegación por ti — que es justo lo que hace innecesario el `sleep`.

### Paso 4 — El test que no puede fallar

Lee [`tests/problem-user-cart.spec.ts:69-88`](../../../../tests/problem-user-cart.spec.ts) entero. Fíjate en de dónde sale el valor esperado:

```typescript
const badgeText = await inventoryPage.cartBadge.isVisible()
  ? await inventoryPage.cartBadge.textContent()
  : '0';
const expectedCount = parseInt(badgeText ?? '0', 10);
```

**Responde a las tres:**

1. ¿De dónde sale `expectedCount`: de la especificación o de la propia aplicación?
2. Si la aplicación tuviera un bug y mostrase `5` cuando debería mostrar `3`, **¿fallaría este test?**
3. ¿Qué comprueba realmente el test, entonces? Y una alternativa: ¿qué aserción escribirías tú?

Esta es la pregunta más importante del Lab, y no va de esperas: va de **oráculos de test**. Un test cuyo valor esperado se lee de la propia aplicación siempre pasa.

### Paso 5 — Timeouts locales

[`tests/performance-glitch-user-cart.spec.ts`](../../../../tests/performance-glitch-user-cart.spec.ts) es el único fichero con `{ timeout: 15000 }`, cuatro veces. La página de este usuario tarda ~5 s.

Copia su `beforeEach` a tu sandbox **bajando el timeout a 2000**, con la misma aserción de URL, y ejecuta.

**Predice primero:** ¿falla o pasa? Después ejecuta y explica el resultado. La respuesta sorprende, y la explicación está en la [teoría, §3](../theory.md#3-auto-waiting-por-qué-nadie-espera): hay **dos** mecanismos de espera, no uno.

**Responde:** entonces, ¿es `{ timeout: 15000 }` lo que salva a esos tests? ¿Qué recomendarías al equipo?

### Paso 6 — Conclusiones

Escribe `02-conclusiones.md` con:

- La tabla de tiempos del Paso 2.
- Tu predicción y el resultado real de los pasos 3 y 5.
- Las tres respuestas del Paso 4.
- **Tres líneas de cierre**: qué le explicarías a un compañero que acaba de añadir un `waitForTimeout(5000)` a un test suyo porque "a veces falla".

---

## Resultado esperado

- `02-auto-waiting.spec.ts` con los 2 tests originales más al menos 3 versiones nuevas (espera fija, sin reintento, web-first equivalente, y la del Paso 5). Todos en verde salvo el que **debes** justificar por qué falla, si falla.
- `02-conclusiones.md` completo.

## Validación

```bash
npx playwright test -c learning/student/sandbox/01-playwright --project=chromium 02-auto-waiting.spec.ts
npx tsc --noEmit
git status --short     # solo learning/student/

git add learning/student/sandbox/01-playwright/
git commit -m "feat(lab-2): medición del auto-waiting y de los métodos sin reintento"
```

## Preguntas de reflexión

1. Si `waitForTimeout` es siempre peor, **¿por qué existe en la API de Playwright?** Piensa en algún caso legítimo (pista: depurar algo a mano no es escribir un test).
2. `isVisible()` no es un método defectuoso. ¿En qué situación **sí** es la herramienta correcta?
3. Un test tuyo falla una vez de cada veinte, siempre en CI, nunca en local. ¿Cuál es tu primera hipótesis y cómo la comprobarías **sin** añadir esperas?

## Criterios de finalización

- [ ] Los tiempos del Paso 2 son medidos, no copiados de este enunciado.
- [ ] Hay una **predicción escrita antes** de ejecutar en los pasos 3 y 5.
- [ ] La respuesta 2 del Paso 4 dice claramente que el test **no** fallaría.
- [ ] Ninguna aserción escrita por ti carece de mensaje descriptivo.

## Learning points

- **Auto-waiting son dos mecanismos, no uno:** las acciones esperan a que el elemento sea accionable (y a que termine la navegación pendiente), y las aserciones web-first reintentan la comprobación. Entre los dos cubren el 99% de los casos.
- `waitForTimeout` cambia fiabilidad por tiempo y **no la mejora**: si la aplicación tarda un milisegundo más de lo que esperaste, el test falla igual, solo que más tarde.
- Un timeout local (`{ timeout: 15000 }`) es lo contrario de una espera fija: gasta lo que haga falta y sigue en cuanto se cumple. Es la respuesta correcta a una lentitud conocida del negocio.
- **Un test cuyo valor esperado se lee de la propia aplicación no puede fallar.** Es un problema de oráculo, no de esperas, y es de los defectos más caros de detectar porque el test está siempre en verde. Se trabaja a fondo en el módulo 07.
