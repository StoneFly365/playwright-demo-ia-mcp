# Módulo 00 — Teoría

**Tiempo de lectura:** 35-40 minutos. Es el 20% teórico del módulo; el 80% restante son los Labs.

Ten el repositorio abierto mientras lees. Cada sección termina con un **"Ábrelo"**: el fichero real que ilustra lo explicado.

---

## 0. Por qué un QA necesita esto

Este es el Page Object más simple del proyecto, `pages/login.page.ts`, entero:

```typescript
import { Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    this.errorMessage = this.page.locator('[data-test="error"]');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/');
  }

  async login(username: string, password: string): Promise<void> {
    await this.page.locator('[data-test="username"]').fill(username);
    await this.page.locator('[data-test="password"]').fill(password);
    await this.page.locator('[data-test="login-button"]').click();
  }
}
```

Son 19 líneas y contienen **todo** lo que este módulo enseña: un `import`, una clase exportada, un campo `readonly`, un parámetro de propiedad, dos métodos `async` con tipo de retorno y parámetros tipados.

Si entiendes estas 19 líneas, entiendes el 90% del código del proyecto. Los otros cinco Page Objects son variaciones del mismo esqueleto.

**El objetivo de este módulo no es que aprendas a programar.** Es que dejes de leer el código de la suite como si fuera un idioma extranjero. Un QA que no puede leer sus propios tests depende de otro para cada cambio, y esa dependencia es la que hace que las suites se abandonen.

**Cuándo NO necesitas más que esto:** no vas a escribir un framework. No necesitas genéricos, decoradores, herencia ni patrones de diseño. Necesitas leer, modificar y crear código del tamaño de esas 19 líneas.

---

## 1. Valores: `const` y `let`

**¿Qué?** Una caja con nombre donde guardas un valor.

**¿Cómo?**

```typescript
const usuario = 'standard_user';  // no se puede reasignar
let intentos = 0;                 // sí se puede reasignar
intentos = intentos + 1;
```

**¿Cuándo cada uno?** Por defecto `const`. Usa `let` solo cuando el valor va a cambiar. Es una señal para quien lea: "ojo, esto cambia".

**Matiz que confunde a todo el mundo:** `const` protege la *referencia*, no el *contenido*. Un array declarado con `const` sigue pudiendo modificarse:

```typescript
const nombres = ['A', 'B'];
nombres.push('C');       // permitido: el array cambia, la referencia no
nombres = ['X'];         // error: eso sí es reasignar
```

Esto explica el problema de la sección 5.

**Ábrelo:** [`tests/login.spec.ts:5`](../../../tests/login.spec.ts) — `let loginPage: LoginPage;` está declarado con `let` precisamente porque el `beforeEach` lo reasigna antes de cada test.

---

## 2. Funciones

**¿Por qué?** Para no repetir. `pages/inventory.page.ts` tiene un solo método `addToCart(dataTestId)` en lugar de seis métodos casi idénticos, uno por producto.

**¿Cómo?** Dos sintaxis, mismo resultado:

```typescript
function selectorAnadir(producto: string): string {
  return `[data-test="add-to-cart-${producto}"]`;
}

const selectorAnadir = (producto: string): string =>
  `[data-test="add-to-cart-${producto}"]`;
```

Lo que va entre paréntesis son los **parámetros** (lo que la función necesita). Lo que va después de los dos puntos es el **tipo de retorno** (lo que devuelve). Las comillas invertidas permiten meter `${expresiones}` dentro del texto.

**¿Cuándo función flecha?** Cuando es corta y va como argumento de otra función: `names.sort((a, b) => a.localeCompare(b))`. Para métodos de una clase, sintaxis clásica.

**Ábrelo:** [`pages/inventory.page.ts:12-14`](../../../pages/inventory.page.ts) — una función parametrizada que sirve para los seis productos del catálogo.

---

## 3. Objetos y desestructuración

**¿Qué?** Un objeto agrupa datos con nombre: `{ total: 79, fallidos: 10 }`.

**¿Cómo se sacan los datos?** Dos formas:

```typescript
const total = resultado.total;      // acceso por punto
const { total, fallidos } = resultado;  // desestructuración
```

