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

  
  async execute(
    bookingId: string,
    userId: string,
    paymentMethod?: 'COD' | 'ONLINE' | 'ESEWA' | 'FONEPAY'
  ): Promise<BookingEntity> {

    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new HttpError(404, 'Booking not found', undefined, 'BOOKING_NOT_FOUND');
    }

    if (String(booking.userId) !== String(userId)) {
      throw new HttpError(403, 'This booking does not belong to you', undefined, 'UNAUTHORIZED_USER');
    }

    if (booking.status !== BOOKING_STATUS.CONFIRMED) {
      throw new HttpError(
        400,
        'Only confirmed bookings can be paid',
        undefined,
        'INVALID_BOOKING_STATUS'
      );
    }

    if (booking.paymentStatus === 'PAID') {
      throw new HttpError(400, 'Booking is already paid', undefined, 'ALREADY_PAID');
    }


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
