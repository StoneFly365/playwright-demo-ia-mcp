# Soluciones — Módulo 01

Todo el código de esta carpeta se ha **ejecutado contra la aplicación real** durante la construcción del módulo, en Chromium, y está en verde salvo donde se indica explícitamente que un test debe fallar.

| Fichero | Cubre | Estado verificado |
|---|---|---|
| [lab-1.md](lab-1.md) | Tabla de 6 ejecuciones, informe HTML, clasificación de fallos | Suite del proyecto: 87 tests, 77 ✅ / 10 ❌ en Chromium |
| [lab-2.md](lab-2.md) | Medición del auto-waiting y de los métodos sin reintento | 5 versiones ejecutadas, con sus tiempos |
| [lab-3.md](lab-3.md) | Tabla de decisión de 12 elementos + tests de respaldo | 6 tests ✅ |
| [lab-4.md](lab-4.md) | Ordenación A→Z + segundo hueco de cobertura | 2 tests ✅ en los 3 navegadores |
| [lab-5.md](lab-5.md) | Diagnóstico y corrección de los 2 casos reales | 2 tests ✅ tras corrección |
| [lab-6.md](lab-6.md) | Codegen | ⚠️ **Sin validar** — ver el fichero |
| [challenge-1.md](challenge-1.md) | Compra completa con importes | 3 tests ✅ |
| [assessment-key.md](assessment-key.md) 🔒 | Clave A1-A8, E1, E2 y Parte C | E1 ✅ · E2: 2 fallos reproducidos y corregidos |

## Cómo verificar una solución

Copia el código a `learning/student/sandbox/01-playwright/` y ejecuta:

```bash
npx playwright test -c learning/student/sandbox/01-playwright --project=chromium
npx tsc --noEmit
```

## Estado esperado del sandbox según el avance

| Momento | Tests | Verde |
|---|---|---|
| Estado inicial (recién clonado) | 6 | 4 ✅ / 2 ❌ (esperado: son el Lab 5) |
| Tras el Lab 2 | 8+ | 6+ ✅ / 2 ❌ |
| Tras el Lab 3 | 12+ | 10+ ✅ / 2 ❌ |
| Tras el Lab 4 | 14+ | 12+ ✅ / 2 ❌ |
| Tras el Lab 5 | 14+ | **todos ✅** |
| Tras el Challenge | 18+ | todos ✅ |

## Formato de cada solución

1. **Código de referencia**, verificado en verde.
2. **Por qué así**: la razón de cada decisión, no solo el resultado.
3. **Alternativas válidas**: en este módulo casi nunca hay una única respuesta correcta, y la justificación pesa más que la elección.
4. **Errores habituales**: lo que suele salir mal, y por qué.
5. **Cómo validar**: el comando exacto y la salida esperada.

## Regla que el formador debe defender en este módulo

En el módulo 01 hay dos tentaciones nuevas, y las dos invalidan el ejercicio:

1. **Resolver una ambigüedad con `.first()`.** El error desaparece, el problema no. Está penalizado en el assessment.
2. **Corregir el caso B del Lab 5 en el test en vez de en el Page Object.** El defecto está en `05-cart.page.ts` (la copia del sandbox) y ahí va la corrección. Cambiar el locator dentro del test lo sortea y deja `cartItems` roto. Se convierte en conversación: *¿qué le pasa al siguiente test que use `cartItems`?*

## Para el formador

`assessment-key.md` **no se comparte con el grupo**. Si el módulo se imparte en varias ediciones, conviene rotar el producto de E1 (el más barato) y el usuario de E2.
