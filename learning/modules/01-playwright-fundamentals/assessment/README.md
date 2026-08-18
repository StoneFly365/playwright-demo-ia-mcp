# Módulo 01 — Assessment

**Duración:** 1 hora · **Nota mínima para superar: 70 / 100** · **Y apto en la Parte C**

Sin material de consulta para la parte conceptual (A1-A8). Con el repositorio y la aplicación abiertos para la parte práctica (E1-E2).

| Parte | Ítems | Puntos | Tiempo |
|---|---|---|---|
| A — Conceptual | A1-A8 | 30 | 15 min |
| B — Práctica | E1-E2 | 70 | 40 min |
| C — Defensa técnica | D1 | Sin puntos: **apto / no apto** | 5-10 min, en el bloque 1 de la **sesión 6** |

**El reparto cambia respecto al módulo 00** (allí 40/60): aquí la práctica pesa el 70%. La progresión del programa es hacia el hacer.

### Peso por área

| Área | Peso | Objetivos |
|---|---|---|
| Estrategia de locators y su justificación | **30%** | P3, P4 |
| Aserciones y auto-waiting | 25% | P2, P6 |
| Escritura de un test completo | 25% | P5, P6 |
| Diagnóstico de fallos de localización y sincronización | 15% | P7 |
| Ejecución, configuración e informes | 5% | P1 |

La clave de corrección está en [`learning/solutions/01-playwright-fundamentals/assessment-key.md`](../../../solutions/01-playwright-fundamentals/assessment-key.md) — material del formador.

---

## Parte A — Conceptual (30 puntos)

Respuestas breves: 1-3 frases. Se valora la precisión, no la extensión. **Cinco de las ocho preguntas dan código o datos reales y piden una decisión, no una definición.**

**A1.** *(3 p)* Ejecutas `npm test` en el repositorio recién clonado y ves **30 fallos**. Un compañero dice que la suite está rota. ¿Qué le contestas y qué comando le pides que ejecute para demostrarlo?

**A2.** *(4 p)* Explica qué hace exactamente cada una de estas dos líneas, y en qué se diferencian:

```typescript
await expect(inventoryPage.cartBadge, '…').toBeVisible();
const visible = await inventoryPage.cartBadge.isVisible();
```

**A3.** *(4 p)* Un compañero añade esto a un test suyo "porque a veces falla":

```typescript
await inventoryPage.addToCart('sauce-labs-backpack');
await page.waitForTimeout(3000);
await expect(inventoryPage.cartBadge, '…').toHaveText('1');
```

**(a)** ¿Ha resuelto la intermitencia? **(b)** ¿Qué ha pagado por ello? **(c)** ¿Qué le propones en su lugar, y en qué se diferencia de lo que ha hecho?

**A4.** *(4 p)* Este locator está en verde hoy:

```typescript
await page.getByRole('combobox').selectOption('lohi');
```

El `<select>` al que apunta **no tiene `id`, ni `aria-label`, ni `<label>`**. **(a)** ¿Por qué funciona? **(b)** ¿Qué tendría que pasar en la aplicación para que dejara de funcionar, y cómo se manifestaría el fallo? **(c)** ¿Lo dejarías así en una suite que va a durar dos años? Justifica.

**A5.** *(4 p)* Tienes que localizar el botón "Add to cart" de la **Sauce Labs Onesie** en el catálogo, donde hay 6 botones con ese mismo texto. Un compañero propone `.first()` combinado con una ordenación previa. Escribe **tu** locator y explica en una frase por qué el de tu compañero es peor, incluso si su test pasa.

**A6.** *(4 p)* En [`tests/login.spec.ts:32`](../../../../tests/login.spec.ts) el mensaje de error se comprueba con `toContainText` y en [`tests/cart-badge.spec.ts`](../../../../tests/cart-badge.spec.ts) el contador con `toHaveText`. **(a)** ¿Por qué cada uno el suyo? **(b)** ¿Qué riesgo concreto tiene `toContainText` en la comprobación de un contador que muestra `'1'`?

**A7.** *(4 p)* `playwright.config.ts` del proyecto no escribe ningún timeout. Nombra **dos** valores que tus tests están heredando aun así, y explica dónde se ven sus efectos cuando un test falla.

