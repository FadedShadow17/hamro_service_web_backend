import { Router } from 'express';
import { BookingsController } from '../controllers/bookings.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { USER_ROLES } from '../config/constants';

const router = Router();
const bookingsController = new BookingsController();

// POST /api/bookings - Create booking (user only)
router.post('/', requireAuth, requireRole(USER_ROLES.USER), (req, res, next) =>
  bookingsController.create(req, res, next)
);

// GET /api/bookings/my - Get user's bookings (user only)
router.get('/my', requireAuth, requireRole(USER_ROLES.USER), (req, res, next) =>
  bookingsController.getMyBookings(req, res, next)
);

// PATCH /api/bookings/:id/cancel - Cancel booking (user only)
router.patch('/:id/cancel', requireAuth, requireRole(USER_ROLES.USER), (req, res, next) =>
  bookingsController.cancelBooking(req, res, next)
);

export default router;
