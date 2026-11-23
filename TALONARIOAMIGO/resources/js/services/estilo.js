/**
 * Estilo visual de la app: "clasico" (talonario de papel) o "minimalista" (blanco y limpio).
 * Misma app y misma lógica; solo cambia la apariencia (idea del dueño, ver docs/producto/APP_ESTRELLA.md §3).
 *
 * Contrato que usan los demás componentes:
 *   getEstilo()            → 'clasico' | 'minimalista'
 *   setEstilo(estilo)      → guarda la preferencia y la aplica en <html data-estilo="...">
 *   aplicarEstiloGuardado()→ se llama una vez al arrancar (main.js)
 *   ESTILOS                → lista para pintar el selector
 * Los estilos CSS cuelgan de :root[data-estilo="minimalista"] (y "clasico" es el actual por defecto).
 */

export const ESTILOS = [
    { id: 'clasico', nombre: 'Clásico', descripcion: 'Como tu talonario de papel de siempre' },
    { id: 'minimalista', nombre: 'Minimalista', descripcion: 'Blanco, limpio y moderno' },
];

const CLAVE = 'ta_estilo';
const VALIDOS = new Set(ESTILOS.map((e) => e.id));

export function getEstilo() {
    try {
        const v = localStorage.getItem(CLAVE);
        if (VALIDOS.has(v)) return v;
    } catch (_e) { /* almacenamiento bloqueado: se usa el estilo por defecto */ }
    return 'clasico';
}

export function setEstilo(estilo) {
    const v = VALIDOS.has(estilo) ? estilo : 'clasico';
    try {
        localStorage.setItem(CLAVE, v);
    } catch (_e) { /* sin almacenamiento: se aplica solo en esta visita */ }
    document.documentElement.setAttribute('data-estilo', v);
    document.dispatchEvent(new CustomEvent('estilo:cambiado', { detail: { estilo: v } }));
    return v;
}

export function aplicarEstiloGuardado() {
    document.documentElement.setAttribute('data-estilo', getEstilo());
}
