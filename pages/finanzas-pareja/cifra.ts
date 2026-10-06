import type { Locator } from '@playwright/test';

/**
 * Valor de una cifra etiquetada dentro de un bloque de datos («Gastos → 650 €»).
 *
 * La app pinta estos bloques (KPIs, totales, resúmenes) como pares <span>etiqueta</span>
 * <strong>valor</strong> sin roles ni test ids, así que no hay un localizador accesible.
 * Se usa la estructura mínima (hijo directo que contiene la etiqueta → su <strong>) y la
 * clase del bloque contenedor la elige el page object, en un único sitio.
 */
export function cifra(bloque: Locator, etiqueta: string): Locator {
  return bloque.locator(':scope > *').filter({ hasText: etiqueta }).locator('strong');
}
