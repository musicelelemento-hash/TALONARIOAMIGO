# 🔌 GUÍA DE INTEGRACIÓN — LIBRERÍA COMPRADA + FRONTEND TALONARIO AMIGO

> **Objetivo:** dejar claro cómo el backend de facturación comprado se integra con el frontend que ya construimos, cómo correrlo y cómo probarlo de punta a punta.

---

## 1. 🎁 Qué es el backend comprado

**"Librería Firmador XML Facturación SRI Ecuador"** (`LibreriasSri\FacturacionElectronicaLibrary`).

Genera, firma (**XAdES-BES** con certificado `.p12`), envía y autoriza comprobantes electrónicos del **SRI Ecuador**:
`factura`, `comprobanteRetencion`, `guiaRemision`, `notaDebito`, `notaCredito`, `liquidacionCompra`.
También genera la clave de acceso, valida cédula/RUC y consulta autorización.

> **Dato clave:** el backend que ya venía en el proyecto (`TALONARIOAMIGO`) **usa esta librería comprada**. Su servicio `App\Services\FacturacionElectronicaLibrary` **hereda** de `LibreriasSri\FacturacionElectronicaLibrary`. No hay que "instalar nada nuevo": ya está integrado.

---

## 2. 🧩 Cadena de integración (confirmada)

```
Frontend (Vite SPA)                          Backend Laravel (TALONARIOAMIGO)         Libería comprada
─────────────────────────────────            ─────────────────────────────────        ─────────────────
Login → POST /v1/auth/login   ───────►        AuthController@login (Sanctum)            
Emitir → POST /v1/facturacion/emitir ──►     FacturacionElectronicaController          FacturacionElectronicaLibrary
  { cliente, items }                           · arma XML (infoTributaria/infoFactura/     · generarYFirmarXml
Panel Dueño → GET /v1/owner/dashboard          · firma con el .p12 del emisor logueado     · enviarSri
Panel Imprenta → GET /v1/reseller/dashboard    · envía y autoriza en el SRI               · autorizarSri
```

- **La librería nunca finge resultados** — si un paso falla, se devuelve el error real del SRI.
- El frontend manda datos *de negocio* (`{cliente, items}`); **el backend** los transforma al payload tributario que espera la librería (verificado contra `examples/facturacion/factura.json` y `CONTRATOS_PAYLOAD.md`).

---

## 3. 🔑 Cuentas de prueba (creadas por el seeder)

| Rol | Correo | Contraseña | Qué ve en la app |
|---|---|---|---|
| **SUPER_ADMIN** (Dueño) | `admin@talonarioamigo.com` | `TalonarioAmigo2026Master!` | Panel de control global (imprentas, lotes) |
| **RESELLER** (Imprenta) | `graficas.amazonas@imprenta.com` | `Imprenta123456!` | Panel de imprenta (cupo, clientes, WhatsApp) |

> ⚠️ Para probar **emitir una factura** se necesita una cuenta **CLIENT** con datos de emisor (RUC, razón social) y firma `.p12`. El seeder no crea clientes con esos datos. El flujo es: Dueño crea Imprenta → Imprenta crea Cliente → el Cliente inicia sesión y completa el onboarding (RUC + `.p12`).

---

## 4. ▶️ Cómo correrlo

### Backend (`TALONARIOAMIGO`)
```bash
cd TALONARIOAMIGO
composer install                 # instala dependencias (librería comprada incluida)
cp .env.production .env          # o crea .env con tu config real
php artisan key:generate
php artisan migrate --seed       # crea tablas + SUPER_ADMIN + imprenta
php artisan serve                # http://localhost:8000  (API bajo /api)
```

### Frontend (Vite, dentro de `TALONARIOAMIGO`)
```bash
cd TALONARIOAMIGO
npm install
npm run dev                      # SPA en http://localhost:5173 (apunta al API local:8000)
```
> El cliente `api.js` detecta `localhost` y usa `http://localhost:8000/api`; en producción usa `https://talonario-amigo-api.onrender.com/api`.

### Empaquetado (APK — Capacitor)
```bash
cd TALONARIOAMIGO
npm run build                    # genera public/dist
# en talonario-amigo-mobile: apuntar webDir/capacitor hacia public/dist y cap sync
```

---

## 5. ⚠️ Notas de configuración IMPORTANTES

1. **BD:** corregido — `render.yaml` ya inyecta `DB_CONNECTION=pgsql` (Postgres gestionado) y `.env.production` quedó alineado a `pgsql`. ⚠️ Render inyecta las variables del `render.yaml` por encima de `.env`, así que el `.env.production` es solo de referencia.
2. **`APP_KEY`:** corregido — se añadió a `render.yaml` (era **crítico**: sin ella Sanctum/sesiones rompen el login). Ya hay una generada (cámbiala por una propia al desplegar).
3. **`FACTURACION_*`:** añadidas a `render.yaml` y `.env.production` (`AMBIENTE`, `SOAP_TIMEOUT`, `CA_FILE`). El `.p12` de la emisión se toma del **emisor logueado**, no de estas variables.
3. **Certificado `.p12`:** el pipeline de emisión usa el `.p12` del **emisor logueado** (subido en su onboarding), no uno global.
4. **`vendor/`:** no está en el repo de `TALONARIOAMIGO` → hay que `composer install`.

---

## 6. 📁 Mapa de archivos clave

| Ruta | Qué es |
|---|---|
| `TALONARIOAMIGO/liberias_sri/` | **Librería comprada** (namespace `LibreriasSri`) |
| `TALONARIOAMIGO/app/Services/FacturacionElectronicaLibrary.php` | Adapter Laravel → hereda la librería |
| `TALONARIOAMIGO/config/services.php` | Mapping `FACTURACION_*` |
| `TALONARIOAMIGO/routes/api.php` | Endpoints `/v1/*` |
| `TALONARIOAMIGO/database/seeders/SuperAdminSeeder.php` | Crea SUPER_ADMIN + imprenta |
| `TALONARIOAMIGO/resources/js/*` | Frontend SPA modular + design system |
| `TALONARIOAMIGO/public/dist/` | Build del frontend |
| `Nueva carpeta/Talonario Amigo proyecto APP, WEB/talonario-amigo-app/` | **Copia original completa** (con `vendor`, `docs`, `examples`, `tests`) |

---

## 7. ✅ Integración verificada
- El adapter extiende la librería comprada (mismos namespace/métodos).
- Los 8 métodos que llama el backend (`generarYFirmarXml`, `enviarSri`, `autorizarSri`, `tiposSoportados`, `generarClaveAcceso`, `validarIdentificacion`, `generarXml`, `firmarXml`) **existen** en el SDK.
- El payload que arma `emitirFactura` coincide con `factura.json` / `CONTRATOS_PAYLOAD.md`.
- Autoload de Composer mapea `LibreriasSri\` → `liberias_sri/`.

---

*Guía de integración del backend de facturación SRI comprado con el frontend Talonario Amigo.*
