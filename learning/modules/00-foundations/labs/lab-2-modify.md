# Lab 2 — MODIFY · Parametrizar una ordenación

**Nivel:** 2 · MODIFY · **Tiempo:** 30 min · **Objetivos:** O3, O4

---

## Objetivo

Modificar una función que ya funciona para que soporte un caso de uso adicional, sin romper los tests que ya la cubren y añadiendo los que faltan.

## Contexto

`tests/inventory.spec.ts` valida cuatro ordenaciones del catálogo de SauceDemo: nombre A→Z, nombre Z→A, precio ascendente y precio descendente. Para conseguirlo repite tres veces el mismo bloque de código con pequeñas variaciones (líneas 23-71).

Aquí trabajas sobre una versión reducida del mismo problema. La función `ordenarNombres` ordena de la A a la Z y nada más. Tu trabajo es convertirla en una función que sirva para las dos direcciones **sin duplicar código**.

> Este es exactamente el razonamiento que en el módulo 03 se aplicará a los cinco tests clonados de `tests/inventory-add-to-cart.spec.ts:15-58`. Aquí lo practicas en pequeño.

## Prerrequisitos

- Lab 1 completado.
- Teoría, secciones 4 y 5 (arrays y las dos trampas de `sort`).

## Archivos implicados

| Fichero | Papel |
|---|---|
| [`learning/student/sandbox/00-foundations/02-arrays.spec.ts`](../../../student/sandbox/00-foundations/02-arrays.spec.ts) | **El que modificas.** |
| [`tests/inventory.spec.ts:23-71`](../../../../tests/inventory.spec.ts) | Referencia de lectura. **No lo modifiques.** |

---

## Pasos

### Paso 1 — Confirma el punto de partida

```bash
npx playwright test -c learning/student/sandbox 00-foundations/02-arrays.spec.ts
```

Debes ver `2 passed`. **No sigas si no está en verde.**

### Paso 2 — Modifica la firma de `ordenarNombres`

Debe aceptar un segundo parámetro que indique la dirección:

```typescript
ordenarNombres(CATALOGO)          // A→Z  (sigue funcionando igual que ahora)
ordenarNombres(CATALOGO, 'desc')  // Z→A
```

Requisitos:

- El parámetro nuevo es **opcional**: si no se pasa, ordena A→Z.
- Solo puede valer `'asc'` o `'desc'`. Aprovecha TypeScript para que cualquier otro valor sea un **error de compilación**, no un fallo en ejecución. *(Pista: un tipo puede ser una unión de valores literales de texto.)*
- **Una sola llamada a `sort`** en toda la función. Si has escrito dos, hay una forma mejor.
- La función sigue sin modificar el array recibido.

### Paso 3 — Añade una función nueva: `ordenarPreciosDesc`

```typescript
export function ordenarPreciosDesc(precios: string[]): number[]
```

Recibe precios en formato de la UI (`['$29.99', '$9.99', '$49.99']`) y devuelve **números** ordenados de mayor a menor (`[49.99, 29.99, 9.99]`).

Fíjate en que el tipo de entrada y el de salida son distintos. Ese cambio es la parte interesante del ejercicio.

### Paso 4 — Añade los tests

Escribe al menos **tres tests nuevos** en el mismo fichero:

1. `ordenarNombres` con `'desc'` devuelve el catálogo de la Z a la A.
2. `ordenarPreciosDesc` ordena correctamente, con al menos un precio de tres cifras (`'$100.00'`) en los datos. *Este dato no es casual.*
3. `ordenarPreciosDesc` no modifica el array recibido.

Los dos tests que ya existen deben seguir pasando **sin modificarlos**.

---

## Resultado esperado

`5 passed` como mínimo en `02-arrays.spec.ts`, y ningún cambio en los dos tests originales.

## Validación

```bash
# 1. Los tests del Lab pasan
npx playwright test -c learning/student/sandbox 00-foundations/02-arrays.spec.ts

# 2. El tipado es correcto en todo el repositorio
npx tsc --noEmit

# 3. No has tocado el proyecto principal
git status --short
```

**Autocomprobación:** añade temporalmente `ordenarNombres(CATALOGO, 'ascendente')`. Si `npx tsc --noEmit` **no** da error, el Paso 2 está incompleto: el tipo no está restringiendo los valores. Borra esa línea antes de hacer commit.

```bash
git add learning/student/sandbox/00-foundations/02-arrays.spec.ts
git commit -m "feat(lab-2): ordenación parametrizada y conversión de precios"
```

## Learning points

- Un parámetro opcional con valor por defecto permite ampliar una función sin romper a quien ya la usaba. Es la misma lógica que aplicarás al refactorizar suites reales.
- Un tipo de unión literal (`'asc' | 'desc'`) mueve un error de tiempo de ejecución a tiempo de compilación. Es gratis y elimina una familia entera de bugs.
- Cuando una función transforma el tipo de dato (`string[]` → `number[]`), su firma es la documentación más fiable que vas a tener.
- El precio de tres cifras del test 2 es una prueba de valor límite: es el dato que destapa la trampa de `sort()` alfabético. Elegir el dato que rompe el código es criterio QA, no programación.
