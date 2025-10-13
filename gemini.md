# 🐾 Guida allo Sviluppo per AI: App Manutenzione Auto

Questo documento è la guida definitiva per comprendere e modificare questo progetto. Leggilo attentamente per capire la filosofia, la struttura e le convenzioni adottate.

## 1. Visione d'Insieme del Progetto

Questa è un'applicazione **monorepo** che contiene un frontend e un backend separati ma coesistenti.

-   **Frontend**: Un'applicazione single-page (SPA) costruita con **React**, **TypeScript** e **Vite**. Utilizza **Material-UI (MUI)** per i componenti e **MobX** per la gestione dello stato.
-   **Backend**: Un'API RESTful costruita con **Node.js**, **Express**, e l'ORM **Sequelize** per interagire con un database (PostgreSQL, MySQL, o SQLite).
-   **Intelligenza Artificiale**: Le funzionalità avanzate sono potenziate da **Google Gemini API**.

### Concetti Architettonici Chiave

1.  **Stato Centralizzato (Frontend)**: Lo stato globale dell'applicazione frontend è gestito da **MobX**. Questo garantisce una fonte di verità unica e una reattività prevedibile.
2.  **Comunicazione API Centralizzata**: Tutte le chiamate API (verso il nostro backend, Gemini, o altri servizi esterni) sono gestite da `src/ApiClient.ts`. Questo è l'unico file che deve contenere logica `fetch`.
3.  **Navigazione basata sullo Stato**: L'applicazione non usa un router tradizionale basato su URL (es. React Router). La navigazione tra le "pagine" (viste) è controllata dallo stato in `ViewStore`. Per cambiare vista, si modifica questo stato.
4.  **Doppia Modalità Operativa**: L'app funziona in due modalità:
    -   **Anonima**: Per utenti non registrati. I dati sono salvati localmente nel browser tramite **IndexedDB**.
    -   **Autenticata**: Per utenti registrati. I dati sono persistiti nel database del backend e recuperati tramite API.
5.  **Build di Produzione Integrata**: In produzione, il frontend viene compilato e inserito nella cartella `backend/public`, per essere servito staticamente dallo stesso server Express che espone l'API.

---

## 2. Struttura dei File: Una Mappa per l'Esplorazione

### `/` (Root)

-   `package.json`: Il "cervello" del progetto. Contiene gli script per gestire sia il frontend che il backend.
    -   `dev:full`: Avvia entrambi gli ambienti di sviluppo. **Usa questo.**
    -   `start`: Crea la build di produzione e avvia il server.
    -   `setup:backend`: Esegue l'installazione e le migrazioni del database per il backend.
-   `vite.config.ts`: Configurazione per il build del frontend. Nota la `outDir` che punta a `backend/public`.
-   `gemini.md`: Questo file. Il tuo vangelo.

### `/src` (Frontend)

-   `App.tsx`: Il componente radice. Agisce come un **router basato sullo stato**. Il suo unico compito è leggere da `ViewStore` e renderizzare la vista corretta. **Non aggiungere logica di business qui.**
-   **`/stores`**: Il cuore pulsante dello stato del frontend.
    -   `RootStore.ts`: Punto di accesso unico a tutti gli store.
    -   `UserStore.ts`: Gestisce tutto ciò che riguarda l'utente: `token`, `user`, stato di login, e le azioni `login()`, `logout()`, `signup()`.
    -   `ViewStore.ts`: Gestisce la vista corrente (`currentView`). Per cambiare pagina, invoca `viewStore.setView(...)`.
-   **`/components`**: Contiene tutti i componenti React, organizzati per funzione.
    -   `AnonymousApp.tsx`: L'applicazione per utenti non loggati. Gestisce il proprio stato (usando `useState`) e interagisce con IndexedDB (`db.ts`).
    -   `PersonalApp.tsx`: L'applicazione per utenti "personali" loggati. Interagisce con il backend tramite `ApiClient.ts`.
    -   `mechanic/`: Componenti e logica per l'utente "officina".
    -   `auth/`: I form di Login e Signup. Invocano le azioni di `UserStore`.
    -   `LandingPage.tsx`: La pagina iniziale. I suoi pulsanti devono cambiare la vista tramite `ViewStore`.
-   `ApiClient.ts`: **FILE FONDAMENTALE**.
    -   `apiClient`: Istanza per la comunicazione con il nostro backend (`/api/v1/...`).
    -   `geminiApi`: Oggetto per tutte le chiamate a Google Gemini. Include una logica di **fallback** per funzionare anche senza API key.
    -   `externalApi`: Per altre API di terze parti (es. Auto-Doc).
