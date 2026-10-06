import { expect, test } from '../../fixtures/finanzas-pareja';
import { gasto, MES_BASICO } from '../../test-data/finanzas-pareja/datos';
import { MES_ACTUAL, MES_ANTERIOR } from '../../test-data/finanzas-pareja/fechas';

test.describe('Arranque y navegación', () => {
  test('un usuario nuevo ve la bienvenida con las formas de empezar', { tag: '@smoke' }, async ({ app }) => {
    // ARR-01
    await app.abrir();

    await expect(app.inicio.bienvenida).toBeVisible();
    for (const forma of ['Foto del ticket', 'Dictado', 'A mano']) {
      await expect(app.contenido.getByRole('heading', { name: forma })).toBeVisible();
    }
    await expect(app.contenido.getByRole('button', { name: 'Añadir mi primer movimiento' })).toBeVisible();
    await expect(app.contenido.getByRole('button', { name: 'Probar con datos de ejemplo' })).toBeVisible();
    await expect(app.cabecera).toContainText('Inicio');
    await expect(app.cabecera).toContainText(MES_ACTUAL);
  });

  test('el usuario puede recorrer todas las secciones', { tag: '@smoke' }, async ({ app }) => {
    // NAV-01
    await app.abrir(MES_BASICO);

    await app.irA('Movimientos');
    await expect(app.cabecera).toContainText('Movimientos');
    await expect(app.navegacion.getByRole('button', { name: 'Movimientos' })).toHaveAttribute('aria-current', 'true');
    await expect(app.movimientos.buscador).toBeVisible();

    await app.irA('Plan');
    await expect(app.cabecera).toContainText('Plan');
    await expect(app.contenido.getByRole('tablist')).toBeVisible();

    await app.irA('Análisis');
    await expect(app.cabecera).toContainText('Análisis');
    await expect(app.contenido.getByRole('heading', { name: 'Evolución mensual' })).toBeVisible();

    await app.irAAjustes();
    await expect(app.cabecera).toContainText('Ajustes');
    await expect(app.contenido.getByRole('heading', { name: 'Preferencias' })).toBeVisible();

    await app.irA('Inicio');
    await expect(app.cabecera).toContainText('Inicio');
    await expect(app.inicio.kpi('Ingresos')).toBeVisible();
  });

  test('el mes elegido se mantiene al cambiar de sección', { tag: '@critical' }, async ({ app }) => {
    // NAV-02
    await app.abrir({
      movimientos: [
        gasto(30, 'ocio', 'Concierto', { fecha: '2026-09-15' }),
        gasto(20, 'ocio', 'Cine', { fecha: '2026-10-02' }),
      ],
    });

    await app.contenido.getByRole('button', { name: 'Mes anterior' }).click();
    await expect(app.cabecera).toContainText(MES_ANTERIOR);

    await app.irA('Movimientos');
    await expect(app.cabecera).toContainText(MES_ANTERIOR);
    await expect(app.movimientos.fila('Concierto')).toBeVisible();
    await expect(app.movimientos.fila('Cine')).toHaveCount(0);

    await app.contenido.getByRole('button', { name: MES_ANTERIOR }).click();
    await expect(app.cabecera).toContainText(MES_ACTUAL);
    await expect(app.movimientos.fila('Cine')).toBeVisible();
  });
});
