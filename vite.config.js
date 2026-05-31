import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { copyFileSync, existsSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    {
      name: 'copy-install-md',
      closeBundle() {
        const source = resolve(__dirname, 'INSTALL.md')
        const target = resolve(__dirname, 'dist', 'INSTALL.md')

        if (existsSync(source)) {
          copyFileSync(source, target)
        }
      },
    },
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@app': resolve(__dirname, './src/app'),
      '@features': resolve(__dirname, './src/features'),
      '@shared': resolve(__dirname, './src/shared'),
      '@services': resolve(__dirname, './src/services'),
      '@styles': resolve(__dirname, './src/styles'),
    },
  },



  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
