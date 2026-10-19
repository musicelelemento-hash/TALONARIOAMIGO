<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use LibreriasSri\FacturacionElectronica;

class ClaveAccesoTest extends TestCase
{
    private FacturacionElectronica $facturacion;

    protected function setUp(): void
    {
        parent::setUp();
        $this->facturacion = new FacturacionElectronica();
    }

    /** @test */
    public function genera_clave_de_acceso_sri_de_exactamente_49_digitos()
    {
        $fecha = '2026-10-19';
        $tipoComprobante = '01'; // Factura
        $ruc = '1790012345001';
        $ambiente = '1'; // Pruebas
        $serie = '001001';
        $secuencial = '000000126';
        $codigoNumerico = '12345678';
        $tipoEmision = '1';

        $clave = $this->facturacion->GenerarClaveDeAccesos(
            $fecha,
            $tipoComprobante,
            $ruc,
            $ambiente,
            $serie,
            $secuencial,
            $codigoNumerico,
            $tipoEmision
        );

        $this->assertIsString($clave);
        $this->assertEquals(49, strlen($clave), 'La clave de acceso SRI debe tener exactamente 49 dígitos');
        $this->assertTrue(ctype_digit($clave), 'La clave de acceso SRI solo debe contener dígitos');

        // Verificar estructura de componentes
        $this->assertEquals('19102026', substr($clave, 0, 8), 'Fecha ddmmyyyy');
        $this->assertEquals('01', substr($clave, 8, 2), 'Tipo comprobante');
        $this->assertEquals('1790012345001', substr($clave, 10, 13), 'RUC');
        $this->assertEquals('1', substr($clave, 23, 1), 'Ambiente');
        $this->assertEquals('001001', substr($clave, 24, 6), 'Serie');
        $this->assertEquals('000000126', substr($clave, 30, 9), 'Secuencial');
        $this->assertEquals('12345678', substr($clave, 39, 8), 'Código numérico');
        $this->assertEquals('1', substr($clave, 47, 1), 'Tipo emisión');

        // El dígito 49 es el dígito verificador módulo 11
        $dv = substr($clave, 48, 1);
        $this->assertMatchesRegularExpression('/^[0-9]$/', $dv);
    }
}
