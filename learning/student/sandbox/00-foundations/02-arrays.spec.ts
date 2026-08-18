/**
 * LAB 2 — MODIFY · Módulo 00
 *
 * Estado inicial: EN VERDE. Ejecútalo antes de tocar nada.
 *
 *   npx playwright test -c learning/student/sandbox 00-foundations/02-arrays.spec.ts
 *
 * Tu trabajo es modificar este fichero según las instrucciones de
 * learning/modules/00-foundations/labs/lab-2-modify.md
 * y dejarlo otra vez en verde, con más cobertura que ahora.
 */
import { test, expect } from '@playwright/test';

/**
 * Ordena una lista de nombres de producto de la A a la Z.
 * Inspirado en tests/inventory.spec.ts:32, donde se valida la ordenación del catálogo.
 */
export function ordenarNombres(nombres: string[]): string[] {
  return [...nombres].sort((a, b) => a.localeCompare(b));
}

const CATALOGO = [
  'Sauce Labs Onesie',
  'Sauce Labs Backpack',
  'Sauce Labs Fleece Jacket',
];

test.describe('00 · Lab 2 — Ordenación de datos extraídos de la UI', () => {
  test('debería ordenar los nombres de la A a la Z', () => {
    expect(ordenarNombres(CATALOGO)).toEqual([
      'Sauce Labs Backpack',
      'Sauce Labs Fleece Jacket',
      'Sauce Labs Onesie',
    ]);
  });

  test('no debería modificar el array recibido', () => {
    const entrada = [...CATALOGO];
    ordenarNombres(entrada);

    expect(entrada).toEqual(CATALOGO);
  });
});
