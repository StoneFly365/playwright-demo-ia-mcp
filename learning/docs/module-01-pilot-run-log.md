# Registro de ejecución del piloto — Módulo 01

**Qué es:** la plantilla operativa que el formador rellena **durante** el piloto.
**Qué no es:** un informe. No contiene resultados, conclusiones ni decisiones.
**Estado:** vacío. Todas las celdas de dato están sin rellenar a propósito.

El **protocolo** —qué se mide, por qué y con qué umbral— vive en [`module-01-pilot-plan.md`](module-01-pilot-plan.md). Este documento es solo el cuaderno. Si los dos discrepan, manda el plan.

---

# 0. NO INTERPRETAR DURANTE EL PILOTO

**Durante el piloto se registran hechos. No se decide nada.**

| Se anota | No se hace |
|---|---|
| Lo que ocurrió, con su hora y su duración | Explicar por qué ocurrió |
| La frase literal que dijo el participante | Resumirla en "no entendió el Lab 3" |
| Que tres personas preguntaron lo mismo | Reescribir el enunciado a media sesión |
| Que el Lab 3 tardó X minutos | Concluir que hay que recortarlo |

**Cambiar el material a mitad del piloto invalida los tiempos de los participantes que vengan después.** Si detectas algo mejorable, va a §11 como `OBSERVACIÓN — VALIDAR CON DATOS` y ahí se queda.

**Única excepción:** una contradicción o un fallo que **impida continuar** (un enlace roto que corta un paso, un comando que no existe, un fichero que falta). En ese caso: se aplica el arreglo mínimo, se anota en §11 con la etiqueta `PARCHE DE EJECUCIÓN`, y se registra **a partir de qué participante** dejó de aplicarse la versión original. Sin esa nota, los tiempos anteriores y posteriores no son comparables.

## Separación de conceptos

Cada anotación se etiqueta con una de estas cuatro. No se mezclan.

| Etiqueta | Qué es | Ejemplo |
|---|---|---|
| **HECHO** | Algo que ocurrió y viste | *"P2 abrió `locator-reference.md` en el minuto 12 del Lab 3"* |
| **DATO** | Una medida con unidad | *"Lab 3: 78 min"* |
| **INTERPRETACIÓN** | Lectura del hecho, marcada como tal | *"parece que lo usa como catálogo"* |
| **HIPÓTESIS** | Explicación que habría que comprobar | *"quizá el bloque 3.3 sin código descoloca"* |

**DECISIÓN** no aparece en este documento. Las decisiones se toman en el análisis posterior, no aquí.

---

# 1. Cómo se usa

- **Identificadores, no nombres.** Los participantes son **P1, P2, P3, P4**. Su correspondencia con personas reales **no se escribe aquí**: la guarda el formador aparte. Nada de nombres, correos, `hostname`, IPs ni rutas de usuario.
- **Se anota en el momento.** Al cerrar cada Lab, 5 minutos para pasar a limpio.
- **Reloj de pared.** Duración = fin − inicio, **bloqueos incluidos**. El tiempo "limpio" no sirve para planificar una sesión.
- **Tiempo de actividad ≠ tiempo de formador.** Un bloque de teoría o una puesta en común **no** cuentan como tiempo de Lab. Se registran en su propia fila (§2).
- **Celda vacía = no medido.** Nunca se rellena con una estimación. Si no se midió, se escribe `—`.

---

# 2. Reloj de sesión

Una fila por sesión. Esto es lo que permite reconstruir el total real de las 12 h, que **no** es la suma de los tiempos de Lab.

| Sesión | Fecha | Hora inicio | Hora fin | Duración real | Duración prevista | Asistentes | Incidencias de arranque |
|---|---|---|---|---|---|---|---|
| **3** — Labs 1 y 2 | | | | | 180 min | | |
| **4** — Teoría B, Lab 3, arranque Lab 4 | | | | | 150 min | | |
| **5** — Lab 5 y lanzamiento del Challenge | | | | | 90 min | | |
| **6** — Revisión cruzada + Parte C 🆕 | | | | | 60 min | | |
| **Assessment** — Partes A y B | | | | | 60 min | | |

