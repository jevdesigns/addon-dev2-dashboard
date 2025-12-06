import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider, createTheme } from '@mui/material/styles'

// Create a theme optimized for HA embedded context
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Material blue
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    // Slightly reduced font sizes for embedded panel
    h5: { fontSize: '1.5rem' },
    h6: { fontSize: '1.2rem' },
    body1: { fontSize: '0.95rem' },
    body2: { fontSize: '0.85rem' },
  },
  components: {
    MuiContainer: {
      defaultProps: {
        maxWidth: false, // Allow full width in embedded context
      },
      styleOverrides: {
        root: {
          paddingLeft: 0,
          paddingRight: 0,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          // Smaller app bar for embedded context
          minHeight: '56px',
        },
      },
    },
  },
})

function Main() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')).render(<Main />)
