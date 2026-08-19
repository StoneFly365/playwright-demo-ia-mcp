# 3 · Generación de casos de prueba

⏱️ **Duración:** 45 min · **Nivel:** 3 · CREATE · **Anterior:** [2 · Prompting para QA](02-prompting.md)

---

## 🎯 Objetivo

Ir de un requisito a un conjunto de casos de prueba defendible, usando IA para acelerar la parte mecánica y tu criterio para la parte que importa.

---

## 🧠 Aprende (12 min)

### La cadena

```text
Requisito  ──►  Riesgos  ──►  Escenarios  ──►  Casos de prueba
```

El error más común al usar IA es saltar del requisito directamente a los casos. Sale una lista larga de casos felices y ni un riesgo. **El paso de riesgos es el que la IA no hace sola y tú sí sabes hacer.**

### Cómo lo hizo este repositorio

[`specs/add-to-cart-test-plan.md`](../../specs/add-to-cart-test-plan.md) es un plan de pruebas real de 7 suites generado con asistencia de IA sobre la aplicación. Ábrelo y mira **por dónde empieza**: la primera sección no son casos, es `Hallazgos del análisis`.

Es decir: primero se exploró la aplicación y se anotó qué había —ids reales de producto, comportamiento del badge, particularidades de cada usuario—, y solo después se escribieron los casos. Los casos salen de hechos observados, no de suposiciones sobre cómo debería funcionar.

Cuando se lo pidas a una IA, replica ese orden. Si le pides casos sin darle hallazgos, te los inventará a partir de "cómo suele funcionar un carrito".

### De requisito a riesgos: seis preguntas

Para cualquier historia de usuario, estas seis preguntas sacan más riesgos que cualquier prompt:

1. **¿Qué pasa si el usuario lo hace dos veces?** (doble clic, doble envío, recarga)
2. **¿Qué pasa si lo hace desde otro sitio?** (misma acción, otra pantalla, otro punto de entrada)
3. **¿Qué pasa si abandona a la mitad?** (navega atrás, cierra sesión, expira)
4. **¿Qué se ve afectado que no se menciona?** (contadores, totales, estado persistido)
5. **¿Qué usuario lo rompe?** (bloqueado, lento, con datos raros, sin permisos)
6. **¿Qué dice el requisito que no se puede comprobar?** (lo ambiguo es un riesgo, no un detalle)

Este repositorio tiene el ejemplo perfecto de la pregunta 5: [`tests/problem-user-cart.spec.ts`](../../tests/problem-user-cart.spec.ts) y [`tests/performance-glitch-user-cart.spec.ts`](../../tests/performance-glitch-user-cart.spec.ts) existen porque alguien se preguntó qué usuario rompe el flujo.

### Revisar lo que genera la IA: seis defectos típicos

Esta es la parte crítica del módulo. Cuando recibas una tanda de casos generados, búscale estos seis:

| Defecto | Cómo se detecta |
|---|---|
| **Casos clonados** | Dos casos que solo se diferencian en el dato. Si la lógica es la misma, es un caso parametrizado, no dos |
| **Casos que no pueden fallar** | ¿Qué bug pondría este caso en rojo? Si no sabes contestar, sobra |
| **Datos inventados** | Ids, importes, textos de error que el modelo "recuerda" de otra aplicación |
| **Sesgo de camino feliz** | Cuenta los negativos. Si son menos de un tercio, falta trabajo |
| **Oráculo débil** | "Se muestra correctamente" no es un resultado esperado. ¿Qué valor exacto? |
| **Cobertura declarada ≠ real** | Lo que dice el plan que cubre y lo que realmente comprueba |

El último tiene su prueba en este repositorio: [`specs/test-index.md`](../../specs/test-index.md) declara la ordenación del inventario como cobertura ✅ completa. Y sin embargo [`tests/inventory.spec.ts`](../../tests/inventory.spec.ts) cubre tres de las cuatro ordenaciones: falta `az`, **que es la que la aplicación aplica por defecto**. La cobertura declarada mentía sin que nadie mintiera.

> Ese hueco es tu ejercicio ahora.

---

## 🛠️ Practica (25 min) — de la historia al caso

### El requisito

```text
HISTORIA DE USUARIO
Como comprador quiero ordenar el catálogo por nombre de la A a la Z
para localizar rápido un producto que conozco.

CRITERIOS DE ACEPTACIÓN
1. El desplegable de ordenación ofrece la opción "Name (A to Z)".
2. Al seleccionarla, los productos se muestran ordenados alfabéticamente
   de forma ascendente por nombre.
3. Es la ordenación aplicada por defecto al entrar al catálogo.
```

