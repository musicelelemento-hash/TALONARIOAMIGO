<?php

namespace App\Services\WhatsApp;

/**
 * Convierte un mensaje escrito "como se habla" en el payload de emisión (cliente + ítems).
 *
 * Formatos aceptados (mayúsculas, tildes, "$" y coma decimal son indiferentes):
 *
 *   Factura a Juan Pérez 0912345678
 *   2 colas a 0.50
 *   1 pan 0,25
 *
 *   factura consumidor final: 3 aguas $0.40, 1 atún 1.75
 *
 *   2 x cola 0.50; 1 pan 0.25          (sin cliente → Consumidor Final)
 *
 * Cada producto es: [cantidad] descripción [a|x|@|por|=] precio_unitario
 * Si no se escribe cantidad, se asume 1.
 */
class MensajeFacturaParser
{
    public const CONSUMIDOR_FINAL = '9999999999999';

    private const NUMERO = '\d+(?:[.,]\d+)?';

    /**
     * @return array{ok:bool, cliente?:array, items?:array, error?:string}
     */
    public function parse(string $mensaje): array
    {
        $texto = trim(preg_replace('/[ \t]+/u', ' ', str_replace("\r", '', $mensaje)));

        // Quitar la palabra de arranque: "factura", "facturar", "fact", "factura a/para".
        $texto = preg_replace('/^(?:factur(?:a|ar|ame|émele|ale)?|fact)\b\.?\s*(?:a|para)?\s*/iu', '', $texto);
        $texto = trim($texto, " :\n");

        if ($texto === '') {
            return $this->error('No encontré productos en tu mensaje.');
        }

        // "cliente: productos" en una sola línea.
        $segmentos = [];
        $lineas = preg_split('/\n+/u', $texto);
        if (count($lineas) === 1 && preg_match('/^([^:]+):(.+)$/u', $lineas[0], $m) && !$this->esItem(trim($m[1]))) {
            $segmentos[] = trim($m[1]);
            $texto = $m[2];
        }

        foreach (preg_split('/\n+|;|,\s+|\s+y\s+(?=\d)/u', $texto) as $parte) {
            $parte = trim($parte, " .\t:");
            if ($parte !== '') {
                $segmentos[] = $parte;
            }
        }

        if (!preg_match('/\d/', $texto) && count($segmentos) <= 1 && empty($lineas[1] ?? null)) {
            return $this->error('No encontré productos en tu mensaje.');
        }

        $cliente = null;
        if (!empty($segmentos) && !$this->esItem($segmentos[0])) {
            $cliente = $this->parseCliente(array_shift($segmentos));
            if (isset($cliente['error'])) {
                return $this->error($cliente['error']);
            }
        }

        $items = [];
        foreach ($segmentos as $segmento) {
            $item = $this->parseItem($segmento);
            if ($item === null) {
                return $this->error("No entendí \"{$segmento}\". Escríbelo así: 2 colas a 0.50");
            }
            $items[] = $item;
        }

        if (empty($items)) {
            return $this->error('No encontré productos en tu mensaje.');
        }

        return [
            'ok' => true,
            'cliente' => $cliente ?? ['nombre' => 'CONSUMIDOR FINAL', 'identificacion' => self::CONSUMIDOR_FINAL],
            'items' => $items,
        ];
    }

    private function esItem(string $segmento): bool
    {
        return $this->parseItem($segmento) !== null;
    }

    private function parseItem(string $segmento): ?array
    {
        // Una cédula/RUC (10 o 13 dígitos seguidos) nunca es un precio: ese segmento es el cliente.
        if (preg_match('/\d{10,}/', preg_replace('/(?<=\d)[ -](?=\d)/', '', $segmento))) {
            return null;
        }

        $n = self::NUMERO;
        $patron = '/^(?:(' . $n . ')\s*(?:x\s+|unidades?\s+(?:de\s+)?)?)?'          // cantidad opcional
            . '([^\d\s$].*?)'                                                     // descripción
            . '(?:\s+(?:a|x|por|de|en)\s+|\s*[@=:]\s*|\s+)\$?\s*(' . $n . ')'      // separador + precio
            . '\s*(?:\$|usd|d[óo]lares?|c\/u|cada\s+un[oa])?$/iu';

        if (!preg_match($patron, $segmento, $m)) {
            return null;
        }

        $descripcion = trim($m[2], " -:");
        if ($descripcion === '' || mb_strlen($descripcion) > 300) {
            return null;
        }

        $cantidad = $m[1] !== '' ? $this->numero($m[1]) : 1.0;
        $precio = $this->numero($m[3]);

        if ($cantidad <= 0) {
            return null;
        }

        return [
            'descripcion' => mb_strtoupper($descripcion),
            'cantidad' => $cantidad,
            'precioUnitario' => $precio,
        ];
    }

    private function parseCliente(string $segmento): array
    {
        if (preg_match('/^(?:el\s+|un\s+)?(?:consumidor\s+final|cf|sin\s+datos)$/iu', trim($segmento))) {
            return ['nombre' => 'CONSUMIDOR FINAL', 'identificacion' => self::CONSUMIDOR_FINAL];
        }

        $email = null;
        if (preg_match('/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/u', $segmento, $m)) {
            $email = $m[0];
            $segmento = str_replace($m[0], ' ', $segmento);
        }

        $identificacion = null;
        if (preg_match('/(?<!\d)(\d{13}|\d{10})(?!\d)/', preg_replace('/(?<=\d)[ -](?=\d)/', '', $segmento), $m)) {
            $identificacion = $m[1];
            $segmento = preg_replace('/\d[\d -]{8,}\d/', ' ', $segmento);
        }

        $segmento = preg_replace('/\b(?:c[ée]dula|ruc|ci|con|correo|email|mail)\b\.?:?/iu', ' ', $segmento);
        $nombre = trim(preg_replace('/\s+/u', ' ', $segmento), " ,.-:");

        if ($nombre === '') {
            return ['error' => 'Falta el nombre del cliente. Ejemplo: Factura a Juan Pérez 0912345678'];
        }

        if ($identificacion === null) {
            return ['error' => "Falta la cédula o RUC de {$nombre}. Escríbela junto al nombre, o pon \"consumidor final\"."];
        }

        $cliente = ['nombre' => mb_strtoupper($nombre), 'identificacion' => $identificacion];
        if ($email) {
            $cliente['email'] = $email;
        }

        return $cliente;
    }

    private function numero(string $valor): float
    {
        return (float) str_replace(',', '.', $valor);
    }

    private function error(string $mensaje): array
    {
        return ['ok' => false, 'error' => $mensaje];
    }
}
