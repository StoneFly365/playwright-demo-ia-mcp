# Guía del formador

---

## 1. Estructura del Learning Lab

```
learning/
├── README.md                      Punto de entrada del programa
├── phase-1-learning-lab-design.md Análisis del repositorio y diseño completo
├── docs/                          Documentación transversal (este fichero incluido)
├── assessment/                    Pre-assessment y niveles de entrada
├── modules/NN-nombre/             Un directorio por módulo
│   ├── README.md                  Objetivo, contenido, puesta en marcha, trazabilidad
│   ├── learning-objectives.md     Objetivos evaluables y su instrumento de evaluación
│   ├── theory.md                  El 20% teórico, anclado en ficheros reales
│   ├── repository-mapping.md      Concepto → fichero:línea → qué observar → qué aprender
│   ├── labs/                      Ejercicios guiados
│   ├── challenges/                Ejercicios sin pasos
│   └── assessment/                Evaluación del módulo
├── student/sandbox/               Zona de trabajo ejecutable del alumno
├── solutions/NN-nombre/           Soluciones verificadas + clave del assessment 🔒
└── trainer/session-plans/         Guion de cada sesión
```

**Regla estructural que no se negocia:** el material formativo vive **solo** bajo `learning/`. El código del proyecto (`tests/`, `pages/`, `scripts/`, `prompts/`, `specs/`, `.github/`, configuración raíz) no se modifica en ningún módulo. Justificación completa en [architecture.md](architecture.md).

## 2. Metodología

Cada módulo recorre siempre la misma cadena:

```
CONCEPTO → CÓDIGO REAL → ANÁLISIS → EJERCICIO → MODIFICACIÓN → VALIDACIÓN → REFLEXIÓN QA
```

**20% teoría / 80% práctica.** En una sesión de 3 horas eso son ~35 minutos de exposición como máximo, y nunca seguidos: la teoría se sirve en bloques de 10-12 minutos intercalados con práctica.

Tres principios que conviene declarar en voz alta en la primera sesión:

1. **Los defectos del repositorio son el material.** Hay 30 problemas catalogados en la Fase 1 y ninguno se ha corregido a propósito. Si alguien "limpia" el repositorio, destruye el material de los módulos 02, 04, 06, 07 y 08.
2. **Diagnosticar antes que corregir.** Cambiar el valor esperado de una aserción para llegar a verde es la conducta que el programa existe para prevenir. Penalízala explícitamente desde el módulo 00.
3. **QA + IA, nunca IA en lugar de QA.** Dilo el primer día, no el módulo 08. Reduce la resistencia del grupo.

## 3. Progresión

Los siete niveles y su asignación por módulo están en la [Fase 1, sección 12](../phase-1-learning-lab-design.md). Tres reglas prácticas:

- **Ningún módulo empieza en su nivel dominante.** Aunque el módulo 04 sea TROUBLESHOOT, arranca en FOLLOW.
- **TROUBLESHOOT (04) va antes que OPTIMIZE (06, 08).** No se mejora lo que no se sabe diagnosticar.
- **ARCHITECT solo en el capstone.** Es el único momento en que el alumno parte de cero.

Cada nivel tiene su forma de evidencia: FOLLOW/MODIFY → un diff; DESIGN/ARCHITECT → un documento; TROUBLESHOOT → un informe; OPTIMIZE → un número antes y otro después.

## 4. Cómo usar el repositorio en sesión

### Preparación previa (obligatoria, cada semana)

```bash
git pull
npm ci
npx playwright test --project=chromium          # ¿sigue el proyecto como se espera?
npx playwright test -c learning/student/sandbox # ¿el sandbox está en 13/7?
npx tsc --noEmit
```

**Verifica que los 10 `@demo-fail` siguen fallando.** SauceDemo es un sitio de terceros: si cambia, algún fallo intencionado podría empezar a pasar y el módulo 04 se quedaría sin material. Si ocurre, no lo escondas: es un incidente real y da una clase estupenda.

### Durante la sesión

- **Proyecta el repositorio real, no diapositivas.** El material está escrito para leerse con el editor abierto.
- **Usa `fichero:línea`.** Todo el material lo hace; hazlo tú también al hablar.
- **Demo antes que exposición.** Ejecutar un test y ver el fallo enseña más que explicarlo.
- **No resuelvas: pregunta.** "¿Qué te dice el mensaje de error?" antes de "prueba con `[...]`".
- **Trabajo en parejas** en los módulos 02-06, emparejando por nivel de entrada (ver sección 8).

