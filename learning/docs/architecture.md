# Arquitectura del Learning Lab

Cómo está organizado el material formativo, por qué está así, y las reglas que lo mantienen sano.

---

## Principio rector

**El código de automatización y el material formativo no se mezclan.**

`tests/`, `pages/`, `scripts/`, `prompts/`, `specs/`, `.github/` y la configuración raíz permanecen intactos y siguen siendo la aplicación de referencia que el alumno estudia. Todo lo formativo vive bajo `learning/`.

Tres razones, todas prácticas:

1. **El proyecto sigue funcionando.** El pipeline de CI ejecuta `testDir: './tests'` y no ve nada de `learning/`. Un alumno no puede romper la demo.
2. **Los defectos son el material.** Los 10 tests `@demo-fail` deben seguir fallando: son el módulo 04 entero. Si alguien los "arregla", el material desaparece.
3. **Las referencias `fichero:línea` siguen siendo válidas.** Todo el material apunta a líneas concretas del proyecto. Si el proyecto se modifica para "hacerlo más didáctico", el material se desincroniza — exactamente la deriva documental que ya sufren `specs/` y el README, y que el módulo 07 usa como ejercicio.

## Estructura

```
learning/
├── README.md                          Punto de entrada del programa
├── phase-1-learning-lab-design.md     Análisis del repositorio y diseño (Fase 1)
│
├── docs/                              Documentación transversal
│   ├── learning-path.md               Mapa de los 10 módulos
│   ├── student-guide.md               Guía práctica del alumno
│   ├── trainer-guide.md               Guía del formador
│   ├── assessment-rubric.md           Rúbrica general de 13 competencias
│   ├── prerequisites.md               Prerrequisitos justificados
│   ├── setup-guide.md                 Instalación y problemas típicos
│   ├── architecture.md                Este documento
│   ├── module-01-discovery-design.md      🔬 Diseño del módulo 01, validado técnicamente
│   └── module-01-technical-validation.md  🔬 20 locators medidos contra la app real
│
├── assessment/                        Pre-assessment, niveles de entrada, checkpoints
│
├── modules/
│   ├── README.md                      Índice de módulos y su estado
│   └── NN-nombre/
│       ├── README.md                  Entrada del módulo
│       ├── learning-objectives.md     Objetivos evaluables
│       ├── theory.md                  El 20% teórico
│       ├── repository-mapping.md      Concepto → fichero:línea
│       ├── labs/                      Ejercicios guiados
│       ├── challenges/                Ejercicios sin pasos
│       └── assessment/                Evaluación del módulo
│
├── student/
│   ├── README.md                      Reglas de trabajo
│   └── sandbox/                       Zona de trabajo EJECUTABLE
│       ├── playwright.config.ts       Configuración del módulo 00 (sin navegador)
│       ├── 00-foundations/            Ficheros de ejercicio del módulo 00
│       └── 01-playwright/             Módulo 01: config propia con navegador
│
├── solutions/
│   ├── README.md                      Política de publicación
│   └── NN-nombre/                     Soluciones verificadas + clave 🔒
│
└── trainer/
    └── session-plans/                 Guion por sesión
```

## Qué contiene cada zona

| Zona | Audiencia | Contenido | Modificable por el alumno |
|---|---|---|---|
| `docs/` | Todos | Referencia transversal | ❌ |
| `assessment/` | Formador (diseño), alumno (ejecución) | Pre/post-assessment, niveles | ❌ |
| `modules/` | Alumno | Teoría, mapeo, enunciados | ❌ |
| `student/sandbox/` | Alumno | Código ejecutable de los ejercicios | ✅ **Es su zona** |
| `solutions/` | Formador → alumno diferido | Soluciones verificadas | ❌ |
| `trainer/` | Formador | Guion de sesión | ❌ |

## El sandbox

`learning/student/sandbox/` tiene **su propia configuración de Playwright**, independiente de la raíz:

```typescript
// learning/student/sandbox/playwright.config.ts
export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
});
```

Consecuencias, todas buscadas:

| Propiedad | Efecto |
|---|---|
| `testDir: '.'` relativo al fichero | Solo ve los ejercicios; nunca `tests/` |
| La raíz tiene `testDir: './tests'` | `npm test` y el CI nunca ejecutan los ejercicios |
| Sin fixture `page` en el módulo 00 | No abre navegador, no necesita internet |
| `retries: 0` | Un fallo es un fallo; nada se enmascara |
| `reporter: list` | Salida legible en clase, sin abrir un HTML |

**Comando:**

```bash
npx playwright test -c learning/student/sandbox
```

