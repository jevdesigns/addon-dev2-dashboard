#!/usr/bin/env node

/**
 * Automated Deployment Watcher & Deployer
 * 
 * This script watches for changes in your source files and automatically:
 * 1. Triggers a build
 * 2. Copies the bundle to Home Assistant www folder
 * 3. Generates a version update
 * 4. Updates Home Assistant configuration if needed
 * 
 * Usage:
 *   npm run deploy:watch
 * 
 * This replaces manual deployment - just edit your files and save!
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const chokidar = require('chokidar')

// Configuration
const CONFIG = {
  // Source file to watch
  watchPath: path.join(__dirname, '../src'),
  
  // Build command
  buildCommand: 'npm run build:lovelace',
  
  // Source bundle after build
  sourceBundle: path.join(__dirname, '../dist/dev2-react-dashboard.umd.js'),
  
  // Target deployment directory
  targetDir: 'Z:\\www\\lovelace-cards',
  
  // Deployed bundle name
  deployFileName: 'dev2-react-dashboard.js',
  
  // Version file to track deployments
  versionFile: path.join(__dirname, '../dist/.deployment-version'),
}

// State tracking
let isBuilding = false
let buildQueued = false

/**
 * Get current version (for cache busting)
 */
function getCurrentVersion() {
  const versionFile = CONFIG.versionFile
  if (fs.existsSync(versionFile)) {
    const version = fs.readFileSync(versionFile, 'utf-8').trim()
    return version
  }
  return '1.0.0'
}

/**
 * Increment version
 */
function incrementVersion(version) {
  const parts = version.split('.')
  parts[2] = (parseInt(parts[2]) || 0) + 1
  return parts.join('.')
}

/**
 * Save version to file
 */
function saveVersion(version) {
  fs.mkdirSync(path.dirname(CONFIG.versionFile), { recursive: true })
  fs.writeFileSync(CONFIG.versionFile, version, 'utf-8')
}

/**
 * Log with timestamp
 */
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString()
  const colors = {
    info: '\x1b[36m',    // cyan
    success: '\x1b[32m', // green
    warning: '\x1b[33m', // yellow
    error: '\x1b[31m',   // red
    reset: '\x1b[0m'
  }
  
  const color = colors[type] || colors.info
  const icon = {
    info: 'ℹ',
    success: '✓',
    warning: '⚠',
    error: '✗'
  }[type] || 'ℹ'
  
  console.log(`${color}[${timestamp}] ${icon} ${message}${colors.reset}`)
}

/**
 * Build the Lovelace bundle
 */
function build() {
  if (isBuilding) {
    buildQueued = true
    log('Build queued (one already in progress)', 'info')
    return
  }

  isBuilding = true
  buildQueued = false

  try {
    log('Starting build...', 'info')
    execSync(CONFIG.buildCommand, { stdio: 'pipe' })
    log('Build completed successfully', 'success')
    return true
  } catch (error) {
    log(`Build failed: ${error.message}`, 'error')
    isBuilding = false
    return false
  }
}

/**
 * Deploy the bundle to Home Assistant
 */
function deploy() {
  try {
    // Check if source exists
    if (!fs.existsSync(CONFIG.sourceBundle)) {
      log(`Source bundle not found: ${CONFIG.sourceBundle}`, 'error')
      isBuilding = false
      return false
    }

    // Create target directory if it doesn't exist
    if (!fs.existsSync(CONFIG.targetDir)) {
      fs.mkdirSync(CONFIG.targetDir, { recursive: true })
      log(`Created target directory: ${CONFIG.targetDir}`, 'info')
    }

    // Copy bundle to target
    const targetFile = path.join(CONFIG.targetDir, CONFIG.deployFileName)
    fs.copyFileSync(CONFIG.sourceBundle, targetFile)
    log(`✓ Deployed to: ${targetFile}`, 'success')

    // Update version
    const currentVersion = getCurrentVersion()
    const newVersion = incrementVersion(currentVersion)
    saveVersion(newVersion)
    log(`Version updated: ${currentVersion} → ${newVersion}`, 'info')

    // Show deployment info
    const stats = fs.statSync(targetFile)
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2)
    log(`Bundle size: ${sizeMB} MB`, 'info')

    log('Deployment complete! Hard refresh HA: Ctrl+Shift+R', 'success')
    
    return true
  } catch (error) {
    log(`Deployment failed: ${error.message}`, 'error')
    return false
  } finally {
    isBuilding = false
  }
}

/**
 * Execute build and deploy
 */
function buildAndDeploy() {
  if (build()) {
    deploy()
  }

  // If a build was queued while we were building, do it again
  if (buildQueued) {
    setTimeout(buildAndDeploy, 500)
  }
}

/**
 * Initialize file watcher
 */
function initializeWatcher() {
  const watcher = chokidar.watch(CONFIG.watchPath, {
    ignored: /(node_modules|\.git|dist)/,
    persistent: true,
    awaitWriteFinish: {
      stabilityThreshold: 1000,
      pollInterval: 100
    }
  })

  watcher.on('change', (filePath) => {
    log(`File changed: ${path.relative(process.cwd(), filePath)}`, 'info')
    buildAndDeploy()
  })

  watcher.on('add', (filePath) => {
    log(`File added: ${path.relative(process.cwd(), filePath)}`, 'info')
    buildAndDeploy()
  })

  watcher.on('error', (error) => {
    log(`Watcher error: ${error.message}`, 'error')
  })

  return watcher
}

/**
 * Main entry point
 */
function main() {
  console.log('')
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║                                                            ║')
  console.log('║     🚀 AUTOMATED DEPLOYMENT WATCHER                       ║')
  console.log('║                                                            ║')
  console.log('║     Edit your files and save to auto-deploy!              ║')
  console.log('║                                                            ║')
  console.log('╚════════════════════════════════════════════════════════════╝')
  console.log('')

  log(`Watching: ${CONFIG.watchPath}`, 'info')
  log(`Target: ${CONFIG.targetDir}`, 'info')
  log('', 'info')
  log('Ready for changes... (Ctrl+C to exit)', 'success')
  console.log('')

  // Initial build on startup (optional)
  // Uncomment to auto-build on startup:
  // buildAndDeploy()

  // Initialize watcher
  initializeWatcher()
}

// Run main
main()
