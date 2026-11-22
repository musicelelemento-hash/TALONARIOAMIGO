# Respaldo con FreeLLMAPI (modelos gratuitos)

Para seguir trabajando en Talonario Amigo si un día no puedes usar Claude (límite de uso, sin plan,
etc.). Usa tu servidor **FreeLLMAPI** local, que reparte el trabajo entre modelos gratuitos.

> Es un **respaldo**, no el modo normal: los modelos gratuitos rinden menos en programación, y el
> equipo de agentes del proyecto está pensado para Claude. Tu código pasa por los proveedores que
> tengas conectados en FreeLLMAPI: no les muestres llaves ni la firma `.p12`.

## Preparación (una sola vez, en tu PC)
1. Instala y abre la app **FreeLLMAPI** (debe responder en `http://127.0.0.1:31415`).
2. En su panel, **genera una llave nueva** (la que se escribió en el chat del 22/11 ya no debe usarse).
3. Guarda la llave en tu PC (nunca en el repositorio):
   - **Windows (PowerShell):**
     `[Environment]::SetEnvironmentVariable("FREELLMAPI_API_KEY", "TU_LLAVE", "User")`
     y abre una terminal nueva.
   - **Mac / Linux:** agrega `export FREELLMAPI_API_KEY='TU_LLAVE'` a tu `~/.zshrc` o `~/.bashrc`.
4. Ten Node.js 20.18 o más nuevo y Claude Code instalados.

## Usarlo (cada vez que lo necesites)
Desde la carpeta del proyecto:
- **Windows:** `.\scripts\respaldo-claude.ps1`
- **Mac / Linux / Git Bash:** `bash scripts/respaldo-claude.sh`

Se abre Claude Code usando FreeLLMAPI **solo en esa ventana**. Tu configuración normal no cambia:
al cerrarla, todo vuelve a Claude.

Si PowerShell no deja ejecutar el script, ejecútalo una vez así:
`powershell -ExecutionPolicy Bypass -File .\scripts\respaldo-claude.ps1`

## Detalles
- Versión fijada del paquete: `freellmapi@0.8.4` (revisada el 22/11/2026: código abierto, licencia MIT).
- Si tu servidor usa otra dirección, define `FREELLMAPI_URL` antes de ejecutar.
- Si prefieres que Claude Code use FreeLLMAPI **siempre** (no recomendado), el comando es
  `npx freellmapi setup-claude --url http://127.0.0.1:31415 --dry-run` para ver el cambio, y sin
  `--dry-run` para aplicarlo. Guarda una copia de respaldo con fecha de tu configuración antes de tocarla.
- En la sesión de respaldo, empieza con "ponte al día": la bitácora (`docs/ESTADO.md`) funciona igual.
