/**
 * Master App State Evaluator & Router
 * Incluye físicas 3D de desprendimiento de papel, Haptic Feedback API y cálculo dinámico
 */
import { renderLoginScreen } from './LoginScreen.js';
import { renderRegisterScreen } from './RegisterScreen.js';
import { renderOnboardingScreen } from './OnboardingScreen.js';
import { renderSupportLockScreen } from './SupportLockScreen.js';
import { renderFacturadorRealista } from './FacturadorRealista.js';
import { renderSuperAdminPanel } from './SuperAdminPanel.js';
import { renderResellerPanel } from './ResellerPanel.js';
import { api } from '../api.js';
import { extractDataFromSriPdf } from '../services/sriPdf.js';

export class AppManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        
        // Estado del Sistema Simulado (3 Niveles)
        this.state = {
            currentRole: 'CLIENT',      // SUPER_ADMIN, RESELLER, CLIENT
            // Inicia sesión sólo si ya existe un token Sanctum guardado en este dispositivo.
            isLoggedIn: !!localStorage.getItem('ta_auth_token'),
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
     * Los paneles (SUPER_ADMIN / RESELLER) cargan datos reales desde el backend.
     */
    async evaluateStateAndRender() {
        if (!this.state.isLoggedIn) {
            this.container.innerHTML = renderLoginScreen();
            return;
        }

        if (this.state.currentRole === 'SUPER_ADMIN') {
            this.container.innerHTML = '<div style="padding:40px;text-align:center;color:#57534E;">Cargando panel global…</div>';
            try {
                const data = await api.getOwnerDashboard();
                this.container.innerHTML = renderSuperAdminPanel(data);
            } catch (e) {
                this.showToast('❌ No se pudo cargar el panel: ' + (e.message || ''));
                this.container.innerHTML = renderSuperAdminPanel({ metrics: this.state.metrics });
            }
            return;
        }

        if (this.state.currentRole === 'RESELLER') {
            this.container.innerHTML = '<div style="padding:40px;text-align:center;color:#57534E;">Cargando panel de imprenta…</div>';
            try {
                const data = await api.getResellerDashboard();
                this.container.innerHTML = renderResellerPanel(data);
            } catch (e) {
                this.showToast('❌ No se pudo cargar el panel: ' + (e.message || ''));
                this.container.innerHTML = renderResellerPanel({ quota: this.state.resellerQuota });
            }
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

    // Recolecta el payload de emisión desde el formulario del talonario (cliente + items)
    collectEmitPayload() {
        const nombre = document.querySelector('#receipt-paper-card .cliente-line-input')?.value || '';
        const direccion = document.querySelectorAll('#receipt-paper-card .cliente-line-input')[1]?.value || '';
        const identificacion = document.querySelectorAll('#receipt-paper-card .cliente-line-input')[2]?.value || '';
        const rows = document.querySelectorAll('#realista-items-body tr');
        const items = [];
        rows.forEach((row) => {
            const inputs = row.querySelectorAll('input');
            if (inputs.length < 3) return;
            const cantidad = parseFloat(inputs[0].value);
            const descripcion = inputs[1].value.trim();
            const precioUnitario = parseFloat(inputs[2].value);
            if (!descripcion || isNaN(cantidad) || isNaN(precioUnitario)) return;
            items.push({ descripcion, cantidad, precioUnitario, exento: false });
        });
        return { cliente: { nombre, identificacion, direccion }, items };
    }

    // SECUENCIA DE EMISIÓN REAL: reúne el formulario, llama al pipeline SRI y muestra el resultado.
    async executeEmit3DSequence() {
        this.triggerHaptic([40, 30, 80]);
        this.showToast('⏳ Firmando y transmitiendo al SRI…');

        let payload;
        try {
            payload = this.collectEmitPayload();
            if (!payload.cliente.nombre || !payload.cliente.identificacion) {
                throw new Error('Completa el nombre y la identificación del cliente.');
            }
            if (!payload.items.length) {
                throw new Error('Agrega al menos un producto a la factura.');
            }

            const res = await api.emitirFactura(payload);

            const stampBadge = document.getElementById('stamp-sri-badge');
            if (stampBadge) {
                const clave = res.claveAcceso || '...';
                const estado = res.estado === 'AUTORIZADO' ? 'AUTORIZADO' : 'ENVIADO';
                stampBadge.innerHTML = `✓ ${estado} SRI<br><small style="font-size:9px; font-weight:normal;">CLAVE ACCESO: ${clave.slice(0, 20)}...</small>`;
                stampBadge.style.borderColor = '#16A34A';
                stampBadge.classList.add('slam-anim');
            }

            this.triggerHaptic(30);
            this.state.currentDocNumber += 1;
            const secuencial = String(res.secuencial || this.state.currentDocNumber - 1).padStart(9, '0');
            this.showToast(`🎉 Comprobante N° 001-001-${secuencial} ${res.estado === 'AUTORIZADO' ? 'AUTORIZADO' : 'ENVIADO'} por el SRI.`
                + (res.numeroAutorizacion ? `\nAutorización: ${res.numeroAutorizacion}` : ''));

            // Nueva hoja en blanco con deslizado 3D
            setTimeout(() => this.evaluateStateAndRender(), 900);
        } catch (e) {
            this.triggerHaptic(50);
            const msg = (e.code === 'PENDING_ONBOARDING')
                ? 'Completa tus datos tributarios (RUC, razón social) antes de emitir.'
                : (e.code === 'MISSING_SIGNATURE')
                    ? 'Debes vincular tu firma electrónica (.p12) antes de emitir.'
                    : (e.status === 401)
                        ? 'Tu sesión expiró. Vuelve a iniciar sesión.'
                        : (e.message || 'No se pudo emitir el comprobante.');
            this.showToast('❌ ' + msg);
        }
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

    async handleLogin() {
        this.triggerHaptic(20);
        const email = document.getElementById('login-email')?.value?.trim();
        const password = document.getElementById('login-pass')?.value;
        if (!email || !password) {
            this.showToast('Ingresa tu correo y contraseña.');
            return;
        }
        this.showToast('⏳ Iniciando sesión…');
        try {
            const res = await api.login(email, password);
            localStorage.setItem('ta_auth_token', res.token);
            localStorage.setItem('ta_auth_user', JSON.stringify(res.user));
            this.state.currentRole = res.user.role;
            this.state.user = res.user;
            this.state.isLoggedIn = true;
            this.showToast(`✓ Bienvenido, ${res.user.name || res.user.email}.`);
            this.evaluateStateAndRender();
        } catch (e) {
            this.triggerHaptic(50);
            this.showToast('❌ ' + (e.message || 'No se pudo iniciar sesión.'));
        }
    }

    async logout() {
        try { await api.logout(); } catch (e) { /* ignore */ }
        localStorage.removeItem('ta_auth_token');
        localStorage.removeItem('ta_auth_user');
        this.state.isLoggedIn = false;
        this.state.user = null;
        this.evaluateStateAndRender();
        this.showToast('Sesión cerrada.');
    }

    openLogin() {
        this.container.innerHTML = renderLoginScreen();
    }

    openRegister() {
        this.container.innerHTML = renderRegisterScreen();
    }

    // Auto-registro de usuario normal: crea cuenta + facturador (emisor) + sube firma, y entra.
    async handleRegister() {
        this.triggerHaptic(20);
        const name = document.getElementById('reg-name')?.value?.trim();
        const email = document.getElementById('reg-email')?.value?.trim();
        const password = document.getElementById('reg-pass')?.value;
        const ruc = document.getElementById('reg-ruc')?.value?.trim();
        const razon_social = document.getElementById('reg-nombre')?.value?.trim();
        const direccion_matriz = document.getElementById('reg-direccion')?.value?.trim();
        const tipo_regimen = document.getElementById('reg-regimen')?.value || 'GENERAL';
        const p12 = document.getElementById('reg-p12')?.files[0];
        const clave = document.getElementById('reg-clave')?.value;

        if (!name || !email || !password || !ruc || !razon_social || !direccion_matriz) { this.showToast('Completa todos los campos del facturador y tu cuenta.'); return; }
        if (!p12 || !clave) { this.showToast('Selecciona tu firma .p12 y su contraseña.'); return; }

        this.showToast('⏳ Creando tu facturador…');
        try {
            const res = await api.register({
                name, email, password,
                ruc, razon_social, nombre_comercial: razon_social, direccion_matriz,
                tipo_regimen, obligado_contabilidad: false,
            });
            localStorage.setItem('ta_auth_token', res.token);
            localStorage.setItem('ta_auth_user', JSON.stringify(res.user));
            await api.uploadFirma(p12, clave);

            this.state.currentRole = res.user.role;
            this.state.user = res.user;
            this.state.isLoggedIn = true;
            this.state.isConfigured = true;
            this.state.hasSignature = true;
            this.showToast('✅ ¡Tu facturador está listo! Bienvenido.');
            this.evaluateStateAndRender();
        } catch (e) {
            this.triggerHaptic(50);
            this.showToast('❌ ' + (e.message || 'No se pudo crear la cuenta.'));
        }
    }

    // Autocompleta el registro desde el Certificado de RUC
    async handleRegisterRucPdf(input) {
        const file = input.files && input.files[0];
        const statusEl = document.getElementById('reg-ruc-status');
        if (!file) return;
        if (statusEl) { statusEl.textContent = '⏳ Analizando certificado…'; statusEl.style.color = '#1D4ED8'; }
        try {
            const data = await extractDataFromSriPdf(file);
            const set = (id, val) => { const el = document.getElementById(id); if (el && val && !el.value) el.value = val; };
            set('reg-ruc', data.ruc);
            set('reg-nombre', data.apellidos_nombres);
            set('reg-direccion', data.direccion);
            const reg = document.getElementById('reg-regimen');
            const mapa = { 'RIMPE Negocio Popular': 'RIMPE_POPULAR', 'RIMPE Emprendedor': 'RIMPE_EMPRENDEDOR' };
            if (reg && mapa[data.regimen]) reg.value = mapa[data.regimen];
            if (statusEl) { statusEl.textContent = `✓ Datos detectados (${data.regimen})`; statusEl.style.color = '#16A34A'; }
            this.showToast('✓ Certificado procesado: datos autocompletados.');
        } catch (e) {
            if (statusEl) { statusEl.textContent = '❌ ' + (e.message || 'Error'); statusEl.style.color = '#D90429'; }
        }
    }

    async testRegisterSignature() {
        this.triggerHaptic(10);
        const p12 = document.getElementById('reg-p12')?.files[0];
        const clave = document.getElementById('reg-clave')?.value;
        const statusEl = document.getElementById('reg-firma-status');
        if (!p12 || !clave) { this.showToast('Selecciona tu .p12 y su contraseña.'); return; }
        if (statusEl) { statusEl.textContent = '✓ Firma seleccionada (se valida de verdad al confirmar).'; statusEl.style.color = '#16A34A'; }
        this.showToast('✓ La firma se validará con el backend al crear tu cuenta.');
    }

    // Autocompleta la creación de cliente de la imprenta desde el Certificado de RUC
    async handleClientRucPdf(input) {
        const file = input.files && input.files[0];
        const statusEl = document.getElementById('client-ruc-status');
        if (!file) return;
        if (statusEl) { statusEl.textContent = '⏳ Analizando certificado…'; statusEl.style.color = '#1D4ED8'; }
        try {
            const data = await extractDataFromSriPdf(file);
            const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
            set('reseller-client-name', data.apellidos_nombres);
            set('client-ruc', data.ruc);
            set('client-direccion', data.direccion);
            const reg = document.getElementById('client-regimen');
            const mapa = { 'RIMPE Negocio Popular': 'RIMPE_POPULAR', 'RIMPE Emprendedor': 'RIMPE_EMPRENDEDOR' };
            if (reg && mapa[data.regimen]) reg.value = mapa[data.regimen];
            if (statusEl) { statusEl.textContent = `✓ Cliente detectado (${data.regimen})`; statusEl.style.color = '#16A34A'; }
            this.showToast('✓ Datos del cliente autocompletados.');
        } catch (e) {
            if (statusEl) { statusEl.textContent = '❌ ' + (e.message || 'Error'); statusEl.style.color = '#D90429'; }
        }
    }

    // Recolecta los datos del emisor desde el formulario de onboarding
    _collectEmisorData() {
        return {
            ruc: document.getElementById('onb-ruc')?.value?.trim(),
            razon_social: document.getElementById('onb-nombre')?.value?.trim(),
            nombre_comercial: document.getElementById('onb-nombre')?.value?.trim(),
            direccion_matriz: document.getElementById('onb-direccion')?.value?.trim(),
            contribuyente_especial: '',
            obligado_contabilidad: false,
            tipo_regimen: document.getElementById('onb-regimen')?.value || 'GENERAL',
            ambiente: '1',
        };
    }

    // Autocompleta el formulario del facturador a partir del Certificado de RUC (PDF del SRI)
    async handleRucPdf(input) {
        this.triggerHaptic(10);
        const file = input.files && input.files[0];
        const statusEl = document.getElementById('onb-ruc-status');
        if (!file) return;
        if (statusEl) { statusEl.textContent = '⏳ Analizando certificado…'; statusEl.style.color = '#1D4ED8'; }
        try {
            const data = await extractDataFromSriPdf(file);
            const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
            set('onb-ruc', data.ruc);
            set('onb-nombre', data.apellidos_nombres);
            set('onb-direccion', data.direccion);
            const mapaRegimen = { 'RIMPE Negocio Popular': 'RIMPE_POPULAR', 'RIMPE Emprendedor': 'RIMPE_EMPRENDEDOR' };
            if (data.regimen && mapaRegimen[data.regimen]) set('onb-regimen', mapaRegimen[data.regimen]);
            if (data.cantidad_establecimientos) set('onb-establecimientos', String(data.cantidad_establecimientos));
            if (statusEl) { statusEl.textContent = `✓ Datos del certificado detectados (${data.regimen})`; statusEl.style.color = '#16A34A'; }
            this.showToast('✓ Certificado de RUC procesado: datos autocompletados.');
        } catch (e) {
            if (statusEl) { statusEl.textContent = '❌ ' + (e.message || 'No se pudo leer el PDF'); statusEl.style.color = '#D90429'; }
        }
    }

    // Valida y guarda la firma .p12 (el backend valida la contraseña con openssl)
    async testSignature() {
        this.triggerHaptic(20);
        const p12 = document.getElementById('onb-p12')?.files[0];
        const clave = document.getElementById('onb-clave')?.value;
        const statusEl = document.getElementById('onb-firma-status');
        if (!p12 || !clave) { this.showToast('Selecciona tu .p12 y escribe su contraseña.'); return; }
        if (statusEl) { statusEl.textContent = '⏳ Validando firma…'; statusEl.style.color = '#1D4ED8'; }
        try {
            const data = this._collectEmisorData();
            if (data.ruc && data.razon_social && data.direccion_matriz) {
                await api.setupEmisor(data);
            }
            const res = await api.uploadFirma(p12, clave);
            this.state.hasSignature = true;
            if (statusEl) {
                const cad = res.data && res.data.firma_expires_at ? ` · caduca ${res.data.firma_expires_at}` : '';
                statusEl.textContent = '✓ Firma válida y guardada' + cad;
                statusEl.style.color = '#16A34A';
            }
            this.showToast('✓ Firma electrónica válida y guardada.');
        } catch (e) {
            if (statusEl) { statusEl.textContent = '❌ ' + (e.message || 'Firma inválida'); statusEl.style.color = '#D90429'; }
            this.showToast('❌ ' + (e.message || 'No se pudo validar la firma.'));
        }
    }

    async saveOnboarding() {
        this.triggerHaptic(20);
        const data = this._collectEmisorData();
        const p12 = document.getElementById('onb-p12')?.files[0];
        const clave = document.getElementById('onb-clave')?.value;

        if (!data.ruc || !data.razon_social || !data.direccion_matriz) { this.showToast('Completa RUC, razón social y dirección.'); return; }
        if (!p12 || !clave) { this.showToast('Selecciona tu firma .p12 y su contraseña.'); return; }

        this.showToast('⏳ Guardando configuración del facturador…');
        try {
            await api.setupEmisor(data);
            await api.uploadFirma(p12, clave);
            this.state.isConfigured = true;
            this.state.hasSignature = true;
            this.showToast('✅ ¡Tu facturador está listo!');
            this.evaluateStateAndRender();
        } catch (e) {
            this.triggerHaptic(50);
            this.showToast('❌ ' + (e.message || 'No se pudo guardar la configuración.'));
        }
    }

    async createReseller() {
        this.triggerHaptic(20);
        const name = document.getElementById('new-reseller-name')?.value?.trim();
        const email = document.getElementById('new-reseller-email')?.value?.trim();
        const password = document.getElementById('new-reseller-pass')?.value;
        const whatsapp_support = document.getElementById('new-reseller-wa')?.value?.trim();
        const initial_package_size = parseInt(document.getElementById('new-reseller-package-size')?.value) || 30;

        if (!name || !email || !password || !whatsapp_support) {
            this.showToast('Completa todos los datos de la imprenta.');
            return;
        }
        try {
            const res = await api.createReseller({ name, email, password, phone: '', whatsapp_support, initial_package_size });
            this.showToast('✅ ' + (res.message || 'Imprenta registrada.'));
            await this.evaluateStateAndRender();
        } catch (e) {
            this.triggerHaptic(50);
            this.showToast('❌ ' + (e.message || 'No se pudo dar de alta la imprenta.'));
        }
    }

    async toggleMasterAccount(btn, resellerId, currentActive) {
        this.triggerHaptic(20);
        const newActive = !(currentActive === true || currentActive === 'true' || currentActive === 1);
        try {
            const res = await api.toggleUserStatus(resellerId, newActive);
            this.showToast('✅ ' + (res.message || 'Estado actualizado.'));
            await this.evaluateStateAndRender();
        } catch (e) {
            this.triggerHaptic(50);
            this.showToast('❌ ' + (e.message || 'No se pudo cambiar el estado.'));
        }
    }

    async assignPackage() {
        this.triggerHaptic(20);
        const reseller_id = parseInt(document.getElementById('owner-package-reseller')?.value);
        const allocated_accounts = parseInt(document.getElementById('owner-package-size')?.value) || 30;
        if (!reseller_id) { this.showToast('Selecciona una imprenta.'); return; }
        try {
            const res = await api.assignResellerPackage({
                reseller_id,
                package_name: `Lote Adicional ${allocated_accounts} Licencias`,
                allocated_accounts,
            });
            this.showToast('✅ ' + (res.message || 'Lote asignado.'));
            await this.evaluateStateAndRender();
        } catch (e) {
            this.triggerHaptic(50);
            this.showToast('❌ ' + (e.message || 'No se pudo asignar el lote.'));
        }
    }

    async createClientByReseller() {
        this.triggerHaptic(20);
        const name = document.getElementById('reseller-client-name')?.value?.trim();
        const email = document.getElementById('reseller-client-email')?.value?.trim();
        const password = document.getElementById('reseller-client-pass')?.value;
        const phone = document.getElementById('reseller-client-phone')?.value?.trim();
        const ruc = document.getElementById('client-ruc')?.value?.trim();
        const direccion = document.getElementById('client-direccion')?.value?.trim();
        const tipo_regimen = document.getElementById('client-regimen')?.value || 'GENERAL';

        if (!name || !email || !password) { this.showToast('Completa los datos del cliente.'); return; }
        const payload = { name, email, password, phone };
        if (ruc) {
            payload.emisor = {
                ruc,
                razon_social: name,
                nombre_comercial: name,
                direccion_matriz: direccion || '',
                tipo_regimen,
                obligado_contabilidad: false,
            };
        }
        try {
            const res = await api.createClient(payload);
            this.showToast('✅ ' + (res.message || 'Cliente registrado.'));
            await this.evaluateStateAndRender();
        } catch (e) {
            this.triggerHaptic(50);
            this.showToast('❌ ' + (e.message || 'No se pudo registrar el cliente.'));
        }
    }

    async toggleClientByReseller(btn, clientId, currentActive) {
        this.triggerHaptic(20);
        const newActive = !(currentActive === true || currentActive === 'true' || currentActive === 1);
        try {
            const res = await api.toggleClientStatus(clientId, newActive);
            this.showToast('✅ ' + (res.message || 'Estado actualizado.'));
            await this.evaluateStateAndRender();
        } catch (e) {
            this.triggerHaptic(50);
            this.showToast('❌ ' + (e.message || 'No se pudo cambiar el estado.'));
        }
    }

    async updateResellerWhatsapp() {
        this.triggerHaptic(20);
        const num = document.getElementById('reseller-whatsapp-input')?.value?.trim();
        if (!num) { this.showToast('Ingresa un número de WhatsApp.'); return; }
        try {
            const res = await api.updateWhatsappSupport({ whatsapp_support: num });
            this.state.supportWhatsapp = res.whatsapp_support || num;
            this.showToast('✅ ' + (res.message || 'Número actualizado.'));
            await this.evaluateStateAndRender();
        } catch (e) {
            this.triggerHaptic(50);
            this.showToast('❌ ' + (e.message || 'No se pudo actualizar.'));
        }
    }

    setSimulatedState(key, val) {
        this.triggerHaptic(10);
        this.state[key] = val;
        this.evaluateStateAndRender();
    }
}
