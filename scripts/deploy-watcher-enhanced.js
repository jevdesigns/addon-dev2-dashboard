/**
 * Enhanced Deployment Watcher
 * Supports multiple deployment targets: Lovelace card, Panel, and Add-on
 */

const chokidar = require('chokidar')
const { exec } = require('child_process')
const path = require('path')
const fs = require('fs')

// Configuration
const config = {
  watchPath: path.join(__dirname, '../src'),
  debounceMs: 1000,
  targets: {
    lovelace: {
      enabled: true,
      buildCommand: 'npm run build:lovelace',
      deployCommand: 'npm run deploy:lovelace',
      description: 'Lovelace Custom Card'
    },
    addon: {
      enabled: false, // Enable when developing add-on
      buildCommand: 'npm run build:addon',
      deployCommand: 'npm run deploy:addon',
      description: 'Home Assistant Add-on'
    }
  }
}

// Load config from file if exists
const configFile = path.join(__dirname, '../deployment.config.json')
if (fs.existsSync(configFile)) {
  const fileConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'))
  
  // Merge targets configuration
  if (fileConfig.targets) {
    Object.keys(fileConfig.targets).forEach(target => {
      if (config.targets[target]) {
        config.targets[target].enabled = fileConfig.targets[target].enabled !== false
      }
    })
  }
  
  // Update watch settings
  if (fileConfig.watcher) {
    config.watchPath = fileConfig.watcher.watchPath || config.watchPath
    config.debounceMs = fileConfig.watcher.debounceMs || config.debounceMs
  }
}

// State management
let buildInProgress = false
let buildQueued = false
let lastBuildTime = 0

// Log with timestamp
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString()
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m', // Yellow
    build: '\x1b[35m'    // Magenta
  }
  const reset = '\x1b[0m'
  const color = colors[type] || colors.info
  console.log(`${color}[${timestamp}]${reset} ${message}`)
}

// Execute command
function executeCommand(command, description) {
  return new Promise((resolve, reject) => {
    log(`Executing: ${description}`, 'build')
    
    const process = exec(command, {
      cwd: path.join(__dirname, '..'),
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    })
    
    process.stdout.on('data', (data) => {
      // Only show important output
      const output = data.toString().trim()
      if (output.includes('error') || output.includes('warning') || output.includes('✓')) {
        console.log(output)
      }
    })
    
    process.stderr.on('data', (data) => {
      const output = data.toString().trim()
      if (output && !output.includes('ExperimentalWarning')) {
        console.error(output)
      }
    })
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${description} failed with code ${code}`))
      }
    })
  })
}

// Build and deploy for all enabled targets
async function buildAndDeploy() {
  if (buildInProgress) {
    buildQueued = true
    log('Build already in progress, queuing next build...', 'warning')
    return
  }
  
  buildInProgress = true
  buildQueued = false
  const startTime = Date.now()
  
  try {
    log('═══════════════════════════════════════════════', 'info')
    log('Starting build and deployment...', 'info')
    log('═══════════════════════════════════════════════', 'info')
    
    // Build and deploy each enabled target
    for (const [targetName, targetConfig] of Object.entries(config.targets)) {
      if (!targetConfig.enabled) {
        continue
      }
      
      log(`\n→ Processing ${targetConfig.description}...`, 'build')
      
      try {
        // Build
        await executeCommand(targetConfig.buildCommand, `Build ${targetConfig.description}`)
        log(`✓ Build completed for ${targetConfig.description}`, 'success')
        
        // Deploy
        await executeCommand(targetConfig.deployCommand, `Deploy ${targetConfig.description}`)
        log(`✓ Deployment completed for ${targetConfig.description}`, 'success')
      } catch (err) {
        log(`✗ Failed to process ${targetConfig.description}: ${err.message}`, 'error')
      }
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    lastBuildTime = Date.now()
    
    log('\n═══════════════════════════════════════════════', 'success')
    log(`✓ All deployments completed in ${duration}s`, 'success')
    log('═══════════════════════════════════════════════', 'success')
    log('\nWatching for changes... (Ctrl+C to stop)\n', 'info')
    
  } catch (err) {
    log(`✗ Deployment failed: ${err.message}`, 'error')
  } finally {
    buildInProgress = false
    
    // If build was queued, start it now
    if (buildQueued) {
      log('Starting queued build...', 'info')
      setTimeout(() => buildAndDeploy(), config.debounceMs)
    }
  }
}

// Debounced build trigger
let debounceTimer = null
function triggerBuild(changedFile) {
  // Show what changed
  const relativePath = path.relative(path.join(__dirname, '..'), changedFile)
  log(`File changed: ${relativePath}`, 'info')
  
  // Clear existing timer
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  
  // Set new timer
  debounceTimer = setTimeout(() => {
    buildAndDeploy()
  }, config.debounceMs)
}

// Initialize watcher
function startWatcher() {
  log('═══════════════════════════════════════════════', 'info')
  log('Dev2 React Dashboard - Deployment Watcher', 'info')
  log('═══════════════════════════════════════════════', 'info')
  log(`Watching: ${config.watchPath}`, 'info')
  log(`Debounce: ${config.debounceMs}ms`, 'info')
  
  // Show enabled targets
  const enabledTargets = Object.entries(config.targets)
    .filter(([_, cfg]) => cfg.enabled)
    .map(([_, cfg]) => cfg.description)
  
  log(`Targets: ${enabledTargets.join(', ')}`, 'info')
  log('═══════════════════════════════════════════════', 'info')
  log('\nPerforming initial build...\n', 'info')
  
  // Initial build
  buildAndDeploy()
  
  // Start watching
  const watcher = chokidar.watch(config.watchPath, {
    ignored: /(^|[\/\\])\../, // Ignore dotfiles
    persistent: true,
    ignoreInitial: true
  })
  
  watcher
    .on('change', triggerBuild)
    .on('add', triggerBuild)
    .on('unlink', (filePath) => {
      log(`File deleted: ${path.relative(path.join(__dirname, '..'), filePath)}`, 'warning')
      triggerBuild(filePath)
    })
    .on('error', (error) => {
      log(`Watcher error: ${error.message}`, 'error')
    })
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('\nShutting down watcher...', 'warning')
    watcher.close()
    process.exit(0)
  })
}

// Start the watcher
startWatcher()
