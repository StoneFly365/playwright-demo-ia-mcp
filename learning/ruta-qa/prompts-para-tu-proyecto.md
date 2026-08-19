# 💡 Biblioteca de prompts — consulta cuando lo necesites

> **📚 Referencia, no lectura.** Esta página **no forma parte de las 6 horas** y no hay que leerla de principio a fin. Vienes aquí a copiar el prompt que necesitas, cuando lo necesitas, durante la ruta y después de ella.

Los prompts de la [Ruta QA](README.md), listos para copiar. Rellena la ficha de contexto una vez y pégala delante de los demás.

Ninguno de estos prompts sustituye tu revisión. Todos incluyen la restricción que hace falta para que la salida sea auditable.

---

## 0 · Ficha de contexto (se rellena una vez)

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

> **Antes de pegar nada:** datos reales de cliente, no. Anonimiza o usa datos sintéticos.

---

## 1 · Análisis de un requisito

Detecta ambigüedades antes de escribir un solo caso.

```text
<ficha de contexto>

HISTORIA DE USUARIO
<pégala>

CRITERIOS DE ACEPTACIÓN
<pégalos>

TAREA
1. Señala qué criterios son ambiguos o no verificables tal como están
   escritos, y por qué.
2. Di qué información falta para poder probarlos.

NO propongas casos de prueba todavía.
Si un criterio es ambiguo, dilo en vez de resolverlo tú.
```

---

## 2 · Riesgos y escenarios

```text
<ficha de contexto>

HALLAZGOS (lo que sé de verdad de esta pantalla)
<campos, validaciones, estados, métodos disponibles>

HISTORIA Y CRITERIOS
<pégalos>

TAREA
1. Lista primero los riesgos (máximo 6), ordenados por impacto.
2. Después, y solo después, los escenarios que los cubren.

FORMATO
RIESGOS: lista numerada.
ESCENARIOS: tabla con título, precondición, pasos, resultado esperado
(valor exacto) y riesgo cubierto.

RESTRICCIONES
No inventes campos, pantallas ni métodos que no aparezcan arriba.
Al menos un tercio de los escenarios deben ser negativos o de borde.
Nada de "se muestra correctamente": resultados esperados con valor exacto.
```

---

## 3 · Revisión crítica de casos generados

El prompt que se te olvida usar y es el que más valor tiene.

```text
Revisa estos casos de prueba como lo haría un QA senior escéptico:

<pega los casos>

Para cada uno, señala si tiene alguno de estos defectos:
1. Clonado: solo cambia el dato respecto a otro caso.
2. No puede fallar: ningún bug realista lo pondría en rojo.
3. Datos inventados: valores que no aparecen en el contexto que te di.
4. Oráculo débil: resultado esperado sin valor exacto.
5. Sesgo de camino feliz.
6. Riesgo no cubierto por ningún caso.

Devuelve una tabla: caso, defecto, por qué.
No reescribas los casos.
```

---

## 4 · Generar un test de automatización

```text
<ficha de contexto>

CONTEXTO
Lee estos ficheros antes de escribir nada:
<lista de ficheros reales: page objects, un test de referencia>

TAREA
Escribe un test en <ruta exacta> que verifique: <el caso>

RESTRICCIONES
- Reutiliza los Page Objects existentes. No reescribas el login.
- Sigue exactamente el estilo de <fichero de referencia>.
- Toda aserción con mensaje descriptivo, en lenguaje de negocio.
- Prohibidas las esperas explícitas (waitForTimeout, sleep).
- Prohibidos los ordinales (.first(), .nth(), .last()): acota el locator.
- Aserciones web-first: await expect(locator), no expect(await ...).
- Verifica el número de elementos recuperados antes de comprobar su orden.
- No uses listas de valores escritas a mano que se rompan al añadir datos.
- No modifiques ningún fichero fuera de <ruta permitida>.
```

**Lista de revisión antes de ejecutarlo:**

- [ ] ¿Importa ficheros reales, con rutas correctas?
- [ ] ¿Hay esperas explícitas u ordinales?
- [ ] ¿Aserciones web-first?
- [ ] ¿Valores escritos a mano que se romperán con datos nuevos?
- [ ] ¿Usa métodos que no existen en tu Page Object?
- [ ] ¿Qué bug haría fallar este test?

---

## 5 · Tabla de decisión de locators

Pide el razonamiento antes que el cambio.

```text
<ficha de contexto>

Este es un test de nuestra suite:
<pega el código>

Analiza cada locator y dame una tabla con: locator actual, problema,
alternativa propuesta y justificación con estos cuatro criterios:
robustez, semántica, accesibilidad, mantenibilidad.

No modifiques el código.
```

---

## 6 · Refactorizar sin perder cobertura

```text
Refactoriza <fichero>: <qué quieres — extraer precondición, parametrizar,
eliminar duplicación>.

REGLAS
No cambies ninguna aserción ni ningún valor esperado.
No elimines ningún caso.
Muéstrame el diff antes de aplicar nada.
```

Después: ejecutar y `git diff`. Si desapareció una aserción, el refactor está mal.

---

## 7 · Diagnóstico de un fallo

El prompt más importante de la ruta. La última línea es la que lo hace seguro.

```text
Un test falla. Te doy tres cosas:

1. EL ERROR
<el error completo, con expected y received>

2. EL ESTADO DE LA PÁGINA AL FALLAR
<snapshot / error-context / HTML relevante>

3. LO QUE SÉ
Reproducible: <siempre / a veces / una vez>
Qué cambió recientemente: <despliegue, datos, entorno>

TAREA
1. Reformula en una frase qué comprobaba el test.
2. Tres hipótesis de causa RAÍZ, de más a menos probable, y cómo
   verificaría cada una en 30 segundos.
3. Di explícitamente cuál de las tres es un síntoma y no una causa.

NO propongas ninguna corrección. NO edites ningún fichero.
```

---

## 8 · Resumen de una ejecución para negocio

Adaptado de [`prompts/ai-summary.txt`](../../prompts/ai-summary.txt), que se ejecuta en el pipeline de este repositorio.

```text
Entrada: <resultado de la ejecución en JSON o texto>

Devuelve SOLO texto plano, sin markdown. Debe poder enviarse por correo
a una dirección no técnica.

ESTRUCTURA OBLIGATORIA
RESULTADO GLOBAL
Total ejecutadas / correctas / fallidas / omitidas / inestables

ATENCIÓN REQUERIDA
Hasta 3 grupos de fallos, de mayor a menor impacto, una línea cada uno,
en lenguaje no técnico: qué funcionalidad falla y a cuántas pruebas afecta.

CONCLUSIÓN
2-3 frases de negocio: qué funciona, qué está en riesgo, si hay bloqueo
para producción. Sin tecnicismos.

ACCIONES RECOMENDADAS
Máximo 4, numeradas y priorizadas.

No inventes datos. Usa exclusivamente los valores de la entrada.
```

> Antes de enviarlo: recuenta los totales a mano. Es el error más frecuente y el más caro delante de un responsable.

---

## Las restricciones que casi siempre hacen falta

Si solo te llevas cinco líneas de esta página, que sean estas:

```text
No inventes datos que no estén en la entrada.
Si falta información, dilo en vez de resolverlo tú.
No propongas correcciones todavía.
No modifiques ningún fichero fuera de <ruta>.
Devuelve exactamente este formato: <el que necesitas>
```

← [Volver al índice de la ruta](README.md)
