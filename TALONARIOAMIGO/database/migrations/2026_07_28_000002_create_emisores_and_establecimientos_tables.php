<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEmisoresAndEstablecimientosTables extends Migration
{
    public function up()
    {
        // Datos Tributarios del Emisor
        Schema::create('emisores', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique();
            $table->string('ruc', 13)->index();
            $table->string('razon_social');
            $table->string('nombre_comercial')->nullable();
            $table->text('direccion_matriz');
            $table->string('contribuyente_especial')->nullable();
            $table->boolean('obligado_contabilidad')->default(false);
            $table->string('tipo_regimen')->default('RIMPE_EMPRENDEDOR'); // RIMPE_POPULAR, RIMPE_EMPRENDEDOR, GENERAL
            $table->string('ambiente')->default('1'); // 1: Pruebas, 2: Produccion
            $table->string('tipo_emision')->default('1'); // 1: Normal
            
            // Archivo de Firma Electrónica .p12
            $table->string('firma_p12_path')->nullable();
            $table->text('firma_password_encrypted')->nullable();
            $table->timestamp('firma_expires_at')->nullable();
            
            $table->string('logo_path')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // Establecimientos y Puntos de Emisión SRI
        Schema::create('puntos_emision', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('emisor_id');
            $table->string('establecimiento', 3)->default('001'); // Ej: 001
            $table->string('punto_emision', 3)->default('001'); // Ej: 001
            $table->string('nombre_sucursal')->default('Matriz');
            $table->text('direccion_sucursal');
            
            // Secuenciales SRI
            $table->bigInteger('secuencial_factura')->default(1);
            $table->bigInteger('secuencial_nota_credito')->default(1);
            $table->bigInteger('secuencial_retencion')->default(1);
            $table->bigInteger('secuencial_liquidacion')->default(1);
            $table->bigInteger('secuencial_guia_remision')->default(1);
            
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('emisor_id')->references('id')->on('emisores')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('puntos_emision');
        Schema::dropIfExists('emisores');
    }
}
