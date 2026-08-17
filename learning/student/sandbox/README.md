# Sandbox

Zona ejecutable de los ejercicios. Tiene su propia configuración de Playwright y **no ve la suite del proyecto**.

---

## Cómo se ejecuta

```bash
# Desde la raíz del proyecto
npx playwright test -c learning/student/sandbox
```

`-c` acepta un directorio y busca dentro el `playwright.config.ts`.

## Por qué tiene configuración propia

[`playwright.config.ts`](playwright.config.ts) de este directorio:

```typescript
export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
});
```

| Decisión | Efecto |
|---|---|
| `testDir: '.'` | Solo ve los ejercicios de esta carpeta |
| La config raíz usa `testDir: './tests'` | `npm test` y el CI **nunca** ejecutan tus ejercicios |
| Sin `baseURL` ni `projects` de navegador | Los ejercicios del módulo 00 son lógica pura: no abren navegador ni necesitan internet |
| `retries: 0` | Un fallo es un fallo. Nada se enmascara |
| `reporter: list` | Salida legible en terminal, sin abrir un informe HTML |

En la práctica: **ejecutar los ejercicios no puede romper el pipeline de CI**, y ejecutar la suite del proyecto no ejecuta tus ejercicios.

## Estado inicial

Recién clonado el repositorio:

```
7 failed
13 passed
```

**Los 7 fallos son correctos.** Distribución:

| Fichero | Tests | Estado inicial | Por qué |
|---|---|---|---|
| `00-foundations/01-values.spec.ts` | 8 | ✅ 8 verdes | Lab 1: material de lectura, ya resuelto |
| `00-foundations/02-arrays.spec.ts` | 2 | ✅ 2 verdes | Lab 2: parte de código que funciona y lo amplías |
| `00-foundations/03-price-utils.spec.ts` | 7 | ❌ 4 rojos / 3 verdes | Lab 3: el contrato está escrito, la implementación no |
| `00-foundations/04-broken.spec.ts` | 3 | ❌ 3 rojos | Lab 4: tres fallos deliberados que debes diagnosticar |

> Los 3 tests que pasan en `03-price-utils.spec.ts` con las funciones sin implementar no son un error del ejercicio: son parte de él. La primera pregunta del Lab 3 es exactamente por qué pasan.

## Progresión esperada

| Momento | Tests | Verde |
|---|---|---|
| Estado inicial | 20 | 13 ✅ / 7 ❌ |
| Tras el Lab 2 | 23 | 16 ✅ / 7 ❌ |
| Tras el Lab 3 | 23 | 20 ✅ / 3 ❌ |
| Tras el Lab 4 | 23 | 23 ✅ |
| Tras el Challenge 1 | 29+ | 29+ ✅ |

## Qué puedes modificar

| Fichero | ¿Se modifica? |
|---|---|
| `01-values.spec.ts` | ❌ Material de lectura |
| `02-arrays.spec.ts` | ✅ Es el Lab 2 |
| `03-price-utils.ts` | ✅ Es el Lab 3 |
| `03-price-utils.spec.ts` | ❌ **Contrato del Lab 3** |
| `04-broken.spec.ts` | ✅ Solo las funciones de arriba, **nunca los `expect`** |
| `playwright.config.ts` | ❌ |

Los ficheros que creas tú (Challenge, informes) van en esta misma carpeta.
