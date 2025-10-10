import { Router } from 'express';
import authController from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import mechanicRoutes from './mechanicRoutes.js';
import clientRoutes from './clientRoutes.js';

const router = Router();

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// Mechanic routes (protected)
router.use('/mechanic', authMiddleware, mechanicRoutes);

// Client routes (protected)
router.use('/client', authMiddleware, clientRoutes);


export default router;