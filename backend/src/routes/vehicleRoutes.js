import { Router } from 'express';
import vehicleController from '../controllers/vehicleController.js';

const router = Router();

// Questi endpoint servono per popolare gli autocomplete nel frontend
router.get('/makes', vehicleController.getMakes);
router.get('/models/:makeId', vehicleController.getModels);
router.get('/vehicles/:modelId', vehicleController.getVehicles);

// Nuovo endpoint per la ricerca tramite targa
router.post('/search-by-plate', vehicleController.searchByPlate);

export default router;