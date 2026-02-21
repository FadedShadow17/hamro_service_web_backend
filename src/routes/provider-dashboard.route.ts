import { Router } from 'express';
import { BookingsController } from '../controllers/bookings.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { USER_ROLES } from '../config/constants';

const router = Router();
const bookingsController = new BookingsController();

router.get('/summary', requireAuth, requireRole(USER_ROLES.PROVIDER), (req, res, next) =>
  bookingsController.getProviderDashboardSummary(req, res, next)
);

export default router;
