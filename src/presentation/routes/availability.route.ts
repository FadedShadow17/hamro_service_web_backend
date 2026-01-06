import { Router } from 'express';
import { AvailabilityController } from '../controllers/availability.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { USER_ROLES } from '../../shared/constants';

const router = Router();
const availabilityController = new AvailabilityController();

// GET /api/provider/availability
router.get('/', requireAuth, requireRole(USER_ROLES.PROVIDER), (req, res, next) =>
  availabilityController.get(req, res, next)
);

// PUT /api/provider/availability
router.put('/', requireAuth, requireRole(USER_ROLES.PROVIDER), (req, res, next) =>
  availabilityController.update(req, res, next)
);

export default router;

