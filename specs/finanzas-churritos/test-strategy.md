# Estrategia de pruebas · Mis Finanzas (finanzas-churritos)

> Fase actual: **DISCOVERY + PLANNING**. Este documento no contiene código. La siguiente fase (GENERATOR) usará esta estrategia y `test-scenarios.md` como entrada.

## 1. Objetivo y alcance

Validar con Playwright que una app de finanzas personales **100 % local** (SPA vanilla JS + IndexedDB) registra, calcula y conserva el dinero del usuario sin pérdidas ni errores de cálculo.

| Dentro de alcance | Fuera de alcance (por ahora) |
|---|---|
| Alta de movimientos (a mano, texto, lote) | Sincronización real con Supabase (requiere un proyecto propio, ver `open-questions.md`) |
| Listado, filtros, detalle, edición, duplicado y borrado | Dictado por voz real (micrófono y Web Speech API) |
| Inicio, Plan (presupuestos, metas, recurrentes), Análisis | Precisión del OCR (depende de Tesseract y del CDN) |
| Ajustes, export/import, datos de ejemplo, borrado total | Rendimiento y carga, instalación PWA nativa |
| Persistencia en IndexedDB y parámetros de URL | Validación visual píxel a píxel de las gráficas SVG |

## 2. Riesgos de producto (ordenados)

| # | Riesgo | Impacto | Probabilidad | Evidencia |
|---|---|---|---|---|
| R1 | Datos corruptos o importes inválidos que contaminan todos los totales | Crítico | Alta | D08, D01 |
| R2 | Pérdida de datos introducidos por el usuario (formularios, borrado, deshacer) | Alto | Alta | D02, D09 |
| R3 | Duplicados o entidades huérfanas (metas, presupuestos) | Alto | Alta | D03, D09 |
| R4 | Cálculos incorrectos (KPIs, presupuestos, metas, proyecciones) | Alto | Media | D04, D06; las cifras son heurísticas |
| R5 | Persistencia: datos que no sobreviven a una recarga, o una copia que no restaura | Crítico | Baja | Recarga OK; el round-trip no se ha verificado de extremo a extremo |
| R6 | El parser de texto en español interpreta mal el importe, la fecha o el tipo | Medio | Media | Heurísticas por palabras clave |
| R7 | Incoherencias de presentación (moneda, signos) | Medio | Alta | D07, D12 |
| R8 | Regresiones por el repintado global del DOM (elementos que se desacoplan) | Medio | Alta | Arquitectura con `innerHTML` |

## 3. Niveles y tipos de prueba

| Nivel | Qué cubre | Técnica Playwright | Peso |
|---|---|---|---|
| **E2E de interfaz** | Journeys J1 a J8 y validaciones de formularios | `page` + localizadores accesibles | ~60 % |
| **Lógica pura en el navegador** | `aNumero`, `parsearFecha`, `clasificar`, `parsearMovimiento`, umbrales | `page.evaluate(() => import('/js/formato.js'))` con tablas de datos. Rápido y sin interfaz | ~25 % |
| **Estado y persistencia** | IndexedDB, recarga, import/export, aislamiento | `page.evaluate` sobre IndexedDB, `page.reload()`, `waitForEvent('download')`, `setInputFiles` | ~10 % |
| **Simulación del entorno** | Error de IndexedDB, falta de Web Speech API, sin conexión | `addInitScript`, `context.setOffline`, `page.route` | ~5 % |

**No hay API propia que probar:** la app no hace peticiones de datos. Las pruebas de API (`request` de Playwright) solo tendrían sentido contra Supabase, cuando se defina un entorno (ver `open-questions.md`).

## 4. Decisiones técnicas para la fase GENERATOR

1. **Reloj fijo.** Usar `page.clock.setFixedTime(...)` en todos los tests con fechas. La app depende de «hoy» para el mes actual, «Hoy/Ayer», la previsión de cierre, la media diaria y las proyecciones. Sin reloj fijo, los tests serán inestables cada cambio de mes.
2. **Aislamiento.** Cada test usa un `BrowserContext` nuevo y, por tanto, un IndexedDB vacío. No hace falta limpiar datos entre tests.
3. **Siembra rápida de datos.** No crear datos por la interfaz salvo en el test que valida ese flujo. Hay dos opciones:
   - (a) Importar un JSON fixture con `setInputFiles`. Pasa por la validación real.
   - (b) Llamar al propio módulo de la app con `page.evaluate(() => import('/js/db.js'))` y `guardarMovimientos(...)`, y después recargar.
   Recomendado: **(b) para preparar el estado** y (a) solo en los tests de import.
