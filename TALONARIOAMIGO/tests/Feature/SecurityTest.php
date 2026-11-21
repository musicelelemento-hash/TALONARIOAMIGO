<?php

namespace Tests\Feature;

use App\Models\Emisor;
use App\Models\PuntoEmision;
use App\Models\User;
use App\Services\FacturacionElectronicaLibrary;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Regresiones de seguridad: que nadie pueda firmar con certificados ajenos, que no existan
 * rutas sensibles sin autenticación y que los endpoints públicos no revelen configuración.
 */
class SecurityTest extends TestCase
{
    use RefreshDatabase;

    private function makeClient(): User
    {
        $user = User::create([
            'name'      => 'Comercio Sin Firma',
            'email'     => 'sinfirma@talonarioamigo.com',
            'password'  => Hash::make('secreto123'),
            'role'      => 'CLIENT',
            'is_active' => true,
            'status'    => 'ACTIVE',
        ]);

        // Emisor con onboarding completo pero cuyo archivo .p12 no existe: pasa el middleware
        // account.status y obliga a que la firma falle en vez de caer en un certificado global.
        $emisor = Emisor::create([
            'user_id'          => $user->id,
            'ruc'              => '0928374610001',
            'razon_social'     => 'Tienda Sin Firma',
            'direccion_matriz' => 'Av. Prueba 123',
            'tipo_regimen'     => 'RIMPE_EMPRENDEDOR',
            'ambiente'         => '1',
            'firma_p12_path'   => 'firmas/no-existe.p12',
        ]);
        PuntoEmision::create([
            'emisor_id'      => $emisor->id,
            'establecimiento' => '001',
            'punto_emision'  => '001',
            'nombre_sucursal' => 'Matriz',
            'direccion_sucursal' => 'Av. Prueba 123',
            'secuencial_factura' => 1,
            'is_active'      => true,
        ]);

        return $user;
    }

    public function test_el_endpoint_publico_de_firma_ya_no_existe(): void
    {
        $this->postJson('/api/v1/sign/xml', [
            'xml' => '<factura/>',
            'clave' => 'x',
            'certificado_p12_base64' => base64_encode('p12'),
            'ClaveAcceso' => '../../index',
        ])->assertNotFound();
    }

    public function test_todas_las_rutas_api_sensibles_exigen_autenticacion(): void
    {
        $publicas = [
            'api/health',
            'api/health/db',
            'api/health/migrate', // protegida por X-Migrate-Token
            'api/v1/auth/login',
            'api/v1/auth/register',
            'api/v1/whatsapp/webhook', // protegido por firma HMAC de Meta (ver WhatsAppTest)
        ];

        foreach (Route::getRoutes() as $route) {
            $uri = $route->uri();
            // Solo las rutas propias de la API (las de l5-swagger viven fuera de api/v1).
            if (!(str_starts_with($uri, 'api/v1/') || str_starts_with($uri, 'api/health')) || in_array($uri, $publicas, true)) {
                continue;
            }

            $middleware = $route->gatherMiddleware();
            $this->assertContains(
                'auth:sanctum',
                $middleware,
                "La ruta {$uri} está expuesta sin autenticación."
            );
        }
    }

    public function test_firmar_sin_firma_propia_no_usa_un_certificado_del_servidor(): void
    {
        Sanctum::actingAs($this->makeClient());

        // Aunque el servidor tenga un certificado global configurado, no debe usarse jamás
        // para firmar a nombre de un usuario.
        $global = tempnam(sys_get_temp_dir(), 'ta_global_') . '.p12';
        file_put_contents($global, 'certificado-global-del-servidor');
        config([
            'services.facturacion.certificado_p12' => $global,
            'services.facturacion.clave_certificado' => 'clave-global',
        ]);

        $library = $this->mock(FacturacionElectronicaLibrary::class);
        $library->shouldNotReceive('firmarXml');
        $library->shouldNotReceive('generarYFirmarXml');

        $this->postJson('/api/v1/facturacion/firmar', [
            'tipo' => 'factura',
            'xml'  => '<factura/>',
        ])->assertStatus(422)->assertJsonValidationErrors('certificado');

        $this->postJson('/api/v1/facturacion/generar-firmar', [
            'tipo' => 'factura',
            'data' => ['x' => 1],
        ])->assertStatus(422)->assertJsonValidationErrors('certificado');
    }

    public function test_certificado_propio_exige_su_clave(): void
    {
        Sanctum::actingAs($this->makeClient());

        $this->mock(FacturacionElectronicaLibrary::class)->shouldNotReceive('firmarXml');

        $this->postJson('/api/v1/facturacion/firmar', [
            'tipo' => 'factura',
            'xml'  => '<factura/>',
            'certificado_p12_base64' => base64_encode('contenido-p12'),
        ])->assertStatus(422)->assertJsonValidationErrors('certificado');
    }

    public function test_health_db_no_revela_integraciones_ni_tablas(): void
    {
        $json = $this->getJson('/api/health/db')->assertOk()->json();

        $this->assertArrayNotHasKey('integrations', $json);
        $this->assertArrayNotHasKey('tables_count', $json['database']);
    }
}
