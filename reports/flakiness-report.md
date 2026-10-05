# Informe de flakiness · finanzas-churritos

- **Fecha:** 2026-10-05
- **Método:**
  - Suite completa con los workers por defecto.
  - Repeticiones bajo estrés: `--repeat-each=5 --workers=16`, 465 ejecuciones por ronda.
  - Ejecución en serie (`--workers=1`) para descartar dependencias de orden.
  - Reproducción dirigida de cada fallo intermitente: sondas, trazas, `error-context`.

## Resumen

| ID | Tipo | Tests afectados | Frecuencia | Causa raíz | Estado |
|---|---|---|---|---|---|
| FLAKY-01 | **Test** (D + I) | «deshacer una aportación devuelve la meta a su estado anterior» | 2/5 con 16 workers. 0/3 con los workers por defecto | Carrera entre la caducidad del aviso (5 s) y el timeout de `expect` (5 s), que ocultaba el defecto real D11 | **Corregido**. 0 fallos en 465 ejecuciones posteriores |
| FLAKY-02 | **Test** (I), PASS falso | «el botón «Deshacer» desaparece una vez usado» | Pasaba siempre por la misma carrera | Igual que FLAKY-01: la caducidad del aviso hacía pasar el test | **Corregido**: ahora es el test `@bug-D11` |
| ENV-01 | **Entorno** (H) | Todos (setup `abrir()`) | 1 de 3 rondas de estrés (142/465 *timeouts*) y la ejecución final completa | El host `finanzas-churritos.netlify.app` deja de aceptar conexiones TCP | **Abierto**, fuera del control de la suite. Diagnóstico mejorado |

No queda ningún test inestable por causas propias de la suite.

---

## FLAKY-01 · «deshacer una aportación devuelve la meta a su estado anterior»

**Root cause:** D (timing) que ocultaba un bug de aplicación (A, D11). Tras pulsar «Deshacer», el aviso original conserva su botón hasta que caduca, 5 s después de crearse. La aserción `toHaveCount(0)` reintenta durante 5 s, de modo que el resultado dependía de qué terminaba antes:
- si el temporizador del aviso, el test pasaba;
- si el timeout del `expect`, el test fallaba.

Con 16 workers los temporizadores se retrasan y gana el `expect`.

**Evidence:**
- Ronda de estrés 1: 3/5 correctos. Los fallos están en la línea 127, `toHaveCount(0)`, con «Expected: 0 / Received: 1».
- Sonda dirigida justo después de deshacer: botón presente en 6/6 casos (3 de aportación y 3 de alta manual).
- El `error-context.md` del fallo ya no muestra avisos: se capturó cuando el aviso había caducado, y por eso no servía como prueba.

**Fix:**
1. Se quita esa comprobación de este test (D11 ya tiene su test propio).
2. Se refuerza el test con una aserción exacta, `Ya apartado = 0 €`: la anterior, `'0 € de 1000 €'`, también se cumplía con «150,50 € de 1000 €».
3. El test D11 usa un límite explícito de 1 s, por debajo de la vida del aviso.

**Confidence:** alta. La causa se reproduce de forma determinista con la sonda, y tras el cambio hubo 465/465 correctas.

**Recommendation:**
- Toda aserción que espere la **desaparición** de algo relacionado con un aviso debe tener un límite inferior a 5 s, o controlar el reloj con `page.clock.install()` (AD-15).
- Hay que revisar este patrón en P2/P3.

## FLAKY-02 · «el botón «Deshacer» desaparece una vez usado» (PASS falso)

**Root cause:** I (test conceptualmente incorrecto), con la misma mecánica que FLAKY-01. En la fase de automatización este test se usó para **descartar D11**, y fue un error: pasaba porque el aviso caducaba solo.

**Evidence:** la sonda inmediata muestra el botón visible 6/6 veces.

**Fix:** el test pasa a ser de defecto conocido (`test.fail()`, `@bug-D11`), con un límite de 1 s. D11 vuelve a constar como defecto en `specs/finanzas-churritos/application-map.md`.

