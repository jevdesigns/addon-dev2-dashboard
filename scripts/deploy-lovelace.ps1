# Deploy Lovelace Card to Home Assistant www folder
# Usage: ./scripts/deploy-lovelace.ps1

param(
    [string]$Target = "Z:\www\lovelace-cards"
)

$env:VITE_LOVELACE_TARGET = $Target

# Ensure dist directory exists
if (-Not (Test-Path "dist")) {
    Write-Host "dist folder not found. Run 'npm run build:lovelace' first." -ForegroundColor Red
    exit 1
}

# Find the built bundle file (try both iife and umd formats)
$bundleFile = Get-ChildItem dist -Filter "dev2-react-dashboard.iife.js" -ErrorAction SilentlyContinue
if (-Not $bundleFile) {
    $bundleFile = Get-ChildItem dist -Filter "dev2-react-dashboard.umd.js" -ErrorAction SilentlyContinue
}

if (-Not $bundleFile) {
    Write-Host "Bundle not found in dist/. Run 'npm run build:lovelace' first." -ForegroundColor Red
    exit 1
}

# Ensure target directory exists
if (-Not (Test-Path $Target)) {
    New-Item -ItemType Directory -Path $Target -Force | Out-Null
}

# Copy bundle to target
Copy-Item -Path $bundleFile.FullName -Destination "$Target\dev2-react-dashboard.js" -Force

Write-Host "✅ Lovelace card deployed to: $Target\dev2-react-dashboard.js" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. In Home Assistant, go to Settings > Dashboards > Resources"
Write-Host "2. Click Create Resource"
Write-Host "3. URL: /local/lovelace-cards/dev2-react-dashboard.js"
Write-Host "4. Type: Module (JavaScript ES Module)"
Write-Host "5. Create a dashboard view with: type: custom:dev2-react-dashboard"

