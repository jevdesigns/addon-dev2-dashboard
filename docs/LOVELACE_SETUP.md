# 🎛️ Dev2 React Dashboard - Lovelace Custom Card Setup Guide

## Overview

Your React dashboard is now available as a **Lovelace Custom Card**, which integrates seamlessly with Home Assistant's native dashboard system. This is the preferred method for displaying your app within Lovelace.

## What Changed

Instead of the old sidebar panel approach, your React app now:
- Loads as a custom card within Lovelace dashboards
- Receives the `hass` object directly from Lovelace (no separate WebSocket needed)
- Can be placed on any dashboard view like a standard card
- Responds to all Home Assistant state changes automatically
- Features HomeKit-inspired UI with Tailwind CSS styling

## Installation Steps

### Step 1: Register the Lovelace Resource

1. Open Home Assistant
2. Navigate to **Settings** → **Dashboards** → **Resources** (top right corner)
3. Click **Create Resource** (bottom right)
4. Fill in the form:
   - **URL**: `/local/lovelace-cards/dev2-react-dashboard.js`
   - **Resource type**: `JavaScript Module`
5. Click **Create**

### Step 2: Create a Dashboard View

You can add the custom card to an existing dashboard or create a new one. Here's how to create a new dashboard:

1. Navigate to **Dashboards**
2. Click **Create Dashboard** (bottom right)
3. Enter a name (e.g., "Dev2 React")
4. Click **Create**

### Step 3: Add the Custom Card to Your Dashboard

1. On your dashboard, click the **menu icon** (three dots) → **Edit Dashboard**
2. Click **+ Create New Card**
3. Scroll down to **Custom Cards** section
4. Look for **dev2-react-dashboard** and click it
5. (Optional) Configure the card title in YAML:

```yaml
type: custom:dev2-react-dashboard
title: My React Dashboard
```

6. Click **Save**

### Step 4 (Alternative): Edit Dashboard YAML Directly

If you prefer working with YAML, click the dashboard menu → **Edit dashboard** → **Raw configuration editor**:

```yaml
title: Dev2 React Dashboard
views:
  - title: Dev2 App
    path: dev2-app
    cards:
      - type: custom:dev2-react-dashboard
        title: Dev2 Dashboard
```

## Features

✅ **Automatic State Sync**: The app receives all entity state changes in real-time via the `hass` object

✅ **Service Calls**: Call Home Assistant services directly (turn on lights, set climate temp, etc.)

✅ **Local Storage**: Entity history and settings persist in IndexedDB

✅ **Responsive Design**: Works on desktop, tablet, and mobile within Lovelace

✅ **Theme Integration**: Respects your Home Assistant theme (light/dark mode)

✅ **HomeKit-Inspired UI**: Modern, polished interface with glass-morphism effects

✅ **Tailwind CSS**: Fully styled with utility-first CSS framework

## How It Works

### Web Component Architecture

Your React app is wrapped in a custom Web Component (`dev2-react-dashboard`) that:

1. **Receives the `hass` object** from Lovelace via the `set hass(hass)` setter
2. **Passes it to React** via the `HassProvider` context
3. **Re-renders** whenever state changes (automatically handled by Lovelace)

### Component Tree

```
<dev2-react-dashboard>  (Web Component)
  ├─ Shadow DOM (CSS isolation)
  │  └─ HassProvider (React Context)
  │     └─ App (Main React Component)
  │        └─ Dashboard (Your dashboard components)
  │           ├─ Clock/Weather Card
  │           ├─ Thermostat Card
  │           ├─ Lights Section
  │           ├─ Moods Section
  │           └─ EntityCard (Uses useHass() hook)
```

### Using the `hass` Object in Components

All your React components have access to the `hass` object via the `useHass()` hook:

```jsx
import { useHass } from '../contexts/HassContext'

export function MyComponent() {
  const hass = useHass()
  
  // Get entity state
  const lightState = hass.states['light.kitchen']
  
  // Call a service
  await hass.callService('light', 'turn_on', {
    entity_id: 'light.kitchen',
    brightness_pct: 80
  })
}
```

## Configuration

### Card Configuration Options

You can pass configuration options to the card via YAML:

```yaml
type: custom:dev2-react-dashboard
title: My Custom Title
theme: dark
```

These options are available in your React components via the `HassProvider`:

```jsx
export function App({ config = {} }) {
  const appTitle = config?.title || 'D522 Dashboard'
  // ... use appTitle
}
```

## Styling & Customization

