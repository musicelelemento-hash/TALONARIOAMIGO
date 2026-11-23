/**
 * Componente: FacturadorRealista
 * Réplica fiel del talonario impreso tradicional con soporte para:
 * - Sistema de Modos (Tranquilo  / Comerciante  / Pro )
 * - Chips táctiles de productos rápidos ( Maíz,  Café,  Cacao,  Banano)
 * - Copia Azul Autocopiativa Tradicional del Emisor
 * - Física 3D, Haptic Feedback y Sello SRI Impact
 */

import { renderOnboardingModal } from './OnboardingScreen.js';
import { renderHoyTarjeta } from './HoyResumen.js';
import { palomitasHTML, nivelDeEmision } from './Palomitas.js';
import { ESTILOS, setEstilo } from '../services/estilo.js';

function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderMechanicalOdometer(numStr, isBlueCopy = false) {
    const digits = String(numStr || '000000126').padStart(9, '0').split('');
    const idAttr = isBlueCopy ? 'id="doc-secuencial-blue"' : 'id="doc-secuencial-num"';
    return `
        <div class="numeralia-roja ${isBlueCopy ? 'numeralia-azul' : ''}" ${idAttr} title="Folio N° ${esc(numStr)}">
            ${digits.map((digit, idx) => `
                <span class="odometer-digit-reel" data-pos="${idx}">
                    <span class="odometer-digit-val">${esc(digit)}</span>
                </span>
            `).join('')}
        </div>
    `;
}


// Menú plegable "Más ▾": agrupa todo lo que no es esencial en la cabecera.
const CERRAR_MAS = "this.closest('details').removeAttribute('open')";
function renderMenuMas(items) {
    return `
        <details class="mostrador-menu-mas">
            <summary class="mostrador-mas-summary" aria-label="Más opciones">Más <span aria-hidden="true">▾</span></summary>
            <div class="mostrador-mas-panel">
                ${items.join('')}
            </div>
        </details>
    `;
}
function masItem(label, onclick, extra = '', title = '') {
    return `<button type="button" class="mostrador-mas-item ${extra}" onclick="${onclick}; ${CERRAR_MAS}"${title ? ` title="${title}"` : ''}>${label}</button>`;
}
// Selector de estilo visual (Clásico / Minimalista). Solo cambia la apariencia: el atributo
// <html data-estilo> lo pone setEstilo y el CSS hace el resto, sin recargar. La marca ✓ la pinta
// el CSS según el estilo activo (estilo-minimalista.css), así el menú siempre queda al día.
window.taSetEstilo = (id) => setEstilo(id);
function masEstilos() {
    const items = ESTILOS.map((e) => `<button type="button" class="mostrador-mas-item mostrador-mas-estilo" data-estilo-id="${e.id}" title="${esc(e.descripcion)}" onclick="window.taSetEstilo('${e.id}')">Estilo ${esc(e.nombre)}</button>`);
    return items.join('');
}
function masModos(mode) {
    return ['tranquilo', 'comerciante', 'pro'].map((m) => {
        const label = m.charAt(0).toUpperCase() + m.slice(1);
        return `<button type="button" class="mostrador-mas-item mostrador-mas-modo ${mode === m ? 'active' : ''}" onclick="window.appState.setExperienceMode('${m}')">${mode === m ? '✓ ' : ''}Modo ${label}</button>`;
    }).join('') + masEstilos();
}