### Paso 1 — Hallazgos antes que casos (5 min)

Antes de tocar la IA, reúne los hechos. Ábrelos tú:

| Dónde | Qué anotar |
|---|---|
| [`pages/inventory.page.ts:20-30`](../../pages/inventory.page.ts) | Los métodos disponibles: `sortBy()`, `getProductNames()`, `getProductPrices()` |
| [`tests/inventory.spec.ts:23-71`](../../tests/inventory.spec.ts) | Cómo se prueban las otras tres ordenaciones. Los valores exactos: `za`, `lohi`, `hilo` |
| La aplicación | Cuántos productos hay y cuál es el cuarto valor del desplegable |

### Paso 2 — Genera con contexto (7 min)

Usa tu prompt base del módulo 2 y añade los hallazgos del paso 1. Pide **riesgos primero, casos después**:

```text
CONTEXTO
Catálogo de 6 productos. El desplegable de ordenación tiene 4 opciones
(valores: az, za, lohi, hilo). Ya existen tests para za, lohi y hilo en
tests/inventory.spec.ts. Falta az, que es el orden por defecto.
Page Object disponible: sortBy(option), getProductNames(), getProductPrices().

HISTORIA DE USUARIO Y CRITERIOS
<pega los de arriba>

TAREA
1. Lista primero los riesgos de esta funcionalidad (máximo 6).
2. Después, y solo después, propón los escenarios de prueba que los cubren.

FORMATO
Seccion RIESGOS: lista numerada, una línea cada uno.
Seccion ESCENARIOS: tabla con título, precondición, pasos,
resultado esperado y riesgo que cubre.

RESTRICCIONES
No inventes nombres de producto ni métodos que no aparezcan arriba.
No propongas escenarios que ya cubran za, lohi o hilo.
Si un criterio de aceptación es ambiguo, dilo en vez de resolverlo tú.
```

### Paso 3 — Auditoría (10 min)

Pasa la salida por la tabla de los seis defectos. En concreto, comprueba:

- ¿Ha propuesto comprobar **que el desplegable muestra "Name (A to Z)"** como escenario? Si sí: ese caso **no puede fallar por un bug de ordenación**. Que el `<select>` cambie de etiqueta no demuestra que los productos estén ordenados. Es el defecto "caso que no puede fallar", en directo.
- ¿Ha propuesto comparar contra **una lista de nombres escrita a mano**? Si sí: ese test se pone rojo el día que entre un producto nuevo, sin que haya ningún bug. Los tests existentes lo resuelven ordenando la lista recuperada y comparándola consigo misma.
- ¿Detectó la ambigüedad del criterio 3? "Aplicada por defecto" ¿significa al entrar por primera vez, o también al volver del carrito? No está definido. **Si lo resolvió por su cuenta, se lo inventó.**

### Paso 4 — Tu conjunto final (3 min)

Escribe en `learning/student/sandbox/ruta-qa/03-casos.md` **cinco casos como máximo**, ya revisados por ti, con esta forma:

| Título | Precondición | Pasos | Resultado esperado (valor exacto) | Riesgo cubierto |
|---|---|---|---|---|

Cinco casos tuyos valen más que veinte generados. En el módulo 4 vas a implementar uno de ellos.

---

## 🎯 Llévatelo a tu proyecto (8 min)

Coge la historia de usuario real de tu `mi-proyecto.md` y repite el ciclo completo:

1. **Hallazgos** (5 min máximo): qué sabes de verdad de esa pantalla. Campos, validaciones, estados.
2. **Riesgos** con las seis preguntas.
3. **Genera** escenarios con tu ficha de contexto + hallazgos + riesgos.
4. **Audita** con la tabla de seis defectos y quédate con los que defenderías en un refinamiento.

Entregable: los casos de prueba de una historia real de tu backlog, listos para llevar mañana.

> Si detectas una ambigüedad en el criterio de aceptación, **eso es el mayor valor del ejercicio**. Llévala al análisis funcional antes de que se convierta en un defecto.

---

## ✅ Al terminar deberías ser capaz de

- Recoger hallazgos antes de pedir casos, y explicar por qué ese orden importa.
- Sacar riesgos de un requisito con las seis preguntas.
- Detectar en una tanda generada: casos clonados, casos que no pueden fallar, datos inventados y oráculos débiles.
- Distinguir cobertura declarada de cobertura real.

---

**Siguiente:** [4 · Playwright + IA](04-playwright-ia.md) →
