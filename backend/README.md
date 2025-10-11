# 🚗 Backend Gestione Manutenzione Auto

Questo è il backend per l'applicazione di gestione della manutenzione auto. È costruito con Node.js, Express e Sequelize e supporta sia **PostgreSQL** che **MySQL**.

## 🚀 Primi Passi

### 1. Prerequisiti

-   [Node.js](https://nodejs.org/) (versione 18 o superiore)
-   [PostgreSQL](https://www.postgresql.org/) o [MySQL](https://www.mysql.com/) installato e in esecuzione.
-   `npm` (incluso con Node.js)

### 2. Configurazione

La configurazione del backend è gestita tramite variabili d'ambiente.

1.  **Crea il file `.env`**: Posizionati nella cartella `backend` ed esegui questo comando per creare una copia del file di esempio:

    ```bash
    cp .env.example .env
    ```

2.  **Modifica il file `.env`**: Apri il file `backend/.env` e inserisci le tue credenziali per il database, il server email (SMTP) e un segreto per i token di autenticazione. Troverai commenti dettagliati nel file `.env.example` per guidarti.

    **Esempio di configurazione:**
    ```env
    # --- Server Configuration ---
    PORT=3001

    # --- Database Configuration ---
    # Scegli il dialetto: 'postgres' o 'mysql'
    DB_DIALECT=postgres
    DB_HOST=localhost
    DB_DATABASE=car_maintenance_db
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password

    # --- JSON Web Token (JWT) Configuration ---
    JWT_SECRET=change_this_to_a_long_random_secret_string
    JWT_EXPIRES_IN=1d

    # --- Email (SMTP) Configuration ---
    # Esempio per Mailtrap.io (sviluppo)
    EMAIL_HOST=smtp.mailtrap.io
    EMAIL_PORT=2525
    EMAIL_USER=your_smtp_username
    EMAIL_PASS=your_smtp_password
    EMAIL_FROM='"Car Maintenance App" <no-reply@yourdomain.com>'
    ```
    
3.  **Crea il Database**: Assicurati che il tuo server di database (PostgreSQL o MySQL) sia in esecuzione, e crea un database con il nome che hai specificato in `DB_DATABASE` (es. `car_maintenance_db`).


### 3. Installazione e Setup

Dalla cartella **principale** del progetto, esegui lo script di setup. Questo comando installerà le dipendenze del backend ed eseguirà le migrazioni del database per creare le tabelle.

```bash
npm run setup:backend
```

### 4. Avviare il Server

Per avviare il server in modalità sviluppo (con riavvio automatico):

```bash
npm run dev:backend
```

Per avviare il server in modalità produzione:

```bash
npm run start:backend
```

Il server sarà in esecuzione su `http://localhost:3001` (o la porta definita nel `.env`).

## 🛠️ Struttura del Progetto

-   `src/app.js`: File di ingresso principale, configurazione di Express.
-   `src/config/`: Configurazione del database per Sequelize.
-   `src/controllers/`: Logica di business per gestire le richieste HTTP.
-   `src/database/migrations/`: File di migrazione per definire lo schema del database.
-   `src/database/models/`: Modelli Sequelize che rappresentano le tabelle del database.
-   `src/database/seeders/`: Dati di esempio per popolare il database.
-   `src/jobs/`: Task pianificati (es. invio email di promemoria).
-   `src/middleware/`: Middleware di Express (es. per l'autenticazione).
-   `src/routes/`: Definizione degli endpoint dell'API.
-   `src/services/`: Servizi riutilizzabili (es. servizio email).
