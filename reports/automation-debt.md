# Deuda de automatización · finanzas-pareja

- **Fecha:** 2026-10-05
- **Escala de prioridad:**
  - 🔴 Abordar antes de depender de la suite en CI.
  - 🟠 Próxima iteración.
  - 🟡 Cuando se toque la zona.

| ID | Prio | Deuda | Impacto si no se aborda | Propuesta | Esfuerzo |
|---|---|---|---|---|---|
| AD-01 | 🔴 | **El CI no ejecuta la suite.** `playwright.yml` lanza `--project=chromium\|firefox\|webkit`, y esos projects excluyen `tests/finanzas-pareja/`. | Las regresiones y los arreglos de defectos no se detectan en los PR | Añadir `finanzas-pareja` a la matriz del workflow (o un job propio) y un paso `--grep @smoke` en cada push | S |
| AD-02 | 🔴 | **`retries: 2` en CI sin `failOnFlakyTests`.** | Un test intermitente queda en verde y solo se ve como *flaky* en el informe, que nadie mira | `failOnFlakyTests: !!process.env.CI`, o publicar el número de *flaky* como métrica que bloquea | XS |
| AD-03 | 🟠 | La **señal de fin de arranque** depende del texto de un mensaje interno de Playwright («Service Worker registration blocked by Playwright»). | Si cambia en una actualización de Playwright, **todos** los tests se agotan en `abrir()` con un *timeout* genérico | Añadir un `timeout` propio y un mensaje claro a la espera; fijar la versión de `@playwright/test` (hoy `^1.49.0`). Alternativa: pedir a la app una señal explícita (`data-listo` en `#app`) | S |
| AD-04 | 🟠 | Acoplamiento a la estructura de la app donde no hay semántica: 4 clases de bloques de cifras (`cifra.ts`), `#avisos`, `option:enabled` y `section`. | Un rediseño visual rompe esos localizadores, aunque concentrados en 6 líneas de page objects | Pedir `data-testid` en KPIs, totales y la capa de avisos, y configurar `testIdAttribute` | S (app) + XS (tests) |
| AD-05 | 🟠 | **No hay lint.** | Errores como un `await` olvidado o un `waitForTimeout` solo se detectan revisando a mano | ESLint + `eslint-plugin-playwright` (`no-wait-for-timeout`, `missing-playwright-await`, `no-force-option`, `prefer-web-first-assertions`) | S |
| AD-06 | 🟠 | **Tests de defecto conocido (`test.fail`).** Un fallo por cualquier causa cuenta como «esperado». | Un locator roto dentro de un test `@bug` pasaría inadvertido | Mantenerlos cortos, con la aserción del defecto como primer punto de fallo. Añadir un reporter que compruebe que cada `@bug-Dxx` falla en su línea esperada (como se hizo a mano en `qa-code-review.md` §4) | M |
| AD-07 | 🟡 | Ids internos de categoría (`'supermercado'`, `'fondo-emergencia'`…) en tests y semillas. | Un cambio de ids rompe varios ficheros | Constantes `CATEGORIA.supermercado` en `test-data` | XS |
| AD-08 | 🟡 | `helpers/modulos-app.ts` usa `new Function` para el `import()` dinámico. | Romperá si la app añade una CSP sin `unsafe-eval` | Cambiar a `page.addScriptTag({ type: 'module' })` si llega a pasar | S |
| AD-09 | 🟡 | `logica-pura.spec.ts` abre la app completa en cada caso (13 cargas). | Unos 13 s de suite sin valor añadido | Página de *worker scope* para la lógica pura | S |
| AD-10 | 🟡 | La trazabilidad escenario ↔ test va en comentarios (`// ALTA-01`). | La matriz de cobertura se mantiene a mano | `annotation: { type: 'scenario', description: 'ALTA-01' }` y generar la matriz desde el informe JSON | S |
| AD-11 | 🟡 | Solo Chromium de escritorio. | La app es móvil primero: no se valida en el contexto real de uso | Añadir `Pixel 7` / `iPhone 14` al smoke y Firefox / WebKit en nightly | S |
| AD-12 | 🟡 | La suite apunta a **producción** (`finanzas-churritos.netlify.app`) sin versión fijada. | Un despliegue de la app cambia los resultados sin que cambie la suite. La carga paralela depende de la red y del CDN (ver `flakiness-report.md`) | Entorno de preview o copia local (OQ-01) y limitar los workers del project | M |
| AD-13 | 🟡 | PER-01 depende del **orden** de creación para esquivar D02 (comentado en el test). | Si alguien reordena el test, vuelve a ser inestable mientras D02 exista | Se puede retirar cuando se arregle D02 | — |
| AD-14 | 🟡 | P2 y P3 sin automatizar (33 escenarios). | Hay huecos de cobertura conocidos (moneda D07, deshacer ejemplo D09, signos D12, regla 50/30/20…) | Siguiente ola, empezando por AJU-01, DEMO-02, LIST-05 y ALTA-07/08 | L |
| AD-15 | 🟡 | El límite de 1 s del test D11 asume que la app reacciona en menos de 1 s. | En una máquina muy cargada podría dar un falso «fallo esperado». Hoy no es un riesgo de PASS falso | Sustituirlo por control de reloj (`page.clock.install` + `runFor`) cuando la fixture lo permita | S |
