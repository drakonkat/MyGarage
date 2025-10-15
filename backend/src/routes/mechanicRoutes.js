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

// --- Maintenance Management ---
router.post('/cars/:carId/maintenance', mechanicController.addMaintenanceRecordToCar);
router.delete('/maintenance/:recordId', mechanicController.deleteMaintenanceRecord);


// --- Quote Management ---
router.post('/quotes', mechanicController.createQuote);
router.get('/quotes', mechanicController.getQuotes);

// --- Invoice Management ---
router.post('/invoices', mechanicController.createInvoice);
router.get('/invoices', mechanicController.getInvoices);

// --- Inventory Management ---
router.get('/inventory', mechanicController.getInventory);
router.post('/inventory', mechanicController.createInventoryItem);
router.put('/inventory/:itemId', mechanicController.updateInventoryItem);
router.delete('/inventory/:itemId', mechanicController.deleteInventoryItem);


export default router;