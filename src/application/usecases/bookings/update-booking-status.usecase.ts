import { IBookingRepository } from '../../ports/repositories.port';
import { BookingRepository } from '../../../infrastructure/db/mongoose/repositories/booking.repository';
import { BookingEntity } from '../../../domain/entities/booking.entity';
import { BookingStatus } from '../../../shared/constants';
import { HttpError } from '../../../shared/errors/http-error';

export class UpdateBookingStatusUseCase {
  private bookingRepository: IBookingRepository;

  constructor(bookingRepository?: IBookingRepository) {
    this.bookingRepository = bookingRepository || new BookingRepository();
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
      if (userId && booking.providerId !== userId) {
        throw new HttpError(403, 'Unauthorized: Booking does not belong to this provider', undefined, 'UNAUTHORIZED_PROVIDER');
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
      if (userId && booking.userId !== userId) {
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

    // Log status update
    console.info('[Booking Status Update]', {
      bookingId,
      fromStatus,
      toStatus,
      providerId: booking.providerId || 'none',
      userId: booking.userId,
      isProvider,
      timestamp: new Date().toISOString(),
    });

    const updated = await this.bookingRepository.update(bookingId, { status });
    if (!updated) {
      throw new HttpError(500, 'Failed to update booking', undefined, 'UPDATE_FAILED');
    }

    // Log successful update
    console.info('[Booking Status Updated]', {
      bookingId,
      fromStatus,
      toStatus,
      providerId: updated.providerId || 'none',
      userId: updated.userId,
      timestamp: new Date().toISOString(),
    });

    return updated;
  }
}

