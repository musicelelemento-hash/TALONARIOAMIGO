# ✅ Checklist "Listo para vender" — Talonario Amigo

> Estado verificado contra el código real (migraciones, seeders, tests, build).
> **Actualizado:** tests 17/17 ✅ · build ✅ · seed demo ✅ · README ✅ · "quitar el miedo" P0 aplicado · RLS + lazy-load de three.js/pdfjs aplicados → 2 brechas P0 reales restantes (no técnicas), 0 brechas P1 abiertas.
> Prioridades: **P0** = bloquea la venta · **P1** = antes de salir · **P2** = mejora.

---

## 1. Lo que ya está listo (verificado)

- ✅ **Producto funcional**: facturación SRI (XML v1.1.0, clave 49 dígitos, firma `.p12`, SOAP `cel.sri.gob.ec`), Laravel + `liberias_sri`.
- ✅ **Frontend SPA** (vanilla JS ES modules + Vite) — facturador, login/registro, onboarding, reseller, super admin, ticket térmico, OCR, voz, 3D.
- ✅ **Tests**: **17 pasan** — auth (login ok, password mala, cuenta suspendida, registro crea emisor, validación, 401), clave SRI, validadores RUC/cédula, mapeo IVA, healthcheck, **y emisión end-to-end con SOAP simulado** (`tests/Feature/EmissionTest.php`: emisor real + `.p12` real + librería mockeada → clave 49, autorización AUTORIZADO y persistencia de comprobante/ítems/cliente frecuente; + caso de rechazo DEVUELTA).
- ✅ **Build**: `npm run build` genera `public/dist` (vite, 149 módulos). `php artisan test` corre limpio.
- ✅ **DemoSeeder**: emisor Pruebas + 3 comprobantes + clientes, totales verificados, clave 49.
- ✅ **Documentación**: `README.md` (producto+quickstart+legal), `.env.example`, `GUIA_ARQUITECTURA_FREE.md`.
- ✅ **Landing con capturas reales**: `docs/landing.html` + `docs/capturas/app-login.png` y `landing.png` (capturadas con Edge headless desde la app construida). Incluye precio ($25/mes) y FAQ.
- ✅ **Diseño documentado**: `docs/DESIGN.md` (tokens v2 + principios "Realismo Táctil").
- ✅ **CORS restringido**: `config/cors.php` ahora lee `CORS_ALLOWED_ORIGINS` (sin `*` en producción).
- ✅ **Smoke test**: `scripts/smoke-test.ps1` (health + login + comprobantes; probado contra producción).
- ✅ **Guion de demo**: `docs/GUION_DEMO.md` (7 minutos, paso a paso + nota de emisión de prueba sin firma).
- ✅ **Resumen comercial para imprentas**: `docs/README_IMPRENTAS.md` (one-pager + mensaje listo para WhatsApp).
- ✅ **Guía Render paso a paso**: `docs/RENDER_SETUP.md` (servicio Docker, env vars, Supabase, seeds, verificación).
- ✅ **Aislamiento de datos en la app**: los controladores filtran por `emisor_id` / rol (`SUPER_ADMIN`, `RESELLER`, `CLIENT`) → cada usuario ve solo lo suyo.
- ✅ **"Quitar el miedo" (P0 de código aplicado)**: *Demo* renombrado a **Modo Práctica · no llega al SRI**; el botón principal ahora dice **"Emitir factura ahora"** (sin `XAdES-BES`); se eliminaron del flujo comerciante los botones "Centro de Mando (20 Agentes de Élite)" / "Panel Imprenta Aliada" y se suavizó la jerga de la landing (`zero-trust`, "agentes autónomos").
- ✅ **Botón "Ayúdame" (A5)**: botón flotante de WhatsApp en el mostrador → abre el soporte de la imprenta (o el número por defecto) con mensaje prellenado.
- ✅ **Code-split (P1-3)**: `three`/`pdfjs-dist`/`qrcode` en chunks separados; el núcleo de la app carga en ~244 KB.
- ✅ **Modo Tranquilo real (A1)**: wizard de 3 pasos (cliente → productos → revisar y emitir), un botón por pantalla y cero jerga. Deep-link `?demo=client&mode=tranquilo` para probarlo.
- ✅ **APK** Android empaquetado (`TalonarioAmigo_v1.1-offline.apk`).

---

## 2. Brechas P0 — bloquean vender (2)

| # | Brecha | Solución | Estado |
|---|---|---|---|
| P0-1 | **Contrato de licencia / términos comerciales.** Vender software fiscal sin contrato es riesgo. | EULA + política de privacidad + contrato de servicio. | ⬜ tuyo / abogado |
| P0-2 | **Demo pública desplegada** para mostrar a imprentas. | Instancia demo (Render + Supabase + seed demo) en `demo.talonarioamigo.com`. | ⬜ requiere credenciales |

> Nota: **no falta "RLS de base de datos" como P0**: el frontend **no habla con Supabase** (usa solo `/api/v1`), y la app ya aísla por `emisor_id`/rol. RLS en Postgres es *defensa en profundidad* (P1), útil solo si alguien usa la anon-key de Supabase por fuera del backend.

---

## 3. Brechas P1 — antes de salir

| # | Brecha | Solución |
|---|---|---|
| ~~P1-1~~ | ~~RLS Postgres~~ | ✅ **Hecho** — migración `enable_rls_defense_in_depth` activa RLS + política deny-all para `anon`/`authenticated` en las tablas multi-tenant (`emisores`, `comprobantes`, `comprobante_items`, `clientes_frecuentes`, `puntos_emision`, `reseller_packages`). Es no-op seguro si la base no es Supabase Postgres (detecta la ausencia de esos roles) — probado con los 17 tests en SQLite sin romper nada. |
| ~~P1-2~~ | ~~Tests de integración de la emisión~~ | ✅ **Hecho** — `tests/Feature/EmissionTest` (SOAP simulado). |
| ~~P1-3~~ | ~~Bundle frontend >1.2 MB~~ | ✅ **Hecho** — code-split (`manualChunks`) + ahora `three.js` y `pdfjs-dist` (OCR del certificado RUC) se cargan con `import()` dinámico: ya no se descargan en el arranque, solo si el usuario abre la vista 3D o sube un certificado. Carga inicial bajó de ~2.3 MB a ~287 KB (index+css+qrcode). |
| ~~P1-4~~ | ~~CI~~ | ✅ **Hecho** — `.github/workflows/ci.yml` (lint + build + phpunit) ya existe; se añadió la extensión `openssl` para el test de emisión. Falta solo `composer audit` (opcional). |
| ~~P1-5~~ | ~~Más capturas de la app~~ | ✅ **Hecho** — `docs/capturas/app-landing.png`, `app-facturador.png`, `app-tranquilo.png`, `app-3d.png` (Edge headless + deep-link `?demo=&mode=&view=3d`). Falta solo el ticket térmico. |

---

## 4. Lo que depende de TI (no técnico)

- **Precio** (pack 30/60/120 + modos Pro).
- **Facturación propia** para vender legalmente en Ecuador.
- **Asesoría legal tributaria** para EULA/contrato.
- **Canal**: 2–3 imprentas piloto + demo.

---

## 5. Orden sugerido

1. P0-1 (licencia) — abogado.
2. P0-2 (demo deploy) — con tus credenciales Render/Supabase.

> Todas las brechas P1 de código ya están resueltas (sección 3). Lo único que falta para vender es no técnico.
