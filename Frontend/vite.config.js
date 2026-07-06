import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all addresses, including LAN and public addresses
    proxy: {
      '/api': { 
        target: 'http://127.0.0.1:5000', 
        changeOrigin: true, 
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
            if (res && !res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'text/plain' });
              res.end('Proxy error: Could not connect to backend server.');
            }
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      },
      '/socket.io': { target: 'http://127.0.0.1:5000', ws: true, changeOrigin: true }
    }
  },
  preview: {
    host: true,
    proxy: {
      '/api': { target: 'http://127.0.0.1:5000', changeOrigin: true, secure: false }
    }
  }
})
