<?php

namespace App\Services;

use App\Models\Comprobante;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Support\Facades\URL;
use Picqer\Barcode\BarcodeGeneratorSVG;

/**
 * RIDE (representación impresa del comprobante electrónico): el PDF de la factura que el SRI
 * exige entregar al comprador. No usa recursos remotos y se lee bien en blanco y negro.
 */
class RideService
{
    public const ESTILOS = ['clasico', 'minimalista'];
    public const DIAS_ENLACE = 30;

    /** Devuelve los bytes del PDF. */
    public function generar(Comprobante $c, string $estilo = 'clasico'): string
    {
        if (!in_array($estilo, self::ESTILOS, true)) {
            $estilo = 'clasico';
        }

        $c->loadMissing(['items', 'emisor']);
        $emisor = $c->emisor;

        $html = view('ride.' . $estilo, [
            'c' => $c,
            'emisor' => $emisor,
            'items' => $c->items,
            'regimen' => $this->leyendaRegimen($emisor->tipo_regimen ?? null),
            'ambiente' => (string) $c->ambiente === '2' ? 'PRODUCCIÓN' : 'PRUEBAS',
            'barcode' => $this->codigoBarrasSvg((string) $c->clave_acceso),
            'subtotalGravado' => (float) $c->subtotal_gravado,
            'subtotalExento' => (float) $c->subtotal_exento,
        ])->render();

        $cache = storage_path('framework/cache/dompdf');
        if (!is_dir($cache)) {
            @mkdir($cache, 0775, true);
        }

        $options = new Options();
        $options->set('isRemoteEnabled', false);
        $options->set('isPhpEnabled', false);
        $options->set('defaultFont', 'DejaVu Sans');
        $options->set('fontCache', $cache);
        $options->set('tempDir', $cache);

        $pdf = new Dompdf($options);
        $pdf->loadHtml($html, 'UTF-8');
        $pdf->setPaper('A4', 'portrait');
        $pdf->render();

        return $pdf->output();
    }

    /** Nombre de archivo: factura-001-001-000000123.pdf */
    public static function nombreArchivo(Comprobante $c): string
    {
        return 'factura-' . preg_replace('/[^0-9\-]/', '', (string) $c->numero_comprobante) . '.pdf';
    }

    /**
     * Enlace público firmado que vence a los 30 días, para el cliente final.
     *
     * La firma cubre solo la ruta y los parámetros (firma "relativa"), no el esquema ni el host:
     * detrás del proxy de Render el servidor ve "http" aunque el cliente use "https", y una firma
     * absoluta daría 403. Así no hace falta confiar en todos los proxies (lo que permitiría falsear
     * la IP y saltarse el límite de intentos del login). El host lo pone APP_URL.
     */
    public static function urlFirmada(Comprobante $c): string
    {
        $ruta = URL::temporarySignedRoute('ride.publico', now()->addDays(self::DIAS_ENLACE), [
            'claveAcceso' => $c->clave_acceso,
        ], false);

        return rtrim((string) config('app.url'), '/') . $ruta;
    }

    private function leyendaRegimen(?string $tipo): ?string
    {
        return match ($tipo) {
            'RIMPE_EMPRENDEDOR' => 'CONTRIBUYENTE RÉGIMEN RIMPE',
            'RIMPE_POPULAR' => 'CONTRIBUYENTE NEGOCIO POPULAR - RÉGIMEN RIMPE',
            default => null,
        };
    }

    private function codigoBarrasSvg(string $clave): ?string
    {
        if ($clave === '') {
            return null;
        }
        try {
            $svg = (new BarcodeGeneratorSVG())->getBarcode($clave, BarcodeGeneratorSVG::TYPE_CODE_128, 1.2, 46);
            return 'data:image/svg+xml;base64,' . base64_encode($svg);
        } catch (\Throwable $e) {
            \Log::warning('[RideService] No se pudo generar el código de barras: ' . $e->getMessage());
            return null;
        }
    }
}
