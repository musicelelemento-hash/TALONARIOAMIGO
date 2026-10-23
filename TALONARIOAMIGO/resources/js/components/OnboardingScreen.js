/**
 * Componente: OnboardingScreen
 * Asistente de Configuración Inicial del FACTURADOR (emisor).
 * Permite subir el Certificado de RUC (PDF) para autocompletar datos, y vincular la firma .p12.
 */
export function renderOnboardingScreen() {
    return `
        <div style="min-height: 100vh; display: flex; align-items: flex-start; justify-content: center; padding: 24px 16px;">
            <div style="width: 100%; max-width: 520px; background: #FFFFFF; border-radius: 20px; padding: 26px; box-shadow: 0 24px 60px rgba(0,9,26,0.4);">

                <div style="border-bottom: 1px dashed #E2E8F0; padding-bottom: 12px; margin-bottom: 18px;">
                    <span style="font-family: var(--font-mono-num); font-size: 10px; font-weight: 800; color: #B45309; text-transform: uppercase;">PASO 1 DE 2 — CONFIGURAR TU FACTURADOR</span>
                    <h2 style="font-family: var(--font-serif-header); font-size: 20px; font-weight: 800; color: #0F172A; margin-top: 4px;">Asistente Inicial de Emisor</h2>
                    <p style="font-size: 11px; color: #64748B;">Sube tu Certificado de RUC (PDF del SRI) y se autocompletan tus datos. Tienes ~30 segundos.</p>
                </div>

                <!-- Zona de carga del Certificado RUC PDF -->
                <div onclick="document.getElementById('onb-ruc-file').click()"
                     style="border: 2px dashed #CBD5E1; border-radius: 14px; padding: 22px; text-align: center; cursor: pointer; background: #F8FAFC; margin-bottom: 18px; transition: all .15s ease;"
                     onmouseover="this.style.borderColor='#1D4ED8'; this.style.background='#FFFFFF'"
                     onmouseout="this.style.borderColor='#CBD5E1'; this.style.background='#F8FAFC'">
                    <div style="font-size: 30px;"></div>
                    <div style="font-weight: 800; font-size: 13px; color: #0F172A; margin-top: 4px;">Subir Certificado de RUC (PDF)</div>
                    <div style="font-size: 11px; color: #64748B; margin-top: 2px;">Toca para seleccionar el PDF oficial del SRI</div>
                    <input type="file" id="onb-ruc-file" accept=".pdf,application/pdf" style="display:none" onchange="window.appState.handleRucPdf(this)">
                    <div id="onb-ruc-status" style="font-size: 11px; font-weight: 800; color: #1D4ED8; margin-top: 8px;">&nbsp;</div>
                </div>

                <form onsubmit="event.preventDefault(); window.appState.saveOnboarding();" style="display: flex; flex-direction: column; gap: 12px;">
                    <div>
                        <label style="display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; color:#475569;">Número de RUC (13 dígitos)</label>
                        <input type="text" id="onb-ruc" class="form-input" maxlength="13" placeholder="Ej. 1790012345001" required>
                    </div>

                    <div>
                        <label style="display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; color:#475569;">Razón Social / Nombre Comercial</label>
                        <input type="text" id="onb-nombre" class="form-input" placeholder="Ej. Mi Comercio S.A." required>
                    </div>

                    <div>
                        <label style="display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; color:#475569;">Dirección Matriz</label>
                        <input type="text" id="onb-direccion" class="form-input" value="Vía Principal SN y Calle SN, El Guabo, El Oro">
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div>
                            <label style="display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; color:#475569;">Régimen Tributario</label>
                            <select id="onb-regimen" class="form-select">
                                <option value="RIMPE_POPULAR">RIMPE Popular</option>
                                <option value="RIMPE_EMPRENDEDOR">RIMPE Emprendedor</option>
                                <option value="GENERAL">General</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; color:#475569;">Establecimientos abiertos</label>
                            <input type="number" id="onb-establecimientos" class="form-input" value="1" min="1">
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div>
                            <label style="display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; color:#475569;">Establecimiento</label>
                            <input type="text" id="onb-estab" class="form-input" value="001" required>
                        </div>
                        <div>
                            <label style="display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; color:#475569;">Punto de Emisión</label>
                            <input type="text" id="onb-pto" class="form-input" value="001" required>
                        </div>
                    </div>

                    <div style="border-top: 1px dashed #E2E8F0; padding-top: 12px; margin-top: 4px;">
                        <label style="display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; color:#475569;">Firma Electrónica (.p12)</label>
                        <input type="file" id="onb-p12" accept=".p12,.pfx" style="font-size: 11px; margin-top: 4px;">
                        <div style="display: flex; gap: 8px; margin-top: 6px;">
                            <input type="password" id="onb-clave" class="form-input" placeholder="Contraseña de la firma" style="flex:1;">
                            <button type="button" onclick="window.appState.testSignature()" style="padding: 8px 12px; background:#16A34A; color:#fff; border:none; border-radius:10px; font-weight:800; font-size:12px; cursor:pointer;">Probar firma</button>
                        </div>
                        <div id="onb-firma-status" style="font-size: 11px; font-weight: 800; color:#64748B; margin-top:6px;">&nbsp;</div>
                    </div>

                    <button type="submit" style="margin-top: 14px; padding: 15px; background: #0F172A; color: white; border: none; border-radius: 12px; font-weight: 800; font-size: 14px; cursor: pointer; box-shadow: 0 8px 20px rgba(15,23,42,0.26);">
                         COMPLETAR CONFIGURACIÓN Y ACTIVAR
                    </button>
                </form>
            </div>
        </div>
    `;
}

