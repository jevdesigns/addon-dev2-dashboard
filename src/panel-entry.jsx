import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { HassProvider } from './contexts/HassContext'

let root = null

export function mountPanel(container, props = {}) {
  if (!container) return
  
  // Extract hass from props or fall back to global window.hass (set by HA panel)
  const hass = props.hass || window.hass
  
  root = createRoot(container)
  root.render(
    React.createElement(React.StrictMode, null, 
      React.createElement(HassProvider, { hass },
        React.createElement(App, props)
      )
    )
  )
}

export function unmountPanel() {
  if (root) {
    root.unmount()
    root = null
  }
}
