import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
    , rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')){
            if (id.includes('recharts')) return 'vendor_recharts'
            if (id.includes('@mui')) return 'vendor_mui'
            if (id.includes('localforage')) return 'vendor_localforage'
            if (id.includes('react') || id.includes('react-dom')) return 'vendor_react'
            return 'vendor_misc'
          }
        }
      }
    }
  }
})
