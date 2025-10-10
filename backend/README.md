# 🚗 Backend Gestione Manutenzione Auto

Questo è il backend per l'applicazione di gestione della manutenzione auto. È costruito con Node.js, Express e Sequelize.

## 🚀 Primi Passi

Segui questi passaggi per configurare ed eseguire il backend localmente.

### 1. Prerequisiti

-   [Node.js](https://nodejs.org/) (versione 18 o superiore)
-   [PostgreSQL](https://www.postgresql.org/) installato e in esecuzione.
-   `npm` (incluso con Node.js)

### 2. Installazione

Dalla cartella principale del progetto, esegui lo script di setup che installerà le dipendenze del backend:

```bash
npm run setup:backend
```

Questo comando farà due cose:
1.  Eseguirà `npm install` all'interno della cartella `/backend`.
2.  Eseguirà le migrazioni del database e i seeder.

### 3. Configurazione del Database

1.  Assicurati che il tuo server PostgreSQL sia in esecuzione.
2.  Crea un database. Ad esempio, `car_maintenance_db`.
3.  Crea un utente del database con i permessi per accedere al database appena creato.

### 4. Variabili d'Ambiente

1.  Crea una copia del file `.env.example` e rinominala in `.env` all'interno della cartella `backend`.

    ```bash
    cp .env.example .env
    ```

2.  Modifica il file `.env` con le tue configurazioni:

    ```env
    # Impostazioni Database
    DB_DATABASE=car_maintenance_db
    DB_USER=il_tuo_utente_postgres
    DB_PASSWORD=la_tua_password
    DB_HOST=localhost
    DB_DIALECT=postgres

    # Segreto per JWT
    JWT_SECRET=un_segreto_molto_difficile_da_indovinare

    # Impostazioni Email (esempio con Mailtrap o un servizio SMTP)
    EMAIL_HOST=smtp.mailtrap.io
    EMAIL_PORT=2525
    EMAIL_USER=il_tuo_utente_smtp
    EMAIL_PASS=la_tua_password_smtp
    EMAIL_FROM='"Car Maintenance App" <no-reply@carapp.com>'
    ```

### 5. Eseguire le Migrazioni

Se non hai usato lo script `setup:backend`, puoi eseguire le migrazioni manualmente per creare le tabelle nel database:

```bash
npm run db:migrate --prefix backend
```

### 6. Avviare il Server

Per avviare il server in modalità sviluppo (con riavvio automatico grazie a `nodemon`):

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
