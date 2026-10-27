# 📘 Informe de mejora — Talonario Amigo

> **Objetivo del informe:** mejorar el proyecto para lograr **éxito real (adopción), viralidad, utilidad y funcionalidad para personas que se complican con el cambio** — en especial el comerciante adulto y el adulto mayor.
>
> **Base analizada:** repositorio actual (`64121d5`), SPA Vite + Laravel + Supabase + R2 + Capacitor + Cloudflare.
> **Fecha:** documento vivo, se actualiza con cada decisión de producto.

---

## 0. Resumen ejecutivo (léelo si no tienes tiempo)

**Veredicto:** Talonario Amigo tiene el **"qué"** (facturación SRI real, firma `.p12`, envío SOAP, copia azul, tomos, ticket térmico, 3D, voz, OCR) y una **visión correcta** ("vendemos tranquilidad"). Pero el **"cómo se siente" está de cabeza para su público objetivo**: la app está diseñada como un *cockpit de técnico* y, por defecto, abre en **Modo Demostración** con la frase *"DEMO EN VIVO"*. Para la persona que le teme al cambio, eso no es una bienvenida: es una advertencia de que esto no es "su talonario".

**La tesis central de este informe:**

> **Para la persona que se complica con el cambio, el enemigo no es la tecnología: es la consecuencia.** Miedo a "dañar algo", a equivocarse frente al SRI, a que le digan *"usted rompió la factura"*. La app hoy le muestra 20 agentes, roles, siglas (`XAdES-BES`, `SOAP`) y un teclado de botones. Debería mostrarle **una sola hoja y un solo botón**, con la garantía de que "si te equivocas, se deshace".

**Seis movimientos que más mueven la aguja** (detallados en el §4):

| # | Movimiento | Pilar | Esfuerzo | Impacto |
|---|---|---|---|---|
| 1 | **Modo Tranquilo real** (wizard de 3 pasos, un botón por pantalla, 0 jerga) — hoy es solo CSS | Adopción | M | 🔥🔥🔥 |
| 2 | **Modo Práctica permanente + red de seguridad** ("no pasa nada" visible siempre) | Adopción | S | 🔥🔥🔥 |
| 3 | **Comprobante compartible como unidad viral** (imagen/PDF con marca + QR) | Viralidad | M | 🔥🔥🔥 |
| 4 | **Emisión real probada end-to-end** (test con SOAP simulado + RIDE/PDF real) | Utilidad | M | 🔥🔥🔥 |
| 5 | **"Necesito ayuda" → WhatsApp humano de la imprenta** (human-in-the-loop) | Adopción | S | 🔥🔥 |
| 6 | **Programa "Trae a tu amigo comerciante"** + kit de contenido para imprentas | Viralidad | S–M | 🔥🔥 |

**Regla de oro que debe gobernar todo el producto a partir de ahora:**

> **Un camino. Un botón. Un paso.** Si la "prueba de la abuela" (una persona de 70 años que nunca usó este sistema, sin ayuda, emite una factura en ≤ 60 segundos) no pasa, el diseño no está terminado.

---

## 1. Radiografía del producto hoy (estado verificado contra código)

| Módulo | Estado | Evidencia |
|---|---|---|
| Emisión SRI real (XML v1.1.0, clave 49, firma `.p12`, SOAP `cel.sri.gob.ec`) | ✅ Backend completo | `FacturacionElectronicaController::emitirFactura`, `FacturacionElectronicaService` |
| Persistencia + diagnóstico inteligente de errores SRI | ✅ Real | `InvoiceValidationService`, guardado en `Comprobante` |
| Envío automático por email (Resend) | ⚠️ Existe en backend, no se ve en la app | `ResendService::enviarComprobante` (sin PDF/RIDE adjunto) |
| RIDE / PDF del comprobante | ❌ No existe generación | Solo se leen PDFs del SRI (`sriPdf.js`), no se generan |
| Demo interactiva (comerciante/imprenta/admin) | ✅ Simulada, **por defecto** | `AppManager` constructor: `isDemoMode: true` |
| Cola offline | ⚠️ Básica (localStorage, reintento al volver online) | `offlineQueue.js` |
| Dictado por voz | ⚠️ Web Speech API (depende del navegador) | `voiceDictation.js` |
| OCR de cédula/RUC/proforma | ⚠️ Parcial (pdfjs para RUC; escaneo de imagen en `gravityScanner.js`) | revisar precisión real |
| Ticket térmico 58/80 mm | ✅ Print CSS real | `ThermalTicket.js` |
| Experiencia 3D (three.js) | ✅ Real pero pesada (bundle > 1.2 MB) | `Talonario3DExperience.js` |
| Modos Tranquilo / Comerciante / Pro | ⚠️ **El modo Tranquilo es solo cosmético** (fuente más grande + saludo) | `style.css` líneas 2906–2928 |
| Panel super admin / imprentas | ✅ Real (dashboard vía API) | `SuperAdminPanel.js`, `ResellerPanel.js` |
| APK Android (Capacitor) | ⚠️ Shell preconstruido; requiere `sync` + release firmado | `talonario-amigo-mobile/` |
| Prueba "lista para vender" | ❌ Faltan 2 P0: EULA/contrato y demo pública desplegada | `SELL_READY_CHECKLIST.md` |

