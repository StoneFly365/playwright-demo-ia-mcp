import type { Download, Locator, Page } from '@playwright/test';

type Exportacion = 'Exportar copia (JSON)' | 'CSV estándar' | 'CSV para Excel';
type ArchivoImportado = string | { name: string; mimeType: string; buffer: Buffer };

/** Vista Ajustes: preferencias, copias de seguridad y zona delicada. */
export class Ajustes {
  /** «N movimientos guardados, N presupuestos y N metas.» */
  readonly recuento: Locator;
  readonly moneda: Locator;

  private readonly contenido: Locator;

  constructor(private readonly page: Page) {
    this.contenido = page.getByRole('main');
    this.recuento = this.contenido.getByText(/movimientos? guardados?,/);
    this.moneda = this.contenido.getByRole('combobox', { name: 'Moneda' });
  }

  tema(nombre: 'Automático' | 'Claro' | 'Oscuro'): Locator {
    return this.contenido.getByRole('button', { name: nombre, exact: true });
  }

  async exportar(boton: Exportacion): Promise<Download> {
    const descarga = this.page.waitForEvent('download');
    await this.contenido.getByRole('button', { name: boton }).click();
    return descarga;
  }

  /** «Importar copia» abre el selector de archivos del sistema; se responde con el archivo dado. */
  async importar(archivo: ArchivoImportado): Promise<void> {
    const selector = this.page.waitForEvent('filechooser');
    await this.contenido.getByRole('button', { name: 'Importar copia' }).click();
    await (await selector).setFiles(archivo);
  }

  async pedirBorrarTodo(): Promise<void> {
    await this.contenido.getByRole('button', { name: 'Borrar todos los datos' }).click();
  }
}
