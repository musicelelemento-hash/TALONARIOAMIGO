<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckAccountStatusMiddleware
{
    /**
     * Handle an incoming request.
     * Evaluates account activation state, onboarding completion, and signature validity.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'code' => 'UNAUTHORIZED',
                'message' => 'No se ha iniciado sesión.'
            ], 401);
        }

        // 1. Verificación Global: Control Total del Dueño (Desactivación Manual/Admin)
        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'code' => 'ACCOUNT_SUSPENDED',
                'message' => 'Tu cuenta ha sido pausada o desactivada por la administración.',
                'redirect_to' => '/soporte-bloqueo',
                'support_whatsapp' => $user->whatsapp_support ?? env('DEFAULT_SUPPORT_WHATSAPP', '593999999999')
            ], 403);
        }

        // 2. Verificación de Onboarding y Firma Electrónica (.p12)
        if ($user->role === 'CLIENT') {
            $emisor = $user->emisor;

            if (!$emisor || empty($emisor->ruc)) {
                return response()->json([
                    'success' => false,
                    'code' => 'PENDING_ONBOARDING',
                    'message' => 'Debes completar la configuración inicial de tu RUC.',
                    'redirect_to' => '/onboarding'
                ], 422);
            }

            if (empty($emisor->firma_p12_path)) {
                return response()->json([
                    'success' => false,
                    'code' => 'MISSING_SIGNATURE',
                    'message' => 'Tu firma electrónica .p12 no está cargada. Para poder emitir comprobantes debes subir tu firma o contactar a soporte.',
                    'redirect_to' => '/soporte-bloqueo',
                    'support_whatsapp' => $user->whatsapp_support ?? env('DEFAULT_SUPPORT_WHATSAPP', '593999999999')
                ], 403);
            }
        }

        return $next($request);
    }
}