**Conclusión de la radiografía:** hay más producto del que aparenta. El problema **no es que falte motor; es que el motor está a la vista del usuario.** La mejora no consiste en agregar funcionalidades, sino en **esconder las que no debe ver el usuario Tranquilo** y en **cerrar el último tramo de la emisión real** (que es el corazón de la promesa).

---

## 2. El usuario que "se complica con el cambio" (y por qué es el mercado correcto)

### 2.1 Tres personas reales

| Persona | Contexto | Lo que la frena | Lo que la mueve |
|---|---|---|---|
| **Don Paco, 61** — abarrotes de barrio, RIMPE | Factura con talonario de papel desde 1998; hijos le ayudan "con el sistema" | Miedo a equivocarse y que el SRI lo multen; vergüenza de llamar a soporte por "tonteras" | Que su vecino le diga *"yo lo uso y no me demoro nada"* |
| **Doña Rosa, 67** — feria / mercado | Nunca usa computadora; el celular es WhatsApp | "Esto no es para mí"; letras chiquitas; miedo a tocar un botón verde que no conoce | Que **la imprenta se lo deje instalado y configurado**, y que alguien conteste el WhatsApp |
| **El contador / hijo "informático"** — 30s | Es el que resuelve en la familia | Que la herramienta no le genere más trabajo | Reportes limpios, XML/PDF descargables, backup |

**Consecuencia de producto:** el comprador es el comerciante, pero **el "operador" muchas veces es el hijo/contador de la familia**. La app debe ser tan simple que el operador *parezca un héroe* y no un "soporte permanente".

### 2.2 Los seis miedos y su antídoto

| Miedo | Señal que hoy se da | Antídoto de producto |
|---|---|---|
| **1. "Voy a dañar algo"** | `Modo Real SRI` y advertencia roja de firma | "Modo Práctica" visible siempre, con *"Nada de aquí llega al SRI. Puedes equivocarte mil veces."* |
| **2. "Me van a multar"** | Jerga fiscal (`XAdES-BES`, `clave de acceso`) | Traducir todo: *"El SRI ya confirmó tu factura ✓"* |
| **3. "No sé qué tocar"** | Pantalla con 30+ controles | Un solo botón primario por pantalla; los demás en "Avanzado" |
| **4. "Si lo hago mal, no hay vuelta"** | No hay undo | "Deshacer" siempre disponible; comprobante emitido se puede anular con un botón ("Anular y repetir") |
| **5. "Me van a pedir datos / me van a robar"** | Formularios de registro largos | "No pedimos tarjeta", "tus datos son tuyos", firma protegida en bóveda |
| **6. "Nadie me va a ayudar"** | Soporte escondido | Botón 💬 **"Ayúdame"** en cada pantalla → WhatsApp de la imprenta / del hijo registrado |

### 2.3 Estrategia de "no cambio" (la paradoja del producto)

La app ya acierta en el concepto más valioso: **la copia azul autocopiativa**. Es el puente emocional perfecto: el usuario ve el objeto que conoce (papel marfil + copia azul) y "entiende" que el sistema hace lo mismo que su talonario. **Hay que potenciarlo, no diluirlo.**

Reglas de diseño para este público (las 10 que deben quedar escritas en el `DESIGN.md`):

