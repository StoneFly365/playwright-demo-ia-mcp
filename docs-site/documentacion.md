# Documentación canónica

Cómo está organizada la documentación del Learning Lab, cuál manda cuando dos documentos discrepan, y qué no se publica en este portal.

---

## La regla

**La fuente de verdad es `learning/` en el repositorio.** Este portal es una capa de presentación: sirve los mismos ficheros Markdown, sin copiarlos ni reescribirlos. Si un documento cambia en `learning/`, cambia aquí.

Solo seis páginas son propias del portal —esta incluida— y su papel es únicamente **orientar y enlazar**: [Inicio](/), [Mapa del programa](/mapa.md), [Documentación canónica](/documentacion.md), [Overview del Módulo 01](/modulo-01.md), [Cómo funciona el piloto](/piloto.md) y la página de documento no publicado.

## Qué documento manda

| Tema | Documento canónico | Los demás documentos |
|---|---|---|
| Diseño global del programa | [Fase 1 — Diseño del Learning Lab](/learning/phase-1-learning-lab-design.md) | Lo citan, no lo redefinen |
| Roadmap de los 10 módulos | [Learning path](/learning/docs/learning-path.md) | Es un mapa: el contenido vive en cada módulo |
| Reglas de organización del material | [Arquitectura del Learning Lab](/learning/docs/architecture.md) | — |
| Contenido de un módulo | El `README.md` del propio módulo | — |
| Calendario y bloques de sesión | El plan de sesión del formador | Si discrepa con el README del módulo, **manda el plan de sesión** |
| Qué se mide en el piloto | [Plan de piloto](/learning/docs/module-01-pilot-plan.md) | Si discrepa con el run log, **manda el plan** |
| Evaluación transversal | [Rúbrica general](/learning/docs/assessment-rubric.md) | Los assessments de módulo la aplican |

## Tres audiencias, tres recorridos

| Audiencia | Documentación | Entrada |
|---|---|---|
| **Alumno** | Guías, teoría, Labs, Challenges, Assessment | [Guía del alumno](/learning/docs/student-guide.md) |
| **Formador** | Planes de sesión, guía del formador, claves de evaluación | [Guía del formador](/learning/docs/trainer-guide.md) |
| **Diseño / QA / piloto** | Discovery, validación técnica, revisión pedagógica, piloto | [Cómo funciona el piloto](/piloto.md) |

La documentación de diseño y piloto **no forma parte del recorrido del alumno**. Está publicada porque el programa es auditable, no porque haya que leerla para aprender.

## Qué no se publica

| Material | Motivo |
|---|---|
| `learning/solutions/**` — soluciones de Labs, Challenges y claves de assessment | Política de **publicación diferida**: el formador las entrega al cerrar cada Lab. Están en el repositorio, no en el portal |
| `test-results/`, `playwright-report/`, `test-results.json` | Artefactos de ejecución, ignorados por Git |

Un enlace del material canónico hacia una solución lleva en este portal a una página que lo explica. El documento sigue existiendo en el repositorio para quien tenga acceso.

## Ficheros de código

La teoría y los Labs enlazan constantemente ficheros reales (`pages/login.page.ts`, `tests/inventory.spec.ts`, `playwright.config.ts`). Esos enlaces **abren el fichero en GitHub** en una pestaña nueva: el portal publica documentación, no código.

## Ver el portal en local

```bash
# Ensamblar el sitio igual que lo hace CI (Git Bash / WSL / Linux / macOS)
rm -rf _site && mkdir -p _site
cp -r docs-site/. _site/
rsync -a --exclude 'solutions/' learning/ _site/learning/

# Servirlo
npx docsify-cli@4 serve _site
```

`_site/` es un directorio generado y está ignorado por Git. Docsify no necesita instalarse en el proyecto: `npx` lo descarga al vuelo y **no se añade ninguna dependencia a `package.json`**.
