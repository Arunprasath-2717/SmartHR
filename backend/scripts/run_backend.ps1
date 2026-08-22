# ==============================================================================
# DAYFLOW - FastAPI Backend Launcher Script
# ==============================================================================
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\backend\scripts\run_backend.ps1
# ==============================================================================

param (
    [string]$Host = "0.0.0.0",
    [int]$Port = 8000,
    [switch]$Reload
)

$BackendDir = "D:\SmartHR\backend"
$VenvPython = "$BackendDir\.venv\Scripts\python.exe"

if (-not (Test-Path $VenvPython)) {
    Write-Error "[DAYFLOW ERROR] Python virtual environment not found at $VenvPython. Run 'uv venv --python 3.11 $BackendDir\.venv' and install requirements."
    exit 1
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "             DAYFLOW - FASTAPI BACKEND SERVER               " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " Host:          $Host" -ForegroundColor Gray
Write-Host " Port:          $Port" -ForegroundColor Gray
Write-Host " Swagger Docs:  http://localhost:$Port/docs" -ForegroundColor Gray
Write-Host " ReDoc Docs:    http://localhost:$Port/redoc" -ForegroundColor Gray
Write-Host " Health Check:  http://localhost:$Port/api/v1/health" -ForegroundColor Gray
Write-Host " Python Venv:   $VenvPython" -ForegroundColor Gray
Write-Host "============================================================" -ForegroundColor Cyan

Set-Location $BackendDir

$ArgsList = @("-m", "uvicorn", "app.main:app", "--host", "$Host", "--port", "$Port")
if ($Reload -or $true) {
    $ArgsList += @("--reload")
}

& $VenvPython @ArgsList
