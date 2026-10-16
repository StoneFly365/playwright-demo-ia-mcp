import { readFile } from 'node:fs/promises';
import { expect, test } from '../../fixtures/finanzas-pareja';
import { ahorro, gasto, MES_BASICO, RECUENTO_MES_BASICO } from '../../test-data/finanzas-pareja/datos';
import {
  ARCHIVOS_CORRUPTOS, DATOS_ACEPTADOS_D08, IMPORTES_RECHAZADOS, JSON_ROTO,
} from '../../test-data/finanzas-pareja/importaciones';

/** Marca de orden de bytes UTF-8: hace que Excel lea bien las tildes. */
const BOM = '\uFEFF';

test.describe('Copias de seguridad', () => {
  test('el usuario exporta sus datos en JSON y en CSV', { tag: '@critical' }, async ({ app }) => {
    // BAK-01
    await app.abrir({
      movimientos: [
        gasto(45.9, 'supermercado', 'Mercadona', { fecha: '2026-10-04', metodoPago: 'tarjeta' }),
        gasto(12.99, 'suscripciones', 'Netflix', { fecha: '2026-10-03', metodoPago: 'tarjeta' }),
      ],
      presupuestos: [{ categoriaId: 'supermercado', limite: 200 }],
      metas: [{ id: 'meta-viaje', nombre: 'Viaje', objetivo: 1000, inicial: 0 }],
    });
    await app.irAAjustes();

    const json = await app.ajustes.exportar('Exportar copia (JSON)');
    expect(json.suggestedFilename()).toBe('finanzas-2026-10-05.json');
    const copia = JSON.parse(await readFile(await json.path(), 'utf8'));
    expect(copia).toMatchObject({ aplicacion: 'Mis Finanzas', formato: 2 });
    expect(copia.movimientos).toHaveLength(2);
    expect(copia.presupuestos).toHaveLength(1);
    expect(copia.metas).toHaveLength(1);
    expect(copia.movimientos).toContainEqual(expect.objectContaining({
      tipo: 'gasto', importe: 12.99, categoriaId: 'suscripciones', comercio: 'Netflix', fecha: '2026-10-03',
    }));

    const csv = await app.ajustes.exportar('CSV estándar');
    expect(csv.suggestedFilename()).toBe('finanzas-2026-10-05.csv');
    expect((await readFile(await csv.path(), 'utf8')).split('\r\n')).toEqual([
      `${BOM}Fecha,Tipo,Categoría,Importe,Comercio,Forma de pago,Nota,Origen`,
      '2026-10-03,gasto,Suscripciones digitales,12.99,Netflix,tarjeta,,manual',
      '2026-10-04,gasto,Supermercado,45.9,Mercadona,tarjeta,,manual',
    ]);

    const excel = await app.ajustes.exportar('CSV para Excel');
    expect(excel.suggestedFilename()).toBe('finanzas-excel-2026-10-05.csv');
    const lineasExcel = (await readFile(await excel.path(), 'utf8')).split('\r\n');
    expect(lineasExcel[0].startsWith(BOM)).toBe(true);
    expect(lineasExcel[1]).toBe('2026-10-03;gasto;Suscripciones digitales;"12,99";Netflix;tarjeta;;manual');
  });

  test('una copia exportada restaura los datos tras borrarlo todo', { tag: '@smoke' }, async ({ app }) => {
    // BAK-02
    await app.abrir({
      movimientos: [...MES_BASICO.movimientos!, ahorro(250, 'deposito', 'Viaje', { metaId: 'meta-viaje' })],
      presupuestos: [{ categoriaId: 'supermercado', limite: 200 }],
      metas: [{ id: 'meta-viaje', nombre: 'Viaje', objetivo: 1000, inicial: 100 }],
    });
    await app.irAAjustes();
    const recuento = '6 movimientos guardados, 1 presupuesto y 1 meta.';
    await expect(app.ajustes.recuento).toHaveText(recuento);
    const copia = await (await app.ajustes.exportar('Exportar copia (JSON)')).path();

    await app.ajustes.pedirBorrarTodo();
    await app.confirmar('Borrar todo');
    await expect(app.ajustes.recuento).toHaveText('0 movimientos guardados, 0 presupuestos y 0 metas.');

    await app.ajustes.importar(copia);

    await expect(app.aviso('Importados 6 movimientos, 1 presupuestos y 1 metas.')).toBeVisible();
    await expect(app.ajustes.recuento).toHaveText(recuento);
    await app.irA('Inicio');
    await expect(app.inicio.kpi('Gastos')).toHaveText('650 €');
    await expect(app.inicio.kpi('Ahorro registrado')).toHaveText('550 €');
    await app.irAPlan('Metas');
    await expect(app.metas.meta('Viaje')).toContainText('350 € de 1000 €');
    await app.irAPlan('Presupuestos');
    await expect(app.presupuestos.presupuesto('Supermercado')).toContainText('100 € / 200 €');
    await app.irA('Movimientos');
    await expect(app.movimientos.filas).toHaveCount(6);
    await expect(app.movimientos.fila('Alquiler')).toContainText('− 500 €');
  });

  for (const { caso, archivo, aviso } of ARCHIVOS_CORRUPTOS) {
    test(`importar un archivo con ${caso} no cambia los datos`, { tag: '@critical' }, async ({ app }) => {
      // BAK-03
      await app.abrir(MES_BASICO);
      await app.irAAjustes();

      await app.ajustes.importar(archivo);

      await expect(app.aviso(aviso)).toBeVisible();
      await expect(app.ajustes.recuento).toHaveText(RECUENTO_MES_BASICO);
    });
  }

  test('el error de importación se explica en español', {
    tag: ['@critical', '@bug-D10'],
    annotation: { type: 'issue', description: 'D10: se muestra el mensaje técnico del parser JSON, en inglés' },
  }, async ({ app }) => {
    // BAK-03 (mensaje)
    test.fail();
    await app.abrir(MES_BASICO);
    await app.irAAjustes();

    await app.ajustes.importar(JSON_ROTO);

    const error = app.aviso('No se ha podido importar');
    await expect(error).toBeVisible();
    await expect(error).not.toContainText(/JSON at position|Expected property name/);
  });

  for (const { caso, archivo } of IMPORTES_RECHAZADOS) {
    test(`importar un movimiento con ${caso} se rechaza`, { tag: '@critical' }, async ({ app }) => {
      // BAK-04
      await app.abrir(MES_BASICO);
      await app.irAAjustes();

      await app.ajustes.importar(archivo);

      await expect(app.ultimoAviso()).toContainText('No se ha podido importar');
      await expect(app.ajustes.recuento).toHaveText(RECUENTO_MES_BASICO);
      await app.irA('Inicio');
      await expect(app.inicio.kpi('Gastos')).toHaveText('650 €');
    });
  }

  for (const { caso, archivo } of DATOS_ACEPTADOS_D08) {
    test(`importar un movimiento con ${caso} se rechaza`, {
      tag: ['@critical', '@bug-D08'],
      annotation: { type: 'issue', description: 'D08: la importación acepta datos inválidos (importes, tipos y categorías)' },
    }, async ({ app }) => {
      // BAK-04
      test.fail();
      await app.abrir(MES_BASICO);
      await app.irAAjustes();

      await app.ajustes.importar(archivo);

      // Exige rechazar el archivo entero; el escenario admite también rechazarlo línea a línea (OQ-25).
      await expect(app.ultimoAviso()).toContainText('No se ha podido importar');
      await expect(app.ajustes.recuento).toHaveText(RECUENTO_MES_BASICO);
      await app.irA('Inicio');
      await expect(app.inicio.kpi('Gastos')).toHaveText('650 €');
    });
  }
});
