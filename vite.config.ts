import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Inietta la versione del software come una costante globale __APP_VERSION__.
    // Usa la variabile d'ambiente APP_VERSION se disponibile, altrimenti usa '1.0-preview' come fallback.
    '__APP_VERSION__': JSON.stringify(process.env.APP_VERSION || '1.0-preview')
  },
  // Imposta il percorso di base sulla root ('/').
  // Questo è necessario perché l'app verrà servita dalla radice del dominio
  // dal server backend, e non più da percorsi relativi.
  base: '/',
  server: {
    proxy: {
      // Proxy delle richieste API al server backend durante lo sviluppo
      '/api/v1': {
        target: 'http://localhost:3001', // L'indirizzo del server backend
        changeOrigin: true, // Consigliato per host virtuali
      },
    },
  },
  build: {
    // Specifica la cartella di output per la build.
    // I file verranno collocati in `backend/public`, pronti per essere serviti da Express.
    outDir: path.resolve(__dirname, 'backend', 'public'),
    emptyOutDir: true,
  }
})