import '../ideas.css';

/**
 * Palomitas de estado, como en WhatsApp.
 *  nivel 1  ✓   guardada en el teléfono / esperando señal para enviarse
 *  nivel 2  ✓✓  aceptada por el SRI (en Modo Práctica: "Práctica")
 *  nivel 3  ✓✓  el cliente la recibió. Preparado, pero NO se usa todavía (aún no existe el envío del PDF).
 */
export function infoPalomitas(nivel, practica = false) {
    if (nivel >= 3) return { marca: '✓✓', texto: 'El cliente la recibió', clase: 'ta-pal-3' };
    if (nivel === 2) {
        return practica
            ? { marca: '✓✓', texto: 'Práctica: no llegó al SRI', clase: 'ta-pal-2 ta-pal-practica' }
            : { marca: '✓✓', texto: 'Aceptada por el SRI', clase: 'ta-pal-2' };
    }
    return { marca: '✓', texto: 'Guardada, falta enviarla al SRI', clase: 'ta-pal-1' };
}

export function nivelDeEmision({ offline = false } = {}) {
    return offline ? 1 : 2;
}

function escHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** HTML para plantillas (lista de tomos, facturador). */
export function palomitasHTML(nivel, practica = false) {
    const i = infoPalomitas(nivel, practica);
    return `<span class="ta-pal ${i.clase}" role="img" aria-label="${escHtml(i.texto)}"><span class="ta-pal-marca" aria-hidden="true">${i.marca}</span><span class="ta-pal-txt" aria-hidden="true">${escHtml(i.texto)}</span></span>`;
}

/** Elemento DOM para el chat. */
export function crearPalomitas(nivel, practica = false) {
    const i = infoPalomitas(nivel, practica);
    const el = document.createElement('span');
    el.className = `ta-pal ${i.clase}`;
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', i.texto);
    const m = document.createElement('span');
    m.className = 'ta-pal-marca';
    m.setAttribute('aria-hidden', 'true');
    m.textContent = i.marca;
    const t = document.createElement('span');
    t.className = 'ta-pal-txt';
    t.setAttribute('aria-hidden', 'true');
    t.textContent = i.texto;
    el.append(m, t);
    return el;
}
