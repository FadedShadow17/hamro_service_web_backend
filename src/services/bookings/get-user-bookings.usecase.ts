import { IBookingRepository } from '../../types/repositories.port';
import { BookingRepository } from '../../repositories/booking.repository';
import { BookingEntity } from '../../types/booking.entity';
import { BookingStatus } from '../../config/constants';

export class GetUserBookingsUseCase {
  private bookingRepository: IBookingRepository;

  constructor(bookingRepository?: IBookingRepository) {
    this.bookingRepository = bookingRepository || new BookingRepository();
  }

  async execute(userId: string, status?: BookingStatus): Promise<BookingEntity[]> {
    return await this.bookingRepository.findByUserId(userId, status);
  }
}
