import React, {useEffect, useState} from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'

import { getSettings, listEntities, exportAll } from '../storage/localStore'

export default function DiagnosticsDialog({ open, onClose }){
  const [status, setStatus] = useState(null)
  const [settings, setSettings] = useState(null)
  const [entities, setEntities] = useState([])
  const [loading, setLoading] = useState(false)
  const firstRef = React.useRef(null)

  async function refreshAll(){
    setLoading(true)
    try{
      const s = await getSettings()
      setSettings(s)
      const es = await listEntities()
      setEntities(es)
      const dbg = window.d522_debug
      if (dbg && dbg.getStatus) setStatus(await dbg.getStatus())
      else setStatus(null)
    }catch(e){ console.warn('diag refresh failed', e) }
    setLoading(false)
  }

  useEffect(()=>{ if (open) { refreshAll(); setTimeout(()=>{ try{ firstRef.current && firstRef.current.focus() }catch(e){} }, 50) } }, [open])

  const handleReconnect = () => {
    try{ window.d522_debug && window.d522_debug.reconnect && window.d522_debug.reconnect() }catch(e){ console.warn(e) }
    setTimeout(()=>{ if (window.d522_debug && window.d522_debug.getStatus) setStatus(window.d522_debug.getStatus()) }, 500)
  }

  const handleKey = (e) => {
    // keyboard shortcuts: Ctrl+R refresh, Ctrl+Shift+R reconnect, Ctrl+E export, Esc close
    if (e.ctrlKey && !e.shiftKey && (e.key === 'r' || e.key === 'R')){ e.preventDefault(); refreshAll(); }
    if (e.ctrlKey && e.shiftKey && (e.key === 'R')){ e.preventDefault(); handleReconnect(); }
    if (e.ctrlKey && (e.key === 'e' || e.key === 'E')){ e.preventDefault(); handleExport(); }
    if (e.key === 'Escape'){ e.preventDefault(); onClose && onClose() }
  }

  const handleExport = async () => {
    const all = await exportAll()
    const blob = new Blob([JSON.stringify(all, null, 2)], {type: 'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'd522-diagnostics-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={!!open} onClose={onClose} maxWidth="md" fullWidth onKeyDown={handleKey} aria-labelledby="diag-title" role="dialog">
      <DialogTitle id="diag-title">Diagnostics</DialogTitle>
      <DialogContent dividers>
        <Box sx={{display:'flex', gap:2, mb:2}}>
          <Box sx={{flex:1}}>
            <Typography variant="subtitle2">Connection Status</Typography>
            <Typography aria-live="polite">{String(status)}</Typography>
          </Box>
          <Box sx={{flex:3}}>
            <Typography variant="subtitle2">Saved Settings</Typography>
            <pre style={{whiteSpace:'pre-wrap', maxHeight:200, overflow:'auto'}} tabIndex={0} ref={firstRef}>{settings ? JSON.stringify(settings, null, 2) : '—'}</pre>
          </Box>
        </Box>

        <Typography variant="subtitle2">Entities ({entities.length})</Typography>
        <List dense sx={{maxHeight:240, overflow:'auto'}} role="list" aria-label="entities-list">
          {entities.map(e => (
            <ListItem key={e} role="listitem"><ListItemText primary={e} /></ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={refreshAll} disabled={loading} aria-label="refresh diagnostics">Refresh</Button>
        <Button onClick={handleReconnect} aria-label="reconnect websocket">Reconnect</Button>
        <Button onClick={handleExport} aria-label="export database">Export DB</Button>
        <Button onClick={onClose} aria-label="close diagnostics">Close</Button>
      </DialogActions>
    </Dialog>
  )
}
