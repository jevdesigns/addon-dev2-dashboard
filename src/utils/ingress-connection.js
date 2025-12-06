/**
 * Ingress Connection Handler
 * 
 * Establishes and manages WebSocket connection to Home Assistant
 * through the ingress proxy. This allows the add-on to communicate
 * with HA without requiring authentication tokens.
 */

export class IngressConnection {
  constructor() {
    this.ws = null
    this.hass = null
    this.messageId = 1
    this.pendingMessages = new Map()
    this.eventListeners = new Map()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 10
    this.reconnectDelay = 3000
  }

  /**
   * Register event listener
   * Events: 'connected', 'disconnected', 'state-changed', 'error'
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event).push(callback)
  }

  /**
   * Emit event to all registered listeners
   */
  emit(event, data) {
    const listeners = this.eventListeners.get(event) || []
    listeners.forEach(callback => callback(data))
  }

  /**
   * Build WebSocket URL for ingress connection
   * Ingress provides access through the current document location
   */
  getWebSocketUrl() {
    // When running through ingress, use relative WebSocket path
    // Home Assistant ingress proxy will handle the connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    
    // Use the ingress WebSocket endpoint
    // The ingress proxy automatically handles authentication
    return `${protocol}//${host}/api/websocket`
  }

  /**
   * Connect to Home Assistant WebSocket API
   */
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.getWebSocketUrl()
        console.log('Connecting to Home Assistant via ingress:', wsUrl)
        
        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          console.log('WebSocket connection opened')
        }

        this.ws.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data), resolve, reject)
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          this.emit('error', { message: 'WebSocket connection error' })
          reject(error)
        }

        this.ws.onclose = () => {
          console.log('WebSocket connection closed')
          this.emit('disconnected', null)
          this.attemptReconnect()
        }
      } catch (err) {
        console.error('Failed to create WebSocket:', err)
        this.emit('error', { message: err.message })
        reject(err)
      }
    })
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(message, resolve, reject) {
    console.log('Received message:', message.type)

    // Handle authentication phase
    if (message.type === 'auth_required') {
      console.log('Auth required - ingress should handle this automatically')
      // For ingress, we don't need to send auth token
      // The proxy handles authentication
      // Just send auth with empty token to proceed
      this.sendMessage({
        type: 'auth',
        access_token: ''
      })
      return
    }

    if (message.type === 'auth_ok') {
      console.log('Authentication successful via ingress')
      this.reconnectAttempts = 0
      // Subscribe to state changes
      this.subscribeToStates(resolve, reject)
      return
    }

    if (message.type === 'auth_invalid') {
      console.error('Authentication failed:', message.message)
      this.emit('error', { message: 'Authentication failed' })
      reject(new Error(message.message))
      return
    }

    // Handle response to our messages
    if (message.id && this.pendingMessages.has(message.id)) {
      const { resolve: msgResolve, reject: msgReject } = this.pendingMessages.get(message.id)
      this.pendingMessages.delete(message.id)

      if (message.success !== false) {
        msgResolve(message.result)
      } else {
        msgReject(new Error(message.error?.message || 'Request failed'))
      }
      return
    }

    // Handle event messages
    if (message.type === 'event') {
      this.handleEvent(message.event)
      return
    }

    // Handle result messages
    if (message.type === 'result' && message.success) {
      // This might be the initial state
      if (message.result && Array.isArray(message.result)) {
        this.updateStates(message.result)
      }
    }
  }

  /**
   * Subscribe to Home Assistant state changes
   */
  async subscribeToStates(resolve, reject) {
    try {
      // Get initial states
      const states = await this.sendMessagePromise({
        type: 'get_states'
      })

      // Initialize hass object
      this.hass = {
        states: this.statesArrayToObject(states),
        callService: this.callService.bind(this),
        connected: true
      }

      // Subscribe to state changes
      await this.sendMessagePromise({
        type: 'subscribe_events',
        event_type: 'state_changed'
      })

      console.log('Subscribed to state changes, initial state count:', Object.keys(this.hass.states).length)
      this.emit('connected', this.hass)
      resolve(this.hass)
    } catch (err) {
      console.error('Failed to subscribe to states:', err)
      this.emit('error', { message: err.message })
      reject(err)
    }
  }

  /**
   * Convert states array to object keyed by entity_id
   */
  statesArrayToObject(statesArray) {
    const statesObj = {}
    statesArray.forEach(state => {
      statesObj[state.entity_id] = state
    })
    return statesObj
  }

  /**
   * Handle state_changed events
   */
  handleEvent(event) {
    if (event.event_type === 'state_changed') {
      const { entity_id, new_state } = event.data
      if (this.hass && new_state) {
        this.hass.states[entity_id] = new_state
        this.emit('state-changed', this.hass)
      }
    }
  }

  /**
   * Update multiple states
   */
  updateStates(states) {
    if (this.hass) {
      this.hass.states = this.statesArrayToObject(states)
      this.emit('state-changed', this.hass)
    }
  }

  /**
   * Call a Home Assistant service
   */
  async callService(domain, service, serviceData = {}) {
    return this.sendMessagePromise({
      type: 'call_service',
      domain,
      service,
      service_data: serviceData
    })
  }

  /**
   * Send message and get promise for response
   */
  sendMessagePromise(message) {
    return new Promise((resolve, reject) => {
      const id = this.messageId++
      this.pendingMessages.set(id, { resolve, reject })
      
      this.sendMessage({
        id,
        ...message
      })

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingMessages.has(id)) {
          this.pendingMessages.delete(id)
          reject(new Error('Request timeout'))
        }
      }, 30000)
    })
  }

  /**
   * Send message over WebSocket
   */
  sendMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.error('Cannot send message: WebSocket not open')
    }
  }

  /**
   * Attempt to reconnect after disconnect
   */
  async attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached')
      this.emit('error', { message: 'Failed to reconnect to Home Assistant' })
      return
    }

    this.reconnectAttempts++
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)

    setTimeout(async () => {
      try {
        await this.connect()
      } catch (err) {
        console.error('Reconnect failed:', err)
      }
    }, this.reconnectDelay)
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.hass = null
    this.pendingMessages.clear()
  }
}
