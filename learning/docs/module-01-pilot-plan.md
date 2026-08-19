# Plan de piloto — Módulo 01: Playwright Fundamentals

**Estado:** protocolo de medición. **No contiene resultados.** Se rellena durante y después del piloto.
**Fecha de redacción:** 18/08/2026 · **Fase:** cierre pre-piloto de M01 (Fase 3D)

> Este documento no modifica el diseño del módulo. Su única función es definir **qué se mide** para poder decidir después, con datos, sobre los cinco gaps 🟡 de la [revisión pedagógica](module-01-pedagogical-review.md) §16.1 y sobre la duración definitiva.

---

## 1. Objetivo

Comprobar, con alumnos reales y antes de impartir M01 a un grupo completo, tres cosas:

1. que **los tiempos estimados** del módulo se sostienen (las 12 h son una estimación de diseño, nunca medida);
2. que **los ocho objetivos P1-P8** producen la evidencia que el diseño dice que producen, en especial **P8**, que depende por completo del Challenge;
3. que los **cinco gaps 🟡** son realmente de bajo impacto, o no lo son.

El piloto **no** es una evaluación de los participantes. Su nota no cuenta.

## 2. Tamaño y composición

- **2-4 personas.** Menos de 2 no da contraste; más de 4 convierte la observación en gestión de aula.
- Preferiblemente perfiles **FOUNDATION** (el caso de referencia del [README del módulo](../modules/01-playwright-fundamentals/README.md)); si entra un BEGINNER, anotarlo, porque su tiempo no es comparable.
- **Trabajo individual, no en parejas**, aunque la sesión real sea en parejas: en pareja no se puede distinguir quién ha entendido qué.
- Un formador observando, sin impartir de más: si el formador rescata cada bloqueo, el piloto no mide el material.

## 3. K1 — `PENDIENTE — validación durante formación con el cliente`

**K1 no bloquea este piloto.** Por decisión de programa, el entorno corporativo se valida durante la propia formación con el cliente, no antes; el piloto interno se ejecuta en equipos del programa, donde el entorno ya funciona. La comprobación de entorno sigue siendo obligatoria en la sesión real y ya está definida en el plan de sesión; **no se duplica aquí**:

> [`learning/trainer/session-plans/session-03-module-01.md`](../trainer/session-plans/session-03-module-01.md) → sección *"⚠️ Antes de la sesión — comprobación de entorno OBLIGATORIA"*

Allí están los tres comandos, la tabla de interpretación de resultados y la casilla de estado donde se anota quién la ejecutó y cuándo. El resultado se registra en esa misma casilla, no en este documento.

## 4. Qué medir

Datos numéricos, uno por participante. Se anotan durante la sesión, no de memoria al final.

> **La plantilla operativa donde se anota todo esto es [`module-01-pilot-run-log.md`](module-01-pilot-run-log.md)**: reloj de sesión, ficha por participante, registro de bloqueos con tipo, desglose E1/E2 y la ficha de la sesión 6. Este documento define **qué** se mide y con qué umbral; el registro es **dónde** se apunta.

### 4.1 Tiempos

| Elemento | Estimación de diseño | Tiempo real | Desviación |
|---|---|---|---|
| Lectura de `theory.md` | 45 min | | |
| Lab 1 — La suite real | 45 min | | |
| Lab 2 — Por qué nadie espera | 45 min | | |
| Lab 3 — Elegir el locator correcto ⭐ | 60 min | | |
| Lab 4 — El test que falta | 60 min | | |
| Lab 5 — El test que a veces pasa | 50 min | | |
| Lab 5, **caso B aislado** (locator roto) | — | | *(dato clave para el gap 🟡-2)* |
| Challenge 1 *(entre las sesiones 5 y 6)* | 90 min | | |
| Assessment Parte A | 15 min | | |
| Assessment **E1** *(cronometrado aparte — F3)* | *sin desglose declarado* | | |
| Assessment **E2** *(cronometrado aparte — F3)* | *sin desglose declarado* | | |
| Assessment Parte B (E1 + E2) | 40 min | | |
| Assessment Parte C (defensa oral, sesión 6) | 5-10 min | | |
| **Total M01** (8 h dirigidas + 3 h personales + 1 h assessment) | **12 h** | | |

