/**
 * Componente: RegisterScreen
 * Asistente de 3 pasos para crear el talonario (sin pagos aquí):
 *   1) RUC (PDF o foto) + cuenta (correo y clave)   2) Firma electrónica   3) Estilo visual  → ¡Listo!
 * Estado en AppManager.reg; los botones llaman a window.appState.reg*().
 */
import '../registro.css';
import { ESTILOS, getEstilo } from '../services/estilo.js';

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const REGIMENES = [
    ['RIMPE_POPULAR', 'RIMPE Negocio Popular'],
    ['RIMPE_EMPRENDEDOR', 'RIMPE Emprendedor'],
    ['GENERAL', 'General'],
];

function cabecera(paso) {
    const num = Math.min(paso, 3);
    const pct = paso > 3 ? 100 : Math.round((paso / 3) * 100);
    return `
        <div class="reg-top">
            ${paso > 1 && paso <= 3
        ? '<button type="button" class="reg-atras" onclick="window.appState.regAtras()">‹ Atrás</button>'
        : '<button type="button" class="reg-atras" onclick="window.appState.openLogin()">‹ Ya tengo cuenta</button>'}
            <span class="reg-paso-txt">${paso > 3 ? 'Terminado' : `Paso ${num} de 3`}</span>
        </div>
        <div class="reg-barra" role="progressbar" aria-valuemin="0" aria-valuemax="3" aria-valuenow="${paso > 3 ? 3 : paso - 1}"><span style="width:${pct}%"></span></div>`;
}

function ayuda() {
    return '<button type="button" class="reg-ayuda" onclick="window.appState.openHelpWhatsapp()">Que me ayude una persona</button>';
}

function paso1(r) {
    const d = r.datos;
    const mostrarCampos = r.leido || r.manual;
    return `
        <h1>Sube el PDF de tu RUC o tómale una foto</h1>
        <p class="reg-sub">Con eso llenamos tus datos solos. Es el papel del SRI que dice «Certificado de RUC».</p>
        <label class="reg-subir" for="reg-ruc-file">
            <span>Subir PDF o tomar foto</span>
            <small id="reg-ruc-nombre">${r.archivo ? esc(r.archivo) : 'Toca aquí'}</small>
        </label>
        <input type="file" id="reg-ruc-file" accept=".pdf,application/pdf,image/*" onchange="window.appState.regLeerRuc(this)">
        <div class="reg-estado ${esc(r.estadoTipo)}" id="reg-ruc-estado" role="status" aria-live="polite">${esc(r.estado)}</div>
        ${mostrarCampos ? '' : '<button type="button" class="reg-enlace" onclick="window.appState.regManual()">No tengo el papel, escribir mis datos</button>'}
        <div id="reg-campos" style="${mostrarCampos ? '' : 'display:none'}">
            <label class="reg-campo"><span>Nombre o negocio</span><input id="reg-nombre" autocomplete="organization" value="${esc(d.nombre)}"></label>
            <label class="reg-campo"><span>RUC (13 números)</span><input id="reg-ruc" inputmode="numeric" maxlength="13" value="${esc(d.ruc)}"></label>
            <label class="reg-campo"><span>Dirección de tu negocio</span><input id="reg-direccion" autocomplete="street-address" value="${esc(d.direccion)}"></label>
            <label class="reg-campo"><span>Tipo de contribuyente</span>
                <select id="reg-regimen">${REGIMENES.map(([v, t]) => `<option value="${v}"${d.regimen === v ? ' selected' : ''}>${t}</option>`).join('')}</select>
            </label>
            <div class="reg-seccion">Tu cuenta</div>
            <label class="reg-campo"><span>Correo</span><input id="reg-email" type="email" autocomplete="email" value="${esc(r.cuenta.email)}"></label>
            <label class="reg-campo"><span>Contraseña (mínimo 6)</span><input id="reg-pass" type="password" autocomplete="new-password" value="${esc(r.cuenta.password)}"></label>
        </div>
        <div class="reg-estado mal" id="reg-error" role="alert"></div>
        <button type="button" class="reg-principal" id="reg-principal" onclick="window.appState.regSiguiente()">Seguir</button>
        ${ayuda()}`;
}

function paso2(r) {
    return `
        <h1>Sube tu firma electrónica</h1>
        <p class="reg-sub">Es el archivo con el que firmas tus facturas (termina en .p12). Te lo dio la empresa donde la sacaste. Escribe también su clave.</p>
        <label class="reg-subir" for="reg-p12">
            <span>Elegir mi firma electrónica (archivo .p12)</span>
            <small id="reg-p12-nombre">${r.firmaNombre ? esc(r.firmaNombre) : 'Toca aquí'}</small>
        </label>
        <input type="file" id="reg-p12" accept=".p12,.pfx" onchange="window.appState.regFirmaElegida(this)">
        <label class="reg-campo" style="margin-top:14px"><span>Clave de tu firma</span><input id="reg-clave" type="password" autocomplete="off" value=""></label>
        <div class="reg-estado ${esc(r.estadoTipo)}" id="reg-firma-estado" role="status" aria-live="polite">${esc(r.estado)}</div>
        <button type="button" class="reg-principal" id="reg-principal" onclick="window.appState.regSiguiente()">${r.firmaOk ? 'Seguir' : 'Revisar mi firma'}</button>
        <button type="button" class="reg-enlace" onclick="window.appState.regSaltarFirma()">La subo después</button>
        ${ayuda()}`;
}

function paso3(r) {
    const actual = r.estilo || getEstilo();
    return `
        <h1>Elige cómo quieres ver tu talonario</h1>
        <p class="reg-sub">Puedes cambiarlo cuando quieras.</p>
        <div class="reg-estilos">
            ${ESTILOS.map((e) => `
                <button type="button" class="reg-estilo${e.id === actual ? ' sel' : ''}" data-estilo-op="${e.id}" aria-pressed="${e.id === actual}" onclick="window.appState.regElegirEstilo('${e.id}')">
                    <b>${esc(e.nombre)}</b>${esc(e.descripcion)}
                </button>`).join('')}
        </div>
        <button type="button" class="reg-principal" id="reg-principal" onclick="window.appState.regSiguiente()">Terminar</button>
        ${ayuda()}`;
}

function paso4(r) {
    return `
        <div class="reg-listo">
            <div class="reg-check" aria-hidden="true">✓</div>
            <h1>¡Listo! Tu talonario está listo</h1>
            <p class="reg-sub">${r.firmaOk
        ? 'Ya puedes hacer tu primera factura.'
        : (r.offline
            ? 'Estás en modo práctica: puedes hacer facturas de prueba. Cuando tengas internet y tu firma, la subes desde el menú.'
            : 'Puedes hacer facturas de práctica. Cuando tengas tu firma, la subes desde el menú y facturas de verdad.')}</p>
        </div>
        <button type="button" class="reg-principal" id="reg-principal" onclick="window.appState.regFinalizar()">Abrir mi talonario</button>`;
}

export function renderRegisterScreen(r) {
    const cuerpo = [null, paso1, paso2, paso3, paso4][r.paso](r);
    return `<div class="reg-wiz"><div class="reg-card">${cabecera(r.paso)}${cuerpo}</div></div>`;
}