**¿Por qué importa esto a un QA?** Porque **cada test del proyecto empieza con una desestructuración** y casi nadie lo sabe:

```typescript
test('debería …', async ({ page }) => {
```

Playwright llama a tu función pasándole **un objeto** con todas las fixtures disponibles (`page`, `browser`, `context`, `request`…). Las llaves dicen: "de todo eso, dame solo `page`". Por eso algunos tests escriben `async ({ page })` y otros simplemente `async ()`: los segundos no necesitan ninguna fixture.

**Ábrelo:** [`tests/login.spec.ts:12`](../../../tests/login.spec.ts) usa `async ({ page })` y [`:22`](../../../tests/login.spec.ts) usa `async ()`. Compara los dos y verás por qué.

---

## 4. Arrays y transformaciones

**¿Por qué?** Porque los datos extraídos de una interfaz siempre llegan en lista: seis nombres de producto, seis precios.

**¿Qué necesitas saber?** Tres operaciones:

```typescript
const precios = ['$29.99', '$9.99', '$49.99'];

precios.map((p) => parseFloat(p.replace('$', '')));  // transformar → [29.99, 9.99, 49.99]
precios.filter((p) => p.includes('9.99'));           // seleccionar
precios.length;                                      // contar
```

`map` recorre el array y devuelve **uno nuevo** con el resultado de aplicar la función a cada elemento. No modifica el original.

**Ábrelo:** [`tests/inventory.spec.ts:42`](../../../tests/inventory.spec.ts):

```typescript
const values = prices.map(p => parseFloat(p.replace('$', '')));
```

Tres operaciones encadenadas en una línea: quitar el `$`, convertir a número, aplicarlo a todos.

---

## 5. `sort()`: las dos trampas

Esta sección es la más importante del módulo, porque las dos trampas de `sort()` producen tests que fallan de forma desconcertante.

### Trampa 1 — `sort()` modifica el array original

```typescript
const original = ['C', 'A', 'B'];
const ordenado = original.sort();
// ordenado  → ['A', 'B', 'C']
// original  → ['A', 'B', 'C']  ← también cambió
```

`sort()` no devuelve una copia ordenada: ordena el array sobre el que se llama **y devuelve ese mismo array**. Si otro test o otra aserción esperaba el orden original, falla, y el fallo aparece lejos de la causa.

**La defensa:** copiar antes con el spread `...`:

```typescript
const ordenado = [...original].sort();  // original intacto
```

**Ábrelo:** [`tests/inventory.spec.ts:32`](../../../tests/inventory.spec.ts) — `const sorted = [...names].sort(...)`. Ese `...` no es decorativo. Aparece tres veces en el fichero, siempre por la misma razón.

### Trampa 2 — `sort()` sin comparador ordena como texto

```typescript
[10, 9, 100].sort();   // → [10, 100, 9]   ← ¡ordenado alfabéticamente!
```

Sin comparador, `sort()` convierte cada elemento a texto. `'100'` va antes que `'9'` porque `'1'` < `'9'`.

**La defensa:** dar siempre un comparador explícito.

```typescript
[10, 9, 100].sort((a, b) => a - b);              // números ascendente → [9, 10, 100]
['b', 'A'].sort((a, b) => a.localeCompare(b));   // texto, con acentos y mayúsculas bien
```

El comparador recibe dos elementos y devuelve un número: negativo si `a` va antes, positivo si va después, 0 si da igual.

**Ábrelo:** compara [`tests/inventory.spec.ts:32`](../../../tests/inventory.spec.ts) (`b.localeCompare(a)` para texto Z→A) con [`:49`](../../../tests/inventory.spec.ts) (`a - b` para precios). Dos comparadores distintos porque los datos son distintos.

**QA mindset:** las dos trampas producen un test que pasa hoy y falla el mes que viene cuando alguien añada un producto de $100. Ese es el perfil exacto de un test frágil.

---

## 6. Clases

**¿Por qué?** Para guardar juntos unos datos y las operaciones que trabajan con ellos. Un Page Object guarda la página y lo que se puede hacer en ella.

**¿Qué es qué?**

