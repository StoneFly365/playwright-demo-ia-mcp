# Solución — Lab 6 (Codegen) · ⚠️ SIN VALIDAR

> # No hay solución de referencia para este Lab.
>
> `npx playwright codegen` **no se ha ejecutado contra SauceDemo** ni en la validación técnica ni en la construcción del módulo. **Nadie ha comprobado qué locators genera.**
>
> Escribir aquí una solución supondría inventar el resultado de una herramienta, que es exactamente lo que este programa no hace. Este documento existe para decirlo con claridad, no para rellenar el hueco.

---

## Qué tiene que hacer el formador antes de proponer el Lab

1. Ejecutar el Paso 1 del enunciado en el equipo de referencia del curso:

```bash
npx playwright codegen https://www.saucedemo.com
```

2. Grabar el recorrido del enunciado (login → añadir la Backpack → abrir el carrito).
3. **Anotar aquí, en este fichero, el código generado y la tabla de locators resultante.** A partir de ese momento, este documento pasa a ser una solución de referencia como las demás.
4. Si codegen no arranca (entorno sin interfaz gráfica, permisos, proxy), **descartar el Lab**: no tiene alternativa sin la herramienta.

## Qué se corrige aunque no haya solución de referencia

El Lab es de **crítica**, no de resultado. Se corrige sobre el criterio del alumno, y ese criterio ya está enseñado en el Lab 3:

| Criterio | Qué se busca en la entrega |
|---|---|
| La tabla refleja lo generado de verdad | Se comprueba comparándola con el fichero `06-codegen.spec.ts` entregado |
| Ha medido la ambigüedad | Hay al menos un `count()` en su comprobación |
| Ha detectado la ausencia de aserciones | Un recorrido grabado no verifica nada por sí solo |
| Argumenta al menos una discrepancia con su tabla del Lab 3 | Con uno de los cinco criterios |
| La versión reescrita tiene aserciones con mensaje | Requisito del Paso 4 |

## Señal de alarma en la corrección

Un alumno que entregue la tabla del Paso 2 **coincidiendo con lo que "se supone" que genera codegen**, sin haberlo ejecutado, comete el mismo error que este documento evita: afirmar un resultado que no ha medido. Contrástalo con su fichero generado.

## Lo que sí se ha medido (18/08/2026)

Validación parcial en el **equipo de desarrollo del programa**. **No es K1**: K1 es la comprobación de entorno en una máquina corporativa del cliente y sigue `PENDIENTE — validación durante formación con el cliente`.

| Comprobación | Resultado | Cómo |
|---|---|---|
| CLI de `codegen` disponible | ✅ Playwright **1.58.2** | `npx playwright codegen --help` |
| Navegadores instalados | ✅ chromium · firefox · webkit | `ms-playwright/` |
| `[data-testid]` en login / catálogo de SauceDemo | ❌ **0 / 0** | Sonda con `playwright` contra la aplicación real |
| `[data-test]` en login / catálogo | ✅ **7 / 74** | Ídem |
| `getByRole('button', { name: 'Add to cart' })` | **6** | Ídem — coincide con `locator-reference.md` |
| `getByRole('link', { name: 'Sauce Labs Backpack' })` | **2** | Ídem — coincide con la solución del Lab 5 |
| **Recorrido grabado con `codegen`** | ❌ **NO EJECUTADO** | Requiere interacción humana con la ventana del inspector |

**Consecuencia:** `codegen` usa `data-testid` por defecto y, con una URL suelta, no lee ninguna configuración. Con el comando del Paso 1 tal cual **no generará ningún `getByTestId`** en esta aplicación. Para que la comparación con la tabla del Lab 3 sea justa, hay que ejecutarlo así:

```bash
npx playwright codegen --test-id-attribute data-test https://www.saucedemo.com
```

**Lo que sigue sin saberse:** qué locators concretos emite el generador para cada elemento. Eso solo se sabe grabando el recorrido.

## Estado

| Campo | Valor |
|---|---|
| Validación técnica de `codegen` | ⚠️ **Parcial** — entorno y atributos medidos; **salida del generador, no** |
| Entra en el piloto de M01 | ❌ **No.** Queda explícitamente fuera |
| Bloquea | Nada. El Lab es opcional y no sostiene ningún objetivo P1-P8 en solitario |
| Riesgo asociado | K14 del [diseño del módulo](../../docs/module-01-discovery-design.md), impacto LOW |
| Decisión pendiente | Tras el piloto: grabar el recorrido y completar este fichero, o retirar el Lab del temario |
