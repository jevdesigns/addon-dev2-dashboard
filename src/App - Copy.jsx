import React from 'react'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Dashboard from './components/DashboardClean'

/**
 * App Component
 * 
 * Accepts props from Lovelace Web Component wrapper
 * @param {Object} config - Configuration from dashboard YAML (optional)
 */
export default function App({ config = {} }) {
  const appTitle = config?.title || 'D522 Dashboard'
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">{appTitle}</Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <Dashboard />
      </Box>
    </Box>
  )
}
