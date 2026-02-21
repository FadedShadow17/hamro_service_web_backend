import { IBookingRepository, IServiceRepository, IProviderProfileRepository } from '../../types/repositories.port';
import { BookingRepository } from '../../repositories/booking.repository';
import { ServiceRepository } from '../../repositories/service.repository';
import { ProviderProfileRepository } from '../../repositories/provider-profile.repository';
import { NotificationRepository } from '../../repositories/notification.repository';
import { BookingEntity } from '../../types/booking.entity';
import { BookingStatus, BOOKING_STATUS } from '../../config/constants';
import { HttpError } from '../../errors/http-error';
import { isCategoryMatch } from '../category-matcher.service';
import mongoose from 'mongoose';

export class UpdateBookingStatusUseCase {
  private bookingRepository: IBookingRepository;
  private serviceRepository: IServiceRepository;
  private providerProfileRepository: IProviderProfileRepository;
  private notificationRepository: NotificationRepository;

  constructor(
    bookingRepository?: IBookingRepository,
    serviceRepository?: IServiceRepository,
    providerProfileRepository?: IProviderProfileRepository
  ) {
    this.bookingRepository = bookingRepository || new BookingRepository();
    this.serviceRepository = serviceRepository || new ServiceRepository();
    this.providerProfileRepository = providerProfileRepository || new ProviderProfileRepository();
    this.notificationRepository = new NotificationRepository();
  }

