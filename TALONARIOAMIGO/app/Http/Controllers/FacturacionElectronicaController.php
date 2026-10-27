<?php

namespace App\Http\Controllers;

use App\Models\PuntoEmision;
use App\Models\Comprobante;
use App\Models\ComprobanteItem;
use App\Models\ClienteFrecuente;
use App\Services\FacturacionElectronicaLibrary;
use App\Services\InvoiceValidationService;
use App\Services\SupabaseStorageService;
use App\Services\ResendService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class FacturacionElectronicaController extends Controller
{
    private $facturacion;
    private $validator;

    public function __construct(FacturacionElectronicaLibrary $facturacion, InvoiceValidationService $validator)
    {
        $this->facturacion = $facturacion;
        $this->validator = $validator;
    }

    /**
     * Orquesta el pipeline real de emisión usando el servicio modular de validación y diagnóstico.
     */
    public function emitirFactura(Request $request)
    {
        $user = $request->user();
        $emisor = $user->emisor;

        // 1. Validación Pre-Flight de Emisor y Certificado .p12
        $emisorVal = $this->validator->validarEmisorYFirma($emisor);
        if (!$emisorVal['valido']) {
            return response()->json([
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

        // 2. Validación Algorítmica de Cliente (Módulo 10/11), Regla $50 y Cuadre de Totales
        $totalesVal = $this->validator->validarClienteYTotales($data['cliente'], $data['items']);
        if (!$totalesVal['valido']) {
            return response()->json([
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
            return response()->json([
                'success' => false,
                'message' => 'No se pudo emitir el comprobante: ' . $e->getMessage(),
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
            \Log::warning("[FacturacionController] Advertencia al persistir XML: " . $xmlEx->getMessage());
        }

        // Despacho transaccional automático vía Resend si el cliente o comercio proveyó correo
        $emailEnviado = false;
        if ($diagnostico['esAutorizado'] && !empty($data['cliente']['email'])) {
            try {
                $resend = app(ResendService::class);
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
                'email_enviado' => $emailEnviado,
                'email_enviado_at' => $emailEnviado ? now() : null,
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
            \Log::error("[FacturacionController] Error guardando comprobante en Postgres: " . $dbEx->getMessage());
        }

        return response()->json([
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
            'xml_guardado' => !empty($xmlPath),
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

    /**
     * Listado de Comprobantes emitidos con filtros por mes o término de búsqueda.
     */
    public function listarComprobantes(Request $request)
    {
        $user = $request->user();
        $emisor = $user->emisor;
        if (!$emisor) {
            return response()->json(['success' => true, 'comprobantes' => [], 'total' => 0]);
        }

        $query = Comprobante::with('items')
            ->where('emisor_id', $emisor->id);

        if ($request->filled('mes')) {
            $mes = $request->get('mes');
            $query->whereRaw("TO_CHAR(fecha_emision, 'YYYY-MM') = ?", [$mes]);
        }

        if ($request->filled('buscar')) {
            $term = '%' . trim($request->get('buscar')) . '%';
            $query->where(function($q) use ($term) {
                $q->where('cliente_nombre', 'ILIKE', $term)
                  ->orWhere('cliente_identificacion', 'LIKE', $term)
                  ->orWhere('numero_comprobante', 'LIKE', $term)
                  ->orWhere('clave_acceso', 'LIKE', $term);
            });
        }

        $comprobantes = $query->orderBy('fecha_emision', 'desc')->paginate(30);

        return response()->json([
            'success' => true,
            'comprobantes' => $comprobantes->items(),
            'total' => $comprobantes->total(),
            'current_page' => $comprobantes->currentPage(),
            'last_page' => $comprobantes->lastPage(),
        ]);
    }

    /**
     * Historial agrupado por Tomos Físicos (Principio 13)
     */
    public function listarTomos(Request $request)
    {
        $user = $request->user();
        $emisor = $user->emisor;
        if (!$emisor) {
            return response()->json(['success' => true, 'tomos' => []]);
        }

        $mesesEspanol = [
            '01' => 'ENERO', '02' => 'FEBRERO', '03' => 'MARZO', '04' => 'ABRIL',
            '05' => 'MAYO', '06' => 'JUNIO', '07' => 'JULIO', '08' => 'AGOSTO',
            '09' => 'SEPTIEMBRE', '10' => 'OCTUBRE', '11' => 'NOVIEMBRE', '12' => 'DICIEMBRE'
        ];

        $tomosRaw = Comprobante::where('emisor_id', $emisor->id)
            ->selectRaw("TO_CHAR(fecha_emision, 'YYYY-MM') as anio_mes, COUNT(*) as hojas_count, SUM(importe_total) as total_monto")
            ->groupBy('anio_mes')
            ->orderBy('anio_mes', 'desc')
            ->get();

        $tomos = [];
        foreach ($tomosRaw as $row) {
            $parts = explode('-', $row->anio_mes);
            $anio = $parts[0] ?? date('Y');
            $mesNum = $parts[1] ?? date('m');
            $mesNom = $mesesEspanol[$mesNum] ?? 'MES';

            $tomos[] = [
                'tomo_id' => $row->anio_mes,
                'nombre' => "{$mesNom} {$anio}",
                'anio_mes' => $row->anio_mes,
                'hojas_count' => (int) $row->hojas_count,
                'total_monto' => (float) $row->total_monto,
                'label' => "{$mesNom} 📒 {$row->hojas_count} Hojas",
            ];
        }

        if (empty($tomos)) {
            $mesActual = date('m');
            $anioActual = date('Y');
            $mesNom = $mesesEspanol[$mesActual] ?? 'MES';
            $tomos[] = [
                'tomo_id' => date('Y-m'),
                'nombre' => "{$mesNom} {$anioActual}",
                'anio_mes' => date('Y-m'),
                'hojas_count' => 0,
                'total_monto' => 0.00,
                'label' => "{$mesNom} 📒 0 Hojas",
            ];
        }

        return response()->json([
            'success' => true,
            'tomos' => $tomos,
        ]);
    }

    /**
     * Clientes Frecuentes (Principio 14)
     */
    public function listarClientesFrecuentes(Request $request)
    {
        $user = $request->user();
        $emisor = $user->emisor;
        if (!$emisor) {
            return response()->json(['success' => true, 'clientes' => []]);
        }

        $clientes = ClienteFrecuente::where('emisor_id', $emisor->id)
            ->orderBy('compras_count', 'desc')
            ->orderBy('ultima_compra_at', 'desc')
            ->limit(30)
            ->get();

        return response()->json([
            'success' => true,
            'clientes' => $clientes,
        ]);
    }

    /**
     * Descarga de XML firmado
     */
    public function descargarXml(Request $request, $claveAcceso)
    {
        $user = $request->user();
        $emisor = $user->emisor;
        if (!$emisor) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $comprobante = Comprobante::where('emisor_id', $emisor->id)
            ->where('clave_acceso', $claveAcceso)
            ->first();

        if (!$comprobante) {
            return response()->json(['error' => 'Comprobante no encontrado'], 404);
        }

        $storage = app(SupabaseStorageService::class);
        $xmlContent = $storage->obtenerXml($claveAcceso);

        if (!$xmlContent) {
            return response()->json(['error' => 'XML no encontrado en almacenamiento'], 404);
        }

        return response($xmlContent, 200, [
            'Content-Type' => 'application/xml',
            'Content-Disposition' => "attachment; filename=\"{$comprobante->numero_comprobante}.xml\"",
        ]);
    }
}
