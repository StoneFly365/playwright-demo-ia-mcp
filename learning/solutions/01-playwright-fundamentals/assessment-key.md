# 🔒 Clave de corrección — Assessment Módulo 01

**Material del formador. No compartir con el grupo.**

**Total: 100 puntos · Aprobado: 70 · Y apto en la Parte C**

Todo el código de esta clave está **ejecutado y verificado** contra la aplicación real en Chromium.

---

## Parte A — Conceptual (30 puntos)

### A1 — 30 fallos tras `npm test` (3 p)

**Respuesta:** 30 = 10 fallos intencionados × 3 navegadores. La suite está **roja a propósito**, no rota. Comprobación: `npm run test:demo:green` (debe dar 69 verdes) y, si se quiere, `npm run test:demo:fail` (10 rojos).

| Puntos | Criterio |
|---|---|
| 3 | Explica el 30 = 10 × 3 **y** propone `test:demo:green` como comprobación |
| 2 | Dice que son intencionados pero no relaciona el número ni propone comprobación |
| 0 | Concluye que la suite está rota, o propone "arreglar" los fallos |

### A2 — `expect(...).toBeVisible()` frente a `isVisible()` (4 p)

**Respuesta:** la primera es una **aserción web-first**: reintenta la comprobación hasta que se cumple o hasta agotar su timeout (5 s por defecto), y **falla el test** si no se cumple. La segunda es una **consulta**: devuelve el estado del instante, no espera nada, no reintenta y **no hace fallar nada** — solo devuelve `true` o `false`.

| Puntos | Criterio |
|---|---|
| 4 | Nombra el reintento con timeout **y** que una asevera mientras la otra solo informa |
| 2 | Solo una de las dos mitades |
| 0 | Dice que son equivalentes, o que `isVisible()` "espera un poco" |

### A3 — El `waitForTimeout(3000)` (4 p)

**(a)** No. Si la aplicación tarda 3,1 s el test falla igual: ha movido el límite, no lo ha eliminado.
**(b)** 3 segundos por ejecución, **siempre**, se necesiten o no. En una suite de 79 tests, minutos.
**(c)** Nada: la aserción web-first ya reintenta. Y si la lentitud es real y conocida, `{ timeout: 15000 }` **en esa aserción** — que gasta lo que haga falta y sigue en cuanto se cumple, en lugar de gastar siempre lo mismo.

| Puntos | Criterio |
|---|---|
| 4 | Las tres, y en (c) distingue timeout local de espera fija |
| 2-3 | (a) y (b) bien, (c) incompleta |
| 0 | Dice que sí resuelve la intermitencia |

### A4 — El `combobox` sin nombre accesible (4 p)

**(a)** Porque es el **único** elemento con rol `combobox` de la página: el locator resuelve 1 elemento por eliminación, no por precisión.
**(b)** Al añadirse un segundo desplegable (un filtro, por ejemplo) pasaría a resolver 2 y fallaría con **strict mode violation** — en todos los tests que lo usen, a la vez, sin que exista ningún bug.
**(c)** Cualquiera de las dos, **si nombra el riesgo**: mantenerlo consciente de que es una apuesta sobre la evolución del HTML, o cambiar a `getByTestId('product-sort-container')` ganando estabilidad y perdiendo semántica.

| Puntos | Criterio |
|---|---|
| 4 | Las tres, y en (b) anticipa el fallo **masivo y simultáneo** |
| 2 | (a) correcta, (b) o (c) flojas |
| 0 | Dice que el locator es robusto porque está en verde |

### A5 — El botón "Add to cart" de la Onesie (4 p)

**Respuesta:**

```typescript
page.getByTestId('inventory-item')
    .filter({ hasText: 'Sauce Labs Onesie' })
    .getByRole('button', { name: 'Add to cart' })
```

*(También vale `getByTestId('add-to-cart-sauce-labs-onesie')`.)*

**Por qué el de su compañero es peor:** `.first()` combinado con una ordenación previa acopla el test **al orden**, no al producto. Si cambia la ordenación por defecto o entra un producto nuevo, el test sigue **en verde** añadiendo otra cosa. Un test que cambia de significado en silencio es peor que uno que falla.

| Puntos | Criterio |
|---|---|
| 4 | Locator acotado correcto **y** explica que el peligro es el falso verde |
| 2 | Locator correcto, justificación floja ("es más limpio") |
| 0 | Propone `.first()` o un XPath posicional |

### A6 — `toHaveText` frente a `toContainText` (4 p)

**(a)** El mensaje de error se comprueba con `toContainText` porque el contenedor incluye texto e iconos que no controla el test y basta con verificar el fragmento que importa. El contador se comprueba con `toHaveText` porque su valor exacto **es** lo verificado.
**(b)** `toContainText('1')` pasaría también con `'19'`, `'11'` o `'21'`: el contador podría estar equivocado y el test seguiría en verde.

