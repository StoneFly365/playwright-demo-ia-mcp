# Solución — Lab 5 (TROUBLESHOOT)

**Verificado:** los 2 fallos reproducidos y las 2 correcciones en verde en Chromium. `pages/cart.page.ts` **sin tocar**.

> **Instrucción para el formador:** no publiques este documento hasta que todo el grupo haya entregado su `05-diagnostico.md`. El valor del Lab está en el proceso de diagnóstico, y aquí está el resultado.

---

## Caso A — Ambigüedad (strict mode)

### Diagnóstico de referencia

**Síntoma**

```
Error: strict mode violation: getByRole('link', { name: 'Sauce Labs Backpack' })
resolved to 2 elements:
  1) <a href="#" id="item_4_img_link" data-test="item-4-img-link">…</a>
  2) <a href="#" id="item_4_title_link" data-test="item-4-title-link">…</a>
```

**Hipótesis:** el nombre del producto aparece más de una vez como enlace.

**Comprobación:** `await page.getByRole('link', { name: 'Sauce Labs Backpack' }).count()` → **2**.

**Causa raíz:** cada tarjeta de producto tiene **dos** enlaces con el mismo nombre accesible — el de la imagen y el del título—, ambos hacia la ficha del producto. El locator describe "un enlace que se llama así", y eso no identifica a uno solo. Playwright, en modo estricto, se niega a elegir por su cuenta.

**Corrección** (una de las dos, ambas válidas):

```typescript
// Opción 1 — acotar por la tarjeta y bajar al enlace del título
await page
  .getByTestId('inventory-item')
  .filter({ hasText: 'Sauce Labs Backpack' })
  .getByTestId('item-4-title-link')
  .click();

// Opción 2 — localizar directamente el nombre del producto (más legible)
await page
  .getByTestId('inventory-item-name')
  .filter({ hasText: 'Sauce Labs Backpack' })
  .click();
```

**Ambas verificadas en verde.** La opción 2 es preferible: no depende del `id` numérico del producto (`item-4-…`), que es un detalle de implementación del catálogo.

**Cómo evitarlo:** antes de usar un locator nuevo, `count()`. Si devuelve más de 1 y no esperabas una colección, acota **antes** de escribir la acción.

### Las tres preguntas

1. **Por qué hay dos:** por usabilidad. La imagen y el título llevan a la ficha, y ambos exponen el mismo texto accesible para lectores de pantalla. No es un bug: es una decisión de diseño que el test tiene que respetar.
2. **`.first()` no resuelve nada.** Elimina el error y deja el test pulsando "el que salga primero en el DOM". Hoy es la imagen; si mañana se reordena el marcado, será el título — y el test seguirá **en verde** pulsando otra cosa. Un test que cambia de significado en silencio es peor que uno que falla.
3. **Robustez de la corrección:** ambas opciones identifican **por contenido**, no por posición, así que sobreviven a un cambio de orden de los productos. La opción 1 se rompería si cambiara la numeración interna de los productos; la 2, no.

---

## Caso B — Locator que no encuentra nada

### Diagnóstico de referencia

**Síntoma**

```
Error: expect(locator).toHaveCount(expected) failed
Locator:  locator('[data-test="cart-item"]')
Expected: 1
Received: 0
```

**Hipótesis:** el carrito no tiene el producto… o el locator no apunta a nada.

**Comprobación** (la que decide entre las dos hipótesis):

```typescript
await page.locator('[data-test="cart-item"]').count();   // → 0
await page.locator('.cart_item').count();                // → 1
await page.getByTestId('inventory-item').count();        // → 1
```

**Causa raíz:** [`pages/cart.page.ts:7`](../../../pages/cart.page.ts) declara `cartItems` como `[data-test="cart-item"]`, y **ese atributo no existe en la aplicación**. El HTML real de una línea de carrito es `<div class="cart_item" data-test="inventory-item">`. El locator resuelve 0 elementos **siempre**: el producto sí está en el carrito.

**Corrección — en el sandbox, no en el proyecto:**

```typescript
// El Page Object del proyecto se conserva tal cual: es material del módulo 02.
await expect(
  page.getByTestId('inventory-item'),
  'El carrito debería contener exactamente 1 línea de producto tras añadir la Sauce Labs Backpack',
).toHaveCount(1);
```

**Cómo evitarlo:** un locator declarado en un Page Object **que ningún test usa no está probado por nadie**. Cuando se añade un locator al POM, o se usa o no se añade.

### Las cuatro preguntas