/**
 * Modal Pop-Up de Onboarding y Vinculación de Firma
 * Permite configurar la firma sin salir del talonario
 */
export function renderOnboardingModal() {
    return `
        <div class="modal-onboarding-backdrop" id="onboarding-modal-backdrop" onclick="if(event.target === this) window.appState.closeOnboardingModal()">
            <div class="modal-onboarding-card">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #CBD5E1; padding-bottom: 12px; margin-bottom: 16px;">
                    <div>
                        <span style="font-family: var(--font-mono-num); font-size: 10px; font-weight: 800; color: #DC2626; text-transform: uppercase;">
                             MODO REAL SRI · CONFIGURACIÓN RÁPIDA
                        </span>
                        <h2 style="font-family: var(--font-serif-header); font-size: 18px; font-weight: 800; color: #0F172A; margin: 4px 0 0 0;">
                            Vincular Firma Electrónica (.p12) y RUC
                        </h2>
                    </div>
                    <button type="button" onclick="window.appState.closeOnboardingModal()" style="background: #F1F5F9; border: 1px solid #CBD5E1; color: #475569; width: 32px; height: 32px; border-radius: 999px; font-size: 14px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                        ✕
                    </button>
                </div>
                
                <p style="font-size: 12px; color: #64748B; margin-bottom: 14px;">
                    Sube tu certificado digital <strong>.p12</strong>y tu RUC del SRI para emitir comprobantes legales. O sube tu Certificado de RUC (PDF) para autocompletar todo en segundos.
                </p>

                <!-- Zona de carga del Certificado RUC PDF -->
                <div onclick="document.getElementById('onb-modal-ruc-file').click()"
                     style="border: 2px dashed #93C5FD; border-radius: 12px; padding: 14px; text-align: center; cursor: pointer; background: #EFF6FF; margin-bottom: 14px; transition: all .15s ease;">
                    <div style="font-size: 24px;"></div>
                    <div style="font-weight: 800; font-size: 12px; color: #1E40AF; margin-top: 2px;">Subir Certificado de RUC (PDF del SRI)</div>
                    <div style="font-size: 10px; color: #3B82F6;">Autocompleta RUC, razón social y dirección al instante</div>
                    <input type="file" id="onb-modal-ruc-file" accept=".pdf,application/pdf" style="display:none" onchange="window.appState.handleRucPdf(this)">
                </div>

                <form onsubmit="event.preventDefault(); window.appState.saveOnboarding();" style="display: flex; flex-direction: column; gap: 10px;">
                    <div>
                        <label style="display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; color:#475569;">Número de RUC (13 dígitos)</label>
                        <input type="text" id="onb-ruc" class="form-input" maxlength="13" placeholder="Ej. 1790012345001" required>
                    </div>

                    <div>
                        <label style="display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; color:#475569;">Razón Social / Nombre Comercial</label>
                        <input type="text" id="onb-nombre" class="form-input" placeholder="Ej. Mi Comercio S.A." required>
                    </div>

                    <div>
                        <label style="display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; color:#475569;">Dirección Matriz</label>
                        <input type="text" id="onb-direccion" class="form-input" value="Vía Principal SN y Calle SN, El Guabo, El Oro">
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div>
                            <label style="display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; color:#475569;">Régimen Tributario</label>
                            <select id="onb-regimen" class="form-select">
                                <option value="RIMPE_POPULAR">RIMPE Popular</option>
                                <option value="RIMPE_EMPRENDEDOR">RIMPE Emprendedor</option>
                                <option value="GENERAL">General</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; color:#475569;">Pto. Emisión</label>
                            <input type="text" id="onb-pto" class="form-input" value="001" required>
                        </div>
                    </div>

                    <div style="border-top: 1px dashed #E2E8F0; padding-top: 10px; margin-top: 4px;">
                        <label style="display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; color:#DC2626;">Firma Electrónica (.p12) *</label>
                        <input type="file" id="onb-p12" accept=".p12,.pfx" style="font-size: 11px; margin-top: 4px; width: 100%;">
                        <div style="display: flex; gap: 8px; margin-top: 6px;">
                            <input type="password" id="onb-clave" class="form-input" placeholder="Contraseña de tu firma" style="flex:1;">
                            <button type="button" onclick="window.appState.testSignature()" style="padding: 8px 12px; background:#16A34A; color:#fff; border:none; border-radius:10px; font-weight:800; font-size:12px; cursor:pointer; white-space:nowrap;">Probar firma</button>
                        </div>
                        <div id="onb-firma-status" style="font-size: 11px; font-weight: 800; color:#64748B; margin-top:4px;">&nbsp;</div>
                    </div>

                    <div style="display: flex; gap: 8px; margin-top: 10px;">
                        <button type="button" onclick="window.appState.closeOnboardingModal()" style="flex: 1; padding: 12px; background: #F1F5F9; color: #475569; border: 1px solid #CBD5E1; border-radius: 12px; font-weight: 800; font-size: 13px; cursor: pointer;">
                            Cancelar
                        </button>
                        <button type="submit" style="flex: 2; padding: 12px; background: #0F172A; color: white; border: none; border-radius: 12px; font-weight: 800; font-size: 13px; cursor: pointer; box-shadow: 0 4px 14px rgba(15,23,42,0.25);">
                             GUARDAR Y ACTIVAR
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}
