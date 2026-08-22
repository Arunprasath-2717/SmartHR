# ==============================================================================
# DAYFLOW - Local Odoo 17 Development Server Launcher
# ==============================================================================
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\backend\scripts\run_odoo.ps1
#   powershell -ExecutionPolicy Bypass -File .\backend\scripts\run_odoo.ps1 -UpdateModule
# ==============================================================================

param (
    [switch]$UpdateModule,
    [string]$ConfigPath = "D:\SmartHR\backend\config\odoo.local.conf",
    [string]$Database = ""
)

$OdooDir = "D:\Odoo\odoo"
$VenvPython = "$OdooDir\.venv\Scripts\python.exe"
$OdooBin = "$OdooDir\odoo-bin"

# 1. Validate Odoo installation
if (-not (Test-Path $OdooBin)) {
    Write-Error "[DAYFLOW ERROR] odoo-bin not found at $OdooBin. Ensure Odoo 17 source is cloned to $OdooDir."
    exit 1
}

# 2. Validate Virtual Environment
if (-not (Test-Path $VenvPython)) {
    Write-Error "[DAYFLOW ERROR] Python virtual environment not found at $VenvPython. Create it with 'uv venv --python 3.10 $OdooDir\.venv'."
    exit 1
}

# 3. Validate Configuration File
if (-not (Test-Path $ConfigPath)) {
    Write-Warning "[DAYFLOW WARNING] Local config not found at $ConfigPath, falling back to default odoo.conf."
    $ConfigPath = "D:\SmartHR\backend\config\odoo.conf"
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "             DAYFLOW - LOCAL ODOO 17 SERVER                 " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " Odoo Binary:   $OdooBin" -ForegroundColor Gray
Write-Host " Python Venv:   $VenvPython" -ForegroundColor Gray
Write-Host " Config File:   $ConfigPath" -ForegroundColor Gray
Write-Host " Addons Path:   D:\SmartHR\backend\addons, $OdooDir\addons" -ForegroundColor Gray
Write-Host "============================================================" -ForegroundColor Cyan

# 4. Assemble Arguments
$ArgsList = @("$OdooBin", "-c", "$ConfigPath")

if ($Database -ne "") {
    $ArgsList += @("-d", "$Database")
}

if ($UpdateModule) {
    Write-Host "[DAYFLOW] Updating 'dayflow_core' addon during startup..." -ForegroundColor Yellow
    $ArgsList += @("-u", "dayflow_core")
}

# 5. Launch Odoo Server
Set-Location $OdooDir
& $VenvPython @ArgsList
