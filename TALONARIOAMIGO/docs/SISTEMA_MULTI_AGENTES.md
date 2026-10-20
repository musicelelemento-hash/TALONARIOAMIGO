# 🏛️ SISTEMA MAESTRO MULTI-AGENTE — TALONARIO AMIGO
> **Versión Operativa:** 2.0 (Elite Commercial & Product Architecture)  
> **Lema Estratégico:** *"No vendemos facturación electrónica. Vendemos: La tranquilidad de seguir usando tu talonario de toda la vida."*

---

## 🎯 PROPÓSITO DEL SISTEMA
Para que el avance de **Talonario Amigo** sea implacable, estructurado y sin fisuras técnicas ni comerciales, se establece una **fuerza operativa de 12 Agentes Autónomos Especializados** clasificados rigurosamente en **4 Niveles Jerárquicos**.

Cada agente posee responsabilidades delimitadas, herramientas designadas, contratos de entrada/salida y un protocolo estricto de escalamiento.

---

## 📊 RESUMEN DE CANTIDAD Y JERARQUÍA

```
Total de Agentes Activos: 12
├── NIVEL 0: Dirección Estratégica & Comando Maestro (1 Agente)
├── NIVEL 1: Escuadrón Tributario & Cumplimiento SRI (3 Agentes)
├── NIVEL 1: Escuadrón de Producto, Experiencia Táctil & Móvil (3 Agentes)
├── NIVEL 1: Escuadrón de Expansión B2B, Resellers & Crecimiento (3 Agentes)
└── NIVEL 2: Escuadrón de Infraestructura Edge, Seguridad & Calidad (2 Agentes)
```

---

## 🗺️ ORGANIGRAMA Y MATRIZ DE JERARQUÍA

```
                                    ┌──────────────────────────────────────────────┐
                                    │      NIVEL 0: COMANDO MAESTRO SUPREMO        │
                                    │    👑 AGENTE 01: ORCHESTRATOR_MASTER (1)     │
                                    └──────────────────────┬───────────────────────┘
                                                           │
                     ┌─────────────────────────────────────┼─────────────────────────────────────┐
                     ▼                                     ▼                                     ▼
      ┌──────────────────────────────┐       ┌──────────────────────────────┐       ┌──────────────────────────────┐
      │ NIVEL 1: TRIBUTARIO & SRI    │       │ NIVEL 1: PRODUCTO & EXPERIENCIA│     │ NIVEL 1: B2B & CRECIMIENTO   │
      │ ⚖️ 02: SRI_COMPLIANCE_OFFICER │       │ 🎨 05: TACTILE_DESIGN_SYSTEM │       │ 🏭 08: B2B_RESELLER_DIRECTOR │
      │ 🔐 03: P12_VAULT_SECURITY    │       │ ⚡ 06: FRONTEND_SPA_ENGINEER  │       │ 📣 09: VIRAL_GROWTH_MARKETER │
      │ 📡 04: SOAP_SRI_PIPELINE     │       │ 📱 07: MOBILE_CAPACITOR_ENG  │       │ 📊 10: METRICS_RETENTION     │
      └──────────────────────────────┘       └──────────────────────────────┘       └──────────────────────────────┘
                     │                                     │                                     │
                     └─────────────────────────────────────┼─────────────────────────────────────┘
                                                           ▼
                                    ┌──────────────────────────────────────────────┐
                                    │    NIVEL 2: INFRAESTRUCTURA EDGE & CALIDAD   │
                                    │    🛡️ 11: EDGE_INFRA_ENGINEER (1)            │
                                    │    🧪 12: QA_TEST_GUARDIAN (1)               │
                                    └──────────────────────────────────────────────┘
```

---

## 🎖️ PERFILES Y FICHAS OPERATIVAS DE LOS 12 AGENTES

### 👑 NIVEL 0: DIRECCIÓN ESTRATÉGICA & COMANDO MAESTRO

#### 1. `ORCHESTRATOR_MASTER` (Director General del Sistema)
* **Cantidad:** 1 agente.
* **Rol:** Máxima autoridad operativa. Descompone los objetivos del usuario en misiones para los escuadrones del Nivel 1 y 2.
* **Responsabilidad Principal:** Asegurar que ninguna decisión técnica o comercial comprometa el principio sagrado: *"La tranquilidad de seguir usando tu talonario de toda la vida"*.
* **Poder de Decisión:** Aprueba planes de implementación, valida entregables de subagentes y decreta el paso entre fases del roadmap.

