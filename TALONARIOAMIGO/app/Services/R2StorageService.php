<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * Bóveda de comprobantes (XML firmado y PDF/RIDE).
 *
 * Escribe en Cloudflare R2 (S3-compatible) cuando las credenciales R2_* están
 * configuradas; si no, o si R2 no está disponible, cae al disco local sin
 * interrumpir la emisión. Requiere `league/flysystem-aws-s3-v3` instalado
 * (declarado en composer.json) para que el driver S3 de R2 funcione.
 */
class R2StorageService
{
    /**
     * Guardar XML firmado
     */
    public function guardarXml($claveAcceso, $xmlContent)
    {
        return $this->guardar("comprobantes/xml/{$claveAcceso}.xml", $xmlContent);
    }

    /**
     * Obtener XML firmado
     */
    public function obtenerXml($claveAcceso)
    {
        return $this->leer("comprobantes/xml/{$claveAcceso}.xml");
    }

    /**
     * Guardar PDF RIDE
     */
    public function guardarPdf($claveAcceso, $pdfContent)
    {
        return $this->guardar("comprobantes/pdf/{$claveAcceso}.pdf", $pdfContent);
    }

    /**
     * Obtener PDF RIDE
     */
    public function obtenerPdf($claveAcceso)
    {
        return $this->leer("comprobantes/pdf/{$claveAcceso}.pdf");
    }

    /**
     * ¿Están presentes las credenciales mínimas para usar R2?
     */
    private function usarR2(): bool
    {
        return !empty(env('R2_ACCESS_KEY_ID'))
            && !empty(env('R2_SECRET_ACCESS_KEY'))
            && !empty(env('R2_ENDPOINT'));
    }

    /**
     * Escribe en R2 si está configurado; si no (o si falla), en disco local.
     */
    private function guardar(string $path, $content)
    {
        if ($this->usarR2()) {
            try {
                Storage::disk('r2')->put($path, $content);
                Log::info("[R2Storage] Guardado en R2: {$path}");
                return $path;
            } catch (\Throwable $e) {
                Log::warning("[R2Storage] R2 no disponible ({$e->getMessage()}); usando disco local para {$path}.");
            }
        }

        Storage::disk('local')->put($path, $content);
        return $path;
    }

    /**
     * Lee desde R2 si está configurado; si no (o si falla), desde disco local.
     */
    private function leer(string $path)
    {
        if ($this->usarR2()) {
            try {
                $disk = Storage::disk('r2');
                if ($disk->exists($path)) {
                    return $disk->get($path);
                }
            } catch (\Throwable $e) {
                Log::warning("[R2Storage] Error leyendo de R2: " . $e->getMessage());
            }
        }

        $local = Storage::disk('local');
        return $local->exists($path) ? $local->get($path) : null;
    }
}
