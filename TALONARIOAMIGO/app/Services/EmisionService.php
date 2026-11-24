<?php

namespace App\Services;

use App\Models\ClienteFrecuente;
use App\Models\Comprobante;
use App\Models\ComprobanteItem;
use App\Models\PuntoEmision;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Pipeline único de emisión de facturas: validación pre-flight del emisor y su firma, cuadre de
 * totales, secuencial con bloqueo, firma, envío y autorización SRI, persistencia y correo.
 *
 * Lo usan el facturador web/APK (FacturacionElectronicaController) y el canal de WhatsApp,
 * así ambos emiten exactamente igual.
 */
class EmisionService
{
    private $facturacion;
    private $validator;

    public function __construct(FacturacionElectronicaLibrary $facturacion, InvoiceValidationService $validator)
    {
        $this->facturacion = $facturacion;
        $this->validator = $validator;
    }

    /** Reglas de validación del payload de emisión (cliente + ítems). */
    public static function reglas(): array
    {
        return [
            'cliente.nombre' => 'required|string|max:255',
            'cliente.identificacion' => 'required|string',
            'cliente.direccion' => 'nullable|string',
            'cliente.telefono' => 'nullable|string',
            'cliente.email' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.descripcion' => 'required|string',
            'items.*.cantidad' => 'required|numeric|min:0.000001',
            'items.*.precioUnitario' => 'required|numeric|min:0',
            'items.*.exento' => 'nullable|boolean',
        ];
    }

