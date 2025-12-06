# HA Custom Panel Migration - Testing & Deployment Checklist

This document guides you through deploying the React dashboard as a Home Assistant Custom Panel and verifying all functionality.

## Phase 1: Build & Deploy

### ✅ 1. Build the Panel Bundle

```powershell
Push-Location 'D:\HA\522-react'
npm run build:panel
Pop-Location
```

Expected output:
- `dist/my-react-panel.umd.js` (~1.2 MB)
- `dist/my-react-panel.mjs` (~0.03 KB)
- `dist/Charts-*.mjs` (~526 KB) - lazy chunk
- Build completes in ~7s

### ✅ 2. Deploy to HA

```powershell
Push-Location 'D:\HA\522-react'
npm run deploy:panel
Pop-Location
```

Expected: Panel bundle copied to `Z:\www\d522-react\my-react-panel.js` (or your configured `VITE_PANEL_TARGET` directory).

Verify with:
```powershell
Get-Item 'Z:\www\d522-react\my-react-panel.js'
```

## Phase 2: Configure Home Assistant

### ✅ 3. Add Panel Configuration

Open your Home Assistant `configuration.yaml` (typically at `/root/configuration.yaml` or `C:\Users\<user>\AppData\Roaming\homeassistant\configuration.yaml` on Windows):

Add or update:

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
- `embed_iframe: true` — **CRITICAL**: Isolates the React app in an iframe to prevent component conflicts with HA's native Lit-based frontend.
- `module_url` — Points to the bundle in HA's `www/` directory (served at `/local/`).
- `url_path` — Unique URL path for the panel (used in `/dev/dev2-react`).

### ✅ 4. Restart Home Assistant

From HA UI:
1. Go to Settings → System
2. Click "Restart" button
3. Wait 30-60 seconds for HA to reload

OR from command line (if SSH/console access):
```bash
sudo systemctl restart homeassistant
```

### ✅ 5. Verify Sidebar Entry

After restart:
1. Look at the HA left sidebar
2. You should see a new entry: **dev2** (with a developer board icon 📋)
3. Click it to open the panel

If it's not visible:
- Check HA logs (Settings → System → Logs) for errors loading `panel_custom`
- Ensure `my-react-panel.js` is present at `Z:\www\d522-react\my-react-panel.js`
- Verify `configuration.yaml` syntax (YAML is whitespace-sensitive)
- Try a hard refresh (Ctrl+Shift+R) in your browser

## Phase 3: Test Real-Time Functionality

### ✅ 6. Connection Status

1. Open the dev2 panel
2. In the left sidebar, you should see **Entities** and a connection status indicator
3. Status should show: **connected** (or cycling through connecting → connected)

If stuck on "connecting":
- Check that your Home Assistant WebSocket URL is correct (usually `ws://ha-host:8123/api/websocket`)
- Verify HA token is set and valid in app Settings
- Check browser console (F12 → Console) for WebSocket errors

### ✅ 7. Entity State Updates

1. Toggle a light in HA (or another client, e.g., the main Lovelace dashboard)
2. The light entity in your app's "Entities" list should update instantly
3. History graph should display real-time state transitions

If states don't update:
- Verify WebSocket subscription is active (check browser console logs)
- Open app Settings and re-enter your token and WebSocket URL
- Click "Reconnect" button

### ✅ 8. Service Calls

The app includes service call helpers. To test:

#### Test Light Toggle (if you have a light entity)

1. In the app sidebar, click on a light entity (e.g., `light.living_room`)
2. If an EntityCard appears, click the "Turn On" or "Turn Off" button
3. Verify the light toggles in HA (check the main Lovelace dashboard or physical bulb)

#### Test Climate Control (if you have a thermostat)

1. Click on a climate entity (e.g., `climate.downstairs`)
2. Use the slider to set a target temperature
3. Verify the thermostat responds in HA

#### Manual Service Call Test (via browser console)

Open browser developer tools (F12 → Console) and run:

```javascript
// Test if service calling is wired
const hass = window.d522_debug?.getConn?.()?.hass || window.hass
if (hass) {
  hass.callService('light', 'toggle', {entity_id: 'light.living_room'})
    .then(r => console.log('Service call succeeded:', r))
    .catch(e => console.error('Service call failed:', e))
}
```

## Phase 4: Mobile Responsiveness

### ✅ 9. Test Mobile Layout

#### Desktop (simulated mobile)
1. Open the dev2 panel on a desktop browser
2. Press F12 to open developer tools
3. Click the mobile icon (📱) to enable device emulation
4. Test common screen sizes: iPhone 12 (390x844), iPad (768x1024), Android phone (412x915)

#### Real Mobile Device
1. Open Home Assistant app or mobile browser
2. Navigate to your HA instance
3. Look for the dev2 panel in the sidebar
4. Verify:
   - Text is readable (no tiny fonts)
   - Buttons are easily clickable (tap targets ≥ 44x44px)
   - No horizontal overflow
   - Responsive grid adjusts for narrower screens