**Confidence:** alta.

**Recommendation:** antes de descartar un defecto, reproducirlo con una comprobación inmediata, no con una aserción que reintenta durante más tiempo del que dura el estado que se observa.

## ENV-01 · El host de la aplicación deja de responder

**Root cause:** H (entorno). Las conexiones TCP a las IP de Netlify que sirven este sitio (`63.176.8.218` y `35.157.26.135`, en la región eu-central de AWS) agotan el tiempo de espera. Hay dos explicaciones posibles que no se pueden distinguir desde aquí:
- una caída del sitio;
- una limitación o bloqueo de la IP de origen tras la carga de las rondas de estrés: unas 1.500 cargas de página en pocos minutos contra producción.

**Evidence:**
- Ronda de estrés 2: 142/465 *timeouts* de 30 s, todos en la preparación (`beforeEach` / `abrir()`). Hubo entre 1 y 2 fallos por test, señal de una ventana temporal y no de un test concreto. Los artefactos se perdieron: la ejecución en serie siguiente limpió `test-results/` (error de procedimiento, ya corregido usando `--output` aparte).
- Ronda de estrés 3, minutos después: 465/465 correctas.
- Ejecución final: 81 tests con «page.waitForEvent: Timeout 15000ms exceeded while waiting for event "console"». La app nunca llega a cargar.
- `curl` desde la misma máquina:
  - `finanzas-churritos.netlify.app` → HTTP 000, *connection timed out* contra ambas IP.
  - `www.netlify.com`, `www.google.com` y `playwright.dev` → 200 en menos de 0,5 s.

  La red local funciona: el problema es solo de este host.

**Fix (dentro del alcance de la suite):**
- `abrir()` / `recargar()` tienen ahora un límite propio de 15 s para el arranque.
- Si se agota, el error es explícito: «La app no terminó de arrancar en 15 s. Revisa la red o el estado de Netlify antes de culpar al test.».
- Antes del cambio era un «Test timeout of 30000ms» genérico, y el rechazo podía escaparse si `goto()` seguía colgado.
- Verificado con un test durante la caída.

**Confidence:**
- media sobre la causa exacta (caída o limitación de IP);
- alta en que es de entorno y no de la suite: las mismas pruebas pasan 465/465 cuando el host responde, y los hosts de control responden durante la caída.

**Recommendation:**
1. **No hacer pruebas de estrés contra producción.** Usar un preview de Netlify o una copia local (OQ-01, AD-12).
2. Limitar los workers del project, por ejemplo `workers: 4` en CI.
3. Añadir un *health check* previo (`globalSetup`) que aborte la suite con un mensaje claro si el host no responde, en lugar de 93 fallos.
4. Ver el riesgo de enmascaramiento de abajo.

### Efecto secundario detectado: los tests `@bug` enmascaran caídas

En la ejecución final, con la app inaccesible, **12 tests de defecto conocido terminaron como «expected»**: `test.fail()` acepta cualquier fallo, también un *timeout* de red. Es la deuda AD-06 con evidencia real. Un informe solo con «expected / unexpected» habría contado 12 resultados correctos durante una caída total.

**Recommendation:**
- Un reporter o una comprobación en CI que verifique que cada `@bug-Dxx` falla en su aserción esperada;
- como mínimo, abortar la suite con el *health check* anterior.

---

## Ejecuciones de estabilidad

| Ronda | Config. | Resultado esperado | Inesperado | Comentario |
|---|---|---|---|---|
| Fase 1 | workers por defecto | 93/93 | 0 | Antes de la revisión |
| Estrés 1 | 5 × 16 workers | 463/465 | 2 | FLAKY-01 |
| Estrés 2 | 5 × 16 workers | 323/465 | 142 | ENV-01 (ventana de caída del host) |
| Serie | `--workers=1` | 93/93 | 0 | Sin dependencias de orden |
| Estrés 3 | 5 × 16 workers | **465/465** | 0 | Tras corregir R1–R6 |
| Final | workers por defecto | 12/93 | 81 | ENV-01: host inaccesible |
