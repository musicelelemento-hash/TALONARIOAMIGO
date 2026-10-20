<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PuntoEmision extends Model
{
    use HasFactory;

    protected $table = 'puntos_emision';

    protected $fillable = [
        'emisor_id',
        'establecimiento',
        'punto_emision',
        'nombre_sucursal',
        'direccion_sucursal',
        'secuencial_factura',
        'secuencial_nota_credito',
        'secuencial_retencion',
        'secuencial_liquidacion',
        'secuencial_guia_remision',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'secuencial_factura' => 'integer',
        'secuencial_nota_credito' => 'integer',
        'secuencial_retencion' => 'integer',
        'secuencial_liquidacion' => 'integer',
        'secuencial_guia_remision' => 'integer',
    ];

    public function emisor()
    {
        return $this->belongsTo(Emisor::class);
    }

    /**
     * Incrementa el secuencial especificado para la siguiente emisión
     */
    public function obtenerYIncrementarSecuencial(string $tipoComprobante): string
    {
        $columna = match ($tipoComprobante) {
            'factura', '01' => 'secuencial_factura',
            'nota_credito', '04' => 'secuencial_nota_credito',
            'retencion', '07' => 'secuencial_retencion',
            'liquidacion', '03' => 'secuencial_liquidacion',
            'guia_remision', '06' => 'secuencial_guia_remision',
            default => 'secuencial_factura',
        };

        $secuencialActual = $this->$columna;
        $this->increment($columna);

        return str_pad((string) $secuencialActual, 9, '0', STR_PAD_LEFT);
    }
}
