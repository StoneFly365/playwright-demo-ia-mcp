# Lab 5 — TROUBLESHOOT · El test que a veces pasa

**Nivel:** 5 · TROUBLESHOOT · **Tiempo:** 50 min · **Objetivos:** P7 *(y P2, P3)*

---

## Objetivo

Diagnosticar dos tests en rojo cuya causa **no está en la lógica ni en la aplicación**, sino en cómo localizan los elementos. Escribir el diagnóstico **antes** de corregir, y corregir sin tocar ninguna aserción.

## Contexto

Los dos fallos de este Lab son **auténticos**: uno lo produce el HTML real de la aplicación y el otro es un defecto que lleva meses en el repositorio sin que nadie lo haya notado.

Ninguno de los dos se parece a "el test está mal escrito". Los dos tienen la forma más incómoda que existe: **el test parece razonable y aun así falla.**

> **Regla del programa, que aquí se aplica con especial cuidado:** las aserciones describen el comportamiento correcto y **no se tocan**. Y **`pages/cart.page.ts` tampoco se toca**, aunque descubras exactamente qué le pasa. Ese defecto es material del módulo 02 y del propio programa: si lo arreglas, el ejercicio desaparece para el resto del grupo.

## Prerrequisitos

- Labs 1 a 4 completados.
- [Teoría](../theory.md), secciones 10, 11 y 12.

## Archivos implicados

| Fichero | Papel |
|---|---|
| [`learning/student/sandbox/01-playwright/05-diagnostico.spec.ts`](../../../student/sandbox/01-playwright/05-diagnostico.spec.ts) | **El que corriges.** Llega en rojo: 2 fallos |
| `learning/student/sandbox/01-playwright/05-diagnostico.md` | **El informe. Se escribe antes de corregir** |
| [`pages/cart.page.ts:7`](../../../../pages/cart.page.ts) | Lectura. **No se modifica** |
| [`tests/cart-sync.spec.ts:32`](../../../../tests/cart-sync.spec.ts) | Lectura del Paso 5 |

---

## Pasos

### Paso 1 — Reproduce

```bash
npx playwright test -c learning/student/sandbox/01-playwright --project=chromium 05-diagnostico.spec.ts
```

`2 failed`. **Lee los dos mensajes de error enteros antes de tocar nada.** Los dos son informativos; uno de ellos, extraordinariamente informativo.

### Paso 2 — Diagnostica antes de corregir

Crea `05-diagnostico.md` y **rellénalo antes de escribir una línea de corrección**. Una entrada por fallo, con el formato del Lab 4 del módulo 00:

```markdown
## Caso X — <nombre del test>

**Síntoma:** qué esperaba el test y qué obtuvo. Cópialo literal de la salida.
**Hipótesis:** qué crees que pasa, antes de comprobarlo.
**Comprobación:** qué has ejecutado para confirmarla o descartarla, y qué te devolvió.
**Causa raíz:** por qué ocurre. Una o dos frases.
**Corrección:** qué cambias, dónde y por qué ahí.
**Cómo evitarlo:** qué regla seguirías para que no vuelva a pasar.
```

**La casilla "Comprobación" no es opcional.** Es lo que distingue un diagnóstico de una suposición afortunada. Herramienta recomendada:

```typescript
console.log(await miLocator.count());
```

### Paso 3 — Caso A

El mensaje de error de este caso **te dice el problema y te enseña los candidatos**. Léelo entero, incluidas las dos líneas de HTML que muestra.

Preguntas a responder en el informe, además del formato:

1. ¿Por qué la aplicación tiene **dos** elementos con ese mismo nombre accesible?
2. `.first()` haría desaparecer el error. **¿Haría desaparecer el problema?** Explica qué pasaría el día que cambie el orden del DOM.
3. Tu corrección, ¿sigue funcionando si mañana el catálogo cambia el orden de los productos?

**Restricción de la corrección:** prohibido `.first()`, `.nth()` y `.last()`. Se acota, como en el bloque 3.6 del Lab 3.

### Paso 4 — Caso B

Este es distinto. El test usa `CartPage.cartItems`, un locator del Page Object del proyecto.

Preguntas a responder, además del formato:

1. ¿Por qué el fallo dice `Expected: 1 / Received: 0` en lugar de "locator no encontrado"?
2. Comprueba en el navegador cuál es el HTML real de una línea de carrito. ¿Qué atributos tiene?
3. **¿Por qué nadie lo había detectado?** Ejecuta esto y usa el resultado como pista:

