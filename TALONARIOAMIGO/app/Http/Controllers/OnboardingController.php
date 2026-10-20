<?php

namespace App\Http\Controllers;

use App\Models\Emisor;
use App\Models\PuntoEmision;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class OnboardingController extends Controller
{
    /**
     * Estado de configuración tributaria del usuario logueado (para gatear la UI de emisión).
     */
    public function estado(Request $request)
    {
        $user = Auth::user();
        $emisor = $user->emisor;

        return response()->json([
            'success' => true,
            'onboarding_completo' => (bool) ($emisor && !empty($emisor->ruc)),
            'firma_cargada' => (bool) ($emisor && !empty($emisor->firma_p12_path)),
            'emisor' => $emisor,
        ]);
    }

    /**
     * Guarda o actualiza los datos tributarios del Emisor
     */
    public function setupEmisor(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'ruc' => 'required|string|size:13',
            'razon_social' => 'required|string|max:255',
            'nombre_comercial' => 'nullable|string|max:255',
            'direccion_matriz' => 'required|string',
            'contribuyente_especial' => 'nullable|string',
            'obligado_contabilidad' => 'required|boolean',
            'tipo_regimen' => 'required|in:RIMPE_POPULAR,RIMPE_EMPRENDEDOR,GENERAL',
            'ambiente' => 'nullable|in:1,2',
        ]);

        $emisor = Emisor::updateOrCreate(
            ['user_id' => $user->id],
            [
                'ruc' => $request->ruc,
                'razon_social' => $request->razon_social,
                'nombre_comercial' => $request->nombre_comercial,
                'direccion_matriz' => $request->direccion_matriz,
                'contribuyente_especial' => $request->contribuyente_especial,
                'obligado_contabilidad' => $request->obligado_contabilidad,
                'tipo_regimen' => $request->tipo_regimen,
                'ambiente' => $request->ambiente ?? '1',
                'tipo_emision' => '1',
            ]
        );

        // Crear punto de emisión 001-001 por defecto si no existe
        PuntoEmision::firstOrCreate(
            ['emisor_id' => $emisor->id, 'establecimiento' => '001', 'punto_emision' => '001'],
            [
                'nombre_sucursal' => 'Matriz Principal',
                'direccion_sucursal' => $request->direccion_matriz,
                'secuencial_factura' => 1,
                'secuencial_nota_credito' => 1,
                'secuencial_retencion' => 1,
                'secuencial_liquidacion' => 1,
                'secuencial_guia_remision' => 1,
                'is_active' => true
            ]
        );

        return response()->json([
            'status' => true,
            'message' => 'Configuración de emisor registrada correctamente.',
            'data' => $emisor
        ]);
    }

    /**
     * Carga y valida la firma electrónica en formato .p12
     */
    public function uploadFirma(Request $request)
    {
        $user = Auth::user();
        $emisor = $user->emisor;

        if (!$emisor) {
            return response()->json([
                'status' => false,
                'message' => 'Debes configurar primero los datos de tu RUC antes de subir la firma.'
            ], 422);
        }

        $request->validate([
            'firma_p12' => 'required|file|mimes:p12,pfx',
            'password' => 'required|string',
        ]);

        $file = $request->file('firma_p12');
        $fileContent = file_get_contents($file->getRealPath());
        $password = $request->password;

        // Validar contraseña leyendo el certificado PKCS12
        $certs = [];
        if (!openssl_pkcs12_read($fileContent, $certs, $password)) {
            return response()->json([
                'status' => false,
                'message' => 'Contraseña de firma electrónica incorrecta o el archivo .p12 está dañado.'
            ], 422);
        }

        // Parsear fecha de caducidad del certificado
        $certData = openssl_x509_parse($certs['cert']);
        $validToTimestamp = $certData['validTo_time_t'] ?? null;
        $expiresAt = $validToTimestamp ? date('Y-m-d H:i:s', $validToTimestamp) : null;

        // Guardar archivo en disco seguro
        $filename = 'firmas/emisor_' . $emisor->id . '_' . time() . '.p12';
        Storage::disk('local')->put($filename, $fileContent);

        // Actualizar Emisor
        $emisor->firma_p12_path = $filename;
        $emisor->firma_password = $password;
        $emisor->firma_expires_at = $expiresAt;
        $emisor->save();

        // Actualizar estado del usuario a ACTIVE
        $user->status = 'ACTIVE';
        $user->save();

        return response()->json([
            'status' => true,
            'message' => 'Firma electrónica validada y guardada exitosamente.',
            'data' => [
                'emisor_id' => $emisor->id,
                'firma_expires_at' => $expiresAt,
                'account_status' => $user->status
            ]
        ]);
    }
}
