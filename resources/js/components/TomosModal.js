/**
 * Componente: TomosModal
 * Principio 13 del Producto: "Historial por Tomos Físicos"
 * Permite al comerciante consultar sus facturas archivadas por meses como talonarios reales.
 */

function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function renderTomosModal(activeTomoMonth = 'AGOSTO 2026', tomosData = null, comprobantesData = null, searchQuery = '') {
    // Tomos mensuales dinámicos o fallback elegante
    const defaultTomos = [
        { id: '2026-08', nombre: 'AGOSTO 2026', hojas: 0, total: '$0.00', activo: activeTomoMonth.includes('AGOSTO') || activeTomoMonth === '2026-08' },
        { id: '2026-07', nombre: 'JULIO 2026', hojas: 0, total: '$0.00', activo: activeTomoMonth.includes('JULIO') || activeTomoMonth === '2026-07' },
        { id: '2026-06', nombre: 'JUNIO 2026', hojas: 0, total: '$0.00', activo: activeTomoMonth.includes('JUNIO') || activeTomoMonth === '2026-06' }
    ];

    let tomos = defaultTomos;
    if (tomosData && Array.isArray(tomosData) && tomosData.length > 0) {
        tomos = tomosData.map(t => ({
            id: t.anio_mes || t.id,
            nombre: t.nombre || t.anio_mes,
            hojas: t.hojas_count ?? t.hojas ?? 0,
            total: typeof t.total_monto === 'number' ? `$${t.total_monto.toFixed(2)}` : (t.total || '$0.00'),
            activo: (t.nombre === activeTomoMonth) || (t.anio_mes === activeTomoMonth)
        }));
    }

    // Lista de comprobantes del tomo
    let comprobantes = [];
    if (comprobantesData && Array.isArray(comprobantesData)) {
        comprobantes = comprobantesData;
    }

    // Filtrado por buscador si existe
    if (searchQuery && searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        comprobantes = comprobantes.filter(c => 
            (c.cliente_nombre && c.cliente_nombre.toLowerCase().includes(q)) ||
            (c.cliente_identificacion && c.cliente_identificacion.includes(q)) ||
            (c.numero_comprobante && c.numero_comprobante.includes(q)) ||
            (c.secuencial && c.secuencial.includes(q))
        );
    }

    // Cálculo del total facturado del tomo visible
    let totalTomoMonto = 0;
    if (comprobantes.length > 0) {
        totalTomoMonto = comprobantes.reduce((acc, c) => acc + (parseFloat(c.importe_total) || 0), 0);
    }

    const tomosTabs = tomos.map(t => `
        <button type="button" 
                class="tomo-tab-btn ${t.activo ? 'active' : ''}" 
                style="padding: 10px 16px; border-radius: 12px; font-weight: 800; font-size: 13px; cursor: pointer; border: 1.5px solid ${t.activo ? '#16A34A' : '#334155'}; background: ${t.activo ? '#16A34A' : '#1E293B'}; color: #FFFFFF; display: flex; align-items: center; gap: 8px; transition: all 0.2s; white-space: nowrap;"
                onclick="window.appState.switchTomoMonth('${esc(t.id)}')">
            <span>📒 ${esc(t.nombre)}</span>
            <span style="font-size: 11px; background: rgba(0,0,0,0.25); padding: 2px 8px; border-radius: 999px;">${t.hojas} Hojas</span>
        </button>
    `).join('');

    const hojasListHtml = comprobantes.length === 0 ? `
            <div style="background: #FFFFFF; border: 2px dashed #CBD5E1; border-radius: 14px; padding: 36px 20px; text-align: center; color: #64748B;">
                <div style="font-size: 40px; margin-bottom: 12px;">📑</div>
                <div style="font-weight: 800; font-size: 15px; color: #1E293B; margin-bottom: 6px;">
                    Este tomo no tiene hojas emitidas todavía
                </div>
                <p style="font-size: 13px; max-width: 440px; margin: 0 auto 16px auto; line-height: 1.5;">
                    Cada vez que desprendas una factura en tu talonario, se archivará automáticamente aquí con su copia física y número de autorización SRI.
                </p>
                <button type="button" class="btn-stamp" style="background: #0F172A; width: auto; padding: 10px 20px; font-size: 12px; display: inline-flex; align-items: center; gap: 6px;" onclick="window.appState.closeTomosModal()">
                    <span>✒️ Emitir mi Primera Hoja</span>
                </button>
            </div>
        ` : comprobantes.map(h => {
            const num = h.secuencial || (h.numero_comprobante ? h.numero_comprobante.split('-')[2] : '000000001');
            const numComp = h.numero_comprobante || `001-001-${num}`;
            const fechaStr = h.fecha_emision ? new Date(h.fecha_emision).toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Hoy';
            const totalFmt = typeof h.importe_total === 'number' ? `$${h.importe_total.toFixed(2)}` : (h.importe_total ? `$${parseFloat(h.importe_total).toFixed(2)}` : '$0.00');
            const estadoBadge = h.estado === 'AUTORIZADO' ? '✓ SRI AUTORIZADO' : (h.estado || 'EMITIDO');
            const claveAcceso = h.clave_acceso || '';

            return `
                <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(15,23,42,0.03); transition: transform 0.15s ease;" onmouseenter="this.style.borderColor='#94A3B8'" onmouseleave="this.style.borderColor='#E2E8F0'">
                    <div style="min-width: 0; flex: 1; padding-right: 12px;">
                        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                            <span style="font-family: var(--font-mono-num); font-size: 13px; font-weight: 800; color: #D62828;">
                                N° ${esc(numComp)}
                            </span>
                            <span style="font-size: 10px; font-weight: 800; background: #DCFCE7; color: #15803D; padding: 2px 6px; border-radius: 6px;">
                                ${esc(estadoBadge)}
                            </span>
                            <span style="font-size: 11px; color: #64748B;">📅 ${esc(fechaStr)}</span>
                        </div>
                        <div style="font-size: 14px; font-weight: 700; color: #0F172A; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${esc(h.cliente_nombre || 'Consumidor Final')}
                        </div>
                        <div style="font-size: 11px; color: #64748B;">
                            RUC/CI: ${esc(h.cliente_identificacion || '9999999999999')}
                            ${h.items && h.items.length ? ` · <span style="color:#0369A1;">${h.items.length} ${h.items.length === 1 ? 'ítem' : 'ítems'}</span>` : ''}
                        </div>
                    </div>
                    <div style="text-align: right; flex-shrink: 0;">
                        <div style="font-family: var(--font-mono-num); font-size: 16px; font-weight: 900; color: #0F172A;">
                            ${esc(totalFmt)}
                        </div>
                        <div style="margin-top: 6px; display: flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap;">
                            <button type="button" class="btn-whatsapp-direct" style="padding: 4px 8px; font-size: 10px; border-radius: 8px;" onclick="window.appState.shareHistoricalFactura('${esc(numComp)}', '${esc(h.cliente_nombre || '')}', '${esc(totalFmt)}', '${esc(claveAcceso)}')">
                                💬 WhatsApp
                            </button>
                            ${claveAcceso ? `
                                <button type="button" class="sim-btn" style="background: #0284C7; color: white; padding: 4px 8px; font-size: 10px; border-radius: 8px;" onclick="window.appState.downloadXmlFactura('${esc(claveAcceso)}')">
                                    ⬇️ XML
                                </button>
                            ` : ''}
                            <button type="button" class="sim-btn" style="background: #334155; color: white; padding: 4px 8px; font-size: 10px; border-radius: 8px;" onclick="window.appState.printHistoricalFactura('${esc(numComp)}')">
                                🖨️ RIDE
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    return `
        <div class="tomos-modal-overlay" style="position: fixed; inset: 0; background: rgba(15,23,42,0.85); backdrop-filter: blur(8px); z-index: 9999; display: flex; justify-content: center; align-items: center; padding: 16px;" onclick="if(event.target === this) window.appState.closeTomosModal()">
            <div style="background: #F8FAFC; border: 1px solid #334155; border-radius: 18px; width: 100%; max-width: 780px; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 60px rgba(0,0,0,0.5); padding: 24px; position: relative;" onclick="event.stopPropagation()">
                
                <!-- Encabezado Modal -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px;">
                    <div>
                        <div style="font-size: 11px; font-weight: 800; color: #D97706; text-transform: uppercase; letter-spacing: 0.05em;">
                            Principio 13 · Archivo Físico Digital
                        </div>
                        <h2 style="font-family: var(--font-serif-header); font-size: 22px; font-weight: 900; color: #0F172A; margin-top: 2px;">
                            📒 Mis Tomos Físicos de Facturación
                        </h2>
                        <p style="font-size: 12px; color: #64748B; margin-top: 2px;">
                            Tus hojas emitidas organizadas por mes, idéntico a tus blocs de imprenta de toda la vida.
                        </p>
                    </div>
                    <button type="button" onclick="window.appState.closeTomosModal()" style="background: #E2E8F0; border: none; border-radius: 999px; width: 34px; height: 34px; font-weight: 900; font-size: 15px; cursor: pointer; color: #475569; display: flex; align-items: center; justify-content: center;" title="Cerrar">
                        ✕
                    </button>
                </div>

                <!-- Buscador de Facturas -->
                <div style="margin-bottom: 16px; position: relative;">
                    <input type="text" 
                           id="tomos-search-input"
                           placeholder="🔍 Buscar por nombre del cliente, RUC, cédula o N° de hoja..."
                           value="${esc(searchQuery)}"
                           oninput="window.appState.handleTomosSearch(this.value)"
                           style="width: 100%; padding: 10px 14px; font-size: 13px; border: 1.5px solid #CBD5E1; border-radius: 10px; background: #FFFFFF; color: #0F172A; outline: none; box-sizing: border-box;"
                           onfocus="this.style.borderColor='#16A34A'"
                           onblur="this.style.borderColor='#CBD5E1'" />
                </div>

                <!-- Pestañas de Tomos Mensuales -->
                <div style="display: flex; gap: 8px; margin-bottom: 18px; overflow-x: auto; padding-bottom: 4px;">
                    ${tomosTabs}
                </div>

                <!-- Resumen de Hojas del Tomo Seleccionado -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 0 4px;">
                    <span style="font-size: 13px; font-weight: 800; color: #0F172A;">
                        ${comprobantes.length} ${comprobantes.length === 1 ? 'Hoja Archivada' : 'Hojas Archivadas'} en este Tomo:
                    </span>
                    <span style="font-family: var(--font-mono-num); font-size: 13px; font-weight: 800; color: #16A34A;">
                        Total Facturado: $${totalTomoMonto.toFixed(2)}
                    </span>
                </div>

                <!-- Lista de Hojas del Tomo Seleccionado -->
                <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 22px; max-height: 48vh; overflow-y: auto; padding-right: 4px;">
                    ${hojasListHtml}
                </div>

                <!-- Botón de Cierre Inferior -->
                <div style="text-align: center; border-top: 1px solid #E2E8F0; padding-top: 16px;">
                    <button type="button" class="btn-stamp" style="background: #0F172A; width: auto; padding: 11px 28px; font-size: 13px; display: inline-flex; align-items: center; gap: 8px;" onclick="window.appState.closeTomosModal()">
                        <span>✒️ Volver a Emitir al Talonario</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}