```bash
grep -rn "cartItems" tests/ pages/
grep -rc "cart_item" tests/*.spec.ts | grep -v ":0"
```

4. ¿Qué relación hay entre ese locator roto y el hecho de que 5 specs usen `.cart_item` directamente?

**Restricción de la corrección:** `pages/cart.page.ts` **no se toca**. Corriges en tu copia del sandbox: sustituye el uso del locator roto por uno que sí encuentre el elemento, y explica en el informe **por qué esa corrección es la del sandbox y no la del proyecto**.

### Paso 5 — El `.first()` del proyecto

Abre [`tests/cart-sync.spec.ts:30-33`](../../../../tests/cart-sync.spec.ts), el único `.first()` de los 79 tests:

```typescript
await expect(
  page.locator('[data-test="inventory-item-name"]').first(),
  'El nombre del primer ítem del carrito debería corresponder a uno de los productos añadidos',
).toBeVisible();
```

**Responde:**

1. ¿Qué comprueba realmente esta aserción? Fíjate en el mensaje: "corresponder a **uno de** los productos".
2. Reescríbela (en tu informe, no en el fichero del proyecto) para que compruebe algo que sí importe.
3. ¿Qué tiene esto en común con el caso A?

### Paso 6 — Verde

Los 2 tests en verde, **sin ninguna aserción modificada**. Verifica esto último tú mismo antes de dar el Lab por terminado.

---

## Resultado esperado

- `05-diagnostico.md` con los 2 casos completos, **escritos antes que las correcciones**, incluidas las preguntas de los pasos 3, 4 y 5.
- `05-diagnostico.spec.ts` con los 2 tests en verde.
- `pages/cart.page.ts` **intacto**.

## Validación

```bash
# 1. Los dos tests pasan
npx playwright test -c learning/student/sandbox/01-playwright --project=chromium 05-diagnostico.spec.ts

# 2. No has cambiado ninguna aserción
git diff learning/student/sandbox/01-playwright/05-diagnostico.spec.ts
# ninguna línea que empiece por -/+ debe contener 'expect(' ni el texto de un mensaje

# 3. No has usado ordinales
grep -n "first()\|nth(\|last()" learning/student/sandbox/01-playwright/05-diagnostico.spec.ts
# no debe devolver nada

# 4. El proyecto sigue intacto — especialmente el Page Object
git status --short
git diff --stat pages/
# debe estar vacío

git add learning/student/sandbox/01-playwright/
git commit -m "fix(lab-5): diagnóstico y corrección de dos fallos de localización"
```

El punto 2 y el punto 4 son el criterio de superación real de este Lab. Un `expect` modificado o un `pages/` tocado invalidan el ejercicio aunque los dos tests estén en verde.

## Preguntas de reflexión

1. **El error ha desaparecido. ¿Ha desaparecido el problema?** Aplícala a las dos correcciones que has hecho.
2. El caso B lleva meses en el repositorio. ¿Qué habría hecho falta para detectarlo antes: más tests, otra revisión de código, otra herramienta? Argumenta.
3. Los dos casos son "fallos de locator". ¿Cómo los distinguirías, **solo por el mensaje de error**, de un fallo de la aplicación?

## Criterios de finalización

- [ ] El informe está escrito **antes** que las correcciones, y la casilla "Comprobación" contiene una ejecución real con su resultado.
- [ ] Las dos causas raíz son **distintas** entre sí y ninguna es la descripción del síntoma.
- [ ] Ninguna corrección usa `.first()`, `.nth()` ni `.last()`.
- [ ] `git diff --stat pages/` está vacío.
- [ ] Los 2 tests en verde.

## Learning points

- **Un mensaje de strict mode es un regalo**: dice cuántos elementos encontró, cuáles son y hasta sugiere cómo distinguirlos. La mayoría de los fallos de locator no son tan generosos.
- `.first()` convierte un error ruidoso en un comportamiento silencioso e impredecible. Hacer desaparecer el rojo no es corregir.
- **Un locator que no encuentra nada es invisible hasta que alguien lo ejecuta.** El código de test también necesita ser ejercitado: un Page Object con un método que nadie llama no está probado por nadie.
- El defecto del caso B explica un patrón que parecía pereza (5 specs usando una clase CSS) y resulta ser una **consecuencia**. Diagnosticar bien cambia la historia que te cuentas sobre el código, y eso es exactamente lo que se hace en el módulo 02.
- Diagnosticar y corregir son dos actividades distintas. Escribir el diagnóstico primero te obliga a entender el fallo en vez de probar cambios hasta que el rojo desaparezca.
