<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClienteFrecuente extends Model
{
    use HasFactory;

    protected $table = 'clientes_frecuentes';

    protected $fillable = [
        'emisor_id',
        'identificacion',
        'tipo_identificacion',
        'nombre',
        'direccion',
        'telefono',
        'email',
        'compras_count',
        'ultima_compra_at',
    ];

    protected $casts = [
        'compras_count' => 'integer',
        'ultima_compra_at' => 'datetime',
    ];

    public function emisor()
    {
        return $this->belongsTo(Emisor::class);
    }
}
