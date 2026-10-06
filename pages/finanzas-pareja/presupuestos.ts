import type { Locator, Page } from '@playwright/test';
import { cifra } from './cifra';

/** Plan › Presupuestos. */
export class Presupuestos {
  readonly hojaNuevo: Locator;
  readonly hojaEditar: Locator;
  readonly alertas: Locator;

  private readonly contenido: Locator;

  constructor(private readonly page: Page) {
    this.contenido = page.getByRole('main');
    this.hojaNuevo = page.getByRole('dialog', { name: 'Nuevo presupuesto' });
    this.hojaEditar = page.getByRole('dialog', { name: 'Editar presupuesto' });
    this.alertas = this.contenido.getByRole('listitem').filter({ hasText: 'del límite' });
  }

  /** Tarjeta de un presupuesto (las filas son las que tienen botón «Editar presupuesto»). */
  presupuesto(categoria: string): Locator {
    return this.contenido.getByRole('listitem')
      .filter({ has: this.page.getByRole('button', { name: 'Editar presupuesto' }) })
      .filter({ hasText: categoria });
  }

  todos(): Locator {
    return this.contenido.getByRole('button', { name: 'Editar presupuesto' });
  }

  resumen(etiqueta: 'Presupuestado' | 'Gastado' | 'Margen'): Locator {
    return cifra(this.contenido.locator('.datos-presupuesto'), etiqueta);
  }

  /** Abre «Nuevo presupuesto», elige la categoría (id de la app) y escribe el límite. */
  async rellenarNuevo(categoria: string, limite: string): Promise<void> {
    await this.contenido.getByRole('button', { name: 'Nuevo presupuesto' }).click();
    await this.hojaNuevo.getByLabel('Categoría').selectOption(categoria);
    await this.hojaNuevo.getByLabel('Límite mensual').fill(limite);
  }

  async crear(categoria: string, limite: string): Promise<void> {
    await this.rellenarNuevo(categoria, limite);
    await this.hojaNuevo.getByRole('button', { name: 'Crear presupuesto' }).click();
  }
}
