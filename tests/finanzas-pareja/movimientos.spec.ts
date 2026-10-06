import { expect, test } from '../../fixtures/finanzas-pareja';
import { gasto, MES_BASICO } from '../../test-data/finanzas-pareja/datos';
import { HOY } from '../../test-data/finanzas-pareja/fechas';
import { LISTA_VARIOS } from '../../test-data/finanzas-pareja/interpretacion';

const NETFLIX = gasto(12.99, 'suscripciones', 'Netflix', { metodoPago: 'tarjeta' });
const MERCADONA = gasto(45.9, 'supermercado', 'Mercadona', { metodoPago: 'tarjeta' });

test.describe('Consultar movimientos', () => {
  test.beforeEach(async ({ app }) => {
    await app.abrir(MES_BASICO);
    await app.irA('Movimientos');
  });

  test('los filtros por tipo y categoría recalculan la lista y los totales', { tag: '@critical' }, async ({ app }) => {
    // LIST-01
    const { movimientos } = app;
    await expect(movimientos.total('Movimientos')).toHaveText('5');
    await expect(movimientos.total('Balance')).toHaveText('1350 €');

    await movimientos.filtroTipo('Gastos').click();
    await expect(movimientos.filas).toHaveCount(3);
    await expect(movimientos.total('Gastos')).toHaveText('650 €');
    await expect(movimientos.total('Ingresos')).toHaveText('0 €');
    await expect(movimientos.total('Balance')).toHaveText('-650 €');

    await movimientos.filtroTipo('Ingresos').click();
    await expect(movimientos.filas).toHaveCount(1);
    await expect(movimientos.fila('Nómina')).toBeVisible();

    await movimientos.filtroTipo('Ahorro').click();
    await expect(movimientos.filas).toHaveCount(1);
    await expect(movimientos.fila('Fondo de emergencia')).toBeVisible();

    await movimientos.filtroTipo('Todos').click();
    await movimientos.categoria.selectOption('supermercado');
    await expect(movimientos.filas).toHaveCount(1);
    await expect(movimientos.fila('Mercadona')).toContainText('− 100 €');
  });

  for (const { busqueda, encuentra } of [
    { busqueda: 'MERCADONA', encuentra: 'Mercadona' },        // comercio, sin distinguir mayúsculas
    { busqueda: 'ocio y cultura', encuentra: 'Cine' },        // nombre de categoría
    { busqueda: '500', encuentra: 'Alquiler' },               // importe
  ]) {
    test(`buscar «${busqueda}» encuentra ${encuentra}`, { tag: '@critical' }, async ({ app }) => {
      // LIST-02
      await app.movimientos.buscador.fill(busqueda);

      await expect(app.movimientos.filas).toHaveCount(1);
      await expect(app.movimientos.fila(encuentra)).toBeVisible();
    });
  }

  test('la búsqueda también encuentra el texto con el que se apuntó', { tag: '@critical' }, async ({ app }) => {
    // LIST-02 (texto original)
    await app.abrir({
      movimientos: [gasto(45.9, 'supermercado', 'Mercadona', {
        origen: 'texto', textoOriginal: 'Gasté 45,90 en el super con la tarjeta nueva',
      })],
    });
    await app.irA('Movimientos');

    await app.movimientos.buscador.fill('tarjeta nueva');

    await expect(app.movimientos.filas).toHaveCount(1);
    await expect(app.movimientos.fila('Mercadona')).toBeVisible();
  });

  test('una búsqueda sin resultados ofrece quitar los filtros', { tag: '@critical' }, async ({ app }) => {
    // LIST-02 (sin resultados)
    await app.movimientos.buscador.fill('zzz');

    await expect(app.movimientos.sinResultados).toBeVisible();
    await app.contenido.getByRole('button', { name: 'Quitar filtros' }).click();
    await expect(app.movimientos.filas).toHaveCount(5);
    await expect(app.movimientos.buscador).toHaveValue('');
  });
});

