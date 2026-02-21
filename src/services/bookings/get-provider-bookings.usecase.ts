import { IBookingRepository, IProviderProfileRepository, IServiceRepository } from '../../types/repositories.port';
import { BookingRepository } from '../../repositories/booking.repository';
import { ProviderProfileRepository } from '../../repositories/provider-profile.repository';
import { ServiceRepository } from '../../repositories/service.repository';
import { BookingEntity } from '../../types/booking.entity';
import { BookingStatus } from '../../config/constants';
import { isCategoryMatch } from '../category-matcher.service';

export class GetProviderBookingsUseCase {
  private bookingRepository: IBookingRepository;
  private providerProfileRepository: IProviderProfileRepository;
  private serviceRepository: IServiceRepository;

  constructor(
    bookingRepository?: IBookingRepository,
    providerProfileRepository?: IProviderProfileRepository,
    serviceRepository?: IServiceRepository
  ) {
    this.bookingRepository = bookingRepository || new BookingRepository();
    this.providerProfileRepository = providerProfileRepository || new ProviderProfileRepository();
    this.serviceRepository = serviceRepository || new ServiceRepository();
  }

  
  async execute(providerId: string, status?: BookingStatus): Promise<BookingEntity[]> {
    console.log('[GetProviderBookings] Starting execution:', { providerId, status });

    const allBookings = await this.bookingRepository.findAvailableAndAssignedBookings(providerId, status);
    console.log('[GetProviderBookings] Found bookings from repository:', {
      total: allBookings.length,
      bookingIds: allBookings.map(b => b.id),
      unassigned: allBookings.filter(b => !b.providerId).length,
      assigned: allBookings.filter(b => b.providerId === providerId).length,
    });

    const providerProfile = await this.providerProfileRepository.findById(providerId);
    if (!providerProfile) {
      console.warn('[GetProviderBookings] Provider profile not found:', { providerId });
      return allBookings.filter(b => b.providerId === providerId);
    }

    console.log('[GetProviderBookings] Provider profile:', {
      providerId,
      serviceRole: providerProfile.serviceRole,
      hasServiceRole: !!providerProfile.serviceRole,
    });

    const visibleBookings: BookingEntity[] = [];
    
    for (const booking of allBookings) {
      console.log('[GetProviderBookings] Processing booking:', {
        bookingId: booking.id,
        hasProviderId: !!booking.providerId,
        providerId: booking.providerId,
        hasService: !!booking.service,
        serviceName: booking.service?.name,
        serviceId: booking.serviceId,
        status: booking.status,
      });

      if (booking.providerId && booking.providerId === providerId) {
        console.log('[GetProviderBookings] Adding assigned booking:', { bookingId: booking.id });
        visibleBookings.push(booking);
      } 

      else if (!booking.providerId) {
        if (booking.service && booking.service.name) {
          if (providerProfile.serviceRole) {
            const categoryMatches = isCategoryMatch(providerProfile.serviceRole, booking.service.name);
            console.log('[GetProviderBookings] Category match check:', {
              bookingId: booking.id,
              serviceName: booking.service.name,
              providerRole: providerProfile.serviceRole,
              categoryMatches,
            });
            if (categoryMatches) {
              console.log('[GetProviderBookings] Adding unassigned booking (category match):', { bookingId: booking.id });
              visibleBookings.push(booking);
            } else {
              console.info('[GetProviderBookings] Category mismatch - booking filtered out:', {
                bookingId: booking.id,
                serviceName: booking.service.name,
                providerRole: providerProfile.serviceRole,
                providerId,
              });
            }
          } else {
            console.log('[GetProviderBookings] Adding unassigned booking (no serviceRole):', { bookingId: booking.id });
            visibleBookings.push(booking);
          }
        } else {
          console.warn('[GetProviderBookings] Unassigned booking without service populated:', {
            bookingId: booking.id,
            serviceId: booking.serviceId,
            hasService: !!booking.service,
            serviceObject: booking.service,
          });
          visibleBookings.push(booking);
        }
      }
    }

    console.log('[GetProviderBookings] Final visible bookings:', {
      total: visibleBookings.length,
      bookingIds: visibleBookings.map(b => b.id),
    });

    return visibleBookings;
  }
}
