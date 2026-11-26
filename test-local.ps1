param(
  [string]$ProjectPath = '',
  [ValidateRange(1024,65535)][int]$Port = 8794,
  [switch]$NoBrowser
)
$ErrorActionPreference = 'Stop'
if (!$ProjectPath) {
  $ProjectPath = if (Test-Path (Join-Path $PSScriptRoot 'index.html')) { $PSScriptRoot } else { Join-Path $PSScriptRoot '../work/putsputs' }
}
$ProjectPath = (Resolve-Path -LiteralPath $ProjectPath).Path
if (!(Test-Path (Join-Path $ProjectPath 'index.html'))) { throw 'Select the putsputs project folder with -ProjectPath.' }
if (!(Get-Command python -ErrorAction SilentlyContinue)) { throw 'Install Python 3 and ensure python is on PATH.' }
$url = "http://localhost:$Port/"
Write-Host "Local preview: $url" -ForegroundColor Green
Write-Host 'Stop with Ctrl+C. Localhost supports the browser audio APIs.'
Write-Host 'A phone needs an HTTPS URL to test screen/audio capture; use the published site.'
if (!$NoBrowser) { Start-Process $url }
& python -m http.server $Port --bind 127.0.0.1 --directory $ProjectPath
if ($LASTEXITCODE -ne 0) { throw 'Local server failed. If the port is busy, pass -Port 8795.' }