| Puntos | Criterio |
|---|---|
| 4 | Ambas, con un ejemplo concreto de falso positivo en (b) |
| 2 | (a) correcta, (b) genérica ("es menos estricto") |
| 0 | Los invierte |

### A7 — Lo que se hereda sin escribirlo (4 p)

**Respuesta:** dos cualesquiera de:

- **Timeout de aserción: 5.000 ms** — se ve al fallar: `Timeout 5000ms exceeded` en el mensaje.
- **Timeout de test: 30.000 ms** — `Test timeout of 30000ms exceeded`.
- **`retries: 0` en local** (2 en CI) — se ve en que un fallo no se reintenta.
- **`workers` por defecto** según los núcleos de la máquina — se ve en la cabecera: `Running N tests using M workers`.

| Puntos | Criterio |
|---|---|
| 4 | Dos valores correctos **con** dónde se observa su efecto |
| 2 | Dos valores sin el efecto observable, o uno completo |
| 0 | Responde "no hay timeouts porque no están escritos" |

### A8 — Dos rojos, dos clases (3 p)

**Respuesta:** `Expected: 6 / Received: 5` es un **fallo de aserción**: el elemento se encontró y el valor no coincide; se empieza por decidir quién tiene razón, el test o la aplicación. `strict mode violation … resolved to 2 elements` es un **fallo de locator**: la descripción no identifica un único elemento; se empieza por acotar el locator, nunca por añadir `.first()`.

| Puntos | Criterio |
|---|---|
| 3 | Ambas clases correctas **y** el primer paso de cada una |
| 2 | Clases correctas, sin el primer paso |
| 0 | Llama "fallo de la aplicación" al de strict mode |

---

## Parte B — Práctica (70 puntos)

### E1 — Escribir (40 p) · Solución verificada

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../../pages/login.page';
import { InventoryPage } from '../../../../pages/inventory.page';

function aNumero(texto: string): number {
  return parseFloat(texto.replace(/[^0-9.]/g, ''));
}

