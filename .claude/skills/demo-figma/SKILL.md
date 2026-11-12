---
name: demo-figma
description: Conduce la demo "Diseñar desde Figma" (HU-001) paso a paso en el chat, o la ensaya de principio a fin la víspera. Usar cuando el usuario invoque /demo-figma.
argument-hint: "[ensayo | <paso 1-8> | sigue | fin]"
disable-model-invocation: true
---

# Demo · Diseñar desde Figma

El guion es [docs/demo-disenar-figma.md](../../../docs/demo-disenar-figma.md) y es la única fuente de verdad. Léelo entero al empezar: de ahí salen los títulos de los pasos y las comprobaciones del ensayo.

Todos los comandos se lanzan con la herramienta Bash, desde la raíz del repositorio.

En Windows, la terminal de Bash puede arrancar en `/c/…`, con la unidad en minúscula, y entonces Playwright no carga ningún test (`did not expect test.describe() to be called here`). Por eso, los comandos de `npx playwright` y `report:ai:demo` van precedidos de `cd "/C${PWD#/?}" &&`, en la misma llamada, para pasar a la unidad en mayúscula.

## El chat lo ve el público

Durante la demo se comparte pantalla con VS Code, así que el público ve este chat. Quien presenta tiene el guion abierto fuera de la pantalla compartida y lee de ahí lo que dice.

- Nunca muestres en el chat nada del guion pensado para quien presenta: frases «Di», viñetas «Enseña», notas 💬, Plan B ni «Mensajes para el cliente». Delatarían que es un guion y algunas notas cuentan cosas que no son para el cliente (por ejemplo, qué diferencias se metieron a propósito).
- Nada de preámbulos, avisos ni comentarios propios.
- Cada paso: ejecuta lo que toque y luego muestra **solo** este bloque:

  ```
  ### <n>. <título del paso, literal del guion>
  <una línea con lo que se ha abierto o ejecutado>
  ```

- Después del bloque, para y espera. No pases al siguiente paso sin que el usuario escriba `sigue` (o un número de paso).
- Si un comando falla, enseña solo la línea de error más corta que lo explique y para. No lo arregles por tu cuenta: el Plan B está en el guion de quien presenta.

## Argumentos

- *(vacío)*: comprobación previa y paso 1.
- `<n>` (1-8): salta a ese paso, lo ejecuta y espera.
- `sigue`: siguiente paso.
- `fin`: ejecuta "Después" (`git checkout -- specs/disenos`) y confirma en una línea.
- `ensayo`: modo ensayo (abajo). Hazlo antes de compartir pantalla.

## Comprobación previa (sin argumentos o con `ensayo`)

1. `git branch --show-current` debe ser `feat/disenar-desde-figma`.
2. `git status --porcelain specs/disenos` debe salir vacío. Si no, compara el fichero con su grabación (`diff -q specs/disenos/HU-001.design.json specs/disenos/grabacion/HU-001.design.json`):
   - Si son iguales, son restos de una toma: díselo y propón `git checkout -- specs/disenos`.
   - Si no, para y pregunta: puede ser trabajo sin guardar.
3. `grep -c FILE_KEY specs/historias/HU-001.md` debe ser mayor que 0, o el script dejaría de usar la instantánea.

En directo, si todo va bien, no digas nada de la comprobación y pasa al paso 1. Si algo falla, dilo en una línea y para.

## Qué ejecutar en cada paso

| Paso | Ejecuta |
|---|---|
| 1 | `code specs/historias/HU-001.md` |
| 2 | `npm run design:ai:demo` |
| 3 | `code specs/disenos/HU-001.plan.md` |
| 4 | Nada (la tabla ya está abierta en el plan). |
| 5 | Nada. |
| 6 | `git show HEAD:specs/disenos/HU-001.plan.md > "${TMPDIR:-/tmp}/HU-001.plan.revisado.md"` y `code --diff "${TMPDIR:-/tmp}/HU-001.plan.revisado.md" specs/disenos/HU-001.plan.md`. Izquierda: revisado. Derecha: propuesta de la IA. |
| 7 | `code tests/hu-001` |
| 8 | `cd "/C${PWD#/?}" && npx playwright test tests/hu-001 --project=chromium --reporter=list`, luego `npm run report:ai:demo` y `code playwright-report/ai-summary.txt`. Con `--reporter=list` no se abre el informe HTML y no hace falta el Ctrl+C del guion. |

En el paso 6, después del bloque del paso muestra esta tabla, para que se vea de un vistazo qué corrige la persona que revisa (comprueba antes con `git diff specs/disenos/HU-001.plan.md` que sigue siendo así y, si no, ajusta las filas al diff):

```
| Qué | Propuesta de la IA | Plan revisado |
|---|---|---|
| Mostrar nombre, precio y cantidad | TC-05 «ya cubierto» | TC-04 caso nuevo |
| Quitar un producto desde el carrito | TC-08 «ya cubierto» | TC-06 caso nuevo |
| Quitar el último producto | TC-09 «ya cubierto» | TC-07 caso nuevo |
| Discrepancia de cantidad | Sí | Se quita (ya es la duda CA5) |
| Duda CA4 sobre el subtotal | No la plantea | Se añade |
```

Sin frases del guion ni comentarios: solo bloque y tabla.

En el paso 8, la salida de los tests se ve en la llamada a la herramienta: no la copies al chat. Di solo cuántos pasan y cuál falla.

## Modo ensayo

Sin pausas ni bloques para el público. Al final, un único informe.

1. Comprobación previa. Si hay restos de una toma, descártalos con `git checkout -- specs/disenos` sin preguntar (son reproducibles). Cualquier otro fallo: para e informa.
2. `npm run design:ai:demo` y comprueba con `diff -q` que `specs/disenos/HU-001.design.json` es igual a la grabación.
3. Comprueba que el plan recién escrito sigue diciendo lo que cita el guion (paso 3: 6 de 7 criterios, 11 casos, 2 nuevos, 4 discrepancias, 1 duda; paso 4: D1-D4; paso 5: CA5). Si no, la grabación y el guion no cuadran.
4. Comprueba que `git diff specs/disenos/HU-001.plan.md` no sale vacío (el paso 6 necesita diferencias).
5. `cd "/C${PWD#/?}" && npx playwright test tests/hu-001 --project=chromium --reporter=list`: debe fallar **solo** el test del subtotal (`tc-05-…`).
6. `cd "/C${PWD#/?}" && npm run report:ai:demo` y comprueba que `playwright-report/ai-summary.txt` existe y habla del subtotal.
7. `git checkout -- specs/disenos`.

Informe: una línea por comprobación (✅/❌) y, al final, `✅ Demo lista` o `❌ No está lista: <qué arreglar>`. Recuerda abrir a mano las pestañas del navegador (Figma y `/cart.html` con dos productos) y tener el guion abierto fuera de la pantalla compartida. Si el guion y esta skill se contradicen, dilo aquí.
