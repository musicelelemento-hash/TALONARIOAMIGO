/** Tarjeta "Hoy": cuánto vendiste, si todo llegó, y un solo botón. */
import '../ideas.css';

function dinero(n) {
    return '$' + Number(n || 0).toFixed(2);
}

export function textoEstadoHoy({ cantidad, pendientes, practica }) {
    if (practica) return { icono: 'ℹ', texto: 'Modo Práctica: nada llega al SRI', clase: 'ta-hoy-practica' };
    if (pendientes > 0) return { icono: '⏳', texto: `${pendientes} esperando señal`, clase: 'ta-hoy-espera' };
    if (cantidad === 0) return { icono: '✓', texto: 'Aún no hay facturas hoy', clase: 'ta-hoy-ok' };
    return { icono: '✓', texto: 'Todas llegaron al SRI', clase: 'ta-hoy-ok' };
}

export function renderHoyTarjeta({ total, cantidad, pendientes = 0, practica = false }) {
    const est = textoEstadoHoy({ cantidad, pendientes, practica });
    const facturas = `${cantidad} ${cantidad === 1 ? 'factura' : 'facturas'}`;
    return `
        <section class="ta-hoy" aria-label="Resumen de hoy">
            <div class="ta-hoy-card">
                <p class="ta-hoy-dia">Hoy vendiste</p>
                <p class="ta-hoy-monto" id="hoy-monto">${dinero(total)} <span class="ta-hoy-sep" aria-hidden="true">·</span> <span class="ta-hoy-cant" id="hoy-cantidad">${facturas}</span></p>
                <p class="ta-hoy-estado ${est.clase}" id="hoy-estado"><span aria-hidden="true">${est.icono}</span> ${est.texto}</p>
            </div>
            <button type="button" class="ta-hoy-boton" onclick="window.appState.irANuevaFactura()">Nueva factura</button>
        </section>`;
}
