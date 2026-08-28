<?php

namespace App\Http\Controllers;

use App\Models\Emisor;
use App\Models\PuntoEmision;
use App\Models\User;
use App\Models\ResellerPackage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class ResellerController extends Controller
{
    /**
     * Dashboard privado de la Imprenta (Cupo de lotes y lista de clientes)
     */
    public function getResellerDashboard()
    {
        $reseller = Auth::user();

        // Obtener la suma total de licencias asignadas y usadas
        $packages = ResellerPackage::where('reseller_id', $reseller->id)
            ->where('is_active', true)
            ->get();

        $totalAllocated = $packages->sum('allocated_accounts');
        $totalUsed = $packages->sum('used_accounts');
        $availableSlots = max(0, $totalAllocated - $totalUsed);

        $clients = User::where('reseller_id', $reseller->id)
            ->with('emisor')
            ->get();

        return response()->json([
            'success' => true,
            'reseller_info' => [
                'name' => $reseller->name,
                'email' => $reseller->email,
                'whatsapp_support' => $reseller->whatsapp_support ?? '593999999999',
            ],
            'quota' => [
                'total_allocated' => $totalAllocated,
                'total_used' => $totalUsed,
                'available_slots' => $availableSlots,
            ],
            'clients' => $clients
        ]);
    }

    /**
     * Registrar un nuevo cliente emisor dentro del lote de la imprenta
     */
    public function createClient(Request $request)
    {
        $reseller = Auth::user();

        // Verificación de cupo disponible en el lote
        $package = ResellerPackage::where('reseller_id', $reseller->id)
            ->where('is_active', true)
            ->whereRaw('allocated_accounts > used_accounts')
            ->first();

        if (!$package) {
            return response()->json([
                'success' => false,
                'message' => 'Has alcanzado el límite de tu lote de cuentas (ej. 30/30). Contacta al Dueño para adquirir un nuevo lote.'
            ], 422);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string',
            'emisor' => 'nullable|array',
            'emisor.ruc' => 'nullable|string|size:13',
            'emisor.razon_social' => 'nullable|string|max:255',
            'emisor.nombre_comercial' => 'nullable|string|max:255',
            'emisor.direccion_matriz' => 'nullable|string',
            'emisor.tipo_regimen' => 'nullable|in:RIMPE_POPULAR,RIMPE_EMPRENDEDOR,GENERAL',
            'emisor.obligado_contabilidad' => 'nullable|boolean',
        ]);

        $client = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => 'CLIENT',
            'reseller_id' => $reseller->id,
            'whatsapp_support' => $reseller->whatsapp_support ?? '593999999999',
            'is_active' => true,
            'status' => 'PENDING_ONBOARDING'
        ]);

        // Incrementar el contador de cuentas usadas en el paquete
        $package->increment('used_accounts');

        // Si la imprenta subió el RUC (autocompletado), dejar el facturador del cliente LISTO.
        if ($request->filled('emisor.ruc')) {
            $emisor = Emisor::create([
                'user_id' => $client->id,
                'ruc' => $request->input('emisor.ruc'),
                'razon_social' => $request->input('emisor.razon_social') ?: $client->name,
                'nombre_comercial' => $request->input('emisor.nombre_comercial') ?: $client->name,
                'direccion_matriz' => $request->input('emisor.direccion_matriz') ?: '',
                'obligado_contabilidad' => (bool) $request->input('emisor.obligado_contabilidad', false),
                'tipo_regimen' => $request->input('emisor.tipo_regimen', 'GENERAL'),
                'ambiente' => '1',
                'tipo_emision' => '1',
            ]);

            PuntoEmision::create([
                'emisor_id' => $emisor->id,
                'establecimiento' => '001',
                'punto_emision' => '001',
                'nombre_sucursal' => 'Matriz Principal',
                'direccion_sucursal' => $request->input('emisor.direccion_matriz', ''),
                'secuencial_factura' => 1,
                'secuencial_nota_credito' => 1,
                'secuencial_retencion' => 1,
                'secuencial_liquidacion' => 1,
                'secuencial_guia_remision' => 1,
                'is_active' => true,
            ]);

            $client->status = 'ACTIVE';
            $client->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Cliente registrado exitosamente dentro de tu lote de imprenta.',
            'client' => $client
        ]);
    }

    /**
     * Botón directo para Activar / Pausar cuenta de cliente de la imprenta
     */
    public function toggleClientStatus(Request $request, $clientId)
    {
        $reseller = Auth::user();
        $client = User::where('id', $clientId)
            ->where('reseller_id', $reseller->id)
            ->firstOrFail();

        $request->validate([
            'is_active' => 'required|boolean'
        ]);

        $client->is_active = $request->is_active;
        $client->status = $request->is_active ? 'ACTIVE' : 'SUSPENDED_BY_RESELLER';
        $client->save();

        return response()->json([
            'success' => true,
            'message' => "La cuenta de {$client->name} ha sido " . ($client->is_active ? 'ACTIVADA' : 'PAUSADA'),
            'client' => $client
        ]);
    }

    /**
     * Configurar el número de WhatsApp de Soporte propio de la Imprenta
     */
    public function updateWhatsappSupport(Request $request)
    {
        $request->validate([
            'whatsapp_support' => 'required|string|min:9'
        ]);

        $reseller = Auth::user();
        $reseller->whatsapp_support = preg_replace('/[^0-9]/', '', $request->whatsapp_support);
        $reseller->save();

        // Actualizar el número de soporte en todos los clientes pertenecientes a esta imprenta
        User::where('reseller_id', $reseller->id)
            ->update(['whatsapp_support' => $reseller->whatsapp_support]);

        return response()->json([
            'success' => true,
            'message' => 'Número de WhatsApp de soporte actualizado exitosamente.',
            'whatsapp_support' => $reseller->whatsapp_support
        ]);
    }
}
