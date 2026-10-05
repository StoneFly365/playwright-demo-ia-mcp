# Arquitectura de la automatización

Suite Playwright + TypeScript del arquetipo. La primera aplicación automatizada es **Mis Finanzas** (`finanzas-churritos`). El mismo patrón sirve para cualquier otra app o API que se añada al repositorio.

- Especificaciones de origen: [`specs/finanzas-churritos/`](../specs/finanzas-churritos/)
- Estado de la cobertura: [`specs/finanzas-churritos/coverage-matrix.md`](../specs/finanzas-churritos/coverage-matrix.md)

## 1. Estructura

```
playwright.config.ts                 ← un project por app (testDir + baseURL + contexto)
tests/<app>/*.spec.ts                ← specs por funcionalidad, escritos en lenguaje de negocio
pages/<app>/*.ts                     ← page objects pequeños, uno por vista o componente
fixtures/<app>.ts                    ← test extendido: reloj fijo + page object raíz
test-data/<app>/*.ts                 ← datos explícitos y reproducibles (builders y tablas)
helpers/<app>/*.ts                   ← utilidades técnicas sin interfaz (siembra, llamadas a módulos)
specs/<app>/*.md                     ← discovery y plan (fase PLANNER)
```

Para **añadir una app nueva** hay que dar tres pasos:

1. Crear las carpetas `<app>` en cada nivel.
2. Añadir su project en `playwright.config.ts`.
3. Incluirla en `APPS`, para que los projects genéricos (chromium, firefox, webkit, usados por la seed de los agentes) no la ejecuten sin su `baseURL`.

### finanzas-churritos

| Carpeta | Contenido |
|---|---|
| `tests/finanzas-churritos/` | `arranque-navegacion`, `alta-manual`, `alta-texto`, `logica-pura`, `movimientos`, `inicio`, `presupuestos`, `metas`, `copias`, `datos-ejemplo`, `persistencia` |
| `pages/finanzas-churritos/` | `finanzas-app` (armazón y entrada), `alta-movimiento`, `formulario-movimiento`, `movimientos` (+ `DetalleMovimiento`), `inicio`, `presupuestos`, `metas`, `ajustes`, `cifra` |
| `fixtures/finanzas-churritos.ts` | `test` y `expect` de la app |
| `test-data/finanzas-churritos/` | `fechas`, `datos` (tipos, builders `gasto` / `ingreso` / `ahorro`, `MES_BASICO`), `interpretacion` (tablas de importes y frases), `importaciones` (archivos inválidos) |
| `helpers/finanzas-churritos/` | `modulos-app` (`llamar`: ejecuta una función de un módulo de la app en el navegador) y `almacen` (`sembrar`) |

Comandos:
- `npm run test:finanzas`: ejecuta la suite.
- `npm run typecheck`: comprueba los tipos.
- `npx playwright test --project=finanzas-churritos --grep @smoke`: solo el smoke.

## 2. Estrategia de localizadores

En este orden de preferencia:

1. **`getByRole` con nombre accesible**: `navigation «Secciones»`, `dialog «Nuevo movimiento»`, `alertdialog`, `tab`, `searchbox`, `combobox «Rango de fechas»`, `checkbox`, `term`/`definition` del detalle, `status` de los avisos. La app los expone bien.
2. **`getByLabel`** en formularios: «Importe», «Categoría», «¿Para qué ahorras?», «Límite mensual»… Siempre con la búsqueda acotada a la hoja (`dialog`). Así se evitan coincidencias como «Categoría» dentro de «Filtrar por categoría».
3. **`getByPlaceholder` / `getByText`** solo cuando no hay rol ni etiqueta (el textarea de «Escribir», el recuento de «Tus datos»).
4. **Selectores estructurales, como excepción documentada y siempre dentro de un page object.** La app no tiene `data-testid` ni roles en sus bloques de cifras:
   - `cifra(bloque, etiqueta)`: los KPIs y totales son `<span>etiqueta</span><strong>valor</strong>`. La clase del bloque (`.kpis`, `.tira-datos`, `.totales-filtro`, `.datos-presupuesto`) se decide en un único sitio, `pages/<app>/cifra.ts` y sus llamadas.
   - `option:enabled`: cuenta las categorías disponibles. La app deshabilita, no elimina.
   - `section` filtrada por su `heading`: las tarjetas de Inicio.
   - `..`: el padre de un `term` en el detalle.
   - `html[data-tema]`: el tema activo. Es el atributo que usa la app.

Ningún test usa XPath ni clases CSS directamente. Si la app añade `data-testid`, solo cambian `cifra.ts` y esas pocas líneas.

## 3. Page Objects

- **Pequeños y por vista.** `FinanzasApp` solo contiene el armazón: cabecera, navegación, avisos, confirmación, `abrir` / `recargar` / `irA` / `irAPlan` / `irAAjustes`. Expone una instancia de cada vista.
- **Componente compartido:** `FormularioMovimiento` se construye sobre la hoja que lo contiene y se reutiliza en tres sitios: «A mano», «Revisa y confirma» y «Editar movimiento».
- **Exponen localizadores y acciones de negocio** (`crear`, `aportar`, `importar`, `exportar`). **No contienen aserciones**: estas viven en los tests, para que cada test diga explícitamente qué comprueba.
- No hay page objects para lo que no se reutiliza. Por ejemplo, la pantalla de la nube no tiene uno.

## 4. Fixtures

`fixtures/finanzas-churritos.ts` extiende `test` con:

