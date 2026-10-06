import { expect, test } from '../../fixtures/finanzas-pareja';
import { gasto } from '../../test-data/finanzas-pareja/datos';

test.describe('Presupuestos', () => {
  test('el usuario pone un límite mensual y ve cuánto lleva gastado', { tag: '@smoke' }, async ({ app }) => {
    // PRE-01
    await app.abrir({ movimientos: [gasto(45.9, 'supermercado', 'Mercadona')] });
    await app.irAPlan('Presupuestos');

    await app.presupuestos.crear('supermercado', '100');

    await expect(app.aviso('Presupuesto de Supermercado: 100 € al mes.')).toBeVisible();
    const supermercado = app.presupuestos.presupuesto('Supermercado');
    await expect(supermercado).toContainText('45,90 € / 100 €');
    await expect(supermercado).toContainText('46 %');
    await expect(app.presupuestos.resumen('Margen')).toHaveText('54,10 €');

    await app.irA('Inicio');
    await expect(app.inicio.tarjeta('Presupuestos')).toContainText('Supermercado');
  });

  for (const limite of ['', '0', '-10', 'abc']) {
    test(`no se puede crear un presupuesto con límite "${limite}"`, { tag: '@critical' }, async ({ app }) => {
      // PRE-02
      await app.abrir();
      await app.irAPlan('Presupuestos');

      await app.presupuestos.crear('ocio', limite);

      await expect(app.aviso('Escribe un límite mayor que cero.')).toBeVisible();
      await expect(app.presupuestos.hojaNuevo).toBeVisible();
      await expect(app.presupuestos.todos()).toHaveCount(0);
    });
  }

  for (const caso of [
    { gastado: 79.94, aviso: false, superado: false },
    { gastado: 80, aviso: true, superado: false },
    { gastado: 99.94, aviso: true, superado: false },
    { gastado: 100, aviso: true, superado: true },
    { gastado: 120, aviso: true, superado: true },
  ]) {
    test(`con ${caso.gastado} € gastados de 100 € el presupuesto ${caso.superado ? 'está superado' : caso.aviso ? 'avisa' : 'está en orden'}`,
      { tag: '@critical' }, async ({ app }) => {
        // PRE-03 (valores a una décima del umbral: ver PRE-03b para el redondeo)
        await app.abrir({
          movimientos: [gasto(caso.gastado, 'supermercado', 'Mercadona')],
          presupuestos: [{ categoriaId: 'supermercado', limite: 100 }],
        });
        await app.irAPlan('Presupuestos');

        await expect(app.presupuestos.alertas).toHaveCount(caso.aviso ? 1 : 0);
        const supermercado = app.presupuestos.presupuesto('Supermercado');
        if (caso.superado) await expect(supermercado).toContainText('· superado');
        else await expect(supermercado).not.toContainText('superado');
      });
  }

  for (const { gastado, esperado } of [
    { gastado: 79.99, esperado: 'sin aviso' },
    { gastado: 99.99, esperado: 'sin superar' },
  ]) {
    test(`con ${gastado} € de 100 € el presupuesto sigue ${esperado}`, {
      tag: ['@critical', '@bug-D16'],
      annotation: { type: 'issue', description: 'D16: el porcentaje se redondea a una décima antes de compararlo con el umbral' },
    }, async ({ app }) => {
      // PRE-03b
      test.fail();
      await app.abrir({
        movimientos: [gasto(gastado, 'supermercado', 'Mercadona')],
        presupuestos: [{ categoriaId: 'supermercado', limite: 100 }],
      });
      await app.irAPlan('Presupuestos');

      if (gastado < 80) await expect(app.presupuestos.alertas).toHaveCount(0);
      else await expect(app.presupuestos.presupuesto('Supermercado')).not.toContainText('superado');
    });
  }

  test('crear un presupuesto para una categoría que ya tiene uno lo actualiza', { tag: '@critical' }, async ({ app }) => {
    // PRE-04
    await app.abrir({ presupuestos: [{ categoriaId: 'supermercado', limite: 50 }] });
    await app.irAPlan('Presupuestos');

    await app.presupuestos.crear('supermercado', '45,90');

    await expect(app.aviso('Presupuesto de Supermercado: 45,90 € al mes.')).toBeVisible();
    await expect(app.presupuestos.todos()).toHaveCount(1);
    await expect(app.presupuestos.presupuesto('Supermercado')).toContainText('/ 45,90 €');
  });

  test('el formulario conserva lo elegido tras un aviso de validación', {
    tag: ['@critical', '@bug-D02'],
    annotation: { type: 'issue', description: 'D02: las hojas de formulario se repintan con su HTML original al mostrar o retirar un aviso' },
  }, async ({ app }) => {
    // PRE-08
    test.fail();
    await app.abrir();
    await app.irAPlan('Presupuestos');
    await app.presupuestos.rellenarNuevo('ocio', '');
    await app.presupuestos.hojaNuevo.getByRole('button', { name: 'Crear presupuesto' }).click();
    await expect(app.aviso('Escribe un límite mayor que cero.')).toBeVisible();

    await expect(app.presupuestos.hojaNuevo.getByLabel('Categoría')).toHaveValue('ocio');
  });
});
