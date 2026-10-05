import type { Locator } from '@playwright/test';

export type Tipo = 'Gasto' | 'Ingreso' | 'Ahorro';

export interface DatosMovimiento {
  tipo?: Tipo;
  importe?: string;
  fecha?: string;
  /** id de categoría de la app, p. ej. `supermercado`. */
  categoria?: string;
  comercio?: string;
  /** Texto visible, p. ej. `Tarjeta`. */
  formaPago?: string;
  nota?: string;
}

/**
 * Formulario de movimiento. Es el mismo en «Nuevo movimiento › A mano», en
 * «Revisa y confirma» y en «Editar movimiento»: se construye sobre la hoja que lo contiene.
 */
export class FormularioMovimiento {
  readonly importe: Locator;
  readonly fecha: Locator;
  readonly categoria: Locator;
  readonly comercio: Locator;
  readonly formaPago: Locator;
  readonly meta: Locator;
  readonly nota: Locator;

  constructor(private readonly hoja: Locator) {
    this.importe = hoja.getByLabel('Importe');
    this.fecha = hoja.getByLabel('Fecha');
    this.categoria = hoja.getByLabel('Categoría');
    this.comercio = hoja.getByLabel('Comercio o concepto');
    this.formaPago = hoja.getByLabel('Forma de pago');
    this.meta = hoja.getByLabel('Asignar a meta');
    this.nota = hoja.getByLabel('Nota');
  }

  tipo(tipo: Tipo): Locator {
    return this.hoja.getByRole('button', { name: tipo, exact: true });
  }

  /** Categorías que se pueden elegir con el tipo activo (las demás quedan deshabilitadas). */
  categoriasDisponibles(): Locator {
    return this.categoria.locator('option:enabled');
  }

  async rellenar(datos: DatosMovimiento): Promise<void> {
    if (datos.tipo) await this.tipo(datos.tipo).click();
    if (datos.importe !== undefined) await this.importe.fill(datos.importe);
    if (datos.fecha !== undefined) await this.fecha.fill(datos.fecha);
    if (datos.categoria) await this.categoria.selectOption(datos.categoria);
    if (datos.comercio !== undefined) await this.comercio.fill(datos.comercio);
    if (datos.formaPago) await this.formaPago.selectOption({ label: datos.formaPago });
    if (datos.nota !== undefined) await this.nota.fill(datos.nota);
  }

  async guardar(): Promise<void> {
    await this.hoja.getByRole('button', { name: 'Guardar movimiento' }).click();
  }

  async cancelar(): Promise<void> {
    await this.hoja.getByRole('button', { name: 'Cancelar' }).click();
  }
}
