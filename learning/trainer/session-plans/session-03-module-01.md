# Sesiones 03, 04 y 05 — Módulo 01: Playwright Fundamentals

**Duración:** 7 h dirigidas — sesión 3 de 3 h + sesión 4 de 2 h 30 + sesión 5 de 1 h 30 · **Formato:** presencial o remoto con pantalla compartida · **Grupo:** 8-12 personas en parejas

Entre sesiones, ~4 h de trabajo personal. El assessment (1 h) se hace al final de la sesión 5 o de forma asíncrona. Desglose completo en el [README del módulo](../../modules/01-playwright-fundamentals/#duración).

*(La numeración continúa a partir de las dos sesiones del módulo 00.)*

---

# ⚠️ Antes de la sesión — comprobación de entorno OBLIGATORIA

**Este módulo depende de una condición que no está verificada en el entorno de HDI.** A diferencia del módulo 00, aquí hacen falta navegadores instalados y acceso de red a `saucedemo.com`.

**En un equipo corporativo de HDI, y al menos una semana antes de la primera sesión:**

```bash
npm ci
npx playwright install
npx playwright test --project=chromium tests/login.spec.ts
```

| Resultado | Qué significa | Qué hacer |
|---|---|---|
| `7 passed, 1 failed` | ✅ El entorno permite el módulo. El fallo es el `@demo-fail` de login | Adelante con el módulo tal cual |
| Falla la descarga de navegadores | Proxy o política de red bloquea el CDN de Playwright | Escalar a IT **antes** de convocar. Sin navegadores no hay módulo |
| Falla la conexión a `saucedemo.com` | La política de red bloquea GitHub Pages | Escalar a IT. **Nota útil:** SauceDemo está alojado en GitHub Pages; la misma regla que la permita cubre el GitHub del módulo 06 |
| Errores de certificado TLS | Inspección TLS corporativa | Escalar a IT. No resolver con `ignoreHTTPSErrors`: enmascara un problema de entorno real |

**Si el entorno no lo permite, el módulo no se imparte tal cual.** El plan alternativo —una página HTML local servida con `webServer` en el sandbox— conserva el diseño pedagógico pero **no está construido**, encarece la preparación y hace perder los anclajes reales de accesibilidad (los `<label>` que no existen, los nombres accesibles que engañan). Es una decisión de programa, no del formador de la sesión.

## Resto de la lista previa

- [ ] Módulo 00 cerrado y con assessment corregido en todo el grupo
- [ ] Comprobación de entorno de arriba, hecha en un equipo de HDI ✅
- [ ] Verificación semanal de que SauceDemo sigue igual:

```bash
npm run test:chromium                       # 69 passed, 10 failed
npx playwright test -c learning/student/sandbox/01-playwright --project=chromium   # 4 passed, 2 failed
```

- [ ] **Aviso a los alumnos:** que ejecuten `npx playwright install` en casa antes de la sesión 3. Son ~500 MB por equipo; diez descargas simultáneas en la red de la oficina son media hora perdida
- [ ] Decidir si entra el Lab 6 (codegen). **Si entra, ejecútalo tú primero**: no está validado ([`lab-6.md`](../../solutions/01-playwright-fundamentals/lab-6.md))
- [ ] Parejas revisadas según el resultado del módulo 00

---

## Guion — Sesión 3 (3 h)

| Bloque | Min | Nivel | Qué se hace |
|---|---|---|---|
| **1. Apertura** | 0-15 | — | Qué cambia respecto al módulo 00: navegador, latencia, ambigüedad. Las tres reglas siguen vigentes |
| **2. Puesta en marcha** | 15-30 | — | `npx playwright install` para quien no lo trajera hecho + comprobación de entorno de cada equipo |
| **3. Teoría A** | 30-55 | — | Secciones 1-4: ejecución, informes, las tres clases de rojo, auto-waiting, aserciones |
| **4. Lab 1** | 55-100 | 1 FOLLOW | Las seis ejecuciones + informe HTML |
| **5. Puesta en común** | 100-110 | — | La pregunta del Paso 6 (los 30 fallos) y la clasificación de los tres fallos |
| **Descanso** | 110-120 | | |
| **6. Lab 2** | 120-165 | 2 MODIFY | Auto-waiting: medir el coste y romperlo |
| **7. Puesta en común** | 165-175 | — | **El momento clave del módulo**: las tres versiones del Paso 3 |
| **8. Cierre** | 175-180 | — | Trabajo personal: leer la teoría §5-§12 antes de la sesión 4 |

## Guion — Sesión 4 (2 h 30)

| Bloque | Min | Nivel | Qué se hace |
|---|---|---|---|
| **1. Dudas** | 0-10 | — | Empieza por "¿dónde os atascasteis?", no por "¿alguna duda?" |
| **2. Teoría B** | 10-40 | — | Secciones 5-12: los cinco criterios, rol, placeholder, testId, strict mode, acotado, locators muertos |
| **3. Lab 3** | 40-100 | 2 MODIFY → 4 DESIGN | **El Lab central.** Bloques 3.1 a 3.8 |
| **4. Puesta en común del Lab 3** | 100-115 | — | Bloques 3.3 y 3.5 en grupo. Comparar tablas de decisión |
| **Descanso** | 115-125 | | |
| **5. Lab 4** | 125-145 | 3 CREATE | Ordenación A→Z en sesión; el segundo test, en casa |
| **6. Cierre** | 145-150 | — | Reparto: terminar Lab 4 + Challenge |

## Guion — Sesión 5 (1 h 30)

| Bloque | Min | Nivel | Qué se hace |
|---|---|---|---|
| **1. Revisión del Lab 4** | 0-15 | — | Los segundos huecos encontrados por el grupo. Discutir cuáles merecen un test |
| **2. Lab 5** | 15-65 | 5 TROUBLESHOOT | En sesión, con el informe escrito **antes** de corregir |
| **3. Puesta en común del Lab 5 + Parte C** | 65-85 | — | Los dos casos en común. **Defensas técnicas individuales** mientras el resto compara diagnósticos |
| **4. Cierre del módulo** | 85-90 | — | Convocatoria del assessment; entrega del Challenge |

**Cómo encajar la Parte C:** igual que en el módulo 00 — mientras el grupo compara diagnósticos por parejas, llama de uno en uno, 5-10 minutos. Con 10 personas no da tiempo a todos: prioriza a quien justificó con "porque funciona" en el Lab 3, y completa el resto en la revisión del Challenge.

---

## Bloque 1 — Apertura (15 min)

**No empieces por locators.** Empieza ejecutando la suite delante del grupo:

```bash
npm run test:chromium
```

Mientras corre (~22 s), di la frase que sostiene el módulo:

> "Este proyecto localiza elementos de una sola manera, 66 veces. Vosotros vais a aprender a **elegir** — y a defender la elección."

Y anticipa los 10 rojos antes de que aparezcan, para que nadie crea que ha roto algo.

Las tres reglas siguen vigentes, con un añadido propio de este módulo:

1. Los defectos del repositorio son el material — **incluido el locator roto que vais a encontrar el Lab 5**. Nadie los arregla.
2. Diagnosticar antes que corregir — nunca se cambia un `expect` para llegar a verde.
3. QA + IA, nunca IA en lugar de QA.
4. 🆕 **`.first()` no es una solución.** Aparecerá tres veces en el módulo y las tres veces la respuesta es acotar.

## Bloques de teoría

**Máximo 25-30 minutos seguidos, con el editor y el navegador proyectados.** Cada sección de `theory.md` termina con un **"Ábrelo"**: ábrelo de verdad, y en el caso de los locators, **mide en vivo**.

**La demostración imprescindible de la teoría B**, con la consola de Playwright o un test desechable:

```typescript
await page.getByRole('heading', { name: 'Products' }).count();          // 0
await page.getByRole('link', { name: 'Sauce Labs Backpack' }).count();  // 2
await page.getByRole('button', { name: 'Add to cart' }).count();        // 6
await page.locator('label').count();                                    // 0
```

**Deja que el grupo prediga cada número antes de mostrarlo.** Las cuatro predicciones fallan casi siempre, y esas cuatro sorpresas son el módulo entero condensado en dos minutos.

## Puestas en común

### Sesión 3, bloque 7 — Lab 2, el Paso 3

Es la mejor conversación del módulo. Pide al grupo que levante la mano quien predijo que la aserción web-first **pasaría siempre porque reintenta**. Levantará la mano casi todo el mundo. Después enseña el resultado:

| Versión | Resultado |
|---|---|
| `isVisible()` | `false` |
| `expect(...).toBeVisible()` — 5 s por defecto | **falla** |
| `expect(...).toBeVisible({ timeout: 15000 })` | pasa |

Y la pregunta de cierre: *"¿de dónde salen esos 5 segundos, si nadie los ha escrito?"*. Conecta con A7 del assessment y con `playwright.config.ts`.

### Sesión 4, bloque 4 — Lab 3, bloques 3.3 y 3.5

**Bloque 3.3 (`getByLabel`)** es el que hay que trabajar en grupo, y no lleva código. Pregunta directamente: *"la documentación oficial recomienda `getByLabel` como primera opción para formularios. Aquí devuelve cero. ¿Quién está equivocado?"*

Nadie: **el HTML no cumple la premisa**. Lleva la conversación hasta la pregunta 4 —qué le pides al equipo de desarrollo— y haz que alguien lea su ticket en voz alta. Ese es el salto de "escribo tests" a "aporto calidad".

**Bloque 3.5 (el combobox)** admite las dos respuestas. Pon a dos alumnos que hayan decidido distinto a defender cada una. La conclusión que buscas: **las dos son válidas; lo inválido es no ver el riesgo**.

Compara además dos tablas de decisión completas. Aparecerán filas distintas para el mismo elemento; eso es correcto y conviene decirlo explícitamente.

### Sesión 5, bloque 3 — Lab 5

Los dos casos, en este orden y sin adelantar la respuesta:

- **Caso A:** *"el error ha desaparecido — ¿ha desaparecido el problema?"*
- **Caso B:** *"¿por qué nadie lo había detectado?"* Deja que el grupo llegue solo a que **ningún test usa ese locator**. Es el momento de mayor valor del módulo, y se estropea si lo cuentas tú.

Cierra conectando con el módulo 02: *"la pregunta de por qué la arquitectura permitió esto la responderemos en el siguiente módulo."*

---

## Qué va a pasar (previsión)

| Momento | Qué ocurre | Cómo responder |
|---|---|---|
| Puesta en marcha | Alguien no tiene navegadores instalados y bloquea 20 minutos | Por eso el aviso previo. Que empareje con alguien que sí los tenga |
| Lab 1 | Alguien ejecuta `npm test` (3 navegadores) para todas las filas | Déjalo: la comparación de tiempos con la fila 1 es el aprendizaje |
| Lab 1 | Alguien intenta "arreglar" un fallo intencionado | Intervención inmediata. Regla 1 |
| Lab 2 | Predicciones escritas después de ejecutar | Pide la predicción por escrito **antes**; es la mitad del ejercicio |
| Lab 3 | Justificaciones tipo "porque funciona" | Los siete candidatos funcionaban. ¿Cuál de los cinco criterios? |
| Lab 3, bloque 3.6 | Alguien usa `.first()` | Es el antipatrón central. Que lo grep-ee él mismo |
| Lab 4 | Comparan contra una lista de nombres escrita a mano | *¿Qué pasa cuando entre un producto nuevo?* |
| Lab 4 | Verifican el valor del desplegable, no el orden | *¿Has comprobado que se pulsó el botón o que pasó algo?* |
| **Lab 5** | **Alguien corrige `pages/cart.page.ts`** | **El error más frecuente del módulo.** Revertir y convertirlo en conversación |
| Lab 5 | Diagnóstico escrito después de corregir | Se nota en que la casilla "Comprobación" está vacía |
| Challenge | Calculan el total leyéndolo del propio resumen | Es el problema de oráculo del Lab 2, otra vez |
| Parte C | "Usé data-test porque es lo que usa el proyecto" | *No demostrado*. Se repite en la revisión del Challenge |

## Adaptación al nivel del grupo

| Situación | Ajuste | Session time |
|---|---|---|
| Mayoría BEGINNER | Cuatro sesiones: teoría troceada, Lab 3 en dos partes, Lab 5 acompañado paso a paso. Sin Lab 6 | 9 h |
| Mayoría FOUNDATION | Guion tal cual. Es el caso de referencia | 7 h |
| Mayoría INTERMEDIATE | Teoría comprimida a 20 min por bloque; Lab 1 como trabajo personal; entra el Lab 6 | 5 h 30 |
| Grupo mixto (lo normal) | Guion tal cual, con parejas equilibradas | 7 h |
| Un ADVANCED presente | Mentor de su pareja; que dirija la puesta en común del bloque 3.5; solo hace Labs 3 y 5 + Challenge | — |

## Criterios de corrección rápidos

Lo que miras primero al revisar una entrega:

| Entregable | Señal de alarma inmediata |
|---|---|
| `01-ejecuciones.md` | Tiempos idénticos a los del enunciado: no ha ejecutado |
| `02-conclusiones.md` | No hay predicción previa, o dice que el test del Paso 4 sí fallaría |
| **`03-decisiones.md`** | Justificaciones sin criterio; alternativas descartadas genéricas; menos de 12 filas |
| `04-cobertura.spec.ts` | Segundo test sin justificación de riesgo; comparación contra lista escrita a mano |
| `05-diagnostico.md` | Casilla "Comprobación" vacía; dos causas raíz iguales |
| Challenge | Importes con `toBeVisible`; falta el "qué no he automatizado" |
| Cualquiera | `git diff --stat pages/ tests/` no vacío |

## Cierre de la sesión 3

- [ ] Leer la teoría, secciones 5-12
- [ ] Terminar el Lab 2 y sus conclusiones

## Cierre de la sesión 4

- [ ] Terminar el Lab 4 (segundo test con su justificación)
- [ ] Empezar el Challenge

## Cierre de la sesión 5

- [ ] Challenge con su `decisiones.md`
- [ ] Assessment (1 h): partes A y B
- [ ] Defensas de la Parte C pendientes → revisión del Challenge

**Publica al grupo** las soluciones de los Labs 1 y 2 al terminar la sesión 3; la del Lab 3 al terminar la sesión 4; las de los Labs 4 y 5 al terminar la sesión 5; la del Challenge al cerrar el módulo. La clave del assessment, **nunca**.

## Post-sesión

- [ ] Anotar dudas recurrentes: si tres o más se atascan en lo mismo, el material necesita ajuste
- [ ] **Anotar el tiempo real de cada Lab.** La duración de 12 h es provisional y solo se puede fijar con datos de un grupo real
- [ ] Comprobar la integridad del proyecto:

```bash
git diff --stat main -- tests/ pages/ scripts/ prompts/ specs/ .github/ playwright.config.ts package.json
# debe estar vacío
```

- [ ] Si se ejecutó el Lab 6, **completar [`solutions/01-playwright-fundamentals/lab-6.md`](../../solutions/01-playwright-fundamentals/lab-6.md)** con lo que codegen generó de verdad