// MODO TRANQUILO (A1): wizard de 3 pasos — un botón por pantalla, cero jerga.
// Reutiliza los mismos IDs de inputs que el flujo normal para que la emisión
// (collectEmitPayload / recalculateTotals) siga funcionando sin cambios.
function renderTranquiloWizard(emisorData, docNumStr, isDemo) {
    const step = emisorData?.tranquiloStep || 1;
    const isDemoGuest = !!emisorData?.isDemoGuest;

    return `
        <header class="mostrador-console-header">
            <div class="mostrador-console-left">
                <div class="mostrador-brand-pill">
                    <span class="mostrador-brand-icon">TA</span>
                    <div class="mostrador-brand-texts">
                        <span class="mostrador-brand-title">Talonario Amigo</span>
                        <span class="mostrador-brand-sub">${isDemo ? 'Modo Práctica · no llega al SRI' : 'Emisión Real SRI'}</span>
                    </div>
                </div>
            </div>
            <div class="mostrador-console-right">
                ${isDemoGuest ? `<button type="button" class="mostrador-action-chip mostrador-cta-register" onclick="window.appState.openRegister()">Activar Mi RUC</button>` : ''}
                ${renderMenuMas([masModos('tranquilo')])}
            </div>
        </header>

        <div class="tranquilo-wizard">
            <div class="tranquilo-progreso"><span id="tranquilo-step-indicator">Paso ${step} de 3</span></div>

            <!-- PASO 1 · ¿A quién le facturas? -->
            <section class="tranquilo-paso" id="tranquilo-paso-1" style="display:${step === 1 ? 'block' : 'none'};">
                <h2 class="tranquilo-titulo">¿A quién le facturas?</h2>
                <button type="button" class="tranquilo-boton-grande" onclick="window.appState.tranquiloConsumidorFinal()">
                    <span class="tranquilo-boton-emoji">🛒</span>
                    <span class="tranquilo-boton-texto">Consumidor Final</span>
                    <span class="tranquilo-boton-sub">Sin datos · emite en segundos</span>
                </button>
                <button type="button" class="tranquilo-boton-grande tranquilo-boton-claro" onclick="window.appState.tranquiloMostrarCliente()">
                    <span class="tranquilo-boton-emoji">👤</span>
                    <span class="tranquilo-boton-texto">Otro cliente</span>
                    <span class="tranquilo-boton-sub">Con nombre y cédula / RUC</span>
                </button>

                <div id="tranquilo-cliente-form" style="display:none; margin-top:16px;">
                    <label class="tranquilo-label" for="cliente-nombre-input">Nombre del cliente</label>
                    <input type="text" id="cliente-nombre-input" class="tranquilo-input" placeholder="Nombre completo" onfocus="window.appState.onInputFocus()">
                    <label class="tranquilo-label" for="cliente-ruc-input">Cédula o RUC</label>
                    <input type="text" id="cliente-ruc-input" class="tranquilo-input" placeholder="10 o 13 dígitos" onfocus="window.appState.onInputFocus()">
                    <button type="button" class="tranquilo-continuar" onclick="window.appState.tranquiloContinuar()">Continuar ➔</button>
                </div>

                <!-- Inputs ocultos que el payload de emisión requiere -->
                <input type="hidden" id="cliente-direccion-input" value="">
                <input type="hidden" id="cliente-telefono-input" value="">
                <input type="hidden" id="cliente-email-input" value="">
            </section>

            <!-- PASO 2 · ¿Qué vendiste? -->
            <section class="tranquilo-paso" id="tranquilo-paso-2" style="display:${step === 2 ? 'block' : 'none'};">
                <h2 class="tranquilo-titulo">¿Qué vendiste?</h2>
                <div class="tabla-productos-wrapper">
                    <table class="tabla-realista">
                        <thead>
                            <tr><th style="width:14%;">CANT.</th><th style="width:52%;">DESCRIPCIÓN</th><th style="width:18%;">PRECIO</th><th style="width:16%;">TOTAL</th></tr>
                        </thead>
                        <tbody id="realista-items-body">
                            <tr>
                                <td style="text-align: center;"><input type="number" class="table-input" value="1" oninput="window.appState.recalculateTotals()" onfocus="window.appState.onInputFocus()"></td>
                                <td><input type="text" class="table-input" placeholder="¿Qué vendiste?" onfocus="window.appState.onInputFocus()"></td>
                                <td style="text-align: right;"><input type="number" step="0.01" class="table-input" value="0.00" style="text-align:right;" oninput="window.appState.recalculateTotals()" onfocus="window.appState.onInputFocus()"></td>
                                <td style="text-align: right;" class="row-total">$0.00</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <button type="button" class="tranquilo-agregar" onclick="window.appState.addEmptyRow()">+ Agregar producto</button>
                <div class="tranquilo-total-box">
                    <span>Total a cobrar</span>
                    <span class="tranquilo-total-monto" id="grand-total-display">$0.00</span>
                </div>
                <button type="button" class="tranquilo-continuar" onclick="window.appState.tranquiloContinuar()">Continuar ➔</button>
            </section>

            <!-- PASO 3 · Revisa y emite -->
            <section class="tranquilo-paso" id="tranquilo-paso-3" style="display:${step === 3 ? 'block' : 'none'};">
                <h2 class="tranquilo-titulo">Revisa y emite</h2>
                <div class="tranquilo-resumen">
                    <div class="tranquilo-resumen-fila"><span>Cliente</span><strong id="tranquilo-resumen-cliente">—</strong></div>
                    <div class="tranquilo-resumen-fila"><span>Total</span><strong id="tranquilo-resumen-total">$0.00</strong></div>
                </div>
                <button type="button" class="tranquilo-emitir" onclick="window.appState.executeEmit3DSequence()">✅ Emitir factura ahora</button>
                <button type="button" class="tranquilo-volver" onclick="window.appState.setTranquiloStep(2)">← Volver</button>
            </section>
        </div>

        <!-- Botón flotante "Ayúdame" -->
        <button type="button" class="ayudame-flotante" onclick="window.appState.openHelpWhatsapp()" title="¿Necesitas ayuda? Escríbenos por WhatsApp" aria-label="Ayuda por WhatsApp" style="position: fixed; bottom: 20px; right: 20px; z-index: 9998; display: flex; align-items: center; gap: 8px; background: #25D366; color: #FFFFFF; border: none; border-radius: 999px; padding: 13px 18px; font-size: 14px; font-weight: 800; box-shadow: 0 8px 24px rgba(37,211,102,0.4); cursor: pointer;">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2z"/></svg>
            Ayúdame
        </button>
    `;
}

