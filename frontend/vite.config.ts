import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/girls/',
  server: {
    proxy: {
      '/girls/api': { target: 'http://localhost:8000', changeOrigin: true, rewrite: (path) => path.replace(/^\/girls/, '') },
    },
  },
})
