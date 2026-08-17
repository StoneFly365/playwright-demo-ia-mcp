# Challenge 1 — Resumen de carrito tipado

**Nivel:** 3 CREATE + 4 DESIGN · **Tiempo:** 60 min · **Objetivos:** O5, O7, O8 *(`05-decisiones.md` y la defensa en la revisión)*

---

## Objetivo

Construir un módulo que calcule el resumen económico de un carrito —subtotal, impuesto y total— y los tests que lo verifican. Sin contrato dado: el contrato lo escribes tú.

## Contexto

`pages/checkout.page.ts:11-13` expone tres locators: `subtotalLabel`, `taxLabel` y `totalLabel`. El test `tests/checkout.spec.ts:102-118` comprueba que los tres **son visibles**, y nada más. Nadie verifica que los importes sean correctos.

Antes de poder verificar esos importes contra la UI —cosa que harás en módulos posteriores— hace falta saber calcularlos. Eso es lo que construyes aquí.

SauceDemo aplica un impuesto del **8%** sobre el subtotal.

## Restricciones

1. Todo el código va en `learning/student/sandbox/00-foundations/`. Nada fuera de ahí.
2. **No puedes reutilizar tu fichero del Lab 3.** Este módulo es independiente: si necesitas convertir precios, resuélvelo de nuevo y decide tú si esa función debería vivir aquí o en otro sitio (y justifícalo).
3. Al menos **un `type` propio exportado**.
4. Todas las funciones exportadas llevan tipos explícitos en parámetros y retorno.
5. Ninguna función modifica los datos que recibe.
6. El impuesto se pasa como parámetro; **no puede estar escrito a fuego** dentro de la función de cálculo.
7. `npx tsc --noEmit` sin errores.

## Criterios de aceptación

| # | Criterio |
|---|---|
| AC1 | Existe `05-cart-summary.ts` con al menos un `type` exportado y una función que, dado un carrito y un tipo impositivo, devuelve un objeto con subtotal, impuesto y total |
| AC2 | Los tres importes se redondean a 2 decimales |
| AC3 | Un carrito vacío devuelve los tres importes a `0`, sin lanzar ningún error |
| AC4 | Existe `05-cart-summary.spec.ts` escrito por ti, con **6 tests como mínimo**, que incluyen: caso normal, carrito vacío, carrito de un solo producto, un caso de valor límite que tú elijas, y una verificación de que los datos de entrada no se modifican |
| AC5 | Los 6 tests pasan: `npx playwright test -c learning/student/sandbox 00-foundations/05-cart-summary.spec.ts` |
| AC6 | `05-decisiones.md` justifica en 4-8 líneas: qué caso límite elegiste y por qué, y por qué el tipo impositivo es un parámetro y no una constante |

## Pistas (úsalas solo si te atascas más de 10 minutos)

<details>
<summary>Pista 1 — Cómo devolver tres valores desde una función</summary>

Una función solo devuelve una cosa, pero esa cosa puede ser un objeto: `{ subtotal, impuesto, total }`. Ponle un `type` con nombre y úsalo como tipo de retorno.
</details>

<details>
<summary>Pista 2 — Redondear a 2 decimales</summary>

`Math.round(valor * 100) / 100`. Piensa en qué momento del cálculo aplicarlo: redondear el subtotal antes de calcular el impuesto no da el mismo resultado que redondear al final. Cualquiera de las dos opciones es defendible; elige una y dilo en `05-decisiones.md`.
</details>

<details>
<summary>Pista 3 — Qué caso límite elegir</summary>

Piensa como QA, no como programador: ¿qué valor de entrada tiene más probabilidad de romper este cálculo en producción? Un céntimo, un importe de tres cifras y un carrito con precios repetidos son tres candidatos con motivos distintos.
</details>

## Resultado esperado

```
learning/student/sandbox/00-foundations/
├── 05-cart-summary.ts        ← implementación con tipos propios
├── 05-cart-summary.spec.ts   ← tus 6+ tests
└── 05-decisiones.md          ← justificación escrita
```

Sandbox completo en verde (**29 tests como mínimo**: 23 de los Labs 1-4 más tus 6 del Challenge) y `npx tsc --noEmit` limpio.

## Validación

```bash
npx playwright test -c learning/student/sandbox
npx tsc --noEmit
git status --short   # solo learning/student/sandbox/
```

## Expected outcome

Al terminar, deberías poder responder a esto sin dudar:

- ¿Por qué un `type` propio es mejor que pasar tres parámetros sueltos?
- ¿Qué habría pasado si el 8% estuviera escrito dentro de la función y mañana cambia el impuesto?
- ¿Cuál de tus 6 tests fallaría primero si alguien rompiera el redondeo? Si la respuesta es "ninguno", te falta un test.

> La solución de referencia está en [`learning/solutions/00-foundations/challenge-1.md`](../../../solutions/00-foundations/challenge-1.md). Hay más de una implementación válida: la solución muestra una y comenta las alternativas.
