/**
 * Servicio: leer el Certificado de RUC desde una FOTO (OCR en el teléfono, sin servidor).
 * El PDF se lee con services/sriPdf.js; esto cubre cuando el comerciante solo le tomó una foto.
 * parseRucTexto() es pura (se prueba en tests/js); leerRucDeFoto() usa tesseract.js bajo demanda.
 */

const mapaRegimen = [
    [/NEGOCIO\s+POPULAR/, 'RIMPE_POPULAR'],
    [/EMPRENDEDOR/, 'RIMPE_EMPRENDEDOR'],
];

/** Devuelve { ruc, nombre, direccion, regimen } con '' en lo que no se entendió. */
export function parseRucTexto(texto) {
    const lineas = String(texto || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const todo = lineas.join(' ').toUpperCase();

    const ruc = (todo.match(/\b\d{10}001\b/) || [''])[0];

    let nombre = '';
    for (let i = 0; i < lineas.length; i++) {
        const l = lineas[i].toUpperCase();
        const m = l.match(/(?:RAZ[ÓO]N SOCIAL|APELLIDOS Y NOMBRES|NOMBRE COMERCIAL)\s*[:-]?\s*(.*)$/);
        if (m) {
            nombre = (m[1] || lineas[i + 1] || '').trim();
            if (nombre) break;
        }
    }

    let direccion = '';
    const calle = todo.match(/(?:CALLE|DIRECCI[ÓO]N|REFERENCIA)\s*[:-]?\s*([A-Z0-9ÁÉÍÓÚÑ ./,#-]{6,80})/);
    if (calle) direccion = calle[1].trim();

    let regimen = '';
    for (const [re, valor] of mapaRegimen) {
        if (re.test(todo)) { regimen = valor; break; }
    }
    if (!regimen && ruc) regimen = 'GENERAL';

    return { ruc, nombre, direccion, regimen };
}

/** OCR de una foto. Lanza error solo si el motor no pudo ni arrancar; si no entiende, devuelve campos vacíos. */
export async function leerRucDeFoto(file) {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('spa');
    try {
        const ret = await worker.recognize(file);
        return parseRucTexto(ret.data.text || '');
    } finally {
        await worker.terminate();
    }
}
