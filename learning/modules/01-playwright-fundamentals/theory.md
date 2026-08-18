# Módulo 01 — Teoría

**Tiempo de lectura:** 45 minutos. Es el 20% teórico del módulo; el 80% restante son los Labs.

Ten el repositorio abierto mientras lees. Cada sección termina con un **"Ábrelo"**: el fichero real que ilustra lo explicado.

Todos los datos numéricos de este documento están **medidos contra la aplicación real**, no supuestos. La fuente es [`module-01-technical-validation.md`](../../docs/module-01-technical-validation.md) y las ejecuciones de la construcción del módulo.

---

## 0. Qué cambia respecto al módulo 00

En el módulo 00 todo era determinista: una función recibía un array y devolvía otro. Aquí entra el navegador, y con él tres cosas nuevas:

1. **Latencia.** Entre que pulsas un botón y aparece el resultado pasa un tiempo que no controlas.
2. **Ambigüedad.** "El botón de añadir al carrito" son **seis** botones idénticos en la página de catálogo.
3. **Un HTML que no has escrito tú.** Y que a veces está mal: la aplicación de este curso no tiene ni una sola etiqueta `<label>`.

El módulo entero va de eso: cómo se localiza un elemento sin ambigüedad, y por qué no hace falta esperar a mano.

---

## 1. Ejecutar la suite

Playwright se ejecuta desde la línea de comandos. El proyecto trae [12 scripts en `package.json`](../../../package.json) que son atajos de lo mismo:

```bash
npm test                      # todo: 79 tests × 3 navegadores = 237 ejecuciones
npm run test:chromium         # un solo navegador
npm run test:demo:green       # solo los tests que deberían pasar
npm run test:demo:fail        # solo los 10 que fallan a propósito
npm run test:headed           # con el navegador visible
npm run test:report           # abre el informe HTML de la última ejecución
```

Y las cuatro opciones del CLI que vas a usar a diario:

| Opción | Qué hace | Ejemplo |
|---|---|---|
| *(ruta)* | Ejecuta un fichero concreto | `npx playwright test tests/login.spec.ts` |
| `--project` | Elige el navegador | `--project=chromium` |
| `--grep` / `--grep-invert` | Filtra por nombre o por tag | `--grep @demo-fail` |
| `--headed` | Muestra el navegador | — |

**Los tags.** Diez tests del proyecto están marcados así:

```typescript
test('debería mostrar 6 productos en el inventario', { tag: '@demo-fail' }, async () => {
```

Eso es lo que permite partir la suite en dos con `--grep` y `--grep-invert`. La *estrategia* de etiquetado es el módulo 07; aquí solo la usas.

**Ábrelo:** [`package.json:5-13`](../../../package.json) — los 12 scripts. Lee qué hay realmente detrás de `test:demo:green`.

---

## 2. Interpretar lo que devuelve

Una ejecución completa en Chromium tarda **~22 segundos** y termina así:

```
  69 passed
  10 failed
```

**Los 10 fallos son correctos.** Están puestos a propósito, cada uno con su comentario:

```typescript
// ⚠️ FALLO INTENCIONADO: Cambiar 5 por 6 para revertir
```

Su diagnóstico es el módulo 04. Aquí solo tienes que saber que existen y **no arreglarlos**: si alguien los "corrige", ese módulo se queda sin ejercicios.

### El informe HTML

`playwright.config.ts` configura tres reporters. El HTML se abre con `npm run test:report` y por cada fallo te da: el test, la línea, el mensaje de la aserción, y —cuando el fallo ocurre— el **trace** y el **vídeo**, porque la configuración los guarda con `retain-on-failure`. En este módulo basta con saber que están ahí; abrirlos y explotarlos es el módulo 04.

### Las tres clases de rojo

La distinción más útil que te llevas del módulo, y la primera pregunta que debes hacerte ante un test en rojo:

