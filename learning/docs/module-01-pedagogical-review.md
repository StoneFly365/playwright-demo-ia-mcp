# MÓDULO 01 — REVISIÓN PEDAGÓGICA FINAL
## Fase 3C · Auditoría, sin cambios

**Fecha:** 18 de agosto de 2026 · **Rama:** `docs/ruta-aprendizaje-playwright`
**Alcance:** revisión exclusivamente. **No se ha modificado ni creado ningún fichero salvo este.**

**La pregunta que responde este informe:**

> ¿Un QA que completa M00 + M01 queda preparado para afrontar correctamente el siguiente nivel de Playwright?

**Convención de este documento.** Cada afirmación se marca:

- **[H]** Hecho observado — verificable abriendo el fichero o ejecutando el comando indicado.
- **[I]** Interpretación pedagógica — juicio del revisor sobre ese hecho.
- **[R]** Recomendación — acción propuesta, **no aplicada**.

---

# 1. Fuentes analizadas

| Zona | Ficheros | Cómo se ha revisado |
|---|---|---|
| M00 material | `modules/00-foundations/` (README, learning-objectives, theory, repository-mapping, 4 Labs, Challenge, assessment) | Lectura completa |
| M00 soluciones | `solutions/00-foundations/` (7 ficheros) | Lectura de README, lab-1, lab-4, assessment-key |
| M01 material | `modules/01-playwright-fundamentals/` (15 ficheros, 2.358 líneas) | Lectura completa |
| M01 soluciones | `solutions/01-playwright-fundamentals/` (9 ficheros) | Lectura completa |
| M01 sandbox | `student/sandbox/01-playwright/` (config + 3 specs + README) | Lectura y ejecución |
| Plan de sesión | `trainer/session-plans/session-03-module-01.md` (229 líneas) | Lectura completa |
| Transversal | `docs/learning-path.md`, `student-guide.md`, `trainer-guide.md`, `assessment-rubric.md`, `architecture.md`, `modules/README.md`, `README.md` | Lectura completa |
| Proyecto real | `tests/` (14 specs, 79 tests), `pages/` (6 POM), `playwright.config.ts`, `package.json`, `tsconfig.json` | Lectura + recuentos ejecutados |

**[H] `fixtures/` no existe en el repositorio.** `ls fixtures` devuelve *No such file or directory*. La instrucción de revisar esa carpeta no puede cumplirse porque el proyecto no la tiene; su ausencia es coherente con el diseño (los fixtures propios son material del módulo 03).

**Recuentos verificados durante esta revisión** *(comandos reproducibles)*:

| Dato | Valor | Comando |
|---|---|---|
| Tests del proyecto | 79 | `grep -rc "test(" tests/*.spec.ts` |
| Specs | 14 | `ls tests/` |
| Page Objects | 6 | `ls pages/` |
| `getByRole` en toda la suite | 1 | `grep -rn "getByRole" tests/` |
| Selectores `data-test` | 66 | `grep -ro 'data-test' pages/ tests/ \| wc -l` |
| `.cart_item` | 12 usos en 5 ficheros | `grep -rc "cart_item" tests/*.spec.ts` |
| `CartPage.cartItems` usado por tests | **0** | `grep -ro "\.cartItems\b" tests/ \| wc -l` |

---

# 2. Principio de la revisión: ¿esto forma a un QA?

**[I]** El criterio con el que se ha leído todo el material no ha sido "¿está bien explicado Playwright?", sino **"¿el alumno tiene que pensar o solo tiene que teclear?"**.

**[H]** El material declara ese mismo criterio de forma explícita y no como adorno:

- `learning-objectives.md`, nota sobre P3: *"Un alumno que use tres estrategias bien elegidas y las justifique supera P3. Uno que use las cinco sin criterio, no."*
- `theory.md` §5: *"Un locator que funciona hoy no es necesariamente un buen locator. Un test en verde no dice nada sobre mantenibilidad."*
- `lab-4-test-que-falta.md`, Paso 5: *"¿podría alguno pasar aunque la funcionalidad estuviera rota?"*
- `challenges/README.md`: *"cualquiera puede dejar en verde un flujo de compra copiando de `tests/checkout.spec.ts`. Lo que se evalúa es el criterio."*

**[I]** El módulo está construido sobre la pregunta correcta. La auditoría que sigue mide **hasta dónde la sostiene**, que es distinto de si la enuncia.

---

# 3. Revisión de los objetivos P1-P8

Cada objetivo se ha contrastado contra las 10 preguntas del encargo. La columna **Assessment > Lab** responde a "¿la dificultad del assessment supera la del Lab?".

## P1 — Ejecutar la suite e interpretar el informe 🟢

| Pregunta | Respuesta |
|---|---|
| Formulación medible | **[H]** Sí: verbos *ejecutar* e *interpretar*, con evidencia definida (tabla de 6 ejecuciones) |
| Teoría | **[H]** §1 y §2 de `theory.md`, incluida la tabla de las tres clases de rojo |
| Práctica | **[H]** Lab 1 completo, 45 min |
| El Lab obliga a aplicar | **[H]** Paso 3 exige **clasificar** 3 fallos, no solo copiarlos; Paso 6 exige razonar sobre "30 fallos" |
| Challenge | **[H]** Uso implícito (`AC5`: verde en tres navegadores) |
| Assessment | **[H]** A1 (3 p) + validación de E1 |
| Assessment > Lab | **[I]** **No.** A1 es una versión reducida del Paso 6 del Lab |
| Progresión respecto a M00 | **[H]** Sí: en M00 se ejecutaba `-c sandbox` con 20 tests deterministas; aquí, 237 ejecuciones, tags, projects e informe HTML |
| Prepara M02 | **[I]** Suficiente: M02 necesita leer suites, no configurarlas |

**[I]** Peso de 5% en el assessment, coherente con el diseño. El objetivo se sostiene sobre el Lab, no sobre el examen, y eso es defendible para un nivel FOLLOW.

## P2 — Auto-waiting y métodos sin reintento 🟢

| Pregunta | Respuesta |
|---|---|
| Teoría | **[H]** §3 y §4, con tres cifras medidas (277 ms / 3.334 ms / ~5,1 s de latencia real) |
| Práctica | **[H]** Lab 2 completo + refuerzo en Lab 5 |
| El Lab obliga | **[H]** Exige **predicción escrita antes de ejecutar** en los pasos 3 y 5, y el resultado del paso 5 contradice la intuición |
| Assessment | **[H]** A2, A3 y **E2 fallo 2** |
| Assessment > Lab | **[I]** **Sí.** El Lab guía la medición; E2 obliga a diagnosticar un `Test timeout of 3000ms exceeded` sin que nadie diga que el usuario es lento |
| Progresión | **[H]** M00 no tenía navegador: es materia nueva íntegra |
| Prepara M02 | **[I]** Sí, y sobre todo prepara M04 |

**[H]** El Lab 2 incluye el mejor hallazgo del módulo: la aserción web-first **falla** con el timeout por defecto (5 s) porque `performance_glitch_user` tarda ~5,1 s. Está documentado en `solutions/01-playwright-fundamentals/lab-2.md` y medido.

**[I]** Es la clase de dato que impide que el alumno se quede con la simplificación "web-first siempre pasa". Vale más que tres páginas de teoría.

## P3 — Seleccionar y justificar el locator 🟢

| Pregunta | Respuesta |
|---|---|
| Teoría | **[H]** §5-§12, con los cinco criterios tabulados y `locator-reference.md` como anexo |
| Práctica | **[H]** Lab 3 (8 bloques, 12 elementos, entregable escrito) |
| El Lab obliga | **[H]** El entregable es `03-decisiones.md`, no el fichero de tests. El bloque 3.3 **no tiene código** |
| Challenge | **[H]** AC4 |
| Assessment | **[H]** A4, A5, E1 (12 de 40 p) y **Parte C** |
| Assessment > Lab | **[I]** **Sí.** A4 pide anticipar *cómo fallaría en el futuro* un locator hoy verde; el Lab solo pide decidir |
| Progresión | **[H]** M00 llegaba a "justificar una decisión tomada" (O8); aquí es "elegir entre alternativas y anticipar su caducidad" |
| Prepara M02 | **[I]** **Es el prerrequisito directo de M02**: sin criterio de locator no se puede criticar un Page Object |

**[I]** Es el objetivo mejor construido del módulo y el que más lo diferencia de un tutorial.

## P4 — Convertir locators CSS a locators de usuario 🟡

