# Lab 3 — CREATE · Implementar un módulo tipado contra un contrato

**Nivel:** 3 · CREATE · **Tiempo:** 45 min · **Objetivos:** O3, O5, O8 *(la respuesta escrita del Paso 1)*

---

## Objetivo

Implementar desde cero tres funciones tipadas que satisfagan un contrato de tests ya escrito, sin modificar ese contrato.

## Contexto

Este es el flujo de trabajo real de un QA que se incorpora a un equipo: el comportamiento esperado ya está definido (por una historia de usuario, por un criterio de aceptación o, como aquí, por un test), y tu trabajo es hacer que se cumpla.

El repositorio tiene un hueco concreto que este Lab rellena. `pages/inventory.page.ts:28-30` devuelve los precios como `Promise<string[]>` — texto con símbolo de dólar. Cada test que quiere hacer algo con esos precios se los apaña por su cuenta: `tests/inventory.spec.ts:42` repite `parseFloat(p.replace('$', ''))` en tres tests distintos. **No existe ningún módulo de utilidades en el proyecto.** Aquí construyes el que faltaría.

## Prerrequisitos

- Labs 1 y 2 completados.
- Teoría, secciones 4, 7 y 9.

## Archivos implicados

| Fichero | Papel |
|---|---|
| [`learning/student/sandbox/00-foundations/03-price-utils.ts`](../../../student/sandbox/00-foundations/03-price-utils.ts) | **El que implementas.** |
| [`learning/student/sandbox/00-foundations/03-price-utils.spec.ts`](../../../student/sandbox/00-foundations/03-price-utils.spec.ts) | **CONTRATO. No lo modifiques.** |
| [`tests/inventory.spec.ts:39-54`](../../../../tests/inventory.spec.ts) | Referencia de lectura |
| [`pages/inventory.page.ts:28-30`](../../../../pages/inventory.page.ts) | Referencia de lectura |

---

## Pasos

### Paso 1 — Confirma el punto de partida

```bash
npx playwright test -c learning/student/sandbox 00-foundations/03-price-utils.spec.ts
```

Debes ver `4 failed` y `3 passed`.

**Antes de escribir nada, contesta:** tres tests pasan con las funciones sin implementar. ¿Por qué? ¿Qué te dice eso sobre esos tres tests? Anota la respuesta: forma parte de la entrega.

### Paso 2 — Lee el contrato

Abre `03-price-utils.spec.ts` y extrae de él la especificación de las tres funciones. Todo lo que necesitas saber está ahí: casos normales, caso vacío y comportamiento con espacios sobrantes.

### Paso 3 — Implementa `parsePrecio`

Convierte `'$29.99'` en `29.99` y tolera espacios: `'  $9.99  '`.

### Paso 4 — Implementa `total`

Suma los precios de los productos y redondea a **2 decimales**.

> Cuidado: `29.99 + 9.99 + 49.99` no da exactamente `89.97` en coma flotante. El test compara con `toBe`, no con `toBeCloseTo`. El redondeo no es un adorno del enunciado.

Con lista vacía devuelve `0`, y la lista recibida no debe modificarse.

### Paso 5 — Implementa `masBarato`

Devuelve el producto de menor precio, o `null` si la lista está vacía.

Fíjate en el tipo de retorno declarado: `Producto | null`. Con `strict: true` activo, el compilador te obligará a tratar el caso `null` en cuanto alguien use el resultado — por eso el test escribe `masBarato(CARRITO)?.nombre`.

### Paso 6 — Verde y revisión

Los 7 tests en verde. Después, relee tu código y pregúntate si `total` podría reutilizar `parsePrecio` en lugar de repetir la conversión.

---

## Resultado esperado

```
7 passed
```

Y `03-price-utils.spec.ts` sin una sola modificación (`git diff` sobre ese fichero debe estar vacío).

## Validación

```bash
# 1. Los 7 tests del contrato pasan
npx playwright test -c learning/student/sandbox 00-foundations/03-price-utils.spec.ts

# 2. El tipado es correcto
npx tsc --noEmit

# 3. El contrato no ha sido tocado
git diff --stat learning/student/sandbox/00-foundations/03-price-utils.spec.ts
# no debe devolver nada

git add learning/student/sandbox/00-foundations/03-price-utils.ts
git commit -m "feat(lab-3): utilidades de precio tipadas"
```

## Entregable adicional

En el mensaje del commit o en `lab-3-notas.md`, responde en dos líneas a la pregunta del Paso 1.

## Learning points

- Un test que pasa con la función sin implementar no está verificando nada útil. `total([]) === 0` es cierto para el código correcto y para `return 0`. Descubrir esto sobre tus propios tests es la puerta de entrada al concepto de **oráculo de test**, que se trabaja a fondo en el módulo 07.
- El tipo `Producto | null` traslada al compilador una decisión de diseño: "esta función puede no encontrar nada, y quien la use tiene que preverlo".
- `toBe` compara valores exactos; con decimales eso obliga a redondear de forma explícita. Elegir entre `toBe` y `toBeCloseTo` es una decisión de diseño de test, no un detalle.
- Escribir la implementación contra un contrato de tests que no puedes tocar es la disciplina que impide "arreglar" un test hasta que pase. En el módulo 08 verás a un agente de IA hacer exactamente eso, y por qué es peligroso.
