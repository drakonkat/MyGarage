import { Router } from 'express';
import clientController from '../controllers/clientController.js';

const router = Router();

// Questi endpoint sono per l'utente loggato per visualizzare le proprie informazioni
// L'ID utente viene preso dal token (req.user.id)

// Visualizza le mie auto
router.get('/cars', clientController.getMyCars);

// Visualizza i preventivi che ho ricevuto
router.get('/quotes', clientController.getMyQuotes);

// Visualizza le fatture che ho ricevuto
router.get('/invoices', clientController.getMyInvoices);


export default router;
