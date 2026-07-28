/**
 * API Client HTTP — Talonario Amigo
 * Detecta automáticamente si está en entorno local o producción (Render.com)
 */

const LOCAL_API_URL = "http://localhost:8000/api";
const PROD_API_URL = "https://talonario-amigo-api.onrender.com/api";

// Detección automática del Host
export const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? LOCAL_API_URL
    : PROD_API_URL;

class ApiClient {
    constructor() {
        this.baseUrl = API_BASE_URL;
        this.token = localStorage.getItem('ta_auth_token') || null;
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('ta_auth_token', token);
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    async get(endpoint) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.warn(`[API Client Offline Fallback] GET ${endpoint} falló.`, error);
            return { success: false, message: 'Servidor no disponible o modo sin conexión.' };
        }
    }

    async post(endpoint, body = {}) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(body)
            });
            return await response.json();
        } catch (error) {
            console.warn(`[API Client Offline Fallback] POST ${endpoint} falló.`, error);
            return { success: false, message: 'Servidor no disponible o modo sin conexión.' };
        }
    }
}

export const api = new ApiClient();
