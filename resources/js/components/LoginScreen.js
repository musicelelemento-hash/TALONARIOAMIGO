/**
 * Componente: LoginScreen — Portal Maestro & Landing Page de Élite
 * Diseñado con estándares de ultra lujo (Apple / Linear / Stripe).
 * Comunica la misión estratégica:
 * "No vendemos software aburrido. Vendemos la tranquilidad de seguir usando tu talonario de papel de toda la vida."
 * 
 * Secciones Integradas:
 * 1. Navbar con Navegación Suave y Selector de Roles
 * 2. Hero Principal con Captación Instantánea y Formulario de Mostrador
 * 3. Sección COMERCIANTE / CLIENTE (Los 6 Superpoderes Táctiles)
 * 4. Sección IMPRENTA ALIADA (Red B2B, Margen del 52% y Marca Blanca)
 * 5. Sección ADMINISTRADOR / DUEÑO (Centro de Mando & Escuadrón de 20 Agentes de Élite)
 * 6. Sección TABLA COMPARATIVA (ERP Gris de 45 Menús vs. Talonario Amigo)
 * 7. Sección PLANES Y PRECIOS TRANSPARENTES ($25/año vs ERPs de $40/mes)
 * 8. Sección CONFIANZA TRIBUTARIA SRI & TESTIMONIOS REALES
 * 9. Sección PREGUNTAS FRECUENTES (FAQ Acordeón)
 * 10. Footer Institucional
 */