### Comandos de demostración más útiles

| Para mostrar… | Comando |
|---|---|
| La suite completa en un navegador | `npm run test:chromium` |
| Solo los fallos intencionados | `npm run test:demo:fail` |
| Solo la suite verde | `npm run test:demo:green` |
| El informe HTML | `npm run test:report` |
| El sandbox del alumno | `npx playwright test -c learning/student/sandbox` |
| El pipeline con fallos reales (módulos 04/08) | `gh workflow run "Playwright Tests" -f suite=fail` |

> **Importante para las demos de CI:** en `push` y `pull_request` la suite por defecto es `green`, así que el reporte IA analiza una ejecución sin fallos. Para enseñar el valor del análisis por IA hay que lanzar el workflow manualmente con `suite: fail` o `all`.

## 5. Cómo evaluar

Cuatro instrumentos, y conviene no mezclarlos:

| Instrumento | Qué mide | Cuándo |
|---|---|---|
| **Validación de Labs** | Que el ejercicio funciona | Continuo, autoservicio del alumno |
| **Assessment del módulo** | Que la competencia se ha adquirido | Al cierre de cada módulo |
| **Defensa técnica** (apto/no apto) | Que sabe explicar **por qué**, y separar síntoma de causa | Dentro de la revisión de un Lab o Challenge |
| **Rúbrica del programa** | Nivel global por competencia | Al inicio (pre), a mitad y al final |

### La defensa técnica

Evalúa el objetivo O8 del módulo 00 y no tiene puntuación: es apto / no apto, y es requisito para superar el módulo.

**No la conviertas en un examen oral.** Se hace mientras el alumno ya está explicando su trabajo en una revisión, dura 5-10 minutos, y son cuatro preguntas: qué hiciste y por qué, qué descartaste, síntoma frente a causa de algún problema que te encontraste, y qué mirarías primero si esto falla mañana en CI.

**La tercera pregunta es la que decide.** Quien llama "causa" al síntoma va a tener problemas serios en el módulo 04, que es diagnóstico puro. Detectarlo en el módulo 00 es barato.

Con un grupo de 10 personas no da tiempo a todos en una sesión: prioriza a quien ya mostró señales durante los Labs y completa el resto en la revisión del Challenge. Rúbrica, ejemplos de calibración y criterios en `learning/solutions/00-foundations/assessment-key.md`, Parte C.

### Cobertura: nada se evalúa sin haberse enseñado

Antes de dar por cerrado cualquier módulo, comprueba que cada ítem del assessment tiene su anclaje en `theory.md` y su práctica en un Lab o Challenge. La tabla de trazabilidad objetivo ↔ ítem está al final del assessment de cada módulo; la de competencia ↔ fichero real ↔ ejercicio ↔ validación, al final de su `repository-mapping.md`.

La rúbrica general está en [assessment-rubric.md](assessment-rubric.md). La clave de corrección de cada módulo está en `learning/solutions/NN-*/assessment-key.md` y **no se comparte con el grupo**.

**Criterio de corrección transversal:** en cualquier módulo, modificar una aserción para hacer pasar un test penaliza aunque el resultado sea verde. Está tarifado en la clave del módulo 00 (−12 puntos) y debe aplicarse sin excepciones.

## 6. Cómo usar los Challenges

Los Labs dan los pasos; los Challenges no. Un Challenge da objetivo, restricciones y criterios de aceptación.

**Cómo conducirlos:**

1. Preséntalo y no contestes preguntas de "cómo" durante los primeros 15 minutos.
2. A partir de ahí, responde con preguntas: "¿qué pasaría si el impuesto cambiara mañana?".
3. Las pistas del enunciado están en bloques `<details>` colapsados: el alumno decide cuándo abrirlas y eso ya es información para ti.
4. **La justificación escrita pesa.** Un Challenge que funciona sin justificación no llega al aprobado; uno justificado con un fallo menor, sí.
5. Cierra en grupo comparando **dos soluciones distintas** de dos parejas. Es el momento de mayor aprendizaje de todo el módulo.

