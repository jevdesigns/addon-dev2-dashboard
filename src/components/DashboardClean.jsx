import React, {useEffect, useState, useRef, Suspense} from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

import EntityList from './EntityList'
const Charts = React.lazy(() => import('./Charts'))
import SettingsDialog from './Settings'
import SortableGrid from './SortableGrid'
import ConnectionStatus from './ConnectionStatus'
import Palette from './Palette'
import WidgetSettings from './WidgetSettings'
import OnboardingModal from './OnboardingModal'
import PublishedList from './PublishedList'
import Designer from './Designer'

import {connectHAWebSocket} from '../api/websocket'
import {saveEntityState, getEntityHistory, listEntities, exportAll, getSettings, saveSettings} from '../storage/localStore'
import {DEFAULT_WS_URL, DEFAULT_TOKEN} from '../config'

export default function Dashboard(){
  const [entities, setEntities] = useState([])
  const [selected, setSelected] = useState(null)
  const [history, setHistory] = useState([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [connStatus, setConnStatus] = useState(null)
  const connRef = useRef(null)
  const [widgets, setWidgets] = useState([{id: 'chart-1', type: 'chart'}])

  useEffect(() => {
    let mounted = true

    async function init(){
      const keys = await listEntities()
      if (mounted) setEntities(keys)

      const s = await getSettings()
      const wsUrl = s.wsUrl || DEFAULT_WS_URL
      const token = s.token || DEFAULT_TOKEN
      if (s.widgets && Array.isArray(s.widgets)) setWidgets(s.widgets)

      const conn = connectHAWebSocket({
        url: wsUrl,
        accessToken: token,
        onStatus: (s) => setConnStatus(s),
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
      // expose a small debug helper to the window so testers can inspect connection and storage
      try{
        window.d522_debug = {
          getConn: () => connRef.current,
          getStatus: () => connRef.current ? (connRef.current.status ? connRef.current.status() : null) : null,
          reconnect: () => connRef.current && connRef.current.reconnect && connRef.current.reconnect(),
          getSettings: getSettings,
          saveSettings: saveSettings,
          listEntities: listEntities,
          exportAll: exportAll
        }
      }catch(e){ console.warn('debug expose failed', e) }
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
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'd522-dashboard-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const [widgetSettingsOpen, setWidgetSettingsOpen] = useState(false)
  const [activeWidget, setActiveWidget] = useState(null)
  const [designerOpen, setDesignerOpen] = useState(false)

  const openWidgetSettings = (widget) => { setActiveWidget(widget); setWidgetSettingsOpen(true) }

  const handleWidgetSaved = async (updated) => {
    const next = widgets.map(w => w.id === updated.id ? updated : w)
    setWidgets(next)
    const s = await getSettings()
    s.widgets = next
    await saveSettings(s)
  }

  const handleOpenSettings = () => setSettingsOpen(true)

  const handleSettingsSaved = async () => {
    try{ if (connRef.current) connRef.current.close() } catch(e){}
    const s = await getSettings()
    const wsUrl = s.wsUrl || DEFAULT_WS_URL
    const token = s.token || DEFAULT_TOKEN
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
  }

  const handleReconnect = () => {
    try{
      if (connRef.current && connRef.current.reconnect) connRef.current.reconnect()
    }catch(e){ console.warn('reconnect failed', e) }
  }

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>D522 React Dashboard</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Paper sx={{p:2}}>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb:1}}>
              <Typography variant="subtitle1">Entities</Typography>
              <ConnectionStatus status={connStatus} />
            </Box>
            <EntityList entities={entities} onSelect={setSelected} />
            <Box sx={{mt:2, display:'flex', gap:1, flexWrap:'wrap'}}>
              <Button variant="outlined" onClick={handleOpenSettings}>Settings</Button>
              <Button variant="outlined" onClick={()=>setDesignerOpen(true)}>Designer</Button>
              <Button variant="outlined" onClick={handleReconnect}>Reconnect</Button>
              <Button variant="outlined" onClick={()=> setWidgets(prev => [...prev, {id: `chart-${Date.now()}`, type: 'chart'}])}>Add Chart</Button>
              <Button variant="outlined" onClick={()=> setWidgets(prev => [...prev, {id: `export-${Date.now()}`, type: 'export'}])}>Add Export</Button>
              <Button variant="outlined" onClick={handleExport}>Export Local Data</Button>
            </Box>
            <Box sx={{mt:2}}>
              <Palette />
              <PublishedList />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          <Paper sx={{p:2}}>
            <Typography variant="subtitle1">Selected: {selected || '—'}</Typography>
            <SortableGrid
              items={widgets}
              onChange={(next)=>{ setWidgets(next); (async ()=>{ const s = await getSettings(); s.widgets = next; await saveSettings(s) })() }}
              renderItem={(it) => {
                return (
                  <Box sx={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                    <Box sx={{flex:1}}>
                      {it.type === 'chart' && (selected ? (
                        <Suspense fallback={<Typography>Loading chart...</Typography>}>
                          <Charts points={history} />
                        </Suspense>
                      ) : <Typography sx={{mt:2}}>Select an entity to view history.</Typography>)}
                      {it.type === 'export' && (<Button variant="outlined" onClick={handleExport}>Export Local Data</Button>)}
                    </Box>
                    <Box sx={{ml:1}}>
                      <Button size="small" onClick={()=>openWidgetSettings(it)}>Settings</Button>
                    </Box>
                  </Box>
                )
              }}
            />
          </Paper>
        </Grid>
      </Grid>
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} onSaved={handleSettingsSaved} />
      <WidgetSettings open={widgetSettingsOpen} onClose={() => setWidgetSettingsOpen(false)} widget={activeWidget} onSave={handleWidgetSaved} />
      <OnboardingModal />
      <Designer open={designerOpen} onClose={() => setDesignerOpen(false)} />
    </Box>
  )
}
