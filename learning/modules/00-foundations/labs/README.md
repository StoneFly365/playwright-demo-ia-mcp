# Módulo 00 — Labs

Cuatro ejercicios en orden estricto. Cada uno sube un nivel en la progresión pedagógica del programa.

| Lab | Nivel | Qué haces | Estado inicial | Tiempo |
|---|---|---|---|---|
| [Lab 1](lab-1-follow.md) | **1 · FOLLOW** | Lees código real del proyecto y ejecutas un fichero ya resuelto | Verde | 30 min |
| [Lab 2](lab-2-modify.md) | **2 · MODIFY** | Cambias el comportamiento de una función sin romper sus tests | Verde | 30 min |
| [Lab 3](lab-3-create.md) | **3 · CREATE** | Implementas un módulo tipado desde cero contra un contrato de tests | **Rojo (4 fallos)** | 45 min |
| [Lab 4](lab-4-troubleshoot.md) | **5 · TROUBLESHOOT** | Diagnosticas tres fallos de causas distintas y los corriges | **Rojo (3 fallos)** | 40 min |

## Antes de empezar

```bash
npm install                # solo la primera vez
git checkout -b learning/00-foundations-<tu-nombre>
```

**No hace falta `npx playwright install`.** Los ejercicios del módulo 00 son lógica pura: no abren navegador y no necesitan conexión a internet.

## Comprobar el estado inicial

```bash
npx playwright test -c learning/student/sandbox
```

Debes ver exactamente esto:

```
7 failed
13 passed
```

Los 7 fallos son el punto de partida de los Labs 3 y 4. Si ves otra cifra, algo se ha modificado antes de tiempo: consulta con el formador.

## Reglas

1. **Solo se trabaja dentro de `learning/student/sandbox/`.** `tests/`, `pages/`, `scripts/` y la configuración raíz no se tocan en ningún Lab de este módulo.
2. **Los ficheros marcados "no modifiques" son contratos.** Si un test no pasa, el problema está en tu código, no en el test.
3. **Un commit por Lab**, con el Lab en el mensaje: `feat(lab-2): ordenación parametrizada`.
4. **Las soluciones existen** en [`learning/solutions/00-foundations/`](../../../solutions/00-foundations/). Consultarlas antes de intentarlo tú convierte 45 minutos de aprendizaje en 5 de lectura.
