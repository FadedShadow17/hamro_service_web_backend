import { Router } from 'express';
import { PaymentsController } from '../controllers/payments.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { USER_ROLES } from '../config/constants';

const router = Router();
const paymentsController = new PaymentsController();

router.get('/me', requireAuth, requireRole(USER_ROLES.USER), (req, res, next) =>
  paymentsController.getMyPayableBookings(req, res, next)
);

router.post('/:bookingId/pay', requireAuth, requireRole(USER_ROLES.USER), (req, res, next) =>
  paymentsController.payForBooking(req, res, next)
);

router.get('/me/history', requireAuth, requireRole(USER_ROLES.USER), (req, res, next) =>
  paymentsController.getPaymentHistory(req, res, next)
);

export default router;
