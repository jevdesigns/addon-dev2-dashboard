import React, {useEffect, useState} from 'react'
import {Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, List, ListItem, ListItemText} from '@mui/material'
import { getSettings, saveSettings } from '../storage/localStore'

export default function OnboardingModal({ open: propOpen, onClose }){
  const [open, setOpen] = useState(false)

  useEffect(()=>{
    let mounted = true
    ;(async()=>{
      const s = await getSettings()
      if (!mounted) return
      if (propOpen === true) setOpen(true)
      else if (!s || !s.seenOnboarding) setOpen(true)
    })()
    return ()=>{ mounted = false }
  }, [propOpen])

  useEffect(()=>{
    const handler = () => setOpen(true)
    window.addEventListener('app:showOnboarding', handler)
    return () => window.removeEventListener('app:showOnboarding', handler)
  }, [])

  const closeAndMaybeHide = async (hide=false) => {
    if (hide){
      const s = (await getSettings()) || {}
      s.seenOnboarding = true
      await saveSettings(s)
    }
    setOpen(false)
    if (onClose) onClose()
  }

  return (
    <Dialog open={open} onClose={()=>closeAndMaybeHide(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Welcome — Quick Start</DialogTitle>
      <DialogContent dividers>
        <Typography paragraph>
          This dashboard runs as a static Home Assistant panel. A few tips to get you started:
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="1. Enter Home Assistant connection" secondary="Open Settings (gear) and paste your WebSocket URL and long-lived token to connect to your instance." />
          </ListItem>
          <ListItem>
            <ListItemText primary="2. Add widgets from the Palette" secondary="Drag widgets from the left Palette into the dashboard area. You can insert between items or drop into empty space." />
          </ListItem>
          <ListItem>
            <ListItemText primary="3. Configure widgets" secondary="Click a widget's settings (gear) to bind it to an entity, set title and timeframe." />
          </ListItem>
          <ListItem>
            <ListItemText primary="4. Resize & layout" secondary="Use the colspan toggle or keyboard shortcuts to change size. Widgets use grid units (row/column spans)." />
          </ListItem>
          <ListItem>
            <ListItemText primary="5. Keyboard shortcuts" secondary="Try Ctrl+ArrowUp/Down to move, Ctrl+Plus/Minus to change height, Ctrl+Shift+Arrow to toggle width." />
          </ListItem>
        </List>
        <Typography variant="caption" color="textSecondary">
          You can re-open this guide anytime from Settings.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={()=>closeAndMaybeHide(true)}>Got it</Button>
        <Button onClick={()=>closeAndMaybeHide(true)} variant="contained">Don't show again</Button>
      </DialogActions>
    </Dialog>
  )
}
