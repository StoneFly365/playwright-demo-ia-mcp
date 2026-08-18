# Sesiones 03, 04, 05 y 06 — Módulo 01: Playwright Fundamentals

**Duración:** 8 h dirigidas — sesión 3 de 3 h + sesión 4 de 2 h 30 + sesión 5 de 1 h 30 + sesión 6 de 1 h · **Formato:** presencial o remoto con pantalla compartida · **Grupo:** 8-12 personas en parejas

Entre sesiones, ~3 h de trabajo personal. El assessment (1 h) se convoca **después de la sesión 6**. Desglose completo en el [README del módulo](../../modules/01-playwright-fundamentals/#duración).

> **La cadena de dependencias es lo que fija este calendario:** Labs 1-5 → Challenge → Parte C. El Challenge exige los cinco Labs completos y la Parte C se defiende sobre su `decisiones.md`. Por eso el Challenge se escribe **entre la sesión 5 y la sesión 6**, y por eso existe la sesión 6: es el primer momento en que ese entregable está en manos del formador.

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
- [ ] Comprobación de entorno de arriba, hecha en un equipo de HDI — **estado a 18/08/2026: PENDIENTE.** Validada solo en el equipo de desarrollo del programa; **nadie la ha ejecutado todavía en una máquina corporativa de HDI**. **Decisión de programa: K1 se valida durante la propia formación con HDI**, en el bloque 2 de la sesión 3 (*Puesta en marcha*), y su resultado se anota aquí. Estado: `PENDIENTE — validación durante formación HDI`. Si falla en ese momento, se aplica el plan alternativo descrito arriba
- [ ] Verificación semanal de que SauceDemo sigue igual:

```bash
npm run test:chromium                       # 69 passed, 10 failed
npx playwright test -c learning/student/sandbox/01-playwright --project=chromium   # 4 passed, 2 failed
```

- [ ] **Aviso a los alumnos:** que ejecuten `npx playwright install` en casa antes de la sesión 3. Son ~500 MB por equipo; diez descargas simultáneas en la red de la oficina son media hora perdida
- [ ] **Lab 6 (codegen): fuera del piloto de M01 y opcional después.** Sigue **NO VALIDADO**: nadie ha grabado todavía un recorrido con `codegen` contra SauceDemo. Si decides usarlo, ejecuta tú el Paso 1 **antes** y hazlo con `npx playwright codegen --test-id-attribute data-test https://www.saucedemo.com`: sin ese argumento, `codegen` busca `data-testid`, que en esta aplicación **no existe** (medido: 0 elementos), y no generará ni un solo `getByTestId`. Anota lo que genere en [`lab-6.md`](../../solutions/01-playwright-fundamentals/lab-6.md)
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
| **3. Puesta en común del Lab 5** | 65-85 | — | Los dos casos en común, comparando diagnósticos por parejas |
| **4. Lanzamiento del Challenge** | 85-90 | — | Entrega del enunciado y fecha de entrega: el `decisiones.md` incluido, **antes de la sesión 6**. Los cinco Labs quedan completos justo aquí: el prerrequisito del Challenge se cumple en este minuto y no antes |

## Guion — Sesión 6 (1 h)

**Prerrequisito de la sesión:** el Challenge entregado, con su `decisiones.md`. Sin ese documento no hay Parte C.

| Bloque | Min | Nivel | Qué se hace |
|---|---|---|---|
| **1. Revisión cruzada del Challenge** | 0-45 | 4 DESIGN | Por parejas: cada alumno lee el `decisiones.md` del compañero y contesta tres preguntas sobre él — qué reparto de tests eligió, qué decidió **no** automatizar, y qué fila de su tabla de locators cambiaría. **En paralelo, el formador llama de uno en uno para la Parte C** |
| **2. Puesta en común** | 45-55 | — | Los "qué NO he automatizado" del grupo y la decisión importes fijos/calculados. Cierre del módulo y conexión con M02 |
| **3. Convocatoria del assessment** | 55-60 | — | Partes A y B, 1 h, en sesión aparte o de forma asíncrona |

**Cómo encajar la Parte C:** ocurre en la **sesión 6, bloque 1**, y no antes: es el primer momento en que existe el `decisiones.md` sobre el que se defiende. Mientras el grupo hace la revisión cruzada, llama de uno en uno, 5-10 minutos. **El presupuesto de 12 h es por alumno:** cada uno gasta sus 5-10 minutos dentro del bloque. Lo que escala con el tamaño del grupo es **tu tiempo**, no el suyo: con 8-9 personas caben todas las defensas en los 45 minutos; con 10-12, prevé una segunda tanda al corregir el Challenge. Prioriza a quien justificó con "porque funciona" en el Lab 3.

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
| Mayoría BEGINNER | Cinco sesiones: teoría troceada, Lab 3 en dos partes, Lab 5 acompañado paso a paso. Sin Lab 6 | 10 h |
| Mayoría FOUNDATION | Guion tal cual. Es el caso de referencia | 8 h |
| Mayoría INTERMEDIATE | Teoría comprimida a 20 min por bloque; Lab 1 como trabajo personal | 6 h 30 |
| Grupo mixto (lo normal) | Guion tal cual, con parejas equilibradas | 8 h |
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
| Challenge | Importes con `toBeVisible`; falta el "qué no he automatizado"; falta la declaración de reutilización de `tests/checkout.spec.ts` (AC6) |
| Cualquiera | `git diff --stat pages/ tests/` no vacío |

## Cierre de la sesión 3

- [ ] Leer la teoría, secciones 5-12
- [ ] Terminar el Lab 2 y sus conclusiones

## Cierre de la sesión 4

- [ ] Terminar el Lab 4 (segundo test con su justificación). **El Challenge todavía no se empieza:** exige el Lab 5, que es la sesión siguiente

## Cierre de la sesión 5

- [ ] Challenge con su `decisiones.md` — **entrega obligatoria antes de la sesión 6**. Es el único instrumento del objetivo P8 y el material sobre el que se defiende la Parte C. Presupuesto: 90 min de trabajo personal

## Cierre de la sesión 6

- [ ] Assessment (1 h): partes A y B
- [ ] Defensas de la Parte C que no hayan cabido en el bloque 1 → segunda tanda al corregir el Challenge. **Sin Challenge entregado, la Parte C se aplaza**

**Publica al grupo** las soluciones de los Labs 1 y 2 al terminar la sesión 3; la del Lab 3 al terminar la sesión 4; las de los Labs 4 y 5 al terminar la sesión 5; la del Challenge al cerrar el módulo. La clave del assessment, **nunca**.

## Post-sesión

- [ ] Anotar dudas recurrentes: si tres o más se atascan en lo mismo, el material necesita ajuste
- [ ] **Anotar el tiempo real de cada Lab.** La duración de 12 h es provisional y solo se puede fijar con datos de un grupo real. Durante el piloto, todo esto se anota en [`module-01-pilot-run-log.md`](../../docs/module-01-pilot-run-log.md), no de memoria
- [ ] Comprobar la integridad del proyecto:

```bash
git diff --stat main -- tests/ pages/ scripts/ prompts/ specs/ .github/ playwright.config.ts package.json
# debe estar vacío
```

- [ ] Si se ejecutó el Lab 6, **completar [`solutions/01-playwright-fundamentals/lab-6.md`](../../solutions/01-playwright-fundamentals/lab-6.md)** con lo que codegen generó de verdad
