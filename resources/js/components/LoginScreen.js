/**
 * Componente: LoginScreen — Portal de Élite & Captación de Clientes
 * Diseñado con estándares de ultra lujo (Apple / Linear / Stripe).
 * Comunica la misión estratégica:
 * "No vendemos software aburrido. Vendemos la tranquilidad de seguir usando tu talonario de papel de toda la vida."
 */

export function renderLoginScreen() {
    return `
        <div style="min-height: 100vh; width: 100%; display: flex; flex-direction: column; background: radial-gradient(circle at 50% 20%, #1E293B 0%, #0F172A 100%); color: #F8FAFC; overflow-x: hidden;">
            
            <!-- Navbar Superior de Élite -->
            <header style="width: 100%; padding: 16px 24px; border-bottom: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(16px); background: rgba(15,23,42,0.85); display: flex; justify-content: space-between; align-items: center; box-sizing: border-box; position: sticky; top: 0; z-index: 100;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #38BDF8, #1D4ED8); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 18px; color: #FFFFFF; box-shadow: 0 4px 14px rgba(56,189,248,0.35);">
                        TA
                    </div>
                    <div>
                        <div style="font-size: 16px; font-weight: 800; letter-spacing: -0.02em; color: #FFFFFF; display: flex; align-items: center; gap: 6px;">
                            Talonario Amigo <span style="font-size: 10px; background: rgba(16,185,129,0.2); color: #34D399; border: 1px solid #10B981; border-radius: 999px; padding: 1px 7px; font-weight: 800;">SRI ECUADOR</span>
                        </div>
                        <div style="font-size: 11px; color: #94A3B8;">Facturador Táctil Realista · Suite Web & Tablet</div>
                    </div>
                </div>

                <div style="display: flex; align-items: center; gap: 10px;">
                    <button type="button" onclick="window.appState.enterDemoMode()" class="btn-demo-live-nav" title="Prueba el talonario táctil de inmediato sin registrarte">
                        <span class="live-dot-pulse"></span>
                        <span>🏪 Probar Talonario en Vivo</span>
                        <span class="demo-tag-free">Sin Registro · Gratis</span>
                    </button>
                </div>
            </header>

            <!-- Hero Grid Principal (Captación de Clientes) -->
            <main style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 32px 16px; box-sizing: border-box;">
                <div style="width: 100%; max-width: 1060px; display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 36px; align-items: center;">
                    
                    <!-- Columna Izquierda: Propuesta de Valor de Ultra Lujo -->
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <div style="display: inline-flex; align-items: center; gap: 8px; width: fit-content; background: rgba(56,189,248,0.12); border: 1px solid rgba(56,189,248,0.3); border-radius: 999px; padding: 4px 14px; font-size: 11px; font-weight: 800; color: #38BDF8;">
                            <span>✨ CERO SOFTWARE COMPLICADO</span>
                            <span style="opacity: 0.5;">•</span>
                            <span>SIEMPRE PAPEL</span>
                        </div>

                        <h1 style="font-family: var(--font-serif-header); font-size: clamp(26px, 4vw, 38px); font-weight: 900; line-height: 1.15; color: #FFFFFF; margin: 0;">
                            La tranquilidad de seguir usando tu <span style="background: linear-gradient(135deg, #FDE68A, #F59E0B); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">talonario de toda la vida</span>.
                        </h1>

                        <p style="font-size: 14px; color: #94A3B8; line-height: 1.6; margin: 0;">
                            Diseñado exactamente como tu bloc físico de papel marfil con lomo engomado, desprendimiento 3D y copia azul autocopiativa. Emite al SRI en 5 segundos sin tocar un teclado.
                        </p>

                        <!-- Tarjetas de Capacidades Élite -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 6px;">
                            <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px 14px;">
                                <div style="font-size: 20px; margin-bottom: 4px;">🎙️</div>
                                <div style="font-size: 12px; font-weight: 800; color: #FFFFFF;">Dictado por Voz Inteligente</div>
                                <div style="font-size: 11px; color: #94A3B8; margin-top: 2px;">Di Cédula, Nombre, Teléfono o Productos con manos libres.</div>
                            </div>

                            <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px 14px;">
                                <div style="font-size: 20px; margin-bottom: 4px;">📷</div>
                                <div style="font-size: 12px; font-weight: 800; color: #FFFFFF;">Escáner OCR por Gravedad</div>
                                <div style="font-size: 11px; color: #94A3B8; margin-top: 2px;">Foto a la Cédula, RUC o proforma y los datos caen sobre las líneas.</div>
                            </div>

                            <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px 14px;">
                                <div style="font-size: 20px; margin-bottom: 4px;">📴</div>
                                <div style="font-size: 12px; font-weight: 800; color: #FFFFFF;">100% Offline Rural</div>
                                <div style="font-size: 11px; color: #94A3B8; margin-top: 2px;">Factura en carreteras o fincas; sincroniza al volver la señal.</div>
                            </div>

                            <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px 14px;">
                                <div style="font-size: 20px; margin-bottom: 4px;">🏢</div>
                                <div style="font-size: 12px; font-weight: 800; color: #FFFFFF;">Red de Imprentas Aliadas</div>
                                <div style="font-size: 11px; color: #94A3B8; margin-top: 2px;">Tu imprenta te entrega tu talonario digital listo para facturar.</div>
                            </div>
                        </div>

                        <!-- CTA Estelar Demostración Abierta -->
                        <div style="margin-top: 8px;">
                            <button type="button" onclick="window.appState.enterDemoMode()" class="btn-hero-demo-glow">
                                <span style="font-size: 26px;">🏪</span>
                                <div style="text-align: left;">
                                    <div style="font-size: 15px; font-weight: 900; letter-spacing: -0.01em;">PROBAR TALONARIO TÁCTIL EN VIVO ➔</div>
                                    <div style="font-size: 11px; opacity: 0.95; font-weight: 700; color: #ECFDF5; margin-top: 2px;">Acceso Inmediato · Cero Registro · Prueba dictado por voz y desprendimiento 3D</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    <!-- Columna Derecha: Tarjeta de Acceso Seguro / Registro -->
                    <div style="background: #FFFFFF; border-radius: 20px; padding: 32px 28px; box-shadow: 0 25px 60px rgba(0,0,0,0.6); color: #0F172A;">
                        <div style="text-align: center; margin-bottom: 22px;">
                            <h2 style="font-family: var(--font-serif-header); font-size: 22px; font-weight: 900; color: #0F172A; margin: 0;">
                                Ingreso a tu Mostrador
                            </h2>
                            <p style="font-size: 12px; color: #64748B; margin-top: 4px;">
                                Inicia sesión con tus credenciales o accede al modo demo
                            </p>
                        </div>

                        <form id="login-form" onsubmit="event.preventDefault(); window.appState.handleLogin();" style="display: flex; flex-direction: column; gap: 16px;">
                            <div>
                                <label style="display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px; color: #475569;">
                                    Correo / RUC
                                </label>
                                <input type="text" id="login-email" placeholder="usuario@ejemplo.com" value="usuario@ejemplo.com"
                                    style="width: 100%; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 12px 14px; font-size: 14px; font-family: var(--font-sans); color: #0F172A; background: #F8FAFC; outline: none; box-sizing: border-box; transition: all .15s ease;" required
                                    onfocus="this.style.borderColor='#1D4ED8'; this.style.background='#FFFFFF'; this.style.boxShadow='0 0 0 3px rgba(29,78,216,0.15)';"
                                    onblur="this.style.borderColor='#E2E8F0'; this.style.background='#F8FAFC'; this.style.boxShadow='none';">
                            </div>

                            <div>
                                <label style="display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px; color: #475569;">
                                    Contraseña
                                </label>
                                <input type="password" id="login-pass" placeholder="••••••••" value="12345678"
                                    style="width: 100%; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 12px 14px; font-size: 14px; font-family: var(--font-sans); color: #0F172A; background: #F8FAFC; outline: none; box-sizing: border-box; transition: all .15s ease;" required
                                    onfocus="this.style.borderColor='#1D4ED8'; this.style.background='#FFFFFF'; this.style.boxShadow='0 0 0 3px rgba(29,78,216,0.15)';"
                                    onblur="this.style.borderColor='#E2E8F0'; this.style.background='#F8FAFC'; this.style.boxShadow='none';">
                            </div>

                            <button type="submit" style="margin-top: 6px; padding: 14px; background: #0F172A; color: #FFFFFF; border: none; border-radius: 12px; font-weight: 800; font-size: 14px; letter-spacing: 0.3px; cursor: pointer; box-shadow: 0 8px 20px rgba(15,23,42,0.3); transition: all .18s cubic-bezier(.16,1,.3,1);">
                                🔑 INGRESAR AL TALONARIO
                            </button>

                            <div style="display: flex; align-items: center; gap: 10px; margin: 4px 0;">
                                <div style="flex: 1; height: 1px; background: #E2E8F0;"></div>
                                <span style="font-size: 11px; font-weight: 700; color: #94A3B8; text-transform: uppercase;">o prueba directa</span>
                                <div style="flex: 1; height: 1px; background: #E2E8F0;"></div>
                            </div>

                            <button type="button" onclick="window.appState.enterDemoMode()" style="padding: 13px; background: #F0FDF4; border: 1.5px solid #86EFAC; color: #15803D; border-radius: 12px; font-weight: 800; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all .15s ease;">
                                🏪 Abrir Mostrador Tablet (Demostración Directa)
                            </button>

                            <button type="button" onclick="window.appState.openRegister()" style="padding: 6px; background: transparent; color: #1D4ED8; border: none; font-weight: 800; font-size: 12px; cursor: pointer;">
                                ¿Eres comerciante nuevo? Crea tu facturador en 1 minuto
                            </button>
                        </form>
                    </div>

                </div>
            </main>

            <!-- Footer Sobrio -->
            <footer style="padding: 20px 24px; text-align: center; font-size: 11px; color: #64748B; border-top: 1px solid rgba(255,255,255,0.06); background: rgba(15,23,42,0.9);">
                Talonario Amigo · Ecuador 2026 · Cumplimiento Técnico SRI Res. NAC-DGERCGC18-00000431 · XAdES-BES & Criptografía Local Zero-Trust
            </footer>

        </div>
    `;
}