// PANTALLA "HOY": tarjeta con lo vendido y un solo botón. Se muestra al entrar al mostrador.
export function renderHoy(emisorData, experienceMode, resumen) {
    const isDemo = emisorData?.isDemoMode !== false;
    const mode = experienceMode || 'comerciante';
    const items = [masModos(mode)];
    if (emisorData?.isDemoGuest) items.push(masItem('Salir', 'window.appState.exitDemoMode()', 'mostrador-exit-btn', 'Volver al portal'));
    else items.push(masItem('Mis Tomos', 'window.appState.openTomosModal()', '', 'Historial de tomos encuadernados'));
    return `
        <header class="mostrador-console-header">
            <div class="mostrador-console-left">
                <div class="mostrador-brand-pill">
                    <span class="mostrador-brand-icon">TA</span>
                    <div class="mostrador-brand-texts">
                        <span class="mostrador-brand-title">Talonario Amigo</span>
                        <span class="mostrador-brand-sub">${isDemo ? 'Modo Práctica · no llega al SRI' : 'Emisión Real SRI'}</span>
                    </div>
                </div>
            </div>
            <div class="mostrador-console-right">${renderMenuMas(items)}</div>
        </header>
        <div class="ta-hoy-wrap ${mode === 'tranquilo' ? 'ta-hoy-tranquilo' : ''}">${renderHoyTarjeta(resumen)}</div>`;
}

