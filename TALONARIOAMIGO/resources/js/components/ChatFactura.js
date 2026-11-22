/**
 * Factura por chat: el comerciante escribe (o dicta) la venta como en WhatsApp,
 * la app responde con una tarjeta-resumen y pide confirmación.
 *
 * Se monta como una capa sobre la app (no depende del render del facturador).
 * La emisión la hace quien lo abre (AppManager.emitirDesdeChat) para que funcione igual en
 * modo práctica (sin servidor), sin señal y real.
 */
import '../chat.css';
import { prepararFactura, dinero, ejemploFactura, CONSUMIDOR_FINAL } from '../services/interpreteFactura.js';
import { voiceDictation } from '../services/voiceDictation.js';
import { invoiceValidator } from '../services/invoiceValidator.js';

const SI = ['si', 'sii', 'ok', 'dale', 'confirmo', 'emitir', 'emitela', 'listo'];
const NO = ['no', 'cancelar', 'cancela', 'borrar', 'corregir'];
const SALUDOS = ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'ayuda', 'menu', '?'];

function normalizar(texto) {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[!¡.,¿]+/g, '')
        .trim();
}

function cantidadTexto(n) {
    return Number.isInteger(n) ? String(n) : String(n).replace(/0+$/, '');
}

/**
 * @param {{ emitir: (payload:object)=>Promise<{ok:boolean,numero?:string,practica?:boolean,offline?:boolean,error?:string}>,
 *           onClose: ()=>void, practica: boolean }} opciones
 */
