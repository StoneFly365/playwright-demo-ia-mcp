# Challenge 1 — Compra completa con validación de importes

**Nivel:** 3 · CREATE + 4 · DESIGN · **Tiempo:** 75 min · **Objetivos:** P3, P5, P6, **P8**

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
| **AC2** | Los tres importes (subtotal, impuestos, total) se verifican **con valores**, no solo con visibilidad. Este es el criterio que más pesa: [`tests/checkout.spec.ts:101-118`](../../../../tests/checkout.spec.ts) solo comprueba que se ven, y tu trabajo mejora esa cobertura en vez de repetirla |
| **AC3** | Hay al menos un test negativo de validación del formulario de checkout |
| **AC4** | Tres o más estrategias de locator, con su tabla de justificación en `decisiones.md` |
| **AC5** | Verde en `chromium`, `firefox` y `webkit` |
| **AC6** | `decisiones.md` entregado: por qué esos locators, por qué ese reparto en tests, y **qué no has automatizado y por qué** |

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
| Justificación escrita (AC6) | 20% | Reparto, riesgos y **lo que no has automatizado** |

## Preguntas de la defensa técnica (Parte C)

Prepara estas cuatro. Son las que se te van a hacer:

1. **¿Por qué ese locator y no otro?** Elige el que más te haya costado decidir.
2. **Si la aplicación cambia de maquetación sin cambiar de comportamiento, ¿cuáles de tus tests se rompen?**
3. **Cuéntame un problema que te encontraste:** cuál era el síntoma y cuál la causa.
4. **Si mañana esto falla en CI, ¿qué mirarías primero?**

## Por qué este escenario

- Es el flujo más largo de la aplicación y toca las cinco pantallas.
- **AC2 cubre un hueco real de la suite del proyecto**: `checkout.spec.ts` verifica que los importes se ven, no que sean correctos. Mejoras la cobertura en lugar de repetirla.
- Es genérico —una compra online— pero se traduce directamente a una contratación de seguro: datos del tomador, validación por campo, cálculo de prima e impuestos, confirmación. La forma del problema es la del módulo 09.
