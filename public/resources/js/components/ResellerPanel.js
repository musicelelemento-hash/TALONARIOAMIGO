/**
 * Componente: ResellerPanel
 * Panel de Distribuidor Privado para Imprentas Aliadas
 */
export function renderResellerPanel(resellerData) {
    const quota = resellerData?.quota || { total_allocated: 30, total_used: 18, available_slots: 12 };
    const percentage = Math.round((quota.total_used / quota.total_allocated) * 100);

    return `
        <div class="factura-talonario-container" style="max-width: 720px; margin: 0 auto;">
            <!-- Header Panel Imprenta -->
            <div class="receipt-header">
                <div class="receipt-number">PANEL IMPRENTA RESELLER</div>
                <div class="emisor-title">Imprenta Gráficas Amazonas</div>
                <div class="emisor-meta">Gestión de Lote de Licencias y Clientes Propios</div>
            </div>

            <!-- Medidor de Cupo del Lote -->
            <div style="background: #FFF; border: 2px solid #1A1A1A; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
                    <span style="font-weight: 800; font-size: 13px;">CUPO DE LICENCIAS DE IMPRENTA</span>
                    <span style="font-family: var(--font-mono-num); font-size: 14px; font-weight: 800; color: #1D4ED8;">
                        ${quota.total_used} / ${quota.total_allocated} Usadas (${quota.available_slots} Disponibles)
                    </span>
                </div>
                <div style="width: 100%; height: 14px; background: #E7E2D4; border: 1.5px solid #1A1A1A; border-radius: 10px; overflow: hidden;">
                    <div style="width: ${percentage}%; height: 100%; background: #15803D; transition: width 0.4s ease;"></div>
                </div>
            </div>

            <!-- Configuración Número WhatsApp de Soporte Propio -->
            <div style="background: #FAF8F2; border: 1.5px solid #1A1A1A; border-radius: 10px; padding: 14px; margin-bottom: 20px;">
                <h4 style="font-size: 13px; font-weight: 800; margin-bottom: 6px;">📱 Configurar tu WhatsApp de Soporte Técnico</h4>
                <p style="font-size: 11px; color: #57534E; margin-bottom: 10px;">
                    Cuando la cuenta de alguno de tus clientes se bloquee o no tenga firma, el botón de soporte los enviará directamente a este número.
                </p>
                <form onsubmit="event.preventDefault(); window.appState.updateResellerWhatsapp();" style="display: flex; gap: 8px;">
                    <input type="text" id="reseller-whatsapp-input" class="form-input" value="0993050689" placeholder="Ej. 0993050689" style="flex: 1;">
                    <button type="submit" class="btn-stamp" style="width: auto; padding: 8px 16px; font-size: 12px;">
                        💾 GUARDAR NÚMERO
                    </button>
                </form>
            </div>

            <!-- Formulario Registrar Nuevo Cliente en tu Lote -->
            <div style="background: #FFF; border: 2px solid #1A1A1A; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <h4 style="font-family: var(--font-serif-header); font-size: 16px; font-weight: 800; margin-bottom: 10px;">
                    👤 Registrar Nuevo Cliente en tu Lote (${quota.available_slots} cupos restantes)
                </h4>
                <form onsubmit="event.preventDefault(); window.appState.createClientByReseller();" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div>
                        <label class="form-label">Nombre del Cliente / Negocio</label>
                        <input type="text" id="reseller-client-name" class="form-input" placeholder="Ej. Panadería El Trigo" required>
                    </div>
                    <div>
                        <label class="form-label">Correo de Acceso</label>
                        <input type="email" id="reseller-client-email" class="form-input" placeholder="cliente@ejemplo.com" required>
                    </div>
                    <div>
                        <label class="form-label">Contraseña Inicial</label>
                        <input type="password" id="reseller-client-pass" class="form-input" placeholder="••••••••" required>
                    </div>
                    <div>
                        <label class="form-label">Teléfono de Contacto</label>
                        <input type="text" id="reseller-client-phone" class="form-input" placeholder="Ej. 0991234567">
                    </div>
                    <div style="grid-column: span 2; margin-top: 4px;">
                        <button type="submit" class="btn-stamp" style="font-size: 13px; padding: 12px;">
                            ➕ DAR DE ALTA CLIENTE EN MI LOTE
                        </button>
                    </div>
                </form>
            </div>

            <!-- Tabla de Clientes de la Imprenta -->
            <h4 style="font-weight: 800; font-size: 14px; margin-bottom: 10px;">Mis Clientes Registrados (${quota.total_used})</h4>

            <table class="items-table">
                <thead>
                    <tr>
                        <th>Cliente / RUC</th>
                        <th>Firma .p12</th>
                        <th>Estado Cuenta</th>
                        <th style="text-align: right;">Acción Directa</th>
                    </tr>
                </thead>
                <tbody id="reseller-client-list">
                    <tr>
                        <td><strong>Panadería El Trigo</strong><br><small style="color:#57534E;">RUC: 1792345678001</small></td>
                        <td><span class="badge-pill badge-active">CARGADA</span></td>
                        <td><span class="badge-pill badge-active">ACTIVO</span></td>
                        <td style="text-align: right;">
                            <button class="sim-btn" style="background:#D90429; color:white; border:none;" onclick="window.appState.toggleClientByReseller(this, 'Panadería El Trigo')">🔴 Pausar</button>
                        </td>
                    </tr>
                    <tr>
                        <td><strong>Calzado Ramírez</strong><br><small style="color:#57534E;">RUC: 1803456789001</small></td>
                        <td><span class="badge-pill badge-inactive">FALTA .P12</span></td>
                        <td><span class="badge-pill badge-warning">SUSPENDIDO</span></td>
                        <td style="text-align: right;">
                            <button class="sim-btn" style="background:#15803D; color:white; border:none;" onclick="window.appState.toggleClientByReseller(this, 'Calzado Ramírez')">🟢 Activar</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}
