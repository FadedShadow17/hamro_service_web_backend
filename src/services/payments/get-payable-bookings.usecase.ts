import { IBookingRepository } from '../../types/repositories.port';
import { BookingRepository } from '../../repositories/booking.repository';
import { BookingEntity } from '../../types/booking.entity';
import { BOOKING_STATUS } from '../../config/constants';

export class GetPayableBookingsUseCase {
  private bookingRepository: IBookingRepository;

  constructor(bookingRepository?: IBookingRepository) {
    this.bookingRepository = bookingRepository || new BookingRepository();
  }

  /**
   * Get user's confirmed bookings that are payable
   * Returns only bookings with status = CONFIRMED
   * Bookings are already populated with service and provider details from findByUserId
   */
  async execute(userId: string): Promise<BookingEntity[]> {
    // Get user's bookings with status = CONFIRMED
    // findByUserId already populates service and provider details
    const bookings = await this.bookingRepository.findByUserId(userId, BOOKING_STATUS.CONFIRMED);
    
    return bookings;
  }
}
