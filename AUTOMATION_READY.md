# 🚀 React Dashboard for Home Assistant - Automated Deployment Ready

## ⚡ Quick Start (30 seconds)

```bash
npm run deploy:watch
```

That's it! Your deployment system is now active.

---

## 🎯 What This Does

Automatically:
- ✅ Watches your `src/` folder for file changes
- ✅ Builds your React bundle (Vite)
- ✅ Deploys to Home Assistant (`Z:\www\lovelace-cards`)
- ✅ Increments version for cache busting
- ✅ Shows real-time status in console

**No manual build/deploy commands needed!**

---

## 🎨 Your Workflow

```
1. Start watcher:     npm run deploy:watch
2. Edit your code:    src/App.jsx (or any source file)
3. Save file:         Ctrl+S (triggers auto-build & deploy)
4. Refresh HA:        Ctrl+Shift+R (in Home Assistant)
5. See changes:       Live updates in HA! 🎉
6. Repeat:            Edit → Save → Refresh
```

---

## 📖 Documentation

### Quick References
- **`QUICK_START_LINKS.md`** - Navigation of all docs ⭐ START HERE
- **`DEPLOYMENT_QUICK_REFERENCE.md`** - 2-minute cheat sheet
- **`DEPLOYMENT_SYSTEM_README.md`** - Complete system guide

### Detailed Guides
- **`docs/AUTOMATED_DEPLOYMENT.md`** - Step-by-step guide
- **`SETUP_COMPLETE.md`** - What was created
- **`README_DEPLOYMENT_AUTOMATION.md`** - Master overview

### System Information
- **`docs/ARCHITECTURE_DIAGRAMS.md`** - System design
- **`docs/RENDERING_GUIDE.md`** - React rendering in Web Component
- **`docs/LOVELACE_MIGRATION_COMPLETE.md`** - Technical details

---

## 📂 Project Structure

```
D:\HA\522-react/
│
├── 🆕 scripts/
│   └── deploy-watcher.js ............... Auto-watcher script
├── 🆕 deployment.config.json ......... Configuration file
├── 🆕 launch-deployment-watcher.ps1 .. PowerShell launcher
├── 🆕 START-DEPLOYMENT.bat ........... Windows launcher
│
├── src/
│   ├── App.jsx ........................ Main component
│   ├── lovelace-card.jsx ............ Web Component (Shadow DOM)
│   ├── components/
│   ├── contexts/
│   ├── api/
│   └── storage/
│
├── dist/
│   ├── dev2-react-dashboard.umd.js .. Bundle (1.2 MB)
│   ├── assets/ ....................... Vendor chunks
│   └── .deployment-version .......... Version tracking
│
├── docs/ (9 documentation files)
└── package.json (updated with scripts)
```

---

## 🚀 Ways to Start

### Command Line (Any Terminal)
```bash
npm run deploy:watch
```

### Windows Batch (Double-Click)
```
START-DEPLOYMENT.bat
```

### PowerShell (With Checks)
```powershell
.\launch-deployment-watcher.ps1
```

---

## 🎯 Key Commands

```bash
# Start auto-deployment watcher
npm run deploy:watch

# Manual build only
npm run build:lovelace

# Manual deploy only
npm run deploy:lovelace

# Local development server
npm run dev

# Build + Deploy in one command
npm run build:lovelace && npm run deploy:lovelace
```

---

## ✨ Features

- ✅ **File watching** - Auto-detects changes in `src/`
- ✅ **Auto-build** - Vite compiles on save
- ✅ **Auto-deploy** - Copies to Home Assistant
- ✅ **Version management** - Auto-increments for cache busting
- ✅ **Shadow DOM** - CSS isolation (no style conflicts)
- ✅ **Real-time feedback** - Console shows every step
- ✅ **Error handling** - Catches and displays issues
- ✅ **Configuration** - Centralized `deployment.config.json`

---

## 📊 What's New (Today)

### 🎯 Core System
- File watcher (`scripts/deploy-watcher.js`)
- Configuration (`deployment.config.json`)
- Windows launchers (batch & PowerShell)
- Complete auto-build/deploy pipeline

### 📚 Documentation
- 6 comprehensive guides
- Quick references
- Troubleshooting sections
- Architecture diagrams

### 🔧 Configuration
- `package.json` updated with `deploy:watch` script
- `chokidar` dependency for file watching
- All settings in `deployment.config.json`

---