> **Riesgo nuevo que este piloto tiene que medir:** el calendario reordenado (F1 del dry-run) financia la sesión 6 eliminando el *Margen* de 45 min del trabajo personal. **El módulo se queda sin colchón.** Si la desviación de tiempo supera el umbral de §7, el margen hay que devolverlo.

Regla de anotación: **tiempo de reloj de principio a fin del ejercicio**, incluidos los bloqueos. El tiempo "limpio" no sirve para planificar una sesión.

### 4.2 Bloqueos y consultas

Una fila por evento, por participante:

| # | Participante | Lab / ejercicio | Minuto | Qué preguntó o dónde se atascó | ¿Se desbloqueó solo? | Minutos perdidos |
|---|---|---|---|---|---|---|

Métricas derivadas: consultas por participante, consultas por Lab, y **qué pregunta se repite** — una pregunta que hacen 3 de 4 participantes es un defecto del material, no del alumno.

### 4.3 Resultados

- Assessment: puntuación por parte y por ítem (A1-A8, E1, E2, D1), no solo el total.
- Challenge: cumplimiento de AC1-AC6 y presencia del `decisiones.md`.
- Labs: cuáles se completaron y cuáles se abandonaron. **El Lab 6 (codegen) queda fuera de este piloto:** sigue sin validarse la salida del generador.

### 4.4 Sesión 6 — experimento explícito

La sesión 6 nació al resolver F1 del dry-run y **no se ha impartido nunca**. Se mide como experimento, no como bloque consolidado: cuántos llegan con el Challenge completo, duración real de la revisión cruzada, duración de cada defensa de la Parte C, y si los 45 min del bloque 1 bastan para todas. Fichas en [`module-01-pilot-run-log.md`](module-01-pilot-run-log.md) §6.

## 5. Qué observar

Cualitativo, anotado en el momento y con cita literal cuando sea posible:

- en qué punto exacto aparece la cara de "no sé qué me están pidiendo";
- qué hace el alumno cuando un test se pone rojo: ¿lee el error, o cambia cosas hasta que pase?
- si usa el material de referencia como método (vuelve a los criterios) o como catálogo (copia la fila);
- qué vocabulario usa para describir lo que ha hecho — es el mejor indicador de si el concepto ha entrado;
- si pregunta por el proyecto real del cliente, y en qué momento (indica cuándo el ejemplo deja de bastarle).

## 6. Preguntas específicas que el piloto debe responder

Cada una con su evidencia observable y su umbral. Ninguna se responde por impresión general.

| # | Pregunta | Cómo se mide | Umbral de decisión |
|---|---|---|---|
| 1 | **¿Se evidencia realmente P8?** | ¿Existe el [Challenge](../modules/01-playwright-fundamentals/challenges/challenge-1-compra-completa.md) entregado con su `decisiones.md`? ¿Las justificaciones de locator, aserción y estructura son propias, o describen un test que ya existía? ¿La Parte C se defiende sobre ese documento? | Si alguien supera el assessment sin producir evidencia de diseño propio, P8 no está instrumentado y hay que revisar el criterio de superación |
| 2 | **¿El Challenge discrimina criterio frente a copia?** | Comparar los entregables entre sí y con `tests/checkout.spec.ts`. Leer el apartado obligatorio de reutilización (AC6). ¿Dos entregas distintas producen decisiones distintas? | Si 3 de 4 entregas son la misma estructura con los nombres cambiados y el apartado de reutilización está vacío o es genérico, el Challenge no discrimina |
| 3 | **¿A2 y A7 son demasiado memorísticos?** (gap 🟡-4) | Tasa de acierto de A2 y A7 frente a la media de la Parte A; y si el acierto correlaciona con haber hecho los Labs o solo con haber leído la teoría | Si A2 y A7 se aciertan muy por encima de la media y sin relación con los Labs, se les añade la cláusula de decisión prevista |
| 4 | **¿P4 queda suficientemente cubierto?** (gap 🟡-3) | ¿Hay evidencia de que el alumno **convierte** un locator y **razona el efecto**? Buscarla en el Lab 3, en A5 y en E1 | Si la única evidencia está en el Lab 3 y el assessment no la toca, se ajusta la matriz (P4 evaluado por entregable) o se amplía E1 |
| 5 | **¿`locator-reference.md` se usa como método o como chuleta?** (gap 🟡-5) | Observar cuándo se abre y qué se hace con él. Al cerrar el Lab 3, preguntar al grupo: *"¿qué tres filas cambiarían en la aplicación del cliente?"* | Si nadie sabe responder, el documento se está memorizando, no usando: la pregunta pasa a ser obligatoria en el plan de sesión |
| 6 | **¿Los `grep` del [Lab 5](../modules/01-playwright-fundamentals/labs/lab-5-troubleshoot.md) eliminan demasiado descubrimiento?** (gap 🟡-2) | Cronometrar el **caso B** por separado y observar si el alumno formula la hipótesis antes o después de ejecutar los `grep` que el enunciado le entrega | Si el caso B se resuelve en **menos de 10 min** y nadie formula hipótesis antes, los comandos pasan a un bloque `<details>` de pista |
| 7 | **¿Hace falta explicitar el término *flaky*?** (gap 🟡-1) | ¿Con qué palabras describe el alumno un test que unas veces pasa y otras no (Lab 2, reflexión 3; A3)? ¿Pregunta cómo se llama eso? | Si los participantes lo describen con rodeos o preguntan por el nombre, entra la frase prevista en `theory.md` §3 |

