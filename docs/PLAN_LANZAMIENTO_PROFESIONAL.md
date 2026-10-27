# 🚀 Plan de lanzamiento profesional — Talonario Amigo

> **Objetivo:** pasar de "proyecto funcional" a **producto vendible y confiable**, sin quemar presupuesto.
> **Fecha:** 2026-10-27 · **Estado:** código P0 "quitar el miedo" aplicado y verificado (build ✅ + 17 tests ✅).

---

## 1. Dónde estás hoy (verificado)

| Área | Estado |
|---|---|
| Emisión SRI real (XML v1.1.0, clave 49, firma `.p12`, SOAP) | ✅ Backend completo |
| Emisión end-to-end probada (SOAP simulado) | ✅ **Nuevo** `tests/Feature/EmissionTest.php` (17/17 tests) |
| Frontend SPA + PWA + APK + Electron | ✅ |
| "Quitar el miedo" (Demo→Modo Práctica, sin jerga, sin botones de rol) | ✅ **Aplicado hoy** |
| Build de producción | ✅ `npm run build` limpio |
| Demo pública desplegada | ❌ **P0 (necesita tus credenciales)** |
| EULA / contrato / privacidad | ❌ **P0 (necesita abogado)** |

**Conclusión:** el producto técnicamente está listo. Lo que **bloquea vender** ya no es código: es **legal + demo pública + canal**. Eso es lo que desbloquea este plan.

---

## 2. Las 2 brechas P0 que bloquean vender

### P0-1 · Legal (imprescindible, no técnico)
Vender software fiscal sin contrato es riesgo tributario y de reputación. Necesitas, mínimo:

1. **Términos y condiciones / EULA** — licencia de uso, sin garantía de resultados fiscales, responsabilidad del emisor.
2. **Política de privacidad** — qué datos guardas (RUC, cédulas, `.p12`), dónde (R2 cifrado), y que no compartes.
3. **Aviso legal visible** (ya redactado en `README.md`) dentro de la app y en la landing.

> **Acción:** encarga una plantilla a un abogado tributario ecuatoriano (~1-2 días de trabajo). No uses plantillas genéricas: el SRI y la Ley de Protección de Datos (LOPDP Ecuador) tienen requisitos específicos.

### P0-2 · Demo pública desplegada
Las imprentas piloto pedirán "déjame verlo funcionando". Sin demo, no vendes.

1. Crea una instancia **Render + Supabase** (guía paso a paso: `docs/RENDER_SETUP.md`).
2. Semillas el `DemoSeeder` (emisor de Pruebas + 3 comprobantes) → **nada toca el SRI real**.
3. Apunta `demo.talonarioamigo.com` (o subdominio de Cloudflare Pages).
4. Verifica con `scripts/smoke-test.ps1`.

> **Acción:** ~2-3 horas con tus credenciales de Render/Supabase/Cloudflare. Es la inversión de marketing con mayor retorno.

---

## 3. Secuencia de lanzamiento (90 días)

### Semanas 1–2 · Legal + demo
- [ ] Contratar plantilla EULA + privacidad (abogado).
- [ ] Publicar demo pública con `DemoSeeder`.
- [ ] Landing con precio, FAQ y **aviso legal visible**.

### Semanas 3–4 · Beta con 2 imprentas piloto
- [ ] Elegir 2 imprentas aliadas reales (ya tienes guion de demo: `docs/GUION_DEMO.md`).
- [ ] Alta asistida: **la imprenta configura RUC + firma `.p12`**, el comerciante solo recibe "Tu talonario está listo".
- [ ] Medir: % que emite su primera factura real en 24 h (meta ≥ 60 %).

### Semanas 5–8 · El comprobante que se reenvía
- [ ] **Comprobante compartible** (imagen/PDF con logo + QR + "Hecho con Talonario Amigo") — es el canal de viralidad.
- [ ] RIDE/PDF real + envío por WhatsApp/email (Resend ya está en backend).
- [ ] Clientes frecuentes reales desde historial.

### Semanas 9–12 · Crecer solo
- [ ] Referidos ("Trae a tu amigo comerciante").
- [ ] Kit de contenido para imprentas (video 15 s + textos WhatsApp + carrusel).
- [ ] Offline honesto + reporte mensual para contador.

---

## 4. Precio y empaquetado (sugerido)

| Producto | Público | Precio | Nota |
|---|---|---|---|
| Cuenta comerciante | Usuario final (vía imprenta) | $25/mes | La imprenta revende con margen |
| Pack imprenta 30 / 60 / 120 | Imprenta B2B | $12/cliente (costo) | Margen ~52 % revendiendo a $25 |
| Unlockables | Pro, branding, multi-sucursal, reportes | $ variable | Ingreso incremental |

> La cuenta maestra (imprenta) ya está implementada (`ResellerPanel` + `ResellerController`). La monetización es configurar precios, no construir.

---

## 5. Fiscal y cumplimiento (Ecuador)

1. **Tú también necesitas facturar** para vender legalmente (emitir factura a las imprentas).
2. **Aviso legal**: Talonario Amigo es herramienta de apoyo; **no** corrige RUC/RIMPE/IVA; la responsabilidad tributaria es del emisor.
3. **Retención 7 años** de XML firmado + RIDE (política de respaldo en R2).
4. **LOPDP**: dato personal (cédulas) mínimo necesario + consentimiento en el registro.

---

## 6. Métricas de éxito (revisar cada semana)

**North Star:** facturas **reales** emitidas por usuarios activos por semana.

| Métrica | Meta |
|---|---|
| Activación (1ª factura real en 24 h) | ≥ 60 % |
| Retención D7 / D30 | ≥ 40 % / ≥ 25 % |
| Práctica → real en 7 días | ≥ 35 % |
| Viral K (shares × conversión) | ≥ 0.3 |
| Soporte (tickets / 100 usuarios / mes) | ≤ 8 |

---

## 7. Lo que sigue en código (P1, ya priorizado)

1. **P1-3 · Code-split** del bundle (> 1.2 MB por three.js + tesseract) → cargar 3D/OCR bajo demanda (celular barato = "no carga" = miedo).
2. **P1-4 · CI** simple (GitHub Actions): `composer install` + `php artisan test` + `npm run build` en cada PR.
3. **A1 · Modo Tranquilo real** (wizard de 3 pasos, un botón por pantalla) — hoy es solo CSS.
4. **A5 · Botón "Ayúdame"** WhatsApp contextual en todas las pantallas.
5. **P1-1 · RLS Postgres** (defensa en profundidad si alguien expone Supabase REST por fuera del backend).

---

## 8. Lo que NO hacer (para no romper lo que funciona)

- No agregar más paneles técnicos al flujo comerciante.
- No reemplazar la metáfora del papel (marfil + copia azul es el activo emocional).
- No ocultar el estado de práctica (es la red de seguridad).
- No medir éxito en descargas: **medir en facturas reales emitidas**.

---

*Playbook de lanzamiento. Los archivos técnicos referenciados (`RENDER_SETUP.md`, `GUION_DEMO.md`, `README_IMPRENTAS.md`, `GUIA_ARQUITECTURA_FREE.md`) existen en `docs/` y en la raíz del repo.*