-   `db.ts`: Logica di interazione con IndexedDB. **Usata solo dalla modalità anonima**.
-   `types.ts`: Definizioni TypeScript centralizzate.

### `/backend` (Backend)

-   `src/app.js`: Entry point del server Express. Configura middleware, routing e serve i file statici dalla cartella `public`.
-   `src/routes/`: Definizione degli endpoint dell'API. Collegano un URL a una funzione del controller.
-   `src/controllers/`: Contengono la logica di business. Ricevono `req` e `res`, usano i modelli Sequelize per interagire con il DB e inviano una risposta.
-   `src/database/models/`: I modelli Sequelize. Definiscono la struttura delle tabelle e le loro associazioni.
-   `src/database/migrations/`: Le migrazioni del database. **Per ogni modifica allo schema, crea una nuova migrazione.** Non modificare quelle vecchie.
-   `src/middleware/`: Middleware per l'autenticazione (`authMiddleware.js`) e l'autorizzazione basata sui ruoli (`roleMiddleware.js`).

---

## 3. Linee Guida per le Modifiche (I Comandamenti)

#### **Scenario 1: Modifica all'Interfaccia Utente (UI)**

1.  **Identifica il Componente**: Trova il file `.tsx` in `/src/components` responsabile della UI che devi modificare.
2.  **Applica la Modifica**: Modifica il componente. Se hai bisogno di nuovi dati, procedi allo scenario 2.
3.  **Stato Locale**: Se la modifica richiede uno stato che non deve essere globale (es. l'apertura/chiusura di un menu), usa `useState` all'interno del componente.

#### **Scenario 2: Aggiungere Nuovi Dati dal Backend**

1.  **Backend: Crea l'Endpoint**:
    -   Definisci una nuova rotta in un file in `/backend/src/routes`.
    -   Implementa la logica nel relativo controller in `/backend/src/controllers`. Usa i modelli Sequelize per interrogare il DB.
    -   Se necessario, proteggi la rotta con `authMiddleware` e/o `roleMiddleware`.
2.  **Frontend: Crea il Metodo nel Client API**:
    -   Apri `src/ApiClient.ts`.
    -   Aggiungi un nuovo metodo all'interno della classe `ApiClient` che esegua una `fetch` verso il nuovo endpoint.
3.  **Frontend: Gestisci lo Stato**:
    -   Decidi dove vivrà questo nuovo dato. Se è globale, aggiungi una proprietà osservabile allo store MobX appropriato (es. `UserStore` per dati utente, o crea un nuovo `CarStore` per i dati delle auto).
    -   Crea un'azione nello store (es. `fetchMyCars = async () => { ... }`) che invochi il metodo creato in `ApiClient`.
4.  **Frontend: Usa i Dati nel Componente**:
    -   Nel componente React, usa `useStores()` per accedere allo store.
    -   Usa `useEffect` per chiamare l'azione di fetch (es. `carStore.fetchMyCars()`) quando il componente viene montato.
    -   Renderizza i dati osservabili dallo store. Il componente si aggiornerà automaticamente grazie a MobX.

#### **Scenario 3: Modificare lo Schema del Database**

1.  **Crea una Migrazione**: Usa `sequelize-cli` per generare un nuovo file di migrazione. **NON modificare manualmente il database né i file di migrazione esistenti.**
2.  **Definisci le Modifiche**: Scrivi la logica di modifica nelle funzioni `up` (per applicare) e `down` (per annullare) della migrazione.
3.  **Aggiorna il Modello**: Modifica il file del modello corrispondente in `/backend/src/database/models` per riflettere la nuova struttura della tabella.
4.  **Esegui la Migrazione**: Avvia le migrazioni tramite lo script `npm run setup:backend` (o un comando specifico per le migrazioni).

#### **Scenario 4: Interagire con Gemini AI**

1.  **Centralizza la Logica**: Tutte le chiamate all'API di Gemini **devono** passare attraverso l'oggetto `geminiApi` in `src/ApiClient.ts`.
2.  **Gestisci il Fallback**: La logica di `geminiApi` include già un meccanismo di fallback che fornisce dati generici se la chiave API non è presente o se la chiamata fallisce. Assicurati che le tue nuove funzioni rispettino questo pattern per garantire che l'app rimanga funzionale in ogni circostanza.
3.  **Prompt Engineering**: Formula i prompt in modo chiaro e conciso. Specifica sempre il formato di output desiderato (JSON) e definisci uno `responseSchema` per garantire risposte strutturate e affidabili.