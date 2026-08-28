/**
 * Componente: ResellerPanel
 * Panel de Distribuidor Privado para Imprentas Aliadas (data-driven desde el backend).
 */
function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function renderResellerPanel(resellerData) {
    const data = resellerData || {};
    const info = data.reseller_info || { name: 'Imprenta', whatsapp_support: '593999999999' };
    const quota = data.quota || { total_allocated: 0, total_used: 0, available_slots: 0 };
    const clients = Array.isArray(data.clients) ? data.clients : [];
    const percentage = quota.total_allocated > 0 ? Math.round((quota.total_used / quota.total_allocated) * 100) : 0;

    const clientRows = clients.length
        ? clients.map((c) => {
            const active = c.is_active !== false && c.is_active !== 0;
            const hasSignature = !!(c.emisor && c.emisor.firma_p12_path);
            const ruc = (c.emisor && c.emisor.ruc) || 'RUC: —';
            return `
            <tr>
                <td><strong>${esc(c.name)}</strong><br><small style="color:#57534E;">${esc(ruc)}</small></td>
                <td><span class="badge-pill ${hasSignature ? 'badge-active' : 'badge-inactive'}">${hasSignature ? 'CARGADA' : 'FALTA .P12'}</span></td>
                <td><span class="badge-pill ${active ? 'badge-active' : 'badge-warning'}">${active ? 'ACTIVO' : 'SUSPENDIDO'}</span></td>
                <td style="text-align: right;">
                    <button class="sim-btn" style="background:${active ? '#D90429' : '#15803D'}; color:white; border:none;" onclick="window.appState.toggleClientByReseller(this, '${esc(c.id)}', ${active})">
                        ${active ? '🔴 Pausar' : '🟢 Activar'}
                    </button>
                </td>
            </tr>`;
        }).join('')
        : '<tr><td colspan="4" style="text-align:center; color:#57534E; padding:16px;">Aún no has registrado clientes.</td></tr>';

    return `
        <div class="factura-talonario-container" style="max-width: 720px; margin: 0 auto;">
            <!-- Header Panel Imprenta -->
            <div class="receipt-header">
                <div class="receipt-number">PANEL IMPRENTA RESELLER</div>
                <div class="emisor-title">${esc(info.name)}</div>
                <div class="emisor-meta">Gestión de Lote de Licencias y Clientes Propios</div>
            </div>

            <!-- Medidor de Cupo del Lote -->
            <div style="background: #FFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
                    <span style="font-weight: 800; font-size: 13px;">CUPO DE LICENCIAS DE IMPRENTA</span>
                    <span style="font-family: var(--font-mono-num); font-size: 14px; font-weight: 800; color: #1D4ED8;">
                        ${esc(quota.total_used)} / ${esc(quota.total_allocated)} Usadas (${esc(quota.available_slots)} Disponibles)
                    </span>
                </div>
                <div style="width: 100%; height: 14px; background: #E7E2D4; border: 1px solid #E2E8F0; border-radius: 10px; overflow: hidden;">
                    <div style="width: ${percentage}%; height: 100%; background: #15803D; transition: width 0.4s ease;"></div>
                </div>
            </div>

            <!-- Configuración Número WhatsApp de Soporte Propio -->
            <div style="background: #FAF8F2; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px; margin-bottom: 20px;">
                <h4 style="font-size: 13px; font-weight: 800; margin-bottom: 6px;">📱 Configurar tu WhatsApp de Soporte Técnico</h4>
                <p style="font-size: 11px; color: #57534E; margin-bottom: 10px;">
                    Cuando la cuenta de alguno de tus clientes se bloquee o no tenga firma, el botón de soporte los enviará directamente a este número.
                </p>
                <form onsubmit="event.preventDefault(); window.appState.updateResellerWhatsapp();" style="display: flex; gap: 8px;">
                    <input type="text" id="reseller-whatsapp-input" class="form-input" value="${esc(info.whatsapp_support || '')}" placeholder="Ej. 0993050689" style="flex: 1;">
                    <button type="submit" class="btn-stamp" style="width: auto; padding: 8px 16px; font-size: 12px;">
                        💾 GUARDAR NÚMERO
                    </button>
                </form>
            </div>

            <!-- Formulario Registrar Nuevo Cliente en tu Lote -->
            <div style="background: #FFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <h4 style="font-family: var(--font-serif-header); font-size: 16px; font-weight: 800; margin-bottom: 10px;">
                    👤 Registrar Nuevo Cliente en tu Lote (${esc(quota.available_slots)} cupos restantes)
                </h4>
                <form onsubmit="event.preventDefault(); window.appState.createClientByReseller();" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div style="grid-column: span 2;">
                        <div style="border: 1.5px dashed #CBD5E1; border-radius: 12px; padding: 12px; text-align:center; cursor:pointer; background:#F8FAFC;"
                             onclick="document.getElementById('client-ruc-file').click()">
                            <div style="font-weight:800; font-size:12px; color:#0F172A;">📄 Subir Certificado de RUC (PDF) para autocompletar</div>
                            <div style="font-size:10px; color:#64748B; margin-top:2px;">La imprenta deja el facturador del cliente listo para usar</div>
                            <input type="file" id="client-ruc-file" accept=".pdf,application/pdf" style="display:none" onchange="window.appState.handleClientRucPdf(this)">
                            <div id="client-ruc-status" style="font-size:11px; font-weight:800; color:#1D4ED8; margin-top:6px;">&nbsp;</div>
                        </div>
                    </div>
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
                    <div>
                        <label class="form-label">RUC del Cliente (autocompletado)</label>
                        <input type="text" id="client-ruc" class="form-input" maxlength="13" placeholder="13 dígitos">
                    </div>
                    <div>
                        <label class="form-label">Régimen Tributario</label>
                        <select id="client-regimen" class="form-select">
                            <option value="RIMPE_POPULAR">RIMPE Popular</option>
                            <option value="RIMPE_EMPRENDEDOR">RIMPE Emprendedor</option>
                            <option value="GENERAL">General</option>
                        </select>
                    </div>
                    <div style="grid-column: span 2;">
                        <label class="form-label">Dirección Matriz (autocompletada)</label>
                        <input type="text" id="client-direccion" class="form-input" placeholder="Dirección del cliente">
                    </div>
                    <div style="grid-column: span 2; margin-top: 4px;">
                        <button type="submit" class="btn-stamp" style="font-size: 13px; padding: 12px;">
                            ➕ DAR DE ALTA CLIENTE CON FACTURADOR LISTO
                        </button>
                    </div>
                </form>
            </div>

            <!-- Tabla de Clientes de la Imprenta -->
            <h4 style="font-weight: 800; font-size: 14px; margin-bottom: 10px;">Mis Clientes Registrados (${esc(quota.total_used)})</h4>
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
                    ${clientRows}
                </tbody>
            </table>
        </div>
    `;
}
