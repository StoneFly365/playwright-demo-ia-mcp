# Rúbrica general del programa

Rúbrica transversal de las 13 competencias del Learning Lab. Se aplica tres veces: al inicio (pre-assessment), a mitad (checkpoint) y al final (post-assessment + capstone).

Los cuatro niveles son los definidos en la [Fase 1, sección 8.4](../phase-1-learning-lab-design.md).

---

## Los cuatro niveles

| Nivel | Puntos | Significado operativo |
|---|---|---|
| **BEGINNER** | 0-39 | Reconoce el concepto cuando se lo nombran, no lo aplica sin ayuda |
| **FOUNDATION** | 40-59 | Lo aplica sobre un ejemplo dado, se pierde al cambiar el contexto |
| **INTERMEDIATE** | 60-79 | Lo aplica con autonomía en situaciones nuevas |
| **ADVANCED** | 80-100 | Lo aplica, decide entre alternativas y **justifica** su elección |

La diferencia entre INTERMEDIATE y ADVANCED no es hacer más cosas: es **saber por qué se elige una y no otra**.

---

## 1. QA Fundamentals

| Nivel | Descriptor |
|---|---|
| BEGINNER | Distingue caso de prueba y defecto. No identifica casos límite por su cuenta |
| FOUNDATION | Diseña casos positivos y negativos sobre un requisito dado |
| INTERMEDIATE | Identifica casos límite sin que se los pidan; distingue regresión de smoke |
| ADVANCED | Prioriza por riesgo de negocio y **argumenta qué NO merece la pena probar** |

**Se evalúa en:** módulos 00, 07, 09 · **Evidencia:** elección de datos de prueba, escenarios del capstone

## 2. Programming

| Nivel | Descriptor |
|---|---|
| BEGINNER | Lee código con esfuerzo; no distingue función de método |
| FOUNDATION | Lee y modifica código existente; entiende clases y arrays |
| INTERMEDIATE | Escribe funciones nuevas con estructuras de control y transformaciones |
| ADVANCED | Diseña la descomposición en funciones y justifica qué se exporta y qué no |

**Se evalúa en:** módulo 00 · **Evidencia:** Labs 2-3, Challenge 1

## 3. JavaScript / TypeScript

| Nivel | Descriptor |
|---|---|
| BEGINNER | No distingue `Promise<T>` de `T`; olvida `await` sistemáticamente |
| FOUNDATION | Usa `async`/`await` correctamente; lee anotaciones de tipo |
| INTERMEDIATE | Define tipos propios; usa uniones literales; entiende `strict` y `readonly` |
| ADVANCED | Usa el sistema de tipos para prevenir errores en tiempo de compilación y lo justifica |

**Se evalúa en:** módulo 00 (y transversalmente) · **Evidencia:** assessment 00, `npx tsc --noEmit` limpio

> **Competencia decisiva:** es el subíndice que determina el itinerario de entrada al programa.

## 4. Playwright

| Nivel | Descriptor |
|---|---|
| BEGINNER | Ejecuta la suite; no sabe filtrar ni leer el informe |
| FOUNDATION | Escribe tests con locators y aserciones siguiendo un patrón existente |
| INTERMEDIATE | Elige el locator adecuado; usa fixtures, tags, projects y configuración |
| ADVANCED | Diseña la configuración del proyecto y justifica trace, retries, timeouts y workers |

**Se evalúa en:** módulos 01, 03, 09 · **Evidencia:** tests nuevos, taller de locators, config del capstone

## 5. Test Architecture

| Nivel | Descriptor |
|---|---|
| BEGINNER | Usa Page Objects existentes sin entender por qué existen |
| FOUNDATION | Crea un Page Object siguiendo el patrón del proyecto |
| INTERMEDIATE | Diseña fixtures, externaliza datos y detecta fugas del patrón |
| ADVANCED | Diseña la arquitectura completa y justifica cada capa por su coste de mantenimiento |

**Se evalúa en:** módulos 02, 03, 09 · **Evidencia:** refactor con `storageState`, arquitectura del capstone

## 6. Test Design

| Nivel | Descriptor |
|---|---|
| BEGINNER | Prueba el camino feliz |
| FOUNDATION | Añade casos negativos cuando se los sugieren |
| INTERMEDIATE | Aplica particiones y valores límite; parametriza |
| ADVANCED | Elige los datos que **rompen** el código y justifica por qué esos |

**Se evalúa en:** módulos 00, 07, 09 · **Evidencia:** el caso límite del Challenge 1, escenarios del capstone

## 7. Debugging

| Nivel | Descriptor |
|---|---|
| BEGINNER | Ante un fallo, cambia código al azar |
| FOUNDATION | Lee el mensaje de error y localiza la línea |
| INTERMEDIATE | Determina la causa raíz con trace y vídeo; distingue bug de app de bug de test |
| ADVANCED | Clasifica fallos por causa raíz, no por síntoma, y propone la prevención |

**Se evalúa en:** módulos 00 (Lab 4), 04 · **Evidencia:** informes de diagnóstico

> **Descalificatorio en cualquier nivel:** modificar una aserción para hacer pasar un test.

## 8. Quality Engineering