1. **Por qué `Expected: 1 / Received: 0` y no "locator no encontrado":** porque `toHaveCount` es una aserción sobre **cuántos** elementos resuelve el locator, y cero es una respuesta perfectamente válida a esa pregunta. Playwright no tiene forma de saber que tú creías que ese atributo existía. Es la diferencia entre "no encuentro lo que buscas" y "he contado los que hay: cero".
2. **HTML real:** `<div class="cart_item" data-test="inventory-item">`. Tiene clase de estilo y atributo de test — pero el atributo tiene **otro valor** del que el Page Object supone.
3. **Por qué nadie lo detectó:**
   ```bash
   grep -rn "cartItems" tests/ pages/
   # solo la declaración en pages/cart.page.ts:7 — ningún test lo usa
   grep -rc "cart_item" tests/*.spec.ts | grep -v ":0"
   # 12 usos en 5 ficheros
   ```
   **Un locator roto es invisible hasta que alguien lo ejecuta.** Como ningún test llama a `cartItems`, el defecto nunca produjo un rojo.
4. **Relación con los 12 usos de `.cart_item`:** es la consecuencia, no la causa. Los tests no se saltan el Page Object por comodidad: **lo esquivan porque su locator no funciona**. Alguien intentó usarlo, no le funcionó, tiró de la clase CSS que sí veía en el navegador, y nadie volvió a mirar. El análisis arquitectónico de esto es el módulo 02.

> **Este es el punto pedagógico más alto del módulo.** La lección no es "usa siempre el POM": es que **un defecto que no se ejecuta no se ve**, y que el rodeo que toman los tests es la huella de un problema que nadie diagnosticó.

---

## Paso 5 — El `.first()` del proyecto

Sobre [`tests/cart-sync.spec.ts:30-33`](../../../tests/cart-sync.spec.ts):

1. **Qué comprueba de verdad:** que existe **algún** nombre de producto visible en el carrito. No comprueba *cuál*. El propio mensaje lo delata: "debería corresponder a **uno de** los productos añadidos".
2. **Reescritura propuesta:**
   ```typescript
   await expect(
     page.getByTestId('inventory-item').filter({ hasText: 'Sauce Labs Backpack' }),
     'El carrito debería contener la Sauce Labs Backpack añadida desde el catálogo',
   ).toHaveCount(1);
   ```
3. **Qué comparte con el caso A:** las dos veces, un ordinal sustituye a una descripción precisa. `.first()` no es un error de sintaxis: es una **renuncia a decir qué elemento quieres**, y esa renuncia se paga cuando el orden cambia.

*(Recordatorio: esta reescritura va en el informe del alumno. `tests/cart-sync.spec.ts` no se toca.)*

---

## Preguntas de reflexión

1. **¿Ha desaparecido el problema?** En A, sí: el locator ahora identifica un único elemento por contenido. En B, **no**: el defecto sigue en `pages/cart.page.ts`, deliberadamente. Lo que ha desaparecido es su efecto en el test del sandbox. Distinguir "he sorteado el defecto" de "he corregido el defecto" es el objetivo de la pregunta.
2. **Qué habría hecho falta para detectar B antes:** un test que usara `CartPage.cartItems`. Ni más revisiones de código —el locator *parece* correcto— ni otra herramienta. Lo que faltaba es **ejercitar el código de test**, que es exactamente lo que no se hace nunca.
3. **Distinguir por el mensaje:** un fallo de locator menciona el **locator** (`strict mode violation`, `waiting for locator`, `Received: 0` en un `toHaveCount`). Un fallo de aplicación menciona **valores de negocio** que el elemento sí tiene (`Expected: "3" / Received: "1"`). Si el elemento se encontró, el problema no es de localización.

## Errores habituales

| Error | Señal | Cómo responder |
|---|---|---|
| **Corrige `pages/cart.page.ts`** | `git diff --stat pages/` no está vacío | Revertir y convertirlo en conversación: *¿por qué crees que sigue ahí?* Es el error más frecuente del Lab |
| Usa `.first()` en el caso A | Lo detecta el `grep` de la validación | El error desaparece; el problema no |
| Escribe el informe después de corregir | Los diagnósticos son genéricos y la casilla "Comprobación" está vacía | La comprobación con `count()` es obligatoria |
| Concluye en B que "el carrito está vacío" | Diagnóstico invertido | Que ejecute con `--headed` y mire la pantalla |
| Da la misma causa raíz a los dos casos | Ambos "fallo de locator" | Uno resuelve **de más**, el otro **de menos**. Son opuestos |

## Cómo validar

```bash
npx playwright test -c learning/student/sandbox/01-playwright --project=chromium 05-diagnostico.spec.ts
# 2 passed

grep -n "first()\|nth(\|last()" learning/student/sandbox/01-playwright/05-diagnostico.spec.ts
# sin resultados

git diff learning/student/sandbox/01-playwright/05-diagnostico.spec.ts | grep "^[-+].*expect("
# sin resultados: ninguna aserción modificada

git diff --stat pages/
# vacío
```