## 2.1 Desglose de bloques no-Lab

Tiempo del formador, separado del tiempo de ejercicio.

| Sesión | Bloque | Previsto | Real | Se alargó / acortó por |
|---|---|---|---|---|
| 3 | Apertura | 15 | | |
| 3 | Puesta en marcha (navegadores, entorno) | 15 | | |
| 3 | Teoría A (§1-4) | 25 | | |
| 3 | Puesta en común Lab 1 | 10 | | |
| 3 | Puesta en común Lab 2 | 10 | | |
| 4 | Dudas | 10 | | |
| 4 | Teoría B (§5-12) | 30 | | |
| 4 | Puesta en común Lab 3 | 15 | | |
| 5 | Revisión del Lab 4 | 15 | | |
| 5 | Puesta en común Lab 5 | 20 | | |
| 5 | Lanzamiento del Challenge | 5 | | |
| 6 | Puesta en común y cierre | 10 | | |

---

# 3. Ficha por participante

**Duplicar esta ficha una vez por participante (P1…P4).** Se rellena una fila por actividad.

## Ficha — participante `P_`

**Perfil de entrada:** ☐ BEGINNER ☐ FOUNDATION ☐ INTERMEDIATE ☐ ADVANCED · *(del resultado de M00)*
**Nota:** si no es FOUNDATION, sus tiempos **no son comparables** con los de referencia. Anotarlo aquí y recordarlo en el agregado.

| # | Actividad | Inicio | Fin | Duración | de la cual: lectura | de la cual: bloqueado | Ayuda del formador (min) | ¿Completada? | Resultado / entregable | 🟡 rel. | Observaciones (HECHO / cita literal) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Lectura previa `theory.md` *(personal)* | | | | | | | | — | | |
| 2 | Lab 1 — La suite real | | | | | | | | `01-ejecuciones.md` | | |
| 3 | Lab 2 — Auto-waiting | | | | | | | | `02-conclusiones.md` + tests | 🟡-1 | |
| 4 | **Lab 3 — Locators** ⭐ | | | | | | | | `03-decisiones.md` + ≥6 tests | 🟡-3, 🟡-5 | |
| 4a | └ Lab 3, bloque 3.3 *(sin código)* | | | | | | | | 4 respuestas | | |
| 4b | └ Lab 3, bloque 3.6 *(acotar)* | | | | | | | | test en verde | | |
| 5 | Lab 4 — El test que falta | | | | | | | | 2 tests ×3 navegadores | | |
| 5a | └ Lab 4, Paso 3 *(hueco propio)* | | | | | | | | hueco + riesgo justificado | | |
| 6 | Lab 5 — Diagnóstico | | | | | | | | `05-diagnostico.md` + 2 verdes | | |
| 6a | └ **Lab 5, caso A** | | | | | | | | | | |
| 6b | └ **Lab 5, caso B** *(dato clave)* | | | | | | | | | **🟡-2** | ¿formuló hipótesis **antes** de los `grep`? ☐ sí ☐ no |
| 7 | **Challenge** *(personal, entre S5 y S6)* | | | | | | | | spec + `decisiones.md` | | |
| 8 | Assessment Parte A | | | | | | | | A1-A8 | 🟡-4 | |
| 9 | **Assessment E1** | | | | | | | | `assessment-e1.spec.ts` | **F3** | → ficha §5.1 |
| 10 | **Assessment E2** | | | | | | | | `assessment-e2.spec.ts` + informe | **F3** | → ficha §5.2 |
| 11 | **Parte C** *(sesión 6)* | | | | | | | | apto / no apto | | → ficha §6.2 |

**Total de reloj del participante:** ________ (suma de las duraciones + bloques no-Lab a los que asistió)
**Frente a las 12 h previstas:** desviación ________ %

---

# 4. Registro de bloqueos

**Una fila por evento**, en el momento en que ocurre. Sin clasificar la causa: solo lo que se ve.

