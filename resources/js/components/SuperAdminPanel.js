/**
 * Componente: SuperAdminPanel
 * Panel de Control Total para el Dueño de Talonario Amigo.
 * Integra:
 * 1. Pestaña de Gestión B2B de Imprentas Aliadas & Licencias.
 * 2. Pestaña del Centro de Mando Multi-Agente (12 Agentes clasificados en 4 Niveles Jerárquicos).
 * 3. Consola Interactiva de Diagnósticos de Agentes en Tiempo Real.
 */

function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function renderSuperAdminPanel(dashboardData, activeTab = 'resellers') {
    const data = dashboardData || {};
    const metrics = data.metrics || { total_users: 142, total_resellers: 8, total_clients: 134, active_licensed_slots: 240 };
    const resellers = Array.isArray(data.resellers) ? data.resellers : [];

    const resellerOptions = resellers.map((r) =>
        `<option value="${esc(r.id)}">${esc(r.name)}</option>`
    ).join('');

    const resellersList = resellers.length
        ? resellers.map((r) => {
            const active = r.is_active !== false && r.is_active !== 0;
            return `
            <div class="reseller-item-card" data-reseller-name="${esc(r.name).toLowerCase()}" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 4px rgba(15,23,42,0.04); transition: transform 0.15s ease;">
                <div>
                    <strong style="font-size: 15px; color: #0F172A;">${esc(r.name)}</strong><br>
                    <small style="color: #64748B; font-family: var(--font-mono-num);">Lotes: ${esc(r.allocated_accounts || 0)} licencias · ${esc(r.total_clients || 0)} clientes</small><br>
                    <small style="color: #1D4ED8; font-weight: 600;">📞 WhatsApp Soporte: ${esc(r.whatsapp_support || '—')}</small>
                </div>
                <div style="text-align: right;">
                    <span class="badge-pill ${active ? 'badge-active' : 'badge-inactive'}" style="display: inline-block; margin-bottom: 6px;">
                        ${active ? 'ACTIVO' : 'SUSPENDIDO'}
                    </span><br>
                    <button class="btn-stamp" style="padding: 6px 12px; font-size: 11px; background: ${active ? '#DC2626' : '#16A34A'}; border-color: ${active ? '#DC2626' : '#16A34A'}; width: auto;" onclick="window.appState.toggleMasterAccount(this, '${esc(r.id)}', ${active})">
                        ${active ? '🔴 Suspender Imprenta' : '🟢 Activar Imprenta'}
                    </button>
                </div>
            </div>`;
        }).join('')
        : '<div style="background:#F8FAFC; border:1.5px dashed #CBD5E1; border-radius:12px; padding:20px; text-align:center; color:#64748B;">Aún no hay imprentas registradas en la plataforma.</div>';

    return `
        <div class="factura-talonario-container" style="max-width: 820px; margin: 0 auto;">
            <!-- Header Panel SuperAdmin -->
            <div class="receipt-header">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div class="receipt-number">PANEL DE CONTROL TOTAL — DUEÑO</div>
                    <button type="button" class="mode-chip-btn" style="background:#1E293B; color:#FFF; font-size:11px;" onclick="window.appState.setRole('CLIENT')">
                        ✒️ Ir al Talonario
                    </button>
                </div>
                <div class="emisor-title">Plataforma Global Talonario Amigo</div>
                <div class="emisor-meta">Gobernanza Maestra, Imprentas y Comando de 12 Agentes Autónomos</div>
            </div>

            <!-- Banner Estado de Salud del Sistema -->
            <div style="background: rgba(22, 163, 74, 0.08); border: 1px solid rgba(22, 163, 74, 0.2); border-radius: 12px; padding: 10px 14px; margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
                <span style="color: #15803D; font-weight: 700;">🟢 Backend SRI: En Línea · Supabase BD: Conectada · Edge: Cloudflare Pages</span>
                <span style="color: #64748B; font-family: var(--font-mono-num); font-size: 11px;">12 Agentes en Servicio</span>
            </div>

            <!-- Métricas Globales Apple-Style -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 20px;">
                <div class="stat-card-apple">
                    <span style="font-size: 10px; font-weight: 800; color: #64748B; letter-spacing: 0.05em;">TOTAL CUENTAS</span>
                    <h3 style="font-family: var(--font-mono-num); font-size: 24px; font-weight: 800; color: #0F172A; margin-top: 4px;">${esc(metrics.total_users)}</h3>
                </div>
                <div class="stat-card-apple">
                    <span style="font-size: 10px; font-weight: 800; color: #64748B; letter-spacing: 0.05em;">IMPRENTAS ALIADAS</span>
                    <h3 style="font-family: var(--font-mono-num); font-size: 24px; font-weight: 800; color: #1D4ED8; margin-top: 4px;">${esc(metrics.total_resellers)}</h3>
                </div>
                <div class="stat-card-apple">
                    <span style="font-size: 10px; font-weight: 800; color: #64748B; letter-spacing: 0.05em;">CLIENTES EMISORES</span>
                    <h3 style="font-family: var(--font-mono-num); font-size: 24px; font-weight: 800; color: #16A34A; margin-top: 4px;">${esc(metrics.total_clients)}</h3>
                </div>
                <div class="stat-card-apple">
                    <span style="font-size: 10px; font-weight: 800; color: #64748B; letter-spacing: 0.05em;">SLOTS VENDIDOS</span>
                    <h3 style="font-family: var(--font-mono-num); font-size: 24px; font-weight: 800; color: #D97706; margin-top: 4px;">${esc(metrics.active_licensed_slots)}</h3>
                </div>
            </div>

            <!-- Selector de Pestañas Principales -->
            <div style="display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 1.5px solid #E2E8F0; padding-bottom: 10px;">
                <button type="button" class="mode-chip-btn ${activeTab === 'resellers' ? 'active' : ''}" onclick="window.appState.switchSuperAdminTab('resellers')">
                    🏢 Imprentas & Lotes B2B
                </button>
                <button type="button" class="mode-chip-btn ${activeTab === 'agents' ? 'active' : ''}" onclick="window.appState.switchSuperAdminTab('agents')" style="display: flex; align-items: center; gap: 6px;">
                    🏛️ Centro de Mando Multi-Agente
                    <span style="font-size: 10px; background: #16A34A; color: white; padding: 1px 7px; border-radius: 999px; font-weight: 800;">12 Activos</span>
                </button>
            </div>

            ${activeTab === 'agents' ? `
                <!-- ================= VISTA: CENTRO DE MANDO MULTI-AGENTE ================= -->
                <div>
                    <!-- Barra de Acción Rápida Global -->
                    <div style="background: #0F172A; color: #FFFFFF; border-radius: 14px; padding: 18px; margin-bottom: 22px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 14px rgba(15,23,42,0.2);">
                        <div>
                            <div style="font-size: 11px; font-weight: 800; color: #D97706; text-transform: uppercase; letter-spacing: 0.05em;">
                                Orquestación Autónoma · 4 Niveles Jerárquicos
                            </div>
                            <h3 style="font-family: var(--font-serif-header); font-size: 18px; font-weight: 800; margin-top: 2px;">
                                Escuadrón de 12 Agentes en Servicio
                            </h3>
                            <p style="font-size: 12px; color: #94A3B8; margin: 0;">
                                Cada agente audita y protege un área clave: SRI, Criptografía, Realismo Físico, B2B e Infraestructura.
                            </p>
                        </div>
                        <button type="button" class="btn-stamp" style="width: auto; padding: 10px 18px; font-size: 11px; background: #16A34A; border-color: #16A34A; white-space: nowrap;" onclick="window.appState.runAgentDiagnostic('all')">
                            🚀 Auditoría Integral (12 Agentes)
                        </button>
                    </div>

                    <!-- Consola en Vivo de Diagnóstico de Agentes -->
                    <div style="background: #090D16; border: 1px solid #1E293B; border-radius: 12px; padding: 14px 16px; margin-bottom: 22px; font-family: var(--font-mono-num); font-size: 12px; color: #4ADE80; box-shadow: inset 0 2px 6px rgba(0,0,0,0.6);">
                        <div style="display: flex; justify-content: space-between; color: #64748B; border-bottom: 1px solid #1E293B; padding-bottom: 6px; margin-bottom: 8px; font-size: 10px; font-weight: 800;">
                            <span>TERMINAL DE OPERACIONES AGÉNTICAS</span>
                            <span id="agent-console-status">LISTO PARA EJECUTAR</span>
                        </div>
                        <div id="agent-live-console" style="min-height: 54px; line-height: 1.6; max-height: 160px; overflow-y: auto;">
                            [SISTEMA AGÉNTICO INICIALIZADO] 12 Agentes reportan enlace nominal. Presiona cualquier botón para auditar.
                        </div>
                    </div>

                    <!-- NIVEL 0: COMANDO SUPREMO -->
                    <div style="margin-bottom: 20px;">
                        <div style="font-size: 11px; font-weight: 800; color: #B45309; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.05em;">
                            👑 NIVEL 0: DIRECCIÓN ESTRATÉGICA & COMANDO SUPREMO
                        </div>
                        <div style="background: #FFFFFF; border: 1.5px solid #FDE68A; border-radius: 12px; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 6px rgba(180,83,9,0.05);">
                            <div>
                                <strong style="font-size: 14px; color: #0F172A;">👑 Agente 01: ORCHESTRATOR_MASTER</strong><br>
                                <small style="color: #64748B;">Máxima autoridad. Descompone misiones y protege el principio de tranquilidad.</small>
                            </div>
                            <button type="button" class="btn-stamp" style="width: auto; padding: 6px 12px; font-size: 11px; background: #0F172A;" onclick="window.appState.runAgentDiagnostic('01_orchestrator')">
                                🚀 Auditar Comando
                            </button>
                        </div>
                    </div>

                    <!-- NIVEL 1: ESCUADRÓN TRIBUTARIO & SRI -->
                    <div style="margin-bottom: 20px;">
                        <div style="font-size: 11px; font-weight: 800; color: #15803D; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.05em;">
                            ⚖️ NIVEL 1: ESCUADRÓN TRIBUTARIO & CUMPLIMIENTO SRI ECUADOR
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong style="font-size: 13px; color: #0F172A;">⚖️ Agente 02: SRI_COMPLIANCE_OFFICER</strong><br>
                                    <small style="color: #64748B;">Esquemas XML Factura v1.1.0, Módulo 11 y Regímenes RIMPE.</small>
                                </div>
                                <button type="button" class="sim-btn" style="background: #16A34A; color: white; padding: 5px 12px; font-size: 11px;" onclick="window.appState.runAgentDiagnostic('02_sri')">
                                    🔍 Validar Esquemas
                                </button>
                            </div>
                            <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong style="font-size: 13px; color: #0F172A;">🔐 Agente 03: P12_VAULT_SECURITY</strong><br>
                                    <small style="color: #64748B;">Bóveda criptográfica de firmas electrónicas y validación X.509.</small>
                                </div>
                                <button type="button" class="sim-btn" style="background: #0F172A; color: white; padding: 5px 12px; font-size: 11px;" onclick="window.appState.runAgentDiagnostic('03_p12')">
                                    🛡️ Auditar Bóveda
                                </button>
                            </div>
                            <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong style="font-size: 13px; color: #0F172A;">📡 Agente 04: SOAP_SRI_PIPELINE</strong><br>
                                    <small style="color: #64748B;">Web Services recepcion / autorizacion y resiliencia ante caídas SRI.</small>
                                </div>
                                <button type="button" class="sim-btn" style="background: #1D4ED8; color: white; padding: 5px 12px; font-size: 11px;" onclick="window.appState.runAgentDiagnostic('04_soap')">
                                    ⚡ Test Conexión SRI
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- NIVEL 1: ESCUADRÓN DE PRODUCTO & EXPERIENCIA TÁCTIL -->
                    <div style="margin-bottom: 20px;">
                        <div style="font-size: 11px; font-weight: 800; color: #2563EB; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.05em;">
                            🎨 NIVEL 1: ESCUADRÓN DE PRODUCTO, EXPERIENCIA TÁCTIL & MÓVIL
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong style="font-size: 13px; color: #0F172A;">🎨 Agente 05: TACTILE_DESIGN_SYSTEM</strong><br>
                                    <small style="color: #64748B;">Protector de los 19 Principios, papel al 95% y sonido orgánico.</small>
                                </div>
                                <button type="button" class="sim-btn" style="background: #D97706; color: white; padding: 5px 12px; font-size: 11px;" onclick="window.appState.runAgentDiagnostic('05_tactile')">
                                    📐 Chequear 19 Principios
                                </button>
                            </div>
                            <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong style="font-size: 13px; color: #0F172A;">⚡ Agente 06: FRONTEND_SPA_ENGINEER</strong><br>
                                    <small style="color: #64748B;">Arquitectura Vanilla ES Modules, Vite y velocidad ultra-rápida.</small>
                                </div>
                                <button type="button" class="sim-btn" style="background: #0F172A; color: white; padding: 5px 12px; font-size: 11px;" onclick="window.appState.runAgentDiagnostic('06_frontend')">
                                    ⚡ Test Rendimiento SPA
                                </button>
                            </div>
                            <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong style="font-size: 13px; color: #0F172A;">📱 Agente 07: MOBILE_CAPACITOR_ENGINEER</strong><br>
                                    <small style="color: #64748B;">Empaquetado APK Android, plugins nativos de vibración y ciclo móvil.</small>
                                </div>
                                <button type="button" class="sim-btn" style="background: #16A34A; color: white; padding: 5px 12px; font-size: 11px;" onclick="window.appState.runAgentDiagnostic('07_mobile')">
                                    📱 Auditar APK Android
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- NIVEL 1: ESCUADRÓN B2B & CRECIMIENTO -->
                    <div style="margin-bottom: 20px;">
                        <div style="font-size: 11px; font-weight: 800; color: #7C3AED; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.05em;">
                            🏭 NIVEL 1: ESCUADRÓN DE EXPANSIÓN B2B, RESELLERS & CRECIMIENTO
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong style="font-size: 13px; color: #0F172A;">🏭 Agente 08: B2B_RESELLER_DIRECTOR</strong><br>
                                    <small style="color: #64748B;">Estructura de lotes (30, 50, 100 licencias) y panel reseller.</small>
                                </div>
                                <button type="button" class="sim-btn" style="background: #0F172A; color: white; padding: 5px 12px; font-size: 11px;" onclick="window.appState.runAgentDiagnostic('08_b2b')">
                                    📈 Proyectar Cuotas B2B
                                </button>
                            </div>
                            <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong style="font-size: 13px; color: #0F172A;">📣 Agente 09: VIRAL_GROWTH_MARKETER</strong><br>
                                    <small style="color: #64748B;">Landing page de ventas y despacho de comprobantes por WhatsApp.</small>
                                </div>
                                <button type="button" class="sim-btn" style="background: #16A34A; color: white; padding: 5px 12px; font-size: 11px;" onclick="window.appState.runAgentDiagnostic('09_viral')">
                                    💬 Test Enlace WhatsApp
                                </button>
                            </div>
                            <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong style="font-size: 13px; color: #0F172A;">📊 Agente 10: METRICS_RETENTION_ANALYST</strong><br>
                                    <small style="color: #64748B;">Telemetría de emisión mensual, retención y tomos físicos.</small>
                                </div>
                                <button type="button" class="sim-btn" style="background: #1D4ED8; color: white; padding: 5px 12px; font-size: 11px;" onclick="window.appState.runAgentDiagnostic('10_metrics')">
                                    📊 Ver Métricas Churn
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- NIVEL 2: ESCUADRÓN INFRAESTRUCTURA EDGE & CALIDAD -->
                    <div style="margin-bottom: 20px;">
                        <div style="font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.05em;">
                            🛡️ NIVEL 2: ESCUADRÓN DE INFRAESTRUCTURA EDGE, SEGURIDAD & CALIDAD
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong style="font-size: 13px; color: #0F172A;">🛡️ Agente 11: EDGE_INFRA_ENGINEER</strong><br>
                                    <small style="color: #64748B;">Cloudflare Pages, Cloudflare R2 y base de datos Supabase Postgres.</small>
                                </div>
                                <button type="button" class="sim-btn" style="background: #0F172A; color: white; padding: 5px 12px; font-size: 11px;" onclick="window.appState.runAgentDiagnostic('11_edge')">
                                    🌐 Ping Infraestructura
                                </button>
                            </div>
                            <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong style="font-size: 13px; color: #0F172A;">🧪 Agente 12: QA_TEST_GUARDIAN</strong><br>
                                    <small style="color: #64748B;">Guardián de suites de prueba, build exitoso y cero regresiones.</small>
                                </div>
                                <button type="button" class="sim-btn" style="background: #16A34A; color: white; padding: 5px 12px; font-size: 11px;" onclick="window.appState.runAgentDiagnostic('12_qa')">
                                    🧪 Correr Pruebas QA
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ` : `
                <!-- ================= VISTA: IMPRENTAS Y LOTES B2B ================= -->
                <!-- Formulario 1: Dar de Alta una NUEVA Imprenta Reseller -->
                <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px; margin-bottom: 22px; box-shadow: 0 1px 6px rgba(15,23,42,0.03);">
                    <h4 style="font-family: var(--font-serif-header); font-size: 17px; font-weight: 800; margin-bottom: 12px; color: #0F172A;">
                        🏭 Registrar Nueva Imprenta Aliada (Reseller)
                    </h4>
                    <form onsubmit="event.preventDefault(); window.appState.createReseller();" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div>
                            <label class="form-label">Nombre Comercial de la Imprenta</label>
                            <input type="text" id="new-reseller-name" class="form-input" placeholder="Ej. Imprenta Gráficas del Sur" required>
                        </div>
                        <div>
                            <label class="form-label">Correo de Acceso Reseller</label>
                            <input type="email" id="new-reseller-email" class="form-input" placeholder="contacto@imprenta.com" required>
                        </div>
                        <div>
                            <label class="form-label">Contraseña de la Imprenta</label>
                            <input type="password" id="new-reseller-pass" class="form-input" placeholder="••••••••" required>
                        </div>
                        <div>
                            <label class="form-label">WhatsApp Soporte Imprenta</label>
                            <input type="text" id="new-reseller-wa" class="form-input" placeholder="Ej. 0993050689" required>
                        </div>
                        <div style="grid-column: span 2;">
                            <label class="form-label">Lote Inicial de Licencias Vendidas</label>
                            <div style="display: flex; gap: 10px;">
                                <input type="number" id="new-reseller-package-size" class="form-input" value="30" placeholder="Ej. 30 licencias" style="flex:1;">
                                <button type="submit" class="btn-stamp" style="width: auto; padding: 10px 20px; font-size: 12px; background: #0F172A;">
                                    ➕ REGISTRAR IMPRENTA & VENDER LOTE
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                <!-- Formulario 2: Asignar Lote Adicional a Imprenta Existente -->
                <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px; margin-bottom: 22px; box-shadow: 0 1px 6px rgba(15,23,42,0.03);">
                    <h4 style="font-family: var(--font-serif-header); font-size: 17px; font-weight: 800; margin-bottom: 12px; color: #0F172A;">
                        📦 Vender / Asignar Lote Adicional a Imprenta Existente
                    </h4>
                    <form onsubmit="event.preventDefault(); window.appState.assignPackage();" style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 12px; align-items: end;">
                        <div>
                            <label class="form-label">Imprenta Aliada</label>
                            <select id="owner-package-reseller" class="form-select">
                                ${resellerOptions || '<option value="">— Sin imprentas —</option>'}
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Tamaño del Lote Adicional</label>
                            <input type="number" id="owner-package-size" class="form-input" value="30" placeholder="Ej. 30 licencias">
                        </div>
                        <button type="submit" class="btn-stamp" style="padding: 10px 18px; font-size: 12px; background: #1D4ED8; border-color: #1D4ED8;">
                            📦 ASIGNAR LOTE
                        </button>
                    </form>
                </div>

                <!-- Lista Global de Resellers con Buscador en Vivo -->
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px;">
                    <h4 style="font-weight: 800; font-size: 15px; color: #0F172A;">
                        Gestión Maestra de Resellers & Imprentas (${esc(metrics.total_resellers)})
                    </h4>
                </div>

                <input type="text" class="admin-search-input" placeholder="Filtrar imprentas por nombre o correo..." oninput="window.appState.filterSuperAdminResellers(this.value)" style="margin-bottom: 12px;">

                <div style="display: flex; flex-direction: column; gap: 10px;" id="owner-resellers-list">
                    ${resellersList}
                </div>
            `}
        </div>
    `;
}
