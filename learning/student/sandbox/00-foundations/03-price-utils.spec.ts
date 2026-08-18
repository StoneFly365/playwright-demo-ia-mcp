/**
 * LAB 3 — CREATE · Módulo 00
 *
 * ESTE FICHERO ES EL CONTRATO. No lo modifiques.
 * Implementa 03-price-utils.ts hasta que los 7 tests pasen.
 *
 *   npx playwright test -c learning/student/sandbox 00-foundations/03-price-utils.spec.ts
 */
import { test, expect } from '@playwright/test';
import { masBarato, parsePrecio, total, type Producto } from './03-price-utils';

const CARRITO: Producto[] = [
  { nombre: 'Sauce Labs Backpack', precio: '$29.99' },
  { nombre: 'Sauce Labs Bike Light', precio: '$9.99' },
  { nombre: 'Sauce Labs Fleece Jacket', precio: '$49.99' },
];

test.describe('00 · Lab 3 — parsePrecio', () => {
  test('debería convertir un precio con símbolo en número', () => {
    expect(parsePrecio('$29.99')).toBeCloseTo(29.99);
  });

  test('debería tolerar espacios alrededor del precio', () => {
    expect(parsePrecio('  $9.99  ')).toBeCloseTo(9.99);
  });
});

test.describe('00 · Lab 3 — total', () => {
  test('debería sumar los precios del carrito redondeando a 2 decimales', () => {
    expect(total(CARRITO)).toBe(89.97);
  });

  test('debería devolver 0 con un carrito vacío', () => {
    expect(total([])).toBe(0);
  });

  test('no debería modificar el carrito recibido', () => {
    const entrada = [...CARRITO];
    total(entrada);

    expect(entrada).toHaveLength(3);
    expect(entrada[0].nombre).toBe('Sauce Labs Backpack');
  });
});

test.describe('00 · Lab 3 — masBarato', () => {
  test('debería devolver el producto de menor precio', () => {
    expect(masBarato(CARRITO)?.nombre).toBe('Sauce Labs Bike Light');
  });

  test('debería devolver null con un carrito vacío', () => {
    expect(masBarato([])).toBeNull();
  });
});