    /**
     * Emite una factura para el emisor del usuario.
     *
     * @return array{status:int, body:array} status HTTP sugerido y cuerpo de la respuesta.
     */
    public function emitir(User $user, array $data): array
    {
        $emisor = $user->emisor;

        // 1. Validación Pre-Flight de Emisor y Certificado .p12
        $emisorVal = $this->validator->validarEmisorYFirma($emisor);
        if (!$emisorVal['valido']) {
            return $this->respuesta([
                'success' => false,
                'code' => $emisorVal['codigo'],
                'titulo' => $emisorVal['titulo'],
                'message' => $emisorVal['mensaje'],
                'solucion' => $emisorVal['solucion'] ?? null,
            ], 422);
        }

        $puntoEmision = $emisorVal['puntoEmision'];
        $certContent = $emisorVal['certContent'];
        $clave = $emisorVal['clave'];


        // 2. Validación Algorítmica de Cliente (Módulo 10/11), Regla $50 y Cuadre de Totales
        $totalesVal = $this->validator->validarClienteYTotales($data['cliente'], $data['items']);
        if (!$totalesVal['valido']) {
            return $this->respuesta([
                'success' => false,
                'code' => $totalesVal['codigo'],
                'titulo' => $totalesVal['titulo'],
                'message' => $totalesVal['mensaje'],
                'solucion' => $totalesVal['solucion'] ?? null,
            ], 422);
        }

        $detalle = $totalesVal['detalle'];
        $subtotalGravado = $totalesVal['subtotalGravado'];
        $subtotalExento = $totalesVal['subtotalExento'];
        $totalSinImpuestos = $totalesVal['totalSinImpuestos'];
        $ivaValor = $totalesVal['ivaValor'];
        $importeTotal = $totalesVal['importeTotal'];
        $tarifaCodigo = $totalesVal['tarifaCodigo'];
        $tipoIdentificacion = $totalesVal['tipoIdentificacion'];
        $identificacion = $totalesVal['identificacion'];

        $codigoNumerico = str_pad((string) random_int(0, 99999999), 8, '0', STR_PAD_LEFT);
        $fechaEmision = now()->setTimezone('America/Guayaquil');

        try {
            $resultado = DB::transaction(function () use (
                $puntoEmision, $emisor, $fechaEmision, $codigoNumerico, $data, $detalle,
                $totalSinImpuestos, $ivaValor, $importeTotal, $subtotalGravado, $tarifaCodigo,
                $tipoIdentificacion, $identificacion, $certContent, $clave
            ) {
                $puntoEmisionLocked = PuntoEmision::where('id', $puntoEmision->id)->lockForUpdate()->first();
                $secuencial = $puntoEmisionLocked->obtenerYIncrementarSecuencial('factura');

                $claveAcceso = $this->facturacion->generarClaveAcceso(
                    $fechaEmision->format('d/m/Y'),
                    '01',
                    $emisor->ruc,
                    $emisor->ambiente,
                    $puntoEmisionLocked->establecimiento . $puntoEmisionLocked->punto_emision,
                    $secuencial,
                    $codigoNumerico,
                    $emisor->tipo_emision
                );

                $regimenCodigo = in_array($emisor->tipo_regimen, ['RIMPE_EMPRENDEDOR', 'RIMPE_POPULAR'], true) ? '3' : '';

                $payload = (object) [
                    'infoTributaria' => (object) [
                        'ambiente' => $emisor->ambiente,
                        'tipoEmision' => $emisor->tipo_emision,
                        'razonSocial' => $emisor->razon_social,
                        'nombreComercial' => $emisor->nombre_comercial ?: $emisor->razon_social,
                        'ruc' => $emisor->ruc,
                        'claveAcceso' => $claveAcceso,
                        'codDoc' => '01',
                        'estab' => $puntoEmisionLocked->establecimiento,
                        'ptoEmi' => $puntoEmisionLocked->punto_emision,
                        'secuencial' => $secuencial,
                        'dirMatriz' => $emisor->direccion_matriz,
                        'regimen' => $regimenCodigo,
                    ],
                    'infoFactura' => (object) [
                        'fechaEmision' => $fechaEmision->format('Y-m-d'),
                        'dirEstablecimiento' => $emisor->direccion_matriz,
                        'contribuyenteEspecial' => $emisor->contribuyente_especial,
                        'obligadoContabilidad' => $emisor->obligado_contabilidad ? 'SI' : 'NO',
                        'tipoIdentificacionComprador' => $tipoIdentificacion,
                        'razonSocialComprador' => $data['cliente']['nombre'],
                        'identificacionComprador' => $identificacion,
                        'totalSinImpuestos' => number_format($totalSinImpuestos, 2, '.', ''),
                        'totalDescuento' => '0.00',
                        'totalImpuesto' => [
                            (object) [
                                'codigo' => '2',
                                'codigoPorcentaje' => $tarifaCodigo,
                                'baseImponible' => number_format($subtotalGravado, 2, '.', ''),
                                'valor' => number_format($ivaValor, 2, '.', ''),
                            ],
                        ],
                        'propina' => '0.00',
                        'importeTotal' => number_format($importeTotal, 2, '.', ''),
                        'moneda' => 'DOLAR',
                        'pagos' => (object) [
                            'formaPago' => '01',
                            'total' => number_format($importeTotal, 2, '.', ''),
                        ],
                    ],
                    'detalle' => $detalle,
                ];

                $xmlFirmado = $this->facturacion->generarYFirmarXml('factura', $payload, $certContent, $clave);
                $envio = $this->facturacion->enviarSri($xmlFirmado, $emisor->ambiente);
                $autorizacion = $this->facturacion->autorizarSri($claveAcceso, $emisor->ambiente);

                return [
                    'claveAcceso' => $claveAcceso,
                    'secuencial' => $secuencial,
                    'xmlFirmado' => $xmlFirmado,
                    'envio' => $envio,
                    'autorizacion' => $autorizacion,
                ];
            });
        } catch (\Throwable $e) {
            // El detalle técnico queda en el log; al comerciante le hablamos en palabras simples.
            \Log::error('[EmisionService] Error emitiendo comprobante: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'exception' => $e,
            ]);

            return $this->respuesta([
                'success' => false,
                'code' => 'EMISSION_FAILED',
                'titulo' => 'No pudimos enviar tu factura',
                'message' => 'Tu factura no se emitió todavía y no se perdió nada. Hubo un problema de conexión con el SRI.',
                'solucion' => 'Espera un momento y vuelve a tocar "Emitir factura ahora". Si se repite, toca "Ayúdame".',
            ], 500);
        }

