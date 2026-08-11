import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    define: {
      VITE_ANTHROPIC_KEY: JSON.stringify(env.VITE_ANTHROPIC_API_KEY || ''),
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          creatumentoria: resolve(__dirname, 'creatumentoria.html'),
        },
      },
    },
  }
})
