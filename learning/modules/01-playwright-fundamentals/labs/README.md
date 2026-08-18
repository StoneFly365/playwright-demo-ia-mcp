# Módulo 01 — Labs

Cinco ejercicios obligatorios en orden estricto, más uno opcional. Cada uno sube un nivel en la progresión pedagógica del programa.

| Lab | Nivel | Qué haces | Estado inicial | Tiempo |
|---|---|---|---|---|
| [Lab 1](lab-1-suite-real.md) | **1 · FOLLOW** | Ejecutas la suite real de seis formas e interpretas lo que devuelve | Suite del proyecto: 69 ✅ / 10 ❌ | 45 min |
| [Lab 2](lab-2-auto-waiting.md) | **2 · MODIFY** | Rompes el auto-waiting a propósito y mides el coste | Verde (2 tests) | 45 min |
| [Lab 3](lab-3-locators.md) ⭐ | **2 · MODIFY → 4 · DESIGN** | Eliges y justificas un locator por elemento | Verde (2 tests) | 60 min |
| [Lab 4](lab-4-test-que-falta.md) | **3 · CREATE** | Escribes dos tests para huecos de cobertura reales | Vacío | 60 min |
| [Lab 5](lab-5-troubleshoot.md) | **5 · TROUBLESHOOT** | Diagnosticas dos fallos auténticos de localización | **Rojo (2 fallos)** | 50 min |
| [Lab 6](lab-6-codegen.md) | 2 · MODIFY | *(Opcional)* Generas un test con `codegen` y lo criticas | — | 30 min |

## Antes de empezar

```bash
npm ci                     # solo la primera vez
npx playwright install     # ~500 MB, solo la primera vez
git checkout -b learning/01-playwright-<tu-nombre>
```

**A diferencia del módulo 00, estos ejercicios abren navegador y necesitan acceso a `https://www.saucedemo.com`.** Comprueba que tu entorno lo permite antes de la primera sesión:

```bash
npx playwright test --project=chromium tests/login.spec.ts
```

Si eso falla por red, proxy o certificados, **avisa al formador**: no es un problema tuyo, es el riesgo K1 del módulo.

## Comprobar el estado inicial de tu zona de trabajo

```bash
npx playwright test -c learning/student/sandbox/01-playwright --project=chromium
```

Debes ver exactamente esto:

```
2 failed
4 passed
```

Los **2 fallos son el Lab 5** y son correctos. Si ves otra cifra, algo se ha modificado antes de tiempo: consulta con el formador.

## Progresión esperada del sandbox

| Momento | Tests | Verde |
|---|---|---|
| Estado inicial | 6 | 4 ✅ / 2 ❌ (esperado) |
| Tras el Lab 2 | 8+ | 6+ ✅ / 2 ❌ |
| Tras el Lab 3 | 12+ | 10+ ✅ / 2 ❌ |
| Tras el Lab 4 | 14+ | 12+ ✅ / 2 ❌ |
| Tras el Lab 5 | 14+ | **todos ✅** |
| Tras el Challenge | 18+ | todos ✅ |

Las cifras son mínimos: si escribes más tests de los pedidos, mejor.

## Reglas

1. **Solo se trabaja dentro de `learning/student/sandbox/01-playwright/`.** `tests/`, `pages/`, `scripts/` y la configuración raíz no se tocan en ningún Lab de este módulo — **incluido el locator roto de [`pages/cart.page.ts`](../../../../pages/cart.page.ts) que vas a descubrir en el Lab 5**. Ese defecto es el material del módulo 02.
2. **Nunca se modifica una aserción para llegar a verde.** Si un test falla, el problema está en el locator, en el código o en la aplicación.
3. **Diagnosticar antes que corregir.** En el Lab 5 el informe se escribe **antes** de tocar nada.
4. **Toda aserción que escribas lleva mensaje descriptivo**, en castellano y en lenguaje de negocio. Es el estándar de calidad del proyecto y aquí es obligatorio.
5. **Un commit por Lab**, con el Lab en el mensaje: `feat(lab-3): tabla de decisión de locators`.
6. **Las soluciones existen** en [`learning/solutions/01-playwright-fundamentals/`](../../../solutions/01-playwright-fundamentals/). Consultarlas antes de intentarlo tú convierte una hora de aprendizaje en cinco minutos de lectura.

## Ejecutar solo lo tuyo

```bash
# Todos tus ejercicios del módulo 01, en un solo navegador
npx playwright test -c learning/student/sandbox/01-playwright --project=chromium

# Un fichero concreto
npx playwright test -c learning/student/sandbox/01-playwright --project=chromium 03-locators.spec.ts

# Con el navegador visible, para ver qué hace
npx playwright test -c learning/student/sandbox/01-playwright --project=chromium --headed

# En los tres navegadores (el Challenge lo exige)
npx playwright test -c learning/student/sandbox/01-playwright
```

> **Usa `--project=chromium` mientras practicas.** No es por tiempo —la suite entera tarda ~22 s— sino por cortesía: diez personas ejecutando a la vez contra un servicio público y gratuito.
