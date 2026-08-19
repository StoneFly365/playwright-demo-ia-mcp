# 4 · Playwright + IA

⏱️ **Duración:** 90 min · **Nivel:** 2 · MODIFY → 4 · DESIGN · **Anterior:** [3 · Generación de casos de prueba](03-generacion-tests.md)

---

## 🎯 Objetivo

Usar IA para escribir y mantener tests de Playwright reales, sabiendo revisar lo que produce.

Es el módulo más largo de la ruta.

---

## 🧠 Aprende (20 min)

Lo imprescindible, y nada más. Cada apartado enlaza la versión larga por si algún día la quieres: no hace falta para seguir aquí.

### Locators: elegir, no memorizar

No hay "cinco estrategias que hay que saberse". Hay **un elemento y una decisión**, con cuatro criterios: **robustez** (¿sobrevive a un cambio de estilos?), **semántica** (¿describe lo que ve el usuario o cómo está montado el HTML?), **accesibilidad** (¿comprueba de paso que el elemento es accesible?) y **mantenibilidad** (¿se entiende dentro de un año?).

Orden de preferencia práctico:

```text
getByRole()  ►  getByTestId()  ►  getByPlaceholder() / getByText()  ►  CSS  ►  XPath
    ▲                                                                        ▲
 rol + nombre accesible                                     último recurso: frágil
```

Una particularidad de este proyecto: la aplicación usa el atributo **`data-test`**, no el `data-testid` que Playwright asume. Por eso el sandbox declara `testIdAttribute: 'data-test'`. Sin esa línea, `getByTestId('username')` resuelve **cero** elementos.

📚 *Los 20 elementos de esta aplicación medidos con 7 estrategias: [referencia de locators](../modules/01-playwright-fundamentals/locator-reference.md).*

### Strict mode: la ambigüedad no se tapa

Si un locator resuelve **más de un elemento**, Playwright falla en vez de coger el primero. Es una función, no un problema.

```typescript
// Tapa el problema: ¿por qué hay varios? ¿cuál es "el primero"?
await page.getByRole('button', { name: 'Remove' }).first().click();

// Acota hasta que solo quede uno
await page.locator('[data-test="inventory-item"]')
          .filter({ hasText: 'Sauce Labs Backpack' })
          .getByRole('button', { name: 'Remove' })
          .click();
```

`.first()`, `.nth()` y `.last()` atan el test a un orden de pintado que nadie garantiza. **Cuando la IA te proponga un `.first()`, casi siempre es que no supo acotar.**

### Auto-waiting y aserciones web-first

Playwright espera solo: antes de un clic comprueba que el elemento existe, es visible, es estable y recibe eventos. Y `expect(locator)` **reintenta** hasta que se cumple o expira el timeout.

```typescript
// ✅ Reintenta. Si el badge tarda, espera; si no llega, falla con contexto
await expect(inventoryPage.cartBadge).toHaveText('1');

// ❌ Lee una vez. Si aún no ha llegado, falla; si llega tarde, nadie se entera
expect(await inventoryPage.cartBadge.textContent()).toBe('1');

// ❌❌ Lento cuando va bien, insuficiente cuando va mal
await page.waitForTimeout(3000);
```

Regla sin excepciones: **`waitForTimeout` no se usa.** Si la IA te lo mete, es la primera línea que borras.

### Mensajes de aserción

Toda aserción lleva mensaje descriptivo, en lenguaje de negocio:

```typescript
await expect(
  inventoryPage.cartBadge,
  'El badge del carrito debería mostrar 1 tras añadir la Sauce Labs Backpack',
).toHaveText('1');
```

No es cosmético: es lo que lee quien no escribió el test, **y es lo que lee la IA cuando le pides que diagnostique el fallo**. Un mensaje bueno multiplica la calidad del análisis del módulo 6.

📚 *Auto-waiting, aserciones y anatomía de un spec en detalle: [teoría del Módulo 01](../modules/01-playwright-fundamentals/theory.md), secciones 3, 4 y 13.*

### Comandos

```bash
npx playwright test -c learning/student/sandbox/ruta-qa --project=chromium
npx playwright test -c learning/student/sandbox/ruta-qa --project=chromium --headed
npx tsc --noEmit
```

---

## 🛠️ Practica 1 (15 min) — leer el rojo

```bash
npm run test:chromium
```

79 tests, unos 22 segundos, **10 en rojo**. Abre el informe con `npm run test:report`.

Aprende a distinguir las tres clases de rojo, porque la IA no las distingue por ti:

| Clase | Qué significa | Ejemplo aquí |
|---|---|---|
| **Bug de la aplicación** | El código de producción está mal | `problem_user`: la UI falla de verdad |
| **Bug del test** | El test espera algo incorrecto | Los 10 `@demo-fail`: esperan `/home.html` cuando la app va a `/inventory.html` |
| **Fragilidad** | Ni la app ni la expectativa: el test | Un `.first()` sobre un orden que cambió |

Abre [`tests/login.spec.ts:12`](../../tests/login.spec.ts) y localiza el comentario `⚠️ FALLO INTENCIONADO`. **No lo corrijas.** Anota en `04-notas.md` a qué clase pertenece y por qué.

---

## 🛠️ Practica 2 (30 min) — generar un test con IA y revisarlo

Vas a implementar el caso de ordenación A→Z que diseñaste en el módulo 3.

**La infraestructura ya está hecha.** Abre [`04-orden-az.spec.ts`](../student/sandbox/ruta-qa/04-orden-az.spec.ts): trae imports, `describe`, `beforeEach` con el login y el test en `skip`, esperando su cuerpo. No pierdas un minuto con rutas relativas.

### Paso 1 — Quita el `.skip` y dale contexto real

