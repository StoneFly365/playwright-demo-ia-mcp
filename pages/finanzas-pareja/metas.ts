import type { Locator, Page } from '@playwright/test';
import { cifra } from './cifra';

export interface DatosMeta {
  nombre?: string;
  objetivo?: string;
  inicial?: string;
  icono?: string;
}

/** Plan › Metas, con sus hojas de alta, edición y aportación. */
export class Metas {
  readonly hojaNueva: Locator;
  readonly hojaEditar: Locator;
  readonly sinMetas: Locator;

  private readonly contenido: Locator;

  constructor(private readonly page: Page) {
    this.contenido = page.getByRole('main');
    this.hojaNueva = page.getByRole('dialog', { name: 'Nueva meta de ahorro' });
    this.hojaEditar = page.getByRole('dialog', { name: 'Editar meta' });
    this.sinMetas = this.contenido.getByRole('heading', { name: 'Sin metas todavía' });
  }

  /** Campos del formulario de meta dentro de una hoja (nueva o edición). */
  campos(hoja: Locator) {
    return {
      nombre: hoja.getByLabel('¿Para qué ahorras?'),
      objetivo: hoja.getByLabel('Objetivo'),
      inicial: hoja.getByLabel('Ya tengo ahorrado'),
    };
  }

  meta(nombre: string): Locator {
    return this.contenido.getByRole('listitem')
      .filter({ has: this.page.getByText(nombre, { exact: true }) });
  }

  tarjetas(): Locator {
    return this.contenido.getByRole('listitem').filter({ has: this.page.getByRole('button', { name: 'Aportar' }) });
  }

  resumen(etiqueta: 'Objetivo total' | 'Ya apartado' | 'Falta'): Locator {
    return cifra(this.contenido.locator('.datos-presupuesto'), etiqueta);
  }

  hojaAportar(nombre: string): Locator {
    return this.page.getByRole('dialog', { name: `Aportar a ${nombre}` });
  }

  async rellenarNueva(datos: DatosMeta): Promise<void> {
    await this.contenido.getByRole('button', { name: 'Nueva meta' }).click();
    const campos = this.campos(this.hojaNueva);
    if (datos.nombre !== undefined) await campos.nombre.fill(datos.nombre);
    if (datos.objetivo !== undefined) await campos.objetivo.fill(datos.objetivo);
    if (datos.inicial !== undefined) await campos.inicial.fill(datos.inicial);
    if (datos.icono) await this.hojaNueva.getByRole('button', { name: datos.icono, exact: true }).click();
  }

  async crear(datos: DatosMeta): Promise<void> {
    await this.rellenarNueva(datos);
    await this.hojaNueva.getByRole('button', { name: 'Crear meta' }).click();
  }

  async aportar(nombre: string, importe: string): Promise<void> {
    await this.meta(nombre).getByRole('button', { name: 'Aportar' }).click();
    const hoja = this.hojaAportar(nombre);
    await hoja.getByLabel('Importe').fill(importe);
    await hoja.getByRole('button', { name: 'Aportar' }).click();
  }
}
