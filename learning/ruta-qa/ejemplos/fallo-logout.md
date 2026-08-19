# Ejemplo de fallo — Logout

Salida real de `tests/menu.spec.ts`, ejecución del 19 de agosto de 2026 en Chromium.

Úsalo en el **módulo 6** si no puedes generar tus propios fallos. Es todo lo que necesitas pegarle a la IA: el error y el estado de la página. Nada más.

---

## 1. El error

```text
Error: El usuario debería ser redirigido a la página de login tras cerrar sesión

expect(page).toHaveURL(expected) failed

Expected: "https://www.saucedemo.com/inventory.html"
Received: "https://www.saucedemo.com/"
Timeout:  5000ms

Call log:
  - El usuario debería ser redirigido a la página de login tras cerrar sesión with timeout 5000ms
    9 × unexpected value "https://www.saucedemo.com/"


  23 |       page,
  24 |       'El usuario debería ser redirigido a la página de login tras cerrar sesión',
> 25 |     ).toHaveURL('/inventory.html');
     |       ^
  26 |     await expect(
  27 |       page.locator('[data-test="login-button"]'),
  28 |       'El botón de login debería ser visible tras cerrar sesión, confirmando que la sesión se ha cerrado correctamente',
    at C:\Users\raul.molina\Documents\3. workspace\playwright\playwright-demo-ia-mcp\tests\menu.spec.ts:25:7
```

## 2. El estado de la página al fallar

Contenido de `test-results/<test>/error-context.md`:

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]: Swag Labs
  - generic [ref=e5]:
    - generic [ref=e9]:
      - textbox "Username" [ref=e11]
      - textbox "Password" [ref=e13]
      - button "Login" [ref=e15] [cursor=pointer]
    - generic [ref=e17]:
      - generic [ref=e18]:
        - heading "Accepted usernames are:" [level=4] [ref=e19]
        - text: standard_user
        - text: locked_out_user
        - text: problem_user
        - text: performance_glitch_user
        - text: error_user
        - text: visual_user
      - generic [ref=e20]:
        - heading "Password for all users:" [level=4] [ref=e21]
        - text: secret_sauce
```

## 3. Lo que sabes

- Reproducible: falla siempre.
- La aplicación es SauceDemo, estable, sin despliegues recientes.
- El test lleva el tag `@demo-fail`.

---

> **Antes de mirar la solución:** el fragmento de arriba ya contiene la respuesta. Léelo tú primero.
