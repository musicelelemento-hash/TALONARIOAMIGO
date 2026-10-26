<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(array $overrides = []): User
    {
        return User::create(array_merge([
            'name'          => 'Comercio prueba',
            'email'         => 'prueba@talonarioamigo.com',
            'password'      => Hash::make('secreto123'),
            'role'          => 'CLIENT',
            'is_active'     => true,
            'status'        => 'ACTIVE',
        ], $overrides));
    }

    /** @test */
    public function login_entrega_token_con_credenciales_validas()
    {
        $this->makeUser();

        $res = $this->postJson('/api/v1/auth/login', [
            'email'    => 'prueba@talonarioamigo.com',
            'password' => 'secreto123',
        ]);

        $res->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('user.role', 'CLIENT');

        $this->assertNotEmpty($res->json('token'));
    }

    /** @test */
    public function login_rechaza_password_incorrecta()
    {
        $this->makeUser();

        $res = $this->postJson('/api/v1/auth/login', [
            'email'    => 'prueba@talonarioamigo.com',
            'password' => 'incorrecta',
        ]);

        $res->assertStatus(422);
    }

    /** @test */
    public function login_bloquea_cuenta_suspendida()
    {
        $this->makeUser(['is_active' => false, 'status' => 'SUSPENDED_PAYMENT']);

        $res = $this->postJson('/api/v1/auth/login', [
            'email'    => 'prueba@talonarioamigo.com',
            'password' => 'secreto123',
        ]);

        $res->assertStatus(403)
            ->assertJsonPath('code', 'ACCOUNT_SUSPENDED');
    }

    /** @test */
    public function registro_publico_crea_emisor_y_punto_de_emision()
    {
        $res = $this->postJson('/api/v1/auth/register', [
            'name'                   => 'Comercio Nueva',
            'email'                  => 'nueva@talonarioamigo.com',
            'password'               => 'secreto123',
            'ruc'                    => '1792345678001',
            'razon_social'           => 'Comercio Nueva S.A.',
            'direccion_matriz'       => 'Av. Siempre Viva 123',
            'tipo_regimen'           => 'RIMPE_EMPRENDEDOR',
            'obligado_contabilidad'  => false,
        ]);

        $res->assertStatus(200)->assertJsonPath('success', true);

        $this->assertDatabaseHas('users', [
            'email' => 'nueva@talonarioamigo.com',
            'role'  => 'CLIENT',
        ]);
        $this->assertDatabaseHas('emisores', ['ruc' => '1792345678001']);
        $this->assertDatabaseHas('puntos_emision', [
            'establecimiento' => '001',
            'punto_emision'   => '001',
        ]);
    }

    /** @test */
    public function registro_valida_campos_requeridos()
    {
        $res = $this->postJson('/api/v1/auth/register', ['name' => 'sin datos']);

        $res->assertStatus(422)
            ->assertJsonValidationErrors([
                'email', 'password', 'ruc', 'razon_social', 'direccion_matriz', 'tipo_regimen',
            ]);
    }

    /** @test */
    public function facturacion_requiere_autenticacion()
    {
        $this->getJson('/api/v1/facturacion/comprobantes')
            ->assertStatus(401);
    }
}
