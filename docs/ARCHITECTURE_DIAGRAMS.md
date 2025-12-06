# Dev2 React Dashboard - Visual Architecture Diagram

## Overall Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         HOME ASSISTANT                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    LOVELACE FRONTEND                                │   │
│  │                                                                     │   │
│  │  User clicks: Settings > Dashboards > Resources                   │   │
│  │  ↓                                                                  │   │
│  │  Loads: /local/lovelace-cards/dev2-react-dashboard.js             │   │
│  │  ↓                                                                  │   │
│  │  Registers: customElements.define('dev2-react-dashboard', ...)    │   │
│  │  ↓                                                                  │   │
│  │  Creates: <dev2-react-dashboard></dev2-react-dashboard>           │   │
│  │  ↓                                                                  │   │
│  │  Calls: element.setConfig({ title: "My Dashboard" })              │   │
│  │  ↓                                                                  │   │
│  │  Calls: element.hass = <HA connection object>                     │   │
│  │  ↓                                                                  │   │
│  │  [React app now has access to hass object!]                        │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │          CUSTOM WEB COMPONENT: <dev2-react-dashboard>              │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                     │   │
│  │  class Dev2ReactDashboard extends HTMLElement {                   │   │
│  │    _hass = null                                                    │   │
│  │    _config = null                                                  │   │
│  │                                                                     │   │
│  │    connectedCallback() {                                           │   │
│  │      this._reactRoot = createRoot(this)                           │   │
│  │      this.renderReactApp()                                        │   │
│  │    }                                                               │   │
│  │                                                                     │   │
│  │    setConfig(config) {     ← Lovelace calls this                  │   │
│  │      this._config = config                                        │   │
│  │    }                                                               │   │
│  │                                                                     │   │
│  │    set hass(hass) {         ← Lovelace sets this                  │   │
│  │      this._hass = hass                                            │   │
│  │      this.renderReactApp()  ← Re-render when hass updates        │   │
│  │    }                                                               │   │
│  │                                                                     │   │
│  │    renderReactApp() {                                             │   │
│  │      <HassProvider hass={this._hass}>                            │   │
│  │        <App config={this._config} />                             │   │
│  │      </HassProvider>                                             │   │
│  │    }                                                               │   │
│  │  }                                                                 │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              ↓                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │              REACT COMPONENT TREE                                   │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                     │   │
│  │  <HassProvider hass={hass}>                                        │   │
│  │    Provides hass to all child components via React Context        │   │
│  │    │                                                               │   │
│  │    └─ <App config={config}>                                       │   │
│  │         Main app component                                        │   │
│  │         │                                                         │   │
│  │         ├─ <AppBar>                                               │   │
│  │         │  └─ Title: "D522 Dashboard"                             │   │
│  │         │                                                         │   │
│  │         └─ <Dashboard>                                            │   │
│  │            └─ <EntityCard>                                        │   │
│  │            │  Uses: useHass() hook                                │   │
│  │            │  Reads: entity state from hass.states               │   │
│  │            │  Actions: hass.callService() for control            │   │
│  │            │                                                     │   │
│  │            ├─ <EntityCard entity="light.kitchen">               │   │
│  │            │  • Display state: On/Off                           │   │
│  │            │  • Brightness slider: 0-100%                      │   │
│  │            │  • Call: light.turn_on / light.turn_off            │   │
│  │            │                                                     │   │
│  │            ├─ <EntityCard entity="climate.downstairs">          │   │
│  │            │  • Display state: 22°C                             │   │
│  │            │  • Temp slider: 16-30°C                           │   │
│  │            │  • Call: climate.set_temperature                   │   │
│  │            │                                                     │   │
│  │            └─ <Charts>                                           │   │
│  │               • Display: Entity history from localforage         │   │
│  │               • Lazy-load: Recharts on demand                    │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              ↓                                              │
│         ┌────────────────────────────────────────────┐                   │
│         │   DATA SOURCES & INTERACTIONS              │                   │
│         ├────────────────────────────────────────────┤                   │
│         │                                            │                   │
│         │  Entity State: hass.states['light.xxx']   │                   │
│         │  ├─ state: 'on' | 'off'                  │                   │
│         │  ├─ attributes: { brightness: 255, ... } │                   │
│         │  └─ last_updated: timestamp              │                   │
│         │                                            │                   │
│         │  Service Calls: hass.callService()        │                   │
│         │  ├─ light.turn_on                         │                   │
│         │  ├─ light.turn_off                        │                   │
│         │  ├─ climate.set_temperature               │                   │
│         │  └─ ... other services                    │                   │
│         │                                            │                   │
│         │  History: localStorage via localforage   │                   │
│         │  ├─ Stored: Entity state changes         │                   │
│         │  ├─ Format: { timestamp, entity_id, ... } │                   │
│         │  └─ Used: For charts/analytics           │                   │
│         │                                            │                   │
│         └────────────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Lifecycle

