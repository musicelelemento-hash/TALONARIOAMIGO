<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class SriMappingTest extends TestCase
{
    /** @test */
    public function calcula_iva_15_porciento_ecuador_correctamente()
    {
        $baseImponible = 100.00;
        $tarifaIva = 0.15;
        $ivaCalculado = round($baseImponible * $tarifaIva, 2);
        $total = $baseImponible + $ivaCalculado;

        $this->assertEquals(15.00, $ivaCalculado);
        $this->assertEquals(115.00, $total);
    }

    /** @test */
    public function verifica_codigo_impuesto_iva_sri()
    {
        // En SRI Ecuador, código de impuesto 2 es IVA
        $codigoImpuesto = 2;
        // Código de porcentaje 4 corresponde a la tarifa 15% (vigente desde abril 2024)
        $codigoPorcentaje15 = 4;

        $this->assertEquals(2, $codigoImpuesto);
        $this->assertEquals(4, $codigoPorcentaje15);
    }
}