1. **Primera pantalla = su talonario, no el dashboard.** Nada de métricas, nada de "20 agentes".
2. **Una acción primaria por pantalla.** Tamaño físico objetivo ≥ 48 px; texto ≥ 17–18 px en móvil.
3. **Todo lo que se puede romper, se puede deshacer** (y se avisa).
4. **Siempre un humano a un toque de distancia** (WhatsApp).
5. **Cero jerga** en el flujo principal (jerga solo en "Modo Pro").
6. **Confirmación triple**: el usuario **ve** (sello verde), **oye** (sonido de sello), **siente** (vibración). Se puede apagar el sonido, nunca el "ver".
7. **Práctica primero, real después**: la primera emisión es *siempre* en práctica.
8. **La imprenta hace el onboarding** (instala, configura RUC y firma en 3 minutos, deja la cuenta lista).
9. **Nada de "crear cuenta y pagar" el primer día** para el adulto mayor: primero prueba, luego paga.
10. **WhatsApp es la puerta**: compartir por WhatsApp debe funcionar con un toque y verse impecable.

---

## 3. La paradoja actual: dónde se pierde al usuario (evidencia en código)

Cada uno de estos puntos es una **salida de emergencia emocional** para alguien que le teme al cambio. Hoy están todos abiertos:

1. **La app abre en `isDemoMode: true`** (`AppManager.js:50`) con cinta *"DEMO EN VIVO"* y botones "Salir al Portal", "Crear Cuenta Real". El adulto mayor no entiende "Demo": entiende *"esto no es lo mío, es una prueba"*.
2. **El usuario comercial ve el switcher de roles** (`setRole('SUPER_ADMIN')`, `setRole('RESELLER')` al pie del facturador, `FacturadorRealista.js:513-521`). Un comerciante viendo "Centro de Mando (20 Agentes de Élite)" concluye: *"esto es para ingenieros"*.
3. **El botón principal dice `FIRMAR Y EMITIR AL SRI (XAdES-BES)`** `FacturadorRealista.js:497`. La sigla no dice nada y da miedo. Debería decir **"📤 Emitir factura"**.
4. **El Modo Tranquilo solo agranda la letra** (`style.css:2906-2928`, `font-size: 14/17/40px` + saludo). **No elimina campos** (Guía, Correo, RUC, "Consumidor Final" doble, chips…). Un modo para el adulto mayor que le muestra 4 campos opcionales y 14 botones no es un modo: es la misma app con zoom.
5. **Modo Práctica vs. Modo Real coexisten en la misma pantalla** sin elección guiada: el usuario puede aterrizar en Real sin firma y ver una barra roja de alarma (más miedo).
6. **`"Guía"`** en los datos del cliente: nadie de este público sabe qué es. Campo a eliminar del flujo Tranquilo/Comerciante.
7. **"Dictar Cliente", "Foto Cédula / RUC", "Foto / Proforma", "Consumidor Final" y "Dictar Productos" compiten en la misma vista**: cinco caminos al mismo dato. Para este público, cinco caminos = ninguno.
8. **La app está pensada para tablet/mostrador** (layout de consola ancha), pero **la persona que le teme al cambio vive en el celular**. La PWA está en `resources/public/manifest.webmanifest` pero no hay flujo de "instalar en el teléfono" en 1 toque dentro de la app.
9. **El registro pide RUC, razón social, dirección, régimen, `.p12` y contraseña** antes de saber si vale la pena (`RegisterScreen.js`). Para este público, el registro debe ser con la imprenta al lado.
10. **Los errores se muestran como toasts técnicos** (`showToast(e.message)`), no como *"qué hago ahora"* con un botón que resuelve.

**Regla de poda propuesta (la "cura de silencio"):**

> Todo lo que no sea (a) llenar la hoja, (b) emitir, (c) recibir confirmación, (d) compartir, **sale del flujo CLIENT** y vive en un menú "⚙ Avanzado" que el usuario normal nunca abre.

---

## 4. Los tres pilares de mejora

### 4.1 Pilar A — Adopción sin trauma (vencer el miedo, no enseñar software)