| Pregunta | Respuesta |
|---|---|
| Teoría | **[H]** §6, §7, §8 |
| Práctica | **[H]** Lab 3 bloques 3.1 y 3.2 (login por rol, por placeholder y por test id) |
| Assessment | **[H]** El propio assessment lo mapea a A5 y E1 |
| **El assessment mide el objetivo** | **[I]** **Solo parcialmente.** A5 mide *selección* ante ambigüedad y E1 mide *elección justificada*; **ninguno pide convertir un locator existente manteniendo el test en verde ni medir qué se gana y qué se pierde**, que es el verbo literal de P4 |
| Assessment > Lab | **[I]** No aplicable: el instrumento específico no existe |
| Progresión | **[H]** Sí |
| Prepara M02 | **[I]** Sí, indirectamente |

**[I]** P4 funciona hoy como sub-competencia de P3 y su evidencia real vive en el Lab 3, no en el examen. No es un fallo grave —la evidencia existe y es observable—, pero la matriz afirma una cobertura de assessment que el assessment no da.

**[R]** *(Gap 🟡-3)* O bien añadir un apartado a E1 del tipo "reescribe estas dos líneas de `pages/login.page.ts` con locators de usuario y di qué ganas y qué pierdes", o bien reconocer en la matriz que P4 se evalúa **por entregable de Lab** y no por examen. Lo segundo cuesta una línea y es igual de honesto.

## P5 — Escribir un test nuevo para un hueco real 🟢

| Pregunta | Respuesta |
|---|---|
| Teoría | **[H]** §2 y §13 |
| Práctica | **[H]** Lab 4: dos tests, el segundo con hueco elegido por el alumno |
| El Lab obliga | **[H]** Exige justificar **el riesgo de negocio** del segundo test, y el Paso 5 obliga a autocriticar el propio test |
| Assessment | **[H]** E1 (40 p) |
| Assessment > Lab | **[I]** **Sí, claramente.** En el Lab el hueco (`az`) viene dado; en E1 el alumno debe **deducir cuál es el producto más barato desde la aplicación**, con prohibición explícita de escribirlo a mano |
| Progresión | **[H]** M00 Lab 3 escribía contra un contrato de tests dado; aquí no hay contrato |
| Prepara M02 | **[I]** Sí: M02 exige crear un Page Object, y quien no sabe escribir un test no sabe qué debe encapsular |

## P6 — Elegir la aserción y redactar su mensaje 🟢

| Pregunta | Respuesta |
|---|---|
| Teoría | **[H]** §4, con los cinco tipos y sus recuentos reales (53/46/24/13/13, verificados) |
| Práctica | **[H]** Labs 4 y Challenge; obligación transversal de mensaje descriptivo (`labs/README.md`, regla 4) |
| Assessment | **[H]** A6 y E1 (16 de 40 p entre aserciones y mensajes) |
| Assessment > Lab | **[I]** Sí: A6(b) obliga a construir un contraejemplo (`toContainText('1')` pasa con `'19'`) |
| Progresión | **[H]** M00 usaba `toBe`/`toEqual` sobre datos; aquí hay que distinguir web-first de no web-first |
| Prepara M02 | **[I]** Sí, y es la base del principio "los POM no contienen aserciones" que M02 desarrollará |

## P7 — Diagnosticar fallos de localización y sincronización 🟢

| Pregunta | Respuesta |
|---|---|
| Teoría | **[H]** §10, §11, §12 |
| Práctica | **[H]** Lab 5, con **dos casos auténticos del repositorio**, no fabricados |
| El Lab obliga | **[H]** Informe con casilla **"Comprobación"** obligatoria (una ejecución real con su resultado) antes de corregir |
| Assessment | **[H]** E2 (30 p), con dos fallos de causas distintas |
| Assessment > Lab | **[I]** **Sí.** En el Lab, el error de strict mode literalmente sugiere los dos candidatos; en E2 el fallo 1 (`toHaveText` sobre 6 elementos) **no menciona la ambigüedad** y el fallo 2 no dice nada del usuario lento |
| Progresión | **[H]** M00 Lab 4 diagnosticaba lógica determinista; aquí, localización y sincronización con navegador |
| Prepara M02 | **[I]** Sí, y es el puente explícito a M02: el caso B deja abierta la pregunta arquitectónica |

**[I]** El Lab 5 es, junto al 3, el que sostiene el valor del módulo. Su fuerza está en que **el defecto es real**: `CartPage.cartItems` resuelve 0 elementos y ningún test lo usa (verificado en esta revisión: `grep -ro "\.cartItems\b" tests/` → 0).

## P8 — Diseñar un E2E y justificarlo 🟠

| Pregunta | Respuesta |
|---|---|
| Teoría | **[H]** Transversal |
| Práctica | **[H]** Challenge 1 |
| El Challenge lo refuerza | **[H]** Sí: AC6 exige `decisiones.md` con reparto, riesgos y **qué no ha automatizado** |
| Assessment | **[H]** Se declara en Challenge + Parte C |
| **Instrumento obligatorio** | **[H]** **El Challenge no aparece en ningún criterio de superación.** `learning-objectives.md` §*Criterio de superación* enumera 4 puntos (Labs 1-5, `03-decisiones.md`, ≥70 en A y B, apto en Parte C); `README.md` §*Cómo sé que lo he superado* enumera 6 y tampoco lo incluye |
| Assessment > Lab | **[I]** Sí, cuando se hace |
| Prepara M02 | **[I]** Sí |

