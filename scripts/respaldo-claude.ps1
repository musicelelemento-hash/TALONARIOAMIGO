# Respaldo: abre Claude Code usando tu servidor FreeLLMAPI local (modelos gratuitos).
# No cambia tu configuración normal de Claude Code: solo afecta a esta sesión de respaldo.
# Uso (PowerShell, en tu PC, con FreeLLMAPI encendido):  .\scripts\respaldo-claude.ps1
# La llave se lee de la variable FREELLMAPI_API_KEY (ver docs/RESPALDO_FREELLMAPI.md). Nunca la escribas aquí.

$Url = if ($env:FREELLMAPI_URL) { $env:FREELLMAPI_URL } else { "http://127.0.0.1:31415" }

if (-not $env:FREELLMAPI_API_KEY) {
    Write-Host "Falta la llave. Guárdala una sola vez con:" -ForegroundColor Yellow
    Write-Host '  [Environment]::SetEnvironmentVariable("FREELLMAPI_API_KEY", "TU_LLAVE", "User")'
    Write-Host "y abre una terminal nueva."
    exit 1
}

try {
    Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5 | Out-Null
} catch {
    if (-not $_.Exception.Response) {
        Write-Host "No encuentro FreeLLMAPI en $Url. Abre la app de FreeLLMAPI y vuelve a intentar." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "Abriendo Claude Code en modo respaldo (FreeLLMAPI en $Url)..." -ForegroundColor Green
npx --yes freellmapi@0.8.4 launch --url $Url
