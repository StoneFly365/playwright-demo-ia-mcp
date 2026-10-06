import { expect, test } from '../../fixtures/finanzas-pareja';
import { ahorro, gasto, type Meta } from '../../test-data/finanzas-pareja/datos';

const VIAJE: Meta = { id: 'meta-viaje', nombre: 'Viaje', objetivo: 1000, inicial: 0 };

test.describe('Metas de ahorro', () => {
  test('el usuario crea una meta y ve su progreso', { tag: '@smoke' }, async ({ app }) => {
    // MET-01 (Inicio solo muestra el panel, y con él las metas, cuando hay algún movimiento)
    await app.abrir({ movimientos: [gasto(20, 'ocio', 'Cine')] });
    await app.irAPlan('Metas');

    await app.metas.crear({ nombre: 'Viaje', objetivo: '1.000', inicial: '200', icono: '✈️' });

    await expect(app.aviso('Meta «Viaje» guardada.')).toBeVisible();
    const viaje = app.metas.meta('Viaje');
    await expect(viaje).toContainText('✈️');
    await expect(viaje).toContainText('200 € de 1000 €');
    await expect(viaje).toContainText('Faltan 800 €');
    await expect(app.metas.resumen('Ya apartado')).toHaveText('200 €');

    await app.irA('Inicio');
    await expect(app.contenido.getByRole('heading', { name: 'Metas de ahorro' })).toBeVisible();
    await expect(app.contenido.getByText('Viaje', { exact: true })).toBeVisible();
  });

  for (const { caso, datos, mensaje } of [
    { caso: 'sin nombre', datos: { objetivo: '1000' }, mensaje: 'Ponle un nombre a la meta.' },
    { caso: 'sin objetivo', datos: { nombre: 'Viaje' }, mensaje: 'El objetivo debe ser mayor que cero.' },
    { caso: 'con objetivo 0', datos: { nombre: 'Viaje', objetivo: '0' }, mensaje: 'El objetivo debe ser mayor que cero.' },
    { caso: 'con objetivo negativo', datos: { nombre: 'Viaje', objetivo: '-5' }, mensaje: 'El objetivo debe ser mayor que cero.' },
  ]) {
    test(`no se puede crear una meta ${caso}`, { tag: '@critical' }, async ({ app }) => {
      // MET-02
      await app.abrir();
      await app.irAPlan('Metas');

      await app.metas.crear(datos);

      await expect(app.aviso(mensaje)).toBeVisible();
      await app.page.keyboard.press('Escape');
      await expect(app.metas.sinMetas).toBeVisible();
    });
  }

  test('el formulario conserva lo escrito tras un aviso de validación', {
    tag: ['@critical', '@bug-D02'],
    annotation: { type: 'issue', description: 'D02: las hojas de formulario se repintan con su HTML original al mostrar o retirar un aviso' },
  }, async ({ app }) => {
    // MET-03
    test.fail();
    await app.abrir();
    await app.irAPlan('Metas');

    await app.metas.crear({ nombre: 'Viaje QA' });
    await expect(app.aviso('El objetivo debe ser mayor que cero.')).toBeVisible();

    await expect(app.metas.campos(app.metas.hojaNueva).nombre).toHaveValue('Viaje QA');
  });

  test('no se acepta un «ya tengo ahorrado» negativo', {
    tag: ['@critical', '@bug-D04'],
    annotation: { type: 'issue', description: 'D04: se acepta −50 € y la meta muestra un progreso negativo' },
  }, async ({ app }) => {
    // MET-04 (negativo)
    test.fail();
    await app.abrir();
    await app.irAPlan('Metas');

    await app.metas.crear({ nombre: 'Viaje', objetivo: '1000', inicial: '-50' });

    // Primero la respuesta de la app (un aviso): sin ella, «no se ha creado» también es cierto
    // durante los milisegundos en que la app aún está guardando.
    const respuesta = app.ultimoAviso();
    await expect(respuesta).toBeVisible();
    await expect(respuesta).not.toContainText('guardada');
    await expect(app.metas.tarjetas()).toHaveCount(0);
  });

  test('una meta que ya parte del objetivo aparece conseguida', { tag: '@critical' }, async ({ app }) => {
    // MET-04 (inicial ≥ objetivo)
    await app.abrir();
    await app.irAPlan('Metas');

    await app.metas.crear({ nombre: 'Colchón', objetivo: '1000', inicial: '1500' });

    await expect(app.metas.meta('Colchón')).toContainText('¡Conseguido! 🎉');
  });

  test('el usuario aporta dinero a una meta y queda registrado como ahorro', { tag: '@smoke' }, async ({ app }) => {
    // MET-05
    await app.abrir({ metas: [VIAJE] });
    await app.irAPlan('Metas');

    await app.metas.aportar('Viaje', '150,5');

    await expect(app.aviso('150,50 € añadidos a la meta.')).toBeVisible();
    await expect(app.metas.meta('Viaje')).toContainText('150,50 € de 1000 €');
    await expect(app.metas.meta('Viaje')).toContainText('A este ritmo');

    await app.irA('Movimientos');
    const aportacion = app.movimientos.fila('Viaje');
    await expect(aportacion).toContainText('🎯 meta');
    await expect(aportacion).toContainText('→ 150,50 €');
  });

  test('una aportación vacía se rechaza', { tag: '@smoke' }, async ({ app }) => {
    // MET-05 (validación)
    await app.abrir({ metas: [VIAJE] });
    await app.irAPlan('Metas');

    await app.metas.aportar('Viaje', '');

    await expect(app.aviso('Escribe un importe mayor que cero.')).toBeVisible();
    await expect(app.metas.hojaAportar('Viaje')).toBeVisible();
  });

  test('deshacer una aportación devuelve la meta a su estado anterior', { tag: '@critical' }, async ({ app }) => {
    // UNDO-01 (aportación)
    await app.abrir({ metas: [VIAJE] });
    await app.irAPlan('Metas');
    await app.metas.aportar('Viaje', '150,5');

    await app.aviso('150,50 € añadidos a la meta.').getByRole('button', { name: 'Deshacer' }).click();

    await expect(app.aviso('Se ha deshecho el último guardado.')).toBeVisible();
    await expect(app.metas.meta('Viaje')).toContainText('0 € de 1000 €');
    await expect(app.metas.resumen('Ya apartado')).toHaveText('0 €');
  });

  test('renombrar una meta la modifica sin crear otra', {
    tag: ['@critical', '@bug-D03'],
    annotation: { type: 'issue', description: 'D03: al cambiar el nombre se crea una meta nueva y la original se queda' },
  }, async ({ app }) => {
    // MET-06
    test.fail();
    await app.abrir({
      metas: [{ id: 'meta-qa', nombre: 'Viaje QA', objetivo: 1000, inicial: 0 }],
      movimientos: [ahorro(100, 'deposito', 'Viaje QA', { metaId: 'meta-qa' })],
    });
    await app.irAPlan('Metas');

    await app.metas.meta('Viaje QA').getByRole('button', { name: 'Editar' }).click();
    await app.metas.campos(app.metas.hojaEditar).nombre.fill('Viaje QA 2');
    await app.metas.hojaEditar.getByRole('button', { name: 'Guardar cambios' }).click();

    await expect(app.aviso('Meta «Viaje QA 2» guardada.')).toBeVisible();
    await expect(app.metas.tarjetas()).toHaveCount(1);
    await expect(app.metas.meta('Viaje QA 2')).toContainText('100 € de 1000 €');
  });
});
