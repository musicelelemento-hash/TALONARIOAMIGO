<?php

namespace Tests\Concerns;

use App\Models\Emisor;
use App\Models\PuntoEmision;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

/**
 * Emisor listo para emitir: datos tributarios, punto de emisión 001-001 y firma .p12 real
 * (generada con OpenSSL) guardada en el disco local simulado.
 */
trait CreatesEmisorConFirma
{
    protected function makeP12(string $password = 'clave123'): string
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

    protected function makeEmisor(User $user): Emisor
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
}
