/**
 * Lógica pura del Modo Caja (tablet horizontal). No toca el DOM ni la red.
 * Los totales salen de calcularTotales (interpreteFactura.js): mismo cálculo y mismo IVA 15 %
 * que el facturador, el chat y el servidor. La emisión no está aquí: la hace AppManager.
 */
import { calcularTotales, CONSUMIDOR_FINAL, validarConsumidorFinal } from './interpreteFactura.js';

/** Productos rápidos: los mismos chips del facturador (FacturadorRealista.js) y la caja. */
export const PRODUCTOS_RAPIDOS = [
    { id: 'maiz', nombre: 'Quintal de Maíz', corto: 'Maíz', precio: 18.5 },
    { id: 'cafe', nombre: 'Quintal de Café', corto: 'Café', precio: 45 },
    { id: 'cacao', nombre: 'Quintal de Cacao Fino', corto: 'Cacao', precio: 60 },
    { id: 'banano', nombre: 'Caja de Banano', corto: 'Banano', precio: 6.5 },
];

export const CLIENTE_CONSUMIDOR_FINAL = { nombre: 'CONSUMIDOR FINAL', identificacion: CONSUMIDOR_FINAL };

const CLAVE_PRODUCTOS = 'ta_caja_productos_v1';
const CLAVE_CLIENTES = 'ta_caja_clientes_v1';
const MAX_PRODUCTOS = 24;
const MAX_CLIENTES = 12;

export function idProducto(nombre) {
    return String(nombre || '')
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Suma `n` unidades del producto; si ya está en la factura, aumenta su cantidad. */
export function sumarProducto(lineas, prod, n = 1) {
    const id = prod.id || idProducto(prod.nombre);
    const hay = lineas.some((l) => l.id === id);
    if (hay) return lineas.map((l) => (l.id === id ? { ...l, cantidad: l.cantidad + n } : l));
    return [...lineas, { id, nombre: prod.nombre, precio: Number(prod.precio), cantidad: n }];
}

/** Fija la cantidad de una línea. Cantidad 0 o inválida la quita. */
export function fijarCantidad(lineas, id, cantidad) {
    const c = Math.floor(Number(cantidad));
    if (!Number.isFinite(c) || c <= 0) return lineas.filter((l) => l.id !== id);
    return lineas.map((l) => (l.id === id ? { ...l, cantidad: Math.min(c, 9999) } : l));
}

export function cantidadDe(lineas, id) {
    return lineas.find((l) => l.id === id)?.cantidad || 0;
}

/** Subtotal, IVA 15 % y total, con el mismo cálculo que ya usa la app. */
export function totalesCaja(lineas) {
    return calcularTotales(lineas.map((l) => ({ cantidad: l.cantidad, precioUnitario: l.precio, exento: false })));
}

/** Aviso amable si es consumidor final y pasa de $50 (regla del SRI); si no, null. */
export function avisoConsumidorFinal(cliente, lineas) {
    return validarConsumidorFinal(cliente, totalesCaja(lineas));
}

/** Mismo formato que collectEmitPayload() del facturador. */
export function aPayload(cliente, lineas) {
    const c = cliente || CLIENTE_CONSUMIDOR_FINAL;
    return {
        cliente: {
            nombre: c.nombre,
            identificacion: c.identificacion,
            direccion: c.direccion || '',
            telefono: c.telefono || '',
            email: c.email || '',
        },
        items: lineas.map((l) => ({ descripcion: l.nombre, cantidad: l.cantidad, precioUnitario: l.precio, exento: false })),
    };
}

export function esConsumidorFinal(cliente) {
    return !cliente || cliente.identificacion === CONSUMIDOR_FINAL;
}

function almacen() {
    try { return globalThis.localStorage || null; } catch { return null; }
}

function leer(clave, st) {
    try {
        const v = JSON.parse((st || almacen())?.getItem(clave) || '[]');
        return Array.isArray(v) ? v : [];
    } catch { return []; }
}

function guardar(clave, lista, st) {
    try { (st || almacen())?.setItem(clave, JSON.stringify(lista)); } catch { /* sin almacenamiento: no pasa nada */ }
}

/**
 * Productos de la cuadrícula: los rápidos de siempre + los que la persona ya usó,
 * los más vendidos primero. `usos` cuenta cuántas veces se vendió cada uno.
 */
export function productosDeCaja(st) {
    const guardados = leer(CLAVE_PRODUCTOS, st).filter((p) => p && p.id && p.nombre && Number.isFinite(Number(p.precio)));
    const mapa = new Map();
    PRODUCTOS_RAPIDOS.forEach((p) => mapa.set(p.id, { ...p, usos: 0 }));
    guardados.forEach((p) => {
        const previo = mapa.get(p.id);
        mapa.set(p.id, { ...(previo || {}), ...p, corto: previo?.corto || p.nombre, usos: Number(p.usos) || 0 });
    });
    const lista = [...mapa.values()];
    return lista.map((p, i) => ({ p, i })).sort((a, b) => (b.p.usos - a.p.usos) || (a.i - b.i)).map((x) => x.p);
}

/** Guarda un producto nuevo ("+ Otro producto") para que quede en la cuadrícula. */
export function guardarProductoNuevo(nombre, precio, st) {
    const n = String(nombre || '').trim();
    const pr = Number(String(precio).replace(',', '.'));
    if (!n || !Number.isFinite(pr) || pr < 0) return null;
    const prod = { id: idProducto(n), nombre: n, corto: n, precio: pr, usos: 0 };
    if (!prod.id) return null;
    const lista = leer(CLAVE_PRODUCTOS, st).filter((p) => p.id !== prod.id);
    lista.push(prod);
    guardar(CLAVE_PRODUCTOS, lista.slice(-MAX_PRODUCTOS), st);
    return prod;
}

/** Tras emitir: suma una venta a cada producto usado (así los más vendidos suben). */
export function registrarUsoProductos(lineas, st) {
    let lista = leer(CLAVE_PRODUCTOS, st);
    lineas.forEach((l) => {
        const hay = lista.find((p) => p.id === l.id);
        if (hay) { hay.usos = (Number(hay.usos) || 0) + 1; hay.precio = l.precio; }
        else lista.push({ id: l.id, nombre: l.nombre, precio: l.precio, usos: 1 });
    });
    guardar(CLAVE_PRODUCTOS, lista.slice(-MAX_PRODUCTOS), st);
}

export function clientesFrecuentes(st) {
    return leer(CLAVE_CLIENTES, st).filter((c) => c && c.nombre && c.identificacion && c.identificacion !== CONSUMIDOR_FINAL);
}

/** Guarda al cliente (solo en este dispositivo) para ofrecerlo la próxima vez. */
export function recordarCliente(cliente, st) {
    if (esConsumidorFinal(cliente) || !String(cliente.nombre || '').trim()) return;
    const lista = clientesFrecuentes(st).filter((c) => c.identificacion !== cliente.identificacion);
    lista.unshift({ nombre: cliente.nombre.trim(), identificacion: cliente.identificacion.trim() });
    guardar(CLAVE_CLIENTES, lista.slice(0, MAX_CLIENTES), st);
}

/** ¿Pantalla tipo mostrador? Tablet (o más grande) en horizontal. */
export function esTabletHorizontal(win = globalThis) {
    try { return !!win.matchMedia('(min-width: 900px) and (orientation: landscape)').matches; } catch { return false; }
}
