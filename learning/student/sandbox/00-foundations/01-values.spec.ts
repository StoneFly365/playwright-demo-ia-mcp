/**
 * LAB 1 — FOLLOW · Módulo 00
 *
 * Este fichero está COMPLETO y en verde. No lo modifiques.
 * Tu trabajo es ejecutarlo, leerlo y observar.
 *
 *   npx playwright test -c learning/student/sandbox 00-foundations/01-values.spec.ts
 *
 * Cada bloque de aquí es una versión reducida de algo que existe en el proyecto real.
 * La referencia al fichero real está en el comentario de cada test.
 */
import { test, expect } from '@playwright/test';

test.describe('00 · Lab 1 — Valores, funciones, objetos y clases', () => {
  // Real: tests/login.spec.ts:13 — 'standard_user' y 'secret_sauce' son valores fijos.
  test('const, let y plantillas de texto', () => {
    const usuario = 'standard_user'; // const: la referencia no se puede reasignar
    let intentos = 0; // let: sí se puede reasignar
    intentos = intentos + 1;

    expect(`${usuario} lleva ${intentos} intento`).toBe('standard_user lleva 1 intento');
  });

  // Real: pages/inventory.page.ts:12 — addToCart(dataTestId) recibe un parámetro y lo usa
  // para construir el selector con una plantilla de texto.
  test('una función construye un selector a partir de un parámetro', () => {
    function selectorAnadir(producto: string): string {
      return `[data-test="add-to-cart-${producto}"]`;
    }

    expect(selectorAnadir('sauce-labs-backpack')).toBe('[data-test="add-to-cart-sauce-labs-backpack"]');
  });

  // Dos formas de escribir la misma función. En el proyecto verás las dos.
  test('función clásica y función flecha son equivalentes', () => {
    function conIvaClasica(base: number): number {
      return base * 1.08;
    }
    const conIvaFlecha = (base: number): number => base * 1.08;

    expect(conIvaClasica(100)).toBeCloseTo(108);
    expect(conIvaFlecha(100)).toBeCloseTo(conIvaClasica(100));
  });

  // Real: tests/inventory.spec.ts:42 — prices.map(p => parseFloat(p.replace('$', '')))
  test('map transforma cada elemento de un array', () => {
    const precios = ['$29.99', '$9.99', '$49.99'];
    const numeros = precios.map((p) => parseFloat(p.replace('$', '')));

    expect(numeros).toEqual([29.99, 9.99, 49.99]);
  });

  // Real: tests/inventory.spec.ts:32 — [...names].sort(...) copia ANTES de ordenar.
  // sort() ordena el array sobre el que se llama y devuelve ese mismo array.
  test('el spread copia el array para no ordenar el original', () => {
    const original = ['C', 'A', 'B'];
    const ordenado = [...original].sort();

    expect(ordenado).toEqual(['A', 'B', 'C']);
    expect(original).toEqual(['C', 'A', 'B']); // el original sigue intacto
  });

  // Real: todos los specs — async ({ page }) => { ... } desestructura la propiedad
  // `page` del objeto de fixtures que Playwright pasa al test.
  test('desestructuración: sacar propiedades de un objeto', () => {
    const resultado = { total: 79, fallidos: 10, navegador: 'chromium' };
    const { total, fallidos } = resultado;

    expect(total).toBe(79);
    expect(fallidos).toBe(10);
  });

  // Real: pages/login.page.ts:3-19 — misma estructura: campo readonly, parámetro de
  // propiedad en el constructor, y métodos que operan sobre el estado interno.
  test('una clase encapsula estado y comportamiento', () => {
    class BadgeCarrito {
      private unidades = 0;

      constructor(private readonly etiqueta: string) {}

      anadir(): void {
        this.unidades += 1;
      }

      texto(): string {
        return `${this.etiqueta}: ${this.unidades}`;
      }
    }

    const badge = new BadgeCarrito('carrito');
    badge.anadir();
    badge.anadir();

    expect(badge.texto()).toBe('carrito: 2');
  });

  // Real: pages/inventory.page.ts:24 — getProductNames(): Promise<string[]>
  // Este es el error número uno de quien empieza: olvidar el await.
  test('await convierte una Promise<string> en string', async () => {
    async function nombreProducto(): Promise<string> {
      return 'Sauce Labs Backpack';
    }

    const sinAwait = nombreProducto(); // esto es una Promise, no un string
    expect(typeof sinAwait).toBe('object');

    const conAwait = await nombreProducto(); // ahora sí es el valor
    expect(typeof conAwait).toBe('string');
    expect(conAwait).toBe('Sauce Labs Backpack');
  });
});
