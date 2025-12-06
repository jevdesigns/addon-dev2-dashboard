# Service Calls & Entity Integration Guide

This document explains how to use the Home Assistant service call API in your React components.

## Quick Start

### 1. Import the utilities

```javascript
import { useHass } from '../contexts/HassContext'
import { callHAService, toggleLight, setClimateTemperature } from '../api/haServices'
```

### 2. Get the hass object in your component

```javascript
export default function MyComponent() {
  const hass = useHass()
  
  // hass is now available
}
```

### 3. Call a service

```javascript
// Simple toggle light
async function toggleMyLight() {
  try {
    await toggleLight(hass, 'light.living_room')
    console.log('Light toggled!')
  } catch (err) {
    console.error('Failed to toggle light:', err)
  }
}

// Set climate temperature
async function setTemp() {
  try {
    await setClimateTemperature(hass, 'climate.downstairs', 72)
    console.log('Temperature set to 72°F')
  } catch (err) {
    console.error('Failed to set temperature:', err)
  }
}
```

## Available Service Functions

All functions are exported from `src/api/haServices.js`:

### Lights

```javascript
import { toggleLight, turnOnLight, turnOffLight } from '../api/haServices'

// Toggle on/off
await toggleLight(hass, 'light.bedroom')

// Turn on (optional brightness 0-255)
await turnOnLight(hass, 'light.bedroom', 255)  // full brightness
await turnOnLight(hass, 'light.bedroom', 128)  // 50% brightness

// Turn off
await turnOffLight(hass, 'light.bedroom')
```

### Climate / Thermostat

```javascript
import { setClimateTemperature, setClimateMode } from '../api/haServices'

// Set temperature
await setClimateTemperature(hass, 'climate.downstairs', 72)

// Set HVAC mode (heat, cool, heat_cool, off, etc.)
await setClimateMode(hass, 'climate.downstairs', 'heat')
```

### Scenes & Scripts

```javascript
import { activateScene, callScript } from '../api/haServices'

// Activate a scene (e.g., "Movie Mode")
await activateScene(hass, 'scene.movie_mode')

// Call a script
await callScript(hass, 'script.turn_on_morning_lights')
```

### Automations & Other Services

```javascript
import { executeAutomation, callHAService } from '../api/haServices'

// Trigger an automation
await executeAutomation(hass, 'automation.daily_briefing')

// Call any service (generic form)
await callHAService(hass, 'switch', 'turn_on', {
  entity_id: 'switch.garage_door'
})
```

## Complete Component Example

```javascript
import React, { useState } from 'react'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { useHass } from '../contexts/HassContext'
import { toggleLight, setClimateTemperature } from '../api/haServices'

export default function SceneControls() {
  const hass = useHass()
  const [loading, setLoading] = useState(false)

  const handleToggle = async (entityId) => {
    setLoading(true)
    try {
      await toggleLight(hass, entityId)
      // Optionally show a toast notification
    } catch (err) {
      console.error('Service call failed:', err)
      alert('Failed to toggle light')
    }
    setLoading(false)
  }

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        variant="contained"
        onClick={() => handleToggle('light.living_room')}
        disabled={loading}
      >
        Toggle Living Room
      </Button>
      <Button
        variant="contained"
        onClick={() => handleToggle('light.bedroom')}
        disabled={loading}
      >
        Toggle Bedroom
      </Button>
    </Box>
  )
}
```

## Advanced: Custom Service Calls

For services not covered by the convenience functions, use `callHAService`:

```javascript
import { callHAService } from '../api/haServices'

// Example: Set cover position (0-100%)
await callHAService(hass, 'cover', 'set_cover_position', {
  entity_id: 'cover.garage_door',
  position: 50
})

// Example: Send a notification
await callHAService(hass, 'notify', 'notify', {
  message: 'Hello from React dashboard',
  title: 'My App'
})

// Example: Lock/unlock a lock
await callHAService(hass, 'lock', 'lock', {
  entity_id: 'lock.front_door'
})

await callHAService(hass, 'lock', 'unlock', {
  entity_id: 'lock.front_door'
})

// Example: Play media
await callHAService(hass, 'media_player', 'play_media', {
  entity_id: 'media_player.living_room_tv',
  media_content_id: 'https://example.com/song.mp3',
  media_content_type: 'audio/mpeg'
})
```

## Entity State Reading

To read entity state (not just send commands), use `hass.states`:

```javascript
function useEntityState(entityId) {
  const hass = useHass()
  const [state, setState] = useState(null)

  React.useEffect(() => {
    if (!hass) return
    
    // Get current state
    const entity = hass.states[entityId]
    setState(entity)

    // Optionally subscribe to state changes (if HA supports it)
    // This depends on HA's architecture
  }, [hass, entityId])

  return state
}

// Usage:
export default function LightStatus() {
  const state = useEntityState('light.bedroom')
  
  return (
    <div>
      Bedroom light is: <strong>{state?.state || 'unknown'}</strong>
    </div>
  )
}
```

## Error Handling

Always wrap service calls in try/catch:

```javascript
async function safeLightToggle(entityId) {
  try {
    await toggleLight(hass, entityId)
  } catch (err) {
    if (err.message.includes('Invalid')) {
      console.error('Invalid entity ID')
    } else if (err.message.includes('Permission')) {
      console.error('No permission to call this service')
    } else {
      console.error('Unknown error:', err)
    }
  }
}
```

## TypeScript Definitions (optional)

If you're using TypeScript, add type definitions to `src/types/hass.d.ts`:

```typescript
export interface HassEntity {
  entity_id: string
  state: string
  attributes: Record<string, any>
  last_changed: string
  last_updated: string
}

export interface HassStates {
  [entityId: string]: HassEntity
}

export interface Hass {
  states: HassStates
  callService: (domain: string, service: string, data?: object) => Promise<any>
  connection: any
}
```

## Debugging

To inspect available services in HA, use the Developer Tools:

1. Home Assistant UI → Developer Tools → Services
2. Search for a domain (e.g., "light", "climate")
3. Expand a service to see required and optional fields
4. Test the service with example data

Or inspect via browser console:

```javascript
// List all available entity states
console.log(window.hass?.states || {})

// Check a specific entity
console.log(window.hass?.states['light.bedroom'])

// Test a service call
window.hass?.callService('light', 'toggle', { entity_id: 'light.bedroom' })
```

## Best Practices

1. **Always handle errors:** Service calls can fail (timeout, permission, entity not found)
2. **Show loading states:** Disable buttons while a service is being called
3. **Debounce rapid calls:** If a user clicks a button multiple times, debounce to avoid flooding HA
4. **Batch operations:** If toggling multiple lights, consider grouping them into one automation/scene instead
5. **Validate entity IDs:** Check that entities exist before calling services
6. **Log API calls:** For debugging, log all service calls and their responses

## Troubleshooting

**"Service call failed: No HA source provided"**
- Check that HassProvider wraps your component
- Verify hass is not null (add debug logs)

**"Entity not found" or "Unknown service"**
- Verify the entity ID is correct (case-sensitive)
- Check that the service domain and service name are correct
- Look at HA Developer Tools → States and Services to validate

**Service calls work locally but fail when embedded in HA**
- Ensure `hass` object is being passed from HA panel
- Check that `embed_iframe: true` is set in `configuration.yaml`
- Verify the token/permissions allow the service call
