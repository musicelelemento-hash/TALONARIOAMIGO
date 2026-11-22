import test from 'node:test';
import assert from 'node:assert/strict';
import {
    interpretarMensaje,
    calcularTotales,
    prepararFactura,
    redondear2,
    CONSUMIDOR_FINAL,
} from '../../resources/js/services/interpreteFactura.js';

// Casos espejo de tests/Unit/MensajeFacturaParserTest.php

test('cliente con cédula y productos en líneas', () => {
    const r = interpretarMensaje('Factura a Juan Pérez 0912345678\n2 colas a 0.50\n1 pan 0,25');
    assert.equal(r.ok, true);
    assert.deepEqual(r.cliente, { nombre: 'JUAN PÉREZ', identificacion: '0912345678' });
    assert.deepEqual(r.items, [
        { descripcion: 'COLAS', cantidad: 2, precioUnitario: 0.5 },
        { descripcion: 'PAN', cantidad: 1, precioUnitario: 0.25 },
    ]);
});

test('consumidor final en una línea con dólares', () => {
    const r = interpretarMensaje('factura consumidor final: 3 aguas $0.40, 1 atún 1.75');
    assert.equal(r.ok, true);
    assert.equal(r.cliente.identificacion, CONSUMIDOR_FINAL);
    assert.equal(r.items.length, 2);
    assert.equal(r.items[1].descripcion, 'ATÚN');
    assert.equal(r.items[1].precioUnitario, 1.75);
});

test('sin cliente asume consumidor final y cantidad uno', () => {
    const r = interpretarMensaje('pan 0.25; 2 x cola 0.50');
    assert.equal(r.ok, true);
    assert.equal(r.cliente.identificacion, CONSUMIDOR_FINAL);
    assert.equal(r.items[0].cantidad, 1);
    assert.equal(r.items[1].descripcion, 'COLA');
});

test('ruc, correo y separador dos puntos', () => {
    const r = interpretarMensaje('Factura para Tienda XYZ 1790012345001 compras@xyz.ec: 10 cuadernos a $1,50 c/u');
    assert.equal(r.ok, true);
    assert.equal(r.cliente.nombre, 'TIENDA XYZ');
    assert.equal(r.cliente.identificacion, '1790012345001');
    assert.equal(r.cliente.email, 'compras@xyz.ec');
    assert.equal(r.items[0].cantidad, 10);
    assert.equal(r.items[0].precioUnitario, 1.5);
});

test('cliente sin cédula pide el dato', () => {
    const r = interpretarMensaje('Factura a Pedro\n1 pan 0.25');
    assert.equal(r.ok, false);
    assert.match(r.error, /cédula/);
});

test('mensaje sin productos', () => {
    assert.equal(interpretarMensaje('hola qué tal').ok, false);
    assert.equal(interpretarMensaje('factura').ok, false);
    assert.equal(interpretarMensaje('').ok, false);
});

test('producto sin precio no se inventa', () => {
    const r = interpretarMensaje('Factura consumidor final\n2 colas');
    assert.equal(r.ok, false);
    assert.match(r.error, /2 colas/);
});

test('mensajes de error idénticos al PHP', () => {
    assert.equal(interpretarMensaje('hola qué tal').error, 'No encontré productos en tu mensaje.');
    assert.equal(
        interpretarMensaje('Factura a Pedro\n1 pan 0.25').error,
        'Falta la cédula o RUC de PEDRO. Escríbela junto al nombre, o pon "consumidor final".'.replace('PEDRO', 'Pedro')
    );
    assert.equal(
        interpretarMensaje('Factura consumidor final\n2 colas').error,
        'No entendí "2 colas". Escríbelo así: 2 colas a 0.50'
    );
});

// Totales (IVA 15 %, redondeo como el backend)

test('totales: 2 colas a 0.50 + 1 pan a 0.25 = 1.44', () => {
    const r = prepararFactura('Factura a Juan Pérez 0912345678\n2 colas a 0.50\n1 pan a 0.25');
    assert.equal(r.ok, true);
    assert.equal(r.totales.subtotal, 1.25);
    assert.equal(r.totales.iva, 0.19);
    assert.equal(r.totales.total, 1.44);
});

test('redondeo mitad hacia arriba como PHP', () => {
    assert.equal(redondear2(1.005), 1.01);
    assert.equal(redondear2(0.285), 0.29);
    assert.equal(redondear2(2.5 * 0.1), 0.25);
});

test('exento no paga IVA', () => {
    const t = calcularTotales([
        { descripcion: 'A', cantidad: 1, precioUnitario: 10 },
        { descripcion: 'B', cantidad: 2, precioUnitario: 5, exento: true },
    ]);
    assert.equal(t.subtotal, 20);
    assert.equal(t.iva, 1.5);
    assert.equal(t.total, 21.5);
});

test('consumidor final no puede pasar de $50', () => {
    const r = prepararFactura('consumidor final: 1 licuadora 45');
    assert.equal(r.ok, false);
    assert.match(r.error, /\$50/);
    assert.match(r.error, /cédula/);
    // Con 43.47 + IVA = 49.99 sí pasa
    assert.equal(prepararFactura('consumidor final: 1 licuadora 43.47').ok, true);
    // Con cliente identificado no hay límite
    assert.equal(prepararFactura('Factura a Juan Pérez 0912345678\n1 licuadora 45').ok, true);
});
