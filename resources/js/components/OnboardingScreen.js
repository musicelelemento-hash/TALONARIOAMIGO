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
                    <div style="font-size: 30px;">📄</div>
                    <div style="font-weight: 800; font-size: 13px; color: #0F172A; margin-top: 4px;">Subir Certificado de RUC (PDF)</div>
                    <div style="font-size: 11px; color: #64748B; margin-top: 2px;">Toca para seleccionar el PDF oficial del SRI</div>
                    <input type="file" id="onb-ruc-file" accept=".pdf,application/pdf" style="display:none" onchange="window.appState.handleRucPdf(this)">
                    <div id="onb-ruc-status" style="font-size: 11px; font-weight: 800; color: #1D4ED8; margin-top: 8px;">&nbsp;</div>
                </div>

                <form onsubmit="event.preventDefault(); window.appState.saveOnboarding();" style="display: flex; flex-direction: column; gap: 12px;">
                    <div>
                        <label style="display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; color:#475569;">Número de RUC (13 dígitos)</label>
                        <input type="text" id="onb-ruc" class="form-input" value="0706050986001" maxlength="13" required>
                    </div>

                    <div>
                        <label style="display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; color:#475569;">Razón Social / Nombre Comercial</label>
                        <input type="text" id="onb-nombre" class="form-input" value="Carlos Alexander Balladares Gómez" required>
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
                        ✅ COMPLETAR CONFIGURACIÓN Y ACTIVAR
                    </button>
                </form>
            </div>
        </div>
    `;
}
