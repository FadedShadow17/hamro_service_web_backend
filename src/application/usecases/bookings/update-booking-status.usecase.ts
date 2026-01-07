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
      throw new HttpError(404, 'Booking not found');
    }

    // Validate status transitions
    if (isProvider) {
      // Provider can only accept, decline, or complete
      if (status !== 'CONFIRMED' && status !== 'DECLINED' && status !== 'COMPLETED') {
        throw new HttpError(400, 'Invalid status for provider action');
      }
      // Check if booking belongs to this provider
      if (userId && booking.providerId !== userId) {
        throw new HttpError(403, 'Unauthorized');
      }
    } else {
      // User can only cancel
      if (status !== 'CANCELLED') {
        throw new HttpError(400, 'Users can only cancel bookings');
      }
      // Check if booking belongs to this user
      if (userId && booking.userId !== userId) {
        throw new HttpError(403, 'Unauthorized');
      }
    }

    // Validate status transitions
    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
      throw new HttpError(400, 'Cannot update a completed or cancelled booking');
    }

    const updated = await this.bookingRepository.update(bookingId, { status });
    if (!updated) {
      throw new HttpError(500, 'Failed to update booking');
    }

    return updated;
  }
}