| # | Iniciativa | Qué se hace | Evidencia / punto de partida | Criterio de aceptación |
|---|---|---|---|---|
| A1 | **Modo Tranquilo de verdad** | Wizard de 3 pasos máximo: (1) cliente (con "Consumidor Final" preseleccionado), (2) productos, (3) revisar y emitir. Ocultar Guía, Correo, RUC avanzados, chips y utilidades detrás de "Avanzado". Botón único gigante por paso. | Hoy solo CSS (`style.css:2906`) | La "prueba de la abuela": emitir en ≤ 60 s, ≤ 4 toques desde la hoja |
| A2 | **Modo Práctica permanente** | Renombrar "Demo" → **"Modo Práctica"**; mantenerlo visible pero como *red de seguridad*: "Todo lo de aquí es de mentira, no llegó al SRI". Primera sesión SIEMPRE en práctica. | `isDemoMode: true` ya existe; el rótulo es lo que falla | El usuario entiende sin explicación qué es práctica y qué es real |
| A3 | **Cero jerga en flujo principal** | Diccionario de traducción (tabla abajo). El sello pasa de `✓ AUTORIZADO SRI` + clave 49 dígitos a **"✅ El SRI ya confirmó tu factura"** con "ver comprobante". | `FacturadorRealista.js:238-241`, `:497` | 0 siglas visibles en CLIENT (audit de strings) |
| A4 | **Confirmación triple + deshacer** | Sello verde animado + sonido de sello + vibración; "Deshacer/Anular comprobante" visible 60 s tras emitir. | `executeEmit3DSequence`, `soundFx` ya existen; falta "anular" | Prueba con 5 adultos: 5/5 entienden qué pasó tras emitir |
| A5 | **Botón "Ayúdame" siempre** | Botón flotante 💬 que abre WhatsApp de la imprenta/hijo con mensaje prellenado (contexto: pantalla actual). | `supportWhatsapp` ya existe en state | ≤ 1 toque para pedir ayuda humana desde cualquier pantalla |
| A6 | **Teléfono primero (PWA real)** | PWA instalable (ya tiene `sw.js`/manifest) con banner de "Agregar a pantalla de inicio"; reordenar layout móvil; targets de 48 px. | `resources/public/manifest.webmanifest`, `sw.js` | Lighthouse PWA passing; app usable en Android de 4.7" sin zoom |
| A7 | **Onboarding asistido por la imprenta** | Flujo de "alta asistida": la imprenta crea la cuenta desde su panel, deja RUC + régimen + firma ya cargados; el comerciante recibe WhatsApp *"Tu talonario está listo"* y solo pone su clave. | `ResellerController::createClient` ya existe | Onboarding ≤ 3 min con la imprenta presente |
| A8 | **Lenguaje de la app = lenguaje del barrio** | Cambiar el copy: "Talonario", "Hoja", "Copia", "Cliente de siempre", "Producto", "Total a cobrar". | Copys actuales "Tactile", "Agentes", "XAdES" | Revisión con 3 usuarios finales reales |

**Tabla de traducción (para A3):**

| Hoy dice | Debería decir |
|---|---|
| `FIRMAR Y EMITIR AL SRI (XAdES-BES)` | `Emitir factura ahora` (o `Listo, emitir`) |
| `✓ AUTORIZADO SRI / CLAVE ACCESO: 2807202601...` | `✅ El SRI ya confirmó tu factura` + `ver detalle` |
| `Clave de Acceso` (49 dígitos) | `Código de seguridad` (mostrar solo en "Avanzado") |
| `RUC / CI` | `Número del cliente (RUC o cédula)` |
| `Cliente Frecuente chip` | `Cliente de siempre` |
| `SRI envío / SOAP / XML` | *(ocultar del usuario; solo en "Avanzado")* |
| `Modo Demostración / DEMO EN VIVO` | `Modo Práctica · no llega al SRI` |

### 4.2 Pilar B — Viralidad: el comprobante es el anuncio

La viralidad no vendrá de la app, sino de **cada factura que el comerciante manda a su cliente por WhatsApp**. Esa factura llega a un cliente, y el cliente es otro comerciante, o un familiar, o el vecino. **El comprobante debe ser tan lindo que se reenvíe solo.**

