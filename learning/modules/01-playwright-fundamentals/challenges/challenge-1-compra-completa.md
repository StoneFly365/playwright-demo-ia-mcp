# Challenge 1 — Compra completa con validación de importes

**Nivel:** 3 · CREATE + 4 · DESIGN · **Tiempo:** 90 min · **Objetivos:** P3, P5, P6, **P8**
**Cuándo:** entre la sesión 5 y la sesión 6, con los Labs 1-5 ya completos. **Entrega antes de la sesión 6.**

---

## El escenario

> Un cliente entra en la tienda, añade **dos productos de precios distintos**, revisa el carrito, completa sus datos de envío y finaliza la compra.
>
> Antes de confirmar, quiere ver desglosados el **subtotal**, los **impuestos** y el **total**, y que las cifras cuadren.
>
> Si se equivoca al rellenar sus datos, la aplicación debe decírselo con claridad.

Eso es todo lo que hay. **No hay pasos, ni ficheros indicados, ni número de tests prescrito.**

## Qué se te pide

Diseñar y escribir la cobertura automatizada de ese escenario.

Tú decides:

- **Qué automatizar** y qué no.
- **Cuántos tests** y cómo repartir el escenario entre ellos.
- **Qué locators** usar en cada elemento.
- **Qué aserciones** aplicar, y con qué mensajes.
- **Qué riesgos** cubres con cada test.

## Qué puedes reutilizar y qué tiene que ser tuyo

En un equipo real nadie escribe desde cero lo que ya existe. Aquí tampoco — pero **lo que reutilizas se declara**.

| | Qué es | Ejemplo concreto |
|---|---|---|
| **Material para aprender** | Lo que lees para entender cómo se hacen las cosas en este proyecto | [`tests/checkout.spec.ts`](../../../../tests/checkout.spec.ts) entero, los 6 Page Objects, la teoría |
| **Reutilización legítima** ✅ | Mecánica ya resuelta que no aporta nada volver a inventar. **Se declara en `decisiones.md`** | El recorrido login → añadir producto → carrito → checkout de [`tests/checkout.spec.ts:12-36`](../../../../tests/checkout.spec.ts); los métodos de `pages/` |
| **Evidencia propia** ❌ no copiable | Lo que se evalúa. No existe en el repositorio: si aparece copiado, no es tuyo | La verificación de los tres importes **por valor** (AC2), el caso límite y el negativo (AC3), la tabla de locators (AC4) y el apartado de qué **no** has automatizado (AC6) |

**El flujo no es el ejercicio: el flujo es el andamio.** `tests/checkout.spec.ts:102-118` comprueba que los importes **se ven**; ninguna línea del repositorio comprueba que **sean correctos**. Ahí empieza tu trabajo.

## Restricciones

1. Todo el código vive en `learning/student/sandbox/01-playwright/`. **No se toca `tests/` ni `pages/`** — aunque puedes **importar** los Page Objects existentes y usarlos.
2. Puedes usar los Page Objects o locators directos, pero debes **justificar la elección** en cada caso.
3. **Al menos tres estrategias de locator distintas** entre todos tus tests, cada una justificada con uno de los cinco criterios. *(Tres es un mínimo, no un objetivo: usar cinco sin criterio puntúa peor que usar tres con él.)*
4. **Ninguna espera explícita.** Ni `waitForTimeout`, ni `waitForSelector`, ni `waitForLoadState`.
5. **Todas las aserciones con mensaje descriptivo** en lenguaje de negocio.
6. Al menos **un caso negativo** (datos incompletos) y **un caso de valor límite**.
7. Verde en los **tres navegadores**.

## Criterios de aceptación

| # | Criterio |
|---|---|
| **AC1** | El flujo completo está cubierto: login → catálogo → carrito → checkout paso 1 → paso 2 → confirmación |
| **AC2** | Los tres importes (subtotal, impuestos, total) se verifican **con valores**, no solo con visibilidad. Este es el criterio que más pesa: [`tests/checkout.spec.ts:102-118`](../../../../tests/checkout.spec.ts) solo comprueba que se ven, y tu trabajo mejora esa cobertura en vez de repetirla |
| **AC3** | Hay al menos un test negativo de validación del formulario de checkout |
| **AC4** | Tres o más estrategias de locator, con su tabla de justificación en `decisiones.md` |
| **AC5** | Verde en `chromium`, `firefox` y `webkit` |
| **AC6** | `decisiones.md` entregado: por qué esos locators, por qué ese reparto en tests, **qué no has automatizado y por qué**, y la **declaración de reutilización**: qué has tomado de `tests/checkout.spec.ts` y en qué mejora tu cobertura la suya |

