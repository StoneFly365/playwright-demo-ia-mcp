# Módulo 00 — Assessment

**Duración:** 45 minutos · **Nota mínima para superar: 70 / 100**

Sin material de consulta para la parte conceptual (P1-P10). Con el repositorio abierto para la parte práctica (E1-E2).

| Parte | Ítems | Puntos | Tiempo |
|---|---|---|---|
| A — Conceptual | P1-P10 | 40 | 15 min |
| B — Práctica | E1-E2 | 60 | 30 min |
| C — Defensa técnica | D1 | Sin puntos: **apto / no apto** | 5-10 min, en la revisión de un Lab |

La Parte C no es un examen oral: se evalúa durante la revisión de un Lab o del Challenge, en el momento en que ya ocurre de forma natural.

La clave de corrección está en [`learning/solutions/00-foundations/assessment-key.md`](../../../solutions/00-foundations/assessment-key.md) — material del formador.

---

## Parte A — Conceptual (40 puntos, 4 por pregunta)

Respuestas breves: 1-3 frases. Se valora la precisión, no la extensión.

**P1.** En este código, ¿en qué línea se crea el campo `page` y por qué no aparece ningún `this.page = page`?

```typescript
export class LoginPage {
  readonly errorMessage: Locator;
  constructor(private readonly page: Page) {
    this.errorMessage = this.page.locator('[data-test="error"]');
  }
}
```

**P2.** ¿Qué impide `readonly` en `readonly errorMessage: Locator`? ¿Y qué **no** impide?

**P3.** Un método declara `async navigate(): Promise<void>` y otro `async getProductNames(): Promise<string[]>`. Explica qué diferencia hay entre lo que hace cada uno, sin usar la palabra "promesa".

**P4.** Este test falla. Tienes el código y la salida completa:

```typescript
class InventarioPage {
  constructor(private readonly page: Page) {}

  async primerProducto(): Promise<string> {
    return this.page.locator('[data-test="inventory-item-name"]').first().innerText();
  }
}

test('debería mostrar la Backpack como primer producto', async ({ page }) => {
  const inventario = new InventarioPage(page);
  const nombre = inventario.primerProducto();

  expect(nombre).toBe('Sauce Labs Backpack');
});
```

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "Sauce Labs Backpack"
Received: Promise {}

    >  12 |   expect(nombre).toBe('Sauce Labs Backpack');
           |                  ^
```

Responde a las tres:

**(a)** La causa raíz, en una frase.
**(b)** La línea corregida.
**(c)** Por qué `Received: Promise {}` es el **síntoma** y no la causa.

**P5.** ¿Qué devuelve `[10, 9, 100].sort()` y por qué? Escribe la versión correcta para ordenar números de menor a mayor.

**P6.** En `const sorted = [...names].sort((a, b) => b.localeCompare(a));`, ¿qué pasaría si se quitasen los tres puntos `...`? Menciona un escenario concreto en el que ese cambio provocaría un fallo.

**P7.** ¿Qué significan las llaves en `async ({ page }) => { … }`? ¿Por qué algunos tests del proyecto escriben `async ()` sin llaves?

**P8.** Este código compila hoy. Un compañero añade las dos últimas líneas:

```typescript
export class CatalogoPage {
  readonly productos: string[] = [];

  constructor(private readonly page: Page) {}

  masBarato(precios: number[]): number | null {
    if (precios.length === 0) return null;
    return [...precios].sort((a, b) => a - b)[0];
  }
}

const catalogo = new CatalogoPage(page);

catalogo.productos.push('Sauce Labs Backpack');          // ← línea A
const conIva = catalogo.masBarato([29.99, 9.99]) * 1.08; // ← línea B
```

Para **cada** línea responde: ¿la acepta el compilador? ¿Por qué? Y en la A, además: ¿qué riesgo tiene para la fiabilidad de una suite de tests?

**P9.** El proyecto tiene `"strict": true` en `tsconfig.json`. Da **un** ejemplo concreto de error que esa opción detecta antes de ejecutar el test.

**P10.** Una compañera propone quitar los mensajes descriptivos de los `expect` "porque hacen el código más largo". Da un argumento de mantenibilidad a favor de conservarlos.

---

## Parte B — Práctica (60 puntos)

Trabaja en `learning/student/sandbox/00-foundations/`. Al terminar, entrega la rama.

### E1 — Modificar y ampliar (25 puntos)

Crea `assessment-e1.spec.ts` con una función `agruparPorRango` que reciba `string[]` de precios en formato de UI (`'$29.99'`) y devuelva un objeto con tres listas de **números**:

```typescript
{ baratos: number[], medios: number[], caros: number[] }
```

- `baratos`: menos de 10
- `medios`: de 10 a 29,99 inclusive
- `caros`: 30 o más

Escribe **3 tests como mínimo**, uno de ellos con un precio que caiga justo en un límite.

| Criterio | Puntos |
|---|---|
| La función tiene tipos explícitos en parámetro y retorno | 5 |
| La clasificación es correcta, incluidos los límites | 8 |
| No modifica el array recibido | 4 |
| Hay al menos 3 tests y todos pasan | 5 |
| Al menos un test cubre un valor límite exacto (10 o 30) | 3 |

### E2 — Diagnosticar (35 puntos)

Este fichero compila y sus dos tests fallan, por **dos causas distintas**. Cópialo a `assessment-e2.spec.ts`, diagnostica y corrige.

```typescript
import { test, expect } from '@playwright/test';