Al asistente le das **ficheros**, no adjetivos:

```text
CONTEXTO
Proyecto Playwright + TypeScript con Page Object Model.
Lee estos ficheros antes de escribir nada:
- pages/inventory.page.ts
- tests/inventory.spec.ts

TAREA
Escribe el cuerpo del test que está en skip dentro de
learning/student/sandbox/ruta-qa/04-orden-az.spec.ts
Verifica la ordenación por nombre de la A a la Z del catálogo.

RESTRICCIONES
- Usa los Page Objects ya importados en el fichero. No reescribas el login.
- Sigue exactamente el estilo de tests/inventory.spec.ts.
- Toda aserción con mensaje descriptivo en castellano, en lenguaje de negocio.
- Prohibido waitForTimeout y prohibidos los ordinales (.first(), .nth()).
- Verifica cuántos productos has recuperado antes de comprobar el orden.
- No compares contra una lista de nombres escrita a mano.
- No modifiques nada fuera de learning/student/sandbox/ruta-qa/.
```

> Cada restricción corresponde a un error que los modelos cometen de forma sistemática en tests de Playwright.
>
> ⏳ Si usas un agente con acceso al repositorio, puede tardar 2-4 minutos leyendo ficheros. No necesitas intervenir mientras trabaja.

### Paso 2 — Revisa antes de ejecutar

- [ ] ¿Hay algún `waitForTimeout`, `.first()`, `.nth()` o `sleep`?
- [ ] ¿Las aserciones son web-first (`await expect(locator)`) o son `expect(await ...)`?
- [ ] ¿Los nombres de producto están escritos a mano en el código?
- [ ] ¿Comprueba el número de productos antes del orden?
- [ ] ¿Ha usado métodos del Page Object que **no existen**? Compruébalo contra [`pages/inventory.page.ts`](../../pages/inventory.page.ts)
- [ ] ¿Toda aserción lleva mensaje?
- [ ] **¿Qué bug haría fallar este test?** Si no sabes responder, el test no vale

El penúltimo es el más frecuente: los modelos inventan métodos con nombres plausibles (`selectSortOption`, `getSortedNames`). Compilan en su cabeza, no en tu proyecto.

### Paso 3 — Ejecuta

```bash
npx playwright test -c learning/student/sandbox/ruta-qa --project=chromium 04-orden-az.spec.ts
npx tsc --noEmit
```

Si falla, no se lo devuelvas todavía a la IA: lee tú el error primero. Es el músculo del módulo 6.

---

## 🛠️ Practica 3 (20 min) — mejorar y explicar

### a) Tabla de decisión de locators (12 min)

```text
Revisa learning/student/sandbox/ruta-qa/04-orden-az.spec.ts.
Para cada locator, propón alternativas y justifica la elección con estos
cuatro criterios: robustez, semántica, accesibilidad, mantenibilidad.
No cambies el código todavía: dame primero la tabla de decisión.
```

**Pedir la tabla antes que el cambio es la técnica clave del módulo.** Te deja revisar el razonamiento en vez de un diff. Contrasta sus propuestas con la [referencia de locators](../modules/01-playwright-fundamentals/locator-reference.md), que está medida contra esta aplicación.

### b) Que te explique un error (8 min)

Rompe tu test a propósito: cambia `sortBy('az')` por `sortBy('za')` y ejecútalo. Copia el error y pide:

```text
Este test falla. Dame:
1. Qué está comprobando el test, en una frase.
2. Qué dice literalmente el error.
3. Tres hipótesis de causa, ordenadas de más a menos probable.
NO propongas ninguna corrección todavía.
```

El "no propongas corrección todavía" es deliberado. Sin esa frase, el asistente salta a arreglar el código —y muchas veces arregla **la aserción**, que es justo el desastre que hay que evitar.

Deshaz el cambio y déjalo en verde.

---

## 🎯 Llévatelo a tu proyecto (5 min)

Escoge **un test real de tu proyecto** que te dé problemas —frágil, lento o ilegible— y pide la tabla de decisión de locators sobre él:

```text
<ficha de contexto de tu proyecto>

Este es un test de nuestra suite: <pega el código>

Analiza cada locator y dame una tabla con: locator actual, problema,
alternativa propuesta y justificación (robustez, semántica,
accesibilidad, mantenibilidad). No modifiques el código.
```

Entregable: una tabla de decisión sobre un test real, lista para llevar a la revisión de código de tu equipo.

> Si tu aplicación no expone `data-testid` ni roles accesibles, **ese es el hallazgo**. Llévalo a desarrollo: es la mejora de testabilidad con mejor relación coste/beneficio que existe.

---

## ✅ Al terminar deberías ser capaz de

- Escribir un prompt que genere un test de Playwright utilizable, dando ficheros como contexto.
- Revisar código generado con la lista de siete puntos, antes de ejecutarlo.
- Detectar los tres vicios típicos de la IA en tests: `waitForTimeout`, ordinales y métodos inventados.
- Pedir una tabla de decisión de locators en vez de un cambio a ciegas.
- Pedir hipótesis de fallo sin invitar a que te arreglen la aserción.

---

> 📚 **¿Quieres profundizar?**
> - Generar un test con `codegen` y criticarlo: [Lab 6 del Módulo 01](../modules/01-playwright-fundamentals/labs/lab-6-codegen.md) (30 min). Mismo músculo que la Práctica 2, con la otra forma de generar código.
> - Auto-waiting a fondo: [Lab 2](../modules/01-playwright-fundamentals/labs/lab-2-auto-waiting.md) · Locators a fondo: [Lab 3](../modules/01-playwright-fundamentals/labs/lab-3-locators.md).

**Siguiente:** [5 · MCP para QA](05-mcp-para-qa.md) →
