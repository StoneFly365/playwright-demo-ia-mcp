# 📦 Ejemplos — plan B de la ruta

**Si tu entorno no puede ejecutar la IA, coge lo de aquí y sigue adelante.** Ningún módulo de la ruta se bloquea por una herramienta externa.

---

## Qué es esto

Salidas **reales** del pipeline de IA de este repositorio, no inventadas: se generaron ejecutando

```bash
npm run test:demo:fail -- --project=chromium
npm run report:ai
```

el 19 de agosto de 2026, sobre los 10 fallos intencionados en Chromium, con el CLI de Claude.

## Cuándo usarlos

| Situación | Qué hacer |
|---|---|
| 🟢 `report:ai` funciona en tu máquina | **Usa tu propia salida.** Es la experiencia recomendada |
| 🟡 No tienes el CLI, falla la autenticación, la red lo bloquea, o llevas más de 5 minutos peleándote | **Usa estos ficheros y continúa.** El ejercicio es auditar la salida, no generarla |

No pierdas veinte minutos arreglando una CLI. El aprendizaje está en la revisión crítica.

## Los ficheros

| Fichero | Tamaño | Se usa en |
|---|---|---|
| [`ai-summary.txt`](ai-summary.txt) | 1,3 KB | Módulo 1 (auditoría) · Módulo 2 (comparar prompts) |
| [`ai-corrections.md`](ai-corrections.md) | 4,2 KB | Módulo 1 · Módulo 6 (contrastar con tu diagnóstico) |
| [`ai-failures-grouped.json`](ai-failures-grouped.json) | 3,5 KB | Módulo 2 (entrada de los prompts) · Módulo 6 (agrupación) |
| [`ai-tickets.json`](ai-tickets.json) | 4,3 KB | Módulo 1 (severidad) |
| [`fallo-logout.md`](fallo-logout.md) | 2,2 KB | Módulo 6 (diagnóstico a ciegas) |

Todos caben de sobra en un chat. Ese era el problema del plan B anterior.

## Un aviso que es también la lección

`ai-summary.txt` concluye:

> "La aplicación no funciona en operaciones críticas. [...] Se requiere corrección inmediata."

**Es falso.** SauceDemo funciona perfectamente: los que están mal son los diez tests, que esperan valores incorrectos a propósito. La IA solo vio `test-results.json`, no el código, y de "10 de 10 en rojo" dedujo "aplicación rota".

No es un ejemplo defectuoso que haya que sustituir: es el material del módulo 1. Una salida con formato impecable y una conclusión que, enviada a dirección, habría parado un despliegue sin motivo.

---

← [Volver al índice de la ruta](../README.md)
