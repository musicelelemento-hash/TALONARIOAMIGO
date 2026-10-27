/**
 * Componente: LoginScreen — portal público y landing.
 * Diseño minimalista: una sola acento, superficies planas, iconografía SVG
 * monocroma y tipografía Outfit. Contenido íntegro de las 10 secciones.
 */

const ICONS = {
    store: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v11h16V9"/><path d="M3 9h18"/><path d="M9 20v-6h6v6"/></svg>',
    building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V7l7-4v18"/><path d="M10 21h11V11l-6-4"/><path d="M6 9v.01M6 13v.01M6 17v.01M14 13v.01M14 17v.01M18 13v.01M18 17v.01"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2V5z"/><path d="M8 3v18"/><path d="M12 7h4M12 11h4"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/></svg>',
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8a2 2 0 0 1 2-2h2l1.5-2h5L16 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z"/><circle cx="12" cy="12.5" r="3.2"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
    offline: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3l20 18"/><path d="M8.5 8.6A9 9 0 0 1 21.5 9"/><path d="M5.3 12.4A9 9 0 0 1 8 11"/><path d="M2.5 9A13 13 0 0 1 6 7.2"/><path d="M12 20h.01"/></svg>',
    archive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8"/><path d="M10 12h4"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16"/><path d="M14 6l6 6-6 6"/></svg>',
    layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></svg>',
    database: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3L10.5 13.5"/><path d="M21 3l-6.5 18-4-7.5L3 9.5 21 3z"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
};

function priceFeature(text, strong) {
    return `<li>${ICONS.check}<span>${strong ? `<strong>${strong}</strong> ` : ''}${text}</span></li>`;
}

