import { Router } from 'express';
import { isMechanic } from '../middleware/roleMiddleware.js';
import mechanicController from '../controllers/mechanicController.js';

const router = Router();

// Tutti gli endpoint in questo file richiedono il ruolo 'mechanic'
router.use(isMechanic);

// --- Dashboard ---
router.get('/dashboard-stats', mechanicController.getDashboardStats);

// --- Client Management ---
router.get('/clients', mechanicController.getClients);
router.post('/clients', mechanicController.createClient);
router.get('/clients/:clientId', mechanicController.getClientDetails);
router.post('/clients/:clientId/cars', mechanicController.createCarForClient);


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