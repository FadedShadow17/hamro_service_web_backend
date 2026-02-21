import { Router } from 'express';
import { AvailabilityController } from '../controllers/availability.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { USER_ROLES } from '../config/constants';

const router = Router();
const availabilityController = new AvailabilityController();

router.get('/', requireAuth, requireRole(USER_ROLES.PROVIDER), (req, res, next) =>
  availabilityController.get(req, res, next)
);

router.put('/', requireAuth, requireRole(USER_ROLES.PROVIDER), (req, res, next) =>
  availabilityController.update(req, res, next)
);

export default router;
