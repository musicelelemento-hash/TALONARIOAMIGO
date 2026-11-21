<?php

namespace App\Services\WhatsApp;

use App\Models\User;
use App\Models\WhatsappConversacion;
use App\Services\EmisionService;
use App\Services\InvoiceValidationService;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Conversación de "factura por WhatsApp".
 *
 * Flujo: el comerciante vincula su número una vez (código de 6 dígitos generado en la app),
 * escribe la factura como habla, el bot le muestra el resumen con totales y solo emite cuando
 * responde "SI". Nunca se emite nada sin esa confirmación explícita.
 */
class WhatsAppBot
{
    private const MINUTOS_BORRADOR = 30;

    private $parser;
    private $validator;
    private $emision;

    public function __construct(MensajeFacturaParser $parser, InvoiceValidationService $validator, EmisionService $emision)
    {
        $this->parser = $parser;
        $this->validator = $validator;
        $this->emision = $emision;
    }

    /**
     * Procesa un mensaje entrante y devuelve el texto de respuesta.
     *
     * @param string      $numero Número del remitente (solo dígitos, como lo entrega Meta).
     * @param string|null $texto  Texto del mensaje, o null si no es texto (audio, imagen…).
     */
    public function responder(string $numero, ?string $texto, string $tipo = 'text'): string
    {
        $numero = preg_replace('/\D/', '', $numero);
        $texto = trim((string) $texto);
        $comando = $this->normalizar($texto);

        $user = User::where('whatsapp_number', $numero)->first();

        if (!$user) {
            if (preg_match('/^vincular\s*(\d{6})$/', $comando, $m)) {
                return $this->vincular($numero, $m[1]);
            }

            return "👋 ¡Hola! Soy *Talonario Amigo*.\n\n"
                . "Este número todavía no está conectado a tu cuenta.\n"
                . "1. Abre la app Talonario Amigo.\n"
                . "2. Toca *Facturar por WhatsApp*.\n"
                . "3. Envíame aquí el mensaje que te aparece (por ejemplo: VINCULAR 123456).";
        }

        if (!$user->is_active) {
            return "Tu cuenta está pausada por ahora. Escríbenos y te ayudamos a reactivarla: wa.me/"
                . ($user->whatsapp_support ?: env('DEFAULT_SUPPORT_WHATSAPP', '593999999999'));
        }

        $conversacion = WhatsappConversacion::firstOrCreate(
            ['whatsapp_number' => $numero],
            ['user_id' => $user->id]
        );

        if ($tipo !== 'text') {
            return "Por ahora solo entiendo mensajes escritos ✍️. Escríbeme la factura así:\n\n" . $this->ejemplo();
        }

        if (in_array($comando, ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'ayuda', 'menu', '?'], true)) {
            return "¡Hola, {$user->name}! 😊 Escríbeme la factura como la dirías en voz alta:\n\n"
                . $this->ejemplo()
                . "\n\nTe muestro el total y solo la emito cuando me respondas *SI*.";
        }

        $borrador = $conversacion->borradorVigente();

        if (in_array($comando, ['si', 'sii', 'ok', 'dale', 'confirmo', 'emitir', 'emitela', 'listo'], true)) {
            if (!$borrador) {
                return "No tengo ninguna factura esperando. Escríbeme una nueva:\n\n" . $this->ejemplo();
            }

            $conversacion->limpiarBorrador();
            return $this->emitir($user, $borrador);
        }

        if (in_array($comando, ['no', 'cancelar', 'cancela', 'borrar', 'anular'], true)) {
            $conversacion->limpiarBorrador();
            return "Listo, no emití nada. 👍 Cuando quieras, escríbeme otra factura.";
        }