| # | Part. | Sesión | Actividad | Paso / bloque | Descripción (HECHO, cita literal si la hay) | Duración (min) | Tipo | ¿Intervino el formador? | Solución aplicada | ¿Previsto en el material? |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | | | | | | | | ☐ sí ☐ no | | ☐ sí ☐ no ☐ n/a |
| 2 | | | | | | | | ☐ sí ☐ no | | ☐ sí ☐ no ☐ n/a |
| 3 | | | | | | | | ☐ sí ☐ no | | ☐ sí ☐ no ☐ n/a |

*(añadir filas)*

## Tipos de bloqueo

| Código | Tipo | Qué significa |
|---|---|---|
| **T** | Técnico | El comando falla, el test no arranca, algo del stack no funciona |
| **C** | Conceptual | Entiende lo que le piden y no sabe cómo hacerlo |
| **A** | Instrucción ambigua | No entiende **qué** le piden. *Este es el que corrige material* |
| **E** | Entorno | Red, proxy, certificados, navegadores. **Va a K1, no a diseño** |
| **P** | Tiempo | No se atasca: no le da tiempo |
| **O** | Otro | Con explicación obligatoria |

## Columna "¿Previsto en el material?"

El plan de sesión tiene una tabla *"Qué va a pasar (previsión)"* con 13 filas. Si el bloqueo está ahí → **sí**. Si no está → es un descubrimiento del piloto y vale más que los demás.

---

# 5. F3 — Parte B del assessment, medida por partes

**Regla:** E1 y E2 se cronometran **por separado**. El tiempo total de la Parte B no sirve para responder F3.

> **Estado previo (no es un dato):** el enunciado declara 40 min para E1+E2. El dry-run documental estimó 50-70 min. Eso es una **HIPÓTESIS**, no una medida. No se decide nada hasta tener las filas de abajo rellenas.

## 5.1 E1 — Escribir (40 p)

| Participante | P1 | P2 | P3 | P4 |
|---|---|---|---|---|
| Inicio | | | | |
| Fin | | | | |
| **Duración** | | | | |
| % completado al agotar el tiempo | | | | |
| ¿Llega a verde? | | | | |
| Nº de bloqueos | | | | |
| Min. de ayuda del formador | | | | |
| ¿Deduce el producto más barato, o lo escribe a mano? | | | | |
| Nº de estrategias de locator usadas | | | | |
| ¿Cada una lleva su comentario de criterio? | | | | |
| Calidad de las justificaciones *(sólida / genérica / ausente)* | | | | |
| Errores observados | | | | |

## 5.2 E2 — Diagnosticar (30 p)

| Participante | P1 | P2 | P3 | P4 |
|---|---|---|---|---|
| Inicio | | | | |
| Fin | | | | |
| **Duración total E2** | | | | |
| └ Caso 1 — diagnóstico | | | | |
| └ Caso 1 — corrección | | | | |
| └ Caso 2 — diagnóstico | | | | |
| └ Caso 2 — corrección | | | | |
| ¿Escribe el informe **antes** de corregir? | | | | |
| Casilla "Comprobación" con ejecución real | | | | |
| Nº de bloqueos | | | | |
| Min. de ayuda del formador | | | | |
| Calidad del informe *(causa raíz / síntoma)* | | | | |
| ¿Los 2 tests en verde? | | | | |
| Penalizaciones aplicadas | | | | |

## 5.3 Cierre de F3

| Dato agregado | Valor |
|---|---|
| E1 — mediana / rango | |
| E2 — mediana / rango | |
| **E1 + E2 — mediana / rango** | |
| Declarado en el enunciado | **40 min** |
| ¿Alguien terminó dentro de los 40 min? | |
| ¿Alguien entregó incompleto por tiempo? | |

**No escribir aquí ninguna conclusión.** El umbral y la decisión se aplican en el análisis posterior.

---

# 6. Sesión 6 — experimento explícito

La sesión 6 es **material nuevo, sin rodar**. Nació al resolver F1 del dry-run y nadie la ha impartido nunca. Se mide como experimento, no como bloque consolidado.

