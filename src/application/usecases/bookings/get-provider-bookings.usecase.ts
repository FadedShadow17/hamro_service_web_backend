import { IBookingRepository } from '../../ports/repositories.port';
import { BookingRepository } from '../../../infrastructure/db/mongoose/repositories/booking.repository';
import { BookingEntity } from '../../../domain/entities/booking.entity';
import { BookingStatus } from '../../../shared/constants';

export class GetProviderBookingsUseCase {
  private bookingRepository: IBookingRepository;

  constructor(bookingRepository?: IBookingRepository) {
    this.bookingRepository = bookingRepository || new BookingRepository();
  }

  async execute(providerId: string, status?: BookingStatus): Promise<BookingEntity[]> {
    return await this.bookingRepository.findByProviderId(providerId, status);
  }
}

