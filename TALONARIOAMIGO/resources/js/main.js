/**
 * Talonario Amigo — Entry Point (SPA)
 * Carga el design system y arranca el AppManager (router por rol/estado).
 */
import './style.css';
import './estilo-minimalista.css';
import { AppManager } from './components/AppManager.js';
import { aplicarEstiloGuardado } from './services/estilo.js';

// El estilo (Clásico o Minimalista) se aplica antes de pintar, para que no parpadee.
aplicarEstiloGuardado();

const appManager = new AppManager('app-root');
appManager.evaluateStateAndRender();

const isNative = Boolean(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
if ('serviceWorker' in navigator && !isNative) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
}
