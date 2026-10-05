import { AYER, HOY } from './fechas';

/**
 * Importes escritos por el usuario → número que debe entender la app (formato es-ES).
 * Valores obtenidos ejecutando `aNumero` de la propia app (oráculo) y revisados a mano.
 */
export const IMPORTES_ES: ReadonlyArray<{ texto: string; valor: number }> = [
  { texto: '1.234,56', valor: 1234.56 },
  { texto: '12.50', valor: 12.5 },
  { texto: '1.500', valor: 1500 },
  { texto: '12.505', valor: 12505 },
  { texto: '20€', valor: 20 },
  { texto: '20 euros', valor: 20 },
  { texto: '45 con 90', valor: 45.9 },
];

/** Frases en lenguaje natural → movimiento interpretado (con el reloj fijo en HOY). */
export const FRASES: ReadonlyArray<{
  frase: string; tipo: string; importe: number; fecha: string; categoriaId: string;
}> = [
  { frase: 'Gasté 45,90 en el supermercado ayer con tarjeta', tipo: 'gasto', importe: 45.9, fecha: AYER, categoriaId: 'supermercado' },
  { frase: 'Nómina de mayo 1.980 euros', tipo: 'ingreso', importe: 1980, fecha: HOY, categoriaId: 'nomina' },
  { frase: 'Guardé 300 en el fondo de emergencia', tipo: 'ahorro', importe: 300, fecha: HOY, categoriaId: 'fondo-emergencia' },
  { frase: 'Pagué 720 de alquiler el día 2', tipo: 'gasto', importe: 720, fecha: HOY, categoriaId: 'vivienda' },
  { frase: 'Café con leche 1,60 hoy', tipo: 'gasto', importe: 1.6, fecha: HOY, categoriaId: 'restaurantes' },
  { frase: 'Cobré 150 de un cliente hoy', tipo: 'ingreso', importe: 150, fecha: HOY, categoriaId: 'autonomo' },
];

/** Lista de varias líneas, una por movimiento (la última sin importe). */
export const LISTA_VARIOS = [
  'Mercadona 45,90 ayer',
  'Gasolina Repsol 60',
  'Nómina 1.980',
  'Netflix 12,99',
  'linea sin importe',
].join('\n');
