import { mountPanel, unmountPanel } from './panel-entry'

class HaPanelDev2 extends HTMLElement {
  constructor() {
    super()
    this._root = this.attachShadow({ mode: 'open' })
    this._mounted = false
  }

  connectedCallback() {
    if (this._mounted) return
    this._mounted = true

    const container = document.createElement('div')
    container.id = 'd522-panel-root'
    this._root.appendChild(container)

    // HA passes `hass` as a property on the element when used as a panel
    const props = {}
    if (this.hass) {
      props.hass = this.hass
    } else if (window.hass) {
      // Fallback: if global window.hass is available (e.g., during development), use it
      props.hass = window.hass
    }

    mountPanel(container, props)

    // If hass is available, also watch for hass updates (real-time property changes)
    // HA will update this.hass when panel is attached and state changes
    if (this.hass) {
      // Re-mount if hass changes significantly (optional, for advanced use)
      // For now, single mount is sufficient
    }
  }

  disconnectedCallback() {
    unmountPanel()
    this._mounted = false
  }

  // HA calls this setter when it wants to update the hass object on the panel
  set hass(hass) {
    this._hass = hass
  }

  get hass() {
    return this._hass
  }
}

if (!customElements.get('ha-panel-dev2')) {
  customElements.define('ha-panel-dev2', HaPanelDev2)
}
