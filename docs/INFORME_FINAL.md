# Talonario Amigo — La versión final y cuánto nos falta

> Informe de dirección (22/11/2026). Primero imaginamos el final; después medimos la distancia.
> Los porcentajes salen de revisar el código real, los tests y la producción. No son promesas
> de marketing.

## 1. El propósito

**No vendemos facturación electrónica. Vendemos tranquilidad.**
El comerciante y el adulto mayor siguen usando "su talonario de siempre", y el SRI queda cumplido
sin que tengan que aprender nada.

**Meta:** ser la herramienta de facturación número 1 de Ecuador **para las masas**: tiendas de
barrio, mercados, ferias y negocios RIMPE que hoy le temen al cambio.

**Métrica principal (North Star):** facturas reales emitidas por semana por usuarios activos.

## 2. La versión final (la fantasía, aterrizada)

Una sola cuenta y un solo talonario, con la misma cara en todos lados. Cambia la forma de usarlo
según el dispositivo:

| Dónde | Para quién | Cómo se siente en la versión final |
|---|---|---|
| **WhatsApp** | Todos, sin instalar nada | "Factura a Juan, 2 colas a 0.50" → total → **SI** → listo. Recibe el PDF en el mismo chat. Acepta notas de voz. |
| **Celular (APK y web)** | Comerciante en el mostrador, con una mano | Abre en Modo Tranquilo para mayores de 55. Tiene dictado por voz, escaneo de cédula con la cámara, impresión en ticketera Bluetooth y funciona sin internet (envía cuando vuelve la señal). |
| **Tablet** | Bodegas y minimarkets | Modo caja en horizontal: botones grandes de productos frecuentes y el talonario al lado. Se apoya en el mostrador como una caja registradora. |
| **Laptop (web)** | Comerciante ordenado, hijo o contador | Modo Pro: atajos de teclado, tomos por mes, reportes, exportación a Excel y XML para el contador, varias empresas en una cuenta. |
| **Escritorio (Windows)** | Negocios con computadora fija | Instalador con un clic. Ticketera USB, arranca con Windows y trabaja sin internet. |
| **Panel imprenta** | Imprentas aliadas | Paquetes de licencias, activación de clientes, soporte por WhatsApp y comisiones. |
| **Panel dueño** | Tú | Ventas, imprentas, cuentas activas, interruptor de cuentas, salud del sistema. |

**Lo que el comerciante nunca ve:** jerga técnica, errores en código, formularios largos ni la
sensación de "dañé algo". **Lo que siempre ve:** un botón principal, el total claro, "el SRI ya
aceptó tu factura" y un botón de ayuda que contesta una persona real.

## 3. Cuánto nos falta: avance por área

**Avance global estimado: 46 %.** El motor está; falta terminar la factura completa, llevarla a
todos los dispositivos, el negocio y salir a vender.

| # | Área | Avance | Qué ya está | Qué falta para el 100 % |
|---|---|---|---|---|
| 1 | Motor de factura SRI | **85 %** | XML, firma `.p12`, envío y autorización; 39 tests; un solo pipeline | Reintento automático cuando el SRI dice "en proceso"; validar con firma real en el ambiente de pruebas del SRI |
| 2 | Otros comprobantes | **5 %** | Secuenciales preparados | Nota de crédito (anular o devolver), retención, liquidación de compra |
| 3 | PDF (RIDE) y envío al cliente | **20 %** | Correo con Resend (sin PDF) | Generar el RIDE en PDF con QR; enviarlo por WhatsApp y correo; comprobante compartible con marca |
| 4 | Web comerciante | **70 %** | Facturador, tomos, clientes frecuentes, voz, OCR, ticket térmico | Pulir textos, deshacer o anular, resumen del día |
| 5 | Modo Tranquilo | **60 %** | Asistente de 3 pasos | Activarlo por defecto según la edad, letra XL, prueba real con 5 personas mayores |
| 6 | Modo Pro (contador) | **15 %** | Listados básicos | Varias empresas, reportes, exportar Excel y XML, atajos |
| 7 | Responsive (celular, tablet, laptop, escritorio) | **55 %** | Hay *media queries* en 640, 768, 900, 1024 | Auditoría con capturas en 4 tamaños; modo caja para tablet |
| 8 | Factura por WhatsApp | **60 %** | Bot, vínculo, confirmación SI, 17 tests | Activar en Meta; notas de voz; enviar el PDF en el chat |
| 9 | APK Android | **40 %** | Capacitor configurado; APK sin conexión | Versión firmada; publicarla en Play Store; ticketera Bluetooth |
| 10 | Escritorio (Windows) | **25 %** | Electron básico | Instalador `.exe` firmado; ticketera USB; actualización automática |
| 11 | Sin internet (offline) | **30 %** | Cola local básica | Guardar y reenviar con garantía; indicador claro de "pendiente" |
| 12 | Seguridad y cumplimiento | **65 %** | Huecos cerrados en código; RLS en Supabase; `.p12` cifrado | Llevar la corrección a producción; respaldo de 7 años; LOPDP; registro de auditoría |
| 13 | Infraestructura | **55 %** | API viva sobre Supabase | Desplegar desde un solo repo; keep-alive verificado; alertas y monitoreo; plan sin "dormirse" |
| 14 | Calidad (tests) | **55 %** | 39 tests de backend; CI | Tests del frontend (Playwright) del flujo de emisión en 3 tamaños de pantalla |
| 15 | Negocio B2B (imprentas) | **60 %** | Panel imprenta, paquetes y activación | Comisiones, reportes de la imprenta, contrato con imprentas |
| 16 | Cobros y planes | **0 %** | — | Plan gratis con límite; cobro mensual (PayPhone o Kushki); factura propia a clientes |
| 17 | Legal | **0 %** | Aviso en README | Términos de uso, privacidad (LOPDP), contrato de servicio (abogado) |
| 18 | Marketing y lanzamiento | **20 %** | Landing con capturas, guion de demo, one-pager para imprentas | Demo pública, videos reales, piloto con 20 comerciantes en un mercado, referidos, SEO |

