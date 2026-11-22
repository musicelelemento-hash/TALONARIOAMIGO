# Competencia en Ecuador y protección de la propiedad intelectual

> Fecha de consulta de todas las fuentes: **2026-11-22**. Base para `crecimiento-negocio`.
> Complementa `docs/marketing/ESTRATEGIA.md` y `docs/negocio/PLANES_Y_PAGOS.md` (secciones 1 y 2).
>
> **Límite de esta investigación (leer primero):** en esta sesión solo funcionó el buscador; las páginas
> oficiales (SENADI, SRI, Siigo, App Store, gob.ec) **no se pudieron abrir** porque el entorno bloquea esos
> dominios. Por eso los datos vienen de resúmenes de búsqueda. Todo lo que no se pudo confirmar dice
> **verificar**. Nada de lo de abajo es asesoría legal.

---

## PARTE A. Competencia

### A.1 Tabla de competidores

| # | Nombre | Precio de entrada (aprox.) | Público | Lo que hace bien | Lo que le falta para un adulto mayor |
|---|---|---|---|---|---|
| 1 | **Facturador SRI** (herramienta gratuita oficial, reemplazó al "SRI y yo en línea") | $0 | Cualquier contribuyente salvo grandes contribuyentes | Gratis y oficial. Exige firma electrónica tipo archivo vigente, usuario/clave del SRI y autorización previa de emisión. Funciona desde computador o celular | Hay que sacar la firma, pedir autorización y entender menús. Sin ayuda humana, sin voz, sin WhatsApp. Reportes de caídas del portal. Estado actual en 2026: **verificar** |
| 2 | **Siigo Contífico** (antes Contífico) | Plan gratis de 24 documentos al año; planes de pago: monto **verificar** (precios sin IVA) | Pymes y contadores | Marca grande, contabilidad completa, app móvil, vende también la firma electrónica | Es un sistema contable: muchos menús. Gratis con tope muy bajo (24 al año). Sin voz ni WhatsApp (**verificar**) |
| 3 | **Facelec** (app) | Descarga gratis; suscripciones anuales con renovación automática; monto **verificar** | Emprendedores con celular | App móvil directa; planes por cantidad de comprobantes | Planes anuales (pago grande de una vez). Sin letra grande ni asistencia humana (**hipótesis**, revisar la app) |
| 4 | **Facturero Móvil** | "Desde $6,99" según un anuncio; si es mensual o por uso: **verificar**. La ficha dice "paga solo por lo que consumas" | Emprendedores | Pago por consumo, sin mensualidad fija | Interfaz pensada para quien ya conoce el SRI (**hipótesis**) |
| 5 | **Alegra** (Ecuador) | **verificar** (en República Dominicana sus planes de solo facturación parten de USD 15/mes; no aplica a Ecuador) | Pymes y contadores | Integra con el SRI; muy conocida en la región | Producto contable amplio; precio probablemente alto para un puesto de mercado |
| 6 | **Datil** | **verificar** (no apareció precio público) | Pymes y desarrolladores (API, plugin WooCommerce) | Plataforma de facturación y retenciones con integraciones | Orientada a empresas y a quien integra sistemas, no a quien nunca usó una computadora |
| 7 | **Facturec** (app de Shopify) | $9,99/mes más cargos por uso | Tiendas en línea | Se conecta a la tienda Shopify | Solo sirve a quien ya vende en línea con Shopify |
| 8 | **FacturaHero y otras apps** (Facturasoft, Factúralo, Vendex y similares en App Store) | Algunas con plan inicial gratis; resto **verificar** | Emprendedores | Hay oferta de apps pequeñas con plan gratis | Calidad desigual; no se encontró ninguna que hable de voz, foto o ayuda humana |

### A.2 Hallazgos que importan

