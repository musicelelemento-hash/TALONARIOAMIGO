# 🏗️ ARQUITECTURA GRATUITA — GUÍA DE DESPLIEGUE

> **Meta:** que Talonario Amigo funcione al máximo **sin pagar** hasta que el tráfico realmente lo exija. Todo gratis: **Cloudflare Pages** (frontend) + **Cloudflare Worker** (keep-alive) + **Cloudflare R2** (archivos) + **Supabase** (BD) + **Render free** (API).

---

## 0. Mapa final

| Capa | Servicio | Plan | Rol |
|---|---|---|---|
| Frontend SPA | **Cloudflare Pages** | Gratis | Sirve `public/dist` desde el edge (nunca duerme) |
| API | **Render** (Docker) | free | Laravel + librería SRI |
| Keep-alive 🔥 | **Cloudflare Worker** | Gratis | Cron cada 2 min ping a `/api/health` (evita el sleep de Render) |
| BD | **Supabase Postgres** | Gratis | Always-on, RLS por roles |
| Archivos `.p12`/expedientes | **Cloudflare R2** | Gratis (10GB) | Respaldo de firmas y exportaciones |

---

## 1. Frontend → Cloudflare Pages

1. En `TALONARIOAMIGO` genera la build:
   ```bash
   npm run build      # crea public/dist
   ```
2. Sube el repo a GitHub.
3. En **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git**:
   - Repo: tu repo. Build command: `npm run build -w ...` (o el comando que genere `dist`).
     - Si subes todo `TALONARIOAMIGO`, build: `cd TALONARIOAMIGO && npm install && npm run build`
     - **Output directory:** `TALONARIOAMIGO/public/dist`
   - Agrega tu dominio (ej. `talonarioamigo.com`).
4. Listo: la SPA se sirve desde el edge de Cloudflare (gratis, rápido, con HTTPS).

> ⚠️ **Ruta de la API:** el frontend ya detecta si está en `localhost` o producción. En Pages en producción usa `https://talonario-amigo-api.onrender.com/api`. Asegúrate de que `CORS` permita tu dominio (el proyecto ya usa `fruitcake/laravel-cors`).

---

## 2. API → Render (free) con keep-alive

1. El `render.yaml` ya está listo (web + Postgres). Los **envVars** ahora incluyen `APP_KEY` y `FACTURACION_*`.
2. Despliega el servicio web `talonario-amigo-api` en Render (plan free).
3. **Keep-alive:** despliega el Worker de Cloudflare:

   ```bash
   cd cloudflare/keepalive
   npx wrangler deploy        # requiere `npx wrangler login`
   ```

   El Worker tiene un **Cron Trigger** `*/2 * * * *` (cada 2 min) que llama a `https://talonario-amigo-api.onrender.com/api/health`. Esto mantiene el servicio de Render despierto.

   > También puedes usar un cron externo gratuito (cron-job.org / UptimeRobot) que haga ping a `/api/health` si prefieres no crear el Worker.

---

## 3. Base de datos → Supabase (always-on) — migración

**Por qué:** Render free puede limitar la BD. Supabase free (500MB) es **siempre activa** y tiene **RLS** (fila/rol), ideal para emisor/reseller/owner.

1. Crea un proyecto en Supabase (ya apuntas a `zrarulilyvwfetpohkbu` en tu `.mcp.json`).
2. Ejecuta las **migraciones** del backend en el editor SQL de Supabase: `TALONARIOAMIGO/database/migrations/*.php` (users, roles_and_resellers, emisores_and_establecimientos, personal_access_tokens, etc.).
3. Obtén la **connection string** de Supabase (Settings → Database → Connection string).
4. Configura las variables en **Render** (o en el `.env` local):
   ```
   DB_CONNECTION=pgsql
   DB_HOST=db.<tu-proyecto>.supabase.co
   DB_PORT=5432
   DB_DATABASE=postgres
   DB_USERNAME=postgres
   DB_PASSWORD=<password-de-supabase>
   ```
   > Supabase expone Postgres por **IPv4 + SSL**; Laravel debe conectar con `sslmode`/`options`. En Render, asegura el acceso a Supabase (marca "public network" o usa el pooler `-pooler`).

5. Corre el seeder (`php artisan db:seed`) → crea el SUPER_ADMIN + imprenta.
6. **Acceso seguro:** activa **RLS** en las tablas y políticas por `role`/`reseller_id` para que cada usuario vea solo sus datos.

---

## 4. Archivos → Cloudflare R2 (backups de `.p12` y exportaciones)

- Crea un **Bucket R2** (10GB gratis).
- El backend **ya tiene `R2StorageService`** — configura sus credenciales (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`) en Render.

---

## 5. El "techo" — cuándo pagar

| Señal | Acción |
|---|---|
| Render free se suspende por uso continuo | Pasarlo a **$7/mes** (no duerme) |
| Supabase >500MB | Upgrade a plan pago |
| Cloudflare Pages/W kudos por tráfico masivo | Upgrade cuando toque |

> **Idea pro:** el **timing** con retención. Hasta que haya demanda real, todo corre gratis. El primer costo "de verdad" suele ser el **web service de Render** (~$7/mes) que además quita el sleep y mejora la latencia.

---

*Guía de despliegue de la arquitectura gratuita de Talonario Amigo.*
