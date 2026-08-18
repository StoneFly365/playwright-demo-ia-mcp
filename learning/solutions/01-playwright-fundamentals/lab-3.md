# Solución — Lab 3 (MODIFY → DESIGN) ⭐

**Verificado:** los 6 tests de referencia en verde en Chromium. Todas las cifras de `count()` que aparecen aquí están **medidas** contra la aplicación.

> **Recordatorio de corrección:** este Lab **no se puntúa por número de estrategias**. Se puntúa por la calidad de la justificación. Un alumno con tres estrategias bien argumentadas está por encima de uno con cinco sin criterio.

---

## Tabla de decisión de referencia

No es *la* respuesta: es **una** respuesta defendible. Otras elecciones son válidas si el criterio lo sostiene.

| # | Elemento | Locator | Criterio | Alternativa descartada | Por qué |
|---|---|---|---|---|---|
| 1 | Campo Usuario | `getByRole('textbox', { name: 'Username' })` | Semántica | `#user-name` | El id es un detalle de implementación; el rol y el nombre son lo que percibe la persona usuaria |
| 2 | Campo Contraseña | `getByRole('textbox', { name: 'Password' })` | Semántica | `getByPlaceholder('Password')` | Equivalente aquí; el rol sobrevive si algún día ponen `<label>` |
| 3 | Botón Login | `getByRole('button', { name: 'Login' })` | Semántica | `getByTestId('login-button')` | Válida también; el rol documenta la intención |
| 4 | First Name | `getByRole('textbox', { name: 'First Name' })` | Semántica | `[data-test="firstName"]` | — |
| 5 | Last Name | `getByRole('textbox', { name: 'Last Name' })` | Semántica | — | — |
| 6 | Postal Code | `getByRole('textbox', { name: 'Zip/Postal Code' })` | Semántica | `getByPlaceholder('Zip/Postal Code')` | Equivalente |
| 7 | Botón Checkout | `getByRole('button', { name: 'Checkout' })` | Semántica | `getByTestId('checkout')` | — |
| 8 | Un producto concreto | `getByTestId('inventory-item').filter({ hasText: 'Sauce Labs Backpack' })` | **Contexto** | `getByRole('link', { name: '…' })` | 🔬 **resuelve 2 elementos**: strict mode |
| 9 | Su botón "Add to cart" | `…filter({ hasText: '…' }).getByRole('button', { name: 'Add to cart' })` | **Contexto** | `getByRole('button', { name: 'Add to cart' })` | 🔬 **resuelve 6** |
| 10 | Título "Products" | `getByTestId('title')` | Robustez | `getByRole('heading', { name: 'Products' })` | 🔬 **resuelve 0**: es un `<span>`, no un heading |
| 11 | Desplegable de ordenación | `getByTestId('product-sort-container')` | **Mantenibilidad** | `getByRole('combobox')` | Funciona (1 elemento) **solo porque es el único de la página** |
| 12 | Mensaje de confirmación | `getByRole('heading', { name: 'Thank you for your order!' })` | Semántica | `getByTestId('complete-header')` | Es el único heading real del flujo; el proyecto ya lo usa así |

**La fila 11 admite las dos respuestas** y es la más interesante de discutir. Defender `getByRole('combobox')` es válido **si** el alumno añade la condición ("mientras siga siendo el único desplegable, y lo vigilaría"). Lo que no es válido es elegirlo sin ver el riesgo.

---

## Bloque 3.1 — Por qué rol y placeholder coinciden

**Respuesta esperada:** los inputs **no tienen `<label>` ni `aria-label`**, así que el navegador toma el `placeholder` como **nombre accesible**. `getByRole('textbox', { name: 'Username' })` busca por ese nombre accesible y `getByPlaceholder('Username')` por el atributo que lo produce: son la misma información leída de dos maneras.

**Calibración:** "porque los dos ponen Username" es insuficiente. La respuesta correcta nombra el **nombre accesible**.

