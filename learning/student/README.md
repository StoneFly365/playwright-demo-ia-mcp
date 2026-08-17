# Zona de trabajo del alumno

Aquí es donde escribes código. En ningún otro sitio.

---

## Las tres reglas

### 1. Solo se trabaja en `sandbox/`

| Zona | Permiso |
|---|---|
| `learning/student/sandbox/` | ✅ Tu zona |
| `learning/student/progreso.md` | ✅ Tu registro personal |
| `pages/`, `tests/`, `scripts/`, `prompts/`, `specs/` | ❌ Solo lectura |
| `playwright.config.ts`, `package.json`, `tsconfig.json`, `.github/` | ❌ No se tocan |
| `learning/modules/`, `learning/docs/`, `learning/solutions/` | ❌ Material, no código |

**Por qué:** los 10 tests que fallan a propósito en `tests/` son el material del módulo 04. Si alguien los "arregla", ese módulo se queda sin ejercicios. Y todas las referencias `fichero:línea` del material dejarían de coincidir.

### 2. Nunca modifiques una aserción para llegar a verde

Cuando un test falla, el problema está en el código, no en el `expect`. Cambiar el valor esperado hace desaparecer el rojo y también la señal.

Es la conducta que este programa existe para prevenir, y está penalizada explícitamente en los assessments.

### 3. Verifica antes de cada commit

```bash
npx playwright test -c learning/student/sandbox   # tests
npx tsc --noEmit                                   # tipos
git status --short                                 # solo learning/student/
```

Si `git status` muestra `pages/` o `tests/`:

```bash
git restore pages/ tests/
```

---

## Contenido de esta carpeta

```
student/
├── README.md          Este fichero
├── progreso.md        Tu registro personal (créalo tú; no se sube al repositorio común)
└── sandbox/
    ├── README.md      Cómo funciona el sandbox
    ├── playwright.config.ts
    └── 00-foundations/
        ├── 01-values.spec.ts       Lab 1 — dado, en verde
        ├── 02-arrays.spec.ts       Lab 2 — lo modificas
        ├── 03-price-utils.ts       Lab 3 — lo implementas
        ├── 03-price-utils.spec.ts  Lab 3 — contrato, no se toca
        └── 04-broken.spec.ts       Lab 4 — lo diagnosticas
```

## Comandos que usarás a diario

```bash
# Todos tus ejercicios
npx playwright test -c learning/student/sandbox

# Uno concreto
npx playwright test -c learning/student/sandbox 00-foundations/02-arrays.spec.ts

# Filtrar por nombre de test
npx playwright test -c learning/student/sandbox --grep "ordenar"

# Comprobar tipos
npx tsc --noEmit
```

Ejecútalos siempre **desde la raíz del proyecto**.

## Tu rama

Una por módulo:

```bash
git checkout -b learning/00-foundations-<tu-nombre>
```

Un commit por Lab, con el Lab en el mensaje:

```bash
git add learning/student/sandbox/
git commit -m "feat(lab-2): ordenación parametrizada"
```

## Tu registro de avance

Crea `learning/student/progreso.md` y anota **dónde te atascaste y cuánto tardaste**. No es burocracia: es el dato que permite al formador ajustar el ritmo, y en el assessment se pregunta por decisiones que tomaste días antes.

Plantilla en [`../docs/student-guide.md`](../docs/student-guide.md), sección 6.
