import { IBookingRepository, IServiceRepository, IProviderProfileRepository } from '../../types/repositories.port';
import { BookingRepository } from '../../repositories/booking.repository';
import { ServiceRepository } from '../../repositories/service.repository';
import { ProviderProfileRepository } from '../../repositories/provider-profile.repository';
import { BookingEntity } from '../../types/booking.entity';
import { BookingStatus, BOOKING_STATUS } from '../../config/constants';
import { HttpError } from '../../errors/http-error';
import { isCategoryMatch } from '../category-matcher.service';
import mongoose from 'mongoose';

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

    // Log booking details before ownership check (for user cancellation)
    if (!isProvider && status === 'CANCELLED') {
      console.info('[USER CANCEL] Ownership check', {
        bookingId,
        bookingUserId: booking.userId,
        bookingUserIdType: typeof booking.userId,
        requestedUserId: userId,
        requestedUserIdType: typeof userId,
      });
    }

    const fromStatus = booking.status;
    const toStatus = status;

    // Validate status transitions
    if (isProvider) {
      // Provider can accept, decline, complete, or cancel
      if (status !== 'CONFIRMED' && status !== 'DECLINED' && status !== 'COMPLETED' && status !== 'CANCELLED') {
        throw new HttpError(400, 'Invalid status for provider action', undefined, 'INVALID_PROVIDER_STATUS');
      }

      if (!userId) {
        throw new HttpError(400, 'Provider ID is required', undefined, 'PROVIDER_ID_REQUIRED');
      }

      // NEW LOGIC: Claim-based booking system
      if (status === 'CONFIRMED') {
        // ACCEPT action: Provider is claiming an unassigned booking
        
        // Check if booking is already assigned to another provider
        if (booking.providerId) {
          const bookingProviderIdStr = String(booking.providerId).trim();
          const userIdStr = String(userId).trim();
          
          // If already assigned to this provider, allow (idempotent)
          if (bookingProviderIdStr === userIdStr) {
            console.info('[Booking Accept] Booking already assigned to this provider:', {
              bookingId,
              providerId: userIdStr,
            });
          } else {
            // Already assigned to different provider
            console.warn('[Booking Accept] Booking already assigned to another provider:', {
              bookingId,
              currentProviderId: bookingProviderIdStr,
              requestedProviderId: userIdStr,
            });
            throw new HttpError(409, 'This booking has already been accepted by another provider', undefined, 'BOOKING_ALREADY_ASSIGNED');
          }
        }

        // Booking is unassigned (providerId = null) - proceed with claim
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

        // Check if provider has a verified role
        if (!providerProfile.serviceRole) {
          throw new HttpError(403, 'You are not verified for this service category. Please complete your verification with a service role.', undefined, 'CATEGORY_NOT_ALLOWED');
        }

        // Use category matcher utility to check if role matches service category
        const categoryMatches = isCategoryMatch(providerProfile.serviceRole, service.name);

        if (!categoryMatches) {
          console.warn('[Booking Accept] Category mismatch - Accept blocked:', {
            bookingId,
            serviceName: service.name,
            providerRole: providerProfile.serviceRole,
            providerId: userId,
          });
          throw new HttpError(403, `You are not verified for this service category. This booking is for "${service.name}", but you are verified as "${providerProfile.serviceRole}".`, undefined, 'CATEGORY_NOT_ALLOWED');
        }

        console.info('[Booking Accept] Category match verified, will assign booking:', {
          bookingId,
          serviceName: service.name,
          providerRole: providerProfile.serviceRole,
          providerId: userId,
        });

        // ProviderId assignment will happen in the update section below
      } else if (status === 'DECLINED') {
        // DECLINE action: Can be done by any provider (no ownership check for PENDING)
        // Only check ownership if booking is already assigned
        if (booking.providerId) {
          const bookingProviderIdStr = String(booking.providerId).trim();
          const userIdStr = String(userId).trim();
          
          // If assigned to different provider, they can't decline
          if (bookingProviderIdStr !== userIdStr) {
            throw new HttpError(403, 'This booking is assigned to another provider', undefined, 'BOOKING_NOT_ASSIGNED');
          }
        }
        // If unassigned, any provider can decline (no check needed)
      } else if (status === 'COMPLETED') {
        // COMPLETE action: Only assigned provider can complete
        if (!booking.providerId) {
          throw new HttpError(400, 'Cannot complete an unassigned booking', undefined, 'NO_PROVIDER_ASSIGNED');
        }

        const bookingProviderIdStr = String(booking.providerId).trim();
        const userIdStr = String(userId).trim();
        
        if (bookingProviderIdStr !== userIdStr) {
          throw new HttpError(403, 'Only the assigned provider can complete this booking', undefined, 'BOOKING_NOT_ASSIGNED');
        }

        // Only allow if status is CONFIRMED
        if (fromStatus !== 'CONFIRMED') {
          throw new HttpError(400, 'Only CONFIRMED bookings can be completed', undefined, 'INVALID_STATUS_TRANSITION');
        }
      } else if (status === 'CANCELLED') {
        // CANCEL action: Provider can cancel PENDING (unassigned) or CONFIRMED (assigned to them)
        // If booking is assigned, only the assigned provider can cancel
        if (booking.providerId) {
          const bookingProviderIdStr = String(booking.providerId).trim();
          const userIdStr = String(userId).trim();
          
          if (bookingProviderIdStr !== userIdStr) {
            throw new HttpError(403, 'This booking is not assigned to you. Only the assigned provider can cancel it.', undefined, 'BOOKING_NOT_ASSIGNED');
          }
        }
        // If unassigned (PENDING), any provider can cancel (no ownership check needed)
      }

      // Validate provider status transitions
      if (fromStatus === 'PENDING') {
        if (toStatus !== 'CONFIRMED' && toStatus !== 'DECLINED' && toStatus !== 'CANCELLED') {
          throw new HttpError(400, 'PENDING bookings can only be changed to CONFIRMED, DECLINED, or CANCELLED', undefined, 'INVALID_STATUS_TRANSITION');
        }
      } else if (fromStatus === 'CONFIRMED') {
        if (toStatus !== 'COMPLETED' && toStatus !== 'CANCELLED') {
          throw new HttpError(400, 'CONFIRMED bookings can only be changed to COMPLETED or CANCELLED', undefined, 'INVALID_STATUS_TRANSITION');
        }
        // Ownership check for CANCELLED is done earlier in the code
      } else {
        throw new HttpError(400, `Cannot update booking from ${fromStatus} status`, undefined, 'INVALID_STATUS_TRANSITION');
      }
    } else {
      // User can only cancel
      if (status !== 'CANCELLED') {
        throw new HttpError(400, 'Users can only cancel bookings', undefined, 'INVALID_USER_STATUS');
      }
      // Check if booking belongs to this user
      // SAFE comparison: convert both to strings and trim whitespace
      if (!userId) {
        throw new HttpError(400, 'User ID is required', undefined, 'USER_ID_REQUIRED');
      }
      
      // Normalize both IDs to strings and trim
      const bookingUserIdStr = String(booking.userId).trim();
      const userIdStr = String(userId).trim();
      
      // Also try comparing as ObjectIds if they're valid
      let idsMatch = bookingUserIdStr === userIdStr;
      
      // If string comparison fails, try ObjectId comparison
      if (!idsMatch && mongoose.Types.ObjectId.isValid(bookingUserIdStr) && mongoose.Types.ObjectId.isValid(userIdStr)) {
        try {
          const bookingUserIdObj = new mongoose.Types.ObjectId(bookingUserIdStr);
          const userIdObj = new mongoose.Types.ObjectId(userIdStr);
          idsMatch = bookingUserIdObj.equals(userIdObj);
        } catch (e) {
          // If ObjectId conversion fails, fall back to string comparison
          idsMatch = false;
        }
      }
      
      if (!idsMatch) {
        console.error('[Booking Status Update] User ownership mismatch:', {
          bookingId,
          bookingUserId: bookingUserIdStr,
          requestedUserId: userIdStr,
          bookingUserIdType: typeof booking.userId,
          requestedUserIdType: typeof userId,
          bookingUserIdRaw: booking.userId,
          requestedUserIdRaw: userId,
        });
        throw new HttpError(403, 'Booking does not belong to this user', undefined, 'BOOKING_NOT_OWNED');
      }
      
      // User can only cancel PENDING or CONFIRMED bookings
      if (fromStatus !== 'PENDING' && fromStatus !== 'CONFIRMED') {
        throw new HttpError(400, `Cannot cancel booking with status ${fromStatus}`, undefined, 'INVALID_STATUS_TRANSITION');
      }
    }

    // Prevent updating already terminal states
    const terminalStatuses: BookingStatus[] = [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED];
    if (terminalStatuses.includes(fromStatus as BookingStatus)) {
      throw new HttpError(400, 'Cannot update a completed or cancelled booking', undefined, 'TERMINAL_STATUS');
    }

    // Prepare update data
    const updateData: any = { status };
    
    // For CONFIRMED status (ACCEPT), also assign providerId if booking is unassigned
    if (status === 'CONFIRMED' && isProvider && !booking.providerId && userId) {
      // Convert userId (ProviderProfile._id string) to ObjectId for storage
      updateData.providerId = new mongoose.Types.ObjectId(userId);
      console.info('[Booking Accept] Assigning provider and confirming booking:', {
        bookingId,
        providerId: userId,
        fromStatus,
        toStatus,
      });
    }
    
    // IMPORTANT: For DECLINED status, do NOT assign providerId (keep it null)
    // This ensures DECLINED bookings remain unassigned and can be seen by other providers
    // For CANCELLED status:
    // - If booking was unassigned (PENDING), keep providerId null
    // - If booking was assigned (CONFIRMED), keep the existing providerId
    // This is handled automatically by not setting providerId in updateData for these statuses

    // Log status update BEFORE update
    console.info('[Booking Status Update] Starting update:', {
      bookingId,
      fromStatus,
      toStatus,
      bookingProviderId: booking.providerId ? String(booking.providerId) : 'none',
      requestedProviderId: userId || 'none',
      bookingUserId: booking.userId,
      isProvider,
      updateData,
      timestamp: new Date().toISOString(),
    });

    const updated = await this.bookingRepository.update(bookingId, updateData);
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
