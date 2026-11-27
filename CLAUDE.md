# CLAUDE.md

## Convenciones de los tests

- Page Object Model: la lógica de cada página vive en `pages/`, los specs en `tests/`.
- Los tests importan `test` y `expect` de `fixtures/test.ts`, nunca de `@playwright/test`.
- Selectores por rol accesible (`getByRole`) o por `data-test`/`data-testid` si la app los tiene. Nada de CSS o XPath que dependan de la estructura.
- Cada `expect` lleva un mensaje en español que diga qué debería pasar.
- `tests/seed.spec.ts` es el punto de arranque de los agentes planner, generator y qa-test-designer: debe dejar la app lista (con la sesión iniciada si hace falta).

## Documentación al día en cada PR

Antes de abrir cualquier PR, revisa todos los `.md` del repositorio (`git ls-files '*.md'`) y actualiza los que hayan quedado desfasados respecto al código. Comprueba sobre todo:

- Cifras: número de tests y versiones (Playwright, imagen de Docker, modelos).
- Lo que se ejecuta dónde: jobs del pipeline, secretos y variables, local frente a CI.

### Cambios de arquitectura

Si el cambio toca `scripts/*.mjs` (no los `*.test.mjs`), `.claude/agents/`, el pipeline de CI, `prompts/`, `playwright.config.ts`, `.mcp.json` o los `scripts` de `package.json`, revisa además:

1. **`README.md`**: las secciones que describen lo que ha cambiado y el árbol de "Estructura".
2. **Diagramas** de `docs/diagramas/`: solo si cambia un paso que vería negocio o un control alrededor de la IA (qué se enmascara o valida, qué bloquea un arreglo, qué permisos tiene un agente, quién aprueba). Si cambias un JSON, regenera su HTML con la orden del README y súbelo en el mismo commit.

La descripción de la PR lleva siempre una línea `Docs:` que diga qué se revisó, qué se actualizó o por qué no aplica.