| Clase de fallo | Cómo se reconoce | Ejemplo real |
|---|---|---|
| **Fallo de aserción** | El elemento se encontró; el valor no era el esperado. `Expected: 6 / Received: 5` | Los 10 `@demo-fail` del proyecto |
| **Fallo de locator** | El elemento no se encontró, o se encontraron varios. `Timeout … waiting for locator` o `strict mode violation` | El Lab 5, casos A y B |
| **Fallo de la aplicación** | El test es correcto y la aplicación se comporta mal | El bug real de `problem_user`: solo 3 de 6 productos responden al botón |

Confundir las tres es lo que hace que una suite acabe con `expect` retocados hasta que todo esté verde. **Un rojo es información. Borrarlo sin entenderlo es tirar la información.**

**Ábrelo:** [`tests/problem-user-cart.spec.ts:44-47`](../../../tests/problem-user-cart.spec.ts) — un test que **espera** el bug de la aplicación, con el bug documentado en el mensaje de la aserción.

---

## 3. Auto-waiting: por qué nadie espera

En 79 tests de este proyecto hay **cero** `waitForTimeout`, **cero** `waitForSelector` y **cero** `waitForLoadState`. No es un descuido: es cómo funciona Playwright.

Dos mecanismos, y conviene no mezclarlos:

**1. Las acciones esperan a que el elemento sea accionable.** `click()`, `fill()` y `selectOption()` no actúan a ciegas: antes comprueban que el elemento está adjunto al DOM, visible, estable, habilitado y que recibe eventos. Si no lo está, reintentan hasta agotar el timeout.

**2. Las aserciones web-first reintentan la comprobación.** `await expect(locator).toHaveText('1')` no mira una vez: vuelve a mirar cada pocos milisegundos hasta que se cumple o hasta agotar los **5 segundos** de timeout por defecto.

Con eso, `waitForTimeout` sobra siempre. Medido en la construcción de este módulo, mismo test y mismo resultado:

| Versión | Duración |
|---|---|
| Sin espera explícita | **277 ms** |
| Con `await page.waitForTimeout(3000)` | **3.334 ms** |

Doce veces más lento, cero fiabilidad ganada. Y con la trampa de siempre: el día que la aplicación tarde 3,5 s, el test falla igual — solo que ahora, además, tarda.

### Los métodos que NO reintentan

No todo lo que devuelve un valor espera. Estos consultan **el instante**:

```typescript
const visible = await locator.isVisible();     // true o false, ahora mismo
const texto   = await locator.textContent();   // el texto que hubiera ahora
```

`isVisible()` no espera nada en absoluto. `textContent()` espera a que el elemento exista, pero devuelve el primer valor que lea, sin reintentar si no es el esperado. Ninguno de los dos es "malo": son consultas, no aserciones. El problema aparece cuando se usan **como si** fueran aserciones.

Medido: con `performance_glitch_user` —un usuario real de la aplicación cuya página tarda **~5,1 segundos** en cargar— si se consulta mientras la navegación está en curso, `isVisible()` devuelve `false` y la aserción web-first equivalente pasa sin problema.

### Timeouts locales

Cuando la lentitud es del negocio y no del test, se sube el timeout **de esa aserción**, no se mete una espera fija:

```typescript
await expect(inventoryPage.cartBadge, '…').toHaveText('1', { timeout: 15000 });
```

Diferencia clave: `waitForTimeout(15000)` gasta 15 s **siempre**; `{ timeout: 15000 }` gasta lo que haga falta y sigue en cuanto se cumple.

**Ábrelo:** [`tests/performance-glitch-user-cart.spec.ts`](../../../tests/performance-glitch-user-cart.spec.ts) — los 4 únicos timeouts locales de la suite, y el usuario lento que los justifica. Y [`tests/problem-user-cart.spec.ts:53-54,77-78`](../../../tests/problem-user-cart.spec.ts) — los 4 únicos métodos sin reintento.

---

## 4. Aserciones web-first, y las otras

Las cinco que usa el proyecto, con su cuenta real:

