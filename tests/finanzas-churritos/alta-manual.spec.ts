import { expect, test } from '../../fixtures/finanzas-churritos';

test.describe('Alta manual de movimientos', () => {
  test.beforeEach(async ({ app }) => {
    await app.abrir();
    await app.alta.abrir('A mano');
  });

  test('el usuario registra un gasto y lo ve reflejado en el mes', { tag: '@smoke' }, async ({ app }) => {
    // ALTA-01
    await app.alta.formulario.rellenar({
      tipo: 'Gasto', importe: '12,50', categoria: 'supermercado', comercio: 'Mercadona', formaPago: 'Tarjeta',
    });
    await app.alta.formulario.guardar();

    await expect(app.alta.hoja).toBeHidden();
    const aviso = app.aviso('Gasto de 12,50 € guardado.');
    await expect(aviso).toBeVisible();
    await expect(aviso.getByRole('button', { name: 'Deshacer' })).toBeVisible();

    await expect(app.inicio.kpi('Gastos')).toHaveText('12,50 €');
    await expect(app.inicio.dato('Movimientos')).toHaveText('1');
    await expect(app.inicio.tarjeta('Últimos movimientos')).toContainText('Mercadona');

    await app.irA('Movimientos');
    await expect(app.movimientos.fila('Mercadona')).toContainText('− 12,50 €');
  });

  test('cancelar el alta no guarda nada', { tag: '@smoke' }, async ({ app }) => {
    // ALTA-01 (cancelación)
    await app.alta.formulario.rellenar({ importe: '12,50', comercio: 'Mercadona' });
    await app.alta.formulario.cancelar();

    await expect(app.alta.hoja).toBeHidden();
    await expect(app.inicio.bienvenida).toBeVisible();
  });

  for (const importe of ['', '0', '-5', 'abc']) {
    test(`no se puede guardar un importe inválido: "${importe}"`, { tag: '@critical' }, async ({ app }) => {
      // ALTA-02
      await app.alta.formulario.importe.fill(importe);
      await app.alta.formulario.guardar();

      await expect(app.aviso('El importe tiene que ser un número mayor que cero.')).toBeVisible();
      await expect(app.alta.hoja).toBeVisible();

      await app.alta.formulario.cancelar();
      await expect(app.inicio.bienvenida).toBeVisible();
    });
  }

  test('tras un importe inválido el foco vuelve al importe', {
    tag: ['@critical', '@bug-D14'],
    annotation: { type: 'issue', description: 'D14: la app enfoca el campo antes de repintar por el aviso y el foco se pierde' },
  }, async ({ app }) => {
    // ALTA-02 (foco)
    test.fail();
    await app.alta.formulario.guardar();

    await expect(app.aviso('El importe tiene que ser un número mayor que cero.')).toBeVisible();
    await expect(app.alta.formulario.importe).toBeFocused();
  });

  test('el importe mínimo de un céntimo se guarda', { tag: '@critical' }, async ({ app }) => {
    // ALTA-03 (límite válido)
    await app.alta.formulario.rellenar({ importe: '0,01' });
    await app.alta.formulario.guardar();

    await expect(app.aviso('Gasto de 0,01 € guardado.')).toBeVisible();
  });

  test('un importe por debajo del céntimo se rechaza', {
    tag: ['@critical', '@bug-D01'],
    annotation: { type: 'issue', description: 'D01: 0,001 pasa la validación y se guarda como 0 €' },
  }, async ({ app }) => {
    // ALTA-03 (límite inválido)
    test.fail();
    await app.alta.formulario.rellenar({ importe: '0,001' });
    await app.alta.formulario.guardar();

    await expect(app.aviso('El importe tiene que ser un número mayor que cero.')).toBeVisible();
    await expect(app.alta.hoja).toBeVisible();
  });

  test('acepta importes con separador de miles y coma decimal', { tag: '@critical' }, async ({ app }) => {
    // ALTA-04 (la tabla completa de formatos está en logica-pura.spec.ts)
    await app.alta.formulario.rellenar({ importe: '1.234,56', comercio: 'Portátil' });
    await app.alta.formulario.guardar();

    await expect(app.aviso('Gasto de 1234,56 € guardado.')).toBeVisible();
    await app.irA('Movimientos');
    await expect(app.movimientos.fila('Portátil')).toContainText('1234,56 €');
  });

  test('el tipo elegido decide las categorías disponibles', { tag: '@critical' }, async ({ app }) => {
    // ALTA-05
    const formulario = app.alta.formulario;
    await formulario.rellenar({ importe: '12,5', comercio: 'Prueba' });
    await expect(formulario.categoriasDisponibles()).toHaveCount(24);

    await formulario.tipo('Ingreso').click();
    await expect(formulario.tipo('Ingreso')).toHaveAttribute('aria-pressed', 'true');
    await expect(formulario.categoriasDisponibles()).toHaveCount(7);
    await expect(formulario.categoria).toHaveValue('nomina');

    await formulario.tipo('Ahorro').click();
    await expect(formulario.categoriasDisponibles()).toHaveCount(6);
    await expect(formulario.meta).toBeVisible();

    // Lo ya escrito no se pierde al cambiar de tipo.
    await expect(formulario.importe).toHaveValue('12,5');
    await expect(formulario.comercio).toHaveValue('Prueba');
  });

  test('«Asignar a meta» solo aparece para los ahorros', {
    tag: ['@critical', '@bug-D15'],
    annotation: { type: 'issue', description: 'D15: el CSS `.campo { display: grid }` anula el atributo hidden' },
  }, async ({ app }) => {
    // ALTA-05 (campo de meta)
    test.fail();
    await expect(app.alta.formulario.meta).toBeHidden();
    await app.alta.formulario.tipo('Ingreso').click();
    await expect(app.alta.formulario.meta).toBeHidden();
  });
});

test('un ahorro registrado a mano se puede asignar a una meta', {
  tag: ['@critical', '@bug-D05'],
  annotation: { type: 'issue', description: 'D05: en «A mano», «Asignar a meta» solo ofrece «Sin meta»' },
}, async ({ app }) => {
  // ALTA-06
  test.fail();
  await app.abrir({ metas: [{ id: 'meta-viaje', nombre: 'Viaje', objetivo: 1000, inicial: 0 }] });
  await app.alta.abrir('A mano');
  const formulario = app.alta.formulario;

  await formulario.rellenar({ tipo: 'Ahorro', importe: '100' });
  await expect(formulario.meta.getByRole('option', { name: /Viaje/ })).toHaveCount(1);
  await formulario.meta.selectOption({ label: '🎯 Viaje' });
  await formulario.guardar();

  await app.irAPlan('Metas');
  await expect(app.metas.meta('Viaje')).toContainText('100 € de 1000 €');
});
