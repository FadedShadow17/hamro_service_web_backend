import { Router } from 'express';
import { BookingsController } from '../controllers/bookings.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { USER_ROLES } from '../config/constants';

const router = Router();
const bookingsController = new BookingsController();

router.post('/', requireAuth, requireRole(USER_ROLES.USER), (req, res, next) =>
  bookingsController.create(req, res, next)
);

router.get('/my', requireAuth, requireRole(USER_ROLES.USER), (req, res, next) =>
  bookingsController.getMyBookings(req, res, next)
);

router.patch('/:id/cancel', requireAuth, requireRole(USER_ROLES.USER), (req, res, next) =>
  bookingsController.cancelBooking(req, res, next)
);

router.patch('/:id', requireAuth, requireRole(USER_ROLES.USER), (req, res, next) =>
  bookingsController.updateBooking(req, res, next)
);

export default router;