| Nivel | Descriptor |
|---|---|
| BEGINNER | "El test falla" es toda su información |
| FOUNDATION | Distingue fallo determinista de flaky |
| INTERMEDIATE | Razona sobre tiempo de ejecución, reintentos y mantenibilidad |
| ADVANCED | Define política de flakiness, quality gates y métricas con criterio |

**Se evalúa en:** módulos 03, 06, 07 · **Evidencia:** medición antes/después del módulo 03

## 9. Git / GitHub

| Nivel | Descriptor |
|---|---|
| BEGINNER | `clone` y poco más |
| FOUNDATION | Rama, commit y push con mensajes correctos |
| INTERMEDIATE | Pull requests, revisión de diffs, resolución de conflictos simples |
| ADVANCED | Diseña el flujo de trabajo del equipo y los criterios de revisión |

**Se evalúa en:** transversal desde el módulo 00; formalizado en el 06 · **Evidencia:** historial de ramas y PRs

## 10. CI/CD & Docker

| Nivel | Descriptor |
|---|---|
| BEGINNER | Sabe que existe un pipeline |
| FOUNDATION | Lee un workflow y localiza el paso que falló |
| INTERMEDIATE | Modifica el workflow: añade pasos, artefactos, condiciones |
| ADVANCED | Diseña la estrategia de ejecución (matriz, sharding, concurrencia, gates) y su coste |

**Se evalúa en:** módulo 06, 09 · **Evidencia:** PR con mejora del workflow, pipeline del capstone

## 11. AI for QA

| Nivel | Descriptor |
|---|---|
| BEGINNER | Ha usado un asistente de IA para preguntar cosas |
| FOUNDATION | Ejecuta el pipeline de IA del proyecto y entiende sus salidas |
| INTERMEDIATE | Modifica prompts, valida salidas y detecta alucinaciones |
| ADVANCED | Diseña el uso de IA con guardarraíles e identifica riesgos de datos y de inyección |

**Se evalúa en:** módulo 08, 09 · **Evidencia:** prompt propio, revisión crítica de una salida, riesgos identificados

> **Criterio no negociable:** ningún nivel se alcanza aceptando salidas de IA sin revisión.

## 12. Problem Solving & Code Quality

| Nivel | Descriptor |
|---|---|
| BEGINNER | Copia soluciones sin adaptarlas |
| FOUNDATION | Resuelve problemas conocidos siguiendo un patrón |
| INTERMEDIATE | Resuelve problemas nuevos; escribe código legible y sin duplicación |
| ADVANCED | Elige entre alternativas, justifica el trade-off y deja el código mejor de lo que estaba |

**Se evalúa en:** transversal · **Evidencia:** Challenges y justificaciones escritas

## 13. Comunicación y justificación técnica

| Nivel | Descriptor |
|---|---|
| BEGINNER | Describe *qué* hizo; no sabe decir *por qué*. Nombra el síntoma como si fuera la causa |
| FOUNDATION | Explica qué hizo y por qué; distingue síntoma de causa cuando se le pregunta directamente |
| INTERMEDIATE | Justifica su decisión nombrando la alternativa descartada; separa síntoma de causa sin que se lo pidan |
| ADVANCED | Argumenta el trade-off ante una audiencia técnica y no técnica, y traslada el razonamiento a un escenario nuevo |

**Se evalúa en:** módulo 00 (Parte C, objetivo O8), y después en cada revisión de Lab y Challenge; culmina en la defensa del capstone · **Evidencia:** defensa técnica, informes de diagnóstico, justificaciones escritas de los Challenges

> **Instrumento:** apto / no apto, dentro de la revisión de un Lab o Challenge. No es un examen oral. Es requisito para superar el módulo 00, y prerrequisito real del módulo 04: quien llama "causa" al síntoma no puede hacer análisis de causa raíz.

---

## Ponderación por instrumento

| Instrumento | Peso en la nota final |
|---|---|
| Assessments de módulo (10 módulos) | 40% |
| Challenges y sus justificaciones | 20% |
| Capstone (según su rúbrica propia) | 30% |
| Participación, trabajo en pareja y avance documentado | 10% |

## Rúbrica del capstone

Definida en la [Fase 1, sección 14.5](../phase-1-learning-lab-design.md):

| Dimensión | Peso |
|---|---|
| Criterio QA (qué se prueba y por qué) | 25% |
| Arquitectura y mantenibilidad | 25% |
| Corrección técnica | 20% |
| CI/CD y automatización | 15% |
| Uso de IA con criterio | 10% |
| Comunicación | 5% |

El 50% combinado de **criterio + arquitectura** es deliberado: el programa forma QAs que diseñan calidad, no que producen specs.

## Superación del programa

| Requisito | Umbral |
|---|---|
| Media de los assessments de módulo | ≥ 70 |
| Ningún assessment individual por debajo de | 55 |
| Capstone | ≥ 70 |
| Nivel final en JavaScript/TypeScript, Playwright, Test Architecture y Debugging | ≥ INTERMEDIATE |

## Medición del progreso

Aplicar la misma rúbrica al inicio y al final y comparar el perfil por competencia. Es el único dato objetivo de retorno de la formación que HDI podrá poner sobre la mesa.

| Competencia | Nivel inicial | Nivel final | Δ |
|---|---|---|---|
| *(13 filas, una por competencia)* | | | |
