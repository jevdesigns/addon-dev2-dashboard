import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/ha-panel.js',
      name: 'd522Panel',
      fileName: 'my-react-panel'
    },
    rollupOptions: {
      // keep defaults; Vite will produce a single bundled file for the lib entry
    }
  }
})
