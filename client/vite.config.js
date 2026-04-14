import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // En desarrollo, el proxy redirige /api al servidor Express local
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    // El build se genera en client/dist, que Express sirve como estáticos
    outDir: 'dist'
  }
})