| Aserción | Usos | Cuándo |
|---|---|---|
| `toBeVisible()` / `not.toBeVisible()` | 53 | El elemento está (o no) a la vista |
| `toHaveText()` | 46 | Texto **exacto** del elemento |
| `toHaveURL()` | 24 | La navegación acabó donde debía |
| `toHaveCount()` | 13 | Cuántos elementos resuelve un locator |
| `toContainText()` | 13 | El texto **contiene** un fragmento |

**`toHaveText` vs `toContainText`.** El primero compara el texto completo; el segundo, una parte. Usa `toContainText` cuando el elemento incluye texto que no controlas (un mensaje de error con prefijos, un contenedor con varios hijos) y `toHaveText` cuando quieres blindar el valor exacto. `toContainText` es más tolerante — y por eso también más ciego: `toContainText('1')` pasaría con `'19'`.

**`toHaveURL` con string o con expresión regular.** Con string, la comparación es exacta y completa; con regex, parcial y flexible. La suite usa las dos: `toHaveURL(/.*\/inventory\.html$/)` para el final de la URL y `toHaveURL('https://www.saucedemo.com/')` cuando quiere el valor entero.

**Aserciones que NO son web-first.** Cuando el valor ya está en una variable, ya no hay nada que reintentar:

```typescript
const names = await inventoryPage.getProductNames();   // aquí se resuelve la consulta
expect(names, '…').toHaveLength(6);                    // sin await: es un array normal
```

Regla práctica: si el `expect` recibe un **locator o la página**, lleva `await` y reintenta. Si recibe un **valor ya obtenido**, no lleva `await` y no reintenta.

### Los mensajes descriptivos

El rasgo más valioso de esta suite: casi todas sus aserciones llevan un segundo argumento en castellano.

```typescript
await expect(
  inventoryPage.cartBadge,
  'El badge debería mostrar 1 tras añadir la Sauce Labs Backpack con problem_user — un fallo aquí confirma el bug conocido de este usuario',
).toHaveText('1');
```

Es lo que convierte un fallo de CI a las tres de la mañana en información aprovechable sin abrir el código. **En este módulo es obligatorio**: toda aserción que escribas lleva mensaje, y el mensaje se redacta en lenguaje de negocio, no en lenguaje de DOM. "El carrito debería contener 1 producto", no "el locator debería tener count 1".

**Ábrelo:** [`tests/cart-badge.spec.ts`](../../../tests/cart-badge.spec.ts) — cuatro tipos de aserción distintos en un solo fichero, todos con mensaje.

---

## 5. Elegir un locator: los cinco criterios

Aquí empieza el núcleo del módulo.

Un locator es una **descripción de cómo encontrar un elemento**, evaluada cada vez que se usa. No es una referencia al elemento: es la receta para volver a encontrarlo.

Playwright ofrece varias estrategias y su documentación propone una jerarquía. La jerarquía es un buen punto de partida, pero **la decisión final depende del HTML que te dan**, y este módulo se apoya en una medición concreta: 20 elementos de la aplicación probados con 7 estrategias cada uno.

| Estrategia | Funciona en | Comentario |
|---|---|---|
| `getByTestId` (con configuración) | **20 de 20** | Requiere una línea de config; ver §8 |
| CSS por atributo `[data-test="…"]` | 20 de 20 | Lo que hace el proyecto, 66 veces |
| `getByRole` | 12 de 20 | Perfecto en botones y campos; **inútil en los títulos** |
| `getByText` | 8 de 20 | Acoplado al idioma y al copy |
| `getByPlaceholder` | 5 de 5 campos de texto | El único texto visible de los inputs |
| **`getByLabel`** | **0 de 20** | La aplicación **no tiene ni un `<label>`** |

Los **cinco criterios** con los que se decide, y que vas a usar literalmente en la tabla del Lab 3:

| Criterio | Pregunta | Ejemplo medido |
|---|---|---|
| **Robustez** | ¿Sobrevive a un cambio de maquetación? | `.cart_item` es una clase **de estilo**: cambia al rediseñar |
| **Semántica** | ¿Localiza como lo haría una persona? | `getByRole('button', { name: 'Login' })` |
| **Accesibilidad** | ¿Qué me dice sobre la calidad del HTML? | Cero `<label>` en las cinco pantallas |
| **Mantenibilidad** | ¿Seguirá siendo unívoco mañana? | `getByRole('combobox')` funciona **porque solo hay uno** |
| **Contexto** | ¿Hay ambigüedad que acotar? | **6** botones "Add to cart" idénticos |

> **Un locator que funciona hoy no es necesariamente un buen locator.** Un test en verde no dice nada sobre mantenibilidad. Esa es la idea que separa a quien escribe tests de quien mantiene una suite.

**Ábrelo:** [`locator-reference.md`](locator-reference.md) — la tabla de decisión completa, elemento por elemento. Es el documento que te llevas a tu trabajo.

---

## 6. `getByRole`: la primera opción

Localiza por el **rol de accesibilidad** del elemento y por su **nombre accesible** — es decir, por lo mismo que usa un lector de pantalla.

```typescript
page.getByRole('button', { name: 'Login' })
page.getByRole('textbox', { name: 'Username' })
page.getByRole('heading', { name: 'Thank you for your order!' })
```

Por qué se prefiere: si el rol o el nombre cambian, es que ha cambiado **lo que la persona usuaria percibe**, y entonces el test *debe* enterarse. Un cambio de clase CSS, en cambio, no debería romper nada.

Dónde funciona en esta aplicación, medido: los 3 campos y el botón del login, los 3 campos y los botones del checkout, el botón Checkout del carrito, el `combobox` de ordenación y el mensaje de confirmación. **12 de 20 elementos.**

Y dónde **no**:

- **Los títulos de página no son headings.** `getByRole('heading', { name: 'Products' })` resuelve **0 elementos**. "Products" y "Your Cart" son `<span class="title" data-test="title">`. El único heading real de todo el flujo es el `<h2>` "Thank you for your order!" de la confirmación.
- **Los nombres accesibles a veces sorprenden.** El botón Cancel del checkout se llama **"Go back Cancel"**: su nombre concatena el texto alternativo de un icono con el texto del botón. `getByRole('button', { name: 'Cancel', exact: true })` resuelve **0**.

Moraleja operativa: **el nombre accesible se comprueba, no se supone.**

**Ábrelo:** [`tests/checkout.spec.ts:34`](../../../tests/checkout.spec.ts) — el **único** `getByRole` de los 79 tests, y da la casualidad de que apunta al único heading real de la aplicación.

---

## 7. `getByPlaceholder`, el nombre accesible… y el caso `getByLabel`

Los campos de esta aplicación no tienen etiqueta. Ninguno. **Cero `<label>` en las cinco pantallas.**

Y sin embargo `getByRole('textbox', { name: 'Username' })` funciona. ¿De dónde sale ese nombre? Del **`placeholder`**. Cuando un input no tiene `<label>` ni `aria-label`, el navegador usa el `placeholder` como nombre accesible. Por eso estas dos líneas localizan exactamente el mismo elemento:

```typescript
page.getByRole('textbox', { name: 'Username' })   // por rol + nombre accesible
page.getByPlaceholder('Username')                 // por el atributo placeholder
```

No es casualidad ni redundancia: es la misma información leída de dos maneras.

### `getByLabel`: la estrategia que la documentación recomienda y aquí no puedes usar

`getByLabel()` es, en la mayoría de aplicaciones, la mejor forma de localizar un campo de formulario. Aquí resuelve **0 elementos en los 20 probados**, porque no hay ni una etiqueta que asociar.

**Y esto no es un problema del test: es un defecto de accesibilidad de la aplicación.** Un `placeholder` desaparece al escribir; una etiqueta permanece. Una persona que use lector de pantalla y vuelva a un formulario a medio rellenar pierde la referencia de qué campo está tocando.

