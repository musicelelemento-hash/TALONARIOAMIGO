/**
 * Talonario Amigo — Entry Point (SPA)
 * Carga el design system y arranca el AppManager (router por rol/estado).
 */
import './style.css';
import { AppManager } from './components/AppManager.js';

const appManager = new AppManager('app-root');
appManager.evaluateStateAndRender();