export function renderFacturadorRealista(emisorData, currentDocNumber, experienceMode = 'comerciante', isShowingBlueCopy = false) {
    const isDemo = emisorData?.isDemoMode !== false;
    const hasSignature = !!emisorData?.hasSignature;
    const isConfigured = !!emisorData?.isConfigured;
    const showRedWarningLine = !isDemo && (!hasSignature || !isConfigured);
    const docNumStr = String(currentDocNumber || 126).padStart(9, '0');
    const mode = experienceMode || 'comerciante';
    const thermalWidth = emisorData?.thermalWidth || '80';

    // Cálculo del estado y grosor del bloc (Principio 16: Hojas apiladas)
    const docNum = parseInt(currentDocNumber || 126, 10);
    const blocStart = 101;
    const blocEnd = 150;
    const totalSheetsInBloc = blocEnd - blocStart + 1; // 50 hojas por bloc
    const currentSheetInBloc = Math.min(Math.max(docNum - blocStart + 1, 1), totalSheetsInBloc);
    const remainingSheets = Math.max(totalSheetsInBloc - currentSheetInBloc, 0);

    const emisor = emisorData?.user?.emisor || emisorData?.emisor || {};
    const nombreEmisor = emisor.razon_social || '';
    const rucEmisor = emisor.ruc || '';
    const actividadEmisor = emisor.nombre_comercial || '';
    const direccionEmisor = emisor.direccion_matriz || '';
    const telefonoEmisor = emisorData?.supportWhatsapp || '';
    const regimenEmisor = emisor.tipo_regimen === 'GENERAL' ? '"RÉGIMEN GENERAL"' : '"CONTRIBUYENTE NEGOCIO POPULAR - RÉGIMEN RIMPE"';
    const docTypeLabel = emisor.tipo_regimen === 'GENERAL' ? 'FACTURA ELECTRÓNICA' : 'NOTA DE VENTA';

    // MODO TRANQUILO (A1): wizard de 3 pasos — un botón por pantalla, cero jerga.
    if (mode === 'tranquilo' && !isShowingBlueCopy) {
        return renderTranquiloWizard(emisorData, docNumStr, isDemo);
    }

    // RENDERIZADO DE LA COPIA AZUL AUTOCOPIATIVA
    if (isShowingBlueCopy) {
        return `
            <div class="mode-switcher-bar">
                <span style="color:#60A5FA; font-size:12px; font-weight:800; padding:6px 12px;">
                     DUPLICADO AUTOCOPIATIVO DEL EMISOR — ARCHIVO TRIBUTARIO
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
                        ${renderMechanicalOdometer(docNumStr, true)}
                        <div class="aut-sri-row" style="color:#1D4ED8;">AUT. S R I: ${esc(emisor.numero_autorizacion || 'PENDIENTE')}</div>
                    </div>
                </div>

                <div style="margin-top: 24px; padding: 18px; border: 1.5px dashed #60A5FA; border-radius: 12px; text-align: center; background: rgba(255,255,255,0.6);">
                    <h3 style="font-size: 16px; font-weight: 800; color: #1E3A8A; margin-bottom: 6px;">
                        ✓ Comprobante Transmitido y Registrado Exitosamente
                    </h3>
                    <p style="margin: 0 0 10px;">${palomitasHTML(nivelDeEmision({ offline: !!emisorData?.lastReceipt?.offline }), !!emisorData?.lastReceipt?.practica)}</p>
                    <p style="font-size: 13px; color: #1D4ED8; margin-bottom: 14px;">
                        Esta copia queda archivada en tu tomo físico digital. Puedes enviarla por WhatsApp al cliente o pasar a la siguiente hoja.
                    </p>
                    <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
                        <button class="btn-whatsapp-direct" style="padding: 10px 20px; font-size: 12px;" onclick="window.appState.shareFacturaWhatsapp()">
                             Enviar Factura al Cliente por WhatsApp
                        </button>
                        <button class="btn-stamp" style="background: #1D4ED8; border-color: #1D4ED8; width: auto; padding: 10px 22px; font-size: 12px;" onclick="window.appState.finishBlueCopyPreview()">
                             Pasar a Nueva Hoja
                        </button>
                        ${emisorData?.isDemoGuest ? `
                            <button type="button" class="btn-stamp" style="background: #10B981; border-color: #10B981; width: auto; padding: 10px 22px; font-size: 12px; color: white; font-weight: 900;" onclick="window.appState.openRegister()">
                                 Configurar Mi RUC y Facturar de Verdad
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // MODO NORMAL (HOJA MARFIL) CON SELECTOR DE EXPERIENCIA
    return `
        <!-- CONSOLA DE MOSTRADOR TABLET UNIFICADA (ESTILO STRIPE / APPLE RESTFUL) -->
        <header class="mostrador-console-header">
            <div class="mostrador-console-left">
                <div class="mostrador-brand-pill">
                    <span class="mostrador-brand-icon">TA</span>
                    <div class="mostrador-brand-texts">
                        <span class="mostrador-brand-title">Talonario Amigo</span>
                        <span class="mostrador-brand-sub">
                            ${isDemo ? 'Modo Práctica · no llega al SRI' : 'Emisión Real SRI'}
                        </span>
                    </div>
                </div>

                <!-- Estado: Práctica / Real (lo único que importa a la vista) -->
                <div class="mostrador-mode-segmented">
                    <button type="button" class="mostrador-seg-btn ${isDemo ? 'active' : ''}" onclick="window.appState.setDemoMode(true)" title="Modo Prueba sin consecuencias fiscales">
                         Práctica
                    </button>
                    <button type="button" class="mostrador-seg-btn ${!isDemo ? 'active-sri' : ''}" onclick="window.appState.setDemoMode(false)" title="Modo Real con emisión al SRI Ecuador">
                         Real SRI
                    </button>
                </div>
            </div>

            <div class="mostrador-console-right">
                ${renderMenuMas(emisorData?.isDemoGuest ? [
                    masModos(mode),
                    masItem('Ejemplo', 'window.appState.loadDemoSampleData()', '', 'Cargar productos de ejemplo'),
                    masItem('Dictar', 'window.appState.toggleVoiceDictation()', '', 'Dictar por voz'),
                    masItem('Foto', "document.getElementById('gravity-file-input')?.click()", '', 'Escanear proforma o cédula'),
                    masItem('Ver en 3D', 'window.appState.open3DExperienceModal()', '', 'Ver y girar bloc en 3D'),
                    masItem('Activar Mi RUC', 'window.appState.openRegister()', 'mostrador-cta-register', 'Crear cuenta para facturar de verdad'),
                    masItem('Salir', 'window.appState.exitDemoMode()', 'mostrador-exit-btn', 'Volver al portal'),
                    `<div class="mostrador-mas-nota" title="Bloc físico de ${totalSheetsInBloc} hojas (${remainingSheets} disponibles)">Hoja ${currentSheetInBloc} de ${totalSheetsInBloc}${emisorData?.offlinePendingCount > 0 ? ` · ${emisorData.offlinePendingCount} en cola` : ''}</div>`,
                ] : [
                    masModos(mode),
                    masItem(emisorData?.audioEnabled !== false ? 'Sonido activado' : 'Sonido apagado', 'window.appState.toggleAudio()', '', 'Activar o silenciar los sonidos'),
                    masItem('Ver en 3D', 'window.appState.open3DExperienceModal()', '', 'Ver y girar el bloc en 3D'),
                    masItem('Mis Tomos', 'window.appState.openTomosModal()', '', 'Historial de tomos encuadernados'),
                    masItem('WhatsApp', 'window.appState.openWhatsappModal()', '', 'Facturar desde tu WhatsApp'),
                    `<div class="mostrador-mas-nota" title="Bloc físico de ${totalSheetsInBloc} hojas (${remainingSheets} disponibles)">Hoja ${currentSheetInBloc} de ${totalSheetsInBloc}${emisorData?.offlinePendingCount > 0 ? ` · ${emisorData.offlinePendingCount} en cola` : ''}</div>`,
                ])}
            </div>
        </header>

        <!-- LÍNEA ROJA PROMINENTE EN MODO REAL (FALTA FIRMA O CONFIGURACIÓN) -->
        ${showRedWarningLine ? `
            <div class="alerta-modo-real-roja" id="alerta-firma-roja">
                <div class="alerta-roja-content">
                    <span class="alerta-roja-icon"></span>
                    <div class="alerta-roja-text">
                        <strong>ATENCIÓN — MODO REAL SRI:</strong> Falta vincular tu <strong>Firma Electrónica (.p12)</strong> o completar configuración tributaria para emitir comprobantes legales.
                    </div>
                </div>
                <button type="button" class="btn-alerta-roja" onclick="window.appState.openOnboardingModal()">
                     Vincular Firma y Configurar (30 seg) ➔
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
                        <label for="business-logo-input" class="logo-cambiar-label" style="cursor: pointer; font-weight: 800; color: #1D4ED8; background: #EBF3FF; border: 1px solid #BFDBFE; white-space: nowrap;">
                             ${emisorData?.businessLogo ? 'Cambiar Logo' : '+ Tu Logo'}
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
                        ${mode === 'pro' ? `SERIE: <select id="pro-serie-select" style="font-family: inherit; font-size: 16px; font-weight: 800; border: none; background: transparent; cursor: pointer;">
                                <option value="001-001">001-001 (Matriz)</option>
                                <option value="001-002">001-002 (Sucursal 1)</option>
                            </select>
                        ` : 'SERIE: 001-001'}
                    </div>
                    ${renderMechanicalOdometer(docNumStr, false)}
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
                    <span>Clientes frecuentes</span>
                </div>
                <div class="frequent-clients-bar">
                    <button type="button" class="frequent-client-chip" onclick="window.appState.selectFrequentClient('Juan Alberto Pérez Gómez', 'Av. Central N12-45 y Rocafuerte', '1712345678')">
                        <span>Juan Pérez</span>
                        <span class="frequent-client-badge">14 compras</span>
                    </button>
                    <button type="button" class="frequent-client-chip" onclick="window.appState.selectFrequentClient('María Elena Loor', 'Barrio Las Peñas y Malecón', '0928374651')">
                        <span>María Loor</span>
                        <span class="frequent-client-badge">8 compras</span>
                    </button>
                    <button type="button" class="frequent-client-chip" onclick="window.appState.selectFrequentClient('Ab. Carlos Zambrano', 'Edif. La Previsora Of. 402', '0704938291')">
                        <span>Carlos Zambrano</span>
                        <span class="frequent-client-badge">22 compras</span>
                    </button>
                    <button type="button" class="frequent-client-chip" onclick="window.appState.selectFrequentClient('Consumidor Final', 'Sin dirección', '9999999999999')">
                        <span>Consumidor Final</span>
                    </button>
                </div>
            </div>

            <!-- Sección Datos del Cliente Receptor con Efecto Escritura Analógica -->
            <div class="cliente-seccion">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 6px;">
                    <span class="seccion-etiqueta" style="font-weight: 800; color: #1E293B;">
                        Datos del Cliente Receptor
                    </span>
                    <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                        <button type="button" class="btn-voice-dictate" style="background: #10B981; border-color: #059669; color: #FFFFFF; font-weight: 800;" onclick="window.appState.selectFrequentClient('CONSUMIDOR FINAL', 'Ecuador', '9999999999999')" title="Llenar instantáneamente como Consumidor Final ($0 a $50)">
                             Consumidor Final
                        </button>
                        <label for="scanner-camera-input" class="btn-voice-dictate" style="background: #FEF3C7; border-color: #F59E0B; color: #B45309; cursor: pointer;" title="Tomar foto con cámara de la tablet/móvil a la Cédula o RUC">
                             Foto Cédula / RUC
                        </label>
                        <input type="file" id="scanner-camera-input" accept="image/*" capture="environment" style="display: none;" onchange="window.appState.handleGravityScan(this)">

                        <button type="button" class="btn-voice-dictate ${emisorData?.isListeningVoice ? 'listening' : ''}" style="background: #F0FDF4; border-color: #86EFAC; color: #15803D;" onclick="window.appState.startVoiceDictation('client')">
                             Dictar Cliente
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
                    <span class="cliente-label" style="margin-left: 6px;">Teléfono</span>
                    <input type="text" id="cliente-telefono-input" class="cliente-line-input" style="max-width: 130px;" placeholder="099..." onfocus="window.appState.onInputFocus()">
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
                <span class="seccion-etiqueta" style="font-weight: 800; color: #475569;">
                    ${mode === 'comerciante' ? 'Renglón de Productos Rápidos:' : 'Detalle de Facturación:'}
                </span>
                <div style="display: flex; gap: 6px; align-items: center;">
                    <label for="scanner-file-input" class="btn-voice-dictate" style="background: #E0F2FE; border-color: #38BDF8; color: #0369A1; cursor: pointer;" title="Subir proforma, factura física o archivo para asentar datos por gravedad">
                         Foto / Proforma
                    </label>
                    <input type="file" id="scanner-file-input" accept="image/*,application/pdf" style="display: none;" onchange="window.appState.handleGravityScan(this)">

                    <button type="button" class="btn-voice-dictate ${emisorData?.isListeningVoice ? 'listening' : ''}" onclick="window.appState.startVoiceDictation('product')">
                        ${emisorData?.isListeningVoice ? 'Detener Dictado' : 'Dictar Productos'}
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
                            <strong style="font-size: 12px; color: #4ADE80;">Escuchando... Di en voz alta:</strong>
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
                    <span class="seccion-etiqueta" style="font-weight:800; color:#475569; align-self:center; margin-right:4px;">Rápidos:</span>
                    <button type="button" class="quick-product-chip" onclick="window.appState.addQuickProduct('Quintal de Maíz', 18.50)">Maíz ($18.50)</button>
                    <button type="button" class="quick-product-chip" onclick="window.appState.addQuickProduct('Quintal de Café', 45.00)">Café ($45.00)</button>
                    <button type="button" class="quick-product-chip" onclick="window.appState.addQuickProduct('Quintal de Cacao Fino', 60.00)">Cacao ($60.00)</button>
                    <button type="button" class="quick-product-chip" onclick="window.appState.addQuickProduct('Caja de Banano', 6.50)">Banano ($6.50)</button>
                    <button type="button" class="quick-product-chip" onclick="window.appState.addEmptyRow()">+ Fila</button>
                </div>
            ` : ''}

            <!-- Tabla de Detalle con Inputs Interactivos -->
            <div class="tabla-productos-wrapper">
                <table class="tabla-realista">
                    <thead>
                        <tr>
                            <th style="width: 10%;">CANT.</th>
                            <th style="width: 58%;">D E S C R I P C I Ó N</th>
                            <th style="width: 16%;">P. UNITARIO</th>
                            <th style="width: 16%;">PRECIO TOTAL</th>
                        </tr>
                    </thead>
                    <tbody id="realista-items-body">
                        <tr>
                            <td style="text-align: center;"><input type="number" class="table-input table-input-qty" value="1" oninput="window.appState.recalculateTotals()" onfocus="window.appState.onInputFocus()"></td>
                            <td><input type="text" class="table-input" value="Quintal de Arroz Flor Especial" onfocus="window.appState.onInputFocus()"></td>
                            <td style="text-align: right;"><input type="number" step="0.01" class="table-input table-input-price" value="42.00" style="text-align:right;" oninput="window.appState.recalculateTotals()" onfocus="window.appState.onInputFocus()"></td>
                            <td style="text-align: right; padding-right: 10px;" class="row-total">$42.00</td>
                        </tr>
                        <tr>
                            <td style="text-align: center;"><input type="number" class="table-input table-input-qty" value="2" oninput="window.appState.recalculateTotals()" onfocus="window.appState.onInputFocus()"></td>
                            <td><input type="text" class="table-input" value="Aceite Palma de Oro 1 Litro" onfocus="window.appState.onInputFocus()"></td>
                            <td style="text-align: right;"><input type="number" step="0.01" class="table-input table-input-price" value="3.50" style="text-align:right;" oninput="window.appState.recalculateTotals()" onfocus="window.appState.onInputFocus()"></td>
                            <td style="text-align: right; padding-right: 10px;" class="row-total">$7.00</td>
                        </tr>
                        <tr>
                            <td style="text-align: center;"><input type="number" class="table-input table-input-qty" value="5" oninput="window.appState.recalculateTotals()" onfocus="window.appState.onInputFocus()"></td>
                            <td><input type="text" class="table-input" value="Azúcar San Carlos 1 Kg" onfocus="window.appState.onInputFocus()"></td>
                            <td style="text-align: right;"><input type="number" step="0.01" class="table-input table-input-price" value="1.10" style="text-align:right;" oninput="window.appState.recalculateTotals()" onfocus="window.appState.onInputFocus()"></td>
                            <td style="text-align: right; padding-right: 10px;" class="row-total">$5.50</td>
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

            <!-- Total a cobrar (siempre visible) -->
            <div class="footer-grid footer-grid-solo-total">
                <div class="total-cobrar-box">
                    <div class="total-cobrar-header">TOTAL A COBRAR <span style="font-size:14px;">➔</span></div>
                    <div class="total-cobrar-monto" id="grand-total-display">$54.50</div>
                </div>
            </div>

            <!-- Firmas de Conformidad -->
            <div class="firmas-row">
                <div class="firma-col">RECIBÍ CONFORME</div>
                <div class="firma-col">ENTREGUE CONFORME</div>
            </div>

            <!-- Botón Acción Enviar SRI con Animaciones AAA -->
            <div style="margin-top: 18px;">
                <button class="btn-stamp-action" onclick="window.appState.executeEmit3DSequence()">
                     Emitir factura ahora
                </button>
            </div>

            <!-- Lo opcional, plegado al final -->
            <details class="mas-opciones">
                <summary class="mas-opciones-summary">Más opciones <span class="mas-opciones-flecha" aria-hidden="true">▸</span></summary>
                <div class="mas-opciones-cuerpo">
                    <div class="forma-pago-box">
                        <div class="forma-pago-header">Forma de pago</div>
                        <div class="pago-checkboxes">
                            <label class="pago-item" onclick="window.appState.triggerHaptic(15)"><input type="checkbox" checked>Efectivo</label>
                            <label class="pago-item" onclick="window.appState.triggerHaptic(15)"><input type="checkbox">Electrónico</label>
                            <label class="pago-item" onclick="window.appState.triggerHaptic(15)"><input type="checkbox">Tarjeta crédito o débito</label>
                            <label class="pago-item" onclick="window.appState.triggerHaptic(15)"><input type="checkbox">Otros</label>
                        </div>
                    </div>
                    <div class="cliente-row mas-opciones-guia">
                        <label class="cliente-label" for="cliente-guia-input">Guía de remisión</label>
                        <input type="text" id="cliente-guia-input" class="cliente-line-input" placeholder="Opcional" onfocus="window.appState.onInputFocus()">
                    </div>
                    <div class="mas-opciones-acciones">
                        <button type="button" class="mode-chip-btn mas-opciones-btn mas-opciones-wa" onclick="window.appState.shareFacturaWhatsapp()" title="Compartir comprobante actual directamente por WhatsApp">
                             Enviar por WhatsApp
                        </button>
                        <button type="button" class="mode-chip-btn mas-opciones-btn mas-opciones-ticket" onclick="window.appState.printThermalTicket()" title="Imprimir ticket para impresora térmica de rollo 58mm o 80mm">
                             Imprimir ticket
                        </button>
                        <span class="mas-opciones-rollo" title="Ancho del rollo de la impresora térmica">
                            <button type="button" class="mas-opciones-rollo-btn ${thermalWidth === '58' ? 'active' : ''}" onclick="window.appState.setThermalWidth(58)">58 mm</button>
                            <button type="button" class="mas-opciones-rollo-btn ${thermalWidth === '80' ? 'active' : ''}" onclick="window.appState.setThermalWidth(80)">80 mm</button>
                        </span>
                    </div>
                </div>
            </details>
        </div>

        ${emisorData?.isOnboardingModalOpen ? renderOnboardingModal() : ''}

        ${emisorData?.isScanningGravity ? `
            <div class="scanner-sweep-modal">
                <div class="scanner-laser-box">
                    <div class="scanner-laser-beam"></div>
                    <div style="display: flex; flex-direction: column; height: 100%; align-items: center; justify-content: center; color: #FFFFFF; font-size: 13px; font-weight: 700; text-align: center; padding: 20px;">
                        <div style="margin-bottom: 8px; color: #38BDF8;">
                            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8V5a1 1 0 0 1 1-1h3"/><path d="M16 4h3a1 1 0 0 1 1 1v3"/><path d="M20 16v3a1 1 0 0 1-1 1h-3"/><path d="M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M3 12h18"/></svg>
                        </div>
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
                            <span style="color: #38BDF8; display: inline-flex;">
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2V5z"/><path d="M8 3v18"/><path d="M12 7h4M12 11h4"/></svg>
                            </span>
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
                                 Arrastra para inclinar o rotar
                            </span>
                        </div>
                    </div>

                    <!-- Footer Controls -->
                    <div style="padding: 14px 20px; border-top: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; background: #0B132B;">
                        <button type="button" onclick="window.appState.reset3DCamera()" style="background: transparent; border: 1px solid #475569; color: #CBD5E1; padding: 8px 14px; border-radius: 10px; font-size: 11px; font-weight: 700; cursor: pointer;">
                             Centrar Vista
                        </button>
                        <div style="display: flex; gap: 8px;">
                            <button type="button" onclick="window.appState.trigger3DTearAnimation()" style="background: #16A34A; border: none; color: #FFFFFF; padding: 8px 18px; border-radius: 10px; font-size: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 14px rgba(22,163,74,0.35);">
                                <span>Desprender Hoja (Física 3D)</span>
                            </button>
                            <button type="button" onclick="window.appState.close3DExperienceModal()" style="background: #1E293B; border: 1px solid #475569; color: #F8FAFC; padding: 8px 14px; border-radius: 10px; font-size: 11px; font-weight: 700; cursor: pointer;">
                                Listo
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        ` : ''}

        <!-- Botón flotante "Ayúdame" (A5): WhatsApp humano a un toque desde el mostrador -->
        <button type="button" class="ayudame-flotante" onclick="window.appState.openHelpWhatsapp()" title="¿Necesitas ayuda? Escríbenos por WhatsApp" aria-label="Ayuda por WhatsApp" style="position: fixed; bottom: 20px; right: 20px; z-index: 9998; display: flex; align-items: center; gap: 8px; background: #25D366; color: #FFFFFF; border: none; border-radius: 999px; padding: 13px 18px; font-size: 14px; font-weight: 800; box-shadow: 0 8px 24px rgba(37,211,102,0.4); cursor: pointer;">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.11c-1.49 0-2.95-.4-4.22-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.54-3.7 8.24-8.24 8.24z"/><path d="M17.5 13.87c-.27-.13-1.58-.78-1.83-.87-.25-.09-.42-.13-.6.13-.18.27-.69.87-.85 1.05-.15.18-.31.2-.58.07-.27-.13-1.12-.41-2.13-1.31-.79-.7-1.32-1.56-1.47-1.83-.15-.27-.02-.42.12-.55.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.13-.6-1.44-.82-1.97-.21-.52-.43-.45-.6-.45-.15-.01-.33-.01-.51-.01-.18 0-.47.07-.72.34-.25.27-.95.93-.95 2.26s.97 2.62 1.1 2.8c.13.18 1.9 2.9 4.6 4.07.64.28 1.14.44 1.53.57.64.2 1.23.17 1.69.1.52-.08 1.58-.65 1.8-1.27.22-.62.22-1.15.16-1.27-.07-.12-.25-.18-.52-.31z"/></svg>
            Ayúdame
        </button>
    `;
}
