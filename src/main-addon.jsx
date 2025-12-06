/**
 * Dev2 React Dashboard - Add-on Version (Ingress)
 * 
 * This is the main entry point for the add-on version that runs via ingress.
 * Unlike the Lovelace card version, this creates its own Home Assistant connection
 * using the ingress proxy path.
 * 
 * CONNECTION FLOW:
 * 1. App loads in iframe via ingress (http://homeassistant.local:8123/api/hassio_ingress/...)
 * 2. Detect ingress environment and build WebSocket URL
 * 3. Connect to HA WebSocket API through ingress proxy
 * 4. Receive hass object with full state and service access
 * 5. Render React dashboard with real-time updates
 */

import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { HassProvider } from './contexts/HassContext'
import { IngressConnection } from './utils/ingress-connection'
import './index.css'

// Main application wrapper for ingress mode
class IngressApp extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hass: null,
      connected: false,
      error: null,
      connectionStatus: 'connecting'
    }
    this.connection = null
  }

  async componentDidMount() {
    try {
      // Initialize Home Assistant connection through ingress
      this.connection = new IngressConnection()
      
      // Set up event handlers
      this.connection.on('connected', (hass) => {
        this.setState({
          hass,
          connected: true,
          connectionStatus: 'connected',
          error: null
        })
      })

      this.connection.on('state-changed', (hass) => {
        this.setState({ hass })
      })

      this.connection.on('disconnected', () => {
        this.setState({
          connected: false,
          connectionStatus: 'disconnected'
        })
      })

      this.connection.on('error', (error) => {
        this.setState({
          error: error.message,
          connectionStatus: 'error'
        })
      })

      // Start the connection
      await this.connection.connect()
    } catch (err) {
      console.error('Failed to initialize ingress connection:', err)
      this.setState({
        error: err.message,
        connectionStatus: 'error'
      })
    }
  }

  componentWillUnmount() {
    if (this.connection) {
      this.connection.disconnect()
    }
  }

  render() {
    const { hass, connected, error, connectionStatus } = this.state

    // Show loading state
    if (connectionStatus === 'connecting') {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }} />
            <p style={{ color: '#666', fontSize: '16px' }}>Connecting to Home Assistant...</p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      )
    }

    // Show error state
    if (error || connectionStatus === 'error') {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '500px', padding: '20px' }}>
            <h2 style={{ color: '#e74c3c', marginBottom: '10px' }}>Connection Error</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              {error || 'Failed to connect to Home Assistant'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry Connection
            </button>
          </div>
        </div>
      )
    }

    // Show disconnected state
    if (!connected) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#f39c12', fontSize: '16px' }}>Disconnected from Home Assistant</p>
            <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>Attempting to reconnect...</p>
          </div>
        </div>
      )
    }

    // Render the main app with hass connection
    return (
      <React.StrictMode>
        <HassProvider hass={hass}>
          <App config={{}} />
        </HassProvider>
      </React.StrictMode>
    )
  }
}

// Mount the app
const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<IngressApp />)
} else {
  console.error('Root element not found')
}
