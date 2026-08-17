# Solución — Lab 4 (TROUBLESHOOT)

**Verificado:** `3 passed`.

---

## Diagnóstico de los tres fallos

### Fallo 1 — `debería ordenar los precios de menor a mayor`

**Síntoma:**
```
Expected: [7.99, 9.99, 15.99, 29.99, 49.99]
Received: [15.99, 29.99, 49.99, 7.99, 9.99]
```

**Causa raíz:** `sort()` sin comparador convierte cada elemento a texto y ordena alfabéticamente. `'15.99'` va antes que `'7.99'` porque `'1'` < `'7'`. El `[...precios]` estaba bien: el problema es el comparador que falta, no la copia.

**Corrección:**
```typescript
return [...precios].sort((a, b) => a - b);
```

**Cómo evitarlo:** con números, comparador explícito **siempre**. Referencia real: [`tests/inventory.spec.ts:49`](../../../tests/inventory.spec.ts) usa `(a, b) => a - b` para precios y [`:32`](../../../tests/inventory.spec.ts) usa `localeCompare` para texto. Dos comparadores porque son dos tipos de dato.

**Trampa del enunciado:** este fallo solo se manifiesta porque los datos incluyen `7.99` y `9.99` junto a `15.99`. Con `[10, 20, 30]` el orden alfabético coincide con el numérico y el bug quedaría oculto.

---

### Fallo 2 — `debería obtener el número de productos como número`

**Síntoma:**
```
Expected: "number"
Received: "object"
```

**Causa raíz:** falta el `await`. `contarProductos()` está declarada `async`, así que devuelve `Promise<number>`, no `number`. `typeof` sobre una promesa da `'object'`.

**Corrección elegida:**
```typescript
const totalProductos = await contarProductos();
```

**Justificación de la elección** (el Lab pide justificarla): la función está bien; lo que está mal es cómo se la llama. Quitar el `async` para que devuelva un número directo también dejaría el test en verde, pero rompería el propósito del ejemplo: en el proyecto real, `contarProductos` representa una llamada al navegador y **tiene** que ser asíncrona. Corregir la llamada mantiene el modelo realista; corregir la función lo destruye.

**Cómo evitarlo:** en este proyecto, toda llamada a un método de Page Object y toda llamada a la API de Playwright lleva `await`. Un `{}` o un `'object'` inesperado en un fallo es casi siempre un `await` que falta.

---

### Fallo 3 — `no debería modificar la lista de nombres recibida`

**Síntoma:**
```
- Expected: ["Onesie", "Backpack", "Fleece Jacket"]
+ Received: ["Backpack", "Fleece Jacket", "Onesie"]
```

La primera aserción del test pasa; falla la segunda.

**Causa raíz:** `nombres.sort(...)` ordena el array **recibido como parámetro**. En JavaScript los arrays se pasan por referencia: `nombres` y `original` son el mismo array en memoria, así que ordenar uno ordena el otro. El array devuelto es correcto; el efecto secundario es el bug.

**Corrección:**
```typescript
return [...nombres].sort((a, b) => a.localeCompare(b));
```

**Cómo evitarlo:** una función que recibe un array no debe modificarlo salvo que su nombre lo anuncie. `[...array]` antes de `sort`, `reverse` o `splice`. Referencia real: [`tests/inventory.spec.ts:32,49,66`](../../../tests/inventory.spec.ts) copia con spread las tres veces.

**Por qué este es el peor de los tres:** los otros dos fallan en el sitio donde está el error. Este falla en *otro* test, potencialmente en otro fichero, mucho después. Es el perfil exacto de un fallo que se etiqueta como "flaky" y se ignora.

---

## Código corregido completo

```typescript
function ordenarPrecios(precios: number[]): number[] {
  return [...precios].sort((a, b) => a - b);
}

async function contarProductos(): Promise<number> {
  return 6;
}

function ordenarNombres(nombres: string[]): string[] {
  return [...nombres].sort((a, b) => a.localeCompare(b));
}

// En el test 2:
const totalProductos = await contarProductos();
```

Las tres aserciones quedan **exactamente como estaban**. Ese es el criterio de superación.

---

## Cómo corregir el Lab

| Comprobación | Cómo |
|---|---|
| Los tres tests pasan | `npx playwright test -c learning/student/sandbox 00-foundations/04-broken.spec.ts` |
| Ninguna aserción modificada | `git diff …/04-broken.spec.ts` — ninguna línea `+`/`-` con `expect(` |
| El diagnóstico se escribió antes | Revisar el historial de commits, o preguntar |
| Las tres causas son distintas | Si dos diagnósticos coinciden, uno está mal |
| El test 2 lleva justificación | El Lab lo exige explícitamente |

**Penalización sugerida:** un alumno que llega a verde cambiando un `expect` no supera el Lab, aunque el resultado sea correcto. Es la conducta que el módulo entero existe para prevenir.

## Errores habituales

| Error | Qué revela |
|---|---|
| Cambiar el array esperado del test 1 al orden alfabético | No ha diagnosticado: ha silenciado |
| Quitar `async` en el test 2 sin justificarlo | Corrección válida sin razonamiento; pedir la justificación |
| Corregir el fallo 3 copiando el array **en el test** en vez de en la función | El síntoma desaparece, la función sigue mutando lo que recibe. No es una corrección: es un parche |
| Diagnosticar los fallos 1 y 3 como "el mismo error de `sort`" | Confunde síntoma con causa: uno es el comparador, otro la mutación |
