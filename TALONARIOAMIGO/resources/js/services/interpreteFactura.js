/**
 * Intérprete de "factura por chat" (puerto fiel a JS de App\Services\WhatsApp\MensajeFacturaParser).
 *
 * Mantén sincronizados la gramática y los mensajes con el PHP: el chat de la app (modo práctica,
 * sin servidor) y el bot de WhatsApp deben entender exactamente lo mismo.
 *
 * Formatos aceptados (mayúsculas, tildes, "$" y coma decimal son indiferentes):
 *   Factura a Juan Pérez 0912345678
 *   2 colas a 0.50
 *   1 pan 0,25
 *
 *   factura consumidor final: 3 aguas $0.40, 1 atún 1.75
 *   2 x cola 0.50; 1 pan 0.25          (sin cliente → Consumidor Final)
 *
 * Funciones puras: no tocan el DOM ni la red.
 */

export const CONSUMIDOR_FINAL = '9999999999999';
export const TARIFA_IVA = 15;
export const LIMITE_CONSUMIDOR_FINAL = 50;

const NUMERO = '\\d+(?:[.,]\\d+)?';

function error(mensaje) {
    return { ok: false, error: mensaje };
}

// Equivalente a trim($s, $caracteres) de PHP.
function recortar(texto, caracteres) {
    const set = new Set([...caracteres]);
    const chars = [...texto];
    let ini = 0;
    let fin = chars.length;
    while (ini < fin && set.has(chars[ini])) ini++;
    while (fin > ini && set.has(chars[fin - 1])) fin--;
    return chars.slice(ini, fin).join('');
}

function numero(valor) {
    return parseFloat(String(valor).replace(',', '.'));
}

// round() de PHP: mitad hacia arriba sobre el valor decimal escrito (1.005 → 1.01).
export function redondear2(valor) {
    const s = String(valor);
    if (s.includes('e')) return Math.round(valor * 100) / 100;
    const r = Math.round(Number(s + 'e2'));
    return Number(r + 'e-2');
}

function parseItem(segmento) {
    // Una cédula/RUC (10 o 13 dígitos seguidos) nunca es un precio: ese segmento es el cliente.
    if (/\d{10,}/.test(segmento.replace(/(?<=\d)[ -](?=\d)/g, ''))) {
        return null;
    }

    const n = NUMERO;
    const patron = new RegExp(
        '^(?:(' + n + ')\\s*(?:x\\s+|unidades?\\s+(?:de\\s+)?)?)?' + // cantidad opcional
        '([^\\d\\s$].*?)' + // descripción
        '(?:\\s+(?:a|x|por|de|en)\\s+|\\s*[@=:]\\s*|\\s+)\\$?\\s*(' + n + ')' + // separador + precio
        '\\s*(?:\\$|usd|d[óo]lares?|c\\/u|cada\\s+un[oa])?$',
        'iu'
    );

    const m = segmento.match(patron);
    if (!m) return null;

    const descripcion = recortar(m[2], ' -:');
    if (descripcion === '' || [...descripcion].length > 300) return null;

    const cantidad = m[1] !== undefined && m[1] !== '' ? numero(m[1]) : 1;
    const precio = numero(m[3]);

    if (cantidad <= 0) return null;

    return { descripcion: descripcion.toUpperCase(), cantidad, precioUnitario: precio };
}

function esItem(segmento) {
    return parseItem(segmento) !== null;
}

function parseCliente(segmento) {
    if (/^(?:el\s+|un\s+)?(?:consumidor\s+final|cf|sin\s+datos)$/iu.test(segmento.trim())) {
        return { nombre: 'CONSUMIDOR FINAL', identificacion: CONSUMIDOR_FINAL };
    }

    let email = null;
    const me = segmento.match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/u);
    if (me) {
        email = me[0];
        segmento = segmento.split(me[0]).join(' ');
    }

    let identificacion = null;
    const mi = segmento.replace(/(?<=\d)[ -](?=\d)/g, '').match(/(?<!\d)(\d{13}|\d{10})(?!\d)/);
    if (mi) {
        identificacion = mi[1];
        segmento = segmento.replace(/\d[\d -]{8,}\d/g, ' ');
    }

    segmento = segmento.replace(/\b(?:c[ée]dula|ruc|ci|con|correo|email|mail)\b\.?:?/giu, ' ');
    const nombre = recortar(segmento.replace(/\s+/gu, ' '), ' ,.-:');

    if (nombre === '') {
        return { error: 'Falta el nombre del cliente. Ejemplo: Factura a Juan Pérez 0912345678' };
    }

    if (identificacion === null) {
        return { error: `Falta la cédula o RUC de ${nombre}. Escríbela junto al nombre, o pon "consumidor final".` };
    }

    const cliente = { nombre: nombre.toUpperCase(), identificacion };
    if (email) cliente.email = email;
    return cliente;
}