```typescript
export class LoginPage {          // export: otros ficheros pueden importarla
  readonly errorMessage: Locator; // campo: dato que vive dentro del objeto

  constructor(private readonly page: Page) {   // se ejecuta al hacer `new`
    this.errorMessage = this.page.locator('[data-test="error"]');
  }

  async navigate(): Promise<void> {  // método: algo que el objeto sabe hacer
    await this.page.goto('/');
  }
}
```

- **`this`** es "este objeto concreto". Dentro de la clase, `this.page` es la página de *esta* instancia.
- **`new LoginPage(page)`** crea una instancia y ejecuta el constructor pasándole `page`.

**El parámetro de propiedad.** Fíjate en que en `login.page.ts` **no existe** ninguna línea `this.page = page`. En JavaScript normal habría que escribirla. TypeScript permite ponerle un modificador (`private`, `readonly`, `public`) al parámetro del constructor, y entonces crea el campo y lo asigna por ti. Es solo azúcar sintáctico, pero si no lo sabes el código parece incompleto.

**`readonly`.** Impide reasignar el campo después de construir el objeto. `this.errorMessage = otroLocator` daría error de compilación. **¿Por qué importa?** Porque un locator que cambia a mitad de un test es una fuente de fallos imposibles de reproducir. `readonly` cierra esa puerta gratis.

**Ojo con `readonly` y los arrays:** protege la referencia, igual que `const` (sección 1). Si el campo es un array, su **contenido** sigue siendo modificable:

```typescript
class CatalogoPage {
  readonly productos: string[] = [];
}

catalogo.productos = [];                  // error de compilación
catalogo.productos.push('Backpack');      // permitido: readonly no lo impide
```

**Y esto es un problema de QA, no de estilo.** Un array mutable dentro de un Page Object es estado que puede sobrevivir de un test a otro. El resultado son fallos que dependen del orden de ejecución: el test pasa aislado y falla en la suite, o al revés. Es el peor perfil de fallo que existe, porque no se reproduce cuando lo buscas.

**`private`.** El campo solo es accesible desde dentro de la clase. Por eso los tests no pueden escribir `loginPage.page.click(...)`: están obligados a pasar por los métodos públicos. Es lo que hace que el Page Object sirva de algo.

**¿Cuándo NO?** No necesitas herencia (`extends`), ni clases abstractas, ni interfaces con implementación. El proyecto no usa nada de eso en ninguno de sus seis Page Objects.

**Ábrelo:** [`pages/menu.page.ts:3-20`](../../../pages/menu.page.ts) — una clase sin ningún campo, con el constructor vacío `{}`, donde `logout()` y `resetAppState()` llaman ambos a `this.open()`.

---

## 7. Módulos: `import` y `export`

**¿Qué?** Cada fichero `.ts` es un módulo aislado. Para que su código sea visible fuera hay que **exportarlo**, y para usarlo hay que **importarlo**.

```typescript
// pages/login.page.ts
export class LoginPage { … }

// tests/login.spec.ts
import { test, expect } from '@playwright/test';   // desde un paquete instalado
import { LoginPage } from '../pages/login.page';   // desde una ruta relativa
```

- Sin `/` o `.` inicial → paquete de `node_modules`.
- Con `./` o `../` → ruta relativa a este fichero. `../pages/login.page` significa "sube un nivel, entra en `pages`". La extensión `.ts` no se escribe.

**Ábrelo:** [`tests/checkout.spec.ts:1-5`](../../../tests/checkout.spec.ts) — cinco imports: uno de paquete y cuatro de Page Objects.

---

## 8. Asincronía: `async` y `await`

**¿Por qué existe?** Porque hablar con un navegador lleva tiempo. Si el código esperase parado a cada clic, todo se bloquearía. JavaScript resuelve esto devolviendo una **promesa**: un "te aviso cuando esté".

**¿Qué es una `Promise<T>`?** Un objeto que representa un valor que aún no está disponible. La `T` dice qué valor llegará: `Promise<void>` (ninguno), `Promise<string[]>` (una lista de textos).

**¿Cómo se saca el valor?** Con `await`, y solo dentro de una función marcada `async`:

```typescript
async function contarProductos(): Promise<number> {
  return 6;
}

const sinAwait = contarProductos();       // Promise<number>  → typeof: 'object'
const conAwait = await contarProductos(); // number           → typeof: 'number'
```

