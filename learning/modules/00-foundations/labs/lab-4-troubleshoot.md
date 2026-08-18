# Lab 4 — TROUBLESHOOT · Diagnosticar tres fallos de causas distintas

**Nivel:** 5 · TROUBLESHOOT · **Tiempo:** 40 min · **Objetivos:** O3, O6, O8 *(el informe de diagnóstico y la justificación del Paso 3)*

---

## Objetivo

Diagnosticar la causa raíz de tres tests que fallan, documentarla y corregirla en el código de producción — nunca en la aserción.

## Contexto

Este es el primer contacto del programa con el trabajo que define a un QA de automatización: un test está en rojo y hay que averiguar **por qué**, no hacer que se ponga verde.

Los tres fallos de este Lab son los tres errores más frecuentes de quien empieza con JavaScript en un contexto de test. Los tres aparecen en suites reales. Los tres tienen la misma pinta desde fuera —"el test falla"— y causas completamente distintas.

Las aserciones de `04-broken.spec.ts` describen el **comportamiento correcto**. Están bien. El fallo está siempre en las funciones de arriba.

> Regla del módulo 04 del programa, que empiezas a practicar aquí: *si tu primera reacción ante un test en rojo es cambiar el número esperado, párate.* Estás borrando la señal, no arreglando el problema.

## Prerrequisitos

- Labs 1, 2 y 3 completados.
- Teoría, secciones 5 y 8.

## Archivos implicados

| Fichero | Papel |
|---|---|
| [`learning/student/sandbox/00-foundations/04-broken.spec.ts`](../../../student/sandbox/00-foundations/04-broken.spec.ts) | **El que corriges** (solo las funciones de la parte superior). |

---

## Pasos

### Paso 1 — Reproduce

```bash
npx playwright test -c learning/student/sandbox 00-foundations/04-broken.spec.ts
```

`3 failed`. **Lee los tres mensajes de error enteros antes de tocar nada.** Playwright muestra el valor esperado y el recibido: en dos de los tres fallos, la diferencia entre ambos ya contiene el diagnóstico.

### Paso 2 — Diagnostica antes de corregir

Crea `learning/student/sandbox/00-foundations/lab-4-diagnostico.md` y **rellénalo antes de escribir una línea de corrección**. Una entrada por fallo:

```markdown
## Fallo N — <título del test>

**Síntoma:** qué esperaba el test y qué recibió (cópialo de la salida).
**Causa raíz:** por qué el código produce ese valor. Una o dos frases.
**Corrección:** qué línea cambias y por qué.
**Cómo evitarlo:** qué regla seguirías para que no vuelva a pasar.
```

Los tres síntomas son distintos y las tres causas también. Si tu diagnóstico de dos fallos es el mismo, uno de los dos está mal.

**Pista general, no específica:** los dos primeros fallos están explicados en la teoría (secciones 5 y 8). El tercero tiene que ver con qué le ocurre a un array cuando se lo pasas a una función.

### Paso 3 — Corrige

Una corrección por fallo, siempre en las funciones (`ordenarPrecios`, `contarProductos` y su uso, `ordenarNombres`), nunca en los `expect`.

**Restricción:** el test 2 puede corregirse cambiando la función o cambiando cómo se la llama. Elige una opción y **justifica en el informe cuál has elegido y por qué**.

### Paso 4 — Verifica que no has roto nada más

```bash
npx playwright test -c learning/student/sandbox
```

Los 23 tests del sandbox en verde: 8 del Lab 1, 5 del Lab 2 (los 2 originales más los 3 que añadiste), 7 del Lab 3 y 3 de este Lab.

---

## Resultado esperado

- `3 passed` en `04-broken.spec.ts`.
- `23 passed` en el sandbox completo.
- `lab-4-diagnostico.md` con los tres diagnósticos, escritos **antes** que las correcciones.

## Validación

```bash
# 1. El fichero del Lab pasa
npx playwright test -c learning/student/sandbox 00-foundations/04-broken.spec.ts

# 2. Todo el sandbox pasa
npx playwright test -c learning/student/sandbox

# 3. No has cambiado ninguna aserción
git diff learning/student/sandbox/00-foundations/04-broken.spec.ts
# Ninguna línea que empiece por -/+ debe contener 'expect('

# 4. El proyecto principal sigue intacto
git status --short
```

El punto 3 es el criterio de superación real de este Lab. Un `expect` modificado invalida el ejercicio aunque los tres tests estén en verde.

```bash
git add learning/student/sandbox/00-foundations/
git commit -m "fix(lab-4): corregidos los tres fallos con diagnóstico documentado"
```

## Learning points

- **Diagnosticar y corregir son dos actividades distintas.** Escribir el diagnóstico antes de tocar el código te obliga a entender el fallo en lugar de probar cambios hasta que el rojo desaparezca.
- Un mensaje de fallo bien escrito contiene la mitad del diagnóstico. Por eso las 300+ aserciones del proyecto real llevan mensaje descriptivo: compara [`tests/inventory.spec.ts:27-30`](../../../../tests/inventory.spec.ts) con un `expect` pelado y verás la diferencia cuando falle a las 3 de la mañana.
- Corregir la aserción en lugar del código es la forma más rápida de convertir una suite en decoración. Es también lo que hará un agente de IA de auto-reparación si nadie lo revisa: se analiza en el módulo 08.
- Los tres fallos de este Lab son de **causa distinta pero síntoma parecido**. Clasificar fallos por causa raíz —no por síntoma— es exactamente lo que hace el prompt [`prompts/ai-group-failures.txt`](../../../../prompts/ai-group-failures.txt) del proyecto.
