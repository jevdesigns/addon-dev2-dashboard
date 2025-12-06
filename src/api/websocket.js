// Minimal Home Assistant WebSocket helper
// connectHAWebSocket with automatic reconnect/backoff and connection status
export function connectHAWebSocket({url, accessToken, onOpen, onEvent, onClose, onError, onStatus}){
  let ws = null
  let closedByUser = false
  let nextId = 1
  let attempt = 0
  let reconnectTimer = null

  const maxBackoff = 30000 // 30s

  function setStatus(s){ if (onStatus) onStatus(s) }

  function connect(){
    setStatus('connecting')
    ws = new WebSocket(url)

    ws.addEventListener('open', () => {
      attempt = 0
      setStatus('connected')
      if (onOpen) onOpen()
    })

    ws.addEventListener('message', (evt) => {
      let data
      try { data = JSON.parse(evt.data) } catch(e) { return }

      if (data.type === 'auth_required'){
        ws.send(JSON.stringify({type: 'auth', access_token: accessToken}))
        return
      }

      if (data.type === 'auth_ok'){
        // subscribe to all state_changed events
        const id = nextId++
        ws.send(JSON.stringify({id, type: 'subscribe_events', event_type: 'state_changed'}))
        return
      }

      // forwarded event
      if (data.type === 'event' && data.event){
        if (onEvent) onEvent(data.event)
      }
    })

    ws.addEventListener('close', (e) => {
      if (onClose) onClose(e)
      if (closedByUser){
        setStatus('closed')
        return
      }
      // schedule reconnect
      attempt++
      const backoff = Math.min(1000 * Math.pow(2, attempt), maxBackoff)
      setStatus('reconnecting')
      reconnectTimer = setTimeout(() => connect(), backoff)
    })

    ws.addEventListener('error', (e) => {
      if (onError) onError(e)
      setStatus('error')
    })
  }

  // start immediately
  connect()

  return {
    close: () => { closedByUser = true; if (reconnectTimer) clearTimeout(reconnectTimer); if (ws) ws.close(); setStatus('closed') },
    send: (obj) => { try { ws && ws.send(JSON.stringify(obj)) } catch(e) { console.warn('ws send failed', e) } },
    reconnect: () => { try { if (ws) ws.close(); closedByUser = false; if (reconnectTimer) clearTimeout(reconnectTimer); attempt = 0; connect(); } catch(e){} },
    status: () => { return ws && ws.readyState },
  }
}
