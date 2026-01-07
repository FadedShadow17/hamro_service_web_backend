import { Router } from 'express';
import { BookingsController } from '../controllers/bookings.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { USER_ROLES } from '../../shared/constants';

const router = Router();
const bookingsController = new BookingsController();

// GET /api/provider/dashboard/summary - Get provider dashboard summary
router.get('/summary', requireAuth, requireRole(USER_ROLES.PROVIDER), (req, res, next) =>
  bookingsController.getProviderDashboardSummary(req, res, next)
);

export default router;

