<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
    /**
     * Esta app es solo API (no hay pantalla de login servida por Laravel), asi que nunca
     * hay que redirigir a una ruta 'login' que no existe — siempre responder 401 en JSON.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string|null
     */
    protected function redirectTo($request)
    {
        return null;
    }
}
