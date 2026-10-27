# 🔌 Auditoría de integraciones — Talonario Amigo

> Verificado contra el código real (controladores, servicios, config y `render.yaml`).
> **Fecha:** 2026-10-27 · Estado de cada conector y qué falta para producción.

---

## 1. Resumen

| Conector | Estado | Para producción falta |
|---|---|---|
| **SRI (SOAP)** | ✅ Código correcto | Prueba real con `.p12` en ambiente Pruebas (1) |
| **Base de datos** | ⚠️ Config mixta | Decidir: Supabase **o** Postgres de Render (hoy `render.yaml` usa Render) |
| **Resend (email)** | ⚠️ Código listo, sin credenciales | `RESEND_API_KEY` + dominio verificado + adjuntar PDF/XML |
| **Supabase Storage** | ✅ Conectado (REST API, sin tarjeta) | Falta `SUPABASE_SERVICE_ROLE_KEY` + crear el bucket |
| **CORS** | ✅ Restringido | — |
| **WhatsApp soporte** | ✅ Configurado | — |

---

## 2. SRI (facturación electrónica) — ✅ CONECTADO

- **Flujo:** `FacturacionElectronicaController::emitirFactura` → `FacturacionElectronicaLibrary` (App) → `LibreriasSri\FacturacionElectronicaLibrary` (comprada).
- **SOAP:** `liberias_sri/FacturacionElectronicaService.php` → `celcer.sri.gob.ec` (Pruebas) / `cel.sri.gob.ec` (Producción). URLs correctas.
- **Firma:** XAdES-BES con el `.p12` del emisor logueado (no uno global).
- **Validación:** `InvoiceValidationService` (pre-flight de emisor/firma, cédula/RUC módulo 10/11, regla $50 Consumidor Final, diagnóstico de rechazos SRI).
- **Tests:** 17/17, incluida emisión end-to-end con SOAP simulado (`tests/Feature/EmissionTest.php`).
- ✅ **Mejora hecha:** se eliminó `app/Services/FacturacionElectronicaService.php` (código muerto, duplicado del servicio comprado que ya no se usaba; el real es `LibreriasSri\FacturacionElectronicaService`).

> **Pendiente (no técnico):** probar una emisión real en ambiente **Pruebas** con el `.p12` de un emisor real y confirmar la respuesta `AUTORIZADO` del SRI.

---

## 3. Base de datos — ⚠️ DISCREPANCIA a decidir

Hay **dos configuraciones que se contradicen**:

| Fuente | Dice usar |
|---|---|
| `render.yaml` | **Postgres de Render** (`fromDatabase: talonario-amigo-db`) |
| `README.md`, `GUIA_ARQUITECTURA_FREE.md`, `docs/SUPABASE_SETUP.md`, `.env.example` | **Supabase Postgres** |
| `.mcp.json` | Apunta a proyecto Supabase `zrarulilyvwfetpohkbu` (solo MCP, no runtime) |

- `config/database.php` ya soporta `pgsql` con `sslmode=require` (correcto para Supabase/Render).
- El frontend **no** habla con Supabase directamente (solo `/api/v1`), así que no se expone la anon-key. Correcto.
- **Acción recomendada:** usar **uno solo**. Si eliges Supabase (always-on, RLS), elimina `fromDatabase` de `render.yaml` y pon las `DB_*` como variables. Si eliges Render Postgres, actualiza los docs y quita Supabase. No mezcles ambos.

---

## 4. Resend (email) — ⚠️ CÓDIGO LISTO, FALTAN CREDENCIALES + PDF

- `app/Services/ResendService.php` usa la REST API de Resend correctamente (`POST https://api.resend.com/emails`).
- **Falta:**
  1. `RESEND_API_KEY` (ya añadida a `render.yaml` como `sync: false`).
  2. **Dominio verificado**: `MAIL_FROM_ADDRESS=onboarding@resend.dev` solo sirve en modo test. Para producción debes verificar `talonarioamigo.com` y usar `factura@talonarioamigo.com`.
  3. **Adjuntar PDF/XML**: el email hoy es solo notificación (sin RIDE). El método `enviarComprobante()` ya acepta `$pdfUrl`/`$xmlUrl`, pero el controlador no los pasa. Requiere un **enlace público firmado** para descargar el XML/PDF (el endpoint actual `/comprobantes/{clave}/xml` exige sesión).

> El adjunto (RIDE/PDF) es la brecha **C2** del informe de mejora — pendiente.

---

## 5. Supabase Storage (almacenamiento) — ✅ CONECTADO (REST API)

**Elección:** Supabase Storage en lugar de Cloudflare R2 (sin tarjeta, gratis 1 GB, mismo stack de Supabase).

**Cómo funciona ahora:**
- ✅ Nuevo `app/Services/SupabaseStorageService.php` sube/lee XML y PDF por la **REST API** de Supabase Storage (no requiere `league/flysystem-aws-s3-v3`).
- ✅ Cuando `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` están configuradas → escribe en Supabase; si no, o si falla → cae al disco local sin romper la emisión.
- ✅ El controlador de facturación ya usa `SupabaseStorageService` (se eliminó `R2StorageService`).
- ✅ `.env`, `.env.example` y `render.yaml` usan `SUPABASE_*`.

**Falta (tú):**
1. Obtener la **`SUPABASE_SERVICE_ROLE_KEY`** (Supabase → Settings → API → `service_role`). Va en `.env` (local) y en el panel de Render. NUNCA en el navegador.
2. Crear el bucket `talonario-amigo-vault` en Supabase → Storage → New bucket (privado).

---

## 6. CORS — ✅ RESTRINGIDO

`config/cors.php` lee `CORS_ALLOWED_ORIGINS` (sin `*` en producción). Orígenes en `.env.example` correctos.

---

## 7. Verificación de un vistazo

```bash
cd TALONARIOAMIGO
php artisan test                # 17 tests (incluye emisión end-to-end)
php artisan migrate --force     # en la BD elegida (Supabase o Render)
GET /api/health                 # → {"database":"active"}
GET /api/health/db              # → reporta resend_email / r2_vault según env
```

---

*Informe de auditoría. Los cambios de esta auditoría están commiteados en `feat(integraciones): conectar R2 + completar render.yaml + limpiar codigo muerto`.*