De ahí las cuatro preguntas del bloque 3.3 del Lab 3, que no llevan código:

1. ¿Por qué `getByLabel('Username')` no encuentra nada?
2. ¿Qué evidencia del HTML lo demuestra?
3. ¿Qué implica para una persona usuaria de lector de pantalla?
4. ¿Qué le pedirías al equipo de desarrollo, y con qué argumento?

**La lección de criterio del módulo:** la elección de locator no depende del ideal de la documentación, depende del HTML que te dan. Y cuando el HTML te limita, eso mismo es un hallazgo de calidad que reportar.

**Ábrelo:** la propia aplicación. Inspecciona el campo Username en el navegador y busca su `<label>`. No está.

---

## 8. `getByTestId` y `testIdAttribute`

El proyecto escribe **66 veces** esto:

```typescript
this.page.locator('[data-test="username"]')
```

Playwright tiene una forma más corta: `page.getByTestId('username')`. Pero por defecto busca el atributo `data-testid`, y esta aplicación usa `data-test`. Medido:

| Configuración | `getByTestId('username')` resuelve |
|---|---|
| Por defecto | **0 elementos** |
| Con `testIdAttribute: 'data-test'` | **1 elemento** ✅ |

Una línea en la configuración:

```typescript
use: {
  testIdAttribute: 'data-test',
}
```

Con ella, los 66 selectores CSS del proyecto podrían escribirse como `getByTestId(…)`. **El sandbox del módulo 01 ya la trae**; el `playwright.config.ts` de la raíz **no**, y no se toca.

¿Por qué es preferible un atributo dedicado a una clase o un id? Porque es un **contrato explícito**: `data-test` existe para los tests y quien lo cambia sabe que rompe tests. Una clase CSS existe para el estilo, y quien la cambia está pensando en otra cosa.

**Ábrelo:** [`learning/student/sandbox/01-playwright/playwright.config.ts`](../../student/sandbox/01-playwright/playwright.config.ts) — la línea, comentada, en la configuración con la que trabajas.

---

## 9. `getByText`, CSS y XPath

**`getByText`** localiza por el texto visible. Útil para mensajes y enlaces, arriesgado como estrategia general: se rompe al traducir la aplicación o al cambiar una coma. Funciona en 8 de los 20 elementos probados.

**CSS.** Es lo que hace el proyecto y no está mal — depende del selector:

| Selector | Ejemplo real | Valoración |
|---|---|---|
| Por atributo de test | `[data-test="username"]`, 66 usos | ✅ Contrato explícito |
| Por `id` | `#react-burger-menu-btn`, 3 usos en `menu.page.ts` | ⚠️ Aceptable: la aplicación no expone `data-test` en el menú |
| Por clase de estilo | `.cart_item`, **12 usos en 5 ficheros** | ❌ Frágil: es un selector de maquetación usado como contrato |

**XPath.** Funciona en todos los elementos probados y aun así es la última opción. Motivo: describe una **ruta en el árbol** (`//div[3]/span[2]/a`), y esa ruta cambia en cuanto alguien envuelve algo en un `<div>`. Además no dice nada sobre la intención. El proyecto no usa XPath ni una sola vez, y hace bien. Se nombra aquí para que sepas reconocerlo y para que sepas por qué no lo eliges.

**Ábrelo:** [`pages/menu.page.ts:7,12,18`](../../../pages/menu.page.ts) — los tres selectores por `id` del proyecto, y la razón de que sean la excepción.

---

## 10. Strict mode: la ambigüedad no se tapa

Playwright funciona en **modo estricto**: si un locator resuelve más de un elemento y pides una acción, falla en vez de elegir por ti.

Caso real de esta aplicación: cada producto del catálogo tiene **dos** enlaces con el mismo nombre accesible — el de la imagen y el del título.

