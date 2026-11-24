/**
 * Modo Caja: pantalla de mostrador para tablet horizontal (como una caja registradora).
 * Izquierda: productos frecuentes (un toque suma 1). Derecha: la factura en curso y un solo botón.
 * No emite por su cuenta: llama a app.emitirDesdeCaja(), que usa el mismo flujo de siempre
 * (cuenta de Deshacer + emitirPayload). Los totales vienen de calcularTotales vía cajaLogica.js.
 */
import '../caja.css';
import {
    sumarProducto, fijarCantidad, cantidadDe, totalesCaja, aPayload, avisoConsumidorFinal,
    productosDeCaja, guardarProductoNuevo, registrarUsoProductos, clientesFrecuentes, recordarCliente,
    esConsumidorFinal, CLIENTE_CONSUMIDOR_FINAL,
} from '../services/cajaLogica.js';

const PULSACION_LARGA_MS = 550;

function esc(v) {
    return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function money(n) { return '$' + Number(n || 0).toFixed(2); }

export function estadoCajaInicial() {
    return { lineas: [], cliente: CLIENTE_CONSUMIDOR_FINAL, panel: null, emitiendo: false };
}

function htmlProductos(c) {
    const prods = productosDeCaja();
    const tiles = prods.map((p) => {
        const n = cantidadDe(c.lineas, p.id);
        return `<div class="caja-prod-wrap">
            <button type="button" class="caja-prod" data-acc="sumar" data-id="${esc(p.id)}" aria-label="Sumar ${esc(p.corto || p.nombre)}, ${money(p.precio)}${n ? `. Llevas ${n}` : ''}">
                <span class="caja-prod-nombre">${esc(p.corto || p.nombre)}</span>
                <span class="caja-prod-precio">${money(p.precio)}</span>
            </button>
            ${n ? `<button type="button" class="caja-chip-cant" data-acc="cantidad" data-id="${esc(p.id)}" aria-label="Cambiar cantidad de ${esc(p.corto || p.nombre)}: ${n}">${n}</button>` : ''}
        </div>`;
    }).join('');
    return `${tiles}<button type="button" class="caja-prod caja-prod-otro" data-acc="otro"><span class="caja-prod-nombre">+ Otro producto</span></button>`;
}

function htmlLineas(c) {
    if (!c.lineas.length) return '<p class="caja-vacio">Toca un producto para empezar la factura.</p>';
    return `<ul class="caja-lineas">${c.lineas.map((l) => `
        <li class="caja-linea">
            <button type="button" class="caja-linea-cant" data-acc="cantidad" data-id="${esc(l.id)}" aria-label="Cambiar cantidad de ${esc(l.nombre)}: ${l.cantidad}">${l.cantidad}</button>
            <span class="caja-linea-nombre">${esc(l.nombre)} <small>a ${money(l.precio)}</small></span>
            <b class="caja-linea-total">${money(l.cantidad * l.precio)}</b>
        </li>`).join('')}</ul>`;
}

function htmlPanel(c) {
    const p = c.panel;
    if (!p) return '';
    if (p.tipo === 'cantidad') {
        const l = c.lineas.find((x) => x.id === p.id);
        const nombre = l ? l.nombre : (productosDeCaja().find((x) => x.id === p.id)?.nombre || '');
        const actual = l ? l.cantidad : 1;
        return `<div class="caja-modal-fondo" data-acc="cerrar-fondo"><div class="caja-modal" role="dialog" aria-modal="true" aria-label="Cantidad de ${esc(nombre)}">
            <h2>¿Cuántos ${esc(nombre)}?</h2>
            <div class="caja-stepper">
                <button type="button" class="caja-step" data-acc="menos" aria-label="Uno menos">−</button>
                <input id="caja-cant-input" class="caja-input caja-input-cant" type="number" inputmode="numeric" min="0" max="9999" value="${actual}" aria-label="Cantidad">
                <button type="button" class="caja-step" data-acc="mas" aria-label="Uno más">+</button>
            </div>
            <button type="button" class="caja-btn-principal" data-acc="cantidad-ok" data-id="${esc(p.id)}">Listo</button>
            ${l ? `<button type="button" class="caja-btn-texto" data-acc="quitar" data-id="${esc(p.id)}">Quitar de la factura</button>` : ''}
            <button type="button" class="caja-btn-texto" data-acc="cerrar">Cancelar</button>
        </div></div>`;
    }
    if (p.tipo === 'cliente') {
        const frec = clientesFrecuentes();
        const marca = (ok) => (ok ? ' caja-cli-activo' : '');
        return `<div class="caja-modal-fondo" data-acc="cerrar-fondo"><div class="caja-modal" role="dialog" aria-modal="true" aria-label="Elegir cliente">
            <h2>¿A quién le facturas?</h2>
            <div class="caja-clientes">
                <button type="button" class="caja-cli${marca(esConsumidorFinal(c.cliente))}" data-acc="cliente-cf">Consumidor final</button>
                ${frec.map((f, i) => `<button type="button" class="caja-cli${marca(c.cliente.identificacion === f.identificacion)}" data-acc="cliente-frec" data-i="${i}">${esc(f.nombre)} <small>${esc(f.identificacion)}</small></button>`).join('')}
            </div>
            <h3>Cliente nuevo</h3>
            <label class="caja-campo">Nombre<input id="caja-cli-nombre" class="caja-input" type="text" autocomplete="off"></label>
            <label class="caja-campo">Cédula o RUC<input id="caja-cli-id" class="caja-input" type="text" inputmode="numeric" autocomplete="off"></label>
            <button type="button" class="caja-btn-principal" data-acc="cliente-nuevo">Usar este cliente</button>
            <button type="button" class="caja-btn-texto" data-acc="cerrar">Cancelar</button>
        </div></div>`;
    }
    if (p.tipo === 'otro') {
        return `<div class="caja-modal-fondo" data-acc="cerrar-fondo"><div class="caja-modal" role="dialog" aria-modal="true" aria-label="Otro producto">
            <h2>Otro producto</h2>
            <label class="caja-campo">¿Qué vendes?<input id="caja-otro-nombre" class="caja-input" type="text" autocomplete="off"></label>
            <label class="caja-campo">Precio (sin IVA)<input id="caja-otro-precio" class="caja-input" type="text" inputmode="decimal" placeholder="0.00" autocomplete="off"></label>
            <p class="caja-error" id="caja-modal-error" role="alert"></p>
            <button type="button" class="caja-btn-principal" data-acc="otro-ok">Agregar a la factura</button>
            <button type="button" class="caja-btn-texto" data-acc="cerrar">Cancelar</button>
        </div></div>`;
    }
    return '';
}

export function renderCaja(app) {
    const c = app.state.caja;
    const t = totalesCaja(c.lineas);
    const aviso = avisoConsumidorFinal(c.cliente, c.lineas);
    const practica = !!(app.state.isDemoGuest || app.state.isDemoMode);
    const tranq = app.state.experienceMode === 'tranquilo' ? ' caja-tranquilo' : '';
    return `<div class="caja-root${tranq}" id="caja-root">
        <header class="caja-cab">
            <button type="button" class="caja-volver" data-acc="volver">← Hoy</button>
            <h1>Caja</h1>
            <span class="caja-cab-estado">${practica ? 'Modo Práctica: nada llega al SRI' : 'Emisión real al SRI'}</span>
        </header>
        <section class="caja-izq" aria-label="Productos">
            <h2 class="caja-tit">Toca lo que vendes</h2>
            <div class="caja-prods" id="caja-prods">${htmlProductos(c)}</div>
        </section>
        <section class="caja-der" aria-label="Factura en curso">
            <button type="button" class="caja-cliente" data-acc="cliente">
                <span class="caja-cliente-et">Cliente</span>
                <span class="caja-cliente-nom">${esc(esConsumidorFinal(c.cliente) ? 'Consumidor final' : c.cliente.nombre)}</span>
                <span class="caja-cliente-cambiar">Cambiar</span>
            </button>
            <div class="caja-hoja">${htmlLineas(c)}</div>
            <dl class="caja-totales">
                <div><dt>Subtotal</dt><dd id="caja-subtotal">${money(t.subtotal)}</dd></div>
                <div><dt>IVA 15 %</dt><dd id="caja-iva">${money(t.iva)}</dd></div>
                <div class="caja-total"><dt>Total</dt><dd id="caja-total">${money(t.total)}</dd></div>
            </dl>
            ${aviso ? '<p class="caja-error" role="alert">Para ventas de más de $50 el SRI pide los datos del cliente. Toca «Cambiar» y escribe su nombre y cédula.</p>' : ''}
            <button type="button" class="caja-emitir" id="caja-emitir" data-acc="emitir" ${c.lineas.length && !aviso ? '' : 'disabled'}>Emitir factura</button>
        </section>
        ${htmlPanel(c)}
    </div>`;
}

/** Conecta los toques. Se llama justo después de pintar renderCaja en el contenedor. */
export function montarCaja(app, contenedor) {
    const raiz = contenedor.querySelector('#caja-root');
    if (!raiz) return;
    const c = app.state.caja;
    let temporizador = null;
    let fueLarga = false;

    const repintar = () => {
        const scroll = raiz.querySelector('#caja-prods')?.scrollTop || 0;
        contenedor.innerHTML = renderCaja(app);
        const nueva = contenedor.querySelector('#caja-prods');
        if (nueva) nueva.scrollTop = scroll;
        montarCaja(app, contenedor);
        const foco = contenedor.querySelector('.caja-modal input, .caja-modal .caja-btn-principal');
        if (foco) { foco.focus(); if (foco.select) foco.select(); }
    };
    const producto = (id) => productosDeCaja().find((x) => x.id === id);
    const abrirCantidad = (id) => { c.panel = { tipo: 'cantidad', id }; repintar(); };

    // Mantener pulsado un producto abre el cambio de cantidad.
    raiz.addEventListener('pointerdown', (e) => {
        const b = e.target.closest('[data-acc="sumar"]');
        fueLarga = false;
        if (!b) return;
        temporizador = setTimeout(() => { fueLarga = true; abrirCantidad(b.dataset.id); }, PULSACION_LARGA_MS);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => raiz.addEventListener(ev, () => clearTimeout(temporizador), true));
    raiz.addEventListener('contextmenu', (e) => { if (e.target.closest('.caja-prod')) e.preventDefault(); });

    raiz.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && c.panel) { c.panel = null; repintar(); }
        if (e.key === 'Enter' && c.panel?.tipo === 'cantidad') raiz.querySelector('[data-acc="cantidad-ok"]')?.click();
    });

    raiz.addEventListener('click', async (e) => {
        const el = e.target.closest('[data-acc]');
        if (!el) return;
        const acc = el.dataset.acc;
        const id = el.dataset.id;

        if (acc === 'cerrar-fondo') { if (e.target === el) { c.panel = null; repintar(); } return; }
        if (acc === 'sumar') {
            if (fueLarga) { fueLarga = false; return; }
            const p = producto(id);
            if (!p) return;
            app.triggerHaptic(15);
            c.lineas = sumarProducto(c.lineas, p, 1);
            repintar();
            return;
        }
        if (acc === 'cantidad') { abrirCantidad(id); return; }
        if (acc === 'menos' || acc === 'mas') {
            const inp = raiz.querySelector('#caja-cant-input');
            inp.value = String(Math.max(0, (parseInt(inp.value, 10) || 0) + (acc === 'mas' ? 1 : -1)));
            return;
        }
        if (acc === 'cantidad-ok') {
            const n = parseInt(raiz.querySelector('#caja-cant-input')?.value, 10) || 0;
            const ya = c.lineas.some((l) => l.id === id);
            if (!ya && n > 0) { const p = producto(id); if (p) c.lineas = sumarProducto(c.lineas, p, n); }
            else c.lineas = fijarCantidad(c.lineas, id, n);
            c.panel = null; repintar(); return;
        }
        if (acc === 'quitar') { c.lineas = fijarCantidad(c.lineas, id, 0); c.panel = null; repintar(); return; }
        if (acc === 'cerrar') { c.panel = null; repintar(); return; }
        if (acc === 'cliente') { c.panel = { tipo: 'cliente' }; repintar(); return; }
        if (acc === 'cliente-cf') { c.cliente = CLIENTE_CONSUMIDOR_FINAL; c.panel = null; repintar(); return; }
        if (acc === 'cliente-frec') { c.cliente = clientesFrecuentes()[Number(el.dataset.i)] || CLIENTE_CONSUMIDOR_FINAL; c.panel = null; repintar(); return; }
        if (acc === 'cliente-nuevo') {
            const nombre = raiz.querySelector('#caja-cli-nombre')?.value.trim();
            const ident = raiz.querySelector('#caja-cli-id')?.value.trim();
            if (!nombre || !ident) { app.showToast('Escribe el nombre y la cédula o RUC del cliente.'); return; }
            c.cliente = { nombre, identificacion: ident };
            c.panel = null; repintar(); return;
        }
        if (acc === 'otro') { c.panel = { tipo: 'otro' }; repintar(); return; }
        if (acc === 'otro-ok') {
            const p = guardarProductoNuevo(raiz.querySelector('#caja-otro-nombre')?.value, raiz.querySelector('#caja-otro-precio')?.value);
            if (!p) { const er = raiz.querySelector('#caja-modal-error'); if (er) er.textContent = 'Escribe qué vendes y su precio, por ejemplo 2.50.'; return; }
            c.lineas = sumarProducto(c.lineas, p, 1);
            c.panel = null; repintar(); return;
        }
        if (acc === 'volver') { app.volverAHoyDesdeCaja(); return; }
        if (acc === 'emitir') {
            if (!c.lineas.length || c.emitiendo) return;
            if (avisoConsumidorFinal(c.cliente, c.lineas)) return;
            c.emitiendo = true;
            const lineas = c.lineas;
            const cliente = c.cliente;
            const ok = await app.emitirDesdeCaja(aPayload(cliente, lineas), totalesCaja(lineas).total);
            c.emitiendo = false;
            if (ok) { registrarUsoProductos(lineas); recordarCliente(cliente); }
        }
    });
}
