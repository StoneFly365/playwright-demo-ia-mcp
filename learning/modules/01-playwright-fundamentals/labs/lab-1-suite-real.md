# Lab 1 — FOLLOW · La suite real

**Nivel:** 1 · FOLLOW · **Tiempo:** 45 min · **Objetivos:** P1 *(y la primera práctica de P2, por observación)*

---

## Objetivo

Ejecutar la suite del proyecto de seis formas distintas, medir cada una e interpretar lo que devuelve: cuántos tests, cuánto tarda, qué falla y **por qué ese rojo no es un problema**.

## Contexto

Este es tu primer contacto con la suite en ejecución. Hasta ahora la habías leído; hoy la pones a correr.

Vas a ver **10 tests en rojo** desde el primer minuto. Son deliberados: cada uno lleva un comentario `⚠️ FALLO INTENCIONADO` con la instrucción exacta para revertirlo. Están ahí porque son el material del módulo 04. **No se arreglan.**

Lo que este Lab entrena no es escribir tests: es la habilidad de **leer el resultado de una ejecución** y saber qué pregunta hacer a continuación. Es lo primero que harás cada mañana en un equipo con una suite en CI.

## Prerrequisitos

- Módulo 00 superado.
- `npm ci` y `npx playwright install` ejecutados.
- [Teoría](../theory.md), secciones 1 y 2.

## Archivos implicados

| Fichero | Papel |
|---|---|
| [`playwright.config.ts`](../../../../playwright.config.ts) | Lectura. 31 líneas: lo que heredas sin escribirlo |
| [`package.json:5-13`](../../../../package.json) | Lectura. Los 12 scripts de ejecución |
| [`specs/test-index.md`](../../../../specs/test-index.md) | Lectura. La cobertura declarada del proyecto |
| `learning/student/sandbox/01-playwright/01-ejecuciones.md` | **El que creas tú** |

**Ninguno de estos ficheros se modifica.** En este Lab solo ejecutas y escribes tus observaciones.

---

## Pasos

### Paso 1 — Lee la configuración antes de ejecutar nada

Abre [`playwright.config.ts`](../../../../playwright.config.ts) y responde por escrito, **antes** de ejecutar:

1. ¿Cuántas ejecuciones de test producirá `npm test`? *(pista: no es 79)*
2. ¿Por qué `pages/login.page.ts` puede escribir `goto('/')` sin poner la URL completa?
3. ¿Qué valor de timeout tiene una aserción en este proyecto? *(no está escrito en el fichero — esa es la pregunta)*
4. ¿Qué se guarda cuando un test falla, y dónde lo configura?

### Paso 2 — Las seis ejecuciones

Crea `learning/student/sandbox/01-playwright/01-ejecuciones.md` y rellena esta tabla ejecutando cada comando. Anota **el tiempo que da Playwright**, no el que estimes.

| # | Comando | Tests | Passed | Failed | Tiempo |
|---|---|---|---|---|---|
| 1 | `npm run test:chromium` | | | | |
| 2 | `npx playwright test --project=chromium tests/login.spec.ts` | | | | |
| 3 | `npx playwright test --project=chromium --grep "ordenar"` | | | | |
| 4 | `npm run test:demo:green -- --project=chromium` | | | | |
| 5 | `npm run test:demo:fail -- --project=chromium` | | | | |
| 6 | `npm test` *(los tres navegadores — ejecútalo una sola vez)* | | | | |

> Si el equipo va justo de recursos o estáis diez personas ejecutando a la vez, haz la fila 6 en último lugar y solo una vez.

### Paso 3 — El informe HTML

```bash
npm run test:report
```

En el informe de la ejecución 1, localiza los 10 fallos y contesta:

