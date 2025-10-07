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
  // Aggiunta per risolvere l'errore "Uncaught Error: An API Key must be set".
  // Questa configurazione inietta la variabile d'ambiente GEMINI_API_KEY
  // nel codice client durante il processo di build, assegnandola a process.env.API_KEY.
  // Assicurati di impostare la variabile d'ambiente GEMINI_API_KEY quando esegui `npm run build`.
  // Esempio: GEMINI_API_KEY="your_google_api_key" npm run build
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.GEMINI_API_KEY),
  },
})
