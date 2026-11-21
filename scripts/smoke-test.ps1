# ============================================================
# Smoke Test - Talonario Amigo
# Verifica: health, login demo y listado de comprobantes.
# Uso:
#   powershell -ExecutionPolicy Bypass -File scripts/smoke-test.ps1
#   powershell -ExecutionPolicy Bypass -File scripts/smoke-test.ps1 -ApiBase https://tu-api.com -Email demo@talonarioamigo.com -Password demo
# (ASCII-only para correr en Windows PowerShell y pwsh por igual)
# ============================================================
param(
    [string]$ApiBase = "https://talonario-amigo-api.onrender.com",
    [string]$Email = "demo@talonarioamigo.com",
    [string]$Password = "demo"
)

$ErrorActionPreference = "Stop"
$script:errors = 0

function Report($name, $ok, $detail) {
    $status = if ($ok) { "PASS" } else { "FAIL" }
    if (-not $ok) { $script:errors++ }
    Write-Host ("[{0}] {1} :: {2}" -f $status, $name, $detail)
}

$headers = @{ 'Accept' = 'application/json' }

# 1) Health + base de datos
try {
    $h = Invoke-RestMethod -Uri "$ApiBase/api/health/db" -Headers $headers -TimeoutSec 60
    $dbOk = $h.database.connected -eq $true
    Report "health/db" $dbOk ("connected={0}" -f $h.database.connected)
} catch {
    Report "health/db" $false $_.Exception.Message
}

# 2) Login demo
$token = $null
try {
    $body = @{ email = $Email; password = $Password } | ConvertTo-Json
    $login = Invoke-RestMethod -Uri "$ApiBase/api/v1/auth/login" -Method Post -Headers @{ 'Accept' = 'application/json'; 'Content-Type' = 'application/json' } -Body $body -TimeoutSec 60
    $token = $login.token
    Report "auth/login (demo)" ($null -ne $token) ("role=" + $login.user.role)
} catch {
    $msg = $_.Exception.Message
    if ($_.Exception.Response) {
        try {
            $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $msg = $sr.ReadToEnd()
        } catch {}
    }
    if ($msg -match "credenciales no coinciden") {
        Report "auth/login (demo)" $false "422 credenciales no coinciden -> falta correr DemoSeeder en el servidor"
    } else {
        Report "auth/login (demo)" $false $msg
    }
}

# 3) Listado de comprobantes (solo si hay token)
if ($token) {
    try {
        $c = Invoke-RestMethod -Uri "$ApiBase/api/v1/facturacion/comprobantes" -Headers @{ 'Accept' = 'application/json'; 'Authorization' = "Bearer $token" } -TimeoutSec 60
        $count = 0
        if ($null -ne $c.total) { $count = [int]$c.total }
        elseif ($c.comprobantes) { $count = @($c.comprobantes).Count }
        elseif ($c.data) { $count = @($c.data).Count }
        elseif ($c -is [array]) { $count = $c.Count }
        Report "facturacion/comprobantes" $true ("items=" + $count)
    } catch {
        Report "facturacion/comprobantes" $false $_.Exception.Message
    }
} else {
    Report "facturacion/comprobantes" $false "sin token (login fallo)"
}

Write-Host ""
if ($script:errors -eq 0) {
    Write-Host "SMOKE TEST OK - el deploy responde correctamente." -ForegroundColor Green
    exit 0
} else {
    Write-Host ("SMOKE TEST con {0} fallo(s). Revisa los FAIL de arriba." -f $script:errors) -ForegroundColor Red
    exit 1
}
