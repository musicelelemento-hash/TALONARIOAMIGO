<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\ResellerPackage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Crea la cuenta maestra del Dueño, Imprentas de prueba y Lotes.
     */
    public function run()
    {
        $masterEmail = env('SEED_SUPERADMIN_EMAIL');
        $masterPassword = env('SEED_SUPERADMIN_PASSWORD');

        if (empty($masterEmail) || empty($masterPassword)) {
            $this->command->warn('SuperAdminSeeder omitido: define SEED_SUPERADMIN_EMAIL y SEED_SUPERADMIN_PASSWORD en el entorno.');
            return;
        }

        // 1. Crear Cuenta Maestra SuperAdmin (Dueño)
        $superAdmin = User::updateOrCreate(
            ['email' => $masterEmail],
            [
                'name' => env('SEED_SUPERADMIN_NAME', 'Dueño Talonario Amigo'),
                'password' => Hash::make($masterPassword),
                'phone' => env('DEFAULT_SUPPORT_WHATSAPP', ''),
                'role' => 'SUPER_ADMIN',
                'whatsapp_support' => env('DEFAULT_SUPPORT_WHATSAPP', ''),
                'is_active' => true,
                'status' => 'ACTIVE'
            ]
        );

        // 2. Crear Primera Imprenta Reseller (solo si se proveen datos por entorno)
        $resellerEmail = env('SEED_RESELLER_EMAIL');
        if (!empty($resellerEmail)) {
            $reseller = User::updateOrCreate(
                ['email' => $resellerEmail],
                [
                    'name' => env('SEED_RESELLER_NAME', 'Imprenta Reseller'),
                    'password' => Hash::make(env('SEED_RESELLER_PASSWORD', Str::random(16))),
                    'phone' => env('SEED_RESELLER_PHONE', ''),
                    'role' => 'RESELLER',
                    'whatsapp_support' => env('SEED_RESELLER_PHONE', ''),
                    'is_active' => true,
                    'status' => 'ACTIVE'
                ]
            );

            // 3. Asignar Lote Inicial de 30 Licencias a la Imprenta
            ResellerPackage::updateOrCreate(
                [
                    'reseller_id' => $reseller->id,
                    'package_name' => 'Lote Inicial 30 Cuentas Imprenta Offset'
                ],
                [
                    'allocated_accounts' => 30,
                    'used_accounts' => 0,
                    'is_active' => true
                ]
            );
        }

        $this->command->info('✅ Seeder ejecutado: cuenta maestra creada desde variables de entorno.');
    }
}
