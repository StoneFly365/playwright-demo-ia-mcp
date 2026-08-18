# 🔒 Clave de corrección — Assessment Módulo 00

**Material del formador. No compartir con el grupo.**

**Total: 100 puntos · Aprobado: 70**

---

## Parte A — Conceptual (40 puntos, 4 por pregunta)

### P1 — Creación del campo `page`

**Respuesta:** en la línea del `constructor`, por el parámetro de propiedad `private readonly page: Page`. El modificador de acceso hace que TypeScript declare el campo y le asigne el valor automáticamente; el `this.page = page` lo genera el compilador.

| Puntos | Criterio |
|---|---|
| 4 | Identifica el parámetro de propiedad y explica que TypeScript genera la asignación |
| 2 | Dice que "lo hace el constructor" sin nombrar el mecanismo |
| 0 | Lo atribuye a Playwright o dice que falta código |

### P2 — Qué impide `readonly`

**Respuesta:** impide **reasignar** el campo tras construir el objeto (`this.errorMessage = otroLocator` no compila). **No** impide llamar a métodos del locator ni que el elemento de la página cambie: protege la referencia, no el estado del DOM.

| Puntos | Criterio |
|---|---|
| 4 | Ambas mitades: lo que impide y lo que no |
| 2 | Solo la primera mitad |
| 0 | Dice que "hace el elemento inmutable" |

### P3 — `Promise<void>` vs `Promise<string[]>`

**Respuesta:** el primero **actúa** sin devolver dato (se usa por su efecto); el segundo **consulta** y devuelve una lista de textos que el test puede inspeccionar.

| Puntos | Criterio |
|---|---|
| 4 | Distingue actuar de consultar, sin usar "promesa" |
| 2 | Correcto pero usa la palabra prohibida |
| 0 | Dice que uno es más rápido o que `void` es un error |

### P4 — `Received: Promise {}`

**Respuesta esperada:**

**(a) Causa raíz:** `primerProducto()` está declarada `async`, así que devuelve `Promise<string>`. La llamada no lleva `await`, de modo que `nombre` es la promesa sin resolver, no el texto.

**(b) Línea corregida:**
```typescript
const nombre = await inventario.primerProducto();
```

**(c) Síntoma vs causa:** `Promise {}` es lo que el runner *muestra* al imprimir el valor recibido. La causa es la llamada sin `await`. Corregir el síntoma —cambiar la aserción para que acepte un objeto— dejaría el test en verde sin verificar absolutamente nada del producto.

| Puntos | Criterio |
|---|---|
| 4 | (a) + (b) + (c): identifica el `await`, escribe la corrección y explica por qué la salida es el síntoma |
| 3 | (a) + (b) correctas, (c) confusa o ausente |
| 2 | Identifica que falta el `await` pero propone corregir la aserción, o corrige la función quitándole el `async` |
| 0 | Lo atribuye al locator, a un timeout, a que la página no ha cargado o a `innerText` |

**Rationale de la pregunta:** la versión anterior daba solo `Expected/Received` sin código, y `{}` admitía varias lecturas (objeto vacío, locator, respuesta de API). Con el código a la vista **la causa raíz es única y verificable**: no hay locator dinámico, no hay espera de red en juego, y el tipo de retorno declarado (`Promise<string>`) hace inequívoco el diagnóstico. El apartado (c) mantiene el nivel de exigencia: no basta con saber la corrección, hay que saber por qué la aserción no es el sitio donde se arregla — que es la conducta que el módulo entero previene.

> **Salida verificada.** El mensaje del enunciado es literal: se ha ejecutado ese código con la configuración del sandbox y Playwright imprime exactamente `Received: Promise {}`.

> **Distractor legítimo:** algunos alumnos señalarán que TypeScript no da error de compilación aquí. Es cierto — `toBe()` acepta `unknown` — y merece un comentario en la puesta en común: los tipos no lo atrapan todo, y por eso hace falta saber leer la salida.

