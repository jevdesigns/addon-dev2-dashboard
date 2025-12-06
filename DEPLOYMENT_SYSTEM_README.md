# 🎯 Complete Deployment Automation System

Your React dashboard now has a **production-ready automated deployment system** with:

✅ **File watching** - Detects changes in `src/`  
✅ **Auto-build** - Triggers Vite build on file save  
✅ **Auto-deploy** - Copies bundle to Home Assistant  
✅ **Version management** - Auto-increments version for cache busting  
✅ **Shadow DOM CSS isolation** - Styles scoped to component  
✅ **Real-time feedback** - Console shows every step  

---

## 🚀 Quick Start (2 ways)

### Option 1: Direct Command (Fastest)
```bash
npm run deploy:watch
```

### Option 2: PowerShell Launcher (With Checks)
```powershell
.\launch-deployment-watcher.ps1
```

Both start the same watcher - choose what you prefer!

---

## 📋 What You Get

### Automated Workflow
```
Edit Code
    ↓
Save File (Ctrl+S)
    ↓
Watcher Detects Change
    ↓
Auto Build (vite)
    ↓
Auto Deploy (Z:\www\lovelace-cards)
    ↓
Version Increment
    ↓
Console Shows Success ✓
    ↓
Hard Refresh HA (Ctrl+Shift+R)
    ↓
See Changes Live!
```

### Files Created for You

| File | Purpose |
|------|---------|
| `scripts/deploy-watcher.js` | Main watcher script (Node.js) |
| `launch-deployment-watcher.ps1` | Windows launcher with setup checks |
| `deployment.config.json` | Centralized configuration |
| `docs/AUTOMATED_DEPLOYMENT.md` | Detailed documentation |
| `DEPLOYMENT_QUICK_REFERENCE.md` | Quick cheat sheet |

---

## 💻 Usage Examples

### Start Watching (Production Mode)
```bash
npm run deploy:watch
```
Leave this running during development. Every file save triggers a build and deploy.

### Manual Build (without watch)
```bash
npm run build:lovelace
```

### Manual Deploy (without watch)
```bash
npm run deploy:lovelace
```

### Build and Deploy Once
```bash
npm run build:lovelace && npm run deploy:lovelace
```

---

## 🔧 Configuration

Edit `deployment.config.json` to customize:

```json
{
  "targets": {
    "lovelace": {
      "path": "Z:\\www\\lovelace-cards",           // Deploy target
      "bundleFileName": "dev2-react-dashboard.js"  // Bundle name
    }
  },
  "watcher": {
    "watchPath": "src",                 // Files to watch
    "debounceMs": 1000,                 // Wait time before build
    "autoDeployOnChange": true          // Auto-deploy on change
  },
  "homeAssistant": {
    "resourceUrl": "/local/lovelace-cards/dev2-react-dashboard.js",
    "cacheBustingParamName": "v"        // Query param for version
  }
}
```

---

## 🎯 Complete Workflow

### Development Session

**Terminal 1 - Deployment Watcher:**
```bash
npm run deploy:watch
```
Output:
```
[14:32:15] ℹ Watching: D:\HA\522-react\src
[14:32:15] ℹ Target: Z:\www\lovelace-cards
[14:32:15] ✓ Ready for changes... (Ctrl+C to exit)
```

**You - Edit Code:**
- Open `src/App.jsx` in VS Code
- Make changes
- Press Ctrl+S to save

**Auto-Deployment:**
```
[14:32:45] ℹ File changed: src/App.jsx
[14:32:45] ℹ Starting build...
[14:32:50] ✓ Build completed successfully
[14:32:50] ✓ Deployed to: Z:\www\lovelace-cards\dev2-react-dashboard.js
[14:32:50] ℹ Version updated: 1.0.0 → 1.0.1
[14:32:50] ✓ Deployment complete! Hard refresh HA: Ctrl+Shift+R
```

**You - Hard Refresh HA:**
- Alt+Tab to Home Assistant
- Press Ctrl+Shift+R
- See your changes live!

**Repeat:**
- Edit another file
- Save
- Watch auto-deploy
- Refresh HA
- See changes

---

## 📊 Console Output Reference

### Success (Green ✓)
```
✓ Build completed successfully
✓ Deployed to: Z:\www\lovelace-cards\dev2-react-dashboard.js
✓ Deployment complete! Hard refresh HA: Ctrl+Shift+R
```
→ Everything worked! Hard refresh HA to see changes.

### Info (Cyan ℹ)
```
ℹ File changed: src/App.jsx
ℹ Starting build...
ℹ Version updated: 1.0.0 → 1.0.1
```
→ Normal process information.

### Warning (Yellow ⚠)
```
⚠ Build queued (one already in progress)
```
→ You saved multiple files at once. Building again...

### Error (Red ✗)
```
✗ Build failed: npm run build:lovelace exited with code 1
✗ Deployment failed: ENOENT: no such file or directory...
```
→ Something went wrong. Check your code for syntax errors.

---

## 🔍 Verification Checklist

After starting the watcher, verify:

- [ ] Console shows "Ready for changes..."
- [ ] Edit a file in `src/` (change some text)
- [ ] Save the file (Ctrl+S)
- [ ] Console shows build started
- [ ] Console shows "✓ Build completed successfully"
- [ ] Console shows "✓ Deployed to..."
- [ ] Bundle file exists: `Test-Path Z:\www\lovelace-cards\dev2-react-dashboard.js`
- [ ] Version updated: Check `dist/.deployment-version`

---

## 🛠️ Advanced Configuration

