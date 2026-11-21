# Factura por WhatsApp — puesta en marcha

El comerciante escribe la venta como la diría en voz alta, el bot le muestra el total y la
factura **solo se emite cuando responde "SI"**. Por debajo se usa el mismo pipeline de emisión
que el facturador web/APK (`App\Services\EmisionService`).

```
Factura a Juan Pérez 0912345678
2 colas a 0.50
1 pan a 0.25
```

## Cómo funciona

1. En la app: **Mostrador → WhatsApp → Conectar mi WhatsApp**. Se genera un código de un solo uso
   (15 minutos) y un botón que abre WhatsApp con el mensaje `VINCULAR 123456` ya escrito.
2. El comerciante lo envía al número del bot y su número queda vinculado a la cuenta.
3. Desde ahí escribe facturas. El bot responde con el resumen (subtotal, IVA 15 %, total) y espera
   **SI** o **NO** (el borrador vence en 30 minutos).
4. Con **SI** emite al SRI y responde con el número de factura y la clave de acceso.

Formatos que entiende: productos por línea o separados por coma / punto y coma,
`2 colas a 0.50`, `2 x cola 0.50`, `pan 0,25` (cantidad 1), `$1,50 c/u`,
`consumidor final` (o sin cliente) y cliente con cédula/RUC y correo opcional.
Los precios son **sin IVA**, igual que en el facturador.

## Seguridad

- El webhook solo acepta mensajes con la firma `X-Hub-Signature-256` válida (`WHATSAPP_APP_SECRET`).
  Sin esa variable, rechaza todo.
- El número se vincula solo con un código generado desde una sesión iniciada; se guarda su hash,
  es de un solo uso y hay bloqueo tras 5 intentos fallidos por número.
- Cada mensaje de Meta se procesa una sola vez (Meta reintenta), así que nunca se emite dos veces.
- Nada se emite sin la confirmación "SI".

## Configuración en Meta (una sola vez)

1. En <https://developers.facebook.com/> crea una app de tipo **Empresa** y agrega el producto
   **WhatsApp**.
2. En **WhatsApp → Configuración de la API** registra el número del bot y copia el
   **Phone number ID**.
3. Crea un **token permanente** con un *System User* en el Business Manager, con los permisos
   `whatsapp_business_messaging` y `whatsapp_business_management`.
4. En **Configuración de la app → Básica** copia el **App secret**.
5. En **WhatsApp → Configuración → Webhook**:
   - URL: `https://<tu-servicio>.onrender.com/api/v1/whatsapp/webhook`
   - Token de verificación: el mismo texto que pongas en `WHATSAPP_VERIFY_TOKEN`.
   - Suscríbete al campo **messages**.

## Variables de entorno (Render)

| Variable | Valor |
|---|---|
| `WHATSAPP_TOKEN` | Token permanente del System User |
| `WHATSAPP_PHONE_NUMBER_ID` | Phone number ID del bot |
| `WHATSAPP_VERIFY_TOKEN` | Texto que tú inventas (el mismo del paso 5) |
| `WHATSAPP_APP_SECRET` | App secret de la app de Meta |
| `WHATSAPP_BOT_NUMBER` | Número del bot, solo dígitos (ej. `593980000000`) |

Después de desplegar, ejecuta las migraciones (`POST /api/health/migrate` con `X-Migrate-Token`)
para crear `users.whatsapp_number` y la tabla `whatsapp_conversaciones`.

## Costos

Las respuestas que el bot envía dentro de las 24 h siguientes a un mensaje del comerciante son
mensajes de servicio, que Meta no cobra con su esquema de precios actual. Verifica la tabla
vigente en la página de precios de WhatsApp Business antes de lanzar. Las plantillas
proactivas (por ejemplo, recordatorios) sí tienen costo.

## Pendiente (siguientes pasos)

- Audios: transcribir notas de voz (hoy el bot pide escribir).
- Enviar el RIDE en PDF como documento en el mismo chat.
- Procesar en una cola real (hoy corre después de responder a Meta, en el mismo proceso).