## 6.1 Bloque 1 — revisión cruzada (45 min previstos)

| Dato | Valor |
|---|---|
| Participantes que llegan con el Challenge **completo** | ___ / ___ |
| Participantes que llegan **sin** el Challenge completo | ___ / ___ |
| Motivo declarado por quien no lo trae | |
| Hora de inicio / fin del bloque | |
| **Duración real** | |
| ¿La revisión cruzada se agota antes de los 45 min? | ☐ sí, en el min ___ ☐ no |
| ¿Quedan defensas sin hacer al terminar? | ☐ sí, ___ personas ☐ no |

### Cómo se organiza la revisión cruzada según el número de participantes

La revisión cruzada es **por parejas**, y **cada participante revisa el `decisiones.md` de otro participante**. No hay que deducir nada:

| Participantes | Organización |
|---|---|
| **2** | Una pareja. P1 revisa el de P2 y P2 el de P1 |
| **3** | Una pareja (P1 ↔ P2) y **el formador hace de tercer revisor** del de P3. P3 revisa el de P1 o el de P2 — el que elija el formador |
| **4** | **Dos parejas**: P1 ↔ P2 y P3 ↔ P4. Cada participante revisa el Challenge de **un** compañero. El formador no revisa: queda libre para las defensas |

**Registrar siempre:**

| Campo | Anotación |
|---|---|
| Parejas formadas | |
| ¿Intervino el formador como revisor? | ☐ sí, del de P___ ☐ no |
| ¿Hubo que **redistribuir** parejas? | ☐ sí ☐ no |
| Motivo de la redistribución *(falta un `decisiones.md`, ausencia, nivel muy dispar, otro)* | |

Anotarlo importa: cambia el tiempo del bloque y, si el formador tiene que revisar, le quita minutos de defensa.

## 6.2 Parte C — una fila por participante

| Part. | Inicio | Fin | **Duración** | ¿Defiende sobre el `decisiones.md` del Challenge? | Nivel según rúbrica *(Sólido / Adquirido / No demostrado)* | Apto | Cita literal de la respuesta a la pregunta 1 |
|---|---|---|---|---|---|---|---|
| P1 | | | | ☐ sí ☐ no, usó el Lab 3 | | ☐ | |
| P2 | | | | ☐ sí ☐ no, usó el Lab 3 | | ☐ | |
| P3 | | | | ☐ sí ☐ no, usó el Lab 3 | | ☐ | |
| P4 | | | | ☐ sí ☐ no, usó el Lab 3 | | ☐ | |

**Suma del tiempo de defensa:** ______ min · **Previsto:** 5-10 min × participante, dentro de los 45 del bloque 1.

## 6.3 ¿La revisión cruzada aporta algo?

Evidencia observable, no impresión:

| Pregunta | Cómo se responde | Anotación |
|---|---|---|
| ¿Alguien **cambia o matiza** su justificación después de leer la del compañero? | Frase literal antes / después | |
| ¿Alguien encuentra en el `decisiones.md` ajeno una decisión que no se le había ocurrido? | Cita | |
| ¿La revisión cruzada **calienta** la Parte C, o la sustituye? | ¿Repite en la defensa lo que acaba de leer del compañero? | |
| ¿45 min son suficientes? | Duración real vs defensas pendientes (§6.1) | |

---

# 7. Los cinco 🟡

**Los indicadores y los umbrales son exactamente los de [`module-01-pilot-plan.md`](module-01-pilot-plan.md) §6, filas 3-7. Aquí no se redefinen: aquí se registra la evidencia.**

## 🟡-1 · Vocabulario *flaky* — plan §6, fila 7

| Campo | Registro |
|---|---|
| Evidencia observada *(palabras literales al describir un test que unas veces pasa y otras no)* | |
| Participantes afectados | |
| Frecuencia | ___ / ___ |
| Ejemplo concreto (cita) | |
| ¿Alguien pregunta cómo se llama? | ☐ sí, P___ ☐ no |
| Momentos observados | ☐ Lab 2 reflexión 3 ☐ A3 ☐ otro: |
| INTERPRETACIÓN *(marcada como tal, opcional)* | |