## 🎓 Getting Started

### First Time? Read This:
1. **`QUICK_START_LINKS.md`** (choose your learning path)
2. **`DEPLOYMENT_QUICK_REFERENCE.md`** (2-minute cheat sheet)
3. Run: `npm run deploy:watch`

### Want Full Understanding?
1. **`DEPLOYMENT_SYSTEM_README.md`** (complete guide)
2. **`docs/AUTOMATED_DEPLOYMENT.md`** (step-by-step)
3. **`docs/ARCHITECTURE_DIAGRAMS.md`** (system design)

### Want Just the Essentials?
1. Run: `npm run deploy:watch`
2. Edit: `src/App.jsx`
3. Save: Ctrl+S
4. Refresh: Ctrl+Shift+R in HA
5. Done! You're developing 🚀

---

## 🔥 Common Questions

**Q: Do I need to run build/deploy manually?**  
A: No! `npm run deploy:watch` handles everything automatically.

**Q: How do I see changes in HA?**  
A: Hard refresh (Ctrl+Shift+R) after deployment. Regular F5 won't work!

**Q: What if I get a build error?**  
A: Check the console output. Fix your code. Save again - it auto-rebuilds.

**Q: Can I deploy without watching?**  
A: Yes! Use `npm run deploy:lovelace` for manual deployment.

**Q: Where are my changes deployed?**  
A: `Z:\www\lovelace-cards\dev2-react-dashboard.js`

---

## ✅ Verification

After starting the watcher:

1. Check console shows "Ready for changes..."
2. Edit a file in `src/`
3. Save (Ctrl+S)
4. Console should show "✓ Deployment complete!"
5. Hard refresh HA (Ctrl+Shift+R)
6. See your changes live!

---

## 🌟 Your React Dashboard Includes

### React Components
- Material-UI components
- Interactive charts (Recharts)
- Entity cards
- Dashboard layout

### Home Assistant Integration
- WebSocket connection
- State subscriptions
- Service call API
- Light/climate/scene control

### Data Persistence
- LocalForage storage
- Entity history tracking
- Settings persistence

### Web Component
- Custom `<dev2-react-dashboard>` element
- Shadow DOM CSS isolation
- Lovelace card integration
- React 18 rendering

---

## 📞 Need Help?

### Console Not Showing Messages?
→ Check `DEPLOYMENT_QUICK_REFERENCE.md` troubleshooting section

### Build Errors?
→ Run `npm run build:lovelace` to see full error

### Changes Not Showing?
→ Hard refresh with Ctrl+Shift+R (not just F5!)

### Read Documentation
→ Start with `QUICK_START_LINKS.md` for navigation

---

## 🎉 Ready to Code!

Your automated deployment system is fully operational.

**Start with:**
```bash
npm run deploy:watch
```

**Then just edit, save, and refresh HA.**

No more manual build/deploy steps. The system handles everything automatically! 🚀

---

## 🗂️ File Overview

| File | Purpose | Size |
|------|---------|------|
| `deploy-watcher.js` | Auto-watcher script | 6.6 KB |
| `deployment.config.json` | Configuration | 2.6 KB |
| `launch-deployment-watcher.ps1` | PowerShell launcher | 8.5 KB |
| `START-DEPLOYMENT.bat` | Windows launcher | 4 KB |
| `DEPLOYMENT_QUICK_REFERENCE.md` | Quick cheat sheet | 4.4 KB |
| `DEPLOYMENT_SYSTEM_README.md` | Complete guide | 10.5 KB |
| `docs/AUTOMATED_DEPLOYMENT.md` | Step-by-step | 8 KB |
| `QUICK_START_LINKS.md` | Documentation links | 7 KB |

**Total new system:** ~51 KB of automation + documentation

---

## 🎯 Next Steps

1. **Choose your documentation:**
   - Quick: `DEPLOYMENT_QUICK_REFERENCE.md` (2 min)
   - Complete: `DEPLOYMENT_SYSTEM_README.md` (15 min)
   - Navigation: `QUICK_START_LINKS.md` (find what you need)

2. **Start the watcher:**
   ```bash
   npm run deploy:watch
   ```

3. **Begin developing:**
   - Edit files in `src/`
   - Save (Ctrl+S)
   - Watch auto-deploy
   - Refresh HA (Ctrl+Shift+R)
   - See changes live!

---

**Everything is set up. You're ready to code!** ✨

Happy developing! 🚀
