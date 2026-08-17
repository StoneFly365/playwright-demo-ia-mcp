# Módulo 00 — Repository Mapping

Cada concepto del módulo se ancla en un fichero **real** del repositorio. Ninguna referencia de esta tabla es inventada: todas se pueden abrir ahora mismo.

Las referencias `fichero:línea` corresponden al estado del repositorio en la rama `docs/ruta-aprendizaje-playwright`. Si una línea no coincide, avisa al formador: es un caso real de deriva documental (y material del módulo 07).

| # | Concepto | Archivo real | Qué debe observar el alumno | Qué debe aprender |
|---|---|---|---|---|
| M1 | Clase con constructor | [`pages/login.page.ts:3-19`](../../../pages/login.page.ts) | La clase entera cabe en 19 líneas: 1 campo, 1 constructor, 2 métodos | Que un Page Object no es magia: es una clase corriente |
| M2 | Campo `readonly` de tipo `Locator` | [`pages/login.page.ts:4`](../../../pages/login.page.ts) | `readonly errorMessage: Locator;` se declara arriba y se asigna en el constructor | `readonly` impide reasignar el campo después de construir el objeto |
| M3 | Parámetro de propiedad | [`pages/login.page.ts:6`](../../../pages/login.page.ts) | `constructor(private readonly page: Page)` — no hay `this.page = page` en ninguna línea | TypeScript crea y asigna el campo por ti cuando pones el modificador en el parámetro |
| M4 | Método `async` sin valor de retorno | [`pages/login.page.ts:10-12`](../../../pages/login.page.ts) | `async navigate(): Promise<void>` y el `await` de dentro | Todo método que espera al navegador es `async` y devuelve `Promise` |
| M5 | Método con parámetros tipados | [`pages/login.page.ts:14-18`](../../../pages/login.page.ts) | `login(username: string, password: string)` y sus tres `await` encadenados | Los tipos de los parámetros documentan el método mejor que un comentario |
| M6 | Plantilla de texto para construir un selector | [`pages/inventory.page.ts:13`](../../../pages/inventory.page.ts) | Las comillas invertidas y `${dataTestId}` dentro del selector | Una función parametrizada evita escribir 6 métodos casi iguales |
| M7 | Método que **devuelve datos** | [`pages/inventory.page.ts:24-26`](../../../pages/inventory.page.ts) | `getProductNames(): Promise<string[]>` — el tipo dice exactamente qué vas a recibir | La diferencia entre un método que actúa (`Promise<void>`) y uno que consulta (`Promise<string[]>`) |
| M8 | Clase sin campos, solo comportamiento | [`pages/menu.page.ts:3-20`](../../../pages/menu.page.ts) | El constructor tiene el cuerpo vacío `{}` y aun así declara el parámetro de propiedad | No todas las clases necesitan estado |
| M9 | Reutilización de métodos dentro de la clase | [`pages/menu.page.ts:11,16`](../../../pages/menu.page.ts) | `logout()` y `resetAppState()` llaman ambos a `this.open()` | `this` es la propia instancia; llamar a un método desde otro es lo normal |
| M10 | `import` con nombre | [`tests/login.spec.ts:1-2`](../../../tests/login.spec.ts) | `import { test, expect } from '@playwright/test'` (paquete) vs `from '../pages/login.page'` (ruta relativa) | Cómo viaja el código de un fichero a otro |
| M11 | Desestructuración de objetos | [`tests/login.spec.ts:7`](../../../tests/login.spec.ts) | `async ({ page }) => {` — las llaves dentro de los paréntesis | Es la misma sintaxis que `const { total } = resultado`, aplicada a un parámetro |
| M12 | `let` a nivel de bloque y reasignación | [`tests/login.spec.ts:5,8`](../../../tests/login.spec.ts) | `let loginPage: LoginPage;` se declara fuera y se reasigna en cada `beforeEach` | Cuándo `let` es necesario y `const` no vale |
| M13 | `new` para instanciar una clase | [`tests/login.spec.ts:8`](../../../tests/login.spec.ts) | `loginPage = new LoginPage(page);` — aquí es donde `page` entra en el Page Object | Conectar M3 con su punto de uso |
| M14 | `map` + `replace` + `parseFloat` | [`tests/inventory.spec.ts:42`](../../../tests/inventory.spec.ts) | Una sola línea transforma `['$29.99', …]` en `[29.99, …]` | Encadenar transformaciones sobre datos extraídos de la UI |
| M15 | Copia antes de ordenar (spread) | [`tests/inventory.spec.ts:32,49,66`](../../../tests/inventory.spec.ts) | `[...names].sort(...)` — el `...` está ahí a propósito, tres veces | `sort()` modifica el array original; el spread lo protege |
| M16 | Comparador numérico vs alfabético | [`tests/inventory.spec.ts:32`](../../../tests/inventory.spec.ts) vs [`:49`](../../../tests/inventory.spec.ts) | `(a, b) => b.localeCompare(a)` para texto, `(a, b) => a - b` para números | Por qué `sort()` sin comparador ordena mal los números |
| M17 | Configuración de TypeScript | [`tsconfig.json:5`](../../../tsconfig.json) | `"strict": true` | Qué errores atrapa el compilador antes de que el test se ejecute |
| M18 | Tipos disponibles en el proyecto | [`tsconfig.json:9`](../../../tsconfig.json) | `"types": ["node", "@playwright/test"]` | De dónde salen `Page`, `Locator`, `test` y `expect` |
| M19 | `async`/`await` fuera de Playwright | [`scripts/report-ai.mjs:16-88`](../../../scripts/report-ai.mjs) | `await readFile(...)`, `await mkdir(...)` — el mismo `await` sin navegador de por medio | `async`/`await` es JavaScript, no una invención de Playwright |
| M20 | Paralelismo con `Promise.all` | [`scripts/report-ai.mjs:54-58`](../../../scripts/report-ai.mjs) | Tres lecturas de fichero lanzadas a la vez, un solo `await` | Cuándo esperar en secuencia y cuándo en paralelo |

## Trazabilidad completa del módulo

| Competencia (matriz Fase 1) | Dónde aparece en el repositorio | Ejercicio que la practica | Cómo se valida | Cómo se evalúa |
|---|---|---|---|---|
| C — Clases y POO | M1, M2, M3, M8, M9 | Lab 1 | Test verde de `01-values.spec.ts` | Assessment P1, P2 |
| C — Arrays y transformaciones | M14, M15, M16 | Lab 2 | Test verde de `02-arrays.spec.ts` | Assessment E1 |
| C — Módulos import/export | M10 | Lab 3 | El `import` de `03-price-utils.spec.ts` resuelve | Assessment E2 |
| D — `async`/`await` y promesas | M4, M7, M19, M20 | Labs 1 y 4 | Test 2 de `04-broken.spec.ts` en verde | Assessment P3, P4, P7 |
| D — Tipos y anotaciones | M5, M7, M17, M18 | Lab 3 | `npx tsc --noEmit` sin errores | Assessment P5, P6, E2 |
| D — `readonly` e inmutabilidad | M2, M3, M15 | Labs 2 y 4, Challenge 1 | Tests de "no debería modificar…" en verde | Assessment P9, P10 |
| H — Lectura de mensajes de fallo | todos los specs del proyecto | Lab 4 | Informe de diagnóstico entregado | Assessment E2 |
