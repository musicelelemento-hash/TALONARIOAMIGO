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
    rollupOptions: {
      output: {
        // Divide las librerías pesadas en chunks separados (P1-3): el núcleo de la
        // app queda liviano y three/pdfjs/qrcode se cargan en paralelo y se cachean
        // por separado. tesseract.js ya usa import() dinámico en gravityScanner.
        manualChunks: {
          three: ['three'],
          ocr: ['pdfjs-dist'],
          qrcode: ['qrcode'],
        },
      },
    },
  },
});
