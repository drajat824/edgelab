import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  assetsInclude: ['**/*.ipynb'],
  server: {
    host: true,
    allowedHosts: [
      'edgelab.local'
    ],
    proxy: {
      // Mengalihkan semua request yang diawali '/api' ke backend
      '/api': {
        target: 'http://edgelab.local:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  }
})

