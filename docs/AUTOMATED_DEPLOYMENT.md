# 🚀 Automated Deployment System

## Overview

Your React dashboard now has a **complete automated deployment system**. Edit your files, save them, and the system automatically:

1. ✅ Detects file changes in `src/`
2. ✅ Triggers a build
3. ✅ Deploys the bundle to Home Assistant
4. ✅ Updates version for cache busting
5. ✅ Logs deployment details

## Quick Start (30 seconds)

### Step 1: Start the Watcher
```bash
npm run deploy:watch
```

**Output:**
```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     🚀 AUTOMATED DEPLOYMENT WATCHER                       ║
║                                                            ║
║     Edit your files and save to auto-deploy!              ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

[HH:MM:SS] ℹ Watching: D:\HA\522-react\src
[HH:MM:SS] ℹ Target: Z:\www\lovelace-cards
[HH:MM:SS] ✓ Ready for changes... (Ctrl+C to exit)
```

### Step 2: Edit Your Code
Open any file in `src/` and make changes:
- `src/App.jsx`
- `src/components/EntityCard.jsx`
- `src/contexts/HassContext.jsx`
- `src/lovelace-card.jsx`
- Any other source files

### Step 3: Save the File
When you save (Ctrl+S), the watcher automatically:
1. Detects the change (1 second debounce)
2. Builds the bundle
3. Deploys to `Z:\www\lovelace-cards`
4. Shows success message

**Example Output:**
```
[14:32:15] ℹ File changed: src/App.jsx
[14:32:15] ℹ Starting build...
[14:32:18] ✓ Build completed successfully
[14:32:18] ✓ Deployed to: Z:\www\lovelace-cards\dev2-react-dashboard.js
[14:32:18] ℹ Version updated: 1.0.0 → 1.0.1
[14:32:18] ℹ Bundle size: 1.12 MB
[14:32:18] ✓ Deployment complete! Hard refresh HA: Ctrl+Shift+R
```

### Step 4: Refresh Home Assistant
In your HA dashboard:
- **Hard refresh**: Ctrl+Shift+R (Chrome) or Cmd+Shift+R (Safari)
- This clears cache and loads your latest bundle

## How It Works

### 1. File Watching (`deploy-watcher.js`)

```
Your Code Changes
      ↓
File Watcher Detects Change
      ↓
1 Second Debounce (stabilize changes)
      ↓
Trigger Build
      ↓
Build Lovelace Bundle
      ↓
Deploy to Z:\www\lovelace-cards
      ↓
Increment Version
      ↓
Show Success Message
      ↓
Wait for Next Change
```

### 2. Configuration (`deployment.config.json`)

Central configuration with all deployment settings:

```json
{
  "targets": {
    "lovelace": {
      "path": "Z:\\www\\lovelace-cards",
      "bundleFileName": "dev2-react-dashboard.js"
    }
  },
  "watcher": {
    "watchPath": "src",
    "debounceMs": 1000,
    "autoDeployOnChange": true
  },
  "homeAssistant": {
    "resourceUrl": "/local/lovelace-cards/dev2-react-dashboard.js",
    "cacheBustingParamName": "v"
  }
}
```

### 3. Version Management

Each deployment increments the version:
- File: `dist/.deployment-version`
- Format: `MAJOR.MINOR.PATCH` (e.g., `1.0.5`)
- Used for cache busting in Home Assistant

## Advanced Usage

### Manual Build & Deploy
```bash
# Build only
npm run build:lovelace

# Deploy (manual)
npm run deploy:lovelace

# Build then deploy
npm run build:lovelace && npm run deploy:lovelace
```

### Update Configuration

Edit `deployment.config.json` to customize:

```json
{
  "targets": {
    "lovelace": {
      "path": "YOUR_HA_WWW_PATH",      // Change deployment target
      "bundleFileName": "bundle-name.js" // Change bundle name
    }
  },
  "watcher": {
    "debounceMs": 1000,  // Change debounce time (ms)
    "autoDeployOnChange": true  // Enable/disable auto-deploy
  }
}
```