**A8.** *(3 p)* Estás mirando dos tests en rojo. Uno dice `Expected: 6 / Received: 5`; el otro, `strict mode violation: … resolved to 2 elements`. **Sin abrir el código**, ¿qué clase de fallo es cada uno y por dónde empiezas en cada caso?

---

## Parte B — Práctica (70 puntos)

Trabaja en `learning/student/sandbox/01-playwright/`. Al terminar, entrega la rama.

### E1 — Escribir (40 puntos)

Crea `assessment-e1.spec.ts` y automatiza este caso, descrito en lenguaje de negocio:

> Un cliente añade al carrito el producto **más barato** del catálogo y va al carrito para comprobarlo. Quiere ver que ese producto —y solo ese— está en su carrito, con su precio correcto, y que el contador del carrito lo refleja.

Restricciones:

- **No** puedes escribir a mano el nombre ni el precio del producto más barato: el test debe **averiguar cuál es** a partir de la aplicación *(pista: `InventoryPage` ya tiene los métodos que necesitas)*.
- Ninguna espera explícita.
- Todas las aserciones con mensaje descriptivo en lenguaje de negocio.
- Al menos **dos estrategias de locator distintas**, y un comentario de una línea por cada una justificando la elección con uno de los cinco criterios.
- Verde en `chromium` como mínimo.

| Criterio | Puntos |
|---|---|
| Elección de locators, y justificación escrita de cada uno | 12 |
| Aserciones adecuadas al caso (no solo `toBeVisible`) | 10 |
| Mensajes descriptivos en lenguaje de negocio | 6 |
| Estructura: `describe`, `beforeEach`, uso de los Page Objects existentes | 6 |
| El test queda en verde | 6 |

> Ojo con la lección del Lab 2: si el valor esperado sale de la misma pantalla que estás verificando, el test no verifica nada. Averiguar el producto más barato en el **catálogo** y comprobarlo en el **carrito** sí es válido.

### E2 — Diagnosticar (30 puntos)

Copia estos dos tests a `assessment-e2.spec.ts`. **Los dos fallan, por causas distintas, y ninguna es un fallo de la aplicación ni de la lógica.**

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../../pages/login.page';
import { InventoryPage } from '../../../../pages/inventory.page';

test.describe('Assessment E2', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
  });

  test('fallo 1 — debería mostrar el precio de la Sauce Labs Onesie', async ({ page }) => {
    await expect(
      page.getByTestId('inventory-item-price'),
      'La Sauce Labs Onesie debería mostrarse en el catálogo con un precio de 7,99 dólares',
    ).toHaveText('$7.99');
  });

});

