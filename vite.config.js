import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all addresses, including LAN and public addresses
    proxy: {
      '/auth': { 
        target: 'http://127.0.0.1:5000', 
        changeOrigin: true, 
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      },
      '/medicines': { target: 'http://127.0.0.1:5000', changeOrigin: true, secure: false },
      '/cart': { target: 'http://127.0.0.1:5000', changeOrigin: true, secure: false },
      '/orders': { target: 'http://127.0.0.1:5000', changeOrigin: true, secure: false },
      '/notifications': { target: 'http://127.0.0.1:5000', changeOrigin: true, secure: false },
      '/prescriptions': { target: 'http://127.0.0.1:5000', changeOrigin: true, secure: false },
      '/stock': { target: 'http://127.0.0.1:5000', changeOrigin: true, secure: false },
      '/payments': { target: 'http://127.0.0.1:5000', changeOrigin: true, secure: false },
      '/admin': { target: 'http://127.0.0.1:5000', changeOrigin: true, secure: false },
      '/warehouseAdmins': { target: 'http://127.0.0.1:5000', changeOrigin: true, secure: false },
      '/sessions': { target: 'http://127.0.0.1:5000', changeOrigin: true, secure: false },
      '/socket.io': { target: 'http://127.0.0.1:5000', ws: true, changeOrigin: true }
    }
  },
  preview: {
    host: true,
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
