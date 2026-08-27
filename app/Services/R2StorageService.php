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
        $this->accountId = env('R2_ACCOUNT_ID', '2bfe62a11b28461a4a5c5180341c9d85');
        $this->accessKey = env('R2_ACCESS_KEY_ID', '7435076ce3f5e8635a35eb4b585db72b');
        $this->secretKey = env('R2_SECRET_ACCESS_KEY', '31bd50995a41dfbe6c48a99ee1a6287861a5eedb8b5dfefc3c8b9186330b6dc3');
        $this->endpoint  = env('R2_ENDPOINT', 'https://2bfe62a11b28461a4a5c5180341c9d85.r2.cloudflarestorage.com');
        $this->bucket    = env('R2_BUCKET_NAME', 'talonario-amigo-invoices');
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
     * Guardar PDF RIDE
     */
    public function guardarPdf($claveAcceso, $pdfContent)
    {
        $path = "comprobantes/pdf/{$claveAcceso}.pdf";
        Storage::disk('local')->put($path, $pdfContent);
        return $path;
    }
}