export function renderLoginScreen() {
    return `
        <div class="landing">

            <!-- 1. Header -->
            <header class="landing-header">
                <div class="landing-wrap landing-header-inner">
                    <a class="landing-brand" href="#top">
                        <span class="landing-logo">TA</span>
                        <span>
                            <span class="landing-brand-name">Talonario Amigo</span>
                            <span class="landing-brand-sub">Facturación electrónica SRI</span>
                        </span>
                    </a>

                    <nav class="landing-nav" aria-label="Secciones">
                        <a href="#seccion-comerciante">Comerciantes</a>
                        <a href="#seccion-imprenta">Imprentas</a>
                        <a href="#seccion-admin">Administrador</a>
                        <a href="#seccion-comparativa">Comparativa</a>
                        <a href="#seccion-precios">Precios</a>
                        <a href="#seccion-faq">Preguntas</a>
                    </nav>

                    <div class="landing-actions">
                        <button type="button" class="btn btn-ghost" onclick="window.appState.enterDemoMode()">Probar en vivo</button>
                        <a class="btn btn-primary" href="#login-box">Ingresar</a>
                    </div>
                </div>
            </header>

            <!-- 2. Hero -->
            <section class="landing-hero" id="top">
                <div class="landing-wrap landing-hero-grid">
                    <div>
                        <div class="landing-meta">
                            <span>Sin menús contables</span>
                            <span>Papel marfil</span>
                            <span>Compatible SRI</span>
                        </div>

                        <h1>La tranquilidad de seguir usando tu <em>talonario de siempre</em>.</h1>

                        <p>
                            Ecuador dejó atrás las notas físicas, pero no tienes por qué aprender un sistema contable de
                            45 menús. Talonario Amigo es tu mismo bloc, en tablet o celular: emite en segundos con voz o
                            foto, sin tocar el teclado.
                        </p>

                        <div class="landing-meta" style="margin-top:24px;">
                            <span>Explorar por rol</span>
                        </div>
                        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;">
                            <button type="button" class="btn btn-ghost" onclick="window.appState.exploreRole('CLIENT')">${ICONS.store} Comerciante</button>
                            <button type="button" class="btn btn-ghost" onclick="window.appState.exploreRole('RESELLER')">${ICONS.building} Imprenta aliada</button>
                            <button type="button" class="btn btn-ghost" onclick="window.appState.exploreRole('SUPER_ADMIN')">${ICONS.shield} Administrador</button>
                        </div>

                        <div style="margin-top:24px;">
                            <button type="button" class="btn btn-primary btn-lg" onclick="window.appState.enterDemoMode()">
                                Probar el talonario ahora ${ICONS.arrow}
                            </button>
                            <div style="margin-top:10px;font-size:12px;color:var(--l-muted);">
                                Acceso inmediato, sin registro. Prueba dictado por voz, foto y desprendimiento.
                            </div>
                        </div>

                        <div class="landing-trust">
                            <div><div class="landing-trust-value">5 seg</div><div class="landing-trust-label">por factura</div></div>
                            <div><div class="landing-trust-value">100%</div><div class="landing-trust-label">offline rural</div></div>
                            <div><div class="landing-trust-value">52%</div><div class="landing-trust-label">margen imprenta</div></div>
                            <div><div class="landing-trust-value">$25</div><div class="landing-trust-label">al año, todo incluido</div></div>
                        </div>
                    </div>

                    <div class="login-card" id="login-box">
                        <div class="login-card-head">
                            <h2 class="login-card-title">Ingreso a tu mostrador</h2>
                            <p class="login-card-sub">Inicia sesión con tus credenciales o accede al modo demostración.</p>
                        </div>

                        <form id="login-form" class="login-form" onsubmit="event.preventDefault(); window.appState.handleLogin();">
                            <div class="landing-field">
                                <label for="login-email">Correo o RUC</label>
                                <input type="text" id="login-email" placeholder="usuario@ejemplo.com" value="usuario@ejemplo.com" autocomplete="username" required>
                            </div>

                            <div class="landing-field">
                                <label for="login-pass">Contraseña</label>
                                <input type="password" id="login-pass" placeholder="••••••••" value="12345678" autocomplete="current-password" required>
                            </div>

                            <button type="submit" class="btn btn-primary btn-block btn-lg">Ingresar al talonario</button>

                            <div class="login-sep">o prueba directa</div>

                            <button type="button" class="btn btn-ghost btn-block" onclick="window.appState.enterDemoMode()">
                                Abrir mostrador de demostración
                            </button>

                            <button type="button" class="btn btn-ghost btn-block" onclick="window.appState.openRegister()" style="border-color:transparent;color:var(--l-accent);">
                                Crear mi facturador en 1 minuto ${ICONS.arrow}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <!-- 3. Comerciante -->
            <section class="landing-section landing-section--alt" id="seccion-comerciante">
                <div class="landing-wrap">
                    <div class="landing-head">
                        <span class="landing-eyebrow">Comerciante · el papel protagonista</span>
                        <h2 class="landing-title">Diseñado para quienes atienden su mostrador con sus propias manos</h2>
                        <p class="landing-lead">
                            Tiendas de abarrotes, ferreterías, farmacias, comercializadores de cacao y café,
                            restaurantes y talleres. Sin pantallas grises de oficina.
                        </p>
                    </div>

                    <div class="card-grid">
                        <div class="card">
                            <div class="card-icon">${ICONS.book}</div>
                            <div class="card-title">Papel marfil al 95% de pantalla</div>
                            <div class="card-text">Sin barras laterales ni pestañas. El papel tono crema ocupa toda la vista, con lomo engomado y 50 hojas apiladas con esquina doblada interactiva.</div>
                        </div>

                        <div class="card">
                            <div class="card-icon">${ICONS.mic}</div>
                            <div class="card-title">Dictado por voz con IA local</div>
                            <div class="card-text">Toca el micrófono y habla con naturalidad. Reconoce cédula, RUC, dirección, teléfono, correo y líneas de producto.</div>
                        </div>

                        <div class="card">
                            <div class="card-icon">${ICONS.camera}</div>
                            <div class="card-title">Escáner OCR por foto</div>
                            <div class="card-text">Toma una foto a la cédula del cliente o a un recibo borrador. Los datos se asientan directamente en los renglones del talonario.</div>
                        </div>

                        <div class="card">
                            <div class="card-icon">${ICONS.copy}</div>
                            <div class="card-title">Duplicado azul autocopiativo</div>
                            <div class="card-text">Al autorizarse en el SRI, la hoja se desprende con la clásica <strong>copia azul autocopiativa</strong> y el sello oficial, para tu archivo contable.</div>
                        </div>

                        <div class="card">
                            <div class="card-icon">${ICONS.offline}</div>
                            <div class="card-title">100% offline en zonas rurales</div>
                            <div class="card-text">Si se cae el internet o estás en carretera, sigue emitiendo. Las facturas quedan selladas y se sincronizan solas al recuperar la señal.</div>
                        </div>

                        <div class="card">
                            <div class="card-icon">${ICONS.archive}</div>
                            <div class="card-title">Archivo por tomos encuadernados</div>
                            <div class="card-text">Tus facturas se organizan como libros: <em>JULIO · 150 hojas</em>, <em>AGOSTO · 83 hojas</em>, con buscador en vivo por cliente y descarga de XML.</div>
                        </div>
                    </div>

                    <div class="landing-callout">
                        <div>
                            <div class="landing-callout-title">¿Quieres sentir el tacto del papel ahora mismo?</div>
                            <div class="landing-callout-text">Abre el mostrador en vivo con un clic. Sin tarjeta ni contraseña.</div>
                        </div>
                        <button type="button" class="btn btn-primary" onclick="window.appState.exploreRole('CLIENT')">
                            Abrir mostrador ${ICONS.arrow}
                        </button>
                    </div>
                </div>
            </section>

            <!-- 4. Imprenta -->
            <section class="landing-section" id="seccion-imprenta">
                <div class="landing-wrap">
                    <div class="landing-head">
                        <span class="landing-eyebrow">Imprenta aliada · red de distribuidores</span>
                        <h2 class="landing-title">Recupera el negocio de los talonarios con un <em>52% de margen neto</em></h2>
                        <p class="landing-lead">
                            Durante décadas las imprentas autorizadas vivían de imprimir talonarios. En Talonario Amigo
                            recuperas ese control: vende el talonario digital a tus clientes con tu propia marca.
                        </p>
                    </div>

                    <div class="landing-hero-grid">
                        <div class="card">
                            <span class="landing-eyebrow" style="margin-bottom:4px;">Matriz de rentabilidad mayorista</span>
                            <div class="metric-list">
                                <div class="metric-row">
                                    <span class="metric-label">Costo mayorista por licencia (lote imprenta)</span>
                                    <span class="metric-value">$12.00 / año</span>
                                </div>
                                <div class="metric-row">
                                    <span class="metric-label">Precio sugerido al comerciante final</span>
                                    <span class="metric-value metric-value--accent">$25.00 / año</span>
                                </div>
                                <div class="metric-row">
                                    <span class="metric-label">Margen neto por cliente</span>
                                    <span class="metric-value metric-value--success">+$13.00 (52%)</span>
                                </div>
                            </div>
                            <div class="metric-note">
                                <strong>Ejemplo cantonal:</strong> 50 talonarios entre los comerciantes de tu barrio o
                                parroquia representan <strong>$650 USD de ganancia neta anual</strong>, sin gastar en papel,
                                químicos, planchas ni tinta.
                            </div>
                        </div>

                        <div class="card-grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));">
                            <div class="card">
                                <div class="card-icon">${ICONS.building}</div>
                                <div class="card-title">Marca blanca con el logo de tu imprenta</div>
                                <div class="card-text">La tapa del talonario digital de tus clientes lleva el logo y nombre de tu imprenta gráfica.</div>
                            </div>
                            <div class="card">
                                <div class="card-icon">${ICONS.send}</div>
                                <div class="card-title">Soporte directo a tu WhatsApp</div>
                                <div class="card-text">El botón de soporte dentro del talonario abre un chat directo con tu propio número.</div>
                            </div>
                            <div class="card">
                                <div class="card-icon">${ICONS.lock}</div>
                                <div class="card-title">Alta de cliente en 60 segundos</div>
                                <div class="card-text">Cargas el RUC y la firma <strong>.p12</strong> del cliente y le entregas su facturador listo para emitir.</div>
                            </div>
                            <div class="card">
                                <div class="card-icon">${ICONS.layers}</div>
                                <div class="card-title">Panel mayorista privado</div>
                                <div class="card-text">Monitorea clientes activos, estados de firma y recarga de lotes con un solo clic.</div>
                            </div>
                        </div>
                    </div>

                    <div class="landing-callout">
                        <div>
                            <div class="landing-callout-title">Explora el panel de imprenta en vivo</div>
                            <div class="landing-callout-text">Clientes, lotes y márgenes B2B, tal como lo verías en producción.</div>
                        </div>
                        <button type="button" class="btn btn-primary" onclick="window.appState.exploreRole('RESELLER')">
                            Abrir panel ${ICONS.arrow}
                        </button>
                    </div>
                </div>
            </section>

            <!-- 5. Administrador -->
            <section class="landing-section landing-section--alt" id="seccion-admin">
                <div class="landing-wrap">
                    <div class="landing-head">
                        <span class="landing-eyebrow">Administrador</span>
                        <h2 class="landing-title">Un panel para gestionar tu red de imprentas</h2>
                        <p class="landing-lead">
                            Imprentas, lotes, clientes y márgenes en un solo lugar, con control total de tu operación.
                        </p>
                    </div>

                    <div class="card-grid" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr));">
                        <div class="card">
                            <div class="card-icon">${ICONS.layers}</div>
                            <div class="card-title">Control total de tu operación</div>
                            <div class="card-text">Imprentas, lotes y clientes organizados en un solo panel.</div>
                        </div>
                        <div class="card">
                            <div class="card-icon">${ICONS.shield}</div>
                            <div class="card-title">Tu firma, protegida</div>
                            <div class="card-text">Tu firma electrónica se queda en tu dispositivo. La clave privada nunca se expone en servidores públicos.</div>
                        </div>
                        <div class="card">
                            <div class="card-icon">${ICONS.database}</div>
                            <div class="card-title">Postgres con RLS</div>
                            <div class="card-text">Políticas de Row Level Security estrictas que garantizan aislamiento total por emisor.</div>
                        </div>
                        <div class="card">
                            <div class="card-icon">${ICONS.send}</div>
                            <div class="card-title">Entrega en menos de 2 segundos</div>
                            <div class="card-text">RIDE PDF y XML autorizado enviados al correo del cliente mediante Resend.</div>
                        </div>
                    </div>

                    <div class="landing-callout">
                        <div>
                            <div class="landing-callout-title">Panel del dueño</div>
                            <div class="landing-callout-text">Gestiona imprentas, lotes y métricas desde un solo lugar.</div>
                        </div>
                        <button type="button" class="btn btn-primary" onclick="window.appState.exploreRole('SUPER_ADMIN')">
                            Abrir panel del dueño ${ICONS.arrow}
                        </button>
                    </div>
                </div>
            </section>

            <!-- 6. Comparativa -->
            <section class="landing-section" id="seccion-comparativa">
                <div class="landing-wrap">
                    <div class="landing-head">
                        <span class="landing-eyebrow">Comparativa</span>
                        <h2 class="landing-title">¿Por qué pagar $40 al mes por un ERP de 45 menús que nadie sabe usar?</h2>
                        <p class="landing-lead">La diferencia entre el software contable complicado y la sencillez del papel.</p>
                    </div>

                    <div class="landing-table-wrap">
                        <table class="landing-table">
                            <thead>
                                <tr>
                                    <th>Característica</th>
                                    <th>ERP tradicional</th>
                                    <th>Talonario Amigo</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td>Interfaz de usuario</td><td>45 menús, tablas y modales confusos</td><td>Una hoja de papel táctil</td></tr>
                                <tr><td>Curva de aprendizaje</td><td>Semanas de capacitación</td><td>0 minutos: es tu papel de siempre</td></tr>
                                <tr><td>Tiempo por factura</td><td>15 a 20 clics (1 a 2 minutos)</td><td>5 segundos o dictado por voz</td></tr>
                                <tr><td>Modo sin internet</td><td>Se bloquea, no puedes cobrar</td><td>100% offline con auto-sincronización</td></tr>
                                <tr><td>Copia para el emisor</td><td>PDF perdidos en carpetas</td><td>Copia azul autocopiativa tradicional</td></tr>
                                <tr><td>Voz y escáner de foto</td><td>No disponible o muy costoso</td><td>Reconoce cédula, RUC y productos</td></tr>
                                <tr><td>Dispositivos</td><td>Computadora e impresora especial</td><td>Cualquier celular o tablet</td></tr>
                                <tr><td>Costo anual total</td><td>$360 a $700 USD</td><td>$25 USD, todo incluido</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <!-- 7. Precios -->
            <section class="landing-section landing-section--alt" id="seccion-precios">
                <div class="landing-wrap">
                    <div class="landing-head">
                        <span class="landing-eyebrow">Precios · sin cobros mensuales</span>
                        <h2 class="landing-title">El precio más justo de todo el Ecuador</h2>
                        <p class="landing-lead">Sin mensualidades obligatorias ni contratos sorpresa. Un pago anual que cuesta menos que dos blocks de papel.</p>
                    </div>

                    <div class="price-grid">
                        <div class="price-card price-card--featured">
                            <div>
                                <span class="price-tag">Recomendado</span>
                                <div class="price-name" style="margin-top:14px;">Plan Comerciante</div>
                                <div class="price-desc">Tiendas, ferreterías, farmacias, agro y profesionales.</div>
                                <div style="margin-top:20px;">
                                    <span class="price-amount">$25</span><span class="price-period">USD / año</span>
                                </div>
                            </div>
                            <ul class="price-features">
                                ${priceFeature('autorizadas por el SRI', 'Facturas ilimitadas')}
                                ${priceFeature('inteligente (cédula, RUC, productos)', 'Dictado por voz')}
                                ${priceFeature('por foto con física de gravedad', 'Escáner OCR')}
                                ${priceFeature('tradicional para tu archivo', 'Copia azul autocopiativa')}
                                ${priceFeature('(factura en carretera o campo)', '100% offline')}
                                ${priceFeature('y correo al cliente', 'Envío por WhatsApp')}
                                ${priceFeature('con descarga de XML', 'Archivo por tomos')}
                            </ul>
                            <button type="button" class="btn btn-primary btn-block btn-lg" onclick="window.appState.openRegister()">Crear mi talonario</button>
                        </div>

                        <div class="price-card">
                            <div>
                                <span class="price-tag">Distribuidor B2B</span>
                                <div class="price-name" style="margin-top:14px;">Plan Imprenta Aliada</div>
                                <div class="price-desc">Imprentas gráficas, litografías y distribuidores cantonales.</div>
                                <div style="margin-top:20px;">
                                    <span class="price-amount">$12</span><span class="price-period">USD / licencia en lotes</span>
                                </div>
                            </div>
                            <ul class="price-features">
                                ${priceFeature('($13 USD limpios por talonario)', '52% de ganancia neta')}
                                ${priceFeature('con el logo de tu imprenta en la tapa', 'Marca blanca')}
                                ${priceFeature('como canal oficial de soporte', 'Tu WhatsApp')}
                                ${priceFeature('para dar de alta en 60 segundos', 'Panel B2B mayorista')}
                                ${priceFeature('sin caducidad de activación', 'Lotes desde 10 licencias')}
                                ${priceFeature('de ingeniería para tu imprenta', 'Soporte prioritario')}
                            </ul>
                            <a class="btn btn-ghost btn-block btn-lg" href="https://wa.me/593993050689?text=Hola,%20tengo%20una%20imprenta%20y%20quiero%20ser%20distribuidor%20de%20Talonario%20Amigo" target="_blank" rel="noopener noreferrer">Registrar mi imprenta</a>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 8. Confianza SRI -->
            <section class="landing-section">
                <div class="landing-wrap">
                    <div class="landing-head">
                        <span class="landing-eyebrow">Respaldo legal</span>
                        <h2 class="landing-title">Certificado bajo normativas oficiales del SRI Ecuador</h2>
                    </div>

                    <div class="card-grid">
                        <div class="card">
                            <div class="quote">"No sé usar computadoras y los sistemas contables me mareaban con tantas ventanas. Con Talonario Amigo en mi tablet sigo llenando mi factura igualito a cuando usaba esfero."</div>
                            <div class="quote-author">Don Segundo M.</div>
                            <div class="quote-role">Abarrotes y víveres · Milagro, Guayas</div>
                        </div>
                        <div class="card">
                            <div class="quote">"En nuestra imprenta perdimos clientes cuando el SRI quitó el papel. Con Talonario Amigo les vendemos nosotros mismos su talonario digital y ganamos el 50% limpio sin imprimir."</div>
                            <div class="quote-author">Ing. Martha P.</div>
                            <div class="quote-role">Artes gráficas y litografía · Machala, El Oro</div>
                        </div>
                        <div class="card">
                            <div class="quote">"Compro cacao en recintos donde no entra ni un mensaje de texto. Facturo offline y cuando llego al pueblo todas las facturas se suben solitas al SRI."</div>
                            <div class="quote-author">Carlos B.</div>
                            <div class="quote-role">Comercializadora de cacao · Vinces, Los Ríos</div>
                        </div>
                    </div>

                    <div class="legal-note">
                        <strong>Sustento legal SRI:</strong> cumplimiento del esquema XML Factura v1.1.0 según la
                        <strong>Resolución NAC-DGERCGC18-00000431</strong> y la <strong>Resolución NAC-DGERCGC22-00000024</strong>
                        (obligatoriedad RIMPE y Régimen General). Firma digital con algoritmo <strong>XAdES-BES</strong> y
                        verificación módulo 11 en la clave de acceso de 49 dígitos.
                    </div>
                </div>
            </section>

            <!-- 9. FAQ -->
            <section class="landing-section landing-section--alt" id="seccion-faq">
                <div class="landing-wrap" style="max-width:820px;">
                    <div class="landing-head">
                        <span class="landing-eyebrow">Preguntas frecuentes</span>
                        <h2 class="landing-title">Resolvemos todas tus dudas en segundos</h2>
                    </div>

                    <div class="faq">
                        <details>
                            <summary>¿Qué necesito para empezar a facturar hoy mismo?</summary>
                            <div class="faq-body">Solo tu número de RUC activo y el archivo de firma electrónica en formato <strong>.p12</strong> (Security Data, Registro Civil, ANF, UANATACA, etc.). Si aún no la tienes, tu imprenta aliada o nuestro equipo te guía en menos de 24 horas.</div>
                        </details>
                        <details>
                            <summary>¿Qué pasa si se corta el internet o estoy en zona rural?</summary>
                            <div class="faq-body">Talonario Amigo tiene un motor <strong>100% offline</strong>. Puedes seguir emitiendo sin cobertura. Las facturas quedan selladas criptográficamente y en cola local, sincronizándose automáticamente al recuperar la señal.</div>
                        </details>
                        <details>
                            <summary>¿Mi firma electrónica .p12 está segura?</summary>
                            <div class="faq-body">Sí. Tu firma se realiza en tu propio dispositivo y la clave privada nunca viaja desprotegida a servidores externos. Esa firma queda cifrada y solo tú puedes usarla.</div>
                        </details>
                        <details>
                            <summary>¿Sirve para el régimen RIMPE Negocio Popular y Emprendedor?</summary>
                            <div class="faq-body">Sí. Se adapta automáticamente: en <strong>RIMPE Negocio Popular</strong> emite notas de venta con la leyenda obligatoria del SRI y tarifa 0%; en <strong>RIMPE Emprendedor</strong> o <strong>Régimen General</strong> calcula el 15% de IVA con desglose oficial.</div>
                        </details>
                        <details>
                            <summary>¿Cómo se entrega la factura al cliente si no tengo impresora?</summary>
                            <div class="faq-body">Al emitir, el sistema envía el <strong>RIDE PDF y el XML autorizado</strong> al correo del cliente mediante Resend. También tienes un botón de <strong>WhatsApp directo</strong> para compartir el comprobante al instante.</div>
                        </details>
                        <details>
                            <summary>¿Soy imprenta gráfica, cómo empiezo a vender talonarios en mi cantón?</summary>
                            <div class="faq-body">Escríbenos por WhatsApp al <a href="https://wa.me/593993050689" target="_blank" rel="noopener noreferrer">0993050689</a> para dar de alta tu panel de distribuidor en 5 minutos. Te asignamos un lote inicial con costo de $12 por cliente para que generes un margen del 52% vendiéndolos a $25.</div>
                        </details>
                    </div>
                </div>
            </section>

            <!-- 10. Footer -->
            <footer class="landing-footer">
                <div class="landing-wrap">
                    <div class="landing-footer-inner">
                        <div>
                            <div class="landing-footer-name">Talonario Amigo</div>
                            <div style="margin-top:4px;">Facturación electrónica táctil · Servicio de Rentas Internas del Ecuador</div>
                        </div>
                        <div class="landing-footer-links">
                            <a href="https://wa.me/593993050689" target="_blank" rel="noopener noreferrer">Soporte: 0993050689</a>
                            <button type="button" onclick="window.appState.exploreRole('CLIENT')">Comerciantes</button>
                            <button type="button" onclick="window.appState.exploreRole('RESELLER')">Imprentas</button>
                            <button type="button" onclick="window.appState.exploreRole('SUPER_ADMIN')">Administrador</button>
                        </div>
                    </div>
                    <div class="landing-legal">
                        © 2026 Talonario Amigo. Todos los derechos reservados. Cumplimiento técnico XAdES-BES, SOAP SRI y Ley Orgánica para el Desarrollo Económico y Sostenibilidad Fiscal.
                    </div>
                </div>
            </footer>

        </div>
    `;
}
