param(
  [string]$TargetEnvVar = 'VITE_PANEL_TARGET'
)

$target = $env:VITE_PANEL_TARGET
if (-not $target) { $target = 'Z:\www\d522-react' }

 $distDir = (Resolve-Path .\dist).Path
 $candidates = @(
   Join-Path $distDir 'my-react-panel.umd.js'
   Join-Path $distDir 'my-react-panel.mjs'
   Join-Path $distDir 'my-react-panel.js'
 )

 $distFile = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
 if (-not $distFile) {
  Write-Error "Panel bundle not found in dist/. Run `npm run build:panel` first. Candidates: $($candidates -join ', ')"
  exit 1
 }

if (-not (Test-Path $target)) { New-Item -ItemType Directory -Path $target | Out-Null }

Copy-Item -Path $distFile -Destination (Join-Path $target 'my-react-panel.js') -Force
Write-Host "Deployed panel to $(Join-Path $target 'my-react-panel.js')"
