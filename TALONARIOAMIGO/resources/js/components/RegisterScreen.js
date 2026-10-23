/**
 * Componente: RegisterScreen
 * Auto-registro para usuarios normales: crea su cuenta CLIENT y su facturador listo
 * (subir Certificado de RUC + firma .p12 + pago/activación).
 */
export function renderRegisterScreen() {
    return `
        <div style="min-height: 100vh; display: flex; align-items: flex-start; justify-content: center; padding: 24px 16px;">
            <div style="width: 100%; max-width: 520px; background: #FFFFFF; border-radius: 20px; padding: 26px; box-shadow: 0 24px 60px rgba(0,9,26,0.4);">

                <div style="text-align: center; margin-bottom: 16px;">
                    <div style="width: 48px; height: 48px; margin: 0 auto 8px; background: linear-gradient(135deg, #1E293B, #0F172A); color: #fff; border-radius: 12px; font-weight: 800; font-size: 20px; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(15,23,42,0.3);">TA</div>
                    <div style="font-weight: 800; font-size: 17px; color: #0F172A;">Crea tu facturador en minutos</div>
                    <div style="font-size: 11px; color: #64748B; margin-top: 2px;">Sube tu RUC o llena tus datos y queda listo para facturar.</div>
                </div>

                <!-- Zona RUC PDF -->
                <div onclick="document.getElementById('reg-ruc-file').click()"
                     style="border: 2px dashed #CBD5E1; border-radius: 14px; padding: 18px; text-align: center; cursor: pointer; background: #F8FAFC; margin-bottom: 14px; transition: all 0.2s ease;"
                     onmouseover="this.style.borderColor='#10B981'; this.style.background='#FFFFFF'"
                     onmouseout="this.style.borderColor='#CBD5E1'; this.style.background='#F8FAFC'">
                    <div style="display:flex;justify-content:center;color:#64748B;">
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/></svg>
                    </div>
                    <div style="font-weight: 800; font-size: 13px; color: #0F172A;">Subir Certificado de RUC (PDF)</div>
                    <div style="font-size: 10.5px; color: #64748B;">Autocompleta tus datos del facturador al instante</div>
                    <input type="file" id="reg-ruc-file" accept=".pdf,application/pdf" style="display:none" onchange="window.appState.handleRegisterRucPdf(this)">
                    <div id="reg-ruc-status" style="font-size: 11px; font-weight: 800; color: #10B981; margin-top: 6px;">&nbsp;</div>
                </div>

                <form id="register-merchant-form" onsubmit="event.preventDefault(); window.appState.handleRegister();" style="display: flex; flex-direction: column; gap: 11px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div>
                            <label style="display:block; font-size:10px; font-weight:800; text-transform:uppercase; color:#475569;">RUC (13 dígitos)</label>
                            <input type="text" id="reg-ruc" class="form-input" maxlength="13" placeholder="Ej. 0928374615001" required>
                        </div>
                        <div>
                            <label style="display:block; font-size:10px; font-weight:800; text-transform:uppercase; color:#475569;">Régimen</label>
                            <select id="reg-regimen" class="form-select">
                                <option value="RIMPE_POPULAR">RIMPE Popular</option>
                                <option value="RIMPE_EMPRENDEDOR">RIMPE Emprendedor</option>
                                <option value="GENERAL">General</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style="display:block; font-size:10px; font-weight:800; text-transform:uppercase; color:#475569;">Razón Social / Negocio</label>
                        <input type="text" id="reg-nombre" class="form-input" placeholder="Ej. Abarrotes Don Carlos" required>
                    </div>
                    <div>
                        <label style="display:block; font-size:10px; font-weight:800; text-transform:uppercase; color:#475569;">Dirección Matriz</label>
                        <input type="text" id="reg-direccion" class="form-input" placeholder="Ej. Av. 9 de Octubre y Boyacá, Guayaquil" required>
                    </div>

                    <div style="border-top: 1px solid #E2E8F0; padding-top: 12px; margin-top: 4px;">
                        <div style="font-weight:800; font-size:12px; color:#0F172A; margin-bottom:8px;">Datos de tu cuenta de acceso</div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                            <div>
                                <label style="display:block; font-size:10px; font-weight:800; text-transform:uppercase; color:#475569;">Nombre del Dueño</label>
                                <input type="text" id="reg-name" class="form-input" placeholder="Ej. Carlos Zambrano" required>
                            </div>
                            <div>
                                <label style="display:block; font-size:10px; font-weight:800; text-transform:uppercase; color:#475569;">Contraseña</label>
                                <input type="password" id="reg-pass" class="form-input" placeholder="Mín. 6 caracteres" required>
                            </div>
                        </div>
                        <div style="margin-top:10px;">
                            <label style="display:block; font-size:10px; font-weight:800; text-transform:uppercase; color:#475569;">Correo de acceso</label>
                            <input type="email" id="reg-email" class="form-input" placeholder="carlos@ejemplo.com" required>
                        </div>
                    </div>

                    <div style="border-top: 1px solid #E2E8F0; padding-top: 12px; margin-top: 4px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <label style="display:block; font-size:10px; font-weight:800; text-transform:uppercase; color:#475569;">Firma Electrónica (.p12) <span style="color:#64748B; font-weight:600;">(Opcional ahora)</span></label>
                            <span style="font-size:9.5px; color:#10B981; font-weight:700;">Puedes vincularla después</span>
                        </div>
                        <input type="file" id="reg-p12" accept=".p12,.pfx" style="font-size:11px; margin-top:4px;">
                        <div style="display:flex; gap:8px; margin-top:6px;">
                            <input type="password" id="reg-clave" class="form-input" placeholder="Contraseña de la firma (si la subes ahora)" style="flex:1;">
                            <button type="button" onclick="window.appState.testRegisterSignature()" style="padding:8px 12px; background:#16A34A; color:#fff; border:none; border-radius:10px; font-weight:800; font-size:12px; cursor:pointer;">Probar firma</button>
                        </div>
                        <div id="reg-firma-status" style="font-size:11px; font-weight:800; color:#64748B; margin-top:6px;">&nbsp;</div>
                    </div>

                    <div style="background:#F0FDF4; border:1px solid #BBF7D0; border-radius:12px; padding:12px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <div style="font-weight:800; font-size:12px; color:#166534;">Activación Inmediata con 50 Facturas</div>
                            <span style="background:#16A34A; color:#FFFFFF; font-size:9.5px; font-weight:900; padding:2px 8px; border-radius:999px;">GRATIS HOY</span>
                        </div>
                        <div style="font-size:11px; color:#15803D;">Incluye tu primer bloc físico-digital de 50 facturas listo para usar. Tu cuenta queda activa al instante sin tarjetas obligatorias.</div>
                    </div>

                    <div id="reg-error-msg" style="display:none; background:#FEF2F2; border:1px solid #FCA5A5; color:#991B1B; padding:8px 12px; border-radius:8px; font-size:11.5px; font-weight:700;"></div>

                    <button type="submit" id="btn-submit-register" style="margin-top: 10px; padding: 15px; background: #0F172A; color:#fff; border:none; border-radius: 12px; font-weight: 800; font-size: 14px; cursor: pointer; box-shadow: 0 8px 20px rgba(15,23,42,0.26); display:flex; align-items:center; justify-content:center; gap:8px; transition: all 0.2s ease;">
                        <span>CREAR MI FACTURADOR + PAGAR</span>
                    </button>
                    <button type="button" onclick="window.appState.openLogin()" style="padding: 8px; background: transparent; color: #1D4ED8; border:none; font-weight:800; font-size: 12px; cursor:pointer;">¿Ya tienes cuenta? Inicia sesión</button>
                </form>
            </div>
        </div>
    `;
}