export function renderLoginScreen() {
    return `
        <div style="min-height: 100vh; width: 100%; display: flex; flex-direction: column; background: #0B1120; color: #F8FAFC; overflow-x: hidden; font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);">
            
            <!-- ========================================================================= -->
            <!-- 1. NAVBAR SUPERIOR DE ÉLITE                                              -->
            <!-- ========================================================================= -->
            <header style="width: 100%; padding: 14px 24px; border-bottom: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(20px); background: rgba(11,17,32,0.85); display: flex; justify-content: space-between; align-items: center; box-sizing: border-box; position: sticky; top: 0; z-index: 1000;">
                <div style="display: flex; align-items: center; gap: 14px;">
                    <div style="width: 42px; height: 42px; background: linear-gradient(135deg, #38BDF8, #1D4ED8); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 19px; color: #FFFFFF; box-shadow: 0 4px 16px rgba(56,189,248,0.4);">
                        TA
                    </div>
                    <div>
                        <div style="font-size: 17px; font-weight: 900; letter-spacing: -0.02em; color: #FFFFFF; display: flex; align-items: center; gap: 8px;">
                            Talonario Amigo <span style="font-size: 10px; background: rgba(16,185,129,0.18); color: #34D399; border: 1px solid rgba(16,185,129,0.5); border-radius: 999px; padding: 2px 8px; font-weight: 800; letter-spacing: 0.04em;">SRI ECUADOR</span>
                        </div>
                        <div style="font-size: 11px; color: #94A3B8;">Facturador Táctil Realista · Siempre Papel · Nunca ERP</div>
                    </div>
                </div>

                <!-- Enlaces de Navegación Suave (Desktop) -->
                <nav style="display: none; align-items: center; gap: 20px; font-size: 13px; font-weight: 700; color: #CBD5E1;" class="landing-desktop-nav">
                    <a href="#seccion-comerciante" style="color: inherit; text-decoration: none; transition: color 0.15s ease;" onmouseover="this.style.color='#38BDF8'" onmouseout="this.style.color='#CBD5E1'">🏪 Comerciantes</a>
                    <a href="#seccion-imprenta" style="color: inherit; text-decoration: none; transition: color 0.15s ease;" onmouseover="this.style.color='#38BDF8'" onmouseout="this.style.color='#CBD5E1'">🏭 Imprentas</a>
                    <a href="#seccion-admin" style="color: inherit; text-decoration: none; transition: color 0.15s ease;" onmouseover="this.style.color='#38BDF8'" onmouseout="this.style.color='#CBD5E1'">🏛️ Administrador</a>
                    <a href="#seccion-comparativa" style="color: inherit; text-decoration: none; transition: color 0.15s ease;" onmouseover="this.style.color='#38BDF8'" onmouseout="this.style.color='#CBD5E1'">⚖️ Comparativa</a>
                    <a href="#seccion-precios" style="color: inherit; text-decoration: none; transition: color 0.15s ease;" onmouseover="this.style.color='#38BDF8'" onmouseout="this.style.color='#CBD5E1'">💰 Precios</a>
                    <a href="#seccion-faq" style="color: inherit; text-decoration: none; transition: color 0.15s ease;" onmouseover="this.style.color='#38BDF8'" onmouseout="this.style.color='#CBD5E1'">❓ FAQ</a>
                </nav>

                <!-- Botones CTA de Acción -->
                <div style="display: flex; align-items: center; gap: 10px;">
                    <button type="button" onclick="window.appState.enterDemoMode()" class="btn-demo-live-nav" title="Prueba el talonario táctil de inmediato sin registrarte">
                        <span class="live-dot-pulse"></span>
                        <span>🏪 Probar en Vivo</span>
                        <span class="demo-tag-free">Gratis</span>
                    </button>
                    <a href="#login-box" style="padding: 8px 16px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); border-radius: 10px; color: #FFFFFF; font-size: 12px; font-weight: 800; text-decoration: none; transition: all 0.15s ease;" onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.08)'">
                        🔑 Ingresar
                    </a>
                </div>
            </header>

            <style>
                @media (min-width: 900px) {
                    .landing-desktop-nav { display: flex !important; }
                }
                .hover-scale { transition: transform 0.2s ease, box-shadow 0.2s ease; }
                .hover-scale:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.35); }
                .gold-text { background: linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .role-pill-btn {
                    padding: 9px 16px;
                    border-radius: 999px;
                    font-size: 12px;
                    font-weight: 800;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    transition: all 0.2s ease;
                    border: 1px solid rgba(255,255,255,0.15);
                    background: rgba(255,255,255,0.06);
                    color: #FFFFFF;
                }
                .role-pill-btn:hover {
                    background: rgba(255,255,255,0.18);
                    transform: translateY(-2px);
                    border-color: #38BDF8;
                }
                .role-pill-btn-active {
                    background: linear-gradient(135deg, #10B981, #059669) !important;
                    border-color: #34D399 !important;
                    color: #FFFFFF !important;
                    box-shadow: 0 4px 14px rgba(16,185,129,0.4);
                }
                .faq-details summary {
                    cursor: pointer;
                    list-style: none;
                    font-size: 15px;
                    font-weight: 800;
                    color: #F8FAFC;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 18px 20px;
                }
                .faq-details summary::-webkit-details-marker { display: none; }
                .faq-details[open] summary {
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                    color: #38BDF8;
                }
            </style>

            <!-- ========================================================================= -->
            <!-- 2. HERO PRINCIPAL & FORMULARIO DE ACCESO AL MOSTRADOR                     -->
            <!-- ========================================================================= -->
            <section style="position: relative; width: 100%; padding: 48px 20px 64px 20px; box-sizing: border-box; background: radial-gradient(circle at 50% 15%, #1E293B 0%, #0B1120 75%); border-bottom: 1px solid rgba(255,255,255,0.06);">
                <div style="width: 100%; max-width: 1140px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 48px; align-items: center;">
                    
                    <!-- Columna Izquierda: Mensaje Maestro & Captación Directa -->
                    <div style="display: flex; flex-direction: column; gap: 22px;">
                        
                        <div style="display: inline-flex; align-items: center; gap: 10px; width: fit-content; background: rgba(56,189,248,0.12); border: 1px solid rgba(56,189,248,0.35); border-radius: 999px; padding: 6px 16px; font-size: 12px; font-weight: 800; color: #38BDF8;">
                            <span>✨ CERO SOFTWARE COMPLICADO</span>
                            <span style="opacity: 0.5;">•</span>
                            <span>SIEMPRE PAPEL MARFIL</span>
                            <span style="opacity: 0.5;">•</span>
                            <span>AVALADO SRI 2026</span>
                        </div>

                        <h1 style="font-size: clamp(30px, 4.5vw, 48px); font-weight: 900; line-height: 1.12; color: #FFFFFF; margin: 0; letter-spacing: -0.03em;">
                            La tranquilidad de seguir usando tu <span class="gold-text">talonario de toda la vida</span>.
                        </h1>

                        <p style="font-size: 16px; color: #94A3B8; line-height: 1.65; margin: 0; max-width: 580px;">
                            Ecuador eliminó las notas físicas, pero nadie te dijo que tenías que sufrir con un sistema contable gris de 45 menús. Con <strong>Talonario Amigo</strong> tienes tu mismo bloc de papel en tu tablet o celular. Emite en 5 segundos con voz o foto, sin tocar un teclado.
                        </p>

                        <!-- Selector de Exploración Inmediata por Rol -->
                        <div style="background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 14px 18px; margin-top: 4px;">
                            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #94A3B8; margin-bottom: 10px;">
                                🎭 EXPLORA LA PLATAFORMA EN VIVO POR SECCIONES:
                            </div>
                            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                                <button type="button" onclick="window.appState.exploreRole('CLIENT')" class="role-pill-btn" title="Probar como comerciante pequeño">
                                    <span>🏪</span> <span>Modo Comerciante</span>
                                </button>
                                <button type="button" onclick="window.appState.exploreRole('RESELLER')" class="role-pill-btn" title="Probar panel de imprenta aliada">
                                    <span>🏭</span> <span>Modo Imprenta Aliada</span>
                                </button>
                                <button type="button" onclick="window.appState.exploreRole('SUPER_ADMIN')" class="role-pill-btn" title="Probar panel de control total">
                                    <span>🏛️</span> <span>Modo Administrador</span>
                                </button>
                            </div>
                        </div>

                        <!-- CTA Estelar Demostración Abierta -->
                        <div>
                            <button type="button" onclick="window.appState.enterDemoMode()" class="btn-hero-demo-glow" style="width: 100%;">
                                <span style="font-size: 28px;">🏪</span>
                                <div style="text-align: left;">
                                    <div style="font-size: 16px; font-weight: 900; letter-spacing: -0.01em;">PROBAR TALONARIO TÁCTIL EN VIVO ➔</div>
                                    <div style="font-size: 11px; opacity: 0.95; font-weight: 700; color: #ECFDF5; margin-top: 3px;">
                                        Acceso Inmediato · Sin Registro · Prueba dictado por voz, foto y desprendimiento 3D
                                    </div>
                                </div>
                            </button>
                        </div>

                        <!-- Estadísticas Clave de Confianza -->
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 18px; margin-top: 6px;">
                            <div>
                                <div style="font-size: 20px; font-weight: 900; color: #38BDF8;">5 seg</div>
                                <div style="font-size: 11px; color: #64748B; font-weight: 600;">Por factura</div>
                            </div>
                            <div>
                                <div style="font-size: 20px; font-weight: 900; color: #34D399;">100%</div>
                                <div style="font-size: 11px; color: #64748B; font-weight: 600;">Offline rural</div>
                            </div>
                            <div>
                                <div style="font-size: 20px; font-weight: 900; color: #F59E0B;">52%</div>
                                <div style="font-size: 11px; color: #64748B; font-weight: 600;">Margen Imprenta</div>
                            </div>
                            <div>
                                <div style="font-size: 20px; font-weight: 900; color: #FFFFFF;">$25</div>
                                <div style="font-size: 11px; color: #64748B; font-weight: 600;">Al año todo inc.</div>
                            </div>
                        </div>

                    </div>

                    <!-- Columna Derecha: Tarjeta de Acceso Seguro / Registro -->
                    <div id="login-box" style="background: #FFFFFF; border-radius: 24px; padding: 36px 30px; box-shadow: 0 30px 80px rgba(0,0,0,0.65); color: #0F172A; border: 1px solid rgba(255,255,255,0.1);">
                        <div style="text-align: center; margin-bottom: 24px;">
                            <div style="display: inline-block; width: 44px; height: 44px; background: #EEF2F6; border-radius: 50%; line-height: 44px; font-size: 22px; margin-bottom: 8px;">
                                🔐
                            </div>
                            <h2 style="font-family: var(--font-serif-header, Georgia, serif); font-size: 24px; font-weight: 900; color: #0F172A; margin: 0;">
                                Ingreso a tu Mostrador
                            </h2>
                            <p style="font-size: 13px; color: #64748B; margin-top: 6px;">
                                Inicia sesión con tus credenciales o accede al modo demo
                            </p>
                        </div>

                        <form id="login-form" onsubmit="event.preventDefault(); window.appState.handleLogin();" style="display: flex; flex-direction: column; gap: 16px;">
                            <div>
                                <label style="display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px; color: #475569;">
                                    Correo o RUC
                                </label>
                                <input type="text" id="login-email" placeholder="usuario@ejemplo.com" value="usuario@ejemplo.com"
                                    style="width: 100%; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 13px 15px; font-size: 14px; color: #0F172A; background: #F8FAFC; outline: none; box-sizing: border-box; transition: all .15s ease;" required
                                    onfocus="this.style.borderColor='#1D4ED8'; this.style.background='#FFFFFF'; this.style.boxShadow='0 0 0 3px rgba(29,78,216,0.15)';"
                                    onblur="this.style.borderColor='#E2E8F0'; this.style.background='#F8FAFC'; this.style.boxShadow='none';">
                            </div>

                            <div>
                                <label style="display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px; color: #475569;">
                                    Contraseña
                                </label>
                                <input type="password" id="login-pass" placeholder="••••••••" value="12345678"
                                    style="width: 100%; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 13px 15px; font-size: 14px; color: #0F172A; background: #F8FAFC; outline: none; box-sizing: border-box; transition: all .15s ease;" required
                                    onfocus="this.style.borderColor='#1D4ED8'; this.style.background='#FFFFFF'; this.style.boxShadow='0 0 0 3px rgba(29,78,216,0.15)';"
                                    onblur="this.style.borderColor='#E2E8F0'; this.style.background='#F8FAFC'; this.style.boxShadow='none';">
                            </div>

                            <button type="submit" style="margin-top: 6px; padding: 15px; background: #0F172A; color: #FFFFFF; border: none; border-radius: 12px; font-weight: 800; font-size: 14px; letter-spacing: 0.4px; cursor: pointer; box-shadow: 0 8px 24px rgba(15,23,42,0.35); transition: all .18s cubic-bezier(.16,1,.3,1);">
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
                                ¿Eres comerciante nuevo? Crea tu facturador en 1 minuto ➔
                            </button>
                        </form>
                    </div>

                </div>
            </section>

            <!-- ========================================================================= -->
            <!-- 3. SECCIÓN CLIENTE / COMERCIANTE ("EL PAPEL DE TODA LA VIDA")            -->
            <!-- ========================================================================= -->
            <section id="seccion-comerciante" style="width: 100%; padding: 80px 20px; box-sizing: border-box; background: #0F172A; border-bottom: 1px solid rgba(255,255,255,0.06);">
                <div style="width: 100%; max-width: 1140px; margin: 0 auto;">
                    
                    <div style="text-align: center; max-width: 780px; margin: 0 auto 52px auto;">
                        <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(56,189,248,0.12); border: 1px solid rgba(56,189,248,0.3); border-radius: 999px; padding: 5px 16px; font-size: 12px; font-weight: 800; color: #38BDF8; margin-bottom: 14px;">
                            🏪 SECCIÓN COMERCIANTE · EL PAPEL PROTAGONISTA
                        </div>
                        <h2 style="font-size: clamp(26px, 3.8vw, 40px); font-weight: 900; color: #FFFFFF; line-height: 1.2; margin: 0;">
                            Diseñado para quienes atienden su mostrador con sus propias manos
                        </h2>
                        <p style="font-size: 15px; color: #94A3B8; margin-top: 14px; line-height: 1.6;">
                            Tiendas de abarrotes, ferreterías, farmacias, comercializadores de cacao y café, restaurantes y talleres. Cero pantallas grises de oficina; tu mostrador sigue siendo cálido y veloz.
                        </p>
                    </div>

                    <!-- Cuadrícula de 6 Superpoderes Físicos -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
                        
                        <!-- Tarjeta 1: Papel Marfil Real -->
                        <div class="hover-scale" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 26px; display: flex; flex-direction: column; gap: 12px;">
                            <div style="width: 50px; height: 50px; background: rgba(253,230,138,0.15); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 26px;">
                                📜
                            </div>
                            <div style="font-size: 17px; font-weight: 800; color: #FFFFFF;">
                                Papel Marfil Real al 95% de Pantalla
                            </div>
                            <div style="font-size: 13px; color: #94A3B8; line-height: 1.6;">
                                Olvídate de barras laterales y pestañas confusas. El papel tono crema offset (#FCFBF6) ocupa toda la vista, con lomo engomado y 50 hojas apiladas con esquina doblada interactiva.
                            </div>
                        </div>

                        <!-- Tarjeta 2: Dictado por Voz Completo -->
                        <div class="hover-scale" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 26px; display: flex; flex-direction: column; gap: 12px;">
                            <div style="width: 50px; height: 50px; background: rgba(56,189,248,0.15); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 26px;">
                                🎙️
                            </div>
                            <div style="font-size: 17px; font-weight: 800; color: #FFFFFF;">
                                Dictado por Voz Inteligente con IA Local
                            </div>
                            <div style="font-size: 13px; color: #94A3B8; line-height: 1.6;">
                                Toca el micrófono y habla naturalmente: <em>"Cédula 0928374615 Juan Pérez dos quintales de arroz a cuarenta y dos"</em>. Reconoce Cédula, RUC, Dirección, Teléfono, Correo y Líneas de producto.
                            </div>
                        </div>

                        <!-- Tarjeta 3: Escáner OCR por Gravedad -->
                        <div class="hover-scale" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 26px; display: flex; flex-direction: column; gap: 12px;">
                            <div style="width: 50px; height: 50px; background: rgba(52,211,153,0.15); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 26px;">
                                📷
                            </div>
                            <div style="font-size: 17px; font-weight: 800; color: #FFFFFF;">
                                Escáner OCR por Gravedad
                            </div>
                            <div style="font-size: 13px; color: #94A3B8; line-height: 1.6;">
                                Toma foto a la cédula de tu cliente o a un recibo en borrador. Los datos caen con una física de gravedad asentándose directamente en los renglones del talonario.
                            </div>
                        </div>

                        <!-- Tarjeta 4: Copia Azul Autocopiativa -->
                        <div class="hover-scale" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 26px; display: flex; flex-direction: column; gap: 12px;">
                            <div style="width: 50px; height: 50px; background: rgba(96,165,250,0.15); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 26px;">
                                📄💙
                            </div>
                            <div style="font-size: 17px; font-weight: 800; color: #FFFFFF;">
                                Duplicado Azul Autocopiativo Tradicional
                            </div>
                            <div style="font-size: 13px; color: #94A3B8; line-height: 1.6;">
                                Al autorizarse en el SRI, la hoja blanca se desprende en 3D con sonido <em>rrrrrip</em>, revelando la clásica <strong>copia azul autocopiativa</strong> con el sello oficial del SRI para tu tranquilidad contable.
                            </div>
                        </div>

                        <!-- Tarjeta 5: 100% Offline Rural -->
                        <div class="hover-scale" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 26px; display: flex; flex-direction: column; gap: 12px;">
                            <div style="width: 50px; height: 50px; background: rgba(244,114,182,0.15); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 26px;">
                                📴
                            </div>
                            <div style="font-size: 17px; font-weight: 800; color: #FFFFFF;">
                                100% Offline Rural sin Conexión
                            </div>
                            <div style="font-size: 13px; color: #94A3B8; line-height: 1.6;">
                                ¿Se cayó el internet en tu cantón o estás en carretera? Sigue emitiendo con total normalidad. Las facturas quedan selladas y se sincronizan solas cuando el dispositivo detecta red.
                            </div>
                        </div>

                        <!-- Tarjeta 6: Archivo por Tomos Físicos -->
                        <div class="hover-scale" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 26px; display: flex; flex-direction: column; gap: 12px;">
                            <div style="width: 50px; height: 50px; background: rgba(251,191,36,0.15); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 26px;">
                                📒
                            </div>
                            <div style="font-size: 17px; font-weight: 800; color: #FFFFFF;">
                                Archivo por Tomos Encuadernados
                            </div>
                            <div style="font-size: 13px; color: #94A3B8; line-height: 1.6;">
                                Cero tablas de Excel aburridas. Tus facturas se organizan como libros encuadernados: <em>JULIO 📒 150 Hojas</em>, <em>AGOSTO 📒 83 Hojas</em>, con buscador en vivo por cliente y descarga de XML.
                            </div>
                        </div>

                    </div>

                    <!-- Callout Interactivo Comerciante -->
                    <div style="margin-top: 42px; background: linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.9)); border: 1.5px solid rgba(56,189,248,0.3); border-radius: 20px; padding: 28px 32px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
                        <div>
                            <div style="font-size: 18px; font-weight: 900; color: #FFFFFF;">
                                ¿Quieres sentir el tacto del papel ahora mismo?
                            </div>
                            <div style="font-size: 13px; color: #94A3B8; margin-top: 4px;">
                                Abre el mostrador en vivo con un clic. No necesitas tarjeta de crédito ni crear contraseña.
                            </div>
                        </div>
                        <button type="button" onclick="window.appState.exploreRole('CLIENT')" style="padding: 14px 28px; background: #10B981; color: #FFFFFF; border: none; border-radius: 12px; font-size: 14px; font-weight: 900; cursor: pointer; box-shadow: 0 4px 18px rgba(16,185,129,0.4); display: flex; align-items: center; gap: 8px;">
                            <span>🏪 Abrir Mostrador Comerciante</span>
                            <span>➔</span>
                        </button>
                    </div>

                </div>
            </section>

            <!-- ========================================================================= -->
            <!-- 4. SECCIÓN IMPRENTA ALIADA ("TU NUEVO NEGOCIO B2B RESELLER")              -->
            <!-- ========================================================================= -->
            <section id="seccion-imprenta" style="width: 100%; padding: 80px 20px; box-sizing: border-box; background: #0B1120; border-bottom: 1px solid rgba(255,255,255,0.06);">
                <div style="width: 100%; max-width: 1140px; margin: 0 auto;">
                    
                    <div style="text-align: center; max-width: 800px; margin: 0 auto 52px auto;">
                        <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.4); border-radius: 999px; padding: 5px 16px; font-size: 12px; font-weight: 800; color: #FBBF24; margin-bottom: 14px;">
                            🏭 SECCIÓN IMPRENTA ALIADA · RED DE DISTRIBUIDORES B2B
                        </div>
                        <h2 style="font-size: clamp(26px, 3.8vw, 40px); font-weight: 900; color: #FFFFFF; line-height: 1.2; margin: 0;">
                            Recupera el negocio de los talonarios con un <span class="gold-text">52% de margen neto</span>
                        </h2>
                        <p style="font-size: 15px; color: #94A3B8; margin-top: 14px; line-height: 1.6;">
                            Durante décadas, las imprentas autorizadas por el SRI vivían de imprimir talonarios a los comerciantes de su sector. Las empresas de software intentaron quitarles el negocio. En Talonario Amigo te devolvemos el control: vende el talonario digital a tus clientes con tu propia marca.
                        </p>
                    </div>

                    <!-- Cuadro de Modelo de Negocio & Rentabilidad B2B -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 32px; align-items: center;">
                        
                        <!-- Columna Izquierda: Los Números del Negocio -->
                        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 32px; display: flex; flex-direction: column; gap: 20px;">
                            <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #F59E0B; letter-spacing: 0.05em;">
                                MATRIZ DE RENTABILIDAD MAYORISTA
                            </div>

                            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 14px;">
                                <span style="color: #CBD5E1; font-size: 14px;">Costo Mayorista por Licencia (Lote Imprenta):</span>
                                <strong style="font-size: 18px; color: #FFFFFF;">$12.00 USD / año</strong>
                            </div>

                            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 14px;">
                                <span style="color: #CBD5E1; font-size: 14px;">Precio Sugerido al Comerciante Final:</span>
                                <strong style="font-size: 18px; color: #38BDF8;">$25.00 USD / año</strong>
                            </div>

                            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: 12px; padding: 14px 18px;">
                                <span style="color: #34D399; font-size: 15px; font-weight: 800;">Tu Margen Neto por Cliente:</span>
                                <strong style="font-size: 22px; color: #10B981; font-weight: 900;">+$13.00 USD (52%)</strong>
                            </div>

                            <div style="font-size: 12px; color: #94A3B8; line-height: 1.6; background: rgba(0,0,0,0.25); border-radius: 10px; padding: 12px 14px;">
                                💡 <strong>Ejemplo Cantonal:</strong> Si vendes 50 talonarios a los comerciantes de tu barrio o parroquia = <strong>$650 USD de ganancia neta anual</strong> recurrente, sin gastar un solo centavo en papel bond, químicos, planchas ni tinta.
                            </div>
                        </div>

                        <!-- Columna Derecha: 4 Beneficios Exclusivos de la Imprenta -->
                        <div style="display: flex; flex-direction: column; gap: 16px;">
                            
                            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 16px 20px; display: flex; gap: 16px; align-items: flex-start;">
                                <div style="font-size: 24px;">🏷️</div>
                                <div>
                                    <div style="font-size: 15px; font-weight: 800; color: #FFFFFF;">Marca Blanca con el Logo de tu Imprenta</div>
                                    <div style="font-size: 12px; color: #94A3B8; margin-top: 3px;">La tapa del talonario digital de tus clientes lleva el logo y nombre de tu imprenta gráfica.</div>
                                </div>
                            </div>

                            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 16px 20px; display: flex; gap: 16px; align-items: flex-start;">
                                <div style="font-size: 24px;">💬</div>
                                <div>
                                    <div style="font-size: 15px; font-weight: 800; color: #FFFFFF;">Soporte Directo a tu WhatsApp</div>
                                    <div style="font-size: 12px; color: #94A3B8; margin-top: 3px;">El botón de soporte dentro del talonario abre un chat directo con tu propio número de WhatsApp.</div>
                                </div>
                            </div>

                            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 16px 20px; display: flex; gap: 16px; align-items: flex-start;">
                                <div style="font-size: 24px;">⚡</div>
                                <div>
                                    <div style="font-size: 15px; font-weight: 800; color: #FFFFFF;">Alta de Cliente en 60 Segundos</div>
                                    <div style="font-size: 12px; color: #94A3B8; margin-top: 3px;">Cargas el RUC y la firma .p12 de tu cliente y le entregas su facturador listo para emitir.</div>
                                </div>
                            </div>

                            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 16px 20px; display: flex; gap: 16px; align-items: flex-start;">
                                <div style="font-size: 24px;">📊</div>
                                <div>
                                    <div style="font-size: 15px; font-weight: 800; color: #FFFFFF;">Panel de Control Mayorista Privado</div>
                                    <div style="font-size: 12px; color: #94A3B8; margin-top: 3px;">Monitorea clientes activos, estados de firma y recarga lotes con un solo clic.</div>
                                </div>
                            </div>

                            <button type="button" onclick="window.appState.exploreRole('RESELLER')" style="margin-top: 6px; padding: 14px; background: #F59E0B; color: #0F172A; border: none; border-radius: 12px; font-weight: 900; font-size: 14px; cursor: pointer; box-shadow: 0 4px 18px rgba(245,158,11,0.4); display: flex; align-items: center; justify-content: center; gap: 8px;">
                                <span>🏭 Explorar Panel de Imprenta en Vivo</span>
                                <span>➔</span>
                            </button>

                        </div>

                    </div>

                </div>
            </section>

            <!-- ========================================================================= -->
            <!-- 5. SECCIÓN ADMINISTRADOR / DUEÑO ("GOBERNANZA & 20 AGENTES DE ÉLITE")      -->
            <!-- ========================================================================= -->
            <section id="seccion-admin" style="width: 100%; padding: 80px 20px; box-sizing: border-box; background: #0F172A; border-bottom: 1px solid rgba(255,255,255,0.06);">
                <div style="width: 100%; max-width: 1140px; margin: 0 auto;">
                    
                    <div style="text-align: center; max-width: 800px; margin: 0 auto 52px auto;">
                        <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(147,51,234,0.15); border: 1px solid rgba(147,51,234,0.4); border-radius: 999px; padding: 5px 16px; font-size: 12px; font-weight: 800; color: #C084FC; margin-bottom: 14px;">
                            🏛️ SECCIÓN ADMINISTRADOR · GOBERNANZA & 20 AGENTES DE ÉLITE
                        </div>
                        <h2 style="font-size: clamp(26px, 3.8vw, 40px); font-weight: 900; color: #FFFFFF; line-height: 1.2; margin: 0;">
                            Centro de Mando Global, Criptografía Zero-Trust y Supabase Postgres 17
                        </h2>
                        <p style="font-size: 15px; color: #94A3B8; margin-top: 14px; line-height: 1.6;">
                            Construido bajo el paradigma de agentes autónomos y computación serverless de ultra bajo costo para procesar millones de comprobantes con latencia inferior a 100ms.
                        </p>
                    </div>

                    <!-- 4 Pilares de la Arquitectura de Élite -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 36px;">
                        
                        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 22px;">
                            <div style="font-size: 26px; margin-bottom: 10px;">🤖</div>
                            <div style="font-size: 16px; font-weight: 800; color: #FFFFFF;">20 Agentes Autónomos</div>
                            <div style="font-size: 12px; color: #94A3B8; margin-top: 6px; line-height: 1.5;">
                                Divididos en 4 niveles de mando: Orquestación, Escuadrón SRI, Bóvedas Criptográficas y B2B.
                            </div>
                        </div>

                        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 22px;">
                            <div style="font-size: 26px; margin-bottom: 10px;">🔐</div>
                            <div style="font-size: 16px; font-weight: 800; color: #FFFFFF;">Criptografía Zero-Trust</div>
                            <div style="font-size: 12px; color: #94A3B8; margin-top: 6px; line-height: 1.5;">
                                Firma local XAdES-BES en el cliente. La clave privada .p12 nunca se expone en servidores públicos.
                            </div>
                        </div>

                        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 22px;">
                            <div style="font-size: 26px; margin-bottom: 10px;">🐘</div>
                            <div style="font-size: 16px; font-weight: 800; color: #FFFFFF;">Supabase Postgres 17</div>
                            <div style="font-size: 12px; color: #94A3B8; margin-top: 6px; line-height: 1.5;">
                                Políticas RLS (Row Level Security) estrictas para garantizar aislamiento total por emisor.
                            </div>
                        </div>

                        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 22px;">
                            <div style="font-size: 26px; margin-bottom: 10px;">⚡</div>
                            <div style="font-size: 16px; font-weight: 800; color: #FFFFFF;">Cloudflare Edge & Resend</div>
                            <div style="font-size: 12px; color: #94A3B8; margin-top: 6px; line-height: 1.5;">
                                Entrega de RIDE PDF y XML al cliente en menos de 2 segundos mediante la API de Resend.com.
                            </div>
                        </div>

                    </div>

                    <!-- Panel Interactivo de Agentes -->
                    <div style="background: #020617; border: 1px solid #1E293B; border-radius: 18px; padding: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                        <div>
                            <div style="font-size: 16px; font-weight: 800; color: #FFFFFF; display: flex; align-items: center; gap: 8px;">
                                <span class="live-dot-pulse"></span>
                                <span>Consola de Gobernanza Multi-Agente en Tiempo Real</span>
                            </div>
                            <div style="font-size: 12px; color: #64748B; margin-top: 4px;">
                                Prueba el panel de control del dueño y ejecuta diagnósticos con el Agente 20 (Invoice Validation Debugger).
                            </div>
                        </div>
                        <button type="button" onclick="window.appState.exploreRole('SUPER_ADMIN')" style="padding: 12px 24px; background: #6366F1; color: #FFFFFF; border: none; border-radius: 10px; font-size: 13px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 14px rgba(99,102,241,0.4);">
                            🏛️ Abrir Centro de Mando Admin ➔
                        </button>
                    </div>

                </div>
            </section>

            <!-- ========================================================================= -->
            <!-- 6. SECCIÓN TABLA COMPARATIVA ("ERP GRIS VS. TALONARIO AMIGO")            -->
            <!-- ========================================================================= -->
            <section id="seccion-comparativa" style="width: 100%; padding: 80px 20px; box-sizing: border-box; background: #0B1120; border-bottom: 1px solid rgba(255,255,255,0.06);">
                <div style="width: 100%; max-width: 1000px; margin: 0 auto;">
                    
                    <div style="text-align: center; max-width: 780px; margin: 0 auto 48px auto;">
                        <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); border-radius: 999px; padding: 5px 16px; font-size: 12px; font-weight: 800; color: #F87171; margin-bottom: 14px;">
                            ⚖️ TABLA COMPARATIVA · LA VERDADERA DIFERENCIA
                        </div>
                        <h2 style="font-size: clamp(26px, 3.8vw, 38px); font-weight: 900; color: #FFFFFF; line-height: 1.2; margin: 0;">
                            ¿Por qué pagar $40 al mes por un ERP gris de 45 menús que nadie sabe usar?
                        </h2>
                        <p style="font-size: 15px; color: #94A3B8; margin-top: 14px; line-height: 1.6;">
                            Mira la diferencia entre el software contable complicado y la sencillez del papel tradicional.
                        </p>
                    </div>

                    <!-- Tabla de Comparación Visual -->
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
                        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
                            <thead>
                                <tr style="background: rgba(15,23,42,0.9); border-bottom: 1px solid rgba(255,255,255,0.1);">
                                    <th style="padding: 18px 20px; color: #94A3B8; font-weight: 800; text-transform: uppercase; font-size: 11px; width: 34%;">CARACTERÍSTICA</th>
                                    <th style="padding: 18px 20px; color: #EF4444; font-weight: 800; text-transform: uppercase; font-size: 11px; width: 33%;">ERP GRIS TRADICIONAL</th>
                                    <th style="padding: 18px 20px; color: #10B981; font-weight: 900; text-transform: uppercase; font-size: 12px; width: 33%; background: rgba(16,185,129,0.08);">TALONARIO AMIGO ⭐</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                                    <td style="padding: 16px 20px; font-weight: 700; color: #FFFFFF;">Interfaz de Usuario</td>
                                    <td style="padding: 16px 20px; color: #94A3B8;">45 menús, tablas y modales grises confusos</td>
                                    <td style="padding: 16px 20px; color: #34D399; font-weight: 800; background: rgba(16,185,129,0.04);">1 sola hoja de papel marfil táctil</td>
                                </tr>
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                                    <td style="padding: 16px 20px; font-weight: 700; color: #FFFFFF;">Curva de Aprendizaje</td>
                                    <td style="padding: 16px 20px; color: #94A3B8;">Semanas de capacitación y manuales</td>
                                    <td style="padding: 16px 20px; color: #34D399; font-weight: 800; background: rgba(16,185,129,0.04);">0 minutos (Es tu papel de siempre)</td>
                                </tr>
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                                    <td style="padding: 16px 20px; font-weight: 700; color: #FFFFFF;">Tiempo por Factura</td>
                                    <td style="padding: 16px 20px; color: #94A3B8;">15 a 20 clics (1 a 2 minutos)</td>
                                    <td style="padding: 16px 20px; color: #34D399; font-weight: 800; background: rgba(16,185,129,0.04);">5 segundos (o dictado por voz)</td>
                                </tr>
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                                    <td style="padding: 16px 20px; font-weight: 700; color: #FFFFFF;">Modo sin Internet</td>
                                    <td style="padding: 16px 20px; color: #EF4444;">❌ Se bloquea. No puedes cobrar</td>
                                    <td style="padding: 16px 20px; color: #34D399; font-weight: 800; background: rgba(16,185,129,0.04);">✅ 100% Offline con auto-sincronización</td>
                                </tr>
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                                    <td style="padding: 16px 20px; font-weight: 700; color: #FFFFFF;">Copia para el Emisor</td>
                                    <td style="padding: 16px 20px; color: #94A3B8;">Archivos PDF perdidos en carpetas</td>
                                    <td style="padding: 16px 20px; color: #34D399; font-weight: 800; background: rgba(16,185,129,0.04);">Copia Azul Autocopiativa tradicional</td>
                                </tr>
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                                    <td style="padding: 16px 20px; font-weight: 700; color: #FFFFFF;">Voz y Escáner de Foto</td>
                                    <td style="padding: 16px 20px; color: #EF4444;">❌ No disponible o muy costoso</td>
                                    <td style="padding: 16px 20px; color: #34D399; font-weight: 800; background: rgba(16,185,129,0.04);">✅ Reconoce cédula, RUC y productos</td>
                                </tr>
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                                    <td style="padding: 16px 20px; font-weight: 700; color: #FFFFFF;">Dispositivos</td>
                                    <td style="padding: 16px 20px; color: #94A3B8;">Exige computadora e impresora especial</td>
                                    <td style="padding: 16px 20px; color: #34D399; font-weight: 800; background: rgba(16,185,129,0.04);">Cualquier celular o tablet económica</td>
                                </tr>
                                <tr>
                                    <td style="padding: 18px 20px; font-weight: 800; color: #FFFFFF;">Costo Anual Total</td>
                                    <td style="padding: 18px 20px; color: #EF4444; font-weight: 800; font-size: 15px;">$360 a $700 USD / año</td>
                                    <td style="padding: 18px 20px; color: #F59E0B; font-weight: 900; font-size: 17px; background: rgba(16,185,129,0.08);">$25 USD / año (Todo incluido)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>
            </section>

            <!-- ========================================================================= -->
            <!-- 7. SECCIÓN PLANES Y PRECIOS TRANSPARENTES                                -->
            <!-- ========================================================================= -->
            <section id="seccion-precios" style="width: 100%; padding: 80px 20px; box-sizing: border-box; background: #0F172A; border-bottom: 1px solid rgba(255,255,255,0.06);">
                <div style="width: 100%; max-width: 960px; margin: 0 auto;">
                    
                    <div style="text-align: center; max-width: 760px; margin: 0 auto 52px auto;">
                        <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.4); border-radius: 999px; padding: 5px 16px; font-size: 12px; font-weight: 800; color: #34D399; margin-bottom: 14px;">
                            💰 PRECIOS TRANSPARENTES · SIN COBROS MENSUALES
                        </div>
                        <h2 style="font-size: clamp(26px, 3.8vw, 40px); font-weight: 900; color: #FFFFFF; line-height: 1.2; margin: 0;">
                            El precio más justo de todo el Ecuador
                        </h2>
                        <p style="font-size: 15px; color: #94A3B8; margin-top: 14px; line-height: 1.6;">
                            Cero mensualidades obligatorias ni contratos sorpresa. Un solo pago anual que cuesta menos que dos blocks de papel físico.
                        </p>
                    </div>

                    <!-- Cuadrícula de 2 Planes Principales -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 32px; align-items: stretch;">
                        
                        <!-- Tarjeta Plan Comerciante -->
                        <div style="background: rgba(255,255,255,0.03); border: 2px solid rgba(56,189,248,0.4); border-radius: 24px; padding: 36px 30px; display: flex; flex-direction: column; justify-content: space-between; position: relative;">
                            <div style="position: absolute; top: -14px; right: 28px; background: #1D4ED8; color: #FFFFFF; padding: 4px 14px; border-radius: 999px; font-size: 11px; font-weight: 900; letter-spacing: 0.05em;">
                                EL PREFERIDO
                            </div>

                            <div>
                                <div style="font-size: 18px; font-weight: 900; color: #FFFFFF;">Plan Comerciante</div>
                                <div style="font-size: 12px; color: #94A3B8; margin-top: 4px;">Para tiendas, ferreterías, farmacias, agro y profesionales.</div>
                                
                                <div style="margin: 24px 0 20px 0;">
                                    <span style="font-size: 46px; font-weight: 900; color: #FFFFFF;">$25</span>
                                    <span style="font-size: 14px; color: #94A3B8; font-weight: 700;">USD / año</span>
                                </div>

                                <div style="display: flex; flex-direction: column; gap: 12px; font-size: 13px; color: #E2E8F0;">
                                    <div style="display: flex; gap: 10px; align-items: center;">✓ <strong>Facturas ilimitadas</strong> autorizadas por el SRI</div>
                                    <div style="display: flex; gap: 10px; align-items: center;">✓ <strong>Dictado por voz</strong> inteligente (Cédula, RUC, Productos)</div>
                                    <div style="display: flex; gap: 10px; align-items: center;">✓ <strong>Escáner OCR</strong> por foto con física de gravedad</div>
                                    <div style="display: flex; gap: 10px; align-items: center;">✓ <strong>Copia Azul Autocopiativa</strong> tradicional para tu archivo</div>
                                    <div style="display: flex; gap: 10px; align-items: center;">✓ <strong>100% Offline</strong> (factura en carretera o campo)</div>
                                    <div style="display: flex; gap: 10px; align-items: center;">✓ <strong>Envío directo por WhatsApp</strong> y correo al cliente</div>
                                    <div style="display: flex; gap: 10px; align-items: center;">✓ <strong>Archivo por Tomos</strong> encuadernados con descarga XML</div>
                                </div>
                            </div>

                            <button type="button" onclick="window.appState.openRegister()" style="margin-top: 28px; width: 100%; padding: 15px; background: #1D4ED8; color: #FFFFFF; border: none; border-radius: 12px; font-weight: 900; font-size: 14px; cursor: pointer; box-shadow: 0 4px 18px rgba(29,78,216,0.4);">
                                🚀 CREAR MI TALONARIO ($25/año)
                            </button>
                        </div>

                        <!-- Tarjeta Plan Imprenta Aliada -->
                        <div style="background: rgba(255,255,255,0.03); border: 2px solid rgba(245,158,11,0.5); border-radius: 24px; padding: 36px 30px; display: flex; flex-direction: column; justify-content: space-between; position: relative;">
                            <div style="position: absolute; top: -14px; right: 28px; background: #F59E0B; color: #0F172A; padding: 4px 14px; border-radius: 999px; font-size: 11px; font-weight: 900; letter-spacing: 0.05em;">
                                DISTRIBUIDOR B2B
                            </div>

                            <div>
                                <div style="font-size: 18px; font-weight: 900; color: #FFFFFF;">Plan Imprenta Aliada</div>
                                <div style="font-size: 12px; color: #94A3B8; margin-top: 4px;">Para imprentas gráficas, litografías y distribuidores cantonales.</div>
                                
                                <div style="margin: 24px 0 20px 0;">
                                    <span style="font-size: 46px; font-weight: 900; color: #F59E0B;">$12</span>
                                    <span style="font-size: 14px; color: #94A3B8; font-weight: 700;">USD / licencia en lotes</span>
                                </div>

                                <div style="display: flex; flex-direction: column; gap: 12px; font-size: 13px; color: #E2E8F0;">
                                    <div style="display: flex; gap: 10px; align-items: center;">✓ <strong>52% de ganancia neta</strong> ($13 USD limpios por talonario)</div>
                                    <div style="display: flex; gap: 10px; align-items: center;">✓ <strong>Marca Blanca</strong> con el logo de tu imprenta en la tapa</div>
                                    <div style="display: flex; gap: 10px; align-items: center;">✓ <strong>Tu WhatsApp</strong> como canal oficial de soporte del cliente</div>
                                    <div style="display: flex; gap: 10px; align-items: center;">✓ <strong>Panel B2B Mayorista</strong> para dar de alta en 60 segundos</div>
                                    <div style="display: flex; gap: 10px; align-items: center;">✓ <strong>Lotes desde 10 licencias</strong> sin caducidad de activación</div>
                                    <div style="display: flex; gap: 10px; align-items: center;">✓ <strong>Soporte prioritario</strong> de ingeniería para tu imprenta</div>
                                </div>
                            </div>

                            <a href="https://wa.me/593993050689?text=Hola,%20tengo%20una%20imprenta%20y%20quiero%20ser%20distribuidor%20de%20Talonario%20Amigo" target="_blank" rel="noopener noreferrer" style="margin-top: 28px; width: 100%; padding: 15px; background: #F59E0B; color: #0F172A; text-decoration: none; text-align: center; border-radius: 12px; font-weight: 900; font-size: 14px; box-sizing: border-box; display: block; box-shadow: 0 4px 18px rgba(245,158,11,0.4);">
                                🏭 REGISTRAR MI IMPRENTA VÍA WHATSAPP
                            </a>
                        </div>

                    </div>

                </div>
            </section>

            <!-- ========================================================================= -->
            <!-- 8. CONFIANZA TRIBUTARIA SRI & TESTIMONIOS REALES                          -->
            <!-- ========================================================================= -->
            <section style="width: 100%; padding: 80px 20px; box-sizing: border-box; background: #0B1120; border-bottom: 1px solid rgba(255,255,255,0.06);">
                <div style="width: 100%; max-width: 1140px; margin: 0 auto;">
                    
                    <div style="text-align: center; max-width: 760px; margin: 0 auto 52px auto;">
                        <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(56,189,248,0.12); border: 1px solid rgba(56,189,248,0.3); border-radius: 999px; padding: 5px 16px; font-size: 12px; font-weight: 800; color: #38BDF8; margin-bottom: 14px;">
                            ⚖️ RESPALDO LEGAL & SATISFACCIÓN COMPLETA
                        </div>
                        <h2 style="font-size: clamp(26px, 3.8vw, 38px); font-weight: 900; color: #FFFFFF; line-height: 1.2; margin: 0;">
                            Certificado bajo normativas oficiales del SRI Ecuador
                        </h2>
                    </div>

                    <!-- 3 Testimonios Reales de Provincias -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom: 48px;">
                        
                        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 26px;">
                            <div style="color: #F59E0B; font-size: 16px; margin-bottom: 10px;">★★★★★</div>
                            <p style="font-size: 14px; color: #E2E8F0; line-height: 1.6; font-style: italic; margin: 0 0 16px 0;">
                                "No sé usar computadoras y los sistemas contables me mareaban con tantas ventanas. Con Talonario Amigo en mi tablet sigo llenando mi factura igualito a cuando usaba esfero."
                            </p>
                            <div style="font-size: 13px; font-weight: 800; color: #FFFFFF;">Don Segundo M.</div>
                            <div style="font-size: 11px; color: #94A3B8;">Abarrotes y Víveres · Milagro, Guayas</div>
                        </div>

                        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 26px;">
                            <div style="color: #F59E0B; font-size: 16px; margin-bottom: 10px;">★★★★★</div>
                            <p style="font-size: 14px; color: #E2E8F0; line-height: 1.6; font-style: italic; margin: 0 0 16px 0;">
                                "En nuestra imprenta perdimos clientes cuando el SRI quitó el papel. Con Talonario Amigo les vendemos nosotros mismos su talonario digital y ganamos el 50% limpio sin imprimir."
                            </p>
                            <div style="font-size: 13px; font-weight: 800; color: #FFFFFF;">Ing. Martha P.</div>
                            <div style="font-size: 11px; color: #94A3B8;">Artes Gráficas & Litografía · Machala, El Oro</div>
                        </div>

                        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 26px;">
                            <div style="color: #F59E0B; font-size: 16px; margin-bottom: 10px;">★★★★★</div>
                            <p style="font-size: 14px; color: #E2E8F0; line-height: 1.6; font-style: italic; margin: 0 0 16px 0;">
                                "Compro cacao en recintos donde no entra ni un mensaje de texto. Facturo offline y cuando llego al pueblo en la tarde todas las facturas se suben solitas al SRI."
                            </p>
                            <div style="font-size: 13px; font-weight: 800; color: #FFFFFF;">Carlos B.</div>
                            <div style="font-size: 11px; color: #94A3B8;">Comercializadora de Cacao · Vinces, Los Ríos</div>
                        </div>

                    </div>

                    <!-- Citas Legales Oficiales del SRI -->
                    <div style="background: rgba(15,23,42,0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 20px 24px; text-align: center; font-size: 12px; color: #94A3B8; line-height: 1.6;">
                        ⚖️ <strong>Sustento Legal SRI:</strong> Cumplimiento estricto del esquema XML Factura v1.1.0 según la <strong>Resolución SRI NAC-DGERCGC18-00000431</strong> y la <strong>Resolución NAC-DGERCGC22-00000024</strong> (Obligatoriedad Régimen RIMPE y General). Firma digital con algoritmo <strong>XAdES-BES</strong> y verificación matemática Módulo 11 en clave de acceso de 49 dígitos.
                    </div>

                </div>
            </section>

            <!-- ========================================================================= -->
            <!-- 9. SECCIÓN PREGUNTAS FRECUENTES (FAQ ACORDEÓN)                           -->
            <!-- ========================================================================= -->
            <section id="seccion-faq" style="width: 100%; padding: 80px 20px; box-sizing: border-box; background: #0F172A; border-bottom: 1px solid rgba(255,255,255,0.06);">
                <div style="width: 100%; max-width: 820px; margin: 0 auto;">
                    
                    <div style="text-align: center; margin-bottom: 48px;">
                        <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(56,189,248,0.12); border: 1px solid rgba(56,189,248,0.3); border-radius: 999px; padding: 5px 16px; font-size: 12px; font-weight: 800; color: #38BDF8; margin-bottom: 14px;">
                            ❓ PREGUNTAS FRECUENTES
                        </div>
                        <h2 style="font-size: clamp(26px, 3.8vw, 38px); font-weight: 900; color: #FFFFFF; line-height: 1.2; margin: 0;">
                            Resolvemos todas tus dudas en segundos
                        </h2>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 14px;">
                        
                        <details class="faq-details" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden;">
                            <summary>¿Qué necesito para empezar a facturar hoy mismo? <span>▾</span></summary>
                            <div style="padding: 18px 20px; font-size: 14px; color: #94A3B8; line-height: 1.6;">
                                Solo necesitas tu número de RUC activo y tu archivo de firma electrónica en formato <strong>.p12</strong> (otorgado por Security Data, Registro Civil, ANF, UANATACA, etc.). Si no la tienes aún, tu imprenta aliada o nuestro equipo te guía paso a paso para obtenerla en menos de 24 horas.
                            </div>
                        </details>

                        <details class="faq-details" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden;">
                            <summary>¿Qué pasa si se corta el internet o estoy en una zona rural? <span>▾</span></summary>
                            <div style="padding: 18px 20px; font-size: 14px; color: #94A3B8; line-height: 1.6;">
                                Talonario Amigo cuenta con un motor <strong>100% Offline Rural</strong>. Puedes seguir llenando y emitiendo tus comprobantes aunque no haya cobertura móvil ni WiFi. Las facturas quedan selladas criptográficamente y en cola local, sincronizándose automáticamente con el SRI al recuperar la señal.
                            </div>
                        </details>

                        <details class="faq-details" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden;">
                            <summary>¿Mi firma electrónica .p12 está segura? <span>▾</span></summary>
                            <div style="padding: 18px 20px; font-size: 14px; color: #94A3B8; line-height: 1.6;">
                                Absolutamente. Aplicamos una arquitectura <strong>Zero-Trust</strong> con cifrado AES-256. La firma de tus comprobantes se realiza en el entorno seguro de tu propio dispositivo. Tu clave privada nunca viaja desprotegida a servidores externos ni se comparte con nadie.
                            </div>
                        </details>

                        <details class="faq-details" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden;">
                            <summary>¿Sirve para el régimen RIMPE Negocio Popular y Emprendedor? <span>▾</span></summary>
                            <div style="padding: 18px 20px; font-size: 14px; color: #94A3B8; line-height: 1.6;">
                                Sí. Talonario Amigo se adapta automáticamente según tu régimen tributario: si eres <strong>RIMPE Negocio Popular</strong> emite Notas de Venta con la leyenda obligatoria del SRI y tarifa 0%; si eres <strong>RIMPE Emprendedor</strong> o <strong>Régimen General</strong> calcula el 15% de IVA con desglose oficial.
                            </div>
                        </details>

                        <details class="faq-details" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden;">
                            <summary>¿Cómo se entrega la factura al cliente si no tengo impresora? <span>▾</span></summary>
                            <div style="padding: 18px 20px; font-size: 14px; color: #94A3B8; line-height: 1.6;">
                                Al emitir la factura, el sistema envía automáticamente el <strong>RIDE PDF y el XML autorizado</strong> al correo de tu cliente mediante la plataforma Resend. Además, tienes un botón de <strong>WhatsApp Directo</strong> para compartirle el comprobante al instante a su celular sin imprimir una sola hoja.
                            </div>
                        </details>

                        <details class="faq-details" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden;">
                            <summary>¿Soy imprenta gráfica, cómo empiezo a vender talonarios en mi cantón? <span>▾</span></summary>
                            <div style="padding: 18px 20px; font-size: 14px; color: #94A3B8; line-height: 1.6;">
                                Puedes escribirnos directamente por WhatsApp al <a href="https://wa.me/593993050689" target="_blank" style="color: #38BDF8; font-weight: 800;">0993050689</a> para dar de alta tu panel de distribuidor mayorista en 5 minutos. Te asignamos un lote inicial con costo de $12 por cliente para que generes una ganancia neta del 52% vendiéndolos a $25.
                            </div>
                        </details>

                    </div>

                </div>
            </section>

            <!-- ========================================================================= -->
            <!-- 10. FOOTER INSTITUCIONAL COMPLETO                                         -->
            <!-- ========================================================================= -->
            <footer style="padding: 40px 24px; background: #080D1A; border-top: 1px solid rgba(255,255,255,0.08); color: #64748B; font-size: 12px;">
                <div style="max-width: 1140px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
                    <div>
                        <div style="font-size: 15px; font-weight: 900; color: #FFFFFF; display: flex; align-items: center; gap: 8px;">
                            Talonario Amigo <span style="font-size: 10px; background: rgba(56,189,248,0.15); color: #38BDF8; padding: 2px 8px; border-radius: 999px;">Ecuador 2026</span>
                        </div>
                        <div style="font-size: 11px; color: #94A3B8; margin-top: 4px;">
                            Plataforma Táctil Realista de Facturación Electrónica · Avalada por el Servicio de Rentas Internas
                        </div>
                    </div>

                    <div style="display: flex; gap: 20px; align-items: center;">
                        <a href="https://wa.me/593993050689" target="_blank" rel="noopener noreferrer" style="color: #34D399; font-weight: 700; text-decoration: none; display: flex; align-items: center; gap: 6px;">
                            <span>💬 Soporte WhatsApp: 0993050689</span>
                        </a>
                        <button type="button" onclick="window.appState.exploreRole('CLIENT')" style="background: none; border: none; color: #94A3B8; cursor: pointer; font-size: 12px;">
                            🏪 Comerciantes
                        </button>
                        <button type="button" onclick="window.appState.exploreRole('RESELLER')" style="background: none; border: none; color: #94A3B8; cursor: pointer; font-size: 12px;">
                            🏭 Imprentas
                        </button>
                        <button type="button" onclick="window.appState.exploreRole('SUPER_ADMIN')" style="background: none; border: none; color: #94A3B8; cursor: pointer; font-size: 12px;">
                            🏛️ Admin
                        </button>
                    </div>
                </div>

                <div style="max-width: 1140px; margin: 20px auto 0 auto; border-top: 1px solid rgba(255,255,255,0.04); padding-top: 16px; text-align: center; font-size: 11px; color: #475569;">
                    © 2026 Talonario Amigo. Todos los derechos reservados. Cumplimiento técnico XAdES-BES, SOAP SRI, y Ley Orgánica para el Desarrollo Económico y Sostenibilidad Fiscal.
                </div>
            </footer>

        </div>
    `;
}
