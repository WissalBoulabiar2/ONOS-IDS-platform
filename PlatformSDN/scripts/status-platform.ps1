$ErrorActionPreference = "SilentlyContinue"

Write-Host "Ports"
Get-NetTCPConnection -LocalPort 3000, 5000 -State Listen |
  Select-Object LocalPort, State, OwningProcess |
  Sort-Object LocalPort |
  Format-Table -AutoSize

Write-Host ""
Write-Host "Backend health"
try {
  Invoke-WebRequest -UseBasicParsing http://localhost:5000/api/health -TimeoutSec 10 | Select-Object -ExpandProperty Content
} catch {
  if ($_.Exception.Response -and $_.Exception.Response.GetResponseStream) {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $content = $reader.ReadToEnd()
    $reader.Dispose()

    if ($content) {
      Write-Host $content
    } else {
      Write-Host "Backend returned an error response"
    }
  } else {
    Write-Host "Backend not reachable"
  }
}
