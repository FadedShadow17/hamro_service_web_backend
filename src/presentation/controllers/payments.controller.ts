import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { GetPayableBookingsUseCase } from '../../application/usecases/payments/get-payable-bookings.usecase';
import { PayForBookingUseCase } from '../../application/usecases/payments/pay-for-booking.usecase';
import { payForBookingSchema } from '../../application/dtos/payment.dto';
import { USER_ROLES } from '../../shared/constants';

export class PaymentsController {
  /**
   * Get user's payable bookings (CONFIRMED status only)
   * GET /api/payments/me
   */
  async getMyPayableBookings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized', code: 'UNAUTHORIZED' });
      }

      if (req.user.role !== USER_ROLES.USER) {
        return res.status(403).json({ message: 'Only users can view their payments', code: 'FORBIDDEN' });
      }

      const useCase = new GetPayableBookingsUseCase();
      const bookings = await useCase.execute(req.user.id);

      res.status(200).json({ bookings });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Pay for a booking
   * POST /api/payments/:bookingId/pay
   */
  async payForBooking(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized', code: 'UNAUTHORIZED' });
      }

      if (req.user.role !== USER_ROLES.USER) {
        return res.status(403).json({ message: 'Only users can make payments', code: 'FORBIDDEN' });
      }

      const { bookingId } = req.params;
      const dto = payForBookingSchema.parse(req.body);

      const useCase = new PayForBookingUseCase();
      const booking = await useCase.execute(bookingId, req.user.id, dto.paymentMethod);

      res.status(200).json({
        message: 'Payment processed successfully',
        booking,
      });
    } catch (error) {
      next(error);
    }
  }
}

