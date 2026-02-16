import { CreateBookingDTO } from '../../dtos/booking.dto';
import { IBookingRepository } from '../../types/repositories.port';
import { IServiceRepository } from '../../types/repositories.port';
import { BookingRepository } from '../../repositories/booking.repository';
import { ServiceRepository } from '../../repositories/service.repository';
import { BookingEntity } from '../../types/booking.entity';
import { BOOKING_STATUS } from '../../config/constants';
import { HttpError } from '../../errors/http-error';

export class CreateBookingUseCase {
  private bookingRepository: IBookingRepository;
  private serviceRepository: IServiceRepository;

  constructor(
    bookingRepository?: IBookingRepository,
    serviceRepository?: IServiceRepository
  ) {
    this.bookingRepository = bookingRepository || new BookingRepository();
    this.serviceRepository = serviceRepository || new ServiceRepository();
  }

  async execute(userId: string, dto: CreateBookingDTO): Promise<BookingEntity> {
    // Validate service exists
    const service = await this.serviceRepository.findById(dto.serviceId);
    if (!service) {
      throw new HttpError(404, 'Service not found', undefined, 'SERVICE_NOT_FOUND');
    }
    if (!service.isActive) {
      throw new HttpError(400, 'Service is not active', undefined, 'SERVICE_INACTIVE');
    }

    // NEW LOGIC: Bookings are NOT pre-assigned to providers
    // providerId MUST be null - providers will claim bookings via ACCEPT action
    // Ignore any providerId in DTO (if provided, it will be ignored for security)
    
    // Create booking with providerId = null (unassigned)
    const booking = await this.bookingRepository.create({
      userId,
      providerId: null, // Always null - providers claim bookings via ACCEPT
      serviceId: dto.serviceId,
      date: dto.date,
      timeSlot: dto.timeSlot,
      area: dto.area as any,
      status: BOOKING_STATUS.PENDING,
    });

    // Log booking creation
    console.info('[Booking] Booking created (unassigned - waiting for provider claim):', {
      bookingId: booking.id,
      serviceId: dto.serviceId,
      serviceName: service.name,
      requestedLocation: dto.area,
      bookingStatus: booking.status,
    });

    return booking;
  }
}