```
┌──────────────────────────────────────────────────────────────┐
│ Step 1: Lovelace Loads Resource                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Lovelace detects resource in Settings > Dashboards         │
│  ↓                                                           │
│  Loads JavaScript module:                                   │
│  /local/lovelace-cards/dev2-react-dashboard.js             │
│  ↓                                                           │
│  Script runs: customElements.define('dev2-react-dashboard', │
│                                     Dev2ReactDashboard)    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 2: Custom Card Added to Dashboard                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Dashboard YAML includes:                                   │
│  type: custom:dev2-react-dashboard                         │
│  title: Dev2 Dashboard                                      │
│  ↓                                                           │
│  Lovelace creates: <dev2-react-dashboard></dev2-react...   │
│  ↓                                                           │
│  Triggers: connectedCallback()                             │
│  ↓                                                           │
│  Creates: React root and renders component                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 3: Lovelace Provides hass Object                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Lovelace detects component has hass property               │
│  ↓                                                           │
│  Calls: element.setConfig(config) with dashboard config    │
│  ↓                                                           │
│  Sets: element.hass = <HA connection object>               │
│  ↓                                                           │
│  Triggers: set hass(hass) setter                           │
│  ↓                                                           │
│  Calls: renderReactApp() with hass object                  │
│  ↓                                                           │
│  React mounts with <HassProvider hass={hass}>             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 4: Real-Time Updates                                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Entity state changes in Home Assistant                     │
│  ↓                                                           │
│  WebSocket sends state_changed event                       │
│  ↓                                                           │
│  Lovelace updates hass object                              │
│  ↓                                                           │
│  Calls: element.hass = <updated hass>                      │
│  ↓                                                           │
│  Triggers: React re-render                                 │
│  ↓                                                           │
│  Components display new state                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 5: User Interaction (Service Calls)                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  User clicks: "Toggle Light" button                         │
│  ↓                                                           │
│  Component calls: hass.callService('light', 'turn_on', ...) │
│  ↓                                                           │
│  Lovelace executes service on Home Assistant               │
│  ↓                                                           │
│  HA changes entity state                                    │
│  ↓                                                           │
│  WebSocket broadcasts state_changed                        │
│  ↓                                                           │
│  Lovelace updates hass, re-renders component               │
│  ↓                                                           │
│  UI reflects new state                                      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

```
                    HOME ASSISTANT
                         |
                         | (WebSocket connection)
                         |
         ┌───────────────┴───────────────┐
         |                               |
    Entity State              Service Calls
    (read-only)            (controls)
         |                               |
         |                               |
         ↓                               ↓
    ┌─────────────┐           ┌─────────────────┐
    │ hass.states │           │ hass.callService│
    ├─────────────┤           ├─────────────────┤
    │ light.xxx   │           │ light.turn_on   │
    │ climate.xxx │           │ light.turn_off  │
    │ sensor.xxx  │           │ climate.set_temp│
    └─────────────┘           └─────────────────┘
         |                               |
         └───────────────┬───────────────┘
                         |
                         ↓
            ┌────────────────────────┐
            │  React Components      │
            ├────────────────────────┤
            │  useHass() hook        │
            │  ├─ Read: states       │
            │  └─ Write: services    │
            └────────────────────────┘
                         |
         ┌───────────────┴───────────────┐
         |                               |
         ↓                               ↓
    ┌─────────────┐           ┌──────────────────┐
    │ Display     │           │ IndexedDB/Local  │
    │ ├─ Cards    │           │ Storage          │
    │ ├─ Charts   │           │ ├─ History       │
    │ ├─ Controls │           │ ├─ Settings      │
    │ └─ UI       │           │ └─ Persistence   │
    └─────────────┘           └──────────────────┘
```

## File Dependencies

```
Entry Point
    |
    └── src/lovelace-card.jsx (Web Component wrapper)
        |
        ├── react (import)
        ├── react-dom (import)
        |
        └── src/App.jsx (Main React component)
            |
            ├── @mui/material (import)
            ├── src/contexts/HassContext.jsx
            │   └── src/components/DashboardClean.jsx
            │       ├── src/components/EntityCard.jsx
            │       │   ├── src/api/haServices.js
            │       │   ├── @mui/material
            │       │   └── src/contexts/HassContext.jsx
            │       │
            │       └── React.lazy() → Charts component
            │           └── recharts (lazy-loaded)
            │
            └── src/storage/localStore.js
                └── localforage (IndexedDB wrapper)
