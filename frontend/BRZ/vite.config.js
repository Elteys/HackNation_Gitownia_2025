import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs' // <--- Potrzebne do odczytu plików certyfikatów

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <--- Twój plugin Tailwind
  ],
  server: {
    // Konfiguracja HTTPS (zielona kłódka)
    https: {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem'),
    },
    // Opcjonalnie: Pozwala na dostęp z innych urządzeń w sieci (np. telefonu)
    host: true, 
  },
})