# 🗄️ Guía de instalación "1 click" — Supabase

> Talonario Amigo usa **Laravel → PostgreSQL**. Supabase es Postgres gestionado:
> la app se conecta por *connection string*, no por el SDK de Supabase desde el navegador.
> Esta guía te deja el backend apuntando a Supabase en minutos.

## 1. Crear el proyecto

1. Entra a [supabase.com](https://supabase.com) → **New project**.
2. Nombre, contraseña de la base y región (la más cercana a Ecuador: `us-east-1` o `sa-east-1`).
3. Espera a que termine de aprovisionar.

## 2. Obtener la connection string

**Project Settings → Database → Connection string → Session pooler.**

> ⚠️ No uses el host directo `db.<ref>.supabase.co`: solo tiene IPv6 y Render no sale por IPv6
> (la conexión falla). Usa siempre el **Session pooler**: puerto **5432**. El puerto `6543` es el
> modo *transacción*, que rompe las sentencias preparadas de PDO/Laravel.

```
postgresql://<rol>.<ref>:<password>@aws-1-<region>.pooler.supabase.com:5432/postgres?sslmode=require
```

## 3. Configurar el `.env` del backend

La app usa su **propio rol** (`talonario_app`), no `postgres`: así sus tablas no heredan los
permisos que Supabase da por defecto a `anon`/`authenticated` en la Data API.

```bash
DB_CONNECTION=pgsql
DB_HOST=aws-1-us-west-2.pooler.supabase.com
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=talonario_app.<ref>
DB_PASSWORD=<password del rol talonario_app>
DB_SSLMODE=require
SUPABASE_SERVICE_ROLE_KEY=<service_role key>   # Storage de XML; el código NO lee SUPABASE_KEY
```

Crear el rol (SQL Editor, una vez):

```sql
create role talonario_app with login password '<password>';
grant usage, create on schema public to talonario_app;
```

### Estado de producción (noviembre 2026)

- La API de Render (`talonario-amigo-api`) usa esta configuración desde el 21/11/2026. La antigua
  Postgres gratuita de Render (`talonario-amigo-db`) venció el 18/11 y ya no se usa.
- Las 11 tablas de `public` pertenecen a `talonario_app`, tienen RLS activado y `anon` /
  `authenticated` no tienen ningún permiso sobre ellas.
- El contenedor ejecuta `php artisan migrate --force` al arrancar.
- Supabase gratis se pausa tras ~7 días sin actividad: el Worker `cloudflare/keepalive` llama a
  `/api/health` (que hace `SELECT 1`) cada 2 minutos para evitarlo.

## 4. Migrar y sembrar

```bash
cd TALONARIOAMIGO
php artisan migrate --force          # crea tablas
php artisan db:seed --force          # SUPER_ADMIN + imprenta (desde .env SEED_*)
php artisan db:seed --class=DemoSeeder --force   # opcional: datos de demo
```

## 5. Seguridad — qué hace y qué no hace RLS

- **La app ya aísla** por `emisor_id` y por rol (`SUPER_ADMIN`, `RESELLER`, `CLIENT`) en los controladores.
- El **frontend no habla con Supabase directamente** (solo con `/api/v1`), por lo que la **anon-key no se expone** al navegador.
- Si en el futuro expones Supabase REST a terceros, activa **RLS** con políticas `auth.uid()` (defensa en profundidad) y usa la **service_role key solo en el backend**, nunca en el cliente.

## 6. Checklist de verificación

- [ ] `php artisan migrate --force` sin errores.
- [ ] `php artisan db:seed` crea el SUPER_ADMIN.
- [ ] `GET /api/health` responde `"database":"active"`.
- [ ] Login del super admin devuelve token.
- [ ] Las tablas aparecen en **Supabase → Table editor**.

## 7. Variables de entorno completas

Ver `.env.example` en `TALONARIOAMIGO/`. Las mínimas para un deploy:

`APP_KEY`, `DB_*`, `FACTURACION_AMBIENTE`, `DEFAULT_SUPPORT_WHATSAPP`,
`SEED_SUPERADMIN_*`, `R2_*`, `RESEND_API_KEY`.
