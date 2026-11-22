# La app estrella — especificación de la versión final

> Fuente de verdad del producto (la mantiene el agente `producto-vision`). Visión general:
> `VISION_MAESTRA.md`. Avance global del proyecto: `docs/INFORME_FINAL.md`. Fecha: 22/11/2026.

## 1. En una frase
**La forma más fácil de facturar en Ecuador: hablas, escribes como en WhatsApp o tomas una foto, y la
factura del SRI queda lista.** Funciona en Android, en la web y en la tablet, con la cara que cada
persona prefiera.

## 2. Principios de la experiencia
1. **Un camino, un botón, un paso.** Cada pantalla tiene una sola acción principal.
2. **Entrada natural primero:** voz, chat o foto. El formulario existe, pero es el último recurso.
3. **Lo opcional al final y plegado:** forma de pago (Efectivo por defecto), guía de remisión, notas y
   detalles adicionales van en "Más opciones ▸" al final de la factura.
4. **Configurar en 3 pasos:** PDF del RUC (o foto) → firma electrónica → listo.
5. **Animada y agradable, sin ruido:** cada animación explica algo (la hoja se desprende al emitir, el
   check confirma). Respeta a quien desactiva las animaciones.
6. **Nunca dejar a nadie solo:** botón "Ayúdame" con una persona real por WhatsApp.
7. **Identidad propia:** nos inspiramos en buenas ideas, no copiamos a otras apps.

## 3. Dos estilos, una sola app (idea del dueño)
| | **Clásico** | **Minimalista** |
|---|---|---|
| Sensación | "Mi talonario de siempre" | "Una app moderna y limpia" |
| Para quién | Mayores, quienes extrañan el papel | Jóvenes, contadores, negocios modernos |
| Factura | Hoja marfil con copia azul, lomo, folio rojo, letra manuscrita | Recibo blanco, tipografía limpia, mucho aire |
| Animación al emitir | La hoja se desprende del bloc | Un check suave |
| RIDE (PDF) | Plantilla clásica | Plantilla minimalista |

Se elige en la configuración inicial ("¿Cómo quieres ver tu talonario?") y se cambia cuando se quiera.
La lógica es idéntica: solo cambia la apariencia. Prototipo visual: `docs/diseno/prototipo-app-estrella.html`.

## 4. Los flujos principales
### 4.1 Configuración (primera vez, meta: menos de 3 minutos)
1. **Sube el PDF de tu RUC o tómale una foto** → se llenan solos el nombre, el RUC, la dirección y el régimen.
2. **Sube tu firma electrónica (.p12)** y escribe su clave → se valida al instante con un mensaje claro.
3. **Elige tu estilo** (Clásico o Minimalista) → "¡Listo! Tu talonario está listo."
Alternativa: "Que me ayude una persona" (configuración asistida por videollamada o en el local).

### 4.2 Facturar (meta: menos de 30 segundos)
- **Por chat (como WhatsApp, dentro de la app):** escribe "Factura a Juan 0912345678, 2 colas a 0.50" →
  la app muestra la tarjeta con el total → **"Sí, emitir"**. Reutiliza el mismo intérprete del bot de
  WhatsApp (`MensajeFacturaParser`), así ambos canales entienden igual.
- **Por voz:** toca el micrófono, dice la venta, aparece la misma tarjeta.
- **Por foto:** foto de la cédula del cliente (llena el cliente) o de una proforma o lista escrita
  (llena los productos).
- **Por clientes y productos frecuentes:** dos toques para repetir una venta habitual.
- **Formulario clásico:** sigue disponible para quien lo prefiera.

### 4.3 Después de emitir
Enviar por WhatsApp o correo (con el RIDE en PDF), imprimir en la ticketera, o "Nueva factura".
Si no hay internet: "Guardada. La enviamos apenas vuelva la señal" (y se envía sola).

### 4.4 Corregir un error
"Anular y repetir" en un toque (nota de crédito por detrás, sin palabras técnicas).

## 5. Cada dispositivo
| Dispositivo | Cómo se usa | Detalles clave |
|---|---|---|
| **Android (APK y Play Store)** | Con una mano, en el mostrador | Voz con complemento nativo (el dictado del navegador no funciona dentro de la APK), cámara, ticketera Bluetooth, sin internet |
| **Web (PWA)** | Desde cualquier navegador; se instala como app | Mismo código; teclado y atajos en computadora |
| **Tablet** | Apoyada en el mostrador, en horizontal | Modo caja: productos frecuentes a la izquierda, factura a la derecha |
| **WhatsApp** | Sin instalar nada | El bot ya programado; falta activarlo en Meta |