```
Error: strict mode violation: getByRole('link', { name: 'Sauce Labs Backpack' })
resolved to 2 elements:
  1) <a href="#" id="item_4_img_link" data-test="item-4-img-link">…</a>
  2) <a href="#" id="item_4_title_link" data-test="item-4-title-link">…</a>
```

El error es **una función, no una molestia**: te está diciendo que tu descripción del elemento no es suficiente. Y encima te enseña los dos candidatos.

### Lo que NO se hace

```typescript
page.getByRole('link', { name: 'Sauce Labs Backpack' }).first()   // ❌
```

`.first()` hace desaparecer el error sin resolver la ambigüedad. El test seguirá pulsando "uno de los dos", y el día que cambie el orden del DOM pulsará el otro sin avisar. La pregunta de cierre del Lab 5 es exactamente esa: *el error ha desaparecido — ¿ha desaparecido el problema?*

`.first()`, `.nth()` y `.last()` tienen un uso legítimo: cuando el orden **es** el criterio ("el primer resultado de la búsqueda"). Si el orden no es el criterio, son un síntoma.

**Ábrelo:** [`tests/cart-sync.spec.ts:32`](../../../tests/cart-sync.spec.ts) — el único `.first()` de la suite, en una aserción que por eso comprueba muy poco: "el nombre del primer ítem debería ser visible", sin decir de qué producto.

---

## 11. Encadenado y `filter()`: acotar en vez de rendirse

La forma correcta de resolver la ambigüedad es **acotar el contexto**: primero el contenedor, después el elemento dentro de él.

```typescript
await page
  .getByTestId('inventory-item')                       // las 6 tarjetas
  .filter({ hasText: 'Sauce Labs Fleece Jacket' })     // la que contiene ese texto
  .getByRole('button', { name: 'Add to cart' })        // su botón: 1 elemento
  .click();
```

Se lee como se piensa: *"en la tarjeta de la Fleece Jacket, pulsa Add to cart"*. Y es robusto: no depende del orden de las tarjetas ni del `data-test` completo del botón.

Hay dos sintaxis equivalentes para lo mismo, y el proyecto usa las dos:

```typescript
page.locator('[data-test="inventory-item-name"]', { hasText: name })   // opción del locator
page.getByTestId('inventory-item').filter({ hasText: name })           // método .filter()
```

**Este es el patrón más valioso del módulo.** Con él se resuelven **todas** las ambigüedades detectadas en la aplicación.

**Ábrelo:** [`tests/product-detail-add-to-cart.spec.ts:117-121`](../../../tests/product-detail-add-to-cart.spec.ts) — el único encadenado con `filter` de la suite, y [`pages/inventory.page.ts:33`](../../../pages/inventory.page.ts) — la otra sintaxis.

---

## 12. Robustos, frágiles y muertos

Tres categorías, y la tercera es la que casi nadie enseña.

**Robusto.** Se apoya en algo que solo cambia si cambia el comportamiento: un rol, un nombre accesible, un atributo de test.

**Frágil.** Funciona hoy y depende de algo que puede cambiar sin que cambie el comportamiento: una clase de estilo, una posición, un texto traducible. Ejemplo medido: `getByRole('combobox')` localiza el desplegable de ordenación **solo porque es el único de la página** — no tiene `id`, ni `aria-label`, ni `<label>`. El día que alguien añada un segundo desplegable, ese locator empieza a resolver 2 elementos y todos los tests que lo usan se caen a la vez.

**Muerto.** Un locator que **no encuentra nada** — y del que nadie se entera porque ningún test lo usa. En este repositorio hay uno:

```typescript
// pages/cart.page.ts:7
this.cartItems = this.page.locator('[data-test="cart-item"]');
```

Ese atributo **no existe** en la aplicación. Resuelve 0 elementos, siempre. El HTML real del ítem de carrito es `<div class="cart_item" data-test="inventory-item">`. Y **ningún test usa `CartPage.cartItems`**: los 12 usos de `.cart_item` repartidos en 5 specs son el rodeo que alguien tomó cuando el locator del Page Object no funcionó.

