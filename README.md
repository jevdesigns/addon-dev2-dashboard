# 📊 Dev2 React Dashboard for Home Assistant

A responsive React-based dashboard for Home Assistant that displays live entity states, historical data, and provides interactive controls—all integrated seamlessly into Lovelace.

## ✨ Features

- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **⚡ Real-Time Updates**: Live entity state synchronization via Home Assistant
- **📈 Interactive Charts**: Recharts-powered visualizations with lazy loading
- **💾 Local Persistence**: IndexedDB storage for entity history and settings
- **🎨 MUI v5 Styling**: Clean, professional material design UI
- **🔧 Service Calls**: Toggle lights, adjust climate, activate scenes, run scripts
- **🔌 Lovelace Integration**: Seamlessly integrated as a custom Lovelace card
- **⚙️ Zero Config**: Works out of the box with minimal setup

## 🚀 Quick Start

### Installation

1. **Build the Lovelace card**:
   ```bash
   npm run build:lovelace
   ```

2. **Deploy to Home Assistant**:
   ```bash
   npm run deploy:lovelace
   ```

3. **Register in Home Assistant**:
   - Settings → Dashboards → Resources
   - Create Resource: `/local/lovelace-cards/dev2-react-dashboard.js` (Module)

4. **Add to your dashboard**:
   ```yaml
   type: custom:dev2-react-dashboard
   title: Dev2 React Dashboard
   ```

## 📖 Documentation

- **[Lovelace Setup Guide](./docs/LOVELACE_SETUP.md)** ← Start here!
- **[Service Calls API](./docs/SERVICE_CALLS.md)** - Call Home Assistant services
- **[Testing Checklist](./docs/TESTING_CHECKLIST.md)** - Verification steps
- **[Implementation Summary](./docs/IMPLEMENTATION_SUMMARY.md)** - Technical details

## 🛠️ Development

```bash
npm run dev              # Dev server with hot reload
npm run build            # Build standard web app
npm run build:lovelace   # Build Lovelace card
npm run deploy:lovelace  # Deploy to Home Assistant
```

## 🏗️ Architecture

The app is built with:

2) Production-like preview (build and sync to HA)

- Build and copy `dist/` into your Home Assistant `config/www/d522-react` in one step:

```powershell
Push-Location 'D:\HA\522-react'
npm run build:sync
Pop-Location
```

- Or run a watcher that rebuilds on changes to `src/` and syncs automatically (lighter than continuous Vite builds):

```powershell
Push-Location 'D:\HA\522-react'
npm run src-watch
Pop-Location
```

This runs `chokidar-cli` and executes `npm run build:sync` whenever files under `src/` change.

3) Continuous production build (resource-heavy)

- If you want a continuous Rollup-style watch that keeps rebuilding a production bundle:

```powershell
Push-Location 'D:\HA\522-react'
npm run build:watch
Pop-Location
```

Note: `build:watch` may be CPU intensive on low-powered machines. Prefer `src-watch` which runs a single `build:sync` only when `src/` changes.

4) Dev + auto-sync convenience

- Run both dev server and the `src-watch` in parallel (useful if you still want to populate `dist/` automatically):

```powershell
Push-Location 'D:\HA\522-react'
npm run dev:sync
Pop-Location
```

Scripts added
- `npm run sync`  copy `dist/` to `Z:\www\d522-react`
- `npm run build:sync`  build then sync
- `npm run build:watch`  vite build --watch (continuous prod builds)
- `npm run src-watch`  watch `src/` and run `build:sync` on change
- `npm run dev:sync`  concurrently run dev server and `src-watch`

Panel / iframe integration with Home Assistant
---------------------------------------------
Add this `panel_iframe` to your `configuration.yaml` (replace dev host if needed):

```yaml
panel_iframe:
  d522_dev:
    title: 'D522 Dev'
    url: 'http://192.168.1.50:5173'
    icon: 'mdi:monitor-dashboard'
```

.env support
------------
Create a `.env` file in the project root to provide default values for the WebSocket and token during development (do NOT commit `.env`):

```
VITE_HA_WS=/api/websocket
VITE_HA_TOKEN=PASTE_YOUR_TEST_TOKEN_HERE
```

Security notes
--------------
- Use a Home Assistant Long-Lived Access Token for the dashboard (User profile  Long-Lived Access Tokens).
- Never commit tokens to git. Use `.env` locally and keep it out of source control.
- If your HA instance uses HTTPS, use `wss://` for WebSocket URLs or prefer the relative `/api/websocket` when the app is served from the same origin.

Troubleshooting
---------------
- If your browser blocks the WebSocket because of mixed content (HTTPS page trying to use `ws://`), switch to `wss://` or serve your dev server over HTTPS.
- If `build:watch` is slow or noisy on a low-powered device, use `src-watch` instead.

If you want, I can also add a small PowerShell helper `watch-and-sync.ps1` to wrap the most common commands into a single script.

New convenience helpers
-----------------------
- `watch-and-sync.ps1`: convenience helper to start dev/watch/build/sync tasks. It now runs watchers as PowerShell background jobs by default (no new windows). Pass `-Windowed` to open separate PowerShell windows instead.
- `store-token.ps1`: prompts for a Home Assistant long-lived token and writes/updates `VITE_HA_TOKEN` in `.env` (do NOT commit `.env`).

Quick commands
--------------
Store your token interactively (recommended):

```powershell
Push-Location 'D:\HA\522-react'
.\store-token.ps1
Pop-Location
```

Or via npm wrapper:

```powershell
Push-Location 'D:\HA\522-react'
npm run store-token
Pop-Location
```

Start dev server + sync watchers (background jobs, default):

