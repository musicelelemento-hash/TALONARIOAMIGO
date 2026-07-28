/**
 * Master App State Evaluator & Router
 * Incluye físicas 3D de desprendimiento de papel, Haptic Feedback API y cálculo dinámico
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
            },

            metrics: {
                total_users: 142,
                total_resellers: 8,
                total_clients: 134,
                active_licensed_slots: 240
            }
        };

        window.appState = this;
    }

    /**
     * EVALUACIÓN MASTER DE ESTADO Y ENRUTAMIENTO POR ROLE Y PERMISOS
     */
    evaluateStateAndRender() {
        if (!this.state.isLoggedIn) {
            this.container.innerHTML = renderLoginScreen();
            return;
        }

        if (this.state.currentRole === 'SUPER_ADMIN') {
            this.container.innerHTML = renderSuperAdminPanel(this.state);
            return;
        }

        if (this.state.currentRole === 'RESELLER') {
            this.container.innerHTML = renderResellerPanel({ quota: this.state.resellerQuota });
            return;
        }

        if (!this.state.isActive) {
            this.container.innerHTML = renderSupportLockScreen(
                "Tu cuenta ha sido pausada temporalmente por la administración de la imprenta. Por favor contacta a soporte técnico.",
                this.state.supportWhatsapp
            );
            return;
        }

        if (!this.state.isConfigured) {
            this.container.innerHTML = renderOnboardingScreen();
            return;
        }

        if (!this.state.hasSignature) {
            this.container.innerHTML = renderSupportLockScreen(
                "Aún no has configurado tu archivo de Firma Electrónica (.p12) requerida por el SRI para emitir comprobantes.",
                this.state.supportWhatsapp
            );
            return;
        }

        this.container.innerHTML = renderFacturadorRealista(this.state, this.state.currentDocNumber);
    }

    // SOPORTE VIBRACIÓN HÁPTICA MÓVIL
    triggerHaptic(pattern = 15) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    // SECUENCIA 3D DE EMISIÓN SRI, SELLO E IMPACTO DE PAPEL
    executeEmit3DSequence() {
        // 1. Háptico de pulsación
        this.triggerHaptic([40, 30, 80]);

        const stampBadge = document.getElementById('stamp-sri-badge');
        const paperCard = document.getElementById('receipt-paper-card');

        // 2. Impacto Sello SRI en Rojo / Verde
        if (stampBadge) {
            stampBadge.classList.add('slam-anim');
        }

        setTimeout(() => {
            // 3. Animación 3D Desprendimiento del Talonario
            if (paperCard) {
                paperCard.classList.remove('paper-glide-in');
                paperCard.classList.add('tearing-away');
            }

            this.triggerHaptic(30);

            setTimeout(() => {
                // 4. Incrementar Secuencial N° de Factura / Nota de Venta
                this.state.currentDocNumber += 1;

                // 5. Entrar nueva hoja en blanco con deslizado 3D
                this.evaluateStateAndRender();

                // Notification Toast
                this.showToast(`🎉 ¡Comprobante N° 001-001-${String(this.state.currentDocNumber - 1).padStart(9, '0')} firmado con XAdES-BES y AUTORIZADO por el SRI!`);
            }, 700);
        }, 1100);
    }

    // CÁLCULO DINÁMICO DE TOTALES
    recalculateTotals() {
        const rows = document.querySelectorAll('#realista-items-body tr');
        let grandTotal = 0;

        rows.forEach(row => {
            const qtyInput = row.querySelector('td:nth-child(1) input');
            const priceInput = row.querySelector('td:nth-child(3) input');
            const totalCell = row.querySelector('.row-total');

            if (qtyInput && priceInput && totalCell) {
                const qty = parseFloat(qtyInput.value) || 0;
                const price = parseFloat(priceInput.value) || 0;
                const rowTotal = qty * price;
                totalCell.innerText = `$${rowTotal.toFixed(2)}`;
                grandTotal += rowTotal;
            }
        });

        const totalDisplay = document.getElementById('grand-total-display');
        if (totalDisplay) {
            totalDisplay.innerText = `$${grandTotal.toFixed(2)}`;
            totalDisplay.style.transform = 'scale(1.1)';
            setTimeout(() => totalDisplay.style.transform = 'scale(1)', 200);
        }
    }

    showToast(message) {
        let toast = document.getElementById('custom-toast-msg');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'custom-toast-msg';
            toast.style.cssText = `
                position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
                background: #0F172A; color: white; padding: 12px 20px; border-radius: 10px;
                font-family: var(--font-sans); font-size: 13px; font-weight: 800;
                box-shadow: 0 8px 24px rgba(0,0,0,0.3); z-index: 1000; border: 1.5px solid #1A1A1A;
                text-align: center; max-width: 90%; animation: paperEntrance 0.3s ease;
            `;
            document.body.appendChild(toast);
        }
        toast.innerText = message;
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 4000);
    }

    // ACCIONES PANELS & ESTADO
    setRole(role) {
        this.state.currentRole = role;
        this.evaluateStateAndRender();
    }

    handleLogin() {
        this.triggerHaptic(20);
        this.state.isLoggedIn = true;
        this.evaluateStateAndRender();
    }

    saveOnboarding() {
        this.triggerHaptic(20);
        this.state.isConfigured = true;
        this.state.hasSignature = true;
        this.evaluateStateAndRender();
    }

    createReseller() {
        this.triggerHaptic(20);
        const name = document.getElementById('new-reseller-name').value;
        const size = parseInt(document.getElementById('new-reseller-package-size').value) || 30;

        this.state.metrics.total_resellers += 1;
        this.state.metrics.active_licensed_slots += size;
        this.state.metrics.total_users += 1;

        alert(`🏭 ¡Imprenta "${name}" registrada exitosamente!\nSe ha habilitado su cuenta Reseller y su primer lote de ${size} licencias.`);
        this.evaluateStateAndRender();
    }

    toggleMasterAccount(btn, imprentaName) {
        this.triggerHaptic(20);
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
        this.triggerHaptic(20);
        const size = parseInt(document.getElementById('owner-package-size').value) || 30;
        this.state.metrics.active_licensed_slots += size;
        alert(`📦 Se asignaron exitosamente ${size} licencias adicionales a la imprenta.`);
        this.evaluateStateAndRender();
    }

    createClientByReseller() {
        this.triggerHaptic(20);
        if (this.state.resellerQuota.available_slots <= 0) {
            alert('❌ Has alcanzado el límite de tu lote de licencias. Contacta al Dueño para comprar más cuentas.');
            return;
        }
        const name = document.getElementById('reseller-client-name').value;
        this.state.resellerQuota.total_used += 1;
        this.state.resellerQuota.available_slots -= 1;
        this.state.metrics.total_clients += 1;
        this.state.metrics.total_users += 1;
        alert(`👤 Cliente "${name}" dado de alta exitosamente dentro de tu lote de imprenta.`);
        this.evaluateStateAndRender();
    }

    toggleClientByReseller(btn, clientName) {
        this.triggerHaptic(20);
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
        this.triggerHaptic(20);
        const num = document.getElementById('reseller-whatsapp-input').value;
        this.state.supportWhatsapp = num;
        alert(`📱 Número de WhatsApp de soporte actualizado a: ${num}. Los bloqueos de tus clientes se dirigirán a este número.`);
    }

    setSimulatedState(key, val) {
        this.triggerHaptic(10);
        this.state[key] = val;
        this.evaluateStateAndRender();
    }
}
