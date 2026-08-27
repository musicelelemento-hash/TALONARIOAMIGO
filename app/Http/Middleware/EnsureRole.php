<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class EnsureRole
{
    /**
     * Bloquea el acceso a menos que el usuario autenticado tenga uno de los roles listados.
     * Uso: ->middleware('role:SUPER_ADMIN') o ->middleware('role:RESELLER,SUPER_ADMIN')
     */
    public function handle($request, Closure $next, ...$roles)
    {
        $user = Auth::user();

        if (!$user || !in_array($user->role, $roles, true)) {
            return response()->json([
                'success' => false,
                'code' => 'FORBIDDEN',
                'message' => 'No tienes permiso para acceder a este recurso.',
            ], 403);
        }

        return $next($request);
    }
}
