<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ResendService
{
    private $apiKey;
    private $fromEmail;
    private $fromName;

    public function __construct()
    {
        $this->apiKey = env('RESEND_API_KEY');
        $this->fromEmail = env('MAIL_FROM_ADDRESS', 'onboarding@resend.dev');
        $this->fromName = env('MAIL_FROM_NAME', 'Talonario Amigo');
    }

    /**
     * Enviar comprobante electrónico por email vía Resend API
     */
    public function enviarComprobante($destinatario, $clienteNombre, $numeroComprobante, $tipoComprobante, $total, $pdfUrl = null, $xmlUrl = null)
    {
        if (empty($this->apiKey) || empty($destinatario)) {
            Log::info("[ResendService] Envío omitido: no hay API Key o email de destinatario.");
            return false;
        }

        try {
            $html = "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px; background: #FCFBF6;'>
                <div style='text-align: center; border-bottom: 2px solid #0F172A; padding-bottom: 16px; margin-bottom: 20px;'>
                    <h2 style='color: #0F172A; margin: 0;'>Talonario Amigo — Facturación SRI</h2>
                    <p style='color: #64748B; font-size: 13px; margin-top: 4px;'>Comprobante Electrónico Autorizado</p>
                </div>
                
                <p>Estimado(a) <strong>{$clienteNombre}</strong>,</p>
                <p>Se ha emitido y autorizado con éxito su <strong>{$tipoComprobante} N° {$numeroComprobante}</strong>.</p>
                
                <div style='background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 8px; padding: 16px; margin: 20px 0;'>
                    <table style='width: 100%; font-size: 14px;'>
                        <tr>
                            <td style='color: #64748B;'>Comprobante:</td>
                            <td style='font-weight: bold; text-align: right;'>{$tipoComprobante}</td>
                        </tr>
                        <tr>
                            <td style='color: #64748B;'>Secuencial:</td>
                            <td style='font-weight: bold; text-align: right;'>{$numeroComprobante}</td>
                        </tr>
                        <tr>
                            <td style='color: #64748B;'>Total a Pagar:</td>
                            <td style='font-weight: bold; font-size: 18px; color: #16A34A; text-align: right;'>\${$total}</td>
                        </tr>
                    </table>
                </div>

                <div style='text-align: center; margin: 24px 0;'>
                    " . ($pdfUrl ? "<a href='{$pdfUrl}' style='background: #0F172A; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block; margin-right: 8px;'>📥 Descargar PDF (RIDE)</a>" : "") . "
                    " . ($xmlUrl ? "<a href='{$xmlUrl}' style='background: #E2E8F0; color: #0F172A; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;'>📄 Descargar XML</a>" : "") . "
                </div>

                <p style='font-size: 11px; color: #94A3B8; text-align: center; margin-top: 30px; border-top: 1px solid #E2E8F0; padding-top: 12px;'>
                    Este es un comprobante electrónico válido generado y autorizado conforme a la normativa del Servicio de Rentas Internas (SRI) del Ecuador.
                </p>
            </div>
            ";

            $response = Http::withToken($this->apiKey)
                ->post('https://api.resend.com/emails', [
                    'from' => "{$this->fromName} <{$this->fromEmail}>",
                    'to' => [$destinatario],
                    'subject' => "Tu {$tipoComprobante} N° {$numeroComprobante} — Talonario Amigo",
                    'html' => $html,
                ]);

            if ($response->successful()) {
                Log::info("[ResendService] Correo enviado exitosamente a {$destinatario}. ID: " . ($response->json('id') ?? ''));
                return true;
            } else {
                Log::error("[ResendService] Error enviando correo: " . $response->body());
                return false;
            }
        } catch (\Throwable $e) {
            Log::error("[ResendService] Excepción al enviar correo: " . $e->getMessage());
            return false;
        }
    }
}