## Bloque 3.2 — `getByTestId`

```typescript
test('login localizando por TEST ID', async ({ page }) => {
  await page.getByTestId('username').fill('standard_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();

  await expect(
    page,
    'El usuario debería llegar al catálogo tras identificarse con credenciales válidas',
  ).toHaveURL(/.*\/inventory\.html$/);
});
```

- **Predicción correcta:** sin `testIdAttribute`, `getByTestId('username')` resolvería **0** elementos, porque Playwright buscaría `data-testid` y la aplicación usa `data-test`.
- **Recuento medido en el repositorio:** `grep -ro 'data-test' pages/ tests/ | wc -l` → **66** (58 exactas `[data-test=` y 8 por prefijo `[data-test^=`), repartidas en 35 en `pages/` y 31 en `tests/`.
- **Qué ganaría el proyecto:** legibilidad y una intención explícita ("esto es un identificador de test", no "esto es un selector CSS"). **Qué no ganaría:** ni robustez ni velocidad — localiza exactamente lo mismo. Es una mejora de expresividad, y por eso merece la pena discutir si compensa tocar 66 líneas.

## Bloque 3.3 — El caso `getByLabel` *(sin código)*

| # | Respuesta esperada |
|---|---|
| 1 | Porque no hay ningún elemento `<label>` en la página al que asociar el campo. `getByLabel` busca esa asociación y no existe |
| 2 | `await page.locator('label').count()` → **0** en las cinco pantallas. Y en el HTML del input no hay `aria-label` ni `aria-labelledby` |
| 3 | El `placeholder` **desaparece al escribir**: una persona con lector de pantalla que vuelva al campo a medio rellenar pierde la referencia de qué está rellenando. Además, un `placeholder` no es un sustituto válido de etiqueta según las pautas de accesibilidad |
| 4 | Ticket: *"Añadir `<label>` asociado (o `aria-label`) a los campos de login y de checkout. Justificación: los campos solo se identifican por `placeholder`, que desaparece al escribir; esto rompe la navegación con lector de pantalla y hace que los tests no puedan localizar por etiqueta."* |

**Calibración:** este bloque separa a quien ha entendido el módulo. Una respuesta que solo diga "no funciona porque no hay labels" cubre la 1 y la 2. Para el apto en la defensa técnica hay que llegar a la 3 y la 4: **una limitación de test que es, en realidad, un defecto del producto**.

## Bloque 3.4 — Títulos de página

Medido: `getByRole('heading', { name: 'Products' })` → **0**. `getByTestId('title')` → **1**.

```typescript
test('el catálogo muestra su título', async ({ page }) => {
  await expect(
    page.getByTestId('title'),
    'El catálogo debería mostrar el título "Products"',
  ).toHaveText('Products');
});
```

Alternativa válida: `getByText('Products', { exact: true })` — con la reserva de que se rompe al traducir la aplicación.

## Bloque 3.5 — El combobox

```typescript
test('ordenar por precio de menor a mayor', async ({ page }) => {
  await page.getByRole('combobox').selectOption('lohi');

  await expect(
    page.getByRole('combobox'),
    'El criterio de ordenación seleccionado debería ser el de precio ascendente',
  ).toHaveValue('lohi');
});
```

1. **No tiene `id`, ni `aria-label`, ni `<label>`.** *(El `data-test="product-sort-container"` sí existe.)*
2. Funciona porque `getByRole('combobox')` resuelve **1** elemento: es el único desplegable de la página.
3. **Respuesta sólida en cualquiera de los dos sentidos**, si nombra el riesgo: el día que se añada un segundo desplegable —un filtro por categoría, por ejemplo— este locator resolverá 2 y **todos** los tests que lo usen fallarán a la vez, sin que haya ningún bug. Quien lo mantenga debe saberlo; quien prefiera `getByTestId('product-sort-container')` gana estabilidad y pierde semántica.

