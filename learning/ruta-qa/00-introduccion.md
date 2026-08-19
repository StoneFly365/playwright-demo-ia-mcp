# 0 · Introducción

⏱️ **Duración:** 10 min · **Anterior:** [Índice de la ruta](README.md)

> 🛠️ **Antes de este módulo:** el entorno tiene que estar montado. Eso es [**pre-work técnico**](pre-work.md) y **no cuenta dentro de las 6 horas**. Si aún no lo has hecho, hazlo otro día: son 20-40 min de descargas.
>
> Comprobación rápida de que estás listo:
>
> ```bash
> npm run ruta-qa:check
> ```

---

## 🎯 Objetivo

Entender cómo se recorre esta ruta y salir de aquí con el material de tu propio proyecto sobre la mesa.

---

## 🧠 Aprende (6 min)

### Qué vas a saber hacer en seis horas

- Decidir **cuándo** usar IA en una tarea de QA y cuándo no, con criterio propio.
- Escribir prompts que devuelven algo utilizable a la primera, no una conversación de diez turnos.
- Convertir una historia de usuario en escenarios, riesgos y casos de prueba con ayuda de IA, y **revisarlos críticamente**.
- Crear y mantener tests de Playwright con IA.
- Conectar la IA a tu aplicación con MCP para que los locators salgan del DOM real y no de la imaginación del modelo.
- Diagnosticar un fallo hasta la causa raíz usando la IA como investigadora.

### Qué NO es esta ruta

- No es un curso de LLMs. No vas a ver arquitecturas de transformers.
- No es un curso completo de Playwright. Eso es el [Módulo 01](../modules/01-playwright-fundamentals/README.md), 12 horas, y **no hace falta para seguir aquí**.
- No es un curso técnico de MCP. Vas a entender qué es, para qué te sirve y cómo usarlo; no vas a escribir un servidor.
- No hay examen teórico. El cierre es un proyecto pequeño.

### Cómo se recorre

Los ocho módulos van en orden. Cada uno se cierra con **🎯 Llévatelo a tu proyecto**: una actividad corta sobre tu trabajo real.

> **Esa sección no es opcional.** Es la razón de que la ruta dure seis horas y no veinte. Al terminar el día deberías tener producido algo que usas mañana: un prompt base, unos casos de prueba, un test, un informe de diagnóstico.

Si vas justo de tiempo en una sesión, salta el ejercicio guiado antes que el "Llévatelo".

### Nada te puede bloquear

Dos garantías de diseño, para que no pierdas tiempo peleándote con herramientas:

| Garantía | Qué significa |
|---|---|
| 🟢 **La IA real es lo recomendado** | Los ejercicios están pensados para que uses tu asistente de verdad |
| 🟡 **Pero nunca es obligatoria** | Si algo no arranca, en [`ejemplos/`](ejemplos/README.md) tienes salidas reales ya generadas. Cógelas y sigue |

Regla práctica: **si llevas más de 5 minutos arreglando una herramienta, usa el ejemplo y continúa.** El aprendizaje está en revisar la salida, no en generarla.

### Las tres reglas del laboratorio

1. **Todo lo que escribes vive en `learning/student/sandbox/ruta-qa/`.** El proyecto (`tests/`, `pages/`, `scripts/`, `prompts/`, `specs/`) es lectura.
2. **Los diez tests que fallan no se arreglan.** Fallan a propósito y son el material de los módulos 1 y 6.
3. **Diagnosticar antes que corregir.** Cambiar el valor esperado de una aserción para llegar a verde es exactamente la conducta que esta formación existe para prevenir.

---

## 🛠️ Practica (2 min) — arranque en frío

Una sola comprobación, para ver la aplicación en verde antes de empezar:

```bash
npx playwright test -c learning/student/sandbox/ruta-qa --project=chromium
```

Salida esperada, exactamente:

```text
2 skipped
1 passed
```

El que pasa es tu comprobación de entorno. Los dos saltados son los **specs semilla** de los módulos 4 y 7: llegan con los imports, el `describe` y el login ya escritos, esperando a que les quites el `.skip` y escribas el cuerpo. Así no gastas tiempo en infraestructura.

Si ves otra cosa, vuelve al [pre-work](pre-work.md).

---

## 🎯 Llévatelo a tu proyecto (2 min)

Crea `learning/student/sandbox/ruta-qa/mi-proyecto.md` y anota tres cosas de tu proyecto actual. Las vas a usar en todos los módulos:

1. **Una historia de usuario o requisito** que tengas pendiente de probar esta semana.
2. **Un fallo reciente** que te costó diagnosticar.
3. **Una tarea repetitiva** de tu semana de QA que te aburre.

Es tu material de trabajo del resto de la ruta. Sin esto, los "Llévatelo" se quedan en teoría.

---

## ✅ Al terminar deberías ser capaz de

- Ejecutar el sandbox y ver `1 passed`.
- Explicar por qué los diez tests rojos del proyecto no se tocan.
- Decir dónde escribes tú y dónde no.
- Saber que tienes plan B si una herramienta falla.

---

**Siguiente:** [1 · IA aplicada a QA](01-ia-para-qa.md) →
