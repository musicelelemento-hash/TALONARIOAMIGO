/**
 * Componente: FacturadorRealista
 * Réplica fiel del talonario impreso tradicional con soporte para Física 3D, Haptic Feedback y Sello SRI Impact
 */
export function renderFacturadorRealista(emisorData, currentDocNumber) {
    const docNumStr = String(currentDocNumber || 126).padStart(9, '0');
    
    return `
        <div class="factura-talonario-container paper-glide-in" id="receipt-paper-card">
            <!-- SELLO IMPACTO AUTORIZADO SRI -->
            <div class="stamp-sri-impact" id="stamp-sri-badge">
                ✓ AUTORIZADO SRI<br>
                <small style="font-size:9px; font-weight:normal;">CLAVE ACCESO: 2807202601...</small>
            </div>

            <!-- Header Grid: Datos del Emisor (Izq) vs RUC / Documento Box (Der) -->
            <div class="header-grid">
                <!-- Bloque Izquierdo: Emisor -->
                <div>
                    <div class="rimpe-badge">"CONTRIBUYENTE NEGOCIO POPULAR - RÉGIMEN RIMPE"</div>
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
                    <div class="serie-row">SERIE: 001-001</div>
                    <div class="numeralia-roja" id="doc-secuencial-num">${docNumStr}</div>
                    <div class="aut-sri-row">AUT. S R I: 1133462787</div>
                    <div class="fecha-grid-box">
                        <div>DIA<br><strong style="font-size:11px;">28</strong></div>
                        <div>MES<br><strong style="font-size:11px;">07</strong></div>
                        <div>AÑO<br><strong style="font-size:11px;">2026</strong></div>
                    </div>
                </div>
            </div>

            <!-- Sección Datos del Cliente Receptor con Efecto Escritura Analógica -->
            <div class="cliente-seccion">
                <div class="cliente-row">
                    <span class="cliente-label">Sr. (s)</span>
                    <input type="text" class="cliente-line-input" value="Juan Alberto Pérez Gómez" placeholder="Nombre completo" onfocus="window.appState.triggerHaptic(10)">
                </div>
                <div class="cliente-row">
                    <span class="cliente-label">Dirección</span>
                    <input type="text" class="cliente-line-input" value="Av. Central N12-45 y Rocafuerte" placeholder="Dirección del cliente" onfocus="window.appState.triggerHaptic(10)">
                </div>
                <div class="cliente-row">
                    <span class="cliente-label">RUC / CI #</span>
                    <input type="text" class="cliente-line-input" style="max-width: 140px;" value="1712345678" placeholder="Identificación" onfocus="window.appState.triggerHaptic(10)">
                    <span class="cliente-label" style="margin-left: 8px;">Guía de Remisión</span>
                    <input type="text" class="cliente-line-input" placeholder="Opcional" onfocus="window.appState.triggerHaptic(10)">
                </div>
            </div>

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
                            <td style="text-align: center;"><input type="number" class="table-input" value="500" oninput="window.appState.recalculateTotals()" onfocus="window.appState.triggerHaptic(10)"></td>
                            <td><input type="text" class="table-input" value="Quintales de Cacao Fino de Aroma (Exportación)" onfocus="window.appState.triggerHaptic(10)"></td>
                            <td style="text-align: right;"><input type="number" step="0.01" class="table-input" value="0.12" style="text-align:right;" oninput="window.appState.recalculateTotals()" onfocus="window.appState.triggerHaptic(10)"></td>
                            <td style="text-align: right; padding-right: 6px;" class="row-total">$60.00</td>
                        </tr>
                        <tr>
                            <td style="text-align: center;"><input type="number" class="table-input" value="1" oninput="window.appState.recalculateTotals()" onfocus="window.appState.triggerHaptic(10)"></td>
                            <td><input type="text" class="table-input" value="Licencia Digital Talonario Amigo SRI" onfocus="window.appState.triggerHaptic(10)"></td>
                            <td style="text-align: right;"><input type="number" step="0.01" class="table-input" value="25.00" style="text-align:right;" oninput="window.appState.recalculateTotals()" onfocus="window.appState.triggerHaptic(10)"></td>
                            <td style="text-align: right; padding-right: 6px;" class="row-total">$25.00</td>
                        </tr>
                        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
                        <tr><td>&nbsp;</td><td></td><td></td><td></td></tr>
                    </tbody>
                </table>
            </div>

            <!-- Forma de Pago y Total Box -->
            <div class="footer-grid">
                <div class="forma-pago-box">
                    <div class="forma-pago-header">FORMA DE PAGO:</div>
                    <div class="pago-checkboxes">
                        <label class="pago-item" onclick="window.appState.triggerHaptic(15)"><input type="checkbox" checked> EFECTIVO DINERO:</label>
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
