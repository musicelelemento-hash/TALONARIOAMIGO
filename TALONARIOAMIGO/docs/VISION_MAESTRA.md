# 📜 DOCUMENTO MAESTRO DE VISIÓN — TALONARIO AMIGO

> **Versión:** 1.0 · **Fecha:** Documento vivo — se actualiza con cada decisión de producto.
> **Lema:** *"La tranquilidad de seguir usando tu talonario de toda la vida."*

---

## 1. 🌟 LA MISIÓN

**No vendemos facturación electrónica. Vendemos tranquilidad.**

Talonario Amigo convierte el trámite frío y digital de la facturación electrónica del SRI (Ecuador) en una experiencia cálida, cercana y táctil que le resulta **familiar** al comerciante y al adulto mayor. El usuario ya no "usa una app": **sigue usando su talonario de papel de toda la vida**, pero ahora es inteligente, se autocompleta, se firma solo y cumple con el SRI en un segundo.

**El diferenciador:** nadie más hace que *facturar* se sienta como *un gesto natural*, no como *llenar un formulario*. Esto es lo que nos coloca top nacional por publicidad orgánica.

---

## 2. 🎯 LA PROMESA AL CLIENTE

- **Para el adulto mayor (55+):** *"No tienes que aprender nada. Es tu talonario, ahora más fácil."*
- **Para el pequeño comercio:** *"Emites una factura en segundos, sin errores, y el SRI ya quedó."*
- **Para el contador/multipunto:** *"Toda tu operación, en un lugar, con reportes reales."*

**El antídoto contra el "abandono":** cada persona ve la app con la cara que le corresponde (ver *Sistema de Modos*). Nadie se siente abrumado, nadie se va.

---

## 3. 🎨 DESIGN SYSTEM — ESTÉTICA "REALISMO TÁCTIL MODERNO"

> **Principio rector:** *Realismo en el objeto, minimalismo en la interfaz.* (El estándar es **Apple + Linear + Stripe**.)

### 3.1 El problema a resolver
El prototipo actual mezcla el realismo del papel (correcto) con un **look "hacker de los 90"**: brillos cian neón, resplandores dorados excesivos, scanlines y glows dramáticos. Eso es lo que hace que se vea anticuado. **No es falta de 3D, es falta de restricción.**

### 3.2 Reglas de oro visuales
1. **Un solo foco de luz por escena.** Sombra suave y difusa, no glows múltiples.
2. **Los metales y brillos, solo como acento** (1 por pantalla como máximo). Nunca como fondo.
3. **Sustituir "neón cian" por profundidad real**: sombras largas y suaves, jerarquía de capas, gradientes casi imperceptibles.
4. **Realismo táctil en el objeto central** (el talonario): textura de papel, lomo engomado, perforación, copia azul. **La UI alrededor, plana y limpia** como Stripe.
5. **Nada de scanlines ni texturas de "hacker".** Elegancia > teatralidad.

### 3.3 Paleta unificada (ya definida, se respeta)
| Elemento | Color | Uso |
| :--- | :--- | :--- |
| Fondo App | `#0F172A` → `#16213E` | Degradado sobrio |
| Papel Marfil | `#FCFBF6` | Hoja del talonario |
| Copia Azul | `#EBF3FF` / `#1D4ED8` | Duplicado |
| Lomo Engomado | `#4A2E1B` / `#3A2312` | Encolado superior |
| Tinta | `#1B2D4F` | Renglones offset |
| Éxito | `#16A34A` | Firma activa, switches |
| Folio Rojo | `#D62828` | Numeralia |
| **CTA / Marca** | `#1E293B` / `#0F172A` | Botones principales |

> ⚠️ **A eliminar:** cian `#00D4FF`, dorado `#D4AF37`/`#C5A059` como glows de fondo, scanlines y estilos "tech".

### 3.4 Tipografía
- **Outfit** (sans) — UI y etiquetas.
- **Caveat** (manuscrita) — renglones que simulan bolígrafo.
- **JetBrains Mono** — valores contables y folio.
- **Playfair Display** — encabezados serif elegantes.
- **Special Elite** — sellos y timbres.

### 3.5 Bordes y espacio
- Contenedores 18px · Tarjetas 14px · Botones 12px · Inputs 10px · Badges 20px.
- **Aire:** mucho espaciado. El papel respira; la UI también.

### 3.6 El momento "3D / realismo"
Usar una única experiencia interactiva (tres.js / React Three Fiber) donde el talonario **se puede girar, abrir y despegar el autocopiativo**. Ese es el "wow" que se comparte en TikTok/Reels. El resto de la app es UI plana y limpia.

---

## 4. 🧩 SISTEMA DE MODOS ("EXPERIENCIAS")

> **Por qué existe:** para que *ningún cliente se vaya*. Cada persona ve la app a su medida, y los modos se desbloquean según su cuenta.

| Modo | Público | Lo que ve | Emocional |
| :--- | :--- | :--- | :--- |
| **👴 Tranquilo** | Adulto mayor | Pantalla gigante, 1 botón "Emitir factura", letra grande, saludo personal, cero jerga | *"Puedo con esto"* |
| **🏪 Comerciante** | Bodega / tienda | Flujo rápido, autocompletar cliente, dictado por voz, resumen del día | *"Ya quedó, en segundos"* |
| **⚡ Pro** | Contador / multipunto | Emisión masiva, series, reportes, SRI avanzado | *"Tengo control total"* |

