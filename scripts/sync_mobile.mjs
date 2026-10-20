import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../public/dist');

// Detect mobile project directory
const candidates = [
  path.resolve(__dirname, '../../talonario-amigo-mobile'),
  path.resolve(__dirname, '../talonario-amigo-mobile'),
  path.resolve(__dirname, '../mobile')
];

const mobileDir = candidates.find(dir => fs.existsSync(dir));

if (!mobileDir) {
  console.error('❌ No se encontró el directorio de talonario-amigo-mobile.');
  process.exit(1);
}

const targetWww = path.join(mobileDir, 'www');

if (!fs.existsSync(distDir)) {
  console.error(`❌ La carpeta dist (${distDir}) no existe. Ejecuta 'npm run build' primero.`);
  process.exit(1);
}

console.log(`📦 Sincronizando bundle web hacia la app móvil...`);
console.log(`   Origen:  ${distDir}`);
console.log(`   Destino: ${targetWww}`);

if (!fs.existsSync(targetWww)) {
  fs.mkdirSync(targetWww, { recursive: true });
}

// Función de copia recursiva
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

copyRecursiveSync(distDir, targetWww);
console.log('✓ Archivos web copiados exitosamente en www/');

// Ejecutar sincronización nativa con Capacitor si existe el binario local o npx
const localCapCmd = path.join(mobileDir, 'node_modules', '.bin', process.platform === 'win32' ? 'cap.cmd' : 'cap');
const hasLocalCap = fs.existsSync(localCapCmd);

console.log('🔄 Ejecutando sincronización nativa con Capacitor Android...');
try {
  const cmd = hasLocalCap ? `"${localCapCmd}" sync android` : 'npx cap sync android';
  const out = execSync(cmd, { cwd: mobileDir, encoding: 'utf-8', stdio: 'pipe' });
  console.log(out.trim());
  console.log('✓ Capacitor sincronizado exitosamente con Android nativo.');
} catch (err) {
  console.warn('⚠️ Nota de sincronización nativa:', err.stdout || err.message);
}

console.log('🎉 Sincronización móvil finalizada con éxito.');
