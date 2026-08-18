# Assessment del programa

Instrumentos de evaluación transversales: los de cada módulo viven en `modules/NN-*/assessment/`.

| Instrumento | Estado | Cuándo | Documento |
|---|---|---|---|
| **Pre-assessment** | ⬜ Diseñado, banco de preguntas pendiente | 5-10 días antes del inicio | Diseño en [Fase 1, sección 8](../phase-1-learning-lab-design.md) |
| **Assessment módulo 00** | ✅ Completo | Al cierre del módulo 00 | [`../modules/00-foundations/assessment/`](../modules/00-foundations/assessment/) |
| **Assessment módulo 01** | ✅ Completo | Al cierre del módulo 01 | [`../modules/01-playwright-fundamentals/assessment/`](../modules/01-playwright-fundamentals/assessment/) |
| **Checkpoints (semanas 2 y 4)** | ⬜ Pendiente | Durante el programa | — |
| **Post-assessment** | ⬜ Pendiente | Al finalizar | — |
| **Rúbrica general** | ✅ Completa | Tres aplicaciones | [`../docs/assessment-rubric.md`](../docs/assessment-rubric.md) |

---

## Pre-assessment — diseño aprobado

**Objetivo operativo:** responder a una sola pregunta — *¿este participante necesita el módulo 00, y en qué intensidad?* Secundariamente, formar parejas equilibradas y calibrar el ritmo del grupo.

**No es un examen de acceso.** Nadie queda excluido por su resultado, y esto debe comunicarse antes de la prueba: si no, mide ansiedad en lugar de conocimiento.

### Áreas y peso

| # | Área | Peso | Anclaje en el repositorio |
|---|---|---|---|
| 1 | Fundamentos de QA y diseño de test | 20% | Casos de `login.spec.ts` y `cart-edge-cases.spec.ts` |
| 2 | Web y selectores | 20% | Los 4 estilos de selector del proyecto |
| 3 | **JavaScript / TypeScript** | **30%** | `inventory.page.ts` completo, `inventory.spec.ts:39-54` |
| 4 | Automatización y herramientas | 15% | `playwright.config.ts` |
| 5 | Git, CI/CD, Docker, IA | 15% | `playwright.yml`, `report-ai.mjs` |

El 30% de JS/TS es deliberado: es la variable que decide el itinerario y el gap CRITICAL número uno del programa.

### Formato

- **40 minutos** (35 de prueba + 5 de instrucciones)
- **25-30 ítems**: ~60% opción múltiple, ~30% lectura de código con respuesta corta, ~10% pregunta abierta de criterio QA
- Dificultad progresiva: 40% fundamento, 40% medio, 20% avanzado
- Individual, sin material, resultado privado

### Niveles de entrada

| Nivel | Total | Subíndice JS/TS | Itinerario |
|---|---|---|---|
| **BEGINNER** | < 40 | < 40 | Módulo 00 **ampliado** (doble de horas), emparejado con perfil técnico |
| **FOUNDATION** | 40-59 | 40-59 | Módulo 00 **completo**. Itinerario por defecto |
| **INTERMEDIATE** | 60-79 | 60-79 | Módulo 00 **reducido** (solo TS y `async`) |
| **ADVANCED** | ≥ 80 | ≥ 80 | **Salta el módulo 00**; ejercicios `[+]` y rol de mentor |

**Regla de desempate:** si el total y el subíndice caen en niveles distintos, **manda el subíndice JS/TS**. Un QA con criterio excelente y cero programación necesita el módulo 00 igual, y probablemente más.

### Salidas

1. Informe individual privado (2-3 líneas: nivel, itinerario, qué reforzar).
2. Mapa de calor del grupo por área.
3. Propuesta de parejas: cada BEGINNER/FOUNDATION con un INTERMEDIATE/ADVANCED.
4. Decisión sobre el módulo 00: ampliado / completo / reducido, según la mediana del grupo.

---

## Pendiente de desarrollo

El banco de 25-30 preguntas del pre-assessment. Es el entregable con el calendario más rígido de todo el programa: debe existir 5-10 días antes del inicio, porque su resultado condiciona cómo se imparte el módulo 00.
