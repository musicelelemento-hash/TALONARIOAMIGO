<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comprobante extends Model
{
    use HasFactory;

    protected $table = 'comprobantes';

    protected $fillable = [
        'emisor_id',
        'user_id',
        'tipo_comprobante',
        'establecimiento',
        'punto_emision',
        'secuencial',
        'numero_comprobante',
        'clave_acceso',
        'fecha_emision',
        'fecha_autorizacion',
        'numero_autorizacion',
        'cliente_tipo_identificacion',
        'cliente_identificacion',
        'cliente_nombre',
        'cliente_direccion',
        'cliente_telefono',
        'cliente_email',
        'subtotal_gravado',
        'subtotal_exento',
        'total_descuento',
        'total_iva',
        'importe_total',
        'tarifa_iva_porcentaje',
        'estado',
        'ambiente',
        'tipo_emision',
        'xml_path',
        'pdf_path',
        'email_enviado',
        'email_enviado_at',
        'sri_mensaje',
    ];

    protected $casts = [
        'fecha_emision' => 'datetime',
        'fecha_autorizacion' => 'datetime',
        'email_enviado' => 'boolean',
        'email_enviado_at' => 'datetime',
        'subtotal_gravado' => 'decimal:2',
        'subtotal_exento' => 'decimal:2',
        'total_descuento' => 'decimal:2',
        'total_iva' => 'decimal:2',
        'importe_total' => 'decimal:2',
    ];

    public function emisor()
    {
        return $this->belongsTo(Emisor::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(ComprobanteItem::class);
    }
}
