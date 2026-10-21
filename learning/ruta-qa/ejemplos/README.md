# 📦 Ejemplos — plan B de la ruta

**Si tu entorno no puede ejecutar la IA, coge lo de aquí y sigue adelante.** Ningún módulo de la ruta se bloquea por una herramienta externa.

---

## Qué es esto

Salidas **reales** del pipeline de IA de este repositorio, no inventadas: se generaron ejecutando

```bash
npm run test:demo:fail -- --project=chromium
npm run report:ai
```

el 21 de octubre de 2026, sobre los 10 fallos intencionados en Chromium, con el CLI de Claude (Claude Haiku 5.5).

La excepción es `ai-tickets.json`. Con esos diez fallos sale vacío (`[]`), porque el reporte solo abre tickets para fallos de la aplicación y los diez son fallos de los tests. El de esta carpeta se generó con el escenario `bug`, en el que el contador del carrito cuenta un producto de más:

```bash
npm run test:scenario:bug -- --project=chromium
npm run report:ai
```

## Cuándo usarlos

| Situación | Qué hacer |
|---|---|
| 🟢 `report:ai` funciona en tu máquina | **Usa tu propia salida.** Es la experiencia recomendada |
| 🟡 No tienes el CLI, falla la autenticación, la red lo bloquea, o llevas más de 5 minutos peleándote | **Usa estos ficheros y continúa.** El ejercicio es auditar la salida, no generarla |

No pierdas veinte minutos arreglando una CLI. El aprendizaje está en la revisión crítica.

## Los ficheros

| Fichero | Tamaño | Se usa en |
|---|---|---|
| [`ai-summary.txt`](ai-summary.txt) | 1,4 KB | Módulo 1 (auditoría) · Módulo 2 (comparar prompts) |
| [`ai-corrections.md`](ai-corrections.md) | 5,9 KB | Módulo 1 · Módulo 6 (contrastar con tu diagnóstico) |
| [`ai-failures-grouped.json`](ai-failures-grouped.json) | 29 KB (incluye la instantánea de la página de cada grupo) | Módulo 2 (entrada de los prompts) · Módulo 6 (agrupación y clasificación) |
| [`ai-tickets.json`](ai-tickets.json) | 3,5 KB | Módulo 1 (severidad). Generado con el escenario `bug` |
| [`fallo-logout.md`](fallo-logout.md) | 2,2 KB | Módulo 6 (diagnóstico a ciegas) |

Todos caben de sobra en un chat. Ese era el problema del plan B anterior.

## Un aviso que es también la lección

La versión anterior de este reporte, generada en agosto, concluía en `ai-summary.txt`:

> "La aplicación no funciona en operaciones críticas. [...] Se requiere corrección inmediata."

**Era falso.** SauceDemo funciona perfectamente: los que están mal son los diez tests, que esperan valores incorrectos a propósito. Aquella IA solo veía `test-results.json` y de "10 de 10 en rojo" dedujo "aplicación rota".

La versión actual acierta en lo importante: *"Ninguna de las pruebas fallidas ha detectado un error real de la aplicación"*. Ahora la IA ve, además del error, la instantánea de la página en el momento del fallo, y puede comparar lo que espera el test con lo que muestra la aplicación.

Pero sigue rellenando huecos. Dice que las pruebas *"esperan valores o comportamientos que ya no coinciden"*, como si se hubieran quedado desactualizadas, y recomienda corregirlas. No se quedaron desactualizadas: se rompieron a propósito, y eso no lo podía saber.

Ese es el material del módulo 1: darle más contexto mejora mucho la conclusión, pero lo que no le das, se lo inventa.

---

← [Volver al índice de la ruta](../README.md)
