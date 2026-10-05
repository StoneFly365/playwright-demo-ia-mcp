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

export const ARCHIVOS_CORRUPTOS = [
  { caso: 'JSON mal formado', archivo: json('roto.json', '{ no es json') },
  { caso: 'movimiento sin fecha', archivo: json('incompleto.json', JSON.stringify({ movimientos: [{ importe: 10 }] })) },
];

/** `bug`: defecto conocido que hace que hoy se acepte (ver application-map.md §9). */
export const IMPORTES_INVALIDOS = [
  { caso: 'importe negativo', archivo: json('negativo.json', conImporte(-999)), bug: 'D08' },
  { caso: 'importe cero', archivo: json('cero.json', conImporte(0)), bug: 'D08' },
  { caso: 'importe no numérico', archivo: json('texto.json', conImporte('abc')), bug: null },
  { caso: 'tipo inexistente', archivo: json('tipo.json', conMovimiento({ tipo: 'regalo' })), bug: 'D08' },
  { caso: 'categoría inexistente', archivo: json('categoria.json', conMovimiento({ categoriaId: 'no-existe' })), bug: 'D08' },
];
