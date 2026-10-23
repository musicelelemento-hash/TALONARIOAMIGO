'use strict';

const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { listen } = require('./server');

const DIST_DIR = path.resolve(__dirname, '..', 'TALONARIOAMIGO', 'public', 'dist');

let mainWindow = null;
let localServer = null;

function createWindow(url) {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 860,
        minWidth: 900,
        minHeight: 640,
        backgroundColor: '#0B1220',
        title: 'Talonario Amigo',
        autoHideMenuBar: true,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
        },
    });

    mainWindow.loadURL(url);

    mainWindow.webContents.setWindowOpenHandler(({ url: target }) => {
        if (/^https?:\/\//.test(target)) shell.openExternal(target);
        return { action: 'deny' };
    });

    mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(async () => {
    if (!fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
        dialog.showErrorBox(
            'Falta el bundle web',
            'No se encontró TALONARIOAMIGO/public/dist/index.html.\n\nEjecuta "npm run build" en el proyecto antes de abrir la app de escritorio.'
        );
        app.quit();
        return;
    }

    const started = await listen(DIST_DIR);
    localServer = started.server;
    createWindow(started.url);
});

app.on('window-all-closed', () => {
    if (localServer) localServer.close();
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        listen(DIST_DIR).then((started) => {
            localServer = started.server;
            createWindow(started.url);
        });
    }
});
