# Lab 4 — CREATE · El test que falta

**Nivel:** 3 · CREATE · **Tiempo:** 60 min *(el segundo test se termina fuera de sesión)* · **Objetivos:** P5, P6

---

## Objetivo

Escribir dos tests nuevos, completos y en verde, para **huecos de cobertura reales** de la suite: uno indicado y otro que encuentras tú.

## Contexto

La suite tiene 79 tests y una tabla de cobertura declarada en [`specs/test-index.md`](../../../../specs/test-index.md). Aun así, tiene huecos.

El primero está localizado: [`tests/inventory.spec.ts:23-71`](../../../../tests/inventory.spec.ts) cubre tres de las cuatro ordenaciones del catálogo —`za` (Z→A), `lohi` (precio ascendente) y `hilo` (precio descendente)— y **no cubre `az`, la ordenación por nombre de A a Z**. Es el orden por defecto de la aplicación y no lo verifica nadie.

El segundo lo buscas tú. Y ese es el ejercicio de verdad: **escribir un test empieza por detectar qué falta**, no por escribir código.

> Este Lab no lleva pasos detallados para el segundo test. Es deliberado: es el primer ejercicio del módulo en el que decides tú.

## Prerrequisitos

- Labs 1, 2 y 3 completados.
- [Teoría](../theory.md), secciones 2, 4 y 13.

## Archivos implicados

| Fichero | Papel |
|---|---|
| `learning/student/sandbox/01-playwright/04-cobertura.spec.ts` | **El que creas tú.** No existe todavía |
| [`tests/inventory.spec.ts:23-71`](../../../../tests/inventory.spec.ts) | Referencia: los tres tests de ordenación existentes |
| [`pages/inventory.page.ts:20-30`](../../../../pages/inventory.page.ts) | `sortBy()`, `getProductNames()`, `getProductPrices()` — los usas |
| [`specs/test-index.md`](../../../../specs/test-index.md) | La cobertura **declarada**. Punto de partida del test 2 |

---

## Pasos

### Paso 1 — Entiende qué falta y por qué importa

Abre [`tests/inventory.spec.ts`](../../../../tests/inventory.spec.ts) y localiza los tres tests de ordenación. Responde antes de escribir nada:

1. ¿Qué valor de `sortBy(...)` usa cada uno?
2. ¿Cuál es el cuarto valor posible? *(míralo en la aplicación: el desplegable tiene 4 opciones)*
3. La opción que falta es **la que la aplicación aplica por defecto**. ¿Eso hace que el test sobre o que sea más necesario? Justifica.

### Paso 2 — Escribe el test de la ordenación A→Z

Crea `04-cobertura.spec.ts` con un `describe`, su `beforeEach` de login y el test.

Requisitos:

- Usa los **Page Objects existentes** (`LoginPage`, `InventoryPage`); no reescribas el login.
- Comprueba **comportamiento funcional**, no que el desplegable haya cambiado de valor. Que el `<select>` muestre "Name (A to Z)" no demuestra que los productos estén ordenados.
- Verifica también **cuántos** productos has recuperado antes de comprobar el orden. Los tests existentes lo hacen y tienen razón: si `getProductNames()` devolviera 2 nombres, un orden correcto de 2 elementos no significaría nada.
- Toda aserción con mensaje descriptivo en lenguaje de negocio.

> **Trampa a evitar:** comparar contra una lista de nombres escrita a mano. Si mañana entra un producto nuevo, tu test falla sin que haya ningún bug. Mira cómo lo resuelven los tests existentes (`[...names].sort(...)`) y por qué el spread importa — módulo 00, teoría §5.

### Paso 3 — Encuentra el segundo hueco

Compara la cobertura **declarada** en [`specs/test-index.md`](../../../../specs/test-index.md) con lo que la aplicación realmente hace. Recorre las pantallas buscando comportamientos que ningún test ejercita.

Candidatos que existen de verdad en la aplicación *(elige uno, o encuentra otro mejor)*:

- El botón `X` que cierra el mensaje de error del login.
- El botón Cancel del paso 1 del checkout, y a dónde lleva.
- El enlace "Continue Shopping" del carrito.
- El texto secundario de la página de confirmación.
- Los enlaces del pie de página.

**Escribe en el fichero, como comentario de cabecera del test:** qué hueco cubres, cómo lo encontraste y **por qué merece un test** — o dicho de otro modo, qué riesgo de negocio cubre. Un test que no cubre ningún riesgo es coste de mantenimiento sin contrapartida.

### Paso 4 — Escribe el segundo test

Mismas reglas que el primero. Este es tuyo de principio a fin: eliges el caso, los locators y las aserciones.

### Paso 5 — Verde y revisión

```bash
npx playwright test -c learning/student/sandbox/01-playwright --project=chromium 04-cobertura.spec.ts
```

Después relee tus dos tests y pregúntate: **¿podría alguno pasar aunque la funcionalidad estuviera rota?** Si la respuesta es sí en alguno, arréglalo — eso es un test que no verifica nada, como los tres del Lab 3 del módulo 00.

---

## Resultado esperado

`04-cobertura.spec.ts` con **2 tests en verde**:

- Ordenación A→Z verificada funcionalmente.
- Un segundo caso, con su justificación escrita en el comentario de cabecera.

## Validación

```bash
# 1. Tus dos tests pasan
npx playwright test -c learning/student/sandbox/01-playwright --project=chromium 04-cobertura.spec.ts

# 2. Y también en los otros dos navegadores (los tests nuevos deben ser portables)
npx playwright test -c learning/student/sandbox/01-playwright 04-cobertura.spec.ts

# 3. Tipos correctos
npx tsc --noEmit

# 4. No has tocado la suite del proyecto
git status --short

git add learning/student/sandbox/01-playwright/
git commit -m "feat(lab-4): cobertura de la ordenación A-Z y de un segundo hueco"
```

## Preguntas de reflexión

1. Tu test de ordenación A→Z, **¿fallaría si la aplicación dejara de ordenar?** ¿Y si ordenara al revés? Compruébalo mentalmente paso a paso.
2. Los tres tests de ordenación existentes se parecen mucho entre sí. ¿Los unificarías en uno parametrizado? ¿Qué ganarías y qué perderías? *(La respuesta completa es el módulo 03; la intuición es de ahora.)*
3. Has encontrado un hueco de cobertura. En un equipo real, **¿lo cubres tú directamente o lo reportas primero?** ¿De qué depende?

## Criterios de finalización

- [ ] Los 2 tests en verde en los **tres** navegadores.
- [ ] El test A→Z verifica el orden real de los productos, no el estado del desplegable.
- [ ] El segundo test lleva escrito **qué hueco cubre y qué riesgo justifica cubrirlo**.
- [ ] Todas las aserciones llevan mensaje descriptivo en lenguaje de negocio.
- [ ] Ningún valor esperado se ha leído de la propia aplicación *(la lección del Lab 2)*.

## Learning points

- **Escribir un test empieza por detectar qué falta.** La parte de código es la última y la más fácil.
- Comprobar el estado del control (el desplegable) **no** es comprobar el comportamiento (el orden de los productos). Es la diferencia entre verificar que se pulsó el botón y verificar que pasó algo.
- Verificar la **cantidad** antes que el **orden** evita el falso verde más común de esta clase de test: una lista incompleta siempre está bien ordenada.
- Un hueco de cobertura auténtico se encuentra comparando lo que dice la documentación con lo que hace la aplicación. Esa comparación es trabajo de QA, no de programación.
- **No todo hueco merece un test.** Justificar por qué este sí es parte del ejercicio, y es lo que el módulo 07 convierte en análisis de riesgo.
