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

  /**
   * Get bookings for a provider with category filtering
   * Returns:
   * - All PENDING bookings with providerId = null where category matches (available to claim)
   * - All bookings where providerId = providerId (already claimed/accepted by this provider)
   */
  async execute(providerId: string, status?: BookingStatus): Promise<BookingEntity[]> {
    // Get all bookings (unassigned + assigned to this provider)
    const allBookings = await this.bookingRepository.findAvailableAndAssignedBookings(providerId, status);

    // Get provider profile to check verified role for category filtering
    const providerProfile = await this.providerProfileRepository.findById(providerId);
    if (!providerProfile) {
      // If no profile, return only assigned bookings
      return allBookings.filter(b => b.providerId === providerId);
    }

    // Filter bookings by visibility rules
    const visibleBookings: BookingEntity[] = [];
    
    for (const booking of allBookings) {
      // If booking is assigned to this provider, always include
      if (booking.providerId && booking.providerId === providerId) {
        visibleBookings.push(booking);
      } 
      // If booking is unassigned (providerId = null), check category match
      else if (!booking.providerId && booking.service) {
        // Only show if provider's verified role matches service category
        if (providerProfile.serviceRole) {
          const categoryMatches = isCategoryMatch(providerProfile.serviceRole, booking.service.name);
          if (categoryMatches) {
            visibleBookings.push(booking);
          }
        }
      }
    }

    return visibleBookings;
  }
}
