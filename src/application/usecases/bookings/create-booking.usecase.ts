import { CreateBookingDTO } from '../../dtos/booking.dto';
import { IBookingRepository } from '../../ports/repositories.port';
import { IProviderProfileRepository } from '../../ports/repositories.port';
import { BookingRepository } from '../../../infrastructure/db/mongoose/repositories/booking.repository';
import { ProviderProfileRepository } from '../../../infrastructure/db/mongoose/repositories/provider-profile.repository';
import { BookingEntity } from '../../../domain/entities/booking.entity';
import { BOOKING_STATUS } from '../../../shared/constants';
import { HttpError } from '../../../shared/errors/http-error';

export class CreateBookingUseCase {
  private bookingRepository: IBookingRepository;
  private providerProfileRepository: IProviderProfileRepository;

  constructor(
    bookingRepository?: IBookingRepository,
    providerProfileRepository?: IProviderProfileRepository
  ) {
    this.bookingRepository = bookingRepository || new BookingRepository();
    this.providerProfileRepository = providerProfileRepository || new ProviderProfileRepository();
  }

  async execute(userId: string, dto: CreateBookingDTO): Promise<BookingEntity> {
    // Check if provider exists
    const provider = await this.providerProfileRepository.findById(dto.providerId);
    if (!provider || !provider.active) {
      throw new HttpError(404, 'Provider not found or inactive');
    }

    // Check if booking already exists (unique constraint)
    const existingBooking = await this.bookingRepository.findByProviderDateAndTime(
      dto.providerId,
      dto.date,
      dto.timeSlot
    );

    if (existingBooking && existingBooking.status !== 'CANCELLED' && existingBooking.status !== 'DECLINED') {
      throw new HttpError(409, 'This time slot is already booked');
    }

    // Create booking
    const booking = await this.bookingRepository.create({
      userId,
      providerId: dto.providerId,
      serviceId: dto.serviceId,
      date: dto.date,
      timeSlot: dto.timeSlot,
      area: dto.area,
      status: BOOKING_STATUS.PENDING,
    });

    return booking;
  }
}

