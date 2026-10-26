# 🚀 Configurar Talonario Amigo en Render — paso a paso

> Tu servicio ya está vivo (`talonario-amigo-api.onrender.com`). Esta guía cubre
> **crearlo desde cero** o **reconfigurarlo** (variables, Supabase, seeds y verificación).
> El backend corre en **Docker** (`TALONARIOAMIGO/Dockerfile`); el frontend vive en Vercel/Cloudflare.

---

## 0. Antes de empezar — tené a mano

- [ ] **Supabase**: connection string (Settings → Database).
- [ ] **Resend**: API key + dominio verificado (para RIDE/XML por email).
- [ ] **Cloudflare R2**: account id, access key, secret, bucket.
- [ ] **Dominio del frontend** (ej. `https://talonarioamigo.com`).
- [ ] Un **APP_KEY** nuevo: `php artisan key:generate --show`.

---

## 1. Crear el servicio en Render

**Opción A — Blueprint (`render.yaml`)**
El repo trae `render.yaml` con web + base de datos (Render Postgres). Si usás **Supabase**, igualmente tenés que **borrar/ignorar el bloque `databases`** y setear `DB_*` a mano (Opción B).

**Opción B — Manual (recomendado para tu caso con Supabase)**

1. Render → **New → Web Service** → conectá el repo.
2. Completá:

| Campo | Valor |
|---|---|
| Name | `talonario-amigo-api` |
| Language / Environment | **Docker** |
| **Root Directory** | `TALONARIOAMIGO` (si el servicio apunta a la raíz del repo) |
| **Dockerfile Path** | `Dockerfile` |
| **Health Check Path** | `/api/health` |
| Plan | **Free** (duerme) o **Starter $7** (no duerme) |
| Region | la más cercana a Ecuador (`oregon` o similar) |

3. **Create Web Service**.

> ⚠️ El `Dockerfile` ejecuta `php artisan migrate --force` **en cada arranque** — si `DB_*` está mal, el deploy falla. Configurá las variables ANTES del primer deploy.

---

## 2. Variables de entorno (Render → Environment)

Agregá una por una (o pegá en el editor de `Environment`):

### App
| Variable | Valor |
|---|---|
| `APP_NAME` | `TalonarioAmigo` |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_KEY` | `base64:...` (generá con `php artisan key:generate --show`) |
| `APP_URL` | `https://talonario-amigo-api.onrender.com` |
| `LOG_CHANNEL` | `stderr` |

### Base de datos — Supabase (Postgres)
| Variable | Valor |
|---|---|
| `DB_CONNECTION` | `pgsql` |
| `DB_HOST` | `aws-0-<region>.pooler.supabase.com` (pooler, IPv4) o `db.<ref>.supabase.co` |
| `DB_PORT` | `6543` (pooler) o `5432` (directo) |
| `DB_DATABASE` | `postgres` |
| `DB_USERNAME` | `postgres.<ref>` (pooler) o `postgres` |
| `DB_PASSWORD` | tu contraseña de Supabase |

> Si tu red no tiene IPv6, usá el **pooler** (puerto 6543). SSL lo maneja Supabase.

### SRI / soporte
| Variable | Valor |
|---|---|
| `FACTURACION_AMBIENTE` | `1` (Pruebas) · `2` (Producción) |
| `FACTURACION_SOAP_TIMEOUT` | `30` |
| `FACTURACION_CA_FILE` | *(vacío)* |
| `DEFAULT_SUPPORT_WHATSAPP` | `593993050689` |

### CORS (seguridad)
| Variable | Valor |
|---|---|
| `CORS_ALLOWED_ORIGINS` | `https://talonarioamigo.com` (tu dominio real) |

### Email (Resend)
| Variable | Valor |
|---|---|
| `RESEND_API_KEY` | `re_...` |
| `MAIL_FROM_ADDRESS` | `notificaciones@talonarioamigo.com` (dominio verificado en Resend) |
| `MAIL_FROM_NAME` | `Talonario Amigo` |

### Bóveda de archivos (Cloudflare R2)
| Variable | Valor |
|---|---|
| `R2_ACCOUNT_ID` | `...` |
| `R2_ACCESS_KEY_ID` | `...` |
| `R2_SECRET_ACCESS_KEY` | `...` |
| `R2_ENDPOINT` | `https://<account>.r2.cloudflarestorage.com` |
| `R2_BUCKET` | `talonario-amigo-vault` |

### Seeder (cuenta maestra + imprenta)
| Variable | Valor |
|---|---|
| `SEED_SUPERADMIN_EMAIL` | tu correo |
| `SEED_SUPERADMIN_PASSWORD` | clave fuerte |
| `SEED_SUPERADMIN_NAME` | `Dueño Talonario Amigo` |
| `SEED_RESELLER_EMAIL` | imprenta (opcional) |
| `SEED_RESELLER_PASSWORD` | clave fuerte (opcional) |

### Endpoint de migración manual
| Variable | Valor |
|---|---|
| `MIGRATE_TOKEN` | un secreto random (lo usa `POST /api/health/migrate`) |

> **Nunca** pongas `APP_KEY` ni `MIGRATE_TOKEN` en `render.yaml` versionado — cargalos en el panel.

---

## 3. Aplicar cambios

1. **Manual Deploy → Deploy latest commit** (o `git push` si es Blueprint con auto-deploy).
2. Esperá el build de Docker (varios minutos la 1ª vez).
3. Si el deploy falla, mirá **Logs** → casi siempre es `DB_*` incorrecto.

---

## 4. Migraciones y seeds (una sola vez)

- **Migraciones**: se corren solas al arrancar (`php artisan migrate --force` del CMD).
- **Seeds**: NO se corren solas. Hacelo una vez desde **Render → Shell**:

```bash
php artisan db:seed --force                          # SUPER_ADMIN + imprenta (desde SEED_*)
php artisan db:seed --class=DemoSeeder --force       # demo: demo@talonarioamigo.com / demo
```

> Alternativa sin Shell: `POST /api/health/migrate` con header `X-Migrate-Token: $MIGRATE_TOKEN`
> (corre migrate + SuperAdminSeeder, no el DemoSeeder).

---

## 5. Dominio y keep-alive

- Render te da `https://talonario-amigo-api.onrender.com` (o aggregá dominio propio en **Settings → Custom Domain**).
- **Keep-alive** (plan Free duerme): desplegá el Worker `cloudflare/keepalive` para que pegue a `/api/health` cada 2 min — o pasá a Starter $7.

---

## 6. Verificación (obligatoria antes de vender)

1. `GET https://talonario-amigo-api.onrender.com/api/health` → `"status":"ok"`.
2. `GET .../api/health/db` → `connected:true`, tablas > 0.
3. Corré el smoke test:
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/smoke-test.ps1
   ```
   Debe dar **3 PASS** (health, login demo, comprobantes).
4. Si el login falla con *"credenciales no coinciden"* → corré el `DemoSeeder` (paso 4).

---

## Checklist rápido

- [ ] Servicio Docker con `rootDir=TALONARIOAMIGO` y health `/api/health`
- [ ] `APP_KEY` generado y cargado en Render (no versionado)
- [ ] `DB_*` apuntando a Supabase
- [ ] `CORS_ALLOWED_ORIGINS` = tu dominio (sin `*`)
- [ ] `RESEND_API_KEY` + dominio verificado
- [ ] `R2_*` completos
- [ ] `SEED_*` + `MIGRATE_TOKEN`
- [ ] Deploy verde
- [ ] `db:seed` corrido (SuperAdmin + DemoSeeder)
- [ ] `smoke-test.ps1` → 3 PASS
