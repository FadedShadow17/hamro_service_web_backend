import { IBookingRepository } from '../../types/repositories.port';
import { BookingRepository } from '../../repositories/booking.repository';
import { BookingEntity } from '../../types/booking.entity';
import { HttpError } from '../../errors/http-error';
import { BOOKING_STATUS } from '../../config/constants';

export class PayForBookingUseCase {
  private bookingRepository: IBookingRepository;

  constructor(bookingRepository?: IBookingRepository) {
    this.bookingRepository = bookingRepository || new BookingRepository();
  }

  /**
   * Mark a booking as paid
   * Validates:
   * - Booking exists
   * - Booking belongs to the user
   * - Booking status is CONFIRMED
   * - Booking is not already paid
   */
  async execute(
    bookingId: string,
    userId: string,
    paymentMethod?: 'COD' | 'ONLINE' | 'ESEWA' | 'FONEPAY'
  ): Promise<BookingEntity> {
    // Find the booking
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new HttpError(404, 'Booking not found', undefined, 'BOOKING_NOT_FOUND');
    }

    // Verify booking belongs to the user
    if (String(booking.userId) !== String(userId)) {
      throw new HttpError(403, 'This booking does not belong to you', undefined, 'UNAUTHORIZED_USER');
    }

    // Verify booking status is CONFIRMED
    if (booking.status !== BOOKING_STATUS.CONFIRMED) {
      throw new HttpError(
        400,
        'Only confirmed bookings can be paid',
        undefined,
        'INVALID_BOOKING_STATUS'
      );
    }

    // Check if already paid
    if (booking.paymentStatus === 'PAID') {
      throw new HttpError(400, 'Booking is already paid', undefined, 'ALREADY_PAID');
    }

    // Update booking with payment information
    // Map payment method to allowed values
    const allowedPaymentMethod = paymentMethod === 'ESEWA' || paymentMethod === 'FONEPAY' 
      ? 'ONLINE' 
      : (paymentMethod || 'COD');
    
    const updated = await this.bookingRepository.update(bookingId, {
      paymentStatus: 'PAID',
      paidAt: new Date(),
      paymentMethod: allowedPaymentMethod as 'COD' | 'ONLINE',
    });

    if (!updated) {
      throw new HttpError(500, 'Failed to update booking payment status', undefined, 'UPDATE_FAILED');
    }

    return updated;
  }
}
