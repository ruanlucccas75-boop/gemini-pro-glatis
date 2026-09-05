import { app, BrowserWindow, shell, Menu } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import http from 'node:http';
import { fork, spawn } from 'node:child_process';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables (.env)
const envLocations = [
  path.join(process.cwd(), '.env'),
  path.join(path.dirname(app.getPath('exe')), '.env'),
  path.join(app.getAppPath(), '.env'),
];

for (const envPath of envLocations) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const SERVER_PORT = process.env.PORT || 3000;
const SERVER_URL = `http://127.0.0.1:${SERVER_PORT}`;

let mainWindow = null;
let serverProcess = null;

// Helper to check if the local server is reachable
function isServerRunning(timeout = 800) {
  return new Promise((resolve) => {
    const req = http.get(`${SERVER_URL}/api/health`, { timeout }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Find path to compiled server backend
function getServerScriptPath() {
  const appPath = app.getAppPath();
  const candidates = [
    path.join(appPath, 'dist', 'server.cjs'),
    path.join(appPath, 'dist', 'server.cjs').replace('app.asar', 'app.asar.unpacked'),
    path.join(__dirname, 'dist', 'server.cjs'),
    path.join(process.resourcesPath, 'app.asar.unpacked', 'dist', 'server.cjs'),
    path.join(process.resourcesPath, 'app', 'dist', 'server.cjs'),
    path.resolve(process.cwd(), 'dist', 'server.cjs'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return path.join(__dirname, 'dist', 'server.cjs');
}

// Start backend Express server if not already running
async function ensureServerRunning() {
  const alreadyRunning = await isServerRunning(800);
  if (alreadyRunning) {
    console.log('[Electron] Server already running at', SERVER_URL);
    return true;
  }

  const scriptPath = getServerScriptPath();
  console.log('[Electron] Checking server script at:', scriptPath);

  if (fs.existsSync(scriptPath)) {
    // 1. Try loading server in-process (native ASAR support, zero IPC friction)
    try {
      process.env.NODE_ENV = 'production';
      process.env.PORT = SERVER_PORT.toString();
      const { pathToFileURL } = await import('node:url');
      await import(pathToFileURL(scriptPath).href);
      console.log('[Electron] Server started in-process');
    } catch (inProcessErr) {
      console.warn('[Electron] In-process start failed, falling back to fork:', inProcessErr);
      try {
        serverProcess = fork(scriptPath, [], {
          env: {
            ...process.env,
            PORT: SERVER_PORT.toString(),
            NODE_ENV: 'production',
            ELECTRON_RUN_AS_NODE: '1',
          },
          stdio: 'inherit',
        });

        serverProcess.on('error', (err) => {
          console.error('[Electron] Failed to start backend server process:', err);
        });

        serverProcess.on('exit', (code, signal) => {
          console.log(`[Electron] Server process exited with code ${code}, signal ${signal}`);
        });
      } catch (forkErr) {
        console.error('[Electron] Failed to fork server process:', forkErr);
      }
    }
  } else if (!app.isPackaged) {
    console.log('[Electron] Development mode: Starting dev server via npm run dev...');
    const devCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    try {
      serverProcess = spawn(devCmd, ['run', 'dev'], {
        cwd: app.getAppPath(),
        stdio: 'inherit',
        shell: true,
        env: {
          ...process.env,
          PORT: SERVER_PORT.toString(),
        },
      });
    } catch (spawnErr) {
      console.error('[Electron] Failed to spawn dev server:', spawnErr);
    }
  }

  // Poll until the server responds with retries (up to ~18 seconds)
  for (let attempt = 0; attempt < 36; attempt++) {
    await new Promise((r) => setTimeout(r, 500));
    if (await isServerRunning(800)) {
      console.log('[Electron] Backend server is ready and responding at', SERVER_URL);
      return true;
    }
  }

  return false;
}

function createWindow() {
  const preloadPath = fs.existsSync(path.join(__dirname, 'preload.cjs'))
    ? path.join(__dirname, 'preload.cjs')
    : path.join(__dirname, 'preload.js');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 800,
    minHeight: 600,
    title: 'Gemini',
    backgroundColor: '#131314',
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    show: false,
  });

  // Remove default menu for a clean app experience
  Menu.setApplicationMenu(null);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open external links safely in system default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Clean up background server on quit
function cleanupServer() {
  if (serverProcess) {
    try {
      serverProcess.kill();
    } catch {
      // ignore
    }
    serverProcess = null;
  }
}

app.whenReady().then(async () => {
  createWindow();

  const serverReady = await ensureServerRunning();
  if (serverReady && mainWindow) {
    mainWindow.loadURL(SERVER_URL);
  } else if (mainWindow) {
    mainWindow.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Gemini</title>
            <style>
              body {
                background: #131314;
                color: #e3e3e3;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                text-align: center;
              }
              .box {
                max-width: 500px;
                padding: 32px;
                border-radius: 16px;
                background: #1e1f20;
                border: 1px solid #333;
              }
              h2 { margin-top: 0; color: #fff; }
              code { background: #282a2c; padding: 4px 8px; border-radius: 6px; font-size: 14px; }
              button {
                margin-top: 16px;
                padding: 10px 20px;
                background: #1a73e8;
                color: #fff;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
              }
            </style>
          </head>
          <body>
            <div class="box">
              <h2>Inicializando servidor...</h2>
              <p>Conectando ao servidor em <code>${SERVER_URL}</code>...</p>
              <p style="font-size: 13px; color: #aaa;">Se o app estiver iniciando pela primeira vez, aguarde alguns segundos.</p>
              <button onclick="location.reload()">Tentar novamente</button>
            </div>
            <script>
              let attempts = 0;
              const timer = setInterval(async () => {
                try {
                  const res = await fetch('${SERVER_URL}/api/health');
                  if (res.ok) {
                    clearInterval(timer);
                    window.location.href = '${SERVER_URL}';
                  }
                } catch (e) {
                  attempts++;
                  if (attempts > 60) clearInterval(timer);
                }
              }, 1000);
            </script>
          </body>
        </html>
      `)}`
    );
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('before-quit', cleanupServer);

app.on('window-all-closed', () => {
  cleanupServer();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
