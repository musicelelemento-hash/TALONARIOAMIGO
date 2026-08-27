<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class Emisor extends Model
{
    use HasFactory;

    protected $table = 'emisores';

    protected $fillable = [
        'user_id',
        'ruc',
        'razon_social',
        'nombre_comercial',
        'direccion_matriz',
        'contribuyente_especial',
        'obligado_contabilidad',
        'tipo_regimen',
        'ambiente',
        'tipo_emision',
        'firma_p12_path',
        'firma_password_encrypted',
        'firma_expires_at',
        'logo_path',
    ];

    protected $casts = [
        'obligado_contabilidad' => 'boolean',
        'firma_expires_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function puntosEmision()
    {
        return $this->hasMany(PuntoEmision::class);
    }

    public function setFirmaPasswordAttribute($value)
    {
        $this->attributes['firma_password_encrypted'] = Crypt::encryptString($value);
    }

    public function getFirmaPasswordAttribute()
    {
        if (empty($this->attributes['firma_password_encrypted'])) {
            return null;
        }
        try {
            return Crypt::decryptString($this->attributes['firma_password_encrypted']);
        } catch (\Exception $e) {
            return null;
        }
    }
}
