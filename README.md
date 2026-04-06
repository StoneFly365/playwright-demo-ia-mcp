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
