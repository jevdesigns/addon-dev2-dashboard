import React from 'react'

/**
 * HassContext
 * Provides the Home Assistant hass object (or fallback WebSocket connection) to all components
 * via useHass() hook
 */
const HassContext = React.createContext(null)

export function HassProvider({ children, hass }) {
  return <HassContext.Provider value={hass}>{children}</HassContext.Provider>
}

export function useHass() {
  const hass = React.useContext(HassContext)
  if (!hass) {
    console.warn('useHass() called but no HassContext.Provider found in component tree')
  }
  return hass
}
