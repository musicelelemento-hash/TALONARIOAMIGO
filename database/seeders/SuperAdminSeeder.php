<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\ResellerPackage;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Crea la cuenta maestra del Dueño, Imprentas de prueba y Lotes.
     */
    public function run()
    {
        // 1. Crear Cuenta Maestra SuperAdmin (Dueño)
        $superAdmin = User::updateOrCreate(
            ['email' => 'admin@talonarioamigo.com'],
            [
                'name' => 'Dueño Talonario Amigo',
                'password' => Hash::make('TalonarioAmigo2026Master!'),
                'phone' => '0993050689',
                'role' => 'SUPER_ADMIN',
                'whatsapp_support' => '593993050689',
                'is_active' => true,
                'status' => 'ACTIVE'
            ]
        );

        // 2. Crear Primera Imprenta Reseller (Ej. Imprenta Gráficas Amazonas)
        $reseller = User::updateOrCreate(
            ['email' => 'graficas.amazonas@imprenta.com'],
            [
                'name' => 'Imprenta Gráficas Amazonas',
                'password' => Hash::make('Imprenta123456!'),
                'phone' => '0992345678',
                'role' => 'RESELLER',
                'whatsapp_support' => '593992345678',
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

        $this->command->info('✅ Seeder ejecutado: Cuenta Maestra de SuperAdmin e Imprenta Reseller inicial creadas exitosamente.');
    }
}
