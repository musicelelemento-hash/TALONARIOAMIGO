/**
 * Componente: LoginScreen
 * Pantalla de inicio de sesión con estética premium (Apple/Linear/Stripe), optimizada para móviles.
 */
export function renderLoginScreen(onLoginSubmit) {
    return `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px;">
            <div style="width: 100%; max-width: 380px; background: #FFFFFF; border-radius: 20px; padding: 32px 26px; box-shadow: 0 24px 60px rgba(0,9,26,0.55);">
                <div style="text-align: center; margin-bottom: 26px;">
                    <div style="width: 52px; height: 52px; margin: 0 auto 12px; background: linear-gradient(135deg, #1E293B, #0F172A); color: #FFFFFF; border-radius: 14px; font-weight: 800; font-size: 22px; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(15,23,42,0.3);">TA</div>
                    <h1 style="font-family: var(--font-serif-header); font-size: 22px; font-weight: 800; color: #0F172A; margin: 0;">Talonario Amigo</h1>
                    <p style="font-size: 11px; color: #64748B; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-top: 4px;">Facturación Electrónica Ecuador</p>
                </div>

                <form id="login-form" onsubmit="event.preventDefault(); window.appState.handleLogin();" style="display: flex; flex-direction: column; gap: 16px;">
                    <div>
                        <label style="display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px; color: #475569;">Correo / RUC</label>
                        <input type="text" id="login-email" placeholder="usuario@ejemplo.com" value="usuario@ejemplo.com"
                            style="width: 100%; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 14px; font-size: 14px; font-family: var(--font-sans); color: #0F172A; background: #F8FAFC; outline: none; box-sizing: border-box; transition: border-color .15s ease, box-shadow .15s ease;" required
                            onfocus="this.style.borderColor='#1D4ED8'; this.style.background='#FFFFFF'"
                            onblur="this.style.borderColor='#E2E8F0'; this.style.background='#F8FAFC'">
                    </div>

                    <div>
                        <label style="display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px; color: #475569;">Contraseña</label>
                        <input type="password" id="login-pass" placeholder="••••••••" value="12345678"
                            style="width: 100%; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 14px; font-size: 14px; font-family: var(--font-sans); color: #0F172A; background: #F8FAFC; outline: none; box-sizing: border-box; transition: border-color .15s ease, box-shadow .15s ease;" required
                            onfocus="this.style.borderColor='#1D4ED8'; this.style.background='#FFFFFF'"
                            onblur="this.style.borderColor='#E2E8F0'; this.style.background='#F8FAFC'">
                    </div>

                    <button type="submit" style="margin-top: 6px; padding: 14px; background: #0F172A; color: #FFFFFF; border: none; border-radius: 12px; font-weight: 800; font-size: 14px; letter-spacing: 0.3px; cursor: pointer; box-shadow: 0 8px 20px rgba(15,23,42,0.28); transition: all .18s cubic-bezier(.16,1,.3,1);">
                        🔑 INGRESAR AL TALONARIO
                    </button>

                    <button type="button" onclick="window.appState.enterDemoMode()" style="padding: 12px; background: #F0FDF4; border: 1.5px solid #86EFAC; color: #15803D; border-radius: 12px; font-weight: 800; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all .15s ease;">
                        🏪 Abrir Mostrador Tablet (Demostración Directa)
                    </button>

                    <button type="button" onclick="window.appState.openRegister()" style="padding: 8px; background: transparent; color: #1D4ED8; border: none; font-weight: 800; font-size: 12px; cursor: pointer;">¿Nuevo aquí? Crea tu facturador en 1 minuto</button>
                </form>
            </div>
        </div>
    `;
}