## 🟡-2 · Los `grep` del Lab 5 — plan §6, fila 6

| Campo | Registro |
|---|---|
| **Duración del caso B por participante** | P1 ___ · P2 ___ · P3 ___ · P4 ___ |
| ¿Formuló hipótesis **antes** de ejecutar los `grep`? | P1 ☐ · P2 ☐ · P3 ☐ · P4 ☐ |
| ¿Ejecutó los `grep` del enunciado tal cual, o buscó por su cuenta? | |
| Ejemplo concreto | |
| INTERPRETACIÓN | |

## 🟡-3 · P4 sin ítem propio — plan §6, fila 4

| Campo | Registro |
|---|---|
| ¿Hay en `03-decisiones.md` una **conversión** de locator con ganancia/pérdida razonada? | P1 ☐ · P2 ☐ · P3 ☐ · P4 ☐ |
| ¿Escribió el bloque 3.2, o se apoyó en el 3.1 ya resuelto? | |
| ¿Aparece esa evidencia en A5 o en E1? | |
| Ejemplo concreto | |
| INTERPRETACIÓN | |

## 🟡-4 · A2 y A7 memorísticos — plan §6, fila 3

| Ítem | P1 | P2 | P3 | P4 | Media |
|---|---|---|---|---|---|
| A1 (3 p) | | | | | |
| **A2 (4 p)** | | | | | |
| A3 (4 p) | | | | | |
| A4 (4 p) | | | | | |
| A5 (4 p) | | | | | |
| A6 (4 p) | | | | | |
| **A7 (4 p)** | | | | | |
| A8 (3 p) | | | | | |
| **Media de la Parte A** | | | | | |

| Campo | Registro |
|---|---|
| ¿Acierto de A2/A7 por encima de la media del resto? | |
| ¿Correlaciona con haber hecho los Labs, o solo con haber leído la teoría? *(cruzar con §3, actividad 1 y 3)* | |
| Ejemplo concreto | |
| INTERPRETACIÓN | |

## 🟡-5 · `locator-reference.md` como chuleta — plan §6, fila 5

| Campo | Registro |
|---|---|
| Momento en que lo abre cada participante | P1 ___ · P2 ___ · P3 ___ · P4 ___ |
| ¿Vuelve a los **criterios**, o copia la **fila**? | |
| **Pregunta de cierre del Lab 3:** *"¿qué tres filas cambiarían en la aplicación del cliente?"* — respuestas literales | |
| Nº de participantes que saben responder | ___ / ___ |
| Ejemplo concreto | |
| INTERPRETACIÓN | |

---

# 8. Entregables y resultados

## 8.1 Entregables por participante

| Entregable | P1 | P2 | P3 | P4 |
|---|---|---|---|---|
| `01-ejecuciones.md` | | | | |
| `02-conclusiones.md` | | | | |
| **`03-decisiones.md`** — nº de filas (de 12) | | | | |
| `04-cobertura.spec.ts` — nº de tests | | | | |
| `05-diagnostico.md` — 2 casos completos | | | | |
| **Challenge** — spec entregado | | | | |
| **Challenge** — `decisiones.md` entregado | | | | |
| AC1 · AC2 · AC3 · AC4 · AC5 · AC6 | | | | |
| ¿Incluye la declaración de reutilización (AC6)? | | | | |
| ¿Incluye "qué NO he automatizado"? | | | | |

## 8.2 Notas del assessment

| | P1 | P2 | P3 | P4 |
|---|---|---|---|---|
| Parte A (30) | | | | |
| E1 (40) | | | | |
| E2 (30) | | | | |
| **Total (100)** | | | | |
| Penalizaciones aplicadas | | | | |
| Parte C (apto / no apto) | | | | |

## 8.3 Integridad del repositorio

Al cerrar cada sesión, por participante:

