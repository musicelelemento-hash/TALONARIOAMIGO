/**
 * Talonario Amigo — Keep-alive Worker (Cloudflare Workers)
 * Cada 2 minutos hace un ping al endpoint /api/health del backend en Render.
 * Objetivo: impedir que el servicio free de Render duerma (spins down) tras ~15 min de inactividad,
 * para que la API responda siempre rápido. 100.000 req/día gratis en Cloudflare.
 */
const RENDER_HEALTH_URL = 'https://talonario-amigo-api.onrender.com/api/health';

export default {
    async scheduled(event, env, ctx) {
        try {
            const res = await fetch(RENDER_HEALTH_URL, { method: 'GET' });
            console.log(`[keepalive] Render health -> ${res.status}`);
        } catch (error) {
            console.error('[keepalive] Error ping a Render:', error);
        }
    },

    async fetch(request, env) {
        // Ruta manual de prueba: GET /  -> devuelve el estado actual de Render
        const res = await fetch(RENDER_HEALTH_URL, { method: 'GET' }).catch(() => null);
        const status = res ? await res.json().catch(() => null) : null;
        return new Response(JSON.stringify({ ok: true, render_health: status }), {
            headers: { 'content-type': 'application/json' },
        });
    },
};
