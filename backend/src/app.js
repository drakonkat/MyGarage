import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './database/models/index.js';
import routes from './routes/index.js';
import reminderScheduler from './jobs/reminderScheduler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve i file statici del frontend buildato
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/v1', routes);

// Per tutte le altre richieste non-API, serve l'app React (per il routing client-side)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

const PORT = process.env.PORT || 3001;

db.sequelize.sync().then(() => {
  console.log('Database connected successfully.');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // Avvia lo scheduler per i promemoria
    reminderScheduler.start();
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});
