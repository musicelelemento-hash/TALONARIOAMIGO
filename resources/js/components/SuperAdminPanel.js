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
            const used = (r.allocated_accounts || 0) - (r.available_slots ?? (r.total_clients || 0));
            return `
            <div style="background: #FFF; border: 1.5px solid #1A1A1A; border-radius: 10px; padding: 14px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong style="font-size: 15px;">${esc(r.name)}</strong><br>
                    <small style="color: #57534E; font-family: var(--font-mono-num);">Lotes: ${esc(r.allocated_accounts || 0)} licencias · ${esc(r.total_clients || 0)} clientes</small><br>
                    <small style="color: #1D4ED8;">📞 WhatsApp Soporte: ${esc(r.whatsapp_support || '—')}</small>
                </div>
                <div style="text-align: right;">
                    <span class="badge-pill ${active ? 'badge-active' : 'badge-inactive'}" style="display: block; margin-bottom: 6px;">MAESTRO: ${active ? 'ACTIVO' : 'SUSPENDIDO'}</span>
                    <button class="btn-stamp" style="padding: 4px 10px; font-size: 11px; background: ${active ? '#D90429' : '#15803D'}; width: auto;" onclick="window.appState.toggleMasterAccount(this, '${esc(r.id)}', ${active})">
                        ${active ? '🔴 Suspender Imprenta' : '🟢 Activar Imprenta'}
                    </button>
                </div>
            </div>`;
        }).join('')
        : '<div style="background:#F8FAFC; border:1.5px dashed #CBD5E1; border-radius:10px; padding:16px; text-align:center; color:#475569;">Aún no hay imprentas registradas.</div>';

    return `
        <div class="factura-talonario-container" style="max-width: 720px; margin: 0 auto;">
            <!-- Header Panel SuperAdmin -->
            <div class="receipt-header">
                <div class="receipt-number">PANEL DE CONTROL TOTAL — DUEÑO</div>
                <div class="emisor-title">Plataforma Global Talonario Amigo</div>
                <div class="emisor-meta">Monitoreo, Alta de Imprentas y Activación/Suspensión Maestra</div>
            </div>

            <!-- Métricas Globales -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-bottom: 20px;">
                <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px; text-align: center;">
                    <span style="font-size: 10px; font-weight: 800; color: #57534E;">TOTAL CUENTAS</span>
                    <h3 style="font-family: var(--font-mono-num); font-size: 20px; font-weight: 800; color: #0F172A;">${esc(metrics.total_users)}</h3>
                </div>
                <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px; text-align: center;">
                    <span style="font-size: 10px; font-weight: 800; color: #57534E;">IMPRENTAS RESELLERS</span>
                    <h3 style="font-family: var(--font-mono-num); font-size: 20px; font-weight: 800; color: #1D4ED8;">${esc(metrics.total_resellers)}</h3>
                </div>
                <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px; text-align: center;">
                    <span style="font-size: 10px; font-weight: 800; color: #57534E;">CLIENTES FINALES</span>
                    <h3 style="font-family: var(--font-mono-num); font-size: 20px; font-weight: 800; color: #15803D;">${esc(metrics.total_clients)}</h3>
                </div>
                <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px; text-align: center;">
                    <span style="font-size: 10px; font-weight: 800; color: #57534E;">SLOTS VENDIDOS</span>
                    <h3 style="font-family: var(--font-mono-num); font-size: 20px; font-weight: 800; color: #B45309;">${esc(metrics.active_licensed_slots)}</h3>
                </div>
            </div>

            <!-- Formulario 1: Dar de Alta una NUEVA Imprenta Reseller -->
            <div style="background: #FFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <h4 style="font-family: var(--font-serif-header); font-size: 16px; font-weight: 800; margin-bottom: 10px; color: #1D4ED8;">
                    🏭 Registrar Nueva Imprenta Aliada (Reseller)
                </h4>
                <form onsubmit="event.preventDefault(); window.appState.createReseller();" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div>
                        <label class="form-label">Nombre de la Imprenta</label>
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
                            <button type="submit" class="btn-stamp" style="width: auto; padding: 10px 18px; font-size: 12px; background: #1D4ED8;">
                                ➕ REGISTRAR IMPRENTA & VENDER LOTE
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Formulario 2: Asignar Lote Adicional a Imprenta Existente -->
            <div style="background: #FFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <h4 style="font-family: var(--font-serif-header); font-size: 16px; font-weight: 800; margin-bottom: 10px;">
                    📦 Vender / Asignar Lote Adicional a Imprenta Existente
                </h4>
                <form onsubmit="event.preventDefault(); window.appState.assignPackage();" style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px; align-items: end;">
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
                    <button type="submit" class="btn-stamp" style="padding: 10px 16px; font-size: 12px;">
                        📦 ASIGNAR LOTE
                    </button>
                </form>
            </div>

            <!-- Lista Global de Resellers con Switch Maestro ON/OFF -->
            <h4 style="font-weight: 800; font-size: 14px; margin-bottom: 10px;">Gestión Maestra de Resellers & Imprentas (${esc(metrics.total_resellers)})</h4>
            <div style="display: flex; flex-direction: column; gap: 10px;" id="owner-resellers-list">
                ${resellersList}
            </div>
        </div>
    `;
}
