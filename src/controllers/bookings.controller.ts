import { Response, NextFunction } from 'express';
import { CreateBookingUseCase } from '../services/bookings/create-booking.usecase';
import { GetUserBookingsUseCase } from '../services/bookings/get-user-bookings.usecase';
import { GetProviderBookingsUseCase } from '../services/bookings/get-provider-bookings.usecase';
import { GetProviderDashboardSummaryUseCase } from '../services/bookings/get-provider-dashboard-summary.usecase';
import { UpdateBookingStatusUseCase } from '../services/bookings/update-booking-status.usecase';
import { createBookingSchema, updateBookingStatusSchema } from '../dtos/booking.dto';
import { IProviderProfileRepository } from '../types/repositories.port';
import { ProviderProfileRepository } from '../repositories/provider-profile.repository';
import { AuthRequest } from '../middlewares/auth.middleware';
import { BOOKING_STATUS, USER_ROLES } from '../config/constants';

export class BookingsController {
  /**
   * Create a new booking
   * POST /api/bookings
   */
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      if (req.user.role !== USER_ROLES.USER) {
        res.status(403).json({ message: 'Only users can create bookings' });
        return;
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
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      if (req.user.role !== USER_ROLES.USER) {
        res.status(403).json({ message: 'Only users can view their bookings' });
        return;
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
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Get provider profile for this user
      const providerProfileRepo = new ProviderProfileRepository();
      const profile = await providerProfileRepo.findByUserId(req.user.id);
      if (!profile) {
        res.status(404).json({ message: 'Provider profile not found' });
        return;
      }

      const status = req.query.status as string | undefined;
      // Normalize status: "ALL" means no filter
      const normalizedStatus = status && status !== 'ALL' ? (status as any) : undefined;
      const useCase = new GetProviderBookingsUseCase();
      const bookings = await useCase.execute(profile.id, normalizedStatus);

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
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      
      // DEBUG: Log request details
      console.info('[ACCEPT BOOKING REQUEST]', {
        bookingId: id,
        reqUserId: req.user.id,
        reqUserEmail: req.user.email,
        reqUserRole: req.user.role,
      });

      const providerProfileRepo = new ProviderProfileRepository();
      const profile = await providerProfileRepo.findByUserId(req.user.id);
      if (!profile) {
        console.error('[ACCEPT BOOKING] Provider profile not found for user:', req.user.id);
        res.status(404).json({ message: 'Provider profile not found' });
        return;
      }

      // DEBUG: Log profile details
      console.info('[ACCEPT BOOKING] Provider profile found:', {
        profileId: profile.id,
        profileUserId: profile.userId,
        profileActive: profile.active,
        profileVerificationStatus: profile.verificationStatus,
      });

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
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const providerProfileRepo = new ProviderProfileRepository();
      const profile = await providerProfileRepo.findByUserId(req.user.id);
      if (!profile) {
        res.status(404).json({ message: 'Provider profile not found' });
        return;
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
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const providerProfileRepo = new ProviderProfileRepository();
      const profile = await providerProfileRepo.findByUserId(req.user.id);
      if (!profile) {
        res.status(404).json({ message: 'Provider profile not found' });
        return;
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
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const reqUserId = req.user.id; // Always use req.user.id (string) from auth middleware
      
      // Log before ownership check for debugging
      console.info('[USER CANCEL]', {
        bookingId: id,
        reqUserId: reqUserId,
        reqUserRole: req.user.role,
      });

      const useCase = new UpdateBookingStatusUseCase();
      const booking = await useCase.execute(id, BOOKING_STATUS.CANCELLED, reqUserId, false);

      res.status(200).json({
        message: 'Booking cancelled successfully',
        booking,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel booking (provider)
   * PATCH /api/provider/bookings/:id/cancel
   */
  async cancelProviderBooking(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const providerProfileRepo = new ProviderProfileRepository();
      const profile = await providerProfileRepo.findByUserId(req.user.id);
      if (!profile) {
        res.status(404).json({ message: 'Provider profile not found' });
        return;
      }

      const useCase = new UpdateBookingStatusUseCase();
      const booking = await useCase.execute(id, BOOKING_STATUS.CANCELLED, profile.id, true);

      res.status(200).json({
        message: 'Booking cancelled successfully',
        booking,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update booking status (provider) - Unified endpoint
   * PATCH /api/provider/bookings/:id/status
   */
  async updateBookingStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized', code: 'UNAUTHORIZED' });
        return;
      }

      const { id } = req.params;
      const dto = updateBookingStatusSchema.parse(req.body);

      // DEBUG: Log request details
      console.info('[UPDATE BOOKING STATUS REQUEST]', {
        bookingId: id,
        newStatus: dto.status,
        reqUserId: req.user.id,
        reqUserEmail: req.user.email,
        reqUserRole: req.user.role,
      });

      // Get provider profile for this user
      const providerProfileRepo = new ProviderProfileRepository();
      const profile = await providerProfileRepo.findByUserId(req.user.id);
      if (!profile) {
        console.error('[UPDATE BOOKING STATUS] Provider profile not found for user:', req.user.id);
        res.status(404).json({ message: 'Provider profile not found', code: 'PROVIDER_PROFILE_NOT_FOUND' });
        return;
      }

      // DEBUG: Log profile details
      console.info('[UPDATE BOOKING STATUS] Provider profile found:', {
        profileId: profile.id,
        profileUserId: profile.userId,
        profileActive: profile.active,
        profileVerificationStatus: profile.verificationStatus,
      });

      const useCase = new UpdateBookingStatusUseCase();
      const booking = await useCase.execute(id, dto.status, profile.id, true);

      let message = 'Booking status updated successfully';
      if (dto.status === 'CONFIRMED') {
        message = 'Booking accepted successfully';
      } else if (dto.status === 'DECLINED') {
        message = 'Booking declined successfully';
      } else if (dto.status === 'COMPLETED') {
        message = 'Booking marked as completed';
      } else if (dto.status === 'CANCELLED') {
        message = 'Booking cancelled successfully';
      }

      res.status(200).json({
        message,
        booking,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get provider dashboard summary
   * GET /api/provider/dashboard/summary
   */
  async getProviderDashboardSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized', code: 'UNAUTHORIZED' });
        return;
      }

      // Get provider profile for this user
      const providerProfileRepo = new ProviderProfileRepository();
      const profile = await providerProfileRepo.findByUserId(req.user.id);
      if (!profile) {
        res.status(404).json({ message: 'Provider profile not found', code: 'PROVIDER_PROFILE_NOT_FOUND' });
        return;
      }

      const useCase = new GetProviderDashboardSummaryUseCase();
      const summary = await useCase.execute(profile.id);

      res.status(200).json(summary);
    } catch (error) {
      next(error);
    }
  }
}
