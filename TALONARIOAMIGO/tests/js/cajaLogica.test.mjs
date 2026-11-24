import test from 'node:test';
import assert from 'node:assert/strict';
import {
    sumarProducto, fijarCantidad, totalesCaja, aPayload, productosDeCaja, guardarProductoNuevo,
    registrarUsoProductos, recordarCliente, clientesFrecuentes, avisoConsumidorFinal, PRODUCTOS_RAPIDOS,
    CLIENTE_CONSUMIDOR_FINAL,
} from '../../resources/js/services/cajaLogica.js';

function memoria() {
    const d = {};
    return { getItem: (k) => (k in d ? d[k] : null), setItem: (k, v) => { d[k] = String(v); } };
}

test('un toque suma 1 y otro toque del mismo producto aumenta la cantidad', () => {
    let l = sumarProducto([], PRODUCTOS_RAPIDOS[0]);
    l = sumarProducto(l, PRODUCTOS_RAPIDOS[0]);
    l = sumarProducto(l, PRODUCTOS_RAPIDOS[3]);
    assert.equal(l.length, 2);
    assert.equal(l[0].cantidad, 2);
});

test('fijar cantidad 0 quita la línea', () => {
    const l = sumarProducto([], PRODUCTOS_RAPIDOS[1], 3);
    assert.equal(fijarCantidad(l, 'cafe', 5)[0].cantidad, 5);
    assert.equal(fijarCantidad(l, 'cafe', 0).length, 0);
    assert.equal(fijarCantidad(l, 'cafe', 'abc').length, 0);
});

test('totales con IVA 15 % igual que la factura', () => {
    // 2 x 18.50 + 1 x 6.50 = 43.50; IVA 6.525 -> 6.53; total 50.03
    let l = sumarProducto([], PRODUCTOS_RAPIDOS[0], 2);
    l = sumarProducto(l, PRODUCTOS_RAPIDOS[3]);
    const t = totalesCaja(l);
    assert.equal(t.subtotal, 43.5);
    assert.equal(t.iva, 6.53);
    assert.equal(t.total, 50.03);
});

test('payload con el formato del facturador y consumidor final por defecto', () => {
    const l = sumarProducto([], PRODUCTOS_RAPIDOS[3], 2);
    const p = aPayload(null, l);
    assert.equal(p.cliente.nombre, 'CONSUMIDOR FINAL');
    assert.deepEqual(p.items[0], { descripcion: 'Caja de Banano', cantidad: 2, precioUnitario: 6.5, exento: false });
});

test('consumidor final no pasa de $50', () => {
    const l = sumarProducto([], PRODUCTOS_RAPIDOS[2], 1); // 60 + IVA
    assert.match(avisoConsumidorFinal(CLIENTE_CONSUMIDOR_FINAL, l), /\$50/);
    assert.equal(avisoConsumidorFinal({ nombre: 'Juan', identificacion: '0912345675' }, l), null);
});

test('productos usados y nuevos quedan en la cuadrícula, los más vendidos primero', () => {
    const st = memoria();
    assert.equal(productosDeCaja(st).length, 4);
    const nuevo = guardarProductoNuevo('Pan de agua', '0,25', st);
    assert.equal(nuevo.precio, 0.25);
    assert.equal(guardarProductoNuevo('', '1', st), null);
    registrarUsoProductos([{ id: 'banano', nombre: 'Caja de Banano', precio: 6.5, cantidad: 1 }], st);
    const lista = productosDeCaja(st);
    assert.equal(lista[0].id, 'banano');
    assert.equal(lista.length, 5);
});

test('clientes frecuentes: sin consumidor final y sin repetidos', () => {
    const st = memoria();
    recordarCliente(CLIENTE_CONSUMIDOR_FINAL, st);
    recordarCliente({ nombre: 'Juan Pérez', identificacion: '0912345675' }, st);
    recordarCliente({ nombre: 'Juan P.', identificacion: '0912345675' }, st);
    const c = clientesFrecuentes(st);
    assert.equal(c.length, 1);
    assert.equal(c[0].nombre, 'Juan P.');
});
