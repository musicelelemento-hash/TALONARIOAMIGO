/**
 * Componente: ThermalTicket (Agente 22 — POS Thermal Receipt Architect)
 * Genera un ticket térmico ESC/POS de rollo continuo (58mm / 80mm) con:
 * - Encabezado del emisor (razón social, RUC, régimen, dirección).
 * - Clave de acceso de 49 dígitos compacta y fecha/hora de emisión.
 * - Detalle de productos monospaced de alto contraste.
 * - Desglose de subtotales y total a cobrar.
 * - Código QR oficial SRI (claveAcceso|tipoComprobante|rucEmisor|ambiente|fecha|total).
 *
 * El ticket vive en un contenedor oculto en pantalla (#thermal-ticket-receipt)
 * y solo se hace visible durante la impresión (@media print), manteniendo el
 * papel marfil táctil como protagonista en la vista del comerciante.
 */
import QRCode from 'qrcode';

const TICKET_ID = 'thermal-ticket-receipt';
const WIDTH_KEY = 'ta_thermal_width';

function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function toNumber(value) {
    const n = parseFloat(String(value ?? '').replace(/[^0-9.-]/g, ''));
    return isNaN(n) ? 0 : n;
}

function money(value) {
    return '$' + toNumber(value).toFixed(2);
}

function cleanClave(clave) {
    return String(clave ?? '').replace(/[\s-]+/g, '');
}

/**
 * Construye el contenido del QR según la especificación del SRI Ecuador:
 * claveAcceso|tipoComprobante|rucEmisor|ambiente|fechaEmision(dd/mm/aaaa)|total
 * Los segmentos se extraen de la propia clave de acceso cuando está completa.
 */
export function buildSriQrContent(claveAcceso, total) {
    const clave = cleanClave(claveAcceso);
    if (!clave) return '';

    const tipoComprobante = clave.length >= 10 ? clave.substring(8, 10) : '01';
    const rucEmisor = clave.length >= 23 ? clave.substring(10, 23) : '';
    const ambiente = clave.length >= 24 ? clave.substring(23, 24) : '2';
    const fechaRaw = clave.length >= 8 ? clave.substring(0, 8) : '';
    const fechaEmision = fechaRaw.length === 8
        ? `${fechaRaw.substring(0, 2)}/${fechaRaw.substring(2, 4)}/${fechaRaw.substring(4, 8)}`
        : '';
    const totalStr = toNumber(total).toFixed(2);

    return [clave, tipoComprobante, rucEmisor, ambiente, fechaEmision, totalStr].join('|');
}

/** Formatea la clave de 49 dígitos en los segmentos oficiales para legibilidad. */
function formatClave(claveAcceso) {
    const clave = cleanClave(claveAcceso);
    if (clave.length !== 49) return clave;
    return [
        clave.substring(0, 8),   // fecha ddmmaaaa
        clave.substring(8, 10),  // tipo comprobante
        clave.substring(10, 23), // RUC emisor
        clave.substring(23, 24), // ambiente
        clave.substring(24, 30), // serie (estab + punto)
        clave.substring(30, 39), // secuencial
        clave.substring(39, 47), // código numérico
        clave.substring(47, 48), // tipo emisión
        clave.substring(48, 49), // dígito verificador
    ].join(' ');
}

/** Lee los renglones vivos de la tabla de productos (o cae al último recibo emitido). */
function collectItems(fallbackItems) {
    const rows = document.querySelectorAll('#realista-items-body tr');
    const items = [];
    rows.forEach((row) => {
        const inputs = row.querySelectorAll('input');
        if (inputs.length < 3) return;
        const cantidad = toNumber(inputs[0].value);
        const descripcion = (inputs[1].value || '').trim();
        const precioUnitario = toNumber(inputs[2].value);
        if (!descripcion || !cantidad) return;
        items.push({ descripcion, cantidad, precioUnitario, total: cantidad * precioUnitario });
    });

    if (items.length === 0 && Array.isArray(fallbackItems)) {
        fallbackItems.forEach((it) => {
            const cantidad = toNumber(it.cantidad);
            const precioUnitario = toNumber(it.precioUnitario);
            if (!it.descripcion || !cantidad) return;
            items.push({ descripcion: it.descripcion, cantidad, precioUnitario, total: cantidad * precioUnitario });
        });
    }
    return items;
}

export function getThermalWidth() {
    try {
        return localStorage.getItem(WIDTH_KEY) === '58' ? '58' : '80';
    } catch (_e) {
        return '80';
    }
}

export function setThermalWidth(mm) {
    const val = mm === 58 ? '58' : '80';
    try {
        localStorage.setItem(WIDTH_KEY, val);
    } catch (_e) { /* cuota de localStorage */ }
    const el = document.getElementById(TICKET_ID);
    if (el) el.setAttribute('data-width', val);
    return val;
}

