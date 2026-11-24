<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
    @page { margin: 30px 34px; }
    body { font-family: 'DejaVu Sans', sans-serif; font-size: 9.5px; color: #111111; background: #FFFFFF; margin: 0; }
    table { border-collapse: collapse; }
    .cab { margin-bottom: 12px; }
    .cab-izq { padding: 0 14px 0 0; }
    .cab-der { padding: 0 0 0 14px; border-left: 1px solid #111111; }
    .razon { font-size: 15px; font-weight: bold; }
    .comercial { font-size: 11px; margin-bottom: 6px; }
    .regimen { margin-top: 6px; font-weight: bold; }
    .dato { margin: 3px 0; }
    .ruc { font-size: 11px; font-weight: bold; }
    .tipo { font-size: 18px; font-weight: bold; letter-spacing: 2px; margin-top: 2px; }
    .numero { font-size: 13px; font-weight: bold; margin-bottom: 6px; }
    .clave-txt { font-size: 8.5px; word-wrap: break-word; letter-spacing: 0.4px; margin: 2px 0; }
    .barras { margin-top: 4px; }
    .comprador { border-top: 1px solid #111111; border-bottom: 1px solid #111111; margin-bottom: 12px; }
    .comprador td { padding: 5px 0; }
    .detalle { margin-bottom: 12px; }
    .detalle th { border-bottom: 1px solid #111111; padding: 5px 4px; text-align: left; }
    .detalle th.der { text-align: right; }
    .detalle td { padding: 4px; border-bottom: 0.5px solid #CCCCCC; }
    .der { text-align: right; }
    .pie-tabla td { padding: 0; }
    .extra { padding-right: 12px !important; }
    .titulo-caja { font-weight: bold; border-bottom: 1px solid #111111; padding-bottom: 2px; margin-bottom: 3px; }
    .totales td { padding: 4px 4px; border-bottom: 0.5px solid #CCCCCC; }
    .totales .total td { font-size: 12px; font-weight: bold; border-top: 1px solid #111111; border-bottom: none; }
    .hecho { margin-top: 26px; text-align: center; font-size: 8px; color: #777777; }
</style>
</head>
<body>
@include('ride._cuerpo')
</body>
</html>