**El error número uno de quien empieza** es olvidar el `await`. No falla ruidosamente: te devuelve una promesa donde esperabas un valor, y la aserción falla con un mensaje que parece no tener sentido:

```
Expected: "Sauce Labs Backpack"
Received: Promise {}
```

Ese `Promise {}` es una promesa sin resolver: el runner no puede imprimir un valor que todavía no existe. Cuando lo veas, busca el `await` que falta.

**Y aquí está la distinción que más vale de todo el módulo:** `Promise {}` es el **síntoma** —lo que ves—; la causa es la llamada sin `await`. Se arregla la causa, nunca el síntoma. Cambiar la aserción para que acepte un objeto dejaría el test en verde sin verificar nada.

**Regla práctica en este proyecto:** *toda* llamada a Playwright y *toda* llamada a un método de Page Object lleva `await`. Sin excepciones. Si escribes una línea con `page.` o `algoPage.` y no tiene `await` delante, casi seguro es un bug.

**¿Cuándo NO se pone `await`?** Cuando quieres lanzar varias cosas a la vez y esperar a todas juntas:

```typescript
const [a, b, c] = await Promise.all([tareaA(), tareaB(), tareaC()]);
```

**Ábrelo:** [`scripts/report-ai.mjs:65-69`](../../../scripts/report-ai.mjs) — el proyecto lanza tres llamadas a la IA en paralelo con `Promise.all` en lugar de esperar una detrás de otra. Y [`:54-58`](../../../scripts/report-ai.mjs) hace lo mismo con tres lecturas de fichero. Es JavaScript puro: `async`/`await` no es una invención de Playwright.

---

## 9. Tipos: qué te da TypeScript

**¿Por qué?** Porque un error detectado al escribir cuesta segundos, y el mismo error detectado en CI cuesta media hora.

**¿Qué?** Anotaciones que declaran qué contiene cada cosa:

```typescript
function parsePrecio(precio: string): number { … }
//                            ^^^^^^  ^^^^^^
//                            entra   sale
```

Tipos que verás en el proyecto: `string`, `number`, `boolean`, `string[]` (lista de textos), `void` (nada), `Promise<void>`, `Page`, `Locator`.

**Tipos propios.** Cuando un objeto se repite, se le pone nombre:

```typescript
export type Producto = {
  nombre: string;
  precio: string;
};
```

El proyecto actual **no define ningún tipo propio** — y eso es precisamente uno de los huecos que el Lab 3 te hace rellenar.

**`strict: true`.** Está activado en [`tsconfig.json:5`](../../../tsconfig.json). Entre otras cosas obliga a tratar los valores que pueden ser `null`:

```typescript
const producto = masBarato([]);   // Producto | null
producto.nombre;                  // error de compilación: podría ser null
producto?.nombre;                 // correcto: si es null, devuelve undefined
```

**¿Cuándo NO?** No hace falta anotar todo. Si escribes `const total = 0`, TypeScript ya deduce que es `number`. Se anotan **parámetros y valores de retorno** de funciones, que es donde está el contrato.

**Ábrelo:** [`pages/inventory.page.ts:24`](../../../pages/inventory.page.ts) — `getProductNames(): Promise<string[]>`. Ese tipo te dice, sin ejecutar nada, que vas a recibir una lista de textos y que necesitas `await`.

---

## 10. Resumen: las siete cosas que debes retener

1. `const` por defecto; `let` solo si el valor cambia. `const` no congela el contenido de un array.
2. Las llaves en `async ({ page })` son desestructuración, no sintaxis mágica de Playwright.
3. `map` transforma sin modificar; `sort` **sí** modifica: copia antes con `[...array]`.
4. `sort()` sin comparador ordena como texto. Con números, siempre `(a, b) => a - b`.
5. `constructor(private readonly page: Page)` crea el campo por ti. `readonly` impide reasignar el campo, **no** modificar el contenido de un array.
6. Todo lo que habla con el navegador devuelve `Promise` y necesita `await`. Un `Received: Promise {}` en un fallo = falta un `await`. Eso es el síntoma; la causa es la llamada.
7. Los tipos son documentación que el compilador verifica.

---

**Siguiente paso:** [Labs](labs/) — cuatro ejercicios, de leer a diagnosticar.
