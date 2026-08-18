# Lab 1 — FOLLOW · Leer el código real del proyecto

**Nivel:** 1 · FOLLOW · **Tiempo:** 30 min · **Objetivos:** O1, O2, O3, O8

---

## Objetivo

Leer los dos ficheros más simples del proyecto real y ser capaz de explicar cada línea. Al terminar, `pages/login.page.ts` debe haber dejado de parecerte código ajeno.

## Contexto

Antes de escribir una sola línea, un QA tiene que poder leer la suite que va a mantener. Este Lab no te pide escribir nada: te pide **observar**, y contestar por escrito lo que observas. Es la única forma de detectar si has entendido algo o solo te suena.

## Prerrequisitos

- Haber leído [`theory.md`](../theory.md) secciones 0 a 9.
- `npm install` ejecutado.

## Archivos implicados

| Fichero | Papel |
|---|---|
| [`pages/login.page.ts`](../../../../pages/login.page.ts) | Lectura. **No lo modifiques.** |
| [`pages/inventory.page.ts`](../../../../pages/inventory.page.ts) | Lectura. **No lo modifiques.** |
| [`tests/login.spec.ts`](../../../../tests/login.spec.ts) | Lectura. **No lo modifiques.** |
| [`learning/student/sandbox/00-foundations/01-values.spec.ts`](../../../student/sandbox/00-foundations/01-values.spec.ts) | Ejecución. **No lo modifiques.** |

---

## Pasos

### Paso 1 — Ejecuta el fichero de ejemplos

```bash
npx playwright test -c learning/student/sandbox 00-foundations/01-values.spec.ts
```

Debes ver `8 passed`. Los ocho tests son versiones reducidas de cosas que existen en el proyecto real; cada uno lleva en un comentario la referencia al fichero real que ilustra.

### Paso 2 — Lee `01-values.spec.ts` de arriba abajo

Con la salida del Paso 1 al lado. Para cada test, localiza el fichero real que menciona su comentario y ábrelo.

### Paso 3 — Responde a la hoja de observación

Crea `learning/student/sandbox/00-foundations/lab-1-observaciones.md` y responde. Cita siempre `fichero:línea`.

1. En `pages/login.page.ts`, ¿en qué línea se **declara** `errorMessage` y en cuál se le **asigna** valor? ¿Por qué están separadas?
2. El fichero no contiene ninguna línea `this.page = page`. ¿Cómo llega entonces `page` a estar disponible dentro de `navigate()`?
3. `navigate()` devuelve `Promise<void>` y `getProductNames()` devuelve `Promise<string[]>`. Explica la diferencia en una frase, sin usar la palabra "promesa".
4. En `tests/login.spec.ts`, el test de la línea 12 se declara `async ({ page })` y el de la línea 22 se declara `async ()`. Abre los dos y explica por qué uno necesita `page` y el otro no.
5. `let loginPage: LoginPage;` (línea 5) está fuera de los tests y se reasigna en el `beforeEach` (línea 8). ¿Qué pasaría si estuviera declarado con `const`?
6. En `pages/menu.page.ts`, `logout()` llama a `this.open()`. ¿A qué objeto se refiere `this` cuando un test ejecuta `await menuPage.logout()`?

### Paso 4 — Defensa de 3 minutos

Primer contacto con el objetivo **O8**: comunicar y justificar una decisión técnica.

Elige **un** método de [`pages/inventory.page.ts`](../../../../pages/inventory.page.ts) y explícaselo a tu pareja en tres minutos, cubriendo las tres cosas:

1. **Qué hace y qué devuelve.**
2. **Por qué está escrito así.** Ejemplos según el método que elijas: por qué `addToCart` recibe un parámetro en lugar de existir seis métodos, uno por producto; por qué `getProductNames` devuelve `Promise<string[]>` y no `string[]`; por qué `navigateToProduct` localiza por texto y no por `data-test`.
3. **Qué se rompería si se cambiara.** Propón un cambio concreto y di qué dejaría de funcionar.

Después, tu pareja te hace **una** pregunta y tú la respondes. Luego cambiáis los papeles con otro método.

> No es una prueba de memoria ni de expresión: es la primera vez que tienes que justificar una decisión de código en voz alta, y esa es exactamente la conversación que vas a tener en cualquier revisión de código de tu equipo.

---

## Resultado esperado

- `8 passed` en el Paso 1.
- `lab-1-observaciones.md` con las seis respuestas, todas con referencia `fichero:línea`.
- Defensa de 3 minutos hecha, con la pregunta de tu pareja respondida.

## Validación

```bash
# 1. El fichero de ejemplos sigue en verde y sin tocar
npx playwright test -c learning/student/sandbox 00-foundations/01-values.spec.ts

# 2. No has modificado nada del proyecto
git status --short
# Solo debe aparecer: ?? learning/student/sandbox/00-foundations/lab-1-observaciones.md
```

Si `git status` muestra `pages/` o `tests/` modificados, deshaz esos cambios antes de continuar:

```bash
git restore pages/ tests/
```

## Learning points

- Un Page Object es una clase corriente. No hay nada de Playwright en su estructura: solo en los tipos `Page` y `Locator`.
- `constructor(private readonly page: Page)` hace tres cosas a la vez: declara el parámetro, crea el campo y lo asigna.
- El tipo de retorno de un método te dice si **actúa** (`Promise<void>`) o si **consulta** (`Promise<string[]>`). Es la primera pista de qué esperar de un método que no conoces.
- `async ({ page })` es desestructuración: pides a Playwright solo la fixture que vas a usar.
- Saber leer código es un prerrequisito de saber diagnosticarlo. El módulo 04 del programa vive entero de esta habilidad.
- **Explicar por qué algo está escrito así es una competencia distinta de saber leerlo.** En una revisión de código nadie te va a preguntar qué hace una línea: te van a preguntar por qué la escribiste. El Paso 4 es la primera de varias veces que se te va a pedir en este programa.
