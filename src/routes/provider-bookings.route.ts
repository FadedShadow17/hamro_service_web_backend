import { Router } from 'express';
import { BookingsController } from '../controllers/bookings.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { requireVerification } from '../middlewares/verification.middleware';
import { USER_ROLES } from '../config/constants';

const router = Router();
const bookingsController = new BookingsController();

router.get('/', requireAuth, requireRole(USER_ROLES.PROVIDER), (req, res, next) =>
  bookingsController.getProviderBookings(req, res, next)
);

router.patch('/:id/accept', requireAuth, requireRole(USER_ROLES.PROVIDER), requireVerification, (req, res, next) =>
  bookingsController.acceptBooking(req, res, next)
);

router.patch('/:id/decline', requireAuth, requireRole(USER_ROLES.PROVIDER), (req, res, next) =>
  bookingsController.declineBooking(req, res, next)
);

router.patch('/:id/complete', requireAuth, requireRole(USER_ROLES.PROVIDER), requireVerification, (req, res, next) =>
  bookingsController.completeBooking(req, res, next)
);

router.patch('/:id/cancel', requireAuth, requireRole(USER_ROLES.PROVIDER), (req, res, next) =>
  bookingsController.cancelProviderBooking(req, res, next)
);





router.patch('/:id/status', requireAuth, requireRole(USER_ROLES.PROVIDER), (req, res, next) =>
  bookingsController.updateBookingStatus(req, res, next)
);

export default router;
