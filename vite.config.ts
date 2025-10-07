import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Imposta il percorso di base su relativo ('./').
  // Questo fa sì che Vite generi percorsi relativi per gli asset (es. "assets/index.js")
  // invece di percorsi assoluti dalla root (es. "/assets/index.js").
  // È una soluzione robusta per il deploy su domini custom come mygarage.tnl.one
  // o in sottocartelle, poiché evita i comuni errori 404 che portano a una pagina bianca.
  base: './',
})
