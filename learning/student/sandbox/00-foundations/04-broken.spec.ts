/**
 * LAB 4 — TROUBLESHOOT · Módulo 00
 *
 * Estado inicial: EN ROJO. Los 3 tests fallan por 3 causas DISTINTAS.
 * Ninguna de las tres es un fallo de sintaxis ni de tipos: el fichero compila.
 *
 *   npx playwright test -c learning/student/sandbox 00-foundations/04-broken.spec.ts
 *
 * Tu trabajo NO es hacer que pasen a cualquier precio: es diagnosticar la causa raíz
 * de cada uno y corregirla. Las aserciones describen el comportamiento correcto,
 * así que el fallo está siempre en el código de arriba, nunca en el expect.
 *
 * Instrucciones y plantilla de informe en:
 * learning/modules/00-foundations/labs/lab-4-troubleshoot.md
 */
import { test, expect } from '@playwright/test';

/** Ordena de menor a mayor una lista de precios ya convertidos a número. */
function ordenarPrecios(precios: number[]): number[] {
  return [...precios].sort();
}

/** Simula una llamada a la UI que devuelve cuántos productos hay en el catálogo. */
async function contarProductos(): Promise<number> {
  return 6;
}

/** Deja la lista de nombres ordenada alfabéticamente. */
function ordenarNombres(nombres: string[]): string[] {
  return nombres.sort((a, b) => a.localeCompare(b));
}

test.describe('00 · Lab 4 — Diagnóstico', () => {
  test('debería ordenar los precios de menor a mayor', () => {
    const precios = [29.99, 9.99, 49.99, 7.99, 15.99];

    expect(ordenarPrecios(precios)).toEqual([7.99, 9.99, 15.99, 29.99, 49.99]);
  });

  test('debería obtener el número de productos como número', async () => {
    const totalProductos = contarProductos();

    expect(typeof totalProductos).toBe('number');
  });

  test('no debería modificar la lista de nombres recibida', () => {
    const original = ['Onesie', 'Backpack', 'Fleece Jacket'];
    const ordenados = ordenarNombres(original);

    expect(ordenados).toEqual(['Backpack', 'Fleece Jacket', 'Onesie']);
    expect(original).toEqual(['Onesie', 'Backpack', 'Fleece Jacket']);
  });
});
