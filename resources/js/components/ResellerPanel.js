/**
 * Componente: ResellerPanel
 * Panel de Distribuidor Privado para Imprentas Aliadas (data-driven desde el backend).
 */
function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function renderResellerPanel(resellerData) {
    const data = resellerData || {};
    const info = data.reseller_info || { name: 'Imprenta Aliada', whatsapp_support: '593999999999' };
    const quota = data.quota || { total_allocated: 0, total_used: 0, available_slots: 0 };
    const clients = Array.isArray(data.clients) ? data.clients : [];
    const percentage = quota.total_allocated > 0 ? Math.round((quota.total_used / quota.total_allocated) * 100) : 0;

    const clientRows = clients.length
        ? clients.map((c) => {
            const active = c.is_active !== false && c.is_active !== 0;
            const hasSignature = !!(c.emisor && c.emisor.firma_p12_path);
            const ruc = (c.emisor && c.emisor.ruc) || 'RUC: —';
            const phone = c.phone || c.whatsapp || (c.emisor && c.emisor.telefono) || '';
            const waCleanPhone = phone ? phone.replace(/\D/g, '') : '';
            const waText = encodeURIComponent(`Hola ${c.name}, tu cuenta en Talonario Amigo está lista.\n\nAcceso: https://talonarioamigo.com\nUsuario: ${c.email}\n\nSi necesitas ayuda con tu firma .p12 avísanos.`);
            const waUrl = waCleanPhone ? `https://wa.me/${waCleanPhone}?text=${waText}` : `https://wa.me/?text=${waText}`;

            return `
            <tr class="reseller-client-row" data-client-text="${esc(c.name).toLowerCase()} ${esc(ruc).toLowerCase()}">
                <td>
                    <strong style="color: #0F172A;">${esc(c.name)}</strong><br>
                    <small style="color:#64748B; font-family: var(--font-mono-num);">${esc(ruc)}</small>
                </td>
                <td><span class="badge-pill ${hasSignature ? 'badge-active' : 'badge-inactive'}">${hasSignature ? 'CARGADA' : 'FALTA .P12'}</span></td>
                <td><span class="badge-pill ${active ? 'badge-active' : 'badge-warning'}">${active ? 'ACTIVO' : 'SUSPENDIDO'}</span></td>
                <td style="text-align: right; white-space: nowrap;">
                    <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp-direct" title="Enviar accesos y bienvenida por WhatsApp">
                        💬 WhatsApp
                    </a>
                    <button class="sim-btn" style="background:${active ? '#DC2626' : '#16A34A'}; color:white; border:none; margin-left:6px;" onclick="window.appState.toggleClientByReseller(this, '${esc(c.id)}', ${active})">
                        ${active ? '🔴 Pausar' : '🟢 Activar'}
                    </button>
                </td>
            </tr>`;
        }).join('')
        : '<tr><td colspan="4" style="text-align:center; color:#64748B; padding:20px;">Aún no has registrado clientes en tu lote.</td></tr>';

    return `
        <div class="factura-talonario-container" style="max-width: 760px; margin: 0 auto;">
            <!-- Header Panel Imprenta -->
            <div class="receipt-header">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div class="receipt-number">PANEL IMPRENTA RESELLER</div>
                    <button type="button" class="mode-chip-btn" style="background:#1E293B; color:#FFF; font-size:11px;" onclick="window.appState.setRole('CLIENT')">
                        ✒️ Ir al Talonario
                    </button>
                </div>
                <div class="emisor-title">${esc(info.name)}</div>
                <div class="emisor-meta">Gestión de Lote Mayorista de Licencias y Clientes Propios</div>
            </div>

            <!-- Medidor de Cupo del Lote -->
            <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 18px; margin-bottom: 20px; box-shadow: 0 1px 4px rgba(15,23,42,0.03);">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
                    <span style="font-weight: 800; font-size: 13px; color: #0F172A;">CUPO DE LICENCIAS DE TU IMPRENTA</span>
                    <span style="font-family: var(--font-mono-num); font-size: 14px; font-weight: 800; color: #1D4ED8;">
                        ${esc(quota.total_used)} / ${esc(quota.total_allocated)} Usadas (${esc(quota.available_slots)} Disponibles)
                    </span>
                </div>
                <div style="width: 100%; height: 12px; background: #E2E8F0; border-radius: 999px; overflow: hidden;">
                    <div style="width: ${percentage}%; height: 100%; background: #16A34A; border-radius: 999px; transition: width 0.4s ease;"></div>
                </div>
            </div>

            <!-- Configuración Número WhatsApp de Soporte Propio -->
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <h4 style="font-size: 13px; font-weight: 800; margin-bottom: 6px; color: #0F172A;">📱 Tu WhatsApp de Soporte para tus Clientes</h4>
                <p style="font-size: 11px; color: #64748B; margin-bottom: 10px;">
                    Cuando la cuenta de alguno de tus clientes se bloquee o no tenga firma, el botón de soporte los enviará directamente a este número.
                </p>
                <form onsubmit="event.preventDefault(); window.appState.updateResellerWhatsapp();" style="display: flex; gap: 8px;">
                    <input type="text" id="reseller-whatsapp-input" class="form-input" value="${esc(info.whatsapp_support || '')}" placeholder="Ej. 0993050689" style="flex: 1;">
                    <button type="submit" class="btn-stamp" style="width: auto; padding: 8px 18px; font-size: 12px; background: #0F172A;">
                        💾 GUARDAR
                    </button>
                </form>
            </div>

            <!-- Formulario Registrar Nuevo Cliente en tu Lote -->
            <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px; margin-bottom: 22px; box-shadow: 0 1px 6px rgba(15,23,42,0.03);">
                <h4 style="font-family: var(--font-serif-header); font-size: 17px; font-weight: 800; margin-bottom: 12px; color: #0F172A;">
                    👤 Registrar Nuevo Cliente en tu Lote (${esc(quota.available_slots)} cupos restantes)
                </h4>
                <form onsubmit="event.preventDefault(); window.appState.createClientByReseller();" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div style="grid-column: span 2;">
                        <div style="border: 1.5px dashed #CBD5E1; border-radius: 12px; padding: 14px; text-align:center; cursor:pointer; background:#F8FAFC; transition: background 0.15s ease;"
                             onclick="document.getElementById('client-ruc-file').click()">
                            <div style="font-weight:800; font-size:13px; color:#0F172A;">📄 Subir Certificado de RUC (PDF) para autocompletar</div>
                            <div style="font-size:11px; color:#64748B; margin-top:2px;">El sistema extrae los datos fiscales y deja listo el facturador del cliente</div>
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
                        <label class="form-label">Teléfono / WhatsApp de Contacto</label>
                        <input type="text" id="reseller-client-phone" class="form-input" placeholder="Ej. 0991234567">
                    </div>
                    <div>
                        <label class="form-label">RUC del Cliente</label>
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
                        <label class="form-label">Dirección Matriz</label>
                        <input type="text" id="client-direccion" class="form-input" placeholder="Dirección del cliente">
                    </div>
                    <div style="grid-column: span 2; margin-top: 4px;">
                        <button type="submit" class="btn-stamp" style="font-size: 13px; padding: 12px; background: #0F172A;">
                            ➕ DAR DE ALTA CLIENTE CON FACTURADOR LISTO
                        </button>
                    </div>
                </form>
            </div>

            <!-- Tabla de Clientes de la Imprenta con Buscador -->
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px;">
                <h4 style="font-weight: 800; font-size: 15px; color: #0F172A;">
                    Mis Clientes Registrados (${esc(quota.total_used)})
                </h4>
            </div>

            <input type="text" class="admin-search-input" placeholder="Buscar cliente por nombre o RUC..." oninput="window.appState.filterResellerClients(this.value)" style="margin-bottom: 12px;">

            <table class="items-table" style="background: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(15,23,42,0.03);">
                <thead>
                    <tr>
                        <th>Cliente / RUC</th>
                        <th>Firma .p12</th>
                        <th>Estado Cuenta</th>
                        <th style="text-align: right;">Acciones</th>
                    </tr>
                </thead>
                <tbody id="reseller-client-list">
                    ${clientRows}
                </tbody>
            </table>
        </div>
    `;
}
