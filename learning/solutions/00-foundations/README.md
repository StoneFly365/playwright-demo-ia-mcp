# Soluciones — Módulo 00

Todo el código de esta carpeta se ha ejecutado y está en verde: **36 tests** entre Labs, Challenge y assessment.

| Fichero | Cubre | Tests verificados |
|---|---|---|
| [lab-1.md](lab-1.md) | Hoja de observación (6 respuestas) | 8 (fichero dado, sin modificar) |
| [lab-2.md](lab-2.md) | Ordenación parametrizada + conversión de precios | 5 |
| [lab-3.md](lab-3.md) | `parsePrecio`, `total`, `masBarato` | 7 |
| [lab-4.md](lab-4.md) | Diagnóstico y corrección de 3 fallos | 3 |
| [challenge-1.md](challenge-1.md) | Resumen de carrito tipado | 7 |
| [assessment-key.md](assessment-key.md) 🔒 | Clave P1-P10 y E1-E2 | 6 |

## Cómo verificar una solución

Copia el código de la solución sobre el fichero correspondiente en `learning/student/sandbox/00-foundations/` y ejecuta:

```bash
npx playwright test -c learning/student/sandbox
npx tsc --noEmit
```

## Estado esperado del sandbox según el avance

| Momento | Tests | Verde |
|---|---|---|
| Estado inicial (recién clonado) | 20 | 13 ✅ / 7 ❌ (esperado) |
| Tras Lab 2 | 23 | 16 ✅ / 7 ❌ |
| Tras Lab 3 | 23 | 20 ✅ / 3 ❌ |
| Tras Lab 4 | 23 | 23 ✅ |
| Tras Challenge 1 | 29+ | 29+ ✅ |
