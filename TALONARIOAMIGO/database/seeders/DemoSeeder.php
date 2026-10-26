<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * DemoSeeder — datos de demostración para que un comprador, imprenta o
 * presentación comercial vea el talonario funcionando con historial real.
 *
 * Crea (de forma idempotente):
 *   - un usuario CLIENT con emisor (ambiente Pruebas = 1)
 *   - un punto de emisión (001-001)
 *   - clientes frecuentes (consumidor final, RUC, cédula)
 *   - comprobantes de ejemplo con sus renglones
 *
 * Ejecutar:
 *   php artisan db:seed --class=DemoSeeder
 *
 * Credenciales demo (se pueden cambiar por env):
 *   SEED_DEMO_EMAIL     (default: demo@talonarioamigo.com)
 *   SEED_DEMO_PASSWORD  (default: demo)
 */
class DemoSeeder extends Seeder
{
    public function run()
    {
        $demoEmail = env('SEED_DEMO_EMAIL', 'demo@talonarioamigo.com');
        $demoPassword = env('SEED_DEMO_PASSWORD', 'demo');

        // 1. Usuario CLIENT (dueño del emisor demo)
        $user = User::updateOrCreate(
            ['email' => $demoEmail],
            [
                'name'             => 'Comercial Demo Talonario Amigo',
                'password'         => Hash::make($demoPassword),
                'phone'            => '0991111222',
                'role'             => 'CLIENT',
                'whatsapp_support' => '0991111222',
                'is_active'        => true,
                'status'           => 'ACTIVE',
            ]
        );

        // 2. Emisor demo (ambiente 1 = Pruebas)
        DB::table('emisores')->updateOrInsert(
            ['user_id' => $user->id],
            [
                'ruc'                 => '1792345678001',
                'razon_social'        => 'Comercial Demo Talonario Amigo',
                'nombre_comercial'    => 'Talonario Amigo Demo',
                'direccion_matriz'    => 'Av. Sierra y Amazonas N30-123, Quito',
                'contribuyente_especial' => null,
                'obligado_contabilidad'  => false,
                'tipo_regimen'        => 'RIMPE_EMPRENDEDOR',
                'ambiente'            => '1',
                'tipo_emision'        => '1',
                // Firma placeholder SOLO para la demo (cuenta de Pruebas): permite
                // navegar historial/UI sin una .p12 real. La emisión real requiere
                // el .p12 del cliente.
                'firma_p12_path'      => 'demo/firma-demo.p12',
                'firma_password_encrypted' => null,
                'firma_expires_at'    => now()->addYear(),
                'logo_path'           => null,
                'updated_at'          => now(),
                'created_at'          => now(),
            ]
        );

        $emisorId = (int) DB::table('emisores')->where('user_id', $user->id)->value('id');

        // 3. Punto de emisión (sucursal Matriz)
        DB::table('puntos_emision')->updateOrInsert(
            ['emisor_id' => $emisorId, 'establecimiento' => '001', 'punto_emision' => '001'],
            [
                'nombre_sucursal'         => 'Matriz Quito',
                'direccion_sucursal'      => 'Av. Sierra y Amazonas N30-123, Quito',
                'secuencial_factura'      => 4,
                'secuencial_nota_credito' => 1,
                'secuencial_retencion'    => 1,
                'secuencial_liquidacion'  => 1,
                'secuencial_guia_remision'=> 1,
                'is_active'               => true,
                'updated_at'              => now(),
                'created_at'              => now(),
            ]
        );

        // 4. Clientes frecuentes
        $clientes = [
            [
                'tipo_identificacion' => '07',
                'identificacion'      => '9999999999999',
                'nombre'              => 'Consumidor Final',
                'direccion'           => null,
                'telefono'            => null,
                'email'               => null,
            ],
            [
                'tipo_identificacion' => '04',
                'identificacion'      => '1790012345001',
                'nombre'              => 'Distribuidora El Sol',
                'direccion'           => 'Av. Amazonas 123, Quito',
                'telefono'            => '022555666',
                'email'               => 'compras@distribuidoraelsol.com',
            ],
            [
                'tipo_identificacion' => '05',
                'identificacion'      => '1712345678',
                'nombre'              => 'María López',
                'direccion'           => 'Calle Falsa 123, Quito',
                'telefono'            => '0987654321',
                'email'               => 'maria.lopez@correo.com',
            ],
        ];
        foreach ($clientes as $c) {
            DB::table('clientes_frecuentes')->updateOrInsert(
                ['emisor_id' => $emisorId, 'identificacion' => $c['identificacion']],
                array_merge($c, [
                    'emisor_id'       => $emisorId,
                    'compras_count'   => 1,
                    'ultima_compra_at'=> now(),
                    'updated_at'      => now(),
                    'created_at'      => now(),
                ])
            );
        }

        // 5. Comprobantes de demostración
        $comprobantes = [
            [
                'cliente'   => $clientes[1], // Distribuidora El Sol (RUC)
                'fecha'     => now()->subDays(5)->setTime(9, 15),
                'items'     => [
                    ['Cuaderno profesional 100 hojas', 24, 1.85],
                    ['Lápices de colores x12', 10, 3.20],
                    ['Reglas de 30 cm', 15, 0.75],
                ],
            ],
            [
                'cliente'   => $clientes[2], // María López (cédula)
                'fecha'     => now()->subDays(3)->setTime(11, 40),
                'items'     => [
                    ['Certificado de graduación A4', 2, 12.50],
                    ['Impresión a color', 35, 0.25],
                ],
            ],
            [
                'cliente'   => $clientes[0], // Consumidor Final
                'fecha'     => now()->subDays(1)->setTime(16, 5),
                'items'     => [
                    ['Talonario de facturas preimpreso 100 hojas', 1, 18.00],
                ],
            ],
        ];

        $secuencial = 1;
        foreach ($comprobantes as $comp) {
            $clave = $this->generarClaveAcceso('1792345678001', '1', '001001', $secuencial);

            // Totales
            $subtotal = 0.0;
            $detalles = [];
            foreach ($comp['items'] as $it) {
                [$desc, $qty, $precio] = $it;
                $linea = round($qty * $precio, 2);
                $iva = round($linea * 0.15, 2);
                $subtotal += $linea;
                $detalles[] = [
                    'descripcion'      => $desc,
                    'cantidad'         => $qty,
                    'precio_unitario'  => $precio,
                    'descuento'        => 0.00,
                    'precio_total_sin_impuesto' => $linea,
                    'impuesto_codigo'  => '2',
                    'impuesto_porcentaje_codigo' => '4',
                    'impuesto_tarifa'  => 15.00,
                    'impuesto_valor'   => $iva,
                    'exento'           => false,
                ];
            }
            $subtotal = round($subtotal, 2);
            $ivaTotal = round($subtotal * 0.15, 2);

            DB::table('comprobantes')->updateOrInsert(
                ['clave_acceso' => $clave],
                [
                    'emisor_id'          => $emisorId,
                    'user_id'            => $user->id,
                    'tipo_comprobante'   => '01',
                    'establecimiento'    => '001',
                    'punto_emision'      => '001',
                    'secuencial'         => str_pad((string) $secuencial, 9, '0', STR_PAD_LEFT),
                    'numero_comprobante' => '001-001-' . str_pad((string) $secuencial, 9, '0', STR_PAD_LEFT),
                    'clave_acceso'       => $clave,
                    'fecha_emision'      => $comp['fecha'],
                    'fecha_autorizacion' => $comp['fecha']->copy()->addMinutes(2),
                    'numero_autorizacion'=> $comp['fecha']->copy()->addMinutes(2)->timestamp . '0',
                    'cliente_tipo_identificacion' => $comp['cliente']['tipo_identificacion'],
                    'cliente_identificacion' => $comp['cliente']['identificacion'],
                    'cliente_nombre'     => $comp['cliente']['nombre'],
                    'cliente_direccion'  => $comp['cliente']['direccion'],
                    'cliente_telefono'   => $comp['cliente']['telefono'],
                    'cliente_email'      => $comp['cliente']['email'],
                    'subtotal_gravado'   => $subtotal,
                    'subtotal_exento'    => 0.00,
                    'total_descuento'    => 0.00,
                    'total_iva'          => $ivaTotal,
                    'importe_total'      => round($subtotal + $ivaTotal, 2),
                    'tarifa_iva_porcentaje' => 15,
                    'estado'             => 'AUTORIZADO',
                    'ambiente'           => '1',
                    'tipo_emision'       => '1',
                    'xml_path'           => null,
                    'pdf_path'           => null,
                    'email_enviado'      => false,
                    'email_enviado_at'   => null,
                    'sri_mensaje'        => 'Comprobante de demostración (ambiente de Pruebas)',
                    'updated_at'         => now(),
                    'created_at'         => now(),
                ]
            );

            $comprobanteId = (int) DB::table('comprobantes')->where('clave_acceso', $clave)->value('id');

            // Borrar renglones previos (idempotencia) y reinsertar
            DB::table('comprobante_items')->where('comprobante_id', $comprobanteId)->delete();
            foreach ($detalles as $d) {
                DB::table('comprobante_items')->insert(array_merge($d, [
                    'comprobante_id' => $comprobanteId,
                    'updated_at'     => now(),
                    'created_at'     => now(),
                ]));
            }

            $secuencial++;
        }

        $this->command->info('✅ DemoSeeder: datos demo creados (emisor Pruebas + 3 comprobantes).');
        $this->command->info('   Usuario demo: ' . $demoEmail . ' / ' . $demoPassword);
    }

