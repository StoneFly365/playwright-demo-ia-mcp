# 7 · Reto final

⏱️ **Duración:** 60 min · **Nivel:** 4 · DESIGN → 5 · TROUBLESHOOT · **Anterior:** [6 · Debugging con IA](06-debugging-ia.md)

> 🏆 **Aquí no hay teoría nueva. Aquí aplicas lo aprendido.**
>
> Por eso este módulo no tiene 🧠 Aprende ni 🛠️ Practica: tiene un encargo y siete pasos cronometrados.

---

## 🎯 Objetivo

Recorrer el flujo completo —de la historia de usuario al fallo diagnosticado— usando IA en cada paso y tu criterio en todos.

**Toda la infraestructura está preparada.** Tú escribes el cuerpo de un test y el análisis. Nada de montar proyectos.

---

## El encargo

```text
HISTORIA DE USUARIO
Como comprador quiero poder reiniciar el estado de la aplicación desde
el menú lateral, para empezar de cero sin cerrar sesión.

CRITERIOS DE ACEPTACIÓN
1. La opción "Reset App State" está disponible en el menú lateral.
2. Tras usarla, el carrito queda vacío.
3. El catálogo vuelve a su estado inicial.
4. La sesión del usuario se mantiene abierta.
```

Cuatro líneas. Como las que te llegan de verdad. Los criterios 3 y 4 son ambiguos a propósito.

## Lo que ya tienes preparado

| Fichero | Qué trae |
|---|---|
| [`07-reset-app-state.spec.ts`](../student/sandbox/ruta-qa/07-reset-app-state.spec.ts) | Imports, `describe`, `beforeEach` con login, Page Objects instanciados y un test en `skip` esperando su cuerpo |
| [`07-entrega.md`](../student/sandbox/ruta-qa/07-entrega.md) | La plantilla de entrega, con las siete secciones ya puestas |

---

## El flujo

```text
Historia de usuario
        ↓  (8 min)   Análisis con IA
        ↓  (7 min)   Identificación de riesgos
        ↓ (10 min)   Casos de prueba
        ↓ (20 min)   Implementación de UN test
        ↓  (3 min)   Ejecución
        ↓ (10 min)   Análisis del fallo con IA
        ↓  (2 min)   Cierre
```

Todo se escribe en `07-entrega.md`. Un fichero, siete secciones.

---

## Paso 1 — Análisis con IA (8 min)

Reúne los hechos tú primero (módulo 3):

| Abre | Anota |
|---|---|
| [`pages/menu.page.ts`](../../pages/menu.page.ts) | Qué hace exactamente `resetAppState()`. Son tres clics |
| [`tests/menu.spec.ts:32`](../../tests/menu.spec.ts) | Qué comprueba hoy el test que existe. Y sobre todo, qué **no** |
| [`pages/inventory.page.ts`](../../pages/inventory.page.ts) | Qué métodos tienes para observar el estado |
| La aplicación, a mano | Qué pasa de verdad al pulsar Reset con productos en el carrito |

Ahora pide el análisis, **no los casos**:

```text
CONTEXTO
<tus hallazgos>

HISTORIA Y CRITERIOS
<pega los cuatro criterios>

TAREA
1. Señala qué criterios de aceptación son ambiguos o no verificables
   tal como están escritos, y por qué.
2. Di qué información falta para poder probarlos.

NO propongas casos de prueba todavía.
```

> Si la IA "resuelve" un criterio ambiguo en vez de señalarlo, apúntalo: es el fallo del módulo 1 en directo.

## Paso 2 — Riesgos (7 min)

Aplica las seis preguntas del módulo 3. Aquí van especialmente cargadas:

1. ¿Y si se pulsa **dos veces**?
2. ¿Y si se pulsa **desde el carrito o desde el checkout**, no desde el inventario?
3. ¿Y si hay un checkout **a medias**, con el formulario relleno?
4. ¿Qué se ve afectado que el requisito no menciona? *(badge, botones del catálogo, orden aplicado, formulario)*
5. ¿Qué usuario lo rompe? *(`problem_user`, `performance_glitch_user`)*
6. ¿Qué es "estado inicial"? ¿Y "la sesión se mantiene"?

Máximo seis riesgos, ordenados por impacto.

## Paso 3 — Casos de prueba (10 min)

Genera con IA y **audita con la tabla de seis defectos** del módulo 3. Quédate con **4-6 casos**, con resultado esperado de valor exacto.

Al menos uno tiene que cubrir el **riesgo 2**: el reset desde una pantalla que no sea el inventario. Es el hueco real de cobertura y el que vas a implementar.

## Paso 4 — Implementación (20 min)

