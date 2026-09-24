/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon.svg'],
      manifest: {
        name: 'Broke? — find out before you are',
        short_name: 'Broke?',
        description:
          'A brutally honest money reality check for young Indians. Can you afford it? Are you in a debt trap?',
        theme_color: '#FF3B30',
        background_color: '#F4F1EA',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          // Scalable SVG mark serves every size, incl. maskable (safe zone honored).
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
