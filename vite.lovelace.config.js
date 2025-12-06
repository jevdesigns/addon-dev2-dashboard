import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
    'process': {
      env: {},
      version: '',
      versions: {},
      platform: 'browser',
      browser: true,
      cwd: () => '/',
      exit: () => {}
    }
  },
  build: {
    lib: {
      entry: 'src/lovelace-card.jsx',
      name: 'Dev2ReactDashboard',
      fileName: 'dev2-react-dashboard',
      formats: ['iife'] // Self-executing, auto-registers custom element
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'lucide-react'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'lucide-react': 'Lucide'
        },
        // Ensure custom element registers immediately when script loads
        extend: true
      }
    },
    minify: 'terser',
    sourcemap: false,
    outDir: 'dist'
  }
})
