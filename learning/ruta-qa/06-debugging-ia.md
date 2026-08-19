# 6 · Debugging con IA

⏱️ **Duración:** 45 min · **Nivel:** 5 · TROUBLESHOOT · **Anterior:** [5 · MCP para QA](05-mcp-para-qa.md)

---

## 🎯 Objetivo

Llegar a la causa raíz de un fallo usando la IA como investigadora, sin dejar que te la arregle.

---

## 🧠 Aprende (12 min)

### La regla del módulo

> **La IA investiga. Tú decides. La IA no repara.**

Un asistente con acceso a tus tests y la instrucción "arregla este fallo" tiene una salida rapidísima disponible: cambiar el valor esperado de la aserción. El test se pone verde, el bug sigue en producción y nadie se entera. Es el peor resultado posible de toda esta ruta.

Por eso todos los prompts de este módulo llevan una frase que ya viste en el módulo 4: **"no propongas correcciones todavía"**.

### El método: cuatro pasos, siempre en orden

```text
Reproducir  ──►  Aislar  ──►  Hipótesis  ──►  Verificar
```

| Paso | Qué haces | Qué aporta la IA |
|---|---|---|
| **Reproducir** | Que falle otra vez, a voluntad | Nada. Es tuyo |
| **Aislar** | Un test, un navegador, sin ruido | Poco |
| **Hipótesis** | Qué podría estar causándolo | **Mucho**: tres hipótesis en diez segundos |
| **Verificar** | Comprobar cuál es | Nada. La decisión es tuya |

La IA es buenísima en el paso 3 y no sirve para los otros tres. Si te la saltas los pasos 1 y 2 y le pegas el error directamente, te dará hipótesis sobre un fallo que a lo mejor ni se reproduce.

### Causa raíz frente a síntoma

Es la distinción que separa a un QA de un ejecutor de pruebas, y los modelos la confunden constantemente:

| Síntoma | Causa raíz |
|---|---|
| "El test falla porque el badge muestra 5 en vez de 6" | El sexto producto no se añade: el botón cambió de id tras el despliegue |
| "Expected URL to match /home.html" | La aserción se escribió contra una ruta que la aplicación nunca ha tenido |
| "Timeout esperando el elemento" | El elemento existe pero está tapado por el banner de cookies |

Prueba rápida: **si la "causa" es una reformulación del mensaje de error, es un síntoma.** Una causa raíz explica *por qué* el valor es el que es.

### Qué darle a la IA para que sirva de algo

La calidad del diagnóstico es la calidad del contexto. Por orden de valor:

| Contexto | Dónde está | Por qué importa |
|---|---|---|
| **El error completo**, no la primera línea | Salida de la ejecución | El "expected/received" es la mitad del diagnóstico |
| **El código del test** | Tu spec | Sin él, la IA adivina qué comprobabas |
| **El snapshot de la página al fallar** | `test-results/<test>/error-context.md` | **Lo más infravalorado.** Es el estado real del DOM en el instante del fallo |
| **Qué cambió** | `git log`, notas de despliegue | Convierte diez hipótesis en una |
| **Si es reproducible o intermitente** | Tu ejecución | Cambia por completo el tipo de causa |

Ese `error-context.md` que Playwright deja en `test-results/` es oro y casi nadie lo usa. Ábrelo: es el árbol de accesibilidad de la página en el momento del fallo. Si el elemento no aparece ahí, no estaba. Fin de la discusión.

### Reproducible o intermitente

| | Reproducible | Intermitente (*flaky*) |
|---|---|---|
| Causa típica | Expectativa incorrecta, bug real, selector roto | Carrera, dato compartido, latencia, dependencia entre tests |
| Qué pedirle a la IA | Hipótesis sobre el estado | Hipótesis sobre **el tiempo y el orden** |
| Trampa | — | Reintentar hasta que pase. Un test flaky que se reintenta es un bug que se oculta |

Este repositorio tiene el caso de latencia real montado: [`tests/performance-glitch-user-cart.spec.ts`](../../tests/performance-glitch-user-cart.spec.ts) usa un usuario que responde lento de verdad.

---

## 🛠️ Practica (25 min)

### Paso 1 — Diagnóstico a ciegas (15 min)

Vas a diagnosticar dos de los diez fallos intencionados **sin mirar el comentario que revela la corrección**.

Elige dos de estos y no abras el fichero todavía:

| Test | Fichero |
|---|---|
| Badge con valor 4 al añadir cuatro productos | [`tests/cart-badge.spec.ts`](../../tests/cart-badge.spec.ts) |
| Productos del inventario visibles en el carrito | [`tests/cart-sync.spec.ts`](../../tests/cart-sync.spec.ts) |
| Error si el nombre es obligatorio | [`tests/checkout.spec.ts`](../../tests/checkout.spec.ts) |
| 6 productos en el inventario | [`tests/inventory.spec.ts`](../../tests/inventory.spec.ts) |
| Cerrar sesión al pulsar Logout | [`tests/menu.spec.ts`](../../tests/menu.spec.ts) |

