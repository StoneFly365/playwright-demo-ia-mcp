import { expect, test } from '../../fixtures/finanzas-pareja';
import { llamar } from '../../helpers/finanzas-pareja/modulos-app';
import { FRASES, IMPORTES_ES } from '../../test-data/finanzas-pareja/interpretacion';

/**
 * Reglas de interpretación probadas contra la lógica pura de la app (formato.js, parser.js)
 * dentro del navegador: muchos casos límite en milisegundos, sin pasar por la interfaz.
 * Los flujos de UI equivalentes están en alta-manual.spec.ts y alta-texto.spec.ts.
 */
test.describe('Interpretación de importes y frases', () => {
  test.beforeEach(async ({ app }) => {
    await app.abrir();
  });

  for (const { texto, valor } of IMPORTES_ES) {
    test(`el importe "${texto}" se entiende como ${valor}`, { tag: '@critical' }, async ({ page }) => {
      // ALTA-04
      expect(await llamar<number>(page, 'formato', 'aNumero', texto)).toBe(valor);
    });
  }

  for (const caso of FRASES) {
    test(`la frase "${caso.frase}" se interpreta como ${caso.tipo} de ${caso.importe}`, { tag: '@critical' }, async ({ page }) => {
      // TXT-03
      const interpretado = await llamar<Record<string, unknown>>(page, 'parser', 'parsearMovimiento', caso.frase);
      expect(interpretado).toMatchObject({
        tipo: caso.tipo, importe: caso.importe, fecha: caso.fecha, categoriaId: caso.categoriaId,
      });
    });
  }

  test('«el día 2» fija la fecha en el día 2 del mes', {
    tag: ['@critical', '@bug-D13'],
    annotation: { type: 'issue', description: 'D13: «el día N» no se reconoce y se usa la fecha de hoy (es uno de los ejemplos de la propia app)' },
  }, async ({ page }) => {
    // TXT-03 (fecha relativa al mes)
    test.fail();
    const interpretado = await llamar<{ fecha: string }>(page, 'parser', 'parsearMovimiento', 'Pagué 720 de alquiler el día 2');
    expect(interpretado.fecha).toBe('2026-10-02');
  });
});
