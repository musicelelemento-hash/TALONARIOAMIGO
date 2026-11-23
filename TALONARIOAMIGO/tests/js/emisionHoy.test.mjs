import test from 'node:test';
import assert from 'node:assert/strict';

const mem = {};
globalThis.localStorage = {
    getItem: (k) => (k in mem ? mem[k] : null),
    setItem: (k, v) => { mem[k] = String(v); },
    removeItem: (k) => { delete mem[k]; },
};
const { emisionHoy } = await import('../../resources/js/services/emisionHoy.js');

test('suma y separa práctica de real', () => {
    emisionHoy.limpiar();
    emisionHoy.registrar({ total: 1.15 });
    emisionHoy.registrar({ total: 2.1, offline: true });
    emisionHoy.registrar({ total: 9, practica: true });
    assert.deepEqual(emisionHoy.resumen(false), { cantidad: 2, total: 3.25 });
    assert.deepEqual(emisionHoy.resumen(true), { cantidad: 1, total: 9 });
});

test('ignora totales inválidos y datos dañados', () => {
    emisionHoy.limpiar();
    emisionHoy.registrar({ total: 'x' });
    assert.equal(emisionHoy.resumen().cantidad, 0);
    mem.ta_emisiones_hoy_v1 = '{roto';
    assert.equal(emisionHoy.resumen().cantidad, 0);
});
