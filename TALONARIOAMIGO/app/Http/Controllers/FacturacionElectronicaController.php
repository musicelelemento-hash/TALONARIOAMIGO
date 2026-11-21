<?php

namespace App\Http\Controllers;

use App\Models\PuntoEmision;
use App\Models\Comprobante;
use App\Models\ComprobanteItem;
use App\Models\ClienteFrecuente;
use App\Services\FacturacionElectronicaLibrary;
use App\Services\EmisionService;
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
    public function emitirFactura(Request $request, EmisionService $emision)
    {
        $data = $request->validate(EmisionService::reglas());
        $resultado = $emision->emitir($request->user(), $data);

        return response()->json($resultado['body'], $resultado['status']);
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

        [$certificado, $clave] = $this->credencialesFirma($request);

        $xmlFirmado = $this->facturacion->firmarXml(
            $request->input('tipo'),
            $this->xmlFromRequest($request),
            $certificado,
            $clave
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

        [$certificado, $clave] = $this->credencialesFirma($request);

        $xmlFirmado = $this->facturacion->generarYFirmarXml(
            $request->input('tipo'),
            $request->input('data'),
            $certificado,
            $clave
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

    /**
     * Devuelve [certificado, clave] para firmar.
     *
     * Seguridad: nunca se usa un certificado global del servidor. Si el request no trae su propio
     * .p12 (con su clave), se firma con la firma electrónica del emisor del usuario logueado.
     * Antes, cualquier usuario autenticado podía firmar XML arbitrario con el certificado de
     * FACTURACION_CERTIFICADO_P12.
     */
    private function credencialesFirma(Request $request): array
    {
        if ($request->filled('certificado_p12_base64')) {
            $certificado = base64_decode($request->input('certificado_p12_base64'), true);
            $clave = $this->claveFromRequest($request);

            if ($certificado === false || empty($clave)) {
                throw ValidationException::withMessages([
                    'certificado' => 'Envía el certificado .p12 en base64 válido junto con su clave.',
                ]);
            }

            return [$certificado, $clave];
        }

        $emisorVal = $this->validator->validarEmisorYFirma($request->user()->emisor);
        if (!$emisorVal['valido']) {
            throw ValidationException::withMessages([
                'certificado' => $emisorVal['mensaje'],
            ]);
        }

        return [$emisorVal['certContent'], $emisorVal['clave']];
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
