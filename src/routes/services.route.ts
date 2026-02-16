import { Router } from 'express';
import { ServicesController } from '../controllers/services.controller';

const router = Router();
const servicesController = new ServicesController();

// GET /api/services
router.get('/', (req, res, next) => servicesController.list(req, res, next));

// GET /api/services/:id
router.get('/:id', (req, res, next) => servicesController.getById(req, res, next));

// GET /api/services/:id/providers
router.get('/:id/providers', (req, res, next) => servicesController.getAvailableProviders(req, res, next));

export default router;
