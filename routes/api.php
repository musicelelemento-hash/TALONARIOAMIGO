<?php

use App\Http\Controllers\FirmaController;
use App\Http\Controllers\FacturacionElectronicaController;
use App\Http\Controllers\OwnerController;
use App\Http\Controllers\ResellerController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Talonario Amigo
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Rutas de Emisión SRI y Firma (Protegidas por Middleware de Estado)
Route::group(['middleware' => ['auth:sanctum', 'check.account.status']], function () {
    Route::post('/v1/sign/xml', [FirmaController::class,'ProcesarFirma']);
    Route::get('/v1/facturacion/tipos', [FacturacionElectronicaController::class, 'tipos']);
    Route::post('/v1/facturacion/clave-acceso', [FacturacionElectronicaController::class, 'generarClaveAcceso']);
    Route::post('/v1/facturacion/validar-identificacion', [FacturacionElectronicaController::class, 'validarIdentificacion']);
    Route::post('/v1/facturacion/xml', [FacturacionElectronicaController::class, 'generarXml']);
    Route::post('/v1/facturacion/firmar', [FacturacionElectronicaController::class, 'firmarXml']);
    Route::post('/v1/facturacion/generar-firmar', [FacturacionElectronicaController::class, 'generarYFirmarXml']);
    Route::post('/v1/facturacion/sri/enviar', [FacturacionElectronicaController::class, 'enviarSri']);
    Route::post('/v1/facturacion/sri/autorizar', [FacturacionElectronicaController::class, 'autorizarSri']);
});

// Rutas Panel SuperAdmin (Dueño - Control Total Global)
Route::group(['middleware' => ['auth:sanctum'], 'prefix' => 'v1/admin/owner'], function () {
    Route::get('/dashboard', [OwnerController::class, 'getGlobalDashboard']);
    Route::post('/create-reseller', [OwnerController::class, 'createReseller']);
    Route::post('/toggle-account/{id}', [OwnerController::class, 'toggleAccountStatus']);
    Route::post('/assign-package', [OwnerController::class, 'assignResellerPackage']);
});

// Rutas Panel Reseller (Imprenta Aliada)
Route::group(['middleware' => ['auth:sanctum'], 'prefix' => 'v1/admin/reseller'], function () {
    Route::get('/dashboard', [ResellerController::class, 'getResellerDashboard']);
    Route::post('/create-client', [ResellerController::class, 'createClient']);
    Route::post('/toggle-client/{id}', [ResellerController::class, 'toggleClientStatus']);
    Route::post('/update-whatsapp', [ResellerController::class, 'updateWhatsappSupport']);
});