        // 3. Diagnóstico Inteligente de la Respuesta SRI
        $diagnostico = $this->validator->diagnosticarRespuestaSri($resultado['autorizacion']);

        // Guardar XML firmado en Supabase Storage (con respaldo en disco local)
        $xmlPath = null;
        try {
            $storage = app(SupabaseStorageService::class);
            $xmlPath = $storage->guardarXml($resultado['claveAcceso'], $resultado['xmlFirmado'] ?? '');
        } catch (\Throwable $xmlEx) {
            \Log::warning("[EmisionService] Advertencia al persistir XML: " . $xmlEx->getMessage());
        }

        $emailEnviado = false;
        $comprobante = null;

        // 4. Persistencia en Base de Datos (Comprobantes, Ítems y Clientes Frecuentes)
        try {
            $fechaAut = null;
            if (!empty($diagnostico['fechaAutorizacion'])) {
                try {
                    $fechaAut = \Carbon\Carbon::parse($diagnostico['fechaAutorizacion']);
                } catch (\Throwable $t) {
                    $fechaAut = now();
                }
            } elseif ($diagnostico['esAutorizado']) {
                $fechaAut = now();
            }

            $comprobante = Comprobante::create([
                'emisor_id' => $emisor->id,
                'user_id' => $user->id,
                'tipo_comprobante' => '01',
                'establecimiento' => $puntoEmision->establecimiento,
                'punto_emision' => $puntoEmision->punto_emision,
                'secuencial' => $resultado['secuencial'],
                'numero_comprobante' => sprintf('%03d-%03d-%09d', (int)$puntoEmision->establecimiento, (int)$puntoEmision->punto_emision, (int)$resultado['secuencial']),
                'clave_acceso' => $resultado['claveAcceso'],
                'fecha_emision' => $fechaEmision,
                'fecha_autorizacion' => $fechaAut,
                'numero_autorizacion' => $diagnostico['numeroAutorizacion'] ?: ($diagnostico['esAutorizado'] ? $resultado['claveAcceso'] : null),
                'cliente_tipo_identificacion' => $tipoIdentificacion,
                'cliente_identificacion' => $identificacion,
                'cliente_nombre' => $data['cliente']['nombre'],
                'cliente_direccion' => $data['cliente']['direccion'] ?? null,
                'cliente_telefono' => $data['cliente']['telefono'] ?? null,
                'cliente_email' => $data['cliente']['email'] ?? null,
                'subtotal_gravado' => $subtotalGravado,
                'subtotal_exento' => $subtotalExento,
                'total_descuento' => 0.00,
                'total_iva' => $ivaValor,
                'importe_total' => $importeTotal,
                'tarifa_iva_porcentaje' => 15,
                'estado' => $diagnostico['estado'] ?? 'AUTORIZADO',
                'ambiente' => $emisor->ambiente,
                'tipo_emision' => $emisor->tipo_emision,
                'xml_path' => $xmlPath,
                'email_enviado' => false,
                'email_enviado_at' => null,
                'sri_mensaje' => $diagnostico['mensajeHumano'] ?? null,
            ]);

            foreach ($detalle as $item) {
                $isExento = isset($item->impuestos) && is_array($item->impuestos) && count($item->impuestos) > 0 && ($item->impuestos[0]->codigoPorcentaje ?? '') === '0';
                ComprobanteItem::create([
                    'comprobante_id' => $comprobante->id,
                    'codigo_principal' => $item->codigoPrincipal ?? null,
                    'descripcion' => $item->descripcion,
                    'cantidad' => $item->cantidad,
                    'precio_unitario' => $item->precioUnitario,
                    'descuento' => $item->descuento ?? 0.00,
                    'precio_total_sin_impuesto' => $item->precioTotalSinImpuesto,
                    'impuesto_codigo' => '2',
                    'impuesto_porcentaje_codigo' => $isExento ? '0' : '4',
                    'impuesto_tarifa' => $isExento ? 0.00 : 15.00,
                    'impuesto_valor' => $isExento ? 0.00 : round($item->precioTotalSinImpuesto * 0.15, 2),
                    'exento' => $isExento,
                ]);
            }

            // Actualizar o crear Cliente Frecuente (Principio 14)
            if (!in_array($identificacion, ['9999999999999', '9999999999'])) {
                $clienteFrecuente = ClienteFrecuente::firstOrNew([
                    'emisor_id' => $emisor->id,
                    'identificacion' => $identificacion,
                ]);
                $clienteFrecuente->tipo_identificacion = $tipoIdentificacion;
                $clienteFrecuente->nombre = $data['cliente']['nombre'];
                if (!empty($data['cliente']['direccion'])) $clienteFrecuente->direccion = $data['cliente']['direccion'];
                if (!empty($data['cliente']['telefono'])) $clienteFrecuente->telefono = $data['cliente']['telefono'];
                if (!empty($data['cliente']['email'])) $clienteFrecuente->email = $data['cliente']['email'];
                $clienteFrecuente->compras_count = ($clienteFrecuente->exists ? $clienteFrecuente->compras_count : 0) + 1;
                $clienteFrecuente->ultima_compra_at = now();
                $clienteFrecuente->save();
            }
        } catch (\Throwable $dbEx) {
            \Log::error("[EmisionService] Error guardando comprobante en Postgres: " . $dbEx->getMessage());
        }

