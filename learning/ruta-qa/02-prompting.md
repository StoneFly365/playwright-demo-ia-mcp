# 2 · Prompting para QA

⏱️ **Duración:** 30 min · **Nivel:** 2 · MODIFY · **Anterior:** [1 · IA aplicada a QA](01-ia-para-qa.md)

---

## 🎯 Objetivo

Escribir prompts de QA que devuelven algo utilizable a la primera, dando el contexto correcto y fijando un contrato de salida.

---

## 🧠 Aprende (10 min)

### El cambio de mentalidad

Un prompt útil no es una pregunta. **Es una especificación.** Y una especificación es algo que un QA ya sabe escribir.

Compara:

```text
❌ "Genera casos de prueba para el login"
```

```text
✅ Actúa como QA senior de una aseguradora.

CONTEXTO
Aplicación web de contratación de pólizas. Login con RUT y contraseña.
Bloqueo tras 3 intentos fallidos durante 15 minutos.

HISTORIA DE USUARIO
Como cliente quiero acceder con mi RUT para consultar mis pólizas.

CRITERIOS DE ACEPTACIÓN
1. RUT válido + contraseña correcta → portada de pólizas.
2. Credenciales incorrectas → mensaje genérico, sin revelar si el RUT existe.
3. Tres intentos fallidos → cuenta bloqueada 15 min.

TAREA
Lista los escenarios de prueba. Para cada uno: título, precondición,
pasos, resultado esperado y riesgo cubierto.

FORMATO
Tabla Markdown con esas cinco columnas. Nada más.

RESTRICCIONES
No inventes campos ni pantallas que no aparezcan arriba.
Si falta información para un escenario, escribe "FALTA DATO: <qué>".
```

El segundo tarda dos minutos más en escribirse y ahorra veinte de correcciones. Y se reutiliza: solo cambias la historia.

### Las seis piezas

| Pieza | Qué aporta | Sin ella |
|---|---|---|
| **Rol** | Fija el nivel y el vocabulario | Respuestas de manual de introducción |
| **Contexto** | Lo que el modelo no puede saber | Se lo inventa |
| **Entrada** | Los datos exactos sobre los que trabaja | Trabaja sobre un ejemplo genérico |
| **Tarea** | Un verbo, un entregable | Te da un ensayo |
| **Contrato de salida** | Formato exacto y campos exactos | Formato distinto cada vez, imposible de automatizar |
| **Restricciones** | Lo prohibido | Rellena huecos con plausibilidad |

### Los cuatro prompts de producción de este repositorio

No hay que imaginárselo: el directorio `prompts/` tiene [cuatro prompts](../../prompts/ai-group-failures.txt) que se ejecutan en cada pipeline. Ábrelos, son cortos, y cada uno enseña una técnica. Sus salidas reales están en [`ejemplos/`](ejemplos/README.md), por si quieres ver el resultado antes que la receta.

**a) Contrato de salida como esquema** — [`prompts/ai-group-failures.txt`](../../prompts/ai-group-failures.txt)

Declara la estructura JSON campo a campo, con tipos:

