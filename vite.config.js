import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all addresses, including LAN and public addresses
    proxy: {
      '/auth': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/medicines': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/cart': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/orders': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/notifications': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/prescriptions': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/stock': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/payments': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/admin': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/warehouseAdmins': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/sessions': { target: 'http://localhost:5000', changeOrigin: true, secure: false }
    }
  }
})
