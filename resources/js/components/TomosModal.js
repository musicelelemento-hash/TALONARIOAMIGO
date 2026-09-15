/**
 * Componente: TomosModal
 * Principio 13 del Producto: "Historial por Tomos Físicos"
 * Permite al comerciante consultar sus facturas archivadas por meses como talonarios reales.
 */

function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function renderTomosModal(activeTomoMonth = 'AGOSTO 2026') {
    const tomos = [
        { id: 'tomo-ago-2026', nombre: 'AGOSTO 2026 📒', hojas: 126, total: '$3,450.00', activo: activeTomoMonth === 'AGOSTO 2026' },
        { id: 'tomo-jul-2026', nombre: 'JULIO 2026 📒', hojas: 150, total: '$5,240.00', activo: activeTomoMonth === 'JULIO 2026' },
        { id: 'tomo-jun-2026', nombre: 'JUNIO 2026 📒', hojas: 98, total: '$2,980.00', activo: activeTomoMonth === 'JUNIO 2026' }
    ];

    const hojasEjemplo = [
        { num: '000000126', fecha: '28/08/2026', cliente: 'Juan Alberto Pérez Gómez', total: '$85.00', estado: 'AUTORIZADO' },
        { num: '000000125', fecha: '28/08/2026', cliente: 'María Elena Loor', total: '$45.00', estado: 'AUTORIZADO' },
        { num: '000000124', fecha: '27/08/2026', cliente: 'Ab. Carlos Zambrano', total: '$120.00', estado: 'AUTORIZADO' },
        { num: '000000123', fecha: '26/08/2026', cliente: 'Consumidor Final', total: '$15.50', estado: 'AUTORIZADO' },
        { num: '000000122', fecha: '25/08/2026', cliente: 'Ferretería El Tornillo', total: '$210.00', estado: 'AUTORIZADO' },
        { num: '000000121', fecha: '24/08/2026', cliente: 'Cafetería Don Lucho', total: '$65.00', estado: 'AUTORIZADO' }
    ];

    const tomosTabs = tomos.map(t => `
        <button type="button" 
                class="tomo-tab-btn ${t.activo ? 'active' : ''}" 
                style="padding: 10px 16px; border-radius: 12px; font-weight: 800; font-size: 13px; cursor: pointer; border: 1.5px solid ${t.activo ? '#16A34A' : '#334155'}; background: ${t.activo ? '#16A34A' : '#1E293B'}; color: #FFFFFF; display: flex; align-items: center; gap: 8px; transition: all 0.2s;"
                onclick="window.appState.switchTomoMonth('${esc(t.nombre)}')">
            <span>${esc(t.nombre)}</span>
            <span style="font-size: 11px; background: rgba(0,0,0,0.25); padding: 2px 8px; border-radius: 999px;">${t.hojas} Hojas</span>
        </button>
    `).join('');

    const hojasList = hojasEjemplo.map(h => `
        <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(15,23,42,0.03);">
            <div>
                <span style="font-family: var(--font-mono-num); font-size: 13px; font-weight: 800; color: #D62828;">
                    N° 001-001-${esc(h.num)}
                </span>
                <span style="font-size: 11px; color: #64748B; margin-left: 8px;">📅 ${esc(h.fecha)}</span><br>
                <strong style="font-size: 14px; color: #0F172A;">${esc(h.cliente)}</strong>
            </div>
            <div style="text-align: right;">
                <div style="font-family: var(--font-mono-num); font-size: 16px; font-weight: 900; color: #0F172A;">${esc(h.total)}</div>
                <div style="margin-top: 4px; display: flex; gap: 6px; justify-content: flex-end;">
                    <button type="button" class="btn-whatsapp-direct" style="padding: 4px 8px; font-size: 10px;" onclick="window.appState.shareHistoricalFactura('${esc(h.num)}', '${esc(h.cliente)}', '${esc(h.total)}')">
                        💬 WhatsApp
                    </button>
                    <button type="button" class="sim-btn" style="background: #334155; color: white; padding: 4px 8px; font-size: 10px;" onclick="window.print()">
                        🖨️ RIDE
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    return `
        <div class="tomos-modal-overlay" style="position: fixed; inset: 0; background: rgba(15,23,42,0.85); backdrop-filter: blur(8px); z-index: 9999; display: flex; justify-content: center; align-items: center; padding: 16px;">
            <div style="background: #F8FAFC; border: 1px solid #334155; border-radius: 18px; width: 100%; max-width: 720px; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 60px rgba(0,0,0,0.5); padding: 24px; position: relative;">
                
                <!-- Encabezado Modal -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                    <div>
                        <div style="font-size: 11px; font-weight: 800; color: #D97706; text-transform: uppercase; letter-spacing: 0.05em;">
                            Principio 13 · Archivo Físico Digital
                        </div>
                        <h2 style="font-family: var(--font-serif-header); font-size: 22px; font-weight: 900; color: #0F172A; margin-top: 2px;">
                            📒 Mis Tomos Físicos de Facturación
                        </h2>
                        <p style="font-size: 12px; color: #64748B;">
                            Tus hojas emitidas organizadas por mes, idéntico a tus blocs de imprenta de toda la vida.
                        </p>
                    </div>
                    <button type="button" onclick="window.appState.closeTomosModal()" style="background: #E2E8F0; border: none; border-radius: 999px; width: 32px; height: 32px; font-weight: 900; font-size: 14px; cursor: pointer; color: #475569;">
                        ✕
                    </button>
                </div>

                <!-- Pestañas de Tomos Mensuales -->
                <div style="display: flex; gap: 10px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 4px;">
                    ${tomosTabs}
                </div>

                <!-- Lista de Hojas del Tomo Seleccionado -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span style="font-size: 13px; font-weight: 800; color: #0F172A;">Hojas Archivadas en ${esc(activeTomoMonth)}:</span>
                    <span style="font-family: var(--font-mono-num); font-size: 12px; font-weight: 800; color: #16A34A;">Total Facturado: $3,450.00</span>
                </div>

                <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">
                    ${hojasList}
                </div>

                <!-- Botón de Cierre Inferior -->
                <div style="text-align: center;">
                    <button type="button" class="btn-stamp" style="background: #0F172A; width: auto; padding: 10px 24px; font-size: 12px;" onclick="window.appState.closeTomosModal()">
                        ✒️ Volver a Emitir al Talonario
                    </button>
                </div>
            </div>
        </div>
    `;
}