### Customize Build Debounce
```json
{
  "watcher": {
    "debounceMs": 2000  // Wait 2 seconds before building
  }
}
```
Useful if you edit many files quickly.

### Change Watch Path
```json
{
  "watcher": {
    "watchPath": "src,components"  // Watch multiple folders
  }
}
```

### Disable Auto-Deploy
```json
{
  "watcher": {
    "autoDeployOnChange": false  // Just build, don't deploy
  }
}
```

---

## 🚨 Troubleshooting

### Console Shows Nothing
**Problem:** Watcher isn't detecting changes  
**Solution:**
1. Make sure you save the file (Ctrl+S)
2. Check that file is in `src/` folder
3. Verify watcher shows "Ready for changes..."

### Build Takes Forever
**Problem:** Build stuck or very slow  
**Solution:**
1. Press Ctrl+C to stop watcher
2. Run `npm run build:lovelace` to see error
3. Fix syntax errors in your code
4. Restart watcher: `npm run deploy:watch`

### Changes Not Showing in HA
**Problem:** Hard refresh shows old version  
**Solution:**
1. **Hard refresh** properly: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Check browser console (F12) for errors
3. Check deployment actually happened (look at console output)
4. Verify bundle file exists: `Test-Path Z:\www\lovelace-cards\dev2-react-dashboard.js`

### Permission Denied Error
**Problem:** Can't write to `Z:\www\lovelace-cards`  
**Solution:**
1. Check folder exists: `Test-Path Z:\www\lovelace-cards`
2. Check write permissions: Try creating a test file there
3. Verify network drive is mounted
4. Check antivirus isn't blocking writes

### Version Not Incrementing
**Problem:** `dist/.deployment-version` stays same  
**Solution:**
1. Check folder exists: `Test-Path dist`
2. Try manual deploy: `npm run deploy:lovelace`
3. Check file permissions on `dist/` folder

---

## 📁 File Structure

```
D:\HA\522-react\
├── src/                                    ← Files to edit & watch
│   ├── App.jsx                  
│   ├── lovelace-card.jsx              ← Web Component (Shadow DOM)
│   ├── components/
│   ├── contexts/
│   └── api/
├── dist/                                   ← Build output
│   ├── dev2-react-dashboard.umd.js        ← Bundle (1.2 MB)
│   ├── assets/                            ← Vendor chunks
│   └── .deployment-version                ← Version tracking
├── scripts/
│   ├── deploy-watcher.js                  ← Watcher (NEW!)
│   ├── deploy-lovelace.ps1
│   └── ...
├── launch-deployment-watcher.ps1          ← Launcher (NEW!)
├── deployment.config.json                 ← Configuration (NEW!)
├── vite.lovelace.config.js
├── package.json                           ← Has deploy:watch script
├── docs/
│   ├── AUTOMATED_DEPLOYMENT.md            ← Detailed docs (NEW!)
│   └── ...
└── DEPLOYMENT_QUICK_REFERENCE.md          ← Quick guide (NEW!)
```

---

## 🎓 How Shadow DOM CSS Isolation Works

Your Web Component uses **Shadow DOM** for strict CSS scoping:

```javascript
// In lovelace-card.jsx (connectedCallback)
this.attachShadow({ mode: 'open' });
// React renders into Shadow DOM
```

**Benefits:**
- ✅ Your React app styles don't leak to HA UI
- ✅ HA styles don't break your React components
- ✅ Complete CSS isolation
- ✅ No style conflicts

---

## 🚀 Performance Tips

1. **Keep watcher running** during development
   ```bash
   npm run deploy:watch
   ```

2. **Save frequently** - Watcher handles everything
   - Edit → Save (Ctrl+S) → Auto-deploy

3. **Hard refresh after deployment**
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac/Safari)

4. **Monitor console** for build/deploy status
   - All ✓ messages = success
   - Any ✗ messages = fix required

5. **Use alt+tab** to quickly switch between editor and HA

---

## 🧹 Cleanup & Maintenance

### Clear Version History
```bash
rm dist\.deployment-version
```
Next deployment will start fresh at version 1.0.0

### Force Full Rebuild
```bash
rm -r dist
npm run build:lovelace
```

### Check What Version is Running
```bash
cat dist\.deployment-version
```

---

## 🔐 Security Notes

- ✅ Shadow DOM prevents CSS injection attacks
- ✅ Web Component validates all hass inputs
- ✅ React StrictMode catches errors in development
- ✅ Service calls validated in haServices.js

---

## 📞 Support

For issues:

1. **Check console** - Press F12 in Home Assistant
2. **Review logs** - Check terminal output from watcher
3. **Read docs** - See `docs/AUTOMATED_DEPLOYMENT.md`
4. **Check config** - Verify `deployment.config.json`

---

## ✨ Summary

You now have a **production-ready deployment system** that:

✅ Watches your source files  
✅ Auto-builds on save  
✅ Auto-deploys to Home Assistant  
✅ Auto-increments versions  
✅ Provides real-time feedback  
✅ Isolates CSS with Shadow DOM  
✅ Requires zero manual steps  

**Start with:**
```bash
npm run deploy:watch
```

Then just **edit → save → refresh** and watch your changes appear instantly! 🎉

---

## Next Steps

1. **Start the watcher**: `npm run deploy:watch`
2. **Edit your code** in VS Code
3. **Save** (Ctrl+S) to trigger auto-deploy
4. **Hard refresh** HA (Ctrl+Shift+R) to see changes
5. **Enjoy** zero-friction development! 🚀

---

*Automated deployment system active. Happy coding!* ✨
