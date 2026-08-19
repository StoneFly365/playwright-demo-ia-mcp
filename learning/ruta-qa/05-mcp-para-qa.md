# 5 · MCP para QA

⏱️ **Duración:** 45 min · **Nivel:** 2 · MODIFY · **Anterior:** [4 · Playwright + IA](04-playwright-ia.md)

---

## 🎯 Objetivo

Entender qué es MCP y usarlo en una tarea de QA real.

No vas a instalar ni configurar nada: el servidor MCP y los subagentes ya vienen en este repositorio.

---

## 🧠 Aprende (12 min)

### Qué es, en una frase

**MCP (Model Context Protocol) es la forma estándar de darle herramientas a un asistente de IA.**

Sin MCP, el asistente solo lee el texto que le pegas y devuelve texto. Con MCP puede *hacer cosas*: abrir un navegador, mirar el DOM real de tu aplicación, ejecutar la suite.

### Por qué le importa a un QA

Esta es la razón, y es una sola:

> Sin MCP, la IA **imagina** cómo es tu aplicación. Con MCP, **la mira**.

Todo lo que sufriste en el módulo 4 —métodos inventados, locators plausibles que resuelven cero elementos— viene del mismo sitio: el modelo estaba adivinando. Un modelo que puede abrir la página y leer su árbol de accesibilidad deja de adivinar en esa parte.

| Tarea de QA | Sin MCP | Con MCP |
|---|---|---|
| Escribir un locator | Lo deduce del HTML que le pegaste, si se lo pegaste | Lo genera contra el DOM real, verificado |
| Explorar una pantalla nueva | Te pide que se la describas | Navega y te dice qué hay |
| Diagnosticar un fallo | Trabaja con el error que le pegas | Reproduce y mira el estado real |

### Cómo está montado aquí

Un fichero, en la raíz del proyecto: [`.mcp.json`](../../.mcp.json)

```json
{
  "mcpServers": {
    "playwright-test": {
      "command": "npx",
      "args": ["playwright", "run-test-mcp-server"]
    }
  }
}
```

Eso es toda la configuración: **un servidor MCP es un proceso que el asistente arranca y que le expone un catálogo de herramientas.** Aquí, 44 herramientas de Playwright, de las que solo necesitas conocer dos familias:

| Familia | Ejemplos | Para qué |
|---|---|---|
| `browser_*` | `browser_navigate`, `browser_snapshot`, `browser_generate_locator` | Conducir un navegador real y leer la página |
| `test_*` | `test_run`, `test_debug` | Ejecutar y depurar la suite |

> 💡 La primera vez que abras Claude Code en el proyecto **te pedirá aprobar este servidor**. Acepta. Es lo único que tienes que hacer.

### Subagentes: herramientas acotadas por rol

Segunda idea del módulo, y es puro criterio de QA. En `.claude/agents/` hay tres asistentes especializados, y lo interesante **no es lo que saben hacer, sino lo que no pueden hacer**:

| Subagente | Puede | NO puede |
|---|---|---|
| [`playwright-test-planner`](../../.claude/agents/playwright-test-planner.md) | Navegar, mirar, guardar un plan | **Escribir código.** Ni `Write` ni `Edit` |
| [`playwright-test-generator`](../../.claude/agents/playwright-test-generator.md) | Navegar y escribir el spec | Ejecutar la suite |
| [`playwright-test-healer`](../../.claude/agents/playwright-test-healer.md) | Ejecutar, depurar, editar ficheros | Explorar libremente la app |

Que el planificador no pueda escribir código no es una carencia: **es un guardarraíl**. Un agente que planifica y a la vez implementa acaba planificando lo que le resulta fácil implementar.

> **La idea que te llevas, aunque mañana uses otra herramienta:** a un agente se le da el mínimo de permisos que necesita. El corolario incómodo lo viste en el módulo 1: un agente con permiso de escritura sobre tus tests puede "arreglar" un fallo cambiando la aserción.

### Tres riesgos antes de conectarlo a algo de tu empresa

1. **Un servidor MCP es código de terceros ejecutándose en tu máquina**, con tus permisos.
2. **Lo que el agente ve, sale de tu máquina.** Si navega a un entorno con datos reales de asegurados, esos datos van al prompt.
3. **Inyección de prompt:** si lee contenido de una web, esa web puede contener instrucciones dirigidas a él. Por eso se acotan las herramientas.

---

## 🛠️ Practica (25 min)

