/**
 * Componente: SuperAdminPanel
 * Panel de Control Total para el Dueño de Talonario Amigo
 */
export function renderSuperAdminPanel(dashboardData) {
    const metrics = dashboardData?.metrics || { total_users: 142, total_resellers: 8, total_clients: 134, active_licensed_slots: 240 };
    
    return `
        <div class="factura-talonario-container" style="max-width: 720px; margin: 0 auto;">
            <!-- Header Panel SuperAdmin -->
            <div class="receipt-header">
                <div class="receipt-number">PANEL DE CONTROL TOTAL — DUEÑO</div>
                <div class="emisor-title">Plataforma Global Talonario Amigo</div>
                <div class="emisor-meta">Monitoreo y Activación / Suspensión Maestra de Cuentas</div>
            </div>

            <!-- Métricas Globales -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-bottom: 20px;">
                <div style="background: #F4F0E4; border: 1.5px solid #1A1A1A; border-radius: 10px; padding: 12px; text-align: center;">
                    <span style="font-size: 10px; font-weight: 800; color: #57534E;">TOTAL CUENTAS</span>
                    <h3 style="font-family: var(--font-mono-num); font-size: 20px; font-weight: 800; color: #0F172A;">${metrics.total_users}</h3>
                </div>
                <div style="background: #F4F0E4; border: 1.5px solid #1A1A1A; border-radius: 10px; padding: 12px; text-align: center;">
                    <span style="font-size: 10px; font-weight: 800; color: #57534E;">IMPRENTAS RESELLERS</span>
                    <h3 style="font-family: var(--font-mono-num); font-size: 20px; font-weight: 800; color: #1D4ED8;">${metrics.total_resellers}</h3>
                </div>
                <div style="background: #F4F0E4; border: 1.5px solid #1A1A1A; border-radius: 10px; padding: 12px; text-align: center;">
                    <span style="font-size: 10px; font-weight: 800; color: #57534E;">CLIENTES FINALES</span>
                    <h3 style="font-family: var(--font-mono-num); font-size: 20px; font-weight: 800; color: #15803D;">${metrics.total_clients}</h3>
                </div>
                <div style="background: #F4F0E4; border: 1.5px solid #1A1A1A; border-radius: 10px; padding: 12px; text-align: center;">
                    <span style="font-size: 10px; font-weight: 800; color: #57534E;">SLOTS VENDIDOS</span>
                    <h3 style="font-family: var(--font-mono-num); font-size: 20px; font-weight: 800; color: #B45309;">${metrics.active_licensed_slots}</h3>
                </div>
            </div>

            <!-- Formulario Asignar Lote a Imprenta -->
            <div style="background: #FFF; border: 2px solid #1A1A1A; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <h4 style="font-family: var(--font-serif-header); font-size: 16px; font-weight: 800; margin-bottom: 10px;">
                    ➕ Vender / Asignar Lote de Licencias a Imprenta
                </h4>
                <form onsubmit="event.preventDefault(); window.appState.assignPackage();" style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px; align-items: end;">
                    <div>
                        <label class="form-label">Imprenta Aliada</label>
                        <select id="owner-package-reseller" class="form-select">
                            <option value="1">Imprenta Gráficas Amazonas</option>
                            <option value="2">Imprenta Offset Serviprint</option>
                            <option value="3">Imprenta El Guabo Express</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Tamaño del Lote</label>
                        <input type="number" id="owner-package-size" class="form-input" value="30" placeholder="Ej. 30 licencias">
                    </div>
                    <button type="submit" class="btn-stamp" style="padding: 10px 16px; font-size: 12px;">
                        📦 ASIGNAR LOTE
                    </button>
                </form>
            </div>

            <!-- Lista Global de Resellers con Switch Maestro ON/OFF -->
            <h4 style="font-weight: 800; font-size: 14px; margin-bottom: 10px;">Gestión Maestra de Resellers & Imprentas</h4>

            <div style="display: flex; flex-direction: column; gap: 10px;">
                <div style="background: #FFF; border: 1.5px solid #1A1A1A; border-radius: 10px; padding: 14px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong style="font-size: 15px;">Imprenta Gráficas Amazonas</strong><br>
                        <small style="color: #57534E; font-family: var(--font-mono-num);">Lote Activo: 30 Cuentas (18 Usadas, 12 Disponibles)</small><br>
                        <small style="color: #1D4ED8;">📞 WhatsApp Soporte: 0993050689</small>
                    </div>
                    <div style="text-align: right;">
                        <span class="badge-pill badge-active" style="display: block; margin-bottom: 6px;">MAESTRO: ACTIVO</span>
                        <button class="btn-stamp" style="padding: 4px 10px; font-size: 11px; background: #D90429; width: auto;" onclick="window.appState.toggleMasterAccount(this, 'Imprenta Gráficas Amazonas')">
                            🔴 Suspender Imprenta
                        </button>
                    </div>
                </div>

                <div style="background: #FFF; border: 1.5px solid #1A1A1A; border-radius: 10px; padding: 14px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong style="font-size: 15px;">Imprenta Offset Serviprint</strong><br>
                        <small style="color: #57534E; font-family: var(--font-mono-num);">Lote Activo: 50 Cuentas (45 Usadas, 5 Disponibles)</small><br>
                        <small style="color: #1D4ED8;">📞 WhatsApp Soporte: 0992345678</small>
                    </div>
                    <div style="text-align: right;">
                        <span class="badge-pill badge-active" style="display: block; margin-bottom: 6px;">MAESTRO: ACTIVO</span>
                        <button class="btn-stamp" style="padding: 4px 10px; font-size: 11px; background: #D90429; width: auto;" onclick="window.appState.toggleMasterAccount(this, 'Imprenta Offset Serviprint')">
                            🔴 Suspender Imprenta
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}