1. **El RIMPE "negocio popular" no está obligado a facturar electrónicamente** (usa nota de venta); el RIMPE "emprendedor" y los demás sí. Eso recorta el mercado "que debe", y obliga a vender tranquilidad más que obligación. Verificar el texto vigente en el SRI. Fuente: [Expreso](https://www.expreso.ec/actualidad/economia/facturacion-electronica-quienes-obligados-sacar-ruc-digital-250024.html).
2. **Nadie de los encontrados comunica voz, foto, letra grande ni ayuda humana** como promesa. Esto es **hipótesis**: se confirma instalando las 4 apps y probándolas (ver sección A.4).
3. **El tope de gratis de la competencia es bajo** (Siigo: 24 documentos al año). El plan Gratis de Talonario Amigo (15 al mes = 180 al año) es 7 veces más generoso. Dato interno, cálculo propio.
4. Los precios públicos de varios competidores no aparecen: señal de que se vende con asesor. Un precio claro en dólares ya es diferencia.

### A.3 Cinco diferenciadores concretos

Ninguno está confirmado como "único": están marcados según la evidencia disponible.

1. **Factura por WhatsApp escribiendo o hablando** ("dos aceites a Doña Marta, 8 dólares"). No se encontró ningún competidor que lo ofrezca (**hipótesis**, confirmar probando los 4 competidores móviles). Ya existe en el producto (`app/Services/WhatsApp/`).
2. **Ayuda humana dentro de la app: botón "Ayúdame"** que abre a una persona (WhatsApp o llamada) y **arranque guiado de 15 minutos**. Los competidores venden soporte como ticket o correo (**hipótesis**).
3. **Foto de la firma electrónica y del RUC para configurar solo**: el miedo número uno es sacar la firma y configurar el SRI. Un asistente que guíe paso a paso con fotos, o que lo haga la imprenta o el hijo por videollamada, quita la barrera que tiene el Facturador SRI. Parte es por construir: marcar como pendiente.
4. **Modo Tranquilo: letra grande, un solo botón, sin términos del SRI**, con el diseño del talonario de papel (marfil y copia azul). Es posicionamiento verificable en la interfaz; que ningún competidor lo haga es **hipótesis**.
5. **Canal imprenta y contador con código de activación**: la imprenta que antes vendía el talonario hoy activa cuentas y cobra comisión mensual. Es un modelo de distribución, difícil de copiar rápido porque exige relaciones. Ninguno de los 8 lo anuncia (**hipótesis**).

Extra a probar: precio claro desde $0 y "cancela cuando quieras", frente a planes anuales de renovación automática (Facelec).

### A.4 Cómo validar la Parte A en 2 semanas

- Días 1 a 3: instalar Facelec, Facturero Móvil, Siigo (app) y Facturador SRI; llenar una tabla con 10 criterios: pasos hasta la primera factura, letra, voz, foto, WhatsApp, ayuda humana, precio visible.
- Días 4 a 10: mostrar a 8 adultos mayores (5 minutos cada uno) un competidor y Talonario Amigo; medir quién emite una factura de prueba sin ayuda.
- Días 11 a 14: pedir precios por WhatsApp a Alegra, Datil, Siigo y Facelec, y anotarlos aquí.

### A.5 Fuentes de la Parte A

- Siigo Contífico, planes: https://www.siigo.com/ec/planes/ (la página no se pudo abrir; dato tomado de resumen de búsqueda)
- Siigo Contífico, facturación electrónica: https://siigo.com/ec/facturacion-electronica/
- Facturador SRI gratuito (Primicias, 2023): https://primicias.ec/noticias/economia/facturacion-electronica-sri-plataforma-gratis
- Actualización del aplicativo gratuito (El Comercio): https://www.elcomercio.com/actualidad/sri-actualiza-aplicativo-web-facturacion-electronica-gratuita/
- Caídas del portal (Primicias): https://primicias.ec/noticias/economia/portal-facturacion-electronica-sri-caidas
- Facelec (App Store): https://apps.apple.com/ec/app/facelec/id6503172453
- Facturero Móvil (App Store): https://apps.apple.com/us/app/facturero-m%C3%B3vil/id6457415073
- Facturec (Shopify): https://apps.shopify.com/facturec
- Alegra, guía de terceros: https://www.guiadesoftware.com/software/alegra
- Alegra, precio en otro país (solo referencia): https://siemprealdia.co/republica-dominicana/impuestos/cuanto-cuesta-implementar-la-facturacion-electronica/
- Datil (listado): https://jelou.ai/en/marketplace/datil
- Obligados y RIMPE popular (Expreso): https://www.expreso.ec/actualidad/economia/facturacion-electronica-quienes-obligados-sacar-ruc-digital-250024.html

---

## PARTE B. Protección de la propiedad intelectual en Ecuador

### B.0 Resumen para el dueño

| Qué | ¿Se puede? | ¿Quién lo hace? | Urgencia |
|---|---|---|---|
| Marca (nombre y logo) en SENADI | Sí | Dueño puede iniciar solo; abogado muy recomendado | **Alta** |
| Derechos de autor del software y del diseño | Nacen solos al crear; el registro es prueba | Dueño puede hacerlo | Media |
| Patente del software | **Normalmente no** (programas "en sí") | Solo consultar a un abogado si hay un invento técnico | Baja |
| Dominio | Sí | Dueño, hoy | **Alta** |
| Secreto comercial y confidencialidad | Sí, con contratos y orden interno | Abogado redacta, dueño aplica | Alta |

### B.1 Marca "Talonario Amigo" (nombre y logo)

**Qué es.** El registro da el derecho de uso exclusivo del nombre y/o logo para los productos y servicios que indiques, en Ecuador. Lo gestiona SENADI (Servicio Nacional de Derechos Intelectuales). Los trámites se hacen en línea.

**Qué registrar.** Dos solicitudes separadas: (a) el nombre (denominativa) y (b) el logo (mixta o figurativa). Si hay que elegir una sola, el nombre protege más.

**Clases de Niza probables** (clasificación internacional de productos y servicios; confirmación de la clase con el buscador del SENADI o un abogado: **verificar**):
- **Clase 9**: software descargable y aplicaciones móviles (la APK, la app de escritorio).
- **Clase 42**: software como servicio (SaaS), desarrollo y alojamiento de software (la versión web).
- **Clase 36 o 35**: posible si se ofrecen servicios de facturación o contables a terceros (**hipótesis, consultar**).
- **Clase 41**: solo si hay capacitación o cursos (opcional).
- Cada clase se cobra aparte o no según la tasa vigente: **verificar** en el tarifario.

**Costo.**
- Un sitio oficial (gob.ec) indica una tasa de **USD 208** para el registro de marca, y USD 400 para marcas de certificación. Un buscador devolvió esa cifra también para lema comercial. Si es por clase o por solicitud: **verificar**.
- El tarifario oficial se llama "TASAS SENADI 2026" y no se pudo abrir: https://www.derechosintelectuales.gob.ec/wp-content/uploads/2026/03/TASAS-SENADI-2026.pdf. **Verificar la tasa vigente ahí antes de pagar.**
- Honorarios de abogado: **verificar** (pedir 2 cotizaciones). Un despacho citado en prensa ofrecía bajar el trámite a USD 104; no es tarifa oficial.

**Tiempos.** SENADI indica que el trámite puede tardar entre 5 y 6 meses; otras fuentes dicen 6 a 9 meses, y más si hay oposición de terceros. Vigencia: 10 años, renovable. Pasos: examen de forma, publicación en la Gaceta de Propiedad Intelectual, plazo para que terceros se opongan, examen de fondo y resolución.

**Antes de presentar.** Hacer la búsqueda de antecedentes en la base de SENADI: "Talonario" es una palabra común y descriptiva, así que puede ser difícil registrarla sola. Lo más defendible suele ser "Talonario Amigo" completo y el logo. Riesgo de rechazo por descriptiva: **hipótesis**, lo evalúa un abogado.

**Quién lo hace.** El dueño puede presentar la solicitud en línea (casillero virtual de SENADI). Un abogado de propiedad intelectual conviene para: elegir clases, evaluar si es descriptiva, responder objeciones u oposiciones.

Fuentes:
- Trámite oficial de marcas: https://www.gob.ec/senadi/tramites/registro-marcas-productos-servicios-unico-personas-naturales-juridicas-sean-nacionales-extranjeras
- Tarifario 2026: https://www.derechosintelectuales.gob.ec/wp-content/uploads/2026/03/TASAS-SENADI-2026.pdf
- Casillero virtual: https://www.derechosintelectuales.gob.ec/wp-content/uploads/2025/11/creacion_casillero_virtual_registro_marcas.VF_.pdf
- Plazos (Primicias): https://primicias.ec/economia/registro-marcas-tramite-senadi-emprendimientos-negocios-ecuador-84152
- Plazos y costo (El Universo, 2019, antigua): https://www.eluniverso.com/noticias/2019/07/03/nota/7406652/como-registrar-marca-ecuador
- Renovación: https://www.gob.ec/senadi/tramites/renovacion-signos-distintivos-nombre-comercial-lema-comercial-apariencias-distintivas
- Oposiciones: https://www.gob.ec/senadi/tramites/resolucion-oposiciones-signos-distintivos-unica-personas-naturales-juridicas-ya-sean-nacionales-extranjeras

### B.2 Derechos de autor del software y del diseño

- El software se protege como obra por derechos de autor (se trata como obra literaria). La protección nace al crearlo; el **registro en SENADI no es obligatorio, pero sirve de prueba** de que eres el autor y de la fecha. Fuente académica: PUCE https://repositorio.puce.edu.ec/bitstreams/54fe7f12-d23f-46b2-8e29-e7822a6d4bf7/download
- Trámite oficial "Registro de programa de ordenador y base de datos": https://www.gob.ec/senadi/tramites/registro-programa-ordenador-base-datos-unico-personas-naturales-juridicas-ya-sean-nacionales-extranjeras. Requisitos citados en un resumen: solicitud, comprobante de la tasa y copia del programa (el trámite pedía CD; hoy puede ser digital: **verificar**). Tasa: **verificar** en el tarifario 2026.
- **Qué se protege:** el código escrito y su diseño de pantallas, textos, logo e ilustraciones (obras gráficas). **Qué no:** la idea, el método o "factura por WhatsApp" como concepto.
- Se puede registrar el **código fuente** (recomendado depositar una versión con fecha; no entregar secretos como llaves ni certificados) y por separado el **logo y arte** (obra de artes plásticas o gráfica: **verificar** el trámite).
- **Titularidad:** si el código o el diseño lo hicieron terceros (freelancers, agencias, IA con herramientas), hace falta un contrato que ceda los derechos a Talonario Amigo. Sin cesión escrita el autor puede conservar los derechos (**verificar con abogado**). La librería SRI comprada (`liberias_sri/`) tiene su propia licencia: revisar qué permite.
- Las partes con IA generativa pueden tener protección débil o dudosa: **verificar**.
- **Quién lo hace:** el dueño puede registrar solo; abogado para los contratos de cesión.

### B.3 Patentes

- Marco: Código Orgánico de la Economía Social de los Conocimientos, Creatividad e Innovación (Código Ingenios). Última reforma citada: Tercer Suplemento del Registro Oficial 68, 26-06-2025. Texto: https://www.wipo.int/wipolex/en/text/439750
- Las fuentes encontradas coinciden en que **el software se protege principalmente por derechos de autor** y que el régimen tiene vacíos (tesis PUCE: https://repositorio.puce.edu.ec/bitstreams/e6b82836-43f0-4feb-8eb7-f0229a3309c5/download; análisis USFQ: https://revistas.usfq.edu.ec/index.php/iurisdictio/article/view/737).
- **No se pudo confirmar el artículo exacto** que excluye los programas de ordenador "en sí" de las invenciones patentables. La regla general de los acuerdos internacionales (ADPIC) sí lo hace, pero **verificar el artículo en el texto del Código** antes de afirmarlo en público.
- Conclusión práctica: **no gastar en patente** de la app. Solo consultar a un abogado si hubiera un procedimiento técnico novedoso ligado a un efecto físico, lo cual no parece ser el caso (**hipótesis**).

### B.4 Dominio de internet

- NIC.EC administra .ec. Las tarifas públicas varían mucho según el registrador (de unos USD 35 a más de USD 120 al año según páginas consultadas): **verificar** el precio actual y qué dominios ya son del negocio. Fuente: https://www.dynadot.com/es/dominio/com.ec y https://letsdomains.com/es/domain-database/ec
- Registrar a nombre de la **empresa o del dueño con su cédula/RUC**, nunca a nombre de un desarrollador o agencia. Activar renovación automática y bloqueo de transferencia.
- Registrar también variantes: `talonarioamigo.com`, `.ec`, `.com.ec`, y los perfiles con el mismo nombre en Facebook, Instagram, TikTok y Google Play.
- Requisitos del registrador: https://nic.ec/downloads/requisitos_registrars_esp.pdf (es para agentes registradores, no para el público).
- **Quién lo hace:** el dueño solo, hoy.

### B.5 Secreto comercial y confidencialidad

- Qué se puede guardar como secreto: código fuente completo, base de clientes, listas de imprentas aliadas, métricas, precios y tarifas con aliados, prompts y flujos de WhatsApp, estrategia de marketing.
- Lo que hace falta para que sea "secreto" frente a un juez: que sea realmente reservado y que se hayan tomado medidas razonables (contratos, accesos restringidos). Norma exacta en el Código Ingenios: **verificar el artículo**.
- Medidas simples (dueño): repositorio privado, accesos por persona con 2 pasos, no compartir llaves ni `.p12`, registrar quién ve qué.
- Contratos (abogado redacta una plantilla, el dueño la usa): **acuerdo de confidencialidad (NDA)** para imprentas, contadores, freelancers y aliados antes de enseñar detalles; **cláusula de cesión de derechos y confidencialidad** en cada contrato de desarrollo o diseño; y cláusula de no uso de la información tras terminar la relación.
- Costo de redacción: **verificar** (pedir cotización).

### B.6 Qué hace el dueño solo y qué requiere abogado

| El dueño puede solo | Requiere abogado de propiedad intelectual |
|---|---|
| Comprar dominios y reservar nombres en redes | Evaluar si "Talonario Amigo" es registrable (riesgo de descriptiva) |
| Buscar antecedentes en la base de SENADI | Elegir clases y redactar la lista de productos y servicios |
| Abrir casillero virtual y presentar solicitud de marca | Contestar objeciones u oposiciones |
| Registrar el software (código) en SENADI | Contratos de cesión de derechos con quien hizo código, logo o diseño |
| Mantener código privado y accesos ordenados | Plantilla de NDA y de contrato con imprentas |
| Guardar fecha y versión de logo y diseño | Cualquier consulta sobre patente |
| | Demandas por copia o uso indebido de la marca |

### B.7 Tres pasos de protección más urgentes

1. **Hoy:** comprar dominios y reservar el mismo nombre en Facebook, Instagram, TikTok y Google Play, a nombre del dueño o de la empresa.
2. **Esta semana:** buscar antecedentes en SENADI y presentar la solicitud de marca del nombre "Talonario Amigo" en clases 9 y 42 (más el logo después). Verificar tarifa en el tarifario 2026. Conviene una consulta de 1 hora con un abogado antes. Con 5 a 9 meses de trámite, cada semana cuenta.
3. **Este mes:** firmar cesión de derechos con quien haya hecho código, logo o diseño; usar NDA con imprentas y contadores; y registrar el software en SENADI como prueba de autoría.

### B.8 Cómo validar la Parte B en 2 semanas

- Días 1 a 2: dominios y redes reservados; captura de pantalla de cada uno.
- Días 3 a 5: abrir el tarifario 2026 en un computador con acceso (hoy no se pudo) y anotar aquí las tasas exactas por marca, programa de ordenador y renovación.
- Días 3 a 7: búsqueda de antecedentes en SENADI de "Talonario", "Amigo" y logo; guardar resultados.
- Días 6 a 10: pedir 2 cotizaciones a abogados de propiedad intelectual (marca clases 9/42 y 35/36, cesión de derechos, NDA).
- Días 11 a 14: decidir con el dueño y presentar la solicitud.

### B.9 Dominios que hay que permitir para completar los "verificar"

Para terminar esta investigación hay que permitir en la red del entorno: `www.derechosintelectuales.gob.ec`, `www.gob.ec`, `www.siigo.com`, `apps.apple.com`, `primicias.ec`. Sin eso, los datos marcados "verificar" no se pueden cerrar desde esta sesión.
