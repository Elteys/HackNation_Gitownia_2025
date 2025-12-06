import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <--- Importujemy plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <--- Dodajemy go tutaj
  ],
})