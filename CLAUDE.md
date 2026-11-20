# CLAUDE.md

## Documentación al día en cada PR

Antes de abrir cualquier PR, revisa **todos** los `.md` del repositorio (`git ls-files '*.md'`) y actualiza los que hayan quedado desfasados respecto al código, no solo los que toca el cambio. Comprueba sobre todo:

- Cifras: número de tests, ficheros, `@demo-fail`, versiones (Playwright, imagen de Docker, modelos).
- Lo que se ejecuta dónde: jobs del workflow, secretos y variables, local frente a CI.
- Estado del `ROADMAP.md`: línea de estado, tabla de fases, pendientes marcados y registro de decisiones.
- Referencias a ficheros y líneas reales en `learning/`: se revisan a mano, porque `npm run ruta-qa:check` solo comprueba el entorno. Sobre todo si el cambio desplaza líneas de `tests/`, `pages/`, `fixtures/` o `scripts/`.

No se reescriben los documentos que son registro histórico con fecha: en `learning/docs/` los de discovery, validación técnica, revisión pedagógica y registro del piloto del módulo 01, y `learning/phase-1-learning-lab-design.md`.

### Cambios de arquitectura

Si el cambio toca la arquitectura o los procesos del framework, revisa además lo siguiente. Cuentan como tales:

- `scripts/*.mjs` (no los `*.test.mjs`)
- `.claude/agents/`
- `.github/workflows/`
- `prompts/`
- `playwright.config.ts`, `.mcp.json` y los `scripts` de `package.json`

Qué revisar:

1. **`README.md`**: las secciones que describen lo que ha cambiado, el diagrama de "Cómo encaja todo", el árbol de "Estructura del proyecto" y el índice si se añade o se renombra una sección.
2. **Diagrama de negocio** (`docs/diagramas/qa-ia-negocio.workflow.json`): solo si cambia un paso que vería negocio (qué se ejecuta, qué hace la IA, quién decide, adónde va un fallo). Es abstracto a propósito: no le añadas detalle técnico. Si cambias el JSON, regenera el HTML con la orden del README y súbelo en el mismo commit.
3. **Diagramas de controles** (`docs/diagramas/qa-ia-capas.architecture.json` y `qa-ia-controles.workflow.json`): solo si cambia un control alrededor de la IA (qué se enmascara o valida, qué bloquea un arreglo, qué herramientas o permisos tiene un agente, quién aprueba). Igual que el de negocio: regenera el HTML y súbelo en el mismo commit.

La descripción de la PR lleva siempre una línea `Docs:` que diga qué se revisó, qué se actualizó o por qué no aplica.
