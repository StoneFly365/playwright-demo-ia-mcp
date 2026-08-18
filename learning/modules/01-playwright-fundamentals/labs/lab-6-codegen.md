# Lab 6 — MODIFY · Codegen y su letra pequeña *(opcional)*

**Nivel:** 2 · MODIFY · **Tiempo:** 30 min · **Objetivos:** P3 (refuerzo) · **Solo para grupos INTERMEDIATE / ADVANCED**

---

> # ⚠️ PENDING TECHNICAL VALIDATION
>
> **`npx playwright codegen` no se ha ejecutado contra esta aplicación durante la validación técnica del módulo** ([`module-01-technical-validation.md`](../../../docs/module-01-technical-validation.md), sección 9: *Lab 6 — no validado*).
>
> Eso significa que **nadie ha comprobado todavía qué locators genera codegen contra SauceDemo**, que es justamente el objeto del Lab. Este enunciado está construido de forma que **no afirma ningún resultado**: todo lo que pide es que observes y compares lo que salga.
>
> **Estado a 18/08/2026: sigue NO VALIDADO, y queda FUERA del piloto de M01.** Grabar un recorrido con `codegen` exige interacción humana con su ventana de inspector, y eso no se ha hecho todavía contra esta aplicación.
>
> **Lo que sí se ha medido** (equipo de desarrollo del programa, 18/08/2026 — **no es K1**):
>
> | Comprobación | Resultado |
> |---|---|
> | `npx playwright codegen --help` responde | ✅ Playwright **1.58.2**, con la opción `--test-id-attribute` |
> | Navegadores instalados | ✅ chromium · firefox · webkit |
> | Atributos `[data-testid]` en la página de login de SauceDemo | ❌ **0** |
> | Atributos `[data-testid]` en el catálogo | ❌ **0** |
> | Atributos `[data-test]` (login / catálogo) | ✅ **7 / 74** |
>
> **Consecuencia para este Lab:** `codegen` busca `data-testid` por defecto y **no lee ninguna `playwright.config.ts`** cuando se le pasa una URL suelta. Con el comando del Paso 1 tal cual, **no puede generar ni un solo `getByTestId`** contra esta aplicación. Eso no invalida el ejercicio —el Lab es de crítica, no de resultado—, pero el formador tiene que saberlo antes de comparar la salida con la tabla del Lab 3, que sí usa `getByTestId`.
>
> **Formador:** ejecuta el Paso 1 tú mismo antes de proponer este Lab. Si quieres que la comparación con el Lab 3 sea justa, ejecútalo con `--test-id-attribute data-test`. Si codegen no arranca en el entorno del grupo (permisos, entorno gráfico, proxy), **descarta el Lab**: no tiene alternativa sin la herramienta. Anota lo que genere en [`solutions/01-playwright-fundamentals/lab-6.md`](../../../solutions/01-playwright-fundamentals/lab-6.md).

---

## Objetivo

Generar un test con la herramienta de grabación de Playwright y **criticarlo** con los criterios del Lab 3: ¿qué locators elige?, ¿cuáles cambiarías?, ¿por qué?

## Contexto

`codegen` abre un navegador, graba lo que haces y escribe el código. Es un acelerador legítimo —empezar de cero es más lento— y también una trampa: **genera código que funciona, no código que se mantiene**. Igual que un asistente de IA, que es el tema del módulo 08.

El repositorio **no** usa codegen ni tiene ningún script para él. Es contenido nuevo, y se justifica: es la herramienta con la que la mayoría de la gente escribe su primer test de Playwright en el trabajo, y hacerlo sin criterio es la vía más rápida a una suite frágil.

## Prerrequisitos

- Lab 3 completado. **Sin él, este Lab no tiene sentido**: la crítica se hace con los cinco criterios del Lab 3.

## Archivos implicados

| Fichero | Papel |
|---|---|
| `learning/student/sandbox/01-playwright/06-codegen.spec.ts` | Lo genera la herramienta y lo pegas tú |
| `learning/student/sandbox/01-playwright/06-critica.md` | **El entregable** |

---

## Pasos

### Paso 1 — Graba

```bash
npx playwright codegen https://www.saucedemo.com
```

Se abre un navegador y una ventana con el código que se va escribiendo. Graba este recorrido, sin más:

1. Iniciar sesión con `standard_user` / `secret_sauce`.
2. Añadir la **Sauce Labs Backpack** al carrito.
3. Abrir el carrito.

Copia el código generado a `06-codegen.spec.ts` y ejecútalo:

```bash
npx playwright test -c learning/student/sandbox/01-playwright --project=chromium 06-codegen.spec.ts
```

> Si `codegen` no arranca en tu equipo, **para aquí y avísalo**. No hay plan B para este Lab.

### Paso 2 — Inventaria lo que ha generado

En `06-critica.md`, una fila por cada locator generado:

| Elemento | Locator generado | Estrategia | ¿Lo mantendrías? | Qué usarías y por qué |
|---|---|---|---|---|

**No asumas nada sobre lo que va a generar.** Anota lo que veas.

### Paso 3 — Crítica

Responde:

1. ¿Cuántas estrategias distintas ha usado? ¿Son coherentes entre sí?
2. ¿Alguno de sus locators es **ambiguo** o depende del orden del DOM? Compruébalo con `count()`.
3. ¿Ha generado alguna aserción? Si no, **¿es eso un test?**
4. ¿Coincide alguno con las decisiones de tu tabla del Lab 3? ¿En cuáles discrepa y quién tiene razón?

### Paso 4 — Reescribe

Deja el test reescrito con **tus** locators y con al menos dos aserciones con mensaje descriptivo. Compara los dos ficheros y anota en `06-critica.md` la diferencia en número de líneas y en legibilidad.

---

## Resultado esperado

- `06-codegen.spec.ts` con el test generado y, debajo, tu versión reescrita.
- `06-critica.md` con la tabla de locators, las 4 respuestas y la comparación final.

## Validación

```bash
npx playwright test -c learning/student/sandbox/01-playwright --project=chromium 06-codegen.spec.ts
npx tsc --noEmit

git add learning/student/sandbox/01-playwright/
git commit -m "docs(lab-6): crítica del código generado por codegen"
```

## Preguntas de reflexión

1. Codegen genera código que funciona. **¿Qué le falta para ser un buen test?**
2. Si un compañero junior entrega un test generado por codegen sin tocar, ¿qué le dirías en la revisión de código? Escribe tres comentarios concretos.
3. Esto mismo va a pasar —a mayor escala— con los tests generados por IA en el módulo 08. **¿Qué criterio te llevas de aquí para entonces?**

## Criterios de finalización

- [ ] La tabla del Paso 2 refleja **lo que la herramienta generó de verdad**, no lo que se esperaba.
- [ ] Al menos una discrepancia con tu tabla del Lab 3 está argumentada.
- [ ] La versión reescrita tiene aserciones y la generada probablemente no: la comparación está anotada.

## Learning points

- Una herramienta que graba **describe lo que hiciste**, no lo que quieres verificar. Un recorrido no es un test hasta que tiene una aserción.
- El código generado funciona el primer día. Su coste aparece el día que la aplicación cambia — y para entonces ya nadie recuerda por qué el locator era así.
- Aceptar código generado sin criterio es el mismo error, tanto si lo genera una herramienta de grabación como un modelo de lenguaje. El módulo 08 trata exactamente esto.
