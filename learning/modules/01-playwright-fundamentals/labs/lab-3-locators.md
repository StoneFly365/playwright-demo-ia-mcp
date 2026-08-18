# Lab 3 — MODIFY → DESIGN · Elegir el locator correcto ⭐

**Nivel:** 2 · MODIFY → 4 · DESIGN · **Tiempo:** 60 min · **Objetivos:** P3, P4 *(y O8 del módulo 00, subido de nivel: justificar una elección entre alternativas)*

---

## Objetivo

**Seleccionar y justificar el locator más apropiado** para cada uno de doce elementos reales de la aplicación, valorando robustez, semántica, accesibilidad, mantenibilidad y contexto.

> **Lo que este Lab NO evalúa:** cuántas estrategias distintas has usado. Un alumno que use tres bien elegidas y las justifique lo supera. Uno que use cinco sin criterio, no.

## Contexto

Este proyecto localiza elementos de **una sola manera**: `[data-test="…"]`, 66 veces. Es una estrategia buena y aplicada con consistencia, pero como material de aprendizaje tiene un problema: **no se puede aprender a elegir si solo ves una opción.**

Aquí ves las demás. Y descubres que no son intercambiables: en esta aplicación `getByLabel` no funciona en **ningún** elemento, `getByRole` no sirve para los títulos de página, y el desplegable de ordenación se localiza por rol solo porque es el único de la página.

**El entregable principal del Lab no es el fichero de tests: es tu tabla de decisión.** Los tests son la prueba de que tus locators funcionan; la tabla es la prueba de que sabes por qué los has elegido.

## Prerrequisitos

- Labs 1 y 2 completados.
- [Teoría](../theory.md), secciones 5 a 12.
- [`locator-reference.md`](../locator-reference.md) abierto — **pero léelo después de intentar cada bloque**, no antes.

## Archivos implicados

| Fichero | Papel |
|---|---|
| [`learning/student/sandbox/01-playwright/03-locators.spec.ts`](../../../student/sandbox/01-playwright/03-locators.spec.ts) | **El que amplías.** Llega con el bloque 3.1 resuelto |
| `learning/student/sandbox/01-playwright/03-decisiones.md` | **El entregable principal.** Lo creas tú |
| [`learning/student/sandbox/01-playwright/playwright.config.ts`](../../../student/sandbox/01-playwright/playwright.config.ts) | Lectura del bloque 3.2 |
| [`pages/login.page.ts:7,15-17`](../../../../pages/login.page.ts) · [`pages/checkout.page.ts:17-19`](../../../../pages/checkout.page.ts) | Lectura: la estrategia actual del proyecto |
| [`tests/checkout.spec.ts:34`](../../../../tests/checkout.spec.ts) | Lectura: el único `getByRole` de la suite |
| [`pages/inventory.page.ts:21`](../../../../pages/inventory.page.ts) | Lectura: el desplegable del bloque 3.5 |

---

## El entregable: `03-decisiones.md`

Crea el fichero desde el principio y ve rellenándolo bloque a bloque. Una fila por elemento:

