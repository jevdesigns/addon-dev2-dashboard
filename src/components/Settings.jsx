import React, {useState, useEffect} from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import {getSettings, saveSettings} from '../storage/localStore'
import DiagnosticsDialog from './DiagnosticsDialog'

export default function SettingsDialog({open, onClose, onSaved}){
  const [wsUrl, setWsUrl] = useState('')
  const [token, setToken] = useState('')
  const [diagOpen, setDiagOpen] = useState(false)

  // Support Vite environment defaults for development
  const envWs = import.meta.env.VITE_HA_WS || ''
  const envToken = import.meta.env.VITE_HA_TOKEN || ''

  useEffect(()=>{
    if (!open) return
    ;(async ()=>{
      const s = await getSettings()
      // If served under Home Assistant's /local/ path, default to relative websocket
      const isServedUnderLocal = typeof window !== 'undefined' && window.location && window.location.pathname && window.location.pathname.startsWith('/local')
      const defaultWs = s.wsUrl || envWs || (isServedUnderLocal ? '/api/websocket' : '')
      const defaultToken = s.token || envToken || ''
      setWsUrl(defaultWs)
      setToken(defaultToken)
    })()
  }, [open])

  const handleSave = async () => {
    await saveSettings({wsUrl: wsUrl.trim(), token: token.trim()})
    if (onSaved) onSaved()
    onClose()
  }

  const handleShowOnboarding = async () => {
    const s = (await getSettings()) || {}
    s.seenOnboarding = false
    await saveSettings(s)
    try{ window.dispatchEvent(new Event('app:showOnboarding')) }catch(e){ console.warn(e) }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <TextField
          label="WebSocket URL"
          value={wsUrl}
          onChange={e => setWsUrl(e.target.value)}
          fullWidth
          margin="normal"
          placeholder="ws://homeassistant.local:8123/api/websocket"
        />
        <TextField
          label="Long-Lived Access Token"
          value={token}
          onChange={e => setToken(e.target.value)}
          fullWidth
          margin="normal"
          placeholder="PASTE_TOKEN_HERE"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={()=>setDiagOpen(true)}>Diagnostics</Button>
        <Button onClick={handleShowOnboarding}>Show Onboarding</Button>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>Save</Button>
      </DialogActions>
      <DiagnosticsDialog open={diagOpen} onClose={()=>setDiagOpen(false)} />
    </Dialog>
  )
}