#### Common Issues & Fixes
- **Text too small:** Adjust theme font sizes in `src/main.jsx`
- **Buttons cramped:** Add responsive padding in component styles
- **Horizontal scroll:** Set `width: 100vw` responsibly and check max-widths

## Phase 5: Performance & Optimization

### ✅ 10. Bundle Size & Load Time

Check the build output:
```
dist/my-react-panel.umd.js      1,218.42 kB │ gzip: 362.52 kB
dist/Charts-BKC9UWkT.mjs          526.36 kB │ gzip: 121.55 kB  (lazy)
```

The Charts component is lazy-loaded, so the initial bundle is smaller and faster.

### ✅ 11. Monitor Network & Performance

1. Open panel, press F12 → Network tab
2. Reload the panel
3. Check:
   - `my-react-panel.js` loads (~1.2 MB → 360KB gzip transfer)
   - Charts chunk loads only when a chart widget is added
   - WebSocket connection establishes (visible as a persistent WS connection)
   - All requests complete without errors (no 404s)

### Optimization Tips
- If load time is slow, pre-compress assets and enable gzip on your server
- Monitor HA CPU/memory usage; if high, reduce entity polling or history size
- Use browser DevTools Performance tab to identify component bottlenecks

## Phase 6: Troubleshooting

### Panel doesn't appear in sidebar

**Symptoms:** After restart, no "dev2" entry visible.

**Solutions:**
1. Check `configuration.yaml` for syntax errors (use YAML validator online)
2. Verify `module_url: /local/my-react-panel.js` matches actual file location
3. Check HA logs: Settings → System → Logs, filter for "panel_custom" or "my-react-panel"
4. Restart HA again; sometimes a first restart isn't enough
5. Clear browser cache (Ctrl+Shift+Del) and hard refresh

### WebSocket connection fails

**Symptoms:** Status shows "error" or "reconnecting" in a loop.

**Solutions:**
1. Verify WebSocket URL is correct (usually `/api/websocket` when served from same origin)
2. Check HA token is valid and has the right permissions
3. Test token in Settings dialog, re-enter and save
4. Check browser console for mixed-content warnings (HTTPS page + WS connection)
5. Ensure HA WebSocket API is enabled (should be by default)

### Entity states not updating

**Symptoms:** List shows entities, but states are static.

**Solutions:**
1. Verify subscription is active: open browser console and check logs
2. Trigger a state change in HA (toggle a light) and observe WebSocket messages
3. Confirm HA is sending `state_changed` events (check HA Developer Tools → States)
4. Click "Reconnect" button to force WebSocket re-subscribe
5. Check HA database size; if huge, events may be delayed

### Service calls fail silently

**Symptoms:** Click "Turn On" button but light doesn't change.

**Solutions:**
1. Verify the entity exists in HA (check States in Developer Tools)
2. Test calling the service manually in HA Developer Tools → Services
3. Check browser console for error messages
4. Verify your HA token has the right permissions for service calls
5. Inspect the request/response in Network tab (F12 → Network)

### Performance issues on low-powered device

**Symptoms:** Panel is sluggish, history graphs lag, CPU/RAM high.

**Solutions:**
1. Reduce history size: modify `localStore.js` to keep fewer state points
2. Disable Charts by default (don't add chart widgets unless needed)
3. Reduce polling frequency or disable real-time updates for less critical entities
4. Use a lighter mobile browser (e.g., Firefox on mobile, not Chrome)
5. Offload dashboard to a more powerful HA instance or separate machine

## Appendix: Quick Command Reference

```powershell
# Full build + deploy cycle
Push-Location 'D:\HA\522-react'
npm run build:panel
npm run deploy:panel
Pop-Location

# Development: build panel and watch for changes
Push-Location 'D:\HA\522-react'
npm run build:panel -- --watch
Pop-Location

# Check panel bundle size
Get-Item 'D:\HA\522-react\dist\my-react-panel.umd.js' | Select-Object Length

# Verify deployment
Get-Item 'Z:\www\d522-react\my-react-panel.js' | Select-Object Length

# Test WebSocket in browser console (after opening the panel)
window.d522_debug.getConn()
window.d522_debug.getStatus()
window.d522_debug.reconnect()

# Export all collected data
window.d522_debug.exportAll()
```

## Summary

You now have a fully functional Home Assistant Custom Panel built with React! 🎉

- **Web Component** (`ha-panel-dev2`) wraps your React app
- **Panel Bundle** (`my-react-panel.js`) deployed to HA `www` folder
- **Live Updates** via WebSocket + state subscriptions
- **Service Calls** for lights, climate, scripts, scenes
- **Mobile Responsive** layout for all screen sizes
- **Production Ready** with lazy-loaded charts and optimized bundle

Next steps:
1. Customize EntityCard to match your entity types
2. Add domain-specific widgets (e.g., media player controls, camera feeds)
3. Implement energy/cost dashboards using HA energy API
4. Add automations/scene trigger buttons
5. Style to match your home's aesthetic

Good luck! 🚀
