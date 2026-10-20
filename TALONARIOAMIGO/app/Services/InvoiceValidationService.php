<?php

namespace App\Services;

use App\Models\Emisor;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use LibreriasSri\Validadores;

/**
 * InvoiceValidationService
 * Especialista en validación pre-flight, diagnóstico ágil de errores SRI y resolución rápida.
 */
class InvoiceValidationService
{
    private $validadores;

    public function __construct(Validadores $validadores = null)
    {
        $this->validadores = $validadores ?: new Validadores();
    }

    /**
     * Valida el emisor tributario y la integridad física/criptográfica de su firma .p12
     */
    public function validarEmisorYFirma(?Emisor $emisor): array
    {
        if (!$emisor || empty($emisor->ruc)) {
            return [
                'valido' => false,
                'codigo' => 'PENDING_ONBOARDING',
                'titulo' => 'Falta Configuración Tributaria',
                'mensaje' => 'Completa tus datos tributarios (RUC, razón social, dirección) antes de emitir en modo real.',
                'solucion' => 'Ingresa a Configuración o toca la barra de alerta roja para registrar tus datos.',
            ];
        }

        $puntoEmision = $emisor->puntosEmision()->where('is_active', true)->first();
        if (!$puntoEmision) {
            return [
                'valido' => false,
                'codigo' => 'NO_PUNTO_EMISION',
                'titulo' => 'Sin Punto de Emisión Activo',
                'mensaje' => 'No tienes un establecimiento y punto de emisión activo (ej: 001-001) para tu RUC.',
                'solucion' => 'Crea o activa el punto de emisión 001-001 en los datos del emisor.',
            ];
        }

        if (empty($emisor->firma_p12_path)) {
            return [
                'valido' => false,
                'codigo' => 'MISSING_SIGNATURE',
                'titulo' => 'Falta Firma Electrónica (.p12)',
                'mensaje' => 'En Modo Real es obligatorio vincular tu archivo de firma electrónica (.p12).',
                'solucion' => 'Toca la barra roja para seleccionar tu archivo .p12 e ingresar su contraseña.',
            ];
        }

        if (!Storage::disk('local')->exists($emisor->firma_p12_path)) {
            return [
                'valido' => false,
                'codigo' => 'SIGNATURE_FILE_NOT_FOUND',
                'titulo' => 'Archivo de Firma No Encontrado',
                'mensaje' => 'El archivo de firma .p12 registrado no se encuentra en el servidor.',
                'solucion' => 'Vuelve a subir tu archivo .p12 en el asistente de firma.',
            ];
        }

        $clave = $emisor->firma_password;
        if (empty($clave)) {
            return [
                'valido' => false,
                'codigo' => 'MISSING_SIGNATURE_PASSWORD',
                'titulo' => 'Contraseña de Firma No Definida',
                'mensaje' => 'No se encontró la contraseña desencriptada para tu archivo de firma.',
                'solucion' => 'Vuelve a ingresar la contraseña de tu certificado .p12.',
            ];
        }

        // Test criptográfico rápido en memoria con OpenSSL
        $certContent = Storage::disk('local')->get($emisor->firma_p12_path);
        $certs = [];
        if (!openssl_pkcs12_read($certContent, $certs, $clave)) {
            return [
                'valido' => false,
                'codigo' => 'INVALID_SIGNATURE_KEY',
                'titulo' => 'Contraseña de Firma Incorrecta',
                'mensaje' => 'La contraseña proporcionada no pudo abrir el certificado digital .p12.',
                'solucion' => 'Verifica que la contraseña del certificado .p12 esté escrita exactamente igual (mayúsculas/minúsculas).',
            ];
        }

        // Validación de fecha de caducidad
        if (!empty($certs['cert'])) {
            $parsed = openssl_x509_parse($certs['cert']);
            if (!empty($parsed['validTo_time_t']) && $parsed['validTo_time_t'] < time()) {
                $fechaExpiracion = date('d/m/Y', $parsed['validTo_time_t']);
                return [
                    'valido' => false,
                    'codigo' => 'EXPIRED_SIGNATURE',
                    'titulo' => 'Firma Electrónica Caducada',
                    'mensaje' => "Tu certificado digital expiró el {$fechaExpiracion}.",
                    'solucion' => 'Debes renovar tu firma digital con tu entidad certificadora (BCE, Security Data, ANFAC, etc.).',
                ];
            }
        }

        return [
            'valido' => true,
            'puntoEmision' => $puntoEmision,
            'certContent' => $certContent,
            'clave' => $clave,
        ];
    }

