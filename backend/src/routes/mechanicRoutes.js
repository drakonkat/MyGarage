import { Router } from 'express';
import { isMechanic } from '../middleware/roleMiddleware.js';
import mechanicController from '../controllers/mechanicController.js';

const router = Router();

// All routes here are protected by the main authMiddleware and the isMechanic role check
router.use(isMechanic);

// Dashboard
router.get('/stats', mechanicController.getDashboardStats);

// Clients
router.get('/clients', mechanicController.getClients);
router.post('/clients', mechanicController.createClient);
router.get('/clients/:id', mechanicController.getClientDetails);

// Cars (associated with clients)
router.post('/clients/:clientId/cars', mechanicController.addCarToClient);

// Maintenance Records (associated with cars)
router.post('/cars/:carId/maintenance', mechanicController.addMaintenanceRecord);
router.delete('/maintenance/:recordId', mechanicController.deleteMaintenanceRecord);

// Quotes
router.get('/quotes', mechanicController.getQuotes);
router.post('/quotes', mechanicController.createQuote);

// Invoices
router.get('/invoices', mechanicController.getInvoices);
router.post('/invoices', mechanicController.createInvoice);

// Inventory
router.get('/inventory', mechanicController.getInventory);
router.post('/inventory', mechanicController.addInventoryItem);
router.put('/inventory/:id', mechanicController.updateInventoryItem);
router.delete('/inventory/:id', mechanicController.deleteInventoryItem);

export default router;
