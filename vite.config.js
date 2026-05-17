import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Sifnos Wedding Concierge',
        short_name: 'Sifnos',
        description: 'Wedding companion for Caro & Chris on Sifnos — schedule, map, AI concierge.',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#1a2738',
        background_color: '#f2ede3',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-64x64.png',             sizes: '64x64',   type: 'image/png' },
          { src: 'pwa-192x192.png',           sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png',           sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache all bundled assets (JS, CSS, HTML, fonts, data JSON, icons)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2,woff,ttf}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          // Open-Meteo weather: network-first, 1h stale fallback
          {
            urlPattern: /^https:\/\/api\.open-meteo\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'weather-api',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 5, maxAgeSeconds: 3600 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // AI chat endpoint: never serve from cache
          {
            urlPattern: /\/api\/chat/,
            handler: 'NetworkOnly',
          },
          // Google Fonts CSS: stale-while-revalidate
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          // Google Fonts files: cache-first, 1-year TTL
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 31536000 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    // On Windows, vercel dev doesn't run the Python runtime locally.
    // Run `python run_api.py` in a second terminal and Vite will proxy
    // /api requests to it. In production Vercel handles this natively.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
