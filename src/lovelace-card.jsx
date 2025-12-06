/**
 * Dev2 React Dashboard - Lovelace Custom Card
 * 
 * This Web Component wrapper integrates the React app with Home Assistant Lovelace.
 * It receives the hass object from Lovelace and passes it down to React components.
 * 
 * RENDERING FLOW:
 * 1. Lovelace creates <dev2-react-dashboard> element
 * 2. connectedCallback() creates Shadow DOM for CSS isolation
 * 3. set hass(hass) is called with HA connection
 * 4. renderReactApp() mounts React component tree
 * 5. React renders <App> wrapped in <HassProvider>
 * 6. Dashboard displays with full HA integration
 * 
 * SHADOW DOM: All styles are isolated and won't leak to HA UI
 */

import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { HassProvider } from './contexts/HassContext'
import './index.css'

class Dev2ReactDashboard extends HTMLElement {
  constructor() {
    super()
    this._reactRoot = null
    this._hass = null
    this._config = null
    this._initialized = false
    this._shadowRoot = null
  }

  /**
   * Lifecycle: Called when element is added to the DOM
   * Creates Shadow DOM for CSS isolation and React root
   */
  connectedCallback() {
    // Only initialize once
    if (this._initialized) {
      return
    }
    this._initialized = true

    // Step 1: Create Shadow DOM for CSS isolation
    // This ensures all styles are scoped to this component
    // and won't leak to or be affected by Home Assistant styles
    if (!this.shadowRoot) {
      this._shadowRoot = this.attachShadow({ mode: 'open' })
    } else {
      this._shadowRoot = this.shadowRoot
    }

    // Step 2: Create a container div inside the Shadow Root
    // React will render into this isolated container
    const container = document.createElement('div')
    container.id = 'dev2-react-root'
    container.style.cssText = `
      display: block;
      height: 100%;
      width: 100%;
      padding: 0;
      margin: 0;
      overflow: auto;
    `
    
    // Append container to Shadow Root
    this._shadowRoot.appendChild(container)

    // Step 3: Create React root using the Shadow DOM container
    // createRoot(container) renders React into the isolated Shadow DOM
    if (!this._reactRoot) {
      this._reactRoot = createRoot(container)
      this.renderReactApp()
    }
  }

  /**
   * Lovelace Interface: Receives configuration from dashboard YAML
   * Called when the card is initialized with its config
   * 
   * Example YAML config:
   * type: custom:dev2-react-dashboard
   * title: My Dashboard
   * theme: dark
   * 
   * @param {Object} config - Configuration object from dashboard
   */
  setConfig(config) {
    this._config = config
    // Re-render if root exists to apply new config
    if (this._reactRoot) {
      this.renderReactApp()
    }
  }

  /**
   * Critical Lovelace Hook: Receives the Home Assistant connection object
   * This setter is called by Lovelace whenever state changes
   * Automatically triggers re-render with new hass data
   * 
   * @param {Object} hass - Home Assistant object containing:
   *   - states: All entity states { entity_id: { state, attributes } }
   *   - callService: Function to call HA services
   *   - conn: WebSocket connection object
   */
  set hass(hass) {
    this._hass = hass
    // Re-render React component whenever hass updates
    if (this._reactRoot) {
      this.renderReactApp()
    }
  }

  /**
   * Render the React app with current hass and config
   * This is called whenever hass updates or config changes
   * Uses React 18's createRoot API for optimal rendering
   */
  renderReactApp() {
    // Only render if we have both the root and the hass object
    if (this._reactRoot && this._hass) {
      // Wrap App in React.StrictMode for development checks
      // Pass hass and config as props to the top-level App component
      this._reactRoot.render(
        <React.StrictMode>
          <HassProvider hass={this._hass}>
            <App config={this._config} />
          </HassProvider>
        </React.StrictMode>
      )
    } else if (!this._hass) {
      // Show loading state while waiting for hass object
      if (this._reactRoot) {
        this._reactRoot.render(
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            <p>Loading dashboard...</p>
          </div>
        )
      }
    }
  }

  /**
   * Cleanup when element is removed from DOM
   * Unmounts React to prevent memory leaks
   */
  disconnectedCallback() {
    if (this._reactRoot) {
      try {
        this._reactRoot.unmount()
      } catch (err) {
        console.warn('Error unmounting React root:', err)
      }
      this._reactRoot = null
      this._initialized = false
    }
  }

  /**
   * Get the hass object (optional, for external access)
   * @returns {Object} The Home Assistant connection object
   */
  get hass() {
    return this._hass
  }
}

// Register the custom element
if (!customElements.get('dev2-react-dashboard')) {
  customElements.define('dev2-react-dashboard', Dev2ReactDashboard)
}
