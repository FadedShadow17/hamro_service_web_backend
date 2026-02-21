import { Router } from 'express';
import { ServicesController } from '../controllers/services.controller';

const router = Router();
const servicesController = new ServicesController();

router.get('/', (req, res, next) => servicesController.list(req, res, next));

router.get('/:id', (req, res, next) => servicesController.getById(req, res, next));

router.get('/:id/providers', (req, res, next) => servicesController.getAvailableProviders(req, res, next));

export default router;