> **La lección:** un locator que no encuentra nada es **invisible hasta que alguien lo ejecuta**. Un test roto grita; un locator sin usar, no. Por eso el código de test también necesita ser ejercitado.

Este defecto **no se corrige**. Es el caso B del Lab 5 y material del módulo 02, donde se razona sobre qué falla en la arquitectura para que algo así pase desapercibido.

**Ábrelo:** [`pages/cart.page.ts:7`](../../../pages/cart.page.ts) y, al lado, [`tests/cart-edge-cases.spec.ts`](../../../tests/cart-edge-cases.spec.ts) — el Page Object declara un locator y los tests usan otro. Ahora ya sabes por qué.

---

## 13. Anatomía de un spec y aislamiento

Los 14 ficheros de `tests/` tienen la misma forma:

```typescript
import { test, expect } from '@playwright/test';   // 1. imports
import { LoginPage } from '../pages/login.page';

test.describe('Login', () => {                     // 2. agrupación
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {            // 3. preparación común
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('debería …', async ({ page }) => {          // 4. el caso
    …
  });
});
```

**Cada test recibe su propia `page`**, en un contexto de navegador limpio: sin cookies ni sesión de los demás. Por eso los 13 `beforeEach` de la suite hacen login por UI en cada test y por eso los tests pueden ejecutarse en paralelo (`fullyParallel: true`) sin pisarse. Que ese login repetido sea caro es cierto, y tiene solución — `storageState`, módulo 03.

El único fichero sin `beforeEach` es [`tests/route-protection.spec.ts`](../../../tests/route-protection.spec.ts): comprueba qué pasa al entrar por URL **sin** sesión, así que un `beforeEach` que hiciera login destruiría el caso. **El hook responde a una necesidad, no a un ritual.**

**Qué heredas de `playwright.config.ts` sin escribirlo:** `baseURL` (por eso `goto('/')` funciona), los tres navegadores, `trace` y `video` en fallo, `fullyParallel`, y los valores por defecto de Playwright que el proyecto no toca: timeout de test 30 s, timeout de aserción 5 s, `retries: 0` en local y 2 en CI.

**Ábrelo:** [`playwright.config.ts`](../../../playwright.config.ts) entero. Son 31 líneas y cada una tiene un efecto observable.

---

## 14. Lo que existe en Playwright y aquí no vas a ver

Para que no creas que te falta materia:

| Tema | Por qué no está aquí |
|---|---|
| `check`/`uncheck`, subida de ficheros, arrastrar, diálogos | **No existen ni en el repositorio ni en la aplicación.** Enseñarlos exigiría inventar ejemplos |
| Teclado (`press`, `type`) y `hover` | Sin uso en el proyecto; se nombran y ya |
| `BrowserContext`, multi-pestaña, `storageState` | Módulo 03 |
| Trace viewer, `page.pause()`, `test.step` | Módulo 04 |
| `page.route`, mocking, API | Módulo 05 |
| Soft assertions (`expect.soft`), política de reintentos | Módulos 04 y 07 |

---

## Una nota sobre HDI

El formulario de checkout de esta tienda —dos pasos, validación por campo, mensajes de error, resumen de importes calculados— es **estructuralmente idéntico** a un alta de póliza: datos del tomador, validación, cálculo de prima e impuestos, confirmación. Lo que aprendas aquí sobre localizar campos, elegir aserciones y verificar importes se traslada tal cual. El contexto asegurador entra en el módulo 09; la forma del problema es la misma desde hoy.

---

## Antes de empezar los Labs

Tres reglas, las mismas de siempre:

1. **Solo se trabaja en `learning/student/sandbox/01-playwright/`.** `tests/` y `pages/` son de lectura, incluido el locator roto de `cart.page.ts`.
2. **Nunca se modifica una aserción para llegar a verde.** Si un test falla, el problema está en el código o en el locator.
3. **Diagnosticar antes que corregir.** En el Lab 5 el informe se escribe **antes** de tocar nada.
