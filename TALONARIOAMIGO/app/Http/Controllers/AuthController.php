<?php

namespace App\Http\Controllers;

use App\Models\Emisor;
use App\Models\PuntoEmision;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login con email + password. Las cuentas se crean desde OwnerController (resellers)
     * y ResellerController (clientes), o el seeder (SUPER_ADMIN) — no hay auto-registro público.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales no coinciden con ningún registro.'],
            ]);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'code' => 'ACCOUNT_SUSPENDED',
                'message' => 'Tu cuenta ha sido pausada o desactivada por la administración.',
                'support_whatsapp' => $user->whatsapp_support ?? env('DEFAULT_SUPPORT_WHATSAPP', '593999999999'),
            ], 403);
        }

        $token = $user->createToken('talonario-amigo-app')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
            ],
        ]);
    }

    /**
     * Alta pública (auto-registro) para usuarios normales.
     * Crea la cuenta CLIENT y su facturador listo (RUC + razón social + punto de emisión),
     * devolviendo el token Sanctum para iniciar sesión automáticamente.
     * La firma .p12 se sube después con /v1/onboarding/firma.
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string',
            'ruc' => 'required|string|size:13',
            'razon_social' => 'required|string|max:255',
            'nombre_comercial' => 'nullable|string|max:255',
            'direccion_matriz' => 'required|string',
            'obligado_contabilidad' => 'nullable|boolean',
            'tipo_regimen' => 'required|in:RIMPE_POPULAR,RIMPE_EMPRENDEDOR,GENERAL',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => 'CLIENT',
            'whatsapp_support' => env('DEFAULT_SUPPORT_WHATSAPP', '593993050689'),
            'is_active' => true,
            'status' => 'ACTIVE',
        ]);

        $emisor = Emisor::create([
            'user_id' => $user->id,
            'ruc' => $request->ruc,
            'razon_social' => $request->razon_social,
            'nombre_comercial' => $request->nombre_comercial ?: $request->razon_social,
            'direccion_matriz' => $request->direccion_matriz,
            'obligado_contabilidad' => (bool) $request->obligado_contabilidad,
            'tipo_regimen' => $request->tipo_regimen,
            'ambiente' => '1',
            'tipo_emision' => '1',
        ]);

        PuntoEmision::create([
            'emisor_id' => $emisor->id,
            'establecimiento' => '001',
            'punto_emision' => '001',
            'nombre_sucursal' => 'Matriz Principal',
            'direccion_sucursal' => $request->direccion_matriz,
            'secuencial_factura' => 1,
            'secuencial_nota_credito' => 1,
            'secuencial_retencion' => 1,
            'secuencial_liquidacion' => 1,
            'secuencial_guia_remision' => 1,
            'is_active' => true,
        ]);

        $token = $user->createToken('talonario-amigo-app')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['success' => true, 'message' => 'Sesión cerrada.']);
    }
}
