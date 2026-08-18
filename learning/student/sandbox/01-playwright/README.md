# Sandbox — Módulo 01

Zona ejecutable de los ejercicios del módulo 01. Tiene **su propia configuración** de Playwright, separada tanto de la del proyecto como de la del módulo 00.

---

## Cómo se ejecuta

```bash
# Desde la raíz del proyecto — un solo navegador mientras practicas
npx playwright test -c learning/student/sandbox/01-playwright --project=chromium

# Un fichero concreto
npx playwright test -c learning/student/sandbox/01-playwright --project=chromium 03-locators.spec.ts

# Los tres navegadores (el Challenge lo exige)
npx playwright test -c learning/student/sandbox/01-playwright

# Viendo el navegador
npx playwright test -c learning/student/sandbox/01-playwright --project=chromium --headed
```

⚠️ **Estos ejercicios abren navegador y necesitan acceso a `https://www.saucedemo.com`.** Los del módulo 00 no. Si es tu primera vez:

```bash
npx playwright install     # ~500 MB, solo una vez
```

## Por qué tiene configuración propia

[`playwright.config.ts`](playwright.config.ts) de este directorio:

| Decisión | Efecto |
|---|---|
| `testDir: '.'` | Solo ve los ejercicios de esta carpeta |
| `baseURL: 'https://www.saucedemo.com'` | Permite `goto('/')`, igual que el proyecto |
| **`testIdAttribute: 'data-test'`** | Habilita `getByTestId()`. **Sin esta línea resolvería 0 elementos**: la aplicación usa `data-test` y Playwright asume `data-testid`. Es el bloque 3.2 del Lab 3 |
| 3 `projects` de navegador | Chromium, Firefox y WebKit, como el proyecto |
| `retries: 0` | Un fallo es un fallo. Nada se enmascara |
| `reporter: list` | Salida legible en terminal |

La configuración del módulo 00 (`learning/student/sandbox/playwright.config.ts`) **excluye esta carpeta** con `testIgnore`, así que `npx playwright test -c learning/student/sandbox` sigue ejecutando solo los ejercicios sin navegador del módulo anterior.

Y la configuración raíz del proyecto apunta a `./tests`: **ejecutar tus ejercicios no puede romper el CI**, y ejecutar la suite del proyecto no ejecuta tus ejercicios.

## Estado inicial

Recién clonado el repositorio:

```
2 failed
4 passed
```

| Fichero | Tests | Estado inicial | Por qué |
|---|---|---|---|
| `02-auto-waiting.spec.ts` | 2 | ✅ 2 verdes | Lab 2: punto de partida que amplías |
| `03-locators.spec.ts` | 2 | ✅ 2 verdes | Lab 3: el bloque 3.1 ya resuelto, como ejemplo |
| `05-diagnostico.spec.ts` | 2 | ❌ 2 rojos | Lab 5: dos fallos auténticos que debes diagnosticar |

> **Los 2 fallos son correctos.** Uno es una violación de strict mode de la aplicación real; el otro, un locator del proyecto que no encuentra nada. Los dos se diagnostican en el Lab 5.

## Progresión esperada

| Momento | Tests | Verde |
|---|---|---|
| Estado inicial | 6 | 4 ✅ / 2 ❌ |
| Tras el Lab 2 | 8+ | 6+ ✅ / 2 ❌ |
| Tras el Lab 3 | 12+ | 10+ ✅ / 2 ❌ |
| Tras el Lab 4 | 14+ | 12+ ✅ / 2 ❌ |
| Tras el Lab 5 | 14+ | **todos ✅** |
| Tras el Challenge | 18+ | todos ✅ |

## Qué puedes modificar

| Fichero | ¿Se modifica? |
|---|---|
| `02-auto-waiting.spec.ts` | ✅ Es el Lab 2 |
| `03-locators.spec.ts` | ✅ Es el Lab 3 |
| `04-cobertura.spec.ts` | ✅ Lo creas tú en el Lab 4 |
| `05-diagnostico.spec.ts` | ✅ Solo los **locators**, nunca los `expect` |
| `playwright.config.ts` | ⚠️ Léelo (Lab 3, bloque 3.2). No hace falta cambiarlo |
| `pages/`, `tests/` del proyecto | ❌ **Nunca.** Incluido `pages/cart.page.ts`, aunque descubras qué le pasa |

Los ficheros que creas tú —informes, `03-decisiones.md`, el Challenge— van en esta misma carpeta.

## Ficheros de entrega del módulo

Al terminar deberías tener aquí:

```
01-ejecuciones.md          Lab 1
02-auto-waiting.spec.ts    Lab 2 (ampliado)
02-conclusiones.md         Lab 2
03-locators.spec.ts        Lab 3 (ampliado)
03-decisiones.md           Lab 3 ⭐ el entregable principal del módulo
04-cobertura.spec.ts       Lab 4
05-diagnostico.spec.ts     Lab 5 (corregido)
05-diagnostico.md          Lab 5
challenge-1-compra.spec.ts Challenge
decisiones.md              Challenge
```