```

## Build Output

```
Input:  src/lovelace-card.jsx
    |
    ├─ [Vite Build Process]
    │  ├─ JSX → JavaScript (via @vitejs/plugin-react)
    │  ├─ Code splitting (vendor chunks)
    │  ├─ Minification (terser)
    │  └─ UMD module format
    |
Output: dist/dev2-react-dashboard.umd.js (1.12 MB)
    |
    ├─ Deployment Script (deploy-lovelace.ps1)
    |
    └─→ Z:\www\lovelace-cards\dev2-react-dashboard.js
        |
        └─→ Served as: /local/lovelace-cards/dev2-react-dashboard.js
            |
            └─→ Loaded by Lovelace Frontend
```

## Security Model

```
┌─ Network Boundary ─────────────────────────────┐
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Home Assistant                         │   │
│  │  (Trusted Server)                       │   │
│  │                                         │   │
│  │  • Validates tokens                     │   │
│  │  • Executes services                    │   │
│  │  • Manages entity states                │   │
│  │  • WebSocket (encrypted)                │   │
│  └─────────────────────────────────────────┘   │
│                   ↑    ↓                        │
│               (secure connection)              │
│                   ↑    ↓                        │
│  ┌─────────────────────────────────────────┐   │
│  │  Browser (Same-Origin Policy)           │   │
│  │                                         │   │
│  │  ┌─────────────────────────────────┐   │   │
│  │  │ dev2-react-dashboard.js         │   │   │
│  │  │ (Web Component)                 │   │   │
│  │  │                                 │   │   │
│  │  │ • Receives hass from Lovelace   │   │   │
│  │  │ • Calls hass.callService()      │   │   │
│  │  │ • Reads hass.states             │   │   │
│  │  │ • Never stores auth tokens      │   │   │
│  │  │ • Same-origin only              │   │   │
│  │  └─────────────────────────────────┘   │   │
│  │                                         │   │
│  │  ┌─────────────────────────────────┐   │   │
│  │  │ React App                       │   │   │
│  │  │ (UI Components)                 │   │   │
│  │  │                                 │   │   │
│  │  │ • Uses useHass() hook           │   │   │
│  │  │ • Accesses via HassProvider     │   │   │
│  │  │ • No direct HA access           │   │   │
│  │  │ • Local storage (IndexedDB)     │   │   │
│  │  └─────────────────────────────────┘   │   │
│  │                                         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘

Trust Model:
• Lovelace provides hass object (authenticated by HA)
• Component trusts Lovelace-provided hass
• All calls go through official HA APIs
• Same-origin policy prevents cross-site attacks
• IndexedDB limited to same-origin data
```

## State Management Flow

```
┌─────────────────────────────────────┐
│  Home Assistant                     │
│  (Single Source of Truth)           │
└──────────────┬──────────────────────┘
               │
               │ WebSocket (state_changed)
               ↓
┌─────────────────────────────────────┐
│  Lovelace Frontend                  │
│  ├─ Maintains hass object           │
│  └─ Updates component props         │
└──────────────┬──────────────────────┘
               │
               │ set hass() property
               ↓
┌─────────────────────────────────────┐
│  Web Component                      │
│  ├─ _hass = new value               │
│  └─ renderReactApp()                │
└──────────────┬──────────────────────┘
               │
               │ Pass hass to React
               ↓
┌─────────────────────────────────────┐
│  HassProvider Context               │
│  └─ value = hass                    │
└──────────────┬──────────────────────┘
               │
               │ useHass() hook
               ↓
┌─────────────────────────────────────┐
│  React Components                   │
│  ├─ Read: hass.states               │
│  ├─ Call: hass.callService()        │
│  └─ Display: UI based on state      │
└──────────────┬──────────────────────┘
               │
               │ User interaction
               ↓
         [User clicks button]
               ↓
               │ hass.callService()
               ↓
    (sends to Lovelace/Home Assistant)
               ↓
    (HA executes service, broadcasts change)
               ↓
    (Cycle repeats from top)
```

This architecture ensures:
✅ Single source of truth (Home Assistant)
✅ Unidirectional data flow (easier to debug)
✅ Real-time updates (WebSocket driven)
✅ React component isolation (via context)
✅ Type safety (hass object shape is known)