## 7. Criterios de éxito del piloto

El módulo se considera **validado para impartir** si:

- ningún participante **abandona** un Lab por bloqueo de material (el bloqueo de entorno se registra aparte: es K1, no diseño);
- la **desviación total de tiempo** frente a las 12 h estimadas es **≤ 25%**; por encima, se re-cronometra el módulo antes de convocar;
- **todos** los participantes entregan el Challenge con su `decisiones.md` — es el único instrumento de P8;
- ninguna pregunta se repite en **3 o más** participantes sin estar ya contestada en el material — con un piloto de 2-4 personas, léase según la **regla de muestras pequeñas** del [registro](module-01-pilot-run-log.md) §10.1;
- el assessment **discrimina**: no todos sacan lo mismo, y las diferencias son explicables por lo observado;
- **la sesión 6 se ejecuta en sus 60 min con todas las defensas hechas** — criterio nuevo, porque el bloque es nuevo.

Si falla el criterio de tiempo o el del Challenge, **el piloto se repite tras corregir**; no se da por bueno con una nota al pie.

## 8. Registro de incidencias

- **Durante la sesión:** una sola tabla compartida (§4.2), una fila por evento, escrita en el momento. Sin clasificar todavía.
- **Al cerrar cada Lab:** 5 minutos para pasar a limpio los eventos de ese Lab mientras se recuerdan.
- **Al cerrar el piloto:** clasificar cada incidencia en una de cuatro categorías, porque cada una va a un sitio distinto:

| Categoría | Ejemplo | Destino |
|---|---|---|
| **Entorno** | proxy, certificados, descarga de navegadores | Casilla K1 del [plan de sesión](../trainer/session-plans/session-03-module-01.md) |
| **Material** | enunciado ambiguo, paso que falta, enlace roto | Corrección directa del fichero de M01 |
| **Diseño** | el ejercicio no produce la evidencia esperada | Decisión sobre los gaps 🟡 |
| **Aplicación** | SauceDemo ha cambiado y un Lab ya no funciona | Riesgo K10 — verificación semanal |

Las incidencias de **Diseño** no se corrigen durante el piloto: se anotan. Cambiar el material a mitad invalida los tiempos de los participantes siguientes.

## 9. Qué pasa después

El piloto **cierra la fase de M01**. Su resultado alimenta, en este orden:

1. la decisión sobre los cinco gaps 🟡 ([revisión pedagógica](module-01-pedagogical-review.md) §16.1);
2. la fijación de la **duración definitiva** de M01, hoy provisional;
3. el **discovery de M02**, que hereda las lecciones del piloto además de los análisis 3, 4 y 5 de §16.3 de la revisión.

Nada de M02 se diseña antes de tener estos datos.
