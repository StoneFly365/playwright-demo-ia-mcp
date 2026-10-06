import { expect, type Locator, type Page } from '@playwright/test';
import { sembrar } from '../../helpers/finanzas-pareja/almacen';
import type { DatosSemilla } from '../../test-data/finanzas-pareja/datos';
import { Ajustes } from './ajustes';
import { AltaMovimiento } from './alta-movimiento';
import { Inicio } from './inicio';
import { Metas } from './metas';
import { Movimientos } from './movimientos';
import { Presupuestos } from './presupuestos';

export type Seccion = 'Inicio' | 'Movimientos' | 'Plan' | 'Análisis';

/**
 * Armazón de la app (cabecera, barra de secciones, avisos y confirmaciones) y punto de
 * entrada a cada vista. Las vistas son page objects pequeños e independientes.
 */
export class FinanzasApp {
  readonly cabecera: Locator;
  readonly navegacion: Locator;
  readonly contenido: Locator;
  readonly confirmacion: Locator;

  readonly alta: AltaMovimiento;
  readonly inicio: Inicio;
  readonly movimientos: Movimientos;
  readonly presupuestos: Presupuestos;
  readonly metas: Metas;
  readonly ajustes: Ajustes;

  constructor(readonly page: Page) {
    this.cabecera = page.getByRole('banner');
    this.navegacion = page.getByRole('navigation', { name: 'Secciones' });
    this.contenido = page.getByRole('main');
    this.confirmacion = page.getByRole('alertdialog');

    this.alta = new AltaMovimiento(page);
    this.inicio = new Inicio(page);
    this.movimientos = new Movimientos(page);
    this.presupuestos = new Presupuestos(page);
    this.metas = new Metas(page);
    this.ajustes = new Ajustes(page);
  }

  /** Abre la app y, si se indican, carga antes los datos de partida del test. */
  async abrir(datos?: DatosSemilla): Promise<void> {
    await this.arrancar(() => this.page.goto('/'));
    if (!datos) return;
    await sembrar(this.page, datos);
    await this.recargar();
  }

  async recargar(): Promise<void> {
    await this.arrancar(() => this.page.reload());
  }

  /**
   * Navega y espera a que la app termine de arrancar, no solo a que desaparezca «Cargando…».
   * Tras pintar los datos la app sigue arrancando (motor de sincronización) y vuelve a repintar
   * todo el DOM; si eso ocurre mientras el test escribe en una hoja, lo escrito se pierde (D02).
   * Su último paso es registrar el service worker, que el proyecto bloquea (`serviceWorkers: 'block'`)
   * y Playwright lo anuncia en consola: esa es la señal determinista de «arranque terminado».
   */
  private async arrancar(navegar: () => Promise<unknown>): Promise<void> {
    // Sin este mensaje, una caída de red o del CDN aparecería como un «Test timeout» genérico.
    const arrancada = this.page.waitForEvent('console', {
      predicate: (mensaje) => mensaje.text().includes('Service Worker registration blocked'),
      timeout: 15_000,
    }).catch(() => {
      throw new Error('La app no terminó de arrancar en 15 s. '
        + 'Revisa la red o el estado de Netlify antes de culpar al test.');
    });
    // Promise.all atiende las dos promesas a la vez: si la red cuelga goto(), el aviso de arriba sigue llegando.
    await Promise.all([arrancada, navegar()]);
    await expect(this.navegacion).toBeVisible();
    await expect(this.page.getByText('Cargando tus datos…')).toBeHidden();
  }

  async irA(seccion: Seccion): Promise<void> {
    await this.navegacion.getByRole('button', { name: seccion, exact: true }).click();
  }

  async irAPlan(pestana: 'Presupuestos' | 'Metas' | 'Recurrentes'): Promise<void> {
    await this.irA('Plan');
    await this.contenido.getByRole('tab', { name: pestana }).click();
  }

  async irAAjustes(): Promise<void> {
    await this.cabecera.getByRole('button', { name: 'Ajustes' }).click();
  }

  /** Aviso flotante (role=status) que contiene el texto. */
  aviso(texto: string | RegExp): Locator {
    return this.page.getByRole('status').filter({ hasText: texto });
  }

  /**
   * El aviso más reciente, sea cual sea: la respuesta de la app a la última acción.
   * Se acota a la capa de avisos (#avisos) porque Ajustes tiene otro role=status (la salida del slider).
   * Sirve para sincronizar antes de comprobar que algo NO ha cambiado, y para que un fallo
   * muestre qué respondió realmente la app.
   */
  ultimoAviso(): Locator {
    return this.page.locator('#avisos').getByRole('status').last();
  }

  async confirmar(boton: string): Promise<void> {
    await this.confirmacion.getByRole('button', { name: boton, exact: true }).click();
  }
}
