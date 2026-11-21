<?php

namespace App\Http\Controllers;

use App\Jobs\ProcesarMensajeWhatsApp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Canal "factura por WhatsApp" sobre la WhatsApp Cloud API de Meta.
 *
 * - GET  /api/v1/whatsapp/webhook   verificación del webhook (hub.challenge).
 * - POST /api/v1/whatsapp/webhook   mensajes entrantes, firmados con X-Hub-Signature-256.
 * - GET/POST/DELETE /api/v1/whatsapp/vinculo  (con sesión) estado, código de vínculo, desvincular.
 */
class WhatsAppController extends Controller
{
    public function verificar(Request $request)
    {
        $esperado = config('services.whatsapp.verify_token');

        if (
            !empty($esperado)
            && $request->query('hub_mode') === 'subscribe'
            && hash_equals($esperado, (string) $request->query('hub_verify_token'))
        ) {
            return response((string) $request->query('hub_challenge'), 200)->header('Content-Type', 'text/plain');
        }

        return response('Forbidden', 403);
    }

    public function recibir(Request $request)
    {
        if (!$this->firmaValida($request)) {
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $mensajes = [];
        foreach ((array) $request->input('entry', []) as $entry) {
            foreach ((array) ($entry['changes'] ?? []) as $change) {
                foreach ((array) ($change['value']['messages'] ?? []) as $mensaje) {
                    $mensajes[] = $mensaje;
                }
            }
        }

        // Meta reintenta si no respondemos rápido y la emisión puede tardar (SOAP del SRI): se
        // responde 200 de inmediato y el mensaje se procesa después de enviar la respuesta.
        foreach ($mensajes as $mensaje) {
            if (empty($mensaje['id']) || empty($mensaje['from'])) {
                continue;
            }

            $tipo = $mensaje['type'] ?? 'text';
            ProcesarMensajeWhatsApp::dispatchAfterResponse(
                (string) $mensaje['id'],
                (string) $mensaje['from'],
                $tipo === 'text' ? ($mensaje['text']['body'] ?? '') : null,
                $tipo
            );
        }

        return response()->json(['status' => 'ok']);
    }

    /** Estado del vínculo para la pantalla de la app. */
    public function estado(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'vinculado' => !empty($user->whatsapp_number),
            'numero' => $user->whatsapp_number ? $this->enmascarar($user->whatsapp_number) : null,
            'bot_number' => config('services.whatsapp.bot_number'),
        ]);
    }

    /** Genera un código de un solo uso (15 min) que el usuario envía al bot: "VINCULAR 123456". */
    public function generarCodigo(Request $request)
    {
        $user = $request->user();

        do {
            $codigo = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            $hash = hash('sha256', $codigo);
        } while (\App\Models\User::where('whatsapp_link_code_hash', $hash)->where('id', '!=', $user->id)->exists());

        $user->forceFill([
            'whatsapp_link_code_hash' => $hash,
            'whatsapp_link_expires_at' => now()->addMinutes(15),
        ])->save();

        $bot = config('services.whatsapp.bot_number');
        $mensaje = 'VINCULAR ' . $codigo;

        return response()->json([
            'success' => true,
            'codigo' => $codigo,
            'mensaje' => $mensaje,
            'expira_en_minutos' => 15,
            'bot_number' => $bot,
            'link' => $bot ? 'https://wa.me/' . $bot . '?text=' . rawurlencode($mensaje) : null,
        ]);
    }

    public function desvincular(Request $request)
    {
        $request->user()->forceFill([
            'whatsapp_number' => null,
            'whatsapp_link_code_hash' => null,
            'whatsapp_link_expires_at' => null,
        ])->save();

        return response()->json(['success' => true, 'vinculado' => false]);
    }

    private function firmaValida(Request $request): bool
    {
        $secreto = config('services.whatsapp.app_secret');
        if (empty($secreto)) {
            Log::warning('[WhatsApp] Webhook rechazado: falta WHATSAPP_APP_SECRET.');
            return false;
        }

        $firma = (string) $request->header('X-Hub-Signature-256');
        $esperada = 'sha256=' . hash_hmac('sha256', $request->getContent(), $secreto);

        return $firma !== '' && hash_equals($esperada, $firma);
    }

    private function enmascarar(string $numero): string
    {
        return str_repeat('•', max(0, strlen($numero) - 4)) . substr($numero, -4);
    }
}