The dashboard uses:
- **Tailwind CSS v4** for responsive, utility-first styling
- **PostCSS** for CSS compilation and autoprefixing
- **Lucide React** for clean, modern icons
- **Shadow DOM** for CSS isolation from Home Assistant

### Customizing Colors & Spacing

All Tailwind utilities are available in the components. Edit `src/tailwind.config.js` to customize:

```javascript
export default {
  theme: {
    extend: {
      // Add custom colors, spacing, animations, etc.
      colors: {
        'primary': '#your-color',
      }
    }
  }
}
```

## Troubleshooting

### "Unable to load the card"

**Cause**: The resource URL is incorrect or the file isn't deployed

**Solution**:
1. Verify the file exists: `Z:\www\lovelace-cards\dev2-react-dashboard.js`
2. Check the resource URL matches exactly: `/local/lovelace-cards/dev2-react-dashboard.js`
3. Hard refresh browser: `Ctrl+Shift+R`
4. Clear browser cache if needed

### "Card is blank or not responding"

**Cause**: The `hass` object isn't being passed correctly, or process polyfill issue

**Solution**:
1. Open Developer Tools (`F12`)
2. Check Console for errors like "process is not defined"
3. Verify the card is properly registered (should see `dev2-react-dashboard` in the DOM)
4. Check Network tab to ensure bundle loads fully

### "Entities not updating"

**Cause**: Component not using the `hass` object correctly

**Solution**:
1. Make sure you're using the `useHass()` hook in functional components
2. Or use `this.props.hass` in class components
3. Verify entity IDs are correct (e.g., `light.kitchen` not `light_kitchen`)

## Development Workflow

### Rebuild and Redeploy

When you make changes to your React code:

```bash
npm run build:lovelace  # Build the Lovelace card bundle
npm run deploy:lovelace # Deploy to Z:\www\lovelace-cards\
```

Or use a single command:

```bash
npm run build:lovelace && npm run deploy:lovelace
```

### Automated Deployment

The automated deployment watcher monitors `src/` for changes and automatically rebuilds and deploys:

```bash
npm run deploy:watch
```

This allows for instant testing - just save your files and refresh your browser.

## File Structure

```
src/
├── lovelace-card.jsx        # Web Component wrapper (entry point for Lovelace build)
├── App.jsx                  # Main React component with all dashboard logic
├── main.jsx                 # Entry point for standard web app
├── index.css                # Global Tailwind CSS directives
├── contexts/
│   └── HassContext.jsx      # hass context provider and useHass hook
├── components/
│   ├── DashboardClean.jsx   # Main dashboard layout
│   ├── EntityCard.jsx       # Reusable entity card component
│   ├── Charts.jsx           # Historical data visualization
│   └── ...
├── api/
│   ├── haServices.js        # Service call helpers
│   └── websocket.js         # WebSocket client (optional, Lovelace provides connection)
├── storage/
│   └── localStore.js        # IndexedDB helpers for persistence
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
└── vite.lovelace.config.js  # Vite build config for Lovelace

dist/
├── dev2-react-dashboard.umd.js  # Built bundle (what gets deployed)
└── style.css                    # Compiled Tailwind CSS

Z:\www\lovelace-cards\
└── dev2-react-dashboard.js  # Deployed bundle (loaded by Lovelace)
```

## Deployment Locations

- **Development**: `D:\HA\522-react\` (your project folder)
- **Lovelace Cards**: `Z:\www\lovelace-cards\` (where the bundle is deployed)
- **Home Assistant Config**: `Z:\configuration.yaml`
- **Lovelace UI**: `/local/lovelace-cards/dev2-react-dashboard.js` (what HA loads)

## Build Output

Current build statistics:
- **JS Bundle**: 51.34 kB (15.73 kB gzipped)
- **CSS File**: 46.22 kB (7.86 kB gzipped)
- **Format**: UMD (Universal Module Definition)
- **Build Time**: ~1.2 seconds

## Next Steps

1. ✅ Register the resource in Home Assistant
2. ✅ Add the custom card to a dashboard view
3. ✅ Test that your React app loads and responds to entity state changes
4. ✅ Customize the dashboard layout and styling as needed
5. ✅ Set up automated deployment watcher for development

## Support & Resources

- [Home Assistant Custom Card Documentation](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card)
- [Lovelace Configuration](https://www.home-assistant.io/dashboards/dashboards)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [React Documentation](https://react.dev)

---

**Built with**: React 18, Vite 5, Tailwind CSS v4, Lucide React, PostCSS

*Last Updated: December 5, 2025*

