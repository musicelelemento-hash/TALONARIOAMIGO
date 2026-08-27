<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRolesAndResellersTables extends Migration
{
    public function up()
    {
        // 1. Ampliación de usuarios con roles y asignación de imprenta reseller
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('CLIENT')->after('email'); // SUPER_ADMIN, RESELLER, CLIENT
            $table->unsignedBigInteger('reseller_id')->nullable()->after('role'); // Imprenta a la que pertenece
            $table->string('phone')->nullable()->after('reseller_id');
            $table->string('whatsapp_support')->nullable()->after('phone');
            $table->boolean('is_active')->default(true)->after('whatsapp_support'); // Control Global On/Off
            $table->string('status')->default('PENDING_ONBOARDING')->after('is_active'); // PENDING_ONBOARDING, ACTIVE, SUSPENDED_NO_SIG, SUSPENDED_PAYMENT
        });

        // 2. Lotes de Cuentas para Imprentas (Resellers)
        Schema::create('reseller_packages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('reseller_id');
            $table->string('package_name'); // Ej. "Lote 30 Cuentas Imprenta Offset"
            $table->integer('allocated_accounts')->default(30);
            $table->integer('used_accounts')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->foreign('reseller_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('reseller_packages');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'reseller_id', 'phone', 'whatsapp_support', 'is_active', 'status']);
        });
    }
}