        return $this->prepararBorrador($user, $conversacion, $texto);
    }

    private function prepararBorrador(User $user, WhatsappConversacion $conversacion, string $texto): string
    {
        $emisorVal = $this->validator->validarEmisorYFirma($user->emisor);
        if (!$emisorVal['valido']) {
            return "Antes de facturar falta un paso: *{$emisorVal['titulo']}*.\n"
                . $emisorVal['mensaje']
                . "\nHazlo una sola vez desde la app y vuelve a escribirme.";
        }

        $parsed = $this->parser->parse($texto);
        if (!$parsed['ok']) {
            return "🤔 {$parsed['error']}\n\nEjemplo:\n" . $this->ejemplo();
        }

        $totales = $this->validator->validarClienteYTotales($parsed['cliente'], $parsed['items']);
        if (!$totales['valido']) {
            return "⚠️ *{$totales['titulo']}*\n{$totales['mensaje']}"
                . (!empty($totales['solucion']) ? "\n👉 {$totales['solucion']}" : '');
        }

        $conversacion->forceFill([
            'user_id' => $user->id,
            'borrador' => ['cliente' => $parsed['cliente'], 'items' => $parsed['items']],
            'borrador_expira_at' => now()->addMinutes(self::MINUTOS_BORRADOR),
        ])->save();

        $lineas = [];
        foreach ($parsed['items'] as $item) {
            $lineas[] = sprintf(
                '• %s %s × $%s = $%s',
                $this->cantidad($item['cantidad']),
                $item['descripcion'],
                $this->dinero($item['precioUnitario']),
                $this->dinero(round($item['cantidad'] * $item['precioUnitario'], 2))
            );
        }

        $cliente = $parsed['cliente']['identificacion'] === MensajeFacturaParser::CONSUMIDOR_FINAL
            ? 'Consumidor final'
            : "{$parsed['cliente']['nombre']} ({$parsed['cliente']['identificacion']})";

        return "🧾 *Revisa tu factura*\n"
            . "Cliente: {$cliente}\n\n"
            . implode("\n", $lineas) . "\n\n"
            . 'Subtotal: $' . $this->dinero($totales['totalSinImpuestos']) . "\n"
            . 'IVA 15%: $' . $this->dinero($totales['ivaValor']) . "\n"
            . '*Total: $' . $this->dinero($totales['importeTotal']) . "*\n\n"
            . "¿La emito al SRI? Responde *SI* o *NO*.";
    }

    private function emitir(User $user, array $borrador): string
    {
        $resultado = $this->emision->emitir($user, $borrador);
        $body = $resultado['body'];

        if (empty($body['success'])) {
            return '😕 ' . ($body['titulo'] ?? 'No pudimos emitir la factura') . "\n"
                . ($body['message'] ?? '')
                . "\n\nNo se emitió nada. Puedes volver a enviarme la factura en un momento.";
        }

        $numero = sprintf('001-001-%09d', (int) ($body['secuencial'] ?? 0));

        if (($body['estado'] ?? null) === 'AUTORIZADO') {
            return "✅ *¡Listo! Factura {$numero} autorizada por el SRI.*\n"
                . "Clave de acceso:\n{$body['claveAcceso']}\n\n"
                . (!empty($body['email_enviado']) ? "📧 Ya se la envié a tu cliente por correo.\n" : '')
                . "La encuentras también en la app, en *Mis facturas*.";
        }

        return "🕐 Factura {$numero} enviada. "
            . ($body['mensaje'] ?? 'El SRI todavía la está revisando.')
            . "\nTe la dejo guardada en la app, en *Mis facturas*.";
    }

    private function vincular(string $numero, string $codigo): string
    {
        $llave = 'wa-vincular:' . $numero;
        if (RateLimiter::tooManyAttempts($llave, 5)) {
            return 'Demasiados intentos. Espera unos minutos y genera un código nuevo en la app.';
        }

        $user = User::where('whatsapp_link_code_hash', hash('sha256', $codigo))
            ->where('whatsapp_link_expires_at', '>', now())
            ->first();

        if (!$user) {
            RateLimiter::hit($llave, 15 * 60);
            return 'Ese código no es válido o ya venció. Genera uno nuevo en la app (dura 15 minutos).';
        }

        RateLimiter::clear($llave);

        // Un número solo puede estar en una cuenta: si estaba en otra, se libera.
        User::where('whatsapp_number', $numero)->where('id', '!=', $user->id)->update(['whatsapp_number' => null]);

        $user->forceFill([
            'whatsapp_number' => $numero,
            'whatsapp_link_code_hash' => null,
            'whatsapp_link_expires_at' => null,
        ])->save();

        WhatsappConversacion::updateOrCreate(['whatsapp_number' => $numero], ['user_id' => $user->id, 'borrador' => null]);

        return "🎉 ¡Listo, {$user->name}! Tu WhatsApp quedó conectado.\n\n"
            . "Desde ahora me puedes escribir tus facturas aquí:\n\n" . $this->ejemplo();
    }

    private function ejemplo(): string
    {
        return "Factura a Juan Pérez 0912345678\n2 colas a 0.50\n1 pan a 0.25\n\n"
            . "(Si no sabes los datos del cliente, escribe *consumidor final*. Precios sin IVA.)";
    }

    private function normalizar(string $texto): string
    {
        $t = mb_strtolower(trim($texto));
        $t = strtr($t, ['á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u', 'ü' => 'u']);
        $t = preg_replace('/[¡!¿.,]+/u', '', $t);

        return trim(preg_replace('/\s+/u', ' ', $t));
    }

    private function dinero(float $valor): string
    {
        return number_format($valor, 2, '.', ',');
    }

    private function cantidad(float $valor): string
    {
        return rtrim(rtrim(number_format($valor, 3, '.', ''), '0'), '.');
    }
}
