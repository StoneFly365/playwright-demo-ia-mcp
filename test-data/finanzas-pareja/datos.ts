import { HOY } from './fechas';

/** Forma de los registros que guarda la app en IndexedDB (ver specs/finanzas-pareja/application-map.md §6). */
export interface Movimiento {
  id?: string;
  tipo: 'gasto' | 'ingreso' | 'ahorro';
  importe: number;
  fecha: string;
  categoriaId: string;
  comercio: string | null;
  metodoPago: string | null;
  metaId: string | null;
  nota: string | null;
  origen: string;
  textoOriginal?: string | null;
}

export interface Presupuesto {
  id?: string;
  categoriaId: string;
  limite: number;
}

export interface Meta {
  id?: string;
  nombre: string;
  objetivo: number;
  inicial: number;
  icono?: string;
}

export interface DatosSemilla {
  movimientos?: Movimiento[];
  presupuestos?: Presupuesto[];
  metas?: Meta[];
}

type Extra = Partial<Omit<Movimiento, 'tipo' | 'importe' | 'categoriaId' | 'comercio'>>;

const movimiento = (tipo: Movimiento['tipo']) =>
  (importe: number, categoriaId: string, comercio: string, extra: Extra = {}): Movimiento => ({
    tipo, importe, categoriaId, comercio,
    fecha: HOY, metodoPago: null, metaId: null, nota: null, origen: 'manual',
    ...extra,
  });

export const gasto = movimiento('gasto');
export const ingreso = movimiento('ingreso');
export const ahorro = movimiento('ahorro');

/**
 * Un mes redondo para comprobar cálculos a mano:
 * ingresos 2000 · gastos 650 (500 + 100 + 50) · ahorro 300 · balance 1350 · tasa 67,5 %.
 */
export const MES_BASICO: DatosSemilla = {
  movimientos: [
    ingreso(2000, 'nomina', 'Nómina', { fecha: '2026-10-01', metodoPago: 'transferencia' }),
    gasto(500, 'vivienda', 'Alquiler', { fecha: '2026-10-02', metodoPago: 'domiciliado' }),
    gasto(100, 'supermercado', 'Mercadona', { fecha: '2026-10-03', metodoPago: 'tarjeta' }),
    gasto(50, 'ocio', 'Cine', { fecha: '2026-10-04', metodoPago: 'tarjeta' }),
    ahorro(300, 'fondo-emergencia', 'Fondo de emergencia', { fecha: '2026-10-05', metodoPago: 'transferencia' }),
  ],
};

/** Recuento que muestra Ajustes › Tus datos con MES_BASICO. */
export const RECUENTO_MES_BASICO = '5 movimientos guardados, 0 presupuestos y 0 metas.';
