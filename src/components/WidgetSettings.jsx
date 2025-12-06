import React, {useState, useEffect} from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export default function WidgetSettings({open, onClose, widget, onSave, entities}){
  const [title, setTitle] = useState('')
  const [timeframe, setTimeframe] = useState('24h')
  const [entityId, setEntityId] = useState('')

  useEffect(()=>{
    if (!widget) return
    setTitle(widget.title || '')
    setTimeframe(widget.timeframe || '24h')
    setEntityId(widget.entityId || '')
  }, [widget])

  const handleSave = () => {
    if (onSave) onSave({...widget, title: title.trim(), timeframe: timeframe.trim(), entityId: entityId || null})
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Widget Settings</DialogTitle>
      <DialogContent>
        <TextField label="Title" value={title} onChange={e=>setTitle(e.target.value)} fullWidth margin="normal" />
        <TextField label="Timeframe" value={timeframe} onChange={e=>setTimeframe(e.target.value)} fullWidth margin="normal" />
        <TextField
          label="Bound Entity ID"
          value={entityId}
          onChange={e=>setEntityId(e.target.value)}
          fullWidth
          margin="normal"
          placeholder="e.g. sensor.temperature_livingroom"
        />
        <Box sx={{display:'flex', gap:1, mt:1}}>
          <TextField label="Column Span" type="number" value={widget?.colspan||1} onChange={e=>{ /* handled on save */ }} disabled fullWidth />
          <TextField label="Row Span" type="number" value={widget?.rowSpan||1} onChange={e=>{ /* handled on save */ }} disabled fullWidth />
        </Box>
        {entities && (
          <Box sx={{mt:1}}>
            <Typography variant="caption">Recent Entities (click to choose)</Typography>
            <Box sx={{display:'flex', flexWrap:'wrap', gap:1, mt:1}}>
              {entities.slice(0,12).map(en => (
                <Button key={en} size="small" onClick={()=>setEntityId(en)}>{en}</Button>
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  )
}
