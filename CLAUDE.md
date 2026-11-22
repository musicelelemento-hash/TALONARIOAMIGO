# Talonario Amigo — guía rápida para Claude

> Léeme entero (es corto). Para el estado del trabajo, lee **`docs/ESTADO.md`** y nada más:
> no releas el repositorio completo al empezar. Usa la skill `bitacora` para ponerte al día y para
> dejar el relevo al terminar.

## Qué es
Facturación electrónica SRI (Ecuador) que se siente como el talonario de papel de siempre.
Público: comerciantes y adultos mayores que le temen al cambio. Promesa: *"vendemos tranquilidad"*.
Visión completa: `VISION_MAESTRA.md` · Plan comercial: `docs/PLAN_LANZAMIENTO_PROFESIONAL.md` ·
Informe de producto: `docs/INFORME_FINAL.md`.

## Idioma y trato
- Responde siempre en **español**, simple y directo; el dueño no es técnico.
- Textos de la app: cero jerga (nada de "XAdES", "SOAP", "clave 49" para el comerciante).

## Estructura
| Ruta | Qué hay |
|---|---|
| `TALONARIOAMIGO/` | Backend Laravel 8 (PHP 8.1+) **y** frontend SPA (vanilla JS + Vite) en `resources/js` |
| `TALONARIOAMIGO/app/Services/EmisionService.php` | Pipeline único de emisión (web, APK y WhatsApp lo usan) |
| `TALONARIOAMIGO/app/Services/WhatsApp/` | Bot "factura por WhatsApp" |
| `TALONARIOAMIGO/liberias_sri/` | Librería SRI comprada (firma XAdES, XML) — no reescribir |
| `talonario-amigo-mobile/` | Capacitor (APK Android) · `talonario-amigo-desktop/` Electron |
| `cloudflare/keepalive/` | Worker que llama `/api/health` cada 2 min (evita que Render y Supabase duerman) |
| `.agents/agents/` | 22 fichas antiguas de roles (solo referencia; el equipo real está en `.claude/agents/`) |
| `docs/` | Guías: Render, Supabase, WhatsApp, demo, imprentas, diseño |

## Comandos (desde `TALONARIOAMIGO/`)
```bash
composer install && npm ci          # dependencias (el setup del entorno ya lo hace)
vendor/bin/phpunit --no-coverage    # tests backend (deben pasar todos)
npm run lint && npm run build       # frontend
```
Si los tests fallan con "valid cache path": `mkdir -p storage/framework/{views,cache/data,sessions,testing} bootstrap/cache`.

## Infraestructura de producción (cuenta Gmail de Talonario, NO la personal)
- **Render**: servicio `talonario-amigo-api` (`srv-d9kho4laeets739fbu3g`), workspace `tea-d9khl69t0dsc73e3a88g`.
  Despliega desde **`robertcashbooking-lang/TALONARIO-AMIGO`** (otra cuenta de GitHub), rama `main`.
  Este repo (`musicelelemento-hash/TALONARIOAMIGO`) NO se despliega solo: ver `docs/ESTADO.md`.
- **Supabase**: proyecto `zrarulilyvwfetpohkbu` (us-west-2). La app conecta por Session Pooler (5432)
  con el rol `talonario_app`. Detalles: `docs/SUPABASE_SETUP.md`.
- Las API keys de Render (`api.render.com`) y Supabase (`api.supabase.com`) están guardadas como
  *network secrets* del entorno: llama a esas APIs con `curl` sin poner el header de auth.
- Los conectores MCP de Render/Vercel de claude.ai apuntan a la cuenta **personal** (otro proyecto):
  no los uses para Talonario.

## Equipo de agentes (director + especialistas)
La sesión principal es el **director** (skill `director`): decide si delegar, a quién y cómo verificar.
Especialistas en `.claude/agents/`: `dev-backend`, `interfaz-minimalista`, `marketing-contenido`,
`crecimiento-negocio`, `cumplimiento-seguridad` (solo revisa), `infra-operaciones` (solo lectura) y
`verificador-qa` (solo revisa, obligatorio antes de dar algo por terminado).
Marketing: `docs/marketing/` · Planes y cobros: `docs/negocio/PLANES_Y_PAGOS.md` ·
Conexiones por hacer: `docs/CONEXIONES_PENDIENTES.md`.

## Reglas
- Producción (Render, Supabase, Cloudflare, Meta) y push a `main`: siempre con aprobación del dueño
  (candado automático en `.claude/hooks/proteger-produccion.sh`).
- Nunca imprimas ni escribas secretos (llaves, contraseñas, `.p12`) en chat, logs, commits o docs.
- Toda ruta de `api/v1/*` exige `auth:sanctum`, salvo las listadas en `tests/Feature/SecurityTest.php`.
- Cambios de emisión: correr `EmissionTest`, `WhatsAppTest` y `SecurityTest`.
- Diseño: respetar `docs/DESIGN.md` (papel marfil + copia azul; sin neón/glows).
- Al terminar una sesión con cambios: actualizar `docs/ESTADO.md` (skill `bitacora`).