    /**
     * Genera una clave de acceso SRI válida en longitud (49 dígitos) e idempotente
     * por (ruc, ambiente, serie, secuencial). Calcula el dígito verificador Módulo 11.
     */
    private function generarClaveAcceso(string $ruc, string $ambiente, string $serie, int $secuencial): string
    {
        $fecha = '01012026';                         // fecha fija -> clave determinista (idempotente)
        $tipo  = '01';                                // 2 (Factura)
        $codigo = str_pad((string) $secuencial, 8, '0', STR_PAD_LEFT); // 8
        $sec = str_pad((string) $secuencial, 9, '0', STR_PAD_LEFT); // 9

        $base = $fecha . $tipo . $ruc . $ambiente . $serie . $sec . $codigo; // 47
        $dv = $this->modulo11($base);
        $clave = $base . $dv; // 48

        // La columna es string(49); completamos a 49 de forma determinista.
        return str_pad($clave, 49, '0', STR_PAD_RIGHT);
    }

    /** Dígito verificador Módulo 11 (factores 2..7 ciclados de derecha a izquierda). */
    private function modulo11(string $cadena): int
    {
        $suma = 0;
        $factor = 2;
        for ($i = strlen($cadena) - 1; $i >= 0; $i--) {
            $suma += ((int) $cadena[$i]) * $factor;
            $factor = ($factor === 7) ? 2 : $factor + 1;
        }
        $resto = 11 - ($suma % 11);
        if ($resto === 11) return 0;
        if ($resto === 10) return 1;
        return $resto;
    }
}
