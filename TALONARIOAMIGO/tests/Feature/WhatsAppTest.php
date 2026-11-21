<?php

namespace Tests\Feature;

use App\Models\Comprobante;
use App\Models\User;
use App\Services\FacturacionElectronicaLibrary;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\CreatesEmisorConFirma;
use Tests\TestCase;

/**
 * Factura por WhatsApp: firma del webhook, vínculo del número con código, borrador con
 * confirmación "SI" y emisión real por el mismo pipeline del facturador (SRI simulado).
 */
class WhatsAppTest extends TestCase
{
    use RefreshDatabase;
    use CreatesEmisorConFirma;

    private const NUMERO = '593991112233';
    private const SECRETO = 'app-secret-de-prueba';

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.whatsapp.token' => 'token-prueba',
            'services.whatsapp.phone_number_id' => '1234567890',
            'services.whatsapp.verify_token' => 'verificar-123',
            'services.whatsapp.app_secret' => self::SECRETO,
            'services.whatsapp.bot_number' => '593980000000',
        ]);

        Http::fake(['graph.facebook.com/*' => Http::response(['messages' => [['id' => 'wamid.out']]], 200)]);
    }

    private function makeUser(): User
    {
        return User::create([
            'name'      => 'Doña Rosa',
            'email'     => 'rosa@talonarioamigo.com',
            'password'  => Hash::make('secreto123'),
            'role'      => 'CLIENT',
            'is_active' => true,
            'status'    => 'ACTIVE',
        ]);
    }

    private function payload(string $texto, ?string $id = null, string $tipo = 'text'): array
    {
        $mensaje = ['from' => self::NUMERO, 'id' => $id ?? uniqid('wamid.'), 'type' => $tipo];
        if ($tipo === 'text') {
            $mensaje['text'] = ['body' => $texto];
        }

        return ['object' => 'whatsapp_business_account', 'entry' => [['changes' => [['value' => ['messages' => [$mensaje]]]]]]];
    }

    /** Envía un mensaje firmado como lo haría Meta. */
    private function enviar(string $texto, ?string $id = null, string $tipo = 'text')
    {
        $body = json_encode($this->payload($texto, $id, $tipo));

        return $this->call('POST', '/api/v1/whatsapp/webhook', [], [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_X_HUB_SIGNATURE_256' => 'sha256=' . hash_hmac('sha256', $body, self::SECRETO),
        ], $body);
    }

    /** Textos que el bot respondió por la API de Meta, en orden. */
    private function respuestas(): array
    {
        return Http::recorded()
            ->map(fn ($par) => $par[0]->data()['text']['body'] ?? null)
            ->filter()
            ->values()
            ->all();
    }

    private function ultimaRespuesta(): string
    {
        $r = $this->respuestas();
        $this->assertNotEmpty($r, 'El bot no respondió nada.');

        return end($r);
    }

    private function vincular(User $user): void
    {
        Sanctum::actingAs($user);
        $codigo = $this->postJson('/api/v1/whatsapp/vinculo')->assertOk()->json('codigo');
        $this->enviar('VINCULAR ' . $codigo)->assertOk();
    }

    private function mockSriAutorizado(): void
    {
        $clave = '19102026' . '01' . '0928374610001' . '1' . '001001' . '000000001' . '12345678' . '1' . '5';

        $this->mock(FacturacionElectronicaLibrary::class, function ($mock) use ($clave) {
            $mock->shouldReceive('generarClaveAcceso')->andReturn($clave);
            $mock->shouldReceive('generarYFirmarXml')->andReturn('<factura>FIRMADA</factura>');
            $mock->shouldReceive('enviarSri')->andReturn(['estado' => 'RECIBIDA']);
            $mock->shouldReceive('autorizarSri')->andReturn([
                'estado' => 'AUTORIZADO',
                'numeroAutorizacion' => $clave,
                'fechaAutorizacion' => '2026-11-21T10:00:00-05:00',
            ]);
        });
    }

    public function test_verificacion_del_webhook(): void
    {
        $this->get('/api/v1/whatsapp/webhook?hub_mode=subscribe&hub_verify_token=verificar-123&hub_challenge=42')
            ->assertOk()
            ->assertSee('42');

        $this->get('/api/v1/whatsapp/webhook?hub_mode=subscribe&hub_verify_token=otro&hub_challenge=42')
            ->assertForbidden();
    }

    public function test_rechaza_mensajes_sin_firma_valida_de_meta(): void
    {
        $this->postJson('/api/v1/whatsapp/webhook', $this->payload('hola'))->assertStatus(401);

        $this->call('POST', '/api/v1/whatsapp/webhook', [], [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_X_HUB_SIGNATURE_256' => 'sha256=' . str_repeat('0', 64),
        ], json_encode($this->payload('hola')))->assertStatus(401);

        Http::assertNothingSent();
    }

    public function test_numero_desconocido_recibe_instrucciones_para_vincular(): void
    {
        $this->enviar('hola')->assertOk();

        $this->assertStringContainsString('VINCULAR', $this->ultimaRespuesta());
    }

    public function test_vincula_el_numero_con_el_codigo_de_la_app(): void
    {
        $user = $this->makeUser();
        Sanctum::actingAs($user);

        $res = $this->postJson('/api/v1/whatsapp/vinculo')->assertOk();
        $this->assertMatchesRegularExpression('/^\d{6}$/', $res->json('codigo'));
        $this->assertStringStartsWith('https://wa.me/593980000000?text=VINCULAR', $res->json('link'));

        // Código equivocado no vincula.
        $this->enviar('VINCULAR 000000')->assertOk();
        $this->assertNull($user->fresh()->whatsapp_number);

        $this->enviar('vincular ' . $res->json('codigo'))->assertOk();
        $this->assertSame(self::NUMERO, $user->fresh()->whatsapp_number);
        $this->assertStringContainsString('conectado', $this->ultimaRespuesta());

        // El código es de un solo uso.
        $this->assertNull($user->fresh()->whatsapp_link_code_hash);

        Sanctum::actingAs($user->fresh());
        $this->getJson('/api/v1/whatsapp/vinculo')->assertJsonPath('vinculado', true)
            ->assertJsonPath('numero', '••••••••2233');
    }

    public function test_bloquea_fuerza_bruta_del_codigo(): void
    {
        foreach (range(1, 6) as $i) {
            $this->enviar('VINCULAR 00000' . $i)->assertOk();
        }

        $this->assertStringContainsString('Demasiados intentos', $this->ultimaRespuesta());
    }

    public function test_factura_completa_por_whatsapp_con_confirmacion(): void
    {
        $user = $this->makeUser();
        $emisor = $this->makeEmisor($user);
        $this->mockSriAutorizado();
        $this->vincular($user);

        // 1. Escribe la factura → el bot muestra el resumen, NO emite todavía.
        $this->enviar("Factura a Juan Pérez 0928374610\n2 colas a 0.50\n1 pan a 0.25")->assertOk();

        $resumen = $this->ultimaRespuesta();
        $this->assertStringContainsString('Revisa tu factura', $resumen);
        $this->assertStringContainsString('JUAN PÉREZ (0928374610)', $resumen);
        $this->assertStringContainsString('Total: $1.44', $resumen); // 1.25 + 15% IVA
        $this->assertSame(0, Comprobante::count());

        // 2. Responde "Sí" → emite por el mismo pipeline del facturador.
        $this->enviar('Sí')->assertOk();

        $this->assertStringContainsString('autorizada por el SRI', $this->ultimaRespuesta());
        $this->assertDatabaseHas('comprobantes', [
            'emisor_id' => $emisor->id,
            'estado' => 'AUTORIZADO',
            'cliente_identificacion' => '0928374610',
            'numero_comprobante' => '001-001-000000001',
        ]);
        $this->assertEqualsWithDelta(1.44, (float) Comprobante::first()->importe_total, 0.001);

        // 3. Un segundo "SI" no vuelve a emitir.
        $this->enviar('si')->assertOk();
        $this->assertSame(1, Comprobante::count());
        $this->assertStringContainsString('No tengo ninguna factura esperando', $this->ultimaRespuesta());
    }

    public function test_responder_no_cancela_sin_emitir(): void
    {
        $user = $this->makeUser();
        $this->makeEmisor($user);
        $this->mock(FacturacionElectronicaLibrary::class)->shouldNotReceive('enviarSri');
        $this->vincular($user);

        $this->enviar('factura consumidor final: 1 pan 0.25')->assertOk();
        $this->enviar('NO')->assertOk();
        $this->enviar('SI')->assertOk();

        $this->assertSame(0, Comprobante::count());
    }

    public function test_mensaje_reenviado_por_meta_se_procesa_una_sola_vez(): void
    {
        $this->enviar('hola', 'wamid.repetido')->assertOk();
        $this->enviar('hola', 'wamid.repetido')->assertOk();

        $this->assertCount(1, $this->respuestas());
    }

    public function test_errores_del_cliente_se_explican_sin_emitir(): void
    {
        $user = $this->makeUser();
        $this->makeEmisor($user);
        $this->vincular($user);

        // Consumidor final por más de $50: regla del SRI.
        $this->enviar('factura consumidor final: 1 televisor 400')->assertOk();
        $this->assertStringContainsString('$50', $this->ultimaRespuesta());

        // Audio: todavía no se transcribe.
        $this->enviar('', null, 'audio')->assertOk();
        $this->assertStringContainsString('mensajes escritos', $this->ultimaRespuesta());

        $this->assertSame(0, Comprobante::count());
    }

    public function test_sin_firma_electronica_le_dice_que_falta(): void
    {
        $user = $this->makeUser();
        $this->vincular($user);

        $this->enviar('factura consumidor final: 1 pan 0.25')->assertOk();

        $this->assertStringContainsString('falta un paso', $this->ultimaRespuesta());
    }
}