```markdown
| Elemento | Locator elegido | Criterio | Alternativa descartada | Por qué la descarto |
|---|---|---|---|---|
| Campo Usuario (login) | `getByRole('textbox', { name: 'Username' })` | Semántica | `#user-name` | … |
```

Los cinco criterios válidos son **robustez, semántica, accesibilidad, mantenibilidad y contexto**. "Porque funciona" no es un criterio: todos los de la tabla funcionan.

Los **doce elementos obligatorios**:

1. Campo Usuario · 2. Campo Contraseña · 3. Botón Login
4. First Name · 5. Last Name · 6. Postal Code · 7. Botón Checkout (carrito)
8. Un producto concreto del catálogo · 9. Su botón "Add to cart"
10. El título "Products" · 11. El desplegable de ordenación · 12. El mensaje de confirmación

---

## Pasos

### Bloque 3.1 — El login, dos veces *(ya resuelto: es tu ejemplo)*

Ejecuta el fichero tal y como llega:

```bash
npx playwright test -c learning/student/sandbox/01-playwright --project=chromium 03-locators.spec.ts
```

`2 passed`. Los dos tests hacen login: uno por rol, otro por placeholder.

**Responde en `03-decisiones.md`:** los dos localizan exactamente los mismos elementos. ¿Por qué? La respuesta está en el HTML del campo Usuario — mírala en el navegador antes de leer la [teoría §7](../theory.md#7-getbyplaceholder-el-nombre-accesible-y-el-caso-getbylabel).

Y rellena ya las filas 1, 2 y 3 de tu tabla.

### Bloque 3.2 — Habilitar `getByTestId`

Abre [`playwright.config.ts` de tu sandbox](../../../student/sandbox/01-playwright/playwright.config.ts) y localiza la línea `testIdAttribute`.

1. **Predice:** sin esa línea, ¿cuántos elementos resolvería `page.getByTestId('username')`?
2. Escribe un tercer test de login usando `getByTestId` en los tres elementos. Debe quedar en verde.
3. Cuenta cuántas veces aparece `data-test` en `pages/` y en `tests/`:

```bash
grep -ro 'data-test' pages/ tests/ | wc -l          # todas: 66
grep -ro '\[data-test=' pages/ tests/ | wc -l       # exactas: 58
grep -ro '\[data-test\^=' pages/ tests/ | wc -l     # por prefijo: 8
```

**Responde:** ¿qué ganaría el proyecto añadiendo esa línea a su configuración raíz? ¿Y qué **no** ganaría? *(La configuración raíz no se toca: es una recomendación escrita, no un cambio.)*

### Bloque 3.3 — El caso `getByLabel` *(sin código)*

Este bloque **no lleva tests**. Es el más importante del Lab.

`getByLabel()` es, en la mayoría de aplicaciones, la mejor forma de localizar un campo de formulario. Aquí resuelve **0 elementos en los 20 probados**.

Comprueba tú mismo cuántas etiquetas hay en la página de login:

```typescript
console.log(await page.locator('label').count());
```

**Responde a las cuatro preguntas en `03-decisiones.md`:**

1. ¿Por qué `getByLabel('Username')` no encuentra nada?
2. ¿Qué evidencia concreta del HTML lo demuestra?
3. ¿Qué implica esto para una persona que navegue con lector de pantalla? *(pista: ¿qué le pasa al `placeholder` cuando empiezas a escribir?)*
4. ¿Qué le pedirías al equipo de desarrollo, y con qué argumento? Redáctalo como lo pondrías en un ticket: una frase de petición y una de justificación.

### Bloque 3.4 — Los títulos de página

Escribe un test que verifique que el catálogo muestra el título "Products".

Empieza por lo que dice la intuición y **mide** antes de asumir:

```typescript
console.log(await page.getByRole('heading', { name: 'Products' }).count());
```

Después elige tu locator, deja el test en verde y rellena la fila 10 de la tabla. En la columna "Por qué la descarto" explica qué te dijo el `count()`.

### Bloque 3.5 — El desplegable que funciona por casualidad

Localiza el desplegable de ordenación **por rol** y deja en verde un test que ordene por precio de menor a mayor.

Después inspecciona el `<select>` en el navegador y responde:

1. ¿Tiene `id`? ¿`aria-label`? ¿`<label>`?
2. Entonces, ¿por qué funciona `getByRole('combobox')`?
3. **¿Lo usarías en una suite que va a durar dos años?** Justifica: si sí, ¿bajo qué condición? Si no, ¿qué usarías y qué pierdes al cambiar?

### Bloque 3.6 — Ambigüedad: acotar, no rendirse

Añade al carrito la **Sauce Labs Fleece Jacket** con estas restricciones:

- ❌ Sin `.first()`, `.nth()` ni `.last()`.
- ❌ Sin escribir el `data-test` completo del botón (`add-to-cart-sauce-labs-fleece-jacket`).
- ✅ Partiendo de la tarjeta del producto y bajando hasta su botón.

Antes, mide la ambigüedad:

```typescript
console.log(await page.getByRole('button', { name: 'Add to cart' }).count());
```

Verifica con una aserción que el contador del carrito muestra `1`, y rellena las filas 8 y 9.

**Responde:** tu locator, ¿seguiría funcionando si el catálogo cambiara el orden de los productos? ¿Y si añadieran un séptimo producto? ¿Y la versión con `.first()`?

### Bloque 3.7 — El nombre accesible que engaña *(5 minutos)*

En el paso 1 del checkout hay un botón **Cancel**. Predice cuántos elementos resuelve:

```typescript
await page.getByRole('button', { name: 'Cancel', exact: true }).count();
```

Ejecútalo, mira el resultado y averigua **cuál es su nombre accesible real**. Anótalo en tu tabla como aviso.

### Bloque 3.8 — Cierra la tabla

Completa las filas que falten (4, 5, 6, 7 y 12) usando el flujo de checkout. No hacen falta tests nuevos para todas: basta con que cada locator que propongas lo hayas comprobado al menos con un `count()`.

---

## Resultado esperado

- `03-locators.spec.ts` con **al menos 6 tests en verde** (los 2 dados más los de los bloques 3.2, 3.4, 3.5 y 3.6).
- `03-decisiones.md` con las 12 filas rellenas, las 4 respuestas del bloque 3.3 y las respuestas de los bloques 3.2, 3.5, 3.6 y 3.7.

## Validación

```bash
npx playwright test -c learning/student/sandbox/01-playwright --project=chromium 03-locators.spec.ts
npx tsc --noEmit

