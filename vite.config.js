import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Seguridad (16-nov): se sacó el "define" que metía la clave de Anthropic en el código del navegador.
// La clave vive solo en el servidor (api/anthropic.js, variable ANTHROPIC_API_KEY).
export default defineConfig(() => {
  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          creatumentoria: resolve(__dirname, 'creatumentoria.html'),
          gestionarmentoria: resolve(__dirname, 'gestionarmentoria.html'),
          miprogreso: resolve(__dirname, 'miprogreso.html'),
          eventos: resolve(__dirname, 'eventos.html'),
        },
      },
    },
  }
})
