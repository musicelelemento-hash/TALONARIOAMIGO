# Tablero de ideas — Talonario Amigo

> Aquí el agente `explorador-ideas` deja sus propuestas y el director anota su veredicto.
> Estados: **propuesta** → **aceptada** (entra al plan) · **en espera** (buena, pero no ahora) ·
> **rechazada** (con el motivo, para no repetirla).

## Cómo decide el director
Una idea se acepta si cumple todo esto:
1. Hace la app **más fácil** para un comerciante o una persona mayor (prueba de la abuela).
2. Encaja con la marca: tranquilidad, talonario de siempre, sin miedo ni trucos.
3. El **impacto justifica el esfuerzo** en la etapa actual (primero lo que acerca a la app estrella).
4. Es **legal y honesta**: nada copiado, nada que el SRI o la ley no permitan.
5. No complica lo que ya funciona.

## Propuestas nuevas
_(vacío: el explorador escribe aquí)_

## Aceptadas
### IDEA-001 · Palomitas de estado, como en WhatsApp
- Inspirada en: las marcas de visto de WhatsApp (https://www.howtogeek.com/284629/what-do-the-little-checkmarks-in-whatsapp-mean/)
- Qué hacen ellos: una palomita gris = salió; dos grises = llegó; dos azules = la leyeron. Casi todos en Ecuador las entienden sin que nadie se las explique.
- Problema que resuelve aquí: el comerciante no sabe si su factura "ya está" o "se perdió". Hoy vería palabras como "autorizada" o "pendiente" en la lista de facturas, en la pantalla de después de emitir y en el chat de facturación.
- Cómo se vería en Talonario Amigo: junto a cada factura, tres pasos con palomitas propias (dibujo nuestro, no el de WhatsApp): ✓ "Guardada en tu celular" → ✓✓ "El SRI la aceptó" → ✓✓ en azul copia "Tu cliente la recibió" (cuando se mandó por WhatsApp o correo). Si no hay señal se queda en una palomita con el texto "La enviamos apenas vuelva la señal". Tocar las palomitas abre una frase sencilla de qué significa cada una. En Clásico se ven como un sello de tinta azul en el margen de la hoja; en Minimalista, como palomitas finas junto al total.
- Impacto: alto · Esfuerzo: bajo (los estados ya existen en el pipeline de emisión; es una capa visual)
- Quién la construiría: interfaz-minimalista (dibujo y textos) + dev-backend (exponer el estado "cliente la recibió")
- Estado: **aceptada (22/11)**
- Veredicto del director: Más tranquilidad con casi nada de trabajo: el comerciante ve que su factura llegó. Primero ✓ guardada y ✓✓ aceptada por el SRI; la tercera (el cliente la recibió) cuando exista el envío del RIDE.

### IDEA-002 · "Emitiendo en 5… Deshacer" antes de mandar al SRI
- Inspirada en: "Deshacer envío" de Gmail (https://support.google.com/mail/answer/2645922?hl=en)
- Qué hacen ellos: después de tocar "Enviar", el correo espera unos segundos; si te arrepientes, tocas "Deshacer" y nunca se envió. Se puede alargar la espera hasta 30 segundos.
- Problema que resuelve aquí: el miedo de "si me equivoco, no hay vuelta". Hoy, para corregir una factura ya enviada hace falta una nota de crédito (el "Anular y repetir" planeado, que está al 5 %). Muchos errores se notan en el primer segundo (el número de cédula, un cero de más).
- Cómo se vería en Talonario Amigo: al tocar "Sí, emitir", la factura queda en una franja grande abajo: "Enviando tu factura… [ DESHACER ]" con una cuenta regresiva de 5 segundos (en Modo Tranquilo, 10). Si toca Deshacer, vuelve a la factura tal cual para corregirla, sin nota de crédito ni nada ante el SRI. En Clásico la hoja tiembla antes de desprenderse del bloc; en Minimalista se llena un círculo suave. Mejora la idea de "Deshacer" de `docs/INFORME_MEJORA.md` (A4): primero evita el error; anular queda para después.
- Impacto: alto · Esfuerzo: bajo (la cola local ya existe; solo se retrasa el envío unos segundos)
- Quién la construiría: interfaz-minimalista + dev-backend (revisar que la cola respete la espera) · cumplimiento-seguridad revisa que nada salga al SRI antes de tiempo
- Estado: **aceptada (22/11)**
- Veredicto del director: Ataca el miedo número uno ("me equivoqué y ya no hay vuelta"). La espera ocurre en el celular antes de llamar al servidor, así que nada sale al SRI antes de tiempo. Revisión rápida de cumplimiento-seguridad antes de cerrar.

### IDEA-004 · Pantalla "Hoy": todo lo de hoy en un vistazo
- Inspirada en: la pestaña "Hoy" de Airbnb para anfitriones (https://www.airbnb.com/resources/hosting-homes/a/new-hosting-tools-to-help-grow-your-business-738), que junta en un solo lugar las reservas, lo que toca hacer y los avisos importantes.
- Qué hacen ellos: al abrir la app, el anfitrión ve primero lo de hoy y lo único que tiene que hacer, no un menú.
- Problema que resuelve aquí: el "resumen del día" está pendiente (`docs/INFORME_FINAL.md`) y hoy el comerciante tiene que buscar en listas para saber cómo le fue. Pantalla de inicio en Android, web y tablet.
- Cómo se vería en Talonario Amigo: arriba, en letra grande, "Hoy vendiste $48,50 · 12 facturas"; debajo una sola línea de tranquilidad: "Todas llegaron al SRI ✓✓" (o "1 está esperando señal, nosotros la enviamos"). Luego, como mucho, una tarjeta de "algo por hacer" (ej. "Tu firma vence en 20 días: te ayudamos a renovarla") y el botón principal "Nueva factura". En Clásico parece la última hoja del talonario con la suma escrita a mano; en Minimalista, una tarjeta blanca con el número grande. En tablet va a la izquierda del modo caja.
- Impacto: medio · Esfuerzo: bajo (los datos ya existen)
- Quién la construiría: interfaz-minimalista + dev-backend (un endpoint de resumen del día)
- Estado: **aceptada (22/11)**
- Veredicto del director: Resuelve el "resumen del día" pendiente y ya está dibujado en el prototipo. Poco esfuerzo, mucho orden para el comerciante.

## En espera
### IDEA-003 · Factura de práctica antes de configurar nada
- Inspirada en: Duolingo deja hacer una lección antes de pedir registrarse; al mover el registro unos pasos más atrás, sus usuarios activos diarios subieron cerca de 20 % (https://review.firstround.com/the-tenets-of-a-b-testing-from-duolingos-master-growth-hacker)
- Qué hacen ellos: primero pruebas y sientes que puedes; recién después te piden tus datos ("guarda tu avance").
- Problema que resuelve aquí: la persona mayor tiene miedo de "dañar algo con el SRI" y la configuración pide RUC y firma antes de que haya visto la app funcionar. Pantalla: bienvenida y configuración en 3 pasos.
- Cómo se vería en Talonario Amigo: en la bienvenida, un botón grande "Probar con una factura de práctica". Escribe o dice "2 colas a 0.50", ve la tarjeta, toca "Sí, emitir" y ve la hoja desprenderse con un sello claro "PRÁCTICA – no se envía al SRI". Al final: "¡Así de fácil! ¿Hacemos la tuya de verdad?" → recién ahí los 3 pasos (PDF del RUC, firma, estilo). Nada se manda al SRI ni se guarda como factura real; el sello de práctica sale también en el PDF para que nunca se confunda con una factura válida.
- Impacto: alto · Esfuerzo: medio (reusar chat y animación sin tocar el motor; separar bien lo de práctica)
- Quién la construiría: producto-vision (guion) + interfaz-minimalista + dev-backend · cumplimiento-seguridad revisa que la práctica no pueda pasar por factura real
- Estado: **en espera (22/11)**
- Veredicto del director: Gran parte ya existe: "Probar el talonario ahora" abre el Modo Práctica sin registrarse. Se retoma después de que el dueño pruebe la versión de prueba, para pulir solo lo que falte (sello de práctica y una primera factura guiada).

### IDEA-005 · Ayudante de confianza (hijo, nieto o empleado)
- Inspirada en: Yape Empresa, que permite agregar ayudantes al negocio y les manda avisos automáticos de los cobros (https://www.mercadonegro.pe/medios/digital/yape-lanza-yape-empresa-su-version-exclusiva-para-personas-con-negocio)
- Qué hacen ellos: el dueño invita a otra persona con sus datos; esa persona recibe una notificación en su app y ayuda con el negocio, con permisos limitados.
- Problema que resuelve aquí: muchos adultos mayores ya tienen a alguien de la familia que "le ayuda con el celular", pero hoy tendrían que prestarle la clave. Pantalla: Ajustes → "Mi ayudante".
- Cómo se vería en Talonario Amigo: "¿Alguien de tu familia te ayuda? Invítalo" → se manda una invitación por WhatsApp. El ayudante entra con su propio número y puede: ver las facturas, recibir un aviso si alguna se quedó sin enviar, y (si el dueño lo permite) facturar en el mostrador. Nunca ve ni cambia la firma electrónica ni su clave. El dueño puede quitarlo con un toque. Complementa el botón "Ayúdame" (persona de Talonario) con alguien de casa.
- Impacto: medio · Esfuerzo: alto (permisos por usuario; ya hay una tabla de roles para revendedores que se puede aprovechar)
- Quién la construiría: dev-backend (permisos) + interfaz-minimalista · cumplimiento-seguridad revisa permisos y que la firma nunca se comparta
- Estado: **en espera (22/11)**
- Veredicto del director: Muy buena para negocios con empleados o hijos que ayudan, pero requiere un sistema de permisos y revisión de seguridad. Se retoma con los planes Comerciante y Pro.

## Rechazadas
_(vacío)_
