import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function run(command) {
  console.log(`[build-electron-win] Executando: ${command}`);
  execSync(command, { cwd: rootDir, stdio: 'inherit' });
}

// 1. Se estiver rodando no Windows, assegura que as bibliotecas nativas de compilação estejam presentes
if (process.platform === 'win32') {
  const nativePackages = [
    'lightningcss-win32-x64-msvc@1.32.0',
    '@rollup/rollup-win32-x64-msvc@^4.63.1',
    '@esbuild/win32-x64@^0.25.0',
  ];

  let needsInstall = false;
  try {
    const lightningNodePath = path.join(
      rootDir,
      'node_modules',
      'lightningcss-win32-x64-msvc',
      'lightningcss.win32-x64-msvc.node'
    );
    if (!fs.existsSync(lightningNodePath)) {
      needsInstall = true;
    }
  } catch {
    needsInstall = true;
  }

  if (needsInstall) {
    console.log('[build-electron-win] Instalando dependências nativas do Windows (LightningCSS, Rollup, esbuild)...');
    try {
      run(`npm install --no-save --no-audit --no-fund ${nativePackages.join(' ')}`);
    } catch (err) {
      console.warn('[build-electron-win] Aviso ao instalar módulos nativos:', err.message);
    }
  }
}

// 2. Compila os arquivos web caso ainda não tenham sido compilados
const distIndex = path.join(rootDir, 'dist', 'index.html');
const serverCjs = path.join(rootDir, 'dist', 'server.cjs');

if (!fs.existsSync(distIndex) || !fs.existsSync(serverCjs)) {
  console.log('[build-electron-win] Arquivos compilados em dist/ não encontrados. Executando npm run build...');
  run('npm run build');
} else {
  console.log('[build-electron-win] Arquivos compilados em dist/ já existem. Prosseguindo...');
}

// 3. Empacota o executável com o electron-builder
console.log('[build-electron-win] Empacotando executável Windows (.exe) com electron-builder...');
run('npx electron-builder --win --x64');
