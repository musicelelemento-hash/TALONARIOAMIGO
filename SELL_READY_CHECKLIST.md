# ✅ Checklist "Listo para vender" — Talonario Amigo

> Estado verificado contra el código real (migraciones, seeders, tests, build).
> **Actualizado:** tests 15/15 ✅ · build ✅ · seed demo ✅ · README ✅ → 2 brechas P0 reales.
> Prioridades: **P0** = bloquea la venta · **P1** = antes de salir · **P2** = mejora.

---

## 1. Lo que ya está listo (verificado)

- ✅ **Producto funcional**: facturación SRI (XML v1.1.0, clave 49 dígitos, firma `.p12`, SOAP `cel.sri.gob.ec`), Laravel + `liberias_sri`.
- ✅ **Frontend SPA** (vanilla JS ES modules + Vite) — facturador, login/registro, onboarding, reseller, super admin, ticket térmico, OCR, voz, 3D.
- ✅ **Tests**: **15 pasan** — auth (login ok, password mala, cuenta suspendida, registro crea emisor, validación, 401), clave SRI, validadores RUC/cédula, mapeo IVA, healthcheck.
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
| P1-1 | **RLS Postgres** (defensa en profundidad) si se expone Supabase REST. | Políticas + rol no-owner; opcional. |
| P1-2 | **Tests de integración de la emisión** (mock SOAP de `cel.sri.gob.ec`). | `tests/Feature/EmissionTest` con HTTP fake. |
| P1-3 | Bundle frontend >1.2 MB (three.js + tesseract). | Code-split (`manualChunks`). |
| P1-4 | Verificar `composer install` completo (dev deps) y `composer audit`. | CI simple. |
| P1-5 | Más capturas de la app (facturador, modo tranquilo, 3D, ticket). | Script de captura con Edge headless + login demo. |

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
3. P1-1 (capturas) → venta piloto.
4. P1-4/P1-5 (calidad/bundle) — mejora continua.