## 6. Inteligencia (lo que la hace "muy inteligente")
- **Hoy:** reglas propias para entender el chat; lectura de texto de fotos dentro del celular; dictado del navegador.
- **Propuesta:** un modelo de IA en el servidor que entienda frases libres, notas de voz y fotos
  borrosas y devuelva cliente y productos ya ordenados. Costo bajo por factura con un modelo pequeño
  y rápido; la app siempre muestra la tarjeta para confirmar, así un error de la IA nunca se emite solo.
- Aprende los clientes y productos frecuentes de cada negocio para sugerirlos.

## 7. Cuánto falta: avance de la app por área
**Avance de la app estrella: 38 %.** El motor y las piezas existen; falta unirlas en el flujo final,
los dos estilos y llevarlo bien a cada dispositivo.

| # | Área de la app | Avance | Qué ya existe | Qué falta |
|---|---|---|---|---|
| 1 | Motor de factura SRI | 85 % | Emisión real, tests, un solo pipeline | Reintento automático; validar con firma real en pruebas |
| 2 | Configuración en 3 pasos | 45 % | Lectura del PDF del RUC, subida de firma | Unirlo en un asistente de 3 pasos; foto del RUC; elegir estilo |
| 3 | Factura por chat dentro de la app | 25 % | El intérprete ya funciona en el bot de WhatsApp | La pantalla de chat y la tarjeta de confirmación en la app |
| 4 | Factura por voz | 35 % | Dictado en español de Ecuador (navegador) | Complemento nativo en Android; conectar al chat |
| 5 | Factura por foto | 30 % | Lectura de texto en el celular | Más precisión (IA en el servidor); cédula → cliente |
| 6 | Dos estilos (Clásico y Minimalista) | 15 % | Estilo Clásico completo | Estilo Minimalista, selector, dos plantillas del RIDE |
| 7 | Facilidad y accesibilidad | 45 % | Modo Tranquilo, botón Ayúdame | Letra ≥16 px, botones ≥44 px, menos controles (ver auditoría en `docs/ESTADO.md`) |
| 8 | Lo opcional al final (pago y detalles) | 20 % | Forma de pago visible en la factura | Plegar en "Más opciones" al final |
| 9 | Animaciones con propósito | 40 % | Bloc 3D, efectos de papel | Animación de emitir en ambos estilos; quitar lo que distrae |
| 10 | Después de emitir (PDF, WhatsApp, imprimir) | 35 % | Ticket térmico, correo sin PDF | RIDE en PDF, envío por WhatsApp |
| 11 | Corregir (anular y repetir) | 5 % | — | Nota de crédito con un toque |
| 12 | Sin internet | 30 % | Cola local básica | Envío garantizado y aviso claro |
| 13 | Android en Play Store | 35 % | Capacitor, APK sin conexión | Versión firmada, permisos, Bluetooth, publicar |
| 14 | Tablet (modo caja) | 20 % | Diseño adaptable básico | Pantalla en horizontal tipo caja |
| 15 | Web instalable (PWA) | 60 % | Service worker y manifiesto | Pulir instalación y actualización |
| 16 | Inteligencia con IA | 10 % | Reglas del intérprete | IA en el servidor para texto, voz y foto |
| 17 | Planes y pagos dentro de la app | 5 % | Diseño en `docs/negocio/PLANES_Y_PAGOS.md` | Medidor amable, pantalla de planes, cobro |

## 8. Orden recomendado para construir
1. **Facilidad primero:** letra, botones y menos controles (lo que encontró la auditoría).
2. **Factura por chat en la app** (reusa el intérprete de WhatsApp) + **lo opcional al final**.
3. **Configuración en 3 pasos** con el PDF del RUC.
4. **Estilo Minimalista** y el selector de estilos.
5. **RIDE en PDF** y envío por WhatsApp.
6. **Android en Play Store** (voz nativa, cámara, Bluetooth) y **modo caja para tablet**.
7. **IA en el servidor** para voz y fotos.
8. **Planes y pagos.**

## 9. Protección de la marca y los derechos
Investigación en `docs/negocio/COMPETENCIA_Y_PROTECCION.md`. En general, en Ecuador lo que protege a
una app es el **registro de la marca** (nombre y logo) y los **derechos de autor** del software y el
diseño; el software por sí solo normalmente no se patenta. Confirmar con un abogado de propiedad
intelectual.
