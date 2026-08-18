# Solución — Lab 1 (FOLLOW)

Respuestas de referencia de la hoja de observación. Se valora que el alumno cite `fichero:línea`, no que reproduzca esta redacción.

---

### 1. ¿Dónde se declara y dónde se asigna `errorMessage`?

- Declaración: [`pages/login.page.ts:4`](../../../pages/login.page.ts) — `readonly errorMessage: Locator;`
- Asignación: [`pages/login.page.ts:7`](../../../pages/login.page.ts) — dentro del constructor.

**Por qué están separadas:** el campo se declara a nivel de clase para que sea parte de la interfaz pública del objeto (los tests hacen `loginPage.errorMessage`), pero su valor depende de `page`, que solo está disponible cuando se construye la instancia. Un `Locator` no puede crearse sin una `Page`.

**Error habitual:** decir que "se declara e inicializa a la vez". No: son dos líneas distintas y esa separación es obligatoria con `readonly`.

---

### 2. ¿Cómo llega `page` a estar disponible dentro de `navigate()`?

Por el **parámetro de propiedad** de [`pages/login.page.ts:6`](../../../pages/login.page.ts): `constructor(private readonly page: Page)`. Al poner un modificador de acceso (`private`) en el parámetro, TypeScript genera el campo `this.page` y le asigna el valor recibido. El `this.page = page` existe, pero lo escribe el compilador.

**Error habitual:** creer que es una característica de Playwright. Es TypeScript puro y funciona en cualquier clase.

---

### 3. Diferencia entre `Promise<void>` y `Promise<string[]>` sin decir "promesa"

`navigate()` **hace algo** y no devuelve ningún dato: se usa por su efecto sobre el navegador. `getProductNames()` **consulta algo** y devuelve una lista de textos que el test puede inspeccionar.

Regla práctica: si el tipo es `void`, el método actúa; si tiene un tipo de dato, el método informa.

---

### 4. `async ({ page })` vs `async ()`

Las llaves son desestructuración del objeto de fixtures que Playwright pasa a cada test.

- [`tests/login.spec.ts:12`](../../../tests/login.spec.ts) usa `async ({ page })` porque su aserción es `expect(page).toHaveURL(...)`: necesita el objeto `page` directamente.
- [`tests/login.spec.ts:22`](../../../tests/login.spec.ts) usa `async ()` porque solo actúa a través de `loginPage`, que ya guarda su propia referencia a `page` desde el `beforeEach`.

**Punto fino que merece comentarse en clase:** pedir una fixture que no usas no rompe nada, pero ensucia la firma y engaña a quien lee.

---

### 5. ¿Qué pasaría si `loginPage` fuese `const`?

Error de compilación en [`tests/login.spec.ts:8`](../../../tests/login.spec.ts): `Cannot assign to 'loginPage' because it is a constant`. El `beforeEach` reasigna la variable con una instancia nueva antes de cada test, y `const` prohíbe reasignar.

**Pregunta de seguimiento para el formador:** ¿por qué se crea una instancia nueva en cada test en lugar de reutilizar una? Porque cada test recibe una `page` distinta — es el aislamiento de Playwright. Reutilizar la instancia apuntaría a una página que ya no existe. Esto anticipa el módulo 03 (fixtures).

---

### 6. ¿A qué se refiere `this` en `menuPage.logout()`?

A la instancia concreta de `MenuPage` sobre la que se llamó el método — la que el test creó con `new MenuPage(page)`. `this.open()` ejecuta el método `open()` de esa misma instancia, con su misma `page`.

---

## Evaluación del Paso 4 — Defensa de 3 minutos (objetivo O8)

El alumno elige **un** método de [`pages/inventory.page.ts`](../../../pages/inventory.page.ts) y cubre tres puntos: qué hace, **por qué está escrito así** y qué se rompería al cambiarlo.

Lo que se evalúa es el punto 2. Describir el método es el suelo, no el objetivo.

### Justificaciones válidas por método

| Método | Línea | Por qué está escrito así | Qué se rompería |
|---|---|---|---|
| `addToCart` / `removeFromCart` | 13, 17 | Un parámetro y una plantilla de texto evitan seis métodos casi idénticos, uno por producto | Con un método por producto, añadir un producto al catálogo obligaría a tocar el Page Object |
| `sortBy` | 21 | Usa `selectOption`, no `click`: es un `<select>`, no un botón | Un `click` abriría el desplegable sin elegir nada; el test seguiría y fallaría más tarde |
| `getProductNames` / `getProductPrices` | 24-30 | Devuelven `Promise<string[]>` porque **consultan** datos; el resto de métodos **actúan** y devuelven `Promise<void>` | Sin `Promise`, no se podría esperar al navegador. Sin `await` al llamarlos, se recibe la promesa en vez de la lista |
| `navigateToProduct` | 33 | Localiza por **texto** (`hasText`) porque los nombres de producto sí son estables y no hay un `data-test` por producto en ese elemento | Si la app traduce los nombres, este método deja de funcionar. Es una decisión con un coste conocido |
| Los dos locators `readonly` | 8-9 | Se declaran arriba y se asignan en el constructor porque necesitan `page`, que solo existe al construir | Sin `readonly`, un test podría reasignar el locator a mitad de ejecución |

### Rúbrica de la defensa

| Nivel | Qué hace |
|---|---|
| **Sólido** | Cubre los tres puntos y su propuesta de cambio destapa una consecuencia real |
| **Adquirido** | Explica qué hace y por qué; el "qué se rompería" es genérico |
| **No demostrado** | Solo describe la mecánica del método, sin justificar ninguna decisión |

### Preguntas de la pareja que funcionan bien

- "¿Por qué este método no lleva ningún `expect` dentro?" *(anticipa el módulo 02)*
- "¿Qué pasa si llamo a este método sin `await`?"
- "¿Por qué `navigateToCart` está aquí y no en `CartPage`?"

**Señal de alarma (objetivo O2):** si el alumno no distingue los métodos que devuelven datos de los que no, O2 no está adquirido. Repite con él el test 8 de `01-values.spec.ts` antes de seguir.

**Señal de alarma (objetivo O8):** si solo sabe decir *qué* hace el método y no *por qué*, anótalo. No es motivo de "no apto" en el Lab 1 —es la primera vez que se le pide—, pero sí el indicador de que hay que preparar la Parte C del assessment con él.
