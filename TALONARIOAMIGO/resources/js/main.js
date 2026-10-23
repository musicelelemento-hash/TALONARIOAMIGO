/**
 * Talonario Amigo — Entry Point (SPA)
 * Carga el design system y arranca el AppManager (router por rol/estado).
 */
import './style.css';
import { AppManager } from './components/AppManager.js';

const appManager = new AppManager('app-root');
appManager.evaluateStateAndRender();

const isNative = Boolean(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
if ('serviceWorker' in navigator && !isNative) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
}
