import { expect, test } from '../../fixtures/finanzas-pareja';
import { MES_BASICO, RECUENTO_MES_BASICO } from '../../test-data/finanzas-pareja/datos';

test.describe('Datos de ejemplo y borrado total', () => {
  test('el usuario carga los datos de ejemplo para probar la app', { tag: '@critical' }, async ({ app }) => {
    // DEMO-01
    await app.abrir();

    await app.contenido.getByRole('button', { name: 'Probar con datos de ejemplo' }).click();
    await expect(app.confirmacion).toContainText('3 meses de movimientos de prueba, 4 presupuestos y 2 metas');
    await app.confirmar('Cargar ejemplo');

    await expect(app.aviso('Cargados 42 movimientos de ejemplo.')).toBeVisible();
    await expect(app.inicio.bienvenida).toBeHidden();
    await app.irAAjustes();
    await expect(app.ajustes.recuento).toHaveText('42 movimientos guardados, 4 presupuestos y 2 metas.');
  });

  test('borrar todos los datos pide confirmación y deja la app vacía', { tag: '@smoke' }, async ({ app }) => {
    // DEMO-03
    await app.abrir(MES_BASICO);
    await app.irAAjustes();

    await app.ajustes.pedirBorrarTodo();
    await expect(app.confirmacion).toContainText('¿Borrar todos los datos?');
    await app.confirmar('Cancelar');
    await expect(app.ajustes.recuento).toHaveText(RECUENTO_MES_BASICO);

    await app.ajustes.pedirBorrarTodo();
    await app.confirmar('Borrar todo');

    await expect(app.aviso('Se han borrado todos los datos.')).toBeVisible();
    await expect(app.ajustes.recuento).toHaveText('0 movimientos guardados, 0 presupuestos y 0 metas.');
    await app.irA('Inicio');
    await expect(app.inicio.bienvenida).toBeVisible();

    await app.recargar();
    await expect(app.inicio.bienvenida).toBeVisible();
  });
});
