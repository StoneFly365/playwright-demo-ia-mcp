# QA Automation & AI Engineering Learning Lab
## HDI Seguros Chile

Un programa de formación en automatización de pruebas construido **sobre un proyecto real**, no sobre ejemplos de juguete.

---

## 🎯 ¿Tienes seis horas y un proyecto en marcha?

Antes de nada: existe un recorrido corto. **[Ruta QA — 6 horas](ruta-qa/README.md)** selecciona lo esencial del programa y lo orienta a aplicar IA en tu trabajo de QA el mismo día.

El resto de este documento describe el programa completo (38 h, 10 módulos). No hace falta para seguir la ruta.

---

## Qué es esto

Este repositorio es una suite E2E de verdad: 79 tests sobre [SauceDemo](https://www.saucedemo.com), 6 Page Objects, ejecución en tres navegadores, pipeline de GitHub Actions dentro de un contenedor Docker y un análisis de fallos generado por IA. Funciona, se ejecuta a diario y tiene los defectos que tiene cualquier proyecto real.

El Learning Lab convierte ese proyecto en un laboratorio. No vas a leer teoría sobre Page Objects: vas a abrir los seis que hay aquí y a diagnosticar el defecto real que esconden. No vas a estudiar cómo se depura un test: vas a diagnosticar los diez que fallan a propósito.

**El repositorio es el material.** Cada concepto del programa apunta a un fichero y una línea que puedes abrir ahora mismo.

## Objetivo

Que un QA de HDI pase de ejecutar pruebas a **diseñar, construir, depurar y automatizar** una estrategia de calidad completa: desde escribir su primer locator hasta razonar sobre qué merece la pena automatizar y por qué, pasando por CI/CD, Docker y el uso con criterio de la IA.

## Público objetivo

QAs con experiencia previa en testing. Se asume que:

- conoces los conceptos de QA: caso de prueba, defecto, severidad, regresión;
- puedes venir de testing manual, o de Selenium, Cypress u otra herramienta;
- **no** se da por supuesto que conozcas Playwright;
- **no** se da por supuesto que domines TypeScript;
- **no** se da por supuesto que hayas usado CI/CD, Docker ni IA;
- **no** eres desarrollador, y no hace falta que lo seas.

Todo eso se aprende aquí. El [pre-assessment](assessment/) determina tu punto de partida y si necesitas el módulo 00 completo, ampliado o ninguno.

## Prerrequisitos

Detalle y justificación de cada uno en [docs/prerequisites.md](docs/prerequisites.md). En resumen:

**Imprescindibles**
- Fundamentos de QA y de web (HTML, DOM, URL)
- Manejo básico de terminal
- [Node.js 20+](https://nodejs.org/)
- Cuenta de GitHub
- Acceso de red a `saucedemo.com`, npm y GitHub

**Recomendables**
- Sintaxis básica de JavaScript *(si no la tienes, el módulo 00 la cubre)*
- Git básico: `clone`, `commit`, ramas
- VS Code o un editor con soporte TypeScript

**Opcionales**
- Docker Desktop *(solo para replicar el CI en local; el módulo 06 se puede seguir sin él)*
- Experiencia previa con otra herramienta de automatización

## Cómo usar el repositorio

```bash
# 1. Instalar dependencias
npm install

# 2. Crear tu rama de trabajo (una por módulo)
git checkout -b learning/00-foundations-<tu-nombre>

# 3. Empezar por el módulo 00
```
→ [modules/00-foundations/](modules/00-foundations/)

**Regla de oro:** todo tu trabajo vive en `learning/student/sandbox/`. El código del proyecto (`tests/`, `pages/`, `scripts/`, `prompts/`, `specs/`, `.github/`) es material de lectura y **no se modifica**. Detalle en [student/README.md](student/README.md).

## Estructura

```
learning/
├── README.md                    ← estás aquí
├── phase-1-learning-lab-design.md   Análisis del repositorio y diseño del programa
│
├── ruta-qa/                     🎯 Ruta QA — 6 h: el recorrido corto y práctico
│
├── docs/                        Documentación transversal
│   ├── learning-path.md         Mapa completo de los 10 módulos
│   ├── student-guide.md         Guía práctica del alumno
│   ├── trainer-guide.md         Guía del formador
│   ├── assessment-rubric.md     Rúbrica general del programa
│   ├── prerequisites.md         Prerrequisitos justificados
│   ├── setup-guide.md           Instalación paso a paso
│   └── architecture.md          Arquitectura del Learning Lab y sus reglas
│
├── assessment/                  Pre-assessment y niveles de entrada
├── modules/                     Un directorio por módulo
│   ├── 00-foundations/          ✅ completo
│   └── 01-playwright-fundamentals/  ✅ completo
├── student/                     Tu zona de trabajo (sandbox ejecutable)
├── solutions/                   Soluciones verificadas, publicación diferida
└── trainer/                     Planes de sesión
```

## Metodología

**20% teoría, 80% práctica.** Cada módulo sigue siempre la misma cadena:

```
CONCEPTO → CÓDIGO REAL → ANÁLISIS → EJERCICIO → MODIFICACIÓN → VALIDACIÓN → REFLEXIÓN QA
```

Ningún concepto se presenta sin un fichero real que lo ilustre. Ningún ejercicio termina sin un comando que verifique el resultado. Ningún Lab se cierra sin una pregunta de criterio QA que va más allá del código.

Tres principios que atraviesan el programa:

1. **Los defectos del repositorio son el material.** Hay 30 problemas de calidad catalogados —locators frágiles, tests que no pueden fallar, una ruta absoluta en `package.json`— y ninguno se ha corregido a propósito. Son los ejercicios.
2. **Diagnosticar antes que corregir.** Cambiar el valor esperado de una aserción para que un test pase es la conducta que este programa existe para prevenir.
3. **QA + IA, nunca IA en lugar de QA.** La IA analiza y sintetiza; el criterio de qué es crítico para el negocio lo pones tú.

## Progresión

Siete niveles, del más guiado al más autónomo. Cada módulo declara en cuál trabaja:

| Nivel | Qué haces |
|---|---|
| 1 · FOLLOW | Sigues una guía sobre código existente |
| 2 · MODIFY | Cambias código que ya funciona |
| 3 · CREATE | Escribes algo nuevo |
| 4 · DESIGN | Eliges entre alternativas y lo justificas |
| 5 · TROUBLESHOOT | Encuentras la causa raíz de un fallo |
| 6 · OPTIMIZE | Mejoras algo que funciona, con métrica antes/después |
| 7 · ARCHITECT | Diseñas la solución completa (capstone) |

## Cómo ejecutar los ejercicios

Los ejercicios se ejecutan con una **configuración de Playwright independiente**, que no ve la suite del proyecto:

```bash
# Todos los ejercicios del sandbox
npx playwright test -c learning/student/sandbox

# Un fichero concreto
npx playwright test -c learning/student/sandbox 00-foundations/02-arrays.spec.ts

# Comprobar tipos en todo el repositorio
npx tsc --noEmit
```

La suite del proyecto se ejecuta como siempre y **no se ve afectada**:

```bash
npm test                 # 79 tests × 3 navegadores
npm run test:chromium    # solo Chromium
```

## Cómo validar que has terminado un ejercicio

Cada Lab termina con una sección **Validación** que incluye los comandos exactos. El patrón es siempre el mismo:

```bash
# 1. Los tests del ejercicio pasan
npx playwright test -c learning/student/sandbox <fichero>

# 2. El tipado es correcto
npx tsc --noEmit

# 3. No has tocado el proyecto principal
git status --short     # solo debe aparecer learning/student/sandbox/
```

Si el punto 3 muestra `pages/` o `tests/` modificados, deshaz esos cambios con `git restore pages/ tests/` antes de continuar.

## Relación entre teoría y código

En este Learning Lab la teoría **nunca** va sola. Cada sección de `theory.md` termina con un **"Ábrelo"** que apunta a un fichero y una línea del proyecto real:

> **Ábrelo:** [`tests/inventory.spec.ts:32`](../tests/inventory.spec.ts) — `const sorted = [...names].sort(...)`. Ese `...` no es decorativo.

Y cada módulo incluye un `repository-mapping.md` que responde a la pregunta que importa: **"¿qué fichero concreto de este repositorio usamos para enseñar este concepto?"** Cuando no existe un ejemplo adecuado, se dice explícitamente en lugar de inventarlo.

## Estado actual del programa

| Módulo | Estado |
|---|---|
| 00 — Fundamentos JS/TS para QA | ✅ **Completo** |
| 01 — Playwright Fundamentals | ✅ **Completo** — [módulo](modules/01-playwright-fundamentals/) · pendiente de piloto |
| 02 — Page Object Model & Suite | ⬜ Pendiente |
| 03 — Arquitectura: fixtures, auth y datos | ⬜ Pendiente |
| 04 — Debugging & Failure Analysis | ⬜ Pendiente |
| 05 — Más allá de la UI (API & Mocking) | ⬜ Pendiente |
| 06 — CI/CD & Docker | ⬜ Pendiente |
| 07 — Quality Engineering & Test Strategy | ⬜ Pendiente |
| 08 — AI-Augmented QA | ⬜ Pendiente |
| 09 — HDI Capstone | ⬜ Pendiente |

El mapa completo de los diez módulos —objetivos, contenidos, duración, dependencias y anclajes en el repositorio— está en [docs/learning-path.md](docs/learning-path.md).

## Enlaces rápidos

| Si eres… | Empieza por |
|---|---|
| **QA con 6 horas y un proyecto en marcha** | [ruta-qa/](ruta-qa/README.md) |
| **Alumno del programa completo** | [docs/student-guide.md](docs/student-guide.md) → [modules/00-foundations/](modules/00-foundations/) |
| **Formador** | [docs/trainer-guide.md](docs/trainer-guide.md) → [trainer/session-plans/](trainer/session-plans/) |
| **Responsable del programa** | [phase-1-learning-lab-design.md](phase-1-learning-lab-design.md) → [docs/learning-path.md](docs/learning-path.md) |
