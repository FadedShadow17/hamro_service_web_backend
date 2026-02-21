import { Router } from 'express';
import { ServicesController } from '../controllers/services.controller';

const router = Router();
const servicesController = new ServicesController();

router.get('/', (req, res, next) => servicesController.listCategories(req, res, next));

export default router;
