/**
 * Componente: LoginScreen
 * Pantalla de inicio de sesión optimizada para móviles con estética analógica
 */
export function renderLoginScreen(onLoginSubmit) {
    return `
        <div class="factura-talonario-container" style="max-width: 400px; margin: 20px auto; padding: 28px 20px;">
            <div style="text-align: center; margin-bottom: 24px;">
                <div style="width: 48px; height: 48px; background: #D90429; color: white; border-radius: 10px; font-weight: 800; font-size: 24px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 8px; box-shadow: 0 4px 0 #1A1A1A;">TA</div>
                <h1 style="font-family: var(--font-serif-header); font-size: 24px; font-weight: 800; color: var(--ink-black);">Talonario Amigo</h1>
                <p style="font-size: 11px; color: #57534E; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-top: 2px;">Facturación Electrónica Ecuador</p>
            </div>

            <form id="login-form" onsubmit="event.preventDefault(); window.appState.handleLogin();" style="display: flex; flex-direction: column; gap: 14px;">
                <div>
                    <label style="display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px;">Correo / RUC</label>
                    <input type="text" id="login-email" class="cliente-line-input" style="width: 100%; border: 1.5px solid #1A1A1A; border-radius: 8px; padding: 10px; background: #FAF8F2;" value="usuario@ejemplo.com" required>
                </div>

                <div>
                    <label style="display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px;">Contraseña</label>
                    <input type="password" id="login-pass" class="cliente-line-input" style="width: 100%; border: 1.5px solid #1A1A1A; border-radius: 8px; padding: 10px; background: #FAF8F2;" value="12345678" required>
                </div>

                <button type="submit" style="margin-top: 10px; padding: 14px; background: #0F172A; color: white; border: 2px solid #0F172A; border-radius: 10px; font-weight: 800; font-size: 14px; cursor: pointer; box-shadow: 0 4px 0 #D4CEBE;">
                    🔑 INGRESAR AL TALONARIO
                </button>
            </form>
        </div>
    `;
}
