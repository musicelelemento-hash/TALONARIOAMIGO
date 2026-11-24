<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
    @page { margin: 28px 30px; }
    body { font-family: 'DejaVu Sans', sans-serif; font-size: 9.5px; color: #1B2A4A; background: #FBF8EF; margin: 0; }
    table { border-collapse: collapse; }
    .cab { margin-bottom: 8px; }
    .cab-izq { padding: 10px 12px 10px 0; }
    .cab-der { border: 1.5px solid #1F3A8A; padding: 10px 12px; background: #FFFFFF; }
    .razon { font-size: 15px; font-weight: bold; color: #1F3A8A; }
    .comercial { font-size: 11px; margin-bottom: 6px; }
    .regimen { margin-top: 6px; font-weight: bold; border: 1px solid #1F3A8A; padding: 3px 6px; display: inline-block; }
    .dato { margin: 3px 0; }
    .ruc { font-size: 12px; font-weight: bold; }
    .tipo { font-size: 18px; font-weight: bold; color: #1F3A8A; letter-spacing: 2px; margin-top: 2px; }
    .numero { font-size: 13px; font-weight: bold; margin-bottom: 6px; }
    .clave-txt { font-size: 8.5px; word-wrap: break-word; letter-spacing: 0.4px; margin: 2px 0; }
    .barras { margin-top: 4px; }
    .comprador { border: 1.5px solid #1F3A8A; background: #FFFFFF; margin-bottom: 8px; }
    .comprador td { padding: 4px 8px; }
    .detalle { border: 1.5px solid #1F3A8A; background: #FFFFFF; margin-bottom: 8px; }
    .detalle th { background: #E3E9F7; border-bottom: 1.5px solid #1F3A8A; padding: 5px 6px; text-align: left; }
    .detalle th.der { text-align: right; }
    .detalle td { padding: 4px 6px; border-bottom: 0.5px solid #B8C2DD; }
    .der { text-align: right; }
    .pie-tabla td { padding: 0; }
    .extra { padding-right: 10px !important; }
    .titulo-caja { font-weight: bold; color: #1F3A8A; border-bottom: 1px solid #1F3A8A; padding-bottom: 2px; margin-bottom: 3px; }
    .totales { border: 1.5px solid #1F3A8A; background: #FFFFFF; }
    .totales td { padding: 4px 8px; border-bottom: 0.5px solid #B8C2DD; }
    .totales .total td { font-size: 12px; font-weight: bold; background: #E3E9F7; border-bottom: none; border-top: 1.5px solid #1F3A8A; }
    .hecho { margin-top: 22px; text-align: center; font-size: 8px; color: #5B6785; }
</style>
</head>
<body>
@include('ride._cuerpo')
</body>
</html>
