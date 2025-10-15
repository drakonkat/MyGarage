import { Router } from 'express';
import vehicleController from '../controllers/vehicleController.js';

const router = Router();

// Questi endpoint servono per popolare gli autocomplete nel frontend
router.get('/makes', vehicleController.getMakes);
router.get('/models/:makeId', vehicleController.getModels);
router.get('/vehicles/:modelId', vehicleController.getVehicles);

export default router;