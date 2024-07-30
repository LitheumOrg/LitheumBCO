// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        private: resolve(__dirname, 'private/index.html'),
        admin: resolve(__dirname, 'admin/index.html'),
      },
    },
  },
})