### Modos "ocultos" / desbloqueables
- Se activan según el **nivel de la cuenta** (freemium + gamificación).
- Desbloqueos vendibles: logo propio del negocio, diseño de papel a marca, multi-sucursal, reportes avanzados, plantillas personalizadas.
- **Super admin** puede activar/desactivar modos por cuenta o por imprenta (kill switch).

---

## 5. 🏗️ ARQUITECTURA TÉCNICA

| Capa | Tecnología | Rol |
| :--- | :--- | :--- |
| **Frontend** | React (migrar el prototipo single-file a componentes) | UI + momento 3D |
| **Web** | Vite / Next.js | App web, tablet, PWA |
| **Móvil** | **Capacitor** | APK Android (la "estrella") |
| **Backend** | **Laravel** en Render | Lógica de facturación SRI, firma, emisión |
| **BD** | **Supabase (Postgres)** — ya en MCP | Datos, realtime, auth |
| **Infra** | Cloudflare **+** Render (`render.yaml`, Dockerfile, nginx) | Edge + deploy |
| **SRI** | Librerías `liberias_sri` (compradas) + firma P12 | Cumplimiento tributario Ecuador |

> **Pendiente clave:** migrar el `index.html` (7.297 líneas) a una estructura de componentes. Es el cuello de botella para la "seriedad".

---

## 6. 💰 MODELO DE NEGOCIO — IMPRENTAS Y CLUBS

### 6.1 Distribución a imprentas
- **Cuenta maestra** (imprenta) → vende **packs de 30/60/120 cuentas**.
- **Activación unitaria**: el comerciante activa su cuenta con una clave, la imprenta va liberando.
- **Super admin** (tú): gestiona todas las imprentas, ve ventas, activa/suspende.

### 6.2 Motores de ingreso
1. **Packs B2B (imprentas)** — volumen con descuento progresivo.
2. **Unlockables / Modos** — Pro, branding, multi-sucursal, reportes.
3. **Suscripción** — plantillas, almacenamiento, emisión ilimitada.
4. **Kill switch** — control desde super admin (suspender/activar por pack).

### 6.3 Estrategia de retención (nadie se va)
- **Onboarding de 60 segundos por modo** — la app te muestra "tu cara".
- Dictado por voz + autocompletado → cero fricción al llenar.
- **Experiencia tipo "juego"** (desbloqueos, logros, puntos) pero **sin parecer juguete** — la seriedad viene de la confianza y la fiabilidad.

---

## 7. 📣 ESTRATEGIA DE CONTENIDO ORGÁNICO (TOP NACIONAL)

| Canal | Contenido | Objetivo |
| :--- | :--- | :--- |
| **TikTok / Reels / Shorts** | El talonario 3D que gira y emite solo. El "¡mirá cómo factura en 5 segundos!" | Viralidad visual |
| **SEO / landing** | "Cómo facturar electrónico fácil en Ecuador", "Factura para mi negocio sin complicaciones" | Captar búsqueda nacional |
| **Comunidad** | Grupos de comerciantes, tutoriales, casos de éxito con imprentas | Boca a boca + fidelidad |

**El comercial ganador:** un protagonista adulto dice *"No soy de computadoras, pero esto lo uso todos los días"* y en 5 segundos emite su factura. La diferencia con la competencia: **nadie más hace que facturar se sienta familiar.**

---

## 8. 🗺️ HOJA DE RUTA

### Fase 0 — Fundación
- [x] Design system base
- [x] Prototipo funcional single-file
- [ ] Documentar visión (este documento) ✅
- [ ] Refinar paleta y eliminar look 90s

### Fase 1 — UI Moderna
- [ ] Aplicar "realismo táctil moderno" al prototipo
- [ ] Quitar cian/dorados/scanlines → sombras suaves + jerarquía
- [ ] Momento 3D del talonario

### Fase 2 — Sistema de Modos
- [ ] Implementar Tranquilo / Comerciante / Pro
- [ ] Desbloqueos por nivel de cuenta
- [ ] Panel super admin

### Fase 3 — Arquitectura
- [ ] Descomponer el prototipo en componentes React
- [ ] Conectar el prototipo a Laravel + Supabase
- [ ] Capacitor → APK

### Fase 4 — Negocio y Lanzamiento
- [ ] Flujo packs imprenta + activación
- [ ] Página de contenido orgánico
- [ ] Beta con 1–2 imprentas piloto

---

## 9. ✅ CRITERIOS DE "NO ES UN JUGUETE"

El producto se siente serio y confiable cuando:
1. **Es fiable** — la factura siempre sale bien y cumple con el SRI (nada de alardes que falle).
2. **Es predecible** — el usuario sabe siempre qué botón apretar.
3. **Es honesto** — el realismo es acogedor, no teatral (menos brillos = más confianza).
4. **Es rápido** — facturar toma segundos, no minutos.

---

*Documento maestro de visión, estrategia y arquitectura para Talonario Amigo. Guía todas las decisiones de producto, diseño y desarrollo.*
