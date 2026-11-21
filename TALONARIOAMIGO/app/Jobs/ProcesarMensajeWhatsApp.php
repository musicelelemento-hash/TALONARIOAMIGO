<?php

namespace App\Jobs;

use App\Services\WhatsApp\WhatsAppBot;
use App\Services\WhatsApp\WhatsAppClient;
use Illuminate\Bus\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Procesa un mensaje entrante de WhatsApp y envía la respuesta del bot.
 *
 * Es idempotente: Meta reenvía mensajes si no confirmamos a tiempo, así que el id del mensaje
 * se "reclama" en caché y un segundo intento con el mismo id no hace nada (no emite dos veces).
 */
class ProcesarMensajeWhatsApp
{
    use Dispatchable, Queueable;

    public function __construct(
        public string $mensajeId,
        public string $de,
        public ?string $texto,
        public string $tipo = 'text'
    ) {
    }

    public function handle(WhatsAppBot $bot, WhatsAppClient $client): void
    {
        if (!Cache::add('wa:msg:' . $this->mensajeId, true, now()->addDays(2))) {
            return;
        }

        try {
            $client->enviarTexto($this->de, $bot->responder($this->de, $this->texto, $this->tipo));
        } catch (\Throwable $e) {
            Log::error('[WhatsApp] Error procesando mensaje: ' . $e->getMessage(), ['exception' => $e]);
            $client->enviarTexto($this->de, 'Tuvimos un problema técnico 😕. No se emitió nada. Intenta de nuevo en un momento.');
        }
    }
}
