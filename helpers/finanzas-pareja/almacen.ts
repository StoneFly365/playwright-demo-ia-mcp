import type { Page } from '@playwright/test';
import type { DatosSemilla } from '../../test-data/finanzas-pareja/datos';
import { llamar } from './modulos-app';

/**
 * Guarda datos en IndexedDB con la propia capa de persistencia de la app (`/js/db.js`).
 * Cada test prepara así su estado en milisegundos y solo usa la UI para el flujo que valida.
 * La app no relee IndexedDB por su cuenta: hay que recargar después.
 */
export async function sembrar(page: Page, datos: DatosSemilla): Promise<void> {
  if (datos.movimientos?.length) await llamar(page, 'db', 'guardarMovimientos', datos.movimientos);
  for (const p of datos.presupuestos ?? []) await llamar(page, 'db', 'guardarPresupuesto', p);
  for (const m of datos.metas ?? []) await llamar(page, 'db', 'guardarMeta', m);
}
