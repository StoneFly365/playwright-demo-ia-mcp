import { expect, test } from '../../fixtures/finanzas-pareja';
import { AYER } from '../../test-data/finanzas-pareja/fechas';
import { LISTA_VARIOS } from '../../test-data/finanzas-pareja/interpretacion';

test.describe('Alta escribiendo en lenguaje natural', () => {
  test.beforeEach(async ({ app }) => {
    await app.abrir();
    await app.alta.abrir('Escribir');
  });

  test('el usuario apunta un gasto escribiendo una frase', { tag: '@smoke' }, async ({ app }) => {
    // TXT-01
    await app.alta.texto.fill('Gasté 45,90 en el supermercado ayer con tarjeta');
    await app.alta.texto.press('Enter');

    const revision = app.alta.formularioRevision;
    await expect(app.alta.revision).toBeVisible();
    await expect(app.alta.confianza).toHaveText('Interpretación clara · 98 %');
    await expect(revision.tipo('Gasto')).toHaveAttribute('aria-pressed', 'true');
    await expect(revision.importe).toHaveValue('45,9');
    await expect(revision.fecha).toHaveValue(AYER);
    await expect(revision.categoria).toHaveValue('supermercado');
    await expect(revision.formaPago).toHaveValue('tarjeta');

    await revision.guardar();
    await expect(app.aviso('Gasto de 45,90 € guardado.')).toBeVisible();

    await app.irA('Movimientos');
    const detalle = await app.movimientos.abrirDetalle('Supermercado');
    await expect(detalle.dato('Origen')).toHaveText('texto');
    await detalle.textoOriginal().getByText('Texto original').click();
    // toContainText lee el DOM aunque el <details> esté cerrado: se exige que esté abierto (que se vea).
    await expect(detalle.textoOriginal()).toHaveJSProperty('open', true);
    await expect(detalle.textoOriginal()).toContainText('Gasté 45,90 en el supermercado ayer con tarjeta');
  });

  test('sin texto no hay nada que interpretar', { tag: '@critical' }, async ({ app }) => {
    // TXT-02 (vacío)
    await app.alta.interpretar('');

    await expect(app.aviso('Escribe algo primero.')).toBeVisible();
    await expect(app.alta.revision).toBeHidden();
  });

  test('un texto sin importe se rechaza con una pista', { tag: '@critical' }, async ({ app }) => {
    // TXT-02 (sin importe)
    await app.alta.interpretar('hola mundo');

    await expect(app.aviso('No he reconocido ningún importe. Prueba con «Gasté 45,90 en el supermercado ayer».')).toBeVisible();
    await expect(app.alta.revision).toBeHidden();
  });

  test('una nómina de ejemplo se reconoce como ingreso', { tag: '@critical' }, async ({ app }) => {
    // TXT-03 (UI)
    await app.alta.ejemplo('Nómina de mayo 1.980 euros').click();

    const revision = app.alta.formularioRevision;
    await expect(revision.tipo('Ingreso')).toHaveAttribute('aria-pressed', 'true');
    await expect(revision.importe).toHaveValue('1980');
    await expect(revision.categoria).toHaveValue('nomina');
  });

  test('un traspaso al fondo de emergencia se reconoce como ahorro', { tag: '@critical' }, async ({ app }) => {
    // TXT-03 (UI)
    await app.alta.ejemplo('Guardé 300 en el fondo de emergencia').click();

    const revision = app.alta.formularioRevision;
    await expect(revision.tipo('Ahorro')).toHaveAttribute('aria-pressed', 'true');
    await expect(revision.importe).toHaveValue('300');
    // La categoría no figura en el escenario: sale de lo que hace la app hoy (OQ-28).
    await expect(revision.categoria).toHaveValue('fondo-emergencia');
  });

  test('el usuario apunta varios movimientos de una vez pegando una lista', { tag: '@critical' }, async ({ app }) => {
    // LOTE-01
    await app.alta.interpretar(LISTA_VARIOS);

    await expect(app.alta.revision).toContainText('He encontrado 5 movimientos');
    await expect(app.alta.linea(/Mercadona/)).toBeChecked();
    await expect(app.alta.linea(/Nómina/)).toHaveAccessibleName(/ingreso/);
    // El nombre de la línea sin importe lo deriva el parser (hoy «Linea Importe»): solo se fija que contiene
    // «linea» y que el importe es 0 € (OQ-27).
    const sinImporte = app.alta.linea(/linea/i);
    await expect(sinImporte).not.toBeChecked();
    await expect(sinImporte).toHaveAccessibleName(/\s0\s€$/);
    await expect(app.alta.guardarLote).toHaveAccessibleName('Guardar 4 movimientos');

    await app.alta.guardarLote.click();
    await expect(app.aviso('Guardados 4 movimientos.')).toBeVisible();

    await app.irA('Movimientos');
    await expect(app.movimientos.total('Movimientos')).toHaveText('4');
    await expect(app.movimientos.total('Ingresos')).toHaveText('1980 €');
    await expect(app.movimientos.total('Gastos')).toHaveText('118,89 €');
  });

  test('al desmarcar una línea cambia el número de movimientos a guardar', { tag: '@critical' }, async ({ app }) => {
    // LOTE-02 (contador)
    await app.alta.interpretar(LISTA_VARIOS);
    await app.alta.linea(/Nómina/).uncheck();

    await expect(app.alta.resumenLote('Seleccionados')).toHaveText('3');
    await expect(app.alta.guardarLote).toHaveAccessibleName('Guardar 3 movimientos');
  });

  test('al desmarcar una línea el importe total se recalcula', {
    tag: ['@critical', '@bug-D06'],
    annotation: { type: 'issue', description: 'D06: el «Importe total» no cambia al desmarcar y suma ingresos con gastos' },
  }, async ({ app }) => {
    // LOTE-02 (importe total): 45,90 + 60 + 12,99 sin la nómina. El valor sale de D06 y su formato
    // depende de OQ-09 (cómo se presentan ingresos y gastos mezclados).
    test.fail();
    await app.alta.interpretar(LISTA_VARIOS);
    await app.alta.linea(/Nómina/).uncheck();

    // Ancla: hoy pasa y demuestra que el desmarcado se aplicó; así lo único que falla es el total (AD-06).
    await expect(app.alta.guardarLote).toHaveAccessibleName('Guardar 3 movimientos');
    await expect(app.alta.resumenLote('Importe total')).toHaveText('118,89 €');
  });
});
