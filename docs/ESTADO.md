# Estado del proyecto — bitácora de relevo

> Lo primero que lee cada sesión (skill `bitacora`). Corto y al día. Sin secretos.

## Último relevo
- **Fecha:** 22/11/2026
- **Rama de trabajo:** `claude/eager-dirac-ssj0uc` (no está en `main` todavía)
- **Avance global hacia la versión final:** 46 % (detalle por área: `docs/INFORME_FINAL.md` §3)

## Producción hoy
- API `talonario-amigo-api` (Render) **viva sobre Supabase** desde el 21/11 (la Postgres de Render venció).
- Supabase con RLS en todas las tablas; la app usa el rol `talonario_app`.
- ⚠️ La producción corre el código del repo `robertcashbooking-lang/TALONARIO-AMIGO` (commit `850c6c0`), que
  **no tiene** las correcciones de seguridad de este repo: `/api/v1/sign/xml` sigue abierto allá.

## Hecho en la última sesión
- Seguridad: se eliminó la firma pública de `.p12`; no se firma con el certificado global; errores amables.
- `EmisionService`: un solo pipeline de emisión.
- Factura por WhatsApp completa en código (bot, vínculo, confirmación SI), con tests. Falta activarla en Meta.
- Base de datos movida a Supabase; `SUPABASE_SERVICE_ROLE_KEY` corregida en Render.
- Skills del proyecto instaladas; `CLAUDE.md` + esta bitácora + skill `bitacora`.

## Siguiente paso (Fase 1 — "que no se caiga")
1. Decidir qué repo despliega y llevar la rama de trabajo a `main` de ese repo.
2. Verificar o desplegar el Worker de keep-alive (falta la API key de Cloudflare).
3. Respaldos y monitoreo.

## Bloqueos / decisiones del dueño
- Repo de producción (este o `robertcashbooking-lang/TALONARIO-AMIGO`).
- API key de Cloudflare (cuenta Talonario) → network secret para `api.cloudflare.com`.
- Credenciales de Meta WhatsApp → variables `WHATSAPP_*` en Render (`docs/WHATSAPP_SETUP.md`).
- Abogado: términos de uso y privacidad.
- La API key de Render se escribió en el chat el 21/11: confirmar que se rotó.

## Historial (una línea por sesión; máximo 5)
- 21–22/11/2026 — Primera sesión en la nube: seguridad, WhatsApp, Supabase, skills, informe final.
