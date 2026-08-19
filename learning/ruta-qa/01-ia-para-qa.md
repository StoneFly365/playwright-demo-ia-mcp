# 1 · IA aplicada a QA

⏱️ **Duración:** 35 min · **Nivel:** 1 · FOLLOW · **Anterior:** [0 · Introducción](00-introduccion.md)

---

## 🎯 Objetivo

Saber qué tareas de QA se le pueden delegar a un modelo de lenguaje, cuáles no, y cómo validar lo que devuelve antes de fiarte.

---

## 🧠 Aprende (10 min)

### La única frase de teoría

Un LLM predice texto plausible a partir del texto que le das. **Plausible no es lo mismo que correcto**, y esa diferencia es todo tu trabajo como QA.

De ahí sale una división muy práctica:

| Se le da bien | Se le da mal |
|---|---|
| **Transformar** un formato en otro (JSON de resultados → tickets) | **Contar** y **calcular** con exactitud |
| **Resumir** para una audiencia distinta (técnico → negocio) | **Garantizar** que algo es correcto |
| **Clasificar y agrupar** (200 fallos → 6 causas probables) | **Saber** cosas de tu proyecto que no le has contado |
| **Generar borradores** (escenarios, casos, tests) | **Recordar** lo que decidisteis en la reunión de ayer |
| **Explicar** un error, un stack trace, un fragmento de código | **Decidir** qué es crítico para tu negocio |

Regla operativa: **la IA propone, el QA decide.** Todo lo de la columna izquierda ahorra tiempo. Todo lo de la derecha, si lo delegas, te mete un defecto en producción.

### Cuatro casos de uso reales, en este repositorio

Este proyecto ya usa IA en producción. No es un ejemplo: se ejecuta en cada pipeline.

| Caso de uso | Dónde vive | Qué hace |
|---|---|---|
| **Triage de fallos** | [`prompts/ai-group-failures.txt`](../../prompts/ai-group-failures.txt) | Agrupa N fallos por causa raíz probable |
| **Comunicación a negocio** | [`prompts/ai-summary.txt`](../../prompts/ai-summary.txt) | Convierte el resultado técnico en un correo que entiende un jefe de producto |
| **Alta de incidencias** | [`prompts/ai-tickets.txt`](../../prompts/ai-tickets.txt) | Genera tickets Jira con severidad y pasos de reproducción |
| **Hipótesis de corrección** | [`prompts/ai-corrections.txt`](../../prompts/ai-corrections.txt) | Propone causa y pasos por cada grupo de fallos |

El orquestador es [`scripts/report-ai.mjs`](../../scripts/report-ai.mjs): lee `test-results.json`, agrupa, y luego lanza resumen, correcciones y tickets **en paralelo**.

Fíjate en lo que **no** hace: no arregla ningún test. Ninguno de los cuatro prompts tiene permiso para tocar código. Eso es una decisión de diseño, no una limitación.

### Tres límites, con la prueba delante

**1 · Alucina, y aquí está demostrado.**

[`scripts/report-ai.mjs`](../../scripts/report-ai.mjs) contiene este comentario y esta corrección:

```javascript
// El modelo inventa generated_at (a menudo en UTC). Lo sobreescribimos con la
// hora real de Madrid para que sea fiable en local y en CI.
grouped.generated_at = new Date().toLocaleString("es-ES", { ... });
```

El prompt le pide una fecha ISO8601. El modelo devuelve una fecha con formato perfecto **y contenido inventado**: no tiene reloj. El código la sobrescribe. La lección no es "los modelos alucinan": es que **la alucinación llegó con formato correcto**, así que ninguna validación de estructura la habría detectado.

**2 · Validar el formato no es validar el contenido.**

El mismo script valida las salidas JSON con `JSON.parse()` y nada más. Si el modelo inventa un test que no existe, con un `title` bien formado, pasa la validación. Un JSON válido con datos falsos sigue siendo un JSON válido.

**3 · Lo que le pegas, se lo has dado.**

Todo lo que pones en el prompt sale de tu máquina hacia un proveedor. En un proyecto de seguros eso incluye nombres, RUT, pólizas, importes. **Datos reales de asegurado no van a un prompt.** Anonimiza o usa datos sintéticos. Y ojo con el camino inverso: si le das a la IA un fichero de log de un tercero, ese fichero puede contener instrucciones dirigidas al modelo (inyección de prompt).

### La checklist de validación

Cinco preguntas antes de aceptar cualquier salida de IA. Las vas a usar en toda la ruta:

