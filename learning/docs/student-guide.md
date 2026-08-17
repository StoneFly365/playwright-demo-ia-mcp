# Guía del alumno

Lo que necesitas para trabajar día a día. Práctica, no teoría.

---

## 1. Cómo empezar

```bash
# Clona el repositorio (o haz fork si vas a subir tu trabajo a GitHub)
git clone <url-del-repositorio>
cd playwright-demo-ia-mcp

# Instala las dependencias
npm install
```

**Comprueba que funciona:**

```bash
npx playwright test -c learning/student/sandbox
```

Debe salir `7 failed` y `13 passed`. **Los 7 fallos son correctos**: son el punto de partida de los Labs 3 y 4.

Guía de instalación detallada, con problemas típicos de Windows: [setup-guide.md](setup-guide.md).

> **`npx playwright install` solo hace falta a partir del módulo 01.** El módulo 00 no abre navegador y funciona sin conexión.

## 2. Cómo ejecutar el proyecto

Hay **dos suites separadas** y conviene no confundirlas.

### Tus ejercicios (el sandbox)

```bash
npx playwright test -c learning/student/sandbox                                  # todos
npx playwright test -c learning/student/sandbox 00-foundations/02-arrays.spec.ts # uno
npx playwright test -c learning/student/sandbox --grep "ordenar"                 # por nombre
```

### La suite del proyecto (material de lectura)

```bash
npm test                 # 79 tests × 3 navegadores (requiere internet y navegadores instalados)
npm run test:chromium    # solo Chromium, más rápido
npm run test:demo:green  # solo los tests que pasan
npm run test:demo:fail   # solo los 10 que fallan a propósito
npm run test:report      # abre el informe HTML del último run
```

### Comprobar tipos

```bash
npx tsc --noEmit    # sin salida = todo correcto
```

## 3. Cómo interpretar los resultados

### Un test que pasa

```
ok 3 …02-arrays.spec.ts:23:7 › debería ordenar los nombres de la A a la Z (11ms)
```

### Un test que falla

```
1) 00-foundations/04-broken.spec.ts:16:7 › debería ordenar los precios de menor a mayor

    Error: expect(received).toEqual(expected)

    - Expected  - 5
    + Received  + 5

      Array [
    -   7.99,
    +   15.99,
    …
      35 |     expect(ordenarPrecios(precios)).toEqual([7.99, 9.99, …]);
         |                                     ^
```

Léelo en este orden:

1. **Qué test** — fichero, línea y nombre.
2. **Qué aserción** — `toEqual`, `toBe`, `toHaveText`…
3. **Expected vs Received** — casi siempre la diferencia contiene el diagnóstico.
4. **La línea marcada con `^`** — dónde saltó.

### Tres mensajes que verás mucho

| Lo que ves | Qué significa |
|---|---|
| `Received: Promise {}` o `Received: "object"` | Falta un `await` |
| `Cannot find module './x'` | Ruta de `import` mal escrita o fichero inexistente |
| Un error antes de que se ejecute ningún test | Error de compilación: ejecuta `npx tsc --noEmit` para verlo bien |

## 4. Cómo trabajar con los ejercicios

Cada Lab tiene siempre la misma estructura:

| Sección | Para qué |
|---|---|
| Objetivo · Contexto | Por qué existe el ejercicio |
| Prerrequisitos | Qué necesitas haber hecho antes |
| Archivos implicados | Qué tocas y qué **no** |
| Pasos | Qué hacer, en orden |
| Resultado esperado | Cómo se ve el éxito |
| **Validación** | Los comandos exactos que lo demuestran |
| Learning points | Qué te llevas más allá del código |

**Reglas de trabajo:**

1. Trabaja **solo** dentro de `learning/student/sandbox/`.
2. Los ficheros marcados "no modifiques" son contratos. Si un test no pasa, el problema está en tu código.
3. **Nunca cambies una aserción para que un test pase.** Es la conducta que este programa existe para prevenir.
4. Lee los Learning Points aunque el ejercicio ya esté verde. Ahí está la mitad del valor.
5. Un Lab, un commit.

## 5. Cómo usar Git

Una rama por módulo:

```bash
git checkout -b learning/00-foundations-<tu-nombre>
```

El flujo de cada ejercicio:

```bash
# 1. Trabaja
# 2. Verifica
npx playwright test -c learning/student/sandbox
npx tsc --noEmit

# 3. Revisa qué vas a subir
git status --short
git diff

# 4. Añade solo tu trabajo
git add learning/student/sandbox/

# 5. Commit con el Lab en el mensaje
git commit -m "feat(lab-2): ordenación parametrizada y conversión de precios"
```

**Si `git status` muestra `pages/` o `tests/` modificados**, has tocado el proyecto sin querer:

```bash
git restore pages/ tests/
```

**Convención de mensajes** (la misma que usa el proyecto):

| Prefijo | Cuándo |
|---|---|
| `feat(lab-N):` | Ejercicio nuevo resuelto |
| `fix(lab-N):` | Corrección de un fallo diagnosticado |
| `docs(lab-N):` | Informe, observaciones o justificación |

Al terminar el módulo, sube tu rama y abre un Pull Request contra tu propio fork. El módulo 06 formaliza este flujo; conviene practicarlo desde el principio.

## 6. Cómo registrar tu avance

Lleva un `learning/student/progreso.md` propio. No es burocracia: en el assessment se pregunta por decisiones que tomaste días antes.

```markdown
# Progreso — <tu nombre>

## Módulo 00
- [x] Teoría leída
- [x] Lab 1 — 8 tests verdes. Duda resuelta: el parámetro de propiedad
- [x] Lab 2 — 5 tests verdes. Me atasqué 15 min con el tipo de unión
- [ ] Lab 3
- [ ] Lab 4
- [ ] Challenge 1
- [ ] Assessment

### Dudas abiertas
- ¿Por qué `map` no necesita spread antes de `sort` y `sort` a secas sí?
```

Anota **dónde te atascaste y cuánto tardaste**. Es el dato que permite al formador ajustar el ritmo del grupo.

## 7. Cómo pedir ayuda

En este orden:

1. **Lee el mensaje de error entero.** Suena obvio; se salta el 80% de las veces.
2. **Ejecuta `npx tsc --noEmit`.** Si el problema es de tipos, ahí lo verás mucho más claro.
3. **Vuelve a la sección de teoría** que menciona el Lab en sus prerrequisitos.
4. **Consulta el `repository-mapping.md`** del módulo: hay un fichero real que hace lo mismo que tú intentas.
5. **Pregunta a tu pareja.** Explicar el problema en voz alta lo resuelve más veces de lo que parece.
6. **Pregunta al formador**, con este formato:

> **Qué intento:** …
> **Qué he probado:** …
> **Qué esperaba:** …
> **Qué obtengo:** *(pega la salida completa)*

7. **Las soluciones** ([`../solutions/`](../solutions/)) son el último recurso, no el primero. Consultarlas antes de atascarte convierte 45 minutos de aprendizaje en 5 de lectura.

## 8. Cómo validar que has completado un ejercicio

Los tres comandos, siempre:

```bash
# 1. Los tests pasan
npx playwright test -c learning/student/sandbox

# 2. Los tipos son correctos
npx tsc --noEmit

# 3. No has tocado el proyecto principal
git status --short   # solo learning/student/sandbox/
```

Y las comprobaciones específicas que añade cada Lab. Por ejemplo, el Lab 4 exige además:

```bash
git diff learning/student/sandbox/00-foundations/04-broken.spec.ts
# Ninguna línea +/- puede contener 'expect('
```

**Un ejercicio no está completo hasta que los tres comandos salen limpios.** Verde en tu máquina sin `tsc` limpio no cuenta: en el módulo 06 verás por qué eso rompe pipelines.

## 9. Errores que cuestan tiempo

| Error | Consecuencia | Prevención |
|---|---|---|
| Editar `tests/` o `pages/` | Rompes el material de módulos posteriores | Trabaja solo en el sandbox |
| Cambiar una aserción para llegar a verde | Invalidas el ejercicio | Corrige el código, nunca el `expect` |
| `git add .` | Subes artefactos y ficheros ajenos | `git add learning/student/sandbox/` |
| Mirar la solución a los 5 minutos | Pierdes el ejercicio | Aguanta 15 minutos antes de rendirte |
| Saltarte los Learning Points | Apruebas el Lab, no el módulo | Léelos aunque esté verde |
| Ignorar `npx tsc --noEmit` | Errores que aparecen dos módulos después | Ejecútalo con cada commit |