Quita el `.skip` de [`07-reset-app-state.spec.ts`](../student/sandbox/ruta-qa/07-reset-app-state.spec.ts) y escribe **un solo test**: el del riesgo 2.

Usa el prompt de generación del módulo 4 con sus restricciones, y **revisa antes de ejecutar** con la lista de siete puntos.

Si tienes MCP a mano, úsalo: es el escenario perfecto para que mire el DOM real en vez de imaginárselo.

> ⏳ Si delegas en un agente, cuenta 2-4 minutos de espera. Aprovéchalos para redactar los riesgos del paso 2 en la plantilla.

## Paso 5 — Ejecución (3 min)

```bash
npx playwright test -c learning/student/sandbox/ruta-qa --project=chromium 07-reset-app-state.spec.ts
npx tsc --noEmit
```

## Paso 6 — Análisis del fallo (10 min)

Tres desenlaces posibles y **los tres son válidos**:

| Si… | Entonces |
|---|---|
| **Falla y el test está mal** | Diagnostícalo con el método del módulo 6. Corrige el test, nunca la aserción a ciegas |
| **Falla y la aplicación está mal** | Enhorabuena: bug real. Documéntalo como tal |
| **Pasa a la primera** | Sospecha. *¿Qué bug haría fallar este test?* Si no sabes contestar, no comprueba nada. Rehazlo |

> **Pista de investigación, no afirmación:** comprueba qué pasa con los botones del catálogo tras el reset. Si añadiste un producto, el botón pasó de "Add to cart" a "Remove". Después del reset, ¿vuelve a "Add to cart"? Verifícalo en la aplicación, con el navegador abierto, **antes** de decidir si el que está mal es tu test o la aplicación. Ese es el criterio 3 en juego.

Documenta con el formato del módulo 6: síntoma, causa raíz, cómo lo verificaste, aporte de la IA, corrección correcta.

## Paso 7 — Cierre (2 min)

```bash
# El proyecto sigue intacto
git status --short          # solo learning/student/sandbox/ruta-qa/

# Los diez fallos intencionados siguen fallando
npm run test:demo:fail -- --project=chromium
```

---

## Criterios de aceptación

| # | Criterio | Cómo se comprueba |
|---|---|---|
| AC1 | Al menos una ambigüedad real detectada en los criterios | Sección 1 de la entrega |
| AC2 | Riesgos priorizados, no una lista plana | Sección 2 |
| AC3 | 4-6 casos con resultado esperado de **valor exacto** | Sección 3 |
| AC4 | Un caso cubre el reset desde fuera del inventario | Sección 3 |
| AC5 | **Un** test implementado, tipado y ejecutable | `npx playwright test -c ...` + `npx tsc --noEmit` |
| AC6 | Ninguna espera explícita ni ordinal | `grep -n "waitForTimeout\|\.first()\|\.nth(" 07-reset-app-state.spec.ts` no devuelve nada |
| AC7 | Toda aserción con mensaje descriptivo | Revisión |
| AC8 | Diagnóstico con causa raíz distinguida del síntoma | Sección 6 |
| AC9 | El proyecto intacto | `git status --short` |
| AC10 | En cada paso, qué aportó la IA y qué corregiste tú | Sección 7 |

**AC10 es el que de verdad cierra la ruta.** Todo lo demás lo puede hacer un asistente. Ese no.

---

## 🎯 Llévatelo a tu proyecto

El reto ya es el ensayo. Ahora repítelo **una vez** sobre una historia real de tu backlog, con tu ficha de contexto y tus prompts.

Con eso, esta ruta deja de ser formación y pasa a ser trabajo hecho.

---

## ✅ Al terminar deberías ser capaz de

- Recorrer requisito → riesgos → casos → test → ejecución → diagnóstico sin perder ningún paso.
- Usar IA en cada fase sabiendo qué revisar en cada una.
- Detectar una ambigüedad de requisito antes de escribir un test.
- Defender por escrito qué es tuyo y qué es de la máquina.

---

## Y ahora qué

| Si quieres… | Ve a |
|---|---|
| Playwright en serio: locators medidos, auto-waiting, arquitectura | [Módulo 01 — Playwright Fundamentals](../modules/01-playwright-fundamentals/README.md) (12 h) |
| Leer y escribir el código de `pages/` con soltura | [Módulo 00 — Fundamentos JS/TS](../modules/00-foundations/README.md) (8,75 h) |
| El programa completo de 10 módulos | [Learning path](../docs/learning-path.md) |
| Tus prompts a mano | [Biblioteca de prompts](prompts-para-tu-proyecto.md) |

← [Volver al índice de la ruta](README.md)
