import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      // Proxy /api/public/* to the admin panel dev server (avoids CORS in local dev)
      '/api/public': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