### P5 — `[10, 9, 100].sort()`

**Respuesta:** devuelve `[10, 100, 9]`. Sin comparador, `sort()` convierte a texto y ordena alfabéticamente: `'100'` va antes que `'9'`. Correcto: `.sort((a, b) => a - b)`.

| Puntos | Criterio |
|---|---|
| 4 | Resultado exacto + razón + versión corregida |
| 2 | Sabe que ordena mal pero no da el resultado exacto |
| 0 | Responde `[9, 10, 100]` |

### P6 — Quitar el spread

**Respuesta:** `sort()` ordenaría `names` en sitio, así que la variable original quedaría también ordenada. Escenario: si una aserción posterior compara `names` con el orden en que la UI los devolvió, fallaría — y el fallo aparecería lejos de la causa.

| Puntos | Criterio |
|---|---|
| 4 | Explica la mutación **y** da un escenario concreto de fallo |
| 2 | Solo menciona la mutación |
| 0 | Dice que el spread es opcional o decorativo |

### P7 — Las llaves de `async ({ page })`

**Respuesta:** desestructuración del objeto de fixtures que pasa Playwright: "de todo lo disponible, dame `page`". Los tests que escriben `async ()` no usan ninguna fixture directamente — actúan solo a través de Page Objects ya construidos en el `beforeEach`.

| Puntos | Criterio |
|---|---|
| 4 | Nombra la desestructuración y explica el caso sin llaves |
| 2 | Solo la primera parte |
| 0 | Dice que es sintaxis obligatoria de Playwright |

### P8 — Las dos líneas de `CatalogoPage`

**Línea A — `catalogo.productos.push('Sauce Labs Backpack');`**

**Compila.** `readonly` impide **reasignar** el campo (`catalogo.productos = []` sí daría error), pero no congela el contenido del array: `push`, `pop` y `sort` siguen permitidos.

**Riesgo para la suite:** `productos` es un array mutable dentro de un Page Object. Cualquier test que lo modifique deja rastro para el siguiente si la instancia se reutiliza, y aparecen fallos que dependen del orden de ejecución — el peor perfil de fallo posible, porque no se reproduce al ejecutar el test aislado. Es la misma familia de problemas que el fallo 3 del Lab 4.

**Línea B — `catalogo.masBarato([29.99, 9.99]) * 1.08;`**

**No compila.** El tipo de retorno es `number | null` y con `"strict": true` el compilador no deja operar sobre un valor que puede ser `null`:

```
error TS18047: 'minimo' is possibly 'null'.
```

Hay que estrechar el tipo antes de usarlo:

```typescript
const minimo = catalogo.masBarato([29.99, 9.99]);
const conIva = minimo === null ? 0 : minimo * 1.08;
// o bien: const conIva = (minimo ?? 0) * 1.08;
```

**Por qué el compilador lo exige:** en JavaScript sin tipos, `null * 1.08` no lanza ningún error — devuelve `0`. El cálculo seguiría adelante con un importe silenciosamente equivocado, y un test que compruebe "el total es un número" lo daría por bueno. El tipo convierte un bug silencioso en un error de compilación.

| Puntos | Criterio |
|---|---|
| 4 | A: compila + `readonly` protege la referencia, no el contenido + riesgo de estado compartido. B: no compila + hay que estrechar el `null` |
| 3 | Ambas respuestas correctas en cuanto a "compila / no compila" y sus razones, pero sin el riesgo para la suite en A |
| 2 | Una de las dos líneas correcta con su razón |
| 1 | Acierta "compila / no compila" en ambas sin explicar por qué |
| 0 | Dice que A no compila por el `readonly`, o que B compila |

**Rationale de la pregunta:** la versión anterior pedía enumerar lo que se deduce de una firma — reconocimiento, no aplicación, y por debajo del nivel de E1/E2. Esta combina cuatro contenidos del módulo (`readonly` §6, arrays y mutación §1 y §5, `strict` y narrowing §9, tipos de retorno §9) y obliga a **decidir** sobre código concreto, además de conectar la decisión con la fiabilidad de una suite. Sigue siendo respondible en 2-3 frases por línea.

