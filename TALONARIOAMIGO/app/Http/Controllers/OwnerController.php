<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ResellerPackage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class OwnerController extends Controller
{
    /**
     * Obtener panel global de métricas, resellers y usuarios directos
     */
    public function getGlobalDashboard()
    {
        $totalUsers = User::count();
        $totalResellers = User::where('role', 'RESELLER')->count();
        $totalClients = User::where('role', 'CLIENT')->count();
        $activePackages = ResellerPackage::where('is_active', true)->sum('allocated_accounts');

        $resellers = User::where('role', 'RESELLER')
            ->with(['packages', 'clients'])
            ->get()
            ->map(function ($reseller) {
                return [
                    'id' => $reseller->id,
                    'name' => $reseller->name,
                    'email' => $reseller->email,
                    'phone' => $reseller->phone,
                    'whatsapp_support' => $reseller->whatsapp_support,
                    'is_active' => $reseller->is_active,
                    'total_clients' => $reseller->clients->count(),
                    'allocated_accounts' => $reseller->packages->sum('allocated_accounts'),
                ];
            });

        $clients = User::where('role', 'CLIENT')
            ->with(['reseller', 'emisor'])
            ->get();

        return response()->json([
            'success' => true,
            'metrics' => [
                'total_users' => $totalUsers,
                'total_resellers' => $totalResellers,
                'total_clients' => $totalClients,
                'active_licensed_slots' => $activePackages,
            ],
            'resellers' => $resellers,
            'clients' => $clients
        ]);
    }

    /**
     * Crear y dar de alta una NUEVA IMPRENTA ALIEDA (Reseller)
     */
    public function createReseller(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string',
            'whatsapp_support' => 'required|string',
            'initial_package_size' => 'required|integer|min:1'
        ]);

        // 1. Crear usuario con rol RESELLER
        $reseller = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => 'RESELLER',
            'whatsapp_support' => preg_replace('/[^0-9]/', '', $request->whatsapp_support),
            'is_active' => true,
            'status' => 'ACTIVE'
        ]);

        // 2. Asignarle su primer lote de licencias de cuentas
        $package = ResellerPackage::create([
            'reseller_id' => $reseller->id,
            'package_name' => "Lote Inicial {$request->initial_package_size} Licencias",
            'allocated_accounts' => $request->initial_package_size,
            'used_accounts' => 0,
            'is_active' => true
        ]);

        return response()->json([
            'success' => true,
            'message' => "Imprenta '{$reseller->name}' dada de alta exitosamente con un lote de {$request->initial_package_size} licencias.",
            'reseller' => $reseller,
            'package' => $package
        ]);
    }

    /**
     * Interruptor Maestro (ON/OFF) para activar o suspender cualquier cuenta o imprenta
     */
    public function toggleAccountStatus(Request $request, $id)
    {
        $request->validate([
            'is_active' => 'required|boolean'
        ]);

        $user = User::findOrFail($id);
        $user->is_active = $request->is_active;
        $user->status = $request->is_active ? 'ACTIVE' : 'SUSPENDED_BY_ADMIN';
        $user->save();

        // Si es imprenta reseller y se suspende, se suspenden temporalmente sus clientes vinculados
        if ($user->role === 'RESELLER') {
            User::where('reseller_id', $user->id)
                ->update([
                    'is_active' => $request->is_active,
                    'status' => $request->is_active ? 'ACTIVE' : 'SUSPENDED_BY_RESELLER'
                ]);
        }

        return response()->json([
            'success' => true,
            'message' => "Estado de la imprenta/cuenta '{$user->name}' actualizado a: " . ($user->is_active ? 'ACTIVO' : 'SUSPENDIDO'),
            'user' => $user
        ]);
    }

    /**
     * Asignar o vender un lote/paquete adicional de licencias a cualquier imprenta existente
     */
    public function assignResellerPackage(Request $request)
    {
        $request->validate([
            'reseller_id' => 'required|exists:users,id',
            'package_name' => 'required|string',
            'allocated_accounts' => 'required|integer|min:1',
            'expires_at' => 'nullable|date'
        ]);

        $package = ResellerPackage::create([
            'reseller_id' => $request->reseller_id,
            'package_name' => $request->package_name,
            'allocated_accounts' => $request->allocated_accounts,
            'used_accounts' => 0,
            'is_active' => true,
            'expires_at' => $request->expires_at
        ]);

        return response()->json([
            'success' => true,
            'message' => "Se ha asignado exitosamente el lote de {$request->allocated_accounts} licencias a la imprenta.",
            'package' => $package
        ]);
    }
}
