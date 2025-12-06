import React, {useState, useRef} from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export default function Designer({open, onClose}){
  const [code, setCode] = useState('<!doctype html>\n<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>\n<h1>D522 Preview</h1>\n<p>Paste your HTML/JS/CSS here and preview.</p>\n</body></html>')
  const iframeRef = useRef(null)
  const [publishing, setPublishing] = useState(false)

  const updatePreview = () => {
    const doc = iframeRef.current && iframeRef.current.contentWindow && iframeRef.current.contentWindow.document
    if (doc){ doc.open(); doc.write(code); doc.close() }
  }

  const handleExport = () => {
    const blob = new Blob([code], {type:'text/html'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'd522-publish.html'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handlePublish = async () => {
    setPublishing(true)
    try{
      const id = `kiosk-${Date.now()}`
      const title = id
      const body = { id, title, html: code, kiosk: true }
      const token = (window.d522_debug && window.d522_debug.getSettings) ? (await window.d522_debug.getSettings()).token : (import.meta.env.VITE_HA_TOKEN || '')
      const res = await fetch('http://localhost:5000/publish',{method:'POST',headers:{'content-type':'application/json', 'authorization': `Bearer ${token}`}, body: JSON.stringify(body)})
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'publish failed')
      alert('Published: ' + JSON.stringify(j.meta))
      onClose()
    }catch(e){
      console.error(e); alert('Publish failed: '+e.message)
    }finally{ setPublishing(false) }
  }

  return (
    <Dialog open={open} fullWidth maxWidth="lg" onClose={onClose}>
      <DialogTitle>Design / Preview</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{mb:1}}>Paste HTML/CSS/JS here. Preview updates when clicking <b>Update Preview</b>.</Typography>
        <Box sx={{display:'flex', gap:2}}>
          <TextField multiline minRows={20} value={code} onChange={(e)=>setCode(e.target.value)} fullWidth sx={{flex:1}} />
          <Box sx={{width: '50%'}}>
            <iframe title="preview" ref={iframeRef} style={{width:'100%',height:600,border:'1px solid #ddd'}} />
            <Box sx={{display:'flex', gap:1, mt:1}}>
              <Button variant="outlined" onClick={updatePreview}>Update Preview</Button>
              <Button variant="outlined" onClick={handleExport}>Export HTML</Button>
              <Button variant="contained" disabled={publishing} onClick={handlePublish}>Publish (kiosk)</Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