```bash
git diff --stat -- tests/ pages/ scripts/ prompts/ specs/ .github/ playwright.config.ts package.json
# debe estar vacío
```

| Participante | S3 | S4 | S5 | S6 | ¿Alguien tocó `pages/cart.page.ts`? |
|---|---|---|---|---|---|
| P1 | | | | | |
| P2 | | | | | |
| P3 | | | | | |
| P4 | | | | | |

---

# 9. K1 — no se registra aquí

**K1 no forma parte de este piloto.** Su estado es `PENDIENTE — validación durante formación con el cliente` y se valida en la propia formación con el cliente, en una **máquina corporativa del cliente**.

Su casilla de registro es única y está en el plan de sesión — [`session-03-module-01.md`](../trainer/session-plans/session-03-module-01.md), sección *"⚠️ Antes de la sesión — comprobación de entorno OBLIGATORIA"*. Allí están los tres comandos y la tabla de interpretación. **No se duplican aquí para que no existan dos versiones del estado de K1.**

Cuando llegue el momento, se anota en esa casilla: comando, salida relevante, fecha, si es entorno corporativo del cliente, proxy/red si procede, y `PASS` / `FAIL`.

> **Ninguna ejecución del equipo de desarrollo del programa es un PASS de K1.** Si el piloto interno se ejecuta en máquinas del programa, sus bloqueos de entorno se etiquetan **E** en §4 y **no** cambian el estado de K1.

---

# 10. Agregado — solo al cerrar el piloto

## 10.1 Regla de lectura con muestras pequeñas

**El piloto es de 2-4 personas. No produce estadística.** Para no fabricar significación donde no la hay:

| Regla | |
|---|---|
| **1** | Los umbrales del plan expresados en absolutos ("3 o más participantes", "3 de 4 entregas") se leen como **mayoría de los participantes reales**: con n=2, los dos; con n=3, dos; con n=4, tres |
| **2** | Un solo participante **nunca** confirma un 🟡 por sí solo, pero **sí** es suficiente para registrar una HIPÓTESIS que la siguiente edición debe vigilar |
| **3** | No se calculan medias con n<3. Se listan los valores individuales y el rango |
| **4** | Un participante con perfil distinto de FOUNDATION se excluye de las comparaciones de tiempo y se dice explícitamente |
| **5** | Ningún dato del piloto se presenta como "medido en el grupo" si viene de una sola observación |

## 10.2 Tiempos agregados

| Actividad | Previsto | Valores individuales | Rango | Desviación |
|---|---|---|---|---|
| `theory.md` | 45 min | | | |
| Lab 1 | 45 min | | | |
| Lab 2 | 45 min | | | |
| **Lab 3** | 60 min | | | |
| Lab 4 | 60 min | | | |
| **Lab 5** | 50 min | | | |
| └ Lab 5, caso B | — | | | |
| **Challenge** | 90 min | | | |
| Parte A | 15 min | | | |
| **E1** | *(sin desglose declarado)* | | | |
| **E2** | *(sin desglose declarado)* | | | |
| **E1 + E2** | **40 min** | | | |
| Parte C | 5-10 min | | | |
| **Total por participante** | **12 h** | | | |

## 10.3 Bloqueos agregados

| Métrica | Valor |
|---|---|
| Bloqueos totales | |
| Por tipo: T / C / **A** / E / P / O | |
| Actividad con más bloqueos | |
| Bloqueos que exigieron intervención del formador | |
| **Preguntas repetidas por la mayoría de participantes** *(regla 1)* | |
| Bloqueos **no previstos** en la tabla del plan de sesión | |
| Minutos totales perdidos en bloqueos | |

## 10.4 Criterios de éxito — [plan §7](module-01-pilot-plan.md)

Marcar solo con la evidencia delante. **Sin evidencia, se deja en blanco; no se marca "sí" por impresión.**

