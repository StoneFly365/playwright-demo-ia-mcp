/** Archivos de copia de seguridad que la importación debe rechazar sin tocar los datos. */
const json = (nombre: string, contenido: string) => ({
  name: nombre,
  mimeType: 'application/json',
  buffer: Buffer.from(contenido),
});

const conMovimiento = (cambios: Record<string, unknown>) => JSON.stringify({
  movimientos: [{ id: 'importado-1', tipo: 'gasto', importe: 10, fecha: '2026-10-01', categoriaId: 'ocio', origen: 'manual', ...cambios }],
});
const conImporte = (importe: unknown) => conMovimiento({ importe });

export const JSON_ROTO = json('roto.json', '{ no es json');

/**
 * `aviso`: lo que debe decir la app. Para el JSON roto solo se exige el prefijo común: la redacción
 * del mensaje en español está pendiente (OQ-24, D10). El de datos incompletos sale de application-map.md.
 */
export const ARCHIVOS_CORRUPTOS = [
  { caso: 'JSON mal formado', archivo: JSON_ROTO, aviso: 'No se ha podido importar' },
  {
    caso: 'movimiento sin fecha',
    archivo: json('incompleto.json', JSON.stringify({ movimientos: [{ importe: 10 }] })),
    aviso: 'No se ha podido importar: Hay movimientos con datos incompletos.',
  },
];

/** Datos inválidos que la importación ya rechaza hoy. */
export const IMPORTES_RECHAZADOS = [
  { caso: 'importe no numérico', archivo: json('texto.json', conImporte('abc')) },
];

/** Datos inválidos que hoy se aceptan por el defecto D08 (ver application-map.md §9). */
export const DATOS_ACEPTADOS_D08 = [
  { caso: 'importe negativo', archivo: json('negativo.json', conImporte(-999)) },
  { caso: 'importe cero', archivo: json('cero.json', conImporte(0)) },
  { caso: 'tipo inexistente', archivo: json('tipo.json', conMovimiento({ tipo: 'regalo' })) },
  { caso: 'categoría inexistente', archivo: json('categoria.json', conMovimiento({ categoriaId: 'no-existe' })) },
];
