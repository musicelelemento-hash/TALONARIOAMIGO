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
                    <div style="font-size: 11px; color: #64748B; margin-top: 2px;">Sube tu RUC y tu firma, y ya quedaste listo para facturar.</div>
                </div>

                <!-- Zona RUC PDF -->
                <div onclick="document.getElementById('reg-ruc-file').click()"
                     style="border: 2px dashed #CBD5E1; border-radius: 14px; padding: 18px; text-align: center; cursor: pointer; background: #F8FAFC; margin-bottom: 14px;"
                     onmouseover="this.style.borderColor='#1D4ED8'; this.style.background='#FFFFFF'"
                     onmouseout="this.style.borderColor='#CBD5E1'; this.style.background='#F8FAFC'">
                    <div style="font-size: 26px;">📄</div>
                    <div style="font-weight: 800; font-size: 13px; color: #0F172A;">Subir Certificado de RUC (PDF)</div>
                    <div style="font-size: 10.5px; color: #64748B;">Autocompleta tus datos del facturador</div>
                    <input type="file" id="reg-ruc-file" accept=".pdf,application/pdf" style="display:none" onchange="window.appState.handleRegisterRucPdf(this)">
                    <div id="reg-ruc-status" style="font-size: 11px; font-weight: 800; color: #1D4ED8; margin-top: 6px;">&nbsp;</div>
                </div>

                <form onsubmit="event.preventDefault(); window.appState.handleRegister();" style="display: flex; flex-direction: column; gap: 11px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div>
                            <label style="display:block; font-size:10px; font-weight:800; text-transform:uppercase; color:#475569;">RUC</label>
                            <input type="text" id="reg-ruc" class="form-input" maxlength="13" required>
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
                        <label style="display:block; font-size:10px; font-weight:800; text-transform:uppercase; color:#475569;">Razón Social</label>
                        <input type="text" id="reg-nombre" class="form-input" required>
                    </div>
                    <div>
                        <label style="display:block; font-size:10px; font-weight:800; text-transform:uppercase; color:#475569;">Dirección Matriz</label>
                        <input type="text" id="reg-direccion" class="form-input" required>
                    </div>

                    <div style="border-top: 1px solid #E2E8F0; padding-top: 12px; margin-top: 4px;">
                        <div style="font-weight:800; font-size:12px; color:#0F172A; margin-bottom:8px;">👤 Datos de tu cuenta de acceso</div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                            <div>
                                <label style="display:block; font-size:10px; font-weight:800; text-transform:uppercase; color:#475569;">Nombre / Dueño</label>
                                <input type="text" id="reg-name" class="form-input" required>
                            </div>
                            <div>
                                <label style="display:block; font-size:10px; font-weight:800; text-transform:uppercase; color:#475569;">Contraseña</label>
                                <input type="password" id="reg-pass" class="form-input" placeholder="Mín. 6 caracteres" required>
                            </div>
                        </div>
                        <div style="margin-top:10px;">
                            <label style="display:block; font-size:10px; font-weight:800; text-transform:uppercase; color:#475569;">Correo de acceso</label>
                            <input type="email" id="reg-email" class="form-input" placeholder="tucorreo@ejemplo.com" required>
                        </div>
                    </div>

                    <div style="border-top: 1px solid #E2E8F0; padding-top: 12px; margin-top: 4px;">
                        <label style="display:block; font-size:10px; font-weight:800; text-transform:uppercase; color:#475569;">Firma Electrónica (.p12)</label>
                        <input type="file" id="reg-p12" accept=".p12,.pfx" style="font-size:11px; margin-top:4px;">
                        <div style="display:flex; gap:8px; margin-top:6px;">
                            <input type="password" id="reg-clave" class="form-input" placeholder="Contraseña de la firma" style="flex:1;">
                            <button type="button" onclick="window.appState.testRegisterSignature()" style="padding:8px 12px; background:#16A34A; color:#fff; border:none; border-radius:10px; font-weight:800; font-size:12px; cursor:pointer;">Probar firma</button>
                        </div>
                        <div id="reg-firma-status" style="font-size:11px; font-weight:800; color:#64748B; margin-top:6px;">&nbsp;</div>
                    </div>

                    <div style="background:#F0F9FF; border:1px solid #BAE6FD; border-radius:12px; padding:10px 12px;">
                        <div style="font-weight:800; font-size:12px; color:#075985;">💳 Pago / Activación</div>
                        <div style="font-size:11px; color:#0369A1;">Incluye tu lote de facturas. El pago se procesa con el botón y tu cuenta queda activa.</div>
                    </div>

                    <button type="submit" style="margin-top: 12px; padding: 15px; background: #0F172A; color:#fff; border:none; border-radius: 12px; font-weight: 800; font-size: 14px; cursor: pointer; box-shadow: 0 8px 20px rgba(15,23,42,0.26);">
                        🚀 CREAR MI FACTURADOR + PAGAR
                    </button>
                    <button type="button" onclick="window.appState.openLogin()" style="padding: 8px; background: transparent; color: #1D4ED8; border:none; font-weight:800; font-size: 12px; cursor:pointer;">¿Ya tienes cuenta? Inicia sesión</button>
                </form>
            </div>
        </div>
    `;
}