/**
 * @param {string} mensaje
 * @returns {{ok:boolean, cliente?:object, items?:object[], error?:string}}
 */
export function interpretarMensaje(mensaje) {
    let texto = String(mensaje ?? '').replace(/\r/g, '').replace(/[ \t]+/gu, ' ').trim();

    // Quitar la palabra de arranque: "factura", "facturar", "fact", "factura a/para".
    texto = texto.replace(/^(?:factur(?:a|ar|ame|émele|ale)?|fact)\b\.?\s*(?:a|para)?\s*/iu, '');
    texto = recortar(texto, ' :\n');

    if (texto === '') {
        return error('No encontré productos en tu mensaje.');
    }

    // "cliente: productos" en una sola línea.
    const segmentos = [];
    const lineas = texto.split(/\n+/u);
    const mc = lineas.length === 1 ? lineas[0].match(/^([^:]+):(.+)$/u) : null;
    if (mc && !esItem(mc[1].trim())) {
        segmentos.push(mc[1].trim());
        texto = mc[2];
    }

    for (const p of texto.split(/\n+|;|,\s+|\s+y\s+(?=\d)/u)) {
        const parte = recortar(p, ' .\t:');
        if (parte !== '') segmentos.push(parte);
    }

    const segundaLinea = lineas[1];
    const segundaVacia = segundaLinea === undefined || segundaLinea === '' || segundaLinea === '0';
    if (!/\d/.test(texto) && segmentos.length <= 1 && segundaVacia) {
        return error('No encontré productos en tu mensaje.');
    }

    let cliente = null;
    if (segmentos.length > 0 && !esItem(segmentos[0])) {
        cliente = parseCliente(segmentos.shift());
        if (cliente.error) return error(cliente.error);
    }

    const items = [];
    for (const segmento of segmentos) {
        const item = parseItem(segmento);
        if (item === null) {
            return error(`No entendí "${segmento}". Escríbelo así: 2 colas a 0.50`);
        }
        items.push(item);
    }

    if (items.length === 0) {
        return error('No encontré productos en tu mensaje.');
    }

    return {
        ok: true,
        cliente: cliente ?? { nombre: 'CONSUMIDOR FINAL', identificacion: CONSUMIDOR_FINAL },
        items,
    };
}

/**
 * Totales igual que el backend (InvoiceValidationService): total de línea = round(cant*precio, 2),
 * IVA = round(subtotalGravado * 15 / 100, 2). Los ítems con `exento` no pagan IVA.
 */
export function calcularTotales(items, tarifa = TARIFA_IVA) {
    let gravado = 0;
    let exento = 0;
    const lineas = items.map((it) => {
        const total = redondear2(it.cantidad * it.precioUnitario);
        if (it.exento) exento += total;
        else gravado += total;
        return { ...it, total };
    });
    const iva = redondear2((gravado * tarifa) / 100);
    const subtotal = redondear2(gravado + exento);
    return { lineas, subtotal, iva, total: redondear2(subtotal + iva), tarifa };
}

/**
 * Regla SRI: consumidor final no puede pasar de $50. Devuelve un mensaje amable o null.
 */
export function validarConsumidorFinal(cliente, totales) {
    if (cliente?.identificacion === CONSUMIDOR_FINAL && totales.total > LIMITE_CONSUMIDOR_FINAL) {
        return 'Para ventas de más de $50 el SRI pide los datos del cliente. '
            + 'Escribe su nombre y cédula, por ejemplo: Factura a Juan Pérez 0912345678';
    }
    return null;
}

/**
 * Todo en uno para el chat: interpreta, calcula y valida.
 * @returns {{ok:true, cliente, items, totales}|{ok:false, error:string}}
 */
export function prepararFactura(mensaje) {
    const r = interpretarMensaje(mensaje);
    if (!r.ok) return r;
    const totales = calcularTotales(r.items);
    const limite = validarConsumidorFinal(r.cliente, totales);
    if (limite) return error(limite);
    return { ok: true, cliente: r.cliente, items: r.items, totales };
}

export function dinero(valor) {
    return '$' + Number(valor).toFixed(2);
}

export function ejemploFactura() {
    return 'Factura a Juan Pérez 0912345675\n2 colas a 0.50\n1 pan a 0.25';
}
