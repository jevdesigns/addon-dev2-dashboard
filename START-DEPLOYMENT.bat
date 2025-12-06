@echo off
REM ============================================================
REM  Quick Start Script for Automated Deployment
REM  React Dashboard → Home Assistant Lovelace Card
REM ============================================================

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║   🚀  REACT DASHBOARD DEPLOYMENT LAUNCHER                ║
echo ║                                                            ║
echo ║   Auto-deploy on file save                                ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check if in project directory
if not exist "package.json" (
    echo [ERROR] package.json not found
    echo.
    echo Please run this script from the project root directory:
    echo   D:\HA\522-react\
    echo.
    pause
    exit /b 1
)

REM Check Node version
echo [INFO] Node.js version: 
node --version

REM Check npm version
echo [INFO] npm version: 
npm --version

echo.
echo [INFO] Checking project setup...
echo.

REM Check if deployment target exists
if not exist "Z:\www\lovelace-cards" (
    echo [WARNING] Deployment target not found: Z:\www\lovelace-cards
    echo           Make sure Z: drive is mounted and accessible
    echo.
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo [INFO] Dependencies not found, installing...
    echo.
    call npm install
    echo.
)

REM Display instructions
echo ╔════════════════════════════════════════════════════════════╗
echo ║                     READY TO START                         ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Next steps:
echo.
echo 1. Starting deployment watcher...
echo    This watches for file changes in src/
echo.
echo 2. Edit your code:
echo    - src/App.jsx
echo    - src/components/EntityCard.jsx
echo    - Any other source files
echo.
echo 3. Save the file (Ctrl+S)
echo    Deployment happens automatically!
echo.
echo 4. Hard refresh Home Assistant:
echo    - Chrome/Firefox: Ctrl+Shift+R
echo    - Safari: Cmd+Shift+R
echo.
echo 5. See your changes live!
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                  STARTING WATCHER...                       ║
echo ║                                                            ║
echo ║  Press Ctrl+C to stop when done                           ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Start the deployment watcher
call npm run deploy:watch

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to start deployment watcher
    echo.
    pause
    exit /b 1
)

exit /b 0
