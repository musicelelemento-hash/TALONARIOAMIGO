/**
 * Componente: OnboardingScreen
 * Asistente de Configuración Inicial del RUC y Firma Electrónica (.p12)
 */
export function renderOnboardingScreen() {
    return `
        <div class="factura-talonario-container" style="max-width: 480px; margin: 0 auto; padding: 24px 20px;">
            <div style="border-bottom: 2px dashed #D4CEBE; padding-bottom: 12px; margin-bottom: 16px;">
                <span style="font-family: var(--font-mono-num); font-size: 11px; font-weight: 800; color: #B45309;">PASO 1 DE 2 — CONFIGURACIÓN RUC SRI</span>
                <h2 style="font-family: var(--font-serif-header); font-size: 20px; font-weight: 800; color: #0F172A; margin-top: 4px;">Asistente Inicial de Emisor</h2>
                <p style="font-size: 11px; color: #57534E;">Ingresa tus datos tributarios para habilitar la numeración de tu talonario.</p>
            </div>

            <form onsubmit="event.preventDefault(); window.appState.saveOnboarding();" style="display: flex; flex-direction: column; gap: 12px;">
                <div>
                    <label style="display: block; font-size: 10px; font-weight: 800; text-transform: uppercase;">Número de RUC (13 dígitos)</label>
                    <input type="text" id="onb-ruc" class="cliente-line-input" style="width: 100%; border: 1.5px solid #1A1A1A; border-radius: 8px; padding: 8px; background: #FAF8F2;" value="0706050986001" required>
                </div>

                <div>
                    <label style="display: block; font-size: 10px; font-weight: 800; text-transform: uppercase;">Razón Social / Nombre Comercial</label>
                    <input type="text" id="onb-nombre" class="cliente-line-input" style="width: 100%; border: 1.5px solid #1A1A1A; border-radius: 8px; padding: 8px; background: #FAF8F2;" value="Carlos Alexander Balladares Gómez" required>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div>
                        <label style="display: block; font-size: 10px; font-weight: 800; text-transform: uppercase;">Establecimiento</label>
                        <input type="text" id="onb-estab" class="cliente-line-input" style="width: 100%; border: 1.5px solid #1A1A1A; border-radius: 8px; padding: 8px; background: #FAF8F2;" value="001" required>
                    </div>
                    <div>
                        <label style="display: block; font-size: 10px; font-weight: 800; text-transform: uppercase;">Punto Emisión</label>
                        <input type="text" id="onb-pto" class="cliente-line-input" style="width: 100%; border: 1.5px solid #1A1A1A; border-radius: 8px; padding: 8px; background: #FAF8F2;" value="001" required>
                    </div>
                </div>

                <div>
                    <label style="display: block; font-size: 10px; font-weight: 800; text-transform: uppercase;">Firma Electrónica (.p12)</label>
                    <input type="file" id="onb-p12" style="font-size: 11px; margin-top: 4px;">
                </div>

                <button type="submit" style="margin-top: 14px; padding: 14px; background: #0F172A; color: white; border: 2px solid #0F172A; border-radius: 10px; font-weight: 800; font-size: 13px; cursor: pointer;">
                    ✅ COMPLETAR CONFIGURACIÓN Y ACTIVAR
                </button>
            </form>
        </div>
    `;
}