**[I]** Un alumno puede superar M01 según los criterios escritos **sin haber entregado el Challenge**, y P8 es el único objetivo que depende exclusivamente de él. La Parte C admite defender el Lab 3 en su lugar (`assessment/README.md`, D1: *"trae su `03-decisiones.md` o su `decisiones.md` del Challenge"`), con lo que P8 puede quedar sin ninguna evidencia.

**[R]** *(Gap 🟠-1)* Añadir el Challenge entregado con sus AC1-AC6 a los criterios de superación, o declarar explícitamente que P8 es un objetivo **formativo no certificable en M01** y trasladar su evaluación al capstone. Ambas son coherentes; lo que no lo es es afirmar en la matriz que se evalúa y no exigirlo en ningún sitio.

## Resumen de objetivos

| Objetivo | Estado | Motivo en una línea |
|---|---|---|
| P1 | 🟢 | Cubierto; assessment ligero pero deliberado |
| P2 | 🟢 | Práctica medida y evaluación más dura que el Lab |
| P3 | 🟢 | El objetivo mejor construido del módulo |
| P4 | 🟡 | El verbo "convertir y medir" no tiene instrumento propio en el assessment |
| P5 | 🟢 | E1 exige más autonomía que el Lab |
| P6 | 🟢 | Bien anclado y bien evaluado |
| P7 | 🟢 | Dos casos auténticos; E2 más duro que el Lab |
| P8 | 🟠 | Su único instrumento no es obligatorio para superar el módulo |

---

# 4. Auditoría de la progresión pedagógica

## FOLLOW

| Campo | Contenido |
|---|---|
| Dónde | Lab 1 |
| Ayuda | **[H]** 6 pasos numerados, comandos literales, tabla a rellenar |
| Autonomía | Baja, por diseño |
| Evidencia | `01-ejecuciones.md` con cifras propias y **clasificación** de 3 fallos |
| ¿Artificialmente fácil? | **[I]** No. El Paso 6 ("un compañero ve 30 fallos") exige un cálculo (10 × 3) y una respuesta de criterio que no se puede copiar de ningún sitio |

## MODIFY

| Campo | Contenido |
|---|---|
| Dónde | Labs 2 y 3 (bloques 3.1-3.2) |
| Ayuda | **[H]** El Lab 2 Paso 3 **entrega el bloque de código completo** de la versión "sin reintento"; el Lab 3 llega con el bloque 3.1 ya resuelto en `03-locators.spec.ts` |
| Autonomía | Media |
| Evidencia | Tiempos medidos, predicciones escritas, tres versiones de la misma comprobación |
| Observación | **[I]** El código regalado del Lab 2 Paso 3 es defendible —la técnica de "no esperar la navegación" no es intuitiva y no es el objeto de aprendizaje—, pero convierte ese paso concreto en FOLLOW dentro de un Lab MODIFY. Lo que sí se le pide al alumno es la **predicción y la explicación**, que es donde está el aprendizaje |

## CREATE

| Campo | Contenido |
|---|---|
| Dónde | Lab 4 (+ E1 del assessment) |
| Ayuda | **[H]** El primer test tiene requisitos explícitos y una trampa señalada ("no compares contra una lista escrita a mano"); **el segundo no tiene pasos** |
| Autonomía | Alta en la segunda mitad |
| Evidencia | 2 tests verdes en 3 navegadores + justificación de riesgo por escrito |
| Riesgo | **[H]** En el plan de sesión, el Lab 4 recibe **20 minutos de sesión** (sesión 4, bloque 5) y 45 de trabajo personal. **[I]** El nivel CREATE queda mayoritariamente sin supervisión; lo mitiga —parcialmente— la revisión de 15 min al inicio de la sesión 5 |

## TROUBLESHOOT

| Campo | Contenido |
|---|---|
| Dónde | Lab 5 (+ E2) |
| Ayuda | **[H]** Formato de informe dado; **[H]** el Paso 4 entrega los dos comandos `grep` que revelan por qué nadie detectó el defecto |
| Autonomía | Media-alta: la causa no se da nunca, el método sí |
| Evidencia | `05-diagnostico.md` con síntoma/hipótesis/comprobación/causa/corrección/prevención + 2 tests verdes sin tocar aserciones |
| Observación | **[I]** Los `grep` regalados acortan el descubrimiento más valioso del módulo ("ningún test usa ese locator"). El plan de sesión lo compensa: instruye al formador a **no** adelantar la respuesta (*"Deja que el grupo llegue solo"*), pero el enunciado escrito sí la insinúa |

## DESIGN

| Campo | Contenido |
|---|---|
| Dónde | Lab 3 (tabla de decisión), Challenge, Parte C |
| Ayuda | **[H]** El Challenge no tiene pasos, ni ficheros indicados, ni número de tests prescrito |
| Autonomía | Alta |
| Evidencia | `03-decisiones.md`, `decisiones.md`, defensa oral con 4 preguntas |
| Observación | **[I]** El nivel DESIGN está bien planteado pero se apoya en dos entregables escritos cuya obligatoriedad es desigual: `03-decisiones.md` sí figura en los criterios de superación; el del Challenge, no (ver P8) |

## Respuestas a las tres preguntas del encargo

**¿Existe algún salto demasiado grande?**
**[I]** Uno, moderado: **Lab 3 → Lab 4**. En el Lab 3 el alumno decide *sobre elementos que el enunciado le nombra* (los doce están listados); en el Lab 4 debe **encontrar él** qué falta comparando `specs/test-index.md` con la aplicación. El salto no es de técnica sino de tipo de tarea: de decidir a descubrir. **[R]** No requiere cambio de material; sí que el formador dé el Lab 4 en sesión con el catálogo y el índice abiertos (el plan de sesión ya lo prevé, bloque 5).

**¿Existe algún nivel artificialmente fácil?**
**[I]** No hay ninguno vacío. El más ligero es FOLLOW (Lab 1), y aun así pide clasificar fallos por causa, que en la [rúbrica general](assessment-rubric.md) es nivel INTERMEDIATE de la competencia *Debugging*.

**¿Hay algún punto donde el alumno parezca autónomo y esté siguiendo una receta?**
**[I]** Sí, dos, ambos acotados:

1. **Lab 3, bloque 3.6** — el enunciado prohíbe `.first()` y describe el camino ("partiendo de la tarjeta del producto y bajando hasta su botón"). El alumno escribe el locator correcto casi por dictado. Lo que sí es suyo es la justificación posterior y la respuesta sobre robustez ante cambios de orden.
2. **Lab 5, caso A** — el mensaje de strict mode de Playwright **muestra los dos elementos candidatos**, así que la corrección es casi inmediata. El valor del ejercicio no está ahí sino en la pregunta 2 ("¿ha desaparecido el problema?"), que sí es de criterio.

**[I]** En los dos casos el material ha puesto el aprendizaje **en la justificación, no en el código**. Es una decisión de diseño consciente y la corrección la respeta (el Lab 3 no se puntúa por número de estrategias; el Lab 5 exige informe antes de corregir).

---

# 5. Auditoría del enfoque QA

| Competencia | Se enseña | Se practica | Se evalúa | ¿Suficiente? |
|---|---|---|---|---|
| **Locator strategy** | `theory.md` §5-§12 + `locator-reference.md` (5 criterios, medidos en 20 elementos) | Lab 3 (12 elementos), Lab 5, Challenge AC4 | A4, A5, E1 (12 p), Parte C | 🟢 **Sí.** No es sintaxis: es decisión. El árbol de decisión de `locator-reference.md` es transferible tal cual |
| **Assertions** | §4, con recuentos reales | Labs 4 y 5, Challenge AC2 | A6, E1 (10+6 p) | 🟢 Sí. Se enseña **qué** comprobar (`toContainText('1')` pasa con `'19'`) y no solo cómo |
| **Synchronization** | §3, tres cifras medidas | Lab 2 completo | A2, A3, E2 fallo 2 | 🟢 Sí, y con la excepción medida que evita la simplificación |
| **Flaky tests** | **[H]** El término *flaky* e *inestable* **no aparecen ni una vez** en los 15 ficheros de M01 (`grep -ril "flaky\|inestable"` → sin resultados). Sí aparece el fenómeno: `lab-2` pregunta de reflexión 3 (*"falla una vez de cada veinte, siempre en CI"*) y A3 (*"porque a veces falla"*) | Lab 2, reflexión | A3 (parcial) | 🟡 **Insuficiente por vocabulario.** El alumno aprende la causa y la cura, pero no el nombre con el que su equipo va a llamarlo |
| **Diagnóstico** | §2 (tres clases de rojo), §10, §12 | Labs 1 y 5 | A8, E2 (30 p) | 🟢 Sí. La tabla de las tres clases de rojo es la herramienta más transferible del módulo |
| **Mantenibilidad** | §5 (criterio 4), §12 (robusto/frágil/muerto) | Lab 3 bloques 3.5 y 3.7 | A4 (4 p), Parte C pregunta 2 | 🟢 Sí. El caso del `combobox` que "funciona por casualidad" es un ejemplo excelente de coste diferido |
| **Accesibilidad** | §6, §7 (nombre accesible, 0 `<label>`), R11b | **Lab 3 bloque 3.3, sin código** | Parte C, y de forma indirecta A4 | 🟢 Sí, y es el bloque más original del módulo: convierte una limitación del test en un hallazgo de producto |
| **Page Objects** | §0 y menciones; se usan como caja negra | Todos los Labs los importan | No se evalúa el **diseño** (correcto: es M02) | 🟢 Adecuado para M01. El Lab 5 caso B deja la pregunta arquitectónica abierta y nombrada |
| **Test quality** (detectar defectos, no solo pasar) | §4 (aserciones no web-first), Lab 2 Paso 4 (oráculo), Lab 4 Paso 5 | Labs 2, 4 y Challenge | E1 (penalización por leer el valor esperado de la pantalla verificada), rúbrica del Challenge | 🟢 **Sí, y es el punto más fuerte del módulo.** El Lab 2 Paso 4 enseña, con código real del proyecto (`problem-user-cart.spec.ts:69-88`), que **un test cuyo valor esperado sale de la aplicación no puede fallar** |

**[I] Balance del enfoque QA.** De las nueve competencias, ocho están cubiertas a nivel suficiente para M01 y una (flaky) lo está a nivel de fenómeno pero no de vocabulario. El módulo **no** es un tour de API: de los 12 elementos del Lab 3, ninguno se resuelve leyendo documentación de Playwright — todos exigen medir contra la aplicación.

**[H]** El diseño defiere explícitamente *"flaky vs determinista, política de reintentos"* a M04/M07 (`module-01-discovery-design.md`, sección 7), así que la ausencia es deliberada, no un olvido.

**[R]** *(Gap 🟡-1)* Nombrar el término una sola vez en `theory.md` §3 —"a un test que unas veces pasa y otras no se le llama *flaky*; su política se trabaja en el módulo 04"— sin desarrollarlo. Coste: una frase. Beneficio: el alumno reconoce la palabra el primer día que la oiga en su equipo.

---

# 6. Auditoría de los Labs

## Lab 1 — La suite real (FOLLOW, 45 min)

| Campo | Análisis |
|---|---|
| **Objetivo pedagógico** | Leer el resultado de una ejecución y saber qué preguntar después |
| **Actividad** | **[H]** 6 ejecuciones medidas, informe HTML, clasificación de 3 fallos, 2 respuestas de criterio |
| **Autonomía** | Baja: comandos literales. Adecuada al nivel |
| **Pensamiento QA** | **[H]** Clasificar por causa (aserción / locator / aplicación) y responder al caso de los "30 fallos" |
| **Riesgo** | **[I]** Medio-bajo: se puede rellenar la tabla sin entender nada, pero los pasos 3 y 6 no. La solución avisa de la señal: *"si los tiempos son idénticos a los de referencia, no ha ejecutado"* |
| **Evidencia** | `01-ejecuciones.md` |
| **Recomendación** | **Mantener** |

## Lab 2 — Por qué nadie espera (MODIFY, 45 min)

| Campo | Análisis |
|---|---|
| **Objetivo pedagógico** | Entender el auto-waiting rompiéndolo y midiendo |
| **Actividad** | **[H]** 5 versiones del mismo test; predicciones escritas; lectura de `problem-user-cart.spec.ts:69-88` |
| **Autonomía** | Media. **[H]** El Paso 3 da el código completo; los pasos 2, 4 y 5 no |
| **Pensamiento QA** | **[H]** Paso 4: descubrir que un test **no puede fallar**. Paso 5: descubrir que el timeout de 15 s no es lo que salva a los tests del usuario lento |
| **Riesgo** | **[I]** Bajo. Las predicciones se piden por escrito y el resultado del Paso 5 contradice lo que casi todo el mundo predice |
| **Evidencia** | `02-conclusiones.md` + tiempos propios |
| **Recomendación** | **Mantener.** Es el Lab con mejor relación coste/aprendizaje del módulo |

## Lab 3 — Elegir el locator correcto (MODIFY → DESIGN, 60 min) ⭐

| Campo | Análisis |
|---|---|
| **Objetivo pedagógico** | Decidir y justificar, no usar muchas estrategias |
| **Actividad** | **[H]** 8 bloques; tabla de 12 elementos; 4 respuestas sin código en el bloque 3.3 |
| **Autonomía** | Media-alta. **[H]** El bloque 3.1 llega resuelto como ejemplo; el resto son objetivos, no pasos |
| **Pensamiento QA** | **[H]** Bloque 3.3 (redactar un ticket de accesibilidad), 3.5 (¿lo mantendrías dos años?), 3.7 (el nombre accesible que engaña) |
| **Riesgo** | **[I]** **Medio.** Es posible rellenar 12 filas con justificaciones plausibles sin haber medido nada. Lo mitigan: la obligación de nombrar una alternativa descartada, el `grep` de validación contra ordinales y la Parte C, donde hay que defender una fila oralmente |
| **Evidencia** | `03-decisiones.md` + ≥6 tests verdes |
| **Recomendación** | **Mantener.** Es el Lab que justifica el módulo |

**[I]** Detalle de calidad: el Lab pide **medir con `count()` antes de decidir** en los bloques 3.4, 3.6 y 3.7. Eso convierte "comprobar en vez de suponer" en un hábito mecánico, que es exactamente lo que se quiere trasladar al puesto de trabajo.

## Lab 4 — El test que falta (CREATE, 60 min)

| Campo | Análisis |
|---|---|
| **Objetivo pedagógico** | Detectar un hueco de cobertura y cubrirlo con un test que verifique comportamiento |
| **Actividad** | **[H]** Test A→Z (hueco dado) + un segundo hueco elegido y justificado por el alumno |
| **Autonomía** | **Alta en la segunda mitad: no hay pasos** |
| **Pensamiento QA** | **[H]** Justificar el **riesgo de negocio** del segundo test; Paso 5: "¿podría pasar aunque la funcionalidad estuviera rota?"; reflexión 3: "¿lo cubres o lo reportas?" |
| **Riesgo** | **[I]** Bajo en cuanto a comprensión; **medio en cuanto a tiempo**: solo 20 de los 60 minutos ocurren en sesión |
| **Evidencia** | 2 tests verdes en 3 navegadores + justificación escrita |
| **Recomendación** | **Mantener**, vigilando el tiempo (ver §10) |

## Lab 5 — El test que a veces pasa (TROUBLESHOOT, 50 min)

| Campo | Análisis |
|---|---|
| **Objetivo pedagógico** | Diagnosticar por causa, no por síntoma, sin tocar aserciones |
| **Actividad** | **[H]** 2 fallos reales; informe de 6 casillas; reescritura crítica del `.first()` del proyecto |
| **Autonomía** | Media-alta. El método se da; la causa, nunca |
| **Pensamiento QA** | **[H]** "El error ha desaparecido, ¿ha desaparecido el problema?"; distinguir "he sorteado el defecto" de "he corregido el defecto" |
| **Riesgo** | **[I]** **Medio.** Dos atajos posibles: (a) el mensaje de strict mode revela los candidatos; (b) el Paso 4 entrega los `grep` que revelan que nadie usa el locator. El alumno puede llegar al resultado sin hacer el recorrido |
| **Evidencia** | `05-diagnostico.md` escrito antes + 2 tests verdes + `git diff --stat pages/` vacío |
| **Recomendación** | **Mantener.** **[R]** *(Gap 🟡-2)* Si en el piloto se observa que el caso B se resuelve en menos de 10 minutos, mover los dos `grep` del Paso 4 a una sección "pista, si te atascas" al final del enunciado — el mismo mecanismo de `<details>` que ya usa el Challenge 1 de M00 |

## Lab 6 — Codegen (opcional, 30 min)

| Campo | Análisis |
|---|---|
| **Objetivo pedagógico** | Criticar código generado con los criterios del Lab 3 |
| **Actividad** | Grabar, inventariar locators, criticar, reescribir |
| **Autonomía** | Alta |
| **Pensamiento QA** | **[H]** "Un recorrido no es un test hasta que tiene una aserción"; puente explícito al módulo 08 (IA) |
| **Riesgo** | **[H]** El Lab **no está validado técnicamente** y su solución lo declara sin rellenar el hueco |
| **Evidencia** | `06-critica.md` |
| **Recomendación** | **Mantener como opcional y bloqueado.** El material es honesto: banners en el enunciado y en la solución, e instrucción al formador de ejecutarlo antes. **[R]** No proponerlo a ningún grupo hasta que alguien lo ejecute y complete `solutions/.../lab-6.md` |

---

# 7. Auditoría del Challenge

| Pregunta del encargo | Respuesta |
|---|---|
| ¿Requisitos suficientemente ambiguos? | **[H]** Sí: escenario en lenguaje de negocio, sin pasos, sin ficheros, sin número de tests |
| ¿Hay decisiones técnicas? | **[H]** Sí, y una explícita y no trivial: **importes fijos o calculados** (`challenge-1-compra-completa.md`, sección AC2), con consecuencias distintas ante un cambio de precios |
| ¿Criterios de aceptación? | **[H]** Seis (AC1-AC6), verificables |
| ¿Autonomía? | Alta |
| ¿Novedad respecto a los Labs? | **[H]** Sí: nadie ha verificado importes calculados en ningún Lab; el caso límite y el caso negativo tampoco aparecen antes |
| ¿Evalúa calidad además de funcionamiento? | **[H]** Sí: 65% de la nota es locators, aserciones y justificación; solo el 35% son los AC |
| **¿Podría completarse copiando de los Labs?** | **[I]** **Parcialmente sí, y conviene decirlo.** Ver abajo |

## El riesgo de copia, con evidencia

**[H]** El flujo login → añadir producto → carrito → checkout está literalmente escrito en `tests/checkout.spec.ts:12-36`, que es material de **lectura obligatoria** del módulo. Un alumno puede copiar ese `beforeEach` y tener AC1 medio resuelto sin decidir nada.

**[I]** Lo que **no** se puede copiar de ningún sitio del repositorio: la verificación de importes por valor (no existe: `checkout.spec.ts:102-118` solo comprueba visibilidad — verificado en esta revisión), el caso límite, la tabla de justificación de locators y el apartado "qué no he automatizado". Es decir: **la parte copiable es la mecánica; la parte evaluable, no**.

**[H]** El material ya es consciente del riesgo: `solutions/.../challenge-1.md` lo lista como error habitual (*"copia el `beforeEach` de `tests/checkout.spec.ts` con el producto ya añadido → entonces el flujo empieza a mitad y AC1 no se cumple"*).

**[R]** *(Gap 🟠-2)* Añadir a `decisiones.md` un apartado obligatorio de una línea: *"qué he reutilizado de `tests/checkout.spec.ts` y en qué mejora mi cobertura la suya"*. Convierte la copia —que es legítima y realista en un equipo— en una decisión declarada y evaluable, en lugar de en un atajo silencioso. **No requiere tocar el Challenge**: es una fila más en la rúbrica de corrección.

---

# 8. Auditoría del assessment *(punto crítico)*

## ¿Distingue memorizar de saber usar?

**[H]** Reparto: Parte A 30 p (8 preguntas), Parte B 70 p (E1 40 + E2 30), Parte C apto/no apto. La práctica pesa el 70%, frente al 60% de M00.

**Clasificación pregunta a pregunta** *(criterio: ¿se puede responder correctamente recordando la teoría, sin decidir nada?)*:

| Ítem | Tipo | ¿Memorizable? |
|---|---|---|
| A1 (3 p) | Cálculo + comprobación propuesta | **Parcialmente.** El "10 × 3" es recuerdo; proponer `test:demo:green` como prueba, no |
| A2 (4 p) | Definición contrastada | **Sí.** Es la pregunta más memorizable del examen |
| A3 (4 p) | Código dado → tres decisiones | No |
| A4 (4 p) | Código dado → anticipar fallo futuro | No. **Es la mejor pregunta del examen** |
| A5 (4 p) | Escribir locator + criticar el ajeno | No |
| A6 (4 p) | Código real del proyecto → construir contraejemplo | No |
| A7 (4 p) | Recuerdo de valores heredados + dónde se observan | **Parcialmente.** Los valores son recuerdo; "dónde se ve su efecto", no |
| A8 (3 p) | Dos mensajes de error → clasificar y decidir primer paso | No |

**[H]** 5 de 8 preguntas dan código o datos reales y piden una decisión. El diseño exigía un mínimo de 3 (`module-01-discovery-design.md`, K7).

**[I]** El examen **sí** distingue A de B. Un alumno que haya memorizado la teoría saca aproximadamente 11 de 30 en la Parte A y **no puede aprobar**, porque el 70% restante exige escribir y diagnosticar.

## ¿Assessment > Labs en dificultad cognitiva?

| Comparación | Veredicto |
|---|---|
| E1 vs Lab 4 | **[H]** E1 prohíbe escribir a mano el nombre y el precio del producto: hay que **deducirlos de la aplicación**. El Lab 4 nunca pide eso. **Más difícil** |
| E2 fallo 1 vs Lab 5 caso A | **[H]** En el Lab, Playwright dice *"resolved to 2 elements"* y enseña los dos. En E2 el mensaje es un `toHaveText` fallido sin mención de ambigüedad. **Más difícil** |
| E2 fallo 2 vs Lab 2 | **[H]** El Lab guía la medición del usuario lento; E2 da `Test timeout of 3000ms exceeded` y nada más. **Más difícil** |
| A4 vs Lab 3 bloque 3.5 | **[H]** El Lab pregunta si lo usaría dos años; A4 pide además **cómo se manifestaría el fallo**. **Más difícil** |
| Parte C vs M00 Parte C | **[H]** M00: "¿qué hiciste y por qué?". M01: "¿por qué ese locator y no otro, y qué pasa si la aplicación cambia?". **Más difícil** |

**[I]** La relación **Assessment > Lab** se cumple en los cinco pares. Es el criterio que más veces falla en material de formación y aquí está respetado.

## Otras comprobaciones

| Comprobación | Resultado |
|---|---|
| ¿Se evalúa algo no enseñado? | **[H]** No. `assessment/README.md` cierra con una tabla ítem → sección de teoría → Lab, y esta revisión la ha verificado ítem a ítem |
| ¿Se puede aprobar cambiando un `expect`? | **[H]** No: −12 puntos, heredado de M00, más −6 por `.first()` y −10 por sustituir el usuario lento |
| ¿Hay una penalización que cubra el atajo más probable? | **[H]** Sí, y es fina: **−10 por cambiar `performance_glitch_user` por `standard_user`** en E2, descrito como *"la versión más sofisticada de borrar la señal"* |
| ¿Transferencia a contexto nuevo? | **[H]** Sí: A4 y la pregunta 4 de la Parte C ("si mañana falla en CI, ¿qué mirarías primero?") |
| Aritmética | **[H]** Correcta: A = 3+4+4+4+4+4+4+3 = 30; E1 = 12+10+6+6+6 = 40; E2 = 10+10+8+2 = 30 |

**[R]** *(Gap 🟡-4)* A2 y A7 podrían cerrar con una cláusula de decisión ("…y dime en qué caso concreto elegirías uno u otro" / "…y qué cambiarías si el equipo se quejara de que la suite tarda"). No es bloqueante: 24 de los 30 puntos de la Parte A ya exigen decidir.

---

# 9. Preparación para el módulo 02

## "Ready for M02" — qué debe poder hacer sin ayuda

Lista derivada del material de M01 y del contenido real del proyecto:

| # | Capacidad | Evidencia que la respalda |
|---|---|---|
| 1 | Ejecutar la suite filtrando por fichero, navegador, nombre y tag, e interpretar el resultado | Lab 1, tabla de 6 ejecuciones |
| 2 | Abrir cualquiera de los 14 specs e identificar los cuatro bloques (`import` → `describe` → `beforeEach` → `test`) | `theory.md` §13 + Lab 1 |
| 3 | Escribir un test nuevo de principio a fin usando los 6 Page Objects existentes | Lab 4, E1 |
| 4 | Elegir un locator y justificarlo con uno de los cinco criterios | Lab 3, `03-decisiones.md`, Parte C |
| 5 | Resolver una ambigüedad acotando (`filter` + rol/testId) sin usar ordinales | Lab 3 bloque 3.6, Lab 5 caso A |
| 6 | Distinguir una aserción web-first de una consulta, y explicar por qué la suite no tiene esperas explícitas | Lab 2, A2, A3 |
| 7 | Clasificar un rojo en aserción / locator / aplicación **antes** de tocar nada | `theory.md` §2, A8, Lab 1 Paso 3 |
| 8 | Escribir un informe de diagnóstico con causa raíz distinta del síntoma | Lab 5, E2 |
| 9 | Detectar que un locator resuelve 0 o >1 elementos usando `count()` como reflejo | Labs 3 y 5 |
| 10 | Encontrar un hueco de cobertura comparando `specs/test-index.md` con la aplicación | Lab 4 Paso 3 |
| 11 | Verificar una regla de negocio (importes) en lugar de la mera visibilidad | Challenge AC2 |
| 12 | Trabajar en su sandbox y validar sin ensuciar el proyecto (`tsc --noEmit`, `git status`) | Validación de todos los Labs |

**[I]** Las capacidades 3, 4 y 12 son las que M02 usará desde el primer minuto: para criticar un Page Object hay que saber escribir el test que lo usa y tener criterio sobre el locator que encapsula.

## "Not yet ready" — lo que correctamente NO debe saber todavía

| Capacidad | Módulo destino | Por qué está bien que falte |
|---|---|---|
| Diseñar un Page Object y decidir qué método le pertenece | **M02** | En M01 se usan como caja negra; abrir el patrón antes de haber escrito tests con locators crudos impide entender qué problema resuelve |
| Razonar sobre la **arquitectura** que permitió el defecto de `CartPage.cartItems` | **M02** | M01 diagnostica el hecho; M02 razona sobre la causa organizativa |
| Detectar y resolver cobertura duplicada entre specs | M02 | Requiere ver la suite como sistema, no como ficheros |
| `test.extend`, fixtures propios, `storageState`, datos externalizados | M03 | Requiere haber sufrido el `beforeEach` repetido 13 veces |
| Trace viewer, `page.pause()`, `test.step` | M04 | M01 solo declara que el trace existe |
| Diagnosticar los 10 `@demo-fail` | M04 | En M01 se ven y se respetan |
| Política de flakiness y de reintentos | M04 / M07 | Ver gap 🟡-1: falta el término, no la materia |
| `page.route`, mocking, API | M05 | Sin anclaje en el repositorio |
| CI/CD, Docker, sharding | M06 | — |
| Estrategia de tags, quality gates, análisis de riesgo | M07 | M01 **usa** `@demo-fail`; no diseña el esquema |
| Interacciones inexistentes en la app (`check`, ficheros, diálogos, teclado) | Ninguno por ahora | Enseñarlas exigiría inventar ejemplos |

**[H]** Esta lista coincide con la sección *Fuera de alcance* de `learning-objectives.md` y con la sección 7 del diseño. **[I]** No se ha colado contenido de módulos posteriores en M01: la comprobación se ha hecho buscando en los 15 ficheros los términos `test.extend`, `storageState`, `page.route`, `test.step` y `sharding` — solo aparecen en listas de "esto es de otro módulo".

---

# 10. Carga cognitiva

| Componente | Dato observado | Valoración |
|---|---|---|
| Conceptos nuevos | **[H]** ~20 (ejecución, informe, 3 clases de fallo, auto-waiting, 5 aserciones, web-first vs no, 6 estrategias de locator, 5 criterios, strict mode, acotado, accesibilidad, testIdAttribute, timeouts, aislamiento) | 🟡 Alto, pero todos con anclaje real |
| Teoría | **[H]** 461 líneas, 3.971 palabras (M00: 350 líneas, 2.295) — declarada en 45 min de lectura | 🟢 Coherente |
| Labs | **[H]** 260 min de ejercicio puro (45+45+60+60+50) | 🟢 |
| Challenge | **[H]** 75 min | 🟡 Ajustado para lo que pide (3 tests + `decisiones.md` en 3 navegadores) |
| Assessment | **[H]** 60 min (15 A + 40 B) | 🟡 **E1 + E2 en 40 minutos es exigente**: E1 requiere deducir el producto más barato y E2 dos diagnósticos escritos |
| Ejecución | **[H]** Suite chromium ~22 s; sandbox M01 ~8 s; instalación de navegadores ~500 MB | 🟢 No es cuello de botella salvo la instalación |
| Troubleshooting | **[H]** Lab 5, 50 min para 2 casos con informe de 6 casillas cada uno | 🟡 Ajustado |
| Reparto sesión/personal | **[H]** En sesión hay 220 min de práctica sobre 420 (52%); el resto es apertura, teoría (55 min), puestas en común y cierres | 🟡 La metodología declarada del programa es "20% teoría / 80% práctica"; la teoría cumple (13%), pero la práctica **en sesión** es del 52%, y el 80% solo se alcanza sumando el trabajo personal |

## Veredicto de carga

# 🟡 ELEVADA PERO VIABLE

**[I]** Las 12 h son plausibles para un grupo FOUNDATION **si y solo si** se cumplen dos condiciones que el material ya prevé pero que dependen de la ejecución:

1. **Los navegadores están instalados antes de la sesión 3** (el plan de sesión lo pide expresamente). Si no, se pierden 30-40 min del primer bloque y el Lab 2 se cae al trabajo personal.
2. **El trabajo personal se hace de verdad** (4 h: teoría 45 min, Lab 4 45 min, Challenge 75 min). Sin él, el Lab 5 llega sin base y el Challenge no se entrega — con el efecto sobre P8 descrito en §3.

**[R]** No modificar la cifra ahora. **[R]** Instrumentar el piloto: el plan de sesión ya incluye *"anotar el tiempo real de cada Lab"*; conviene añadir a esa medición el tiempo real de E1 y E2 por separado, que es donde esta revisión sospecha el ajuste.

---

# 11. Transferencia al trabajo real

Pregunta aplicada a cada competencia: **¿esto sirve fuera de SauceDemo?**

| Competencia | Transferible | Riesgo de quedar atado a SauceDemo |
|---|---|---|
| **Locators** | 🟢 Alta. El árbol de decisión de `locator-reference.md` es genérico; los cinco criterios no dependen de la aplicación | 🟡 **Las conclusiones concretas sí son locales**: "los títulos no son headings", "no hay `<label>`", "`getByTestId` necesita `data-test`". Si el alumno memoriza las conclusiones en vez del método, se lleva un mapa del sitio equivocado |
| **Auto-waiting** | 🟢 Alta. Es comportamiento del framework, no de la aplicación | 🟢 Ninguno |
| **Assertions** | 🟢 Alta. `toHaveText` vs `toContainText` y el riesgo del contador son universales | 🟢 Ninguno |
| **Debugging** | 🟢 Alta. Las tres clases de rojo y el reflejo de `count()` funcionan en cualquier proyecto | 🟡 El alumno no ha usado trace ni vídeo (reservados a M04): en su equipo se topará con ellos antes |
| **Test design** | 🟢 Media-alta. "Comparar cobertura declarada con comportamiento real" es método puro | 🟡 En un proyecto real puede no existir un `test-index.md` que comparar |
| **Page Objects** | 🟢 Adecuada. Sabe usarlos y sabe que un locator del POM puede estar muerto | 🟢 — |
| **Mantenibilidad** | 🟢 Alta. El caso "funciona hoy, frágil mañana" es el argumento que tendrá que dar en revisiones de código | 🟢 — |
| **Accesibilidad** | 🟢 Alta y poco común. Saber convertir "no puedo localizar por etiqueta" en un ticket de producto es transferible tal cual | 🟢 — |
| **Flaky tests** | 🟡 Media. Conoce el fenómeno y su causa, no el vocabulario ni la política | Ver gap 🟡-1 |

**[I]** El principal riesgo de transferencia **no es el material sino el modo de estudiar**: `locator-reference.md` es a la vez el entregable más útil y el más "copiable". Un alumno puede llevarse la tabla como chuleta de SauceDemo en lugar de como plantilla de método.

**[H]** El material ya trata de evitarlo: el propio documento se presenta como *"la plantilla del mismo ejercicio sobre tu propia aplicación"* y cierra con *"comprobar tarda diez segundos; suponer cuesta una tarde"*.

**[R]** *(Gap 🟡-5)* En la puesta en común del Lab 3, pedir al grupo que nombre **qué tres cosas de la tabla cambiarían si la aplicación fuera la del cliente**. Es una pregunta de cinco minutos y separa el método de la conclusión. No requiere modificar material: es una línea en el plan de sesión.

---

# 12. Riesgo de "tutorial hell"

| Indicador | Observación |
|---|---|
| Pasos numerados | **[H]** Lab 1: 6 · Lab 2: 6 · Lab 3: 8 bloques (objetivos, no pasos) · Lab 4: 5, con el segundo test sin pasos · Lab 5: 6 · Challenge: **ninguno** |
| Código parcialmente completado | **[H]** `02-auto-waiting.spec.ts` (2 tests base + TODOs), `03-locators.spec.ts` (bloque 3.1 resuelto + TODOs), `05-diagnostico.spec.ts` (2 tests rotos). **No hay ningún fichero de "rellena el hueco"** |
| Nombres de método que revelan la solución | **[H]** No se detecta ninguno. Los TODO describen el objetivo ("localiza el desplegable por rol"), no la línea a escribir |
| Soluciones demasiado cercanas | **[H]** Las soluciones viven en `learning/solutions/` con política de publicación diferida y advertencia explícita. La del Lab 5 añade: *"no publiques hasta que todo el grupo haya entregado su `05-diagnostico.md`"* |
| Instrucciones que dictan el código | **[H]** Dos casos, ya descritos: Lab 2 Paso 3 y Lab 3 bloque 3.6 |

## Patrón "completa porque le dicen qué escribir": ¿aparece?

**[I]** **Aparece de forma acotada y decreciente**, que es exactamente lo que debe ocurrer en una progresión:

```
Lab 1  ████████░░  instrucción alta   (adecuado: FOLLOW)
Lab 2  ██████░░░░  media
Lab 3  ████░░░░░░  media-baja (objetivos por bloque, no pasos)
Lab 4  ██░░░░░░░░  baja (segundo test sin pasos)
Lab 5  ███░░░░░░░  baja-media (método dado, causa nunca)
Chall. ░░░░░░░░░░  ninguna
```

**[H]** La curva es coherente con la de M00 (Lab 1 hoja de observación → Challenge sin pasos) y **empieza en un punto más alto de autonomía**: el Lab 1 de M00 pedía leer y responder; el de M01 pide ejecutar, medir y clasificar.

**[I]** El riesgo real de "tutorial hell" en este módulo no está en los Labs sino en la **transición M01 → M02**: si M02 vuelve a dar pasos numerados para diseñar Page Objects, se pierde lo ganado. Es una advertencia para la fase siguiente, no un gap de M01.

---

# 13. Matriz de trazabilidad final

Se ha comprobado **relación pedagógica**, no solo existencia de enlace. La columna *Gap* recoge el hueco real, si lo hay.

| Objetivo | Teoría | Lab | Challenge | Assessment | Evidencia observable | Nivel | Gap |
|---|---|---|---|---|---|---|---|
| **P1** Ejecutar e interpretar | §1, §2 | Lab 1 (6 ejecuciones + clasificación) | Uso implícito (AC5) | A1 (3 p) + validación de E1 | `01-ejecuciones.md` con cifras propias | FOLLOW | 🟢 Ninguno. Evaluación ligera pero deliberada (5%) |
| **P2** Auto-waiting | §3, §4 | Lab 2 (5 versiones medidas), Lab 5 | Restricción "sin esperas" | A2, A3, **E2 fallo 2** | Tiempos + predicciones escritas | MODIFY | 🟢 |
| **P3** Elegir locator | §5-§12 + `locator-reference.md` | **Lab 3** (12 elementos) | AC4 | A4, A5, E1 (12 p), **Parte C** | `03-decisiones.md` + tests verdes | DESIGN | 🟢 |
| **P4** Convertir locators | §6, §7, §8 | Lab 3 bloques 3.1-3.2 | AC4 (indirecto) | A5, E1 (indirecto) | 3 versiones del login en verde | MODIFY | 🟡 **El verbo "convertir y medir" no tiene ítem propio** |
| **P5** Escribir test nuevo | §2, §13 | **Lab 4** (2 tests) | AC1, AC3 | **E1 (40 p)** | 2 tests verdes en 3 navegadores + riesgo justificado | CREATE | 🟢 |
| **P6** Aserción y mensaje | §4 | Lab 4, Challenge | **AC2** | A6, E1 (16 p) | Mensajes en lenguaje de negocio | CREATE | 🟢 |
| **P7** Diagnosticar | §10, §11, §12 | **Lab 5** (2 casos reales) | — | **E2 (30 p)** | `05-diagnostico.md` con casilla "Comprobación" | TROUBLESHOOT | 🟢 |
| **P8** Diseñar E2E y justificar | Transversal | Preparado por Labs 3-4 | **Challenge completo** | Parte C (alternativa: Lab 3) | `decisiones.md` con "qué no he automatizado" | DESIGN | 🟠 **Su único instrumento no es obligatorio para superar el módulo** |

> **Nota de cierre (18/08/2026) — F4 del dry-run.** Esta matriz reproduce la asignación de `learning-objectives.md`, que **omitía A7 y A8 en P1 y A8 en P7**. La asignación canónica es la de [`assessment/README.md`](../modules/01-playwright-fundamentals/assessment/): **A6 → P6 · A7 → P1 · A8 → P1 + P7**. `learning-objectives.md` se ha alineado con ella; la tabla de arriba se conserva como registro de la auditoría.

## Comprobaciones de la matriz

| Comprobación | Resultado |
|---|---|
| ¿Algún objetivo se enseña y no se practica? | **[H]** No |
| ¿Algún objetivo se practica y no se evalúa? | **[H]** P8, en la práctica, si el alumno no entrega el Challenge y defiende el Lab 3 en la Parte C |
| ¿Algo se evalúa sin haberse enseñado? | **[H]** No. Verificado ítem a ítem contra `theory.md` y los Labs |
| ¿Los enlaces resuelven? | **[H]** Sí: 0 enlaces rotos sobre el material de M01 y los índices modificados |
| ¿Las referencias `fichero:línea` son ciertas? | **[H]** Verificadas las citadas en teoría y Labs: `cart.page.ts:7`, `checkout.spec.ts:34`, `cart-sync.spec.ts:32`, `inventory.page.ts:21,33`, `product-detail-add-to-cart.spec.ts:117-121`, `problem-user-cart.spec.ts:53,54,77,78` |

---

# 14. Lista de gaps

## 🔴 BLOCKER — 0

Ninguno. **[I]** No hay ningún defecto que impida considerar M01 pedagógicamente válido.

## 🟠 IMPORTANT — 2

### 🟠-1 · P8 no tiene instrumento obligatorio

| Campo | Contenido |
|---|---|
| **Descripción** | El Challenge es el único instrumento de P8 y no figura en ningún criterio de superación |
| **Evidencia** | `learning-objectives.md` §*Criterio de superación* (4 puntos, sin Challenge); `README.md` §*Cómo sé que lo he superado* (6 puntos, sin Challenge); `assessment/README.md` D1 permite defender `03-decisiones.md` **o** el del Challenge |
| **Impacto** | Un alumno puede superar M01 sin ninguna evidencia de P8. La matriz afirma una evaluación que puede no ocurrir |
| **Recomendación** | Incluir el Challenge entregado (AC1-AC6) en los criterios de superación, **o** declarar P8 como objetivo formativo cuya certificación se traslada al capstone |
| **Ficheros afectados** | `modules/01-playwright-fundamentals/learning-objectives.md`, `README.md`, `assessment/README.md` |
| **¿Ahora o después?** | **Ahora**, antes de impartir. Es una decisión de programa de dos líneas |

### 🟠-2 · El Challenge es copiable en su mitad mecánica

| Campo | Contenido |
|---|---|
| **Descripción** | El flujo E2E del Challenge existe literalmente en un fichero que el alumno tiene como lectura obligatoria |
| **Evidencia** | `tests/checkout.spec.ts:12-36` contiene login + añadir producto + carrito + checkout en un `beforeEach` |
| **Impacto** | Medio. AC1 puede resolverse copiando; AC2, AC3, AC4 y AC6 no |
| **Recomendación** | Añadir a la rúbrica de `decisiones.md` una línea obligatoria: *"qué he reutilizado de `tests/checkout.spec.ts` y en qué mejora mi cobertura la suya"*. Convierte la copia en decisión declarada |
| **Ficheros afectados** | `challenges/challenge-1-compra-completa.md` (AC6), `solutions/.../challenge-1.md` (rúbrica) |
| **¿Ahora o después?** | **Ahora.** Es una fila de rúbrica, no un rediseño |

## 🟡 IMPROVEMENT — 5

### 🟡-1 · El término "flaky" no aparece en el módulo

**Evidencia:** `grep -ril "flaky\|inestable"` sobre los 15 ficheros de M01 → sin resultados. El fenómeno sí se trabaja (Lab 2, reflexión 3; A3).
**Impacto:** bajo. El alumno sabrá resolverlo y no sabrá nombrarlo.
**Recomendación:** una frase en `theory.md` §3 que nombre el término y remita a M04. **Después** — puede entrar en la primera revisión posterior al piloto.

### 🟡-2 · El Lab 5 regala los `grep` del descubrimiento

**Evidencia:** `lab-5-troubleshoot.md`, Paso 4, pregunta 3 entrega `grep -rn "cartItems"` y `grep -rc "cart_item"`.
**Impacto:** bajo-medio. Acorta el hallazgo con más valor del módulo.
**Recomendación:** si el piloto confirma que el caso B se resuelve en <10 min, mover los comandos a un bloque `<details>` de pista, como hace el Challenge 1 de M00. **Después del piloto.**

### 🟡-3 · P4 sin instrumento propio en el assessment

**Evidencia:** ningún ítem pide convertir un locator existente y medir el efecto; la tabla de trazabilidad lo mapea a A5 y E1.
**Impacto:** bajo. La evidencia existe en el Lab 3.
**Recomendación:** ajustar la matriz (P4 se evalúa por entregable) o añadir un sub-apartado a E1. **Después.**

### 🟡-4 · A2 y A7 son mayoritariamente memorizables

**Evidencia:** A2 pide contrastar dos definiciones; A7 pide dos valores heredados.
**Impacto:** bajo: 24 de 30 puntos de la Parte A ya exigen decidir.
**Recomendación:** añadir una cláusula de decisión a cada una en la siguiente edición. **Después.**

### 🟡-5 · Riesgo de que `locator-reference.md` se lea como chuleta

**Evidencia:** el documento contiene las conclusiones concretas de SauceDemo (títulos sin heading, 0 `<label>`, `data-test`), que son locales.
**Impacto:** bajo si el formador lo trabaja; medio si el alumno estudia solo.
**Recomendación:** pregunta de cierre en la puesta en común del Lab 3: *"¿qué tres filas cambiarían en la aplicación del cliente?"*. Una línea en el plan de sesión. **Ahora o después, indistinto.**

## 🟢 OK — 12 comprobaciones sin acción

| # | Comprobación | Estado |
|---|---|---|
| 1 | Progresión FOLLOW → MODIFY → CREATE → TROUBLESHOOT → DESIGN completa y con curva de ayuda decreciente | 🟢 |
| 2 | Assessment más difícil que los Labs en los cinco pares comparados | 🟢 |
| 3 | Ningún ítem evalúa contenido no enseñado | 🟢 |
| 4 | Penalizaciones que cubren los tres atajos previsibles (`expect`, `.first()`, cambiar de usuario) | 🟢 |
| 5 | Todos los ejemplos declarados "reales" están en el repositorio o medidos | 🟢 |
| 6 | No se ha colado contenido de M02-M09 | 🟢 |
| 7 | Los defectos del repositorio se conservan (`pages/cart.page.ts` intacto) | 🟢 |
| 8 | El sandbox de M00 sigue dando 7 failed / 13 passed tras la introducción del de M01 | 🟢 |
| 9 | 0 enlaces rotos | 🟢 |
| 10 | Material del formador con comprobación de entorno previa y previsión de bloqueos | 🟢 |
| 11 | Lab 6 declarado no validado en enunciado y en solución, sin inventar resultados | 🟢 |
| 12 | El material del alumno es autosuficiente: README + teoría + Labs + Challenge + assessment, sin conocimiento implícito del formador | 🟢 |

---

# 15. Veredicto final

# ✅ PROCEED WITH IMPROVEMENTS

**Motivo.**

**[I]** M01 **sí** prepara a un QA para el siguiente nivel de Playwright. Las tres razones, por orden de peso:

1. **Enseña criterio, no sintaxis.** El entregable central del módulo es una tabla de decisiones escritas (`03-decisiones.md`), no un fichero de tests. Ningún elemento del Lab 3 se resuelve leyendo la documentación de Playwright: hay que medir contra la aplicación. El objetivo P3 está redactado para penalizar la variedad sin criterio, y la corrección lo respeta.
2. **La progresión de autonomía es real y verificable.** La curva de ayuda decrece de forma continua (Lab 1 con seis pasos literales → Challenge sin ninguno) y el assessment es más duro que los Labs en los cinco pares comparados. No hay ningún nivel artificialmente fácil ni ningún salto que el plan de sesión no cubra.
3. **El material es honesto con lo que no sabe.** El Lab 6 declara que codegen no está validado y su solución se niega a rellenar el hueco; K1 (entorno del cliente) aparece en el README del módulo y en la primera sección del plan de sesión. Un material que documenta sus huecos es un material que se puede impartir con seguridad.

**Por qué no es PROCEED a secas.** Hay **dos gaps IMPORTANT**, ambos de coherencia y ambos baratos: el objetivo P8 depende de un entregable que ningún criterio de superación exige, y el Challenge admite copiar su mitad mecánica de un fichero de lectura obligatoria sin declararlo. Ninguno invalida el módulo; los dos deberían resolverse antes de la primera edición porque afectan a **qué se certifica**, no a qué se enseña.

**Por qué no es HOLD.** No hay ningún BLOCKER. Los objetivos están enseñados, practicados y —salvo P8— evaluados; la progresión existe; el enfoque QA domina sobre el enfoque API; y todo lo que el material afirma como real está verificado contra el repositorio o medido contra la aplicación.

**Condición operativa que no depende de la pedagogía:** el módulo sigue dependiendo de **K1 (acceso a `saucedemo.com` y descarga de navegadores desde un equipo del cliente)**, que continúa **sin verificar**. Es un riesgo de entorno, no un gap pedagógico, y el plan de sesión lo trata como bloqueo previo a la convocatoria.

---

# 16. Recomendación sobre el siguiente paso

## 16.1 Qué corregir antes de M02

| Prioridad | Acción | Coste |
|---|---|---|
| 1 | **Gap 🟠-1**: decidir el estatus del Challenge (obligatorio para superar M01, o P8 no certificable en este módulo) y reflejarlo en `learning-objectives.md`, `README.md` y `assessment/README.md` | 2 líneas + una decisión de programa |
| 2 | **Gap 🟠-2**: añadir a AC6 la declaración de reutilización de `tests/checkout.spec.ts` | 1 línea en el Challenge + 1 fila de rúbrica |
| 3 | **K1**: ejecutar los tres comandos de comprobación en un equipo corporativo del cliente | Externo, bloqueante para impartir |
| 4 | **Lab 6**: validar `codegen` y completar su solución, o retirarlo del temario | 30 min de ejecución |

**[I]** Los cinco gaps 🟡 no bloquean nada y su mejor momento es la revisión posterior al piloto, con datos reales de tiempo y de dudas recurrentes.

## 16.2 Qué dejar intacto

- **El Lab 3 completo**, y en especial el bloque 3.3 (`getByLabel` sin código). Es el material más difícil de reproducir y el que más diferencia al programa de un curso genérico.
- **El Lab 5 y sus dos casos auténticos**, y muy especialmente el defecto de `pages/cart.page.ts`. Cualquier "arreglo" del repositorio destruye a la vez el Lab 5 y el núcleo de M02.
- **Las penalizaciones del assessment**, incluida la de −10 por sustituir `performance_glitch_user`.
- **La estructura de M00**, reutilizada tal cual: mismo formato de Lab, mismas tres reglas, mismas partes A/B/C. La carga cognitiva debe seguir yendo al contenido, no al formato.
- **Los 10 fallos intencionados y los 12 usos de `.cart_item`**: son el material de M02 y M04.

## 16.3 Qué analizar del proyecto antes de diseñar M02

Datos que M02 necesitará y que conviene medir en su fase de discovery *(esta revisión ha adelantado dos de ellos, por su relación directa con M01)*:

| # | Análisis pendiente | Por qué | Estado |
|---|---|---|---|
| 1 | **Inventario de uso de cada miembro de los 6 POM desde `tests/`** | Detectar más código de test no ejercitado, que es el tema central de M02 | **[H] Adelantado en esta revisión:** `cartItems` → **0 usos**; `MenuPage.open()` → 0 llamadas desde tests pero **sí** usada internamente por `logout()` y `resetAppState()` (no es un defecto). El resto tiene uso: `addToCart` 87, `cartBadge` 58, `navigate` 25, `login` 21 |
| 2 | **Verificar que la sustitución correcta de `.cart_item` es `[data-test="inventory-item"]`** | El ejercicio original de M02 rompería 5 specs | **[H] Confirmado:** el DOM real es `<div class="cart_item" data-test="inventory-item">`; medido en la validación técnica y reproducido en el Lab 5 |
| 3 | Recuento real de la cobertura duplicada (hallazgo A10 del `learning-path`: solape entre `add-tshirt-to-cart.spec.ts` e `inventory-add-to-cart.spec.ts`) | El `learning-path` lo da por hecho; conviene medirlo antes de construir un ejercicio sobre él | Pendiente |
| 4 | Reparto de aserciones dentro y fuera de los POM | M02 enseña que los POM no contienen aserciones; hay que comprobar si el proyecto lo cumple | Pendiente |
| 5 | Qué métodos de los POM encapsulan más de una acción (candidatos a discusión de diseño) | Base del ejercicio "¿qué pertenece al Page Object?" | Pendiente |
| 6 | Corregir la descripción del hallazgo A1 en el análisis de Fase 1 y en `learning-path.md` §02 | **[H]** Ambos siguen describiendo `.cart_item` como *"fuga del POM"* (`learning-path.md`, fila *Repository mapping* de M02: *"`CartPage.cartItems` sin usar mientras 4 specs usan `.cart_item` directamente"*), cuando la causa medida es la contraria y son **5** specs con 12 usos | ✅ **Resuelto (18/08/2026).** Corregido en `learning-path.md` §02 (nota de inventario medido: 0 usos de `cartItems`, 12 usos de `.cart_item` en **5** specs), en la fe de erratas de `phase-1-learning-lab-design.md` (incluida la fila de §12.2) y en la portada `learning/README.md` |

## 16.4 Cuál debería ser la siguiente fase exacta

**Fase 3D — Cierre de M01 y preparación de M02**, en este orden y sin construir nada de M02:

1. **Decisión de programa sobre los dos gaps 🟠** (Challenge obligatorio o P8 no certificable; declaración de reutilización). Es lo único que toca material de M01.
2. **Comprobación de K1 en un equipo del cliente.** Sin esto, ni M01 ni M02 son impartibles: los dos necesitan la aplicación real.
3. **Corrección documental del hallazgo A1** en `learning-path.md` y en el análisis de Fase 1 — punto 6 de la tabla anterior. Es prerrequisito del diseño de M02, porque su ejercicio principal está descrito al revés.
4. **Piloto de M01 con un grupo reducido** (2-4 personas, preferiblemente perfiles FOUNDATION), midiendo tiempo real por Lab y por ejercicio del assessment. Es la única forma de fijar las 12 h y de decidir sobre los gaps 🟡-2 y 🟡-4.
5. **Solo entonces, Fase 4A: discovery y diseño de M02**, incorporando los análisis 3, 4 y 5 de §16.3 y las lecciones del piloto.

**[I]** El orden importa: diseñar M02 antes de corregir el punto 3 reproduciría en el módulo siguiente una descripción del defecto que la validación técnica ya demostró falsa.

---

# Resumen de la revisión

| Concepto | Resultado |
|---|---|
| **Veredicto** | ✅ **PROCEED WITH IMPROVEMENTS** |
| 🔴 BLOCKERS | **0** |
| 🟠 IMPORTANT | **2** (P8 sin instrumento obligatorio · Challenge copiable sin declararlo) |
| 🟡 IMPROVEMENT | **5** (vocabulario *flaky* · `grep` regalados en Lab 5 · P4 sin ítem propio · A2/A7 memorizables · riesgo de chuleta en `locator-reference.md`) |
| 🟢 OK | **12 comprobaciones sin acción** |
| Objetivos 🟢 | 6 de 8 (P1, P2, P3, P5, P6, P7) |
| Objetivos 🟡 | 1 (P4) |
| Objetivos 🟠 | 1 (P8) |
| Ficheros analizados | **62**: 15 de M01, 9 de soluciones M01, 5 del sandbox M01, 12 de M00 + 7 de soluciones M00, 7 transversales, 1 plan de sesión, y del proyecto real 14 specs + 6 POM + `playwright.config.ts` + `package.json` + `tsconfig.json` |
| Carga cognitiva | 🟡 Elevada pero viable |
| Transferencia al trabajo real | 🟢 Alta en 8 de 9 competencias |
| Riesgo de "tutorial hell" | 🟢 Bajo, con dos puntos acotados y documentados |

## Confirmación de no modificación

**[H]** En esta fase **no se ha modificado ni creado ningún fichero salvo este informe**. No se ha tocado código del proyecto (`tests/`, `pages/`, `scripts/`, `specs/`, `playwright.config.ts`, `package.json`, `tsconfig.json`), ni material de M00 o M01, ni ningún documento transversal. Los gaps se documentan con su recomendación y **ninguno ha sido corregido**.

---

*Fase 3C. Revisión pedagógica del módulo 01, ejecutada el 18 de agosto de 2026 sobre la rama `docs/ruta-aprendizaje-playwright`. Todas las cifras proceden de lecturas y recuentos sobre el repositorio; los comandos de verificación están indicados junto a cada dato.*