> **Verificado con el compilador del proyecto:** la línea A no produce ningún diagnóstico; la B produce `TS18047`.

> **Respuesta parcial frecuente:** "A no compila porque es `readonly`". Es el error que la pregunta busca destapar y aparece en la teoría, §1 (`const` protege la referencia, no el contenido) y §6.

### P9 — Un ejemplo de error que atrapa `strict`

**Respuesta (cualquiera):** acceder a una propiedad de un valor que puede ser `null` (`masBarato([]).nombre`); un parámetro sin tipo que quedaría como `any` implícito; asignar un `string` donde se espera un `number`.

| Puntos | Criterio |
|---|---|
| 4 | Ejemplo concreto y correcto |
| 2 | Ejemplo genérico ("detecta errores de tipos") |
| 0 | Ejemplo incorrecto o confunde `strict` con el linter |

### P10 — Mensajes descriptivos en `expect`

**Respuesta:** cuando el test falla en CI a las 3 de la mañana, el mensaje explica **qué comportamiento de negocio** se ha roto sin necesidad de abrir el código. Reduce el tiempo de diagnóstico y permite que alguien que no escribió el test entienda el fallo. Es también lo que alimenta al pipeline de análisis por IA del proyecto.

| Puntos | Criterio |
|---|---|
| 4 | Argumento de mantenibilidad concreto (tiempo de diagnóstico, otra persona, CI) |
| 2 | "Son más claros" sin desarrollar |
| 0 | Da la razón a la compañera |

---

## Parte B — Práctica (60 puntos)

### E1 — `agruparPorRango` (25 puntos)

Solución de referencia (verificada, `4 passed`):

```typescript
type RangosPrecio = {
  baratos: number[];
  medios: number[];
  caros: number[];
};

export function agruparPorRango(precios: string[]): RangosPrecio {
  const rangos: RangosPrecio = { baratos: [], medios: [], caros: [] };

  for (const precio of precios) {
    const valor = parseFloat(precio.trim().replace('$', ''));

    if (valor < 10) rangos.baratos.push(valor);
    else if (valor < 30) rangos.medios.push(valor);
    else rangos.caros.push(valor);
  }

  return rangos;
}
```

**Los límites son la clave:** `10.00` va a `medios` y `30.00` va a `caros`. Un alumno que use `<=` en la primera condición manda el 10 a `baratos` y falla el test de límites — si es que lo ha escrito.

Reparto: tipos explícitos 5 · clasificación correcta con límites 8 · no muta la entrada 4 · 3 tests que pasan 5 · test de valor límite exacto 3.

> **Nota de corrección:** `map` + `filter` triple también es válido (recorre tres veces, irrelevante aquí). Lo que **no** es válido es mutar el array de entrada, cosa que ocurre si alguien ordena antes de clasificar.

### E2 — Diagnóstico (35 puntos)

**Fallo 1 — `await` ausente.** `precioProducto()` devuelve `Promise<number>`; `typeof` da `'object'`. Corrección: `const precio = await precioProducto();`

**Fallo 2 — `sort()` muta el parámetro.** `anadirImpuesto` llama a `precios.sort(...)` sobre el array recibido, así que `original` queda ordenado. El `map` posterior sí devuelve un array nuevo, lo que despista: el daño ya está hecho antes del `map`. Corrección: `[...precios].sort(...)`.

Solución verificada (`2 passed`):

```typescript
async function precioProducto(): Promise<number> {
  return 29.99;
}

function anadirImpuesto(precios: number[], tipo: number): number[] {
  return [...precios].sort((a, b) => a - b).map((p) => p * (1 + tipo));
}

test('debería obtener el precio como número', async () => {
  const precio = await precioProducto();
  expect(typeof precio).toBe('number');
});
```

