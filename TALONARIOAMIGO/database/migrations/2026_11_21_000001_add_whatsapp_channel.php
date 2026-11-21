<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Canal de facturación por WhatsApp.
 *
 * - users.whatsapp_number: número (solo dígitos, formato internacional 5939XXXXXXXX) vinculado
 *   con un código de un solo uso generado desde la app con sesión iniciada.
 * - whatsapp_conversaciones: estado mínimo por número (borrador pendiente de confirmar "SI").
 */
return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('whatsapp_number', 20)->nullable()->unique();
            $table->string('whatsapp_link_code_hash', 64)->nullable()->index();
            $table->timestamp('whatsapp_link_expires_at')->nullable();
        });

        Schema::create('whatsapp_conversaciones', function (Blueprint $table) {
            $table->id();
            $table->string('whatsapp_number', 20)->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->json('borrador')->nullable();
            $table->timestamp('borrador_expira_at')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('whatsapp_conversaciones');

        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['whatsapp_number']);
            $table->dropIndex(['whatsapp_link_code_hash']);
            $table->dropColumn(['whatsapp_number', 'whatsapp_link_code_hash', 'whatsapp_link_expires_at']);
        });
    }
};
