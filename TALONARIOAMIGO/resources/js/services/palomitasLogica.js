/**
 * Palomitas de estado, como en WhatsApp.
 *  nivel 1  ✓   guardada en el teléfono / esperando señal para enviarse
 *  nivel 2  ✓✓  aceptada por el SRI (en Modo Práctica: "Práctica")
 *  nivel 3  ✓✓  el cliente la recibió. Preparado, pero NO se usa todavía (aún no existe el envío del PDF).
 */
export function infoPalomitas(nivel, practica = false) {
    if (nivel >= 3) return { marca: '✓✓', texto: 'Enviada al cliente por correo', clase: 'ta-pal-3' };
    if (nivel === 2) {
        return practica
            ? { marca: '✓✓', texto: 'Práctica: no llegó al SRI', clase: 'ta-pal-2 ta-pal-practica' }
            : { marca: '✓✓', texto: 'Aceptada por el SRI', clase: 'ta-pal-2' };
    }
    return { marca: '✓', texto: 'Guardada, falta enviarla al SRI', clase: 'ta-pal-1' };
}

export function nivelDeEmision({ offline = false, practica = false, emailEnviado = false } = {}) {
    if (offline) return 1;
    return emailEnviado && !practica ? 3 : 2;
}
