# Módulo 00 — Objetivos de aprendizaje

Cada objetivo es evaluable: la columna "Cómo se evalúa" indica el instrumento exacto que lo comprueba.

| # | Al terminar el módulo, el alumno será capaz de… | Nivel | Se practica en | Cómo se evalúa |
|---|---|---|---|---|
| **O1** | **Identificar** en `pages/login.page.ts` los cinco elementos de una clase TypeScript: campo `readonly`, parámetro de propiedad, constructor, método `async` y tipo de retorno | 1 FOLLOW | Lab 1 | Assessment P1, P2 |
| **O2** | **Explicar** por qué todos los métodos de los Page Objects devuelven `Promise<T>` y qué valor obtiene el código si se omite el `await` | 1 FOLLOW | Lab 1 | Assessment P3, P4 |
| **O3** | **Ejecutar** los ejercicios del sandbox con el comando correcto e **interpretar** la salida distinguiendo un fallo de aserción de un error de compilación | 1 FOLLOW | Labs 1-4 | Assessment E1 (validación) |
| **O4** | **Modificar** una función de transformación de arrays (`map`, `sort`, spread) cambiando su comportamiento sin romper los tests existentes | 2 MODIFY | Lab 2 | Assessment E1 |
| **O5** | **Crear** un módulo TypeScript propio con un `type` exportado y funciones puras tipadas, que satisfaga un contrato de tests dado | 3 CREATE | Lab 3, Challenge 1 | Assessment E2 |
| **O6** | **Diagnosticar** los tres errores más frecuentes de un QA que empieza: `await` olvidado, `sort()` sin comparador sobre números y mutación del array de entrada | 5 TROUBLESHOOT | Lab 4 | Assessment P7, P8, E2 |
| **O7** | **Justificar** con un argumento de mantenibilidad por qué la suite usa `strict: true`, `readonly` y copia de arrays antes de ordenar | 4 DESIGN | Challenge 1 | Assessment P9, P10 |
| **O8** | **Comunicar y justificar** una decisión técnica propia: explicar qué hizo y por qué, qué alternativa descartó, y separar el **síntoma** de la **causa raíz** de un problema que se encontró | 4 DESIGN | Labs 1, 3 y 4 · Challenge 1 | Parte C del assessment (apto/no apto), durante la revisión de un Lab o del Challenge |

## Nota sobre O8

No es un examen oral ni una prueba de expresión. Es la competencia que separa a un QA que arregla cosas de un QA en quien se confía: **saber explicar por qué una solución es correcta y distinguir lo que se ve de lo que lo causa.**

Se practica por escrito a lo largo de todo el módulo —la respuesta del Paso 1 del Lab 3, el informe del Lab 4, `05-decisiones.md` del Challenge— y se comprueba en conversación durante una revisión que ya iba a ocurrir de todas formas.

Es también el prerrequisito real del módulo 04, que es diagnóstico puro: quien llama "causa" al síntoma no puede hacer análisis de causa raíz.

## Fuera de alcance en este módulo

Se declara explícitamente para evitar que el alumno crea que le falta base:

- Genéricos, decoradores, `utility types`, `enum`, espacios de nombres.
- API de Playwright (locators, aserciones web-first, configuración) — es el módulo 01.
- Page Object Model como patrón de diseño — es el módulo 02.
- Herencia y polimorfismo: el proyecto real no los usa en ningún sitio.

## Criterio de superación

El alumno supera el módulo si:

1. Los Labs 1 a 4 quedan en verde en su rama de trabajo.
2. Obtiene ≥ 70 en el assessment del módulo.
3. Obtiene **apto** en la Parte C (defensa técnica, objetivo O8).
