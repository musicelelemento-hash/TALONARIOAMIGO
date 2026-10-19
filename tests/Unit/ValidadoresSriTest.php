<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use LibreriasSri\Validadores;

class ValidadoresSriTest extends TestCase
{
    private Validadores $validator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->validator = new Validadores();
    }

    /** @test */
    public function valida_cedula_ecuatoriana_correcta()
    {
        // 0928374610 es una cédula con dígito verificador módulo 10 válido
        $this->assertTrue($this->validator->validarCedula('0928374610'));
    }

    /** @test */
    public function rechaza_cedula_con_longitud_invalida()
    {
        $this->assertFalse($this->validator->validarCedula('092837461'));
        $this->assertFalse($this->validator->validarCedula('09283746100'));
    }

    /** @test */
    public function rechaza_cedula_con_provincia_invalida()
    {
        // Provincia 30 no existe en Ecuador (1-24)
        $this->assertFalse($this->validator->validarCedula('3028374610'));
    }

    /** @test */
    public function valida_ruc_persona_natural()
    {
        // RUC persona natural termina en 001
        $this->assertTrue($this->validator->validarRucPersonaNatural('0928374610001'));
    }

    /** @test */
    public function rechaza_ruc_persona_natural_invalido()
    {
        // No termina en 001
        $this->assertFalse($this->validator->validarRucPersonaNatural('0928374610000'));
    }
}
