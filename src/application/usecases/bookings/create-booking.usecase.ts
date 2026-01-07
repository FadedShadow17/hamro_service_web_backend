import { CreateBookingDTO } from '../../dtos/booking.dto';
import { IBookingRepository } from '../../ports/repositories.port';
import { IProviderProfileRepository } from '../../ports/repositories.port';
import { IProviderServiceRepository } from '../../ports/repositories.port';
import { BookingRepository } from '../../../infrastructure/db/mongoose/repositories/booking.repository';
import { ProviderProfileRepository } from '../../../infrastructure/db/mongoose/repositories/provider-profile.repository';
import { ProviderServiceRepository } from '../../../infrastructure/db/mongoose/repositories/provider-service.repository';
import { BookingEntity } from '../../../domain/entities/booking.entity';
import { BOOKING_STATUS } from '../../../shared/constants';
import { HttpError } from '../../../shared/errors/http-error';

export class CreateBookingUseCase {
  private bookingRepository: IBookingRepository;
  private providerProfileRepository: IProviderProfileRepository;
  private providerServiceRepository: IProviderServiceRepository;

  constructor(
    bookingRepository?: IBookingRepository,
    providerProfileRepository?: IProviderProfileRepository,
    providerServiceRepository?: IProviderServiceRepository
  ) {
    this.bookingRepository = bookingRepository || new BookingRepository();
    this.providerProfileRepository = providerProfileRepository || new ProviderProfileRepository();
    this.providerServiceRepository = providerServiceRepository || new ProviderServiceRepository();
  }

  async execute(userId: string, dto: CreateBookingDTO): Promise<BookingEntity> {
    let providerId = dto.providerId;

    // If no provider is specified, find any active provider for the service
    if (!providerId) {
      // Find providers offering this service
      const providerServices = await this.providerServiceRepository.findByServiceId(dto.serviceId);
      
      if (providerServices.length > 0) {
        // Use the first provider offering this service
        providerId = providerServices[0].providerId;
      } else {
        // If no provider offers this service, find any active provider in the area
        const providersInArea = await this.providerProfileRepository.findByArea(dto.area, true);
        if (providersInArea.length > 0) {
          providerId = providersInArea[0].id;
        } else {
          // If still no providers in area, find any active provider (anywhere)
          const allProviders = await this.providerProfileRepository.findAll(true);
          if (allProviders.length === 0) {
            // Log the failure for debugging
            console.error('[Booking] No providers available:', {
              serviceId: dto.serviceId,
              requestedLocation: dto.area,
              availableProviderCount: 0,
            });
            throw new HttpError(
              409,
              'No providers available for this service and location',
              undefined,
              'NO_PROVIDER_AVAILABLE'
            );
          }
          providerId = allProviders[0].id;
        }
      }
      
      // Log provider assignment for debugging
      if (providerId) {
        console.info('[Booking] Provider auto-assigned:', {
          serviceId: dto.serviceId,
          requestedLocation: dto.area,
          assignedProviderId: providerId,
        });
      }
    }

    // Check if provider exists
    const provider = await this.providerProfileRepository.findById(providerId);
    if (!provider || !provider.active) {
      throw new HttpError(404, 'Provider not found or inactive');
    }

    // Check if booking already exists (unique constraint) - skip if no specific provider was requested
    if (dto.providerId) {
      const existingBooking = await this.bookingRepository.findByProviderDateAndTime(
        providerId,
        dto.date,
        dto.timeSlot
      );

      if (existingBooking && existingBooking.status !== 'CANCELLED' && existingBooking.status !== 'DECLINED') {
        throw new HttpError(409, 'This time slot is already booked');
      }
    }

    // Create booking
    const booking = await this.bookingRepository.create({
      userId,
      providerId: providerId,
      serviceId: dto.serviceId,
      date: dto.date,
      timeSlot: dto.timeSlot,
      area: dto.area,
      status: BOOKING_STATUS.PENDING,
    });

    return booking;
  }
}

