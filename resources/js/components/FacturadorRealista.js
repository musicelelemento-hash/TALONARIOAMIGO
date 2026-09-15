/**
 * Componente: FacturadorRealista
 * Réplica fiel del talonario impreso tradicional con soporte para:
 * - Sistema de Modos (Tranquilo 👴 / Comerciante 🏪 / Pro ⚡)
 * - Chips táctiles de productos rápidos (🌽 Maíz, ☕ Café, 🥥 Cacao, 🍌 Banano)
 * - Copia Azul Autocopiativa Tradicional del Emisor
 * - Física 3D, Haptic Feedback y Sello SRI Impact
 */

function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function renderFacturadorRealista(emisorData, currentDocNumber, experienceMode = 'comerciante', isShowingBlueCopy = false) {
    const docNumStr = String(currentDocNumber || 126).padStart(9, '0');
    const mode = experienceMode || 'comerciante';

    // RENDERIZADO DE LA COPIA AZUL AUTOCOPIATIVA
    if (isShowingBlueCopy) {
        return `
            <div class="mode-switcher-bar">
                <span style="color:#60A5FA; font-size:12px; font-weight:800; padding:6px 12px;">
                    📄 DUPLICADO AUTOCOPIATIVO DEL EMISOR — ARCHIVO TRIBUTARIO
                </span>
            </div>

            <div class="factura-talonario-container copia-azul-container" id="receipt-paper-card">
                <div class="copia-azul-watermark">DUPLICADO — EMISOR</div>
                <div class="copia-azul-stamp">✓ COPIA AUTODOCUMENTAL SRI</div>

                <div class="header-grid">
                    <div>
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                            ${emisorData?.businessLogo ? `
                                <img src="${esc(emisorData.businessLogo)}" alt="Logo" style="max-height: 44px; max-width: 100px; object-fit: contain; filter: contrast(1.4) grayscale(0.8) sepia(1) hue-rotate(180deg);">
                            ` : ''}
                            <div class="rimpe-badge" style="background:#DBEAFE; color:#1E40AF; border-color:#93C5FD;">
                                "CONTRIBUYENTE NEGOCIO POPULAR - RÉGIMEN RIMPE"
                            </div>
                        </div>
                        <div class="emisor-nombre" style="color:#1E3A8A;">Carlos Alexander Balladares Gómez</div>
                        <div class="emisor-actividad" style="color:#2563EB;">VENTA AL POR MAYOR DE CACAO.</div>
                        <div class="emisor-detalles" style="color:#1D4ED8;">
                            <strong>Dirección:</strong> VIA PRINCIPAL SN Y CALLE SN<br>
                            <strong>Celular:</strong> 0993050689<br>
                            <strong>EL GUABO - EL ORO - ECUADOR</strong>
                        </div>
                    </div>

                    <div class="ruc-box-container" style="border-color:#1D4ED8; color:#1D4ED8;">
                        <div class="ruc-title-row" style="color:#1D4ED8;">R U C: 0706050986001</div>
                        <div class="document-type-banner" style="background:#1D4ED8; color:#FFFFFF;">COPIA AZUL AUTOCOPIATIVA</div>
                        <div class="serie-row" style="color:#1D4ED8;">SERIE: 001-001</div>
                        <div class="numeralia-roja" style="color:#1E40AF;">${docNumStr}</div>
                        <div class="aut-sri-row" style="color:#1D4ED8;">AUT. S R I: 1133462787</div>
                    </div>
                </div>

                <div style="margin-top: 24px; padding: 18px; border: 1.5px dashed #60A5FA; border-radius: 12px; text-align: center; background: rgba(255,255,255,0.6);">
                    <h3 style="font-size: 16px; font-weight: 800; color: #1E3A8A; margin-bottom: 6px;">
                        ✓ Comprobante Transmitido y Registrado Exitosamente
                    </h3>
                    <p style="font-size: 13px; color: #1D4ED8; margin-bottom: 14px;">
                        Esta copia queda archivada en tu tomo físico digital. Puedes enviarla por WhatsApp al cliente o pasar a la siguiente hoja.
                    </p>
                    <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
                        <button class="btn-whatsapp-direct" style="padding: 10px 20px; font-size: 12px;" onclick="window.appState.shareFacturaWhatsapp()">
                            📲 Enviar Factura al Cliente por WhatsApp
                        </button>
                        <button class="btn-stamp" style="background: #1D4ED8; border-color: #1D4ED8; width: auto; padding: 10px 22px; font-size: 12px;" onclick="window.appState.finishBlueCopyPreview()">
                            ✒️ Pasar a Nueva Hoja
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // MODO NORMAL (HOJA MARFIL) CON SELECTOR DE EXPERIENCIA
    return `
        <!-- Barra Selector de Experiencia (Tranquilo / Comerciante / Pro) -->
        <div class="mode-switcher-bar" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <button class="mode-chip-btn ${mode === 'tranquilo' ? 'active' : ''}" onclick="window.appState.setExperienceMode('tranquilo')">
                    👴 Tranquilo
                </button>
                <button class="mode-chip-btn ${mode === 'comerciante' ? 'active' : ''}" onclick="window.appState.setExperienceMode('comerciante')">
                    🏪 Comerciante
                </button>
                <button class="mode-chip-btn ${mode === 'pro' ? 'active' : ''}" onclick="window.appState.setExperienceMode('pro')">
                    ⚡ Pro
                </button>
            </div>
            <div style="display: flex; gap: 6px; align-items: center;">
                <button type="button" class="mode-chip-btn" style="background: transparent; border: 1px solid #CBD5E1; color: #475569; font-size: 11px;" onclick="window.appState.toggleAudio()" title="Activar/Silenciar Efectos de Sonido">
                    ${emisorData?.audioEnabled !== false ? '🔊 Sonido' : '🔇 Silencio'}
                </button>
                <button type="button" class="mode-chip-btn" style="background: #0F172A; color: #F8FAFC; border: 1px solid #334155; font-size: 11px;" onclick="window.appState.openTomosModal()">
                    📒 Mis Tomos Físicos
                </button>
            </div>
        </div>

        <div class="factura-talonario-container paper-glide-in ${mode === 'tranquilo' ? 'mode-tranquilo-view' : ''}" id="receipt-paper-card">
            <!-- Saludo Cálido para Modo Tranquilo -->
            ${mode === 'tranquilo' ? `
                <div class="mode-tranquilo-greeting">
                    <span style="font-size: 18px;">👋</span>
                    <div>
                        <strong>Buenos días, Don Carlos.</strong> Tu talonario está listo para emitir. Solo confirma los datos y toca el botón de abajo.
                    </div>
                </div>
            ` : ''}

            <!-- SELLO IMPACTO AUTORIZADO SRI -->
            <div class="stamp-sri-impact" id="stamp-sri-badge">
                ✓ AUTORIZADO SRI<br>
                <small style="font-size:9px; font-weight:normal;">CLAVE ACCESO: 2807202601...</small>
            </div>

            <!-- Header Grid: Datos del Emisor (Izq) vs RUC / Documento Box (Der) -->
            <div class="header-grid">
                <!-- Bloque Izquierdo: Emisor -->
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            ${emisorData?.businessLogo ? `
                                <img src="${esc(emisorData.businessLogo)}" alt="Logo" style="max-height: 42px; max-width: 90px; object-fit: contain; border-radius: 4px;">
                            ` : ''}
                            <div class="rimpe-badge">"CONTRIBUYENTE NEGOCIO POPULAR - RÉGIMEN RIMPE"</div>
                        </div>
                        <label for="business-logo-input" style="cursor: pointer; font-size: 10px; font-weight: 800; color: #1D4ED8; background: #EBF3FF; padding: 3px 8px; border-radius: 6px; border: 1px solid #BFDBFE; white-space: nowrap;">
                            🏷️ ${emisorData?.businessLogo ? 'Cambiar Logo' : '+ Tu Logo'}
                        </label>
                        <input type="file" id="business-logo-input" accept="image/*" style="display: none;" onchange="window.appState.handleLogoUpload(this)">
                    </div>
                    <div class="emisor-nombre">Carlos Alexander Balladares Gómez</div>
                    <div class="emisor-actividad">VENTA AL POR MAYOR DE CACAO.</div>
                    <div class="emisor-detalles">
                        <strong>Dirección:</strong> VIA PRINCIPAL SN Y CALLE SN<br>
                        <strong>Celular:</strong> 0993050689<br>
                        <strong>EL GUABO - EL ORO - ECUADOR</strong>
                    </div>
                </div>

                <!-- Bloque Derecho: Cuadro RUC & Nota de Venta / Factura -->
                <div class="ruc-box-container">
                    <div class="ruc-title-row">R U C: 0706050986001</div>
                    <div class="document-type-banner">NOTA DE VENTA</div>
                    <div class="serie-row">
                        ${mode === 'pro' ? `
                            SERIE: <select id="pro-serie-select" style="font-family: inherit; font-size: 11px; font-weight: 800; border: none; background: transparent; cursor: pointer;">
                                <option value="001-001">001-001 (Matriz)</option>
                                <option value="001-002">001-002 (Sucursal 1)</option>
                            </select>
                        ` : 'SERIE: 001-001'}
                    </div>
                    <div class="numeralia-roja" id="doc-secuencial-num">${docNumStr}</div>
                    <div class="aut-sri-row">AUT. S R I: 1133462787</div>
                    <div class="fecha-grid-box">
                        <div>DIA<br><strong style="font-size:11px;">${new Date().getDate()}</strong></div>
                        <div>MES<br><strong style="font-size:11px;">${String(new Date().getMonth() + 1).padStart(2, '0')}</strong></div>
                        <div>AÑO<br><strong style="font-size:11px;">${new Date().getFullYear()}</strong></div>
                    </div>
                </div>
            </div>

            <!-- Principio 14: Tarjetas de Clientes Frecuentes -->
            <div class="frequent-clients-wrapper">
                <div class="frequent-clients-label">
                    <span>👥 Clientes Frecuentes:</span>
                </div>
                <div class="frequent-clients-bar">
                    <button type="button" class="frequent-client-chip" onclick="window.appState.selectFrequentClient('Juan Alberto Pérez Gómez', 'Av. Central N12-45 y Rocafuerte', '1712345678')">
                        <span>👤 Juan Pérez</span>
                        <span class="frequent-client-badge">14 compras</span>
                    </button>
                    <button type="button" class="frequent-client-chip" onclick="window.appState.selectFrequentClient('María Elena Loor', 'Barrio Las Peñas y Malecón', '0928374651')">
                        <span>👤 María Loor</span>
                        <span class="frequent-client-badge">8 compras</span>
                    </button>
                    <button type="button" class="frequent-client-chip" onclick="window.appState.selectFrequentClient('Ab. Carlos Zambrano', 'Edif. La Previsora Of. 402', '0704938291')">
                        <span>👤 Carlos Zambrano</span>
                        <span class="frequent-client-badge">22 compras</span>
                    </button>
                    <button type="button" class="frequent-client-chip" onclick="window.appState.selectFrequentClient('Consumidor Final', 'Sin dirección', '9999999999999')">
                        <span>👤 Consumidor Final</span>
                    </button>
                </div>
            </div>

            <!-- Sección Datos del Cliente Receptor con Efecto Escritura Analógica -->
            <div class="cliente-seccion">
                <div class="cliente-row">
                    <span class="cliente-label">Sr. (s)</span>
                    <input type="text" id="cliente-nombre-input" class="cliente-line-input" value="Juan Alberto Pérez Gómez" placeholder="Nombre completo" onfocus="window.appState.onInputFocus()">
                </div>
                <div class="cliente-row">
                    <span class="cliente-label">Dirección</span>
                    <input type="text" id="cliente-direccion-input" class="cliente-line-input" value="Av. Central N12-45 y Rocafuerte" placeholder="Dirección del cliente" onfocus="window.appState.onInputFocus()">
                </div>
                <div class="cliente-row">
                    <span class="cliente-label">RUC / CI #</span>
                    <input type="text" id="cliente-ruc-input" class="cliente-line-input" style="max-width: 150px;" value="1712345678" placeholder="Identificación" onfocus="window.appState.onInputFocus()">
                    <span class="cliente-label" style="margin-left: 8px;">Guía de Remisión</span>
                    <input type="text" id="cliente-guia-input" class="cliente-line-input" placeholder="Opcional" onfocus="window.appState.onInputFocus()">
                </div>
            </div>

            <!-- Chips Rápidos de Productos Táctiles (Modo Comerciante) -->
            ${mode === 'comerciante' ? `
                <div class="quick-chips-wrapper">
                    <span style="font-size:11px; font-weight:800; color:#64748B; align-self:center; margin-right:4px;">Rápidos:</span>
                    <button type="button" class="quick-product-chip" onclick="window.appState.addQuickProduct('🌽 Quintal de Maíz', 18.50)">🌽 Maíz ($18.50)</button>
                    <button type="button" class="quick-product-chip" onclick="window.appState.addQuickProduct('☕ Quintal de Café', 45.00)">☕ Café ($45.00)</button>
                    <button type="button" class="quick-product-chip" onclick="window.appState.addQuickProduct('🥥 Quintal de Cacao Fino', 60.00)">🥥 Cacao ($60.00)</button>
                    <button type="button" class="quick-product-chip" onclick="window.appState.addQuickProduct('🍌 Caja de Banano', 6.50)">🍌 Banano ($6.50)</button>
                    <button type="button" class="quick-product-chip" onclick="window.appState.addEmptyRow()">➕ Fila</button>
                </div>
            ` : ''}

            <!-- Tabla de Detalle con Inputs Interactivos -->
            <div class="tabla-productos-wrapper">
                <svg class="watermark-sketch" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M50 10 C30 30, 20 60, 50 90 C80 60, 70 30, 50 10 Z" fill="#4A4A4A"/>
                </svg>

                <table class="tabla-realista">
                    <thead>
                        <tr>
                            <th style="width: 12%;">CANT.</th>
                            <th style="width: 58%;">D E S C R I P C I Ó N</th>
                            <th style="width: 15%;">P. UNITARIO</th>
                            <th style="width: 15%;">PRECIO TOTAL</th>
                        </tr>
                    </thead>
                    <tbody id="realista-items-body">
                        <tr>
                            <td style="text-align: center;"><input type="number" class="table-input" value="500" oninput="window.appState.recalculateTotals()" onfocus="window.appState.onInputFocus()"></td>
                            <td><input type="text" class="table-input" value="Quintales de Cacao Fino de Aroma (Exportación)" onfocus="window.appState.onInputFocus()"></td>
                            <td style="text-align: right;"><input type="number" step="0.01" class="table-input" value="0.12" style="text-align:right;" oninput="window.appState.recalculateTotals()" onfocus="window.appState.onInputFocus()"></td>
                            <td style="text-align: right; padding-right: 6px;" class="row-total">$60.00</td>
                        </tr>
                        <tr>
                            <td style="text-align: center;"><input type="number" class="table-input" value="1" oninput="window.appState.recalculateTotals()" onfocus="window.appState.onInputFocus()"></td>
                            <td><input type="text" class="table-input" value="Licencia Digital Talonario Amigo SRI" onfocus="window.appState.onInputFocus()"></td>
                            <td style="text-align: right;"><input type="number" step="0.01" class="table-input" value="25.00" style="text-align:right;" oninput="window.appState.recalculateTotals()" onfocus="window.appState.onInputFocus()"></td>
                            <td style="text-align: right; padding-right: 6px;" class="row-total">$25.00</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Desglose Tributario (Modo Pro) -->
            ${mode === 'pro' ? `
                <div class="pro-tax-breakdown">
                    <div class="pro-tax-row">
                        <span>SUBTOTAL 0% (RIMPE / Tarifa Cero):</span>
                        <span id="pro-subtotal-cero">$85.00</span>
                    </div>
                    <div class="pro-tax-row">
                        <span>SUBTOTAL 15% (Tarifa General):</span>
                        <span id="pro-subtotal-quince">$0.00</span>
                    </div>
                    <div class="pro-tax-row">
                        <span>IVA 15%:</span>
                        <span id="pro-iva-quince">$0.00</span>
                    </div>
                    <div class="pro-tax-row highlight">
                        <span>TOTAL FACTURADO:</span>
                        <span id="pro-total-highlight">$85.00</span>
                    </div>
                </div>
            ` : ''}

            <!-- Forma de Pago y Total Box -->
            <div class="footer-grid">
                <div class="forma-pago-box">
                    <div class="forma-pago-header">FORMA DE PAGO:</div>
                    <div class="pago-checkboxes">
                        <label class="pago-item" onclick="window.appState.triggerHaptic(15)"><input type="checkbox" checked> EFECTIVO:</label>
                        <label class="pago-item" onclick="window.appState.triggerHaptic(15)"><input type="checkbox"> ELECTRÓNICO:</label>
                        <label class="pago-item" onclick="window.appState.triggerHaptic(15)"><input type="checkbox"> TARJETA CRÉDITO/DÉBITO:</label>
                        <label class="pago-item" onclick="window.appState.triggerHaptic(15)"><input type="checkbox"> OTROS:</label>
                    </div>
                </div>

                <div class="total-cobrar-box">
                    <div class="total-cobrar-header">TOTAL A COBRAR <span style="font-size:14px;">➔</span></div>
                    <div class="total-cobrar-monto" id="grand-total-display">$85.00</div>
                </div>
            </div>

            <!-- Pie de Imprenta Autorizada -->
            <div class="imprenta-pie">
                <strong>IMPRENTA "CORDOVA"</strong> • RUC: 0702065319001 • N° Aut. 8634 • PEDRO MANUEL CÓRDOVA RODRÍGUEZ<br>
                DIRECCIÓN: COLÓN E / SUCRE Y AV. ROCAFUERTE / PASAJE 📞 0993083943<br>
                <strong>N° 00000101 al 00000150 - Fecha de Autorización: 15/Junio/2026</strong>
            </div>

            <!-- Firmas de Conformidad -->
            <div class="firmas-row">
                <div class="firma-col">RECIBÍ CONFORME</div>
                <div class="firma-col">ENTREGUE CONFORME</div>
            </div>

            <div style="text-align: center; margin-top: 10px; font-size: 10px; font-weight: 800;">
                Fecha de Caducidad: 15/Junio/2027
            </div>

            <!-- Botón Acción Enviar SRI con Animaciones AAA -->
            <div style="margin-top: 18px;">
                <button class="btn-stamp-action" onclick="window.appState.executeEmit3DSequence()">
                    ✒️ FIRMAR Y EMITIR AL SRI (XAdES-BES)
                </button>
            </div>
        </div>
    `;
}