| # | Criterio | ¿Se cumple? | Evidencia (referencia a la sección de este registro) |
|---|---|---|---|
| 1 | Nadie abandona un Lab por bloqueo **de material** | | |
| 2 | Desviación total de tiempo ≤ 25% | | |
| 3 | **Todos** entregan el Challenge con su `decisiones.md` | | |
| 4 | Ninguna pregunta se repite en la mayoría *(regla 1)* sin estar contestada en el material | | |
| 5 | El assessment discrimina y las diferencias son explicables | | |
| 6 🆕 | La sesión 6 se ejecuta en sus 60 min con todas las defensas hechas | | |

---

# 11. Observaciones — VALIDAR CON DATOS

Cosas detectadas **antes** de ejecutar el piloto. **Ninguna se ha corregido**: son hipótesis a contrastar, no defectos confirmados. Se rellena la columna de la derecha al cerrar.

| # | Observación | Origen | Estado | Qué dijo el piloto |
|---|---|---|---|---|
| **O-1** | El Lab 3 podría no caber en 60 min (estimación documental: 75-95) | Dry-run | HIPÓTESIS | |
| **O-2** | E1+E2 podrían no caber en 40 min (estimación: 50-70) — **es F3** | Dry-run | HIPÓTESIS | |
| **O-3** | El Challenge a 90 min podría seguir siendo corto (estimación: 90-120) | Dry-run | HIPÓTESIS | |
| **O-4** | La Parte A son 8 preguntas en 15 min ≈ 1 min 50 s cada una | Dry-run | HIPÓTESIS | |
| **O-5** | El calendario nuevo eliminó el *Margen* de 45 min: el módulo se queda sin colchón | F1 | HIPÓTESIS | |
| **O-6** | La sesión 6 no se ha impartido nunca | F1 | SIN RODAR | |
| **O-7** | El Lab 4 recibe 20 min de sesión y 45 personales, para un ejercicio CREATE con un paso abierto | Revisión pedagógica §5 | HIPÓTESIS | |
| **O-8** | Lab 1 dice *"los 12 scripts de `package.json`"*; hay **11** | Dry-run (medido) | HECHO documental, no bloquea | |
| **O-9** | La comprobación anti-trampa del Lab 5 (`git diff \| grep "expect("`) depende de que la aserción esté partida en varias líneas | Dry-run | HECHO, requiere revisión a ojo | |
| **O-10** | El plan §2 pide trabajo **individual**; la sesión 6 es **por parejas**. Con 3 participantes hay un impar | Esta inspección | HECHO, resuelto en §6.1 como nota de ejecución | |
| **O-11** | El Lab 6 (codegen) queda **fuera** del piloto: la salida del generador sigue sin validarse | F5 | DECIDIDO antes del piloto | — |

---

# 12. Checklist del formador

## Antes del piloto

- [ ] Los 2-4 participantes tienen **M00 cerrado y corregido**, y su perfil de entrada anotado en §3
- [ ] **Preflight del entorno**, en la máquina donde se imparte:
  ```bash
  npm ci
  npx playwright install
  npm run test:chromium                                                              # 69 passed, 10 failed
  npx playwright test -c learning/student/sandbox/01-playwright --project=chromium    # 4 passed, 2 failed
  ```
  Si el sandbox no da exactamente **4 passed / 2 failed**, algo se ha tocado antes de tiempo: **no empezar**
- [ ] **Resultado del preflight anotado aquí mismo**, con fecha:

| Comprobación | Fecha | Resultado | Esperado |
|---|---|---|---|
| `npm ci` | | | termina sin error |
| `npx playwright install` | | | termina sin error |
| `npm run test:chromium` | | | 69 passed, 10 failed |
| Sandbox M01 `--project=chromium` | | | 4 passed, 2 failed |

> **VERIFICACIÓN TÉCNICA — NO ES K1.** Ninguna de estas cuatro ejecuciones cambia el estado de K1, que sigue `PENDIENTE — validación durante formación con el cliente`. Tampoco son datos del piloto: no se vuelcan a §10.
- [ ] Cada participante ha ejecutado `npx playwright install` en su equipo **antes** de la sesión 3 (~500 MB)
- [ ] Cronómetro y este registro abiertos. Un reloj por participante, no uno para el aula
- [ ] Copiar la ficha de §3 tantas veces como participantes
- [ ] Leídas las 13 filas de *"Qué va a pasar (previsión)"* del plan de sesión — es lo que rellena la columna *"¿Previsto?"* de §4
- [ ] **El Lab 6 no se propone**
- [ ] Decidido quién observa: si el formador imparte y observa a la vez, los tiempos se degradan. Con 4 participantes, conviene una segunda persona anotando

