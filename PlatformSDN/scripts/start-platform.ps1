$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$backendOut = Join-Path $root "backend-runtime.log"
$backendErr = Join-Path $root "backend-runtime.err.log"
$frontendOut = Join-Path $root "frontend-runtime.log"
$frontendErr = Join-Path $root "frontend-runtime.err.log"
$npm = (Get-Command npm.cmd).Source
$nextBuildDir = Join-Path $root ".next"

if (-not (Test-Path (Join-Path $root ".env.local"))) {
  Copy-Item (Join-Path $root ".env.local.example") (Join-Path $root ".env.local")
}

foreach ($port in 3000, 3001, 5000) {
  $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  foreach ($connection in $connections) {
    Stop-Process -Id $connection.OwningProcess -Force -ErrorAction SilentlyContinue
  }
}

Start-Sleep -Seconds 2

foreach ($file in @($backendOut, $backendErr, $frontendOut, $frontendErr)) {
  if (Test-Path $file) {
    try {
      Remove-Item $file -Force
    } catch {
      # If a previous process still holds the file briefly, keep going.
    }
  }
}

if (Test-Path $nextBuildDir) {
  try {
    Remove-Item $nextBuildDir -Recurse -Force
  } catch {
    # If a previous process still holds the folder briefly, keep going.
  }
}

Write-Host ""
Write-Host "Building frontend for a clean production preview..."
& $npm run build
if ($LASTEXITCODE -ne 0) {
  throw "Frontend build failed. Platform startup aborted."
}

Start-Process -FilePath $npm -ArgumentList "run", "backend" -WorkingDirectory $root -RedirectStandardOutput $backendOut -RedirectStandardError $backendErr | Out-Null
Start-Process -FilePath $npm -ArgumentList "run", "start" -WorkingDirectory $root -RedirectStandardOutput $frontendOut -RedirectStandardError $frontendErr | Out-Null

Start-Sleep -Seconds 12

Write-Host ""
Write-Host "PlatformSDN startup summary"
Write-Host "Frontend: http://localhost:3000/login"
Write-Host "Backend:  http://localhost:5000/api/health"
Write-Host ""
Write-Host "Use these credentials:"
Write-Host "  admin@sdn.local / admin123"
Write-Host ""
Write-Host "Logs:"
Write-Host "  $backendOut"
Write-Host "  $frontendOut"