| Fixture | Qué hace |
|---|---|
| `page` | Fija el reloj en **2026-10-05 12:00 Europe/Madrid** (`page.clock.setFixedTime`) antes de cualquier navegación. Los temporizadores siguen corriendo, así que los avisos caducan a los 5 s como en la realidad. |
| `app` | Crea el page object raíz `FinanzasApp`. |

`app.abrir(datos?)` abre la app y, si se le pasan datos, los **siembra con la propia capa de persistencia de la app** (`/js/db.js`, vía `helpers/.../almacen.ts`) y recarga la página. Cada test parte del estado que necesita en milisegundos, y la interfaz solo se usa en el flujo que se valida.

## 5. Datos de prueba

- **Explícitos en el test o en `test-data`.** Los builders `gasto(45.9, 'supermercado', 'Mercadona', { metodoPago: 'tarjeta' })` dejan ver el dato que importa.
- **`MES_BASICO`** es un mes redondo pensado para calcular a mano: ingresos 2000, gastos 650, ahorro 300, balance 1350, tasa del 67,5 %. Se reutiliza en varias specs.
- **Tablas con oráculo** (`interpretacion.ts`): los valores esperados de `aNumero` y `parsearMovimiento` salen de ejecutar la lógica de la app y se revisaron a mano. Al hacerlo apareció D13.
- **Fechas fijas** (`fechas.ts`): `HOY`, `AYER`, `MES_ACTUAL`, `MES_ANTERIOR`.
- Los archivos de importación se generan en memoria (`buffer`). No se escriben ficheros en disco.

## 6. Aserciones

- **Siempre web-first** (`await expect(locator)…`): reintentan hasta que se cumplen. No hay `waitForTimeout` ni `sleep`.
- **Valores concretos de negocio**, no solo visibilidad: `toHaveText('650 €')`, `toContainText('45,90 € / 100 €')`, `toHaveValue('supermercado')`, `toHaveAccessibleName('Guardar 3 movimientos')`.
- **Antes de comprobar que algo NO ha cambiado, el test espera la respuesta de la app.** Normalmente esa respuesta es su aviso. Este fallo se detectó en la suite: «la meta no se ha creado» también es cierto durante los milisegundos en que la app todavía está guardando en IndexedDB, y el test pasaba por casualidad.
- **Los defectos conocidos se prueban con el comportamiento correcto**, con `test.fail()`, la etiqueta `@bug-Dxx` y una anotación `issue`. La suite queda en verde mientras el defecto existe. Cuando se arregle, Playwright marcará el test como «expected to fail but passed» y habrá que quitar la marca.
- Las aserciones sobre ficheros descargados (JSON y CSV) leen el contenido real: nombre, cabecera, separador, decimal y BOM.

## 7. Aislamiento

- **Cada test tiene un `BrowserContext` nuevo**, y por tanto un IndexedDB vacío. No hay limpieza entre tests ni orden de ejecución: `fullyParallel` está activo.
- **Ningún test depende de datos creados por otro.** Los tests que necesitan estado previo lo siembran.
- **`serviceWorkers: 'block'`** evita que una caché del service worker sirva otra versión de la app.
- La app es 100 % local: los tests no dejan datos en ningún servidor.

## 8. Estrategia anti-flakiness

| Riesgo | Medida |
|---|---|
| La fecha del sistema cambia el resultado (mes actual, «Hoy», previsiones) | Reloj fijo en la fixture `page` |
| **La app sigue repintando todo el DOM tras ocultar «Cargando…»** (arranque del motor de sincronización), y ese repintado borra lo que se esté escribiendo en una hoja (D02) | `abrir()` y `recargar()` esperan la **señal determinista de fin de arranque**: el último paso de la app es registrar el service worker, que el proyecto bloquea, y Playwright lo anuncia en consola («Service Worker registration blocked by Playwright»). Se detectó con un test intermitente y se verificó con una traza |
| Cada aviso repinta el DOM y desengancha elementos | Localizadores perezosos resueltos en cada acción. Nunca se guardan `ElementHandle` |
| Un aviso que caduca a mitad de un formulario de hoja lo vacía (D02) | Los tests no encadenan dos formularios de hoja seguidos. PER-01 crea el presupuesto antes que el movimiento, porque el formulario de movimiento sí sincroniza lo escrito |
| Aserciones negativas que pasan antes de tiempo | Sincronizar primero con la respuesta de la app (ver §6) |
| Datos compartidos o restos de otros tests | Contexto nuevo por test y siembra explícita |

**Verificación:** la suite completa se ejecutó 3 veces seguidas (`--repeat-each=3`): 279 de 279 ejecuciones con el resultado esperado y 0 flaky.

## 9. Limitaciones y pendientes conocidos

- **CI.** El workflow `.github/workflows/playwright.yml` ejecuta `--project=chromium|firefox|webkit`, y esos projects excluyen las carpetas de apps. Hace falta añadir `finanzas-churritos` a la matriz. No se ha tocado el workflow en esta fase.
- **Navegadores.** De momento solo Chromium de escritorio, como fija la estrategia. Firefox, WebKit y móvil quedan para la ola P2.
- **Dependencia de `serviceWorkers: 'block'`** para la señal de arranque. PER-02 (offline, P3) necesitará un project con el service worker permitido y otra señal de arranque.
- **Lint.** El proyecto no tiene ESLint configurado. Solo hay `tsc --noEmit` (`npm run typecheck`).
- **Siembra acoplada a `/js/db.js`.** Si la app cambia su capa de persistencia, solo cambia `helpers/finanzas-churritos/almacen.ts` (supuesto OQ-04).