### Material accesible

- [ ] **Material de M01 accesible a los participantes:** README del módulo, `theory.md`, los cinco Labs, `repository-mapping.md` y `locator-reference.md`
- [ ] **Enunciado del Challenge accesible**, para poder entregarlo en el bloque 4 de la sesión 5
- [ ] **Assessment preparado** (partes A y B). **La clave de corrección NO se comparte con el grupo, nunca**
- [ ] **El Lab 6 no se propone** *(ya listado arriba; se repite porque es el olvido más fácil)*

### Calendario y tiempo del formador

- [ ] **Sala y hueco reservados para la sesión 6** (60 min). Es sesión nueva y es la que se cae al planificar
- [ ] **Tiempo del formador reservado para la Parte C:** 5-10 min × participante, **dentro** del bloque 1 de la sesión 6. Con 2-4 personas caben todas; reservarlo igualmente
- [ ] Ventana de trabajo personal entre la sesión 5 y la 6 comunicada al grupo (Challenge, 90 min)

### K1 — localizado, no ejecutado

- [ ] **Procedimiento K1 localizado**: [`session-03-module-01.md`](../trainer/session-plans/session-03-module-01.md) → *"⚠️ Antes de la sesión — comprobación de entorno OBLIGATORIA"*
- [ ] Entendido que **K1 no forma parte de este piloto interno**: no se ejecuta aquí, no se declara aquí, y sigue `PENDIENTE — validación durante formación con el cliente`. Los bloqueos de entorno del piloto se etiquetan **E** en §4 y no tocan su estado

### Protección de datos

- [ ] Ningún dato personal en este registro: solo `P1…P4`. Sin nombres, correos, `hostname`, IPs ni rutas de usuario. La correspondencia con personas reales la guarda el formador **fuera** de este fichero

## Durante cada sesión

- [ ] Reloj de sesión anotado al empezar y al terminar (§2)
- [ ] Un bloqueo = una fila en §4, **en el momento**
- [ ] Al cerrar cada Lab: 5 min para pasar a limpio y anotar la duración
- [ ] **No rescatar de inmediato.** Dejar que el participante se atasque el tiempo que el material espera que se atasque; anotar cuánto
- [ ] **No cambiar material.** Lo mejorable va a §11
- [ ] `git diff --stat -- tests/ pages/` al cerrar (§8.3)

## Momentos que no se pueden dejar pasar

- [ ] **Lab 5, caso B:** cronometrarlo aparte y anotar si formuló hipótesis **antes** de los `grep` *(🟡-2)*
- [ ] **Cierre del Lab 3:** preguntar *"¿qué tres filas de `locator-reference.md` cambiarían en la aplicación del cliente?"* y anotar las respuestas literales *(🟡-5)*
- [ ] **Lab 2, reflexión 3 y A3:** anotar las palabras exactas con que describe un test intermitente *(🟡-1)*
- [ ] **Assessment:** cronometrar **E1 y E2 por separado** *(F3)*
- [ ] **Sesión 6:** contar quién llega con el Challenge completo, y si quedan defensas pendientes al minuto 45

## Al cerrar el piloto

- [ ] §10 rellenado, aplicando la regla de lectura de §10.1
- [ ] Cada incidencia clasificada en Entorno / Material / Diseño / Aplicación ([plan §8](module-01-pilot-plan.md))
- [ ] Columna *"Qué dijo el piloto"* de §11 rellenada, incluidas las que el piloto **no** pudo responder
- [ ] Este registro cerrado **sin decisiones dentro**

**El análisis y las decisiones son la fase siguiente, y no se escriben en este documento.**
