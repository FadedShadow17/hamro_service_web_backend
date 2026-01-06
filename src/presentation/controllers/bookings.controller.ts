import { Response, NextFunction } from 'express';
import { CreateBookingUseCase } from '../../application/usecases/bookings/create-booking.usecase';
import { GetUserBookingsUseCase } from '../../application/usecases/bookings/get-user-bookings.usecase';
import { GetProviderBookingsUseCase } from '../../application/usecases/bookings/get-provider-bookings.usecase';
import { UpdateBookingStatusUseCase } from '../../application/usecases/bookings/update-booking-status.usecase';
import { createBookingSchema } from '../../application/dtos/booking.dto';
import { IProviderProfileRepository } from '../../application/ports/repositories.port';
import { ProviderProfileRepository } from '../../infrastructure/db/mongoose/repositories/provider-profile.repository';
import { AuthRequest } from '../middlewares/auth.middleware';
import { BOOKING_STATUS, USER_ROLES } from '../../shared/constants';

export class BookingsController {
  /**
   * Create a new booking
   * POST /api/bookings
   */
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (req.user.role !== USER_ROLES.USER) {
        return res.status(403).json({ message: 'Only users can create bookings' });
      }

      const dto = createBookingSchema.parse(req.body);
      const useCase = new CreateBookingUseCase();
      const booking = await useCase.execute(req.user.id, dto);

      res.status(201).json({
        message: 'Booking created successfully',
        booking,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's bookings
   * GET /api/bookings/my
   */
  async getMyBookings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (req.user.role !== USER_ROLES.USER) {
        return res.status(403).json({ message: 'Only users can view their bookings' });
      }

      const status = req.query.status as string | undefined;
      const useCase = new GetUserBookingsUseCase();
      const bookings = await useCase.execute(req.user.id, status as any);

      res.status(200).json({ bookings });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get provider's bookings
   * GET /api/provider/bookings
   */
  async getProviderBookings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Get provider profile for this user
      const providerProfileRepo = new ProviderProfileRepository();
      const profile = await providerProfileRepo.findByUserId(req.user.id);
      if (!profile) {
        return res.status(404).json({ message: 'Provider profile not found' });
      }

      const status = req.query.status as string | undefined;
      const useCase = new GetProviderBookingsUseCase();
      const bookings = await useCase.execute(profile.id, status as any);

      res.status(200).json({ bookings });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Accept booking (provider)
   * PATCH /api/provider/bookings/:id/accept
   */
  async acceptBooking(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { id } = req.params;
      const providerProfileRepo = new ProviderProfileRepository();
      const profile = await providerProfileRepo.findByUserId(req.user.id);
      if (!profile) {
        return res.status(404).json({ message: 'Provider profile not found' });
      }

      const useCase = new UpdateBookingStatusUseCase();
      const booking = await useCase.execute(id, BOOKING_STATUS.CONFIRMED, profile.id, true);

      res.status(200).json({
        message: 'Booking accepted successfully',
        booking,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Decline booking (provider)
   * PATCH /api/provider/bookings/:id/decline
   */
  async declineBooking(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { id } = req.params;
      const providerProfileRepo = new ProviderProfileRepository();
      const profile = await providerProfileRepo.findByUserId(req.user.id);
      if (!profile) {
        return res.status(404).json({ message: 'Provider profile not found' });
      }

      const useCase = new UpdateBookingStatusUseCase();
      const booking = await useCase.execute(id, BOOKING_STATUS.DECLINED, profile.id, true);

      res.status(200).json({
        message: 'Booking declined successfully',
        booking,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete booking (provider)
   * PATCH /api/provider/bookings/:id/complete
   */
  async completeBooking(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { id } = req.params;
      const providerProfileRepo = new ProviderProfileRepository();
      const profile = await providerProfileRepo.findByUserId(req.user.id);
      if (!profile) {
        return res.status(404).json({ message: 'Provider profile not found' });
      }

      const useCase = new UpdateBookingStatusUseCase();
      const booking = await useCase.execute(id, BOOKING_STATUS.COMPLETED, profile.id, true);

      res.status(200).json({
        message: 'Booking marked as completed',
        booking,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel booking (user)
   * PATCH /api/bookings/:id/cancel
   */
  async cancelBooking(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { id } = req.params;
      const useCase = new UpdateBookingStatusUseCase();
      const booking = await useCase.execute(id, BOOKING_STATUS.CANCELLED, req.user.id, false);

      res.status(200).json({
        message: 'Booking cancelled successfully',
        booking,
      });
    } catch (error) {
      next(error);
    }
  }
}

