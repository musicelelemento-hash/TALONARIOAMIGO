<?php

use App\Http\Controllers\FirmaController;
use App\Http\Controllers\FacturacionElectronicaController;
use App\Http\Controllers\OwnerController;
use App\Http\Controllers\ResellerController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OnboardingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/


// Health Check público: mantiene despierto el contenedor de Render Y resetea la inactividad de Supabase
Route::get('/health', function () {
    $dbConnected = false;
    try {
        DB::select('SELECT 1');
        $dbConnected = true;
    } catch (\Throwable $e) {}

    return response()->json([
        'status' => 'ok',
        'database' => $dbConnected ? 'active' : 'reconnecting',
        'service' => 'Talonario Amigo API SRI',
        'timestamp' => now()->toIso8601String()
    ]);
});

// Diagnóstico extendido de base de datos e integraciones
Route::get('/health/db', function () {
    $dbConnected = false;
    $dbError = null;
    $tables = [];
    try {
        DB::connection()->getPdo();
        $dbConnected = true;
        $tableRows = DB::select("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        $tables = array_map(function ($row) { return $row->table_name ?? $row->TABLE_NAME ?? ''; }, $tableRows);
    } catch (\Throwable $e) {
        $dbError = $e->getMessage();
    }

    return response()->json([
        'status' => 'ok',
        'database' => [
            'connected' => $dbConnected,
            'tables_count' => count($tables),
            'tables' => $tables,
            'error' => $dbError
        ],
        'integrations' => [
            'resend_email' => !empty(env('RESEND_API_KEY')),
            'r2_vault' => !empty(env('R2_ACCESS_KEY_ID')),
            'keep_alive' => true
        ],
        'timestamp' => now()->toIso8601String()
    ]);
});

// Endpoint seguro para ejecutar migraciones pendientes en Supabase Postgres
Route::get('/health/migrate', function (Request $request) {
    if ($request->get('key') !== env('APP_KEY', 'talonario_secret_key')) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }
    try {
        \Artisan::call('migrate', ['--force' => true]);
        \Artisan::call('db:seed', ['--class' => 'Database\\Seeders\\SuperAdminSeeder', '--force' => true]);
        return response()->json([
            'status' => 'success',
            'output' => \Artisan::output()
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// 6 intentos por minuto por IP — evita fuerza bruta de contraseñas sin molestar a un usuario real.
Route::post('/v1/auth/login', [AuthController::class, 'login'])->middleware('throttle:6,1');
// Alta pública de cuentas CLIENT (auto-registro con facturador listo).
Route::post('/v1/auth/register', [AuthController::class, 'register'])->middleware('throttle:6,1');
Route::middleware('auth:sanctum')->post('/v1/auth/logout', [AuthController::class, 'logout']);

// Firma directa de XML suelto (usada por integraciones externas, no por el flujo normal del talonario)
Route::group(['middleware' => 'app'], function () {
    Route::post('/v1/sign/xml', [FirmaController::class,'ProcesarFirma']);
});

// Rutas de Onboarding (configurar RUC del emisor + subir firma .p12)
Route::middleware(['auth:sanctum'])->prefix('v1/onboarding')->group(function () {
    Route::get('/estado', [OnboardingController::class, 'estado']);
    Route::post('/emisor', [OnboardingController::class, 'setupEmisor']);
    Route::post('/firma', [OnboardingController::class, 'uploadFirma']);
});

// Emisión real de comprobantes SRI - requiere sesión real y emisor+firma configurados
Route::middleware(['auth:sanctum', 'account.status'])->prefix('v1/facturacion')->group(function () {
    Route::get('/tipos', [FacturacionElectronicaController::class, 'tipos']);
    Route::post('/clave-acceso', [FacturacionElectronicaController::class, 'generarClaveAcceso']);
    Route::post('/validar-identificacion', [FacturacionElectronicaController::class, 'validarIdentificacion']);
    Route::post('/xml', [FacturacionElectronicaController::class, 'generarXml']);
    Route::post('/firmar', [FacturacionElectronicaController::class, 'firmarXml']);
    Route::post('/generar-firmar', [FacturacionElectronicaController::class, 'generarYFirmarXml']);
    Route::post('/sri/enviar', [FacturacionElectronicaController::class, 'enviarSri']);
    Route::post('/sri/autorizar', [FacturacionElectronicaController::class, 'autorizarSri']);

    // Pipeline real orquestado: arma el XML con los datos del emisor logueado, firma, envía y
    // autoriza en un solo llamado. Esto es lo que usa el frontend para emitir un comprobante.
    Route::post('/emitir', [FacturacionElectronicaController::class, 'emitirFactura']);
    Route::get('/estado/{claveAcceso}', [FacturacionElectronicaController::class, 'consultarEstado']);
    Route::get('/comprobantes', [FacturacionElectronicaController::class, 'listarComprobantes']);
    Route::get('/tomos', [FacturacionElectronicaController::class, 'listarTomos']);
    Route::get('/clientes-frecuentes', [FacturacionElectronicaController::class, 'listarClientesFrecuentes']);
    Route::get('/comprobantes/{claveAcceso}/xml', [FacturacionElectronicaController::class, 'descargarXml']);
});

// Rutas del Dueño (SUPER_ADMIN)
Route::middleware(['auth:sanctum', 'role:SUPER_ADMIN'])->prefix('v1/owner')->group(function () {
    Route::get('/dashboard', [OwnerController::class, 'getGlobalDashboard']);
    Route::post('/resellers', [OwnerController::class, 'createReseller']);
    Route::post('/users/{id}/toggle-status', [OwnerController::class, 'toggleAccountStatus']);
    Route::post('/resellers/assign-package', [OwnerController::class, 'assignResellerPackage']);
});

// Rutas de la Imprenta (RESELLER)
Route::middleware(['auth:sanctum', 'role:RESELLER'])->prefix('v1/reseller')->group(function () {
    Route::get('/dashboard', [ResellerController::class, 'getResellerDashboard']);
    Route::post('/clients', [ResellerController::class, 'createClient']);
    Route::post('/clients/{clientId}/toggle-status', [ResellerController::class, 'toggleClientStatus']);
    Route::post('/whatsapp-support', [ResellerController::class, 'updateWhatsappSupport']);
});

