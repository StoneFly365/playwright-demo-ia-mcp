/**
 * Reloj fijo de toda la suite. La app calcula el mes actual, «Hoy/Ayer», la media
 * diaria y las previsiones a partir de la fecha del sistema: sin reloj fijo los
 * tests cambiarían de resultado cada día.
 */
export const AHORA = new Date('2026-10-05T12:00:00+02:00');

export const HOY = '2026-10-05';
export const AYER = '2026-10-04';

export const MES_ACTUAL = 'Octubre 2026';
export const MES_ANTERIOR = 'Septiembre 2026';
