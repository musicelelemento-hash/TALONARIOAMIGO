#!/usr/bin/env bash
# Respaldo: abre Claude Code usando tu servidor FreeLLMAPI local (modelos gratuitos).
# No cambia tu configuración normal de Claude Code: solo afecta a esta sesión de respaldo.
# Uso (Mac/Linux/Git Bash, con FreeLLMAPI encendido):  bash scripts/respaldo-claude.sh
# La llave se lee de FREELLMAPI_API_KEY (ver docs/RESPALDO_FREELLMAPI.md). Nunca la escribas aquí.
set -euo pipefail
URL="${FREELLMAPI_URL:-http://127.0.0.1:31415}"

if [ -z "${FREELLMAPI_API_KEY:-}" ]; then
  echo "Falta la llave. Agrega a tu ~/.bashrc o ~/.zshrc:  export FREELLMAPI_API_KEY='TU_LLAVE'" >&2
  exit 1
fi
if ! curl -s -o /dev/null --max-time 5 "$URL"; then
  echo "No encuentro FreeLLMAPI en $URL. Abre la app de FreeLLMAPI y vuelve a intentar." >&2
  exit 1
fi
echo "Abriendo Claude Code en modo respaldo (FreeLLMAPI en $URL)..."
exec npx --yes freellmapi@0.8.4 launch --url "$URL"
