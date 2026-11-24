import '../ideas.css';

import { infoPalomitas, nivelDeEmision } from '../services/palomitasLogica.js';

export { infoPalomitas, nivelDeEmision };

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