export function renderThermalTicketHtml(data) {
    const line = '<div class="tt-line">' + '─'.repeat(32) + '</div>';
    const docType = esc(data.docTypeLabel || 'NOTA DE VENTA');
    const serie = esc(data.serie || '001-001');
    const secuencial = esc(data.secuencial || '000000000');
    const clave = cleanClave(data.claveAcceso);
    const items = data.items || [];

    const itemsHtml = items.map((it) => `
        <div class="tt-row">
            <span class="tt-qty">${esc(Number(it.cantidad).toFixed(2))}</span>
            <span class="tt-desc">${esc(it.descripcion)}</span>
            <span class="tt-amt">${money(it.total)}</span>
        </div>
    `).join('');

    const qrHtml = data.qrDataUrl
        ? `<img class="tt-qr" src="${data.qrDataUrl}" alt="QR SRI">`
        : `<div class="tt-qr-placeholder">QR SRI<br>${clave ? esc(clave.slice(0, 20)) + '…' : 'no disponible'}</div>`;

    return `
        <div class="tt-receipt" data-width="${esc(data.width || '80')}">
            <div class="tt-center tt-bold tt-big">${esc(data.emisorNombre || 'TALONARIO AMIGO')}</div>
            ${data.emisorActividad ? `<div class="tt-center">${esc(data.emisorActividad)}</div>` : ''}
            <div class="tt-center">RUC: ${esc(data.rucEmisor || '')}</div>
            ${data.regimen ? `<div class="tt-center">${esc(data.regimen)}</div>` : ''}
            ${data.emisorDireccion ? `<div class="tt-center">${esc(data.emisorDireccion)}</div>` : ''}
            ${data.telefonoEmisor ? `<div class="tt-center">Telf: ${esc(data.telefonoEmisor)}</div>` : ''}
            ${line}
            <div class="tt-center tt-bold">${docType}</div>
            <div class="tt-center">${serie}-${secuencial}</div>
            <div class="tt-center">FECHA: ${esc(data.fechaEmision)}</div>
            ${data.clienteNombre ? `
            <div class="tt-center">CLIENTE: ${esc(data.clienteNombre)}</div>` : ''}
            ${data.clienteIdentificacion ? `
            <div class="tt-center">RUC/CI: ${esc(data.clienteIdentificacion)}</div>` : ''}
            ${line}
            <div class="tt-row tt-header">
                <span class="tt-qty">CANT</span>
                <span class="tt-desc">DESCRIPCION</span>
                <span class="tt-amt">TOTAL</span>
            </div>
            ${itemsHtml || '<div class="tt-center">(sin productos)</div>'}
            ${line}
            <div class="tt-row"><span class="tt-desc">SUBTOTAL</span><span class="tt-amt">${money(data.subtotal)}</span></div>
            ${data.iva && toNumber(data.iva) > 0 ? `<div class="tt-row"><span class="tt-desc">IVA 15%</span><span class="tt-amt">${money(data.iva)}</span></div>` : ''}
            <div class="tt-row tt-total"><span class="tt-desc">TOTAL A PAGAR</span><span class="tt-amt">${money(data.total)}</span></div>
            ${line}
            ${clave ? `
            <div class="tt-center tt-bold">CLAVE DE ACCESO</div>
            <div class="tt-clave">${esc(formatClave(clave))}</div>` : ''}
            <div class="tt-qr-wrap">${qrHtml}</div>
            ${data.numeroAutorizacion ? `
            <div class="tt-center">AUT. SRI: ${esc(data.numeroAutorizacion)}</div>` : ''}
            ${line}
            <div class="tt-center tt-bold">¡Gracias por su preferencia!</div>
            <div class="tt-center">Comprobante electrónico autorizado por el SRI</div>
        </div>
    `;
}

/**
 * Orquesta la impresión del ticket térmico:
 * recoge datos en vivo del talonario, genera el QR y lanza window.print().
 */
export async function printThermalTicket(state) {
    const emisor = state?.user?.emisor || state?.emisor || {};
    const rc = state?.lastReceipt || {};

    const tipoRegimen = emisor.tipo_regimen === 'GENERAL' ? 'GENERAL' : 'RIMPE';
    const docTypeLabel = tipoRegimen === 'GENERAL' ? 'FACTURA ELECTRÓNICA' : 'NOTA DE VENTA';
    const regimen = tipoRegimen === 'GENERAL'
        ? 'RÉGIMEN GENERAL'
        : 'CONTRIBUYENTE NEGOCIO POPULAR - RÉGIMEN RIMPE';

    const items = collectItems(rc.items);
    const subtotal = items.reduce((acc, it) => acc + it.total, 0);
    const totalText = document.getElementById('grand-total-display')?.innerText || rc.total || '';
    const total = totalText ? toNumber(totalText) : subtotal;

    const secuencial = String(rc.secuencial || state?.currentDocNumber || 126).padStart(9, '0');
    const claveAcceso = rc.claveAcceso || '';

    const now = new Date();
    const fechaEmision = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const qrContent = buildSriQrContent(claveAcceso, total);
    let qrDataUrl = '';
    if (qrContent) {
        try {
            qrDataUrl = await QRCode.toDataURL(qrContent, { margin: 1, width: 240, errorCorrectionLevel: 'M' });
        } catch (_e) { /* sin QR si falla la generación */ }
    }

    const html = renderThermalTicketHtml({
        emisorNombre: emisor.razon_social || '',
        emisorActividad: emisor.nombre_comercial || '',
        rucEmisor: emisor.ruc || '',
        regimen,
        emisorDireccion: emisor.direccion_matriz || '',
        telefonoEmisor: emisor.telefono || state?.supportWhatsapp || '',
        docTypeLabel,
        serie: '001-001',
        secuencial,
        fechaEmision,
        clienteNombre: rc.cliente?.nombre || '',
        clienteIdentificacion: rc.cliente?.identificacion || '',
        items,
        subtotal,
        total,
        claveAcceso,
        numeroAutorizacion: rc.numeroAutorizacion || emisor.numero_autorizacion || '',
        qrDataUrl,
        width: getThermalWidth(),
    });

    let el = document.getElementById(TICKET_ID);
    if (!el) {
        el = document.createElement('div');
        el.id = TICKET_ID;
        el.className = 'thermal-ticket-root';
        document.body.appendChild(el);
    }
    el.innerHTML = html;
    el.setAttribute('data-width', getThermalWidth());

    // Espera un instante a que la imagen del QR decodifique antes de imprimir.
    return new Promise((resolve) => {
        requestAnimationFrame(() => {
            setTimeout(() => {
                window.print();
                resolve(true);
            }, 80);
        });
    });
}