```powershell
Push-Location 'D:\HA\522-react'
npm run watch:dev-sync
Pop-Location
```

Start dev server + sync watchers in separate windows (windowed mode):

```powershell
Push-Location 'D:\HA\522-react'
powershell -NoProfile -File .\watch-and-sync.ps1 -Mode dev-sync -Windowed
Pop-Location
```

Atomic deploy & cache-busting
-----------------------------
I added an atomic deploy script `deploy-atomic.ps1` that safely deploys `dist/` to your Samba target and appends a cache-busting `?v=<timestamp>` to local asset URLs in `index.html` so browsers will fetch updated files.

Usage (build + deploy):

```powershell
Push-Location 'D:\HA\522-react'
npm run deploy    # runs build then atomic deploy
Pop-Location
```

Usage (deploy existing dist/ without rebuilding):

```powershell
Push-Location 'D:\HA\522-react'
npm run sync
Pop-Location
```

The script makes a timestamped backup of the previous deployment and cleans up backups older than a configurable number of days.

Custom Panel (Home Assistant) Migration ✅
--------------------------------------

You can build a single-file bundle that registers a Web Component and mounts this React app as a full-screen Home Assistant Custom Panel. **This is fully implemented and ready to deploy.**

### ✅ What's Included

- **Web Component Wrapper** (`src/ha-panel.js`, `src/panel-entry.jsx`) — Registers `<ha-panel-dev2>` custom element
- **Service Call API** (`src/api/haServices.js`) — Helpers for lights, climate, scenes, scripts, and generic service calls
- **HassContext** (`src/contexts/HassContext.jsx`) — React context to access `hass` object from HA
- **EntityCard Example** (`src/components/EntityCard.jsx`) — Demo component with light toggle and climate control
- **Responsive Styling** — Optimized for embedded panel context (full-screen, responsive layout, optimized fonts)
- **Panel Build Config** (`vite.panel.config.js`) — Vite config to build single-file ESM bundle
- **Deploy Script** (`scripts/deploy-panel.ps1`) — Copies bundle to HA `www` folder
- **Documentation** (`docs/`) — Testing guide, service call examples, configuration snippets

### 1. Build the panel bundle

```powershell
Push-Location 'D:\HA\522-react'
npm run build:panel
Pop-Location
```

Expected output: `dist/my-react-panel.umd.js` (~1.2 MB, gzip: ~360 KB)

### 2. Deploy to Home Assistant

```powershell
Push-Location 'D:\HA\522-react'
npm run deploy:panel
Pop-Location
```

This copies the bundle to `Z:\www\d522-react\my-react-panel.js` (your HA `www` folder).

Verify:
```powershell
Get-Item 'Z:\www\d522-react\my-react-panel.js' | Select-Object Length
```

### 3. Configure Home Assistant

Edit your `configuration.yaml` and add (or see `docs/configuration.yaml.snippet`):

```yaml
panel_custom:
  - name: dev2_react_panel
    sidebar_title: dev2
    sidebar_icon: mdi:developer-board
    url_path: dev2-react
    module_url: /local/my-react-panel.js
    embed_iframe: true
```

**Key settings:**
- `embed_iframe: true` — **CRITICAL** for React apps to prevent conflicts with HA's Lit-based frontend
- `module_url` — Points to the bundle in HA's `www` folder (served at `/local/`)

### 4. Restart Home Assistant

From HA UI: Settings → System → Restart

Then look for **dev2** in the left sidebar with a developer board icon 📋

### 📚 Testing & Troubleshooting

See `docs/TESTING_CHECKLIST.md` for:
- Connection verification
- Real-time entity updates
- Service call testing (lights, climate, scenes)
- Mobile responsiveness
- Performance monitoring
- Common issues & fixes

### 🔌 Using Services in Components

See `docs/SERVICE_CALLS.md` for complete examples. Quick start:

```javascript
import { useHass } from '../contexts/HassContext'
import { toggleLight, setClimateTemperature } from '../api/haServices'

export default function MyControls() {
  const hass = useHass()
  
  return (
    <>
      <button onClick={() => toggleLight(hass, 'light.bedroom')}>
        Toggle Bedroom Light
      </button>
      <button onClick={() => setClimateTemperature(hass, 'climate.downstairs', 72)}>
        Set Temp to 72°F
      </button>
    </>
  )
}
```

### 🎨 Architecture

The panel integrates with Home Assistant in **two supported modes**:

**1. Custom Panel (Recommended)** — Full integration
- React app embedded in `<ha-panel-dev2>` Web Component
- HA passes `hass` object with full state & service access
- Isolated iframe prevents conflicts
- Command: `npm run build:panel && npm run deploy:panel`

**2. Standalone App** — For development, kiosks, or public displays
- Run `npm run dev` (localhost dev server)
- Or deploy standard `npm run build` to a web server
- Connect via WebSocket using token from `src/config.js` or app settings
- Useful for tablets, Raspberry Pi displays, low-powered devices

Both approaches are fully functional and work together (same codebase).

### 🚀 Quick Reference

```powershell
# Full build + deploy cycle
npm run build:panel
npm run deploy:panel

# Watch for changes during dev
npm run build:panel -- --watch

# Test in browser console (after opening panel in HA)
window.d522_debug.getConn()           # Get connection object
window.d522_debug.getStatus()         # Connection status
window.d522_debug.reconnect()         # Force reconnect
window.d522_debug.exportAll()         # Export all data
```

---

If you'd like, I can also modify the app to accept the `hass` object from Home Assistant (the wrapper already picks up a global `window.hass` fallback), and add simple helper hooks to call HA services (toggle, call_service) using the existing WebSocket helper in `src/api/websocket.js`.



