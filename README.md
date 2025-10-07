# 🚗 Gestione Manutenzione Auto

Un'applicazione web moderna e intuitiva per tracciare, gestire e prevedere la manutenzione dei tuoi veicoli, potenziata dall'intelligenza artificiale di Google Gemini.

## ✨ Funzionalità Principali

- **Dashboard Veicoli**: Tieni traccia di tutte le tue auto in un unico posto.
- **Cronologia Dettagliata**: Registra ogni intervento di manutenzione con data, chilometraggio, costi e note.
- **Raccomandazioni AI**: Ottieni un piano di manutenzione di base generato da Gemini quando aggiungi un nuovo veicolo.
- **Gestione Problemi**: Annota e monitora i problemi noti per ogni auto, segnandoli come risolti quando necessario.
- **Simulatore di Costi**: Prevedi i costi di manutenzione futuri per un veicolo fino a un chilometraggio target, incluse stime per assicurazione e bollo.
- **Ricerca Risorse**: Trova tutorial su YouTube e link per l'acquisto di ricambi per specifici interventi di manutenzione.
- **Import/Export**: Salva e carica i dati dei tuoi veicoli in formato JSON.
- **Tema Personalizzabile**: Scegli tra tema chiaro e scuro e personalizza il colore principale dell'interfaccia.
- **Responsive Design**: Utilizzabile comodamente sia su desktop che su dispositivi mobili.

## 🚀 Come Avviare il Progetto

Questa applicazione è progettata per essere eseguita direttamente nel browser senza un processo di build complesso.

### Prerequisiti

1.  Un browser web moderno (Chrome, Firefox, Safari, Edge).
2.  Un API Key per **Google Gemini API**.

### Configurazione

1.  **Scarica i File**:
    Assicurati di avere tutti i file del progetto (`index.html`, `App.tsx`, `api.ts`, etc.) nella stessa cartella.

2.  **Imposta l'API Key**:
    L'applicazione richiede una chiave API di Google Gemini per funzionare. Questa chiave deve essere disponibile come variabile d'ambiente `process.env.API_KEY`. In un ambiente di sviluppo o in una piattaforma come AI Studio, questa variabile è generalmente pre-configurata. Se esegui il progetto localmente, dovrai trovare un modo per fornire questa variabile al browser (ad esempio, tramite un semplice server Node.js con un processo di build).

3.  **Avvia un Server Locale**:
    Poiché l'applicazione utilizza moduli ES6 (`import`/`export`), non può essere eseguita semplicemente aprendo il file `index.html` dal file system (`file://...`). È necessario servirla tramite un server web locale.
    
    Se hai Python installato, puoi usare il suo server integrato dalla cartella del progetto:
    ```bash
    # Python 3
    python -m http.server
    ```
    
    In alternativa, se hai Node.js, puoi usare `serve`:
    ```bash
    npm install -g serve
    serve .
    ```

4.  **Apri l'App**:
    Apri il tuo browser e naviga all'indirizzo fornito dal tuo server locale (di solito `http://localhost:8000` o `http://localhost:3000`).

## 🛠️ Stack Tecnologico

-   **Frontend**: React, TypeScript
-   **UI Library**: Material-UI (MUI) v7
-   **State Management**: Pattern basato su `useState` e `useEffect`
-   **Intelligenza Artificiale**: Google Gemini API (`@google/genai`)
-   **Storage Locale**: IndexedDB (tramite la libreria `idb`)
-   **Grafici**: Recharts
