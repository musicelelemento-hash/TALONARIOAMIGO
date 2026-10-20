<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    /** @test */
    public function endpoint_health_responde_exitosamente()
    {
        $response = $this->get('/api/health');

        $response->assertStatus(200);
        $this->assertEquals('ok', $response->json('status'));
        $this->assertArrayHasKey('database', $response->json());
    }
}