4. **Service worker bloqueado** (`serviceWorkers: 'block'`) en el proyecto por defecto, para que una caché antigua no sirva una versión vieja. Para la prueba offline (PER-02) se usará un proyecto aparte con el service worker permitido.
5. **Localizadores**, en este orden de preferencia:
   - `getByRole`: navigation «Secciones», dialog/alertdialog por su nombre, tab, searchbox, combobox «Rango de fechas» / «Filtrar por categoría», botones con texto.
   - `getByLabel`: «Importe», «Objetivo», «¿Para qué ahorras?».
   - Atributos estables de la app como último recurso: `[data-campo="..."]` y `[data-accion="..."]`. **No usar clases CSS.**
6. **Repintado global.** Cada aviso (y su caducidad a los 5 s) reemplaza todo el DOM. En la práctica:
   - Usar siempre aserciones web-first (`expect(locator)...`).
   - No guardar `ElementHandle`.
   - Volver a obtener el localizador después de cada acción.
7. **Avisos.** Comprobar el texto con `getByRole('status').filter({ hasText })`. No depender del orden ni de esperas fijas. Los avisos se acumulan.
8. **Defectos conocidos.** Los tests que cubren D01 a D12 se escriben con el comportamiento **correcto** esperado, se marcan con `test.fail()` y se etiquetan `@bug-Dxx`. Así la suite sigue en verde mientras el defecto exista y avisa cuando se arregle.
9. **Etiquetas:** `@smoke` (P0), `@critical` (P1), `@regression` (P2), `@exploratory` (P3), más `@bug-Dxx`.
10. **Navegadores:** Chromium en cada push. Firefox y WebKit en nightly (la app es móvil primero: añadir el proyecto `Mobile Safari` / `Pixel 7` para P0).

## 5. Estructura replicable del arquetipo

Patrón para este proyecto y para los siguientes sitios o APIs del arquetipo. Esta fase solo crea los ficheros de `specs/`.

```
specs/<app>/                  ← discovery y planning (esta fase)
  application-map.md
  test-strategy.md
  test-scenarios.md
  coverage-matrix.md
  open-questions.md
tests/<app>/                  ← specs generados (fase GENERATOR)
  <feature>.spec.ts
  fixtures.ts                 ← fixtures de la app (reloj, siembra, página)
pages/<app>/                  ← page objects (solo si aportan; fase GENERATOR)
playwright.config.ts          ← un project por app con su baseURL
```

## 6. Datos de prueba

| Conjunto | Uso | Fuente |
|---|---|---|
| `vacio` | Bienvenida, estados vacíos, validaciones | Contexto nuevo |
| `mes-basico` | 1 ingreso, 4 gastos de categorías distintas y 1 ahorro en el mes fijado | Fixture JSON propio |
| `tres-meses` | Recurrentes, medias, proyecciones, variaciones | «Cargar datos de ejemplo» (42 movimientos, 4 presupuestos, 2 metas) con reloj fijo |
| `limites` | Importes 0,001 / 0,01 / 999 999,99, textos de 500 caracteres, HTML `<script>`, fechas 29-feb / 31-dic / 1-ene | Tablas en el test |
| `import-invalidos` | JSON roto, sin fecha, importe negativo, 0, «abc», `{}` | Fixtures JSON |

## 7. Criterios de entrada y salida

- **Entrada a GENERATOR:** este plan revisado y las preguntas abiertas críticas (OQ-01 a OQ-05) respondidas o asumidas de forma explícita.
- **Salida de la primera ola:**
  - Los 13 escenarios P0 automatizados y estables: 0 flaky en 3 ejecuciones seguidas.
  - Los tests `@bug` de los defectos D02, D03, D05 y D08 escritos.
  - Tiempo de la suite smoke por debajo de 2 minutos en Chromium.

## 8. Supuestos

- La exploración se hizo en Chromium de escritorio el 2026-10-05. Puede que el comportamiento móvil difiera en el diseño, no en la lógica.
- El código fuente servido es el que se ejecuta. Lo marcado como [Código] no se ha ejercitado en la interfaz.
- Las reglas de negocio no documentadas (umbral del 100 % como «superado», medias que cuentan meses sin datos, recurrentes que incluyen ahorro) se tratan como **preguntas abiertas**, no como defectos.
