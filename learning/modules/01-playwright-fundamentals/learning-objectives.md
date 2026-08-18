# Módulo 01 — Objetivos de aprendizaje

Ocho objetivos. Se identifican como **P1-P8** (Playwright) para no confundirlos con los O1-O8 del módulo 00, que siguen vigentes y se dan por adquiridos.

Cada objetivo es evaluable: la columna "Cómo se evalúa" indica el instrumento exacto que lo comprueba.

| # | Al terminar el módulo, el alumno será capaz de… | Nivel | Evidencia observable | Teoría | Se practica en | Cómo se evalúa |
|---|---|---|---|---|---|---|
| **P1** | **Ejecutar** la suite del proyecto filtrando por fichero, por navegador y por tag, e **interpretar** el informe distinguiendo un fallo de locator, uno de aserción y uno de la aplicación | 1 FOLLOW | Tabla comparativa de 6 formas de ejecución, con número de tests, tiempo y resultado, más la respuesta escrita sobre los 10 fallos | [§1, §2](theory.md#1-ejecutar-la-suite) | Lab 1 | Parte A (A1) + validación de E1 |
| **P2** | **Explicar** por qué la suite no contiene ni una sola espera explícita y **predecir** qué ocurre al sustituir una aserción web-first por un método sin reintento | 2 MODIFY | Dos ejecuciones medidas por el alumno (con y sin `waitForTimeout`) y una predicción escrita **antes** de ejecutar | [§3, §4](theory.md#3-auto-waiting-por-qué-nadie-espera) | Lab 2, Lab 5 | Parte A (A2, A3), E2 |
| **P3** | **Seleccionar y justificar el locator más apropiado** para un elemento y un contexto dados, valorando robustez, semántica, accesibilidad, mantenibilidad y contexto — **no** usar el mayor número posible de estrategias | 4 DESIGN | `03-decisiones.md`: una fila por elemento con locator elegido, criterio que lo justifica y alternativa descartada | [§5-§12](theory.md#5-elegir-un-locator-los-cinco-criterios) | **Lab 3**, Challenge | Parte A (A4, A5), E1, **Parte C** |
| **P4** | **Convertir** locators CSS existentes a locators orientados al usuario manteniendo el test en verde, y **medir** qué gana y qué pierde con el cambio | 2 MODIFY | Login reescrito por rol, por placeholder y por test id, los tres en verde, más la explicación de por qué los tres localizan lo mismo | [§6, §7, §8](theory.md#6-getbyrole-la-primera-opción) | Lab 3 (bloques 3.1 y 3.2) | Parte A (A5), E1 |
| **P5** | **Escribir** un test nuevo, completo y en verde, para un caso funcional **no cubierto** por la suite actual, usando los Page Objects existentes | 3 CREATE | Dos tests nuevos en el sandbox: la ordenación A→Z y un segundo hueco que el alumno identifica por su cuenta | [§2, §13](theory.md#13-anatomía-de-un-spec-y-aislamiento) | **Lab 4** | **E1** |
| **P6** | **Seleccionar** la aserción adecuada entre `toHaveText`, `toContainText`, `toHaveCount`, `toHaveURL` y `toBeVisible`, y redactar su mensaje descriptivo en lenguaje de negocio | 3 CREATE | Aserciones con mensaje en castellano, comprensibles sin abrir el código | [§4](theory.md#4-aserciones-web-first-y-las-otras) | Lab 4, Challenge | E1 |
| **P7** | **Diagnosticar** un fallo causado por un locator ambiguo, por un locator que no encuentra nada o por un método sin reintento, y corregir la causa **sin tocar la aserción** | 5 TROUBLESHOOT | Informe con síntoma / causa raíz / corrección / cómo evitarlo, escrito **antes** de corregir | [§10, §11, §12](theory.md#10-strict-mode-la-ambigüedad-no-se-tapa) | **Lab 5** | **E2** |
| **P8** | **Diseñar** un test E2E de varias pantallas a partir de un escenario en lenguaje de negocio y **justificar por escrito** sus decisiones de locator, aserción y estructura | 4 DESIGN | El Challenge completo con su `decisiones.md`, incluido **qué no ha automatizado y por qué** | Todo el módulo | Challenge | **Challenge** + Parte C |

## Continuidad con el módulo 00

El objetivo **O8** (comunicar y justificar decisiones técnicas) **no se reintroduce**: está incorporado dentro de P3 y P8, a un nivel superior. En el módulo 00 se pedía justificar una decisión ya tomada; aquí se pide justificar **una elección entre alternativas** y anticipar cómo envejecerá.

Se dan por adquiridos, y no se vuelven a enseñar: clases y `readonly`, `async`/`await` y `Promise<T>`, tipos y `strict`, `map`/`filter`/`sort` y las dos trampas de `sort()`, la mecánica de ejecutar tests con `-c` y de leer un fallo de aserción.

## Nota sobre P3 — por qué no es "las cinco estrategias"

La [validación técnica](../../docs/module-01-technical-validation.md) midió 20 elementos de la aplicación con 7 estrategias cada uno. El resultado descarta la idea de que las estrategias sean intercambiables:

| Estrategia | Elementos donde funciona |
|---|---|
| `getByTestId` (con `testIdAttribute` configurado) | 20 de 20 |
| CSS por atributo | 20 de 20 |
| `getByRole` | 12 de 20 |
| `getByText` | 8 de 20 |
| `getByPlaceholder` | 5 de 5 campos de texto |
| **`getByLabel`** | **0 de 20** |

En esta aplicación `getByLabel` **no funciona en ningún elemento**, `getByRole` **no sirve para los títulos de página**, y el desplegable de ordenación se localiza por rol **solo porque es el único de la página**.

Por eso P3 no mide variedad, mide criterio:

| Criterio | Pregunta que responde |
|---|---|
| **Robustez** | ¿Sobrevive a un cambio de maquetación? |
| **Semántica** | ¿Localiza como lo haría una persona usuaria? |
| **Accesibilidad** | ¿Qué me está diciendo esto sobre la calidad del HTML? |
| **Mantenibilidad** | ¿Seguirá siendo unívoco dentro de un año? |
| **Contexto** | ¿Hay ambigüedad que haya que acotar? |

**Un alumno que use tres estrategias bien elegidas y las justifique supera P3. Uno que use las cinco sin criterio, no.**

## Fuera de alcance en este módulo

Se declara explícitamente para que nadie crea que le falta base:

- **Diseño** de Page Objects — módulo 02. Aquí se usan como caja negra.
- Fixtures propios (`test.extend`), `storageState`, gestión de datos de test — módulo 03.
- Trace viewer en profundidad, `page.pause()`, `test.step`, y el **diagnóstico de los 10 `@demo-fail`** — módulo 04.
- API testing, `page.route`, mocking — módulo 05.
- CI/CD, Docker, sharding — módulo 06.
- Estrategia de tags, quality gates, análisis de riesgo — módulo 07.
- IA, MCP, agentes — módulo 08.
- Interacciones que **no existen** ni en el repositorio ni en la aplicación: `check`/`uncheck`, subida de ficheros, arrastrar, diálogos. Se nombran en la teoría (§14) y no se practican: enseñarlas exigiría inventar ejemplos.

## Criterio de superación

1. Los Labs 1 a 5 completos, con los 2 fallos iniciales del sandbox corregidos **en el sandbox** y sin tocar ninguna aserción.
2. `03-decisiones.md` entregado, con una justificación por elemento.
3. ≥ 70 en las partes A y B del [assessment](assessment/).
4. **Apto** en la Parte C (defensa técnica).

## Matriz de trazabilidad

| Objetivo | Teoría | Anclaje en el repositorio | Lab | Challenge | Assessment |
|---|---|---|---|---|---|
| **P1** | §1, §2 | R2, R4, R5, R6, R28, R29 | Lab 1 | uso implícito | A1, validación de E1 |
| **P2** | §3, §4 | R7, R8, R27 | Lab 2, Lab 5 | AC (sin esperas explícitas) | A2, A3, E2 |
| **P3** | §5-§12 | R9, R10, R11, R11b, R12, R13, R13b, R14, R16, R16b, R16c, R16d, R16e | **Lab 3** | AC4 | A4, A5, E1, **Parte C** |
| **P4** | §6, §7, §8 | R10, R11, R12 | Lab 3 (3.1, 3.2) | AC4 | A5, E1 |
| **P5** | §2, §13 | R19, R30, R30b | **Lab 4** | AC1, AC3 | **E1** |
| **P6** | §4 | R20, R21, R22, R23, R24 | Lab 4 | **AC2** | E1 |
| **P7** | §10, §11, §12 | R8, R13b, R16, R16b | **Lab 5** | — | **E2** |
| **P8** | todo | R14, R18, R19, R20 | preparado por Labs 3-4 | **Challenge** | Parte C |

### Auditoría de huecos

| Comprobación | Resultado |
|---|---|
| ¿Algún objetivo se enseña pero no se practica? | **No.** Los 8 tienen Lab o Challenge |
| ¿Algún objetivo se practica pero no se evalúa? | **No.** Los 8 aparecen en assessment, Challenge o Parte C |
| ¿Algo se evalúa sin haberse enseñado? | **No.** Cada ítem del assessment apunta a una sección de la teoría y a un Lab; la comprobación está en [`assessment/README.md`](assessment/), tabla final |
| ¿Se cuela contenido de módulos posteriores? | **No.** Verificado contra la lista de *Fuera de alcance* |