test.describe('Assessment E1 — el producto más barato', () => {
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
  });

  test('debería añadir al carrito el producto más barato con su precio correcto', async ({ page }) => {
    const nombres = await inventoryPage.getProductNames();
    const precios = (await inventoryPage.getProductPrices()).map(aNumero);
    const indice = precios.indexOf(Math.min(...precios));
    const nombreMasBarato = nombres[indice];
    const precioMasBarato = precios[indice];

    // Acotado por la tarjeta del producto (criterio: contexto — hay 6 botones idénticos).
    await page
      .getByTestId('inventory-item')
      .filter({ hasText: nombreMasBarato })
      .getByRole('button', { name: 'Add to cart' })   // criterio: semántica
      .click();

    await expect(
      inventoryPage.cartBadge,
      'El contador del carrito debería mostrar 1 producto tras añadir el más barato del catálogo',
    ).toHaveText('1');

    await inventoryPage.navigateToCart();

    await expect(
      page.getByTestId('inventory-item'),     // criterio: robustez — atributo de test
      'El carrito debería contener exactamente una línea de producto',
    ).toHaveCount(1);
    await expect(
      page.getByTestId('inventory-item-name'),
      `El carrito debería contener el producto más barato del catálogo, la ${nombreMasBarato}`,
    ).toHaveText(nombreMasBarato);
    await expect(
      page.getByTestId('inventory-item-price'),
      'El precio en el carrito debería coincidir con el que muestra el catálogo',
    ).toHaveText(`$${precioMasBarato.toFixed(2)}`);
  });
});
```

**Verificado:** en verde. El producto más barato del catálogo es la **Sauce Labs Onesie, $7.99**.

| Criterio | Puntos | Sólido | Insuficiente |
|---|---|---|---|
| Locators y justificación escrita | 12 | Dos o más estrategias, cada una con criterio en el comentario | Todo `[data-test]` sin justificar |
| Aserciones adecuadas | 10 | `toHaveCount` + `toHaveText` sobre nombre y precio | Solo `toBeVisible` |
| Mensajes de negocio | 6 | Se entienden sin abrir el código | "el locator debería tener count 1" |
| Estructura y uso del POM | 6 | `describe` + `beforeEach` + Page Objects existentes | Login reescrito a mano |
| Verde | 6 | Pasa en Chromium | — |

**Penalizaciones específicas de E1:**

- **Escribir el nombre o el precio a mano** (`'Sauce Labs Onesie'`, `'$7.99'`) en lugar de deducirlo: **−10**. Es la restricción principal del ejercicio.
- Leer el precio esperado **de la propia página del carrito** que está verificando: **−8**. Es el problema de oráculo del Lab 2.
- `.first()` para el producto: **−4**.

> **Alternativa válida:** ordenar con `sortBy('lohi')` y tomar el primer producto. Es correcta **si** después identifica al producto por su nombre y no por su posición. Si añade al carrito "el primero" con `.first()`, se aplica la penalización.

### E2 — Diagnosticar (30 p)

#### Fallo 1 — Locator ambiguo

**Síntoma verificado:**

```
Error: expect(locator).toHaveText(expected) failed
Locator: getByTestId('inventory-item-price')
Expected: "$7.99"
```

**Causa raíz:** `getByTestId('inventory-item-price')` resuelve **6 elementos** —los seis precios del catálogo—, no el de la Onesie. Una aserción de texto con un valor único exige un locator que identifique un único elemento.

**Corrección verificada:**

```typescript
await expect(
  page.getByTestId('inventory-item')
      .filter({ hasText: 'Sauce Labs Onesie' })
      .getByTestId('inventory-item-price'),
  'La Sauce Labs Onesie debería mostrarse en el catálogo con un precio de 7,99 dólares',
).toHaveText('$7.99');
```

**Cómo evitarlo:** `count()` antes de usar un locator nuevo.

#### Fallo 2 — Timeout de test por debajo de la latencia conocida

**Síntoma verificado:**

```
Test timeout of 3000ms exceeded.
```

**Causa raíz:** `test.setTimeout(3000)` fija el presupuesto del **test entero** en 3 s, y `performance_glitch_user` tarda ~5,1 s solo en cargar el catálogo. No es un fallo de la aplicación ni del locator: el test se ha impuesto un límite inferior a la latencia conocida del usuario que ha elegido.

**Corrección verificada:** eliminar el `test.setTimeout(3000)` —el valor por defecto de 30 s basta— o subirlo explícitamente si se quiere dejar el límite documentado:

```typescript
test.setTimeout(30000);   // este usuario tiene una latencia conocida de ~5 s
```

**Cómo evitarlo:** el timeout se ajusta **a la lentitud conocida**, no a la impaciencia. Y nunca se compensa con `waitForTimeout`, que solo consumiría más del presupuesto ya agotado.

| Criterio | Puntos | Sólido | Insuficiente |
|---|---|---|---|
| Diagnóstico del fallo 1 | 10 | Nombra los 6 elementos y la necesidad de acotar | "El locator estaba mal" |
| Diagnóstico del fallo 2 | 10 | Relaciona el presupuesto de 3 s con los ~5 s del usuario | "Tardaba mucho" |
| Correcciones en el sitio correcto | 8 | Acotar + ajustar el timeout, sin tocar aserciones | — |
| Ambos en verde | 2 | — | — |

**Penalizaciones:**

- Modificar una aserción, su valor esperado o su mensaje: **−12**.
- Resolver el fallo 1 con `.first()`, `.nth()` o `.last()`: **−6**.
- "Corregir" el fallo 2 con `waitForTimeout`: **−6** *(no funciona: consume del mismo presupuesto de 3 s)*.
- Cambiar `performance_glitch_user` por `standard_user`: **−10**. Hace desaparecer el rojo eliminando el caso de prueba, que es la versión más sofisticada de borrar la señal.

---

## Parte C — Defensa técnica

Rúbrica completa en el [enunciado del assessment](../../modules/01-playwright-fundamentals/assessment/). **Se defiende sobre el `decisiones.md` del Challenge** —único entregable que cubre P8—, con el `03-decisiones.md` del Lab 3 como apoyo; sin Challenge entregado, la defensa se aplaza. Ejemplos de calibración:

| Respuesta del alumno | Nivel |
|---|---|
| "Usé `data-test` porque es lo que usa el proyecto" | **No demostrado** |
| "Usé `getByRole` porque es lo que recomienda Playwright" | **No demostrado** — es una autoridad, no un criterio |
| "Usé `getByRole('button', { name: 'Login' })` porque si cambia el texto del botón es que ha cambiado lo que ve el usuario y quiero enterarme; descarté `data-test` porque aquí el rol ya es unívoco" | **Sólido** |
| "Acoté por la tarjeta porque había 6 botones iguales; con `.first()` el test seguiría en verde el día que cambie el orden, y eso es peor que fallar" | **Sólido** |
| "Fallaba el locator" *(como causa raíz)* | **No demostrado** — es el síntoma |
| "El locator resolvía 2 elementos porque cada producto tiene enlace de imagen y de título; el strict mode solo era donde se notaba" | **Sólido** |

## Escala

| Puntuación | Parte C | Resultado |
|---|---|---|
| 85-100 | Apto | Superado con holgura |
| 70-84 | Apto | Superado |
| ≥ 70 | No apto | Repite la defensa; no bloquea el módulo 02 |
| 55-69 | — | Refuerzo: repetir Labs 3 y 5 |
| < 55 | — | Sesión de refuerzo antes de continuar |

## Nota sobre la rotación entre ediciones

Si el módulo se imparte varias veces, cambia en E1 el criterio del producto (el más caro en lugar del más barato) y en E2 el fallo 1 (por ejemplo, `getByTestId('inventory-item-name')` con el nombre de otro producto). Las causas raíz siguen siendo las mismas y las respuestas memorizadas dejan de servir.
