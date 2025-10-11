import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url';

// Fix: __dirname is not available in ES modules. This defines it based on the current file location.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Imposta il percorso di base sulla root ('/').
  // Questo è necessario perché l'app verrà servita dalla radice del dominio
  // dal server backend, e non più da percorsi relativi.
  base: '/',
  // Aggiunta per risolvere l'errore "Uncaught Error: An API Key must be set".
  // Questa configurazione inietta la variabile d'ambiente GEMINI_API_KEY
  // nel codice client durante il processo di build, assegnandola a process.env.API_KEY.
  // Assicurati di impostare la variabile d'ambiente GEMINI_API_KEY quando esegui `npm run build`.
  // Esempio: GEMINI_API_KEY="your_google_api_key" npm run build
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.GEMINI_API_KEY),
  },
  build: {
    // Specifica la cartella di output per la build.
    // I file verranno collocati in `backend/public`, pronti per essere serviti da Express.
    outDir: path.resolve(__dirname, 'backend', 'public'),
    emptyOutDir: true,
  }
})