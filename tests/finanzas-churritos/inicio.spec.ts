import { expect, test } from '../../fixtures/finanzas-churritos';
import { gasto, MES_BASICO } from '../../test-data/finanzas-churritos/datos';

test.describe('Panel del mes', () => {
  test('los indicadores del mes cuadran con los movimientos', { tag: '@smoke' }, async ({ app }) => {
    // INI-01: ingresos 2000 · gastos 500 + 100 + 50 · ahorro 300
    await app.abrir(MES_BASICO);

    await expect(app.inicio.kpi('Ingresos')).toHaveText('2000 €');
    await expect(app.inicio.kpi('Gastos')).toHaveText('650 €');
    await expect(app.inicio.kpi('Ahorro registrado')).toHaveText('300 €');
    await expect(app.inicio.anilloAhorro).toContainText('68 %');           // (2000 − 650) / 2000 = 67,5 %
    await expect(app.contenido.getByText('Has guardado 1350 €')).toBeVisible();
    await expect(app.inicio.dato('Movimientos')).toHaveText('5');
    await expect(app.inicio.dato('Patrimonio')).toHaveText('1350 €');
  });

  test('sin ingresos en el mes no se calcula la tasa de ahorro', { tag: '@critical' }, async ({ app }) => {
    // INI-02
    await app.abrir({ movimientos: [gasto(80, 'supermercado', 'Mercadona')] });

    await expect(app.inicio.anilloAhorro).toContainText('—');
    await expect(app.contenido.getByText('Sin ingresos este mes')).toBeVisible();
    await expect(app.inicio.consejo('No hay ingresos registrados este mes')).toBeVisible();
    await expect(app.inicio.tarjeta('Regla 50 / 30 / 20')).toHaveCount(0);
  });
});
