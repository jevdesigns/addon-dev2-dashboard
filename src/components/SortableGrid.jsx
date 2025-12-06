import React, {useRef, useState, useEffect} from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'

// Sortable grid with visual drop indicator, insertion at position, simple two-column grid and resizable height.
export default function SortableGrid({items, onChange, renderItem}){
  const ROW_HEIGHT = 80 // grid unit in px
  const dragIndexRef = useRef(null)
  const [overIndex, setOverIndex] = useState(null)
  const [insertBefore, setInsertBefore] = useState(true)
  const [isOverContainer, setIsOverContainer] = useState(false)
  const containerRef = useRef(null)

  useEffect(()=>{
    // clear indicator on dragend anywhere
    const onDragEnd = ()=>{ setOverIndex(null); dragIndexRef.current = null }
    window.addEventListener('dragend', onDragEnd)
    return ()=> window.removeEventListener('dragend', onDragEnd)
  }, [])

  const handleDragStart = (e, idx) => {
    dragIndexRef.current = idx
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleItemDragOver = (e, idx) => {
    e.preventDefault()
    // determine whether cursor is in upper or lower half to indicate before/after
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const before = y < rect.height / 2
    setOverIndex(idx)
    setInsertBefore(before)
    e.dataTransfer.dropEffect = 'move'
  }

  const handleItemDrop = (e, idx) => {
    e.preventDefault()
    const from = dragIndexRef.current
    let to = idx
    if (!insertBefore) to = idx + 1
    if (from != null){
      const next = Array.from(items)
      const [moved] = next.splice(from, 1)
      // adjust target index if removing earlier element
      if (from < to) to = to - 1
      next.splice(to, 0, moved)
      dragIndexRef.current = null
      setOverIndex(null)
      onChange(next)
      return
    }
    // if not from same list, maybe palette drop uses dataTransfer
    const type = e.dataTransfer.getData('application/widget-type')
    if (type){
      const id = `${type}-${Date.now()}`
      const next = Array.from(items)
      next.splice(to, 0, {id, type, height: 180, colspan: 1})
      setOverIndex(null)
      onChange(next)
    }
  }

  const handleContainerDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    // indicate container-level hover (for placeholder)
    setIsOverContainer(true)
    setOverIndex(null)
  }

  const handleContainerDrop = (e) => {
    e.preventDefault()
    setIsOverContainer(false)
    const type = e.dataTransfer.getData('application/widget-type')
    if (!type) return
    const id = `${type}-${Date.now()}`
    const next = Array.from(items)
    next.push({id, type, rowSpan: 2, colspan: 1})
    onChange(next)
  }

  // Resizing: adjust rowSpan in grid units
  const handleResizeStart = (e, idx) => {
    e.preventDefault()
    const startY = e.clientY
    const startRowSpan = items[idx].rowSpan || 1
    function onMove(ev){
      const dy = ev.clientY - startY
      const deltaRows = Math.round(dy / ROW_HEIGHT)
      const next = Array.from(items)
      next[idx] = {...next[idx], rowSpan: Math.max(1, startRowSpan + deltaRows)}
      onChange(next)
    }
    function onUp(){ window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // Horizontal resize for colspan: drag horizontally to toggle between 1 and 2 columns
  const handleHResizeStart = (e, idx) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startCol = items[idx].colspan || 1
    const containerRect = containerRef.current ? containerRef.current.getBoundingClientRect() : null
    const colWidth = containerRect ? (containerRect.width - 8) / 2 : 200 // fallback

    function onMove(ev){
      const dx = ev.clientX - startX
      // if dragged more than half a column, treat as toggle
      const threshold = colWidth / 2
      const want = Math.abs(dx) > threshold ? (dx > 0 ? 2 : 1) : startCol
      const next = Array.from(items)
      next[idx] = {...next[idx], colspan: want}
      onChange(next)
    }
    function onUp(){ window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <Box ref={containerRef} onDragOver={handleContainerDragOver} onDrop={handleContainerDrop}
      role="list"
      aria-label="dashboard-widgets"
      sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: `${ROW_HEIGHT}px`, gap: 2}}>
      {items.map((it, idx) => (
        <Paper key={it.id}
          sx={{p:1, display:'flex', flexDirection:'column', position:'relative', minHeight: ROW_HEIGHT, gridRow: `span ${it.rowSpan || 1}`, gridColumn: it.colspan === 2 ? '1 / -1' : 'auto', transition: 'all 180ms ease'}}
          draggable
          role="listitem"
          aria-grabbed={dragIndexRef.current === idx}
          tabIndex={0}
          onKeyDown={(e)=>{
            // keyboard accessibility: Ctrl+ArrowUp/Down to move
            if (e.ctrlKey && e.key === 'ArrowUp'){
              e.preventDefault(); if (idx>0){ const next=Array.from(items); const [m]=next.splice(idx,1); next.splice(idx-1,0,m); onChange(next) }
            }
            if (e.ctrlKey && e.key === 'ArrowDown'){
              e.preventDefault(); if (idx < items.length-1){ const next=Array.from(items); const [m]=next.splice(idx,1); next.splice(idx+1,0,m); onChange(next) }
            }
            // Ctrl+Plus / Ctrl+- to change rowSpan
            if (e.ctrlKey && (e.key === '=' || e.key === '+')){ e.preventDefault(); const next=Array.from(items); next[idx]={...next[idx], rowSpan: (next[idx].rowSpan||1)+1}; onChange(next) }
            if (e.ctrlKey && (e.key === '-' || e.key === '_')){ e.preventDefault(); const next=Array.from(items); next[idx]={...next[idx], rowSpan: Math.max(1,(next[idx].rowSpan||1)-1)}; onChange(next) }
            // Ctrl+Shift+ArrowLeft/Right toggle colspan
            if (e.ctrlKey && e.shiftKey && e.key === 'ArrowLeft'){ e.preventDefault(); const next=Array.from(items); next[idx]={...next[idx], colspan:1}; onChange(next) }
            if (e.ctrlKey && e.shiftKey && e.key === 'ArrowRight'){ e.preventDefault(); const next=Array.from(items); next[idx]={...next[idx], colspan:2}; onChange(next) }
          }}
          onDragStart={(e)=>handleDragStart(e, idx)}
          onDragOver={(e)=>handleItemDragOver(e, idx)}
          onDrop={(e)=>handleItemDrop(e, idx)}>
          <Box sx={{display:'flex', alignItems:'center'}}>
            <IconButton size="small" sx={{mr:1}} aria-label="drag">
              <DragIndicatorIcon />
            </IconButton>
            <Box sx={{flex:1}}>
              {renderItem(it)}
            </Box>
            <Box>
              <IconButton size="small" onClick={()=>{ const next=Array.from(items); next[idx]={...next[idx], colspan: next[idx].colspan===2?1:2}; onChange(next) }} aria-label="toggle-col">
                {/* simple text for toggle to avoid new icon import */}
                <span style={{fontSize:12}}>{it.colspan===2? 'W' : 'w'}</span>
              </IconButton>
            </Box>
          </Box>
            <Box sx={{height:6, cursor:'ns-resize', bgcolor:'transparent'}} onMouseDown={(e)=>handleResizeStart(e, idx)} />
            <Box
              sx={{width:8, cursor:'ew-resize', position:'absolute', right:4, top:8, bottom:8}}
              onMouseDown={(e)=>handleHResizeStart(e, idx)}
              tabIndex={0}
              role="separator"
              aria-label="column resize handle"
              onKeyDown={(e)=>{
                // Enter toggles colspan; ArrowLeft/Right set colspan explicitly
                if (e.key === 'Enter'){
                  e.preventDefault(); const next=Array.from(items); next[idx]={...next[idx], colspan: next[idx].colspan===2?1:2}; onChange(next)
                }
                if (e.key === 'ArrowLeft'){
                  e.preventDefault(); const next=Array.from(items); next[idx]={...next[idx], colspan:1}; onChange(next)
                }
                if (e.key === 'ArrowRight'){
                  e.preventDefault(); const next=Array.from(items); next[idx]={...next[idx], colspan:2}; onChange(next)
                }
                // +/- keys adjust rowSpan while handle focused
                if (e.key === '+' || e.key === '='){ e.preventDefault(); const next=Array.from(items); next[idx]={...next[idx], rowSpan: (next[idx].rowSpan||1)+1}; onChange(next) }
                if (e.key === '-') { e.preventDefault(); const next=Array.from(items); next[idx]={...next[idx], rowSpan: Math.max(1,(next[idx].rowSpan||1)-1)}; onChange(next) }
              }}
            />
          {/* visual indicator */}
          {overIndex === idx && (
            <Box sx={{position:'absolute', left: 0, right: 0, top: insertBefore ? 0 : 'auto', bottom: insertBefore ? 'auto' : 0,
              height: 4, width: '100%', bgcolor: 'primary.main', opacity: 0.6}} />
          )}
        </Paper>
      ))}
      {/* container-level placeholder when dragging over empty area */}
      {isOverContainer && (
        <Paper sx={{p:2, gridColumn: '1 / -1', borderStyle: 'dashed', borderWidth: 2, borderColor: 'primary.main', opacity:0.9, transition:'all 160ms ease'}}>
          <Box sx={{textAlign:'center'}}>Drop here to add widget</Box>
        </Paper>
      )}
    </Box>
  )
}