### Enable Cache Busting in HA

In `Z:\configuration.yaml`:

```yaml
resources:
  - url: /local/lovelace-cards/dev2-react-dashboard.js?v=1.0.5
    type: module
```

The `?v=1.0.5` parameter ensures the browser fetches the latest version.

## Monitoring Deployments

### Watch the Console

The watcher shows real-time deployment status:

```
✓ = Success (green)
⚠ = Warning (yellow)
✗ = Error (red)
ℹ = Info (cyan)
```

### Check Version File

```bash
cat dist/.deployment-version
# Output: 1.0.5
```

### Verify Deployment

Check if bundle exists on disk:

```powershell
Test-Path Z:\www\lovelace-cards\dev2-react-dashboard.js
# True = Success
```

## Troubleshooting

### Build Failed

**Error:**
```
[14:32:18] ✗ Build failed: npm run build:lovelace exited with code 1
```

**Solution:**
- Check your source files for syntax errors
- Run `npm run build:lovelace` manually to see full error
- Fix the error and save the file again

### Deployment Not Working

**Check:**
1. Is the watcher running? (Should show "Ready for changes...")
2. Is `Z:\www\lovelace-cards` accessible?
3. Do you have write permissions?

**Solution:**
```bash
# Stop watcher (Ctrl+C)
# Verify path exists and is writable
Test-Path Z:\www\lovelace-cards

# Restart watcher
npm run deploy:watch
```

### Changes Not Showing in HA

**Solution:**
1. Hard refresh: **Ctrl+Shift+R** (Windows/Linux) or **Cmd+Shift+R** (Mac)
2. Check browser console for errors (F12)
3. Verify bundle deployed: Check `Z:\www\lovelace-cards\dev2-react-dashboard.js`

### Port/Network Issues

If deployment path is unavailable:
1. Verify path is mounted/accessible
2. Check network connectivity
3. Verify write permissions on target folder

## File Structure

```
522-react/
├── src/                          # Source files (watched)
│   ├── lovelace-card.jsx        # Web Component (Shadow DOM)
│   ├── App.jsx                  # Main React component
│   ├── components/
│   ├── contexts/
│   └── api/
├── dist/                        # Build output
│   ├── dev2-react-dashboard.umd.js  # Bundle
│   ├── assets/                  # Vendor chunks
│   └── .deployment-version      # Version tracking
├── scripts/
│   ├── deploy-watcher.js        # 👈 Watcher script (NEW)
│   └── deploy-lovelace.ps1
├── deployment.config.json       # 👈 Config file (NEW)
├── vite.lovelace.config.js      # Build config
├── package.json
└── ...
```

## Environment Setup

### Requirements
- Node.js 16+
- npm 8+
- Access to `Z:\www\lovelace-cards` (write permission)
- Home Assistant with `/local/` folder mounted to `Z:\www`

### Verify Setup

```bash
# Check Node version
node --version
# Should be 16.0.0 or higher

# Check npm version
npm --version
# Should be 8.0.0 or higher

# Check write access to deployment path
Test-Path -PathType Container Z:\www\lovelace-cards
# Should be True
```

## Production Tips

1. **Keep watcher running** during development
   ```bash
   npm run deploy:watch
   ```

2. **Hard refresh frequently** to see changes
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)

3. **Monitor console** for build/deploy errors

4. **Commit versions** to version control:
   ```bash
   git add dist/.deployment-version
   ```

5. **Test locally first**:
   - Run `npm run dev` for Vite dev server
   - Or use HA dev tools to test

## What's Next?

✅ **Automated deployment is now live**

Your workflow is now:
1. Edit code → Save file (Ctrl+S)
2. Watcher auto-builds & deploys (5-10 seconds)
3. Hard refresh HA (Ctrl+Shift+R)
4. See your changes live!

No more manual build/deploy commands needed! 🎉

---

**Questions?** Check the other documentation in `docs/` folder or review the inline comments in `scripts/deploy-watcher.js`.
