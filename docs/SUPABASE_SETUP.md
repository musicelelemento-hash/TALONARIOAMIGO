# 🗄️ Guía de instalación "1 click" — Supabase

> Talonario Amigo usa **Laravel → PostgreSQL**. Supabase es Postgres gestionado:
> la app se conecta por *connection string*, no por el SDK de Supabase desde el navegador.
> Esta guía te deja el backend apuntando a Supabase en minutos.

## 1. Crear el proyecto

1. Entra a [supabase.com](https://supabase.com) → **New project**.
2. Nombre, contraseña de la base y región (la más cercana a Ecuador: `us-east-1` o `sa-east-1`).
3. Espera a que termine de aprovisionar.

## 2. Obtener la connection string

**Project Settings → Database → Connection string → URI** (o **Session pooler**):

```
postgresql://postgres.<ref>:<password>@db.<ref>.supabase.co:5432/postgres?sslmode=require
```

> Si tu red no permite IPv6, usa el **Session Pooler** (puerto `6543`) que ya viene con SSL.

## 3. Configurar el `.env` del backend

```bash
DB_CONNECTION=pgsql
DB_HOST=db.<ref>.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres.<ref>
DB_PASSWORD=<password>
```

> En Render: marca la base como **public network** o usa el pooler `-pooler` si aplica.

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
