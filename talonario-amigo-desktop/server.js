'use strict';

/**
 * Servidor estático mínimo para servir el bundle de la SPA desde 127.0.0.1.
 * Evita file:// (rompe módulos ES y fetch) y mantiene el origen http local.
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.webmanifest': 'application/manifest+json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.map': 'application/json; charset=utf-8',
};

function createServer(rootDir) {
    const root = path.resolve(rootDir);

    return http.createServer((req, res) => {
        let pathname;
        try {
            pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
        } catch {
            res.writeHead(400).end('Bad request');
            return;
        }

        if (pathname === '/') pathname = '/index.html';

        const filePath = path.resolve(root, '.' + pathname);
        if (!filePath.startsWith(root)) {
            res.writeHead(403).end('Forbidden');
            return;
        }

        fs.stat(filePath, (err, stat) => {
            const isFile = !err && stat.isFile();
            const target = isFile ? filePath : path.join(root, 'index.html');

            fs.readFile(target, (readErr, data) => {
                if (readErr) {
                    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
                    return;
                }
                res.writeHead(200, {
                    'Content-Type': MIME[path.extname(target).toLowerCase()] || 'application/octet-stream',
                    'Cache-Control': 'no-store',
                });
                res.end(data);
            });
        });
    });
}

function listen(rootDir) {
    return new Promise((resolve, reject) => {
        const server = createServer(rootDir);
        server.once('error', reject);
        server.listen(0, '127.0.0.1', () => {
            const { port } = server.address();
            resolve({ server, url: `http://127.0.0.1:${port}/index.html?api=prod` });
        });
    });
}

module.exports = { listen };
