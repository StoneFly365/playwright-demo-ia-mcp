/**
 * LAB 3 — CREATE · Módulo 00
 *
 * Estado inicial: EN ROJO a propósito. Las tres funciones compilan pero devuelven
 * valores de relleno. Tu trabajo es implementarlas hasta que
 * 03-price-utils.spec.ts pase entero.
 *
 * No modifiques el fichero de test: es el contrato que debes cumplir.
 * Instrucciones completas en:
 * learning/modules/00-foundations/labs/lab-3-create.md
 */

/** Un producto tal y como llega desde la UI: el precio es texto, no número. */
export type Producto = {
  nombre: string;
  precio: string;
};

/**
 * Convierte el precio en texto que muestra la UI ('$29.99') en un número (29.99).
 * Debe tolerar espacios sobrantes: ' $29.99 '.
 */
export function parsePrecio(precio: string): number {
  // TODO(lab-3): implementar
  return 0;
}

/**
 * Suma los precios de una lista de productos y devuelve el total
 * redondeado a 2 decimales.
 * Con una lista vacía debe devolver 0.
 */
export function total(productos: Producto[]): number {
  // TODO(lab-3): implementar
  return 0;
}

/**
 * Devuelve el producto más barato de la lista.
 * Si la lista está vacía debe devolver null.
 */
export function masBarato(productos: Producto[]): Producto | null {
  // TODO(lab-3): implementar
  return null;
}
