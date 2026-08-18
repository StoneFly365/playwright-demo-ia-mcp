# Solución — Lab 4 (CREATE)

**Verificado:** los 2 tests de referencia en verde en Chromium contra la aplicación real.

---

## Paso 1 — Qué falta

| # | Respuesta |
|---|---|
| 1 | `za` (Z→A), `lohi` (precio ascendente), `hilo` (precio descendente) |
| 2 | **`az`** — "Name (A to Z)". Las cuatro opciones del desplegable, medidas: `Name (A to Z)`, `Name (Z to A)`, `Price (low to high)`, `Price (high to low)` |
| 3 | **Más necesario, no menos.** Es el estado por defecto: lo ve todo el mundo que entra en el catálogo, y sin embargo no lo verifica nadie. Un fallo ahí afecta a todos los usuarios en la primera pantalla |

**Calibración de la 3:** la respuesta floja es "da igual, es el orden por defecto". La buena señala que **el caso más frecuente es el menos probado**, que es un patrón habitual en suites reales.

## Paso 2 — Test de referencia: la ordenación A→Z

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../../pages/login.page';
import { InventoryPage } from '../../../../pages/inventory.page';

test.describe('01 · Lab 4 — Huecos de cobertura', () => {
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
  });

  test('debería ordenar los productos por nombre de A a Z', async () => {
    await inventoryPage.sortBy('az');
    const names = await inventoryPage.getProductNames();

    expect(
      names,
      'Deberían recuperarse los 6 nombres de producto antes de validar el orden — si hay menos, getProductNames() ha fallado silenciosamente',
    ).toHaveLength(6);

    const ordenados = [...names].sort((a, b) => a.localeCompare(b));
    expect(
      names,
      'Los productos deberían mostrarse ordenados alfabéticamente de la A a la Z tras seleccionar ese criterio de ordenación',
    ).toEqual(ordenados);
  });
});
```

**Por qué así:**

- **Sigue el patrón de los tres tests existentes**, incluida la comprobación de longitud previa. Coherencia con el proyecto: el alumno no inventa un estilo propio.
- `[...names]` copia antes de ordenar. Sin el spread, `sort()` ordenaría el array original y la comparación se haría contra sí mismo: **el test pasaría siempre**. Es la trampa del módulo 00 (teoría §5) aplicada aquí.
- `localeCompare` y no `<`: son nombres, no números.
- Las dos aserciones son `expect(...)` **sin `await`**: operan sobre un array ya obtenido, no sobre la UI.

**Orden real medido** con `az`:

```
Sauce Labs Backpack · Sauce Labs Bike Light · Sauce Labs Bolt T-Shirt ·
Sauce Labs Fleece Jacket · Sauce Labs Onesie · Test.allTheThings() T-Shirt (Red)
```

> Nota para la puesta en común: con estos datos, A→Z coincide con el orden en que la aplicación devuelve los productos por defecto. Buen momento para preguntar: *¿cómo sabrías que tu test detecta un fallo?* Respuesta: comparándolo con el test `za`, que sí cambia el orden.

## Paso 3 y 4 — El segundo hueco

Referencia verificada: **el botón `X` que cierra el mensaje de error del login** — existe (`[data-test="error-button"]`, medido: 1 elemento) y **ningún test lo ejercita**.

```typescript
  // Hueco detectado: specs/test-index.md documenta 6 casos de error de login
  // (credenciales inválidas, usuario bloqueado, campos vacíos), pero ninguno
  // comprueba que el mensaje se pueda cerrar. Riesgo: si el botón deja de
  // funcionar, el usuario se queda con un error permanente en pantalla y sin
  // pista de que puede reintentar.
  test('debería poder cerrar el mensaje de error del login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('wrong_user', 'wrong_password');

    await expect(
      loginPage.errorMessage,
      'El mensaje de error debería ser visible tras un intento de acceso con credenciales incorrectas',
    ).toBeVisible();

    await page.getByTestId('error-button').click();

    await expect(
      loginPage.errorMessage,
      'El mensaje de error debería desaparecer al cerrarlo, permitiendo al usuario reintentar el acceso',
    ).not.toBeVisible();
  });
```

### Otros huecos válidos, comprobados

| Hueco | Locator | Comprobado |
|---|---|---|
| Botón Cancel del checkout paso 1 y su destino | `getByTestId('cancel')` | ✅ existe |
| Enlace "Continue Shopping" del carrito | `getByRole('button', { name: 'Continue Shopping' })` → 1 | ✅ |
| Texto secundario de la confirmación | `getByTestId('complete-text')` → 1 | ✅ |
| Cantidad por línea en el carrito | `getByTestId('item-quantity')` → 1 | ✅ |

Cualquiera de ellos es aceptable **si viene con la justificación de riesgo**. Lo que no se acepta es un test sin justificación, aunque esté en verde: el criterio de este Lab es *por qué merece existir*.

## Paso 5 — La autorrevisión

Pregunta obligatoria: *¿podría pasar este test aunque la funcionalidad estuviera rota?*

Casos reales que aparecen en el grupo:

| Test flojo | Por qué pasa siempre | Corrección |
|---|---|---|
| Comprobar que el `<select>` vale `az` | Verifica el control, no el comportamiento | Comparar la lista de nombres |
| Comparar `names` con `names.sort()` sin spread | Se compara consigo mismo | `[...names].sort(...)` |
| Comprobar solo que hay 6 productos | La cantidad no dice nada del orden | Añadir la comparación de orden |

## Preguntas de reflexión

1. **¿Fallaría si dejara de ordenar?** Sí, si la aplicación devolviera otro orden. Con estos datos el orden A→Z coincide con el orden por defecto, así que el test es más débil de lo que parece: conviene ejecutarlo tras un `za` para asegurarse de que el cambio se aplica. Que el alumno lo detecte es nivel alto.
2. **Parametrizar los cuatro tests de ordenación:** ganas menos duplicación y un solo sitio donde cambiar; pierdes legibilidad del informe (un test parametrizado mal nombrado dice menos al fallar) y flexibilidad si un caso necesita aserciones distintas. El mecanismo es el módulo 03.
3. **¿Cubrir o reportar?** Depende de si el hueco es de **cobertura** (lo cubres y lo comentas en la revisión) o de **producto** (lo reportas antes de automatizarlo, porque quizá el comportamiento esperado no está decidido). Un hueco de cobertura que además revela un bug se reporta **siempre** primero.

## Errores habituales

| Error | Cómo responder |
|---|---|
| Compara contra una lista de nombres escrita a mano | ¿Qué pasa cuando entre un producto nuevo? |
| Omite el spread en `sort()` | Que mire el módulo 00, teoría §5. Su test pasa siempre |
| Verifica el valor del desplegable en vez del orden | *¿Qué has comprobado: que se pulsó el botón o que pasó algo?* |
| Escribe el segundo test sin justificar el riesgo | Es el criterio de superación, no un adorno |
| Reescribe el login en vez de usar `LoginPage` | Restricción explícita del enunciado |

## Cómo validar

```bash
npx playwright test -c learning/student/sandbox/01-playwright --project=chromium 04-cobertura.spec.ts
# 2 passed

npx playwright test -c learning/student/sandbox/01-playwright 04-cobertura.spec.ts
# 6 passed (2 tests × 3 navegadores)

npx tsc --noEmit
git status --short
```
