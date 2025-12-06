# Deploy Add-on Build Script
# Builds the React app for add-on deployment and copies to addon directory

param(
    [switch]$Watch = $false,
    [switch]$ForceBuild = $false
)

$ErrorActionPreference = "Stop"

# Configuration
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$DistDir = Join-Path $ProjectRoot "dist"
$AddonDir = Join-Path $ProjectRoot "addon"
$AddonDistDir = Join-Path $AddonDir "app"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Dev2 React Dashboard - Add-on Deployment" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build the React app
Write-Host "[1/3] Building React app for add-on..." -ForegroundColor Yellow
Set-Location $ProjectRoot

try {
    if ($ForceBuild -or -not (Test-Path $DistDir)) {
        npm run build:addon
        Write-Host "✓ Build completed successfully" -ForegroundColor Green
    } else {
        Write-Host "⊙ Using existing build (use -ForceBuild to rebuild)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Build failed: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Create add-on app directory
Write-Host ""
Write-Host "[2/3] Preparing add-on directory..." -ForegroundColor Yellow

if (-not (Test-Path $AddonDir)) {
    Write-Host "✗ Add-on directory not found: $AddonDir" -ForegroundColor Red
    exit 1
}

# Create app directory in addon folder
if (-not (Test-Path $AddonDistDir)) {
    New-Item -ItemType Directory -Path $AddonDistDir -Force | Out-Null
}

# Step 3: Copy built files to add-on directory
Write-Host ""
Write-Host "[3/3] Copying files to add-on..." -ForegroundColor Yellow

try {
    # Copy all dist files to addon/app
    Copy-Item -Path "$DistDir\*" -Destination $AddonDistDir -Recurse -Force
    
    # Get file count
    $fileCount = (Get-ChildItem -Path $AddonDistDir -Recurse -File).Count
    
    Write-Host "✓ Copied $fileCount files to $AddonDistDir" -ForegroundColor Green
} catch {
    Write-Host "✗ Copy failed: $_" -ForegroundColor Red
    exit 1
}

# Summary
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ✓ Add-on Deployment Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Build Docker image: docker build -t dev2-react-dashboard ./addon" -ForegroundColor White
Write-Host "  2. Test locally: docker run -p 8099:8099 dev2-react-dashboard" -ForegroundColor White
Write-Host "  3. Deploy to HA add-on store or local repository" -ForegroundColor White
Write-Host ""
Write-Host "Add-on files are ready in: $AddonDir" -ForegroundColor Cyan
Write-Host ""

# Watch mode
if ($Watch) {
    Write-Host "Watching for changes..." -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
    Write-Host ""
    
    # Use chokidar for file watching
    npm run build:addon -- --watch
}
