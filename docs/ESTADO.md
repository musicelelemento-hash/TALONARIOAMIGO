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

## Auditoría visual (22/11) — pendientes de rediseño
Arreglados: tabla de productos rota, botón "Emitir" invisible, desborde en celular (commit `ff34156`).
Pendientes, en orden de impacto:
1. **Letra chica:** ~90 % de los textos del facturador miden menos de 14 px; la meta para mayores es 16 px o más.
2. **Botones chicos:** 39–50 controles miden menos de 44 px (el mínimo para el dedo); los chips de modo miden 21 px.
3. **Demasiados controles:** 52 visibles en Modo Comerciante; el Tranquilo tiene 7 (bien) pero deja a la vista el cambio de modo.
4. **Celular:** la tabla de productos debería ser tarjetas; "Ayúdame" tapa el total a cobrar.
5. **Jerga en la portada:** XAdES, SOAP, XML, .p12, "clave de acceso".
6. **Decisión tributaria:** a los RIMPE la pantalla y el ticket dicen "NOTA DE VENTA", pero se emite **factura** (codDoc 01). Consultar con un contador.
Script de auditoría: Playwright a 375/820/1366/1920 px en modo demo (sin tocar la API).

## Siguiente paso (Fase 1 — "que no se caiga")
1. Decidir qué repo despliega y llevar la rama de trabajo a `main` de ese repo.
2. Verificar o desplegar el Worker de keep-alive (falta la API key de Cloudflare).
3. Respaldos y monitoreo.

## Bloqueos / decisiones del dueño
- **El dueño pidió esperar** antes de tocar repos, Render o Supabase: no está seguro de cuál repo es el actual
  (puede haber otra cuenta de Google o GitHub con una versión más nueva).
- Repo de producción (este o `robertcashbooking-lang/TALONARIO-AMIGO`).
- API key de Cloudflare (cuenta Talonario) → network secret para `api.cloudflare.com`.
- Credenciales de Meta WhatsApp → variables `WHATSAPP_*` en Render (`docs/WHATSAPP_SETUP.md`).
- Abogado: términos de uso y privacidad.
- La API key de Render se escribió en el chat el 21/11: confirmar que se rotó.

## Historial (una línea por sesión; máximo 5)
- 21–22/11/2026 — Primera sesión en la nube: seguridad, WhatsApp, Supabase, skills, informe final.
