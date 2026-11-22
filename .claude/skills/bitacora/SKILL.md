---
name: bitacora
description: Ponerse al día y dejar el relevo entre sesiones de Talonario Amigo sin releer todo el repositorio. Úsala al EMPEZAR una sesión o cuando el usuario diga "ponte al día", "retoma", "¿en qué quedamos?", "continúa"; y al TERMINAR un bloque de trabajo o cuando diga "guarda", "cierra", "deja el relevo".
---

# Bitácora de sesión (ahorro de tokens)

El estado vivo del proyecto está en `docs/ESTADO.md`. Es la única fuente que se lee al empezar.

## Al empezar ("ponte al día")

1. Lee `docs/ESTADO.md` completo (es corto).
2. Mira solo lo que cambió desde el último relevo:
   ```bash
   git log --oneline -15
   git log --oneline <commit del último relevo>..HEAD   # si ESTADO.md lo indica
   git status --short
   ```
3. NO abras el resto del repositorio salvo que la tarea lo pida. `CLAUDE.md` ya da el mapa.
4. Responde al usuario en 5 líneas máximo: dónde quedamos, qué sigue, qué está bloqueado y por quién.

## Al terminar ("deja el relevo")

Actualiza `docs/ESTADO.md` (edita en su lugar, no agregues historia infinita):

- **Último relevo**: fecha, rama y commit actual (`git rev-parse --short HEAD`).
- **Avance hacia la versión final**: ajusta los porcentajes por área solo si hubo cambios reales.
- **Hecho en esta sesión**: 3–6 viñetas. Mueve lo anterior a "Historial" en una línea por sesión
  y conserva solo las últimas 5 sesiones.
- **Siguiente paso** y **Bloqueos / decisiones del dueño**.

Luego haz commit de `docs/ESTADO.md` junto con el trabajo (o solo, con
`docs(estado): relevo de sesión`). Nunca escribas secretos en la bitácora.