test.describe('Gestionar un movimiento', () => {
  test('el detalle muestra todos los datos del movimiento', { tag: '@critical' }, async ({ app }) => {
    // DET-01
    await app.abrir({ movimientos: [gasto(23.4, 'salud', 'Farmacia', { metodoPago: 'tarjeta', nota: 'Ibuprofeno' })] });
    await app.irA('Movimientos');

    const detalle = await app.movimientos.abrirDetalle('Farmacia');
    await expect(detalle.hoja).toContainText('− 23,40 €');
    await expect(detalle.hoja).toContainText('Salud');
    await expect(detalle.dato('Fecha')).toHaveText(HOY);
    await expect(detalle.dato('Comercio')).toHaveText('Farmacia');
    await expect(detalle.dato('Tipo')).toHaveText('Gasto');
    await expect(detalle.dato('Forma de pago')).toHaveText('Tarjeta');
    await expect(detalle.dato('Nota')).toHaveText('Ibuprofeno');
    await expect(detalle.dato('Origen')).toHaveText('manual');
  });

  test('el usuario corrige el importe de un movimiento sin duplicarlo', { tag: '@smoke' }, async ({ app }) => {
    // DET-02
    await app.abrir({ movimientos: [NETFLIX] });
    await app.irA('Movimientos');

    const detalle = await app.movimientos.abrirDetalle('Netflix');
    const formulario = await detalle.editar();
    await expect(formulario.importe).toHaveValue('12,99');
    await formulario.importe.fill('15,49');
    await formulario.guardar();

    await expect(app.aviso('Gasto de 15,49 € actualizado.')).toBeVisible();
    await expect(app.movimientos.filas).toHaveCount(1);
    await expect(app.movimientos.fila('Netflix')).toContainText('15,49 €');

    const otraVez = await app.movimientos.abrirDetalle('Netflix');
    await expect(otraVez.dato('Origen')).toHaveText('manual');
  });

  test('cancelar una edición deja el movimiento como estaba', { tag: '@smoke' }, async ({ app }) => {
    // DET-02 (cancelación)
    await app.abrir({ movimientos: [NETFLIX] });
    await app.irA('Movimientos');

    const formulario = await (await app.movimientos.abrirDetalle('Netflix')).editar();
    await formulario.importe.fill('99');
    await formulario.cancelar();

    await expect(app.movimientos.fila('Netflix')).toContainText('12,99 €');
    await expect(app.movimientos.total('Gastos')).toHaveText('12,99 €');
  });

  test('duplicar crea una copia idéntica', { tag: '@critical' }, async ({ app }) => {
    // DET-03
    await app.abrir({ movimientos: [NETFLIX] });
    await app.irA('Movimientos');

    await (await app.movimientos.abrirDetalle('Netflix')).duplicar();

    await expect(app.aviso('Movimiento duplicado.')).toBeVisible();
    await expect(app.movimientos.fila('Netflix')).toHaveCount(2);
    await expect(app.movimientos.total('Gastos')).toHaveText('25,98 €');
  });

  test('borrar pide confirmación y elimina el movimiento de forma permanente', { tag: '@smoke' }, async ({ app }) => {
    // DET-04
    await app.abrir({ movimientos: [NETFLIX, MERCADONA] });
    await app.irA('Movimientos');
    const detalle = await app.movimientos.abrirDetalle('Netflix');

    await detalle.borrar();
    await expect(app.confirmacion).toContainText('¿Borrar el movimiento?');
    await expect(app.confirmacion).toContainText('Esta acción no se puede deshacer.');
    await app.confirmar('Cancelar');
    await expect(app.confirmacion).toBeHidden();
    await expect(detalle.hoja).toBeVisible();

    await detalle.borrar();
    await app.confirmar('Borrar');

    await expect(app.aviso('Movimiento borrado.')).toBeVisible();
    await expect(app.movimientos.fila('Netflix')).toHaveCount(0);
    await expect(app.movimientos.total('Movimientos')).toHaveText('1');

    await app.recargar();
    await app.irA('Movimientos');
    await expect(app.movimientos.fila('Mercadona')).toBeVisible();
    await expect(app.movimientos.fila('Netflix')).toHaveCount(0);
  });
});

test.describe('Deshacer el último guardado', () => {
  test.beforeEach(async ({ app }) => {
    await app.abrir();
  });

  test('deshacer un alta manual la elimina', { tag: '@critical' }, async ({ app }) => {
    // UNDO-01 (alta manual)
    await app.alta.abrir('A mano');
    await app.alta.formulario.rellenar({ importe: '12,50', comercio: 'Mercadona' });
    await app.alta.formulario.guardar();

    await app.aviso('Gasto de 12,50 € guardado.').getByRole('button', { name: 'Deshacer' }).click();

    await expect(app.aviso('Se ha deshecho el último guardado.')).toBeVisible();
    await expect(app.inicio.bienvenida).toBeVisible();
  });

  test('deshacer un lote elimina todos sus movimientos', { tag: '@critical' }, async ({ app }) => {
    // UNDO-01 (lote)
    await app.alta.abrir('Escribir');
    await app.alta.interpretar(LISTA_VARIOS);
    await app.alta.guardarLote.click();

    await app.aviso('Guardados 4 movimientos.').getByRole('button', { name: 'Deshacer' }).click();

    await expect(app.aviso('Se ha deshecho el último guardado.')).toBeVisible();
    await expect(app.inicio.bienvenida).toBeVisible();
  });

  test('el botón «Deshacer» desaparece una vez usado', {
    tag: ['@critical', '@bug-D11'],
    annotation: { type: 'issue', description: 'D11: el aviso original conserva «Deshacer» (que ya no hace nada) hasta que caduca' },
  }, async ({ app }) => {
    // UNDO-01 (botón ya usado)
    test.fail();
    await app.alta.abrir('A mano');
    await app.alta.formulario.rellenar({ importe: '12,50', comercio: 'Mercadona' });
    await app.alta.formulario.guardar();

    await app.aviso('Gasto de 12,50 € guardado.').getByRole('button', { name: 'Deshacer' }).click();

    await expect(app.aviso('Se ha deshecho el último guardado.')).toBeVisible();
    // El aviso caduca solo a los 5 s, igual que el timeout por defecto de expect: con él, la
    // caducidad haría pasar el test aunque el botón siga ahí. 1 s basta para que la app reaccione.
    await expect(app.page.getByRole('button', { name: 'Deshacer' })).toHaveCount(0, { timeout: 1_000 });
  });
});
