# Quick Start Script for Add-on Development
# This script helps you quickly build and test the add-on

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('build', 'test', 'deploy', 'all')]
    [string]$Action = 'all',
    
    [switch]$NoBuild = $false,
    [switch]$Watch = $false
)

$ErrorActionPreference = "Stop"

# Colors
function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-ColorOutput "═══════════════════════════════════════════════" "Cyan"
    Write-ColorOutput "  $Title" "Cyan"
    Write-ColorOutput "═══════════════════════════════════════════════" "Cyan"
    Write-Host ""
}

function Write-Step {
    param([string]$Message)
    Write-ColorOutput "→ $Message" "Yellow"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✓ $Message" "Green"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "✗ $Message" "Red"
}

# Build the React app
function Build-AddonApp {
    Write-Header "Building React App for Add-on"
    
    try {
        Write-Step "Running Vite build..."
        npm run build:addon
        Write-Success "Build completed successfully"
        return $true
    } catch {
        Write-Error "Build failed: $_"
        return $false
    }
}

# Deploy to add-on directory
function Deploy-Addon {
    Write-Header "Deploying to Add-on Directory"
    
    try {
        Write-Step "Running deployment script..."
        .\scripts\deploy-addon.ps1
        Write-Success "Deployment completed successfully"
        return $true
    } catch {
        Write-Error "Deployment failed: $_"
        return $false
    }
}

# Build Docker image
function Build-DockerImage {
    Write-Header "Building Docker Image"
    
    try {
        Write-Step "Building Docker image..."
        Set-Location addon
        docker build -t dev2-react-dashboard:latest -f Dockerfile ..
        Set-Location ..
        Write-Success "Docker image built successfully"
        return $true
    } catch {
        Write-Error "Docker build failed: $_"
        Set-Location ..
        return $false
    }
}

# Test Docker container locally
function Test-Container {
    Write-Header "Testing Container Locally"
    
    try {
        # Check if container is already running
        $running = docker ps --filter "name=dev2-test" --format "{{.Names}}"
        if ($running -eq "dev2-test") {
            Write-Step "Stopping existing container..."
            docker stop dev2-test | Out-Null
            docker rm dev2-test | Out-Null
        }
        
        Write-Step "Starting container on port 8099..."
        docker run -d --name dev2-test -p 8099:8099 dev2-react-dashboard:latest
        
        Start-Sleep -Seconds 2
        
        Write-Success "Container started successfully"
        Write-Host ""
        Write-ColorOutput "Access the dashboard at: http://localhost:8099" "Cyan"
        Write-Host ""
        Write-ColorOutput "To view logs: docker logs -f dev2-test" "Gray"
        Write-ColorOutput "To stop: docker stop dev2-test" "Gray"
        Write-Host ""
        
        return $true
    } catch {
        Write-Error "Container test failed: $_"
        return $false
    }
}

# Main execution
Write-Header "Dev2 React Dashboard - Add-on Quick Start"

# Show actions
Write-ColorOutput "Action: $Action" "Cyan"
if ($Watch) {
    Write-ColorOutput "Mode: Watch (auto-rebuild)" "Cyan"
}
Write-Host ""

# Execute based on action
$success = $true

switch ($Action) {
    'build' {
        if (-not $NoBuild) {
            $success = Build-AddonApp
        }
        if ($success) {
            $success = Deploy-Addon
        }
        if ($success) {
            $success = Build-DockerImage
        }
    }
    
    'test' {
        $success = Test-Container
    }
    
    'deploy' {
        if (-not $NoBuild) {
            $success = Build-AddonApp
        }
        if ($success) {
            $success = Deploy-Addon
        }
    }
    
    'all' {
        if (-not $NoBuild) {
            $success = Build-AddonApp
        }
        if ($success) {
            $success = Deploy-Addon
        }
        if ($success) {
            $success = Build-DockerImage
        }
        if ($success) {
            $success = Test-Container
        }
    }
}

# Final status
Write-Host ""
if ($success) {
    Write-Header "All Operations Completed Successfully!"
    
    Write-ColorOutput "Next Steps:" "Yellow"
    Write-ColorOutput "  1. Open http://localhost:8099 to test the UI" "White"
    Write-ColorOutput "  2. Check Docker logs: docker logs -f dev2-test" "White"
    Write-ColorOutput "  3. When ready, deploy to Home Assistant" "White"
    Write-Host ""
    
    if ($Watch) {
        Write-ColorOutput "Starting watch mode..." "Yellow"
        node scripts/deploy-watcher-enhanced.js
    }
} else {
    Write-Header "Operations Failed"
    Write-Error "Please check the error messages above"
    exit 1
}
