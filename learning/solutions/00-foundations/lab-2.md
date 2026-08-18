# Solución — Lab 2 (MODIFY)

**Verificado:** `5 passed`.

---

## Código de referencia

`learning/student/sandbox/00-foundations/02-arrays.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

type Direccion = 'asc' | 'desc';

export function ordenarNombres(nombres: string[], direccion: Direccion = 'asc'): string[] {
  const factor = direccion === 'asc' ? 1 : -1;
  return [...nombres].sort((a, b) => a.localeCompare(b) * factor);
}

export function ordenarPreciosDesc(precios: string[]): number[] {
  return precios
    .map((p) => parseFloat(p.replace('$', '')))
    .sort((a, b) => b - a);
}

const CATALOGO = [
  'Sauce Labs Onesie',
  'Sauce Labs Backpack',
  'Sauce Labs Fleece Jacket',
];

test.describe('00 · Lab 2 — Ordenación de datos extraídos de la UI', () => {
  test('debería ordenar los nombres de la A a la Z', () => {
    expect(ordenarNombres(CATALOGO)).toEqual([
      'Sauce Labs Backpack',
      'Sauce Labs Fleece Jacket',
      'Sauce Labs Onesie',
    ]);
  });

  test('no debería modificar el array recibido', () => {
    const entrada = [...CATALOGO];
    ordenarNombres(entrada);

    expect(entrada).toEqual(CATALOGO);
  });

  test('debería ordenar los nombres de la Z a la A', () => {
    expect(ordenarNombres(CATALOGO, 'desc')).toEqual([
      'Sauce Labs Onesie',
      'Sauce Labs Fleece Jacket',
      'Sauce Labs Backpack',
    ]);
  });

  test('debería ordenar los precios de mayor a menor convirtiéndolos a número', () => {
    expect(ordenarPreciosDesc(['$29.99', '$9.99', '$100.00', '$49.99'])).toEqual([
      100, 49.99, 29.99, 9.99,
    ]);
  });

  test('no debería modificar el array de precios recibido', () => {
    const entrada = ['$29.99', '$9.99', '$100.00'];
    ordenarPreciosDesc(entrada);

    expect(entrada).toEqual(['$29.99', '$9.99', '$100.00']);
  });
});
```

## Por qué así

**`type Direccion = 'asc' | 'desc'`** — un tipo de unión literal. Es lo que hace que `ordenarNombres(CATALOGO, 'ascendente')` sea un **error de compilación** en lugar de un fallo silencioso en ejecución. Sin él, el parámetro sería `string` y cualquier texto pasaría; la función devolvería el orden ascendente sin avisar de nada.

**`direccion: Direccion = 'asc'`** — valor por defecto. Los dos tests originales llaman a la función con un solo argumento y siguen funcionando sin modificarlos. Ampliar una función sin romper a quien ya la usaba es la definición práctica de compatibilidad hacia atrás.

**El truco del `factor`** — cumple la restricción de "una sola llamada a `sort`". Invertir el signo del comparador invierte el orden:

```typescript
const factor = direccion === 'asc' ? 1 : -1;
return [...nombres].sort((a, b) => a.localeCompare(b) * factor);
```

**`[...nombres]`** — copia antes de ordenar. Sin el spread, el segundo test falla.

**`ordenarPreciosDesc` no necesita spread** — y esto merece pararse a explicarlo. `map` ya devuelve un array **nuevo**; el `sort` que viene después opera sobre esa copia, no sobre el original. Es la razón por la que el quinto test pasa sin ningún `[...]`. Copiar por si acaso no sería un error, pero entender por qué no hace falta sí es el aprendizaje.

## Alternativas válidas

**1. Dos ramas con `if`** — funciona, pero incumple la restricción de una sola llamada a `sort`:

```typescript
if (direccion === 'asc') return [...nombres].sort((a, b) => a.localeCompare(b));
return [...nombres].sort((a, b) => b.localeCompare(a));
```

**2. `.reverse()` tras ordenar** — correcto, pero recorre el array dos veces y `reverse()` también muta:

```typescript
const ordenado = [...nombres].sort((a, b) => a.localeCompare(b));
return direccion === 'asc' ? ordenado : ordenado.reverse();
```

Aquí `reverse()` es seguro porque `ordenado` ya es una copia. Si el alumno lo usa, pregúntale si sabía eso o si tuvo suerte.

**3. `toSorted()`** (Node 20+) — devuelve una copia ordenada sin mutar, y hace innecesario el spread:

```typescript
return nombres.toSorted((a, b) => a.localeCompare(b) * factor);
```

Es la opción más limpia y es válida con el Node del proyecto. No aparece en el repositorio real porque la suite se escribió con el patrón `[...x].sort()`, más extendido.

## Errores habituales

| Error | Síntoma | Causa |
|---|---|---|
| Olvidar el spread en `ordenarNombres` | Falla "no debería modificar el array recibido" | `sort()` muta |
| `direccion: string` en vez del tipo de unión | Todo verde, pero la autocomprobación con `'ascendente'` no da error | El tipo no restringe |
| `.sort()` sin comparador en `ordenarPreciosDesc` | Falla solo si hay un precio de tres cifras | Orden alfabético: `'100.00'` < `'29.99'` |
| Datos de prueba sin el `$100.00` | Todo verde con código incorrecto | Los datos elegidos no ejercitan el caso que rompe |

El último es el más instructivo: **el test no falla porque los datos no lo permiten**. Enlaza directamente con el diseño de datos de prueba del módulo 03 y con el concepto de oráculo del módulo 07.

## Cómo validar

```bash
npx playwright test -c learning/student/sandbox 00-foundations/02-arrays.spec.ts
# 5 passed

npx tsc --noEmit
# sin salida
```
