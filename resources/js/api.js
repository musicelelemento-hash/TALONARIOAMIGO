/**
 * API Client HTTP — Talonario Amigo
 * Conexión al backend Laravel en Render para autenticación (Sanctum), firma XAdES-BES
 * y transmisión de comprobantes al SRI de Ecuador.
 * NOTA: sin fallbacks que fingen éxito — si un paso falla, se devuelve el error real.
 */

const LOCAL_API_URL = 'http://localhost:8000/api';
const PROD_API_URL = 'https://talonario-amigo-api.onrender.com/api';

const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
const forceProd = urlParams && urlParams.get('api') === 'prod';
const storedApiUrl = typeof window !== 'undefined' ? localStorage.getItem('ta_api_url') : null;

const isLocal = !forceProd && typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = storedApiUrl || (forceProd ? PROD_API_URL : (isLocal ? LOCAL_API_URL : PROD_API_URL));

class ApiClient {
    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    getToken() {
        return localStorage.getItem('ta_auth_token') || '';
    }

    getHeaders() {
        const token = this.getToken();
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    }

    async request(path, { method = 'GET', body } = {}) {
        const opts = {
            method,
            headers: this.getHeaders(),
        };
        if (body !== undefined) {
            opts.body = JSON.stringify(body);
        }

        const res = await fetch(`${this.baseUrl}${path}`, opts);
        let data = null;
        try {
            data = await res.json();
        } catch (e) {
            /* body podría no ser JSON */
        }

        if (!res.ok) {
            // Extrae el mensaje de error más útil: message directo o el primer mensaje de validación.
            let msg = data && (data.message || (data.errors && Object.values(data.errors).flat()[0]));
            if (!msg) msg = `Error HTTP ${res.status}`;
            const err = new Error(msg);
            err.status = res.status;
            err.data = data;
            err.code = data && data.code;
            throw err;
        }

        return data;
    }

    /* ---------------------------- Auth ---------------------------- */
    async login(email, password) {
        return this.request('/v1/auth/login', { method: 'POST', body: { email, password } });
    }

    /** Auto-registro público: crea la cuenta CLIENT con facturador listo. */
    async register(data) {
        return this.request('/v1/auth/register', { method: 'POST', body: data });
    }

    async logout() {
        return this.request('/v1/auth/logout', { method: 'POST' });
    }

    async me() {
        return this.request('/user');
    }

    /* ------------------------- Onboarding ------------------------- */
    async onboardingEstado() {
        return this.request('/v1/onboarding/estado');
    }

    async setupEmisor(data) {
        return this.request('/v1/onboarding/emisor', { method: 'POST', body: data });
    }

    /**
     * Sube y valida la firma electrónica .p12 (multipart). El backend la valida con openssl_pkcs12_read.
     */
    async uploadFirma(file, password) {
        const form = new FormData();
        form.append('firma_p12', file);
        form.append('password', password);
        const token = this.getToken();
        const res = await fetch(`${this.baseUrl}/v1/onboarding/firma`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: form,
        });
        let data = null;
        try { data = await res.json(); } catch (e) { /* may not be JSON */ }
        if (!res.ok) {
            const err = new Error((data && data.message) || `Error HTTP ${res.status}`);
            err.status = res.status;
            err.data = data;
            throw err;
        }
        return data;
    }

    /* -------------------------- Facturación ------------------------- */
    async tipos() {
        return this.request('/v1/facturacion/tipos');
    }

    /**
     * Pipeline orquestado: arma XML, firma con el .p12 del emisor logueado,
     * envía y autoriza en el SRI en un solo llamado.
     */
    async emitirFactura(payload) {
        return this.request('/v1/facturacion/emitir', { method: 'POST', body: payload });
    }

    async consultarEstado(claveAcceso) {
        return this.request(`/v1/facturacion/estado/${claveAcceso}`);
    }

    /* --------------------------- Owner (SUPER_ADMIN) --------------------------- */
    async getOwnerDashboard() {
        return this.request('/v1/owner/dashboard');
    }

    async createReseller(data) {
        return this.request('/v1/owner/resellers', { method: 'POST', body: data });
    }

    async toggleUserStatus(userId, isActive) {
        return this.request(`/v1/owner/users/${userId}/toggle-status`, { method: 'POST', body: { is_active: isActive } });
    }

    async assignResellerPackage(data) {
        return this.request('/v1/owner/resellers/assign-package', { method: 'POST', body: data });
    }

    /* ------------------------- Reseller (imprenta) ------------------------- */
    async getResellerDashboard() {
        return this.request('/v1/reseller/dashboard');
    }

    async createClient(data) {
        return this.request('/v1/reseller/clients', { method: 'POST', body: data });
    }

    async toggleClientStatus(clientId, isActive) {
        return this.request(`/v1/reseller/clients/${clientId}/toggle-status`, { method: 'POST', body: { is_active: isActive } });
    }

    async updateWhatsappSupport(data) {
        return this.request('/v1/reseller/whatsapp-support', { method: 'POST', body: data });
    }
}

export const api = new ApiClient();
