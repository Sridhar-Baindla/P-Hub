import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:5000',
      '/medicines': 'http://localhost:5000',
      '/cart': 'http://localhost:5000',
      '/orders': 'http://localhost:5000',
      '/notifications': 'http://localhost:5000',
      '/prescriptions': 'http://localhost:5000',
      '/stock': 'http://localhost:5000',
      '/payments': 'http://localhost:5000',
      '/admin': 'http://localhost:5000',
      '/warehouseAdmins': 'http://localhost:5000',
      '/sessions': 'http://localhost:5000'
    }
  }
})
