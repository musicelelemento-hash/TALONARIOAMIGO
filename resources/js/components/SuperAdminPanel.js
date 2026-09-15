/**
 * Componente: SuperAdminPanel
 * Panel de Control Total para el Dueño de Talonario Amigo (data-driven desde el backend).
 */
function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function renderSuperAdminPanel(dashboardData) {
    const data = dashboardData || {};
    const metrics = data.metrics || { total_users: 0, total_resellers: 0, total_clients: 0, active_licensed_slots: 0 };
    const resellers = Array.isArray(data.resellers) ? data.resellers : [];

    const resellerOptions = resellers.map((r) =>
        `<option value="${esc(r.id)}">${esc(r.name)}</option>`
    ).join('');

    const resellersList = resellers.length
        ? resellers.map((r) => {
            const active = r.is_active !== false && r.is_active !== 0;
            return `
            <div class="reseller-item-card" data-reseller-name="${esc(r.name).toLowerCase()}" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 4px rgba(15,23,42,0.04); transition: transform 0.15s ease;">
                <div>
                    <strong style="font-size: 15px; color: #0F172A;">${esc(r.name)}</strong><br>
                    <small style="color: #64748B; font-family: var(--font-mono-num);">Lotes: ${esc(r.allocated_accounts || 0)} licencias · ${esc(r.total_clients || 0)} clientes</small><br>
                    <small style="color: #1D4ED8; font-weight: 600;">📞 WhatsApp Soporte: ${esc(r.whatsapp_support || '—')}</small>
                </div>
                <div style="text-align: right;">
                    <span class="badge-pill ${active ? 'badge-active' : 'badge-inactive'}" style="display: inline-block; margin-bottom: 6px;">
                        ${active ? 'ACTIVO' : 'SUSPENDIDO'}
                    </span><br>
                    <button class="btn-stamp" style="padding: 6px 12px; font-size: 11px; background: ${active ? '#DC2626' : '#16A34A'}; border-color: ${active ? '#DC2626' : '#16A34A'}; width: auto;" onclick="window.appState.toggleMasterAccount(this, '${esc(r.id)}', ${active})">
                        ${active ? '🔴 Suspender Imprenta' : '🟢 Activar Imprenta'}
                    </button>
                </div>
            </div>`;
        }).join('')
        : '<div style="background:#F8FAFC; border:1.5px dashed #CBD5E1; border-radius:12px; padding:20px; text-align:center; color:#64748B;">Aún no hay imprentas registradas en la plataforma.</div>';

    return `
        <div class="factura-talonario-container" style="max-width: 760px; margin: 0 auto;">
            <!-- Header Panel SuperAdmin -->
            <div class="receipt-header">
                <div class="receipt-number">PANEL DE CONTROL TOTAL — DUEÑO</div>
                <div class="emisor-title">Plataforma Global Talonario Amigo</div>
                <div class="emisor-meta">Monitoreo General, Alta de Imprentas y Gobernanza Maestra</div>
            </div>

            <!-- Banner Estado de Salud del Sistema -->
            <div style="background: rgba(22, 163, 74, 0.08); border: 1px solid rgba(22, 163, 74, 0.2); border-radius: 12px; padding: 10px 14px; margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
                <span style="color: #15803D; font-weight: 700;">🟢 Backend SRI: En Línea · Supabase BD: Conectada · Edge: Cloudflare Pages</span>
                <span style="color: #64748B; font-family: var(--font-mono-num); font-size: 11px;">Arquitectura 100% Operativa</span>
            </div>

            <!-- Métricas Globales Apple-Style -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 24px;">
                <div class="stat-card-apple">
                    <span style="font-size: 10px; font-weight: 800; color: #64748B; letter-spacing: 0.05em;">TOTAL CUENTAS</span>
                    <h3 style="font-family: var(--font-mono-num); font-size: 24px; font-weight: 800; color: #0F172A; margin-top: 4px;">${esc(metrics.total_users)}</h3>
                </div>
                <div class="stat-card-apple">
                    <span style="font-size: 10px; font-weight: 800; color: #64748B; letter-spacing: 0.05em;">IMPRENTAS ALIADAS</span>
                    <h3 style="font-family: var(--font-mono-num); font-size: 24px; font-weight: 800; color: #1D4ED8; margin-top: 4px;">${esc(metrics.total_resellers)}</h3>
                </div>
                <div class="stat-card-apple">
                    <span style="font-size: 10px; font-weight: 800; color: #64748B; letter-spacing: 0.05em;">CLIENTES EMISORES</span>
                    <h3 style="font-family: var(--font-mono-num); font-size: 24px; font-weight: 800; color: #16A34A; margin-top: 4px;">${esc(metrics.total_clients)}</h3>
                </div>
                <div class="stat-card-apple">
                    <span style="font-size: 10px; font-weight: 800; color: #64748B; letter-spacing: 0.05em;">SLOTS VENDIDOS</span>
                    <h3 style="font-family: var(--font-mono-num); font-size: 24px; font-weight: 800; color: #D97706; margin-top: 4px;">${esc(metrics.active_licensed_slots)}</h3>
                </div>
            </div>

            <!-- Formulario 1: Dar de Alta una NUEVA Imprenta Reseller -->
            <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px; margin-bottom: 22px; box-shadow: 0 1px 6px rgba(15,23,42,0.03);">
                <h4 style="font-family: var(--font-serif-header); font-size: 17px; font-weight: 800; margin-bottom: 12px; color: #0F172A;">
                    🏭 Registrar Nueva Imprenta Aliada (Reseller)
                </h4>
                <form onsubmit="event.preventDefault(); window.appState.createReseller();" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div>
                        <label class="form-label">Nombre Comercial de la Imprenta</label>
                        <input type="text" id="new-reseller-name" class="form-input" placeholder="Ej. Imprenta Gráficas del Sur" required>
                    </div>
                    <div>
                        <label class="form-label">Correo de Acceso Reseller</label>
                        <input type="email" id="new-reseller-email" class="form-input" placeholder="contacto@imprenta.com" required>
                    </div>
                    <div>
                        <label class="form-label">Contraseña de la Imprenta</label>
                        <input type="password" id="new-reseller-pass" class="form-input" placeholder="••••••••" required>
                    </div>
                    <div>
                        <label class="form-label">WhatsApp Soporte Imprenta</label>
                        <input type="text" id="new-reseller-wa" class="form-input" placeholder="Ej. 0993050689" required>
                    </div>
                    <div style="grid-column: span 2;">
                        <label class="form-label">Lote Inicial de Licencias Vendidas</label>
                        <div style="display: flex; gap: 10px;">
                            <input type="number" id="new-reseller-package-size" class="form-input" value="30" placeholder="Ej. 30 licencias" style="flex:1;">
                            <button type="submit" class="btn-stamp" style="width: auto; padding: 10px 20px; font-size: 12px; background: #0F172A;">
                                ➕ REGISTRAR IMPRENTA & VENDER LOTE
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Formulario 2: Asignar Lote Adicional a Imprenta Existente -->
            <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px; margin-bottom: 22px; box-shadow: 0 1px 6px rgba(15,23,42,0.03);">
                <h4 style="font-family: var(--font-serif-header); font-size: 17px; font-weight: 800; margin-bottom: 12px; color: #0F172A;">
                    📦 Vender / Asignar Lote Adicional a Imprenta Existente
                </h4>
                <form onsubmit="event.preventDefault(); window.appState.assignPackage();" style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 12px; align-items: end;">
                    <div>
                        <label class="form-label">Imprenta Aliada</label>
                        <select id="owner-package-reseller" class="form-select">
                            ${resellerOptions || '<option value="">— Sin imprentas —</option>'}
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Tamaño del Lote Adicional</label>
                        <input type="number" id="owner-package-size" class="form-input" value="30" placeholder="Ej. 30 licencias">
                    </div>
                    <button type="submit" class="btn-stamp" style="padding: 10px 18px; font-size: 12px; background: #1D4ED8; border-color: #1D4ED8;">
                        📦 ASIGNAR LOTE
                    </button>
                </form>
            </div>

            <!-- Lista Global de Resellers con Buscador en Vivo -->
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px;">
                <h4 style="font-weight: 800; font-size: 15px; color: #0F172A;">
                    Gestión Maestra de Resellers & Imprentas (${esc(metrics.total_resellers)})
                </h4>
            </div>

            <input type="text" class="admin-search-input" placeholder="Filtrar imprentas por nombre o correo..." oninput="window.appState.filterSuperAdminResellers(this.value)" style="margin-bottom: 12px;">

            <div style="display: flex; flex-direction: column; gap: 10px;" id="owner-resellers-list">
                ${resellersList}
            </div>
        </div>
    `;
}