```text
Salida JSON (estructura exacta):
{
  "risk_level": "high | medium | low",
  "total_failed_tests": number,
  "groups": [ { "group_id": "G001", "count": number, ... } ]
}

Devuelve SOLO ese JSON (sin markdown). NO uses ```.
```

Por qué importa: la salida la consume un programa, no una persona. Sin esquema, no hay automatización posible.

**b) Prohibiciones explícitas** — el mismo fichero

```text
- NO inventes tests ni campos que no estén en el input.
- Solo usa información existente: títulos, estado, errores, ubicación si existe.
- Si falta stack o ubicación, agrupa por primera línea del error.
```

La tercera línea es la clave: **le dice qué hacer cuando falta un dato.** Un prompt sin plan B para los huecos es un prompt que alucina en cuanto la entrada es imperfecta.

**c) Definir la audiencia, no el tema** — [`prompts/ai-summary.txt`](../../prompts/ai-summary.txt)

```text
El texto debe poder enviarse directamente por correo electrónico
a dirección no técnica.
[...]
CONCLUSIÓN
[2-3 frases en lenguaje de negocio. Indica qué funciona, qué está en
riesgo y si hay bloqueos críticos para producción. Sin tecnicismos.]
```

Fija audiencia, longitud y registro. Compara con pedir "un resumen": el resumen de un modelo, por defecto, es para otro modelo.

**d) Acotar hasta lo cosmético** — el mismo fichero

```text
Uso de emojis: SOLO los del mapa fijo de abajo, exactamente en las
líneas indicadas. Prohibido cualquier otro emoji [...]
```

Puede parecer excesivo. No lo es: sin esa línea, cada ejecución produce un correo distinto y **el informe deja de ser comparable entre semanas**. Consistencia > creatividad, siempre, en QA.

### Iterar bien

Cuando la respuesta no sirve, la reacción natural es volver a preguntar. Es la mala.

| ❌ Iteración pobre | ✅ Iteración útil |
|---|---|
| "no, hazlo mejor" | "Los escenarios 3 y 5 son el mismo caso con distinto dato. Fusiónalos y añade uno de sesión expirada." |
| "más casos" | "Faltan casos negativos. Añade 4: RUT con formato inválido, contraseña vacía, usuario bloqueado, sesión caducada." |
| "no me gusta el formato" | *(corrige el contrato de salida en el prompt original y relanza)* |

Regla: **si un fallo se va a repetir, se arregla en el prompt; si es puntual, se corrige en la conversación.** Un prompt que funciona se guarda; no es un mensaje de chat, es un activo del equipo.

---

## 🛠️ Practica (15 min) — romper y arreglar un prompt real

### Paso 1 — Copia, no toques el original

```bash
cp prompts/ai-summary.txt learning/student/sandbox/ruta-qa/mi-summary.txt
```

### Paso 2 — Rompe una pieza

Edita **tu copia** y borra el bloque de estructura obligatoria completo (desde `Estructura obligatoria` hasta el final), dejando solo la primera línea de la tarea. Ejecuta ambos prompts sobre la misma entrada:

```bash
# La entrada: el análisis del módulo 1
cat playwright-report/ai-failures-grouped.json

# ¿No lo generaste? Usa el de ejemplo, sirve igual (3,5 KB)
cat learning/ruta-qa/ejemplos/ai-failures-grouped.json
```

Pásale a tu asistente primero el prompt original y después tu versión mutilada, con ese mismo JSON como entrada. Compara las dos salidas:

- ¿Cuál se puede enviar por correo sin retocar?
- ¿Cuál sería igual la semana que viene?
- ¿Cuál inventa alguna sección que nadie pidió?

### Paso 3 — Mejóralo

Vuelve a partir del original y **añade** una pieza que hoy no tiene: una sección `TENDENCIA` que compare con la ejecución anterior.

Descubrirás enseguida el problema: **el prompt no recibe la ejecución anterior**. No se arregla escribiendo mejor; se arregla dándole el dato. Anótalo, porque es la lección del módulo:

> El 80 % de los prompts que "no funcionan" son prompts a los que les falta contexto, no palabras.

### Paso 4 — Tu prompt base

Escribe en `learning/student/sandbox/ruta-qa/02-prompt-base.md` un prompt de generación de escenarios con las seis piezas, usando la historia de usuario de tu `mi-proyecto.md`. Lo vas a usar tal cual en el módulo 3.

---

## 🎯 Llévatelo a tu proyecto (5 min)

Rellena la **ficha de contexto de tu proyecto**. Es el bloque que vas a pegar delante de casi todos tus prompts a partir de hoy:

```text
PROYECTO: <nombre y qué hace, en una frase>
STACK: <front, back, herramienta de automatización, lenguaje>
DÓNDE VIVE EL CÓDIGO DE TESTS: <ruta>
CONVENCIONES: <nombrado de tests, idioma de los títulos, patrón (POM u otro)>
SELECTORES: <data-testid, id, clases… y cuál es el preferido>
LO QUE NO SE TOCA: <ficheros o zonas prohibidas>
USUARIOS DE PRUEBA: <perfiles y qué comportamiento tiene cada uno>
DATOS SENSIBLES: <qué nunca se pega en un prompt>
```

Guárdala. Es el activo más rentable de este módulo: convierte cualquier prompt genérico en un prompt de tu proyecto pegando ocho líneas.

Plantillas listas en **[Prompts para tu proyecto](prompts-para-tu-proyecto.md)**.

---

## ✅ Al terminar deberías ser capaz de

- Escribir un prompt de QA con las seis piezas.
- Fijar un contrato de salida que un programa pueda consumir.
- Decirle al modelo qué hacer cuando le falta un dato, en vez de dejar que lo invente.
- Distinguir cuándo corregir en la conversación y cuándo corregir el prompt.

---

**Siguiente:** [3 · Generación de casos de prueba](03-generacion-tests.md) →
