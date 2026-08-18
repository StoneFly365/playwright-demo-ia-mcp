# Solución — Lab 2 (MODIFY)

**Verificado:** las cinco versiones ejecutadas en Chromium contra la aplicación real. Los tiempos son de un equipo de desarrollo sin proxy; **lo que no varía es el orden de magnitud y el resultado de cada una**.

---

## Paso 2 — El coste de una espera fija

```typescript
test('con espera explícita: el badge muestra 1 tras añadir la Backpack', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);

  await loginPage.navigate();
  await loginPage.login('standard_user', 'secret_sauce');
  await inventoryPage.addToCart('sauce-labs-backpack');

  await page.waitForTimeout(3000);   // ← la única línea añadida

  await expect(
    inventoryPage.cartBadge,
    'El contador del carrito debería mostrar 1 producto tras añadir la Sauce Labs Backpack',
  ).toHaveText('1');
});
```

| Versión | Duración medida | Resultado |
|---|---|---|
| Sin espera | **277 ms** | ✅ |
| Con `waitForTimeout(3000)` | **3.334 ms** | ✅ |

**Respuesta esperada:** cero fiabilidad ganada, 3 segundos pagados. Con 79 tests son casi 4 minutos añadidos por ejecución, ~12 minutos en los tres navegadores. Y no protege de nada: si la aplicación tardara 3,1 s, el test fallaría igual.

## Paso 3 — Consultar el instante frente a esperar el resultado

Las tres versiones, con su resultado **medido**:

| Versión | Código | Resultado |
|---|---|---|
| Sin reintento | `const visible = await page.getByTestId('title').isVisible();` | **`false`** |
| Web-first, timeout por defecto | `await expect(page.getByTestId('title'), '…').toBeVisible();` | ❌ **falla a los 5 s** |
| Web-first con timeout amplio | `…toBeVisible({ timeout: 15000 })` | ✅ **pasa** (~5,1 s) |

```typescript
test('sin reintento: consulta durante la navegación', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('username').fill('performance_glitch_user');
  await page.getByTestId('password').fill('secret_sauce');

  const clicando = page.getByTestId('login-button').click();

  const visible = await page.getByTestId('title').isVisible();   // false
  expect(visible, 'El catálogo todavía no ha cargado en el instante de la consulta').toBe(false);

  await clicando;
});
```

**Las tres respuestas:**

1. `isVisible()` **responde por el estado de ahora mismo** y no espera nada: el catálogo aún no ha llegado, así que `false`. La aserción web-first **reintenta** hasta su timeout; con 5 s no le da tiempo porque este usuario tarda ~5,1 s, y con 15 s sí.
2. **5.000 ms**, valor por defecto de Playwright para `expect`. No está escrito en `playwright.config.ts`: se hereda.
3. Los `{ timeout: 15000 }` de `performance-glitch-user-cart.spec.ts` **no son exagerados**: la latencia real de este usuario está justo por encima del límite por defecto. Quien los quitara dejaría la suite al borde de la intermitencia.

> **Este es el mejor momento del Lab para el formador.** Casi todo el mundo predice que la web-first "pasa siempre porque reintenta". Reintentar tiene límite, y el límite se hereda de un valor que nadie escribió.

## Paso 4 — El test que no puede fallar

Sobre [`tests/problem-user-cart.spec.ts:69-88`](../../../tests/problem-user-cart.spec.ts):

1. **`expectedCount` sale de la propia aplicación**, no de la especificación: se lee del badge que se está evaluando.
2. **No fallaría.** Si el badge mostrase `5` y el carrito tuviera 5 ítems, el test pasa; y si mostrase `5` con 3 ítems, fallaría por una razón distinta de la que el nombre del test promete. El caso que **nunca** detecta es el importante: badge y carrito equivocados **de forma coherente**.
3. Lo que comprueba de verdad es la **consistencia interna** entre badge y carrito, no que el número sea correcto. Alternativa: fijar el valor esperado desde el caso de prueba —"añado 6 productos, con `problem_user` solo 3 responden, luego el carrito debe tener 3"— y comprobar `toHaveCount(3)`.

**Calibración:** un alumno que responda "sí fallaría, porque compara badge con carrito" no ha visto el problema. Pregúntale: *¿de dónde sale el 3?* Si la respuesta es "de la aplicación", ya lo tiene.

## Paso 5 — Timeouts locales

```typescript
test('copia del beforeEach del perf spec con timeout 2000', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login('performance_glitch_user', 'secret_sauce');

  await expect(
    page,
    'El performance_glitch_user debería ser redirigido al inventario, aunque con mayor latencia',
  ).toHaveURL(/.*\/inventory\.html$/, { timeout: 2000 });
});
```

**Resultado medido: ✅ pasa**, aunque el usuario tarde 5,1 s.

**Explicación:** el `click()` de dentro de `login()` **ya espera a que termine la navegación** que él mismo provocó. Cuando la aserción empieza a evaluarse, la página ya está cargada y se cumple a la primera. Los 2.000 ms nunca llegan a gastarse.

**Recomendación esperada:** los `{ timeout: 15000 }` del fichero real son defensivos y no hacen daño, pero **no son lo que salva a esos tests**: lo que los salva es la espera de las acciones. Y aun así hay que conservarlos, porque el paso 3 demuestra que hay momentos —los que no van precedidos de una acción esperada— donde el límite por defecto sí se queda corto.

> **Matiz importante para el formador:** los pasos 3 y 5 parecen contradecirse y no lo hacen. En el 5 hay una acción `await`-eada por delante que absorbe la latencia; en el 3, deliberadamente, no. La lección es exactamente esa: **el auto-waiting de las acciones hace casi todo el trabajo**, y el timeout de la aserción es la última red.

## Paso 6 — Conclusiones esperadas

Las tres líneas de cierre, versión sólida:

> "El `waitForTimeout(5000)` no arregla la intermitencia: la esconde y te cuesta 5 segundos por ejecución. Si el test falla a veces, o el elemento tarda y entonces hay que subir el timeout **de esa aserción**, o el valor esperado se está leyendo de la propia aplicación. Ninguna de las dos causas se resuelve esperando."

## Alternativas válidas

- Medir con `Date.now()` dentro del test en vez de leer el tiempo del reporter. Igual de válido y más explícito.
- Demostrar el paso 3 con `page.reload()` sin `await` en lugar del clic de login: también reproduce la consulta durante una navegación en curso (medido: `isVisible()` → `false`, recarga de ~5,2 s).

## Errores habituales

| Error | Señal | Cómo responder |
|---|---|---|
| Deja el `waitForTimeout` "por si acaso" | El fichero final lo conserva fuera del test de demostración | Que ejecute la suite completa y multiplique |
| Concluye que `isVisible()` "está roto" | Lo escribe en las conclusiones | No lo está: es una consulta. El error es usarla como aserción |
| Predice después de ejecutar | La predicción coincide sospechosamente con el resultado | La predicción es la mitad del ejercicio; pídesela por escrito antes |
| No ve el problema del Paso 4 | Responde que el test sí fallaría | Pregúntale de dónde sale el valor esperado |

## Cómo validar

```bash
npx playwright test -c learning/student/sandbox/01-playwright --project=chromium 02-auto-waiting.spec.ts
npx tsc --noEmit
```

Salida esperada: todos en verde **excepto** la versión web-first con timeout por defecto del Paso 3, si el alumno la deja en el fichero. Si la deja, debe estar marcada con un comentario explicando por qué falla — o convertida en la versión con `{ timeout: 15000 }`.
