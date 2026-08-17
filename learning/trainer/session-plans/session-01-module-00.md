# Sesiones 01 y 02 — Módulo 00: Fundamentos JS/TS para QA

**Duración:** 5 h dirigidas — sesión 1 de 3 h + sesión 2 de 2 h · **Formato:** presencial o remoto con pantalla compartida · **Grupo:** 8-12 personas en parejas

Entre las dos sesiones, ~3 h de trabajo personal. El assessment (45 min) se hace al final de la sesión 2 o de forma asíncrona. Desglose completo en el [README del módulo](../../modules/00-foundations/#duración).

---

## Antes de la sesión

- [ ] Pre-assessment corregido; mapa de niveles del grupo disponible
- [ ] Decisión tomada: módulo 00 **ampliado / completo / reducido** según la mediana
- [ ] Parejas formadas: cada BEGINNER/FOUNDATION con un INTERMEDIATE/ADVANCED
- [ ] Alumnos ADVANCED avisados de que se saltan el módulo (o vienen como mentores)
- [ ] Comprobación del entorno:

```bash
git pull && npm ci
npx playwright test -c learning/student/sandbox   # 7 failed, 13 passed
npx tsc --noEmit                                   # sin salida
```

- [ ] Verificado que todos los asistentes completaron el [checklist de instalación](../../docs/setup-guide.md)

## Guion — Sesión 1 (3 h)

| Bloque | Min | Nivel | Qué se hace |
|---|---|---|---|
| **1. Apertura** | 0-15 | — | Presentación del programa. Las tres reglas. Ver la suite real ejecutándose |
| **2. Teoría A** | 15-27 | — | Secciones 0-3: por qué esto, `const`/`let`, funciones, desestructuración |
| **3. Lab 1** | 27-57 | 1 FOLLOW | Lectura guiada + hoja de observación |
| **4. Puesta en común + defensa de 3 min** | 57-72 | — | Respuestas 1-6 en grupo. Defensas por parejas sobre `inventory.page.ts` (primer contacto con **O8**) |
| **Descanso** | 72-82 | | |
| **5. Teoría B** | 82-94 | — | Secciones 4-5: arrays y **las dos trampas de `sort()`** |
| **6. Lab 2** | 94-124 | 2 MODIFY | Ordenación parametrizada |
| **7. Puesta en común** | 124-136 | — | Comparar dos soluciones distintas. Discutir el dato `$100.00` |
| **8. Teoría C** | 136-151 | — | Secciones 6-9: clases, `readonly` y lo que **no** protege, módulos, `async`/`await`, tipos |
| **9. Lab 3** | 151-171 | 3 CREATE | Arranque guiado (se termina fuera de sesión) |
| **10. Cierre** | 171-180 | — | Trabajo personal: acabar Lab 3, hacer Lab 4 y Challenge 1 |

## Guion — Sesión 2 (2 h)

| Bloque | Min | Nivel | Qué se hace |
|---|---|---|---|
| **1. Dudas** | 0-15 | — | Bloqueos del trabajo personal. Empieza preguntando "¿dónde os atascasteis?", no "¿alguna duda?" |
| **2. Revisión del Lab 3** | 15-30 | 3 CREATE | La pregunta del Paso 1: por qué 3 tests pasaban con las funciones sin implementar → **oráculo de test** |
| **3. Lab 4** | 30-70 | 5 TROUBLESHOOT | En sesión, con el informe de diagnóstico escrito **antes** de corregir |
| **4. Revisión del Lab 4 + Parte C** | 70-95 | — | Los tres diagnósticos en común. **Defensas técnicas individuales (O8)** mientras el resto trabaja |
| **5. Margen** | 95-115 | — | Reservado para bloqueos. No es relleno: se usa |
| **6. Cierre** | 115-120 | — | Convocatoria del assessment y del Challenge |

**Cómo encajar la Parte C en el bloque 4:** mientras el grupo compara diagnósticos por parejas, llama a los alumnos de uno en uno, 5-10 minutos cada uno. Con 10 personas no da tiempo a todos en una sesión: prioriza a quien mostró señales de alarma en el Lab 1 y completa el resto en la revisión del Challenge 1. Las cuatro preguntas y la rúbrica están en el [assessment del módulo](../../modules/00-foundations/assessment/), Parte C.

## Bloque 1 — Apertura (15 min)

**No empieces por la sintaxis.** Empieza enseñando el proyecto:

```bash
npm run test:chromium
```

Mientras corre, explica: 79 tests, 6 Page Objects, 10 fallos a propósito, un pipeline que analiza los fallos con IA. **Este repositorio es el material del curso.**

Después abre `pages/login.page.ts` y di la frase que sostiene todo el módulo:

> "Son 19 líneas. Si entendéis estas 19 líneas, entendéis el 90% del código de este proyecto. Eso es lo que vamos a hacer hoy."

Declara las tres reglas del programa:

1. Los defectos del repositorio son el material — nadie los arregla.
2. Diagnosticar antes que corregir — nunca se cambia un `expect` para llegar a verde.
3. QA + IA, nunca IA en lugar de QA.

## Bloques de teoría

**Máximo 12-15 minutos seguidos.** Con el editor proyectado, no con diapositivas. Cada sección de `theory.md` termina con un **"Ábrelo"**: ábrelo de verdad.

**Bloque B es el más importante de la sesión.** Las dos trampas de `sort()` explican dos de los tres fallos del Lab 4 y uno de los dos del assessment. Dedícale el tiempo y ejecuta la demostración en vivo:

```javascript
[10, 9, 100].sort()   // → [10, 100, 9]
```

Deja que el grupo prediga el resultado antes de mostrarlo. La cara que ponen es el aprendizaje.

## Puestas en común

**Bloque 4 (Lab 1).** Dos partes: las respuestas de la hoja de observación y las defensas de 3 minutos por parejas.

Las respuestas 2 y 5 son las que más discusión generan:

- *Respuesta 2* — el parámetro de propiedad. Casi nadie lo conoce y explica por qué el código "parece incompleto".
- *Respuesta 5* — por qué `let` y no `const`. Lleva de forma natural a: "¿por qué se crea una instancia nueva en cada test?" → aislamiento de Playwright → anticipa el módulo 03.

**Bloque 7 (Lab 2).** Pide **dos** soluciones distintas en la pizarra. Aparecerán tres patrones: el `factor`, el `if` con dos ramas y `reverse()`. Las tres son válidas; compara legibilidad y número de recorridos.

Después haz la pregunta que importa:

> "¿Por qué os pedí que uno de los precios fuera `$100.00`?"

Si el grupo no llega, quita el `$100.00` de los datos y ejecuta con un `sort()` sin comparador: pasa. Ese es el momento en que se entiende que **elegir el dato que rompe el código es criterio QA**, no programación.

**Defensas de 3 minutos (bloque 4, sesión 1).** Por parejas y en paralelo, no delante de todo el grupo: son 12 minutos para 10 personas y nadie se expone. Tu papel es circular y escuchar **el punto 2** de la defensa (*por qué está escrito así*). Anota a quien solo sepa describir la mecánica: es a quien tienes que atender primero en la Parte C. Rúbrica y justificaciones válidas por método en [`solutions/00-foundations/lab-1.md`](../../solutions/00-foundations/lab-1.md).

## Adaptación al nivel del grupo

| Situación | Ajuste | Session time |
|---|---|---|
| Mayoría BEGINNER | Módulo ampliado: teoría A+B y Labs 1-2 en la sesión 1; teoría C y Lab 3 en una sesión intermedia; Lab 4 y Parte C en la sesión 3 | 7 h |
| Mayoría FOUNDATION | Guion tal cual. Es el caso de referencia | 5 h |
| Mayoría INTERMEDIATE | Teoría comprimida a 25 min; el Lab 3 entra entero en la sesión 1 y el Challenge en la 2 | 4 h |
| Grupo mixto (lo normal) | Guion tal cual, con las parejas equilibradas haciendo el trabajo de nivelación | 5 h |
| Un ADVANCED presente | Mentor de su pareja; ejercicios `[+]`; que dirija la puesta en común del bloque 7 | — |

## Qué va a pasar (previsión verificada)

| Momento | Qué ocurre | Cómo responder |
|---|---|---|
| Lab 1, pregunta 2 | Nadie sabe qué es el parámetro de propiedad | Es esperado. Es el descubrimiento del Lab |
| Lab 2 | Alguien olvida el spread y falla el test 2 | No des la respuesta: "¿qué hace `sort` con el array sobre el que lo llamas?" |
| Lab 2 | Alguien tipa el parámetro como `string` | Todo pasa. Pídele que ejecute la autocomprobación con `'ascendente'` |
| Lab 3 | Alguien modifica el fichero de contrato | Intervención inmediata: es el criterio de superación del Lab |
| Lab 3 | Falla la suma por coma flotante | Enséñale `29.99 + 9.99 + 49.99` en la consola de Node. Media clase de valor |
| Lab 4 | Alguien cambia un `expect` para llegar a verde | Intervención inmediata. Es el hábito más caro del programa |
| Parte C | Alguien nombra el síntoma como causa ("fallaba el `sort`") | *No demostrado*. No se le corrige en el momento: se repite en la revisión del Challenge |

## Cierre de la sesión 1

Trabajo personal para la sesión 2:

- [ ] Terminar el Lab 3 (7 tests en verde) y la respuesta escrita del Paso 1
- [ ] Leer los Learning Points de los Labs 1-3

## Cierre de la sesión 2

- [ ] Challenge 1 con su `05-decisiones.md`
- [ ] Assessment (45 min): partes A y B, al final de la sesión o de forma asíncrona
- [ ] Defensas de la Parte C que hayan quedado pendientes → revisión del Challenge

**Publica al grupo** las soluciones de los Labs 1 y 2 al terminar la sesión 1; las de los Labs 3 y 4 al terminar la sesión 2; la del Challenge al cerrar el módulo. La clave del assessment, **nunca**.

## Post-sesión

- [ ] Anotar dudas recurrentes: si tres o más personas se atascan en lo mismo, el material necesita un ajuste
- [ ] Registrar quién terminó y quién no
- [ ] Comprobar la integridad del proyecto:

```bash
git diff --stat main -- tests/ pages/ scripts/ prompts/ specs/ .github/
# debe estar vacío
```
