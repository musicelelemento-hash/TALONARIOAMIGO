/**
 * Componente: WhatsAppModal
 * "Facturar por WhatsApp": conecta el número del comerciante con el bot usando un código
 * de un solo uso. Lenguaje simple, un paso por pantalla, botón grande.
 */

function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const VERDE = '#25D366';

function boton(label, onclick, { fondo = '#0F172A', color = '#FFFFFF' } = {}) {
    return `<button type="button" onclick="${onclick}" style="width: 100%; border: none; border-radius: 14px; padding: 16px; font-size: 16px; font-weight: 800; cursor: pointer; background: ${fondo}; color: ${color};">${label}</button>`;
}

function contenido(info) {
    if (!info || info.cargando) {
        return `<p style="text-align: center; color: #64748B; font-size: 15px; padding: 24px 0;">Cargando…</p>`;
    }

    if (info.error) {
        return `
            <p style="color: #B91C1C; font-size: 15px; line-height: 1.5;">${esc(info.error)}</p>
            ${boton('Intentar de nuevo', 'window.appState.openWhatsappModal()')}
        `;
    }

    if (info.vinculado) {
        return `
            <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 14px; padding: 16px; margin-bottom: 16px;">
                <p style="margin: 0; font-size: 16px; font-weight: 800; color: #166534;">✅ Tu WhatsApp está conectado</p>
                <p style="margin: 6px 0 0; font-size: 14px; color: #166534;">Número: ${esc(info.numero)}</p>
            </div>
            <p style="font-size: 15px; color: #334155; line-height: 1.5; margin: 0 0 8px;">Escríbele al bot tu factura como la dirías en voz alta:</p>
            <pre style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px; font-size: 14px; white-space: pre-wrap; margin: 0 0 16px; font-family: inherit;">Factura a Juan Pérez 0912345678
2 colas a 0.50
1 pan a 0.25</pre>
            <p style="font-size: 13px; color: #64748B; margin: 0 0 16px;">Te muestra el total y solo la emite cuando respondes <strong>SI</strong>.</p>
            ${info.bot_number ? `<div style="margin-bottom: 10px;">${boton('Abrir WhatsApp', `window.open('https://wa.me/${esc(info.bot_number)}', '_blank')`, { fondo: VERDE })}</div>` : ''}
            ${boton('Desconectar este número', 'window.appState.desvincularWhatsapp()', { fondo: '#F1F5F9', color: '#475569' })}
        `;
    }

    if (info.codigo) {
        return `
            <p style="font-size: 15px; color: #334155; line-height: 1.5; margin: 0 0 12px;">Toca el botón verde y <strong>envía el mensaje tal cual</strong> desde tu WhatsApp:</p>
            <div style="text-align: center; background: #F8FAFC; border: 2px dashed #CBD5E1; border-radius: 14px; padding: 18px; margin-bottom: 16px;">
                <div style="font-size: 13px; color: #64748B; margin-bottom: 4px;">Tu mensaje</div>
                <div style="font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #0F172A;">${esc(info.mensaje)}</div>
                <div style="font-size: 12px; color: #94A3B8; margin-top: 6px;">Vence en ${esc(info.expira_en_minutos)} minutos</div>
            </div>
            ${info.link
                ? `<div style="margin-bottom: 10px;">${boton('Enviar por WhatsApp', `window.open('${esc(info.link)}', '_blank')`, { fondo: VERDE })}</div>`
                : `<p style="font-size: 13px; color: #B45309; margin: 0 0 10px;">Envía ese mensaje al número de Talonario Amigo que te dio tu imprenta.</p>`}
            ${boton('Ya lo envié', 'window.appState.openWhatsappModal()', { fondo: '#F1F5F9', color: '#0F172A' })}
        `;
    }

    return `
        <p style="font-size: 16px; color: #334155; line-height: 1.5; margin: 0 0 8px;">Factura desde tu WhatsApp, sin abrir la app.</p>
        <ul style="font-size: 15px; color: #475569; line-height: 1.7; padding-left: 20px; margin: 0 0 18px;">
            <li>Escribes la venta como la dirías.</li>
            <li>Te mostramos el total.</li>
            <li>Respondes <strong>SI</strong> y queda lista en el SRI.</li>
        </ul>
        ${boton('Conectar mi WhatsApp', 'window.appState.generarCodigoWhatsapp()', { fondo: VERDE })}
    `;
}

export function renderWhatsAppModal(info) {
    return `
        <div style="position: fixed; inset: 0; background: rgba(15,23,42,0.85); backdrop-filter: blur(8px); z-index: 9999; display: flex; justify-content: center; align-items: center; padding: 16px;" onclick="if(event.target === this) window.appState.closeWhatsappModal()">
            <div role="dialog" aria-modal="true" aria-labelledby="wa-modal-title" style="background: #FFFFFF; border-radius: 20px; width: 100%; max-width: 420px; max-height: 90vh; overflow-y: auto; padding: 22px; box-shadow: 0 24px 60px rgba(0,0,0,0.35);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                    <h2 id="wa-modal-title" style="margin: 0; font-size: 20px; font-weight: 900; color: #0F172A;">Facturar por WhatsApp</h2>
                    <button type="button" onclick="window.appState.closeWhatsappModal()" aria-label="Cerrar" style="background: #E2E8F0; border: none; border-radius: 999px; width: 34px; height: 34px; font-weight: 900; font-size: 15px; cursor: pointer; color: #475569;">✕</button>
                </div>
                ${contenido(info)}
            </div>
        </div>
    `;
}
