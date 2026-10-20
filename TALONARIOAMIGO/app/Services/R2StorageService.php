<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class R2StorageService
{
    private $accountId;
    private $accessKey;
    private $secretKey;
    private $endpoint;
    private $bucket;

    public function __construct()
    {
        $this->accountId = env('CLOUDFLARE_ACCOUNT_ID', env('R2_ACCOUNT_ID', '2bfe62a11b28461a4a5c5180341c9d85'));
        $this->accessKey = env('R2_ACCESS_KEY_ID', 'd2b42da39988788cd31a5eb495267f71');
        $this->secretKey = env('R2_SECRET_ACCESS_KEY', '29439a8b230c9c60a643f0995535a37b8fc05a604ea29ccaa6c1a634509dc346');
        $this->endpoint  = env('R2_ENDPOINT', 'https://2bfe62a11b28461a4a5c5180341c9d85.r2.cloudflarestorage.com');
        $this->bucket    = env('R2_BUCKET', env('R2_BUCKET_NAME', 'talonario-amigo-vault'));
    }

    /**
     * Guardar XML firmado en almacenamiento local / R2
     */
    public function guardarXml($claveAcceso, $xmlContent)
    {
        $path = "comprobantes/xml/{$claveAcceso}.xml";
        Storage::disk('local')->put($path, $xmlContent);
        return $path;
    }

    /**
     * Obtener XML firmado
     */
    public function obtenerXml($claveAcceso)
    {
        $path = "comprobantes/xml/{$claveAcceso}.xml";
        if (Storage::disk('local')->exists($path)) {
            return Storage::disk('local')->get($path);
        }
        return null;
    }

    /**
     * Guardar PDF RIDE
     */
    public function guardarPdf($claveAcceso, $pdfContent)
    {
        $path = "comprobantes/pdf/{$claveAcceso}.pdf";
        Storage::disk('local')->put($path, $pdfContent);
        return $path;
    }

    /**
     * Obtener PDF RIDE
     */
    public function obtenerPdf($claveAcceso)
    {
        $path = "comprobantes/pdf/{$claveAcceso}.pdf";
        if (Storage::disk('local')->exists($path)) {
            return Storage::disk('local')->get($path);
        }
        return null;
    }
}
