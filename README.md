# 🧾 Talonario Amigo

> **La tranquilidad de seguir usando tu talonario de toda la vida.**
>
> Facturación electrónica del SRI (Ecuador) que se siente como tu talonario de papel:
> familiar, táctil y sin complicaciones.

---

## ¿Qué es?

**Talonario Amigo** convierte el trámite frío de la facturación electrónica del SRI Ecuador
en una experiencia **cálida y familiar** para el comerciante y el adulto mayor.
El usuario no tiene que aprender nada nuevo: **sigue usando su talonario de siempre**, pero
ahora se autocompleta, se firma solo y cumple con el SRI en segundos.

- **Para el adulto mayor:** *"No tienes que aprender nada. Es tu talonario, ahora más fácil."*
- **Para el pequeño comercio:** *"Emites una factura en segundos, sin errores, y el SRI ya quedó."*
- **Para el contador / multipunto:** *"Toda tu operación en un lugar, con reportes reales."*

---

## Características

- 🧾 **Facturación electrónica SRI** — XML v1.1.0, clave de acceso de 49 dígitos, firma `.p12` (XAdES-BES), envío SOAP a `cel.sri.gob.ec`.
- 🎨 **Experiencia "Realismo Táctil"** — el talonario de papel Marfil con copia azul, animación 3D y estética sobria (Apple + Linear + Stripe).
- 🎛️ **Sistema de Modos** — Tranquilo (adulto mayor), Comerciante (bodega), Pro (contador/multipunto).
- 🎙️ **Dictado por voz** y autocompletado de clientes.
- 📄 **RIDE/PDF** y ticket térmico 58mm/80mm con QR oficial.
- 📲 **APK Android** (Capacitor) — la "estrella" en el mostrador.
- 🏭 **Red de imprentas (B2B)** — cuentas maestras, packs de 30/60/120 licencias y activación.
- ☁️ **100% cloud gratuito** hasta que el tráfico lo exija (Cloudflare Pages + Render + Supabase + R2).

---

## Arquitectura

| Capa | Tecnología | Rol |
|---|---|---|
| Frontend SPA | React + Vite | UI, momento 3D, PWA |
| Móvil | Capacitor | APK Android |
| Backend API | Laravel (Render) | Facturación SRI, firma, emisión |
| Base de datos | Supabase Postgres | Datos, RLS por rol |
| Almacenamiento | Cloudflare R2 | Bóveda de `.p12` y exportaciones |
| Edge | Cloudflare Pages + Worker | Sirve la SPA + keep-alive de Render |

---

## Inicio rápido (demo local, 2 minutos)

Requisitos: **PHP 8.1+**, **Composer**, **Node 18+**.

```bash
cd TALONARIOAMIGO
cp .env.example .env        # Windows: copy .env.example .env
php artisan key:generate

# Base de datos local con SQLite (rápido, sin instalar Postgres)
php artisan migrate --force
php artisan db:seed --class=DemoSeeder --force
```

> **Datos de demostración:** el `DemoSeeder` crea un emisor de Pruebas con 3 comprobantes
> de ejemplo (historial y clientes frecuentes). Nada de esto afecta al SRI real:
> todo queda en `ambiente = 1 (Pruebas)`.

**Credenciales demo:**

| Usuario | Contraseña |
|---|---|
| `demo@talonarioamigo.com` | `demo` |

> El `DemoSeeder` es **opcional** y **separado** del seeder de producción. En producción ejecuta
> solo `php artisan db:seed` (crea SUPER_ADMIN + imprenta desde las variables `SEED_*`).

### Cuenta maestra (producción)

Define en `.env`:

```bash
SEED_SUPERADMIN_EMAIL=tu-correo@dominio.com
SEED_SUPERADMIN_PASSWORD=una-clave-fuerte
SEED_RESELLER_EMAIL=imprenta@dominio.com
SEED_RESELLER_PASSWORD=otra-clave-fuerte
```

y ejecuta `php artisan db:seed`.

---

## Despliegue

Sigue **_[GUIA_ARQUITECTURA_FREE.md](GUIA_ARQUITECTURA_FREE.md)_**:

1. **Frontend** → Cloudflare Pages (`npm run build` → `public/dist`).
2. **API** → Render (Docker + `render.yaml`), con keep-alive Worker.
3. **Base de datos** → Supabase Postgres (migraciones + RLS).
4. **Archivos** → Cloudflare R2.

El techo real de costo llega cuando Render free duerme (~$7/mes el primer paso).

---

## Modelo de negocio (B2B · Imprentas)

- **Cuenta maestra** (imprenta) → vende **packs de 30 / 60 / 120 cuentas**.
- **Activación unitaria** con clave; la imprenta va liberando.
- **Super admin** gestiona imprentas, ventas y kill switch.
- **Ingresos:** packs B2B, desbloqueos (Pro, branding, multi-sucursal, reportes), suscripción.

---

## ⚠️ Aviso legal (importante antes de vender)

Talonario Amigo es una **herramienta de apoyo** a la facturación electrónica. **No** es un
certificador fiscal y **no corrige** RUC/CUR/CIM, RIMPE ni tasas del IVA por ti.
**La responsabilidad tributaria del comprobante es siempre del emisor.**

Al comercializar el producto debes mostrar este aviso de forma visible y, idealmente,
incluir un contrato de licencia que lo refleje.

---

## Estructura del repositorio

```
Talonario Amigo/
├── TALONARIOAMIGO/          # Backend Laravel + SPA React (Vite)
│   ├── app/                 # Controladores, servicios, middleware
│   ├── liberias_sri/        # Librería firmadora / facturación SRI
│   ├── database/            # Migraciones + seeders (incl. DemoSeeder)
│   ├── resources/           # Frontend React (componentes + servicios)
│   └── routes/api.php       # API REST (auth, facturación, reseller, owner)
├── talonario-amigo-mobile/  # App Android (Capacitor)
├── talonario-amigo-desktop/ # App de escritorio (Electron)
├── cloudflare/              # Worker keep-alive
└── GUIA_ARQUITECTURA_FREE.md
```

---

## Licencia / uso comercial

Este repositorio es **privado y comercial**. No redistribuir sin autorización del autor.