        // Enlace firmado al PDF (RIDE) y correo al cliente (con el PDF adjunto si se pudo generar).
        $rideUrl = null;
        if ($comprobante && $diagnostico['esAutorizado']) {
            try {
                $rideUrl = RideService::urlFirmada($comprobante);
            } catch (\Throwable $e) {
                \Log::warning('[EmisionService] No se pudo firmar el enlace del PDF: ' . $e->getMessage());
            }
        }

        if ($diagnostico['esAutorizado'] && !empty($data['cliente']['email'])) {
            try {
                $adjuntos = [];
                if ($comprobante) {
                    try {
                        $adjuntos[] = [
                            'filename' => RideService::nombreArchivo($comprobante),
                            'content' => base64_encode(app(RideService::class)->generar($comprobante)),
                        ];
                    } catch (\Throwable $pdfEx) {
                        \Log::warning('[EmisionService] No se pudo generar el PDF para el correo: ' . $pdfEx->getMessage());
                    }
                }
                $emailEnviado = (bool) app(ResendService::class)->enviarComprobante(
                    $data['cliente']['email'],
                    $data['cliente']['nombre'],
                    sprintf('%03d-%03d-%09d', (int) $puntoEmision->establecimiento, (int) $puntoEmision->punto_emision, (int) $resultado['secuencial']),
                    "Factura Electrónica",
                    $importeTotal,
                    $rideUrl,
                    null,
                    $adjuntos
                );
                if ($emailEnviado && $comprobante) {
                    $comprobante->forceFill(['email_enviado' => true, 'email_enviado_at' => now()])->save();
                }
            } catch (\Throwable $mailEx) {
                \Log::warning("[EmisionService] Advertencia al despachar Resend: " . $mailEx->getMessage());
            }
        }

        return $this->respuesta([
            'success' => true,
            'estado' => $diagnostico['estado'],
            'claveAcceso' => $resultado['claveAcceso'],
            'secuencial' => $resultado['secuencial'],
            'numeroAutorizacion' => $diagnostico['numeroAutorizacion'],
            'fechaAutorizacion' => $diagnostico['fechaAutorizacion'],
            'mensaje' => $diagnostico['mensajeHumano'],
            'solucion' => $diagnostico['solucion'] ?? null,
            'diagnostico' => $diagnostico,
            'email_enviado' => $emailEnviado,
            'ride_url' => $rideUrl,
            'xml_guardado' => !empty($xmlPath),
            'envio_raw' => $resultado['envio'],
            'autorizacion_raw' => $resultado['autorizacion'],
        ], 200);
    }

    private function respuesta(array $body, int $status): array
    {
        return ['status' => $status, 'body' => $body];
    }
}