    /**
     * Valida datos del cliente, identificación ecuatoriana y montos
     */
    public function validarClienteYTotales(array $cliente, array $items): array
    {
        $identificacion = preg_replace('/[^0-9A-Za-z]/', '', $cliente['identificacion'] ?? '');
        $nombre = trim($cliente['nombre'] ?? '');

        if (empty($nombre)) {
            return [
                'valido' => false,
                'codigo' => 'CLIENT_NAME_REQUIRED',
                'titulo' => 'Nombre del Cliente Requerido',
                'mensaje' => 'Debes ingresar el nombre o razón social del comprador.',
            ];
        }

        if (empty($identificacion)) {
            return [
                'valido' => false,
                'codigo' => 'CLIENT_ID_REQUIRED',
                'titulo' => 'Identificación Requerida',
                'mensaje' => 'Ingresa la cédula, RUC o 9999999999999 (Consumidor Final).',
            ];
        }

        // Tipo de identificación SRI
        $isConsumidorFinal = ($identificacion === '9999999999999');
        $tipoIdentificacion = match (true) {
            $isConsumidorFinal => '07',
            strlen($identificacion) === 13 => '04',
            strlen($identificacion) === 10 => '05',
            default => '06', // Pasaporte / Otro
        };

        // Validación de cédula ecuatoriana si tiene 10 dígitos y no es consumidor final
        if ($tipoIdentificacion === '05' && is_numeric($identificacion)) {
            if (!$this->validadores->validarCedula($identificacion)) {
                return [
                    'valido' => false,
                    'codigo' => 'INVALID_CEDULA_MODULO10',
                    'titulo' => 'Cédula Ecuatoriana Inválida',
                    'mensaje' => "El número de cédula {$identificacion} no pasa la validación de Módulo 10 del Registro Civil.",
                    'solucion' => 'Verifica los 10 dígitos de la cédula del comprador.',
                ];
            }
        }

        // Cálculo y verificación de items
        if (empty($items)) {
            return [
                'valido' => false,
                'codigo' => 'NO_ITEMS',
                'titulo' => 'Factura sin Productos',
                'mensaje' => 'Debes incluir al menos un producto o servicio en la factura.',
            ];
        }

        $tarifaPorcentaje = 15;
        $tarifaCodigo = '4';
        $subtotalGravado = 0.0;
        $subtotalExento = 0.0;
        $detalle = [];

        foreach ($items as $idx => $item) {
            $cant = (float) ($item['cantidad'] ?? 0);
            $precio = (float) ($item['precioUnitario'] ?? 0);
            $desc = trim($item['descripcion'] ?? '');

            if ($cant <= 0) {
                return [
                    'valido' => false,
                    'codigo' => 'INVALID_ITEM_QUANTITY',
                    'titulo' => "Cantidad Inválida en Ítem #" . ($idx + 1),
                    'mensaje' => "La cantidad de '{$desc}' debe ser mayor a 0.",
                ];
            }

            if ($precio < 0) {
                return [
                    'valido' => false,
                    'codigo' => 'INVALID_ITEM_PRICE',
                    'titulo' => "Precio Negativo en Ítem #" . ($idx + 1),
                    'mensaje' => "El precio unitario no puede ser negativo.",
                ];
            }

            $totalLinea = round($cant * $precio, 2);
            $exento = !empty($item['exento']);

            if ($exento) {
                $subtotalExento += $totalLinea;
            } else {
                $subtotalGravado += $totalLinea;
            }

            $detalle[] = (object) [
                'codigoPrincipal' => 'ITEM' . ($idx + 1),
                'codigoAuxiliar' => '',
                'descripcion' => $desc ?: 'PRODUCTO GENERAL',
                'cantidad' => number_format($cant, 6, '.', ''),
                'precioUnitario' => number_format($precio, 6, '.', ''),
                'descuento' => '0.00',
                'precioTotalSinImpuesto' => number_format($totalLinea, 2, '.', ''),
                'impuesto' => (object) [
                    'codigo' => '2',
                    'codigoPorcentaje' => $exento ? '0' : $tarifaCodigo,
                    'tarifa' => $exento ? 0 : $tarifaPorcentaje,
                    'baseImponible' => number_format($totalLinea, 2, '.', ''),
                    'valor' => number_format($exento ? 0 : $totalLinea * $tarifaPorcentaje / 100, 2, '.', ''),
                ],
            ];
        }

        $ivaValor = round($subtotalGravado * $tarifaPorcentaje / 100, 2);
        $totalSinImpuestos = round($subtotalGravado + $subtotalExento, 2);
        $importeTotal = round($totalSinImpuestos + $ivaValor, 2);

        // Regla legal SRI: Consumidor Final no puede superar $50 USD
        if ($isConsumidorFinal && $importeTotal > 50.00) {
            return [
                'valido' => false,
                'codigo' => 'CONSUMIDOR_FINAL_OVER_LIMIT',
                'titulo' => 'Límite de Consumidor Final Superado ($50)',
                'mensaje' => "Por normativa legal del SRI (Resolución NAC-DGERCGC22-00000024), ventas mayores a \$50.00 requieren nombre y cédula/RUC del cliente.",
                'solucion' => 'Solicita la cédula o RUC del comprador para poder emitir el comprobante.',
            ];
        }

        return [
            'valido' => true,
            'identificacion' => $identificacion,
            'tipoIdentificacion' => $tipoIdentificacion,
            'detalle' => $detalle,
            'subtotalGravado' => $subtotalGravado,
            'subtotalExento' => $subtotalExento,
            'totalSinImpuestos' => $totalSinImpuestos,
            'ivaValor' => $ivaValor,
            'importeTotal' => $importeTotal,
            'tarifaCodigo' => $tarifaCodigo,
        ];
    }

