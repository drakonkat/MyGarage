import { Router } from 'express';
import { isMechanic } from '../middleware/roleMiddleware.js';
import mechanicController from '../controllers/mechanicController.js';

const router = Router();

// Tutti gli endpoint in questo file richiedono il ruolo 'mechanic'
router.use(isMechanic);

// --- Client Management ---
// Aggiungi un cliente esistente alla tua lista
router.post('/clients', mechanicController.addClient);
// Ottieni la lista dei tuoi clienti
router.get('/clients', mechanicController.getClients);
// Ottieni i dettagli di un cliente specifico
router.get('/clients/:clientId', mechanicController.getClientDetails);

// --- Quote Management ---
// Crea un nuovo preventivo per un cliente
router.post('/quotes', mechanicController.createQuote);
// Ottieni tutti i preventivi che hai creato
router.get('/quotes', mechanicController.getQuotes);

// --- Invoice Management ---
// Crea una nuova fattura (magari da un preventivo)
router.post('/invoices', mechanicController.createInvoice);
// Ottieni tutte le fatture che hai creato
router.get('/invoices', mechanicController.getInvoices);


export default router;
