#!/bin/bash
# Candado de producción (PreToolUse/Bash): pide confirmación humana antes de
#  - cualquier llamada que modifique Render, Supabase, Cloudflare o Meta (POST/PUT/PATCH/DELETE o envío de datos)
#  - un git push a main/master
# Lee el JSON del hook por stdin. No bloquea lecturas (GET).
cmd=$(jq -r '.tool_input.command // empty')
[ -z "$cmd" ] && exit 0

hosts='api\.render\.com|api\.supabase\.com|api\.cloudflare\.com|graph\.facebook\.com|graph\.instagram\.com'
mutating='(-X|--request)[ =]*["'"'"']?(POST|PUT|PATCH|DELETE)|(^|[ ])(-d|--data|--data-raw|--data-binary|-F|--form|--json)([ =]|$)|method=["'"'"'](POST|PUT|PATCH|DELETE)'

reason=""
if echo "$cmd" | grep -Eq "$hosts" && echo "$cmd" | grep -Eq "$mutating"; then
  reason="Este comando MODIFICA un servicio de producción (Render, Supabase, Cloudflare o Meta). El dueño pidió confirmar cada cambio en producción."
elif echo "$cmd" | grep -Eq 'git[[:space:]]+push' && echo "$cmd" | grep -Eq '(^|[ :/])(main|master)([ ]|$)'; then
  reason="Este comando sube cambios a main/master. Requiere confirmación del dueño."
fi

if [ -n "$reason" ]; then
  jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"ask",permissionDecisionReason:$r}}'
fi
exit 0
