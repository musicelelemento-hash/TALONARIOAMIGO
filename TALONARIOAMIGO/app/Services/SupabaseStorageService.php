<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * Bóveda de comprobantes (XML firmado y PDF/RIDE) en Supabase Storage.
 *
 * Sube/lee por la REST API de Supabase Storage cuando SUPABASE_URL y
 * SUPABASE_SERVICE_ROLE_KEY están configuradas; si no, o si Supabase falla,
 * cae al disco local sin interrumpir la emisión.
 */
class SupabaseStorageService
{
    private $url;
    private $key;
    private $bucket;

    public function __construct()
    {
        $this->url = rtrim((string) env('SUPABASE_URL', ''), '/');
        $this->key = env('SUPABASE_SERVICE_ROLE_KEY');
        $this->bucket = env('SUPABASE_STORAGE_BUCKET', 'talonario-amigo-vault');
    }

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

    private function configurado(): bool
    {
        return !empty($this->url) && !empty($this->key);
    }

    private function guardar(string $path, $content)
    {
        if ($this->configurado()) {
            try {
                $contentType = str_ends_with($path, '.pdf') ? 'application/pdf' : 'application/xml';
                $res = Http::withToken($this->key)
                    ->withHeaders(['apikey' => $this->key, 'x-upsert' => 'true'])
                    ->withBody($content, $contentType)
                    ->post("{$this->url}/storage/v1/object/{$this->bucket}/{$path}");

                if ($res->successful()) {
                    Log::info("[Storage] Guardado en Supabase Storage: {$path}");
                    return $path;
                }
                Log::warning("[Storage] Supabase Storage falló ({$res->status()}): " . $res->body());
            } catch (\Throwable $e) {
                Log::warning("[Storage] Supabase Storage no disponible: " . $e->getMessage());
            }
        }

        Storage::disk('local')->put($path, $content);
        return $path;
    }

    private function leer(string $path)
    {
        if ($this->configurado()) {
            try {
                $res = Http::withToken($this->key)
                    ->withHeaders(['apikey' => $this->key])
                    ->get("{$this->url}/storage/v1/object/{$this->bucket}/{$path}");

                if ($res->successful()) {
                    return $res->body();
                }
            } catch (\Throwable $e) {
                Log::warning("[Storage] Error leyendo de Supabase Storage: " . $e->getMessage());
            }
        }

        $local = Storage::disk('local');
        return $local->exists($path) ? $local->get($path) : null;
    }
}
