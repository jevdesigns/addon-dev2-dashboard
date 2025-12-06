# 🎯 DEPLOYMENT AUTOMATION - QUICK REFERENCE

## One Command to Rule Them All

```bash
npm run deploy:watch
```

That's it. Stop reading. Go edit your code. 👇

---

## What Happens Next

| Step | Automatic | Your Action | Result |
|------|-----------|-------------|--------|
| 1️⃣ Edit code | - | Edit any file in `src/` | File changes |
| 2️⃣ Save | - | Press Ctrl+S | File saved |
| 3️⃣ Detect | ✅ Watcher | *watches* | Change detected |
| 4️⃣ Build | ✅ Auto | *building* | Bundle created |
| 5️⃣ Deploy | ✅ Auto | *deploying* | Copied to HA |
| 6️⃣ Refresh | - | Ctrl+Shift+R | See changes! |

---

## The Real Workflow

```
1. Terminal:  npm run deploy:watch
2. Leave it running in background
3. Edit code normally
4. Save file
5. See console message: "✓ Deployment complete!"
6. Alt+Tab to HA
7. Ctrl+Shift+R (hard refresh)
8. Changes are live!
```

---

## Key Files

| File | Purpose |
|------|---------|
| `scripts/deploy-watcher.js` | File watcher + auto-builder + deployer |
| `deployment.config.json` | Central configuration |
| `dist/.deployment-version` | Version tracking (auto-incremented) |

---

## Troubleshooting 30 Seconds

| Problem | Solution |
|---------|----------|
| Nothing happening | Is watcher running? (Should say "Ready for changes...") |
| Build error | Check browser console (F12) or terminal |
| Changes not showing | Hard refresh: Ctrl+Shift+R |
| Permission denied | Check Z:\www\lovelace-cards permissions |

---

## Files Watched

```
src/
├── App.jsx ✓ Changes auto-deploy
├── lovelace-card.jsx ✓ Changes auto-deploy
├── components/ ✓ All changes auto-deploy
├── contexts/ ✓ All changes auto-deploy
└── api/ ✓ All changes auto-deploy
```

---

## Important: Shadow DOM CSS Isolation ✅

Your Web Component now uses **Shadow DOM** for CSS isolation:
- React styles won't leak to Home Assistant UI ✓
- Home Assistant styles won't break your app ✓
- Fully scoped and isolated ✓

---

## Console Output Meanings

```
✓ = Success (green) ........... Deployment worked!
✗ = Error (red) ............... Something failed
⚠ = Warning (yellow) ......... Check this
ℹ = Info (cyan) .............. FYI information
```

---

## Did It Deploy?

Check these signs:

✅ Console shows: `✓ Deployment complete!`
✅ Bundle copied: `Z:\www\lovelace-cards\dev2-react-dashboard.js`
✅ Version updated: `dist/.deployment-version` incremented
✅ Hard refresh shows changes: Ctrl+Shift+R in Home Assistant

---

## Stopping the Watcher

Press `Ctrl+C` in the terminal where watcher is running.

To restart: `npm run deploy:watch`

---

## Multiple Terminals (Advanced)

Run in **Terminal 1:**
```bash
npm run deploy:watch
```

Run in **Terminal 2** (if you want local dev preview):
```bash
npm run dev
```

Both can run simultaneously!

---

## Version Auto-Increment

Every deployment increments the version automatically:
- `1.0.0` → `1.0.1` → `1.0.2` ...
- Tracked in: `dist/.deployment-version`
- Used for cache busting in Home Assistant

---

## Manual Override

If you need to build/deploy manually:

```bash
# Just build (don't deploy)
npm run build:lovelace

# Build and deploy immediately
npm run build:lovelace && npm run deploy:lovelace

# Stop watcher and deploy manually
npm run deploy:lovelace
```

---

## Performance Tips

1. **Save frequently** - Watcher handles everything
2. **Hard refresh often** - Clears browser cache
3. **Check console** - (F12 in browser) for React errors
4. **Keep watcher running** - Entire development session

---

## Pro Tips 🚀

| Tip | How |
|-----|-----|
| See real-time logs | Keep terminal visible while coding |
| Faster feedback | Alt+Tab between code and HA |
| Test faster | Run HA in browser on same machine |
| Debug easily | Use HA dev tools (same F12 console) |

---

## That's All!

Your deployment system is fully automated. 

**Start developing with:**
```bash
npm run deploy:watch
```

Changes auto-deploy when you save. No more manual build/deploy cycles. 

Edit → Save → See changes live. Repeat. 🎉

---

*For detailed documentation, see: `docs/AUTOMATED_DEPLOYMENT.md`*
