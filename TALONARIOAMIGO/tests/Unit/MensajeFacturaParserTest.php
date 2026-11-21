<?php

namespace Tests\Unit;

use App\Services\WhatsApp\MensajeFacturaParser;
use PHPUnit\Framework\TestCase;

class MensajeFacturaParserTest extends TestCase
{
    private function parse(string $mensaje): array
    {
        return (new MensajeFacturaParser())->parse($mensaje);
    }

    public function test_cliente_con_cedula_y_productos_en_lineas(): void
    {
        $r = $this->parse("Factura a Juan Pérez 0912345678\n2 colas a 0.50\n1 pan 0,25");

        $this->assertTrue($r['ok']);
        $this->assertSame(['nombre' => 'JUAN PÉREZ', 'identificacion' => '0912345678'], $r['cliente']);
        $this->assertSame([
            ['descripcion' => 'COLAS', 'cantidad' => 2.0, 'precioUnitario' => 0.5],
            ['descripcion' => 'PAN', 'cantidad' => 1.0, 'precioUnitario' => 0.25],
        ], $r['items']);
    }

    public function test_consumidor_final_en_una_linea_con_dolares(): void
    {
        $r = $this->parse('factura consumidor final: 3 aguas $0.40, 1 atún 1.75');

        $this->assertTrue($r['ok']);
        $this->assertSame(MensajeFacturaParser::CONSUMIDOR_FINAL, $r['cliente']['identificacion']);
        $this->assertCount(2, $r['items']);
        $this->assertSame('ATÚN', $r['items'][1]['descripcion']);
        $this->assertSame(1.75, $r['items'][1]['precioUnitario']);
    }

    public function test_sin_cliente_asume_consumidor_final_y_cantidad_uno(): void
    {
        $r = $this->parse('pan 0.25; 2 x cola 0.50');

        $this->assertTrue($r['ok']);
        $this->assertSame(MensajeFacturaParser::CONSUMIDOR_FINAL, $r['cliente']['identificacion']);
        $this->assertSame(1.0, $r['items'][0]['cantidad']);
        $this->assertSame('COLA', $r['items'][1]['descripcion']);
    }

    public function test_ruc_correo_y_separador_dos_puntos(): void
    {
        $r = $this->parse('Factura para Tienda XYZ 1790012345001 compras@xyz.ec: 10 cuadernos a $1,50 c/u');

        $this->assertTrue($r['ok']);
        $this->assertSame('TIENDA XYZ', $r['cliente']['nombre']);
        $this->assertSame('1790012345001', $r['cliente']['identificacion']);
        $this->assertSame('compras@xyz.ec', $r['cliente']['email']);
        $this->assertSame(10.0, $r['items'][0]['cantidad']);
        $this->assertSame(1.5, $r['items'][0]['precioUnitario']);
    }

    public function test_cliente_sin_cedula_pide_el_dato(): void
    {
        $r = $this->parse("Factura a Pedro\n1 pan 0.25");

        $this->assertFalse($r['ok']);
        $this->assertStringContainsString('cédula', $r['error']);
    }

    public function test_mensaje_sin_productos(): void
    {
        $this->assertFalse($this->parse('hola qué tal')['ok']);
        $this->assertFalse($this->parse('factura')['ok']);
    }

    public function test_producto_sin_precio_no_se_inventa(): void
    {
        $r = $this->parse("Factura consumidor final\n2 colas");

        $this->assertFalse($r['ok']);
        $this->assertStringContainsString('2 colas', $r['error']);
    }
}
