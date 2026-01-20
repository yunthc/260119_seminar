// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'
export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                advanced: resolve(__dirname, 'advancedchatbot.html'),
             },
         },
     },
})