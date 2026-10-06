import type { Locator, Page } from '@playwright/test';
import { cifra } from './cifra';

/** Vista Inicio: bienvenida (sin datos) o panel del mes. */
export class Inicio {
  readonly bienvenida: Locator;
  readonly anilloAhorro: Locator;

  private readonly contenido: Locator;

  constructor(private readonly page: Page) {
    this.contenido = page.getByRole('main');
    this.bienvenida = this.contenido.getByRole('heading', { name: 'Bienvenido a tus finanzas' });
    this.anilloAhorro = this.contenido.getByRole('img').filter({ hasText: 'de ahorro' });
  }

  kpi(etiqueta: 'Ingresos' | 'Gastos' | 'Ahorro registrado'): Locator {
    return cifra(this.contenido.locator('.kpis'), etiqueta);
  }

  dato(etiqueta: 'Gasto diario medio' | 'Previsión de cierre' | 'Movimientos' | 'Patrimonio'): Locator {
    return cifra(this.contenido.locator('.tira-datos'), etiqueta);
  }

  /** Tarjeta del panel identificada por su título (h2). */
  tarjeta(titulo: string): Locator {
    return this.contenido.locator('section')
      .filter({ has: this.page.getByRole('heading', { name: titulo, exact: true }) });
  }

  consejo(titulo: string | RegExp): Locator {
    return this.tarjeta('Para ahorrar más').getByRole('listitem').filter({ hasText: titulo });
  }
}
