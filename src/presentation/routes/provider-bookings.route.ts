import { Router } from 'express';
import { BookingsController } from '../controllers/bookings.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { requireVerification } from '../middlewares/verification.middleware';
import { USER_ROLES } from '../../shared/constants';

const router = Router();
const bookingsController = new BookingsController();

// GET /api/provider/bookings - Get provider's bookings
router.get('/', requireAuth, requireRole(USER_ROLES.PROVIDER), (req, res, next) =>
  bookingsController.getProviderBookings(req, res, next)
);

// PATCH /api/provider/bookings/:id/accept - Accept booking (requires verification)
router.patch('/:id/accept', requireAuth, requireRole(USER_ROLES.PROVIDER), requireVerification, (req, res, next) =>
  bookingsController.acceptBooking(req, res, next)
);

// PATCH /api/provider/bookings/:id/decline - Decline booking
router.patch('/:id/decline', requireAuth, requireRole(USER_ROLES.PROVIDER), (req, res, next) =>
  bookingsController.declineBooking(req, res, next)
);

// PATCH /api/provider/bookings/:id/complete - Complete booking (requires verification)
router.patch('/:id/complete', requireAuth, requireRole(USER_ROLES.PROVIDER), requireVerification, (req, res, next) =>
  bookingsController.completeBooking(req, res, next)
);

// PATCH /api/provider/bookings/:id/status - Update booking status (unified endpoint)
// Note: This endpoint requires verification for CONFIRMED and COMPLETED statuses
// The requireVerification middleware should be applied conditionally, but for now
// we'll keep the existing separate endpoints for backward compatibility
// This unified endpoint can be used for future frontend implementations
router.patch('/:id/status', requireAuth, requireRole(USER_ROLES.PROVIDER), (req, res, next) =>
  bookingsController.updateBookingStatus(req, res, next)
);

export default router;