1. **¿Los datos existen?** Cada nombre de test, fichero, línea o importe, ¿está en la entrada que le di?
2. **¿Los números cuadran?** Totales, conteos y porcentajes, recalculados a mano.
3. **¿Falta algo?** Lo que no menciona es tan importante como lo que menciona.
4. **¿Puede fallar?** Si es un test: ¿qué bug haría que se pusiera rojo? Si no sabes contestar, el test no vale.
5. **¿Lo firmo yo?** Si lo mandas a negocio o a Jira con tu nombre, es tuyo.

---

## 🛠️ Practica (20 min) — auditar a la IA

Vas a ejecutar el pipeline de IA sobre diez fallos reales y buscarle los fallos a él.

### Paso 1 — Genera fallos de verdad

```bash
npm run test:demo:fail -- --project=chromium
```

Diez tests en rojo, de cinco tipos distintos (URL, conteo, badge, texto de validación, visibilidad). Deja que fallen: es lo que toca.

### Paso 2 — Lanza el análisis de IA

> 🟢 **Recomendado:** ejecútalo tú.
> 🟡 **Si no arranca en 5 minutos:** coge las salidas ya generadas de [`ejemplos/`](ejemplos/README.md) y sigue. El ejercicio es auditarlas, no generarlas.

```bash
npm run report:ai
```

⏳ Tarda 2-3 minutos: son cuatro llamadas al modelo, una de agrupación y tres en paralelo. No necesitas intervenir.

Genera cuatro ficheros en `playwright-report/`:

| Fichero | Qué es |
|---|---|
| `ai-failures-grouped.json` | Los fallos agrupados por causa probable |
| `ai-summary.txt` | El correo para negocio |
| `ai-corrections.md` | Hipótesis de causa y pasos |
| `ai-tickets.json` | Tickets Jira listos para importar |

Los mismos cuatro ficheros, generados el 19 de agosto de 2026 sobre estos mismos diez fallos, están en [`learning/ruta-qa/ejemplos/`](ejemplos/README.md). Si tu ejecución falla —sin CLI, sin autenticación, red bloqueada— usa esos y continúa sin perder nada del ejercicio.

### Paso 3 — Auditoría (lo que importa)

Abre `ai-summary.txt` y `ai-corrections.md` —los tuyos, o los de [`ejemplos/`](ejemplos/README.md)— y pásales la checklist de las cinco preguntas. Responde por escrito:

1. El número total de tests del resumen, ¿coincide con lo que ejecutaste? *(Truco: has lanzado solo `@demo-fail` en un navegador. ¿El resumen lo refleja o habla de la suite entera?)*
2. Los títulos de test que cita, ¿existen todos en `tests/`? Compruébalo con `grep`.
3. En `ai-corrections.md`, ¿alguna "hipótesis de causa" es en realidad una descripción del síntoma? Marca cuáles.
4. Los diez fallos son **intencionados** y cada uno lleva su comentario `⚠️ FALLO INTENCIONADO` en el código. ¿La IA lo ha detectado? ¿Podría?
5. La severidad de los tickets, ¿la firmarías tú tal cual ante tu responsable?

Anota los hallazgos en `learning/student/sandbox/ruta-qa/01-auditoria.md`.

> **Pista para la 1 y la 3, si usas los ejemplos:** ese `ai-summary.txt` concluye que *"la aplicación no funciona en operaciones críticas"* y pide *"corrección inmediata"*. Es **falso**: la aplicación funciona; los que están mal son los diez tests. La IA vio "10 de 10 en rojo" y dedujo "aplicación rota". Formato impecable, conclusión que habría parado un despliegue.

> **La pregunta 4 es la buena.** La IA solo vio `test-results.json`, que no contiene el código fuente. No podía saberlo. Ese es el patrón general: **la IA no sabe lo que no le has dado**, y el trabajo de dárselo es el módulo siguiente.

---

## 🎯 Llévatelo a tu proyecto (5 min)

En tu `mi-proyecto.md`, completa esta tabla con tareas reales de tu semana:

| Tarea de mi semana | ¿Delegable a IA? | Por qué |
|---|---|---|
| *(ej.: resumir 40 fallos de la regresión nocturna)* | Sí | Es clasificar y resumir, y lo reviso yo |
| | | |
| | | |
| *(una que NO)* | No | |

Mínimo tres "sí" y **un "no" razonado**. El "no" vale más que los tres "sí": es la frontera que vas a defender ante quien te pida que la IA lo haga todo.

---

## ✅ Al terminar deberías ser capaz de

- Clasificar una tarea de QA como delegable o no, y justificarlo.
- Nombrar tres límites de un LLM con un ejemplo concreto de cada uno.
- Auditar una salida de IA con la checklist de cinco preguntas.
- Explicar por qué un JSON válido puede contener datos falsos.

---

**Siguiente:** [2 · Prompting para QA](02-prompting.md) →
