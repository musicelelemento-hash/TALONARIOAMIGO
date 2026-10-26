# 🎬 Guion de demostración — 7 minutos para enamorar a una imprenta

> Objetivo: que la imprenta **vea, toque y crea** que Talonario Amigo vende solo.
> Regla de oro: **menos explicar, más mostrar**. La app hace el trabajo.

---

## Antes de empezar (checklist)

- [ ] Enlace de la app a mano: `https://talonarioamigo.com` (web) o el APK en el celular.
- [ ] Cuenta demo lista: **`demo@talonarioamigo.com` / `demo`** (el `DemoSeeder` la crea).
- [ ] Buena señal de internet **y** una prueba de "modo avión" por si preguntan.
- [ ] Tu celular con la app **abierta** antes de empezar (no busques nada en vivo).

---

## Parte 1 — La promesa (30 segundos)

> "No te voy a vender un ERP. Te voy a mostrar cómo **facturar se siente como tu talonario de toda la vida**. Sin aprender nada. ¿Me dejas mostrarte una factura en 20 segundos?"

Si dice "sí", seguí. Si pregunta precio, cortá: *"Al final te digo todo, primero mirá esto."*

---

## Parte 2 — Entrar y elegir el modo (1 minuto)

1. Abrí la app → **Ingresar**.
2. Ingresá con la cuenta demo.
3. Mostrá el **selector de modos**:
   - **Tranquilo** → "mirá: letra grande, un solo botón. Para el adulto mayor que tiene miedo a la computadora."
   - **Comerciante** → "esto es lo que usa una bodega: rápido, con dictado por voz."
   - **Pro** → "y esto, para el contador que maneja 3 locales."

> **Frase:** *"El mismo sistema, tres caras. Nadie se siente abrumado, nadie se va."*

---

## Parte 3 — Emitir una factura en vivo (2 minutos) ⭐

1. Andá a **Emitir factura**.
2. Cliente: elegí **Consumidor Final** (lo más rápido).
3. Agregá 2–3 productos tocando los chips (o dictálos por voz si querés el "wow").
4. Dejá que **los totales se calculen solos**: subtotal, IVA, total.
5. Tocá **Emitir**.

> **Frase mientras espera:** *"En 5 segundos ya tiene su clave de acceso y el SRI quedó."*

> 💡 **Nota (emisión de prueba sin firma real):** para la demo usá el ambiente **Pruebas** y, si no hay `.p12`, mostrá el **preview del XML** (la app lo genera sin firmar). El envío real al SRI requiere la firma `.p12` del cliente, que se sube en el onboarding. Así el cliente prueba todo el flujo **sin riesgo fiscal**.

---

## Parte 4 — El "wow" visual (1 minuto)

1. Mostrá el **RIDE / PDF** de la factura (papel marfil, elegante).
2. Mostrá el **ticket térmico 58mm/80mm** con el QR del SRI.
3. Si hay tiempo: el **talonario 3D** que se gira y despega.

> **Frase:** *"Esto es lo que le llega a tu cliente por WhatsApp. Se ve profesional, no como un sistema de los 90."*

---

## Parte 5 — El historial (1 minuto)

1. Abrí el **historial / tomos** (los comprobantes de ejemplo).
2. Tocá uno → mostrá XML y PDF descargables.

> **Frase:** *"Todo queda con su respaldo legal: XML y PDF por 7 años, listos para el contador."*

---

## Parte 6 — Tu lado: la imprenta (1 minuto)

1. Cerrá sesión y entrá al **panel de imprenta** (o mostrá el tuyo desde el inicio).
2. Mostrá: packs (30/60/120), cuentas activas, códigos de activación.

> **Frase:** *"Vos vendés packs de cuentas, ganás comisión, y el comerciante factura sin volver a llamarte. No sos un instalador de software, sos su proveedor."*

---

## Parte 7 — El cierre (30 segundos)

> "La cuenta cuesta **$25/mes todo incluido**. Por pack de imprenta baja. ¿Empezamos con un pack de 30 y lo probamos con 2 comerciantes?"

Tres opciones de cierre:
- **Sí** → "Te activo el pack hoy y te mando la guía de 1 página."
- **Lo pienso** → "Te dejo la cuenta demo y el video de 1 minuto por WhatsApp."
- **Me interesa pero es caro** → "Empezá con 1 cuenta a $25; si vende, sumás el pack."

---

## Frases clave (guion de palabras)

- *"No es un sistema contable. Es tu talonario, ahora inteligente."*
- *"Facturar en 5 segundos, sin errores, y el SRI ya quedó."*
- *"Funciona sin internet, pensado para el mostrador."*
- *"Nadie más hace que facturar se sienta familiar."*

---

## Nota técnica — "emisión de prueba sin firma real"

- La cuenta demo está en **ambiente Pruebas (1)** — sin efecto fiscal.
- Si no hay `.p12`: usá `/api/v1/facturacion/xml` (genera el XML sin firmar) para mostrar la estructura SRI.
- Para el envío real: el cliente sube su `.p12` en el onboarding y la app firma + envía a `cel.sri.gob.ec`.
- La app **no** corrige RUC/CUR/CIM, RIMPE ni IVA: la responsabilidad tributaria es del emisor.

> Si te piden facturar de verdad en la demo: pedí el `.p12` de Pruebas del cliente o usá un certificado de pruebas ecuatoriano.
