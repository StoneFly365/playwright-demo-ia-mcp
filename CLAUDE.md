# CLAUDE.md

## Documentación al día con la arquitectura

Si un cambio toca la arquitectura o los procesos del framework, revisa en la misma PR si hay que actualizar la documentación. Cuentan como tales:

- `scripts/*.mjs` (no los `*.test.mjs`)
- `.claude/agents/`
- `.github/workflows/`
- `prompts/`
- `playwright.config.ts`, `.mcp.json` y los `scripts` de `package.json`

Qué revisar:

1. **`README.md`**: las secciones que describen lo que ha cambiado, el diagrama de "Cómo encaja todo", el árbol de "Estructura del proyecto" y el índice si se añade o se renombra una sección.
2. **Diagrama de negocio** (`docs/diagramas/qa-ia-negocio.workflow.json`): solo si cambia un paso que vería negocio (qué se ejecuta, qué hace la IA, quién decide, adónde va un fallo). Es abstracto a propósito: no le añadas detalle técnico. Si cambias el JSON, regenera el HTML con la orden del README y súbelo en el mismo commit.

La descripción de la PR lleva siempre una línea `Docs:` que diga qué se actualizó o por qué no aplica.