### Sobre AC2 — los importes

Los valores están **medidos contra la aplicación real**, así que el criterio es verificable:

| Carrito | Subtotal | Impuestos | Total |
|---|---|---|---|
| Sauce Labs Backpack ($29.99) | `Item total: $29.99` | `Tax: $2.40` | `Total: $32.39` |
| Backpack + Bike Light ($29.99 + $9.99) | `Item total: $39.98` | `Tax: $3.20` | `Total: $43.18` |

El impuesto es el **8 % del subtotal, redondeado a 2 decimales**.

**Decisión de diseño que tienes que tomar, y justificar:** ¿compruebas los importes contra **valores fijos** (`'Total: $43.18'`) o **calculados** a partir de los precios que muestra el catálogo? Las dos opciones son defendibles y tienen consecuencias distintas el día que cambien los precios o el tipo impositivo. Elige una y argumenta.

> Cuidado con el mismo agujero del Lab 2: si calculas el total leyéndolo de la propia pantalla de resumen, tu test no verifica nada.

## Entregables

```
learning/student/sandbox/01-playwright/
├── challenge-1-compra.spec.ts     (o los ficheros que decidas)
└── decisiones.md
```

### Qué debe contener `decisiones.md`

1. **Reparto de tests:** cuántos, cuál cubre qué, y por qué ese reparto y no uno solo enorme ni diez diminutos.
2. **Tabla de locators:** elemento, locator elegido, criterio, alternativa descartada. Es la misma tabla del Lab 3 aplicada a este escenario.
3. **Decisión sobre los importes:** valores fijos o calculados, y por qué.
4. **Riesgos:** qué puede romper tus tests sin que haya un bug de la aplicación.
5. **Qué NO has automatizado y por qué.** Es la pregunta que más dice de un QA. Hay cosas en ese escenario que no merecen un test automático, y saber cuáles es criterio.
6. **Declaración de reutilización.** Dos líneas: qué has reutilizado de `tests/checkout.spec.ts` (o de cualquier otro spec) y **en qué mejora tu cobertura la suya**. Reutilizar está bien y declararlo es obligatorio; lo que no vale es entregar como propio un flujo copiado sin decirlo ni mejorarlo.

## Validación

```bash
# Tus tests, en los tres navegadores
npx playwright test -c learning/student/sandbox/01-playwright challenge-1-compra.spec.ts

# Tipos
npx tsc --noEmit

# Sin esperas explícitas
grep -n "waitForTimeout\|waitForSelector\|waitForLoadState" learning/student/sandbox/01-playwright/challenge-1-compra.spec.ts
# no debe devolver nada

# El proyecto intacto
git status --short

git add learning/student/sandbox/01-playwright/
git commit -m "feat(challenge-1): cobertura del flujo de compra con validación de importes"
```

## Cómo se corrige

| Criterio | Peso | Qué se mira |
|---|---|---|
| Criterios de aceptación AC1-AC5 | 35% | Cobertura del flujo, importes por valor, caso negativo, tres navegadores |
| Elección de locators y su justificación (AC4) | 25% | Que cada uno tenga un criterio y una alternativa descartada |
| Aserciones y mensajes | 20% | La aserción adecuada al caso; mensajes que se entienden sin abrir el código |
| Justificación escrita (AC6) | 20% | Reparto, riesgos, **lo que no has automatizado** y la declaración de reutilización |

## Preguntas de la defensa técnica (Parte C)

La defensa se hace **sobre este `decisiones.md`**: el Challenge es el entregable que evalúa P8 y sin él no hay Parte C. Prepara estas cinco preguntas, que son las que se te van a hacer:

1. **¿Por qué ese locator y no otro?** Elige el que más te haya costado decidir.
2. **Si la aplicación cambia de maquetación sin cambiar de comportamiento, ¿cuáles de tus tests se rompen?**
3. **Cuéntame un problema que te encontraste:** cuál era el síntoma y cuál la causa.
4. **Si mañana esto falla en CI, ¿qué mirarías primero?**
5. **¿Por qué ese reparto de tests, qué has reutilizado de la suite y qué decidiste no automatizar?**

## Por qué este escenario

- Es el flujo más largo de la aplicación y toca las cinco pantallas.
- **AC2 cubre un hueco real de la suite del proyecto**: `checkout.spec.ts` verifica que los importes se ven, no que sean correctos. Mejoras la cobertura en lugar de repetirla.
- Es genérico —una compra online— pero se traduce directamente a una contratación de seguro: datos del tomador, validación por campo, cálculo de prima e impuestos, confirmación. La forma del problema es la del módulo 09.
