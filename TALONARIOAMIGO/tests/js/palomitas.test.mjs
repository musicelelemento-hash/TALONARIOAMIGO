import test from 'node:test';
import assert from 'node:assert/strict';
import { infoPalomitas, nivelDeEmision } from '../../resources/js/services/palomitasLogica.js';

test('nivel de emisión: offline 1, SRI 2, correo enviado 3', () => {
    assert.equal(nivelDeEmision({ offline: true }), 1);
    assert.equal(nivelDeEmision({}), 2);
    assert.equal(nivelDeEmision({ emailEnviado: true }), 3);
    assert.equal(nivelDeEmision({ emailEnviado: true, practica: true }), 2);
    assert.equal(nivelDeEmision({ offline: true, emailEnviado: true }), 1);
});

test('tercera palomita dice "enviada" y no promete recibida ni leída', () => {
    const i = infoPalomitas(3);
    assert.equal(i.texto, 'Enviada al cliente por correo');
    assert.doesNotMatch(i.texto, /recib|le[ií]d/i);
});
