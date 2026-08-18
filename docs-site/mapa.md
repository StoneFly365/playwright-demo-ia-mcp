# Mapa del programa

Progresión real del Learning Lab. **Los elementos marcados como futuros no han ocurrido**: no hay piloto ejecutado, ni decisión sobre M01, ni discovery de M02.

---

## Estado de avance

```mermaid
flowchart TD
    M00["Módulo 00<br/>Fundamentos JS/TS<br/>✅ material completo"]
    M01["Módulo 01<br/>Playwright Fundamentals<br/>✅ material completo"]
    PIL["Piloto M01 + análisis<br/>⬜ NO ejecutado"]
    DEC["Decisión sobre M01<br/>duración · 5 gaps 🟡 · K1<br/>⬜ futuro"]
    M02["Discovery Módulo 02<br/>Page Object Model &amp; Suite<br/>⬜ NO iniciado"]

    M00 --> M01 --> PIL --> DEC --> M02

    classDef hecho fill:#e6f4ee,stroke:#0b6e4f,color:#123;
    classDef futuro fill:#f4f5f7,stroke:#9aa4ad,color:#4a5560,stroke-dasharray: 5 4;
    class M00,M01 hecho;
    class PIL,DEC,M02 futuro;
```

| Etapa | Estado hoy | Qué la desbloquea |
|---|---|---|
| Módulo 00 | ✅ Material completo | — |
| Módulo 01 | ✅ Material completo, operacionalmente preparado | — |
| Piloto M01 + análisis | ⬜ No ejecutado | Grupo real de alumnos y una impartición completa |
| Decisión sobre M01 | ⬜ Futuro | Datos del piloto según el [plan](/learning/docs/module-01-pilot-plan.md) |
| Discovery M02 | ⬜ No iniciado | Cierre de la decisión sobre M01 |

## Los 10 módulos

El programa completo son diez módulos; solo los dos primeros están construidos. El resto están **diseñados en el mapa, no escritos**.

```mermaid
flowchart LR
    M00["00 Fundamentos ✅"] --> M01["01 Playwright ✅"] --> M02["02 POM ⬜"] --> M03["03 Arquitectura ⬜"]
    M03 --> M04["04 Debugging ⬜"]
    M03 --> M05["05 API &amp; Mocking ⬜"]
    M04 --> M06["06 CI/CD &amp; Docker ⬜"]
    M04 --> M08["08 AI-Augmented QA ⬜"]
    M06 --> M07["07 Test Strategy ⬜"]
    M06 --> M08
    M05 --> M09["09 Capstone ⬜"]
    M07 --> M09
    M08 --> M09

    classDef hecho fill:#e6f4ee,stroke:#0b6e4f,color:#123;
    classDef futuro fill:#f4f5f7,stroke:#9aa4ad,color:#4a5560,stroke-dasharray: 5 4;
    class M00,M01 hecho;
    class M02,M03,M04,M05,M06,M07,M08,M09 futuro;
```

Objetivos, contenidos, duración, dependencias y anclajes en el repositorio de cada módulo: [Learning path](/learning/docs/learning-path.md). Prioridad de desarrollo si el calendario aprieta: [Índice de módulos](/learning/modules/README.md).

## Progresión pedagógica

Siete niveles, del más guiado al más autónomo. Cada módulo declara en cuál trabaja.

```mermaid
flowchart LR
    N1["1 FOLLOW"] --> N2["2 MODIFY"] --> N3["3 CREATE"] --> N4["4 DESIGN"] --> N5["5 TROUBLESHOOT"] --> N6["6 OPTIMIZE"] --> N7["7 ARCHITECT"]
```

| Nivel | Qué hace el alumno | Dónde aparece hoy |
|---|---|---|
| 1 · FOLLOW | Sigue una guía sobre código existente | M00 Lab 1 · M01 Lab 1 |
| 2 · MODIFY | Cambia código que ya funciona | M00 Lab 2 · M01 Labs 2, 3, 6 |
| 3 · CREATE | Escribe algo nuevo | M00 Lab 3 · M01 Lab 4 y Challenge |
| 4 · DESIGN | Elige entre alternativas y lo justifica | M01 Lab 3 y Challenge |
| 5 · TROUBLESHOOT | Encuentra la causa raíz de un fallo | M00 Lab 4 · M01 Lab 5 |
| 6 · OPTIMIZE | Mejora algo que funciona, con métrica | Módulos 06 y 08 (no construidos) |
| 7 · ARCHITECT | Diseña la solución completa | Módulo 09 (no construido) |
