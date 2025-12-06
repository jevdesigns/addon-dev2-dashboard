# Add-on Conversion Verification Script
# Tests that all add-on components are ready

param(
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"

function Write-Check {
    param([string]$Message, [bool]$Passed)
    if ($Passed) {
        Write-Host "✓ $Message" -ForegroundColor Green
    } else {
        Write-Host "✗ $Message" -ForegroundColor Red
    }
    return $Passed
}

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
}

$allPassed = $true

Write-Section "Add-on Conversion Verification"

# Check 1: Add-on directory structure
Write-Host "Checking add-on structure..." -ForegroundColor Yellow
$checks = @(
    @{ File = "addon/config.json"; Name = "Add-on config.json" },
    @{ File = "addon/Dockerfile"; Name = "Dockerfile" },
    @{ File = "addon/nginx.conf"; Name = "Nginx configuration" },
    @{ File = "addon/README.md"; Name = "User README" },
    @{ File = "addon/CHANGELOG.md"; Name = "Changelog" },
    @{ File = "addon/DOCS.md"; Name = "Developer docs" },
    @{ File = "addon/build.sh"; Name = "Build script" }
)

foreach ($check in $checks) {
    $exists = Test-Path $check.File
    $allPassed = (Write-Check $check.Name $exists) -and $allPassed
}

# Check 2: Source files
Write-Host ""
Write-Host "Checking source files..." -ForegroundColor Yellow
$checks = @(
    @{ File = "src/main-addon.jsx"; Name = "Add-on entry point" },
    @{ File = "src/utils/ingress-connection.js"; Name = "Ingress connection handler" },
    @{ File = "index-addon.html"; Name = "Add-on HTML template" },
    @{ File = "vite.addon.config.js"; Name = "Vite config for add-on" }
)

foreach ($check in $checks) {
    $exists = Test-Path $check.File
    $allPassed = (Write-Check $check.Name $exists) -and $allPassed
}

# Check 3: Build scripts
Write-Host ""
Write-Host "Checking build scripts..." -ForegroundColor Yellow
$checks = @(
    @{ File = "scripts/deploy-addon.ps1"; Name = "Add-on deployment script" },
    @{ File = "scripts/deploy-watcher-enhanced.js"; Name = "Enhanced deployment watcher" },
    @{ File = "addon-quickstart.ps1"; Name = "Quick start script" }
)

foreach ($check in $checks) {
    $exists = Test-Path $check.File
    $allPassed = (Write-Check $check.Name $exists) -and $allPassed
}

# Check 4: Package.json scripts
Write-Host ""
Write-Host "Checking package.json scripts..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$scripts = @("build:addon", "deploy:addon")

foreach ($script in $scripts) {
    $exists = $packageJson.scripts.PSObject.Properties.Name -contains $script
    $allPassed = (Write-Check "npm script: $script" $exists) -and $allPassed
}

# Check 5: Configuration
Write-Host ""
Write-Host "Checking configuration..." -ForegroundColor Yellow
$deployConfig = Get-Content "deployment.config.json" | ConvertFrom-Json
$hasAddonTarget = $deployConfig.targets.PSObject.Properties.Name -contains "addon"
$allPassed = (Write-Check "Add-on target in deployment.config.json" $hasAddonTarget) -and $allPassed

# Check 6: Docker availability
Write-Host ""
Write-Host "Checking Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>$null
    $dockerAvailable = $LASTEXITCODE -eq 0
    $allPassed = (Write-Check "Docker installed" $dockerAvailable) -and $allPassed
    if ($dockerAvailable -and $Verbose) {
        Write-Host "  → $dockerVersion" -ForegroundColor Gray
    }
} catch {
    $allPassed = (Write-Check "Docker installed" $false) -and $allPassed
}

# Check 7: Node/npm availability
Write-Host ""
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    $npmVersion = npm --version 2>$null
    $nodeAvailable = $LASTEXITCODE -eq 0
    $allPassed = (Write-Check "Node.js installed" $nodeAvailable) -and $allPassed
    if ($nodeAvailable -and $Verbose) {
        Write-Host "  → Node: $nodeVersion, npm: $npmVersion" -ForegroundColor Gray
    }
} catch {
    $allPassed = (Write-Check "Node.js installed" $false) -and $allPassed
}

# Check 8: Documentation
Write-Host ""
Write-Host "Checking documentation..." -ForegroundColor Yellow
$checks = @(
    @{ File = "docs/ADDON_CONVERSION_GUIDE.md"; Name = "Conversion guide" },
    @{ File = "DEPLOYMENT_OPTIONS.md"; Name = "Deployment options guide" }
)

foreach ($check in $checks) {
    $exists = Test-Path $check.File
    $allPassed = (Write-Check $check.Name $exists) -and $allPassed
}

# Summary
Write-Section "Verification Summary"

if ($allPassed) {
    Write-Host "✓ All checks passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your add-on is ready to build and deploy!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Build the add-on: .\addon-quickstart.ps1 -Action all" -ForegroundColor White
    Write-Host "  2. Test locally: http://localhost:8099" -ForegroundColor White
    Write-Host "  3. Deploy to Home Assistant" -ForegroundColor White
    Write-Host ""
    Write-Host "Documentation:" -ForegroundColor Yellow
    Write-Host "  → docs/ADDON_CONVERSION_GUIDE.md" -ForegroundColor White
    Write-Host "  → DEPLOYMENT_OPTIONS.md" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "✗ Some checks failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the issues above before proceeding." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Optional: Run a test build
Write-Host "Would you like to run a test build? (Y/N)" -ForegroundColor Yellow
$response = Read-Host
if ($response -eq 'Y' -or $response -eq 'y') {
    Write-Host ""
    Write-Host "Running test build..." -ForegroundColor Cyan
    npm run build:addon
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Test build completed successfully!" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "✗ Test build failed" -ForegroundColor Red
        Write-Host ""
        exit 1
    }
}
