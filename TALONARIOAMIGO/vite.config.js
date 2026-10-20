import { defineConfig } from 'vite';

// Talonario Amigo — build del frontend SPA.
// Raíz en /resources (donde viven index.html, js/ y el design system css).
// Salida a /public/dist, servida por Laravel y empaquetada por Capacitor.
export default defineConfig({
  root: 'resources',
  base: './',
  server: {
    port: 5173,
  },
  build: {
    outDir: '../public/dist',
    emptyOutDir: true,
    target: 'es2018',
  },
});
