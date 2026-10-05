import type { Locator, Page } from '@playwright/test';
import { cifra } from './cifra';
import { FormularioMovimiento } from './formulario-movimiento';

type FiltroTipo = 'Todos' | 'Gastos' | 'Ingresos' | 'Ahorro';
type Total = 'Movimientos' | 'Ingresos' | 'Gastos' | 'Balance';

/** Vista Movimientos: filtros, búsqueda, lista agrupada por día y totales. */
export class Movimientos {
  readonly buscador: Locator;
  readonly categoria: Locator;
  readonly rango: Locator;
  readonly filas: Locator;
  readonly sinResultados: Locator;

  private readonly contenido: Locator;

  constructor(private readonly page: Page) {
    this.contenido = page.getByRole('main');
    this.buscador = this.contenido.getByRole('searchbox');
    this.categoria = this.contenido.getByRole('combobox', { name: 'Filtrar por categoría' });
    this.rango = this.contenido.getByRole('combobox', { name: 'Rango de fechas' });
    this.filas = this.contenido.getByRole('listitem');
    this.sinResultados = this.contenido.getByRole('heading', { name: 'Nada por aquí' });
  }

  filtroTipo(tipo: FiltroTipo): Locator {
    return this.contenido.getByRole('group', { name: 'Tipo de movimiento' })
      .getByRole('button', { name: tipo, exact: true });
  }

  fila(comercio: string): Locator {
    return this.filas.filter({ hasText: comercio });
  }

  total(etiqueta: Total): Locator {
    return cifra(this.contenido.locator('.totales-filtro'), etiqueta);
  }

  async abrirDetalle(comercio: string): Promise<DetalleMovimiento> {
    await this.fila(comercio).click();
    return new DetalleMovimiento(this.page, comercio);
  }
}

/** Hoja de detalle de un movimiento (su título es el comercio). */
export class DetalleMovimiento {
  readonly hoja: Locator;
  readonly edicion: Locator;
  readonly formularioEdicion: FormularioMovimiento;

  constructor(page: Page, comercio: string) {
    this.hoja = page.getByRole('dialog', { name: comercio, exact: true });
    this.edicion = page.getByRole('dialog', { name: 'Editar movimiento' });
    this.formularioEdicion = new FormularioMovimiento(this.edicion);
  }

  /** Valor de un dato del detalle («Fecha», «Origen»…), maquetado como lista de definición. */
  dato(nombre: string): Locator {
    return this.hoja.getByRole('term').filter({ hasText: new RegExp(`^${nombre}$`) })
      .locator('..').getByRole('definition');
  }

  async editar(): Promise<FormularioMovimiento> {
    await this.hoja.getByRole('button', { name: 'Editar' }).click();
    return this.formularioEdicion;
  }

  async duplicar(): Promise<void> {
    await this.hoja.getByRole('button', { name: 'Duplicar' }).click();
  }

  async borrar(): Promise<void> {
    await this.hoja.getByRole('button', { name: 'Borrar' }).click();
  }
}