Reparto: diagnóstico 1 → 8 · diagnóstico 2 → 8 · correcciones en el código y no en los `expect` → 12 · ambos tests pasan → 5 · regla de prevención por fallo → 2.

> **Penalización de 12 puntos** si alguna aserción ha sido modificada, aunque los dos tests estén en verde. Aplíquela sin excepciones: es la conducta que el módulo entero existe para prevenir.

> **Distractor deliberado de E2:** el `sort` de `anadirImpuesto` no aporta nada al cálculo del impuesto. Un alumno con criterio lo señalará y propondrá eliminarlo directamente. **Eso vale los 12 puntos igual**, y merece un comentario en clase: la corrección más simple de un efecto secundario es a menudo borrar el código que sobra.

---

---

## Parte C — Defensa técnica (apto / no apto)

No puntúa sobre 100, pero **es requisito para superar el módulo**. Se hace en la revisión de un Lab o del Challenge, no como prueba aparte.

**Cómo conducirla:** las cuatro preguntas del enunciado, en orden, sobre un entregable que elige el alumno. Diez minutos como máximo. No corrijas durante la defensa: anota y comenta después.

**Qué escuchar en cada pregunta:**

| # | Señal de *Sólido* | Señal de *No demostrado* |
|---|---|---|
| 1 | Nombra un criterio ("para no repetir la conversión en dos sitios") | Describe la mecánica ("puse un spread") sin el porqué |
| 2 | Recuerda una alternativa real y por qué la descartó | "No se me ocurrió otra" |
| 3 | Separa las dos capas sin que se lo pidas | Nombra el síntoma como causa: "fallaba el `sort`", "fallaba el test 2" |
| 4 | Nombra un primer paso concreto (leer Expected/Received, ejecutar el fichero aislado) | "Preguntaría a alguien" |

**La pregunta 3 es la que decide.** Un alumno que no distingue síntoma de causa va a tener problemas serios en el módulo 04, que es TROUBLESHOOT puro. Detectarlo aquí es barato; detectarlo allí, no.

**Ejemplos de calibración, sobre el fallo 3 del Lab 4:**

| Respuesta | Nivel |
|---|---|
| "Le puse los tres puntos y ya pasó" | No demostrado |
| "El array original se ordenaba, así que copié antes de ordenar" | Adquirido |
| "El síntoma era que fallaba la segunda aserción del test 3. La causa es que `sort` opera sobre el mismo array que recibe, así que la función modificaba lo que le pasaban. Ese test era solo donde se notaba: el bug estaba en la función" | Sólido |

**Si sale *No apto*:** no es una nota, es una señal. Se repite en la revisión del Challenge 1 con otro entregable. No bloquea el paso al módulo 01, pero sí queda registrado para el checkpoint de la semana 2.

---

## Interpretación de resultados por grupo

| Patrón observado | Interpretación | Acción |
|---|---|---|
| Falla P4 + P5 + E2 | No ha interiorizado `await` ni `sort`: los dos pilares del módulo | Repetir Labs 3 y 4 antes del módulo 01 |
| Aprueba la Parte A, suspende la B | Sabe explicarlo, no sabe hacerlo | Sesión práctica adicional; muy común en perfil manual senior |
| Aprueba la B, suspende la A | Programa por intuición sin vocabulario | Suele resolverse solo; vigilar en el módulo 02 (POM) |
| Modifica aserciones en E2 | Riesgo alto para el módulo 04 | Conversación individual, no solo penalización |
| Falla P4(c) **y** la pregunta 3 de la Parte C | No separa síntoma de causa: el patrón más predictivo de dificultades en el módulo 04 | Repetir el Lab 4 con acompañamiento antes de avanzar |
| Falla P8 línea A | Cree que `readonly` congela el contenido | Se corrige rápido; conviene mencionarlo en grupo, es un error muy extendido |
| Media del grupo < 70 | El módulo 00 necesita más horas antes del 01 | Reajustar el calendario, no acelerar |