`-c` acepta un directorio y busca dentro el `playwright.config.ts`, así que el comando es corto y no hace falta añadir scripts a `package.json` — otro fichero raíz que queda intacto.

## Reglas de construcción del material

Aplicables a todos los módulos, presentes y futuros:

1. **Un fichero markdown por unidad de contenido.** Si un `theory.md` supera las ~300 líneas, el módulo está mal dividido.
2. **Todo ejercicio referencia un archivo real** del repositorio con `fichero:línea`. Nunca un ejemplo inventado.
3. **Todo ejercicio declara su nivel** (1-7) en el encabezado.
4. **Los ejercicios `[+]`** son las extensiones para nivel ADVANCED, y suben un nivel respecto al ejercicio base en lugar de añadir más volumen del mismo.
5. **Todo ejercicio con código debe ser ejecutable** y estar verificado antes de publicarse.
6. **El estado inicial del sandbox representa el punto de partida real.** Si un Lab empieza en rojo, el repositorio está en rojo — y el enunciado lo dice.
7. **Idioma:** material en castellano; términos técnicos, API, comandos y nombres de fichero en inglés. Igual que el repositorio.
8. **Las soluciones se publican de forma diferida, no se ocultan.** Esconderlas en Git es una ilusión.

## Estado inicial del sandbox por módulo

Cada módulo declara qué debe ver el alumno al clonar. Para el módulo 00:

```bash
npx playwright test -c learning/student/sandbox
# 7 failed
# 13 passed
```

Es un dato de contrato: si no coincide, algo se modificó antes de tiempo.

## Comprobación de integridad

Antes de cada sesión, y en cualquier revisión del material:

```bash
# 1. El proyecto no ha sido modificado
git diff --stat main -- tests/ pages/ scripts/ prompts/ specs/ .github/ playwright.config.ts package.json tsconfig.json
# debe estar vacío

# 2. El sandbox está en su estado inicial declarado
npx playwright test -c learning/student/sandbox

# 3. Todo el repositorio compila
npx tsc --noEmit

# 4. La suite del proyecto sigue teniendo el tamaño esperado
npx playwright test --list | tail -1
# Total: 237 tests in 14 files
```

## Desviaciones respecto al diseño de la Fase 1

| Diseño de la Fase 1 | Implementación real | Motivo |
|---|---|---|
| `learning/docs/` para la documentación transversal | Mantenido | — |
| `learning/student/sandbox/` como zona de trabajo | Mantenido, y además **ejecutable** con su propia config | La Fase 1 no había decidido cómo se ejecutarían los ejercicios; hacía falta una configuración propia para que el módulo 00 funcione sin navegador ni red |
| `learning/trainer/` con 6 ficheros | Solo `session-plans/` y la guía en `docs/trainer-guide.md` | Se crea material cuando hace falta, no por completar un esquema. Los demás ficheros se añadirán cuando su módulo los necesite |
| Ficheros de documentación en `docs/` (raíz del repositorio) | Colocados en `learning/docs/` | La instrucción de la Fase 2 sugería una carpeta `docs/` en la raíz. Se ha mantenido bajo `learning/` por coherencia con el principio rector: todo lo formativo en un solo sitio, y el repositorio ya usa `specs/` en la raíz para documentación de QA del proyecto |
| Módulo 00: "el alumno explica en voz alta, línea a línea, qué hace `inventory.page.ts`" ([Fase 1, §10](../phase-1-learning-lab-design.md)) | Objetivo **O8 reformulado**: *comunicar y justificar decisiones técnicas* — explicar el porqué de una decisión propia y separar síntoma de causa raíz. Se evalúa como apto/no apto dentro de la revisión de un Lab (Parte C del assessment) | Leer código en voz alta no es una competencia profesional: es el suelo, no el objetivo. Justificar una decisión y distinguir síntoma de causa sí lo son, y esta última es el prerrequisito real del módulo 04, que es diagnóstico puro. La lectura del fichero sigue siendo necesaria —la defensa del Lab 1 la exige—, pero deja de ser el fin |
| Módulo 00: 3 h de sesión + 2-3 h personales | **5 h dirigidas + 3 h personales + 45 min de assessment** | La estimación de la Fase 1 era previa a la construcción del material y contabilizaba solo teoría y Labs. Al material real hay que sumarle apertura, puestas en común, defensa técnica y margen para bloqueos |

> El documento [`phase-1-learning-lab-design.md`](../phase-1-learning-lab-design.md) **no se modifica**: es el registro del diseño aprobado en su momento. Las diferencias entre aquel diseño y la implementación se recogen aquí.
