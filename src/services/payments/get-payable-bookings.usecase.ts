import { IBookingRepository } from '../../types/repositories.port';
import { BookingRepository } from '../../repositories/booking.repository';
import { BookingEntity } from '../../types/booking.entity';
import { BOOKING_STATUS } from '../../config/constants';

export class GetPayableBookingsUseCase {
  private bookingRepository: IBookingRepository;

  constructor(bookingRepository?: IBookingRepository) {
    this.bookingRepository = bookingRepository || new BookingRepository();
  }

  async execute(userId: string): Promise<BookingEntity[]> {
    const bookings = await this.bookingRepository.findByUserId(userId, BOOKING_STATUS.CONFIRMED);
    return bookings;
  }
}
