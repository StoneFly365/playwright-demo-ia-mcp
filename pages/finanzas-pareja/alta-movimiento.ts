import { expect, type Locator, type Page } from '@playwright/test';
import { cifra } from './cifra';
import { FormularioMovimiento } from './formulario-movimiento';

type Pestana = 'Escribir' | 'Dictar' | 'Foto' | 'A mano';

/** Hoja «Nuevo movimiento» y la revisión «Revisa y confirma» que abre al interpretar texto. */
export class AltaMovimiento {
  readonly hoja: Locator;
  readonly formulario: FormularioMovimiento;
  readonly texto: Locator;

  readonly revision: Locator;
  readonly formularioRevision: FormularioMovimiento;
  readonly confianza: Locator;
  readonly guardarLote: Locator;

  constructor(private readonly page: Page) {
    this.hoja = page.getByRole('dialog', { name: 'Nuevo movimiento' });
    this.formulario = new FormularioMovimiento(this.hoja);
    this.texto = this.hoja.getByPlaceholder('Gasté 45,90 en el supermercado ayer con tarjeta');

    this.revision = page.getByRole('dialog', { name: 'Revisa y confirma' });
    this.formularioRevision = new FormularioMovimiento(this.revision);
    this.confianza = this.revision.getByText(/^Interpretación /);
    this.guardarLote = this.revision.getByRole('button', { name: /^Guardar \d+ movimientos$/ });
  }

  async abrir(pestana?: Pestana): Promise<void> {
    await this.page.getByRole('navigation', { name: 'Secciones' })
      .getByRole('button', { name: 'Añadir movimiento' }).click();
    await expect(this.hoja).toBeVisible();
    if (pestana) await this.hoja.getByRole('tab', { name: pestana }).click();
  }

  async interpretar(texto: string): Promise<void> {
    await this.texto.fill(texto);
    await this.hoja.getByRole('button', { name: 'Interpretar', exact: true }).click();
  }

  /** Chip de frase de ejemplo: al pulsarlo se interpreta directamente. */
  ejemplo(frase: string): Locator {
    return this.hoja.getByRole('button', { name: frase });
  }

  /** Casilla de una línea en la revisión de varios movimientos. */
  linea(texto: string | RegExp): Locator {
    return this.revision.getByRole('checkbox', { name: texto });
  }

  resumenLote(etiqueta: 'Seleccionados' | 'Importe total'): Locator {
    return cifra(this.revision.locator('.totales-filtro'), etiqueta);
  }
}
