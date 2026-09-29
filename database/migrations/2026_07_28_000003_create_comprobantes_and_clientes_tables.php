<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateComprobantesAndClientesTables extends Migration
{
    public function up()
    {
        // 1. Tabla de Comprobantes Electrónicos Emitidos
        Schema::create('comprobantes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('emisor_id')->index();
            $table->unsignedBigInteger('user_id')->index();
            $table->string('tipo_comprobante', 2)->default('01'); // 01: Factura, 04: Nota de Crédito, 07: Retención
            
            // Serie y Secuencial
            $table->string('establecimiento', 3)->default('001');
            $table->string('punto_emision', 3)->default('001');
            $table->string('secuencial', 9)->index();
            $table->string('numero_comprobante', 17)->index(); // Ej: 001-001-000000126
            $table->string('clave_acceso', 49)->unique()->index();
            
            // Fechas
            $table->dateTime('fecha_emision')->index();
            $table->dateTime('fecha_autorizacion')->nullable()->index();
            $table->string('numero_autorizacion', 49)->nullable();
            
            // Datos del Comprador / Cliente
            $table->string('cliente_tipo_identificacion', 2)->default('05'); // 04: RUC, 05: Cédula, 07: Consumidor Final
            $table->string('cliente_identificacion', 20)->index();
            $table->string('cliente_nombre');
            $table->text('cliente_direccion')->nullable();
            $table->string('cliente_telefono', 30)->nullable();
            $table->string('cliente_email')->nullable()->index();
            
            // Importes y Totales
            $table->decimal('subtotal_gravado', 12, 2)->default(0.00);
            $table->decimal('subtotal_exento', 12, 2)->default(0.00);
            $table->decimal('total_descuento', 12, 2)->default(0.00);
            $table->decimal('total_iva', 12, 2)->default(0.00);
            $table->decimal('importe_total', 12, 2)->index();
            $table->integer('tarifa_iva_porcentaje')->default(15);
            
            // Estados y Ambiente
            $table->string('estado', 30)->default('AUTORIZADO')->index(); // AUTORIZADO, EN_PROCESO, DEVUELTA, NO_AUTORIZADO, OFFLINE_LOCAL
            $table->string('ambiente', 1)->default('1'); // 1: Pruebas, 2: Producción
            $table->string('tipo_emision', 1)->default('1'); // 1: Normal
            
            // Almacenamiento y Notificaciones
            $table->string('xml_path')->nullable();
            $table->string('pdf_path')->nullable();
            $table->boolean('email_enviado')->default(false);
            $table->dateTime('email_enviado_at')->nullable();
            $table->text('sri_mensaje')->nullable();
            
            $table->timestamps();

            $table->foreign('emisor_id')->references('id')->on('emisores')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // 2. Tabla de Detalles / Renglones de Comprobante
        Schema::create('comprobante_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('comprobante_id')->index();
            $table->string('codigo_principal', 50)->nullable();
            $table->string('descripcion');
            $table->decimal('cantidad', 14, 6)->default(1.000000);
            $table->decimal('precio_unitario', 14, 6)->default(0.000000);
            $table->decimal('descuento', 12, 2)->default(0.00);
            $table->decimal('precio_total_sin_impuesto', 12, 2)->default(0.00);
            $table->string('impuesto_codigo', 2)->default('2'); // 2: IVA
            $table->string('impuesto_porcentaje_codigo', 4)->default('4'); // 4: 15%
            $table->decimal('impuesto_tarifa', 5, 2)->default(15.00);
            $table->decimal('impuesto_valor', 12, 2)->default(0.00);
            $table->boolean('exento')->default(false);
            $table->timestamps();

            $table->foreign('comprobante_id')->references('id')->on('comprobantes')->onDelete('cascade');
        });

        // 3. Tabla de Clientes Frecuentes (Principio 14)
        Schema::create('clientes_frecuentes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('emisor_id')->index();
            $table->string('identificacion', 20)->index();
            $table->string('tipo_identificacion', 2)->default('05');
            $table->string('nombre');
            $table->text('direccion')->nullable();
            $table->string('telefono', 30)->nullable();
            $table->string('email')->nullable();
            $table->integer('compras_count')->default(1);
            $table->dateTime('ultima_compra_at')->nullable();
            $table->timestamps();

            $table->unique(['emisor_id', 'identificacion']);
            $table->foreign('emisor_id')->references('id')->on('emisores')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('clientes_frecuentes');
        Schema::dropIfExists('comprobante_items');
        Schema::dropIfExists('comprobantes');
    }
}