    /**
     * Parser y traductor de diagnósticos de respuestas SOAP del SRI
     */
    public function diagnosticarRespuestaSri($autorizacionResponse): array
    {
        $estado = $this->buscarClaveRecursiva($autorizacionResponse, 'estado') ?? 'EN PROCESO';
        $numeroAutorizacion = $this->buscarClaveRecursiva($autorizacionResponse, 'numeroAutorizacion');
        $fechaAutorizacion = $this->buscarClaveRecursiva($autorizacionResponse, 'fechaAutorizacion');
        
        // Extracción de mensajes devueltos por el SRI
        $mensajesRaw = $this->buscarClaveRecursiva($autorizacionResponse, 'mensajes');
        $mensajesList = [];
        if (is_array($mensajesRaw)) {
            $items = $mensajesRaw['mensaje'] ?? $mensajesRaw;
            if (isset($items['identificador'])) {
                $items = [$items];
            }
            if (is_array($items)) {
                foreach ($items as $m) {
                    if (is_array($m) || is_object($m)) {
                        $mArr = (array) $m;
                        $mensajesList[] = [
                            'identificador' => $mArr['identificador'] ?? '',
                            'mensaje' => $mArr['mensaje'] ?? '',
                            'informacionAdicional' => $mArr['informacionAdicional'] ?? '',
                            'tipo' => $mArr['tipo'] ?? 'ERROR',
                        ];
                    }
                }
            }
        }

        // Diagnóstico inteligente según el estado y mensajes
        $diagnostico = [
            'estado' => $estado,
            'numeroAutorizacion' => $numeroAutorizacion,
            'fechaAutorizacion' => $fechaAutorizacion,
            'esAutorizado' => ($estado === 'AUTORIZADO'),
            'mensajes' => $mensajesList,
            'titulo' => ($estado === 'AUTORIZADO') ? 'Comprobante Autorizado por el SRI' : 'Atención al Comprobante',
            'mensajeHumano' => '',
            'solucion' => '',
        ];

        if ($estado === 'AUTORIZADO') {
            $diagnostico['mensajeHumano'] = 'El comprobante fue validado y autorizado legalmente por el SRI.';
            return $diagnostico;
        }

        // Análisis de mensajes de rechazo comunes del SRI
        $primerMensaje = $mensajesList[0]['mensaje'] ?? '';
        $primerId = $mensajesList[0]['identificador'] ?? '';
        $infoAdicional = $mensajesList[0]['informacionAdicional'] ?? '';

        if (stripos($primerMensaje, 'CLAVE ACCESO REGISTRADA') !== false || $primerId == '43') {
            $diagnostico['titulo'] = 'Clave de Acceso ya Registrada en SRI';
            $diagnostico['mensajeHumano'] = 'Este número de factura ya fue enviado previamente o la clave coincide.';
            $diagnostico['solucion'] = 'El sistema incrementará automáticamente el secuencial en la siguiente hoja.';
        } elseif (stripos($primerMensaje, 'FIRMA') !== false || $primerId == '39' || $primerId == '49') {
            $diagnostico['titulo'] = 'Fallo en Validación de Firma Digital';
            $diagnostico['mensajeHumano'] = 'El SRI no pudo verificar la firma electrónica: ' . ($infoAdicional ?: $primerMensaje);
            $diagnostico['solucion'] = 'Verifica que tu archivo .p12 corresponda al RUC del emisor y esté vigente.';
        } elseif (stripos($primerMensaje, 'RUC') !== false || $primerId == '45') {
            $diagnostico['titulo'] = 'RUC no Habilitado en SRI';
            $diagnostico['mensajeHumano'] = 'El RUC no figura en estado activo o autorizado para emisión electrónica.';
            $diagnostico['solucion'] = 'Revisa tu estado tributario en el portal en línea del SRI.';
        } else {
            $diagnostico['mensajeHumano'] = !empty($primerMensaje) 
                ? "El SRI reportó: {$primerMensaje}" . ($infoAdicional ? " ({$infoAdicional})" : '')
                : 'El comprobante fue transmitido pero aún se encuentra en procesamiento en los servidores del SRI.';
            $diagnostico['solucion'] = 'Puedes volver a consultar el estado con la clave de acceso en unos momentos.';
        }

        return $diagnostico;
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
}
