@php
    $m = fn($v) => number_format((float) $v, 2, '.', ',');
    $q = fn($v) => rtrim(rtrim(number_format((float) $v, 6, '.', ''), '0'), '.');
    $fechaAut = $c->fecha_autorizacion ? $c->fecha_autorizacion->setTimezone('America/Guayaquil')->format('d/m/Y H:i:s') : '—';
    $fechaEmi = $c->fecha_emision ? $c->fecha_emision->setTimezone('America/Guayaquil')->format('d/m/Y') : '';
    $descTotal = (float) $c->total_descuento;
    $ivaPct = (int) ($c->tarifa_iva_porcentaje ?: 15);
@endphp
<table class="cab" width="100%" cellspacing="0" cellpadding="0">
    <tr>
        <td class="cab-izq" width="50%" valign="top">
            <div class="razon">{{ $emisor->razon_social }}</div>
            @if($emisor->nombre_comercial && $emisor->nombre_comercial !== $emisor->razon_social)
                <div class="comercial">{{ $emisor->nombre_comercial }}</div>
            @endif
            <div class="dato"><b>Dirección matriz:</b> {{ $emisor->direccion_matriz }}</div>
            <div class="dato"><b>Obligado a llevar contabilidad:</b> {{ $emisor->obligado_contabilidad ? 'SI' : 'NO' }}</div>
            @if($emisor->contribuyente_especial)
                <div class="dato"><b>Contribuyente especial N°:</b> {{ $emisor->contribuyente_especial }}</div>
            @endif
            @if($regimen)
                <div class="regimen">{{ $regimen }}</div>
            @endif
        </td>
        <td class="cab-der" width="50%" valign="top">
            <div class="ruc">R.U.C.: {{ $emisor->ruc }}</div>
            <div class="tipo">FACTURA</div>
            <div class="numero">N° {{ $c->numero_comprobante }}</div>
            <div class="dato"><b>Número de autorización:</b></div>
            <div class="clave-txt">{{ $c->numero_autorizacion ?: '—' }}</div>
            <div class="dato"><b>Fecha y hora de autorización:</b> {{ $fechaAut }}</div>
            <div class="dato"><b>Ambiente:</b> {{ $ambiente }} &nbsp; <b>Emisión:</b> NORMAL</div>
            <div class="dato"><b>Clave de acceso:</b></div>
            @if($barcode)
                <div class="barras"><img src="{{ $barcode }}" style="width: 100%; height: 42px;"></div>
            @endif
            <div class="clave-txt">{{ $c->clave_acceso }}</div>
        </td>
    </tr>
</table>

<table class="comprador" width="100%" cellspacing="0" cellpadding="0">
    <tr>
        <td width="62%"><b>Razón social / Nombres:</b> {{ $c->cliente_nombre }}</td>
        <td width="38%"><b>Identificación:</b> {{ $c->cliente_identificacion }}</td>
    </tr>
    <tr>
        <td><b>Dirección:</b> {{ $c->cliente_direccion ?: '—' }}</td>
        <td><b>Fecha de emisión:</b> {{ $fechaEmi }}</td>
    </tr>
</table>

<table class="detalle" width="100%" cellspacing="0" cellpadding="0">
    <thead>
        <tr>
            <th width="10%">Cant.</th>
            <th>Descripción</th>
            <th width="15%" class="der">P. unitario</th>
            <th width="12%" class="der">Descuento</th>
            <th width="15%" class="der">Total</th>
        </tr>
    </thead>
    <tbody>
        @foreach($items as $it)
            <tr>
                <td>{{ $q($it->cantidad) }}</td>
                <td>{{ $it->descripcion }}</td>
                <td class="der">{{ $m($it->precio_unitario) }}</td>
                <td class="der">{{ $m($it->descuento) }}</td>
                <td class="der">{{ $m($it->precio_total_sin_impuesto) }}</td>
            </tr>
        @endforeach
    </tbody>
</table>

<table width="100%" cellspacing="0" cellpadding="0" class="pie-tabla">
    <tr>
        <td width="55%" valign="top" class="extra">
            <div class="titulo-caja">Información adicional</div>
            @if($c->cliente_email)<div class="dato"><b>Correo:</b> {{ $c->cliente_email }}</div>@endif
            @if($c->cliente_telefono)<div class="dato"><b>Teléfono:</b> {{ $c->cliente_telefono }}</div>@endif
            @if(!$c->cliente_email && !$c->cliente_telefono)<div class="dato">—</div>@endif
            <div class="titulo-caja" style="margin-top: 8px;">Forma de pago</div>
            <div class="dato">SIN UTILIZACIÓN DEL SISTEMA FINANCIERO &nbsp; <b>${{ $m($c->importe_total) }}</b></div>
        </td>
        <td width="45%" valign="top">
            <table class="totales" width="100%" cellspacing="0" cellpadding="0">
                <tr><td>SUBTOTAL {{ $ivaPct }}%</td><td class="der">{{ $m($subtotalGravado) }}</td></tr>
                <tr><td>SUBTOTAL 0%</td><td class="der">{{ $m($subtotalExento) }}</td></tr>
                <tr><td>DESCUENTO</td><td class="der">{{ $m($descTotal) }}</td></tr>
                <tr><td>IVA {{ $ivaPct }}%</td><td class="der">{{ $m($c->total_iva) }}</td></tr>
                <tr class="total"><td>VALOR TOTAL</td><td class="der">${{ $m($c->importe_total) }}</td></tr>
            </table>
        </td>
    </tr>
</table>

<div class="hecho">Hecho con Talonario Amigo</div>
