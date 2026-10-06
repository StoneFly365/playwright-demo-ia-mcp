import { expect, test } from '../../fixtures/finanzas-pareja';

test('los datos y las preferencias siguen ahí al volver a abrir la app', { tag: '@smoke' }, async ({ app, page }) => {
  // PER-01: todo se crea por la interfaz, como lo haría el usuario.
  // El presupuesto va primero: su hoja pierde lo escrito si caduca un aviso mientras se rellena (D02).
  await app.abrir();
  await app.irAPlan('Presupuestos');
  await app.presupuestos.crear('supermercado', '100');
  await expect(app.aviso('Presupuesto de Supermercado: 100 € al mes.')).toBeVisible();

  await app.alta.abrir('A mano');
  await app.alta.formulario.rellenar({ importe: '12,50', comercio: 'Mercadona' });
  await app.alta.formulario.guardar();
  await expect(app.aviso('Gasto de 12,50 € guardado.')).toBeVisible();

  await app.irAAjustes();
  await app.ajustes.moneda.selectOption('USD');
  await app.ajustes.tema('Oscuro').click();
  await expect(page.locator('html')).toHaveAttribute('data-tema', 'oscuro');

  await app.recargar();

  await expect(page.locator('html')).toHaveAttribute('data-tema', 'oscuro');
  await app.irAAjustes();
  await expect(app.ajustes.moneda).toHaveValue('USD');
  await expect(app.ajustes.recuento).toHaveText('1 movimiento guardado, 1 presupuesto y 0 metas.');
  await app.irA('Movimientos');
  await expect(app.movimientos.fila('Mercadona')).toBeVisible();
});
