# Playwright SauceDemo — E2E Tests

Proyecto de automatización de pruebas end-to-end sobre [SauceDemo](https://www.saucedemo.com) utilizando [Playwright](https://playwright.dev/) con TypeScript y el patrón **Page Object Model (POM)**.

---

## Caso de uso cubierto

| Test | Descripción |
|------|-------------|
| `add-tshirt-to-cart.spec.ts` | Login con `standard_user` y añadir la *Sauce Labs Bolt T-Shirt* al carrito |

---

## Estructura del proyecto

```
playwright-demo-ia-mcp/
├── pages/
│   ├── login.page.ts          # POM: página de login
│   └── inventory.page.ts      # POM: catálogo de productos y carrito
├── tests/
│   └── add-tshirt-to-cart.spec.ts  # Spec del caso de uso
├── playwright.config.ts       # Configuración de Playwright
├── package.json
├── tsconfig.json
└── README.md
```

---

## Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- npm v9 o superior

---

## Instalación

```bash
npm install
npx playwright install chromium
```

---

## Ejecución de los tests

```bash
# Modo headless (por defecto)
npm test

# Modo headed (navegador visible)
npm run test:headed

# Ver el informe HTML tras la ejecución
npm run test:report
```

---

## Modo sin navegador (headless)

El modo **headless** ejecuta los tests sin abrir ninguna ventana de navegador. Es el modo por defecto y el recomendado para entornos CI/CD.

### Formas de ejecutarlo

```bash
# Usando el script de npm (headless por defecto)
npm test

# Forzando headless explícitamente con flag
npx playwright test --headed=false

# Con variable de entorno (útil en pipelines CI)
HEADLESS=true npx playwright test
```

### Ejecutar un fichero o test concreto en headless

```bash
# Un fichero específico
npx playwright test tests/login.spec.ts

# Un test por su nombre (grep)
npx playwright test --grep "debería redirigir a la página de inventario"

# Varios ficheros a la vez
npx playwright test tests/login.spec.ts tests/checkout.spec.ts
```

### Otras opciones útiles en headless

```bash
# Ejecutar en paralelo con N workers
npx playwright test --workers=4

# Mostrar los pasos por consola mientras se ejecuta
npx playwright test --reporter=line

# Reintentar tests fallidos hasta 2 veces
npx playwright test --retries=2

# Activar tracing para depurar fallos (genera un .zip por test)
npx playwright test --trace=on
```

> **Nota:** el modo headed (`npm run test:headed`) abre el navegador y es útil para depurar tests en local. En CI siempre debe usarse headless para evitar dependencias de entorno gráfico.

---

## Configuración

El fichero `playwright.config.ts` centraliza la configuración principal:

| Parámetro | Valor |
|-----------|-------|
| `baseURL` | `https://www.saucedemo.com` |
| `testDir` | `./tests` |
| `reporter` | HTML |
| `trace` | `on-first-retry` |
| Browser | Chromium (Desktop Chrome) |
| Reintentos en CI | 2 |

---

## Decisiones de diseño

### Page Object Model
Cada página de la aplicación tiene su propia clase en `/pages`. Los tests solo orquestan el flujo de negocio; los selectores y acciones quedan encapsulados en los page objects, facilitando el mantenimiento ante cambios de UI.

### Selectores `data-test`
Se usan exclusivamente los atributos `data-test` que provee SauceDemo. Son los más resilientes ante cambios de estilos, clases CSS o estructura HTML.

### `baseURL` en config
La URL base se define una sola vez en `playwright.config.ts`. Los page objects usan rutas relativas (`/`, `/inventory.html`), lo que simplifica un eventual cambio de entorno.

---

## Tecnologías

- [Playwright](https://playwright.dev/) `^1.49`
- TypeScript `^5.0`
- Node.js `^20`
