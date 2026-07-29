import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Klotracker läuft komplett clientseitig – kein Backend, keine Cloud.
// Alle Daten bleiben auf dem Handy (localStorage). Datenschutz ist hier
// wortwörtlich Privatsache.
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Klotracker – Toiletten-Tracker mit Augenzwinkern',
        short_name: 'Klotracker',
        description:
          'Tracke deine Toilettengänge, erkenne Muster und lass dir die nächste wahrscheinliche Sitzung vorhersagen – mit einer ordentlichen Portion Humor.',
        theme_color: '#7c5a3a',
        background_color: '#fdf6ec',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        lang: 'de',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}']
      }
    })
  ]
})
