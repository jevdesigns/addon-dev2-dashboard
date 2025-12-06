import React, {useEffect, useState} from 'react'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

export default function PublishedList(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchList = async () => {
    setLoading(true)
    try{
      const token = (window.d522_debug && window.d522_debug.getSettings) ? (await window.d522_debug.getSettings()).token : (import.meta.env.VITE_HA_TOKEN || '')
      const res = await fetch('http://localhost:5000/published', { headers: { authorization: `Bearer ${token}` } })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'failed')
      setItems(j)
    }catch(e){ console.error(e); setItems([]) }
    setLoading(false)
  }

  useEffect(()=>{ fetchList() }, [])

  const setLatest = async (id) => {
    try{
      const token = (window.d522_debug && window.d522_debug.getSettings) ? (await window.d522_debug.getSettings()).token : (import.meta.env.VITE_HA_TOKEN || '')
      const res = await fetch('http://localhost:5000/set-latest', { method:'POST', headers:{ 'content-type':'application/json', authorization:`Bearer ${token}` }, body: JSON.stringify({ id }) })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'set-latest failed')
      alert('Set as kiosk-latest: ' + id)
      fetchList()
    }catch(e){ console.error(e); alert('Failed: '+e.message) }
  }

  return (
    <Box sx={{mt:2}}>
      <Typography variant="subtitle1">Published Kiosks</Typography>
      <List dense>
        {items.map(it => (
          <ListItem key={it.id} divider>
            <ListItemText primary={it.title || it.id} secondary={it.publishedAt || ''} />
            <ListItemSecondaryAction>
              <Button size="small" onClick={()=>setLatest(it.id)}>Set as kiosk-latest</Button>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <Button size="small" onClick={fetchList} disabled={loading}>Refresh</Button>
    </Box>
  )
}