async function precioProducto(): Promise<number> {
  return 29.99;
}

function anadirImpuesto(precios: number[], tipo: number): number[] {
  return precios.sort((a, b) => a - b).map((p) => p * (1 + tipo));
}

test('debería obtener el precio como número', async () => {
  const precio = precioProducto();
  expect(typeof precio).toBe('number');
});

test('no debería alterar el orden de la lista original', () => {
  const original = [49.99, 9.99, 29.99];
  anadirImpuesto(original, 0.08);
  expect(original).toEqual([49.99, 9.99, 29.99]);
});
```

Entrega el fichero corregido **y** un informe de diagnóstico con el formato del Lab 4.

| Criterio | Puntos |
|---|---|
| Diagnóstico correcto del fallo 1 (causa raíz, no síntoma) | 8 |
| Diagnóstico correcto del fallo 2 (causa raíz, no síntoma) | 8 |
| Ambas correcciones aplicadas en el código, **no** en los `expect` | 12 |
| Los dos tests pasan | 5 |
| El informe propone una regla para evitar cada fallo en el futuro | 2 |

> **Penalización:** modificar una aserción para hacer pasar un test resta **12 puntos**, aunque el resultado sea verde. Es el error que este módulo existe para prevenir.

---

## Parte C — Defensa técnica (apto / no apto)

Evalúa el objetivo **O8: comunicar y justificar decisiones técnicas**. No puntúa sobre 100, pero **es requisito para superar el módulo**.

No se convoca como prueba aparte. El formador la realiza en la revisión de un Lab o del Challenge, cuando el alumno ya está explicando su trabajo.

### D1 — Defensa de una decisión propia (5-10 min)

El alumno elige **uno** de sus entregables y responde a cuatro preguntas:

| # | Pregunta | Qué demuestra |
|---|---|---|
| 1 | ¿Qué has hecho y por qué esa solución y no otra? | Justificación de una decisión técnica |
| 2 | ¿Qué otra opción descartaste? ¿Qué te hizo descartarla? | Consciencia de alternativas |
| 3 | Cuéntame un problema que te encontraste: ¿cuál era el síntoma y cuál la causa? | **Distinción síntoma / causa raíz** |
| 4 | Si mañana esto falla en CI, ¿qué mirarías primero? | Traslado del razonamiento a un contexto nuevo |

Entregables válidos para la defensa: el informe del Lab 4, la respuesta del Paso 1 del Lab 3, la justificación del Challenge 1 (`05-decisiones.md`) o la defensa de 3 minutos del Lab 1.

### Rúbrica

| Nivel | Descriptor | Resultado |
|---|---|---|
| **Sólido** | Explica su decisión, nombra la alternativa descartada con un criterio, y separa síntoma de causa sin que se lo pidan | Apto |
| **Adquirido** | Explica qué hizo y por qué; distingue síntoma de causa cuando se le pregunta directamente | Apto |
| **No demostrado** | Describe *qué* hizo pero no *por qué*; o describe el síntoma como si fuera la causa ("fallaba el `sort`") | **No apto** — se repite en la revisión del Challenge |

> **Criterio de corrección:** "cambié el `[...]` y ya pasó" es *No demostrado*. "El array de entrada se ordenaba porque `sort` opera sobre el mismo array que recibe; el test que fallaba solo era donde se notaba" es *Sólido*.

---

## Escala

| Puntuación | Parte C | Resultado | Consecuencia |
|---|---|---|---|
| 85-100 | Apto | Superado con holgura | Pasa al módulo 01 con los ejercicios `[+]` |
| 70-84 | Apto | Superado | Pasa al módulo 01 |
| ≥ 70 | **No apto** | Pendiente | Repite la defensa en la revisión del Challenge 1. No bloquea el módulo 01 |
| 55-69 | — | No superado | Refuerzo dirigido: repetir los Labs 3 y 4 antes del módulo 01 |
| < 55 | — | No superado | Sesión de refuerzo con el formador antes de continuar |

## Trazabilidad objetivo ↔ ítem

| Objetivo | Ítems que lo evalúan |
|---|---|
| O1 — Identificar elementos de una clase | P1, P2, P8 (línea A) |
| O2 — Explicar `Promise` y `await` | P3, P4 |
| O3 — Ejecutar e interpretar la salida | E1, E2 (validación) |
| O4 — Modificar transformaciones de arrays | E1 |
| O5 — Crear módulo tipado | E1, P8 |
| O6 — Diagnosticar los tres errores frecuentes | P4, P5, P7, E2 |
| O7 — Justificar decisiones de mantenibilidad | P6, P8 (riesgo de la línea A), P9, P10 |
| O8 — Comunicar y justificar decisiones técnicas | **Parte C (D1)**, y por escrito en P4(c) y en el informe de E2 |

Ninguna de las 10 preguntas ni de los 2 ejercicios evalúa contenido que no aparezca en [`theory.md`](../theory.md) y no se practique en un Lab. La comprobación de cobertura está en la [guía del formador](../../../docs/trainer-guide.md), sección 5.
