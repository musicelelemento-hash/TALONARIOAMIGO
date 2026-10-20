<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResellerPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'reseller_id',
        'package_name',
        'allocated_accounts',
        'used_accounts',
        'is_active',
        'expires_at'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'expires_at' => 'datetime'
    ];

    /**
     * Imprenta reseller dueña del paquete
     */
    public function reseller()
    {
        return $this->belongsTo(User::class, 'reseller_id');
    }

    /**
     * Cuentas disponibles en el paquete
     */
    public function getAvailableAccountsAttribute()
    {
        return max(0, $this->allocated_accounts - $this->used_accounts);
    }
}