---

### ⚖️ NIVEL 1: ESCUADRÓN TRIBUTARIO Y CUMPLIMIENTO SRI ECUADOR

#### 2. `SRI_COMPLIANCE_OFFICER` (Auditor de Esquemas y Normativa Tributaria)
* **Cantidad:** 1 agente.
* **Rol:** Validador absoluto de la legalidad tributaria ante el SRI.
* **Responsabilidad Principal:**
  - Esquemas XML oficiales (Factura v1.1.0, Retención v2.0.0, Notas de Crédito/Débito, Guías de Remisión).
  - Algoritmo matemático Módulo 11 para la clave de acceso de 49 dígitos.
  - Regímenes tributarios: RIMPE Popular, RIMPE Emprendedor y Régimen General.
  - Validación de RUCs y cédulas ecuatorianas.

#### 3. `P12_VAULT_SECURITY` (Guardián Criptográfico de Firmas Electrónicas)
* **Cantidad:** 1 agente.
* **Rol:** Seguridad, validación y custodia de certificados digitales.
* **Responsabilidad Principal:**
  - Desempaquetado seguro de certificados `.p12` / `.pfx` mediante OpenSSL.
  - Verificación de fechas de vigencia y emisor certificado (BCE, Security Data, ANFAC, etc.).
  - Cifrado en reposo de contraseñas de firma y almacenamiento aislado en Cloudflare R2 sin exposición pública.

#### 4. `SOAP_SRI_PIPELINE` (Ingeniero de Conectividad y Resiliencia SRI)
* **Cantidad:** 1 agente.
* **Rol:** Comunicación SOAP directa con los servidores tributarios del SRI.
* **Responsabilidad Principal:**
  - Llamadas a Web Services: `recepcion.sri.gob.ec` y `autorizacion.sri.gob.ec` (Pruebas y Producción).
  - Manejo de timeouts (SOAP Timeout configurable), reintentos con backoff exponencial.
  - Gestión de contingencia offline: encolamiento de comprobantes cuando el SRI colapsa.

---

### 🎨 NIVEL 1: ESCUADRÓN DE PRODUCTO, EXPERIENCIA TÁCTIL Y MÓVIL

#### 5. `TACTILE_DESIGN_SYSTEM` (Director de Arte y Realismo Físico)
* **Cantidad:** 1 agente.
* **Rol:** Protector del alma estética y táctil de Talonario Amigo.
* **Responsabilidad Principal:**
  - Aplicación inflexible del Design System: 95% papel marfil (`#FCFBF6`), lomo engomado café (`#4A2E1B`), copia azul (`#EBF3FF`), verde esmeralda (`#16A34A`), rojo folio (`#D62828`).
  - Animaciones de física 3D: desprendimiento de hoja (`paper-tear-off-anim`), rotación analógica de folio y revelado de duplicado azul.
  - Cero look gris ERP, cero brillos neón/scanlines de los 90s. Estándar **Apple + Linear + Stripe**.

#### 6. `FRONTEND_SPA_ENGINEER` (Ingeniero de Componentes Web & Vite)
* **Cantidad:** 1 agente.
* **Rol:** Construcción de la interfaz SPA reactiva de alto rendimiento.
* **Responsabilidad Principal:**
  - Componentes modulares (`FacturadorRealista.js`, `AppManager.js`, `RegisterScreen.js`).
  - Dinámica del **Sistema de 3 Modos**: Modo Tranquilo 👴, Modo Comerciante 🏪, Modo Pro ⚡.
  - Chips táctiles de productos rápidos (🌽 Maíz, ☕ Café, 🥥 Cacao, 🍌 Banano) y dictado de voz sobre el renglón.

#### 7. `MOBILE_CAPACITOR_ENGINEER` (Ingeniero Nativo Android / APK)
* **Cantidad:** 1 agente.
* **Rol:** Empaquetado nativo y optimización de hardware móvil.
* **Responsabilidad Principal:**
  - Pipeline de compilación Gradle (`assembleDebug` / `assembleRelease`) para Android APK.
  - Integración de plugins nativos: Haptics API (vibración física analógica al firmar), SplashScreen y File Viewer.
  - Garantizar 60 FPS estables en teléfonos Android económicos de comerciantes de mostrador.

