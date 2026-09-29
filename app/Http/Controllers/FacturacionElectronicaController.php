<?php

namespace App\Http\Controllers;

use App\Models\PuntoEmision;
use App\Services\FacturacionElectronicaLibrary;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class FacturacionElectronicaController extends Controller
{
    private $facturacion;

    public function __construct(FacturacionElectronicaLibrary $facturacion)
    {
        $this->facturacion = $facturacion;
    }

    /**
     * Orquesta el pipeline real de emisión: arma el XML de factura a partir de los datos
     * tributarios del emisor logueado, lo firma con su .p12, lo envía al SRI y consulta
     * la autorización. No fabrica ningún resultado: si un paso falla, se devuelve el error real.
     */
    public function emitirFactura(Request $request)
    {
        $user = $request->user();
        $emisor = $user->emisor;

        if (!$emisor || empty($emisor->ruc)) {
            return response()->json([
                'success' => false,
                'code' => 'PENDING_ONBOARDING',
                'message' => 'Completa tus datos tributarios (RUC, razón social) antes de emitir.',
            ], 422);
        }

        if (empty($emisor->firma_p12_path)) {
            return response()->json([
                'success' => false,
                'code' => 'MISSING_SIGNATURE',
                'message' => 'Debes vincular tu firma electrónica .p12 antes de emitir.',
            ], 422);
        }

        $data = $request->validate([
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
        ]);

        $puntoEmision = $emisor->puntosEmision()->where('is_active', true)->first();
        if (!$puntoEmision) {
            return response()->json([
                'success' => false,
                'message' => 'No hay un punto de emisión activo configurado para tu RUC.',
            ], 422);
        }

        if (!Storage::disk('local')->exists($emisor->firma_p12_path)) {
            return response()->json([
                'success' => false,
                'message' => 'No se encontró el archivo de tu firma electrónica. Vuelve a vincularla en Mi Cuenta.',
            ], 422);
        }

        $certContent = Storage::disk('local')->get($emisor->firma_p12_path);
        $clave = $emisor->firma_password;
        if (!$clave) {
            return response()->json([
                'success' => false,
                'message' => 'No se pudo leer la contraseña de tu firma. Vuelve a vincularla en Mi Cuenta.',
            ], 422);
        }

        // IVA general vigente desde abril/2024 (Ley Orgánica de Eficiencia Económica): 15%, código SRI "4".
        // Verifica con tu contador si tu régimen/producto aplica una tarifa distinta.
        $tarifaCodigo = '4';
        $tarifaPorcentaje = 15;

        $subtotalGravado = 0.0;
        $subtotalExento = 0.0;
        $detalle = [];
        foreach ($data['items'] as $item) {
            $cantidad = (float) $item['cantidad'];
            $precio = (float) $item['precioUnitario'];
            $totalSinImpuesto = round($cantidad * $precio, 2);
            $exento = !empty($item['exento']);

            if ($exento) {
                $subtotalExento += $totalSinImpuesto;
            } else {
                $subtotalGravado += $totalSinImpuesto;
            }

            $detalle[] = (object) [
                'codigoPrincipal' => 'ITEM',
                'codigoAuxiliar' => '',
                'descripcion' => $item['descripcion'],
                'cantidad' => number_format($cantidad, 6, '.', ''),
                'precioUnitario' => number_format($precio, 6, '.', ''),
                'descuento' => '0.00',
                'precioTotalSinImpuesto' => number_format($totalSinImpuesto, 2, '.', ''),
                'impuesto' => (object) [
                    'codigo' => '2',
                    'codigoPorcentaje' => $exento ? '0' : $tarifaCodigo,
                    'tarifa' => $exento ? 0 : $tarifaPorcentaje,
                    'baseImponible' => number_format($totalSinImpuesto, 2, '.', ''),
                    'valor' => number_format($exento ? 0 : $totalSinImpuesto * $tarifaPorcentaje / 100, 2, '.', ''),
                ],
            ];
        }

        $ivaValor = round($subtotalGravado * $tarifaPorcentaje / 100, 2);
        $totalSinImpuestos = round($subtotalGravado + $subtotalExento, 2);
        $importeTotal = round($totalSinImpuestos + $ivaValor, 2);

        $identificacion = preg_replace('/[^0-9]/', '', $data['cliente']['identificacion']);
        $tipoIdentificacion = match (true) {
            $identificacion === '9999999999999' => '07',
            strlen($identificacion) === 13 => '04',
            strlen($identificacion) === 10 => '05',
            default => '05',
        };

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
                    'envio' => $envio,
                    'autorizacion' => $autorizacion,
                ];
            });
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'No se pudo emitir el comprobante: ' . $e->getMessage(),
            ], 500);
        }

        $estado = $this->extraerEstadoAutorizacion($resultado['autorizacion']);

        // Despacho transaccional automático vía Resend si el cliente o comercio proveyó correo
        $emailEnviado = false;
        if (!empty($data['cliente']['email'])) {
            try {
                $resend = app(\App\Services\ResendService::class);
                $emailEnviado = $resend->enviarComprobante(
                    $data['cliente']['email'],
                    $data['cliente']['nombre'],
                    "001-001-" . $resultado['secuencial'],
                    "Factura Electrónica",
                    $importeTotal
                );
            } catch (\Throwable $mailEx) {
                \Log::warning("[FacturacionController] Advertencia al despachar Resend: " . $mailEx->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'estado' => $estado['estado'],
            'claveAcceso' => $resultado['claveAcceso'],
            'secuencial' => $resultado['secuencial'],
            'numeroAutorizacion' => $estado['numeroAutorizacion'],
            'fechaAutorizacion' => $estado['fechaAutorizacion'],
            'mensaje' => $estado['mensaje'],
            'email_enviado' => $emailEnviado,
            'envio_raw' => $resultado['envio'],
            'autorizacion_raw' => $resultado['autorizacion'],
        ], Response::HTTP_OK);
    }

    /**
     * Permite volver a consultar el estado de autorización de un comprobante ya enviado,
     * por si el SRI todavía lo estaba procesando en el momento de la emisión.
     */
    public function consultarEstado(Request $request, $claveAcceso)
    {
        $user = $request->user();
        $emisor = $user->emisor;

        if (!$emisor) {
            return response()->json(['success' => false, 'message' => 'No tienes datos tributarios configurados.'], 422);
        }

        $autorizacion = $this->facturacion->autorizarSri($claveAcceso, $emisor->ambiente);
        $estado = $this->extraerEstadoAutorizacion($autorizacion);

        return response()->json([
            'success' => true,
            'estado' => $estado['estado'],
            'numeroAutorizacion' => $estado['numeroAutorizacion'],
            'fechaAutorizacion' => $estado['fechaAutorizacion'],
            'mensaje' => $estado['mensaje'],
            'raw' => $autorizacion,
        ]);
    }

    /**
     * La respuesta SOAP del SRI, ya decodificada de JSON, puede venir con distintos niveles
     * de anidación según el WSDL. Se busca 'estado' recursivamente en vez de asumir una ruta fija.
     */
    private function extraerEstadoAutorizacion($autorizacionResponse)
    {
        $estado = $this->buscarClaveRecursiva($autorizacionResponse, 'estado') ?? 'EN PROCESO';
        $numeroAutorizacion = $this->buscarClaveRecursiva($autorizacionResponse, 'numeroAutorizacion');
        $fechaAutorizacion = $this->buscarClaveRecursiva($autorizacionResponse, 'fechaAutorizacion');

        return [
            'estado' => $estado,
            'numeroAutorizacion' => $numeroAutorizacion,
            'fechaAutorizacion' => $fechaAutorizacion,
            'mensaje' => $estado === 'AUTORIZADO'
                ? 'Comprobante autorizado por el SRI.'
                : 'El comprobante fue enviado al SRI pero aún no figura autorizado. Puedes consultar el estado nuevamente con la clave de acceso.',
        ];
    }

    private function buscarClaveRecursiva($data, $key)
    {
        if (is_array($data)) {
            if (array_key_exists($key, $data)) {
                return $data[$key];
            }
            foreach ($data as $value) {
                $found = $this->buscarClaveRecursiva($value, $key);
                if ($found !== null) {
                    return $found;
                }
            }
        }

        return null;
    }

    public function tipos()
    {
        return response()->json([
            'status' => true,
            'data' => $this->facturacion->tiposSoportados(),
        ]);
    }

    public function generarXml(Request $request)
    {
        $request->validate([
            'tipo' => 'required|string',
            'data' => 'required|array',
        ]);

        $xml = $this->facturacion->generarXml(
            $request->input('tipo'),
            $request->input('data')
        );

        return response()->json([
            'status' => true,
            'data' => [
                'xml' => $xml,
                'xml_base64' => base64_encode($xml),
            ],
        ], Response::HTTP_OK);
    }

    public function firmarXml(Request $request)
    {
        $request->validate([
            'tipo' => 'required|string',
            'xml' => 'required_without:xml_base64|string',
            'xml_base64' => 'required_without:xml|string',
            'certificado_p12_base64' => 'nullable|string',
            'clave' => 'nullable|string',
            'clave_base64' => 'nullable|string',
        ]);

        $xmlFirmado = $this->facturacion->firmarXml(
            $request->input('tipo'),
            $this->xmlFromRequest($request),
            $this->certificadoFromRequest($request),
            $this->claveCertificadoFromRequest($request)
        );

        return response()->json([
            'status' => true,
            'data' => [
                'xml' => $xmlFirmado,
                'xml_base64' => base64_encode($xmlFirmado),
            ],
        ], Response::HTTP_OK);
    }

    public function generarYFirmarXml(Request $request)
    {
        $request->validate([
            'tipo' => 'required|string',
            'data' => 'required|array',
            'certificado_p12_base64' => 'nullable|string',
            'clave' => 'nullable|string',
            'clave_base64' => 'nullable|string',
        ]);

        $xmlFirmado = $this->facturacion->generarYFirmarXml(
            $request->input('tipo'),
            $request->input('data'),
            $this->certificadoFromRequest($request),
            $this->claveCertificadoFromRequest($request)
        );

        return response()->json([
            'status' => true,
            'data' => [
                'xml' => $xmlFirmado,
                'xml_base64' => base64_encode($xmlFirmado),
            ],
        ], Response::HTTP_OK);
    }

    public function enviarSri(Request $request)
    {
        $request->validate([
            'xml' => 'required_without:xml_base64|string',
            'xml_base64' => 'required_without:xml|string',
            'ambiente' => 'required|in:1,2',
        ]);

        return response()->json([
            'status' => true,
            'data' => $this->facturacion->enviarSri(
                $this->xmlFromRequest($request),
                $request->input('ambiente')
            ),
        ], Response::HTTP_OK);
    }

    public function autorizarSri(Request $request)
    {
        $request->validate([
            'clave_acceso' => 'required|string|size:49',
            'ambiente' => 'required|in:1,2',
        ]);

        return response()->json([
            'status' => true,
            'data' => $this->facturacion->autorizarSri(
                $request->input('clave_acceso'),
                $request->input('ambiente')
            ),
        ], Response::HTTP_OK);
    }

    public function generarClaveAcceso(Request $request)
    {
        $request->validate([
            'fecha_emision' => 'required|string',
            'tipo_comprobante' => 'required|string',
            'ruc' => 'required|string',
            'ambiente' => 'required|in:1,2',
            'serie' => 'required|string|size:6',
            'secuencial' => 'required|string',
            'codigo_numerico' => 'required|string',
            'tipo_emision' => 'nullable|string',
        ]);

        return response()->json([
            'status' => true,
            'data' => [
                'clave_acceso' => $this->facturacion->generarClaveAcceso(
                    $request->input('fecha_emision'),
                    $request->input('tipo_comprobante'),
                    $request->input('ruc'),
                    $request->input('ambiente'),
                    $request->input('serie'),
                    $request->input('secuencial'),
                    $request->input('codigo_numerico'),
                    $request->input('tipo_emision', '1')
                ),
            ],
        ], Response::HTTP_OK);
    }

    public function validarIdentificacion(Request $request)
    {
        $request->validate([
            'tipo' => 'required|in:cedula,ruc_natural,ruc_privado,ruc_publico',
            'numero' => 'required|string',
        ]);

        return response()->json([
            'status' => true,
            'data' => [
                'valido' => $this->facturacion->validarIdentificacion(
                    $request->input('tipo'),
                    $request->input('numero')
                ),
            ],
        ], Response::HTTP_OK);
    }

    private function xmlFromRequest(Request $request)
    {
        return $request->filled('xml_base64')
            ? base64_decode($request->input('xml_base64'))
            : $request->input('xml');
    }

    private function claveFromRequest(Request $request)
    {
        return $request->filled('clave_base64')
            ? base64_decode($request->input('clave_base64'))
            : $request->input('clave');
    }

    private function certificadoFromRequest(Request $request)
    {
        if ($request->filled('certificado_p12_base64')) {
            return base64_decode($request->input('certificado_p12_base64'));
        }

        $certificado = config('services.facturacion.certificado_p12');

        if (!$certificado) {
            throw ValidationException::withMessages([
                'certificado' => 'Configure FACTURACION_CERTIFICADO_P12 en .env o envie certificado_p12_base64.',
            ]);
        }

        $path = $this->resolverRutaCertificado($certificado);

        if (!is_file($path)) {
            throw ValidationException::withMessages([
                'certificado' => "No existe el certificado configurado: {$path}",
            ]);
        }

        return file_get_contents($path);
    }

    private function claveCertificadoFromRequest(Request $request)
    {
        $clave = $this->claveFromRequest($request);

        if ($clave) {
            return $clave;
        }

        $clave = config('services.facturacion.clave_certificado');

        if (!$clave) {
            throw ValidationException::withMessages([
                'clave' => 'Configure FACTURACION_CERTIFICADO_CLAVE en .env o envie clave/clave_base64.',
            ]);
        }

        return $clave;
    }

    private function resolverRutaCertificado($certificado)
    {
        if (preg_match('/^[A-Za-z]:[\\\\\\/]/', $certificado) || substr($certificado, 0, 1) === '/' || substr($certificado, 0, 2) === '\\\\') {
            return $certificado;
        }

        return public_path($certificado);
    }
}