**a) Reproduce y aísla:**

```bash
npx playwright test --project=chromium tests/cart-badge.spec.ts --grep "badge con valor 4"
```

**b) Reúne el contexto:**

```bash
ls test-results/
# abre el error-context.md del test que has elegido
```

> **No pegues el log entero.** Con el mensaje de error completo —el bloque `expected` / `received`— y el `error-context.md` del test es suficiente; son 1-5 KB. Todo lo demás es ruido que empeora el diagnóstico y te come la ventana de contexto.
>
> 🟡 ¿No tienes fallos propios? Usa [`ejemplos/fallo-logout.md`](ejemplos/fallo-logout.md): trae el error y el estado de la página de un fallo real, listos para pegar.

**c) Pide hipótesis, no soluciones:**

```text
Un test de Playwright falla. Te doy tres cosas:

1. EL ERROR
<pega el error completo, con expected y received>

2. EL SNAPSHOT DE LA PÁGINA AL FALLAR
<pega el contenido de test-results/<test>/error-context.md>

3. LO QUE SÉ
Es reproducible: falla siempre. La aplicación es SauceDemo, estable.

TAREA
1. Reformula en una frase qué estaba comprobando el test.
2. Dame tres hipótesis de causa RAÍZ, ordenadas de más a menos probable,
   y para cada una cómo la verificaría en 30 segundos.
3. Di explícitamente cuál de las tres es un síntoma y no una causa,
   si alguna lo es.

NO propongas ninguna corrección. NO edites ningún fichero.
```

**d) Verifica tú.** Ejecuta las comprobaciones que te ha propuesto. Solo cuando tengas tu conclusión, abre el fichero y lee el comentario `⚠️ FALLO INTENCIONADO`.

Escribe en `learning/student/sandbox/ruta-qa/06-diagnostico.md`, por cada fallo:

```markdown
## <título del test>

**Síntoma:** <lo que ves>
**Causa raíz:** <por qué ocurre de verdad>
**Cómo lo verifiqué:** <el comando o la comprobación>
**Aporte de la IA:** <acertó / se quedó en el síntoma / alucinó>
**Corrección correcta:** <cuál sería — sin aplicarla>
```

Repite con el segundo fallo. El segundo te llevará la mitad de tiempo: el método es el mismo.

### Paso 2 — La IA a escala (10 min)

Un fallo lo diagnosticas tú. Doscientos, no. Ahí es donde la IA gana de verdad.

```bash
npm run test:demo:fail -- --project=chromium
npm run report:ai
```

⏳ El pipeline tarda 2-3 minutos.
🟡 Si no arranca, usa [`ejemplos/ai-corrections.md`](ejemplos/ai-corrections.md) y [`ejemplos/ai-failures-grouped.json`](ejemplos/ai-failures-grouped.json): son la salida real sobre estos mismos diez fallos.

Abre `ai-corrections.md` y contrasta con tu diagnóstico manual:

1. En los dos fallos que analizaste tú, ¿coincide con tu causa raíz o se quedó en el síntoma?
2. La agrupación de `ai-failures-grouped.json`, ¿tiene sentido? Los diez fallos son de **cinco tipos distintos**. ¿Cuántos grupos hizo?
3. Si mañana llegan 200 fallos, ¿esta salida te ahorra tiempo? ¿Con qué te quedarías y qué revisarías siempre a mano?

> La conclusión honesta suele ser: **la IA es excelente triando y mediocre diagnosticando.** Úsala para decidir por dónde empezar, no para decidir qué está roto.

---

## 🎯 Llévatelo a tu proyecto (8 min)

Coge el **fallo reciente que te costó diagnosticar** de tu `mi-proyecto.md` y rehazlo con el método:

1. ¿Lo puedes reproducir hoy? Si no, ¿por qué no? *(esa respuesta ya es un hallazgo)*
2. Reúne el contexto: error completo, código del test, estado de la página, qué cambió.
3. Pide las tres hipótesis con el prompt de arriba, con la frase de "no propongas correcciones".
4. Compara con lo que resultó ser en su día. ¿Habría acortado la investigación?

Y una acción concreta para tu equipo: comprueba si vuestros informes de fallo guardan el equivalente al `error-context.md`. Si no lo hacen, **proponerlo es la mejora más barata que puedes llevar mañana**: no cuesta nada y multiplica la calidad de cualquier diagnóstico, con IA o sin ella.

---

## ✅ Al terminar deberías ser capaz de

- Aplicar reproducir → aislar → hipótesis → verificar, en ese orden.
- Distinguir un síntoma de una causa raíz en una respuesta de IA.
- Reunir el contexto de un fallo, incluido el snapshot de la página.
- Escribir un prompt de diagnóstico que **no** invite a arreglar.
- Explicar por qué "la IA arregla el test" es un mal resultado.

---

**Siguiente:** [7 · Reto final](07-reto-final.md) →