| # | Iniciativa | Qué se hace | Impacto |
|---|---|---|---|
| B1 | **Comprobante compartible de lujo** | Generar un **PNG/PDF con canvas** (no solo texto): logo del negocio + talonario + sello verde + QR de verificación SRI + pie discreto *"Talonario Amigo · hecho a mano digital"*. Un botón "Compartir por WhatsApp". | 🔥🔥🔥 El loop central |
| B2 | **Programa "Trae a un amigo comerciante"** | Código de referido por comerciante y por imprenta: 1 mes gratis para quien refiere y 50% para el nuevo (o 3 meses en pack). Medir K-factor. | 🔥🔥 |
| B3 | **Kit de contenido para imprentas** | Cada imprenta recibe: video 15 s (antes/después), carrusel de 6 slides, texto listo para WhatsApp del barrio, guion TikTok. *Ellas* son el ejército de distribución. | 🔥🔥 |
| B4 | **Contenido "el que no sabe usar computadora"** | Serie TikTok/Reels: "mi papá, 68, nunca usó una app" → factura en 7 s. "El contador que ya no llama". "Antes: 5 minutos con talonario. Hoy: 7 segundos." Con audio real y cara real. | 🔥🔥 |
| B5 | **SEO local** | Landings por ciudad ("factura electrónica Guayaquil", "nota de venta RIMPE sin internet", "cómo facturar sin contador") + blog 1 artículo/semana. | 🔥 | 
| B6 | **Comunidad WhatsApp "Comercio Amigo"** | Grupo por ciudad con la imprenta como anfitrión; tips de 60 s; casos de éxito; ofertas de packs. | 🔥 |
| B7 | **Métrica de viralidad embebida** | Cada share genera evento (ficticio si práctica) → medir shares/emisor/mes y tasa de reenvío del comprobante. | 🔥🔥 (medición) |

**El "momento wow" que se comparte (guion de 15 s):**

1. (0–2 s) primer plano del talonario de papel ajado, mano de 70 años. Texto: *"Así facturaba mi suegra."*
2. (2–7 s) la mano toca el mismo talonario en la tablet/celular; la hoja "se desprende" en 3D con sonido.
3. (7–12 s) sello verde "El SRI ya confirmó" + WhatsApp enviando el comprobante a un cliente.
4. (12–15 s) texto: *"No aprendió nada. Ya está facturando."* + logo.

### 4.3 Pilar C — Utilidad y funcionalidad: lo que falta para ser imprescindible

El producto promete "tranquilidad". La tranquilidad se gana con **fiabilidad demostrada**, no con features.

| # | Brecha | Qué se hace | Por qué es vital | Archivos |
|---|---|---|---|---|
| C1 | Emisión real nunca probada end-to-end | Test de integración con **fake SOAP** (`Http::fake` / mock de WSDL) que recorra: emitir → clave 49 válida → firma → envío → autorización → persistencia. | Si el emisor real falla, el comerciante vuelve al papel y no vuelve nunca | `tests/Feature/`, `FacturacionElectronicaController` |
| C2 | **RIDE/PDF no existe** | Generar RIDE real (PDF client-side con jsPDF o server-side) + envío **con PDF adjunto** por email (Resend ya está) y por WhatsApp (link de descarga). | "La factura bonita" es el entregable que el cliente ve; sin PDF no parece factura | `ResendService` (adjunto), nuevo `rideService` |
| C3 | Clientes frecuentes reales | Reemplazar chips fake por últimos 5 clientes del historial (ya hay endpoint `clientes-frecuentes`). | Autocompletar = menos toques = menos miedo | `FacturadorRealista.js`, `listarClientesFrecuentes` |
| C4 | "Mi resumen del día/mes" para el contador | Export PDF/Excel del mes por WhatsApp ("mándale esto a tu contador"). | El contador/hijo se vuelve promotor | nuevo `reportService` |
| C5 | Multiusuario / sucursal (Pro) | Usuario por caja/sucursal con permiso de "solo emitir". | La bodega con 2 cajeras necesita 2 sesiones | `PuntoEmision`, roles |
| C6 | Respaldo legal 7 años | Política de retención: XML firmado + RIDE en R2; descarga "todo mi archivo" en zip. | Confianza tributaria | `R2StorageService` ya tiene `guardarXml/guardarPdf` |
| C7 | Offline con UX honesta | Badge "X pendiente(s) de enviar" + reintento manual + confirmación en pantalla; nunca "fingir" que se emitió. | Ferias y mercados sin señal = ventaja única | `offlineQueue.js`, `AppManager.js:1183-1219` |
| C8 | Rendimiento (bundle > 1.2 MB) | Code-split de `three` (3D), `tesseract`/`pdfjs` (OCR), cargar solo en demanda. | En celular barato de 3G, el miedo se llama "no carga" | `vite.config.js`, `Talonario3DExperience.js` |

