import { IBookingRepository, IServiceRepository, IProviderProfileRepository } from '../../ports/repositories.port';
import { BookingRepository } from '../../../infrastructure/db/mongoose/repositories/booking.repository';
import { ServiceRepository } from '../../../infrastructure/db/mongoose/repositories/service.repository';
import { ProviderProfileRepository } from '../../../infrastructure/db/mongoose/repositories/provider-profile.repository';
import { BookingEntity } from '../../../domain/entities/booking.entity';
import { BookingStatus } from '../../../shared/constants';
import { HttpError } from '../../../shared/errors/http-error';

export class UpdateBookingStatusUseCase {
  private bookingRepository: IBookingRepository;
  private serviceRepository: IServiceRepository;
  private providerProfileRepository: IProviderProfileRepository;

  constructor(
    bookingRepository?: IBookingRepository,
    serviceRepository?: IServiceRepository,
    providerProfileRepository?: IProviderProfileRepository
  ) {
    this.bookingRepository = bookingRepository || new BookingRepository();
    this.serviceRepository = serviceRepository || new ServiceRepository();
    this.providerProfileRepository = providerProfileRepository || new ProviderProfileRepository();
  }

  async execute(bookingId: string, status: BookingStatus, userId?: string, isProvider?: boolean): Promise<BookingEntity> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new HttpError(404, 'Booking not found', undefined, 'BOOKING_NOT_FOUND');
    }

    const fromStatus = booking.status;
    const toStatus = status;

    // Validate status transitions
    if (isProvider) {
      // Provider can only accept, decline, or complete
      if (status !== 'CONFIRMED' && status !== 'DECLINED' && status !== 'COMPLETED') {
        throw new HttpError(400, 'Invalid status for provider action', undefined, 'INVALID_PROVIDER_STATUS');
      }
      
      // Check if booking belongs to this provider
      // SAFE comparison: convert both to strings and handle null/undefined
      if (!userId) {
        throw new HttpError(400, 'Provider ID is required', undefined, 'PROVIDER_ID_REQUIRED');
      }
      
      if (!booking.providerId) {
        throw new HttpError(403, 'Unauthorized: Booking does not have an assigned provider', undefined, 'NO_PROVIDER_ASSIGNED');
      }
      
      // Convert both to strings for safe comparison
      const bookingProviderIdStr = String(booking.providerId);
      const userIdStr = String(userId);
      
      if (bookingProviderIdStr !== userIdStr) {
        console.error('[Booking Status Update] Provider ownership mismatch:', {
          bookingId,
          bookingProviderId: bookingProviderIdStr,
          requestedProviderId: userIdStr,
          bookingProviderIdType: typeof booking.providerId,
          userIdType: typeof userId,
        });
        throw new HttpError(403, 'This booking is not assigned to you', undefined, 'BOOKING_NOT_ASSIGNED');
      }

      // Category restriction: Check if provider's service role matches booking's service category
      // Only check for ACCEPT/DECLINE actions (not COMPLETED, as that's after acceptance)
      if (status === 'CONFIRMED' || status === 'DECLINED') {
        // Fetch service to get service name/category
        const service = await this.serviceRepository.findById(booking.serviceId);
        if (!service) {
          throw new HttpError(404, 'Service not found for this booking', undefined, 'SERVICE_NOT_FOUND');
        }

        // Fetch provider profile to get service role
        const providerProfile = await this.providerProfileRepository.findById(userId);
        if (!providerProfile) {
          throw new HttpError(404, 'Provider profile not found', undefined, 'PROVIDER_PROFILE_NOT_FOUND');
        }

        // Map service name to expected provider role (same logic as create-booking)
        const roleMapping: Record<string, string> = {
          'electrical': 'Electrician',
          'plumbing': 'Plumber',
          'cleaning': 'Cleaner',
          'carpentry': 'Carpenter',
          'painting': 'Painter',
          'hvac': 'HVAC Technician',
          'appliance repair': 'Appliance Repair Technician',
          'gardening': 'Gardener/Landscaper',
          'pest control': 'Pest Control Specialist',
          'water tank cleaning': 'Water Tank Cleaner',
        };

        const serviceName = service.name.toLowerCase().trim();
        const expectedRole = roleMapping[serviceName];

        // If mapping exists, check if provider's role matches
        if (expectedRole) {
          if (!providerProfile.serviceRole) {
            throw new HttpError(403, 'You are not verified for this service category. Please complete your verification with a service role.', undefined, 'CATEGORY_NOT_ALLOWED');
          }

          if (providerProfile.serviceRole !== expectedRole) {
            console.warn('[Booking Status Update] Category mismatch:', {
              bookingId,
              serviceName: service.name,
              expectedRole,
              providerRole: providerProfile.serviceRole,
              providerId: userId,
            });
            throw new HttpError(403, `You are not verified for this service category. This booking requires ${expectedRole}, but you are verified as ${providerProfile.serviceRole}.`, undefined, 'CATEGORY_NOT_ALLOWED');
          }
        }
        // If no mapping exists, allow the action (graceful fallback for unmapped services)
      }

      // Validate provider status transitions
      if (fromStatus === 'PENDING') {
        if (toStatus !== 'CONFIRMED' && toStatus !== 'DECLINED') {
          throw new HttpError(400, 'PENDING bookings can only be changed to CONFIRMED or DECLINED', undefined, 'INVALID_STATUS_TRANSITION');
        }
      } else if (fromStatus === 'CONFIRMED') {
        if (toStatus !== 'COMPLETED') {
          throw new HttpError(400, 'CONFIRMED bookings can only be changed to COMPLETED', undefined, 'INVALID_STATUS_TRANSITION');
        }
      } else {
        throw new HttpError(400, `Cannot update booking from ${fromStatus} status`, undefined, 'INVALID_STATUS_TRANSITION');
      }
    } else {
      // User can only cancel
      if (status !== 'CANCELLED') {
        throw new HttpError(400, 'Users can only cancel bookings', undefined, 'INVALID_USER_STATUS');
      }
      // Check if booking belongs to this user
      // SAFE comparison: convert both to strings
      if (!userId) {
        throw new HttpError(400, 'User ID is required', undefined, 'USER_ID_REQUIRED');
      }
      
      const bookingUserIdStr = String(booking.userId);
      const userIdStr = String(userId);
      
      if (bookingUserIdStr !== userIdStr) {
        console.error('[Booking Status Update] User ownership mismatch:', {
          bookingId,
          bookingUserId: bookingUserIdStr,
          requestedUserId: userIdStr,
        });
        throw new HttpError(403, 'Unauthorized: Booking does not belong to this user', undefined, 'UNAUTHORIZED_USER');
      }
      
      // User can only cancel PENDING or CONFIRMED bookings
      if (fromStatus !== 'PENDING' && fromStatus !== 'CONFIRMED') {
        throw new HttpError(400, `Cannot cancel booking with status ${fromStatus}`, undefined, 'INVALID_STATUS_TRANSITION');
      }
    }

    // Prevent updating already terminal states
    if (fromStatus === 'COMPLETED' || fromStatus === 'CANCELLED') {
      throw new HttpError(400, 'Cannot update a completed or cancelled booking', undefined, 'TERMINAL_STATUS');
    }

    // Log status update BEFORE update
    console.info('[Booking Status Update] Starting update:', {
      bookingId,
      fromStatus,
      toStatus,
      bookingProviderId: booking.providerId ? String(booking.providerId) : 'none',
      requestedProviderId: userId || 'none',
      bookingUserId: booking.userId,
      isProvider,
      timestamp: new Date().toISOString(),
    });

    const updated = await this.bookingRepository.update(bookingId, { status });
    if (!updated) {
      throw new HttpError(500, 'Failed to update booking', undefined, 'UPDATE_FAILED');
    }

    // Log successful update
    console.info('[Booking Status Updated] Successfully updated:', {
      bookingId,
      fromStatus,
      toStatus,
      providerId: updated.providerId ? String(updated.providerId) : 'none',
      userId: updated.userId,
      timestamp: new Date().toISOString(),
    });

    return updated;
  }
}