## 4. El camino: 5 fases hacia la versión final

**Fase 1 — "Que no se caiga" (1–2 semanas)**
1. Un solo repositorio que despliegue a producción (hoy hay dos).
2. Corrección de seguridad en producción.
3. Keep-alive verificado, alertas y monitoreo.
4. Respaldos diarios de la base y de los XML.
5. Pedir los documentos legales al abogado (en paralelo).

**Fase 2 — "La factura completa" (2–3 semanas)**
1. RIDE en PDF con QR.
2. Envío por WhatsApp y correo.
3. Nota de crédito (anular o devolver).
4. Reintento automático al SRI.
5. Activar el bot de WhatsApp en Meta.

**Fase 3 — "Cada pantalla" (2–3 semanas)**
1. Auditoría responsive con capturas de celular, tablet, laptop y escritorio.
2. Modo caja para tablet.
3. Modo Pro para el contador.
4. Tests de Playwright del flujo de emisión.

**Fase 4 — "En el bolsillo y en el mostrador" (2–3 semanas)**
1. APK firmada en Play Store.
2. Instalador de Windows.
3. Ticketeras Bluetooth y USB.
4. Modo sin internet confiable.

**Fase 5 — "Crecer solo" (continuo)**
1. Plan gratis con límite y cobro mensual.
2. Piloto en un mercado con 20 comerciantes.
3. Videos de clientes reales.
4. Contadores e imprentas como canal.
5. Programa de referidos.

## 5. Marketing: cómo llegamos a las masas

**El mensaje (quitar el miedo, sin asustar):** *"¿Te da miedo la factura electrónica? Mira a doña
Rosa: escribe por WhatsApp y el SRI ya quedó."* Prometemos tranquilidad; nunca amenazamos con
multas.

**Los canales, en orden:**
1. **Servicio humano de arranque:** "te lo dejo funcionando en 15 minutos", en el local o por
   videollamada.
2. **Imprentas y contadores:** ya tienen la confianza de miles de RIMPE. Ellos venden y
   nosotros les damos comisión recurrente.
3. **Videos cortos** de personas reales (TikTok, Facebook, estados de WhatsApp).
4. **El comprobante que se comparte:** cada factura lleva "Hecho con Talonario Amigo".
5. **Referidos:** "trae a tu vecino y tienes un mes gratis".

**Metas del piloto:**
- 60 % emite su primera factura real en 24 horas.
- 40 % sigue activo a los 7 días.
- Menos de 8 consultas de soporte por cada 100 usuarios al mes.

## 6. Decisiones que solo tú puedes tomar

1. Qué repositorio manda en producción: este o el de la otra cuenta de GitHub.
2. El abogado para los términos de uso y la privacidad.
3. La cuenta de Meta Business (WhatsApp) y la de Google Play (USD 25, una sola vez).
4. La pasarela de cobro: PayPhone, Kushki u otra.
5. El mercado o la zona para el piloto, y el precio final del plan gratis y del plan pagado.