# Comprobación de las restricciones del bloque 3.6
grep -n "first()\|nth(\|last()" learning/student/sandbox/01-playwright/03-locators.spec.ts
# no debe devolver nada

git add learning/student/sandbox/01-playwright/
git commit -m "feat(lab-3): tabla de decisión de locators con tests de respaldo"
```

## Preguntas de reflexión

1. El proyecto usa `[data-test]` 66 veces y `getByRole` una. **¿Está mal?** Argumenta a favor y en contra antes de decidir.
2. Un locator por rol se rompe si cambia el texto del botón. Uno por `data-test`, no. **¿Por qué la documentación de Playwright recomienda igualmente el rol como primera opción?**
3. Tu tabla tiene 12 filas. Si mañana el equipo de desarrollo rediseña la maquetación sin cambiar el comportamiento, **¿cuántas de tus 12 filas seguirían funcionando?** Márcalas.

## Criterios de finalización

- [ ] Las 12 filas tienen un **criterio de los cinco**, no "porque funciona".
- [ ] Cada fila nombra una alternativa descartada y por qué.
- [ ] El bloque 3.3 está respondido **sin código** y la pregunta 4 está redactada como un ticket.
- [ ] El bloque 3.6 no usa `.first()`, `.nth()` ni `.last()`.
- [ ] Todos los tests en verde y todas las aserciones con mensaje descriptivo.

## Learning points

- **La jerarquía de locators es una guía, no una ley.** La decisión real la marca el HTML que te dan: aquí, la ausencia total de `<label>` tumba la estrategia que la documentación recomienda primero.
- **Un locator que funciona hoy no es necesariamente un buen locator.** `getByRole('combobox')` está en verde y es frágil: depende de que nadie añada un segundo desplegable. El verde no mide mantenibilidad.
- **Acotar es la respuesta a la ambigüedad; `.first()` es taparla.** El patrón `contenedor → filter → elemento` resuelve todas las ambigüedades de esta aplicación.
- El nombre accesible **se comprueba, no se supone**: "Go back Cancel" no lo adivina nadie.
- Cuando la aplicación te impide usar la buena estrategia, eso **es un hallazgo de calidad**, no una limitación del test. Reportarlo forma parte del trabajo.