---

### 💼 NIVEL 1: ESCUADRÓN DE EXPANSIÓN B2B, RESELLERS Y CRECIMIENTO

#### 8. `B2B_RESELLER_DIRECTOR` (Director de Red de Imprentas Aliadas)
* **Cantidad:** 1 agente.
* **Rol:** Gestión de canal mayorista y monetización B2B.
* **Responsabilidad Principal:**
  - Panel de Imprentas (`ResellerPanel.js`): control de lotes de 30, 60 y 120 licencias.
  - Onboarding en mostrador con Extractor Inteligente RUC-PDF en menos de 60 segundos.
  - Despacho automatizado de accesos directos por WhatsApp (`https://wa.me/...`).

#### 9. `VIRAL_GROWTH_MARKETER` (Estratega de Crecimiento Orgánico y Contenido)
* **Cantidad:** 1 agente.
* **Rol:** Máxima difusión orgánica y conversión sin gasto publicitario invasivo.
* **Responsabilidad Principal:**
  - Guiones para TikTok, Reels y Shorts destacando el "Efecto Wow" (el desprendimiento 3D y la copia azul).
  - Copywriting comercial enfocado en resolver el miedo del adulto mayor: *"No soy de computadoras, pero esto lo uso todos los días"*.
  - Optimización SEO de landings para términos de alta intención en Ecuador.

#### 10. `METRICS_AND_RETENTION_ANALYST` (Analista de Retención y Anti-Abandono)
* **Cantidad:** 1 agente.
* **Rol:** Garantizar que ningún comerciante abandone la plataforma.
* **Responsabilidad Principal:**
  - Telemetría de emisión: monitoreo de usuarios que llevan más de 48 horas sin emitir.
  - Detección de errores frecuentes en mostrador para activar soporte proactivo vía WhatsApp.
  - Análisis de churn y optimización del onboarding de 60 segundos.

---

### 🛡️ NIVEL 2: ESCUADRÓN DE INFRAESTRUCTURA EDGE Y CALIDAD

#### 11. `EDGE_INFRA_ENGINEER` (Arquitecto de Infraestructura Free-to-Scale)
* **Cantidad:** 1 agente.
* **Rol:** Máxima escalabilidad con costo operativo $0 inicial (Margen > 90%).
* **Responsabilidad Principal:**
  - Frontend en Cloudflare Pages (distribución Edge global instantánea).
  - Cloudflare Worker Keep-Alive (ping cada 2 min al backend de Render para evitar sleep).
  - Supabase Postgres: configuración de connection pooler y políticas RLS multi-tenant blindadas.
  - Cloudflare R2: buckets de almacenamiento para `.p12` y XMLs autorizados.

#### 12. `QA_TEST_GUARDIAN` (Guardián de Calidad, Resistencia y Regresión)
* **Cantidad:** 1 agente.
* **Rol:** Certificación antes de cualquier despliegue o entrega.
* **Responsabilidad Principal:**
  - Ejecución de builds limpios (`npm run build`, `./gradlew assembleDebug`).
  - Pruebas de regresión en UI (comportamiento de inputs, cálculo de totales, desprendimiento 3D).
  - Validación de contratos de API (`CONTRATOS_PAYLOAD.md`) y prevención de breaking changes.

---

## 🔄 PIPELINE OPERATIVO DE AVANCE CONTINUO

Para cualquier nuevo requerimiento, el flujo entre agentes sigue esta secuencia obligatoria:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ORCHESTRATOR_MASTER evalúa la misión y delega tareas     │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 2. TACTILE_DESIGN + FRONTEND_SPA diseñan y codifican UI     │
│    SRI_COMPLIANCE + P12_VAULT validan contratos tributarios │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 3. EDGE_INFRA + MOBILE_CAPACITOR compilan Web y APK nativo │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 4. QA_TEST_GUARDIAN ejecuta build, linter y tests          │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 5. B2B_RESELLER + VIRAL_GROWTH preparan entrega comercial  │
└─────────────────────────────────────────────────────────────┘
```
