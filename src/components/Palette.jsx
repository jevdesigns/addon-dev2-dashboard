import React from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

export default function Palette(){
  const handleDragStart = (e, type) => {
    e.dataTransfer.setData('application/widget-type', type)
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <Box sx={{display:'flex', gap:1, flexDirection:'column'}}>
      <Paper sx={{p:1}}>
        <Typography variant="subtitle2">Palette</Typography>
        <Box sx={{mt:1, display:'flex', gap:1}}>
          <Button draggable onDragStart={(e)=>handleDragStart(e,'chart')}>Chart</Button>
          <Button draggable onDragStart={(e)=>handleDragStart(e,'export')}>Export</Button>
        </Box>
      </Paper>
    </Box>
  )
}