Requiere [Claude Code](https://claude.ai/code) con el proyecto abierto en su raíz.

> Si no tienes Claude Code, este es el único módulo sin plan B: léelo, quédate con las dos ideas centrales y pasa al [módulo 6](06-debugging-ia.md). No pierdas tiempo montándolo hoy.

### Paso 1 — Comprueba que hay herramientas (2 min)

En Claude Code, dentro del proyecto:

```text
/mcp
```

Debe aparecer `playwright-test` conectado. Si no, ejecuta `npm run ruta-qa:check` y mira la línea de MCP.

### Paso 2 — El valor diferencial en tres minutos (8 min)

Antes del ejercicio grande, ve la diferencia con un ejemplo mínimo. Pide esto:

```text
Usando las herramientas del servidor MCP playwright-test:

1. Navega a https://www.saucedemo.com
2. Haz login con standard_user / secret_sauce
3. Con browser_generate_locator, dame el locator del botón que añade
   la Sauce Labs Backpack al carrito.

Dime también de dónde has sacado ese locator.
```

⏳ Tarda 1-2 minutos.

Ahora la pregunta que es todo el módulo: **abre [`pages/inventory.page.ts`](../../pages/inventory.page.ts) y compara.** ¿El locator que te ha dado coincide con lo que hay en la aplicación de verdad? ¿Podría habértelo dado sin mirar la página?

Eso es lo que MCP aporta: **no es un locator plausible, es un locator verificado.**

### Paso 3 — Explorar con el planificador (12 min)

Ahora algo más grande: que explore una pantalla y proponga un plan. Fíjate en la diferencia con el módulo 3: allí los hallazgos se los diste tú; aquí los recoge él.

```text
Usa el subagente playwright-test-planner.

Estado inicial que debes montar tú, en este orden:
1. Ve a https://www.saucedemo.com
2. Login con standard_user / secret_sauce
3. Añade al carrito Sauce Labs Backpack y Sauce Labs Bike Light
4. Pulsa el icono del carrito para ir a la página del carrito

Una vez ahí, quiero un plan de pruebas de la página del carrito:
qué elementos hay, qué acciones permite y qué escenarios propondrías.
No escribas código.
```

⏳ **El agente puede tardar 3-5 minutos. No necesitas intervenir mientras trabaja.** Mientras, mira las llamadas a herramientas que van apareciendo: `browser_navigate`, `browser_snapshot`, `browser_click`. Eso es MCP funcionando. Ese `browser_snapshot` no es una captura: es el árbol de accesibilidad, que es de donde salen los buenos locators.

Compara su plan con la realidad:

- ¿Los elementos que menciona existen? Compruébalo contra [`pages/cart.page.ts`](../../pages/cart.page.ts).
- ¿Ha detectado escenarios que **no** están en [`specs/test-index.md`](../../specs/test-index.md)?
- ¿Ha inventado algo? Con MCP debería inventar mucho menos que en el módulo 3. **Menos no es cero.**

Guarda el plan en `05-plan-carrito.md`.

### Paso 4 — La pregunta de criterio (3 min)

Responde por escrito en el mismo fichero. Es la evaluación real del módulo:

1. El planificador **no puede escribir ficheros**. Si le quitas esa restricción, ¿qué empeoraría en sus planes?
2. El *healer* **sí puede editar tus tests**. ¿En qué situación concreta es peligroso para un QA? *(Pista: los diez `@demo-fail` de este repositorio)*
3. Tu aplicación de trabajo, ¿la conectarías a MCP tal cual? ¿Qué entorno usarías y con qué datos?

---

## 🎯 Llévatelo a tu proyecto (8 min)

Escribe la **ficha MCP de tu proyecto**: la decisión de si esto entra en tu equipo y cómo.

```text
1. ENTORNO
   ¿Contra qué entorno lo conectaría? (nunca producción con datos reales)
   ¿Tiene datos sintéticos? Si no, ¿qué haría falta?

2. PRIMER CASO DE USO
   Una tarea concreta de mi semana donde "que la IA mire la app real"
   ahorra tiempo de verdad. Una, no cinco.

3. PERMISOS
   ¿Qué debería poder hacer el agente? ¿Qué NO debería tocar nunca?

4. RIESGOS
   Tres riesgos para MI proyecto y qué haría con cada uno.

5. QUIÉN LO APRUEBA
   Seguridad, arquitectura, mi responsable. Con nombre.
```

Entregable: media página que puedes llevar a tu responsable. Es la conversación que hay que tener **antes** de conectar nada.

---

## ✅ Al terminar deberías ser capaz de

- Explicar qué es MCP a un compañero en dos frases, sin hablar de protocolos.
- Decir qué cambia entre una IA que imagina tu aplicación y una que la mira.
- Obtener un locator verificado contra el DOM real.
- Justificar por qué a un agente se le acotan las herramientas.
- Decidir con criterio si conectarlo a un entorno de tu empresa, y a cuál.

---

**Siguiente:** [6 · Debugging con IA](06-debugging-ia.md) →
