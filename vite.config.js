import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  
  server: {
     port: 8080,
     host: '0.0.0.0', 
     open: true,
    strictPort: false,
    https: false,
    proxy: {
        '/drogon': {
            target: 'http://localhost:5555',
            changeOrigin: true,
            secure: false
        },
        '/file': {
            target: 'http://localhost:5555',
            changeOrigin: true,
            secure: false
        },
        '/share': {
            target: 'http://localhost:5555',
            changeOrigin: true,
            secure: false
        },
        '/folder': {
            target: 'http://localhost:5555',
            changeOrigin: true,
            secure: false
        }
    }
  },
})
