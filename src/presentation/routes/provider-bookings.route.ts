import { Router } from 'express';
import { BookingsController } from '../controllers/bookings.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { USER_ROLES } from '../../shared/constants';

const router = Router();
const bookingsController = new BookingsController();

// GET /api/provider/bookings - Get provider's bookings
router.get('/', requireAuth, requireRole(USER_ROLES.PROVIDER), (req, res, next) =>
  bookingsController.getProviderBookings(req, res, next)
);

// PATCH /api/provider/bookings/:id/accept - Accept booking
router.patch('/:id/accept', requireAuth, requireRole(USER_ROLES.PROVIDER), (req, res, next) =>
  bookingsController.acceptBooking(req, res, next)
);

// PATCH /api/provider/bookings/:id/decline - Decline booking
router.patch('/:id/decline', requireAuth, requireRole(USER_ROLES.PROVIDER), (req, res, next) =>
  bookingsController.declineBooking(req, res, next)
);

// PATCH /api/provider/bookings/:id/complete - Complete booking
router.patch('/:id/complete', requireAuth, requireRole(USER_ROLES.PROVIDER), (req, res, next) =>
  bookingsController.completeBooking(req, res, next)
);

export default router;