export function abrirChatFactura({ emitir, onClose, practica = false }) {
    document.getElementById('chatf-root')?.remove();

    const root = document.createElement('div');
    root.id = 'chatf-root';
    root.className = 'chatf-root';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Factura por chat');
    root.innerHTML = `
        <div class="chatf-head">
            <h2>💬 Factura por chat</h2>
            <button type="button" class="chatf-close" id="chatf-close">Cerrar</button>
        </div>
        ${practica ? '<div class="chatf-badge">Modo Práctica: puedes probar tranquilo, nada llega al SRI.</div>' : ''}
        <div class="chatf-msgs" id="chatf-msgs" aria-live="polite"></div>
        <div class="chatf-composer">
            <button type="button" class="chatf-mic" id="chatf-mic" aria-label="Hablar" hidden>🎤</button>
            <textarea class="chatf-input" id="chatf-input" rows="1" placeholder="Escribe o habla…" aria-label="Escribe la venta"></textarea>
            <button type="button" class="chatf-send" id="chatf-send" aria-label="Enviar">➤</button>
        </div>`;
    document.body.appendChild(root);

    const msgs = root.querySelector('#chatf-msgs');
    const input = root.querySelector('#chatf-input');
    const micBtn = root.querySelector('#chatf-mic');
    let pendiente = null; // { cliente, items, totales, card }
    let ocupado = false;

    const bajar = () => { msgs.scrollTop = msgs.scrollHeight; };

    function burbuja(texto, tipo = 'bot', extraClase = '') {
        const b = document.createElement('div');
        b.className = `chatf-bubble chatf-${tipo} ${extraClase}`.trim();
        b.textContent = texto;
        msgs.appendChild(b);
        bajar();
        return b;
    }

    function fila(clase, izq, der) {
        const r = document.createElement('div');
        r.className = `chatf-row ${clase}`;
        const a = document.createElement('span');
        a.textContent = izq;
        const b = document.createElement('span');
        b.textContent = der;
        r.append(a, b);
        return r;
    }

    function tarjeta(p) {
        const card = document.createElement('div');
        card.className = 'chatf-card';
        const titulo = document.createElement('h3');
        titulo.textContent = '🧾 Revisa tu factura';
        const cli = document.createElement('div');
        cli.className = 'chatf-cli';
        cli.textContent = 'Cliente: ' + (p.cliente.identificacion === CONSUMIDOR_FINAL
            ? 'Consumidor final'
            : `${p.cliente.nombre} (${p.cliente.identificacion})`);
        card.append(titulo, cli);
        p.totales.lineas.forEach((l) => {
            card.append(fila('chatf-item', `${cantidadTexto(l.cantidad)} ${l.descripcion} × ${dinero(l.precioUnitario)}`, dinero(l.total)));
        });
        card.append(
            fila('', 'Subtotal', dinero(p.totales.subtotal)),
            fila('', 'IVA 15 %', dinero(p.totales.iva)),
            fila('chatf-total', 'Total', dinero(p.totales.total))
        );
        const acciones = document.createElement('div');
        acciones.className = 'chatf-actions';
        const corregir = document.createElement('button');
        corregir.type = 'button';
        corregir.className = 'chatf-btn';
        corregir.textContent = 'Corregir';
        const emitirBtn = document.createElement('button');
        emitirBtn.type = 'button';
        emitirBtn.className = 'chatf-btn chatf-primary';
        emitirBtn.textContent = 'Sí, emitir';
        acciones.append(corregir, emitirBtn);
        card.append(acciones);
        corregir.addEventListener('click', () => corregirBorrador());
        emitirBtn.addEventListener('click', () => confirmarEmision());
        msgs.appendChild(card);
        bajar();
        return card;
    }

    function cerrarTarjeta() {
        pendiente?.card?.querySelectorAll('button').forEach((b) => { b.disabled = true; });
    }

    function ayuda() {
        burbuja('Escríbeme la venta como la dirías en voz alta. Por ejemplo:');
        burbuja(ejemploFactura(), 'user');
        burbuja('Si no sabes los datos del cliente, escribe "consumidor final". Los precios van sin IVA.');
    }

    function corregirBorrador() {
        if (!pendiente || ocupado) return;
        cerrarTarjeta();
        pendiente = null;
        burbuja('Sin problema. Escríbela otra vez con el cambio y la vuelvo a armar.');
        input.focus();
    }

    async function confirmarEmision() {
        if (!pendiente || ocupado) return;
        ocupado = true;
        cerrarTarjeta();
        const { cliente, items } = pendiente;
        pendiente = null;
        const espera = burbuja('Emitiendo tu factura…');
        let r;
        try {
            r = await emitir({ cliente, items: items.map((i) => ({ ...i, exento: false })) });
        } catch (e) {
            r = { ok: false, error: e?.message || '' };
        }
        espera.remove();
        ocupado = false;
        if (!r || !r.ok) {
            burbuja('😕 No pude emitir la factura. ' + (r?.error || 'Inténtalo en un momento.') + '\nNo se emitió nada.');
            return;
        }
        if (r.offline) {
            burbuja(`📴 Sin señal. Guardé la factura ${r.numero} en tu talonario y se enviará sola cuando vuelva la señal.`, 'bot', 'chatf-ok');
        } else {
            burbuja(`✅ ¡Listo! Factura ${r.numero}` + (r.practica ? '\nModo Práctica: no llegó al SRI.' : ''), 'bot', 'chatf-ok');
        }
        burbuja('¿Otra venta? Escríbela cuando quieras.');
    }

    function enviar() {
        const texto = input.value.trim();
        if (!texto || ocupado) return;
        input.value = '';
        input.style.height = '';
        burbuja(texto, 'user');
        const cmd = normalizar(texto);

        if (pendiente && SI.includes(cmd)) { confirmarEmision(); return; }
        if (pendiente && NO.includes(cmd)) { corregirBorrador(); return; }
        if (!pendiente && (SI.includes(cmd) || NO.includes(cmd))) {
            burbuja('No tengo ninguna factura esperando. Escríbeme una nueva.');
            return;
        }
        if (SALUDOS.includes(cmd)) { ayuda(); return; }

        const r = prepararFactura(texto);
        if (!r.ok) {
            burbuja(`🤔 ${r.error}\n\nEjemplo:\n${ejemploFactura()}`);
            return;
        }
        // La cédula se revisa ANTES de mostrar la tarjeta, para no pedir "Sí, emitir" sobre
        // datos que el SRI va a rechazar.
        const id = String(r.cliente.identificacion || '');
        if (id.length === 10 && id !== '9999999999' && !invoiceValidator.validarCedulaEcuador(id)) {
            burbuja(`🤔 La cédula ${id} de ${r.cliente.nombre} no es válida. Revisa los 10 números y escríbeme la factura otra vez.

Si el cliente no quiere dar sus datos, escribe "consumidor final".`);
            return;
        }
        if (pendiente) cerrarTarjeta();
        pendiente = { cliente: r.cliente, items: r.items, totales: r.totales };
        pendiente.card = tarjeta(pendiente);
    }

    function cerrar() {
        voiceDictation.stop();
        root.remove();
        if (onClose) onClose();
    }

    root.querySelector('#chatf-send').addEventListener('click', enviar);
    root.querySelector('#chatf-close').addEventListener('click', cerrar);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviar();
        }
    });
    input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });

    // Micrófono: solo si el navegador sabe dictar.
    if (voiceDictation.isSupported()) {
        micBtn.hidden = false;
        micBtn.addEventListener('click', () => {
            if (voiceDictation.isListening) { voiceDictation.stop(); return; }
            voiceDictation.start({
                onStart: () => micBtn.classList.add('chatf-on'),
                onTranscript: (t) => { input.value = t; },
                onError: () => burbuja('No pude escucharte. Revisa el permiso del micrófono o escríbelo.'),
                onEnd: () => micBtn.classList.remove('chatf-on'),
            });
        });
    }

    burbuja('¡Hola! 👋 Soy tu talonario. Escríbeme la venta como la dirías en voz alta. Por ejemplo:');
    burbuja(ejemploFactura(), 'user');
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chatf-chip';
    chip.textContent = 'Probar con este ejemplo';
    chip.addEventListener('click', () => { input.value = ejemploFactura(); input.focus(); });
    msgs.appendChild(chip);
    input.focus();

    return { cerrar };
}
