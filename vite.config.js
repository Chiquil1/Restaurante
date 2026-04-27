import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // 🌉 ESTO ES EL PUENTE:
      // Cualquier petición que empiece con /api será enviada al puerto 3000
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path, // Mantiene la ruta tal cual
      },
    },
  },
})
