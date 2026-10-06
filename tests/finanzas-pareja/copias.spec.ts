import { readFile } from 'node:fs/promises';
import { expect, test } from '../../fixtures/finanzas-pareja';
import { ahorro, gasto, MES_BASICO, RECUENTO_MES_BASICO } from '../../test-data/finanzas-pareja/datos';
import { ARCHIVOS_CORRUPTOS, IMPORTES_INVALIDOS } from '../../test-data/finanzas-pareja/importaciones';

test.describe('Copias de seguridad', () => {
  test('el usuario exporta sus datos en JSON y en CSV', { tag: '@critical' }, async ({ app }) => {
    // BAK-01
    await app.abrir({
      movimientos: [
        gasto(45.9, 'supermercado', 'Mercadona', { fecha: '2026-10-04', metodoPago: 'tarjeta' }),
        gasto(12.99, 'suscripciones', 'Netflix', { fecha: '2026-10-03', metodoPago: 'tarjeta' }),
      ],
      presupuestos: [{ categoriaId: 'supermercado', limite: 200 }],
    });
    await app.irAAjustes();

    const json = await app.ajustes.exportar('Exportar copia (JSON)');
    expect(json.suggestedFilename()).toBe('finanzas-2026-10-05.json');
    const copia = JSON.parse(await readFile(await json.path(), 'utf8'));
    expect(copia).toMatchObject({ aplicacion: 'Mis Finanzas', formato: 2 });
    expect(copia.movimientos).toHaveLength(2);
    expect(copia.presupuestos).toHaveLength(1);

    const csv = await app.ajustes.exportar('CSV estándar');
    expect(csv.suggestedFilename()).toBe('finanzas-2026-10-05.csv');
    expect((await readFile(await csv.path(), 'utf8')).split('\r\n')).toEqual([
      '﻿Fecha,Tipo,Categoría,Importe,Comercio,Forma de pago,Nota,Origen',
      '2026-10-03,gasto,Suscripciones digitales,12.99,Netflix,tarjeta,,manual',
      '2026-10-04,gasto,Supermercado,45.9,Mercadona,tarjeta,,manual',
    ]);

    const excel = await app.ajustes.exportar('CSV para Excel');
    expect(excel.suggestedFilename()).toBe('finanzas-excel-2026-10-05.csv');
    expect((await readFile(await excel.path(), 'utf8')).split('\r\n')[1])
      .toBe('2026-10-03;gasto;Suscripciones digitales;"12,99";Netflix;tarjeta;;manual');
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
  });

  for (const { caso, archivo } of ARCHIVOS_CORRUPTOS) {
    test(`importar un archivo con ${caso} no cambia los datos`, { tag: '@critical' }, async ({ app }) => {
      // BAK-03
      await app.abrir(MES_BASICO);
      await app.irAAjustes();

      await app.ajustes.importar(archivo);

      await expect(app.aviso('No se ha podido importar')).toBeVisible();
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

    await app.ajustes.importar(ARCHIVOS_CORRUPTOS[0].archivo);

    const error = app.aviso('No se ha podido importar');
    await expect(error).toBeVisible();
    await expect(error).not.toContainText(/JSON at position|Expected property name/);
  });

  for (const { caso, archivo, bug } of IMPORTES_INVALIDOS) {
    test(`importar un movimiento con ${caso} se rechaza`, {
      tag: bug ? ['@critical', `@bug-${bug}`] : '@critical',
      annotation: bug ? { type: 'issue', description: `${bug}: la importación acepta importes fuera de rango` } : [],
    }, async ({ app }) => {
      // BAK-04
      test.fail(!!bug);
      await app.abrir(MES_BASICO);
      await app.irAAjustes();

      await app.ajustes.importar(archivo);

      await expect(app.ultimoAviso()).toContainText('No se ha podido importar');
      await expect(app.ajustes.recuento).toHaveText(RECUENTO_MES_BASICO);
    });
  }
});
