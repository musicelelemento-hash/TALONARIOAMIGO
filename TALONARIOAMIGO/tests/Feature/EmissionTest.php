<?php

namespace Tests\Feature;

use App\Models\Comprobante;
use App\Models\Emisor;
use App\Models\PuntoEmision;
use App\Models\User;
use App\Services\FacturacionElectronicaLibrary;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * C1 — Emisión end-to-end con SOAP simulado.
 *
 * Prueba la orquestación REAL del controlador (validación de emisor/firma, armado del
 * payload, clave de acceso, persistencia y diagnóstico SRI) simulando únicamente la
 * frontera con la librería comprada y los servidores del SRI. La firma .p12 es real
 * (generada con OpenSSL) para que la validación pre-flight también sea real.
 */
class EmissionTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(): User
    {
        return User::create([
            'name'     => 'Comercio Emisor',
            'email'    => 'emisor@talonarioamigo.com',
            'password' => Hash::make('secreto123'),
            'role'     => 'CLIENT',
            'is_active' => true,
            'status'   => 'ACTIVE',
        ]);
    }

    private function makeP12(string $password = 'clave123'): string
    {
        // Algunos entornos Windows no traen el openssl.cnf del sistema; usamos uno mínimo
        // propio para que openssl_csr_sign / openssl_pkcs12_export funcionen sin depender de él.
        $config = tempnam(sys_get_temp_dir(), 'ta_openssl_') . '.cnf';
        file_put_contents($config, "[req]\ndistinguished_name = dn\nx509_extensions = v3_ca\nprompt = no\n\n[dn]\nCN = Talonario Amigo Test\nO = TA Test\nC = EC\n\n[v3_ca]\nbasicConstraints = CA:FALSE\nkeyUsage = digitalSignature, keyEncipherment\n");

        try {
            $key = openssl_pkey_new([
                'private_key_bits' => 2048,
                'private_key_type' => OPENSSL_KEYTYPE_RSA,
                'config'           => $config,
            ]);
            $csr  = openssl_csr_new([
                'commonName'        => 'Talonario Amigo Test',
                'organizationName'  => 'TA Test',
                'countryName'       => 'EC',
            ], $key, ['config' => $config]);
            $cert = openssl_csr_sign($csr, null, $key, 365, ['config' => $config]);
            $out  = '';
            openssl_pkcs12_export($cert, $out, $key, $password);
        } finally {
            @unlink($config);
        }

        return $out;
    }

    private function makeEmisor(User $user): Emisor
    {
        Storage::fake('local');
        Storage::disk('local')->put('firmas/test.p12', $this->makeP12());

        $emisor = Emisor::create([
            'user_id'          => $user->id,
            'ruc'              => '0928374610001',
            'razon_social'     => 'Tienda de Prueba',
            'nombre_comercial' => 'Tienda Prueba',
            'direccion_matriz' => 'Av. Prueba 123',
            'tipo_regimen'     => 'RIMPE_EMPRENDEDOR',
            'ambiente'         => '1',
            'tipo_emision'     => '1',
            'firma_p12_path'   => 'firmas/test.p12',
        ]);

        // firma_password no es fillable: se asigna vía mutador (cifra a firma_password_encrypted)
        $emisor->firma_password = 'clave123';
        $emisor->save();

        PuntoEmision::create([
            'emisor_id'          => $emisor->id,
            'establecimiento'    => '001',
            'punto_emision'      => '001',
            'nombre_sucursal'    => 'Matriz',
            'direccion_sucursal' => 'Av. Prueba 123',
            'secuencial_factura' => 1,
            'is_active'          => true,
        ]);

        return $emisor;
    }

    private function clave49(): string
    {
        // 8 fecha + 2 tipo + 13 ruc + 1 ambiente + 6 serie + 9 secuencial + 8 codigo + 1 emision + 1 dv = 49
        return '19102026' . '01' . '0928374610001' . '1' . '001001' . '000000001' . '12345678' . '1' . '5';
    }

    private function payloadFactura(): array
    {
        return [
            'cliente' => [
                'nombre'         => 'Juan Pérez',
                'identificacion' => '0928374610',
                'direccion'      => 'Av. Central N12',
                'telefono'       => '0999999999',
            ],
            'items' => [
                ['descripcion' => 'Producto A', 'cantidad' => 2, 'precioUnitario' => 10.00],
            ],
        ];
    }

    private function mockLibraryAutorizada(): void
    {
        $clave = $this->clave49();

        $this->mock(FacturacionElectronicaLibrary::class, function ($mock) use ($clave) {
            $mock->shouldReceive('generarClaveAcceso')->andReturn($clave);
            $mock->shouldReceive('generarYFirmarXml')->andReturn('<?xml version="1.0"?><factura>FIRMADA</factura>');
            $mock->shouldReceive('enviarSri')->andReturn(['estado' => 'RECIBIDA']);
            $mock->shouldReceive('autorizarSri')->andReturn([
                'estado'              => 'AUTORIZADO',
                'numeroAutorizacion'  => $clave,
                'fechaAutorizacion'   => '2026-10-19T10:00:00-05:00',
            ]);
        });
    }

    /** @test */
    public function emite_factura_end_to_end_con_soap_simulado_y_persiste()
    {
        $user   = $this->makeUser();
        $emisor = $this->makeEmisor($user);
        $this->mockLibraryAutorizada();
        Sanctum::actingAs($user);

        $res = $this->postJson('/api/v1/facturacion/emitir', $this->payloadFactura());

        $res->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('estado', 'AUTORIZADO')
            ->assertJsonPath('email_enviado', false);

        // Clave de acceso de 49 dígitos devuelta al cliente
        $this->assertSame(49, strlen($res->json('claveAcceso')));

        // Persistencia del comprobante (2 x $10 + IVA 15% = $23.00)
        $this->assertDatabaseHas('comprobantes', [
            'emisor_id'            => $emisor->id,
            'estado'               => 'AUTORIZADO',
            'numero_comprobante'   => '001-001-000000001',
            'cliente_identificacion' => '0928374610',
        ]);

        $comprobante = Comprobante::first();
        $this->assertEqualsWithDelta(23.0, (float) $comprobante->importe_total, 0.001);
        $this->assertEqualsWithDelta(20.0, (float) $comprobante->subtotal_gravado, 0.001);
        $this->assertEqualsWithDelta(3.0, (float) $comprobante->total_iva, 0.001);

        $this->assertDatabaseHas('comprobante_items', [
            'descripcion' => 'Producto A',
        ]);

        $this->assertDatabaseHas('clientes_frecuentes', [
            'emisor_id'      => $emisor->id,
            'identificacion' => '0928374610',
            'nombre'         => 'Juan Pérez',
        ]);
    }

    /** @test */
    public function diagnostica_rechazo_del_sri_y_no_persiste_como_autorizado()
    {
        $user   = $this->makeUser();
        $emisor = $this->makeEmisor($user);

        $this->mock(FacturacionElectronicaLibrary::class, function ($mock) {
            $mock->shouldReceive('generarClaveAcceso')->andReturn($this->clave49());
            $mock->shouldReceive('generarYFirmarXml')->andReturn('<factura>FIRMADA</factura>');
            $mock->shouldReceive('enviarSri')->andReturn(['estado' => 'RECIBIDA']);
            $mock->shouldReceive('autorizarSri')->andReturn([
                'estado'   => 'DEVUELTA',
                'mensajes' => [
                    [
                        'identificador'        => '43',
                        'mensaje'              => 'CLAVE ACCESO REGISTRADA',
                        'informacionAdicional' => '',
                        'tipo'                 => 'ERROR',
                    ],
                ],
            ]);
        });
        Sanctum::actingAs($user);

        $res = $this->postJson('/api/v1/facturacion/emitir', $this->payloadFactura());

        $res->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('estado', 'DEVUELTA');

        // El estado persistido refleja el rechazo del SRI (no AUTORIZADO)
        $this->assertDatabaseHas('comprobantes', [
            'emisor_id' => $emisor->id,
            'estado'    => 'DEVUELTA',
        ]);
        $this->assertDatabaseMissing('comprobantes', [
            'emisor_id' => $emisor->id,
            'estado'    => 'AUTORIZADO',
        ]);
    }
}
