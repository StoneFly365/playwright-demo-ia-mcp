# Solución — Challenge 1 (Resumen de carrito tipado)

**Verificado:** `7 passed` (el mínimo exigido son 6).

> Esta es **una** solución válida, no *la* solución. El Challenge se corrige por criterios de aceptación y por la justificación escrita, no por parecido con este código.

---

## Implementación de referencia

`learning/student/sandbox/00-foundations/05-cart-summary.ts`:

```typescript
export type LineaCarrito = {
  nombre: string;
  precio: string;
};

export type ResumenCarrito = {
  subtotal: number;
  impuesto: number;
  total: number;
};

function aNumero(precio: string): number {
  return parseFloat(precio.trim().replace('$', ''));
}

function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}

export function resumirCarrito(lineas: LineaCarrito[], tipoImpositivo: number): ResumenCarrito {
  const subtotal = lineas.reduce((acc, linea) => acc + aNumero(linea.precio), 0);
  const impuesto = subtotal * tipoImpositivo;

  return {
    subtotal: redondear(subtotal),
    impuesto: redondear(impuesto),
    total: redondear(subtotal + impuesto),
  };
}
```

## Tests de referencia

`learning/student/sandbox/00-foundations/05-cart-summary.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { resumirCarrito, type LineaCarrito } from './05-cart-summary';

const IVA_SAUCEDEMO = 0.08;

const CARRITO: LineaCarrito[] = [
  { nombre: 'Sauce Labs Backpack', precio: '$29.99' },
  { nombre: 'Sauce Labs Bike Light', precio: '$9.99' },
];

test.describe('00 · Challenge 1 — Resumen de carrito', () => {
  test('debería calcular subtotal, impuesto y total de un carrito con dos productos', () => {
    expect(resumirCarrito(CARRITO, IVA_SAUCEDEMO)).toEqual({
      subtotal: 39.98, impuesto: 3.2, total: 43.18,
    });
  });

  test('debería devolver los tres importes a 0 con el carrito vacío', () => {
    expect(resumirCarrito([], IVA_SAUCEDEMO)).toEqual({ subtotal: 0, impuesto: 0, total: 0 });
  });

  test('debería calcular correctamente un carrito de un solo producto', () => {
    const uno: LineaCarrito[] = [{ nombre: 'Sauce Labs Onesie', precio: '$7.99' }];
    expect(resumirCarrito(uno, IVA_SAUCEDEMO)).toEqual({
      subtotal: 7.99, impuesto: 0.64, total: 8.63,
    });
  });

  test('debería redondear a 2 decimales un importe con muchos decimales intermedios', () => {
    const centimo: LineaCarrito[] = [{ nombre: 'Ajuste', precio: '$0.01' }];
    const resumen = resumirCarrito(centimo, IVA_SAUCEDEMO);

    expect(resumen.impuesto).toBe(0);
    expect(resumen.total).toBe(0.01);
  });

  test('debería soportar precios de tres cifras', () => {
    const caro: LineaCarrito[] = [{ nombre: 'Póliza anual', precio: '$100.00' }];
    expect(resumirCarrito(caro, IVA_SAUCEDEMO).total).toBe(108);
  });

  test('no debería modificar el carrito recibido', () => {
    const entrada: LineaCarrito[] = [...CARRITO];
    resumirCarrito(entrada, IVA_SAUCEDEMO);

    expect(entrada).toEqual(CARRITO);
    expect(entrada).toHaveLength(2);
  });

  test('debería aplicar un tipo impositivo distinto sin tocar la función', () => {
    expect(resumirCarrito(CARRITO, 0.19).total).toBe(47.58);
  });
});
```

## Justificación de referencia (`05-decisiones.md`)

> **Caso límite elegido: un céntimo ($0.01).** El 8% de 0,01 es 0,0008, que redondeado a dos decimales da 0. Es el único caso donde el impuesto desaparece por completo, y por tanto donde un error de redondeo sería invisible en el total pero incorrecto en la línea de impuesto. En un contexto asegurador, ese redondeo aplicado a miles de pólizas es exactamente el tipo de descuadre que acaba en una incidencia contable.
>
> **Por qué el tipo impositivo es un parámetro.** Porque no es una propiedad del carrito, sino del contexto: cambia por país, por producto y por normativa. Si estuviera escrito a fuego dentro de la función, verificar otro tipo impositivo exigiría modificar código de producción, y el test dejaría de poder cubrir ese escenario. El último test lo demuestra: aplicar un 19% no requiere tocar la función.
>
> **Redondeo al final, no en cada paso.** El impuesto se calcula sobre el subtotal sin redondear y solo se redondea al presentarlo. Redondear antes propaga el error. Es una decisión defendible en ambos sentidos, pero debe ser consciente y estar escrita.

## Alternativas válidas

| Alternativa | Valoración |
|---|---|
| Reutilizar `parsePrecio` del Lab 3 importándolo | **Incumple la restricción 2.** El enunciado pide resolverlo de nuevo y decidir dónde debería vivir la función. Si el alumno importa y **además justifica por qué eso sería lo correcto en un proyecto real**, cuenta como acierto de diseño, no como incumplimiento |
| Devolver los importes como `string` con formato `'$43.18'` | Válido si lo justifica, pero mezcla cálculo y presentación. Buena discusión en clase |
| Tipo impositivo con valor por defecto `= 0.08` | Válido y cómodo, siempre que siga siendo un parámetro |
| Una clase `CarritoSummary` en lugar de funciones | Válido, pero es más maquinaria de la necesaria para algo sin estado |

## Errores habituales

| Error | Cómo se detecta |
|---|---|
| El 8% escrito dentro de la función | Incumple restricción 6; se ve a simple vista |
| 6 tests que verifican todos lo mismo con datos distintos | Los tests existen pero no hay caso vacío ni límite: AC4 incumplido |
| Ningún test de "no modifica la entrada" | AC4 incumplido; suele ir acompañado de código que sí muta |
| Justificación de una línea del tipo "porque es más limpio" | AC6 incumplido: no es una justificación, es una opinión |
| `toEqual` sobre números con decimales sin redondear | Falla con `43.180000000000007` |

## Cómo validar

```bash
npx playwright test -c learning/student/sandbox 00-foundations/05-cart-summary.spec.ts
# 7 passed (mínimo exigido: 6)

npx playwright test -c learning/student/sandbox
# 29+ passed

npx tsc --noEmit
```

## Conexión con módulos posteriores

- **Módulo 02:** `resumirCarrito` no toca la UI. Esa separación entre lógica y navegador es la misma que justifica que los Page Objects no contengan aserciones.
- **Módulo 03:** `LineaCarrito` es el primer paso hacia los datos de prueba tipados que sustituirán a los ids mágicos de [`tests/product-detail-add-to-cart.spec.ts`](../../../tests/product-detail-add-to-cart.spec.ts).
- **Módulo 07:** el caso límite del céntimo es un análisis de riesgo en miniatura: elegir el dato por su probabilidad de romper algo, no por comodidad.
