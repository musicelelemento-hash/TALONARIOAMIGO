/**
 * Master App State Evaluator & Router
 * Administra los 3 Niveles de Acceso: SUPER_ADMIN (Dueño), RESELLER (Imprentas), CLIENT (Talonario)
 */
import { renderLoginScreen } from './LoginScreen.js';
import { renderOnboardingScreen } from './OnboardingScreen.js';
import { renderSupportLockScreen } from './SupportLockScreen.js';
import { renderFacturadorRealista } from './FacturadorRealista.js';
import { renderSuperAdminPanel } from './SuperAdminPanel.js';
import { renderResellerPanel } from './ResellerPanel.js';

export class AppManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        
        // Estado del Sistema Simulado (3 Niveles)
        this.state = {
            currentRole: 'CLIENT',      // SUPER_ADMIN, RESELLER, CLIENT
            isLoggedIn: true,
            isConfigured: true,        // RUC y datos emisor
            hasSignature: true,         // Archivo .p12 subido
            isActive: true,             // Estado activo/desactivado
            currentDocNumber: 126,
            supportWhatsapp: "0993050689",
            
            // Datos Reseller & Licencias
            resellerQuota: {
                total_allocated: 30,
                total_used: 18,
                available_slots: 12
            }
        };

        window.appState = this;
    }

    /**
     * EVALUACIÓN MASTER DE ESTADO Y ENRUTAMIENTO POR ROLE Y PERMISOS
     */
    evaluateStateAndRender() {
        // 1. Si no ha iniciado sesión -> Login Screen
        if (!this.state.isLoggedIn) {
            this.container.innerHTML = renderLoginScreen();
            return;
        }

        // 2. NIVEL 1: SUPER_ADMIN (Dueño — Control Total Global)
        if (this.state.currentRole === 'SUPER_ADMIN') {
            this.container.innerHTML = renderSuperAdminPanel(this.state);
            return;
        }

        // 3. NIVEL 2: RESELLER (Imprenta Aliada — Lotes & Clientes Propios)
        if (this.state.currentRole === 'RESELLER') {
            this.container.innerHTML = renderResellerPanel({ quota: this.state.resellerQuota });
            return;
        }

        // 4. NIVEL 3: CLIENT (Emisor Talonario Final)
        
        // A) Control de Bloqueo Global (Desactivación Maestra por el Dueño o Imprenta)
        if (!this.state.isActive) {
            this.container.innerHTML = renderSupportLockScreen(
                "Tu cuenta ha sido pausada temporalmente por la administración de la imprenta. Por favor contacta a soporte técnico.",
                this.state.supportWhatsapp
            );
            return;
        }

        // B) Control de Onboarding Inicial (Datos RUC)
        if (!this.state.isConfigured) {
            this.container.innerHTML = renderOnboardingScreen();
            return;
        }

        // C) Control de Firma Electrónica (.p12)
        if (!this.state.hasSignature) {
            this.container.innerHTML = renderSupportLockScreen(
                "Aún no has configurado tu archivo de Firma Electrónica (.p12) requerida por el SRI para emitir comprobantes.",
                this.state.supportWhatsapp
            );
            return;
        }

        // D) Facturador Físico Realista Replica Exacta
        this.container.innerHTML = renderFacturadorRealista(this.state, this.state.currentDocNumber);
    }

    // ACCIONES PANELS & ESTADO
    setRole(role) {
        this.state.currentRole = role;
        this.evaluateStateAndRender();
    }

    handleLogin() {
        this.state.isLoggedIn = true;
        this.evaluateStateAndRender();
    }

    saveOnboarding() {
        this.state.isConfigured = true;
        this.state.hasSignature = true;
        this.evaluateStateAndRender();
    }

    simularEmisionSRI() {
        alert("✒️ Comprobante firmado con XAdES-BES y AUTORIZADO por el SRI de Ecuador.\nSecuencial N° 001-001-000000126 procesado.");
        this.state.currentDocNumber += 1;
        this.evaluateStateAndRender();
    }

    // ACCIONES SUPERADMIN DUEÑO
    toggleMasterAccount(btn, imprentaName) {
        if (btn.innerText.includes('Suspender')) {
            btn.innerText = '🟢 Activar Imprenta';
            btn.style.background = '#15803D';
            alert(`⚠️ La imprenta "${imprentaName}" y sus clientes han sido SUSPENDIDOS globalmente.`);
        } else {
            btn.innerText = '🔴 Suspender Imprenta';
            btn.style.background = '#D90429';
            alert(`✅ La imprenta "${imprentaName}" ha sido ACTIVADA globalmente.`);
        }
    }

    assignPackage() {
        const size = parseInt(document.getElementById('owner-package-size').value) || 30;
        alert(`📦 Se asignaron exitosamente ${size} licencias adicionales a la imprenta.`);
    }

    // ACCIONES RESELLER IMPRENTA
    createClientByReseller() {
        if (this.state.resellerQuota.available_slots <= 0) {
            alert('❌ Has alcanzado el límite de tu lote de licencias. Contacta al Dueño para comprar más cuentas.');
            return;
        }
        const name = document.getElementById('reseller-client-name').value;
        this.state.resellerQuota.total_used += 1;
        this.state.resellerQuota.available_slots -= 1;
        alert(`👤 Cliente "${name}" dado de alta exitosamente dentro de tu lote de imprenta.`);
        this.evaluateStateAndRender();
    }

    toggleClientByReseller(btn, clientName) {
        if (btn.innerText.includes('Pausar')) {
            btn.innerText = '🟢 Activar';
            btn.style.background = '#15803D';
            alert(`🔴 La cuenta de "${clientName}" ha sido pausada.`);
        } else {
            btn.innerText = '🔴 Pausar';
            btn.style.background = '#D90429';
            alert(`🟢 La cuenta de "${clientName}" ha sido activada.`);
        }
    }

    updateResellerWhatsapp() {
        const num = document.getElementById('reseller-whatsapp-input').value;
        this.state.supportWhatsapp = num;
        alert(`📱 Número de WhatsApp de soporte actualizado a: ${num}. Los bloqueos de tus clientes se dirigirán a este número.`);
    }

    setSimulatedState(key, val) {
        this.state[key] = val;
        this.evaluateStateAndRender();
    }
}
