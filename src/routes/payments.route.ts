import { Router } from 'express';
import { PaymentsController } from '../controllers/payments.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { USER_ROLES } from '../config/constants';

const router = Router();
const paymentsController = new PaymentsController();

// GET /api/payments/me - Get user's payable bookings
router.get('/me', requireAuth, requireRole(USER_ROLES.USER), (req, res, next) =>
  paymentsController.getMyPayableBookings(req, res, next)
);

// POST /api/payments/:bookingId/pay - Pay for a booking
router.post('/:bookingId/pay', requireAuth, requireRole(USER_ROLES.USER), (req, res, next) =>
  paymentsController.payForBooking(req, res, next)
);

export default router;
