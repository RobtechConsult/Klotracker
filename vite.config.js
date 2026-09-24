import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Klopatra läuft komplett clientseitig – kein Backend, keine Cloud.
// Alle Daten bleiben auf dem Handy (localStorage). Datenschutz ist hier
// wortwörtlich Privatsache.
// Der Build (dist/) wird von Capacitor in die native iOS-/Android-App
// gepackt – daher relativer Basispfad und kein Service Worker.
export default defineConfig({
  base: './',
  plugins: [react()]
})
