import type { Page } from '@playwright/test';

/**
 * Llama a una función exportada por un módulo de la app (`/js/<modulo>.js`) dentro del navegador.
 * Sirve para dos cosas: preparar datos con la capa de persistencia de la app y probar su
 * lógica pura (formato, parser) con tablas de datos, sin pasar por la interfaz.
 */
export async function llamar<T>(page: Page, modulo: string, funcion: string, ...args: unknown[]): Promise<T> {
  return page.evaluate(async ({ ruta, funcion, args }) => {
    // `import()` va dentro de un Function para que el transpilador de los tests no lo convierta en require().
    const importar = new Function('r', 'return import(r)') as (r: string) => Promise<Record<string, Function>>;
    const modulo = await importar(ruta);
    return modulo[funcion](...args);
  }, { ruta: `/js/${modulo}.js`, funcion, args });
}
