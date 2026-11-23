import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRucTexto } from '../../resources/js/services/rucFoto.js';

test('entiende el texto de una foto del certificado de RUC', () => {
    const r = parseRucTexto('CERTIFICADO DE RUC\nNúmero RUC: 0928374615001\nRAZÓN SOCIAL: ABARROTES DON CARLOS\nRIMPE NEGOCIO POPULAR\nCALLE: AV 9 DE OCTUBRE Y BOYACA');
    assert.equal(r.ruc, '0928374615001');
    assert.equal(r.nombre, 'ABARROTES DON CARLOS');
    assert.equal(r.regimen, 'RIMPE_POPULAR');
    assert.match(r.direccion, /9 DE OCTUBRE/);
});

test('si no se entiende, devuelve vacío para completar a mano', () => {
    assert.deepEqual(parseRucTexto('xx ~~ .'), { ruc: '', nombre: '', direccion: '', regimen: '' });
    assert.equal(parseRucTexto(null).ruc, '');
});
