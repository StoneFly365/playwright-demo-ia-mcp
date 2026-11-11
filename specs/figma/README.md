# Diseño de Figma para la demo de la fase 1 (Diseñar)

SauceDemo no tiene diseño público en Figma. Para la demo se crea un fichero con **dos frames** que copian la app, más **dos discrepancias a propósito** para que la IA las detecte.

> La instantánea [`HU-001.figma.json`](HU-001.figma.json) está **escrita a mano** según esta guía (`"origen": "simulada"`). Cuando exista el fichero real, `npm run design:ai -- HU-001` la sustituye por lo que lea el MCP de Figma.

## Fichero de la demo

Ya existe un fichero hecho con esta guía, para enseñarlo en la demo:

- [01 · Catálogo](https://www.figma.com/design/TQPnHfhveyoaPJwuVPHHeJ/SauceDemo-QA-IA?node-id=1-2)
- [02 · Carrito](https://www.figma.com/design/TQPnHfhveyoaPJwuVPHHeJ/SauceDemo-QA-IA?node-id=1-68)

Está en una cuenta Starter, que da muy pocas llamadas al MCP de Figma al mes. Por eso [`HU-001.md`](../historias/HU-001.md) sigue con `FILE_KEY` y la demo usa la instantánea (`npm run design:ai:demo`). Además, los tests de `scripts/design-ai.test.mjs` leen esa historia y esperan el `FILE_KEY`.

## 1. Crear el fichero

1. En Figma, **New design file** con el nombre `SauceDemo · QA IA`.
2. Hacen falta un asiento **Dev** o **Full** y acceso de edición o Dev Mode al fichero: es lo que pide el MCP oficial de Figma.
3. Copia el `FILE_KEY` de la URL (`https://www.figma.com/design/<FILE_KEY>/...`) y ponlo en las dos líneas `Figma:` de [`specs/historias/HU-001.md`](../historias/HU-001.md).

## 2. Frame «01 · Catálogo» (1440 × 1024)

Para hacerlo rápido, haz una captura de https://www.saucedemo.com/inventory.html, pégala de fondo y dibuja encima con capas que tengan estos nombres. **El nombre de la capa es el `data-test` de la app**: así la IA puede emparejar cada pieza del diseño con su localizador.

| Capa | Tipo | Contenido |
|---|---|---|
| `title` | Texto | Products |
| `product-sort-container` | Componente (select) | **Price (low to high)** ← discrepancia D2 |
| `shopping-cart-link` | Icono | Carrito |
| `shopping-cart-badge` | Texto en círculo rojo | 1 |
| `inventory-item` × 6 | Tarjeta | Nombre, descripción, precio y botón |
| `add-to-cart-sauce-labs-backpack` | Botón | Add to cart |
| `remove-sauce-labs-bike-light` | Botón (estado añadido) | Remove |

Productos y precios: los de la app (Backpack $29.99, Bike Light $9.99, Bolt T-Shirt $15.99, Fleece Jacket $49.99, Onesie $7.99, Test.allTheThings() T-Shirt (Red) $15.99).

## 3. Frame «02 · Carrito» (1440 × 1024)

Base: captura de https://www.saucedemo.com/cart.html con la Backpack y la Bike Light añadidas.

| Capa | Tipo | Contenido |
|---|---|---|
| `title` | Texto | Your Cart |
| `cart-quantity-label` | Texto | QTY |
| `cart-desc-label` | Texto | Description |
| `inventory-item` × 2 | Fila | Cantidad 1, nombre, descripción, precio y botón Remove |
| `cart-subtotal` | Texto | **Subtotal: $39.98** ← discrepancia D1 |
| `continue-shopping` | Botón | Continue Shopping |
| `checkout` | Botón | Checkout |

## 4. Las discrepancias a propósito

| Id | Qué dice el diseño | Qué hace la app | Qué debería concluir la IA |
|---|---|---|---|
| D1 | El carrito muestra `Subtotal: $39.98` | No hay subtotal en el carrito: solo aparece en el paso 2 del checkout | Elemento del diseño no implementado. Bloquea **CA4**: preguntar a negocio si es un bug o un cambio pendiente |
| D2 | La ordenación por defecto es *Price (low to high)* | La app ordena por *Name (A to Z)* | Diferencia de comportamiento. Ningún criterio de la historia lo pide: confirmar con diseño |

Además, la historia tiene un criterio sin respaldo en ningún sitio: **CA5** (cambiar la cantidad desde el carrito). Ni el diseño ni la app tienen ese control. La IA debe sacarlo como **duda para negocio**, no inventarse un caso de prueba.

## 5. Copiar los `node-id`

Clic derecho en cada frame → **Copy link to selection**. Pega el `node-id` de cada enlace en su línea `Figma:` de la historia, con el formato `node-id=1-2`. El MCP los convierte a `1:2`.
