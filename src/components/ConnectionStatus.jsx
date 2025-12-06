import React from 'react'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'

const colorFor = (s) => {
  switch(s){
    case 'connected': return 'success'
    case 'connecting': return 'info'
    case 'reconnecting': return 'warning'
    case 'error': return 'error'
    case 'closed': return 'default'
    default: return 'default'
  }
}

export default function ConnectionStatus({status}){
  if (!status) return null
  return (
    <Tooltip title={`WebSocket: ${status}`}>
      <Chip label={status} color={colorFor(status)} size="small" />
    </Tooltip>
  )
}
