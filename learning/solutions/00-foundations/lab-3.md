# Solución — Lab 3 (CREATE)

**Verificado:** `7 passed`.

---

## Código de referencia

`learning/student/sandbox/00-foundations/03-price-utils.ts`:

```typescript
export type Producto = {
  nombre: string;
  precio: string;
};

export function parsePrecio(precio: string): number {
  return parseFloat(precio.trim().replace('$', ''));
}

function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}

export function total(productos: Producto[]): number {
  const suma = productos.reduce((acc, p) => acc + parsePrecio(p.precio), 0);
  return redondear(suma);
}

export function masBarato(productos: Producto[]): Producto | null {
  if (productos.length === 0) return null;

  return productos.reduce((barato, actual) =>
    parsePrecio(actual.precio) < parsePrecio(barato.precio) ? actual : barato,
  );
}
```

## Por qué así

**`.trim()` antes de `.replace()`** — el contrato exige tolerar `'  $9.99  '`. `parseFloat` ignora los espacios por la izquierda, pero no el `$` si va precedido de espacios, así que el orden importa: primero limpiar, luego quitar el símbolo.

**`redondear` no se exporta** — es un detalle interno. Solo se exporta lo que el contrato pide. Exportar de menos es fácil de corregir; exportar de más crea dependencias que luego nadie se atreve a romper.

**Por qué el redondeo es obligatorio** — `29.99 + 9.99 + 49.99` da `89.97000000000001` en coma flotante. El test compara con `toBe(89.97)`, comparación exacta, y sin redondeo falla. Es un error real que se cuela en cálculos de importes constantemente.

**`total` reutiliza `parsePrecio`** — no hay una segunda copia de la conversión. Si mañana los precios llegan con símbolo de euro, hay un solo sitio que tocar. En el proyecto real, `tests/inventory.spec.ts` repite `parseFloat(p.replace('$', ''))` en **tres** tests distintos (líneas 42, 59 y su equivalente): exactamente la duplicación que este módulo enseña a evitar.

**La guarda `if (productos.length === 0)`** — `reduce` sin valor inicial lanza `TypeError` con un array vacío. Además, la guarda es lo que permite que el tipo de retorno `Producto | null` tenga sentido.

**`Producto | null` y `strict: true`** — el test escribe `masBarato(CARRITO)?.nombre` precisamente porque el compilador no le deja escribir `.nombre` sin comprobar el `null`. El tipo obliga a quien use la función a pensar en el caso vacío.

## Alternativas válidas

**Bucle `for...of` en lugar de `reduce`** — igual de correcto y más legible para quien viene de testing manual:

```typescript
export function total(productos: Producto[]): number {
  let suma = 0;
  for (const p of productos) suma += parsePrecio(p.precio);
  return redondear(suma);
}
```

**`Math.min` con `map`** para `masBarato` — funciona, pero recorre la lista dos veces y obliga a buscar después el producto que tiene ese precio. Menos directo.

**`Number()` en vez de `parseFloat`** — `Number(' 29.99 ')` funciona, pero `Number('29.99 USD')` devuelve `NaN` mientras que `parseFloat` devuelve `29.99`. Cuál prefieres depende de si quieres tolerancia o detección estricta. Merece la pena preguntárselo al alumno: es una decisión de diseño, no un detalle.

## La pregunta del Paso 1

> Tres tests pasan con las funciones sin implementar. ¿Por qué? ¿Qué te dice eso sobre esos tres tests?

Los stubs devuelven `0`, `0` y `null`, que son exactamente los valores que esos tres tests esperan:

- `total([])` debe ser `0` → el stub devuelve `0`
- "no debería modificar el carrito recibido" → un stub que no hace nada tampoco modifica nada
- `masBarato([])` debe ser `null` → el stub devuelve `null`

**Lo que significa:** esos tres tests son necesarios (verifican comportamiento que debe cumplirse) pero **no son suficientes**: pasan tanto con la implementación correcta como con una implementación vacía. Un test que no distingue el código correcto del código roto no aporta señal por sí solo.

Este es el primer contacto del alumno con el concepto de **oráculo de test**, que se trabaja a fondo en el módulo 07 usando dos ejemplos reales del proyecto: [`tests/problem-user-cart.spec.ts:56-66`](../../../tests/problem-user-cart.spec.ts) (aserción condicional) y [`:77-87`](../../../tests/problem-user-cart.spec.ts) (valor esperado derivado del real).

**Si el alumno responde "porque están mal"**, matiza: no están mal, están *incompletos*. Eliminarlos sería peor.

## Errores habituales

| Error | Síntoma |
|---|---|
| Olvidar el redondeo en `total` | Falla el test de la suma: `Received: 89.97000000000001` |
| `replace()` antes de `trim()` | Falla el test de los espacios |
| `reduce` sin guarda en `masBarato` | `TypeError: Reduce of empty array with no initial value` |
| Modificar `03-price-utils.spec.ts` para que pase | Invalida el Lab: es el contrato |
| Repetir la conversión dentro de `total` | Todo verde, pero se pierde el aprendizaje del ejercicio |

## Cómo validar

```bash
npx playwright test -c learning/student/sandbox 00-foundations/03-price-utils.spec.ts
# 7 passed

npx tsc --noEmit
git diff --stat learning/student/sandbox/00-foundations/03-price-utils.spec.ts
# vacío: el contrato no se ha tocado
```
