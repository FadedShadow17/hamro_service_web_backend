import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { GetPayableBookingsUseCase } from '../services/payments/get-payable-bookings.usecase';
import { PayForBookingUseCase } from '../services/payments/pay-for-booking.usecase';
import { payForBookingSchema } from '../dtos/payment.dto';
import { USER_ROLES } from '../config/constants';

export class PaymentsController {
  
  async getMyPayableBookings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized', code: 'UNAUTHORIZED' });
        return;
      }

      if (req.user.role !== USER_ROLES.USER) {
        res.status(403).json({ message: 'Only users can view their payments', code: 'FORBIDDEN' });
        return;
      }

      const useCase = new GetPayableBookingsUseCase();
      const bookings = await useCase.execute(req.user.id);

      res.status(200).json({ bookings });
    } catch (error) {
      next(error);
    }
  }

  
  async payForBooking(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized', code: 'UNAUTHORIZED' });
        return;
      }

      if (req.user.role !== USER_ROLES.USER) {
        res.status(403).json({ message: 'Only users can make payments', code: 'FORBIDDEN' });
        return;
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