  async execute(bookingId: string, status: BookingStatus, userId?: string, isProvider?: boolean): Promise<BookingEntity> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new HttpError(404, 'Booking not found', undefined, 'BOOKING_NOT_FOUND');
    }

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

    if (isProvider) {

      if (status !== 'CONFIRMED' && status !== 'DECLINED' && status !== 'COMPLETED' && status !== 'CANCELLED') {
        throw new HttpError(400, 'Invalid status for provider action', undefined, 'INVALID_PROVIDER_STATUS');
      }

      if (!userId) {
        throw new HttpError(400, 'Provider ID is required', undefined, 'PROVIDER_ID_REQUIRED');
      }

      if (status === 'CONFIRMED') {


        if (booking.providerId) {
          const bookingProviderIdStr = String(booking.providerId).trim();
          const userIdStr = String(userId).trim();

          if (bookingProviderIdStr === userIdStr) {
            console.info('[Booking Accept] Booking already assigned to this provider:', {
              bookingId,
              providerId: userIdStr,
            });
          } else {

            console.warn('[Booking Accept] Booking already assigned to another provider:', {
              bookingId,
              currentProviderId: bookingProviderIdStr,
              requestedProviderId: userIdStr,
            });
            throw new HttpError(409, 'This booking has already been accepted by another provider', undefined, 'BOOKING_ALREADY_ASSIGNED');
          }
        }


        const service = await this.serviceRepository.findById(booking.serviceId);
        if (!service) {
          throw new HttpError(404, 'Service not found for this booking', undefined, 'SERVICE_NOT_FOUND');
        }

        const providerProfile = await this.providerProfileRepository.findById(userId);
        if (!providerProfile) {
          throw new HttpError(404, 'Provider profile not found', undefined, 'PROVIDER_PROFILE_NOT_FOUND');
        }

        if (!providerProfile.serviceRole) {
          throw new HttpError(403, 'You are not verified for this service category. Please complete your verification with a service role.', undefined, 'CATEGORY_NOT_ALLOWED');
        }

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

      } else if (status === 'DECLINED') {


        if (booking.providerId) {
          const bookingProviderIdStr = String(booking.providerId).trim();
          const userIdStr = String(userId).trim();

          if (bookingProviderIdStr !== userIdStr) {
            throw new HttpError(403, 'This booking is assigned to another provider', undefined, 'BOOKING_NOT_ASSIGNED');
          }
        }

      } else if (status === 'COMPLETED') {

        if (!booking.providerId) {
          throw new HttpError(400, 'Cannot complete an unassigned booking', undefined, 'NO_PROVIDER_ASSIGNED');
        }

        const bookingProviderIdStr = String(booking.providerId).trim();
        const userIdStr = String(userId).trim();
        
        if (bookingProviderIdStr !== userIdStr) {
          throw new HttpError(403, 'Only the assigned provider can complete this booking', undefined, 'BOOKING_NOT_ASSIGNED');
        }

        if (fromStatus !== 'CONFIRMED') {
          throw new HttpError(400, 'Only CONFIRMED bookings can be completed', undefined, 'INVALID_STATUS_TRANSITION');
        }
      } else if (status === 'CANCELLED') {


        if (booking.providerId) {
          const bookingProviderIdStr = String(booking.providerId).trim();
          const userIdStr = String(userId).trim();
          
          if (bookingProviderIdStr !== userIdStr) {
            throw new HttpError(403, 'This booking is not assigned to you. Only the assigned provider can cancel it.', undefined, 'BOOKING_NOT_ASSIGNED');
          }
        }

      }

      if (fromStatus === 'PENDING') {
        if (toStatus !== 'CONFIRMED' && toStatus !== 'DECLINED' && toStatus !== 'CANCELLED') {
          throw new HttpError(400, 'PENDING bookings can only be changed to CONFIRMED, DECLINED, or CANCELLED', undefined, 'INVALID_STATUS_TRANSITION');
        }
      } else if (fromStatus === 'CONFIRMED') {
        if (toStatus !== 'COMPLETED' && toStatus !== 'CANCELLED') {
          throw new HttpError(400, 'CONFIRMED bookings can only be changed to COMPLETED or CANCELLED', undefined, 'INVALID_STATUS_TRANSITION');
        }

      } else {
        throw new HttpError(400, `Cannot update booking from ${fromStatus} status`, undefined, 'INVALID_STATUS_TRANSITION');
      }
    } else {

      if (status !== 'CANCELLED') {
        throw new HttpError(400, 'Users can only cancel bookings', undefined, 'INVALID_USER_STATUS');
      }


      if (!userId) {
        throw new HttpError(400, 'User ID is required', undefined, 'USER_ID_REQUIRED');
      }

      const bookingUserIdStr = String(booking.userId).trim();
      const userIdStr = String(userId).trim();

      let idsMatch = bookingUserIdStr === userIdStr;

      if (!idsMatch && mongoose.Types.ObjectId.isValid(bookingUserIdStr) && mongoose.Types.ObjectId.isValid(userIdStr)) {
        try {
          const bookingUserIdObj = new mongoose.Types.ObjectId(bookingUserIdStr);
          const userIdObj = new mongoose.Types.ObjectId(userIdStr);
          idsMatch = bookingUserIdObj.equals(userIdObj);
        } catch (e) {

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

      if (fromStatus !== 'PENDING' && fromStatus !== 'CONFIRMED') {
        throw new HttpError(400, `Cannot cancel booking with status ${fromStatus}`, undefined, 'INVALID_STATUS_TRANSITION');
      }
    }

    const terminalStatuses: BookingStatus[] = [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED];
    if (terminalStatuses.includes(fromStatus as BookingStatus)) {
      throw new HttpError(400, 'Cannot update a completed or cancelled booking', undefined, 'TERMINAL_STATUS');
    }

    const updateData: any = { status };

    if (status === 'CONFIRMED' && isProvider && !booking.providerId && userId) {

      const existingBooking = await this.bookingRepository.findByProviderDateAndTime(
        userId,
        booking.date,
        booking.timeSlot
      );
      
      if (existingBooking && existingBooking.id !== bookingId) {
        console.warn('[Booking Accept] Provider already has a booking at this time:', {
          bookingId,
          providerId: userId,
          date: booking.date,
          timeSlot: booking.timeSlot,
          existingBookingId: existingBooking.id,
        });
        throw new HttpError(
          409,
          `You already have a booking on ${booking.date} at ${booking.timeSlot}. Please choose a different time slot.`,
          undefined,
          'DUPLICATE_BOOKING_TIME'
        );
      }

      updateData.providerId = new mongoose.Types.ObjectId(userId);
      console.info('[Booking Accept] Assigning provider and confirming booking:', {
        bookingId,
        providerId: userId,
        fromStatus,
        toStatus,
        date: booking.date,
        timeSlot: booking.timeSlot,
      });
    }







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

    console.info('[Booking Status Updated] Successfully updated:', {
      bookingId,
      fromStatus,
      toStatus,
      providerId: updated.providerId ? String(updated.providerId) : 'none',
      userId: updated.userId,
      timestamp: new Date().toISOString(),
    });

    if (toStatus === 'CONFIRMED' && isProvider && updated.userId) {
      try {
        const service = await this.serviceRepository.findById(updated.serviceId);
        const serviceName = service?.name || 'service';

        await this.notificationRepository.create({
          type: 'BOOKING_ACCEPTED',
          title: 'Booking Accepted',
          message: `Your booking for ${serviceName} has been accepted by a provider`,
          bookingId: updated.id,
          userId: updated.userId,
          providerId: null,
          read: false,
        });

        console.info('[Booking] Notification created for user:', {
          bookingId: updated.id,
          userId: updated.userId,
          notificationType: 'BOOKING_ACCEPTED',
        });
      } catch (notificationError) {
        console.error('[Booking] Failed to create notification for user (non-blocking):', {
          bookingId: updated.id,
          userId: updated.userId,
          error: notificationError instanceof Error ? notificationError.message : String(notificationError),
        });
      }
    }

    if (toStatus === 'COMPLETED' && isProvider && updated.userId && updated.providerId) {
      try {
        const service = await this.serviceRepository.findById(updated.serviceId);
        const serviceName = service?.name || 'service';

        const providerProfile = await this.providerProfileRepository.findById(String(updated.providerId));
        const providerProfileId = providerProfile?.id || String(updated.providerId);

        await Promise.all([
          this.notificationRepository.create({
            type: 'BOOKING_COMPLETED',
            title: 'Booking Completed',
            message: `Your booking for ${serviceName} has been completed`,
            bookingId: updated.id,
            userId: updated.userId,
            providerId: null,
            read: false,
          }),
          this.notificationRepository.create({
            type: 'BOOKING_COMPLETED',
            title: 'Booking Completed',
            message: `You have completed the booking for ${serviceName}`,
            bookingId: updated.id,
            userId: null,
            providerId: providerProfileId,
            read: false,
          }),
        ]);

        console.info('[Booking] Completion notifications created:', {
          bookingId: updated.id,
          userId: updated.userId,
          providerId: providerProfileId,
          notificationType: 'BOOKING_COMPLETED',
        });
      } catch (notificationError) {
        console.error('[Booking] Failed to create completion notifications (non-blocking):', {
          bookingId: updated.id,
          userId: updated.userId,
          providerId: updated.providerId,
          error: notificationError instanceof Error ? notificationError.message : String(notificationError),
        });
      }
    }

    return updated;
  }
}
