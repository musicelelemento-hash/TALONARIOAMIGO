<?php

namespace App\Services\WhatsApp;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Envío de mensajes por la WhatsApp Cloud API de Meta.
 */
class WhatsAppClient
{
    public function configurado(): bool
    {
        return !empty(config('services.whatsapp.token')) && !empty(config('services.whatsapp.phone_number_id'));
    }

    public function enviarTexto(string $para, string $texto): bool
    {
        if (!$this->configurado()) {
            Log::warning('[WhatsApp] Envío omitido: falta WHATSAPP_TOKEN o WHATSAPP_PHONE_NUMBER_ID.');
            return false;
        }

        $url = sprintf(
            'https://graph.facebook.com/%s/%s/messages',
            config('services.whatsapp.graph_version', 'v21.0'),
            config('services.whatsapp.phone_number_id')
        );

        try {
            $response = Http::withToken(config('services.whatsapp.token'))
                ->timeout(15)
                ->post($url, [
                    'messaging_product' => 'whatsapp',
                    'to' => $para,
                    'type' => 'text',
                    'text' => ['preview_url' => false, 'body' => mb_substr($texto, 0, 4096)],
                ]);

            if ($response->failed()) {
                Log::warning('[WhatsApp] Meta rechazó el mensaje', ['status' => $response->status()]);
                return false;
            }

            return true;
        } catch (\Throwable $e) {
            Log::warning('[WhatsApp] Error enviando mensaje: ' . $e->getMessage());
            return false;
        }
    }
}
