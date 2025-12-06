# ⚡ Quick Start - Lovelace Custom Card

## TL;DR - Get Running in 3 Steps

### Step 1️⃣ : Register Resource (Home Assistant UI)
```
Settings > Dashboards > Resources > Create Resource
  URL: /local/lovelace-cards/dev2-react-dashboard.js
  Type: JavaScript Module
```

### Step 2️⃣ : Add Card to Dashboard
```yaml
# In your dashboard YAML:
type: custom:dev2-react-dashboard
title: Dev2 Dashboard
```

### Step 3️⃣ : View & Test
- Navigate to dashboard
- Check entities display
- Click to interact with entities

---

## Commands

```bash
# Build the card
npm run build:lovelace

# Deploy to Home Assistant
npm run deploy:lovelace

# Both at once
npm run build:lovelace && npm run deploy:lovelace
```

---

## File Locations

- **Source Code**: `D:\HA\522-react\src\`
- **Entry Point**: `D:\HA\522-react\src\lovelace-card.jsx`
- **Deployed Bundle**: `Z:\www\lovelace-cards\dev2-react-dashboard.js`
- **Build Artifact**: `D:\HA\522-react\dist\dev2-react-dashboard.umd.js`

---

## What's Happening Under the Hood

```
Lovelace Frontend
    ↓
Loads: /local/lovelace-cards/dev2-react-dashboard.js
    ↓
Registers: <dev2-react-dashboard> custom element
    ↓
Passes: hass object via set hass(hass) setter
    ↓
React App mounts with HassProvider context
    ↓
Components use useHass() hook to access hass
    ↓
Real-time updates from Home Assistant
```

---

## Use the hass Object

```javascript
import { useHass } from '../contexts/HassContext'

export function MyComponent() {
  const hass = useHass()
  
  // Get entity state
  const temp = hass.states['climate.downstairs'].attributes.current_temperature
  
  // Call a service
  hass.callService('light', 'turn_on', {
    entity_id: 'light.kitchen',
    brightness_pct: 80
  })
}
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Can't load card" | `Ctrl+Shift+R` to hard refresh |
| "Blank card" | Open DevTools (F12), check Console for errors |
| "No entities" | Verify entity IDs, check HA is running |
| "Not updating" | Reload page, check WebSocket connection |

---

## Full Documentation

- 📖 [Complete Setup Guide](./LOVELACE_SETUP.md)
- 🎯 [Migration Complete](./LOVELACE_MIGRATION_COMPLETE.md)
- 📋 [Configuration Examples](./CONFIGURATION_EXAMPLES.md)
- 🔧 [Service Calls API](./SERVICE_CALLS.md)

---

**Status**: ✅ Ready to use
**Bundle**: 1.12 MB (337 KB gzipped)
**Format**: UMD Module
**Compatibility**: Home Assistant 2023.8+