> Nota: el test de ejemplo comprueba el valor del control, no el orden de los productos. **Eso está bien aquí y mal en el Lab 4**, donde lo que se verifica es el comportamiento. Merece la pena señalar la diferencia en la puesta en común.

## Bloque 3.6 — Acotar

```typescript
test('añadir al carrito la Fleece Jacket acotando por su tarjeta', async ({ page }) => {
  await page
    .getByTestId('inventory-item')
    .filter({ hasText: 'Sauce Labs Fleece Jacket' })
    .getByRole('button', { name: 'Add to cart' })
    .click();

  await expect(
    page.getByTestId('shopping-cart-badge'),
    'El contador del carrito debería mostrar 1 producto tras añadir la Sauce Labs Fleece Jacket',
  ).toHaveText('1');
});
```

Medido: `getByRole('button', { name: 'Add to cart' })` → **6** elementos sin acotar, **1** acotado.

**Respuestas:** el locator acotado **sobrevive** a un cambio de orden y a un séptimo producto, porque identifica por contenido y no por posición. La versión con `.first()` sobrevive a la ejecución, no al cambio: seguiría pulsando el primero, que ya no sería el mismo producto — y **el test seguiría en verde**, que es lo peor que puede pasar.

Alternativa igualmente válida: `getByTestId('add-to-cart-sauce-labs-fleece-jacket')`. Es robusta y explícita; pierde el patrón de composición, que es lo que el Lab quiere entrenar.

## Bloque 3.7 — El nombre que engaña

Medido en el paso 1 del checkout:

| Locator | Elementos |
|---|---|
| `getByRole('button', { name: 'Cancel', exact: true })` | **0** |
| `getByRole('button', { name: 'Go back Cancel' })` | **1** |
| `getByTestId('cancel')` | 1 |

El nombre accesible concatena el texto alternativo del icono con el texto del botón. **Recomendación:** `getByTestId('cancel')`, y anotarlo como aviso en la tabla. Es el ejemplo perfecto de por qué el nombre accesible se comprueba con `count()` en vez de suponerse.

## Preguntas de reflexión

1. **¿Está mal usar `data-test` 66 veces?** No. Es la estrategia más resiliente disponible en esta aplicación y se aplica con consistencia. Lo que está mal es que sea la **única**: sin contraste, el equipo no desarrolla criterio y no detecta los casos —como el del carrito— donde el atributo elegido ni siquiera existe.
2. **Por qué el rol primero:** porque un cambio en el rol o en el nombre accesible **es** un cambio de comportamiento percibido, y el test debe enterarse. Un `data-test` sobrevive a un cambio que rompería la experiencia de uso, y eso, según el caso, es una virtud o una ceguera.
3. **Cuántas filas sobreviven a un rediseño:** las que se apoyan en rol, nombre accesible o `data-test` — prácticamente todas las de la tabla de referencia. Se rompería cualquiera basada en clase CSS o en posición. Que la respuesta sea "casi todas" es la señal de que la tabla está bien construida.

## Errores habituales

| Error | Cómo responder |
|---|---|
| Justifica con "porque funciona" | Los 7 candidatos funcionaban. ¿Cuál de los cinco criterios usas? |
| Usa `.first()` en el bloque 3.6 | Lo detecta el `grep` de la validación. Es el antipatrón central del módulo |
| Cree que `getByLabel` fallará por sintaxis | Pídele el `count()` de `page.locator('label')` |
| Da por hecho que "Products" es un heading | Que ejecute el `count()`. Es el momento "ah" del bloque 3.4 |
| Escribe la tabla al final, de memoria | Se nota: las alternativas descartadas son genéricas. La tabla se rellena bloque a bloque |

## Cómo validar

```bash
npx playwright test -c learning/student/sandbox/01-playwright --project=chromium 03-locators.spec.ts
# ≥ 6 passed

grep -n "first()\|nth(\|last()" learning/student/sandbox/01-playwright/03-locators.spec.ts
# sin resultados

npx tsc --noEmit
```
