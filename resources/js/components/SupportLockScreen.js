/**
 * Componente: SupportLockScreen
 * Pantalla elegante y minimalista de bloqueo cuando la cuenta está inactiva o le falta firma .p12
 */
export function renderSupportLockScreen(reasonMessage, whatsappNumber) {
    const defaultNumber = whatsappNumber || "593999999999";
    const waLink = `https://wa.me/${defaultNumber}?text=Hola,%20requiero%20asistencia%20para%20activar%20mi%20firma%20en%20Talonario%20Amigo`;

    return `
        <div class="lock-screen-container" style="max-width: 440px; margin: 20px auto;">
            <div class="lock-badge">⚠️</div>
            
            <h2 style="font-family: var(--font-serif-header); font-size: 22px; font-weight: 800; color: #0F172A; margin-bottom: 8px;">
                Talonario Pausado
            </h2>

            <p style="font-size: 12px; color: #57534E; line-height: 1.5; margin-bottom: 18px;">
                ${reasonMessage || 'Tu cuenta requiere configuración de la Firma Electrónica (.p12) o habilitación de tu licencia con la imprenta distribuidora.'}
            </p>

            <div style="background: #FFF8F8; border: 1.5px dashed #D90429; padding: 12px 14px; border-radius: 10px; font-size: 11px; font-family: var(--font-mono-num); text-align: left; margin-bottom: 18px;">
                📌 <strong>Estado:</strong> CUENTA_BLOQUEADA_SOPORTE<br>
                🏭 <strong>Imprenta Asignada:</strong> Imprenta Gráficas Amazonas<br>
                💬 <strong>Soporte Técnico:</strong> Respuesta inmediata en horario laboral
            </div>

            <a href="${waLink}" target="_blank" class="whatsapp-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.705 1.754zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
                CONTACTAR A SOPORTE / IMPRENTA
            </a>
        </div>
    `;
}
