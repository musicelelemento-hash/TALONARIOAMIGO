<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsappConversacion extends Model
{
    protected $table = 'whatsapp_conversaciones';

    protected $fillable = ['whatsapp_number', 'user_id', 'borrador', 'borrador_expira_at'];

    protected $casts = [
        'borrador' => 'array',
        'borrador_expira_at' => 'datetime',
    ];

    public function borradorVigente(): ?array
    {
        if (empty($this->borrador) || !$this->borrador_expira_at || $this->borrador_expira_at->isPast()) {
            return null;
        }

        return $this->borrador;
    }

    public function limpiarBorrador(): void
    {
        $this->forceFill(['borrador' => null, 'borrador_expira_at' => null])->save();
    }
}
