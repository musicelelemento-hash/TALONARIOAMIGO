<?php

namespace Tests\Feature;

use App\Models\Comprobante;
use App\Models\Emisor;
use App\Models\User;
use App\Services\FacturacionElectronicaLibrary;
use App\Services\RideService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\CreatesEmisorConFirma;
use Tests\TestCase;

/**
 * RIDE: el PDF de la factura (descarga del dueño, enlace firmado para el cliente y adjunto del correo).
 */
class RideTest extends TestCase
{
    use RefreshDatabase;
    use CreatesEmisorConFirma;

    private const CLAVE = '19102026010928374610001100100100000000112345678115';

    private function makeUser(string $email = 'emisor@talonarioamigo.com'): User
    {
        return User::create([
            'name' => 'Comercio Emisor',
            'email' => $email,
            'password' => Hash::make('secreto123'),
            'role' => 'CLIENT',
            'is_active' => true,
            'status' => 'ACTIVE',
        ]);
    }

    private function mockLibrary(): void
    {
        $this->mock(FacturacionElectronicaLibrary::class, function ($mock) {
            $mock->shouldReceive('generarClaveAcceso')->andReturn(self::CLAVE);
            $mock->shouldReceive('generarYFirmarXml')->andReturn('<factura>FIRMADA</factura>');
            $mock->shouldReceive('enviarSri')->andReturn(['estado' => 'RECIBIDA']);
            $mock->shouldReceive('autorizarSri')->andReturn([
                'estado' => 'AUTORIZADO',
                'numeroAutorizacion' => self::CLAVE,
                'fechaAutorizacion' => '2026-10-19T10:00:00-05:00',
            ]);
        });
    }

    private function emitir(array $clienteExtra = []): \Illuminate\Testing\TestResponse
    {
        return $this->postJson('/api/v1/facturacion/emitir', [
            'cliente' => array_merge([
                'nombre' => 'Juan Pérez',
                'identificacion' => '0928374610',
                'direccion' => 'Av. Central N12',
                'telefono' => '0999999999',
            ], $clienteExtra),
            'items' => [['descripcion' => 'Producto Ñandú', 'cantidad' => 2, 'precioUnitario' => 10.00]],
        ]);
    }

    private function emisionLista(array $clienteExtra = []): array
    {
        $user = $this->makeUser();
        $this->makeEmisor($user);
        $this->mockLibrary();
        Sanctum::actingAs($user);
        $res = $this->emitir($clienteExtra);
        $res->assertStatus(200);

        return [$user, $res];
    }

    /** @test */
    public function el_dueno_descarga_el_pdf_en_ambos_estilos()
    {
        [, $res] = $this->emisionLista();

        foreach (['clasico', 'minimalista'] as $estilo) {
            $r = $this->get('/api/v1/facturacion/comprobantes/' . self::CLAVE . '/ride?estilo=' . $estilo);
            $r->assertStatus(200);
            $this->assertStringContainsString('application/pdf', $r->headers->get('Content-Type'));
            $this->assertStringContainsString('factura-001-001-000000001.pdf', $r->headers->get('Content-Disposition'));
            $this->assertStringStartsWith('%PDF', $r->getContent());
        }
    }

    /** @test */
    public function otro_emisor_recibe_404_y_sin_sesion_401()
    {
        $this->emisionLista();

        $otro = $this->makeUser('otro@talonarioamigo.com');
        Emisor::create([
            'user_id' => $otro->id, 'ruc' => '1790011674001', 'razon_social' => 'Otro Negocio',
            'direccion_matriz' => 'Calle 2', 'tipo_regimen' => 'GENERAL', 'ambiente' => '1', 'tipo_emision' => '1', 'firma_p12_path' => 'firmas/test.p12',
        ]);
        Sanctum::actingAs($otro);
        $this->get('/api/v1/facturacion/comprobantes/' . self::CLAVE . '/ride')->assertStatus(404);

        $this->app['auth']->forgetGuards();
        $this->refreshApplication();
        $this->getJson('/api/v1/facturacion/comprobantes/' . self::CLAVE . '/ride')->assertStatus(401);
    }

    /** @test */
    public function el_enlace_firmado_funciona_y_sin_firma_o_alterado_da_403()
    {
        [, $res] = $this->emisionLista();

        $url = $res->json('ride_url');
        $this->assertNotEmpty($url);

        $r = $this->get($url);
        $r->assertStatus(200);
        $this->assertStringStartsWith('%PDF', $r->getContent());

        $this->get('/api/v1/ride/' . self::CLAVE)->assertStatus(403);
        $this->get(preg_replace('/signature=[0-9a-f]+/', 'signature=' . str_repeat('0', 64), $url))->assertStatus(403);
        $this->get(preg_replace('/expires=\d+/', 'expires=' . (time() + 99999999), $url))->assertStatus(403);
    }

    /** @test */
    public function el_enlace_firmado_funciona_detras_del_proxy_de_render()
    {
        // En Render el cliente abre "https://..." pero el servidor recibe "http://..." (el proxy
        // termina el TLS). La firma es relativa, así que el enlace debe abrir igual.
        config(['app.url' => 'https://talonario-amigo-api.onrender.com']);
        [, $res] = $this->emisionLista();
        $url = $res->json('ride_url');
        $this->assertStringStartsWith('https://talonario-amigo-api.onrender.com/api/v1/ride/', $url);

        $comoLoVeElServidor = 'http://otro-host.internal' . parse_url($url, PHP_URL_PATH) . '?' . parse_url($url, PHP_URL_QUERY);
        $this->get($comoLoVeElServidor)->assertOk()->assertHeader('content-type', 'application/pdf');
    }

    /** @test */
    public function la_lista_de_comprobantes_trae_ride_url_firmado()
    {
        $this->emisionLista();

        $r = $this->getJson('/api/v1/facturacion/comprobantes');
        $r->assertStatus(200);
        $this->assertStringContainsString('signature=', $r->json('comprobantes.0.ride_url'));
    }

    /** @test */
    public function el_correo_a_resend_lleva_el_pdf_adjunto_y_el_enlace()
    {
        config(['services.resend.key' => 're_test_clave']);
        Http::fake(['api.resend.com/*' => Http::response(['id' => 'abc'], 200)]);

        [, $res] = $this->emisionLista(['email' => 'cliente@example.com']);

        $res->assertJsonPath('email_enviado', true);
        Http::assertSent(function ($request) use ($res) {
            $adj = $request['attachments'][0] ?? null;

            return str_contains($request->url(), 'api.resend.com/emails')
                && $adj && $adj['filename'] === 'factura-001-001-000000001.pdf'
                && str_starts_with(base64_decode($adj['content']), '%PDF')
                && str_contains($request['html'], 'signature=');
        });
        $this->assertTrue((bool) Comprobante::first()->email_enviado);
    }

    /** @test */
    public function si_falla_el_pdf_la_emision_sigue_y_el_correo_sale_sin_adjunto()
    {
        config(['services.resend.key' => 're_test_clave']);
        Http::fake(['api.resend.com/*' => Http::response(['id' => 'abc'], 200)]);
        $this->mock(RideService::class, function ($mock) {
            $mock->shouldReceive('generar')->andThrow(new \RuntimeException('fallo simulado'));
        });

        [, $res] = $this->emisionLista(['email' => 'cliente@example.com']);

        $res->assertJsonPath('success', true)->assertJsonPath('email_enviado', true);
        Http::assertSent(fn ($request) => !isset($request['attachments']));
        $this->assertDatabaseHas('comprobantes', ['estado' => 'AUTORIZADO']);
    }
}