## 7. Cómo detectar bloqueos

| Señal observable | Qué está pasando | Qué hacer |
|---|---|---|
| Cambia código al azar sin leer el error | No sabe leer la salida | Sentarse y leer el mensaje juntos, línea a línea |
| Modifica el `expect` para llegar a verde | Confunde "verde" con "correcto" | Intervención inmediata: es el hábito más caro del programa |
| Silencio prolongado, sin preguntar | Vergüenza, no falta de dudas | Acercarse y preguntar por el último comando ejecutado |
| Pide la solución antes de 10 minutos | Baja tolerancia a la frustración | Dar una pista, nunca la solución |
| Termina en la mitad de tiempo que el resto | Perfil ADVANCED aburrido | Asignarle el ejercicio `[+]` y rol de mentor |
| Copia el código de un Lab anterior sin adaptarlo | No ha entendido la diferencia entre ejercicios | Pedirle que explique en voz alta qué hace cada línea |
| No ejecuta `npx tsc --noEmit` nunca | Se le acumularán errores de tipos | Convertirlo en ritual antes de cada commit |

**Regla de tiempos:** si más de un tercio del grupo lleva más de 20 minutos en un mismo paso, para la clase y resuélvelo en común. No es un problema individual, es un problema del material o del ritmo.

## 8. Errores habituales esperados por módulo

### Módulo 00 (documentados y verificados)

| Error | Frecuencia | Origen |
|---|---|---|
| Olvidar el spread antes de `sort` | Muy alta | No ha interiorizado que `sort` muta |
| `sort()` sin comparador con números | Muy alta | Intuición: "ordenar es ordenar" |
| Olvidar el `await` | Muy alta | El código "parece" funcionar |
| Elegir datos de prueba que no rompen el código | Alta | Piensa como programador, no como QA |
| Tipar el parámetro como `string` en vez de unión literal | Alta | Desconoce la construcción |
| Modificar el fichero de contrato del Lab 3 | Media | No ha leído la cabecera del fichero |
| Diagnosticar los fallos 1 y 3 del Lab 4 como el mismo | Media | Clasifica por síntoma, no por causa |
| Cambiar un `expect` en el Lab 4 | Baja pero crítica | Hábito adquirido en otros contextos |

Cada uno está desarrollado, con síntoma y corrección, en las soluciones del módulo.

### Módulos posteriores (previsión de la Fase 1)

- **01:** desconfianza en el auto-waiting → tendencia a añadir `waitForTimeout`, sobre todo en perfiles de Selenium.
- **02:** confundir "más métodos en el POM" con "mejor POM".
- **03:** el módulo más denso del programa; concentra 4 gaps CRITICAL. Prevé que se alargue.
- **04:** intentar "arreglar" los `@demo-fail` en vez de diagnosticarlos.
- **08:** aceptar la salida de la IA sin revisarla. Es exactamente lo que el módulo debe desmontar.

## 9. Cómo usar las soluciones

**Política de publicación:**

| Momento | Qué se publica |
|---|---|
| Durante la sesión | Nada. Pistas, no soluciones |
| Al cerrar cada Lab en clase | La solución de ese Lab |
| Al cerrar el módulo | Todas, salvo la clave del assessment |
| Nunca | `assessment-key.md` |

Las soluciones están en el repositorio y son técnicamente accesibles desde el minuto uno. Es deliberado: ocultarlas en Git es una ilusión. Acuerda con el grupo cuándo se consultan en lugar de fingir que no existen.

**Cómo usarlas tú:** cada solución incluye *alternativas válidas* y *errores habituales*. Las alternativas son el guion de la puesta en común; los errores habituales, la lista de lo que vas a ver esa tarde.

## 10. Checklist de cierre de módulo

- [ ] Todos los alumnos tienen su rama con los Labs en verde
- [ ] `git status` limpio de modificaciones fuera de `learning/student/sandbox/`
- [ ] Assessment corregido y devuelto
- [ ] Alumnos por debajo de 70 identificados, con plan de refuerzo
- [ ] Dudas recurrentes anotadas para ajustar el material
- [ ] Soluciones del módulo publicadas al grupo
- [ ] El proyecto principal sigue intacto: `git diff --stat main -- tests/ pages/ scripts/ prompts/ specs/ .github/` vacío
