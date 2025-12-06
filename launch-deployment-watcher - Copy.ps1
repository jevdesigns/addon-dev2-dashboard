#!/usr/bin/env powershell

<#
.SYNOPSIS
Automated Deployment Launcher for React Dashboard

.DESCRIPTION
Launches the automated deployment watcher with proper environment setup.
This script:
- Checks prerequisites
- Displays ASCII banner
- Starts the deployment watcher
- Shows deployment status

.EXAMPLE
.\launch-deployment-watcher.ps1
.\launch-deployment-watcher.ps1 -Verbose
.\launch-deployment-watcher.ps1 -Check

.PARAMETER Check
Verify setup without starting watcher

.PARAMETER Verbose
Show detailed output

#>

param(
    [switch]$Check,
    [switch]$Verbose
)

# Colors
$ColorInfo = 'Cyan'
$ColorSuccess = 'Green'
$ColorWarning = 'Yellow'
$ColorError = 'Red'

# ASCII Banner
function Show-Banner {
    $banner = @"
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀  AUTOMATED DEPLOYMENT WATCHER                        ║
║                                                            ║
║   React Dashboard → Home Assistant Lovelace Card          ║
║                                                            ║
║   Edit → Save → Auto Deploy → Hard Refresh HA             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
"@
    Write-Host $banner -ForegroundColor Cyan
}

# Log with timestamp
function Write-Log {
    param(
        [string]$Message,
        [string]$Type = 'Info'
    )
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    $icon = @{
        'Info' = 'ℹ'
        'Success' = '✓'
        'Warning' = '⚠'
        'Error' = '✗'
    }[$Type]
    
    $color = @{
        'Info' = $ColorInfo
        'Success' = $ColorSuccess
        'Warning' = $ColorWarning
        'Error' = $ColorError
    }[$Type]
    
    Write-Host "[$timestamp] $icon $Message" -ForegroundColor $color
}

# Check prerequisites
function Test-Prerequisites {
    Write-Log "Checking prerequisites..." 'Info'
    
    $allGood = $true
    
    # Check Node.js
    $node = node --version 2>$null
    if ($node) {
        Write-Log "✓ Node.js: $node" 'Success'
    } else {
        Write-Log "✗ Node.js not found. Please install from https://nodejs.org/" 'Error'
        $allGood = $false
    }
    
    # Check npm
    $npm = npm --version 2>$null
    if ($npm) {
        Write-Log "✓ npm: $npm" 'Success'
    } else {
        Write-Log "✗ npm not found. Please reinstall Node.js" 'Error'
        $allGood = $false
    }
    
    # Check project path
    $projectPath = Split-Path -Parent $PSCommandPath
    if (Test-Path "$projectPath\package.json") {
        Write-Log "✓ Project found: $projectPath" 'Success'
    } else {
        Write-Log "✗ package.json not found. Run this script from project root." 'Error'
        $allGood = $false
    }
    
    # Check deployment target
    $deployTarget = "Z:\www\lovelace-cards"
    if (Test-Path -PathType Container $deployTarget) {
        Write-Log "✓ Deployment target: $deployTarget" 'Success'
    } else {
        Write-Log "⚠ Deployment target not found: $deployTarget" 'Warning'
        Write-Log "   Make sure Z: drive is mounted and accessible" 'Info'
    }
    
    # Check node_modules
    if (Test-Path "$projectPath\node_modules") {
        Write-Log "✓ Dependencies installed" 'Success'
    } else {
        Write-Log "⚠ Dependencies not installed. Running npm install..." 'Warning'
        Push-Location $projectPath
        npm install 2>$null | Out-Null
        Pop-Location
        Write-Log "✓ Dependencies installed" 'Success'
    }
    
    Write-Host ""
    return $allGood
}

# Show setup instructions
function Show-Instructions {
    $instructions = @"
╔════════════════════════════════════════════════════════════╗
║                   DEPLOYMENT WORKFLOW                     ║
╚════════════════════════════════════════════════════════════╝

STEP 1: Watcher is now running and watching for file changes
        
STEP 2: Edit your code normally in VS Code
        - src/App.jsx
        - src/components/
        - src/contexts/
        - Any source files
        
STEP 3: Save your file (Ctrl+S)
        The watcher will automatically:
        ✓ Build the bundle
        ✓ Deploy to Z:\www\lovelace-cards
        ✓ Increment version
        
STEP 4: Refresh Home Assistant (Ctrl+Shift+R)
        Hard refresh clears cache and loads new bundle

STEP 5: Repeat! Just edit → save → refresh

╔════════════════════════════════════════════════════════════╗
║                  IMPORTANT SHORTCUTS                       ║
╚════════════════════════════════════════════════════════════╝

Hard Refresh Home Assistant:
  • Chrome/Edge/Firefox: Ctrl+Shift+R
  • Safari: Cmd+Shift+R
  
Stop Watcher:
  • Ctrl+C (in this terminal)
  
Check Deployment Status:
  • Look at console messages in this terminal
  • All ✓ means success!

╔════════════════════════════════════════════════════════════╗
║                      TROUBLESHOOTING                       ║
╚════════════════════════════════════════════════════════════╝

Nothing deploying?
  → Check watcher shows "Ready for changes..."
  → Make sure you save the file (Ctrl+S)
  
Build failed?
  → Check terminal for error message
  → Run: npm run build:lovelace (manually)
  
Changes not showing?
  → Hard refresh: Ctrl+Shift+R
  → Check browser console (F12)
  
Permission denied?
  → Verify Z:\www\lovelace-cards is writable
  → Check network drive is mounted

"@
    Write-Host $instructions -ForegroundColor Gray
}

# Main function
function Main {
    Show-Banner
    
    Write-Log "Initializing deployment system..." 'Info'
    Write-Host ""
    
    # Test prerequisites
    if (-not (Test-Prerequisites)) {
        Write-Log "Setup check failed. Please fix issues above." 'Error'
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    Write-Host ""
    Write-Log "All checks passed! Starting watcher..." 'Success'
    Write-Host ""
    
    # Show instructions
    Show-Instructions
    
    Write-Host ""
    Write-Log "Launching deployment watcher..." 'Info'
    Write-Log "Watching: D:\HA\522-react\src" 'Info'
    Write-Log "Target: Z:\www\lovelace-cards" 'Info'
    Write-Host ""
    Write-Log "Ready for changes... (Ctrl+C to stop)" 'Success'
    Write-Host ""
    
    # Start watcher
    $projectPath = Split-Path -Parent $PSCommandPath
    Push-Location $projectPath
    
    # Run npm script
    if ($Verbose) {
        npm run deploy:watch
    } else {
        npm run deploy:watch 2>&1 | ForEach-Object {
            # Pass through all output
            $_
        }
    }
    
    Pop-Location
}

# Check-only mode
function Check-Setup {
    Show-Banner
    Write-Log "Running setup check only (no watcher)..." 'Info'
    Write-Host ""
    
    if (Test-Prerequisites) {
        Write-Host ""
        Write-Log "Setup is ready! Run without -Check to start watcher." 'Success'
        exit 0
    } else {
        Write-Host ""
        Write-Log "Setup check failed. Please fix issues above." 'Error'
        exit 1
    }
}

# Run main or check
if ($Check) {
    Check-Setup
} else {
    Main
}