1. Los diez, ¿están repartidos por ficheros o concentrados en uno?
2. Elige **tres** fallos distintos y, para cada uno, copia el mensaje de error y clasifícalo:
   **¿fallo de aserción, fallo de locator o fallo de la aplicación?** *(las tres clases están en la [teoría, §2](../theory.md#2-interpretar-lo-que-devuelve))*
3. Abre el fichero de uno de ellos y localiza la línea del comentario `⚠️ FALLO INTENCIONADO`. ¿Qué habría que cambiar para revertirlo? **No lo cambies.**

### Paso 4 — Los tags

Compara las ejecuciones 4 y 5. En `package.json`, `test:demo:green` usa `--grep-invert @demo-fail` y `test:demo:fail` usa `--grep @demo-fail`.

Responde: **¿por qué existe esta partición en un proyecto de demostración, y qué problema resolvería en un proyecto real?** Dos o tres frases.

### Paso 5 — Verlo correr

```bash
npx playwright test --project=chromium --headed tests/checkout.spec.ts --grep "completar el proceso de compra"
```

Míralo. Describe en tres líneas qué hace el navegador, en orden. Es la última vez que lo mirarás: a partir de aquí trabajarás en modo *headless* como todo el mundo.

### Paso 6 — La pregunta que cierra el Lab

Escribe la respuesta en `01-ejecuciones.md`:

> **Un compañero abre el repositorio, ejecuta `npm test`, ve 30 fallos y te escribe: "está roto". ¿Qué le contestas, y qué dos comandos le pides que ejecute antes de seguir hablando?**

*(Fíjate en el número: son 30, no 10. Esa diferencia forma parte de la respuesta.)*

---

## Resultado esperado

`01-ejecuciones.md` con:

- Las 4 respuestas del Paso 1.
- La tabla de 6 ejecuciones completa, con tiempos reales.
- La clasificación de 3 fallos con su mensaje de error.
- La respuesta sobre los tags.
- Las 3 líneas del modo headed.
- La respuesta del Paso 6.

Las cifras de referencia de la ejecución 1, medidas en un equipo de desarrollo: **79 tests, ~22 segundos, 69 verdes y 10 rojos**. Tu tiempo puede variar; el número de tests y de fallos, no.

## Validación

```bash
# 1. La suite del proyecto sigue exactamente como estaba
git status --short
# solo debe aparecer learning/student/sandbox/

# 2. Ningún fallo intencionado ha sido "arreglado"
npm run test:demo:fail -- --project=chromium
# deben seguir siendo 10 fallos

git add learning/student/sandbox/01-playwright/01-ejecuciones.md
git commit -m "docs(lab-1): tabla de ejecuciones e interpretación del informe"
```

## Preguntas de reflexión

1. La ejecución 6 tarda unas tres veces más que la 1 y encuentra los mismos fallos. **¿Cuándo merece la pena ejecutar los tres navegadores, y cuándo no?**
2. `--grep "ordenar"` filtra por el nombre del test. ¿Qué consecuencia tiene eso para **cómo se nombran** los tests de un equipo?
3. Los 10 fallos llevan tag. Si mañana entra un fallo **de verdad** en la suite, ¿lo distinguirías de estos diez? ¿Cómo?

## Criterios de finalización

- [ ] Las 6 filas de la tabla están rellenas con datos de ejecuciones propias.
- [ ] Los 3 fallos elegidos están **clasificados**, no solo copiados.
- [ ] La respuesta del Paso 6 distingue entre "la suite está roja" y "la suite está rota".
- [ ] `git status` no muestra ningún cambio fuera de `learning/student/`.

## Learning points

- **Un rojo no es un fallo hasta que sabes de qué clase es.** Aserción, locator y aplicación se parecen desde fuera y se resuelven de forma completamente distinta.
- La suite se puede partir por tags, por fichero, por nombre y por navegador. En un equipo real eso es lo que separa "ejecuto todo y espero 40 minutos" de "ejecuto lo que me afecta y sé el resultado en 20 segundos".
- **La configuración es código que se ejecuta.** Los timeouts que no viste en `playwright.config.ts` están actuando en cada uno de tus tests.
- Ejecutar en tres navegadores multiplica por tres el coste y encuentra, casi siempre, los mismos fallos. Decidir cuándo hacerlo es criterio QA — y es un tema al que se vuelve en el módulo 06.
