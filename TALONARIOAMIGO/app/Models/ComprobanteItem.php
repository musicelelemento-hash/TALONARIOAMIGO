<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ComprobanteItem extends Model
{
    use HasFactory;

    protected $table = 'comprobante_items';

    protected $fillable = [
        'comprobante_id',
        'codigo_principal',
        'descripcion',
        'cantidad',
        'precio_unitario',
        'descuento',
        'precio_total_sin_impuesto',
        'impuesto_codigo',
        'impuesto_porcentaje_codigo',
        'impuesto_tarifa',
        'impuesto_valor',
        'exento',
    ];

    protected $casts = [
        'cantidad' => 'decimal:6',
        'precio_unitario' => 'decimal:6',
        'descuento' => 'decimal:2',
        'precio_total_sin_impuesto' => 'decimal:2',
        'impuesto_tarifa' => 'decimal:2',
        'impuesto_valor' => 'decimal:2',
        'exento' => 'boolean',
    ];

    public function comprobante()
    {
        return $this->belongsTo(Comprobante::class);
    }
}