**Criterio de "útil de verdad" (definición de terminado del producto):**

> Un comerciante puede, **sin llamar a nadie y sin leer un manual**: emitir una factura con su celular, recibir la confirmación del SRI, enviar el PDF por WhatsApp al cliente, encontrarla después en su historial y darle el mes al contador. **Nada más. Todo lo demás es extra.**

---

## 5. Matriz de priorización y roadmap

### 5.1 Matriz impacto / esfuerzo

| Iniciativa | Impacto | Esfuerzo | Prioridad |
|---|---|---|---|
| A2 · Modo Práctica bien rotulado | 🔥🔥🔥 | S | **P0** |
| A1 · Modo Tranquilo wizard | 🔥🔥🔥 | M | **P0** |
| B1 · Comprobante PNG/PDF compartible | 🔥🔥🔥 | M | **P0** |
| C1 · Test emisión end-to-end (fake SOAP) | 🔥🔥🔥 | M | **P0** |
| A5 · Botón "Ayúdame" WhatsApp | 🔥🔥 | S | P0 |
| C2 · RIDE/PDF + envío adjunto | 🔥🔥🔥 | M | P1 |
| A3 · Diccionario sin jerga | 🔥🔥 | S | P1 |
| A6 · PWA instalable + layout móvil | 🔥🔥 | S–M | P1 |
| C3 · Clientes frecuentes reales | 🔥🔥 | S | P1 |
| C7 · Offline UX honesta | 🔥🔥 | S | P1 |
| B2 · Referidos | 🔥🔥 | M | P1 |
| C4 · Reporte del mes para contador | 🔥🔥 | M | P2 |
| C8 · Code-split bundle | 🔥 | S | P2 |
| B3–B6 · Contenido, SEO, comunidad | 🔥🔥 (lento) | M | P2 (continuo) |
| A7 · Alta asistida por imprenta | 🔥🔥 | M | P2 |

### 5.2 Roadmap 90 días

**Semanas 1–2 — "quitar el miedo" (P0-A):**
- Renombrar Demo → Modo Práctica con rótulo permanente y salida clara.
- Botón "Ayúdame" (WhatsApp) + mensajes contextuales.
- Diccionario sin jerga en CLIENT (A3) + podar botones de rol del facturador del comerciante.
- Modo Tranquilo: paso 1 (ocultar Guía/Correo/avanzados, CTA único).

**Semanas 3–4 — "una hoja, un botón" (P0-B):**
- Wizard Tranquilo completo (3 pasos, 0 jerga, target 48px).
- Prueba de usabilidad con 5–8 adultos (el criterio "abuela").
- C1: test de emisión con SOAP simulado + checklist de firma en sandbox.

**Semanas 5–8 — "el comprobante que se reenvía" (P0-C):**
- B1: generador de comprobante PNG (canvas) + PDF botón COMPARTIR con marca discreta + QR.
- C2: RIDE PDF + email con adjunto (Resend) + link WhatsApp.
- C3: clientes frecuentes reales desde historial.
- A6: PWA instalable + revisión móvil de la hoja.

**Semanas 9–12 — "crecer solo" (P1):**
- B2: referidos + panel de "invita y gana".
- B3: kit de contenido imprenta (video 15 s, textos WhatsApp, carrusel).
- C7: offline honesto + badges de pendientes.
- C4: reporte mensual para contador.
- Beta con 2 imprentas piloto + 10 comerciantes reales, medición de activación y D7.

**Continuo:** contenido TikTok/Reels (1 pieza/semana), SEO (1 landing/ciudad), comunidad WhatsApp.

---

## 6. Métricas de éxito (qué mirar cada semana)

**North Star Metric:** **facturas reales emitidas por usuarios activos por semana** (no demos, no práctica).

