import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import legacy from '@vitejs/plugin-legacy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    legacy({
      targets: ['defaults', 'not IE 11', 'Android >= 7', 'iOS >= 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      modernPolyfills: true
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    target: ['es2015', 'ios11'],
    cssTarget: 'chrome61', // Prevent modern CSS that might break older browsers
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: ['PROD'].includes(process.env.APP_ENV),
      },
    },
  }
})
