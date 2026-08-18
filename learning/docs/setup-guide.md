# Guía de instalación

Hazlo **antes** de la primera sesión. Si algo falla, avisa con tiempo: no es una tarea de 5 minutos en una red corporativa.

---

## 1. Node.js 20 o superior

```bash
node --version
```

Si no aparece `v20.x` o superior:

- **Windows:** [nvm-windows](https://github.com/coreybutler/nvm-windows) o el instalador de [nodejs.org](https://nodejs.org/)
- **macOS / Linux:** [nvm](https://github.com/nvm-sh/nvm)

```bash
nvm install 20
nvm use 20
```

`npm` viene incluido con Node.

## 2. Git

```bash
git --version
```

Si no está: [git-scm.com](https://git-scm.com/downloads). En Windows, el instalador incluye Git Bash, que es útil para seguir los comandos del material.

## 3. Editor

**VS Code** ([code.visualstudio.com](https://code.visualstudio.com/)) con la extensión oficial **Playwright Test for VSCode**.

Como el proyecto no tiene linter configurado, el editor es tu primera línea de detección de errores. Vale la pena tenerlo bien puesto.

## 4. El repositorio

```bash
git clone <url-del-repositorio>
cd playwright-demo-ia-mcp
npm install
```

`npm install` descarga unos 100 MB. En una red corporativa lenta puede tardar varios minutos.

## 5. Comprobación final

```bash
npx playwright test -c learning/student/sandbox
```

Debe terminar con:

```
7 failed
13 passed
```

**Los 7 fallos son correctos.** Son el punto de partida de los Labs 3 y 4 del módulo 00.

```bash
npx tsc --noEmit
```

No debe imprimir nada.

## 6. Solo a partir del módulo 01

```bash
npx playwright install    # descarga Chromium, Firefox y WebKit (~500 MB)
```

**No hace falta para el módulo 00**, que no abre navegador ni necesita conexión.

Comprobación (requiere acceso a `saucedemo.com`):

```bash
npx playwright test --project=chromium tests/login.spec.ts
```

Deben pasar 7 tests y fallar 1: el `@demo-fail` de `login.spec.ts`. Ese fallo es intencionado.

---

## Problemas frecuentes

### `npm install` falla con `ETIMEDOUT` o `ECONNREFUSED`

Proxy corporativo. Pide a IT la configuración y aplícala:

```bash
npm config set proxy http://<host>:<puerto>
npm config set https-proxy http://<host>:<puerto>
```

Si HDI tiene un registro npm interno, configúralo con `npm config set registry <url>`.

### `npx playwright install` no descarga los navegadores

Los binarios vienen de un CDN de Microsoft que el proxy puede bloquear. Alternativas:

1. Variable de proxy: `HTTPS_PROXY=http://<host>:<puerto> npx playwright install`
2. Usar solo Chromium: `npx playwright install chromium`
3. Ejecutar en Docker (README:134-146)
4. Para el módulo 00 no hacen falta: sáltalo por ahora

### `'npx' no se reconoce como un comando` (Windows)

Node no está en el `PATH`. Reinstálalo con el instalador oficial marcando "Add to PATH", y **abre una terminal nueva**.

### `npx playwright test -c learning/student/sandbox` no encuentra la configuración

Ejecuta el comando **desde la raíz del proyecto**, no desde dentro de `learning/`:

```bash
pwd    # debe terminar en /playwright-demo-ia-mcp
```

### Los ejercicios abren un navegador

No deberían: el módulo 00 es lógica pura. Si ocurre, estás ejecutando la suite del proyecto en lugar del sandbox. Comprueba que el comando lleva `-c learning/student/sandbox`.

### `npm run report:ai` falla en mi equipo

Es **esperado y conocido**. [`package.json:14`](../../package.json) contiene una ruta absoluta de una máquina concreta:

```json
"report:ai": "cross-env CLAUDE_CODE_GIT_BASH_PATH=\"C:\\Users\\raul.molina\\...\" node scripts/report-ai.mjs"
```

Es el hallazgo **B1** de la Fase 1 y **es el primer ejercicio del módulo 08**, así que no se corrige antes. Hasta entonces, el reporte IA se ve en CI.

### Los tests del proyecto fallan más de lo esperado

La suite completa debe dar **10 fallos por navegador**, todos etiquetados `@demo-fail`. Comprueba cuáles son:

```bash
npm run test:demo:green --  --project=chromium   # debería quedar todo verde
```

Si falla algo en la suite verde, no es cosa tuya: SauceDemo puede haber cambiado. Avisa al formador — es material del módulo 04.

### La ejecución de la suite completa tarda mucho

Normal: son 237 ejecuciones (79 tests × 3 navegadores) contra un sitio externo. Durante las prácticas usa un solo navegador:

```bash
npm run test:chromium
```

---

## Checklist previo a la primera sesión

- [ ] `node --version` ≥ v20
- [ ] `git --version` responde
- [ ] Repositorio clonado y `npm install` terminado sin errores
- [ ] `npx playwright test -c learning/student/sandbox` → `7 failed`, `13 passed`
- [ ] `npx tsc --noEmit` sin salida
- [ ] VS Code instalado con la extensión de Playwright
- [ ] Cuenta de GitHub operativa
- [ ] *(Opcional, para el módulo 01)* `npx playwright install` completado
