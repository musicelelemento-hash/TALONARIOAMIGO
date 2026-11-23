/**
 * "Emitiendo en 5… Deshacer": espera unos segundos ANTES de mandar nada al servidor.
 * Devuelve { promesa, cancelar }. La promesa se resuelve con:
 *   'emitir'   -> terminó la cuenta: ahora sí se puede emitir
 *   'deshacer' -> la persona tocó Deshacer: no se emite nada
 *   'cancelado'-> se cerró la pantalla durante la cuenta: no se emite nada
 */
import '../ideas.css';

let activa = null;

export function segundosDeshacer(experienceMode) {
    return experienceMode === 'tranquilo' ? 10 : 5;
}

export function hayCuentaActiva() {
    return !!activa;
}

export function esperarConDeshacer({ segundos = 5, texto = 'Emitiendo en' } = {}) {
    if (activa) return { promesa: Promise.resolve('cancelado'), cancelar: () => {} };

    const aviso = document.createElement('div');
    aviso.className = 'ta-deshacer';
    aviso.setAttribute('role', 'status');
    aviso.innerHTML = `
        <div class="ta-deshacer-fila">
            <p class="ta-deshacer-txt"><span class="ta-deshacer-sr"></span><span aria-hidden="true">${texto} <b class="ta-deshacer-n">${segundos}</b>…</span></p>
            <button type="button" class="ta-deshacer-btn">Deshacer</button>
        </div>
        <div class="ta-deshacer-barra" aria-hidden="true"><span style="animation-duration:${segundos}s"></span></div>`;
    document.body.appendChild(aviso);
    // Se anuncia una sola vez (no cada segundo) para lectores de pantalla.
    aviso.querySelector('.ta-deshacer-sr').textContent = `${texto} ${segundos} segundos. Toca Deshacer para no emitir.`;
    const num = aviso.querySelector('.ta-deshacer-n');

    let resolver;
    const promesa = new Promise((r) => { resolver = r; });
    let restante = segundos;
    let fin = false;

    const terminar = (resultado) => {
        if (fin) return;
        fin = true;
        clearInterval(reloj);
        window.removeEventListener('pagehide', alSalir);
        aviso.remove();
        activa = null;
        resolver(resultado);
    };
    const alSalir = () => terminar('cancelado');
    const reloj = setInterval(() => {
        restante -= 1;
        if (restante <= 0) { terminar('emitir'); return; }
        num.textContent = String(restante);
    }, 1000);

    aviso.querySelector('.ta-deshacer-btn').addEventListener('click', () => terminar('deshacer'));
    window.addEventListener('pagehide', alSalir);
    activa = { cancelar: () => terminar('cancelado') };

    return { promesa, cancelar: () => terminar('cancelado') };
}
