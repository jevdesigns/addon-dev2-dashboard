import React, {useEffect, useState, useRef} from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

import EntityList from './EntityList'
import Charts from './Charts'
  const [connStatus, setConnStatus] = useState(null)
import SettingsDialog from './Settings'

import {connectHAWebSocket} from '../api/websocket'
import {saveEntityState, getEntityHistory, listEntities, exportAll, getSettings} from '../storage/localStore'
import {DEFAULT_WS_URL, DEFAULT_TOKEN} from '../config'

export default function Dashboard(){
  const [entities, setEntities] = useState([])
  const [selected, setSelected] = useState(null)
  const [history, setHistory] = useState([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const connRef = useRef(null)
      const conn = connectHAWebSocket({
        url: wsUrl,
        accessToken: token,
        onStatus: (s) => setConnStatus(s),
        onOpen: () => console.log('ws open'),
        onEvent: async (ev) => {
      // load stored entities
      const keys = await listEntities()
      if (mounted) setEntities(keys)

      // load runtime settings then connect
      const s = await getSettings()
      const wsUrl = s.wsUrl || DEFAULT_WS_URL
      const token = s.token || DEFAULT_TOKEN

      const conn = connectHAWebSocket({
        url: wsUrl,
        accessToken: token,
        onOpen: () => console.log('ws open'),
        onEvent: async (ev) => {
          if (ev.event_type === 'state_changed' && ev.data && ev.data.entity_id){
            const id = ev.data.entity_id
            await saveEntityState(id, ev.data.new_state || ev.data)
            setEntities(prev => Array.from(new Set([...prev, id])))
            if (selected === id){
              const h = await getEntityHistory(id)
              setHistory(h)
            }
          }
        }
      })
      connRef.current = conn
    }

    init()

    return () => { mounted = false; if (connRef.current) connRef.current.close() }
  }, [])

  useEffect(()=>{
    if (!selected) return
    ;(async ()=>{
      const h = await getEntityHistory(selected)
      setHistory(h)
    })()
  }, [selected])

  const handleExport = async () => {
    const all = await exportAll()
    const blob = new Blob([JSON.stringify(all, null, 2)], {type: 'application/json'})
    const conn = connectHAWebSocket({
      url: wsUrl,
      accessToken: token,
      onStatus: (s) => setConnStatus(s),
      onOpen: () => console.log('ws re-opened'),
      onEvent: async (ev) => {
        if (ev.event_type === 'state_changed' && ev.data && ev.data.entity_id){
          const id = ev.data.entity_id
          await saveEntityState(id, ev.data.new_state || ev.data)
          setEntities(prev => Array.from(new Set([...prev, id])))
          if (selected === id){
            const h = await getEntityHistory(id)
            setHistory(h)
          }
        }
      }
    })
    connRef.current = conn
      url: wsUrl,
      accessToken: token,
      onOpen: () => console.log('ws re-opened'),
      onEvent: async (ev) => {
        if (ev.event_type === 'state_changed' && ev.data && ev.data.entity_id){
          const id = ev.data.entity_id
          await saveEntityState(id, ev.data.new_state || ev.data)
          setEntities(prev => Array.from(new Set([...prev, id])))
          if (selected === id){
            const h = await getEntityHistory(id)
            setHistory(h)
          }
        }
      }
    })
    connRef.current = conn
  }

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>D522 React Dashboard</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Paper sx={{p:2}}>
            <Typography variant="subtitle1">Entities</Typography>
            <EntityList entities={entities} onSelect={setSelected} />
            <Button variant="outlined" onClick={handleOpenSettings} sx={{mt:2, mr:1}}>Settings</Button>
            <Button variant="outlined" onClick={handleExport} sx={{mt:2}}>Export Local Data</Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          <Paper sx={{p:2}}>
            <Typography variant="subtitle1">Selected: {selected || '—'}</Typography>
            {selected && <Charts points={history} />}
            {!selected && <Typography sx={{mt:2}}>Select an entity to view history.</Typography>}
          </Paper>
        </Grid>
      </Grid>
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} onSaved={handleSettingsSaved} />
    </Box>
  )
}
