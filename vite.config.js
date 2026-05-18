import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all addresses, including LAN and public addresses
    proxy: {
      '/auth': { target: 'http://127.0.0.1:5000', changeOrigin: true, secure: false },
      '/medicines': { target: 'http://127.0.0.1:5000', changeOrigin: true, secure: false },
      '/cart': { target: 'http://127.0.0.1:5000', changeOrigin: true, secure: false },
      '/orders': { target: 'http://127.0.0.1:5000', changeOrigin: true, secure: false },
      '/notifications': { target: 'http://127.0.0.1:5000', changeOrigin: true, secure: false },
      '/prescriptions': { target: 'http://127.0.0.1:5000', changeOrigin: true, secure: false },
      '/stock': { target: 'http://127.0.0.1:5000', changeOrigin: true, secure: false },
      '/payments': { target: 'http://127.0.0.1:5000', changeOrigin: true, secure: false },
      '/admin': { target: 'http://127.0.0.1:5000', changeOrigin: true, secure: false },
      '/warehouseAdmins': { target: 'http://127.0.0.1:5000', changeOrigin: true, secure: false },
      '/sessions': { target: 'http://127.0.0.1:5000', changeOrigin: true, secure: false }
    }
  }
})