| Métrica | Definición | Meta inicial |
|---|---|---|
| Activación | % de cuentas nuevas que emiten 1 factura **real** en 24 h | ≥ 60 % |
| Retención D7 / D30 | % que vuelven y emiten en días 7 / 30 | ≥ 40 % / ≥ 25 % |
| Tasa de práctica→real | % de usuarios que pasan de Demo a Real en 7 días | ≥ 35 % |
| Viral K | shares por emisor/mes × conversión de nuevos usuarios desde share | ≥ 0.3 |
| Referidos | % de altas por referido (comerciante o imprenta) | ≥ 20 % |
| NPS | encuesta 1 pregunta tras 10 facturas | ≥ 50 |
| Soporte | tickets por 100 usuarios/mes | ≤ 8 |
| Tiempo de emisión | mediana desde abrir app hasta sello | ≤ 30 s |

**Instrumentación mínima (privacidad respetuosa):** eventos anónimos en backend: `login`, `practice_emit`, `real_emit`, `share_whatsapp`, `help_click`, `ride_view`, `referral_used`. Sin PII en el evento.

---

## 7. Riesgos y antirriesgos

| Riesgo | Mitigación |
|---|---|
| **Confusión práctica/real** (el mayor riesgo del "modo seguridad") | Rótulo permanente + color distinto (ámbar práctica / verde real) + recordatorio "para emitir de verdad, activa tu cuenta". |
| **EULA/contrato pendiente (P0 de venta)** | Aunque no sea código, bloquea vender: tener plantilla lista con el aviso legal visible ya redactado en `README.md`. |
| **Demo pública no desplegada** | Levantar `demo.talonarioamigo.com` con `DemoSeeder`; es marketing puro (imprentas lo piden). |
| **Render free duerme / Supabase pausa** | Keep-alive ya existe (`cloudflare/`); monitorear con el `/health`. |
| **Feature creep** contra el adulto mayor | Regla de poda: toda feature nueva entra primero al Modo Pro; al Tranquilo solo si pasa "la prueba de la abuela". |
| **Firma `.p12` asusta** | Onboarding asistido por imprenta (A7); explicar con metáfora: "es tu firma en el papel, pero digital". |
| **Dependencia de WhatsApp (meta)** | Mantener también link de descarga por email; el canal WhatsApp es táctico, no vital. |

---

## 8. Anexo — Cambios concretos de UI (antes → después)

**A. Primer vistazo del comerciante**

- Antes: header con "Modo Demostración", "Tranquilo/Comerciante/Pro", chips "Ejemplo/Dictar/Foto/3D/Activar Mi RUC", alertas rojas, pie "Centro de Mando (20 Agentes)".
- Después: saludo ("Buenos días, Paco. Tu talonario está listo."), la hoja marfil central, **un botón grande: "Emitir nueva factura"**, y abajo → "Mis facturas", "Ayuda 💬", "⚙ Avanzado".

**B. La hoja en Modo Tranquilo**

- Paso 1: "¿A quién le facturas?" → tarjeta grande "Consumidor final" + "Buscar cliente". Nada más.
- Paso 2: "¿Qué vendiste?" → 3 renglones grandes + botón "+ Agregar" + total gigante.
- Paso 3: "Revisa y emite" → resumen + botón verde enorme "Emitir factura".
- Post: sello "El SRI ya confirmó ✓" + [Compartir por WhatsApp] + [Ver copia azul] + [Nueva hoja].

**C. Errores (siempre con salida)**

- Antes: toast `"El comprobante no pasó la validación: Módulo 11 RUC"`.
- Después: tarjeta con *"El número del cliente no está bien. ¿Quieres que lo intente yo? / Corregir a mano"* y botón "Ayúdame 💬".

**D. Compartir (el loop)**

- Antes: `wa.me/?text=...` con texto plano.
- Después: imagen/PDF con marca del negocio + QR + "Hecho con Talonario Amigo" discreto; 1 toque "Compartir".

---

## 9. Qué NO hacer (para no romper lo que ya funciona)

- **No agregar más "agentes"/paneles técnicos** al flujo CLIENT (ya sobran).
- **No reemplazar la metáfora del papel** (marfil/copia azul es el activo emocional).
- **No ocultar el estado de práctica** (el rótulo es lo que da valor a la red de seguridad).
- **No hacer la app "más pro"** para impresionar a la imprenta: la imprenta compra porque el comerciante lo usa.
- **No medir éxito en descargas**: medir en facturas reales emitidas.

---

*Documento de trabajo. Los archivos mencionados existen en el repo; los cambios propuestos arriba se implementan por fases con el equipo.*
