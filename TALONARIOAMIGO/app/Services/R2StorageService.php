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
        $this->accountId = env('CLOUDFLARE_ACCOUNT_ID', env('R2_ACCOUNT_ID'));
        $this->accessKey = env('R2_ACCESS_KEY_ID');
        $this->secretKey = env('R2_SECRET_ACCESS_KEY');
        $this->endpoint  = env('R2_ENDPOINT');
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