test.describe('Assessment E2 — usuario lento', () => {
  test('fallo 2 — debería añadir un producto con performance_glitch_user', async ({ page }) => {
    test.setTimeout(3000);

    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    await loginPage.navigate();
    await loginPage.login('performance_glitch_user', 'secret_sauce');
    await inventoryPage.addToCart('sauce-labs-backpack');

    await expect(
      inventoryPage.cartBadge,
      'El contador del carrito debería mostrar 1 producto tras añadir la Sauce Labs Backpack',
    ).toHaveText('1');
  });
});
```

Entrega el fichero corregido **y** un informe con el formato del Lab 5 (síntoma / hipótesis / comprobación / causa raíz / corrección / cómo evitarlo) para cada fallo.

| Criterio | Puntos |
|---|---|
| Diagnóstico correcto del fallo 1 (causa raíz, no síntoma) | 10 |
| Diagnóstico correcto del fallo 2 (causa raíz, no síntoma) | 10 |
| Las dos correcciones están **en el sitio correcto** y ninguna toca una aserción | 8 |
| Los dos tests pasan | 2 |

> **Penalización heredada del módulo 00:** modificar una aserción —incluido su valor esperado o su mensaje— para llegar a verde resta **12 puntos**, aunque el resultado sea verde. Sin excepciones.
>
> **Penalización propia de este módulo:** resolver el fallo 1 con `.first()`, `.nth()` o `.last()` resta **6 puntos**. El error desaparece; la ambigüedad, no.

---

## Parte C — Defensa técnica (apto / no apto)

Evalúa **P3 y P8**: seleccionar, justificar y anticipar. Es la continuación directa de la Parte C del módulo 00, con la pregunta central subida de nivel: ya no es *"¿qué hiciste y por qué?"*, sino **"¿por qué ese locator y no otro, y qué pasa si la aplicación cambia?"**.

No se convoca como prueba aparte: ocurre en el **bloque 1 de la sesión 6**, mientras el grupo hace la revisión cruzada de los `decisiones.md`. Es el primer momento del módulo en que ese entregable existe.

### D1 — Defensa de una decisión propia (5-10 min)

**La defensa se hace sobre el `decisiones.md` del Challenge**, que es el único entregable que cubre P8; el `03-decisiones.md` del Lab 3 se usa como apoyo cuando la pregunta 1 lo requiera. Sin Challenge entregado no hay Parte C: se aplaza hasta que lo esté.

| # | Pregunta | Qué demuestra |
|---|---|---|
| 1 | Elige el locator que más te costó decidir. ¿Por qué ese y no la alternativa? | Justificación entre alternativas (P3) |
| 2 | Si mañana rediseñan la maquetación sin cambiar el comportamiento, ¿cuáles de tus tests se rompen? | Anticipación de mantenibilidad |
| 3 | Cuéntame un problema que te encontraste: ¿síntoma y causa? | Distinción síntoma / causa raíz (P7) |
| 4 | Si esto falla mañana en CI, ¿qué mirarías primero? | Traslado del razonamiento a un contexto nuevo |
| 5 | ¿Por qué ese reparto de tests y no otro, qué has reutilizado de la suite del proyecto y qué decidiste **no** automatizar? | **Diseño de la cobertura y sus límites (P8)** |

### Rúbrica

| Nivel | Descriptor | Resultado |
|---|---|---|
| **Sólido** | Justifica con uno de los cinco criterios, nombra la alternativa descartada y anticipa cómo envejece su decisión sin que se lo pregunten | Apto |
| **Adquirido** | Explica su elección con un criterio y distingue síntoma de causa cuando se le pregunta directamente | Apto |
| **No demostrado** | Justifica con "porque funciona" o "porque lo hace el proyecto"; o describe el síntoma como si fuera la causa ("fallaba el locator") | **No apto** — se repite en la revisión del Challenge |

> **Criterio de corrección:** *"usé `data-test` porque es lo que usa el proyecto"* es **No demostrado**. *"Usé `getByRole` porque si cambia el nombre del botón es que ha cambiado lo que ve el usuario y quiero enterarme; descarté `data-test` porque aquí el rol ya es unívoco"* es **Sólido**.

---

## Escala

| Puntuación | Parte C | Resultado | Consecuencia |
|---|---|---|---|
| 85-100 | Apto | Superado con holgura | Pasa al módulo 02 con los ejercicios `[+]` |
| 70-84 | Apto | Superado | Pasa al módulo 02 |
| ≥ 70 | **No apto** | Pendiente | Repite la defensa en la revisión del Challenge. No bloquea el módulo 02 |
| 55-69 | — | No superado | Refuerzo dirigido: repetir los Labs 3 y 5 antes del módulo 02 |
| < 55 | — | No superado | Sesión de refuerzo con el formador antes de continuar |

## Trazabilidad objetivo ↔ ítem ↔ dónde se enseñó

Ningún ítem evalúa contenido que no esté en [`theory.md`](../theory.md) **y** no se practique en un Lab:

| Ítem | Objetivo | Se enseña en | Se practica en |
|---|---|---|---|
| A1 | P1 | Teoría §1, §2 | Lab 1 (Pasos 2 y 6) |
| A2 | P2 | Teoría §3 | Lab 2 (Paso 3) |
| A3 | P2 | Teoría §3 | Lab 2 (Pasos 2 y 5) |
| A4 | P3 | Teoría §5, §6, §12 | Lab 3 (bloque 3.5) |
| A5 | P3 | Teoría §10, §11 | Lab 3 (bloque 3.6), Lab 5 (caso A) |
| A6 | P6 | Teoría §4 | Lab 4, Challenge |
| A7 | P1 | Teoría §13 | Lab 1 (Paso 1) |
| A8 | P1, P7 | Teoría §2 | Lab 1 (Paso 3), Lab 5 |
| **E1** | P3, P5, P6 | Teoría §4-§11, §13 | Labs 3 y 4 |
| **E2** | P2, P7 | Teoría §3, §10 | Labs 2 y 5 |
| **D1** | P3, P8 | Todo el módulo | **Challenge** (obligatorio; ver *Criterio de superación* en [`learning-objectives.md`](../learning-objectives.md)), con apoyo del Lab 3 |
