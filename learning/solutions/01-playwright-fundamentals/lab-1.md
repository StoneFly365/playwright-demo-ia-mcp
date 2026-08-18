# Solución — Lab 1 (FOLLOW)

**Verificado:** suite del proyecto ejecutada en Chromium: **79 tests, 69 passed, 10 failed, ~22 s**.

---

## Paso 1 — Lectura de la configuración

| # | Pregunta | Respuesta |
|---|---|---|
| 1 | ¿Cuántas ejecuciones produce `npm test`? | **237**: 79 tests × 3 projects (`chromium`, `firefox`, `webkit`) |
| 2 | ¿Por qué `goto('/')` funciona? | Por `baseURL: 'https://www.saucedemo.com'` en `use` ([`playwright.config.ts:13`](../../../playwright.config.ts)). Las rutas relativas se resuelven contra ella |
| 3 | ¿Timeout de una aserción? | **5.000 ms.** No está escrito: es el valor por defecto de Playwright. El del test entero es 30.000 ms |
| 4 | ¿Qué se guarda al fallar? | `trace` y `video`, ambos con `retain-on-failure` ([`playwright.config.ts:14-15`](../../../playwright.config.ts)); más el informe HTML y el JSON de los reporters |

**Calibración de la 3:** un alumno que diga "no hay timeout configurado" ha leído bien el fichero pero no ha entendido la pregunta. La respuesta correcta incluye que **el valor existe igualmente**. Es el punto que conecta con A7 del assessment.

## Paso 2 — Las seis ejecuciones

Cifras de referencia medidas en un equipo de desarrollo (Windows 11, sin proxy). **Los tiempos varían; los números de tests y de fallos, no.**

| # | Comando | Tests | Passed | Failed | Tiempo |
|---|---|---|---|---|---|
| 1 | `npm run test:chromium` | 79 | 69 | 10 | ~22 s |
| 2 | `npx playwright test --project=chromium tests/login.spec.ts` | 8 | 7 | 1 | ~9 s |
| 3 | `npx playwright test --project=chromium --grep "ordenar"` | 3 | 3 | 0 | ~2 s |
| 4 | `npm run test:demo:green -- --project=chromium` | 69 | 69 | 0 | ~13 s |
| 5 | `npm run test:demo:fail -- --project=chromium` | 10 | 0 | 10 | ~11 s |
| 6 | `npm test` | 237 | 207 | 30 | ~60-75 s |

> Si un alumno obtiene otro número de **tests**, algo se ha modificado en `tests/`. Compruébalo con `git status --short` antes de seguir.

## Paso 3 — El informe HTML

**1. Reparto de los 10 fallos:** uno por fichero, en 10 de los 14 specs. No están concentrados. Es deliberado: obliga a recorrer el informe en vez de mirar un solo sitio.

**2. Clasificación esperada.** Los diez son **fallos de aserción**: el elemento se encuentra y el valor no coincide. Ejemplos:

| Test | Mensaje | Clase |
|---|---|---|
| `debería mostrar 6 productos en el inventario` | `Expected: 5 / Received: 6` | Aserción |
| `debería redirigir a la página de inventario…` | `Expected pattern: /.*\/home\.html$/ / Received string: ".../inventory.html"` | Aserción |
| `debería mostrar error si el nombre es obligatorio` | `Expected string: "Last Name is required"` | Aserción |

**Calibración:** el alumno que clasifica alguno como "fallo de la aplicación" no ha entendido la diferencia; es exactamente lo que el Lab existe para trabajar. La pregunta que lo resuelve: *¿el test encontró el elemento?* Si sí, no es un fallo de locator.

**3.** Cada uno lleva su comentario con la instrucción exacta de reversión. **Nadie lo revierte.**

## Paso 4 — Los tags

Respuesta esperada: la partición separa **la señal del ruido**. Con 10 fallos permanentes, un fallo nuevo pasaría desapercibido; `test:demo:green` debe estar siempre en verde, y **cualquier rojo ahí sí es una alarma real**.

En un proyecto real resuelve lo mismo con otros nombres: tests conocidos como inestables o pendientes de una funcionalidad no entregada, que se aíslan para que el resto siga siendo una señal fiable. La estrategia completa de etiquetado es el módulo 07.

## Paso 5 — Modo headed

Descripción esperada: se abre el navegador, se rellenan usuario y contraseña, se pulsa Login, aparece el catálogo, se añade la mochila, se abre el carrito, se pulsa Checkout, se rellenan los tres campos, Continue, Finish, y aparece "Thank you for your order!".

Valor del paso: es la primera vez que el alumno **ve** que un test es una persona usuaria simulada. A partir de aquí trabaja a ciegas y le sirve de modelo mental.

## Paso 6 — La pregunta de cierre

**Respuesta sólida:**

> "30 fallos son exactamente los 10 intencionados × 3 navegadores. Ejecuta `npm run test:demo:green` —debe dar 69 verdes— y `npm run test:demo:fail` —debe dar 10 rojos—. Si eso cuadra, la suite está roja **a propósito**, no rota."

**Respuesta insuficiente:** "son fallos a propósito" sin advertir que el número 30 ya lo confirma y sin proponer la comprobación.

Es el primer ejercicio del programa en que el alumno tiene que **calcular** con los datos de la ejecución en vez de repetir lo que le han dicho.

## Preguntas de reflexión

1. **Tres navegadores:** en local, casi nunca — mismo resultado por el triple de tiempo. En CI antes de una entrega, sí: los fallos específicos de motor existen (por ejemplo, diferencias de foco o de renderizado en WebKit) aunque esta suite no los tenga hoy. Se retoma en el módulo 06.
2. **Nombres de test:** si `--grep` filtra por nombre, el nombre es una **interfaz**. Nombres consistentes ("debería …") permiten filtrar por funcionalidad sin tocar código. Mal nombrados, la única opción es ejecutar todo.
3. **Distinguir un fallo nuevo:** ejecutando `test:demo:green`. Si aparece un rojo ahí, es nuevo. Es la razón de existir de la partición.

## Errores habituales

| Error | Cómo responder |
|---|---|
| Ejecuta `npm test` (3 navegadores) para todas las filas y tarda una eternidad | Es parte del aprendizaje: que compare la fila 1 con la 6 |
| Copia las cifras de este enunciado sin ejecutar | Se detecta en los tiempos: si son idénticos a los de referencia, no ha ejecutado |
| Intenta "arreglar" un fallo intencionado | Intervención inmediata. Regla 1 del programa |
| Confunde `--grep` con `--grep-invert` en la fila 4 | Que compare 69 + 10 = 79 y lo deduzca |

## Cómo validar

```bash
npm run test:chromium                      # 69 passed, 10 failed
npm run test:demo:fail -- --project=chromium   # 10 failed
git status --short                         # solo learning/student/
```
