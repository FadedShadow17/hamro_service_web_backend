import { CreateBookingDTO } from '../../dtos/booking.dto';
import { IBookingRepository } from '../../types/repositories.port';
import { IServiceRepository } from '../../types/repositories.port';
import { IProviderProfileRepository } from '../../types/repositories.port';
import { BookingRepository } from '../../repositories/booking.repository';
import { ServiceRepository } from '../../repositories/service.repository';
import { ProviderProfileRepository } from '../../repositories/provider-profile.repository';
import { NotificationRepository } from '../../repositories/notification.repository';
import { BookingEntity } from '../../types/booking.entity';
import { BOOKING_STATUS } from '../../config/constants';
import { HttpError } from '../../errors/http-error';
import { isCategoryMatch } from '../category-matcher.service';

export class CreateBookingUseCase {
  private bookingRepository: IBookingRepository;
  private serviceRepository: IServiceRepository;
  private providerProfileRepository: IProviderProfileRepository;
  private notificationRepository: NotificationRepository;

  constructor(
    bookingRepository?: IBookingRepository,
    serviceRepository?: IServiceRepository,
    providerProfileRepository?: IProviderProfileRepository
  ) {
    this.bookingRepository = bookingRepository || new BookingRepository();
    this.serviceRepository = serviceRepository || new ServiceRepository();
    this.providerProfileRepository = providerProfileRepository || new ProviderProfileRepository();
    this.notificationRepository = new NotificationRepository();
  }

  async execute(userId: string, dto: CreateBookingDTO): Promise<BookingEntity> {

    const service = await this.serviceRepository.findById(dto.serviceId);
    if (!service) {
      throw new HttpError(404, 'Service not found', undefined, 'SERVICE_NOT_FOUND');
    }
    if (!service.isActive) {
      throw new HttpError(400, 'Service is not active', undefined, 'SERVICE_INACTIVE');
    }




    const booking = await this.bookingRepository.create({
      userId,
      providerId: null, // Always null - providers claim bookings via ACCEPT
      serviceId: dto.serviceId,
      date: dto.date,
      timeSlot: dto.timeSlot,
      area: dto.area as any,
      status: BOOKING_STATUS.PENDING,
    });

    console.info('[Booking] Booking created (unassigned - waiting for provider claim):', {
      bookingId: booking.id,
      serviceId: dto.serviceId,
      serviceName: service.name,
      requestedLocation: dto.area,
      bookingStatus: booking.status,
    });

    try {
      const allProviders = await this.providerProfileRepository.findAll(true);
      const matchingProviders = allProviders.filter(provider => {
        if (!provider.serviceRole) {
          return false;
        }
        return isCategoryMatch(provider.serviceRole, service.name);
      });

      console.info('[Booking] Creating notifications for providers:', {
        bookingId: booking.id,
        serviceName: service.name,
        totalProviders: allProviders.length,
        matchingProviders: matchingProviders.length,
      });

      for (const provider of matchingProviders) {
        try {
          await this.notificationRepository.create({
            type: 'BOOKING_CREATED',
            title: 'New Booking Available',
            message: `A new booking for ${service.name} has been created in ${dto.area}`,
            bookingId: booking.id,
            providerId: provider.id,
            userId: null,
            read: false,
          });
        } catch (notificationError) {
          console.error('[Booking] Failed to create notification for provider:', {
            providerId: provider.id,
            bookingId: booking.id,
            error: notificationError instanceof Error ? notificationError.message : String(notificationError),
          });
        }
      }
    } catch (notificationError) {
      console.error('[Booking] Failed to create notifications (non-blocking):', {
        bookingId: booking.id,
        error: notificationError instanceof Error ? notificationError.message : String(notificationError),
      });
    }

    return booking;
  }
}
