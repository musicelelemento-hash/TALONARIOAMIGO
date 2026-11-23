/**
 * Registro local de las facturas emitidas hoy en este dispositivo (para la pantalla "Hoy").
 * Solo guarda lo mínimo: fecha, total, estado y si fue práctica. Sin nombres ni cédulas.
 */
const CLAVE = 'ta_emisiones_hoy_v1';
const MAX = 200;

function dia(fecha = new Date()) {
    const p = (n) => String(n).padStart(2, '0');
    return `${fecha.getFullYear()}-${p(fecha.getMonth() + 1)}-${p(fecha.getDate())}`;
}

function leer() {
    try {
        const lista = JSON.parse(localStorage.getItem(CLAVE) || '[]');
        return Array.isArray(lista) ? lista : [];
    } catch {
        return [];
    }
}

function guardar(lista) {
    try {
        localStorage.setItem(CLAVE, JSON.stringify(lista.slice(-MAX)));
    } catch { /* almacenamiento lleno o bloqueado: seguimos sin registro */ }
}

export const emisionHoy = {
    /** Anota una factura emitida. total en dólares. */
    registrar({ total, practica = false, offline = false }) {
        const t = Number(total);
        if (!Number.isFinite(t)) return;
        const hoy = dia();
        // Se descartan los días anteriores: solo importa "hoy".
        const lista = leer().filter((e) => e.d === hoy);
        lista.push({ d: hoy, t: Math.round(t * 100) / 100, p: practica ? 1 : 0, o: offline ? 1 : 0 });
        guardar(lista);
    },

    /** Suma y cuenta de hoy, separando práctica de real. */
    resumen(practica = false) {
        const hoy = dia();
        const mias = leer().filter((e) => e.d === hoy && !!e.p === !!practica);
        return {
            cantidad: mias.length,
            total: Math.round(mias.reduce((s, e) => s + e.t, 0) * 100) / 100,
        };
    },

    limpiar() {
        try { localStorage.removeItem(CLAVE); } catch { /* nada */ }
    },
};
