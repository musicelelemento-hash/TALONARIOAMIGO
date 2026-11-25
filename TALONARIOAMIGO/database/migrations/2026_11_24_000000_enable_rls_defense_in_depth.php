<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * P1-1 (SELL_READY_CHECKLIST.md): defensa en profundidad para el caso en que la base
 * de datos de producción corra sobre Supabase Postgres (DB_HOST=db.<proyecto>.supabase.co,
 * ver .env.example) y alguien exponga el Data API (PostgREST) de ese proyecto. Hoy la app
 * solo filtra por emisor_id/rol a nivel de controlador; esto añade la misma restricción
 * a nivel de base de datos para los roles `anon`/`authenticated` que usa PostgREST.
 *
 * Es un no-op seguro en cualquier otro entorno: Render Postgres (el de render.yaml) y
 * SQLite (desarrollo/tests) no tienen esos roles, así que la migración detecta su
 * ausencia y no hace nada. La conexión propia de Laravel (dueña de las tablas) nunca
 * se ve afectada por RLS salvo que se use FORCE ROW LEVEL SECURITY, que no se activa aquí.
 */
return new class extends Migration
{
    private const TABLES = [
        'emisores',
        'puntos_emision',
        'comprobantes',
        'comprobante_items',
        'clientes_frecuentes',
        'reseller_packages',
    ];

    private function supabaseRolesPresent(): bool
    {
        if (DB::connection()->getDriverName() !== 'pgsql') {
            return false;
        }

        $found = DB::select("select 1 from pg_roles where rolname in ('anon', 'authenticated')");

        return count($found) > 0;
    }

    public function up(): void
    {
        if (! $this->supabaseRolesPresent()) {
            return;
        }

        foreach (self::TABLES as $table) {
            DB::statement("alter table {$table} enable row level security");
            DB::statement("drop policy if exists talonario_deny_postgrest on {$table}");
            DB::statement("create policy talonario_deny_postgrest on {$table} for all to anon, authenticated using (false)");
        }
    }

    public function down(): void
    {
        if (! $this->supabaseRolesPresent()) {
            return;
        }

        foreach (self::TABLES as $table) {
            DB::statement("drop policy if exists talonario_deny_postgrest on {$table}");
            DB::statement("alter table {$table} disable row level security");
        }
    }
};
