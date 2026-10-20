/**
 * Componente: FacturadorRealista
 * Réplica fiel del talonario impreso tradicional con soporte para:
 * - Sistema de Modos (Tranquilo 👴 / Comerciante 🏪 / Pro ⚡)
 * - Chips táctiles de productos rápidos (🌽 Maíz, ☕ Café, 🥥 Cacao, 🍌 Banano)
 * - Copia Azul Autocopiativa Tradicional del Emisor
 * - Física 3D, Haptic Feedback y Sello SRI Impact
 */

import { renderOnboardingModal } from './OnboardingScreen.js';

function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function renderFacturadorRealista(emisorData, currentDocNumber, experienceMode = 'comerciante', isShowingBlueCopy = false) {
    const isDemo = emisorData?.isDemoMode !== false;
    const hasSignature = !!emisorData?.hasSignature;
    const isConfigured = !!emisorData?.isConfigured;
    const showRedWarningLine = !isDemo && (!hasSignature || !isConfigured);
    const docNumStr = String(currentDocNumber || 126).padStart(9, '0');
    const mode = experienceMode || 'comerciante';

    // Cálculo del estado y grosor del bloc (Principio 16: Hojas apiladas)
    const docNum = parseInt(currentDocNumber || 126, 10);
    const blocStart = 101;
    const blocEnd = 150;
    const totalSheetsInBloc = blocEnd - blocStart + 1; // 50 hojas por bloc
    const currentSheetInBloc = Math.min(Math.max(docNum - blocStart + 1, 1), totalSheetsInBloc);
    const remainingSheets = Math.max(totalSheetsInBloc - currentSheetInBloc, 0);
    const blocPercent = Math.round((currentSheetInBloc / totalSheetsInBloc) * 100);

    const emisor = emisorData?.user?.emisor || emisorData?.emisor || {};
    const nombreEmisor = emisor.razon_social || '';
    const rucEmisor = emisor.ruc || '';
    const actividadEmisor = emisor.nombre_comercial || '';
    const direccionEmisor = emisor.direccion_matriz || '';
    const telefonoEmisor = emisorData?.supportWhatsapp || '';
    const regimenEmisor = emisor.tipo_regimen === 'GENERAL' ? '"RÉGIMEN GENERAL"' : '"CONTRIBUYENTE NEGOCIO POPULAR - RÉGIMEN RIMPE"';
    const docTypeLabel = emisor.tipo_regimen === 'GENERAL' ? 'FACTURA ELECTRÓNICA' : 'NOTA DE VENTA';

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
                                ${esc(regimenEmisor)}
                            </div>
                        </div>
                        <div class="emisor-nombre" style="color:#1E3A8A;">${esc(nombreEmisor)}</div>
                        <div class="emisor-actividad" style="color:#2563EB;">${esc(actividadEmisor)}</div>
                        <div class="emisor-detalles" style="color:#1D4ED8;">
                            <strong>Dirección:</strong> ${esc(direccionEmisor)}<br>
                        <strong>Celular:</strong> ${esc(telefonoEmisor)}<br>
                        <strong>ECUADOR</strong>
                        </div>
                    </div>

                    <div class="ruc-box-container" style="border-color:#1D4ED8; color:#1D4ED8;">
                        <div class="ruc-title-row" style="color:#1D4ED8;">R U C: ${esc(rucEmisor)}</div>
                        <div class="document-type-banner" style="background:#1D4ED8; color:#FFFFFF;">COPIA AZUL AUTOCOPIATIVA</div>
                        <div class="serie-row" style="color:#1D4ED8;">SERIE: 001-001</div>
                        <div class="numeralia-roja" style="color:#1E40AF;">${docNumStr}</div>
                        <div class="aut-sri-row" style="color:#1D4ED8;">AUT. S R I: ${esc(emisor.numero_autorizacion || 'PENDIENTE')}</div>
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
                        ${emisorData?.isDemoGuest ? `
                            <button type="button" class="btn-stamp" style="background: #10B981; border-color: #10B981; width: auto; padding: 10px 22px; font-size: 12px; color: white; font-weight: 900;" onclick="window.appState.openRegister()">
                                🚀 Configurar Mi RUC y Facturar de Verdad
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // MODO NORMAL (HOJA MARFIL) CON SELECTOR DE EXPERIENCIA
    return `
        <!-- Franja Flotante de Modo Demostración en Vivo -->
        ${emisorData?.isDemoGuest ? `
            <div class="demo-top-strip">
                <div class="demo-top-strip-info">
                    <span class="demo-top-strip-badge">
                        <span class="live-dot-pulse"></span>
                        <span>Modo Demostración en Vivo</span>
                    </span>
                    <span>Estás probando el talonario interactivo con datos de muestra. Cero riesgo legal.</span>
                </div>
                <div class="demo-top-strip-actions">
                    <button type="button" class="demo-chip-btn" onclick="window.appState.loadDemoSampleData()" title="Cargar productos típicos de tienda">
                        ✨ Cargar Ejemplo
                    </button>
                    <button type="button" class="demo-chip-btn" onclick="window.appState.toggleVoiceDictation()" title="Probar dictado por voz">
                        🎙️ Probar Voz
                    </button>
                    <button type="button" class="demo-chip-btn" onclick="document.getElementById('gravity-file-input')?.click()" title="Probar escaneo por foto">
                        📷 Probar Foto
                    </button>
                    <button type="button" class="demo-chip-btn demo-chip-btn-primary" onclick="window.appState.openRegister()" title="Crear cuenta para facturar de verdad">
                        🚀 Crear Cuenta Real
                    </button>
                    <button type="button" class="demo-chip-btn demo-chip-btn-exit" onclick="window.appState.exitDemoMode()" title="Volver a la portada">
                        ✕ Salir
                    </button>
                </div>
            </div>
        ` : ''}

        <!-- Barra Selector de Experiencia y Ambiente (Demo / Real) -->
        <div class="mode-switcher-bar" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
                <div style="display: inline-flex; background: rgba(0,0,0,0.06); padding: 2px; border-radius: 999px; margin-right: 4px;">
                    <button type="button" class="mode-chip-btn ${isDemo ? 'active' : ''}" style="${isDemo ? 'background: #10B981; color: #FFFFFF; border: none; font-weight: 800;' : 'background: transparent; color: #64748B; border: none;'}" onclick="window.appState.setDemoMode(true)" title="Modo Demostración sin consecuencias fiscales">
                        🏪 Modo Demo
                    </button>
                    <button type="button" class="mode-chip-btn ${!isDemo ? 'active' : ''}" style="${!isDemo ? 'background: #DC2626; color: #FFFFFF; border: none; font-weight: 800;' : 'background: transparent; color: #64748B; border: none;'}" onclick="window.appState.setDemoMode(false)" title="Modo Real con emisión directa ante el SRI Ecuador">
                        🔴 Modo Real SRI
                    </button>
                </div>
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
                <button type="button" class="mode-chip-btn" style="background: linear-gradient(135deg, #1E293B, #0F172A); color: #FDE68A; border: 1.5px solid #F59E0B; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 2px 8px rgba(245,158,11,0.25); cursor: pointer;" onclick="window.appState.open3DExperienceModal()" title="Ver y girar el bloc en 3D volumétrico real">
                    <span>📐 Bloc Físico 3D</span>
                </button>
                <button type="button" class="mode-chip-btn" style="background: #0F172A; color: #F8FAFC; border: 1px solid #334155; font-size: 11px;" onclick="window.appState.openTomosModal()">
                    📒 Mis Tomos Físicos
                </button>
            </div>
        </div>

        <!-- Principio 16: Grosor y Estado del Bloc Físico de 50 Hojas -->
        <div class="bloc-stack-info">
            <div style="display: flex; align-items: center; gap: 8px;">
                <strong>📒 Bloc Físico N° 01</strong> <span style="color:#64748B;">(N° 00000101 al 00000150)</span>
                ${emisorData?.offlinePendingCount > 0 ? `
                    <span class="offline-queue-badge" title="Comprobantes guardados localmente sin conexión">
                        📡 ${emisorData.offlinePendingCount} en cola offline
                    </span>
                ` : ''}
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
                <span>Hoja <strong>${currentSheetInBloc}</strong> de ${totalSheetsInBloc} (${remainingSheets} hojas restantes)</span>
                <div class="bloc-progress-track" title="${blocPercent}% emitido">
                    <div class="bloc-progress-bar" style="width: ${blocPercent}%;"></div>
                </div>
            </div>
        </div>

        <!-- LÍNEA ROJA PROMINENTE EN MODO REAL (FALTA FIRMA O CONFIGURACIÓN) -->
        ${showRedWarningLine ? `
            <div class="alerta-modo-real-roja" id="alerta-firma-roja">
                <div class="alerta-roja-content">
                    <span class="alerta-roja-icon">🚨</span>
                    <div class="alerta-roja-text">
                        <strong>ATENCIÓN — MODO REAL SRI:</strong> Falta vincular tu <strong>Firma Electrónica (.p12)</strong> o completar configuración tributaria para emitir comprobantes legales.
                    </div>
                </div>
                <button type="button" class="btn-alerta-roja" onclick="window.appState.openOnboardingModal()">
                    ⚙️ Vincular Firma y Configurar (30 seg) ➔
                </button>
            </div>
        ` : ''}

        <div class="factura-talonario-container stacked-bloc-depth notched-edge paper-glide-in ${mode === 'tranquilo' ? 'mode-tranquilo-view' : ''}" id="receipt-paper-card">
            <!-- Micro-perforación de desprendimiento de hoja física -->
            <div class="tear-perforation-strip"></div>

            <!-- Principio 3: Esquina Doblada 3D Interactiva (Leaf Corner Curl) -->
            <div class="leaf-corner-curl" title="Tocar para ojear tomos físicos archivados" onclick="window.appState.openTomosModal()"></div>

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
                            <div class="rimpe-badge">${esc(regimenEmisor)}</div>
                        </div>
                        <label for="business-logo-input" style="cursor: pointer; font-size: 10px; font-weight: 800; color: #1D4ED8; background: #EBF3FF; padding: 3px 8px; border-radius: 6px; border: 1px solid #BFDBFE; white-space: nowrap;">
                            🏷️ ${emisorData?.businessLogo ? 'Cambiar Logo' : '+ Tu Logo'}
                        </label>
                        <input type="file" id="business-logo-input" accept="image/*" style="display: none;" onchange="window.appState.handleLogoUpload(this)">
                    </div>
                    <div class="emisor-nombre">${esc(nombreEmisor)}</div>
                    <div class="emisor-actividad">${esc(actividadEmisor)}</div>
                    <div class="emisor-detalles">
                        <strong>Dirección:</strong> ${esc(direccionEmisor)}<br>
                        <strong>Celular:</strong> ${esc(telefonoEmisor)}<br>
                        <strong>ECUADOR</strong>
                    </div>
                </div>

                <!-- Bloque Derecho: Cuadro RUC & Nota de Venta / Factura -->
                <div class="ruc-box-container">
                    <div class="ruc-title-row">R U C: ${esc(rucEmisor)}</div>
                    <div class="document-type-banner">${esc(docTypeLabel)}</div>
                    <div class="serie-row">
                        ${mode === 'pro' ? `
                            SERIE: <select id="pro-serie-select" style="font-family: inherit; font-size: 11px; font-weight: 800; border: none; background: transparent; cursor: pointer;">
                                <option value="001-001">001-001 (Matriz)</option>
                                <option value="001-002">001-002 (Sucursal 1)</option>
                            </select>
                        ` : 'SERIE: 001-001'}
                    </div>
                    <div class="numeralia-roja" id="doc-secuencial-num">${docNumStr}</div>
                    <div class="aut-sri-row">AUT. S R I: ${esc(emisor.numero_autorizacion || 'PENDIENTE')}</div>
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
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 6px;">
                    <span style="font-size: 11px; font-weight: 800; color: #1E293B; text-transform: uppercase; letter-spacing: 0.5px;">
                        Datos del Cliente Receptor
                    </span>
                    <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                        <button type="button" class="btn-voice-dictate" style="background: #10B981; border-color: #059669; color: #FFFFFF; font-weight: 800; padding: 4px 10px; font-size: 11px;" onclick="window.appState.selectFrequentClient('CONSUMIDOR FINAL', 'Ecuador', '9999999999999')" title="Llenar instantáneamente como Consumidor Final ($0 a $50)">
                            ⚡ Consumidor Final
                        </button>
                        <label for="scanner-camera-input" class="btn-voice-dictate" style="background: #FEF3C7; border-color: #F59E0B; color: #B45309; cursor: pointer; padding: 4px 10px; font-size: 11px;" title="Tomar foto con cámara de la tablet/móvil a la Cédula o RUC">
                            📷 Foto Cédula / RUC
                        </label>
                        <input type="file" id="scanner-camera-input" accept="image/*" capture="environment" style="display: none;" onchange="window.appState.handleGravityScan(this)">

                        <button type="button" class="btn-voice-dictate ${emisorData?.isListeningVoice ? 'listening' : ''}" style="background: #F0FDF4; border-color: #86EFAC; color: #15803D; padding: 4px 10px; font-size: 11px;" onclick="window.appState.startVoiceDictation('client')">
                            🎙️ Dictar Cliente
                        </button>
                    </div>
                </div>

                <div class="cliente-row">
                    <span class="cliente-label">Sr. (s)</span>
                    <input type="text" id="cliente-nombre-input" class="cliente-line-input" value="Juan Alberto Pérez Gómez" placeholder="Nombre completo o Razón Social" onfocus="window.appState.onInputFocus()">
                </div>
                <div class="cliente-row">
                    <span class="cliente-label">RUC / CI #</span>
                    <input type="text" id="cliente-ruc-input" class="cliente-line-input" style="max-width: 140px;" value="1712345678" placeholder="10 o 13 dígitos" onfocus="window.appState.onInputFocus()">
                    <span class="cliente-label" style="margin-left: 6px;">Tel / Cel:</span>
                    <input type="text" id="cliente-telefono-input" class="cliente-line-input" style="max-width: 130px;" placeholder="099..." onfocus="window.appState.onInputFocus()">
                    <span class="cliente-label" style="margin-left: 6px;">Guía:</span>
                    <input type="text" id="cliente-guia-input" class="cliente-line-input" style="max-width: 80px;" placeholder="Opcional" onfocus="window.appState.onInputFocus()">
                </div>
                <div class="cliente-row">
                    <span class="cliente-label">Dirección</span>
                    <input type="text" id="cliente-direccion-input" class="cliente-line-input" value="Av. Central N12-45 y Rocafuerte" placeholder="Dirección del cliente" onfocus="window.appState.onInputFocus()">
                </div>
                <div class="cliente-row">
                    <span class="cliente-label">Correo / Email</span>
                    <input type="email" id="cliente-email-input" class="cliente-line-input" value="juanperez@ejemplo.com" placeholder="correo@ejemplo.com" onfocus="window.appState.onInputFocus()">
                </div>
            </div>

            <!-- Principio 9: Dictado por Voz & Principio 10: Escaneo por Gravedad -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin: 10px 0 6px 0; flex-wrap: wrap; gap: 6px;">
                <span style="font-size: 11px; font-weight: 800; color: #475569;">
                    ${mode === 'comerciante' ? 'Renglón de Productos Rápidos:' : 'Detalle de Facturación:'}
                </span>
                <div style="display: flex; gap: 6px; align-items: center;">
                    <label for="scanner-file-input" class="btn-voice-dictate" style="background: #E0F2FE; border-color: #38BDF8; color: #0369A1; cursor: pointer;" title="Subir proforma, factura física o archivo para asentar datos por gravedad">
                        📷 Foto / Proforma
                    </label>
                    <input type="file" id="scanner-file-input" accept="image/*,application/pdf" style="display: none;" onchange="window.appState.handleGravityScan(this)">

                    <button type="button" class="btn-voice-dictate ${emisorData?.isListeningVoice ? 'listening' : ''}" onclick="window.appState.startVoiceDictation('product')">
                        ${emisorData?.isListeningVoice ? '🛑 Detener Dictado' : '🎙️ Dictar Productos'}
                    </button>
                </div>
            </div>

            ${emisorData?.isListeningVoice ? `
                <div class="voice-dictation-banner">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="voice-wave-container">
                            <div class="voice-wave-bar"></div>
                            <div class="voice-wave-bar"></div>
                            <div class="voice-wave-bar"></div>
                            <div class="voice-wave-bar"></div>
                            <div class="voice-wave-bar"></div>
                        </div>
                        <div>
                            <strong style="font-size: 12px; color: #4ADE80;">🎙️ Escuchando... Di en voz alta:</strong>
                            <div style="font-size: 11px; color: #E2E8F0; margin-top: 2px;">
                                ${emisorData?.voiceLiveTranscript ? `"${esc(emisorData.voiceLiveTranscript)}"` : 'Ej: "Cliente Juan Pérez cédula 0928374651 teléfono 0993050689 correo juan@gmail.com" o "2 quintales de café a 45"'}
                            </div>
                            ${emisorData?.detectedVoiceTags && emisorData.detectedVoiceTags.length ? `
                                <div style="display: flex; gap: 4px; margin-top: 4px; flex-wrap: wrap;">
                                    ${emisorData.detectedVoiceTags.map(t => `<span style="background: rgba(56,189,248,0.25); border: 1px solid #38BDF8; color: #BAE6FD; font-size: 10px; font-weight: 700; border-radius: 4px; padding: 1px 6px;">${esc(t)}</span>`).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <button type="button" onclick="window.appState.stopVoiceDictation()" style="background: rgba(255,255,255,0.2); border: none; color: white; border-radius: 6px; padding: 4px 10px; font-size: 11px; cursor: pointer;">
                        ✕ Cerrar
                    </button>
                </div>
            ` : ''}

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
                <div style="display: flex; gap: 8px; justify-content: center; margin-top: 10px; flex-wrap: wrap;">
                    <button type="button" class="mode-chip-btn" style="background: #10B981; border-color: #059669; color: #FFFFFF; font-weight: 700; font-size: 11px; padding: 6px 14px;" onclick="window.appState.shareFacturaWhatsapp()" title="Compartir comprobante actual directamente por WhatsApp">
                        📲 Enviar por WhatsApp
                    </button>
                    <button type="button" class="mode-chip-btn" style="background: #1E293B; border-color: #334155; color: #F8FAFC; font-weight: 700; font-size: 11px; padding: 6px 14px;" onclick="window.print()" title="Imprimir ticket para impresora térmica de rollo 58mm o 80mm">
                        🖨️ Imprimir Ticket POS
                    </button>
                </div>
            </div>

            <!-- Acceso Rápido a Gobernanza y 20 Agentes de Élite (Modo Dueño/Imprenta) -->
            <div style="margin-top: 16px; padding-top: 12px; border-top: 1px dashed #CBD5E1; text-align: center; display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">
                <button type="button" class="mode-chip-btn" style="background: rgba(15, 23, 42, 0.05); border: 1px solid #CBD5E1; color: #475569; font-size: 10px; padding: 4px 10px;" onclick="window.appState.setRole('SUPER_ADMIN')">
                    🏛️ Centro de Mando (20 Agentes de Élite)
                </button>
                <button type="button" class="mode-chip-btn" style="background: rgba(15, 23, 42, 0.05); border: 1px solid #CBD5E1; color: #475569; font-size: 10px; padding: 4px 10px;" onclick="window.appState.setRole('RESELLER')">
                    🏭 Panel Imprenta Aliada
                </button>
            </div>
        </div>

        ${emisorData?.isOnboardingModalOpen ? renderOnboardingModal() : ''}

        ${emisorData?.isScanningGravity ? `
            <div class="scanner-sweep-modal">
                <div class="scanner-laser-box">
                    <div class="scanner-laser-beam"></div>
                    <div style="display: flex; flex-direction: column; height: 100%; align-items: center; justify-content: center; color: #FFFFFF; font-size: 13px; font-weight: 700; text-align: center; padding: 20px;">
                        <div style="font-size: 34px; margin-bottom: 8px;">📷</div>
                        <div style="font-size: 14px; font-weight: 800; color: #38BDF8;">
                            ${emisorData?.scannerStatusText || 'Analizando Cédula / RUC / Proforma (OCR)...'}
                        </div>
                        <div style="width: 85%; background: rgba(255,255,255,0.15); height: 7px; border-radius: 999px; margin-top: 14px; overflow: hidden;">
                            <div style="width: ${emisorData?.scannerProgressPct || 45}%; background: linear-gradient(90deg, #38BDF8, #10B981); height: 100%; transition: width 0.25s ease;"></div>
                        </div>
                    </div>
                </div>
                <h3 style="color: #FFFFFF; font-size: 16px; font-weight: 800; margin-bottom: 4px;">
                    Principio 10: Escaneo por Gravedad con OCR Real
                </h3>
                <p style="color: #94A3B8; font-size: 12px; margin-bottom: 12px;">
                    Extrayendo Cédula, RUC, Nombre, Dirección, Teléfono, Correo y Productos...
                </p>
            </div>
        ` : ''}

        <!-- Modal 3D Experiencia Háptica: Bloc Físico de Facturas (Three.js PBR WebGL) -->
        ${emisorData?.is3DModalOpen ? `
            <div class="modal-backdrop-dark" id="modal-3d-experience" style="position: fixed; inset: 0; z-index: 99999; background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; padding: 16px;">
                <div style="background: #0F172A; border: 1.5px solid #334155; border-radius: 24px; max-width: 720px; width: 100%; overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.75); display: flex; flex-direction: column;">
                    
                    <!-- Header -->
                    <div style="padding: 16px 20px; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; background: #16213E;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 24px;">📐</span>
                            <div>
                                <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: #F8FAFC; font-family: var(--font-sans);">
                                    BLOC FÍSICO 3D — TALONARIO AUTOCOPIATIVO
                                </h3>
                                <p style="margin: 2px 0 0 0; font-size: 11px; color: #94A3B8; font-family: var(--font-sans);">
                                    Arrastra con el dedo o ratón para girar 360° • Papel Marfil & Duplicado Azul
                                </p>
                            </div>
                        </div>
                        <button type="button" onclick="window.appState.close3DExperienceModal()" style="background: rgba(255,255,255,0.08); border: none; color: #94A3B8; font-size: 16px; font-weight: 800; width: 32px; height: 32px; border-radius: 8px; cursor: pointer;">
                            ✕
                        </button>
                    </div>

                    <!-- 3D Viewport Stage -->
                    <div id="talonario-3d-canvas-container" style="width: 100%; height: 440px; position: relative; background: radial-gradient(circle at center, #1E293B 0%, #0F172A 100%);">
                        <div style="position: absolute; top: 12px; left: 16px; z-index: 10; pointer-events: none;">
                            <span style="background: rgba(15,23,42,0.8); border: 1px solid rgba(255,255,255,0.15); color: #FDE68A; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 999px; font-family: monospace;">
                                60 FPS • THREE.JS PBR SHADERS
                            </span>
                        </div>
                        <div style="position: absolute; bottom: 12px; right: 16px; z-index: 10; pointer-events: none;">
                            <span style="background: rgba(15,23,42,0.8); border: 1px solid rgba(255,255,255,0.15); color: #94A3B8; font-size: 10px; padding: 4px 10px; border-radius: 999px;">
                                👆 Arrastra para inclinar o rotar
                            </span>
                        </div>
                    </div>

                    <!-- Footer Controls -->
                    <div style="padding: 14px 20px; border-top: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; background: #0B132B;">
                        <button type="button" onclick="window.appState.reset3DCamera()" style="background: transparent; border: 1px solid #475569; color: #CBD5E1; padding: 8px 14px; border-radius: 10px; font-size: 11px; font-weight: 700; cursor: pointer;">
                            🔄 Centrar Vista
                        </button>
                        <div style="display: flex; gap: 8px;">
                            <button type="button" onclick="window.appState.trigger3DTearAnimation()" style="background: #16A34A; border: none; color: #FFFFFF; padding: 8px 18px; border-radius: 10px; font-size: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 14px rgba(22,163,74,0.35);">
                                <span>✒️ Desprender Hoja (Física 3D)</span>
                            </button>
                            <button type="button" onclick="window.appState.close3DExperienceModal()" style="background: #1E293B; border: 1px solid #475569; color: #F8FAFC; padding: 8px 14px; border-radius: 10px; font-size: 11px; font-weight: 700; cursor: pointer;">
                                Listo
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        ` : ''}
    `;
}
