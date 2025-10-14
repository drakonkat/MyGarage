# 🚗 Gestione Manutenzione Auto

Un'applicazione web moderna e intuitiva per tracciare, gestire e prevedere la manutenzione dei tuoi veicoli, potenziata dall'intelligenza artificiale di Google Gemini e dotata di un backend completo.

## ✨ Funzionalità Principali

- **Dashboard Veicoli**: Tieni traccia di tutte le tue auto in un unico posto.
- **Cronologia Dettagliata**: Registra ogni intervento di manutenzione con data, chilometraggio, costi e note.
- **Raccomandazioni AI**: Ottieni un piano di manutenzione di base generato da Gemini.
- **Simulatore di Costi**: Prevedi i costi di manutenzione futuri per un veicolo fino a un chilometraggio target.
- **Gestionale per Officine**: Funzionalità complete per meccanici, inclusa gestione clienti, preventivi e fatture.
- **Portale Cliente**: I clienti possono accedere per visualizzare lo storico dei loro veicoli.
- **Backend Integrato**: Il backend Node.js/Express serve sia l'API che l'applicazione frontend per un deploy semplificato.
- **Import/Export**: Salva e carica i dati dei tuoi veicoli in formato JSON.
- **Tema Personalizzabile**: Scegli tra tema chiaro e scuro e personalizza il colore principale.

## 🚀 Come Avviare il Progetto

Il progetto è un monorepo con frontend e backend. Gli script nella root gestiscono entrambi.

### Prerequisiti

1.  [Node.js](https://nodejs.org/) (versione 18 o superiore)
2.  [PostgreSQL](https://www.postgresql.org/) installato e in esecuzione.
3.  Un API Key per **Google Gemini API**.

### Configurazione

1.  **Clona il Repository**:
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Installa Dipendenze**:
    Installa le dipendenze per il progetto root (frontend).
    ```bash
    npm install
    ```

3.  **Configura il Backend**:
    Segui le istruzioni nel file `backend/README.md` per configurare il database e il file `.env`.

4.  **Esegui lo Script di Setup del Backend**:
    Questo comando installerà le dipendenze del backend ed eseguirà le migrazioni del database.
    ```bash
    npm run setup:backend
    ```
    
5.  **Imposta l'API Key di Gemini per il Frontend**:
    Vite espone in modo sicuro le variabili d'ambiente al codice frontend solo se hanno il prefisso `VITE_`. Crea un file `.env` nella root del progetto (se non esiste) e aggiungi la tua chiave API in questo formato:
    ```env
    VITE_GEMINI_API_KEY="la_tua_chiave_api_di_google"
    ```
    L'applicazione leggerà questa variabile tramite `import.meta.env.VITE_GEMINI_API_KEY`.


### Esecuzione in Modalità Sviluppo

Per avviare sia il server di sviluppo di Vite (frontend) che il server Nodemon (backend) contemporaneamente:
```bash
npm run dev:full
```
-   Il frontend sarà accessibile su `http://localhost:5173` (o un'altra porta indicata da Vite).
-   Il backend sarà in ascolto su `http://localhost:3001`.

### Esecuzione in Modalità Produzione

Per creare una build di produzione del frontend e servirla tramite il server Express:
```bash
npm start
```
Questo comando:
1.  Esegue `npm run build`, che compila il frontend nella cartella `backend/public`.
2.  Esegue `npm run start:backend`, che avvia il server Express.
L'applicazione completa sarà accessibile su `http://localhost:3001`.

## 🛠️ Stack Tecnologico

-   **Frontend**: React, TypeScript, Vite
-   **UI Library**: Material-UI (MUI) v7
-   **Intelligenza Artificiale**: Google Gemini API (`@google/genai`)
-   **Storage Locale (Uso Personale)**: IndexedDB (`idb`)
-   **Backend**: Node.js, Express
-   **Database**: PostgreSQL con Sequelize ORM
-   **Autenticazione**: JWT (JSON Web Tokens)
-   **Grafici**: Recharts